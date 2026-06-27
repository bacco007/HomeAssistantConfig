/**
 * Recently Installed but Unused Card
 * A Lovelace card that surfaces HACS components installed within a recent
 * window (default 30 days) that are still unused - the "I installed this and
 * forgot to wire it up" view. It reads the same unused_* sensors as the main
 * Custom Component Monitor card and filters each unused list by days_installed.
 */
var CARD_VERSION = "1.11.0";

var RIU_ALL_SECTIONS = ["integrations", "themes", "frontend"];
var RIU_DEFAULT_WINDOW = 30;

function _riu_escapeHtml(text) {
  var el = document.createElement("span");
  el.textContent = String(text);
  return el.innerHTML;
}

class RecentlyInstalledUnusedCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._lastDataJSON = "";
  }

  static getConfigElement() {
    return document.createElement("recently-installed-unused-card-editor");
  }

  static getStubConfig() {
    return { title: "Recently Installed but Unused", days_window: RIU_DEFAULT_WINDOW, sections: ["integrations", "themes", "frontend"] };
  }

  setConfig(config) {
    this._config = Object.assign(
      { title: "Recently Installed but Unused", days_window: RIU_DEFAULT_WINDOW, sections: RIU_ALL_SECTIONS.slice() },
      config
    );
    var w = parseInt(this._config.days_window, 10);
    this._window = (!isNaN(w) && w > 0) ? w : RIU_DEFAULT_WINDOW;
    this._lastDataJSON = "";
    if (this._hass) { this._render(); }
  }

  set hass(hass) {
    this._hass = hass;
    var dataJSON = this._getDataJSON();
    if (dataJSON !== this._lastDataJSON) {
      this._lastDataJSON = dataJSON;
      this._render();
    }
  }

  getCardSize() {
    return 3 + (this._config.sections || RIU_ALL_SECTIONS).length;
  }

  _getDataJSON() {
    if (!this._hass) { return ""; }
    var ids = [
      "sensor.unused_custom_themes",
      "sensor.unused_frontend_resources",
      "sensor.unused_custom_integrations",
      "sensor.hacs_installed_components"
    ];
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var s = this._hass.states[ids[i]];
      if (s) { out.push(s.state + "|" + JSON.stringify(s.attributes)); }
    }
    return out.join("||");
  }

  _getSensor(entityId) {
    if (!this._hass || !this._hass.states[entityId]) { return null; }
    return this._hass.states[entityId];
  }

  _getVisibleSections() {
    var allowed = this._config.sections || RIU_ALL_SECTIONS;
    var all = [
      { key: "integrations", label: "Integrations", icon: "mdi:puzzle-outline", sensor: this._getSensor("sensor.unused_custom_integrations"), detailKey: "domain" },
      { key: "themes", label: "Themes", icon: "mdi:palette-outline", sensor: this._getSensor("sensor.unused_custom_themes"), detailKey: "variants" },
      { key: "frontend", label: "Frontend Cards", icon: "mdi:web", sensor: this._getSensor("sensor.unused_frontend_resources"), detailKey: "card_type" }
    ];
    var result = [];
    for (var i = 0; i < all.length; i++) {
      if (allowed.indexOf(all[i].key) !== -1) { result.push(all[i]); }
    }
    return result;
  }

  // Items for a section: unused entries whose install age is known and within
  // the window, newest installs first. Tracks how many were skipped because
  // their install date couldn't be resolved (days_installed == null).
  _sectionItems(section) {
    var sensor = section.sensor;
    var unused = (sensor && sensor.attributes.unused_components) || [];
    var items = [];
    var unknown = 0;
    for (var i = 0; i < unused.length; i++) {
      var it = unused[i];
      var days = it.days_installed;
      if (days == null || days < 0) { unknown++; continue; }
      if (days <= this._window) { items.push(it); }
    }
    items.sort(function(a, b) {
      var da = a.days_installed;
      var db = b.days_installed;
      if (da !== db) { return da - db; }
      var na = (a.name || "").toLowerCase();
      var nb = (b.name || "").toLowerCase();
      return na < nb ? -1 : (na > nb ? 1 : 0);
    });
    return { items: items, unknown: unknown };
  }

  _render() {
    if (!this._hass) { return; }

    var allComponents = this._getSensor("sensor.hacs_installed_components");
    var lastScan = allComponents ? (allComponents.attributes.last_scan || "") : "";

    var sections = this._getVisibleSections();

    var totalRecent = 0;
    var totalUnknown = 0;
    var sectionData = [];
    for (var i = 0; i < sections.length; i++) {
      var res = this._sectionItems(sections[i]);
      totalRecent += res.items.length;
      totalUnknown += res.unknown;
      sectionData.push({ section: sections[i], items: res.items });
    }

    var badgeHtml;
    if (totalRecent === 0) {
      badgeHtml = '<span class="badge clean">All Clear</span>';
    } else if (totalRecent <= 3) {
      badgeHtml = '<span class="badge warn">' + totalRecent + ' New</span>';
    } else {
      badgeHtml = '<span class="badge alert">' + totalRecent + ' New</span>';
    }

    var bodyHtml;
    if (totalRecent === 0) {
      bodyHtml = '<div class="empty-all">Nothing installed in the last ' + this._window + ' days is sitting unused &#127881;</div>';
    } else {
      var s = "";
      for (var j = 0; j < sectionData.length; j++) {
        if (sectionData[j].items.length === 0) { continue; }
        s += this._renderSection(sectionData[j].section, sectionData[j].items);
      }
      bodyHtml = s;
    }

    var footerBits = [];
    if (lastScan) { footerBits.push("Last scan: " + this._formatTime(lastScan)); }
    if (totalUnknown > 0) {
      footerBits.push(totalUnknown + " unused item" + (totalUnknown !== 1 ? "s" : "") + " hidden (install date unknown)");
    }
    var footerHtml = footerBits.join(" &middot; ");

    this.shadowRoot.innerHTML = [
      "<style>",
      ":host {",
      "  --primary: var(--primary-text-color, #212121);",
      "  --secondary: var(--secondary-text-color, #727272);",
      "  --accent: var(--primary-color, #03a9f4);",
      "  --divider: var(--divider-color, rgba(0,0,0,0.12));",
      "  --green: var(--label-badge-green, #4caf50);",
      "  --red: var(--label-badge-red, #f44336);",
      "  --orange: var(--label-badge-yellow, #ff9800);",
      "}",
      "ha-card { padding: 16px; }",
      ".header { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:12px; }",
      ".header .title { font-size:1.1em; font-weight:500; color:var(--primary); flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
      ".header-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }",
      ".subtitle { font-size:0.75em; color:var(--secondary); margin:-6px 0 12px 0; }",
      ".badge { font-size:0.8em; padding:2px 8px; border-radius:12px; font-weight:500; color:#fff; }",
      ".badge.clean { background:var(--green); }",
      ".badge.warn { background:var(--orange); }",
      ".badge.alert { background:var(--red); }",
      ".section { margin-bottom:12px; }",
      ".section-header { display:flex; align-items:center; gap:6px; padding:6px 0; font-weight:500; font-size:0.95em; color:var(--primary); }",
      ".section-header ha-icon { --mdc-icon-size:18px; color:var(--secondary); }",
      ".section-header .counts { margin-left:auto; font-size:0.8em; color:var(--secondary); font-weight:400; }",
      ".item { display:flex; align-items:center; padding:6px 0 6px 24px; border-bottom:1px solid var(--divider); gap:8px; }",
      ".item:last-child { border-bottom:none; }",
      ".dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; background:var(--orange); }",
      ".item-info { flex:1; min-width:0; }",
      ".item-name { font-size:0.9em; color:var(--primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
      ".item-detail { font-size:0.75em; color:var(--secondary); }",
      ".item-detail a { color:var(--accent); text-decoration:none; }",
      ".item-days { font-size:0.75em; color:var(--secondary); white-space:nowrap; flex-shrink:0; }",
      ".footer { margin-top:8px; font-size:0.7em; color:var(--secondary); text-align:right; }",
      ".empty-all { padding:16px 8px; font-size:0.9em; color:var(--secondary); text-align:center; }",
      "</style>",
      "<ha-card>",
      '  <div class="header">',
      '    <span class="title">' + _riu_escapeHtml(this._config.title) + "</span>",
      '    <div class="header-right">',
      "      " + badgeHtml,
      "    </div>",
      "  </div>",
      '  <div class="subtitle">Installed in the last ' + this._window + ' days and not yet used</div>',
      bodyHtml,
      '  <div class="footer">' + footerHtml + "</div>",
      "</ha-card>"
    ].join("\n");
  }

  _renderSection(section, items) {
    var itemsHtml = "";
    for (var i = 0; i < items.length; i++) {
      itemsHtml += this._renderItem(items[i], section.detailKey);
    }
    return [
      '<div class="section">',
      '  <div class="section-header">',
      '    <ha-icon icon="' + section.icon + '"></ha-icon>',
      "    " + section.label,
      '    <span class="counts">' + items.length + "</span>",
      "  </div>",
      itemsHtml,
      "</div>"
    ].join("\n");
  }

  _renderItem(item, detailKey) {
    var days = item.days_installed;
    var daysStr;
    if (days === 0) {
      daysStr = "today";
    } else if (days === 1) {
      daysStr = "1d ago";
    } else {
      daysStr = days + "d ago";
    }
    var detail = "";
    if (detailKey && item[detailKey] != null) {
      if (detailKey === "variants") {
        detail = item[detailKey] + " variant" + (item[detailKey] !== 1 ? "s" : "");
      } else {
        detail = String(item[detailKey]);
      }
    }
    var repoLink = item.repository
      ? '<a href="' + _riu_escapeHtml(item.repository) + '" target="_blank" rel="noopener noreferrer">repo</a>'
      : "";
    var sep1 = (detail && repoLink) ? " &middot; " : "";
    var versionStr = item.version ? (" &middot; " + _riu_escapeHtml(item.version)) : "";

    return [
      '<div class="item">',
      '  <span class="dot"></span>',
      '  <div class="item-info">',
      '    <div class="item-name">' + _riu_escapeHtml(item.name || "Unknown") + "</div>",
      '    <div class="item-detail">' + _riu_escapeHtml(detail) + sep1 + repoLink + versionStr + "</div>",
      "  </div>",
      '  <div class="item-days">' + daysStr + "</div>",
      "</div>"
    ].join("\n");
  }

  _formatTime(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return iso;
    }
  }
}

