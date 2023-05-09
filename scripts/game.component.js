export default class GameComponent {
  children = [];
  el = null;
  parentEl = null;
  tagType = "div";
  observer;
  className;
  style;

  constructor(props = {}) {
    Object.assign(this, props);

    this.el = document.createElement(this.tagType);

    if (this.className) {
      this.el.classList.add(...this.className.split(" "));
    }
    if (this.style) {
      this.el.setAttribute("style", this.style);
    }

    this.update();
    this.render();
  }

  update() {
    this.children?.forEach((it) => it.update());
  }

  render() {
    const parentEl = this.el.parent;

    if (this.observer) {
      this.el.innerHTML = this.observer();
    }

    if (parentEl == null && this.parentEl == null) {
      return;
    } else if (parentEl == null) {
      this.parentEl.append(this.el);
    }

    this.children?.forEach((it) => it.render());
  }
}
