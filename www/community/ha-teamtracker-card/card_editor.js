//
//  Define and register the UI Card Editor 
//
import { html, LitElement } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";


export class MyCustomCardEditor extends LitElement {

    static get properties() {
        return {
            hass: {},
            _config: {},
        };
    }

    // setConfig works the same way as for the card itself
    setConfig(config) {
        this._config = config;
    }

    // This function is called when the input element of the editor loses focus
    entityChanged(ev) {

        // We make a copy of the current config so we don't accidentally overwrite anything too early
        const _config = Object.assign({}, this._config);
        // Then we update the entity value with what we just got from the input field
        _config.entity = ev.target.value;
        // And finally write back the updated configuration all at once
        this._config = _config;

        // A config-changed event will tell lovelace we have made changed to the configuration
        // this make sure the changes are saved correctly later and will update the preview
        const event = new CustomEvent("config-changed", {
            detail: { config: _config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

      // @focusout below will call entityChanged when the input field loses focus (e.g. the user tabs away or clicks outside of it)
        return html`
            Entity:
            <input
            .value=${this._config.entity}
            @focusout=${this.entityChanged}
            ></input>
        `;
    }
}