import SessionHeader from "./gems.session.header.js";
import SessionGrid from "./gems.session.grid.js";
import SessionFooter from "./gems.session.footer.js";
import { loadPackage } from "../gems.package.js";
import { generateId, log } from "../gems.helpers.js";
import GameScreen from "../game.screen.js";

export const SESSION_WIDTH = 300;
export const SESSION_HEIGHT = 800;

const EXP_PER_GEM = 1;

const SESSION_STATE_TYPES = {
  draft: null,
  active: 0,
  success: 1,
  fail: 2,
};

export default class Session extends GameScreen {
  id = null;
  state = SESSION_STATE_TYPES.draft;
  lastUpdate = null;
  history = [];
  version = null;
  state = null;
  maxTurns = 0;
  turn = 0;
  collection = {};
  gemIds = null;
  createdAt = null;
  components = [];
  loading = false;
  experience = 0;
  displayType = "grid";

  get turnsLeft() {
    return Math.max(0, this.maxTurns - this.turn);
  }

  constructor(game, data) {
    super({ parentEl: game.el });
    this.reset();

    if (data?.packId == null) {
      return;
    }

    this.id = data?.id || generateId();
    this.game = game;
    this.data = data;

    this.applySavings(data);

    if (this.createdAt == null) {
      this.set({ createdAt: Date.now() });
    }

    // this.el = document.createElement("div");
    this.el.classList.add("session");
    this.el.setAttribute("data-id", this.id);
    this.el.style.setProperty("grid-template-rows", "auto 1fr auto");

    this.show();

    if (
      data == null ||
      ![SESSION_STATE_TYPES.draft, SESSION_STATE_TYPES.active].includes(
        this.state
      )
    ) {
      this.render();
      return this;
    }

    const self = this;

    this.loading = true;

    loadPackage(data.packId)
      .then((pack) => {
        self.loading = false;
        self.error = null;

        // validate pack
        const canUsePack =
          Math.floor(pack?.version) === Math.floor(self.game.version);

        if (!canUsePack) {
          throw new Error(`Pack "${pack.name || data.packId}" can't be used.`);
          return;
        }

        self.initPack(Object.assign({ id: data.packId }, pack));
      })
      .catch((err) => {
        self.loading = false;
        self.error = err.message || "Something went wrong.";
        self.render();
      });
  }

  handleClick(ev) {
    const isEndedState = [
      SESSION_STATE_TYPES.success,
      SESSION_STATE_TYPES.fail,
    ].includes(this.state);

    if (isEndedState) {
      this.end();
    }
  }

  initPack(pack) {
    if (pack == null) {
      this.error = "Invalid pack loaded";
      this.render();
      return;
    }

    this.pack = pack;
    this.maxTurns = pack.turns || 0;

    this.start();
  }

  reset() {
    Object.assign(this, {
      game: null,
      loading: false,
      error: null,
      state: null,
      turn: 0,
      collection: {},
      experience: 0,
    });
  }

  applySavings({ turn, experience, collection, state, gemIds, createdAt }) {
    Object.assign(this, {
      turn: turn || 0,
      experience: experience || 0,
      collection: collection || {},
      state: state != null ? state : this.state,
      gemIds,
      createdAt,
    });
  }

  start() {
    const header = new SessionHeader(this);
    const grid = new SessionGrid(this, {
      size: this.pack.size,
      gems: this.gemIds?.map((id) => this.findGemById(id)),
    });
    const footer = new SessionFooter(this);

    this.children.push(header, grid, footer);

    const isValid = this.validateSession();

    if (isValid) {
      this.set();

      this.state = SESSION_STATE_TYPES.active;
    }

    this.update();
  }

  set(updates = {}) {
    let data = this.json();

    Object.assign(data, updates);

    // TODO: find a better solution for sync data
    this.applySavings(data);

    this.update();

    this.save(data);
  }

  json() {
    const {
      id,
      createdAt,
      collection,
      pack,
      turn,
      gems,
      experience,
      state,
      gemIds,
    } = this;
    const packId = pack?.id;

    return {
      id,
      createdAt,
      collection,
      turn,
      packId,
      gems,
      experience,
      state,
      gemIds,
    };
  }

