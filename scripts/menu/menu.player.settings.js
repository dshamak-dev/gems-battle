import InputComponent from "../components/input.component.js";
import GameComponent from "../game.component.js";
import { log } from "../gems.helpers.js";

export default class PlayerSettings extends GameComponent {
  constructor(props) {
    super(props);

    const self = this;
    const player = self.game.player;

    this.el.setAttribute(
      "style",
      `
        display: flex;
        flex-direction: column;
        gap: 1em;
      `
    );

    this.header = new GameComponent({ parentEl: this.el });
    this.header.el.innerHTML = "Player";

    const controls = (this.controls = new GameComponent({
      parentEl: this.el,
      style: `
        display: flex;
        gap: 1em;
        align-items: end;
        flex-wrap: wrap;
      `,
    }));

    const nameInput = (this.nameInput = new InputComponent({
      parentEl: null,
      required: true,
      placeholder: "Input Name",
      value: this.game?.player?.name,
    }));

    this.nameInput.onChange = (e, value, valid) => {
      player.set({ name: value });

      self.game.save();

      self.render();
    };

    const nameCover = new GameComponent({
      parentEl: controls.el,
      children: [nameInput],
    });

    nameInput.parentEl = nameCover.el;
    nameCover.el.classList.add("label");
    nameCover.el.setAttribute("data-label", "Name");

    const level = new GameComponent({
      parentEl: controls.el,
      style: 'display: flex; flex-direction: column; gap: 0.02em;'
    });
    level.children = [
      new GameComponent({
        parentEl: level.el,
        style: `font-size: 0.45em;`,
        observer: () => `Level`,
      }),
      new GameComponent({
        parentEl: level.el,
        style: `font-size: 0.8em;`,
        observer: () => `${player.level}`,
      }),
    ];

    const experience = new GameComponent({
      parentEl: controls.el,
      style: 'display: flex; flex-direction: column; gap: 0.02em;'
    });
    experience.children = [
      new GameComponent({
        parentEl: experience.el,
        style: `font-size: 0.45em;`,
        observer: () => `EXP`,
      }),
      new GameComponent({
        parentEl: experience.el,
        style: `font-size: 0.8em;`,
        observer: () => `${player.experience}/${player.levelBreakpoint}`,
      }),
    ];

    controls.children = [nameCover, level, experience];

    this.mission = new GameComponent({ parentEl: this.el });

    this.children = [this.header, controls, this.mission];
  }

  render() {
    super.render();

    if (!this.mission?.el) {
      return;
    }

    this.mission.el.innerHTML = "";
    const canStartNewMission =
      this.game.activeMission == null && this.game.player.valid;

    const missionButtomEl = document.createElement("button");
    missionButtomEl.innerHTML = "Start New Mission";

    if (!canStartNewMission) {
      missionButtomEl.setAttribute("disabled", "disabled");
    } else {
      missionButtomEl.onclick = this.game.startNextSession.bind(
        this.game,
        null
      );
    }

    this.mission.el.append(missionButtomEl);
  }
}
