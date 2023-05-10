import Game from "./scripts/game.js";

(() => {
  const game = new Game();

  window.__context = { game };
})();