  save(data) {
    this.game.save();
  }

  end() {
    // TODO: IF session was ended, skip and hide
    // TODO: apply experience to player stats and start new session
    // this.applyResults();

    this.hide();
    this.game.update();
  }

  applyResults() {
    const pack = this.pack;
    const player = this.game.player;
    const isSuccess = this.state === SESSION_STATE_TYPES.success;

    const results = pack.results[isSuccess ? "success" : "failure"];

    player.set({ experience: player.experience + (results.experience || 0) });

    this.game.update();
    this.game.save();
  }

  update() {
    // log("Update Session");
    const _session = this;

    this.children.forEach((c) => c?.update(_session));

    this.render();
  }

  render(rootEl = this.game?.el) {
    super.render();

    const el = this.el;

    const { visible, message, hint } = this.getOverlayInfo();

    if (this.el != null) {
      this.el.onclick = visible ? this.handleClick.bind(this) : null;
    }

    const overlayContent =
      message == null && hint == null
        ? null
        : `${message || ""}${message != null && hint != null ? "\n" : ""}${
            hint || ""
          }`;
    const isNegativeState =
      this.error != null || this.state === SESSION_STATE_TYPES.fail;

    el.classList.toggle("overlay", visible);
    el.classList.toggle("error", isNegativeState);

    if (overlayContent != null) {
      el.setAttribute("data-overlay-content", overlayContent);
    } else {
      el.removeAttribute("data-overlay-content");
    }

    this.children.forEach((c) => c?.render(el));
  }

  getOverlayInfo() {
    let visible =
      this.loading ||
      this.error ||
      [SESSION_STATE_TYPES.success, SESSION_STATE_TYPES.fail].includes(
        this.state
      );
    let message = visible ? this.getStateMesage() : null;
    let hint = null;

    if (visible && !this.loading) {
      hint =
        this.error != null ? "Click close" : "Click to close Mission screen";
    }

    return { visible, message, hint };
  }

  getStateMesage() {
    if (this.error) {
      return this.error;
    }

    if (this.loading) {
      return "loading packs";
    }

    switch (this.state) {
      case SESSION_STATE_TYPES.success: {
        return "Mission done SUCCESSFULY";
      }
      case SESSION_STATE_TYPES.fail: {
        return "Mission was FAILED";
      }
      default: {
        return null;
      }
    }
  }

  findGemById(gemId) {
    const gem = this.pack.gems.find((it) => it.id === gemId);

    if (gem != null) {
      return Object.assign({}, gem);
    }

    return null;
  }

  collectGem(gem, expFactor = 1) {
    if (gem == null) {
      return;
    }

    const amount = this.collection[gem.id] || 0;

    this.collection[gem.id] = amount + 1;

    this.experience += EXP_PER_GEM * expFactor;
  }

  endTurn() {
    this.turn += 1;

    this.set({ turn: this.turn });

    this.validateSession();

    const isActiveMission = [
      SESSION_STATE_TYPES.draft,
      SESSION_STATE_TYPES.active,
    ].includes(this.state);

    if (!isActiveMission) {
      this.applyResults();
    } else {
      this.update();
    }
  }

  validateSession() {
    if (this.loading) {
      return true;
    }

    const hasFullCollection = this.getCollectionState().every(
      (it) => it.left <= 0
    );

    if (hasFullCollection) {
      this.set({ state: SESSION_STATE_TYPES.success });
      return true;
    }

    if (this.turnsLeft === 0) {
      this.error = "There are no turns left.\nYou LOST!";
      this.set({ state: SESSION_STATE_TYPES.fail });

      return false;
    }

    return [SESSION_STATE_TYPES.draft, SESSION_STATE_TYPES.active].includes(
      this.state
    );
  }

  getCollectionState() {
    const allCollected = this.collection;

    return this.pack.character.gems.map((it) => {
      const gemId = it.gemId;

      const gem = this.findGemById(gemId);
      const gemsCollected = allCollected[gemId] || 0;

      return Object.assign(gem, {
        left: it.amount - gemsCollected,
      });
    });
  }
}
