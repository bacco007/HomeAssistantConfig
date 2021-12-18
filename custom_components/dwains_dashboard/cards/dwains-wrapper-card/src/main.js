const bases = [customElements.whenDefined('hui-masonry-view'), customElements.whenDefined('hc-lovelace')];
Promise.race(bases).then(() => {

  const LitElement = customElements.get('hui-masonry-view')
    ? Object.getPrototypeOf(customElements.get('hui-masonry-view'))
    : Object.getPrototypeOf(customElements.get('hc-lovelace'));

  const html = LitElement.prototype.html;

  const css = LitElement.prototype.css;


  const createError = (error, config) => {
    return createThing("hui-error-card", {
      type: "error",
      error,
      config,
    });
  };

  const cardHelpers = window.loadCardHelpers()
    ? window.loadCardHelpers()
    : undefined;

  const createThing = async (tag, config) => {
    if (cardHelpers) {
      const cardHelper = await cardHelpers;
      return cardHelper.createCardElement(config);
    }

    const element = document.createElement(tag);

    try {
      element.setConfig(config);
    } catch (err) {
      console.error(tag, err);
      return createError(err.message, config);
    }

    return element;
  };


  class DwainsWrapperCard extends LitElement {
    constructor() {
      super();
    }

    static get properties() {
      return {
        //hass: {},
      };
    }

    set hass(hass) {
      this._hass = hass;
      console.log('test1');
    }


    async setConfig(config) {
      this._config = JSON.parse(JSON.stringify(config));

      const cardHelper = await cardHelpers;
      this.card = await cardHelper.createCardElement(this._config.card);

      this.card.hass = this._hass;
      console.log('test2');
    }

    render() {
      return html`
        <style>
        ${this._config.style}
        </style>
        <div style="${this._config.css}">
        <ha-card>
          ${this.card}
        </ha-card>
        </div>
      `;
    }

    set hass(hass) {
      if(!this.card) return;
      this.card.hass = hass;
    }

    getCardSize() {
      if(this._config.report_size)
        return this._config.report_size;
      let ret = this.shadowRoot;
      if(ret) ret = ret.querySelector("ha-card card-maker");
      if(ret) ret = ret.getCardSize;
      if(ret) ret = ret();
      if(ret) return ret;
      return 1;
    }

  }

  if (!customElements.get("dwains-wrapper-card")) {
    customElements.define("dwains-wrapper-card", DwainsWrapperCard);
    const pjson = require('../package.json');
    console.info(
      `%c DWAINS-WRAPPER-CARD \n%c      Version ${pjson.version}      `,
      "color: #2fbae5; font-weight: bold; background: black",
      "color: white; font-weight: bold; background: dimgray"
    );
  }
});