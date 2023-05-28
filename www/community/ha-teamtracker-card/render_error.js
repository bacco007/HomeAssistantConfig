import { html } from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";


export function renderMissingConfig() {
    const htmlTemplate = html``;
    // Return the HTML template
    return htmlTemplate;
}

export function renderMissingObj(entity) {
    const htmlTemplate = html`
        <ha-card>Unknown entity: ${entity}</ha-card> 
    `;
    // Return the HTML template
    return htmlTemplate;
}

export function renderStateUnavailable(entity) {
    const htmlTemplate = html`
    <style>
        ha-card {padding: 10px 16px;}
    </style>
    <ha-card>
        Sensor unavailable: ${entity}
    </ha-card>
    `;
    // Return the HTML template
    return htmlTemplate;
}

export function renderStateInvalid() {
    const htmlTemplate = html`
    <style>
        ha-card {padding: 10px 16px;}
    </style>
    <ha-card>
        State Invalid: ${this._config.state}
    </ha-card>
    `;
    // Return the HTML template
    return htmlTemplate;
}
