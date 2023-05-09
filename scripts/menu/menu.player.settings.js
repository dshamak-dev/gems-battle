import GameComponent from "../game.component.js";

export default class PlayerSettings extends GameComponent {
  

  constructor(props) {
    super(props);

    this.header = new GameComponent({ parentEl: this.el });
    this.header.el.innerHTML = 'Player settings';

    this.controls = new GameComponent({ parentEl: this.el });

    this.children = [this.header, this.controls];
  }
  
  render() {
    super.render();

    if (!this.controls?.el) {
      return;
    }

    this.controls.el.innerHTML = "";
    const canStartNewMission = this.game.activeMission == null;

    if (canStartNewMission) {

      const missionButtomEl = document.createElement('button');
      missionButtomEl.innerHTML = 'Start New Mission';
      missionButtomEl.onclick = this.game.startNextSession.bind(this.game, null);

      this.controls.el.append(missionButtomEl);
    }
  }
}