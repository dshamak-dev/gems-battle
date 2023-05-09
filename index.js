import GameScreen from "./scripts/game.screen.js";
import { getRandomArrayItem } from "./scripts/gems.helpers.js";
import MenuScreen from "./scripts/menu/menu.screen.js";
import Session from "./scripts/session/gems.session.js";

const GAME_STORAGE_KEY = "gems-battle_sessions";
const GAME_VERSION = 0.1;
const PACK_ID_LIST = ["dev-pack", "dev-pack-2"];

class Game {
  el = null;
  screens = [];
  sessions = [];
  version = GAME_VERSION;

  get activeMission() {
    return this.sessions.find((it) => [null, 0].includes(it?.state));
  }

  constructor() {
    this.el = document.getElementById("root");

    const sessionsData = this.getSessionsData();

    if (sessionsData != null) {
      const sessionDataList = Object.values(sessionsData);

      sessionDataList.forEach((sessionData) => {
        const isActive = [null, 0].includes(sessionData?.state)

        if (!isActive) {
          return;
        }

        this.startSession(sessionData);
      });
    } else {
      // TODO: Add menu to start new Session
      // this.startNextSession();
    }

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

  saveSession(data) {
    if (data == null || data.id == null) {
      return;
    }

    let sessionsData = this.getSessionsData() || {};

    sessionsData[data.id] = data;

    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(sessionsData));
  }

  getSessionsData() {
    let sessionsRecord = localStorage.getItem(GAME_STORAGE_KEY);

    return JSON.parse(sessionsRecord);
  }
}

window.game = new Game();
