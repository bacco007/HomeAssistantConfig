/**
 * Custom Component Monitor Card
 * A Lovelace card that displays unused HACS components.
 */
var CARD_VERSION = "1.1.3";

var ALL_SECTIONS = ["integrations", "themes", "frontend"];

function _ccm_escapeHtml(text) {
  var el = document.createElement("span");
  el.textContent = String(text);
  return el.innerHTML;
}

class CustomComponentMonitorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._lastDataJSON = "";
    this._collapsed = {};
    this._sortMode = "name";
  }

  static getConfigElement() {
    return document.createElement("custom-component-monitor-card-editor");
  }

  static getStubConfig() {
    return { title: "Custom Component Monitor", sort: "name", sections: ["integrations", "themes", "frontend"] };
  }

  setConfig(config) {
    this._config = Object.assign(
      { title: "Custom Component Monitor", sort: "name", sections: ALL_SECTIONS.slice() },
      config
    );
    this._sortMode = this._config.sort || "name";
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
    return 3 + (this._config.sections || ALL_SECTIONS).length;
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

  _sortItems(items) {
    var sorted = items.slice();
    var mode = this._sortMode;
    sorted.sort(function(a, b) {
      if (mode === "days") {
        var da = (a.days_installed != null) ? a.days_installed : -1;
        var db = (b.days_installed != null) ? b.days_installed : -1;
        if (db !== da) { return db - da; }
      }
      var na = (a.name || "").toLowerCase();
      var nb = (b.name || "").toLowerCase();
      return na < nb ? -1 : (na > nb ? 1 : 0);
    });
    return sorted;
  }

  _getVisibleSections() {
    var allowed = this._config.sections || ALL_SECTIONS;
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

  _render() {
    if (!this._hass) { return; }

    var allComponents = this._getSensor("sensor.hacs_installed_components");
    var totalInstalled = allComponents ? (allComponents.attributes.total_components || 0) : 0;
    var lastScan = allComponents ? (allComponents.attributes.last_scan || "") : "";

    var sections = this._getVisibleSections();

    var totalUnused = 0;
    var totalUsed = 0;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (s.sensor) {
        totalUnused += parseInt(s.sensor.state, 10) || 0;
        totalUsed += (s.sensor.attributes.used_components || 0);
      }
    }

    var badgeHtml;
    if (totalUnused === 0) {
      badgeHtml = '<span class="badge clean">All Clean</span>';
    } else if (totalUnused <= 3) {
      badgeHtml = '<span class="badge warn">' + totalUnused + ' Unused</span>';
    } else {
      badgeHtml = '<span class="badge alert">' + totalUnused + ' Unused</span>';
    }

    var sectionsHtml = "";
    for (var j = 0; j < sections.length; j++) {
      sectionsHtml += this._renderSection(sections[j]);
    }

    var unusedColor = totalUnused > 0 ? "var(--red)" : "var(--green)";
    var footerHtml = lastScan ? "Last scan: " + this._formatTime(lastScan) : "";
    var sortLabel = this._sortMode === "days" ? "days installed" : "name";

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
      ".header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }",
      ".header .title { font-size:1.1em; font-weight:500; color:var(--primary); }",
      ".badge { font-size:0.8em; padding:2px 8px; border-radius:12px; font-weight:500; color:#fff; }",
      ".badge.clean { background:var(--green); }",
      ".badge.warn { background:var(--orange); }",
      ".badge.alert { background:var(--red); }",
      ".toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }",
      ".summary { display:flex; gap:12px; flex-wrap:wrap; flex:1; }",
      ".stat { flex:1; min-width:70px; text-align:center; padding:8px 4px; border-radius:8px; background:var(--divider); }",
      ".stat .num { font-size:1.6em; font-weight:600; color:var(--primary); line-height:1.2; }",
      ".stat .label { font-size:0.75em; color:var(--secondary); margin-top:2px; }",
      ".sort-toggle { font-size:0.75em; color:var(--accent); cursor:pointer; padding:4px 8px; border-radius:4px; white-space:nowrap; user-select:none; }",
      ".sort-toggle:hover { background:var(--divider); }",
      ".section { margin-bottom:12px; }",
      ".section-header { display:flex; align-items:center; gap:6px; padding:6px 0; font-weight:500; font-size:0.95em; color:var(--primary); cursor:pointer; user-select:none; }",
      ".section-header ha-icon { --mdc-icon-size:18px; color:var(--secondary); }",
      ".section-header .counts { margin-left:auto; font-size:0.8em; color:var(--secondary); font-weight:400; }",
      ".section-header .arrow { font-size:0.7em; transition:transform 0.2s; color:var(--secondary); display:inline-block; }",
      ".section-header .arrow.open { transform:rotate(90deg); }",
      ".items { display:none; }",
      ".items.open { display:block; }",
      ".item { display:flex; align-items:center; padding:6px 0 6px 24px; border-bottom:1px solid var(--divider); gap:8px; }",
      ".item:last-child { border-bottom:none; }",
      ".dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }",
      ".dot.unused { background:var(--red); }",
      ".item-info { flex:1; min-width:0; }",
      ".item-name { font-size:0.9em; color:var(--primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
      ".item-detail { font-size:0.75em; color:var(--secondary); }",
      ".item-detail a { color:var(--accent); text-decoration:none; }",
      ".item-days { font-size:0.75em; color:var(--secondary); white-space:nowrap; flex-shrink:0; }",
      ".footer { margin-top:8px; font-size:0.7em; color:var(--secondary); text-align:right; }",
      ".empty-msg { padding:8px 24px; font-size:0.85em; color:var(--secondary); font-style:italic; }",
      "</style>",
      "<ha-card>",
      '  <div class="header">',
      '    <span class="title">' + _ccm_escapeHtml(this._config.title) + "</span>",
      "    " + badgeHtml,
      "  </div>",
      '  <div class="toolbar">',
      '    <div class="summary">',
      '      <div class="stat"><div class="num">' + totalInstalled + '</div><div class="label">Installed</div></div>',
      '      <div class="stat"><div class="num">' + totalUsed + '</div><div class="label">Used</div></div>',
      '      <div class="stat"><div class="num" style="color:' + unusedColor + '">' + totalUnused + '</div><div class="label">Unused</div></div>',
      "    </div>",
      '    <span class="sort-toggle" title="Click to change sort order">Sort: ' + sortLabel + "</span>",
      "  </div>",
      sectionsHtml,
      '  <div class="footer">' + footerHtml + "</div>",
      "</ha-card>"
    ].join("\n");

    this._attachEvents();
  }

  _attachEvents() {
    var self = this;

    var headers = this.shadowRoot.querySelectorAll(".section-header");
    for (var k = 0; k < headers.length; k++) {
      (function(header) {
        var key = header.getAttribute("data-section");
        header.addEventListener("click", function() {
          var items = header.nextElementSibling;
          var arrow = header.querySelector(".arrow");
          var isOpen = items && items.classList.contains("open");
          if (items) { items.classList.toggle("open"); }
          if (arrow) { arrow.classList.toggle("open"); }
          self._collapsed[key] = isOpen;
        });
      })(headers[k]);
    }

    var sortBtn = this.shadowRoot.querySelector(".sort-toggle");
    if (sortBtn) {
      sortBtn.addEventListener("click", function() {
        self._sortMode = (self._sortMode === "name") ? "days" : "name";
        self._lastDataJSON = "";
        self._render();
      });
    }
  }

  _renderSection(section) {
    var sensor = section.sensor;
    if (!sensor) {
      return [
        '<div class="section">',
        '  <div class="section-header" data-section="' + section.key + '">',
        '    <ha-icon icon="' + section.icon + '"></ha-icon>',
        "    " + section.label,
        '    <span class="counts">unavailable</span>',
        "  </div>",
        "</div>"
      ].join("\n");
    }

    var attrs = sensor.attributes;
    var unused = attrs.unused_components || [];
    var total = attrs.total_components || 0;
    var unusedCount = parseInt(sensor.state, 10) || 0;

    var isOpen;
    if (this._collapsed.hasOwnProperty(section.key)) {
      isOpen = !this._collapsed[section.key];
    } else {
      isOpen = unusedCount > 0;
    }
    var openClass = isOpen ? " open" : "";

    var sorted = this._sortItems(unused);
    var itemsHtml = "";
    if (sorted.length === 0) {
      itemsHtml = '<div class="empty-msg">No unused items</div>';
    } else {
      for (var i = 0; i < sorted.length; i++) {
        itemsHtml += this._renderItem(sorted[i], section.detailKey);
      }
    }

    return [
      '<div class="section">',
      '  <div class="section-header" data-section="' + section.key + '">',
      '    <span class="arrow' + openClass + '">&#9654;</span>',
      '    <ha-icon icon="' + section.icon + '"></ha-icon>',
      "    " + section.label,
      '    <span class="counts">' + unusedCount + " unused / " + total + " total</span>",
      "  </div>",
      '  <div class="items' + openClass + '">',
      itemsHtml,
      "  </div>",
      "</div>"
    ].join("\n");
  }

  _renderItem(item, detailKey) {
    var days = item.days_installed;
    var daysStr = (days != null && days >= 0) ? (days + "d installed") : "";
    var detail = "";
    if (detailKey && item[detailKey] != null) {
      if (detailKey === "variants") {
        detail = item[detailKey] + " variant" + (item[detailKey] !== 1 ? "s" : "");
      } else {
        detail = String(item[detailKey]);
      }
    }
    var repoLink = item.repository
      ? '<a href="' + _ccm_escapeHtml(item.repository) + '" target="_blank" rel="noopener noreferrer">repo</a>'
      : "";
    var sep1 = (detail && repoLink) ? " &middot; " : "";
    var versionStr = item.version ? (" &middot; " + _ccm_escapeHtml(item.version)) : "";

    return [
      '<div class="item">',
      '  <span class="dot unused"></span>',
      '  <div class="item-info">',
      '    <div class="item-name">' + _ccm_escapeHtml(item.name || "Unknown") + "</div>",
      '    <div class="item-detail">' + _ccm_escapeHtml(detail) + sep1 + repoLink + versionStr + "</div>",
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
class CustomComponentMonitorCardEditor extends HTMLElement {
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
    var titleVal = _ccm_escapeHtml(this._config.title || "Custom Component Monitor");
    var sortVal = this._config.sort || "name";
    var secs = this._config.sections || ALL_SECTIONS.slice();

    var chkInteg = secs.indexOf("integrations") !== -1 ? " checked" : "";
    var chkThemes = secs.indexOf("themes") !== -1 ? " checked" : "";
    var chkFront = secs.indexOf("frontend") !== -1 ? " checked" : "";

    this.shadowRoot.innerHTML = [
      "<style>",
      ".row { display:flex; align-items:center; gap:8px; margin:8px 0; }",
      "label { flex:1; font-size:0.9em; }",
      '.ctrl { flex:2; }',
      'input[type="text"], select { width:100%; padding:6px 8px; border:1px solid var(--divider-color,#ccc); border-radius:4px; font-size:0.9em; background:var(--card-background-color,#fff); color:var(--primary-text-color,#212121); box-sizing:border-box; }',
      ".checks { display:flex; gap:12px; flex-wrap:wrap; }",
      ".checks label { flex:unset; display:flex; align-items:center; gap:4px; cursor:pointer; }",
      "</style>",
      '<div class="row">',
      "  <label>Title</label>",
      '  <div class="ctrl"><input type="text" id="title" value="' + titleVal + '"></div>',
      "</div>",
      '<div class="row">',
      "  <label>Default sort</label>",
      '  <div class="ctrl"><select id="sort">',
      '    <option value="name"' + (sortVal === "name" ? " selected" : "") + ">Name</option>",
      '    <option value="days"' + (sortVal === "days" ? " selected" : "") + ">Days installed</option>",
      "  </select></div>",
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
    this.shadowRoot.querySelector("#sort").addEventListener("change", function(ev) {
      self._config = Object.assign({}, self._config, { sort: ev.target.value });
      self._fire();
    });

    var secIds = ["sec_integrations", "sec_themes", "sec_frontend"];
    var secKeys = ["integrations", "themes", "frontend"];
    for (var i = 0; i < secIds.length; i++) {
      (function(idx) {
        self.shadowRoot.querySelector("#" + secIds[idx]).addEventListener("change", function() {
          var current = (self._config.sections || ALL_SECTIONS.slice());
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

customElements.define("custom-component-monitor-card-editor", CustomComponentMonitorCardEditor);
customElements.define("custom-component-monitor-card", CustomComponentMonitorCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "custom-component-monitor-card",
  name: "Custom Component Monitor",
  description: "Displays unused HACS custom components",
  preview: true
});

console.info(
  "%c CUSTOM-COMPONENT-MONITOR %c v" + CARD_VERSION + " ",
  "color: white; background: #f44336; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #f44336; background: #fff; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);
