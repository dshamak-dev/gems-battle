import {
  getAdjacentIndexByDirection,
  getIndexesByDirection,
  log,
} from "../gems.helpers.js";

const MIN_GEM_COLLECTION_LENGTH = 3;
const COLLECTION_BONUS_FACTORS = [1, 1, 1.2, 1.5, 2];
const COLLECTION_BONUS_FACTORS_LENGTH = COLLECTION_BONUS_FACTORS.length;

const DIRECTION_TYPES = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};
const LINE_DIRECTIONS = Object.values(DIRECTION_TYPES);

const getExperienceFactor = (index) => {
  if (index >= COLLECTION_BONUS_FACTORS_LENGTH) {
    return COLLECTION_BONUS_FACTORS[COLLECTION_BONUS_FACTORS_LENGTH - 1];
  }

  return COLLECTION_BONUS_FACTORS[index];
};

export default class SessionGrid {
  el = null;
  size = { cols: 0, rows: 0 };
  gems = null;
  pack = null;
  itemsNum = 0;

  get gridSize() {
    return Object.assign({}, this.size);
  }

  constructor(session, data) {
    if (data == null) {
      return null;
    }

    this.session = session;

    const { gems, pack, size } = data;
    const gridSize = size || { rows: 0, cols: 0 };
    Object.assign(this, { gems, pack, size: gridSize });

    this.cellsNum = data == null ? 0 : gridSize.rows * gridSize.cols;

    if (this.gems == null) {
      this.gems = new Array(this.cellsNum)
        .fill(null)
        .map(() => this.getRandomGem());

      this.save();
    }

    // log("Create Session Grid", data);
    this.el = document.createElement("div");
    this.el.classList.add("session_grid");
  }

  update(session) {
    // log("Update Session Grid", session);
  }

  save() {
    this.session.set({
      gemIds: this.gems.map((it) => (it == null ? null : it.id)),
    });
  }

  render(parentEl) {
    // log("Render Session Grid");
    const { rows, cols } = this.gridSize

    const gems = this?.gems || [];
    const gridEl = this.el;

    let cssObj = window.getComputedStyle(gridEl, null);
    let fontSizeStyle = cssObj.getPropertyValue("font-size");
    let fontSize = Number(fontSizeStyle?.replace(/px/i)) || 0;
    let gapSize = fontSize * 0.2;

    const freeWidth = parentEl?.innerWidth - (cols - 1) * gapSize;
    const gridItemSize = Math.floor(freeWidth / cols);

    this.el.setAttribute(
      "style",
      `
        --grid-item-size: ${gridItemSize}px,
        width: 100%;
        display: grid;
        grid-template: repeat(${rows}, auto) / repeat(${cols}, 1fr);
        gap: .2em;
        padding: 0.5em;
        margin: 2em 1em 1em;
        border-radius: 6%;
        box-sizing: border-box;
        background-color: #D9D9D9;
      `
    );

    let handler = this.triggerGem.bind(this);

    gridEl.innerHTML = "";

    gems.forEach((gem, index) => {
      const el = document.createElement("div");
      el.classList.add("session_grid_item");

      el.classList.toggle("pointer", gem != null);

      el.setAttribute("style", ` --gem-color: ${gem?.color}; padding: 0.3em;`);

      if (gem != null) {
        el.onclick = (e) => handler(e, index);
      }

      gridEl.append(el);
    });

    parentEl?.append(gridEl);
  }

  triggerGem(ev, startIndex) {
    ev?.stopPropagation();

    const gem = this.getGemAtIndex(startIndex);

    log("Gem Click", startIndex, gem);

    if (gem == null) {
      return;
    }

    const gemsCollectionIndexes =
      this.findAllSameConnectedGemsFromIndex(startIndex);
    // Connections + target gem
    const collectionLength = gemsCollectionIndexes.length + 1;
    log("gemsCollectionIndexes", gemsCollectionIndexes);

    if (collectionLength < MIN_GEM_COLLECTION_LENGTH) {
      // NOT VALID COLLECTION
      const adjacentIndexes = this.getAdjacentIndexes(startIndex);
      log("NOT VALID COLLECTION", { adjacentIndexes });

      // DESTROY ACTIVE GEM
      this.destroyGemAtIndex(startIndex);

      // RESET ADJACENT GEMS
      adjacentIndexes.forEach((ind) => this.resetGemAtIndex(ind));
    } else {
      // COLLECT COLLECTION
      this.collectGemsByIndexes([startIndex, ...gemsCollectionIndexes]);
      log("COLLECT VALID COLLECTION");
    }

    this.save();
    this.session.endTurn();
  }

  getRandomGem(prevGemId) {
    const availableGems = this.session?.pack?.gems || [];

    const randIndex = Math.floor(Math.random() * availableGems.length);

    const gem = Object.assign({}, availableGems[randIndex]);

    if (prevGemId == null || prevGemId !== gem.id) {
      return gem;
    }

    return this.getRandomGem(prevGemId);
  }

  destroyGemAtIndex(index) {
    const gems = this.gems.slice();
    const gem = this.getGemAtIndex(index);

    if (gem == null) {
      return;
    }

    gems.splice(index, 1, null);
    this.gems = gems;
  }

  collectGemsByIndexes(indexes) {
    indexes.forEach((gemIndex, index) => {
      const expFactor = getExperienceFactor(index);

      this.session.collectGem(this.getGemAtIndex(gemIndex), expFactor);
      this.resetGemAtIndex(gemIndex);
    });
  }

  findAllSameConnectedGemsFromIndex(fromIndex) {
    const validCellsQueueBelow = this.findCollectionLine(fromIndex, "down");
    const validCellsQueueAbove = this.findCollectionLine(fromIndex, "up");
    const validCellsQueueLeft = this.findCollectionLine(fromIndex, "left");
    const validCellsQueueRight = this.findCollectionLine(fromIndex, "right");
    const allValid = [
      ...validCellsQueueAbove,
      ...validCellsQueueBelow,
      ...validCellsQueueLeft,
      ...validCellsQueueRight,
    ];

    return allValid;
  }

  getAdjacentIndexes(index) {
    const gridSize = this.gridSize;

    return LINE_DIRECTIONS.map((dir) =>
      getAdjacentIndexByDirection(index, gridSize, dir)
    ).filter((ind) => ind !== -1);
  }

  findCollectionLine(fromIndex, direction = "down") {
    const startGem = this.getGemAtIndex(fromIndex);
    const lineIndexes = getIndexesByDirection(
      fromIndex,
      this.gridSize,
      direction
    );

    const validQueue = [];

    for (let gemIndex of lineIndexes) {
      const gem = this.getGemAtIndex(gemIndex);
      const isValid = gem?.id === startGem?.id;

      if (isValid) {
        validQueue.push(gemIndex);
      } else {
        break;
      }
    }

    return validQueue;
  }

  resetGemAtIndex(index) {
    const gems = this.gems.slice();
    const gem = gems[index];

    gems.splice(index, 1, this.getRandomGem(gem?.id));
    this.gems = gems;
  }

  getGemAtIndex(index) {
    const gems = this.gems.slice();
    return gems[index];
  }
}
