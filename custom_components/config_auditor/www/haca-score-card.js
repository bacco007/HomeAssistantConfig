/**
 * H.A.C.A Score Card
 *
 * Entity discovery uses the `haca_type` state attribute (set by sensor.py).
 * ha-card is created ONCE. setConfig never touches DOM.
 */

class HacaScoreCard extends HTMLElement {

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this.config = config;
    this._fp = null;
    if (this._hass && this.content) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    if (!this.content) {
      this.innerHTML = `<ha-card><style id="hs-css"></style><div class="card-content" id="hs-c"></div></ha-card>`;
      this.content = this.querySelector("#hs-c");
      this.css = this.querySelector("#hs-css");

      // Tap action: open more-info for the score entity
      const card = this.querySelector("ha-card");
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        // Find score entity by haca_type attribute
        let scoreEid = this.config?.entity;
        if (!scoreEid) {
          for (const [eid, st] of Object.entries(this._hass?.states || {})) {
            if (st.attributes?.haca_type === "health_score") { scoreEid = eid; break; }
          }
        }
        if (scoreEid) {
          this.dispatchEvent(new CustomEvent("hass-more-info", {
            bubbles: true, composed: true,
            detail: { entityId: scoreEid },
          }));
        }
      });
    }
    this._update();
  }

  getCardSize() { return 3; }
  getGridOptions() { return { rows: 3, columns: 6, min_rows: 2, min_columns: 3 }; }

  static getConfigElement() {
    return document.createElement("haca-score-card-editor");
  }

  static getStubConfig() {
    return { title: "HACA Health", entity: "", show_details: true };
  }

  _update() {
    const hass = this._hass, cfg = this.config;
    if (!hass || !this.content) return;

    const e = (s) => s ? String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    const title = cfg.title || "HACA Health";
    const showDetails = cfg.show_details !== false;

    // Find score entity: configured, or auto-discover by haca_type
    let scoreState = null;
    if (cfg.entity) {
      const st = hass.states[cfg.entity];
      // Accept any HACA entity EXCEPT battery_alerts for the gauge
      if (st && st.attributes?.haca_type && st.attributes.haca_type !== "battery_alerts") {
        scoreState = st;
      }
    }
    if (!scoreState) {
      for (const [, st] of Object.entries(hass.states)) {
        if (st.attributes?.haca_type === "health_score") { scoreState = st; break; }
      }
    }

    if (!scoreState) {
      this.content.innerHTML = `<div style="padding:16px;text-align:center;color:var(--secondary-text-color)">No HACA health score entity found.<br>Configure the entity in card settings.</div>`;
      return;
    }

    const score = parseInt(scoreState.state, 10);
    const status = scoreState.attributes?.status || "";

    // Details pills
    let pills = "";
    if (showDetails) {
      const want = ["automation_issues", "entity_issues", "security_issues", "performance_issues", "battery_alerts"];
      const colors = { automation_issues: "#ff9800", entity_issues: "#ef5350", security_issues: "#e53935", performance_issues: "#26a69a", battery_alerts: "#ffa726" };
      const icons = { automation_issues: "mdi:robot", entity_issues: "mdi:alert-circle", security_issues: "mdi:shield-alert", performance_issues: "mdi:speedometer", battery_alerts: "mdi:battery-alert-variant-outline" };
      for (const [, st] of Object.entries(hass.states)) {
        const ht = st.attributes?.haca_type;
        if (!ht || !want.includes(ht)) continue;
        const v = parseInt(st.state, 10) || 0;
        const isBat = ht === "battery_alerts";
        if (v > 0) {
          let tooltip = "";
          if (isBat) {
            const alertEnts = st.attributes?.alert_entities || [];
            tooltip = alertEnts.length ? alertEnts.join(", ") : "";
          }
          pills += `<span class="hs-p" style="--c:${colors[ht]}" title="${e(tooltip)}"><ha-icon icon="${icons[ht]}"></ha-icon>${v}</span>`;
        } else if (isBat) {
          pills += `<span class="hs-p" style="--c:#4caf50"><ha-icon icon="mdi:battery-check-outline"></ha-icon>✓</span>`;
        }
      }
    }

    const isGauge = scoreState.attributes?.haca_type === "health_score";
    const fp = `${score}|${status}|${pills.length}|${title}|${isGauge}`;
    if (this._fp === fp) return;
    this._fp = fp;

    let col;
    if (isNaN(score)) col = "#999";
    else if (isGauge) {
      if (score >= 90) col = "#4caf50";
      else if (score >= 75) col = "#2196f3";
      else if (score >= 60) col = "#ff9800";
      else if (score >= 40) col = "#ff5722";
      else col = "#f44336";
    } else {
      col = score === 0 ? "#4caf50" : (score <= 5 ? "#ff9800" : "#f44336");
    }

    let gaugeHtml;
    if (isGauge) {
      const C = 2 * Math.PI * 40, D = !isNaN(score) ? (score / 100) * C : 0;
      this.css.textContent = `
        .card-content{padding:16px;text-align:center}
        .hs-t{font-size:14px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px}
        .hs-g{width:110px;height:110px}
        .hs-gb{fill:none;stroke:var(--divider-color,#e0e0e0);stroke-width:7}
        .hs-ga{fill:none;stroke:${col};stroke-width:7;stroke-linecap:round;stroke-dasharray:${D} ${C};transition:stroke-dasharray .8s}
        .hs-gv{font-size:24px;font-weight:800;fill:${col};text-anchor:middle;dominant-baseline:central}
        .hs-gl{font-size:9px;font-weight:600;fill:var(--secondary-text-color);text-anchor:middle;text-transform:uppercase}
        .hs-ps{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px}
        .hs-p{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:12px;font-size:12px;font-weight:600;background:var(--secondary-background-color);color:var(--c)}
        .hs-p ha-icon{--mdc-icon-size:14px;color:var(--c)}
      `;
      gaugeHtml = `<svg viewBox="0 0 100 100" class="hs-g"><circle cx="50" cy="50" r="40" class="hs-gb"/><circle cx="50" cy="50" r="40" class="hs-ga" transform="rotate(-90 50 50)"/><text x="50" y="45" class="hs-gv">${!isNaN(score) ? score + "%" : "\u2014"}</text><text x="50" y="63" class="hs-gl">${e(status) || (!isNaN(score) ? "" : "No data")}</text></svg>`;
    } else {
      const fname = scoreState.attributes?.friendly_name?.replace(/^H\.?A\.?C\.?A\.?\s*/i, "") || "";
      this.css.textContent = `
        .card-content{padding:16px;text-align:center}
        .hs-t{font-size:14px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px}
        .hs-num{font-size:48px;font-weight:800;color:${col};line-height:1.2}
        .hs-lbl{font-size:11px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;margin-top:2px}
        .hs-ps{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px}
        .hs-p{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:12px;font-size:12px;font-weight:600;background:var(--secondary-background-color);color:var(--c)}
        .hs-p ha-icon{--mdc-icon-size:14px;color:var(--c)}
      `;
      gaugeHtml = `<div class="hs-num">${!isNaN(score) ? score : "\u2014"}</div><div class="hs-lbl">${e(fname)}</div>`;
    }

    this.content.innerHTML = `
      <div class="hs-t">${e(title)}</div>
      ${gaugeHtml}
      ${pills ? `<div class="hs-ps">${pills}</div>` : ""}
    `;
  }
}

