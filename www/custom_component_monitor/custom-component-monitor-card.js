/**
 * Custom Component Monitor Card
 * A Lovelace card that displays unused HACS components.
 */
var CARD_VERSION = "1.14.0";

var ALL_SECTIONS = ["integrations", "themes", "frontend"];

// One source of truth for the card and its editor. The editor shows these as
// the effective values but never stores them - see _ccmPrune.
var CCM_DEFAULTS = {
  title: "Custom Component Monitor",
  sort: "name",
  show: "unused",
  sections: ALL_SECTIONS.slice(),
  collapsed_by_default: false,
};

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
    // Deliberately empty: setConfig applies every default at read time. Baking
    // them in froze an old title in everyone's dashboard once already, which is
    // why _riu_migrateConfig exists on the sibling card.
    return {};
  }

  setConfig(config) {
    this._config = Object.assign(
      { title: CCM_DEFAULTS.title, sort: CCM_DEFAULTS.sort, show: CCM_DEFAULTS.show,
        sections: ALL_SECTIONS.slice(), collapsed_by_default: CCM_DEFAULTS.collapsed_by_default },
      config
    );
    this._sortMode = this._config.sort || "name";
    // #41: which components to list - "unused" | "all" | "used".
    this._showMode = ["unused", "all", "used"].indexOf(this._config.show) !== -1 ? this._config.show : "unused";
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
    var lastScan = allComponents ? (allComponents.attributes.last_scan || "") : "";

    var sections = this._getVisibleSections();

    var totalInstalled = 0;
    var totalUnused = 0;
    var totalUsed = 0;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (s.sensor) {
        totalInstalled += (s.sensor.attributes.total_components || 0);
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
    var sortIcon = this._sortMode === "days" ? "mdi:sort-calendar-descending" : "mdi:sort-alphabetical-ascending";
    var sortTooltip = this._sortMode === "days"
      ? "Sorted by days installed - click to sort by name"
      : "Sorted by name - click to sort by days installed";

    var showLabels = { unused: "Unused", all: "All", used: "Used" };
    var showIcons = { unused: "mdi:eye-off-outline", all: "mdi:eye-outline", used: "mdi:eye-check-outline" };
    var showTip = "Showing: " + showLabels[this._showMode] + " - click to cycle (Unused / All / Used)";

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
      ".badge { font-size:0.8em; padding:2px 8px; border-radius:12px; font-weight:500; color:#fff; }",
      ".badge.clean { background:var(--green); }",
      ".badge.warn { background:var(--orange); }",
      ".badge.alert { background:var(--red); }",
      ".toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }",
      ".summary { display:flex; gap:12px; flex-wrap:wrap; flex:1; }",
      ".stat { flex:1; min-width:70px; text-align:center; padding:8px 4px; border-radius:8px; background:var(--divider); }",
      ".stat .num { font-size:1.6em; font-weight:600; color:var(--primary); line-height:1.2; }",
      ".stat .label { font-size:0.75em; color:var(--secondary); margin-top:2px; }",
      ".sort-toggle { display:inline-flex; align-items:center; justify-content:center; color:var(--accent); cursor:pointer; padding:4px; border:none; background:none; border-radius:4px; user-select:none; flex-shrink:0; }",
      ".sort-toggle:hover { background:var(--divider); }",
      ".sort-toggle:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }",
      ".sort-toggle ha-icon { --mdc-icon-size:20px; }",
      ".show-toggle { display:inline-flex; align-items:center; gap:4px; color:var(--accent); cursor:pointer; padding:4px 6px; border:none; background:none; border-radius:4px; user-select:none; flex-shrink:0; font-family:inherit; font-size:0.8em; }",
      ".show-toggle:hover { background:var(--divider); }",
      ".show-toggle:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }",
      ".show-toggle ha-icon { --mdc-icon-size:18px; }",
      ".show-label { font-size:0.95em; }",
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
      ".dot.used { background:var(--green); }",
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
      '    <div class="header-right">',
      '      <button type="button" class="show-toggle" title="' + showTip + '" aria-label="' + showTip + '"><ha-icon icon="' + showIcons[this._showMode] + '"></ha-icon><span class="show-label">' + showLabels[this._showMode] + "</span></button>",
      '      <button type="button" class="sort-toggle" title="' + sortTooltip + '" aria-label="' + sortTooltip + '"><ha-icon icon="' + sortIcon + '"></ha-icon></button>',
      "      " + badgeHtml,
      "    </div>",
      "  </div>",
      '  <div class="toolbar">',
      '    <div class="summary">',
      '      <div class="stat"><div class="num">' + totalInstalled + '</div><div class="label">Installed</div></div>',
      '      <div class="stat"><div class="num">' + totalUsed + '</div><div class="label">Used</div></div>',
      '      <div class="stat"><div class="num" style="color:' + unusedColor + '">' + totalUnused + '</div><div class="label">Unused</div></div>',
      "    </div>",
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

    var showBtn = this.shadowRoot.querySelector(".show-toggle");
    if (showBtn) {
      showBtn.addEventListener("click", function() {
        var order = ["unused", "all", "used"];
        self._showMode = order[(order.indexOf(self._showMode) + 1) % order.length];
        self._lastDataJSON = "";
        self._render();
      });
    }
  }

  _sectionItems(section) {
    // Items to display for this section per _showMode, each tagged _unused (#41).
    var sensor = section.sensor;
    var unused = (sensor && sensor.attributes.unused_components) || [];
    var unusedByName = {};
    for (var u = 0; u < unused.length; u++) {
      unusedByName[(unused[u].name || "").toLowerCase()] = unused[u];
    }
    if (this._showMode === "unused") {
      return unused.map(function(it) { var c = Object.assign({}, it); c._unused = true; return c; });
    }
    // "all" / "used": source from the full installed-components sensor, by type.
    var allSensor = this._getSensor("sensor.hacs_installed_components");
    var allComps = (allSensor && allSensor.attributes.components) || [];
    var typeFor = { integrations: "Integration", themes: "Theme", frontend: "Frontend / Card" }[section.key];
    var items = [];
    for (var i = 0; i < allComps.length; i++) {
      var c = allComps[i];
      if (c.type !== typeFor) { continue; }
      var key = (c.name || "").toLowerCase();
      var isUnused = unusedByName.hasOwnProperty(key);
      if (this._showMode === "used" && isUnused) { continue; }
      var item = Object.assign({}, c);
      if (isUnused) { item = Object.assign(item, unusedByName[key]); }
      item._unused = isUnused;
      items.push(item);
    }
    return items;
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
    var total = attrs.total_components || 0;
    var unusedCount = parseInt(sensor.state, 10) || 0;

    var sorted = this._sortItems(this._sectionItems(section));

    var isOpen;
    if (this._collapsed.hasOwnProperty(section.key)) {
      isOpen = !this._collapsed[section.key];
    } else if (this._config.collapsed_by_default) {
      isOpen = false;
    } else {
      isOpen = (this._showMode === "unused") ? unusedCount > 0 : sorted.length > 0;
    }
    var openClass = isOpen ? " open" : "";

    var itemsHtml = "";
    if (sorted.length === 0) {
      itemsHtml = '<div class="empty-msg">' + (this._showMode === "unused" ? "No unused items" : "No items") + "</div>";
    } else {
      for (var i = 0; i < sorted.length; i++) {
        itemsHtml += this._renderItem(sorted[i], section.detailKey);
      }
    }

    var counts = (this._showMode === "unused")
      ? (unusedCount + " unused / " + total + " total")
      : (sorted.length + " " + this._showMode + " / " + total + " total");

    return [
      '<div class="section">',
      '  <div class="section-header" data-section="' + section.key + '">',
      '    <span class="arrow' + openClass + '">&#9654;</span>',
      '    <ha-icon icon="' + section.icon + '"></ha-icon>',
      "    " + section.label,
      '    <span class="counts">' + counts + "</span>",
      "  </div>",
      '  <div class="items' + openClass + '">',
      itemsHtml,
      "  </div>",
      "</div>"
    ].join("\n");
  }

  _renderItem(item, detailKey) {
    var days = item.days_installed;
    // "~" marks a date estimated from the files on disk rather than one the
    // integration watched happen (components installed before v1.13.0).
    var daysStr = (days != null && days >= 0)
      ? ((item.install_date_estimated ? "~" : "") + days + "d installed")
      : "";
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
      '  <span class="dot ' + (item._unused ? "unused" : "used") + '"></span>',
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

/* ---------- Config Editor ----------
 *
 * Built on ha-form rather than hand-rolled DOM. Two reasons, one visual and
 * one structural. The editor renders inside Home Assistant's card dialog
 * surrounded by Material fields, and raw <select>/<input> match neither them
 * nor the active theme. And the re-render fault this file used to carry -
 * _render() replacing the whole subtree on every setConfig(), which the dialog
 * calls back after each config-changed, destroying the control being operated
 * - cannot happen here: the form element is created once and thereafter only
 * .hass, .schema and .data are assigned, so Lit patches in place.
 *
 * See docs/specs/card-editor-ha-form.md.
 */

var CCM_EDITOR_LABELS = {
  title: "Card title (optional)",
  show: "Which components to list",
  sort: "Sort by",
  sections: "Sections to show",
  collapsed_by_default: "Start with every section collapsed",
};

// ha-form renders the raw key name when it cannot find a label, so the labels
// map is required rather than decorative.
var CCM_EDITOR_HELPERS = {
  title: 'Leave blank to use "' + CCM_DEFAULTS.title + '".',
  show: "Unused means nothing on your dashboards or in your automations refers to it.",
  collapsed_by_default: "Sections can still be expanded, and remember their state afterwards.",
};

var CCM_EDITOR_SCHEMA = [
  { name: "title", selector: { text: {} } },
  {
    name: "show",
    selector: { select: { mode: "dropdown", options: [
      { value: "unused", label: "Only unused components" },
      { value: "all", label: "Every component" },
      { value: "used", label: "Only components in use" },
    ] } },
  },
  {
    name: "sort",
    selector: { select: { mode: "dropdown", options: [
      { value: "name", label: "Name" },
      { value: "days", label: "Days since install" },
    ] } },
  },
  {
    // A list of the same three strings, not three booleans: three toggles would
    // read better but would change the stored shape and break every existing
    // dashboard. mode "list" shows all three at once, which also survives 380px
    // better than a row of checkboxes did.
    name: "sections",
    selector: { select: { multiple: true, mode: "list", options: [
      { value: "integrations", label: "Integrations" },
      { value: "themes", label: "Themes" },
      { value: "frontend", label: "Frontend cards" },
    ] } },
  },
  { name: "collapsed_by_default", selector: { boolean: {} } },
];

/**
 * Force the frontend chunk that defines ha-form.
 *
 * In practice the editor is only ever built from the card dialog, which has
 * already loaded that chunk - but this is Mushroom's belt-and-braces and costs
 * nothing. `window.customElements` is re-read on every call rather than
 * captured: Home Assistant swaps it for a scoped-registry polyfill while its
 * core bundle boots, which is also why this must never be
 * `customElements.whenDefined()` at module top level - that would bind to the
 * native registry's method and might never fire.
 */
function _ccmLoadHaComponents() {
  var registry = window.customElements;
  if (registry && !registry.get("ha-form")) {
    var tile = registry.get("hui-tile-card");
    if (tile && tile.getConfigElement) { tile.getConfigElement(); }
  }
}

function _ccmSameValue(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.slice().sort().join(",") === b.slice().sort().join(",");
  }
  return a === b;
}

/**
 * Drop anything the user did not actually choose.
 *
 * An empty title becomes an absent key, and so does any value equal to the
 * card's own default. Keys the schema knows nothing about - `type`,
 * `view_layout`, `grid_options` and friends - are passed through untouched.
 * Storing a default is how "Recently Installed but Unused" ended up frozen in
 * dashboards after the card was renamed; see DECISIONS.md.
 */
function _ccmPrune(config) {
  var out = Object.assign({}, config);
  if (out.title === "" || out.title == null) { delete out.title; }
  Object.keys(CCM_DEFAULTS).forEach(function (key) {
    if (key in out && _ccmSameValue(out[key], CCM_DEFAULTS[key])) { delete out[key]; }
  });
  return out;
}

class CustomComponentMonitorCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  // Safe to render on every tick, unlike the hand-built version this replaced:
  // nothing is destroyed, the form just receives new values.
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    _ccmLoadHaComponents();
  }

  /**
   * What the form displays: the effective values, so no dropdown opens blank -
   * except the title, which stays empty when unset so its helper line can name
   * the default instead of the box silently claiming a value that isn't stored.
   */
  _formData() {
    var data = Object.assign({}, CCM_DEFAULTS, this._config);
    if (this._config.title == null) { data.title = ""; }
    return data;
  }

  _render() {
    // ha-form needs hass to resolve its selectors, so wait for it.
    if (!this._hass || !this._config) { return; }

    if (!this._form) {
      var form = document.createElement("ha-form");
      form.computeLabel = function (schema) {
        return CCM_EDITOR_LABELS[schema.name] || schema.name;
      };
      form.computeHelper = function (schema) {
        return CCM_EDITOR_HELPERS[schema.name] || "";
      };
      form.addEventListener("value-changed", this._onValueChanged.bind(this));
      // Light DOM, matching the sibling laundry-weather and ha-jokes cards: the
      // dialog styles the editor's own children, and the selectors read `hass`
      // from a Lit context provider further up the tree.
      this.appendChild(form);
      this._form = form;
    }

    this._form.hass = this._hass;
    this._form.schema = CCM_EDITOR_SCHEMA;
    this._form.data = this._formData();
  }

  _onValueChanged(event) {
    // Stop the inner event so only our config-changed reaches the editor host.
    event.stopPropagation();
    var config = _ccmPrune(event.detail.value);
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: config },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get("custom-component-monitor-card-editor")) {
  customElements.define("custom-component-monitor-card-editor", CustomComponentMonitorCardEditor);
}
if (!customElements.get("custom-component-monitor-card")) {
  customElements.define("custom-component-monitor-card", CustomComponentMonitorCard);
}

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
