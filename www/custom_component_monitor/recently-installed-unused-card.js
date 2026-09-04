/**
 * Recently installed but unused Card
 * A Lovelace card that surfaces HACS components installed within a recent
 * window (default 30 days) that are still unused - the "I installed this and
 * forgot to wire it up" view. It reads the same unused_* sensors as the main
 * Custom Component Monitor card and filters each unused list by days_installed.
 */
var CARD_VERSION = "1.14.0";

var RIU_ALL_SECTIONS = ["integrations", "themes", "frontend"];
var RIU_DEFAULT_WINDOW = 30;
var RIU_TITLE = "Recently installed but unused";
// v1.12.0 and earlier baked this Title Case string into saved dashboards via
// getStubConfig(), so it is dropped on load and the new default applies.
var RIU_LEGACY_TITLE = "Recently Installed but Unused";

// One source of truth for the card and its editor. The editor shows these as
// the effective values but never stores them - see _riuPrune.
var RIU_DEFAULTS = {
  title: RIU_TITLE,
  days_window: RIU_DEFAULT_WINDOW,
  sections: RIU_ALL_SECTIONS.slice(),
};

// Strip the old baked-in default so those users pick up the new title. A title
// the user typed themselves is left alone.
function _riu_migrateConfig(config) {
  var out = Object.assign({}, config);
  if (out.title === RIU_LEGACY_TITLE) { delete out.title; }
  return out;
}

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
    // Deliberately empty: setConfig applies every default at read time. This
    // card already lost a rename to a baked-in stub value once - see
    // RIU_LEGACY_TITLE above and DECISIONS.md.
    return {};
  }

  setConfig(config) {
    this._config = Object.assign(
      { title: RIU_TITLE, days_window: RIU_DEFAULT_WINDOW, sections: RIU_ALL_SECTIONS.slice() },
      _riu_migrateConfig(config)
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
  // their install date couldn't be resolved (days_installed == null), and how
  // many of the shown items carry an estimated date (install_date_estimated) —
  // components that were already installed before the integration started
  // recording first-seen dates.
  _sectionItems(section) {
    var sensor = section.sensor;
    var unused = (sensor && sensor.attributes.unused_components) || [];
    var items = [];
    var unknown = 0;
    var estimated = 0;
    for (var i = 0; i < unused.length; i++) {
      var it = unused[i];
      var days = it.days_installed;
      if (days == null || days < 0) { unknown++; continue; }
      if (days <= this._window) {
        items.push(it);
        if (it.install_date_estimated) { estimated++; }
      }
    }
    items.sort(function(a, b) {
      var da = a.days_installed;
      var db = b.days_installed;
      if (da !== db) { return da - db; }
      // Same age: a date we actually watched beats one we guessed at.
      var ea = a.install_date_estimated ? 1 : 0;
      var eb = b.install_date_estimated ? 1 : 0;
      if (ea !== eb) { return ea - eb; }
      var na = (a.name || "").toLowerCase();
      var nb = (b.name || "").toLowerCase();
      return na < nb ? -1 : (na > nb ? 1 : 0);
    });
    return { items: items, unknown: unknown, estimated: estimated };
  }

  _render() {
    if (!this._hass) { return; }

    var allComponents = this._getSensor("sensor.hacs_installed_components");
    var lastScan = allComponents ? (allComponents.attributes.last_scan || "") : "";
    var datesSince = allComponents ? (allComponents.attributes.install_dates_since || "") : "";

    var sections = this._getVisibleSections();

    var totalRecent = 0;
    var totalUnknown = 0;
    var totalEstimated = 0;
    var sectionData = [];
    for (var i = 0; i < sections.length; i++) {
      var res = this._sectionItems(sections[i]);
      totalRecent += res.items.length;
      totalUnknown += res.unknown;
      totalEstimated += res.estimated;
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
    if (totalEstimated > 0) {
      footerBits.push(
        "~ estimated" +
        (datesSince ? (" &middot; exact dates from " + this._formatDate(datesSince)) : "")
      );
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
      ".item-days.est { font-style:italic; opacity:0.8; }",
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
    // A date the integration didn't watch happen — estimated from the files on
    // disk, which a HACS update rewrites. Marked rather than presented as fact.
    var estimated = !!item.install_date_estimated;
    var daysClass = estimated ? "item-days est" : "item-days";
    var daysTitle = estimated
      ? ' title="Estimated from the files on disk - a HACS update can reset this"'
      : "";
    if (estimated) { daysStr = "~" + daysStr; }
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
      '  <div class="' + daysClass + '"' + daysTitle + ">" + daysStr + "</div>",
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

  _formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString();
    } catch (e) {
      return iso;
    }
  }
}

/* ---------- Config Editor ----------
 *
 * Built on ha-form. See docs/specs/card-editor-ha-form.md for why, and the
 * matching block in custom-component-monitor-card.js - the three cards are
 * three separately cache-busted Lovelace resources, so the plumbing is
 * deliberately repeated per file rather than shared through a fourth one.
 */

var RIU_EDITOR_LABELS = {
  title: "Card title (optional)",
  days_window: "Only show items installed in the last",
  sections: "Sections to show",
};

var RIU_EDITOR_HELPERS = {
  title: 'Leave blank to use "' + RIU_TITLE + '".',
  days_window: "Anything installed longer ago than this drops off the card.",
};

var RIU_EDITOR_SCHEMA = [
  { name: "title", selector: { text: {} } },
  {
    name: "days_window",
    selector: { number: { min: 1, max: 365, step: 1, mode: "box", unit_of_measurement: "days" } },
  },
  {
    // A list of the same three strings, not three booleans - three toggles
    // would change the stored shape and break every existing dashboard.
    name: "sections",
    selector: { select: { multiple: true, mode: "list", options: [
      { value: "integrations", label: "Integrations" },
      { value: "themes", label: "Themes" },
      { value: "frontend", label: "Frontend cards" },
    ] } },
  },
];

/**
 * Force the frontend chunk that defines ha-form. `window.customElements` is
 * re-read on every call rather than captured: Home Assistant swaps it for a
 * scoped-registry polyfill while its core bundle boots, which is also why this
 * must never be `customElements.whenDefined()` at module top level.
 */
function _riuLoadHaComponents() {
  var registry = window.customElements;
  if (registry && !registry.get("ha-form")) {
    var tile = registry.get("hui-tile-card");
    if (tile && tile.getConfigElement) { tile.getConfigElement(); }
  }
}

function _riuSameValue(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.slice().sort().join(",") === b.slice().sort().join(",");
  }
  return a === b;
}

/** Drop anything the user did not actually choose. See _ccmPrune. */
function _riuPrune(config) {
  var out = Object.assign({}, config);
  if (out.title === "" || out.title == null) { delete out.title; }
  Object.keys(RIU_DEFAULTS).forEach(function (key) {
    if (key in out && _riuSameValue(out[key], RIU_DEFAULTS[key])) { delete out[key]; }
  });
  return out;
}

class RecentlyInstalledUnusedCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = _riu_migrateConfig(config);
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    _riuLoadHaComponents();
  }

  _formData() {
    var data = Object.assign({}, RIU_DEFAULTS, this._config);
    if (this._config.title == null) { data.title = ""; }
    return data;
  }

  _render() {
    if (!this._hass || !this._config) { return; }

    if (!this._form) {
      var form = document.createElement("ha-form");
      form.computeLabel = function (schema) {
        return RIU_EDITOR_LABELS[schema.name] || schema.name;
      };
      form.computeHelper = function (schema) {
        return RIU_EDITOR_HELPERS[schema.name] || "";
      };
      form.addEventListener("value-changed", this._onValueChanged.bind(this));
      this.appendChild(form);
      this._form = form;
    }

    this._form.hass = this._hass;
    this._form.schema = RIU_EDITOR_SCHEMA;
    this._form.data = this._formData();
  }

  _onValueChanged(event) {
    event.stopPropagation();
    // Still migrated on the way out: a config carrying the legacy title reaches
    // the form untouched, so without this it would be written straight back.
    var config = _riuPrune(_riu_migrateConfig(event.detail.value));
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: config },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get("recently-installed-unused-card-editor")) {
  customElements.define("recently-installed-unused-card-editor", RecentlyInstalledUnusedCardEditor);
}
if (!customElements.get("recently-installed-unused-card")) {
  customElements.define("recently-installed-unused-card", RecentlyInstalledUnusedCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "recently-installed-unused-card",
  name: "Recently installed but unused",
  description: "Shows HACS integrations, themes and cards installed recently that are still unused",
  preview: true
});

console.info(
  "%c RECENTLY-INSTALLED-UNUSED %c v" + CARD_VERSION + " ",
  "color: white; background: #ff9800; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #ff9800; background: #fff; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);
