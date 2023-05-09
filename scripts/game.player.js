import { generateId } from "./gems.helpers.js";

const EXP_BREAKPOINTS = [3, 7, 11, 16];
const MAX_LEVEL = EXP_BREAKPOINTS.length;

export default class GamePlayer {
  game;
  id;
  name;
  experience;
  cards;

  get valid() {
    return !!this.name?.trim();
  }

  get level() {
    return Math.max(
      0,
      EXP_BREAKPOINTS.findIndex(
        (it, index, all) => this.experience < it || index === MAX_LEVEL - 1
      )
    ) + 1;
  }

  get levelBreakpoint() {
    return EXP_BREAKPOINTS.find(
      (it, index, all) => this.experience < it || index === MAX_LEVEL - 1
    );
  }

  constructor({ cards, ...data }) {
    Object.assign(this, { experience: 0 }, data || {});

    if (this.id == null) {
      this.id = generateId();
    }

    // TODO: Add GameCard class
    this.cards = cards?.map((it) => it) || [];
  }

  set(props = {}) {
    Object.assign(this, props || {});

    this.experience = Math.max(0, this.experience);
  }

  json() {
    const { id, name, experience } = this;

    return { id, name, experience };
  }
}
