/**
 * Update Action Tracker Card
 * Lists HACS integrations with pending updates and provides
 * Skip, Update, and Update & Action buttons.
 * v1.6.0
 */

const CARD_VERSION = "1.6.0";
const UAT_DOMAIN = "custom_component_monitor";

/* -- Helpers -------------------------------------------------- */

function uatEscapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = String(text);
  return el.innerHTML;
}

/* -- Editor Element ------------------------------------------- */

class UpdateActionTrackerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  get _title() {
    return this._config.title || "HACS Update Tracker";
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        .editor { padding: 16px; }
        .editor label { display: block; font-weight: 500; margin-bottom: 4px; }
        .editor input { width: 100%; padding: 8px; box-sizing: border-box;
                        border: 1px solid var(--divider-color, #ccc); border-radius: 4px; }
      </style>
      <div class="editor">
        <label>Title</label>
        <input type="text" id="title" value="${uatEscapeHtml(this._title)}" />
      </div>
    `;
    this.shadowRoot.querySelector("#title").addEventListener("input", (e) => {
      this._config = Object.assign({}, this._config, { title: e.target.value });
      const event = new CustomEvent("config-changed", { detail: { config: this._config } });
      this.dispatchEvent(event);
    });
  }
}
customElements.define("update-action-tracker-card-editor", UpdateActionTrackerCardEditor);

/* -- Main Card ------------------------------------------------ */

class UpdateActionTrackerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._hacsEntities = null;
    this._expandedEntity = null;
    this._releaseNotes = {};
    this._loadingNotes = {};
    this._actionInProgress = {};
    this._lastStateHash = "";
    this._progressPollTimer = null;
    this._typeFilter = "all"; // #69: filter updates by component type
  }

  /* -- Lovelace lifecycle ------------------------------------- */

  static getConfigElement() {
    return document.createElement("update-action-tracker-card-editor");
  }

  static getStubConfig() {
    return { title: "HACS Update Tracker" };
  }

  setConfig(config) {
    this._config = Object.assign({ title: "HACS Update Tracker" }, config);
    this._lastStateHash = "";
    if (config && config.default_filter) this._typeFilter = config.default_filter;
    if (this._hass) this._doRender();
  }

  set hass(hass) {
    this._hass = hass;
    const hash = this._computeStateHash();
    if (hash !== this._lastStateHash) {
      this._lastStateHash = hash;
      this._clearCompletedActions();
      this._doRender();
      this._manageProgressPoll();
    }
  }

  getCardSize() {
    return 4;
  }

  /* -- Data helpers -------------------------------------------- */

  _computeStateHash() {
    if (!this._hass) return "";
    const parts = [];
    for (const eid of Object.keys(this._hass.states)) {
      if (eid.startsWith("update.")) {
        const s = this._hass.states[eid];
        const prog = s.attributes.in_progress;
        // update_percentage drives the determinate progress bar (#66); include
        // it so percentage changes during an install trigger a re-render.
        parts.push(eid + "=" + s.state + "|" + (s.attributes.installed_version || "") + "|" + (s.attributes.latest_version || "") + "|" + String(prog) + "|" + String(s.attributes.update_percentage));
      }
    }
    return parts.sort().join("||");
  }

  _hasAnyInProgress() {
    if (!this._hass) return false;
    for (const eid of Object.keys(this._hass.states)) {
      if (eid.startsWith("update.")) {
        const prog = this._hass.states[eid].attributes.in_progress;
        if (prog !== false && prog !== undefined && prog !== null) return true;
      }
    }
    return Object.keys(this._actionInProgress).length > 0;
  }

  _manageProgressPoll() {
    if (this._hasAnyInProgress()) {
      if (!this._progressPollTimer) {
        this._progressPollTimer = setInterval(() => {
          if (this._hass) {
            const hash = this._computeStateHash();
            if (hash !== this._lastStateHash) {
              this._lastStateHash = hash;
              this._doRender();
            }
            if (!this._hasAnyInProgress()) {
              clearInterval(this._progressPollTimer);
              this._progressPollTimer = null;
            }
          }
        }, 1000);
      }
    } else if (this._progressPollTimer) {
      clearInterval(this._progressPollTimer);
      this._progressPollTimer = null;
    }
  }

  _clearCompletedActions() {
    for (const eid of Object.keys(this._actionInProgress)) {
      const s = this._hass.states[eid];
      if (!s || s.state !== "on") {
        delete this._actionInProgress[eid];
      }
    }
  }

  async _getHacsUpdateEntities() {
    if (!this._hass) return [];

    const updateEntities = [];
    for (const eid of Object.keys(this._hass.states)) {
      if (eid.startsWith("update.") && this._hass.states[eid].state === "on") {
        updateEntities.push(eid);
      }
    }
    if (updateEntities.length === 0) return [];

    if (this._hacsEntities === null) {
      try {
        const sources = await this._hass.callWS({ type: "entity/source" });
        this._hacsEntities = new Set();
        for (const [eid, info] of Object.entries(sources)) {
          if (info.domain === "hacs") {
            this._hacsEntities.add(eid);
          }
        }
      } catch (_err) {
        this._hacsEntities = new Set();
        for (const eid of updateEntities) {
          const pic = this._hass.states[eid].attributes.entity_picture || "";
          if (pic.includes("brands.home-assistant.io")) {
            this._hacsEntities.add(eid);
          }
        }
      }
    }
    const filtered = updateEntities.filter((eid) => this._hacsEntities.has(eid));
    // Sort alphabetically by display name, like native HACS (#69).
    filtered.sort((a, b) => {
      const na = (this._hass.states[a].attributes.friendly_name || a).toLowerCase();
      const nb = (this._hass.states[b].attributes.friendly_name || b).toLowerCase();
      return na.localeCompare(nb);
    });
    return filtered;
  }

  /* -- Type classification (#69) ------------------------------ */

  _repoKey(url) {
    const m = String(url || "").toLowerCase().match(/github\.com\/([^/]+\/[^/#?]+)/);
    return m ? m[1].replace(/\.git$/, "") : "";
  }

  _catOf(typeStr) {
    const t = String(typeStr || "").toLowerCase();
    if (t.includes("integration")) return "integration";
    if (t.includes("theme")) return "theme";
    if (t.includes("card") || t.includes("frontend") || t.includes("plugin") || t.includes("lovelace")) return "card";
    return "other";
  }

  // Build {repoKey|name -> category} from this integration's sensor.hacs_updates,
  // since the HACS update.* entities themselves carry no type/category.
  _buildTypeMap() {
    const byRepo = {}, byName = {};
    const s = this._hass.states["sensor.hacs_updates"];
    const updates = (s && s.attributes && s.attributes.updates) || [];
    for (const u of updates) {
      const cat = this._catOf(u.type);
      const rk = this._repoKey(u.repository);
      if (rk) byRepo[rk] = cat;
      if (u.name) byName[String(u.name).toLowerCase().trim()] = cat;
    }
    return { byRepo, byName };
  }

  _typeOf(entityId, map) {
    const a = (this._hass.states[entityId] || {}).attributes || {};
    const rk = this._repoKey(a.release_url);
    if (rk && map.byRepo[rk]) return map.byRepo[rk];
    const name = String(a.friendly_name || "").replace(/ update$/i, "").toLowerCase().trim();
    if (name && map.byName[name]) return map.byName[name];
    return "other";
  }

  /* -- Progress helper ---------------------------------------- */

  _getProgressInfo(entityId) {
    const state = this._hass.states[entityId];
    if (!state) return null;
    const prog = state.attributes.in_progress;
    // Modern HA reports the real percentage in update_percentage (in_progress
    // is just a boolean); older entities put the number in in_progress (#66).
    const pctAttr = state.attributes.update_percentage;
    const actionState = this._actionInProgress[entityId];

    if (typeof pctAttr === "number") {
      const pct = Math.min(100, Math.max(0, Math.round(pctAttr)));
      return { active: true, percent: pct, label: pct + "%" };
    }
    if (typeof prog === "number" && prog >= 0) {
      const pct = Math.min(100, Math.max(0, Math.round(prog)));
      return { active: true, percent: pct, label: pct + "%" };
    }
    if (prog === true || (actionState && prog !== false)) {
      return { active: true, percent: null, label: "Installing\u2026" };
    }
    if (actionState === "skip") {
      return { active: true, percent: null, label: "Skipping\u2026" };
    }
    if (actionState === "update" || actionState === "update_action") {
      return { active: true, percent: null, label: "Starting\u2026" };
    }
    return null;
  }

  /* -- Actions ------------------------------------------------ */

  async _handleSkip(entityId) {
    this._actionInProgress[entityId] = "skip";
    this._doRender();
    this._manageProgressPoll();
    try {
      await this._hass.callService("update", "skip", { entity_id: entityId });
    } catch (_err) {
      delete this._actionInProgress[entityId];
      this._doRender();
    }
  }

  async _handleUpdate(entityId) {
    this._actionInProgress[entityId] = "update";
    this._doRender();
    this._manageProgressPoll();
    try {
      await this._hass.callService("update", "install", { entity_id: entityId });
    } catch (_err) {
      delete this._actionInProgress[entityId];
      this._doRender();
    }
  }

  async _handleUpdateAndAction(entityId) {
    this._actionInProgress[entityId] = "update_action";
    this._doRender();
    this._manageProgressPoll();
    try {
      await this._hass.callService(UAT_DOMAIN, "update_and_action", { entity_id: entityId });
    } catch (_err) {
      delete this._actionInProgress[entityId];
      this._doRender();
    }
  }

  async _handleUpdateAll() {
    const entities = await this._getHacsUpdateEntities();
    if (!entities.length) return;
    if (!window.confirm(
      "Install all " + entities.length + " available HACS update" +
      (entities.length > 1 ? "s" : "") + " now?"
    )) return;
    // Mark each row in progress for immediate feedback.
    entities.forEach((eid) => { this._actionInProgress[eid] = "update"; });
    this._doRender();
    this._manageProgressPoll();
    try {
      await this._hass.callService(UAT_DOMAIN, "update_all", {});
    } catch (_err) {
      entities.forEach((eid) => { delete this._actionInProgress[eid]; });
      this._doRender();
    }
  }

  async _fetchReleaseNotes(entityId) {
    if (this._releaseNotes[entityId] || this._loadingNotes[entityId]) return;
    this._loadingNotes[entityId] = true;
    this._doRender();
    try {
      const result = await this._hass.callWS({
        type: "update/release_notes",
        entity_id: entityId,
      });
      this._releaseNotes[entityId] = result || "_No release notes available._";
    } catch (_err) {
      this._releaseNotes[entityId] = "_Could not load release notes._";
    }
    this._loadingNotes[entityId] = false;
    this._doRender();
  }

  _toggleExpand(entityId) {
    if (this._expandedEntity === entityId) {
      this._expandedEntity = null;
    } else {
      this._expandedEntity = entityId;
      this._fetchReleaseNotes(entityId);
    }
    this._doRender();
  }

  /* -- Rendering ---------------------------------------------- */

  async _doRender() {
    if (!this._hass) return;
    const entities = await this._getHacsUpdateEntities();
    const title = uatEscapeHtml(this._config.title || "HACS Update Tracker");

    /* Classify each update by component type for the filter chips (#69). */
    const typeMap = this._buildTypeMap();
    const cats = {};
    for (const eid of entities) {
      const c = this._typeOf(eid, typeMap);
      (cats[c] = cats[c] || []).push(eid);
    }
    const present = Object.keys(cats);
    // Drop a stale filter (e.g. the last item of that type just updated).
    if (this._typeFilter !== "all" && !present.includes(this._typeFilter)) {
      this._typeFilter = "all";
    }
    const shown = this._typeFilter === "all" ? entities : (cats[this._typeFilter] || []);

    let contentHtml;
    if (entities.length === 0) {
      contentHtml = '<div class="empty"><ha-icon icon="mdi:check-circle-outline"></ha-icon><span>All HACS integrations are up to date!</span></div>';
    } else if (shown.length === 0) {
      contentHtml = '<div class="empty"><span>No updates of this type.</span></div>';
    } else {
      contentHtml = shown.map((eid) => this._renderItem(eid)).join("");
    }

    /* Filter chips - only when there's more than one type to pick between. */
    let filtersHtml = "";
    if (entities.length > 0 && present.length > 1) {
      const labels = { integration: "Integrations", card: "Cards", theme: "Themes", other: "Other" };
      const order = ["integration", "card", "theme", "other"];
      const chip = (key, lbl, n) =>
        '<button class="chip' + (this._typeFilter === key ? " active" : "") + '" data-filter="' + key + '">' +
        uatEscapeHtml(lbl) + ' <span class="chip-count">' + n + "</span></button>";
      filtersHtml =
        '<div class="filters">' +
        chip("all", "All", entities.length) +
        order.filter((c) => present.includes(c))
             .map((c) => chip(c, labels[c] || c, cats[c].length))
             .join("") +
        "</div>";
    }

    const badgeClass = entities.length > 0 ? "pending" : "clean";
    const badgeText = entities.length > 0
      ? entities.length + " update" + (entities.length > 1 ? "s" : "")
      : "Up to date";

    this.shadowRoot.innerHTML =
      "<style>" + this._getStyles() + "</style>" +
      '<ha-card>' +
      '<div class="header">' +
      '<span class="title">' + title + '</span>' +
      '<span class="badge ' + badgeClass + '">' + badgeText + '</span>' +
      '</div>' +
      filtersHtml +
      (entities.length > 0
        ? '<div class="update-all-bar">' +
          '<button class="btn btn-update-all" data-action="update-all">' +
          'Update all (' + entities.length + ')</button></div>'
        : '') +
      '<div class="items">' + contentHtml + '</div>' +
      '</ha-card>';

    this._bindEvents();
  }

  _renderItem(entityId) {
    const state = this._hass.states[entityId];
    if (!state) return "";
    const attrs = state.attributes;
    const name = uatEscapeHtml(attrs.friendly_name || entityId).replace(/ update$/i, "");
    const installedVer = uatEscapeHtml(attrs.installed_version || "?");
    const latestVer = uatEscapeHtml(attrs.latest_version || "?");
    const picture = attrs.entity_picture || "";
    const releaseUrl = attrs.release_url || "";
    const isExpanded = this._expandedEntity === entityId;
    const progress = this._getProgressInfo(entityId);

    const pictureHtml = picture
      ? '<img class="entity-pic" src="' + uatEscapeHtml(picture) + '" alt="" />'
      : '<ha-icon class="entity-icon" icon="mdi:package-variant"></ha-icon>';

    let notesHtml = "";
    if (isExpanded) {
      if (this._loadingNotes[entityId]) {
        notesHtml = '<div class="notes"><div class="notes-loading">Loading release notes...</div></div>';
      } else if (this._releaseNotes[entityId]) {
        notesHtml = '<div class="notes"><div class="notes-content">' + this._renderMarkdown(this._releaseNotes[entityId]) + '</div></div>';
      }
    }

    /* Progress bar */
    let progressHtml = "";
    if (progress) {
      const barWidth = progress.percent !== null ? progress.percent + "%" : "100%";
      const barClass = progress.percent !== null ? "determinate" : "indeterminate";
      progressHtml =
        '<div class="progress-wrap">' +
        '<div class="progress-bar ' + barClass + '" style="width:' + barWidth + '"></div>' +
        '<span class="progress-label">' + uatEscapeHtml(progress.label) + '</span>' +
        '</div>';
    }

    const disableButtons = !!progress;
    const btnDisabled = disableButtons ? " disabled" : "";

    let html =
      '<div class="item' + (progress ? " updating" : "") + '" data-entity="' + entityId + '">' +
      '<div class="item-header" data-toggle="' + entityId + '">' +
      pictureHtml +
      '<div class="item-info">' +
      '<div class="item-name">' + name + '</div>' +
      '<div class="item-version">' + installedVer + ' \u2192 ' + latestVer + '</div>' +
      '</div>' +
      '<ha-icon class="expand-icon' + (isExpanded ? " open" : "") + '" icon="mdi:chevron-down"></ha-icon>' +
      '</div>';

    if (progressHtml) {
      html += progressHtml;
    }

    if (isExpanded) {
      html += notesHtml;
      if (releaseUrl) {
        html += '<div class="release-link"><a href="' + uatEscapeHtml(releaseUrl) + '" target="_blank" rel="noopener noreferrer">View on GitHub</a></div>';
      }
      html +=
        '<div class="actions">' +
        '<button class="btn btn-skip" data-action="skip" data-entity="' + entityId + '"' + btnDisabled + '>Skip</button>' +
        '<button class="btn btn-update" data-action="update" data-entity="' + entityId + '"' + btnDisabled + '>Update</button>' +
        '<button class="btn btn-action" data-action="update_action" data-entity="' + entityId + '"' + btnDisabled + '>Update & Action</button>' +
        '</div>';
    }

    html += '</div>';
    return html;
  }

  _renderMarkdown(text) {
    if (!text) return "";
    let html = uatEscapeHtml(text);

    /* Alerts (#68). Render before the line-based transforms so multi-line
       bodies survive. uatEscapeHtml escapes < > & but NOT quotes, so the
       real escaped form is &lt;ha-alert alert-type="warning"&gt;…&lt;/ha-alert&gt;. */
    const alertClass = (t) => {
      const k = String(t).toLowerCase();
      if (k === "warning") return "warning";
      if (k === "error" || k === "danger" || k === "caution") return "error";
      if (k === "success" || k === "tip") return "success";
      return "info"; // note, important, info, hint, default
    };
    // HA alert element (any/no quotes around the type, body may span lines).
    html = html.replace(
      /&lt;ha-alert\s+alert-type=["']?([a-zA-Z]+)["']?\s*&gt;([\s\S]*?)&lt;\/ha-alert&gt;/g,
      (_m, type, body) =>
        '<div class="ha-alert ha-alert-' + alertClass(type) + '">' +
        body.trim().replace(/\n/g, "<br>") + "</div>"
    );
    // GitHub-style alerts: > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
    html = html.replace(
      /(?:^|\n)&gt;\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][^\n]*\n((?:&gt;[^\n]*(?:\n|$))*)/g,
      (_m, type, body) => {
        const inner = body
          .split("\n")
          .map((l) => l.replace(/^&gt;\s?/, ""))
          .join("<br>")
          .replace(/(?:<br>)+$/, "")
          .trim();
        return '\n<div class="ha-alert ha-alert-' + alertClass(type) + '">' + inner + "</div>\n";
      }
    );

    /* Release notes often wrap content in layout-only HTML (e.g.
       <div align="center">). uatEscapeHtml turned those into &lt;div&gt;, which
       would show as literal tag text — strip them (the alert <div>s above use
       unescaped < so they're untouched). Keep <br> as a line break. */
    html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
    html = html.replace(
      /&lt;\/?(?:div|center|p|span|details|summary|figure|picture|sub|sup)\b[^&]*?&gt;/gi,
      ""
    );

    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/^---$/gm, "<hr />");
    html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    html = html.replace(/\n\n/g, "</p><p>");
    html = "<p>" + html + "</p>";
    html = html.replace(/<p>\s*<\/p>/g, "");
    html = html.replace(/<p>(<h[1-4]>)/g, "$1");
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, "$1");
    html = html.replace(/<p>(<hr \/>)<\/p>/g, "$1");
    html = html.replace(/<p>(<ul>)/g, "$1");
    html = html.replace(/(<\/ul>)<\/p>/g, "$1");
    html = html.replace(/<p>(<div class="ha-alert)/g, "$1");
    html = html.replace(/(<\/div>)<\/p>/g, "$1");
    return html;
  }

  _bindEvents() {
    const self = this;
    this.shadowRoot.querySelectorAll("[data-toggle]").forEach(function(el) {
      el.addEventListener("click", function(e) {
        e.stopPropagation();
        self._toggleExpand(el.getAttribute("data-toggle"));
      });
    });
    this.shadowRoot.querySelectorAll(".btn[data-action]").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const action = btn.getAttribute("data-action");
        const eid = btn.getAttribute("data-entity");
        if (action === "skip") self._handleSkip(eid);
        else if (action === "update") self._handleUpdate(eid);
        else if (action === "update_action") self._handleUpdateAndAction(eid);
        else if (action === "update-all") self._handleUpdateAll();
      });
    });
    this.shadowRoot.querySelectorAll(".chip[data-filter]").forEach(function(chip) {
      chip.addEventListener("click", function(e) {
        e.stopPropagation();
        self._typeFilter = chip.getAttribute("data-filter");
        self._doRender();
      });
    });
  }

  /* -- Styles ------------------------------------------------- */

  _getStyles() {
    return [
      ":host {",
      "  --uat-primary: var(--primary-text-color, #212121);",
      "  --uat-secondary: var(--secondary-text-color, #727272);",
      "  --uat-accent: var(--primary-color, #03a9f4);",
      "  --uat-divider: var(--divider-color, rgba(0,0,0,0.12));",
      "  --uat-green: var(--label-badge-green, #4caf50);",
      "  --uat-orange: var(--label-badge-yellow, #ff9800);",
      "}",
      "ha-card { padding: 16px; }",
      ".header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }",
      ".title { font-size:1.1em; font-weight:500; color:var(--uat-primary); }",
      ".badge { font-size:0.8em; padding:2px 10px; border-radius:12px; font-weight:500; color:#fff; }",
      ".badge.clean { background:var(--uat-green); }",
      ".badge.pending { background:var(--uat-orange); }",
      ".filters { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }",
      ".chip { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:14px; cursor:pointer; font-size:0.82em; font-family:inherit; color:var(--uat-secondary); background:var(--uat-row-bg, rgba(127,127,127,0.08)); border:1px solid var(--divider-color, rgba(127,127,127,0.2)); }",
      ".chip:hover { background:var(--uat-row-hover, rgba(127,127,127,0.16)); }",
      ".chip.active { background:var(--primary-color, #03a9f4); color:#fff; border-color:var(--primary-color, #03a9f4); }",
      ".chip-count { font-size:0.85em; opacity:0.85; }",
      ".empty { display:flex; align-items:center; gap:8px; padding:16px 0; color:var(--uat-secondary); font-style:italic; }",
      ".empty ha-icon { --mdc-icon-size:24px; color:var(--uat-green); }",
      ".item { border-bottom:1px solid var(--uat-divider); }",
      ".item:last-child { border-bottom:none; }",
      ".item.updating { opacity:0.85; }",
      ".item-header { display:flex; align-items:center; gap:12px; padding:12px 0; cursor:pointer; user-select:none; }",
      ".item-header:hover { opacity:0.85; }",
      ".entity-pic { width:40px; height:40px; border-radius:8px; object-fit:contain; background:var(--uat-divider); flex-shrink:0; }",
      ".entity-icon { --mdc-icon-size:28px; color:var(--uat-secondary); flex-shrink:0; width:40px; display:flex; align-items:center; justify-content:center; }",
      ".item-info { flex:1; min-width:0; }",
      ".item-name { font-size:0.95em; font-weight:500; color:var(--uat-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
      ".item-version { font-size:0.8em; color:var(--uat-secondary); margin-top:2px; }",
      ".expand-icon { --mdc-icon-size:20px; color:var(--uat-secondary); transition:transform 0.2s ease; flex-shrink:0; }",
      ".expand-icon.open { transform:rotate(180deg); }",
      /* Progress bar styles */
      ".progress-wrap { position:relative; margin:0 0 8px 52px; height:20px; background:var(--uat-divider); border-radius:10px; overflow:hidden; }",
      ".progress-bar { height:100%; border-radius:10px; transition:width 0.3s ease; }",
      ".progress-bar.determinate { background:var(--uat-accent); }",
      ".progress-bar.indeterminate { background:linear-gradient(90deg, var(--uat-accent), var(--uat-green)); animation:uat-pulse 1.5s ease-in-out infinite; }",
      "@keyframes uat-pulse { 0%{opacity:0.6;width:30%} 50%{opacity:1;width:70%} 100%{opacity:0.6;width:30%} }",
      ".progress-label { position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; font-size:0.75em; font-weight:600; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); }",
      /* Notes */
      ".notes { padding:8px 12px; margin:0 0 8px 52px; background:var(--uat-divider); border-radius:8px; max-height:300px; overflow-y:auto; }",
      ".notes-loading { color:var(--uat-secondary); font-style:italic; font-size:0.85em; padding:8px 0; }",
      ".notes-content { font-size:0.85em; line-height:1.5; color:var(--uat-primary); }",
      ".notes-content h1 { font-size:1.1em; margin:8px 0 4px; }",
      ".notes-content h2 { font-size:1.05em; margin:8px 0 4px; }",
      ".notes-content h3 { font-size:1em; margin:6px 0 4px; }",
      ".notes-content h4 { font-size:0.95em; margin:6px 0 4px; }",
      ".notes-content ul { padding-left:20px; margin:4px 0; }",
      ".notes-content li { margin:2px 0; }",
      ".notes-content code { background:rgba(0,0,0,0.08); padding:1px 4px; border-radius:3px; font-size:0.9em; }",
      ".notes-content hr { border:none; border-top:1px solid var(--uat-divider); margin:12px 0; }",
      ".notes-content a { color:var(--uat-accent); text-decoration:none; }",
      ".notes-content .ha-alert { padding:8px 12px; border-radius:4px; margin:8px 0; font-size:0.9em; }",
      ".notes-content .ha-alert-warning { background:rgba(255,152,0,0.15); border-left:3px solid var(--uat-orange); }",
      ".notes-content .ha-alert-error { background:rgba(244,67,54,0.15); border-left:3px solid #f44336; }",
      ".notes-content .ha-alert-info { background:rgba(3,155,229,0.15); border-left:3px solid #039be5; }",
      ".notes-content .ha-alert-success { background:rgba(76,175,80,0.15); border-left:3px solid #4caf50; }",
      ".release-link { margin:0 0 8px 52px; font-size:0.8em; }",
      ".release-link a { color:var(--uat-accent); text-decoration:none; }",
      ".release-link a:hover { text-decoration:underline; }",
      ".actions { display:flex; gap:8px; padding:0 0 12px; margin-left:52px; }",
      ".btn { border:none; border-radius:8px; padding:8px 16px; font-size:0.85em; font-weight:500; cursor:pointer; transition:opacity 0.15s; color:#fff; }",
      ".btn:hover:not(:disabled) { opacity:0.85; }",
      ".btn:disabled { opacity:0.5; cursor:not-allowed; }",
      ".btn-skip { background:var(--uat-secondary); }",
      ".btn-update { background:var(--uat-accent); }",
      ".btn-action { background:var(--uat-green); }",
      ".update-all-bar { display:flex; justify-content:flex-end; margin-bottom:12px; }",
      ".btn-update-all { background:var(--uat-green); font-weight:600; }",
    ].join("\n");
  }
}

customElements.define("update-action-tracker-card", UpdateActionTrackerCard);

console.info(
  "%c UPDATE-ACTION-TRACKER %c v" + CARD_VERSION + " ",
  "color: white; background: #4caf50; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #4caf50; background: #e8f5e9; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "update-action-tracker-card",
  name: "HACS Update Action Tracker",
  description: "Track HACS updates with Skip, Update, and Update & Action buttons.",
  preview: true,
});
