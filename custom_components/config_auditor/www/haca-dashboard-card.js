/**
 * H.A.C.A Dashboard Card
 *
 * Entity discovery uses the `haca_type` state attribute (set by sensor.py),
 * which is language-independent. Works regardless of HA locale.
 *
 * ha-card is created ONCE (official HA pattern). setConfig never touches DOM.
 */

const _HACA_TYPES = {
  health_score:       { label: "Score",       color: "#4caf50", icon: "mdi:heart-pulse",                   isScore: true },
  total_issues:       { label: "Total",       color: "#f44336", icon: "mdi:counter" },
  automation_issues:  { label: "Automations", color: "#ff9800", icon: "mdi:robot" },
  script_issues:      { label: "Scripts",     color: "#ff7043", icon: "mdi:script-text" },
  scene_issues:       { label: "Scenes",      color: "#ab47bc", icon: "mdi:palette" },
  blueprint_issues:   { label: "Blueprints",  color: "#5c6bc0", icon: "mdi:file-document-outline" },
  entity_issues:      { label: "Entities",    color: "#ef5350", icon: "mdi:alert-circle" },
  helper_issues:      { label: "Helpers",     color: "#8d6e63", icon: "mdi:tools" },
  performance_issues: { label: "Performance", color: "#26a69a", icon: "mdi:speedometer" },
  security_issues:    { label: "Security",    color: "#e53935", icon: "mdi:shield-alert" },
  dashboard_issues:   { label: "Dashboards",  color: "#42a5f5", icon: "mdi:view-dashboard-outline" },
  compliance_issues:  { label: "Compliance",  color: "#7e57c2", icon: "mdi:clipboard-check-outline" },
  battery_alerts:     { label: "Batteries",   color: "#ffa726", icon: "mdi:battery-alert-variant-outline" },
  recorder_orphans:   { label: "Recorder",    color: "#78909c", icon: "mdi:database-alert-outline" },
};

/** Discover HACA entities via the haca_type attribute (language-independent) */
function _discover(hass) {
  const result = { score: null, scoreEid: null, counters: [] };
  if (!hass) return result;
  for (const [eid, st] of Object.entries(hass.states)) {
    const htype = st.attributes?.haca_type;
    if (!htype) continue;
    const meta = _HACA_TYPES[htype];
    if (!meta) continue;
    if (meta.isScore) {
      result.score = st;
      result.scoreEid = eid;
    } else {
      result.counters.push({ eid, st, meta, htype });
    }
  }
  return result;
}

