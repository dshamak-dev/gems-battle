export default class SessionHeader {
  el = null;

  constructor(session) {
    this.session = session;

    this.el = document.createElement("div");
    this.el.classList.add("session_footer");
    this.el.setAttribute(
      "style",
      `
        display: flex;
        align-items: end;
        width: 100%;
        height: 100%;
        padding: 0.4em;
        box-sizing: border-box;
      `
    );
  }

  update(session) {

    this.render();
  }

  render(parentEl) {
    const el = this.el;

    if (parentEl != null) {
      parentEl.append(el);
    }

    el.innerHTML = `<div class="session_footer_id" 
      style="
        font-size: 0.5em;
        color: rgba(255, 255, 255, 0.4);

      "
    >#${this.session?.id || '***'}</div>`;
  }
}
