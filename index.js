import Session from "./scripts/session/gems.session.js";

const GAME_STORAGE_KEY = "gems-battle_sessions";

class Game {
  el = null;
  sessions = [];

  constructor() {
    this.el = document.getElementById("root");

    const sessionsData = this.getSessionsData();

    if (sessionsData != null) {
      const sessionDataList = Object.values(sessionsData);

      sessionDataList.forEach((sessionData) => this.startSession(sessionData));
    } else {
      // TODO: Add menu to start new Session
      this.startNextSession();
    }

    // console.info('Create Game');
  }

  startNextSession() {
    // TODO: Add menu to select next mission
    this.startSession({ packId: "dev-pack" });
  }

  startSession(data = null) {
    const session = new Session(this, data);

    this.sessions.push(session);

    this.render();
  }

  update() {
    console.info("Update Game");

    this.sessions.forEach((session) => session.update());
  }

  render() {
    this.el.innerHTML = "";
    console.info("Render Game");

    const activeSession = this.sessions.find((it) =>
      [null, 0].includes(it?.state)
    );

    if (activeSession != null) {
      activeSession.render(this.el);
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

const game = new Game();
