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

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "entity", required: true, selector: { entity: { filter: { integration: "config_auditor" } } } },
        { name: "show_details", selector: { boolean: {} } },
      ],
      computeLabel: (s) => ({ title: "Card title", entity: "Health score entity", show_details: "Show issue pills" }[s.name]),
    };
  }

  static getStubConfig() {
    return { title: "HACA Health", entity: "", show_details: true };
  }

  _update() {
    const hass = this._hass, cfg = this.config;
    if (!hass || !this.content) return;

    const title = cfg.title || "HACA Health";
    const showDetails = cfg.show_details !== false;

    // Find score entity: configured, or auto-discover by haca_type
    let scoreState = cfg.entity ? hass.states[cfg.entity] : null;
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
        if (v > 0) pills += `<span class="hs-p" style="--c:${colors[ht]}"><ha-icon icon="${icons[ht]}"></ha-icon>${v}</span>`;
      }
    }

    const fp = `${score}|${status}|${pills.length}|${title}`;
    if (this._fp === fp) return;
    this._fp = fp;

    let col;
    if (isNaN(score)) col = "#999";
    else if (score >= 90) col = "#4caf50";
    else if (score >= 75) col = "#2196f3";
    else if (score >= 60) col = "#ff9800";
    else if (score >= 40) col = "#ff5722";
    else col = "#f44336";
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

    const e = (s) => s ? String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    this.content.innerHTML = `
      <div class="hs-t">${e(title)}</div>
      <svg viewBox="0 0 100 100" class="hs-g"><circle cx="50" cy="50" r="40" class="hs-gb"/><circle cx="50" cy="50" r="40" class="hs-ga" transform="rotate(-90 50 50)"/><text x="50" y="45" class="hs-gv">${!isNaN(score) ? score : "\u2014"}</text><text x="50" y="63" class="hs-gl">${e(status) || "/100"}</text></svg>
      ${pills ? `<div class="hs-ps">${pills}</div>` : ""}
    `;
  }
}

if (!customElements.get("haca-score-card")) customElements.define("haca-score-card", HacaScoreCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === "haca-score-card"))
  window.customCards.push({ type: "haca-score-card", name: "HACA Score", preview: true, description: "Health score gauge from H.A.C.A." });
