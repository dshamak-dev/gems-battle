import { formatNumberOutput } from "../../gems.helpers.js";

export default class SessionHeader {
  el = null;

  get turnsLeft() {
    return this.session.turnsLeft;
  }

  constructor(session, data = null) {
    this.session = session;
    this.character = this.session?.pack?.character || null;

    console.info("Create Session Header", data);
    this.el = document.createElement("div");
    this.el.classList.add("session_header");
    this.el.setAttribute(
      "style",
      `
        width: 100%;
        min-height: calc(var(--root-height) * 0.10);
        display: grid;
        grid-template: 1fr / 1fr 1.5fr 1fr;
        padding: 0.4em;
        box-sizing: border-box;
        background-color: #D9D9D9;
      `
    );

    // Turns
    this.turnsEl = document.createElement("div");
    this.turnsEl.classList.add("session_header_turns", "label");
    this.turnsEl.setAttribute("data-label", "Turns");
    // Character
    this.characterEl = document.createElement("div");
    this.characterEl.classList.add("session_header_character");
    this.characterEl.setAttribute(
      "style",
      `
      position: relative;
      width: 80%;
      padding-bottom: 30%;
      margin: 0 auto;
    `
    );
    // Goal
    this.goalEl = document.createElement("div");
    this.goalEl.classList.add("session_header_goal", "label", "text-right");
    this.goalEl.setAttribute("data-label", "Goal");
    // Goal Items
    this.goalItemsEl = document.createElement("div");
    this.goalItemsEl.classList.add("session_header_goal_items");
    this.goalItemsEl.setAttribute(
      "style",
      `
      display: flex;
      gap: 0.1em;
      justify-content: space-between;
      font-size: 0.6em;
      padding: 0.2em 0 0.2em 0.2em;
      box-sizing: border-box;
    `
    );
  }

  update(session) {
    console.info("Update Session Header", session);

    this.render();
  }

  render(parentEl) {
    console.info("Render Session Header");
    const el = this.el;

    if (parentEl != null) {
      parentEl.append(el);
    }

    el.innerHTML = "";

    this.turnsEl.setAttribute(
      "data-value",
      formatNumberOutput(this.turnsLeft, 3)
    );

    this.characterEl.innerHTML = `<div class="session_character_avatar" 
      style="
        position: absolute;
        top: 0;
        width: 100%;
        padding-bottom: 100%;
        border-radius: 100%;
        background-color: black;
      "
    ></div>`;

    this.goalItemsEl.innerHTML = this.getCharacterGems()
      .map((gem, index) => {
        const color = gem.color;
        const value = gem.left;

        return `<span class="session_header_goal_items_item" style="display: flex; flex-direction: column; gap: 0.1em;">
        <span style="background-color: ${color}; display: block; width: 0.8em; height: 0.8em; border-radius: 100%;"></span>
        <span class="label" data-value="${formatNumberOutput(value, 2)}"></span>
      </span>`;
      })
      .join("");
    this.goalEl.append(this.goalItemsEl);

    [this.turnsEl, this.characterEl, this.goalEl].forEach((it) =>
      el?.append(it)
    );
  }

  getCharacterGems() {
    return this.session.getCollectionState().map((it) => {
      return Object.assign({}, it, { left: Math.max(0, it.left) });
    });
  }

  getCollectedGems() {
    return Object.assign({}, this.session.collection);
  }
}
