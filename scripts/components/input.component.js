import GameComponent from "../game.component.js";

export default class InputComponent extends GameComponent {
  required;
  value;
  placeholder;
  onChange = () => {};

  constructor(props) {
    super(Object.assign({}, props, { tagType: "input" }));

    this.el.setAttribute('style', `
      font-size: 0.6em;
      border: 0;
      border-bottom: 1px solid currentColor;
      background: transparent;
      outline: 0;
      padding: 2px 0;
    `);
  
    this.required = props?.required || false;
    this.value = props?.value || '';
    this.placeholder = props?.placeholder || 'Input text';

    this.el.defaultValue = this.value;
    this.el.placeholder = this.placeholder;

    if (this.required) {
      this.el.setAttribute('required', '');
    }


    const self = this;

    this.el.onchange = (ev) => {
      if (self.onChange == null) {
        return false;
      }
      const target = ev.target;

      const value = (self.value = target?.value);
      const isValid = self.validate();

      self.onChange(ev, value, isValid);
    };
  }

  render() {
    super.render();

    const isValid = this.validate();

    this.el?.classList?.toggle('error', !isValid);
  }

  validate() {
    const value = this.value;

    return this.required ? !!value?.trim() : true;
  }
}
