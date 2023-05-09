import GamePlayer from "./game.player.js";
import { getRandomArrayItem, validateVersion } from "./gems.helpers.js";
import MenuScreen from "./menu/menu.screen.js";
import Session from "./session/gems.session.js";

const GAME_STORAGE_KEY = "gems-battle_game";
const GAME_VERSION = 0.1;
const PACK_ID_LIST = ["dev-pack", "dev-pack-2"];

export default class Game {
  el = null;
  screens = [];
  sessions = [];
  version = GAME_VERSION;
  history = [];
  player = null;

  get activeMission() {
    return this.sessions.find((it) => [null, 0].includes(it?.state));
  }

  constructor() {
    this.el = document.getElementById("root");

    this.load();

    const activeSessions = this.history.filter((it) =>
      [null, 0].includes(it?.state)
    );

    if (activeSessions.length > 0) {
      this.sessions = activeSessions.map((it) => new Session(this, it));
    }

    if (this.player == null) {
      this.player = new GamePlayer();
    }

    // const sessionsData = this.getSessionsData();

    // if (sessionsData != null) {
    //   const sessionDataList = Object.values(sessionsData);

    //   sessionDataList.forEach((sessionData) => {
    //     const isActive = [null, 0].includes(sessionData?.state);

    //     if (!isActive) {
    //       return;
    //     }

    //     this.startSession(sessionData);
    //   });
    // } else {
    //   // TODO: Add menu to start new Session
    //   // this.startNextSession();
    // }

    const menuScreen = new MenuScreen({ parentEl: this.el, game: this });
    menuScreen.show();

    this.screens.push(menuScreen);

    window.addEventListener("resize", this.render.bind(this));

    this.render();
  }

  getScreen(type) {
    let instance = null;

    switch (type) {
      case "menu": {
        instance = MenuScreen;
        break;
      }
      default: {
        break;
      }
    }

    if (instance == null) {
      return null;
    }

    return this.screens.find((s) => s instanceof instance);
  }

  startNextSession(targetPackId) {
    const packId = targetPackId || getRandomArrayItem(PACK_ID_LIST);

    if (packId == null) {
      return;
    }

    // TODO: Add menu to select next mission
    this.startSession({ packId });
  }

  startSession(data = null) {
    const session = new Session(this, data);

    this.sessions.push(session);

    this.render();
  }

  update() {
    this.screens.forEach((screen) => screen.update());

    this.sessions.forEach((session) => session.update());

    this.render();
  }

  render() {
    this.el.innerHTML = "";

    this.screens.forEach((screen) => screen.render());

    const activeMission = this.activeMission;

    if (activeMission != null) {
      activeMission.render(this.el);
      return;
    }

    const sorted = this.sessions.sort((a, b) => {
      if (a.updatedAt == null) {
        return 1;
      }

      if (b.updatedAt == null) {
        return -1;
      }

      return a.updatedAt > b.updatedAt ? 1 : -1;
    });

    const toRender = sorted.slice(-1);

    toRender.forEach((it) => it.render(this.el));
  }

  save() {
    const sessionsData = this.sessions.map((it) => it.json());
    const activeSessionsIdList = sessionsData.map((it) => it.id);

    const historyData = this.history.filter(
      (it) => !activeSessionsIdList.includes(it.id)
    );

    const playerData = this.player?.json();
    const gameData = {
      version: this.version,
      player: playerData,
      history: [...historyData, ...sessionsData],
    };

    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameData));
  }

  load() {
    let gameRecord = localStorage.getItem(GAME_STORAGE_KEY);

    try {
      const gameData = JSON.parse(gameRecord);
      const isValidVersion = validateVersion(this.version, gameData?.version);

      if (gameData != null && !isValidVersion) {
        throw new Error("Savings version is outdated");
      }

      Object.assign(this, {
        history: gameData?.history || [],
        player: new GamePlayer(gameData?.player),
      });
    } catch (err) {
      console.warn(err.message);
    }
  }
}