if (!customElements.get("haca-score-card")) customElements.define("haca-score-card", HacaScoreCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === "haca-score-card"))
  window.customCards.push({ type: "haca-score-card", name: "HACA Score", preview: true, description: "Health score gauge from H.A.C.A." });

/* ── Score Card Editor ─────────────────────────────────────────────────── */
class HacaScoreCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  set hass(h) { this._hass = h; this._render(); }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: Object.assign({}, this._config) },
      bubbles: true, composed: true
    }));
  }

  _render() {
    if (!this._hass) return;

    // Build list of allowed entities (all HACA except battery_alerts)
    const allowed = [];
    for (const [eid, st] of Object.entries(this._hass.states)) {
      const ht = st.attributes?.haca_type;
      if (ht && ht !== "battery_alerts") allowed.push(eid);
    }

    this.innerHTML = `
      <div style="padding:8px 0;">
        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:12px;font-weight:500;margin-bottom:4px;">Title</label>
          <input type="text" id="hsce-title" value="${this._esc(this._config.title || "")}"
            style="width:100%;padding:8px;border:1px solid var(--divider-color);border-radius:8px;
            background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:12px;font-weight:500;margin-bottom:4px;">Entity</label>
          <select id="hsce-entity" style="width:100%;padding:8px;border:1px solid var(--divider-color);
            border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;">
            <option value="">-- auto (health_score) --</option>
            ${allowed.map(eid => `<option value="${this._esc(eid)}" ${this._config.entity === eid ? "selected" : ""}>${this._esc(this._hass.states[eid]?.attributes?.friendly_name || eid)}</option>`).join("")}
          </select>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="hsce-details" ${this._config.show_details !== false ? "checked" : ""}>
          <label for="hsce-details" style="font-size:13px;">Show issue pills</label>
        </div>
      </div>`;

    this.querySelector("#hsce-title").addEventListener("input", (e) => {
      this._config.title = e.target.value; this._fire();
    });
    this.querySelector("#hsce-entity").addEventListener("change", (e) => {
      this._config.entity = e.target.value; this._fire();
    });
    this.querySelector("#hsce-details").addEventListener("change", (e) => {
      this._config.show_details = e.target.checked; this._fire();
    });
  }

  _esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
}

if (!customElements.get("haca-score-card-editor")) customElements.define("haca-score-card-editor", HacaScoreCardEditor);
