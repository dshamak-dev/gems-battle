import GameScreen from "../game.screen.js";
import { log } from "../gems.helpers.js";
import PlayerSettings from "./menu.player.settings.js";

export default class MenuScreen extends GameScreen {
  constructor(props) {
    super(Object.assign({ layer: 2 }, props));

    const playerSettings = new PlayerSettings({ parentEl: this.el, game: this.game });

    this.children.push(playerSettings);

    this.el.style.setProperty('padding', '0.5em 1em');

    this.render(); 
  }

  update() {
    super.update();
  }

  render() {
    super.render();

    const hasActiveSession = this.game?.activeMission != null;

    if (!hasActiveSession && !this.visible) {
      this.show();
    }
  }
}