function _e(s) { return s ? String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;") : ""; }

class HacaDashboardCard extends HTMLElement {

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
      this.innerHTML = `<ha-card><style id="hd-css"></style><div class="card-content" id="hd-c"></div></ha-card>`;
      this.content = this.querySelector("#hd-c");
      this.css = this.querySelector("#hd-css");

      // Click on card → open standard HA more-info dialog (history, settings, menu)
      const card = this.querySelector("ha-card");
      card.style.cursor = "pointer";
      card.addEventListener("click", (ev) => {
        // Don't trigger if user clicked a pill, button or link (those have their own handlers)
        if (ev.target.closest(".hd-p, .hd-b, button, a")) return;
        // Find score entity
        const scoreEid = this._getScoreEntityId();
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

  _getScoreEntityId() {
    if (!this._hass) return null;
    for (const [eid, st] of Object.entries(this._hass.states)) {
      if (st.attributes?.haca_type === "health_score") return eid;
    }
    return null;
  }

  getCardSize() { return this.config?.show_score !== false ? 4 : 2; }
  getGridOptions() { return { rows: 4, columns: 6, min_rows: 2, min_columns: 3 }; }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { type: "grid", name: "", flatten: true, schema: [
          { name: "show_score", selector: { boolean: {} } },
          { name: "show_scan", selector: { boolean: {} } },
          { name: "show_panel_link", selector: { boolean: {} } },
          { name: "columns", selector: { number: { min: 2, max: 4, mode: "slider" } } },
        ]},
        { name: "entities", selector: { entity: { multiple: true, filter: { integration: "config_auditor" } } } },
      ],
      computeLabel: (s) => ({
        title: "Card title", show_score: "Health score gauge", show_scan: "Scan button",
        show_panel_link: "Panel link", columns: "Columns", entities: "Entities (empty = auto)",
      }[s.name]),
    };
  }

  static getStubConfig() {
    return { title: "H.A.C.A", show_score: true, show_scan: true, show_panel_link: true, columns: 3, entities: [] };
  }

  _update() {
    const hass = this._hass, cfg = this.config;
    if (!hass || !this.content) return;

    const cols = Math.max(2, Math.min(4, cfg.columns || 3));
    const title = cfg.title || "H.A.C.A";
    const showScore = cfg.show_score !== false;
    const showScan = cfg.show_scan !== false;
    const showLink = cfg.show_panel_link !== false;

    const disc = _discover(hass);

    // Filter counters if user specified entities
    let counters;
    if (cfg.entities?.length > 0) {
      counters = cfg.entities.map(eid => {
        const st = hass.states[eid];
        if (!st) return null;
        const htype = st.attributes?.haca_type;
        const meta = htype ? _HACA_TYPES[htype] : null;
        if (!meta || meta.isScore) return null;
        return { eid, st, meta, htype };
      }).filter(Boolean);
    } else {
      counters = disc.counters;
    }

    const scoreState = disc.score;
    const rawScore = scoreState ? parseInt(scoreState.state, 10) : null;
    const score = (rawScore !== null && !isNaN(rawScore)) ? rawScore : null;
    const status = scoreState?.attributes?.status || "";
    const lastScan = scoreState?.attributes?.last_scan || "";

    // Format last_scan for display
    let scanLabel = "";
    if (lastScan) {
      try {
        const d = new Date(lastScan);
        scanLabel = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch(e) {}
    }

    // Fingerprint
    const fp = `${score}|${status}|${counters.map(c => c.st.state).join(",")}|${showScore}|${cols}|${title}|${scanLabel}`;
    if (this._fp === fp) return;
    this._fp = fp;

    let sc;
    if (score === null) sc = "#999";
    else if (score >= 90) sc = "#4caf50";
    else if (score >= 75) sc = "#2196f3";
    else if (score >= 60) sc = "#ff9800";
    else if (score >= 40) sc = "#ff5722";
    else sc = "#f44336";
    const C = 2 * Math.PI * 42, D = score !== null ? (score / 100) * C : 0;

    this.css.textContent = `
      .card-content{padding:16px}
      .hd-h{display:flex;align-items:center;gap:8px;margin-bottom:12px}
      .hd-h ha-icon{--mdc-icon-size:24px;color:var(--primary-color)}
      .hd-h span{font-size:16px;font-weight:600;color:var(--primary-text-color)}
      .hd-h .hd-ts{margin-left:auto;font-size:11px;font-weight:400;color:var(--secondary-text-color);white-space:nowrap}
      .hd-gw{display:flex;justify-content:center;margin:0 0 16px}
      .hd-g{width:130px;height:130px}
      .hd-gb{fill:none;stroke:var(--divider-color,#e0e0e0);stroke-width:6}
      .hd-ga{fill:none;stroke:${sc};stroke-width:6;stroke-linecap:round;stroke-dasharray:${D} ${C};transition:stroke-dasharray .8s}
      .hd-gv{font-size:28px;font-weight:800;fill:${sc};text-anchor:middle;dominant-baseline:central}
      .hd-gl{font-size:10px;font-weight:600;fill:var(--secondary-text-color);text-anchor:middle;text-transform:uppercase}
      .hd-r{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;margin-bottom:12px}
      .hd-p{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 4px;border-radius:12px;cursor:pointer;background:var(--secondary-background-color,rgba(0,0,0,.04));transition:transform .15s}
      .hd-p:hover{transform:translateY(-2px);box-shadow:0 2px 8px rgba(0,0,0,.1)}
      .hd-p ha-icon{--mdc-icon-size:20px}
      .hd-p .v{font-size:20px;font-weight:800;line-height:1}
      .hd-p .l{font-size:9px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;text-align:center}
      .hd-p.z ha-icon,.hd-p.z .v,.hd-p.z .l{opacity:.35}
      .hd-a{display:flex;gap:8px;justify-content:center}
      .hd-b{display:inline-flex;align-items:center;gap:5px;padding:7px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--divider-color,#ddd);background:var(--card-background-color,#fff);color:var(--primary-color);text-decoration:none}
      .hd-b:hover{background:var(--secondary-background-color)}
      .hd-b ha-icon{--mdc-icon-size:16px}
      .hd-b.x{opacity:.4;pointer-events:none}
    `;

    this.content.innerHTML = `
      <div class="hd-h"><ha-icon icon="mdi:shield-check"></ha-icon><span>${_e(title)}</span></div>
      ${showScore ? `<div class="hd-gw"><svg viewBox="0 0 100 100" class="hd-g"><circle cx="50" cy="50" r="42" class="hd-gb"/><circle cx="50" cy="50" r="42" class="hd-ga" transform="rotate(-90 50 50)"/><text x="50" y="44" class="hd-gv">${score !== null ? score + "%" : "\u2014"}</text><text x="50" y="64" class="hd-gl">${_e(status) || (score !== null ? "" : "No data")}</text></svg></div>` : ""}
      ${counters.length ? `<div class="hd-r">${counters.map(c => {
        const v = parseInt(c.st.state, 10) || 0;
        const n = c.st.attributes?.friendly_name?.replace(/^H\.?A\.?C\.?A\.?\s*/i, "") || c.meta.label;
        const isBat = c.htype === "battery_alerts";
        const display = v === 0 ? (isBat ? "✓" : "0") : String(v);
        const isOkBat = isBat && v === 0;
        const pillClass = (v === 0 && !isOkBat) ? " z" : "";
        const valueColor = isOkBat ? "#4caf50" : (v > 0 ? c.meta.color : "inherit");
        const iconColor = isOkBat ? "#4caf50" : c.meta.color;
        const tooltip = (isBat && v > 0) ? _e((c.st.attributes?.alert_entities || []).join(", ")) : "";
        return `<div class="hd-p${pillClass}" data-e="${_e(c.eid)}" title="${tooltip}"><ha-icon icon="${isOkBat ? "mdi:battery-check-outline" : _e(c.meta.icon)}" style="color:${iconColor}"></ha-icon><span class="v" style="color:${valueColor}">${display}</span><span class="l">${_e(n)}</span></div>`;
      }).join("")}</div>` : `<div style="padding:8px;text-align:center;color:var(--secondary-text-color);font-size:13px">No HACA entities found. Run a scan first.</div>`}
      ${(showScan || showLink) ? `<div class="hd-a">${showScan ? `<button class="hd-b" id="hd-s"><ha-icon icon="mdi:magnify-scan"></ha-icon>Scan</button>` : ""}${showLink ? `<a class="hd-b" href="/config_auditor"><ha-icon icon="mdi:open-in-new"></ha-icon>Panel</a>` : ""}</div>` : ""}
    `;

    this.content.querySelectorAll(".hd-p[data-e]").forEach(el => {
      el.onclick = (ev) => { ev.stopPropagation(); this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: el.dataset.e } })); };
    });
    const sb = this.content.querySelector("#hd-s");
    if (sb) sb.onclick = async (ev) => { ev.stopPropagation(); sb.classList.add("x"); try { await this._hass.callWS({ type: "haca/scan_all" }); } catch (e) { } setTimeout(() => sb.classList.remove("x"), 5000); };
  }
}

if (!customElements.get("haca-dashboard-card")) customElements.define("haca-dashboard-card", HacaDashboardCard);
else console.warn("[HACA] haca-dashboard-card already defined — using cached version");

// Log diagnostic info for debugging card editor issues
console.info("[HACA Dashboard Card] loaded. getConfigForm:", typeof HacaDashboardCard.getConfigForm, "getStubConfig:", typeof HacaDashboardCard.getStubConfig);

window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === "haca-dashboard-card"))
  window.customCards.push({ type: "haca-dashboard-card", name: "HACA Dashboard", preview: true, description: "Health score gauge and issue counters from H.A.C.A." });