/* ---------- Config Editor ---------- */
class RecentlyInstalledUnusedCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }

  _render() {
    var titleVal = _riu_escapeHtml(this._config.title || "Recently Installed but Unused");
    var windowVal = this._config.days_window != null ? this._config.days_window : RIU_DEFAULT_WINDOW;
    var secs = this._config.sections || RIU_ALL_SECTIONS.slice();

    var chkInteg = secs.indexOf("integrations") !== -1 ? " checked" : "";
    var chkThemes = secs.indexOf("themes") !== -1 ? " checked" : "";
    var chkFront = secs.indexOf("frontend") !== -1 ? " checked" : "";

    this.shadowRoot.innerHTML = [
      "<style>",
      ".row { display:flex; align-items:center; gap:8px; margin:8px 0; }",
      "label { flex:1; font-size:0.9em; }",
      ".ctrl { flex:2; }",
      'input[type="text"], input[type="number"], select { width:100%; padding:6px 8px; border:1px solid var(--divider-color,#ccc); border-radius:4px; font-size:0.9em; background:var(--card-background-color,#fff); color:var(--primary-text-color,#212121); box-sizing:border-box; }',
      ".checks { display:flex; gap:12px; flex-wrap:wrap; }",
      ".checks label { flex:unset; display:flex; align-items:center; gap:4px; cursor:pointer; }",
      "</style>",
      '<div class="row">',
      "  <label>Title</label>",
      '  <div class="ctrl"><input type="text" id="title" value="' + titleVal + '"></div>',
      "</div>",
      '<div class="row">',
      "  <label>Window (days)</label>",
      '  <div class="ctrl"><input type="number" id="days_window" min="1" max="365" value="' + windowVal + '"></div>',
      "</div>",
      '<div class="row">',
      "  <label>Sections</label>",
      '  <div class="ctrl checks">',
      '    <label><input type="checkbox" id="sec_integrations"' + chkInteg + "> Integrations</label>",
      '    <label><input type="checkbox" id="sec_themes"' + chkThemes + "> Themes</label>",
      '    <label><input type="checkbox" id="sec_frontend"' + chkFront + "> Frontend</label>",
      "  </div>",
      "</div>"
    ].join("\n");

    var self = this;
    this.shadowRoot.querySelector("#title").addEventListener("change", function(ev) {
      self._config = Object.assign({}, self._config, { title: ev.target.value });
      self._fire();
    });
    this.shadowRoot.querySelector("#days_window").addEventListener("change", function(ev) {
      var v = parseInt(ev.target.value, 10);
      if (isNaN(v) || v < 1) { v = RIU_DEFAULT_WINDOW; }
      self._config = Object.assign({}, self._config, { days_window: v });
      self._fire();
    });

    var secIds = ["sec_integrations", "sec_themes", "sec_frontend"];
    var secKeys = ["integrations", "themes", "frontend"];
    for (var i = 0; i < secIds.length; i++) {
      (function(idx) {
        self.shadowRoot.querySelector("#" + secIds[idx]).addEventListener("change", function() {
          var current = (self._config.sections || RIU_ALL_SECTIONS.slice());
          var key = secKeys[idx];
          var pos = current.indexOf(key);
          if (this.checked && pos === -1) {
            current.push(key);
          } else if (!this.checked && pos !== -1) {
            current.splice(pos, 1);
          }
          self._config = Object.assign({}, self._config, { sections: current });
          self._fire();
        });
      })(i);
    }
  }
}

customElements.define("recently-installed-unused-card-editor", RecentlyInstalledUnusedCardEditor);
customElements.define("recently-installed-unused-card", RecentlyInstalledUnusedCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "recently-installed-unused-card",
  name: "Recently Installed but Unused",
  description: "Shows HACS integrations, themes and cards installed recently that are still unused",
  preview: true
});

console.info(
  "%c RECENTLY-INSTALLED-UNUSED %c v" + CARD_VERSION + " ",
  "color: white; background: #ff9800; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #ff9800; background: #fff; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);
