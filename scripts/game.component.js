export default class GameComponent {
  children = [];
  el = null;
  parentEl = null;

  constructor(props = {}) {
    Object.assign(this, props);

    this.el = document.createElement("div");

    this.update();
    this.render();
  }

  update() {
    this.children?.forEach((it) => it.update());
  }

  render() {
    const parentEl = this.el.parent;

    if (parentEl == null &&  this.parentEl == null) {
      return;
    } else if (parentEl == null) {
      this.parentEl.append(this.el);
    }

    this.children?.forEach((it) => it.render());
  }
}
