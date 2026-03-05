// HACA-BUILD: 6052f562  2026-03-04T17:15:58Z
// ── config_tab.js ──────────────────────────────────────────
// ── config_tab.js ─────────────────────────────────────────────────────────
// Onglet Configuration du panel HACA
// Remplace le flux d'options HA natif (config/integrations)
// Inclut les exclusions par type d'issue (granularité fine)
// ──────────────────────────────────────────────────────────────────────────

/**
 * All issue types grouped by category. Labels are loaded from JSON (issue_types.*).
 * label = resolved from JSON translation key: issue_types.categories.<id> / issue_types.types.<id>
 * fixable = true if auto-repairable via HA Repairs.
 */
var ISSUE_TYPES_BY_CATEGORY = [
  {
    id: 'automations', icon: 'mdi:robot',
    types: [
      { id: 'device_id_in_trigger',              fixable: true  },
      { id: 'device_trigger_platform',            fixable: true  },
      { id: 'device_id_in_condition',             fixable: true  },
      { id: 'device_condition_platform',          fixable: true  },
      { id: 'device_id_in_action',                fixable: true  },
      { id: 'device_id_in_target',                fixable: true  },
      { id: 'template_simple_state',              fixable: true  },
      { id: 'incorrect_mode_motion_single',       fixable: true  },
      { id: 'deprecated_service',                 fixable: false },
      { id: 'unknown_service',                    fixable: false },
      { id: 'no_description',                     fixable: false },
      { id: 'no_alias',                           fixable: false },
      { id: 'duplicate_automation',               fixable: false },
      { id: 'probable_duplicate_automation',      fixable: false },
      { id: 'ghost_automation',                   fixable: false },
      { id: 'never_triggered',                    fixable: false },
      { id: 'excessive_delay',                    fixable: false },
      { id: 'wait_template_vs_wait_for_trigger',  fixable: false },
      { id: 'zone_no_entity',                     fixable: false },
      { id: 'unknown_area_reference',             fixable: false },
      { id: 'unknown_floor_reference',            fixable: false },
      { id: 'unknown_label_reference',            fixable: false },
      { id: 'template_numeric_comparison',        fixable: false },
      { id: 'template_time_check',                fixable: false },
    ]
  },
  {
    id: 'entities', icon: 'mdi:tag-multiple',
    types: [
      { id: 'zombie_entity',           fixable: true  },
      { id: 'broken_device_reference', fixable: true  },
      { id: 'unavailable_entity',      fixable: false },
      { id: 'unknown_state',           fixable: false },
      { id: 'stale_entity',            fixable: false },
      { id: 'disabled_but_referenced', fixable: false },
      { id: 'ghost_registry_entry',    fixable: true  },
      { id: 'unused_input_boolean',    fixable: false },
    ]
  },
  {
    id: 'security', icon: 'mdi:shield-alert',
    types: [
      { id: 'hardcoded_secret',         fixable: false },
      { id: 'sensitive_data_exposure',  fixable: false },
    ]
  },
  {
    id: 'performance', icon: 'mdi:speedometer',
    types: [
      { id: 'high_complexity_actions',          fixable: false },
      { id: 'high_parallel_max',                fixable: false },
      { id: 'potential_self_loop',              fixable: false },
      { id: 'missing_state_class',              fixable: false },
      { id: 'expensive_template_selectattr',    fixable: false },
      { id: 'expensive_template_states_all',    fixable: false },
    ]
  },
  {
    id: 'blueprints', icon: 'mdi:file-document-outline',
    types: [
      { id: 'blueprint_missing_path',   fixable: false },
      { id: 'blueprint_file_not_found', fixable: false },
      { id: 'blueprint_empty_input',    fixable: false },
      { id: 'blueprint_no_inputs',      fixable: false },
    ]
  },
  {
    id: 'dashboards', icon: 'mdi:view-dashboard',
    types: [
      { id: 'dashboard_missing_entity', fixable: false },
    ]
  },
];

// ─── Rendering ────────────────────────────────────────────────────────────

function renderConfigTab(options, lang, t) {
  // t() is the translation function passed from the panel component
  if (!t) t = (key) => key; // fallback: return key as-is
  lang = lang || 'en';
  var excludedTypes = new Set(options.excluded_issue_types || []);

  var categorySections = ISSUE_TYPES_BY_CATEGORY.map(function (cat) {
    var label = t('issue_types.categories.' + cat.id);

    var typeRows = cat.types.map(function (tp) {
      var enabled = !excludedTypes.has(tp.id);
      var tpLabel = t('issue_types.types.' + tp.id);
      var fixBadge = tp.fixable
        ? '<span class="cfg-badge cfg-badge-fix">' + t('config.auto_fixable') + '</span>'
        : '';
      return '<label class="cfg-type-row' + (enabled ? '' : ' disabled') + '" data-type="' + tp.id + '">' +
        '<span class="cfg-type-label">' + tpLabel + fixBadge + '</span>' +
        '<label class="cfg-toggle cfg-toggle-sm">' +
        '<input type="checkbox" class="cfg-type-toggle" data-type="' + tp.id + '"' + (enabled ? ' checked' : '') + '>' +
        '<span class="cfg-toggle-slider"></span>' +
        '</label>' +
        '</label>';
    }).join('');

    return '<div class="cfg-cat-section">' +
      '<div class="cfg-cat-section-header">' +
      '<div class="cfg-cat-header-left">' +
      '<ha-icon icon="' + cat.icon + '" style="--mdc-icon-size:18px;color:var(--primary-color);"></ha-icon>' +
      '<span class="cfg-cat-section-title">' + label + '</span>' +
      '<span class="cfg-cat-count" id="count-' + cat.id + '"></span>' +
      '</div>' +
      '<div class="cfg-cat-header-actions">' +
      '<button class="cfg-cat-all-btn" data-cat="' + cat.id + '" data-action="enable">' + t('config.enable_all') + '</button>' +
      '<button class="cfg-cat-all-btn" data-cat="' + cat.id + '" data-action="disable">' + t('config.disable_all') + '</button>' +
      '</div>' +
      '</div>' +
      '<div class="cfg-type-list" id="types-' + cat.id + '">' + typeRows + '</div>' +
      '</div>';
  }).join('');

  return '<div class="cfg-root">' +

    // ── Header ──
    '<div class="cfg-header">' +
    '<ha-icon icon="mdi:cog" style="--mdc-icon-size:28px;color:var(--primary-color);"></ha-icon>' +
    '<div>' +
    '<div class="cfg-header-title">' + t('config.title') + '</div>' +
    '<div class="cfg-header-sub">' + t('config.general_settings_sub') + '</div>' +
    '</div>' +
    '</div>' +

    // ── Section : Scan ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title"><ha-icon icon="mdi:magnify-scan" style="--mdc-icon-size:18px;"></ha-icon>' + t('config.automatic_scan') + '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.scan_interval_minutes') + '</span><span class="cfg-row-hint">5 – 1440 min</span></div>' +
    '<input type="number" id="cfg-scan-interval" class="cfg-input" min="5" max="1440" value="' + (options.scan_interval || 60) + '">' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.startup_delay') + '</span><span class="cfg-row-hint">0 – 300 s</span></div>' +
    '<input type="number" id="cfg-startup-delay" class="cfg-input" min="0" max="300" value="' + (options.startup_delay_seconds || 60) + '">' +
    '</div>' +
    '</div>' +

    // ── Section : Événements ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title"><ha-icon icon="mdi:bell-ring-outline" style="--mdc-icon-size:18px;"></ha-icon>' + t('config.event_monitoring') + '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.active_monitoring') + '</span><span class="cfg-row-hint">' + t('config.auto_rescan_after_changes') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-event-monitoring"' + (options.event_monitoring_enabled !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '<div class="cfg-row" id="cfg-debounce-row">' +
    '<div class="cfg-row-label"><span>' + t('config.debounce_delay') + '</span><span class="cfg-row-hint">5 – 300 s</span></div>' +
    '<input type="number" id="cfg-event-debounce" class="cfg-input" min="5" max="300" value="' + (options.event_debounce_seconds || 30) + '">' +
    '</div>' +
    '</div>' +

    // ── Section : Types d'issues ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title">' +
    '<ha-icon icon="mdi:checkbox-multiple-marked-outline" style="--mdc-icon-size:18px;"></ha-icon>' +
    t('config.issue_types') +
    '</div>' +
    '<div class="cfg-section-hint">' +
    t('config.issue_types_hint') +
    '</div>' +
    '<div class="cfg-categories-root">' + categorySections + '</div>' +
    '</div>' +

    // ── Section : Batteries ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title"><ha-icon icon="mdi:battery" style="--mdc-icon-size:18px;"></ha-icon>' + t('config.battery_thresholds') + '</div>' +
    '<div class="cfg-row"><div class="cfg-row-label"><span>🔴 ' + t('config.battery_critical') + '</span></div><input type="number" id="cfg-battery-critical" class="cfg-input" min="1" max="50" value="' + (options.battery_critical || 5) + '"></div>' +
    '<div class="cfg-row"><div class="cfg-row-label"><span>🟠 ' + t('config.battery_low') + '</span></div><input type="number" id="cfg-battery-low" class="cfg-input" min="5" max="50" value="' + (options.battery_low || 15) + '"></div>' +
    '<div class="cfg-row"><div class="cfg-row-label"><span>🟡 ' + t('config.battery_warning') + '</span></div><input type="number" id="cfg-battery-warning" class="cfg-input" min="10" max="75" value="' + (options.battery_warning || 25) + '"></div>' +
    '</div>' +

    // ── Section : Historique ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title"><ha-icon icon="mdi:history" style="--mdc-icon-size:18px;"></ha-icon>' + t('config.history_backups') + '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.history_retention') + '</span><span class="cfg-row-hint">30 – 730</span></div>' +
    '<input type="number" id="cfg-history-retention" class="cfg-input" min="30" max="730" value="' + (options.history_retention_days || 365) + '">' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.auto_backup') + '</span><span class="cfg-row-hint">' + t('config.recommended') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-backup-enabled"' + (options.backup_enabled !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '</div>' +

    // ── Section Diagnostics & Logs ──
    '<div class="cfg-section" style="margin-top:4px;">' +
    '<div class="cfg-section-title"><ha-icon icon="mdi:bug" style="--mdc-icon-size:18px;color:var(--warning-color,#ffa726);"></ha-icon>' + t('config.diagnostics_logs') + '</div>' +
    '<div class="cfg-row" style="align-items:flex-start;">' +
    '<div class="cfg-row-label">' +
    '<span>' + t('config.debug_mode') + '</span>' +
    '<span class="cfg-row-hint">' + t('config.detailed_logs') + '</span>' +
    '</div>' +
    '<label class="cfg-toggle">' +
    '<input type="checkbox" id="cfg-debug-toggle">' +
    '<span class="cfg-toggle-slider"></span>' +
    '</label>' +
    '</div>' +
    '<div style="margin-top:12px;padding:10px 14px;background:var(--secondary-background-color);border-radius:8px;font-size:11px;color:var(--secondary-text-color);line-height:1.9;">' +
    t('config.filter_in_ha_logs') + ' <code>custom_components.config_auditor</code><br>' +
    t('config.persist_hint') + ' <code>configuration.yaml</code> :<br>' +
    '<code style="display:block;margin-top:4px;padding:6px 8px;background:rgba(0,0,0,0.1);border-radius:4px;white-space:pre;">logger:\n  logs:\n    custom_components.config_auditor: debug</code>' +
    '</div>' +
    '</div>' +

    // ── Boutons ──
    '<div class="cfg-actions">' +
    `
      <div class="cfg-section" style="padding:16px 20px;">
        <div class="cfg-section-title"><ha-icon icon="mdi:label-off-outline" style="--mdc-icon-size:18px;"></ha-icon>${t('config.haca_ignore_title')}</div>
        <div class="cfg-row-hint" style="margin-top:8px;line-height:1.6;">${t('config.haca_ignore_info')}</div>
        <div class="cfg-row-hint" style="margin-top:6px;">
          <code style="background:var(--code-background-color,rgba(0,0,0,0.1));padding:2px 6px;border-radius:4px;">haca_ignore</code>
        </div>
      </div>
      ` +
      '<button class="cfg-btn cfg-btn-secondary" id="cfg-reset-btn"><ha-icon icon="mdi:restore" style="--mdc-icon-size:18px;"></ha-icon>' + t('config.reset') + '</button>' +
    '<button class="cfg-btn cfg-btn-primary" id="cfg-save-btn"><ha-icon icon="mdi:content-save" style="--mdc-icon-size:18px;"></ha-icon>' + t('config.save') + '</button>' +
    '</div>' +
    '<div id="cfg-save-status" class="cfg-save-status" style="display:none;"></div>' +
    '</div>';
}

// ─── CSS ──────────────────────────────────────────────────────────────────

var CONFIG_TAB_CSS = `
  .cfg-root { max-width: 860px; margin: 0 auto; padding: 24px 20px 48px; display: flex; flex-direction: column; gap: 20px; }
  .cfg-header { display: flex; align-items: center; gap: 16px; padding: 20px 24px; background: var(--card-background-color); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .cfg-header-title { font-size: 1.2em; font-weight: 700; color: var(--primary-text-color); }
  .cfg-header-sub { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 2px; }
  .cfg-section { background: var(--card-background-color); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
  .cfg-section-title { display: flex; align-items: center; gap: 8px; padding: 16px 20px 12px; font-weight: 700; font-size: 0.9em; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--divider-color); }
  .cfg-section-hint { font-size: 0.82em; color: var(--secondary-text-color); padding: 10px 20px; background: rgba(var(--rgb-primary-color,33,150,243),0.04); border-bottom: 1px solid var(--divider-color); line-height: 1.5; }
  .cfg-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; gap: 16px; border-bottom: 1px solid var(--divider-color); }
  .cfg-row:last-child { border-bottom: none; }
  .cfg-row-label { display: flex; flex-direction: column; gap: 3px; flex: 1; }
  .cfg-row-label > span:first-child { font-size: 0.92em; color: var(--primary-text-color); }
  .cfg-row-hint { font-size: 0.78em; color: var(--secondary-text-color); }
  .cfg-input { width: 90px; padding: 8px 12px; border: 1.5px solid var(--divider-color); border-radius: 8px; background: var(--primary-background-color); color: var(--primary-text-color); font-size: 0.9em; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .cfg-input:focus { outline: none; border-color: var(--primary-color); }
  .cfg-toggle { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; cursor: pointer; }
  .cfg-toggle-sm { width: 40px; height: 22px; }
  .cfg-toggle input { opacity: 0; width: 0; height: 0; }
  .cfg-toggle-slider { position: absolute; inset: 0; background: var(--disabled-text-color,#bbb); border-radius: 26px; transition: 0.25s; }
  .cfg-toggle-slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.25); }
  .cfg-toggle-sm .cfg-toggle-slider::before { height: 16px; width: 16px; left: 3px; bottom: 3px; }
  .cfg-toggle input:checked + .cfg-toggle-slider { background: var(--primary-color); }
  .cfg-toggle input:checked + .cfg-toggle-slider::before { transform: translateX(22px); }
  .cfg-toggle-sm input:checked + .cfg-toggle-slider::before { transform: translateX(18px); }
  /* ── Issue type list ── */
  .cfg-categories-root { padding: 0 0 8px; }
  .cfg-cat-section { border-bottom: 1px solid var(--divider-color); }
  .cfg-cat-section:last-child { border-bottom: none; }
  .cfg-cat-section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(var(--rgb-primary-color,33,150,243),0.04); cursor: pointer; }
  .cfg-cat-header-left { display: flex; align-items: center; gap: 10px; }
  .cfg-cat-section-title { font-weight: 700; font-size: 0.88em; color: var(--primary-text-color); }
  .cfg-cat-count { font-size: 0.78em; color: var(--secondary-text-color); margin-left: 4px; }
  .cfg-cat-header-actions { display: flex; gap: 6px; }
  .cfg-cat-all-btn { font-size: 0.75em; padding: 3px 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--secondary-text-color); cursor: pointer; }
  .cfg-cat-all-btn:hover { background: var(--primary-background-color); color: var(--primary-text-color); }
  .cfg-type-list { display: flex; flex-direction: column; }
  .cfg-type-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 20px 9px 32px; gap: 12px; border-bottom: 1px solid var(--divider-color); transition: background 0.15s; cursor: default; }
  .cfg-type-row:last-child { border-bottom: none; }
  .cfg-type-row.disabled { opacity: 0.45; background: rgba(0,0,0,0.015); }
  .cfg-type-row:hover { background: rgba(var(--rgb-primary-color,33,150,243),0.03); }
  .cfg-type-label { font-size: 0.85em; color: var(--primary-text-color); flex: 1; }
  .cfg-badge { font-size: 0.72em; padding: 1px 6px; border-radius: 3px; margin-left: 6px; font-weight: 600; vertical-align: middle; }
  .cfg-badge-fix { background: rgba(34,197,94,0.15); color: #15803d; border: 1px solid rgba(34,197,94,0.4); }
  /* ── Actions ── */
  .cfg-actions { display: flex; gap: 12px; justify-content: flex-end; padding: 8px 0; }
  .cfg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s, transform 0.1s; }
  .cfg-btn:active { transform: scale(0.97); }
  .cfg-btn-primary { background: var(--primary-color); color: white; border-color: transparent; }
  .cfg-btn-primary:hover { background: var(--primary-color); color: white; filter: brightness(1.1); border-color: transparent; }
  .cfg-btn-secondary { background: var(--card-background-color); color: var(--primary-text-color); border: 1.5px solid var(--divider-color); }
  .cfg-btn-secondary:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }
  .cfg-save-status { padding: 12px 20px; border-radius: 8px; font-size: 0.88em; font-weight: 500; text-align: center; animation: fadeIn 0.2s ease-out; }
  .cfg-save-status.success { background: rgba(34,197,94,0.15); color: #15803d; border: 1px solid rgba(34,197,94,0.3); }
  .cfg-save-status.error { background: rgba(239,68,68,0.12); color: #dc2626; border: 1px solid rgba(239,68,68,0.3); }
`;

// ─── Defaults ─────────────────────────────────────────────────────────────

var DEFAULT_OPTIONS = {
  scan_interval: 60,
  startup_delay_seconds: 60,
  event_monitoring_enabled: true,
  event_debounce_seconds: 30,
  excluded_issue_types: [],
  battery_critical: 5,
  battery_low: 15,
  battery_warning: 25,
  history_retention_days: 365,
  backup_enabled: true,
};

// ─── Collecte des valeurs ─────────────────────────────────────────────────

function collectFormOptions(root) {
  var q = function (sel) { return root.querySelector(sel); };
  var num = function (sel, def) { var el = q(sel); return el ? (parseInt(el.value, 10) || def) : def; };
  var bool = function (sel, def) { var el = q(sel); return el ? el.checked : def; };

  // Types exclus = ceux dont la checkbox est décochée
  var excluded = [];
  var checkboxes = root.querySelectorAll('.cfg-type-toggle');
  for (var i = 0; i < checkboxes.length; i++) {
    if (!checkboxes[i].checked) excluded.push(checkboxes[i].dataset.type);
  }

  return {
    scan_interval: num('#cfg-scan-interval', 60),
    startup_delay_seconds: num('#cfg-startup-delay', 60),
    event_monitoring_enabled: bool('#cfg-event-monitoring', true),
    event_debounce_seconds: num('#cfg-event-debounce', 30),
    excluded_issue_types: excluded,
    battery_critical: num('#cfg-battery-critical', 5),
    battery_low: num('#cfg-battery-low', 15),
    battery_warning: num('#cfg-battery-warning', 25),
    history_retention_days: num('#cfg-history-retention', 365),
    backup_enabled: bool('#cfg-backup-enabled', true),
    debug_mode: bool('#cfg-debug-toggle', false),
  };
}

// ─── Helper : mise à jour des compteurs ──────────────────────────────────

function _updateTypeCounts(el) {
  ISSUE_TYPES_BY_CATEGORY.forEach(function (cat) {
    var list = el.querySelector('#types-' + cat.id);
    if (!list) return;
    var toggles = list.querySelectorAll('.cfg-type-toggle');
    var enabled = 0;
    toggles.forEach(function (cb) { if (cb.checked) enabled++; });
    var countEl = el.querySelector('#count-' + cat.id);
    if (countEl) countEl.textContent = '(' + enabled + '/' + toggles.length + ')';
  });
}

// ── core.js ──────────────────────────────────────────
(function () {
  'use strict';
  if (customElements.get('haca-panel')) return; // already loaded, skip entirely

  // Cache partagé entre toutes les instances de haca-panel (survive les navigations HA).
  // HA recrée l'élément à chaque navigation → les propriétés d'instance sont perdues.
  // Ce cache module-level évite tout écran de chargement lors des navigations suivantes.
  const _HC = { data: null, translations: null, language: null, pagination: {} };


  class HacaPanel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._translations = {};
      this._lastConnection = null; // tracks WS connection object to detect reconnects
      this._language = 'en';
      // English as default fallback

      // ── Boot splash: shown immediately so the user never sees a blank page ──
      // Displayed as soon as the element is created (before any data loads).
      // Removed once the first successful loadData() call completes.
      this._showBootSplash();
    }

    // Get translation from JSON — no hardcoded fallbacks
    t(key, params = {}) {
      const keys = key.split('.');
      let value = this._translations;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // key missing from JSON
        }
      }
      if (typeof value === 'string') {
        for (const [param, val] of Object.entries(params)) {
          value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
        }
      }
      return value || key;
    }

    // ── Cycle de vie du WebComponent ─────────────────────────────────────────

    connectedCallback() {
      // Lancé quand l'élément est inséré dans le DOM (navigation vers le panel)
      this._connected = true;

      // ── Garde globale contre les Promise rejections non capturées ────────
      // Empêche Chrome/Firefox d'afficher une page blanche sur une erreur async
      // (ex: "Subscription not found" lors d'une reconnexion WebSocket).
      if (!this._rejectionHandler) {
        this._rejectionHandler = (event) => {
          const reason = event.reason;
          const msg = reason?.message || String(reason);
          // Ne pas avaler les erreurs importantes, seulement les erreurs HA-WS connues
          if (msg.includes('Subscription not found') ||
              msg.includes('not_found') ||
              msg.includes('Connection lost') ||
              msg.includes('Lost connection')) {
            event.preventDefault(); // évite la propagation vers la console comme "Uncaught"
            console.debug('[HACA] WS subscription stale (reconnect in progress):', msg);
            // Réinitialiser l'état des souscriptions pour le prochain set hass()
            this._unsubNewIssues = null;
          }
        };
        window.addEventListener('unhandledrejection', this._rejectionHandler);
      }
      if (this._fullyReady) {
        // Panel déjà initialisé — on rafraîchit les données et on relance l'auto-refresh
        // Réinitialiser les gardes pour que le refresh reparte proprement
        this._dataLoading = false;
        this._dataErrorCount = 0;
        this._applyCachedData();
        this._startAutoRefresh();
        this.loadData();
      }
    }

    disconnectedCallback() {
      // Lancé quand l'élément est retiré du DOM (navigation hors du panel)
      this._connected = false;
      this._stopAutoRefresh();

      // Retirer le handler de rejections non capturées
      if (this._rejectionHandler) {
        window.removeEventListener('unhandledrejection', this._rejectionHandler);
        this._rejectionHandler = null;
      }

      // ── Stopper la simulation D3 (évite des dizaines de requestAnimationFrame zombies)
      if (typeof this._graphStopAll === 'function') this._graphStopAll();

      // ── Désabonner l'event subscription HACA (évite les callbacks sur élément détaché)
      if (this._unsubNewIssues) {
        try { this._unsubNewIssues(); } catch (_) { }
        this._unsubNewIssues = null;
      }
      // Cancel boot retry loop on disconnect
      if (this._bootRetryTimer) {
        clearInterval(this._bootRetryTimer);
        this._bootRetryTimer = null;
      }
    }

    set panel(panelInfo) {
      this._panel = panelInfo;
      // set panel() n'est appelé qu'une seule fois par HA — on déclenche l'init complète
      if (!this._initialized) {
        this._initialized = true;
        this._boot();
      }
    }

    set hass(hass) {
      const wasNull = !this._hass;
      this._hass = hass;
      // set hass() est appelé par HA à CHAQUE changement d'état → ne jamais appeler render() ici.
      // On l'utilise uniquement pour débloquer l'init si hass arrive après set panel().
      if (wasNull && this._initialized && !this._fullyReady) {
        this._boot();
      }

      // ── Détection de reconnexion WebSocket ───────────────────────────────
      // Quand HA reconnecte, hass.connection est un NOUVEL objet.
      // Les anciennes souscriptions (IDs) sont invalides sur la nouvelle connexion.
      // → Invalider _unsubNewIssues sans l'appeler (conn morte) et réécouter.
      if (hass?.connection && hass.connection !== this._lastConnection) {
        this._lastConnection = hass.connection;
        // Invalider l'ancienne souscription sans l'appeler (connexion morte)
        this._unsubNewIssues = null;
        // Réécouter sur la nouvelle connexion
        if (this._fullyReady) {
          this._subscribeToNewIssues();
          // Recharger les données après reconnexion
          this.loadData();
        }
      }
    }

    get hass() {
      return this._hass;
    }

    // ── Boot overlay ─────────────────────────────────────────────────────────
    // Affiche un écran de chargement propre pendant le démarrage de HA ou la
    // reconnexion WebSocket. Évite la page blanche perçue par l'utilisateur.



    _showReconnectBanner() {
      // Bannière discrète EN HAUT du panel uniquement — ne couvre JAMAIS la sidebar HA
      let banner = this.shadowRoot.querySelector('#haca-reconnect-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'haca-reconnect-banner';
        banner.style.cssText = [
          'padding:10px 20px', 'text-align:center',
          'background:var(--warning-color,#ffa726)', 'color:#fff',
          'font-size:13px', 'font-weight:500',
          'position:sticky', 'top:0', 'z-index:100',
          'border-radius:8px', 'margin-bottom:8px',
        ].join(';');
        banner.textContent = this.t('misc.reconnecting');
        const container = this.shadowRoot.querySelector('.container');
        if (container) container.prepend(banner);
        else this.shadowRoot.appendChild(banner);
      }
    }

    _hideReconnectBanner() {
      const banner = this.shadowRoot.querySelector('#haca-reconnect-banner');
      if (banner) banner.remove();
    }

    // ── Boot splash (full panel overlay while HACA backend is not yet ready) ─
    _showBootSplash() {
      // Inject immediately into shadowRoot — no render() needed
      if (this.shadowRoot.querySelector('#haca-boot-splash')) return;
      const el = document.createElement('div');
      el.id = 'haca-boot-splash';
      el.style.cssText = [
        'position:fixed','inset:0','z-index:9999',
        'display:flex','flex-direction:column','align-items:center','justify-content:center',
        'background:var(--primary-background-color,#fff)',
        'gap:20px','font-family:var(--paper-font-body1_-_font-family,sans-serif)',
      ].join(';');
      el.innerHTML = `
        <style>
          @keyframes haca-boot-spin { to { transform: rotate(360deg); } }
          #haca-boot-splash .haca-spinner {
            width:48px; height:48px; border-radius:50%;
            border:4px solid var(--divider-color,#e0e0e0);
            border-top-color:var(--primary-color,#03a9f4);
            animation:haca-boot-spin 0.9s linear infinite;
          }
          #haca-boot-splash .haca-logo {
            font-size:28px; font-weight:700; letter-spacing:2px;
            color:var(--primary-color,#03a9f4);
          }
          #haca-boot-splash .haca-msg {
            font-size:14px; color:var(--secondary-text-color,#888);
            max-width:280px; text-align:center; line-height:1.5;
          }
          #haca-boot-splash .haca-dots::after {
            content:''; animation:haca-dots 1.5s steps(4,end) infinite;
          }
          @keyframes haca-dots {
            0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} 100%{content:''}
          }
        </style>
        <div class="haca-logo">H.A.C.A</div>
        <div class="haca-spinner"></div>
        <div class="haca-msg">Home Assistant Config Auditor<br><span class="haca-dots">Loading</span></div>
      `;
      this.shadowRoot.appendChild(el);
    }

    _hideBootSplash() {
      const el = this.shadowRoot.querySelector('#haca-boot-splash');
      if (!el) return;
      // Fade out smoothly
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 420);
    }

    async _boot() {
      // Evite les doubles appels si set panel() et set hass() se chevauchent
      if (this._booting) return;
      if (!this._hass) return;
      this._booting = true;

      try {
        // 1. Traductions : depuis le cache module si disponible, sinon charger
        if (_HC.translations) {
          this._translations = _HC.translations;
          this._language = _HC.language || 'en';
        } else {
          await this.loadTranslations();
          _HC.translations = this._translations;
          _HC.language = this._language;
        }

        // 2. Render unique — une seule fois par instance
        if (!this._rendered) {
          this._rendered = true;
          this.render();
          this.attachListeners();
        }

        // 3. Données : depuis le cache module si disponible → affichage immédiat, zéro flash
        if (_HC.data) {
          this.updateUI(_HC.data);
        }

        // 4. Charger les données fraîches (silencieux si cache dispo)
        await this.loadData();

        this._fullyReady = true;
        this._startAutoRefresh();
      } catch (err) {
        console.error('[HACA] Boot error:', err);
      } finally {
        this._booting = false;
      }
    }

    _startAutoRefresh() {
      this._stopAutoRefresh(); // annuler tout intervalle existant
      this._dataErrorCount = 0;
      this._refreshTimer = setInterval(() => {
        if (!this._connected || !this._hass) return;
        // Watchdog : après 5 erreurs consécutives, afficher un bandeau d'erreur récupérable
        if (this._dataErrorCount >= 5) {
          // Trop d'erreurs consécutives → HA probablement en cours de redémarrage
          if (!this._reconnectOverlayShown) {
            this._reconnectOverlayShown = true;
            this._showReconnectBanner();
          }
          // Continuer à essayer — HA va revenir
          this.loadData();
          return;
        }
        // Si l'overlay était affiché (reconnexion réussie par loadData), le masquer
        if (this._reconnectOverlayShown && this._dataErrorCount === 0) {
          this._reconnectOverlayShown = false;
          this._hideReconnectBanner();
        }
        this.loadData();
      }, 60_000); // 60 secondes
    }

    _stopAutoRefresh() {
      if (this._refreshTimer) {
        clearInterval(this._refreshTimer);
        this._refreshTimer = null;
      }
    }

    // Ré-applique la dernière réponse de l'API sans refaire d'appel réseau
    _applyCachedData() {
      if (this._cachedData) {
        this.updateUI(this._cachedData);
      }
    }

    async loadTranslations() {
      if (!this._hass) return;
      try {
        const lang = this._hass.language || 'en';
        const result = await this._hass.callWS({ type: 'haca/get_translations', language: lang });
        if (result && result.translations) {
          this._translations = result.translations;
          this._language = result.language || lang;
        }
      } catch (error) {
        console.warn('[HACA] Could not load translations, using defaults:', error);
      }
    }

    render() {
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          font-family: 'Roboto', 'Outfit', sans-serif;
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: inherit; }
        .container { max-width: 1400px; margin: 0 auto; animation: haca-fadeIn 0.5s ease-out; }

        @keyframes haca-fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes haca-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── HEADER ───────────────────────────────── */
        .header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color, #03a9f4) 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .header-title { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .header-title ha-icon { --mdc-icon-size: 42px; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
        .header h1 { margin: 0; font-size: 28px; font-weight: 500; letter-spacing: -0.5px; }
        .header-sub { font-size: 13px; opacity: 0.8; font-weight: 400; }
        .actions { display: flex; gap: 10px; flex-wrap: wrap; }

        /* ── BUTTONS ──────────────────────────────── */
        /* Boutons du header : fond sombre, texte blanc */
        .header button {
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .header button:hover { background: rgba(255,255,255,0.25); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .header button:active { transform: translateY(0); }

        /* Boutons hors header : fond neutre, hover coloré lisible */
        button {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        button:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* ── Boutons primaires dans les modals (appliquer, valider) ── */
        .haca-modal button[style*="var(--primary-color)"], .haca-modal button#apply-fix-btn {
          background: var(--primary-color);
          color: white;
          border-color: transparent;
        }
        .haca-modal button[style*="var(--primary-color)"]:hover, .haca-modal button#apply-fix-btn:hover {
          background: var(--primary-color);
          filter: brightness(1.1);
          color: white;
          border-color: transparent;
        }
        /* Bouton danger dans les modals */
        .haca-modal button[style*="var(--error-color)"], .haca-modal button[style*="#ef5350"], .haca-modal button[style*="#ff7043"] {
          background: var(--error-color, #ef5350);
          color: white;
          border-color: transparent;
        }
        .haca-modal button[style*="var(--error-color)"]:hover, .haca-modal button[style*="#ef5350"]:hover, .haca-modal button[style*="#ff7043"]:hover {
          filter: brightness(1.1);
          color: white;
          background: var(--error-color, #ef5350);
        }
        /* Bouton close (✕) — hover rouge */
        .modal-close-btn:hover {
          background: var(--error-color, #ef5350) !important;
          color: white !important;
        }
        button#scan-all { background: white; color: var(--primary-color); font-weight: 700; border: none; }
        button#scan-all:hover { background: rgba(255,255,255,0.9); }

        .btn-loader {
          width: 14px; height: 14px;
          border: 2px solid transparent; border-top-color: currentColor;
          border-radius: 50%; animation: haca-btn-spin 0.8s linear infinite; display: inline-block;
        }
        @keyframes haca-btn-spin { to { transform: rotate(360deg); } }
        button.scanning { pointer-events: none; }
        button.scanning ha-icon { display: none; }

        /* ── STAT CARDS ───────────────────────────── */
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: var(--card-background-color);
          padding: 20px;
          border-radius: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.05));
          border: 1px solid var(--divider-color);
          display: flex; flex-direction: column; gap: 8px;
          transition: transform 0.3s ease;
        }
        .stat-card.blueprint { border-left: 5px solid var(--info-color, #26c6da); }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-header { display: flex; justify-content: space-between; align-items: center; }
        .stat-label { color: var(--secondary-text-color); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
        .stat-icon { color: var(--primary-color); opacity: 0.8; }
        .stat-value { font-size: 38px; font-weight: 700; color: var(--primary-text-color); margin-top: 2px; }
        .stat-desc { font-size: 12px; color: var(--secondary-text-color); }

        /* ── TABS (top-level) ─────────────────────── */
        .tabs-container {
          margin-bottom: 20px;
          position: sticky; top: 0; z-index: 10;
          background: var(--primary-background-color);
          padding: 8px 0;
        }
        .tabs {
          display: flex; gap: 6px;
          background: var(--secondary-background-color);
          padding: 5px; border-radius: 14px;
          overflow-x: auto; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .tabs::-webkit-scrollbar { display: none; }
        .tabs .tab {
          flex: 1; min-width: 0;
          padding: 12px 20px;
          background: transparent; cursor: pointer;
          border-radius: 10px; border: none;
          color: var(--secondary-text-color);
          font-weight: 600; white-space: nowrap;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease; font-size: 14px;
        }
        .tabs .tab ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
        .tab-label { display: inline; }
        .tabs .tab:hover { color: var(--primary-text-color); background: rgba(0,0,0,0.05); }
        .tabs .tab.active { background: var(--card-background-color); color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        /* ── SUB-TABS (inside Issues tab) ────────── */
        .subtabs-container {
          border-bottom: 1px solid var(--divider-color);
          padding: 8px 16px 0;
          background: var(--secondary-background-color);
        }
        .subtabs {
          display: flex; gap: 2px;
          overflow-x: auto; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .subtabs::-webkit-scrollbar { display: none; }
        .subtabs .subtab {
          flex-shrink: 0;
          padding: 8px 14px;
          background: transparent; cursor: pointer;
          border: none; border-bottom: 3px solid transparent;
          color: var(--secondary-text-color);
          font-weight: 500; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s ease; font-size: 13px;
          border-radius: 0;
        }
        .subtabs .subtab ha-icon { --mdc-icon-size: 15px; flex-shrink: 0; }
        .subtabs .subtab:hover { color: var(--primary-text-color); }
        .subtabs .subtab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 700; }
        .subtab-content { display: none; }
        .subtab-content.active { display: block; animation: haca-fadeIn 0.2s ease-out; }

        /* ── SEGMENT CONTROL (3rd level: Issues / Score) ── */
        .segment-bar {
          display: inline-flex;
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .segment-btn {
          padding: 5px 14px;
          border: none; border-radius: 6px;
          background: transparent;
          color: var(--secondary-text-color);
          font-size: 12px; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .segment-btn ha-icon { --mdc-icon-size: 14px; }
        .segment-btn.active {
          background: var(--card-background-color);
          color: var(--primary-color);
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }
        .segment-btn:hover:not(.active) { color: var(--primary-text-color); }
        .segment-panel { display: none; }
        .segment-panel.active { display: block; animation: haca-fadeIn 0.2s ease-out; }

        /* ── SECTION CARD ─────────────────────────── */
        .tab-content { display: none; animation: haca-fadeIn 0.3s ease-out; }
        .tab-content.active { display: block; }
        .section-card {
          background: var(--card-background-color);
          padding: 0; border-radius: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.05));
          border: 1px solid var(--divider-color); overflow: hidden;
        }
        /* Issues tab: no top padding since subtabs bar starts right away */
        #tab-issues { padding-top: 0; }
        .section-header {
          padding: 18px 22px; border-bottom: 1px solid var(--divider-color);
          display: flex; justify-content: space-between; align-items: center;
          background: var(--secondary-background-color); flex-wrap: wrap; gap: 10px;
        }
        .section-header h2 { margin: 0; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .section-header-btns { display: flex; gap: 10px; flex-wrap: wrap; }

        /* ── ISSUE ITEMS ──────────────────────────── */
        .issue-list { padding: 8px 20px 20px; }
        .issue-item {
          padding: 18px;
          margin: 14px 0;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-left: 6px solid var(--primary-color);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .issue-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .issue-item.high   { border-left-color: var(--error-color, #ef5350); background: rgba(239,83,80,0.02); }
        .issue-item.medium { border-left-color: var(--warning-color, #ffa726); background: rgba(255,167,38,0.02); }
        .issue-item.low    { border-left-color: var(--info-color, #26c6da); background: rgba(38,198,218,0.02); }

        /* Issue layout: info left, buttons right — stacks on mobile */
        .issue-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
        .issue-info { flex: 1; min-width: 0; }
        .issue-btns { display: flex; gap: 8px; flex-shrink: 0; align-items: flex-start; }
        .issue-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .issue-title { font-size: 15px; font-weight: 600; color: var(--primary-text-color); word-break: break-word; }
        .issue-entity {
          font-size: 12px; color: var(--secondary-text-color);
          font-family: 'SFMono-Regular', Consolas, monospace;
          background: var(--secondary-background-color);
          padding: 2px 6px; border-radius: 4px;
          display: inline-block; max-width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .issue-message { margin: 10px 0 0; line-height: 1.5; color: var(--primary-text-color); opacity: 0.9; font-size: 14px; }
        .issue-reco {
          margin-top: 10px; font-size: 13px; color: var(--secondary-text-color);
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px;
        }

        .fix-btn {
          background: var(--primary-color); color: white;
          padding: 8px 14px; font-size: 12px; font-weight: 600;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(var(--rgb-primary-color),0.3); border: none;
        }
        .fix-btn:hover { background: var(--accent-color, #03a9f4); color: white !important; opacity: 0.9; }

        /* ── EMPTY STATE ──────────────────────────── */
        .empty-state { text-align: center; padding: 52px 20px; color: var(--secondary-text-color); }
        .empty-state ha-icon { --mdc-icon-size: 60px; opacity: 0.3; margin-bottom: 14px; display: block; }

        /* ── TABLES ───────────────────────────────── */
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 480px; }
        .data-table th { padding: 14px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--secondary-text-color); font-weight: 700; border-bottom: 2px solid var(--divider-color); white-space: nowrap; }
        .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--divider-color); vertical-align: middle; }
        .data-table tr:last-child td { border-bottom: none; }

        /* ── MOBILE CARD LIST (backup/report rows) ── */
        .mobile-cards { display: none; }
        .m-card {
          border: 1px solid var(--divider-color);
          border-radius: 12px; padding: 14px; margin: 10px 16px;
          background: var(--secondary-background-color);
        }
        .m-card-title { font-weight: 600; font-size: 14px; word-break: break-all; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
        .m-card-meta { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 10px; }
        .m-card-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .m-card-btns button { flex: 1; min-width: 100px; justify-content: center; }
        /* Format pills in report cards */
        .fmt-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
        .fmt-pill { border: 1px solid var(--divider-color); border-radius: 10px; padding: 8px 10px; background: var(--card-background-color); }
        .fmt-pill-label { font-size: 10px; font-weight: 800; color: var(--primary-color); text-transform: uppercase; display: block; margin-bottom: 5px; }
        .fmt-pill-btns { display: flex; gap: 5px; }
        .fmt-pill-btns button { padding: 5px; background: var(--secondary-background-color) !important; border: 1px solid var(--divider-color) !important; border-radius: 7px !important; }

        /* ── FILTER BAR ───────────────────────────── */
        .filter-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 22px; border-bottom: 1px solid var(--divider-color);
          background: var(--secondary-background-color); flex-wrap: wrap;
        }
        .filter-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--secondary-text-color); letter-spacing: 0.5px; }
        .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-chip {
          padding: 5px 14px; border-radius: 20px; border: 1px solid var(--divider-color);
          background: var(--card-background-color); color: var(--secondary-text-color);
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
        }
        .filter-chip:hover { background: color-mix(in srgb, var(--primary-color) 12%, transparent); border-color: var(--primary-color); color: var(--primary-text-color); transform: none; box-shadow: none; }
        .filter-chip.active-all    { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .filter-chip.active-high   { background: var(--error-color, #ef5350); color: white; border-color: var(--error-color, #ef5350); }
        .filter-chip.active-medium { background: var(--warning-color, #ffa726); color: white; border-color: var(--warning-color, #ffa726); }
        .filter-chip.active-low    { background: var(--info-color, #26c6da); color: white; border-color: var(--info-color, #26c6da); }
        .export-csv-btn {
          margin-left: auto; padding: 5px 14px; border-radius: 20px;
          border: 1px solid var(--divider-color); background: var(--card-background-color);
          color: var(--secondary-text-color); font-size: 12px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;
        }
        .export-csv-btn:hover { background: var(--card-background-color); border-color: var(--success-color, #4caf50); color: var(--success-color, #4caf50); transform: none; box-shadow: none; }

        /* ── MODAL ────────────────────────────────── */
        .haca-modal-card { border-radius: 20px !important; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.1); }

        /* ── LOADER ───────────────────────────────── */
        .loader {
          width: 48px; height: 48px;
          border: 5px solid rgba(0,0,0,0.08);
          border-bottom-color: var(--primary-color);
          border-radius: 50%; display: inline-block;
          box-sizing: border-box;
          animation: haca-rotation 1s linear infinite; margin: 20px auto;
        }
        @keyframes haca-rotation { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }

        /* ═══════════════════════════════════════════
           TABLET  ≤ 900px  — hide tab text
           ═══════════════════════════════════════════ */
        @media (max-width: 900px) {
          .tab-label { display: none; }
          .tabs .tab { gap: 0; padding: 10px; }
        }

        /* ═══════════════════════════════════════════
           MOBILE  ≤ 600px
           ═══════════════════════════════════════════ */
        @media (max-width: 600px) {
          { padding: 10px; }

          /* Header */
          .header { padding: 14px 16px; border-radius: 12px; gap: 12px; }
          .header-title ha-icon { --mdc-icon-size: 30px; }
          .header h1 { font-size: 20px; }
          .header-sub { display: none; }
          .actions { width: 100%; }
          .actions button { flex: 1; justify-content: center; }

          /* Stats: 2-col grid */
          .stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
          .stat-card { padding: 12px; gap: 4px; }
          .stat-value { font-size: 28px; }
          .stat-label { font-size: 10px; }
          .stat-desc { display: none; }

          /* Top-level tabs: keep labels visible, reduce padding */
          .tabs .tab { padding: 10px 12px; font-size: 13px; }
          .tabs-container { padding: 6px 0; }
          /* Sub-tabs: icon-only on small screens */
          .subtabs .subtab span { display: none; }
          .subtabs .subtab { padding: 8px 10px; }

          /* Issues */
          .issue-list { padding: 6px 10px 16px; }
          .issue-item { padding: 12px; margin: 10px 0; }
          .issue-main { flex-direction: column; gap: 10px; }
          .issue-btns { width: 100%; }
          .issue-btns button { flex: 1; justify-content: center; }
          .issue-title { font-size: 14px; }
          .issue-message { font-size: 13px; }

          /* Section headers */
          .section-header { padding: 12px 14px; }
          .section-header h2 { font-size: 14px; }
          .section-header-btns { width: 100%; }
          .section-header-btns button { flex: 1; justify-content: center; }

          /* Filter bar */
          .filter-bar { padding: 8px 12px; gap: 8px; }
          .export-csv-btn { margin-left: 0; width: 100%; justify-content: center; }

          /* Tables → card view */
          .table-wrap { display: none; }
          .mobile-cards { display: block; }

          /* Modals: bottom-sheet style */
          .haca-modal {
            align-items: flex-end !important;
          }
          .haca-modal > div {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 95vh !important;
            border-radius: 16px 16px 0 0 !important;
          }
        }
        /* ── Config tab (injected from config_tab.js) ─── */
  .cfg-root { max-width: 860px; margin: 0 auto; padding: 24px 20px 48px; display: flex; flex-direction: column; gap: 20px; }
  .cfg-header { display: flex; align-items: center; gap: 16px; padding: 20px 24px; background: var(--card-background-color); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .cfg-header-title { font-size: 1.2em; font-weight: 700; color: var(--primary-text-color); }
  .cfg-header-sub { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 2px; }
  .cfg-section { background: var(--card-background-color); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
  .cfg-section-title { display: flex; align-items: center; gap: 8px; padding: 16px 20px 12px; font-weight: 700; font-size: 0.9em; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--divider-color); }
  .cfg-section-hint { font-size: 0.82em; color: var(--secondary-text-color); padding: 10px 20px; background: rgba(var(--rgb-primary-color,33,150,243),0.04); border-bottom: 1px solid var(--divider-color); line-height: 1.5; }
  .cfg-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; gap: 16px; border-bottom: 1px solid var(--divider-color); }
  .cfg-row:last-child { border-bottom: none; }
  .cfg-row-label { display: flex; flex-direction: column; gap: 3px; flex: 1; }
  .cfg-row-label > span:first-child { font-size: 0.92em; color: var(--primary-text-color); }
  .cfg-row-hint { font-size: 0.78em; color: var(--secondary-text-color); }
  .cfg-input { width: 90px; padding: 8px 12px; border: 1.5px solid var(--divider-color); border-radius: 8px; background: var(--primary-background-color); color: var(--primary-text-color); font-size: 0.9em; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .cfg-input:focus { outline: none; border-color: var(--primary-color); }
  .cfg-toggle { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; cursor: pointer; }
  .cfg-toggle-sm { width: 40px; height: 22px; }
  .cfg-toggle input { opacity: 0; width: 0; height: 0; }
  .cfg-toggle-slider { position: absolute; inset: 0; background: var(--disabled-text-color,#bbb); border-radius: 26px; transition: 0.25s; }
  .cfg-toggle-slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.25); }
  .cfg-toggle-sm .cfg-toggle-slider::before { height: 16px; width: 16px; left: 3px; bottom: 3px; }
  .cfg-toggle input:checked + .cfg-toggle-slider { background: var(--primary-color); }
  .cfg-toggle input:checked + .cfg-toggle-slider::before { transform: translateX(22px); }
  .cfg-toggle-sm input:checked + .cfg-toggle-slider::before { transform: translateX(18px); }
  /* ── Issue type list ── */
  .cfg-categories-root { padding: 0 0 8px; }
  .cfg-cat-section { border-bottom: 1px solid var(--divider-color); }
  .cfg-cat-section:last-child { border-bottom: none; }
  .cfg-cat-section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(var(--rgb-primary-color,33,150,243),0.04); cursor: pointer; }
  .cfg-cat-header-left { display: flex; align-items: center; gap: 10px; }
  .cfg-cat-section-title { font-weight: 700; font-size: 0.88em; color: var(--primary-text-color); }
  .cfg-cat-count { font-size: 0.78em; color: var(--secondary-text-color); margin-left: 4px; }
  .cfg-cat-header-actions { display: flex; gap: 6px; }
  .cfg-cat-all-btn { font-size: 0.75em; padding: 3px 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--secondary-text-color); cursor: pointer; }
  .cfg-cat-all-btn:hover { background: var(--primary-background-color); color: var(--primary-text-color); }
  .cfg-type-list { display: flex; flex-direction: column; }
  .cfg-type-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 20px 9px 32px; gap: 12px; border-bottom: 1px solid var(--divider-color); transition: background 0.15s; cursor: default; }
  .cfg-type-row:last-child { border-bottom: none; }
  .cfg-type-row.disabled { opacity: 0.45; background: rgba(0,0,0,0.015); }
  .cfg-type-row:hover { background: rgba(var(--rgb-primary-color,33,150,243),0.03); }
  .cfg-type-label { font-size: 0.85em; color: var(--primary-text-color); flex: 1; }
  .cfg-badge { font-size: 0.72em; padding: 1px 6px; border-radius: 3px; margin-left: 6px; font-weight: 600; vertical-align: middle; }
  .cfg-badge-fix { background: rgba(34,197,94,0.15); color: #15803d; border: 1px solid rgba(34,197,94,0.4); }
  /* ── Actions ── */
  .cfg-actions { display: flex; gap: 12px; justify-content: flex-end; padding: 8px 0; }
  .cfg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s, transform 0.1s; }
  .cfg-btn:active { transform: scale(0.97); }
  .cfg-btn-primary { background: var(--primary-color); color: white; border-color: transparent; }
  .cfg-btn-primary:hover { background: var(--primary-color); color: white; filter: brightness(1.1); border-color: transparent; }
  .cfg-btn-secondary { background: var(--card-background-color); color: var(--primary-text-color); border: 1.5px solid var(--divider-color); }
  .cfg-btn-secondary:hover { background: color-mix(in srgb, var(--error-color, #ef5350) 15%, transparent); color: var(--error-color, #ef5350); border-color: var(--error-color, #ef5350); }
  .cfg-save-status { padding: 12px 20px; border-radius: 8px; font-size: 0.88em; font-weight: 500; text-align: center; animation: fadeIn 0.2s ease-out; }
  .cfg-save-status.success { background: rgba(34,197,94,0.15); color: #15803d; border: 1px solid rgba(34,197,94,0.3); }
  .cfg-save-status.error { background: rgba(239,68,68,0.12); color: #dc2626; border: 1px solid rgba(239,68,68,0.3); }
        @keyframes hacarot {
          to { stroke-dashoffset: -120; }
        }      </style>
      <div class="container">
        <div class="header">
          <div class="header-title">
            <ha-icon icon="mdi:shield-check-outline"></ha-icon>
            <div>
                <h1>${this.t('title')}</h1>
                <div class="header-sub">${this.t('subtitle')} - ${this.t('version')}</div>
            </div>
          </div>
          <div class="actions">
            <button id="scan-all"><ha-icon icon="mdi:magnify-scan"></ha-icon> ${this.t('buttons.scan_all')}</button>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-card" style="grid-column: span 2; min-width:0; overflow:hidden;" id="health-score-card">
            <div class="stat-header">
              <span class="stat-label">${this.t('stats.health_score')}</span>
              <ha-icon icon="mdi:chart-line" class="stat-icon"></ha-icon>
            </div>
            <div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;">
              <div>
                <div class="stat-value" id="health-score">--</div>
                <div class="stat-desc" id="health-score-trend" style="margin-top:2px;"></div>
              </div>
              <div style="flex:1;min-width:120px;height:52px;overflow:hidden;border-radius:6px;">
                <svg id="sparkline-svg" width="100%" height="52" preserveAspectRatio="none"
                  style="display:block;overflow:hidden;">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <text x="50%" y="50%" text-anchor="middle" fill="var(--secondary-text-color)"
                    font-size="10" dominant-baseline="middle">Historique…</text>
                </svg>
              </div>
            </div>
          </div>
          <div class="stat-card" style="border-left: 5px solid var(--error-color, #ef5350);">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.security')}</span>
                <ha-icon icon="mdi:shield-lock" style="color: var(--error-color, #ef5350);"></ha-icon>
            </div>
            <div class="stat-value" id="security-count">0</div>
            <div class="stat-desc">${this.t('stats.security_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.automations')}</span>
                <ha-icon icon="mdi:robot-confused" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="auto-count">0</div>
            <div class="stat-desc">${this.t('stats.automations_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.scripts')}</span>
                <ha-icon icon="mdi:script-text" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="script-count">0</div>
            <div class="stat-desc">${this.t('stats.scripts_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.scenes')}</span>
                <ha-icon icon="mdi:palette" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="scene-count">0</div>
            <div class="stat-desc">${this.t('stats.scenes_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.entities')}</span>
                <ha-icon icon="mdi:lightning-bolt" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="entity-count">0</div>
            <div class="stat-desc">${this.t('stats.entities_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.performance')}</span>
                <ha-icon icon="mdi:speedometer-slow" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="perf-count">0</div>
            <div class="stat-desc">${this.t('stats.performance_desc')}</div>
          </div>
          <div class="stat-card blueprint">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.blueprints')}</span>
                <ha-icon icon="mdi:file-document-outline" style="color: var(--info-color, #26c6da);"></ha-icon>
            </div>
            <div class="stat-value" id="blueprint-count">0</div>
            <div class="stat-desc">${this.t('stats.blueprints_desc')}</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--primary-color);">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.dashboards')}</span>
                <ha-icon icon="mdi:view-dashboard-outline" style="color: var(--primary-color);"></ha-icon>
            </div>
            <div class="stat-value" id="dashboard-count">0</div>
            <div class="stat-desc">${this.t('stats.dashboards_desc')}</div>
          </div>
          <div class="stat-card" id="recorder-stat-card" style="border-top: 3px solid #ff7043; cursor:pointer;" id="recorder-stat-btn" style="cursor:pointer;">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.recorder_orphans')}</span>
                <ha-icon icon="mdi:database-alert-outline" style="color:#ff7043;"></ha-icon>
            </div>
            <div class="stat-value" id="recorder-orphan-count">—</div>
            <div class="stat-desc" id="recorder-orphan-mb"></div>
          </div>
        </div>
        
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab active" data-tab="issues">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.issues')}</span>
            </button>
            <button class="tab" data-tab="recorder">
              <ha-icon icon="mdi:database-alert-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.recorder')}</span>
            </button>
            <button class="tab" data-tab="history">
              <ha-icon icon="mdi:chart-timeline-variant"></ha-icon>
              <span class="tab-label">${this.t('tabs.history')}</span>
            </button>
            <button class="tab" data-tab="backups">
              <ha-icon icon="mdi:archive-arrow-down-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.backups')}</span>
            </button>
            <button class="tab" data-tab="reports">
              <ha-icon icon="mdi:file-chart-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.reports')}</span>
            </button>
            <button class="tab" data-tab="carte">
              <ha-icon icon="mdi:graph"></ha-icon>
              <span class="tab-label">${this.t('tabs.carte')}</span>
            </button>
            <button class="tab" data-tab="batteries">
              <ha-icon icon="mdi:battery-alert"></ha-icon>
              <span class="tab-label">${this.t('tabs.batteries')}</span>
              <span id="tab-badge-batteries" style="display:none;background:#ef5350;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:4px;"></span>
            </button>
            <button class="tab" data-tab="chat">
              <ha-icon icon="mdi:robot-happy-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.chat')}</span>
            </button>
            <button class="tab" data-tab="config">
              <ha-icon icon="mdi:tune-variant"></ha-icon>
              <span class="tab-label">${this.t('tabs.config')}</span>
            </button>
          </div>
        </div>

        <div class="section-card">

          <!-- ══════════════════════════════════════════════════════════
               TAB ISSUES — sub-tabs for each category
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-issues" class="tab-content active">

            <!-- Sub-tab bar -->
            <div class="subtabs-container">
              <div class="subtabs" id="subtabs-issues">
                <button class="subtab active" data-subtab="all"><ha-icon icon="mdi:view-list"></ha-icon> <span>${this.t('tabs.all')}</span></button>
                <button class="subtab" data-subtab="security"><ha-icon icon="mdi:shield-lock"></ha-icon> <span>${this.t('tabs.security')}</span></button>
                <button class="subtab" data-subtab="automations"><ha-icon icon="mdi:robot"></ha-icon> <span>${this.t('tabs.automations')}</span></button>
                <button class="subtab" data-subtab="scripts"><ha-icon icon="mdi:script-text"></ha-icon> <span>${this.t('tabs.scripts')}</span></button>
                <button class="subtab" data-subtab="scenes"><ha-icon icon="mdi:palette"></ha-icon> <span>${this.t('tabs.scenes')}</span></button>
                <button class="subtab" data-subtab="entities"><ha-icon icon="mdi:lightning-bolt"></ha-icon> <span>${this.t('tabs.entities')}</span></button>
                <button class="subtab" data-subtab="performance"><ha-icon icon="mdi:gauge"></ha-icon> <span>${this.t('tabs.performance')}</span></button>
                <button class="subtab" data-subtab="blueprints"><ha-icon icon="mdi:file-document-outline"></ha-icon> <span>${this.t('tabs.blueprints')}</span></button>
                <button class="subtab" data-subtab="dashboards"><ha-icon icon="mdi:view-dashboard-outline"></ha-icon> <span>${this.t('tabs.dashboards')}</span></button>
              </div>
            </div>

            <!-- Sub-tab contents -->
            <div id="subtab-all" class="subtab-content active">
              <div class="section-header">
                <h2><ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('sections.all_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-all">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-all">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-all">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-all">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-all">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-all"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-all" class="issue-list"></div>
            </div>

            <div id="subtab-security" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:shield-lock"></ha-icon> ${this.t('sections.security_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-security">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-security">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-security">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-security">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-security">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-security"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-security" class="issue-list"></div>
            </div>

            <div id="subtab-automations" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:robot"></ha-icon> ${this.t('sections.automation_issues')}</h2>
                <div class="segment-bar" id="seg-bar-auto">
                  <button class="segment-btn active" data-seg="auto" data-panel="auto-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="auto" data-panel="auto-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.scores')}
                  </button>
                </div>
              </div>
              <!-- Issues panel -->
              <div id="seg-auto-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-automations">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-automations">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-automations">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-automations">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-automations">${this.t('filter.low')}</button>
                  <button class="filter-chip" data-filter="ghost" data-target="issues-automations" title="${this.t('filter.ghost_title')}">
                    ${this.t('filter.ghost_label')}
                  </button>
                  <button class="filter-chip" data-filter="duplicate" data-target="issues-automations" title="${this.t('filter.duplicate_title')}">
                    ${this.t('filter.duplicate_label')}
                  </button>
                </div>
                <button class="export-csv-btn" data-target="issues-automations"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-automations" class="issue-list"></div>
              </div>
              <!-- Scores panel -->
              <div id="seg-auto-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('tables.complexity_score')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:480px;" id="complexity-table-container">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;cursor:pointer;" data-sort="alias">${this.t('tables.automation_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;cursor:pointer;" data-sort="score">${this.t('tables.score_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.triggers_col')}">🔀</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.conditions_col')}">🔍</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.actions_col_recursive')}">▶</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.templates_col')}">📝</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.level_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;"></th>
                    </tr></thead>
                    <tbody id="complexity-tbody">
                      <tr><td colspan="7" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-scripts" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:script-text"></ha-icon> ${this.t('sections.script_issues')}</h2>
                <div class="segment-bar" id="seg-bar-scripts">
                  <button class="segment-btn active" data-seg="scripts" data-panel="scripts-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="scripts" data-panel="scripts-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.scores')}
                  </button>
                </div>
              </div>
              <div id="seg-scripts-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-scripts">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-scripts">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-scripts">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-scripts">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-scripts">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-scripts"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-scripts" class="issue-list"></div>
              </div>
              <div id="seg-scripts-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('sections.scripts_complexity')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:380px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('graph.legend_script')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.score_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.actions_col_recursive')}">▶ ${this.t('tables.actions_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.templates_col')}">📝 ${this.t('tables.templates_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.level_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;"></th>
                    </tr></thead>
                    <tbody id="script-complexity-tbody">
                      <tr><td colspan="5" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-scenes" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:palette"></ha-icon> ${this.t('sections.scene_issues')}</h2>
                <div class="segment-bar" id="seg-bar-scenes">
                  <button class="segment-btn active" data-seg="scenes" data-panel="scenes-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="scenes" data-panel="scenes-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.stats')}
                  </button>
                </div>
              </div>
              <div id="seg-scenes-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-scenes">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-scenes">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-scenes">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-scenes">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-scenes">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-scenes"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-scenes" class="issue-list"></div>
              </div>
              <div id="seg-scenes-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('sections.all_scenes_stats')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:300px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.scene')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.entities_controlled')}</th>
                    </tr></thead>
                    <tbody id="scene-stats-tbody">
                      <tr><td colspan="2" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_stats')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-entities" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${this.t('sections.entity_issues')}</h2>
                <div class="segment-bar" id="seg-bar-entities">
                  <button class="segment-btn active" data-seg="entities" data-panel="entities-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('issues.segment_issues')}
                  </button>
                  <button class="segment-btn" data-seg="entities" data-panel="entities-batteries">
                    <ha-icon icon="mdi:battery-alert"></ha-icon> ${this.t('issues.segment_batteries')}
                  </button>
                </div>
              </div>
              <!-- Issues panel -->
              <div id="seg-entities-issues" class="segment-panel active">
                <div class="filter-bar" id="filter-bar-issues-entities">
                  <span class="filter-label">${this.t('filter.label')}</span>
                  <div class="filter-chips">
                    <button class="filter-chip active-all" data-filter="all" data-target="issues-entities">${this.t('filter.all')}</button>
                    <button class="filter-chip" data-filter="high" data-target="issues-entities">${this.t('filter.high')}</button>
                    <button class="filter-chip" data-filter="medium" data-target="issues-entities">${this.t('filter.medium')}</button>
                    <button class="filter-chip" data-filter="low" data-target="issues-entities">${this.t('filter.low')}</button>
                  </div>
                  <button class="export-csv-btn" data-target="issues-entities"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
                </div>
                <div id="issues-entities" class="issue-list"></div>
              </div>
              <!-- Batteries mini-panel (quick view, full detail in Batteries tab) -->
              <div id="seg-entities-batteries" class="segment-panel">
                <div style="padding:12px 20px 4px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                    ${this.t('battery.detected_title')}
                  </span>
                  <button id="goto-batteries-tab" style="background:var(--secondary-background-color);color:var(--primary-color);border:1px solid var(--primary-color);font-size:12px;padding:4px 12px;border-radius:8px;cursor:pointer;">
                    <ha-icon icon="mdi:open-in-new" style="--mdc-icon-size:14px;"></ha-icon> ${this.t('battery.view_full')}
                  </button>
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:320px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.device')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.level_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.status_col')}</th>
                    </tr></thead>
                    <tbody id="bat-mini-tbody">
                      <tr><td colspan="3" style="text-align:center;padding:16px;color:var(--secondary-text-color);">${this.t('battery.run_scan')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-performance" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:gauge"></ha-icon> ${this.t('sections.performance_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-performance">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-performance">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-performance">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-performance">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-performance">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-performance"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-performance" class="issue-list"></div>
            </div>

            <div id="subtab-blueprints" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:file-document-outline"></ha-icon> ${this.t('sections.blueprint_issues')}</h2>
                <div class="segment-bar" id="seg-bar-blueprints">
                  <button class="segment-btn active" data-seg="blueprints" data-panel="blueprints-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="blueprints" data-panel="blueprints-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.stats')}
                  </button>
                </div>
              </div>
              <div id="seg-blueprints-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-blueprints">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-blueprints">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-blueprints">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-blueprints">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-blueprints">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-blueprints"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-blueprints" class="issue-list"></div>
              </div>
              <div id="seg-blueprints-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('sections.blueprints_usage')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:380px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('graph.legend_blueprint')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.usages_col')}</th>
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tabs.automations')}</th>
                    </tr></thead>
                    <tbody id="blueprint-stats-tbody">
                      <tr><td colspan="3" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_stats')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-dashboards" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:view-dashboard-outline"></ha-icon> ${this.t('sections.dashboard_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-dashboards">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-dashboards">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-dashboards">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-dashboards">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-dashboards">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-dashboards"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-dashboards" class="issue-list"></div>
            </div>

          </div><!-- /tab-issues -->

          <!-- ══════════════════════════════════════════════════════════
               TAB RECORDER ORPHANS
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-recorder" class="tab-content">
            <div class="section-header">
              <h2 style="display:flex;align-items:center;gap:8px;">
                <ha-icon icon="mdi:database-alert-outline" style="color:#ff7043;"></ha-icon>
                ${this.t('sections.recorder_orphans')}
                <span id="recorder-db-badge" style="display:none;font-size:12px;background:#ff7043;color:#fff;padding:2px 8px;border-radius:10px;"></span>
              </h2>
              <div class="section-header-btns">
                <button id="recorder-purge-all-btn" style="display:none;background:#ff7043;color:#fff;">
                  <ha-icon icon="mdi:delete-sweep-outline"></ha-icon> ${this.t('actions.purge_all_orphans')}
                </button>
              </div>
            </div>
            <div id="recorder-orphan-list" style="padding:16px 20px;">
              <div style="color:var(--secondary-text-color);">${this.t('messages.loading')}</div>
            </div>
          </div><!-- /tab-recorder -->

          <!-- ══════════════════════════════════════════════════════════
               TAB HISTORY
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-history" class="tab-content">
            <div class="section-header">
              <h2><ha-icon icon="mdi:chart-timeline-variant"></ha-icon> ${this.t('sections.history')}</h2>
              <div class="section-header-btns">
                <select id="history-range" style="padding:6px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:13px;cursor:pointer;">
                  <option value="14">${this.t('history.days', { n: 14 })}</option>
                  <option value="30" selected>${this.t('history.days', { n: 30 })}</option>
                  <option value="60">${this.t('history.days', { n: 60 })}</option>
                  <option value="90">${this.t('history.days', { n: 90 })}</option>
                </select>
              </div>
            </div>
            <div style="padding:20px 20px 0;">
              <div style="position:relative;width:100%;height:180px;background:var(--secondary-background-color);border-radius:12px;overflow:hidden;">
                <svg id="history-chart-svg" width="100%" height="180" preserveAspectRatio="none" style="display:block;">
                  <text x="50%" y="50%" text-anchor="middle" fill="var(--secondary-text-color)" font-size="13" dominant-baseline="middle">${this.t('misc.no_data')}</text>
                </svg>
                <div id="history-tooltip" style="display:none;position:absolute;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px 12px;font-size:12px;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10;min-width:130px;"></div>
              </div>
              <div id="history-x-labels" style="display:flex;justify-content:space-between;padding:4px 0 16px;font-size:10px;color:var(--secondary-text-color);"></div>
            </div>
            <div id="history-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;padding:0 20px 20px;"></div>
            <div style="padding:0 20px 20px;">
              <div id="history-delete-bar" style="display:none;padding:8px 0 12px;display:flex;align-items:center;gap:10px;">
                <span id="history-selected-count" style="font-size:13px;color:var(--secondary-text-color);"></span>
                <button id="history-delete-selected" style="background:var(--error-color,#ef5350);color:#fff;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                  <ha-icon icon="mdi:delete-outline" style="--mdc-icon-size:15px;"></ha-icon> ${this.t('misc.delete_selection')}
                </button>
                <button id="history-delete-all" style="background:transparent;color:var(--error-color,#ef5350);border:1px solid var(--error-color,#ef5350);border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;">
                  Tout supprimer
                </button>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:13px;" id="history-table">
                <thead>
                  <tr style="border-bottom:2px solid var(--divider-color);">
                    <th style="padding:8px 10px;width:36px;">
                      <input type="checkbox" id="history-select-all" title="${this.t('misc.select_all_toggle')}" style="cursor:pointer;">
                    </th>
                    <th style="padding:8px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.date')}</th>
                    <th style="padding:8px 10px;text-align:center;">${this.t('history.score_label')}</th>
                    <th style="padding:8px 10px;text-align:center;">Δ</th>
                    <th style="padding:8px 10px;text-align:center;" title="${this.t('tabs.issues')}">${this.t('tabs.issues')}</th>
                  </tr>
                </thead>
                <tbody id="history-tbody">
                  <tr><td colspan="5" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('misc.loading')}</td></tr>
                </tbody>
              </table>
            </div>
          </div><!-- /tab-history -->

          <!-- ══════════════════════════════════════════════════════════
               TAB BACKUPS
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-backups" class="tab-content">
            <div class="section-header">
              <h2><ha-icon icon="mdi:archive-arrow-down-outline"></ha-icon> ${this.t('sections.backup_management')}</h2>
              <div class="section-header-btns">
                <button id="create-backup" style="background:var(--primary-color);color:white;">
                  <ha-icon icon="mdi:plus"></ha-icon> ${this.t('actions.create_backup')}
                </button>
              </div>
            </div>
            <div id="backups-list" style="padding:0;">${this.t('messages.loading')}</div>
          </div><!-- /tab-backups -->

          <!-- ══════════════════════════════════════════════════════════
               TAB REPORTS
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-reports" class="tab-content">
            <div class="section-header">
              <h2><ha-icon icon="mdi:file-chart-outline"></ha-icon> ${this.t('sections.report_management')}</h2>
              <div class="section-header-btns">
                <button id="create-report" style="background:var(--success-color,#4caf50);color:white;">
                  <ha-icon icon="mdi:file-document-plus"></ha-icon> ${this.t('buttons.report')}
                </button>
                <button id="refresh-reports" style="background:var(--primary-color);color:white;">
                  <ha-icon icon="mdi:refresh"></ha-icon> ${this.t('buttons.refresh')}
                </button>
              </div>
            </div>
            <div id="reports-list" style="padding:0;">${this.t('messages.loading')}</div>
          </div><!-- /tab-reports -->

          <!-- ══════════════════════════════════════════════════════════
               TAB CARTE — Dependency graph
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-carte" class="tab-content" style="padding:0;">
            <div class="carte-inner" style="display:flex;flex-direction:column;height:calc(100vh - 180px);">

            <!-- Toolbar -->
            <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--divider-color);flex-shrink:0;flex-wrap:wrap;background:var(--secondary-background-color);">
              <ha-icon icon="mdi:graph" style="color:var(--primary-color);"></ha-icon>
              <strong style="font-size:14px;">${this.t('graph.title')}</strong>
              <div style="flex:1;"></div>

              <!-- Legend -->
              <div id="graph-legend" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;">
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#7b68ee;display:inline-block;"></span>${this.t('graph.legend_automation')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#20b2aa;display:inline-block;"></span>${this.t('graph.legend_script')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ffa500;display:inline-block;"></span>${this.t('graph.legend_scene')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#6dbf6d;display:inline-block;"></span>${this.t('graph.legend_entity')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#e8a838;display:inline-block;"></span>${this.t('graph.legend_blueprint')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#a0a0b0;display:inline-block;"></span>${this.t('graph.legend_device')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ef5350;display:inline-block;border:2px solid #b71c1c;"></span>${this.t('graph.legend_issue')}</span>
              </div>

              <div style="display:flex;gap:6px;margin-left:8px;">
                <!-- Type filter -->
                <select id="graph-type-filter" style="padding:5px 8px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;">
                  <option value="all">${this.t('filter_type.all')}</option>
                  <option value="automation">${this.t('filter_type.automation')}</option>
                  <option value="script">${this.t('filter_type.script')}</option>
                  <option value="scene">${this.t('filter_type.scene')}</option>
                  <option value="entity">${this.t('filter_type.entity')}</option>
                  <option value="blueprint">${this.t('filter_type.blueprint')}</option>
                  <option value="device">${this.t('filter_type.device')}</option>
                </select>
                <!-- Issues only toggle -->
                <button id="graph-issues-toggle" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;">
                  ${this.t('graph.issues_only')}
                </button>
                <!-- Reset zoom -->
                <button id="graph-reset-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.reset_view')}">
                  <ha-icon icon="mdi:fit-to-screen" style="--mdc-icon-size:14px;"></ha-icon>
                </button>
                <!-- Export SVG -->
                <button id="graph-export-svg-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.export_svg')}">
                  <ha-icon icon="mdi:image-outline" style="--mdc-icon-size:14px;"></ha-icon> SVG
                </button>
                <!-- Export PNG -->
                <button id="graph-export-png-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.export_png')}">
                  <ha-icon icon="mdi:image" style="--mdc-icon-size:14px;"></ha-icon> PNG
                </button>
              </div>

              <!-- Search -->
              <input id="graph-search" type="text" placeholder="${this.t('misc.search_node')}"
                style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;width:180px;">
            </div>

            <!-- Graph canvas -->
            <div id="graph-container" style="flex:1;position:relative;overflow:hidden;">
              <div id="graph-empty" style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--secondary-text-color);">
                <ha-icon icon="mdi:graph" style="--mdc-icon-size:48px;opacity:0.3;"></ha-icon>
                <span>${this.t('misc.run_scan_graph')}</span>
              </div>
              <svg id="dep-graph-svg" style="width:100%;height:100%;display:none;"></svg>
              <!-- Sidebar lives inside graph-container so it's clipped with the graph -->
              <div id="graph-sidebar" style="display:none;position:absolute;top:0;right:0;width:300px;height:100%;background:var(--card-background-color);border-left:1px solid var(--divider-color);padding:16px;overflow-y:auto;box-shadow:-4px 0 12px rgba(0,0,0,0.1);z-index:10;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <strong id="sidebar-title" style="font-size:15px;"></strong>
                  <button id="sidebar-close" style="background:none;border:none;cursor:pointer;color:var(--secondary-text-color);">✕</button>
                </div>
                <div id="sidebar-body"></div>
              </div>
            </div>

            </div><!-- /carte-inner -->
          </div><!-- /tab-carte -->

          <!-- ══════════════════════════════════════════════════════════
               TAB BATTERIES — Battery monitor
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-batteries" class="tab-content">

            <!-- Summary bar -->
            <div class="section-header">
              <h2 style="display:flex;align-items:center;gap:8px;">
                <ha-icon icon="mdi:battery-alert" style="color:#ffa726;"></ha-icon>
                Moniteur de Batteries
              </h2>
              <div class="section-header-btns" style="display:flex;align-items:center;gap:10px;">
                <span id="bat-summary-text" style="font-size:13px;color:var(--secondary-text-color);"></span>
                <select id="bat-filter-select" style="padding:6px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:13px;cursor:pointer;">
                  <option value="all">${this.t('battery.filter_all')}</option>
                  <option value="alert">${this.t('battery.filter_alert')}</option>
                  <option value="high">${this.t('battery.filter_critical')}</option>
                  <option value="medium">${this.t('battery.filter_low')}</option>
                  <option value="low">${this.t('battery.filter_watch')}</option>
                  <option value="ok">${this.t('battery.filter_ok')}</option>
                </select>
              </div>
            </div>

            <!-- Stat cards -->
            <div id="bat-stat-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;padding:0 20px 16px;"></div>

            <!-- Battery table -->
            <div style="padding:0 20px 20px;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:420px;">
                <thead>
                  <tr style="border-bottom:2px solid var(--divider-color);">
                    <th style="padding:8px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.device')}</th>
                    <th style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;min-width:120px;">${this.t('tables.level_col')}</th>
                    <th style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;min-width:90px;">${this.t('tables.status_col')}</th>
                  </tr>
                </thead>
                <tbody id="bat-tbody">
                  <tr><td colspan="3" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('battery.run_scan')}</td></tr>
                </tbody>
              </table>
            </div>
          </div><!-- /tab-batteries -->

          <!-- TAB CHAT IA -->
          <div id="tab-chat" class="tab-content">
            <div style="display:flex;flex-direction:column;height:calc(100vh - 220px);padding:0;">
              <div style="padding:16px 20px 12px;border-bottom:1px solid var(--divider-color);flex-shrink:0;">
                <h2 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
                  <ha-icon icon="mdi:robot-happy-outline" style="color:var(--primary-color);"></ha-icon>
                  ${this.t('chat.title')}
                </h2>
                <p style="margin:6px 0 0;font-size:12px;color:var(--secondary-text-color);">
                  ${this.t('chat.subtitle')}
                </p>
              </div>
              <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;">
                <div style="background:var(--secondary-background-color);border-radius:12px;padding:12px 16px;max-width:85%;align-self:flex-start;">
                  <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:4px;">${this.t('misc.ai_assistant')}</div>
                  <div>${this.t('chat.greeting')}</div>
                </div>
              </div>
              <div style="padding:12px 20px;border-top:1px solid var(--divider-color);flex-shrink:0;display:flex;gap:8px;align-items:flex-end;">
                <textarea id="chat-input" placeholder="${this.t('chat.placeholder')}" rows="2"
                  style="flex:1;padding:10px 14px;border-radius:12px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;font-family:inherit;resize:vertical;min-height:42px;max-height:120px;outline:none;line-height:1.4;"></textarea>
                <button id="chat-send"
                  style="padding:10px 18px;border-radius:12px;background:var(--primary-color);color:white;border:none;cursor:pointer;font-weight:600;font-size:14px;flex-shrink:0;height:42px;display:flex;align-items:center;gap:6px;">
                  <ha-icon icon="mdi:send" style="--mdc-icon-size:16px;"></ha-icon>
                  ${this.t('chat.send')}
                </button>
              </div>
            </div>
          </div><!-- /tab-chat -->

          <!-- TAB CONFIGURATION -->
          <div id="tab-config" class="tab-content">
            <div style="padding:40px;text-align:center;color:var(--secondary-text-color);">
              <ha-icon icon="mdi:loading" style="--mdc-icon-size:32px;animation:haca-spin 1s linear infinite;"></ha-icon>
              <div style="margin-top:12px;">${this.t('misc.loading_config')}</div>
            </div>
          </div><!-- /tab-config -->

        </div><!-- /section-card -->
      </div><!-- /container -->
    `;
    }

    attachListeners() {
      this.shadowRoot.querySelector('#scan-all').addEventListener('click', () => this.scanAll());

      // Chat IA
      const chatSend = this.shadowRoot.querySelector('#chat-send');
      const chatInput = this.shadowRoot.querySelector('#chat-input');
      if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => this._sendChatMessage());
        chatInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendChatMessage(); }
        });
      }

      // Recorder stat-card → navigate to recorder tab
      this.shadowRoot.querySelector('#recorder-stat-btn')?.addEventListener('click', () => this.switchTab('recorder'));

      // "Vue complète" in batteries mini-panel → go to batteries tab
      this.shadowRoot.querySelector('#goto-batteries-tab')?.addEventListener('click', () => this.switchTab('batteries'));

      // Graph toolbar
      this.shadowRoot.querySelector('#graph-reset-btn')?.addEventListener('click', () => this._graphResetZoom());
      this.shadowRoot.querySelector('#graph-export-svg-btn')?.addEventListener('click', () => this._graphExportSVG());
      this.shadowRoot.querySelector('#graph-export-png-btn')?.addEventListener('click', () => this._graphExportPNG());
      this.shadowRoot.querySelector('#graph-type-filter')?.addEventListener('change', e => this._graphApplyFilters());
      this.shadowRoot.querySelector('#graph-issues-toggle')?.addEventListener('click', () => {
        const btn = this.shadowRoot.querySelector('#graph-issues-toggle');
        this._graphIssuesOnly = !this._graphIssuesOnly;
        btn.style.background = this._graphIssuesOnly ? 'var(--error-color)' : 'var(--card-background-color)';
        btn.style.color = this._graphIssuesOnly ? 'white' : 'var(--primary-text-color)';
        this._graphApplyFilters();
      });
      this.shadowRoot.querySelector('#graph-search')?.addEventListener('input', e => this._graphSearch(e.target.value));
      this.shadowRoot.querySelector('#sidebar-close')?.addEventListener('click', () => {
        const sb = this.shadowRoot.querySelector('#graph-sidebar');
        if (sb) sb.style.display = 'none';
      });

      // Battery filter select
      this.shadowRoot.querySelector('#bat-filter-select')?.addEventListener('change', (e) => {
        this._applyBatteryFilter(e.target.value);
      });

      // Backup listeners
      this.shadowRoot.querySelector('#create-backup').addEventListener('click', () => this.createBackup());

      // Report listeners
      this.shadowRoot.querySelector('#create-report')?.addEventListener('click', () => this.generateReport());

      // Top-level tabs
      this.shadowRoot.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.dataset.tab;
          this.switchTab(tabName);
          if (tabName === 'backups') {
            this.loadBackups();
          } else if (tabName === 'reports') {
            this.loadReports();
          } else if (tabName === 'history') {
            this.loadHistory();
          } else if (tabName === 'recorder') {
            // Recorder data is already loaded via updateUI — nothing extra needed
          } else if (tabName === 'batteries') {
            // Battery data is already loaded via updateUI — nothing extra needed
          } else if (tabName === 'carte') {
            if (this._graphData) this._renderDepGraph(this._graphData);
          }
        });
      });

      // Sub-tabs inside Issues tab
      this.shadowRoot.querySelectorAll('.subtabs .subtab').forEach(subtab => {
        subtab.addEventListener('click', () => {
          this.switchSubtab(subtab.dataset.subtab);
        });
      });

      // Segment controls (3rd level: Issues / Scores)
      this.shadowRoot.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => this._switchSegment(btn));
      });

      this.shadowRoot.querySelector('#refresh-reports')?.addEventListener('click', () => this.loadReports());

      // History range selector
      this.shadowRoot.querySelector('#history-range')?.addEventListener('change', () => this.loadHistory());

      // Subscribe to new issues event from backend
      this._subscribeToNewIssues();


      // Severity filter chips
      this.shadowRoot.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          const btn = e.currentTarget;
          const filter = btn.dataset.filter;
          const targetId = btn.dataset.target;
          // Update active chip style in this filter bar
          const bar = this.shadowRoot.querySelector(`#filter-bar-${targetId}`);
          if (bar) {
            bar.querySelectorAll('.filter-chip').forEach(c => {
              c.className = 'filter-chip'; // reset
            });
            btn.classList.add(`active-${filter}`);
          }
          // Re-render with filter
          const container = this.shadowRoot.querySelector(`#${targetId}`);
          const allIssues = container?._allIssues || [];
          this.renderIssues(allIssues, targetId, filter);
        });
      });

      // CSV export buttons
      this.shadowRoot.querySelectorAll('.export-csv-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetId = e.currentTarget.dataset.target;
          const container = this.shadowRoot.querySelector(`#${targetId}`);
          const issues = container?._allIssues || [];
          this.exportCSV(issues, targetId);
        });
      });
    }

    _subscribeToNewIssues() {
      // Déjà abonné (et la souscription est encore valide) — ne pas dupliquer
      if (this._unsubNewIssues) return;
      if (!this.hass?.connection) return;

      this.hass.connection.subscribeEvents((event) => {
        if (event.event_type === 'haca_new_issues_detected') {
          const data = event.data || {};
          this.showNewIssuesNotification(data);
        }
      }, 'haca_new_issues_detected').then(unsub => {
        this._unsubNewIssues = unsub;
      }).catch(e => {
        // Peut arriver pendant une reconnexion — silencieux, réessai au prochain set hass()
        console.debug('[HACA] subscribeEvents failed (will retry on reconnect):', e?.message);
      });
    }


    // Show Home Assistant persistent notification
    async showHANotification(title, message, notificationId = 'haca_notification') {
      try {
        await this.hass.callService('persistent_notification', 'create', {
          title: title,
          message: message,
          notification_id: notificationId
        });
      } catch (error) {
        console.error('[HACA] Error creating notification:', error);
      }
    }

    showNewIssuesNotification(data) {
      const count = data.count || 0;
      const issues = data.issues || [];

      if (count === 0) return;

      // Use Home Assistant persistent notification
      const title = count === 1 ? this.t('notifications.new_issue') : `${count} ${this.t('notifications.new_issues')}`;
      let message = this.t('notifications.config_modified') + '\n\n';

      if (issues.length > 0) {
        for (let i = 0; i < Math.min(issues.length, 3); i++) {
          const issue = issues[i];
          message += `• **${issue.alias || issue.entity_id}** - ${issue.type || 'Issue'}\n`;
        }
        if (issues.length > 3) {
          message += this.t('notifications.and_others', { count: issues.length - 3 });
        }
      }

      message += `\n\n${this.t('notifications.reported_by')}`;

      this.showHANotification(title, message, 'haca_new_issues');

      // Also update the UI
      this.updateFromHass();
    }

    async loadBackups() {
      const container = this.shadowRoot.querySelector('#backups-list');
      container.innerHTML = this.t('backup.loading');
      try {
        const result = await this.hass.callWS({
          type: 'call_service',
          domain: 'config_auditor',
          service: 'list_backups',
          service_data: {},
          return_response: true
        });

        // Handle potential response wrapping (some HA versions wrap in 'response')
        let data = result;
        if (result && result.response) {
          data = result.response;
        }

        const backups = data.backups || data || [];

        // Safety check if backups is not an array
        if (!Array.isArray(backups)) {
          console.error('[HACA] Invalid backups data format:', backups);
          throw new Error(this.t('backup.error_loading'));
        }

        this.renderBackups(backups);

      } catch (error) {
        console.error('[HACA] Error loading backups:', error);
        container.innerHTML = `<div class="empty-state">❌ ${this.t('notifications.error')}: ${error.message}</div>`;
      }
    }

    renderBackups(backups) {
      const container = this.shadowRoot.querySelector('#backups-list');
      const PAG_ID = 'backups-list';
      if (backups.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            <ha-icon icon="mdi:archive-off-outline"></ha-icon>
            <p>${this.t('messages.no_backups')}</p>
        </div>`;
        return;
      }

      container._allBackups = backups;
      const st = this._pagState(PAG_ID);
      const paged = this._pagSlice(backups, st.page, st.pageSize);

      container.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>${this.t('tables.name')}</th>
            <th>${this.t('tables.date')}</th>
            <th>${this.t('tables.size')}</th>
            <th>${this.t('tables.action')}</th>
          </tr></thead>
          <tbody>
            ${paged.map(b => `
              <tr>
                <td style="font-weight:500;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <ha-icon icon="mdi:zip-box-outline" style="color:var(--secondary-text-color);flex-shrink:0;"></ha-icon>
                    <span style="word-break:break-all;">${this.escapeHtml(b.name)}</span>
                  </div>
                </td>
                <td style="white-space:nowrap;">${new Date(b.created).toLocaleString()}</td>
                <td><span style="background:var(--secondary-background-color);padding:4px 8px;border-radius:6px;font-size:12px;white-space:nowrap;">${Math.round(b.size / 1024)} KB</span></td>
                <td>
                  <div style="display:flex;gap:8px;">
                    <button class="restore-btn" data-path="${b.path}" style="background:var(--warning-color,#ff9800);color:black;">
                      <ha-icon icon="mdi:backup-restore"></ha-icon> ${this.t('actions.restore')}
                    </button>
                    <button class="delete-backup-btn" data-path="${b.path}" data-name="${b.name}" style="background:var(--error-color,#ef5350);color:white;">
                      <ha-icon icon="mdi:delete-outline"></ha-icon>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="mobile-cards">
        ${backups.map(b => `
          <div class="m-card">
            <div class="m-card-title">
              <ha-icon icon="mdi:zip-box-outline" style="color:var(--secondary-text-color);flex-shrink:0;margin-top:1px;"></ha-icon>
              ${this.escapeHtml(b.name)}
            </div>
            <div class="m-card-meta">📅 ${new Date(b.created).toLocaleString()} · ${Math.round(b.size / 1024)} KB</div>
            <div class="m-card-btns">
              <button class="restore-btn" data-path="${b.path}" style="background:var(--warning-color,#ff9800);color:black;">
                <ha-icon icon="mdi:backup-restore"></ha-icon> ${this.t('actions.restore')}
              </button>
              <button class="delete-backup-btn" data-path="${b.path}" data-name="${b.name}" style="background:var(--error-color,#ef5350);color:white;">
                <ha-icon icon="mdi:delete-outline"></ha-icon> ${this.t('actions.delete')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

      container.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.restoreBackup(e.currentTarget.dataset.path));
      });

      container.querySelectorAll('.delete-backup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.deleteBackup(e.currentTarget.dataset.path, e.currentTarget.dataset.name));
      });

      // Barre de pagination
      container.insertAdjacentHTML('beforeend',
        this._pagHTML(PAG_ID, backups.length, st.page, st.pageSize)
      );
      this._pagWire(container, () => this.renderBackups(container._allBackups));
    }

    async createBackup() {
      if (!confirm(this.t('backup.confirm_create'))) return;
      try {
        const result = await this.hass.callWS({
          type: 'call_service',
          domain: 'config_auditor',
          service: 'create_backup',
          service_data: {},
          return_response: true
        });

        this.showHANotification(this.t('notifications.report_generated'), this.t('notifications.backup_created_success'), 'haca_backup');
        this.loadBackups();
      } catch (error) {
        this.showHANotification(this.t('notifications.error'), error.message, 'haca_error');
      }
    }

    async restoreBackup(path) {
      if (!confirm(this.t('backup.confirm_restore'))) return;
      try {
        await this.hass.callService('config_auditor', 'restore_backup', { backup_path: path });
        this.showHANotification(this.t('notifications.report_generated'), this.t('notifications.backup_restored_success'), 'haca_restore');
      } catch (error) {
        this.showHANotification(this.t('notifications.error'), error.message, 'haca_error');
      }
    }

    async deleteBackup(path, name) {
      if (!confirm(this.t('backup.confirm_delete') + '\n\n' + name)) return;

      try {
        const result = await this.hass.callWS({
          type: 'call_service',
          domain: 'config_auditor',
          service: 'delete_backup',
          service_data: { backup_path: path },
          return_response: true
        });

        const response = result.response || result;

        if (response.success) {
          this.showHANotification(
            this.t('notifications.backup_deleted'),
            response.message || `${response.deleted_file}`,
            'haca_backup_deleted'
          );
          // Refresh the backups list
          this.loadBackups();
        } else {
          this.showHANotification(
            this.t('notifications.error'),
            response.error || this.t('fix.error_unknown'),
            'haca_error'
          );
        }
      } catch (error) {
        this.showHANotification(
          this.t('notifications.error'),
          error.message,
          'haca_error'
        );
      }
    }

    // ── Chat IA ──────────────────────────────────────────────────────────────

    _appendChatMsg(role, text) {
      const container = this.shadowRoot.querySelector('#chat-messages');
      if (!container) return;
      const isUser = role === 'user';
      const div = document.createElement('div');
      div.style.cssText = [
        'border-radius:12px', 'padding:12px 16px', 'max-width:85%',
        isUser ? 'align-self:flex-end;background:var(--primary-color);color:white'
          : 'align-self:flex-start;background:var(--secondary-background-color)'
      ].join(';');
      if (!isUser) {
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:11px;color:var(--secondary-text-color);margin-bottom:4px';
        lbl.textContent = this.t('misc.ai_assistant');
        div.appendChild(lbl);
      }
      const content = document.createElement('div');
      content.style.cssText = 'white-space:pre-wrap;line-height:1.5;font-size:14px';
      content.textContent = text;
      div.appendChild(content);
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }

    async _sendChatMessage() {
      const input = this.shadowRoot.querySelector('#chat-input');
      const sendBtn = this.shadowRoot.querySelector('#chat-send');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      this._appendChatMsg('user', text);

      // Build context from last scan results
      const stats = this._lastStats || {};
      const ctx = stats.total_issues != null
        ? this.t('ai_prompts.chat_context').replace('{total_issues}',stats.total_issues).replace('{automations}',stats.automations_count||0).replace('{scripts}',stats.scripts_count||0)
        : '';

      // Show typing indicator
      const typingDiv = this._appendChatMsg('assistant', '…');
      if (sendBtn) sendBtn.disabled = true;

      try {
        // ai_task.generate_data — service officiel HA pour les tâches IA.
        // IMPORTANT : ce service exige return_response=true, sinon HA retourne 400.
        // callService() accepte un 6e argument `returnResponse` (bool) qui ajoute
        // return_response:true dans le message WebSocket sous-jacent.
        // La réponse arrive dans result.response = { data: "...", conversation_id: "..." }
        let reply = null;

        try {
          const result = await this._hass.callService(
            'ai_task',
            'generate_data',
            {
              task_name: 'HACA Chat',
              instructions: ctx + text,
            },
            undefined, // target — aucun pour ai_task
            false,     // notifyOnError — on gère nous-mêmes
            true       // returnResponse — REQUIS pour récupérer la réponse
          );
          const data = result?.response?.data;
          if (data) {
            reply = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            this._chatConvId = result?.response?.conversation_id || null;
          }
        } catch (aiErr) {
          // ai_task non disponible (aucun modèle IA configuré dans HA) → fallback
          console.warn('[HACA] ai_task.generate_data indisponible:', aiErr.message);
        }

        // Fallback : conversation/process (Assist pipeline avec agent IA configuré)
        if (!reply) {
          try {
            const wsResult = await this._hass.callWS({
              type: 'conversation/process',
              text: ctx + text,
              language: this._hass.language || 'en',
              conversation_id: this._chatConvId || null,
            });
            this._chatConvId = wsResult.conversation_id;
            reply = wsResult.response?.speech?.plain?.speech
              || wsResult.response?.speech?.text
              || null;
          } catch (convErr) {
            console.warn('[HACA] conversation/process indisponible:', convErr.message);
          }
        }

        if (reply) {
          typingDiv.querySelector('div:last-child').textContent = reply;
        } else {
          typingDiv.querySelector('div:last-child').textContent = this.t('misc.no_ai_model');
        }
      } catch (e) {
        typingDiv.querySelector('div:last-child').textContent = this.t('misc.ai_error') + (e.message || String(e));
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        const container = this.shadowRoot.querySelector('#chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
      }
    }

    switchTab(tabName) {
      this.shadowRoot.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
      this.shadowRoot.querySelector(`.tabs .tab[data-tab="${tabName}"]`)?.classList.add('active');
      this.shadowRoot.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.shadowRoot.querySelector(`#tab-${tabName}`)?.classList.add('active');
      this._activeTab = tabName;
      if (tabName === 'config') this.loadConfigTab();
    }

    switchSubtab(subtabName) {
      this.shadowRoot.querySelectorAll('.subtabs .subtab').forEach(t => t.classList.remove('active'));
      this.shadowRoot.querySelector(`.subtabs .subtab[data-subtab="${subtabName}"]`)?.classList.add('active');
      this.shadowRoot.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      this.shadowRoot.querySelector(`#subtab-${subtabName}`)?.classList.add('active');
    }

    // ─── Onglet Configuration ──────────────────────────────────────────────

    async loadConfigTab() {
      const el = this.shadowRoot.querySelector('#tab-config');
      if (!el) return;

      try {
        const result = await this._hass.callWS({ type: 'haca/get_options' });
        const options = result.options || {};
        const lang = this._language || 'en';

        el.innerHTML = renderConfigTab(options, lang, this.t.bind(this));
        this._attachConfigListeners(el, options);
      } catch (err) {
        el.innerHTML = `<div style="padding:32px;text-align:center;color:var(--error-color);">
        ❌ Erreur de chargement : ${err.message}
      </div>`;
      }
    }

    _attachConfigListeners(el, options) {
      const lang = this._language || 'en';
      const t = (fr, en) => lang === 'fr' ? fr : en;

      // Compteurs initiaux
      _updateTypeCounts(el);

      // Toggle types individuels
      el.querySelectorAll('.cfg-type-toggle').forEach(cb => {
        cb.addEventListener('change', () => {
          const row = el.querySelector(`.cfg-type-row[data-type="${cb.dataset.type}"]`);
          if (row) {
            row.classList.toggle('disabled', !cb.checked);
            if (!cb.checked) row.classList.remove('enabled');
          }
          _updateTypeCounts(el);
        });
      });

      // Boutons "Tout activer / désactiver" par catégorie
      el.querySelectorAll('.cfg-cat-all-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const catId = btn.dataset.cat;
          const action = btn.dataset.action; // 'enable' | 'disable'
          const list = el.querySelector(`#types-${catId}`);
          if (!list) return;
          list.querySelectorAll('.cfg-type-toggle').forEach(cb => {
            cb.checked = (action === 'enable');
            const row = el.querySelector(`.cfg-type-row[data-type="${cb.dataset.type}"]`);
            if (row) row.classList.toggle('disabled', !cb.checked);
          });
          _updateTypeCounts(el);
        });
      });

      // Toggle monitoring → afficher/masquer délai debounce
      const monitoringCb = el.querySelector('#cfg-event-monitoring');
      const debounceRow = el.querySelector('#cfg-debounce-row');
      if (monitoringCb && debounceRow) {
        const updateDebounce = () => {
          debounceRow.style.opacity = monitoringCb.checked ? '1' : '0.4';
          const inp = debounceRow.querySelector('input');
          if (inp) inp.disabled = !monitoringCb.checked;
        };
        monitoringCb.addEventListener('change', updateDebounce);
        updateDebounce();
      }

      // Bouton Réinitialiser
      el.querySelector('#cfg-reset-btn')?.addEventListener('click', () => {
        if (confirm(this.t('toast.config_reset_confirm'))) {
          el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--secondary-text-color);">
          <ha-icon icon="mdi:loading" style="--mdc-icon-size:32px;animation:haca-spin 1s linear infinite;"></ha-icon>
          <div style="margin-top:12px;">${this.t('config.resetting')}</div>
        </div>`;
          this.saveConfig(DEFAULT_OPTIONS).then(() => this.loadConfigTab());
        }
      });

      // Bouton Enregistrer
      el.querySelector('#cfg-save-btn')?.addEventListener('click', () => this._doSaveConfig(el));

      // Toggle debug — état restauré depuis options (persisté dans entry.options)
      // L'état est sauvegardé via le bouton Enregistrer (inclus dans collectFormOptions)
      // set_log_level est appliqué côté backend lors du save_options.
      const debugToggle = el.querySelector('#cfg-debug-toggle');
      if (debugToggle) {
        // Restaurer depuis les options HA (source de vérité persistante)
        debugToggle.checked = !!(options.debug_mode);
        window.__haca_debug_mode = debugToggle.checked;
      }
    }

    async _doSaveConfig(el) {
      const lang = this._language || 'en';
      const t = (fr, en) => lang === 'fr' ? fr : en;
      const statusEl = el.querySelector('#cfg-save-status');
      const saveBtn = el.querySelector('#cfg-save-btn');

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';
        saveBtn.innerHTML = '<span class="btn-loader"></span> ' + this.t('config.saving');
      }

      try {
        const options = collectFormOptions(el);
        await this.saveConfig(options);

        if (statusEl) {
          // Vérifier si event_monitoring a changé (nécessite un redémarrage HA pour s'appliquer)
          const prevMonitoring = this._lastSavedOptions?.event_monitoring_enabled;
          const newMonitoring = options.event_monitoring_enabled;
          const monitoringChanged = prevMonitoring !== undefined && prevMonitoring !== newMonitoring;

          statusEl.className = 'cfg-save-status success';
          statusEl.textContent = monitoringChanged
            ? '✅ ' + t(
              this.t('toast.config_saved_restart'))
            : '✅ ' + this.t('toast.config_saved');
          statusEl.style.display = 'block';
          this._lastSavedOptions = options;
          setTimeout(() => { statusEl.style.display = 'none'; }, monitoringChanged ? 6000 : 3500);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.className = 'cfg-save-status error';
          statusEl.textContent = '❌ ' + this.t('config.save_error') + err.message;
          statusEl.style.display = 'block';
        }
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          saveBtn.innerHTML = '<ha-icon icon="mdi:content-save" style="--mdc-icon-size:18px;"></ha-icon> ' + this.t('config.save');
        }
      }
    }

    async saveConfig(options) {
      await this._hass.callWS({ type: 'haca/save_options', options });
    }

    async loadData() {
      if (!this._hass) return;
      // Garde de concurrence : évite d'empiler des appels si le précédent est encore en cours
      if (this._dataLoading) return;
      this._dataLoading = true;
      try {
        const result = await this._hass.callWS({ type: 'haca/get_data' });
        this._cachedData = result;
        _HC.data = result;           // cache module : survive aux navigations
        this._dataErrorCount = 0;
        this.updateUI(result);
        // Hide the boot splash on first successful data load
        this._hideBootSplash();
      } catch (error) {
        this._dataErrorCount = (this._dataErrorCount || 0) + 1;
        const msg = error?.message || String(error);
        // Erreurs de reconnexion WS → silencieuses (le watchdog relancera loadData)
        const isWsReconnect = msg.includes('not_found') ||
          msg.includes('Connection lost') ||
          msg.includes('Lost connection') ||
          msg.includes('Subscription not found');
        // HACA backend not yet available (HA still starting up) — keep splash, retry
        const isHacaNotReady = msg.includes('unknown_command') ||
          msg.includes('haca/get_data') ||
          msg.includes('Unknown command');
        if (isWsReconnect || isHacaNotReady) {
          console.debug('[HACA] loadData: backend not ready, will retry…');
          // Ensure boot splash stays visible during startup retry loop
          this._showBootSplash();
          if (!this._bootRetryTimer) {
            this._bootRetryTimer = setInterval(() => {
              if (!this._connected || !this._hass) return;
              console.debug('[HACA] Boot retry…');
              this.loadData().then(() => {
                // Success handled inside loadData (hideBootSplash called there)
                clearInterval(this._bootRetryTimer);
                this._bootRetryTimer = null;
              });
            }, 5000);
          }
        } else {
          console.error('[HACA] Error loading data:', error);
          const el = this.shadowRoot.querySelector('#issues-all');
          if (el) el.innerHTML = `<div class="empty-state">❌ ${msg}</div>`;
        }
      } finally {
        // Libère le verrou dans tous les cas (succès, erreur, ou rejet de Promise)
        this._dataLoading = false;
      }
    }

    updateUI(data) {
      this._lastData = data;

      const safeSetText = (id, val) => {
        const el = this.shadowRoot.querySelector(`#${id}`);
        if (el) el.textContent = val;
      };

      const score = data.health_score || 0;
      safeSetText('health-score', score + '%');

      // Health score card colour
      const hsCard = this.shadowRoot.querySelector('#health-score-card');
      if (hsCard) {
        const col = score >= 80 ? 'var(--success-color,#4caf50)'
          : score >= 50 ? 'var(--warning-color,#ffa726)'
            : 'var(--error-color,#ef5350)';
        hsCard.style.borderLeft = `5px solid ${col}`;
      }

      // Update Issues tab badge with total issue count
      const totalIssues = (data.automation_issues || 0) + (data.script_issues || 0)
        + (data.scene_issues || 0) + (data.entity_issues || 0) + (data.performance_issues || 0)
        + (data.security_issues || 0) + (data.blueprint_issues || 0) + (data.dashboard_issues || 0);
      const issuesTab = this.shadowRoot.querySelector('.tabs .tab[data-tab="issues"]');
      if (issuesTab) {
        const existingBadge = issuesTab.querySelector('.tab-count');
        if (existingBadge) existingBadge.remove();
        if (totalIssues > 0) {
          const badge = document.createElement('span');
          badge.className = 'tab-count';
          badge.textContent = totalIssues;
          badge.style.cssText = 'background:var(--error-color,#ef5350);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:4px;';
          issuesTab.appendChild(badge);
        }
      }

      // Load sparkline (async, non-blocking)
      this._loadSparkline();
      safeSetText('auto-count', data.automation_issues || 0);
      safeSetText('script-count', data.script_issues || 0);
      safeSetText('scene-count', data.scene_issues || 0);
      safeSetText('entity-count', data.entity_issues || 0);
      safeSetText('perf-count', data.performance_issues || 0);
      safeSetText('security-count', data.security_issues || 0);
      safeSetText('blueprint-count', data.blueprint_issues || 0);
      safeSetText('dashboard-count', data.dashboard_issues || 0);

      // ── Recorder orphans ──────────────────────────────────────────────
      this._updateRecorderOrphans(data);

      // ── Complexity / stats tables ─────────────────────────────────────
      this._renderComplexityTable(data.complexity_scores || []);

      // ── Dependency graph ─────────────────────────────────────────────
      this._graphData = data.dependency_graph || { nodes: [], edges: [] };
      if (this._activeTab === 'carte') {
        this._renderDepGraph(this._graphData);
      }

      // ── Battery monitor ───────────────────────────────────────────────
      this._renderBatteryTables(data.battery_list || []);
      // Badge on batteries tab
      const batAlerts = data.battery_alerts || 0;
      const batBadge = this.shadowRoot.querySelector('#tab-badge-batteries');
      if (batBadge) {
        batBadge.textContent = batAlerts;
        batBadge.style.display = batAlerts > 0 ? 'inline' : 'none';
      }
      this._renderScriptComplexityTable(data.script_complexity_scores || []);
      this._renderSceneStatsTable(data.scene_stats || []);
      this._renderBlueprintStatsTable(data.blueprint_stats || []);

      const autoIssues = data.automation_issue_list || [];
      const scriptIssues = data.script_issue_list || [];
      const sceneIssues = data.scene_issue_list || [];
      const entityIssues = data.entity_issue_list || [];
      const perfIssues = data.performance_issue_list || [];
      const securityIssues = data.security_issue_list || [];
      const blueprintIssues = data.blueprint_issue_list || [];
      const dashboardIssues = data.dashboard_issue_list || [];
      const allIssues = [...autoIssues, ...scriptIssues, ...sceneIssues, ...entityIssues, ...perfIssues, ...securityIssues, ...blueprintIssues, ...dashboardIssues];

      // ── Preserve active filters across refreshes ──────────────────────────
      // Read the currently active filter for each container from the DOM chips,
      // then reapply after renderIssues so auto-refresh never resets the view.
      const getActiveFilter = (containerId) => {
        const bar = this.shadowRoot.querySelector(`#filter-bar-${containerId}`);
        if (!bar) return 'all';
        const active = bar.querySelector('[class*="active-"]');
        if (!active) return 'all';
        const cls = [...active.classList].find(c => c.startsWith('active-'));
        return cls ? cls.replace('active-', '') : 'all';
      };

      const containers = [
        ['issues-all', allIssues],
        ['issues-automations', autoIssues],
        ['issues-scripts', scriptIssues],
        ['issues-scenes', sceneIssues],
        ['issues-entities', entityIssues],
        ['issues-performance', perfIssues],
        ['issues-security', securityIssues],
        ['issues-blueprints', blueprintIssues],
        ['issues-dashboards', dashboardIssues],
      ];

      for (const [cid, issues] of containers) {
        const activeFilter = getActiveFilter(cid);
        // Always store the full list (needed for future filter changes)
        const container = this.shadowRoot.querySelector(`#${cid}`);
        if (container) container._allIssues = issues;
        // Render with the currently active filter
        this.renderIssues(issues, cid, activeFilter === 'all' ? undefined : activeFilter);
        // Restore chip active state (renderIssues doesn't touch chips)
        this._restoreFilterChip(cid, activeFilter);
      }
    }


    _updateRecorderOrphans(data) {
      const orphans = data.recorder_orphans || [];
      const count = data.recorder_orphan_count || 0;
      const mb = data.recorder_wasted_mb || 0;
      const dbOk = data.recorder_db_available !== false;

      // Stat card
      const countEl = this.shadowRoot.querySelector('#recorder-orphan-count');
      const mbEl = this.shadowRoot.querySelector('#recorder-orphan-mb');
      if (countEl) countEl.textContent = dbOk ? count : '—';
      if (mbEl) mbEl.textContent = dbOk ? (mb > 0 ? this.t('recorder.wasted_mb', { mb }) : this.t('recorder.db_clean')) : this.t('recorder.db_unavailable_short');

      // Badge on sub-section header
      const badge = this.shadowRoot.querySelector('#recorder-db-badge');
      if (badge) {
        if (!dbOk) {
          badge.textContent = this.t('recorder.unavailable_badge'); badge.style.display = '';
        } else if (count > 0) {
          badge.textContent = `${count} orphelin(s) · ~${mb} MB`; badge.style.display = '';
        } else {
          badge.style.display = 'none';
        }
      }

      // Purge-all button
      const purgeAllBtn = this.shadowRoot.querySelector('#recorder-purge-all-btn');
      if (purgeAllBtn) {
        purgeAllBtn.style.display = (dbOk && count > 0) ? '' : 'none';
        purgeAllBtn.onclick = () => this._purgeRecorderOrphans(orphans.map(o => o.entity_id));
      }

      // Orphan list
      const listEl = this.shadowRoot.querySelector('#recorder-orphan-list');
      if (!listEl) return;

      if (!dbOk) {
        listEl.innerHTML = `<div style="color:var(--secondary-text-color);padding:16px 0;">
        <ha-icon icon="mdi:database-off-outline"></ha-icon>
        ${this.t('recorder.db_unavailable')}
      </div>`;
        return;
      }

      if (orphans.length === 0) {
        listEl.innerHTML = `<div style="color:var(--success-color,#4caf50);padding:16px 0;display:flex;align-items:center;gap:8px;">
        <ha-icon icon="mdi:database-check-outline"></ha-icon>
        ${this.t('recorder.no_orphans')}
      </div>`;
        return;
      }

      // Render table with pagination
      const PAG_ID = 'recorder-orphan-list';
      listEl._allOrphans = orphans;
      const st = this._pagState(PAG_ID);
      const pagedOrphans = this._pagSlice(orphans, st.page, st.pageSize);

      listEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;">
        <thead>
          <tr style="border-bottom:2px solid var(--divider-color);text-align:left;">
            <th style="padding:8px 12px;width:32px;">
              <input type="checkbox" id="recorder-select-all" title="${this.t('recorder.select_all')}">
            </th>
            <th style="padding:8px 12px;">${this.t('tables.entity_id_col')}</th>
            <th style="padding:8px 12px;text-align:right;">${this.t('recorder.states_col')}</th>
            <th style="padding:8px 12px;text-align:right;">${this.t('tables.stats_col')}</th>
            <th style="padding:8px 12px;text-align:right;">${this.t('recorder.size_col')}</th>
            <th style="padding:8px 12px;text-align:center;">${this.t('tables.action_col')}</th>
          </tr>
        </thead>
        <tbody>
          ${pagedOrphans.map((o, idx) => `
            <tr style="border-bottom:1px solid var(--divider-color);">
              <td style="padding:8px 12px;">
                <input type="checkbox" class="recorder-orphan-cb" data-entity="${this.escapeHtml(o.entity_id)}" checked>
              </td>
              <td style="padding:8px 12px;font-family:monospace;color:var(--primary-text-color);">
                ${this.escapeHtml(o.entity_id)}
                ${o.has_stats ? '<span style="font-size:10px;background:var(--info-color,#26c6da);color:#fff;padding:1px 5px;border-radius:8px;margin-left:4px;">stats</span>' : ''}
              </td>
              <td style="padding:8px 12px;text-align:right;color:var(--secondary-text-color);">${o.state_rows.toLocaleString()}</td>
              <td style="padding:8px 12px;text-align:right;color:var(--secondary-text-color);">${o.stat_rows.toLocaleString()}</td>
              <td style="padding:8px 12px;text-align:right;font-weight:600;color:#ff7043;">
                ${o.est_mb >= 0.1 ? o.est_mb + ' MB' : '<1 KB'}
              </td>
              <td style="padding:8px 12px;text-align:center;">
                <button class="recorder-purge-one" data-entity="${this.escapeHtml(o.entity_id)}"
                  style="font-size:11px;padding:4px 10px;background:#ff7043;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                  <ha-icon icon="mdi:delete-outline" style="--mdc-icon-size:13px;"></ha-icon> ${this.t('misc.purge_btn')}
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;color:var(--secondary-text-color);">
          ${this.t('recorder.estimated_total', {mb, count})}
        </span>
        <button id="recorder-purge-selected-btn" style="background:#ff7043;color:#fff;font-size:12px;padding:6px 14px;">
          <ha-icon icon="mdi:delete-sweep-outline" style="--mdc-icon-size:15px;"></ha-icon> ${this.t('misc.purge_selection')}
        </button>
      </div>`;

      // Wire up select-all
      const selectAll = listEl.querySelector('#recorder-select-all');
      if (selectAll) {
        selectAll.addEventListener('change', (e) => {
          listEl.querySelectorAll('.recorder-orphan-cb').forEach(cb => cb.checked = e.target.checked);
        });
      }

      // Wire up individual purge buttons
      listEl.querySelectorAll('.recorder-purge-one').forEach(btn => {
        btn.addEventListener('click', () => this._purgeRecorderOrphans([btn.dataset.entity]));
      });

      // Wire up purge-selected button
      const purgeSelBtn = listEl.querySelector('#recorder-purge-selected-btn');
      if (purgeSelBtn) {
        purgeSelBtn.addEventListener('click', () => {
          const selected = [...listEl.querySelectorAll('.recorder-orphan-cb:checked')]
            .map(cb => cb.dataset.entity);
          if (selected.length === 0) { alert(this.t('recorder.no_entity_selected')); return; }
          this._purgeRecorderOrphans(selected);
        });
      }

      // Barre de pagination
      listEl.insertAdjacentHTML('beforeend',
        this._pagHTML(PAG_ID, orphans.length, st.page, st.pageSize)
      );
      this._pagWire(listEl, () => {
        // Re-render depuis le cache data complet
        if (this._lastData) this._updateRecorderOrphans(this._lastData);
      });
    }

    _purgeRecorderOrphans(entityIds) {
      console.error('[HACA Purge] _purgeRecorderOrphans called, entityIds:', entityIds);
      if (!entityIds || entityIds.length === 0) {
        console.error('[HACA Purge] Empty entityIds, aborting');
        return;
      }

      // Remove any existing modal
      document.getElementById('haca-purge-modal')?.remove();

      const preview = entityIds.slice(0, 6).map(e =>
        `<li style="font-family:monospace;font-size:12px;padding:2px 0;">${this.escapeHtml(e)}</li>`
      ).join('');
      const more = entityIds.length > 6
        ? `<li style="color:var(--secondary-text-color);font-size:12px;">...et ${entityIds.length - 6} autre(s)</li>` : '';

      // Append to document.body so position:fixed works regardless of panel ancestors
      const modal = document.createElement('div');
      modal.id = 'haca-purge-modal';
      modal.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0', 'z-index:99999',
        'background:rgba(0,0,0,0.6)', 'display:flex', 'align-items:center',
        'justify-content:center',
      ].join(';');

      const box = document.createElement('div');
      box.style.cssText = [
        'background:#1e1e2e', 'border-radius:12px', 'padding:28px',
        'max-width:480px', 'width:90%', 'box-shadow:0 8px 40px rgba(0,0,0,0.5)',
        'color:#e0e0e0',
      ].join(';');
      box.innerHTML = `
      <h3 style="margin:0 0 12px;font-size:18px;color:#fff;">
        ${this.t('recorder.purge_confirm_title')}
      </h3>
      <p style="margin:0 0 12px;font-size:14px;opacity:0.8;">
        ${this.t('recorder.purge_confirm_body').replace('{count}', entityIds.length)}
      </p>
      <ul style="margin:0 0 20px;padding-left:16px;">${preview}${more}</ul>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="haca-purge-cancel"
          style="padding:8px 18px;border-radius:6px;border:1px solid #555;background:#333;color:#fff;cursor:pointer;font-size:14px;">
          ${this.t('actions.cancel')}
        </button>
        <button id="haca-purge-confirm"
          style="padding:8px 18px;border-radius:6px;border:none;background:#ff7043;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">
          ${this.t('recorder.purge_button').replace('{count}', entityIds.length)}
        </button>
      </div>`;

      modal.appendChild(box);
      document.body.appendChild(modal);
      console.error('[HACA Purge] Modal appended to document.body');

      const cancelBtn = document.getElementById('haca-purge-cancel');
      const confirmBtn = document.getElementById('haca-purge-confirm');
      console.error('[HACA Purge] cancelBtn:', cancelBtn, 'confirmBtn:', confirmBtn);

      cancelBtn.addEventListener('click', () => { console.error('[HACA Purge] Cancelled'); modal.remove(); });
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      confirmBtn.addEventListener('click', async () => {
        console.error('[HACA Purge] Confirm clicked, entityIds:', entityIds);
        confirmBtn.disabled = true;
        confirmBtn.textContent = this.t('recorder.purge_in_progress');

        const hass = this._hass;
        console.error('[HACA Purge] this._hass:', hass);
        if (!hass || !hass.callWS) {
          console.error('[HACA Purge] _hass or callWS is missing!');
          modal.remove();
          this._this.showToast(this.t('recorder.purge_error_conn'), 'error');
          return;
        }

        try {
          console.error('[HACA Purge] Calling haca/purge_recorder_orphans via callWS');
          const result = await hass.callWS({
            type: 'haca/purge_recorder_orphans',
            entity_ids: entityIds,
          });
          console.error('[HACA Purge] callWS success, result:', result);
          modal.remove();
          // Optimistic update: remove purged entities from the list immediately
          // so the user sees the effect at once without waiting for the DB rescan.
          this._removeOrphansFromUI(entityIds);
          // No automatic rescan — the DB WAL checkpoint needs time to propagate.
          // The UI is updated optimistically via _removeOrphansFromUI already.
          this._showToast('✅ ' + this.t('toast.purged_n').replace('{count}', entityIds.length), 'success');
        } catch (err) {
          console.error('[HACA Purge] callWS error:', err);
          modal.remove();
          this._this.showToast(this.t('recorder.purge_error').replace('{error}', err.message || String(err)), 'error');
        }
      });
    }

    _showToast(message, type = 'info') {
      document.getElementById('haca-toast')?.remove();
      const toast = document.createElement('div');
      toast.id = 'haca-toast';
      const bg = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#1976d2';
      toast.style.cssText = [
        'position:fixed', 'bottom:28px', 'left:50%', 'transform:translateX(-50%)',
        'z-index:100000', `background:${bg}`, 'color:#fff', 'padding:14px 28px',
        'border-radius:8px', 'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
        'font-size:14px', 'max-width:90%', 'text-align:center', 'font-weight:500',
      ].join(';');
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 7000);
    }

    _removeOrphansFromUI(purgedIds) {
      const purgedSet = new Set(purgedIds);

      // Update the orphan count badge
      const countEl = this.shadowRoot.querySelector('#recorder-orphan-count');
      const mbEl = this.shadowRoot.querySelector('#recorder-orphan-mb');
      const badge = this.shadowRoot.querySelector('#recorder-db-badge');

      // Remove rows from the table
      const listEl = this.shadowRoot.querySelector('#recorder-orphan-list');
      if (listEl) {
        purgedIds.forEach(eid => {
          // Find the row by its checkbox data-entity attribute
          const cb = listEl.querySelector(`.recorder-orphan-cb[data-entity="${CSS.escape(eid)}"]`);
          if (cb) cb.closest('tr')?.remove();
          // Also match purge-one buttons
          const btn = listEl.querySelector(`.recorder-purge-one[data-entity="${CSS.escape(eid)}"]`);
          if (btn) btn.closest('tr')?.remove();
        });

        // Update remaining count in the stat card
        const remaining = listEl.querySelectorAll('.recorder-orphan-cb').length;
        if (countEl) countEl.textContent = remaining;
        if (remaining === 0) {
          if (mbEl) mbEl.textContent = this.t('recorder.db_clean_rescanning');
          if (badge) badge.style.display = 'none';
          listEl.innerHTML = `<div style="color:#4caf50;padding:16px 0;display:flex;align-items:center;gap:8px;">
          ${this.t('recorder.no_orphans_rescanning')}
        </div>`;
          // Hide purge-all button
          const purgeAllBtn = this.shadowRoot.querySelector('#recorder-purge-all-btn');
          if (purgeAllBtn) purgeAllBtn.style.display = 'none';
        }
      }
    }


// ── pagination.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  PAGINATION — mixin partagé par tous les onglets HACA
  //
  //  _HC.pagination[id] = { page: 0, pageSize: 10 }
  //  persist dans le cache module → survit aux navigations HA.
  // ═══════════════════════════════════════════════════════════════════════

  /** Lecture de l'état de pagination d'un conteneur. */
  _pagState(id) {
    if (!_HC.pagination)  _HC.pagination = {};
    if (!_HC.pagination[id]) _HC.pagination[id] = { page: 0, pageSize: 10 };
    return _HC.pagination[id];
  }

  /** Mise à jour et re-render immédiat. */
  _pagSet(id, patch, rerenderFn) {
    const st = this._pagState(id);
    Object.assign(st, patch);
    rerenderFn();
  }

  /** Tranche d'items pour la page courante. */
  _pagSlice(items, page, pageSize) {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }

  /**
   * Génère le HTML de la barre de pagination.
   * @param {string}   id         identifiant unique du conteneur
   * @param {number}   total      nombre total d'items
   * @param {number}   page       page courante (0-indexed)
   * @param {number}   pageSize   items par page
   * @returns {string} HTML à injecter sous la liste
   */
  _pagHTML(id, total, page, pageSize) {
    if (total === 0) {
      // Même sans items : afficher le sélecteur de taille pour que l'utilisateur sache qu'il existe
      return `<div class="pag-bar" data-pag-id="${id}"
        style="display:flex;align-items:center;gap:8px;padding:10px 4px 4px;
               border-top:1px solid var(--divider-color);margin-top:8px;">
        <span style="font-size:12px;color:var(--secondary-text-color);">${this.t('pagination.show')}</span>
        ${[10,50,100].map(n => `<button class="pag-size" data-pag-id="${id}" data-size="${n}"
          style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;
                 border:1px solid var(--divider-color);cursor:pointer;
                 background:${pageSize===n?'var(--primary-color)':'var(--secondary-background-color)'};
                 color:${pageSize===n?'#fff':'var(--primary-text-color)'};">${n}</button>`).join('')}
        <span style="font-size:12px;color:var(--secondary-text-color);margin-left:auto;">${this.t('pagination.empty')}</span>
      </div>`;
    }
    const totalPages = Math.ceil(total / pageSize);
    const from = page * pageSize + 1;
    const to   = Math.min((page + 1) * pageSize, total);

    const sizeBtn = (n) => `
      <button class="pag-size" data-pag-id="${id}" data-size="${n}"
        style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid var(--divider-color);
               background:${pageSize === n ? 'var(--primary-color)' : 'var(--secondary-background-color)'};
               color:${pageSize === n ? '#fff' : 'var(--primary-text-color)'};cursor:pointer;">
        ${n}
      </button>`;

    const navBtn = (label, icon, disabled, targetPage) => `
      <button class="pag-nav" data-pag-id="${id}" data-page="${targetPage}"
        ${disabled ? 'disabled' : ''}
        style="padding:4px 10px;border-radius:6px;font-size:12px;border:1px solid var(--divider-color);
               background:var(--secondary-background-color);color:var(--primary-text-color);
               cursor:${disabled ? 'default' : 'pointer'};opacity:${disabled ? '0.4' : '1'};
               display:flex;align-items:center;gap:4px;">
        <ha-icon icon="${icon}" style="--mdc-icon-size:15px;"></ha-icon>${label}
      </button>`;

    return `
      <div class="pag-bar" data-pag-id="${id}"
        style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
               gap:8px;padding:12px 4px 4px;border-top:1px solid var(--divider-color);margin-top:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:var(--secondary-text-color);">${this.t('pagination.show')}</span>
          ${sizeBtn(10)}${sizeBtn(50)}${sizeBtn(100)}
        </div>
        <span style="font-size:12px;color:var(--secondary-text-color);">
          ${from}–${to} sur <strong>${total}</strong>
        </span>
        <div style="display:flex;gap:6px;">
          ${navBtn(this.t('pagination.prev'), 'mdi:chevron-left',  page === 0,              page - 1)}
          ${navBtn(this.t('pagination.next'), 'mdi:chevron-right', page >= totalPages - 1,  page + 1)}
        </div>
      </div>`;
  }

  /**
   * Branche les événements de la barre de pagination dans un conteneur DOM.
   * rerenderFn() sera appelée après chaque changement d'état.
   */
  _pagWire(container, rerenderFn) {
    container.querySelectorAll('.pag-size').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.pagId;
        const size = parseInt(btn.dataset.size);
        this._pagSet(id, { pageSize: size, page: 0 }, rerenderFn);
      });
    });
    container.querySelectorAll('.pag-nav').forEach(btn => {
      if (btn.disabled) return;
      btn.addEventListener('click', () => {
        const id   = btn.dataset.pagId;
        const pg   = parseInt(btn.dataset.page);
        this._pagSet(id, { page: pg }, rerenderFn);
      });
    });
  }

// ── history.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  AUDIT HISTORY
  // ═══════════════════════════════════════════════════════════════════════

  async _loadSparkline() {
    if (this._sparklineLoading) return;
    this._sparklineLoading = true;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_history', limit: 30 });
      const history = result.history || [];
      this._renderSparkline(history);
      this._renderHealthTrend(history);
    } catch (e) {
      // Non-fatal — sparkline is decorative
    } finally {
      this._sparklineLoading = false;
    }
  }

  _renderSparkline(history) {
    const svg = this.shadowRoot.querySelector('#sparkline-svg');
    if (!svg || history.length < 2) return;

    const scores = history.map(h => h.score);
    const W = svg.clientWidth || 200;
    const H = 52;
    const pad = 4;
    const minS = Math.max(0, Math.min(...scores) - 5);
    const maxS = Math.min(100, Math.max(...scores) + 5);
    const range = maxS - minS || 1;

    const xs = scores.map((_, i) => pad + (i / (scores.length - 1)) * (W - pad * 2));
    const ys = scores.map(s => H - pad - ((s - minS) / range) * (H - pad * 2));

    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
    const area = `M${xs[0]},${H} ` + xs.map((x, i) => `L${x},${ys[i]}`).join(' ') + ` L${xs[xs.length-1]},${H} Z`;

    const col = 'var(--primary-color)';
    svg.innerHTML = `
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${col}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#sparkGrad)"/>
      <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>
      ${xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="2.5" fill="${col}" opacity="0.7"/>`).join('')}
    `;
  }

  _renderHealthTrend(history) {
    const el = this.shadowRoot.querySelector('#health-score-trend');
    if (!el || history.length < 2) return;
    const last  = history[history.length - 1].score;
    const prev  = history[history.length - 2].score;
    const delta = last - prev;
    if (delta === 0) {
      el.textContent = this.t('history.stable');
      el.style.color = 'var(--secondary-text-color)';
    } else if (delta > 0) {
      el.textContent = this.t('history.trend_up').replace('{delta}', delta);
      el.style.color = 'var(--success-color,#4caf50)';
    } else {
      el.textContent = this.t('history.trend_down').replace('{delta}', delta);
      el.style.color = 'var(--error-color,#ef5350)';
    }
  }

  async loadHistory() {
    const rangeEl = this.shadowRoot.querySelector('#history-range');
    const limit = parseInt(rangeEl?.value || '30');

    try {
      const result = await this._hass.callWS({ type: 'haca/get_history', limit });
      const history = result.history || [];
      this._renderHistoryChart(history);
      this._renderHistorySummary(history);
      this._renderHistoryTable(history);
    } catch (e) {
      const tbody = this.shadowRoot.querySelector('#history-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--error-color);">${this.t('history.error')}${e.message}</td></tr>`;
    }
  }

  _renderHistoryChart(history) {
    const svg = this.shadowRoot.querySelector('#history-chart-svg');
    if (!svg || history.length < 2) return;

    const W = svg.clientWidth || 600;
    const H = 180;
    const padL = 40, padR = 12, padT = 12, padB = 8;
    const scores = history.map(h => h.score);
    const minS = 0, maxS = 100;

    const toX = i => padL + (i / (scores.length - 1)) * (W - padL - padR);
    const toY = s => padT + ((maxS - s) / (maxS - minS)) * (H - padT - padB);

    const xs = scores.map((_, i) => toX(i));
    const ys = scores.map(s => toY(s));

    // Grid lines at 0, 25, 50, 75, 100
    const grid = [0, 25, 50, 75, 100].map(v => {
      const y = toY(v);
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"
        stroke="var(--divider-color)" stroke-width="0.5" stroke-dasharray="${v === 0 || v === 100 ? '' : '3,3'}"/>
        <text x="${padL - 4}" y="${y}" text-anchor="end" font-size="9"
          fill="var(--secondary-text-color)" dominant-baseline="middle">${v}</text>`;
    }).join('');

    const area = `M${xs[0]},${H - padB} ` + xs.map((x, i) => `L${x},${ys[i]}`).join(' ')
      + ` L${xs[xs.length-1]},${H - padB} Z`;
    const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');

    // Dots with hit areas
    const dots = xs.map((x, i) => {
      const s = scores[i];
      const col = s >= 80 ? '#4caf50' : s >= 50 ? '#ffa726' : '#ef5350';
      return `<circle class="hist-dot" cx="${x}" cy="${ys[i]}" r="4"
        fill="${col}" stroke="var(--card-background-color)" stroke-width="2"
        data-idx="${i}" style="cursor:pointer;"/>`;
    }).join('');

    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0.02"/>
        </linearGradient>
        <clipPath id="chartClip">
          <rect x="${padL}" y="${padT}" width="${W - padL - padR}" height="${H - padT - padB}"/>
        </clipPath>
      </defs>
      ${grid}
      <g clip-path="url(#chartClip)">
        <path d="${area}" fill="url(#chartGrad)"/>
        <path d="${line}" fill="none" stroke="var(--primary-color)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      </g>
      ${dots}
    `;

    // Tooltip on dot hover
    const tooltip = this.shadowRoot.querySelector('#history-tooltip');
    svg.querySelectorAll('.hist-dot').forEach(dot => {
      const _posTooltip = (e) => {
        const tipW = tooltip.offsetWidth || 180;
        const tipH = tooltip.offsetHeight || 64;
        // e.offsetX/Y gives coordinates relative to the SVG element — no getBoundingClientRect needed
        const mx = e.offsetX;
        const my = e.offsetY;
        const svgW = svg.clientWidth  || 600;
        const svgH = svg.clientHeight || 300;
        let left = mx + 14;
        if (left + tipW > svgW - 4) left = mx - tipW - 14;
        left = Math.max(4, left);
        let top = my - tipH - 8;
        if (top < 4) top = my + 18;
        top = Math.min(svgH - tipH - 4, Math.max(4, top));
        tooltip.style.left = `${left}px`;
        tooltip.style.top  = `${top}px`;
      };
      dot.addEventListener('mouseenter', (e) => {
        const idx = parseInt(dot.dataset.idx);
        const entry = history[idx];
        if (!tooltip || !entry) return;
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div style="font-weight:700;margin-bottom:4px;">${entry.date} ${entry.time}</div>
          <div>${this.t('history.score_tooltip')} <strong style="color:${scores[idx] >= 80 ? '#4caf50' : scores[idx] >= 50 ? '#ffa726' : '#ef5350'}">${entry.score}%</strong></div>
          <div style="color:var(--secondary-text-color);font-size:11px;margin-top:2px;">${this.t('history.issues_total').replace('{total}', entry.total)}</div>`;
        _posTooltip(e);
      });
      dot.addEventListener('mousemove', (e) => { if (tooltip.style.display !== 'none') _posTooltip(e); });
      dot.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.display = 'none';
      });
    });

    // X-axis labels (show ~5 evenly spaced)
    const xLabels = this.shadowRoot.querySelector('#history-x-labels');
    if (xLabels) {
      const step = Math.max(1, Math.floor(history.length / 5));
      const labelItems = history
        .filter((_, i) => i % step === 0 || i === history.length - 1)
        .map(h => `<span>${h.date.slice(5)}</span>`)
        .join('');
      xLabels.innerHTML = labelItems;
    }
  }

  _renderHistorySummary(history) {
    const el = this.shadowRoot.querySelector('#history-summary');
    if (!el || history.length === 0) return;

    const scores = history.map(h => h.score);
    const latest = history[history.length - 1];
    const best   = Math.max(...scores);
    const worst  = Math.min(...scores);
    const avg    = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const trend7 = history.length >= 7
      ? latest.score - history[history.length - 7].score : null;

    const card = (icon, label, value, color='var(--primary-text-color)') =>
      `<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 14px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--secondary-text-color);letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
        <div style="font-size:22px;font-weight:700;color:${color};">${value}</div>
      </div>`;

    el.innerHTML = [
      card('mdi:star', this.t('history.best'), best + '%', '#4caf50'),
      card('mdi:alert', this.t('history.worst'), worst + '%', worst < 50 ? '#ef5350' : 'var(--primary-text-color)'),
      card('mdi:approximately-equal', this.t('history.avg'), avg + '%'),
      trend7 !== null
        ? card('mdi:trending-up', this.t('history.trend_7d'),
            (trend7 >= 0 ? '+' : '') + trend7 + ' pts',
            trend7 > 0 ? '#4caf50' : trend7 < 0 ? '#ef5350' : 'var(--secondary-text-color)')
        : '',
      card('mdi:counter', this.t('history.scans'), history.length),
    ].join('');
  }

  _renderHistoryTable(history) {
    const tbody = this.shadowRoot.querySelector('#history-tbody');
    if (!tbody) return;

    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('history.no_data')}</td></tr>`;
      this._updateHistoryDeleteBar();
      return;
    }

    // Most recent first
    const reversed = [...history].reverse();

    // ── Pagination ──────────────────────────────────────────────────────
    const PAG_ID = 'history-tbody';
    const st = this._pagState(PAG_ID);
    const paged = this._pagSlice(reversed, st.page, st.pageSize);

    tbody.innerHTML = paged.map((entry, i) => {
      const prev = reversed[i + 1];
      const delta = prev ? entry.score - prev.score : null;
      const deltaStr = delta === null ? '—'
        : delta > 0 ? `<span style="color:#4caf50">▲ +${delta}</span>`
        : delta < 0 ? `<span style="color:#ef5350">▼ ${delta}</span>`
        : '<span style="color:var(--secondary-text-color)">→</span>';

      const scoreCol = entry.score >= 80 ? '#4caf50' : entry.score >= 50 ? '#ffa726' : '#ef5350';
      const bg = i === 0 ? 'background:rgba(var(--rgb-primary-color,33,150,243),0.05);' : '';
      const tsEsc = (entry.ts || '').replace(/"/g, '&quot;');

      return `<tr style="${bg}border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 10px;">
          <input type="checkbox" class="history-cb" data-ts="${tsEsc}" style="cursor:pointer;">
        </td>
        <td style="padding:8px 10px;">${entry.date} <span style="color:var(--secondary-text-color);font-size:11px;">${entry.time}</span></td>
        <td style="padding:8px 10px;text-align:center;font-weight:700;color:${scoreCol};">${entry.score}%</td>
        <td style="padding:8px 10px;text-align:center;">${deltaStr}</td>
        <td style="padding:8px 10px;text-align:center;">${entry.total ?? '—'}</td>
      </tr>`;
    }).join('');

    // Stocker les données pour le "tout supprimer"
    tbody._historyData = history;

    // Listeners checkboxes
    this._attachHistoryDeleteListeners(history);
    this._updateHistoryDeleteBar();

    // Barre de pagination
    // tbody.parentElement = <table> (pas de .table-wrap ici)
    // La barre est insérée APRÈS <table> comme sibling → supprimer dans le parent
    const tableEl = tbody.closest('table') || tbody.parentElement;
    const tableParent = tableEl?.parentElement;
    if (tableParent) {
      // Supprimer toutes les barres existantes dans le parent (évite l'accumulation)
      tableParent.querySelectorAll('.pag-bar[data-pag-id="history-tbody"]')
        .forEach(el => el.remove());
      tableEl.insertAdjacentHTML('afterend',
        this._pagHTML(PAG_ID, reversed.length, st.page, st.pageSize)
      );
      this._pagWire(tableParent, () => this._renderHistoryTable(history));
    }
  }

  _attachHistoryDeleteListeners(history) {
    // Select-all
    const selAll = this.shadowRoot.querySelector('#history-select-all');
    if (selAll) {
      selAll.onchange = () => {
        this.shadowRoot.querySelectorAll('.history-cb').forEach(cb => { cb.checked = selAll.checked; });
        this._updateHistoryDeleteBar();
      };
    }

    // Individual checkboxes
    this.shadowRoot.querySelectorAll('.history-cb').forEach(cb => {
      cb.onchange = () => {
        const all = this.shadowRoot.querySelectorAll('.history-cb');
        const checked = this.shadowRoot.querySelectorAll('.history-cb:checked');
        const selAllEl = this.shadowRoot.querySelector('#history-select-all');
        if (selAllEl) {
          selAllEl.checked = checked.length === all.length;
          selAllEl.indeterminate = checked.length > 0 && checked.length < all.length;
        }
        this._updateHistoryDeleteBar();
      };
    });

    // Delete selected
    const delBtn = this.shadowRoot.querySelector('#history-delete-selected');
    if (delBtn) {
      delBtn.onclick = () => this._deleteSelectedHistory();
    }

    // Delete all
    const delAllBtn = this.shadowRoot.querySelector('#history-delete-all');
    if (delAllBtn) {
      delAllBtn.onclick = () => this._deleteAllHistory(history);
    }
  }

  _updateHistoryDeleteBar() {
    const bar = this.shadowRoot.querySelector('#history-delete-bar');
    const countEl = this.shadowRoot.querySelector('#history-selected-count');
    if (!bar) return;
    const checked = this.shadowRoot.querySelectorAll('.history-cb:checked');
    const total = this.shadowRoot.querySelectorAll('.history-cb');
    if (checked.length > 0) {
      bar.style.display = 'flex';
      if (countEl) countEl.textContent = this.t('history.entries_selected').replace('{count}', checked.length).replace('{total}', total.length);
    } else {
      bar.style.display = 'none';
    }
  }

  async _deleteSelectedHistory() {
    const checked = [...this.shadowRoot.querySelectorAll('.history-cb:checked')];
    if (checked.length === 0) return;
    const timestamps = checked.map(cb => cb.dataset.ts).filter(Boolean);
    if (!confirm(this.t('history.confirm_delete').replace('{count}', timestamps.length))) return;
    await this._doDeleteHistory(timestamps);
  }

  async _deleteAllHistory(history) {
    const total = history.length;
    if (!confirm(this.t('history.confirm_delete_all').replace('{total}', total))) return;
    const timestamps = history.map(e => e.ts).filter(Boolean);
    await this._doDeleteHistory(timestamps);
  }

  async _doDeleteHistory(timestamps) {
    try {
      const result = await this._hass.callWS({
        type: 'haca/delete_history',
        timestamps,
      });
      const deleted = result?.deleted ?? timestamps.length;
      // Recharger l'historique
      await this.loadHistory();
      // Feedback rapide
      const bar = this.shadowRoot.querySelector('#history-delete-bar');
      if (bar) {
        const msg = document.createElement('span');
        msg.style.cssText = 'color:var(--success-color,#4caf50);font-size:13px;font-weight:600;';
        msg.textContent = this.t('history.deleted').replace('{count}', deleted);
        bar.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
      }
    } catch (e) {
      alert(this.t('history.delete_error') + e.message);
    }
  }


// ── complexity.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  COMPLEXITY RANKING TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderComplexityTable(scores) {
    const tbody = this.shadowRoot.querySelector('#complexity-tbody');
    if (!tbody) return;

    // Store for sorting
    this._complexityScores = scores;
    this._complexitySortKey = this._complexitySortKey || 'score';
    this._complexitySortAsc = this._complexitySortAsc ?? false;

    this._drawComplexityTable();
    this._attachComplexitySortListeners();
  }

  _drawComplexityTable() {
    const tbody = this.shadowRoot.querySelector('#complexity-tbody');
    if (!tbody) return;
    const scores = this._complexityScores || [];

    if (scores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--secondary-text-color);">
        ${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const sorted = [...scores].sort((a, b) => {
      const av = a[this._complexitySortKey] ?? 0;
      const bv = b[this._complexitySortKey] ?? 0;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return this._complexitySortAsc ? cmp : -cmp;
    });

    tbody.innerHTML = sorted.map((row, i) => {
      const score = row.score;
      // Colour + label per threshold
      const [scoreColor, levelBg, levelText] =
        score >= 50 ? ['#ef5350', 'rgba(239,83,80,0.12)', this.t('complexity.level_god')] :
        score >= 30 ? ['#ffa726', 'rgba(255,167,38,0.12)', this.t('complexity.level_complex')] :
        score >= 15 ? ['#ffd54f', 'rgba(255,213,79,0.10)', this.t('complexity.level_medium')] :
                      ['#66bb6a', 'rgba(102,187,106,0.10)', this.t('complexity.level_simple')];

      // Score bar (visual, max = highest score in dataset)
      const maxScore = sorted[0]?.score || 1;
      const barPct = Math.round((score / Math.max(maxScore, 1)) * 100);

      const editUrl = this.getHAEditUrl(row.entity_id);

      return `<tr style="border-bottom:1px solid var(--divider-color);${i === 0 ? 'background:rgba(var(--rgb-primary-color,33,150,243),0.03);' : ''}">
        <td style="padding:8px 10px;max-width:220px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(row.alias)}">
            ${editUrl
              ? `<a href="${editUrl}" target="_blank" style="color:var(--primary-text-color);text-decoration:none;">${this.escapeHtml(row.alias)}</a>`
              : this.escapeHtml(row.alias)}
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(row.entity_id)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:80px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <span style="font-weight:700;font-size:16px;color:${scoreColor};">${score}</span>
            <div style="width:48px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:${scoreColor};border-radius:2px;transition:width 0.4s;"></div>
            </div>
          </div>
        </td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.triggers}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.conditions}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.actions}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.templates}</td>
        <td style="padding:8px 10px;text-align:center;">
          <span style="background:${levelBg};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;white-space:nowrap;">${levelText}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;">
          <button class="cplx-ai-btn" data-entity="${row.entity_id}"
            style="background:var(--accent-color,#03a9f4);color:white;padding:4px 10px;font-size:11px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;">
            <ha-icon icon="mdi:robot" style="--mdc-icon-size:13px;"></ha-icon> ${this.t('misc.ia_btn')}
          </button>
        </td>
      </tr>`;
    }).join('');

    // Wire AI buttons
    tbody.querySelectorAll('.cplx-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = (this._complexityScores || []).find(r => r.entity_id === btn.dataset.entity);
        if (row) this._showComplexityAI(row);
      });
    });
  }

  _attachComplexitySortListeners() {
    // Header click to sort
    const ths = this.shadowRoot.querySelectorAll('#complexity-table-container th[data-sort]');
    ths.forEach(th => {
      // Remove old listener by cloning
      const fresh = th.cloneNode(true);
      th.parentNode.replaceChild(fresh, th);
      fresh.addEventListener('click', () => {
        const key = fresh.dataset.sort;
        if (this._complexitySortKey === key) {
          this._complexitySortAsc = !this._complexitySortAsc;
        } else {
          this._complexitySortKey = key;
          this._complexitySortAsc = false;
        }
        this._drawComplexityTable();
        this._attachComplexitySortListeners();
      });
    });

    // Sort button (shortcut: toggle score asc/desc)
    const btn = this.shadowRoot.querySelector('#complexity-sort-btn');
    if (btn) {
      const fresh = btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh, btn);
      fresh.addEventListener('click', () => {
        this._complexitySortKey = 'score';
        this._complexitySortAsc = !this._complexitySortAsc;
        fresh.innerHTML = `<ha-icon icon="mdi:sort-${this._complexitySortAsc ? 'ascending' : 'descending'}"></ha-icon> ${this.t('tables.score_col')} ${this._complexitySortAsc ? '↑' : '↓'}`;
        this._drawComplexityTable();
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SEGMENT CONTROL — 3rd navigation level (Issues / Scores)
  // ═══════════════════════════════════════════════════════════════════════

  _switchSegment(clickedBtn) {
    const segId   = clickedBtn.dataset.seg;
    const panelId = 'seg-' + clickedBtn.dataset.panel; // IDs are "seg-auto-issues" etc.

    // Toggle buttons in this segment bar
    this.shadowRoot.querySelectorAll(`.segment-btn[data-seg="${segId}"]`).forEach(b => {
      b.classList.toggle('active', b === clickedBtn);
    });

    // Show the target panel, hide the others in the same group
    this.shadowRoot.querySelectorAll(`[id^="seg-${segId}-"]`).forEach(panel => {
      panel.classList.toggle('active', panel.id === panelId);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SCRIPT COMPLEXITY TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderScriptComplexityTable(scores) {
    const tbody = this.shadowRoot.querySelector('#script-complexity-tbody');
    if (!tbody) return;
    this._scriptComplexityScores = scores;

    if (!scores.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const maxScore = scores[0]?.score || 1;
    tbody.innerHTML = scores.map((row, i) => {
      const score = row.score;
      const [scoreColor, levelBg, levelText] =
        score >= 50 ? ['#ef5350', 'rgba(239,83,80,0.12)',  this.t('complexity.level_god')] :
        score >= 30 ? ['#ffa726', 'rgba(255,167,38,0.12)', this.t('complexity.level_complex')] :
        score >= 15 ? ['#ffd54f', 'rgba(255,213,79,0.10)', this.t('complexity.level_medium')] :
                      ['#66bb6a', 'rgba(102,187,106,0.10)',this.t('complexity.level_simple')];
      const barPct = Math.round((score / Math.max(maxScore, 1)) * 100);
      const editUrl = this.getHAEditUrl(row.entity_id);

      return `<tr style="border-bottom:1px solid var(--divider-color);${i===0?'background:rgba(var(--rgb-primary-color,33,150,243),0.03);':''}">
        <td style="padding:8px 10px;max-width:240px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(row.alias)}">
            ${editUrl ? `<a href="${editUrl}" target="_blank" style="color:var(--primary-text-color);text-decoration:none;">${this.escapeHtml(row.alias)}</a>` : this.escapeHtml(row.alias)}
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(row.entity_id)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:80px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <span style="font-weight:700;font-size:16px;color:${scoreColor};">${score}</span>
            <div style="width:48px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:${scoreColor};border-radius:2px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.actions}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.templates}</td>
        <td style="padding:8px 10px;text-align:center;">
          <span style="background:${levelBg};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;white-space:nowrap;">${levelText}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;">
          <button class="cplx-ai-btn" data-entity="${row.entity_id}"
            style="background:var(--accent-color,#03a9f4);color:white;padding:4px 10px;font-size:11px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;">
            <ha-icon icon="mdi:robot" style="--mdc-icon-size:13px;"></ha-icon> ${this.t('misc.ia_btn')}
          </button>
        </td>
      </tr>`;
    }).join('');

    // Wire AI buttons
    tbody.querySelectorAll('.cplx-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = (this._scriptComplexityScores || []).find(r => r.entity_id === btn.dataset.entity);
        if (row) this._showComplexityAI(row);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SCENE STATS TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderSceneStatsTable(stats) {
    const tbody = this.shadowRoot.querySelector('#scene-stats-tbody');
    if (!tbody) return;

    if (!stats.length) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const maxE = stats[0]?.entities || 1;
    tbody.innerHTML = stats.map((row, i) => {
      const barPct = Math.round((row.entities / Math.max(maxE, 1)) * 100);
      const editUrl = this.getHAEditUrl(row.entity_id);
      return `<tr style="border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 10px;max-width:260px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(row.alias)}">
            ${editUrl ? `<a href="${editUrl}" target="_blank" style="color:var(--primary-text-color);text-decoration:none;">${this.escapeHtml(row.alias)}</a>` : this.escapeHtml(row.alias)}
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(row.entity_id)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:120px;">
          <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
            <span style="font-weight:700;font-size:15px;">${row.entities}</span>
            <div style="width:60px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:var(--primary-color);border-radius:2px;"></div>
            </div>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  BLUEPRINT STATS TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderBlueprintStatsTable(stats) {
    const tbody = this.shadowRoot.querySelector('#blueprint-stats-tbody');
    if (!tbody) return;

    if (!stats.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const maxC = stats[0]?.count || 1;
    tbody.innerHTML = stats.map(row => {
      const barPct = Math.round((row.count / Math.max(maxC, 1)) * 100);
      const shortPath = row.path.split('/').pop();
      const autoList = (row.automations || []).slice(0, 5).map(a => this.escapeHtml(a)).join(', ')
        + (row.automations.length > 5 ? ` +${row.automations.length - 5}` : '');

      return `<tr style="border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 10px;max-width:240px;">
          <div style="font-weight:600;" title="${this.escapeHtml(row.path)}">${this.escapeHtml(shortPath)}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(row.path)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:110px;">
          <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
            <span style="font-weight:700;font-size:15px;">${row.count}</span>
            <div style="width:50px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:var(--primary-color);border-radius:2px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${autoList || '—'}</td>
      </tr>`;
    }).join('');
  }

// ── optimizer.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  AI AUTOMATION OPTIMIZER — multi-tab modal
  // ═══════════════════════════════════════════════════════════════════════

  async _showOptimizer(issue) {
    const entityId = issue.entity_id;
    const alias    = issue.alias || entityId;

    // ── Loading modal ──────────────────────────────────────────────────
    const modal = this.createModal(`
      <div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;">
        <div class="loader"></div>
        <div style="font-size:18px;font-weight:600;">✨ Optimisation en cours…</div>
        <div style="font-size:13px;color:var(--secondary-text-color);">
          ${this.escapeHtml(alias)}<br>
          <span style="font-size:11px;opacity:0.7;">${this.t('optimizer.tagline')}</span>
        </div>
      </div>
    `);

    try {
      // Pass all current issues + complexity scores for context
      const allIssues = this._lastData?.automation_issue_list || [];
      const scores    = this._lastData?.complexity_scores     || [];

      const resp = await this.hass.callWS({
        type:         'call_service',
        domain:       'config_auditor',
        service:      'optimize_automation',
        service_data: { entity_id: entityId, issues: allIssues, complexity_scores: scores },
        return_response: true,
      });

      const data = resp?.response || resp || {};
      this._renderOptimizerModal(modal, data, alias, entityId);

    } catch (err) {
      modal._updateContent(`
        <div style="padding:32px;text-align:center;">
          <div style="font-size:40px;margin-bottom:16px;">❌</div>
          <div style="color:var(--error-color);font-size:15px;">${this.escapeHtml(err.message || this.t('fix.error_unknown'))}</div>
          <button onclick="this.closest('.haca-modal').remove()"
            style="margin-top:20px;background:var(--primary-color);color:white;padding:8px 20px;border-radius:8px;">${this.t('optimizer.close')}</button>
        </div>
      `);
    }
  }

  _renderOptimizerModal(modal, data, alias, entityId) {
    const score        = data.score || 0;
    const patterns     = data.detected_patterns || [];
    const issues       = data.issues_found      || [];
    const hasSplit     = data.has_split;
    const hasBlueprint = data.has_blueprint;
    const hasMod       = !!data.modernised_yaml?.trim();

    const tabs = [
      { id: 'optim-tab-analysis',   icon: 'mdi:magnify',       label: 'Diagnostic',     show: true },
      { id: 'optim-tab-split',      icon: 'mdi:scissors-cutting', label: this.t('optimizer.tab_split'),   show: hasSplit },
      { id: 'optim-tab-modern',     icon: 'mdi:code-braces',   label: 'Modernisation',  show: hasMod },
      { id: 'optim-tab-blueprint',  icon: 'mdi:puzzle',        label: 'Blueprint',      show: hasBlueprint },
    ].filter(t => t.show);

    const tabBtns = tabs.map((t, i) => `
      <button class="optim-tab-btn${i === 0 ? ' active' : ''}" data-panel="${t.id}"
        style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:none;
               border-bottom:${i === 0 ? '2px solid var(--primary-color)' : '2px solid transparent'};
               background:none;color:${i === 0 ? 'var(--primary-color)' : 'var(--secondary-text-color)'};
               font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">
        <ha-icon icon="${t.icon}" style="--mdc-icon-size:15px;"></ha-icon> ${t.label}
        ${t.id === 'optim-tab-split' ? `<span style="background:#7b68ee;color:white;border-radius:8px;padding:0 6px;font-size:10px;">${this.t('optimizer.new_badge')}</span>` : ''}
        ${t.id === 'optim-tab-blueprint' ? '<span style="background:#e8a838;color:white;border-radius:8px;padding:0 6px;font-size:10px;">MATCH</span>' : ''}
      </button>`).join('');

    // ── Score badge ────────────────────────────────────────────────────
    const [scoreColor, levelLabel] =
      score >= 50 ? ['#ef5350', '🚨 God Automation'] :
      score >= 30 ? ['#ffa726', '⚠️ Complexe']       :
      score >= 15 ? ['#ffd54f', '🔶 Moyen']           :
                    ['#66bb6a', '✅ Simple'];

    // ── Patterns pills ─────────────────────────────────────────────────
    const patternPills = patterns.map(p =>
      `<span style="background:rgba(239,83,80,0.1);border:1px solid #ef5350;color:#b71c1c;
              border-radius:6px;padding:2px 10px;font-size:11px;">⚠️ ${this.escapeHtml(p)}</span>`
    ).join('');

    // ── Tab panels ─────────────────────────────────────────────────────
    const panelAnalysis = `
      <div id="optim-tab-analysis" class="optim-panel active" style="padding:20px;overflow-y:auto;flex:1;">
        ${patterns.length ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;
               color:var(--secondary-text-color);margin-bottom:8px;">${this.t('optimizer.patterns_detected')}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">${patternPills}</div>
        </div>` : ''}
        <div style="background:var(--secondary-background-color);padding:18px;border-radius:12px;
             line-height:1.8;font-size:14px;white-space:pre-wrap;
             border-left:4px solid var(--primary-color);">
          ${this.escapeHtml(data.analysis || this.t('misc.no_explanation'))}
        </div>
        ${issues.length ? `
        <div style="margin-top:16px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;
               color:var(--secondary-text-color);margin-bottom:8px;">${this.t('optimizer.issues_associated')}</div>
          ${issues.slice(0,8).map(i => `
          <div style="padding:8px 12px;border-left:3px solid #ffa726;background:rgba(255,167,38,0.07);
               border-radius:0 8px 8px 0;margin-bottom:6px;font-size:13px;">
            ${this.escapeHtml(i)}
          </div>`).join('')}
        </div>` : ''}
      </div>`;

    const mkYamlPanel = (id, yamlText, applyLabel, isMulti) => `
      <div id="${id}" class="optim-panel" style="display:none;flex-direction:column;flex:1;overflow:hidden;">
        <div style="padding:8px 16px;background:rgba(var(--rgb-primary-color,33,150,243),0.06);
             font-size:12px;color:var(--secondary-text-color);border-bottom:1px solid var(--divider-color);
             flex-shrink:0;">
          ${this.t('optimizer.preview_warning')}
          ${isMulti ? this.t('optimizer.multi_yaml') : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;flex:1;overflow:hidden;">
          <div style="overflow:auto;border-right:1px solid var(--divider-color);">
            <div style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                 color:#ef5350;background:rgba(239,83,80,0.05);border-bottom:1px solid var(--divider-color);">
              ◀ Original
            </div>
            <pre style="margin:0;padding:14px;font-size:11px;line-height:1.5;overflow:auto;
                 max-height:380px;background:var(--secondary-background-color);">${this.escapeHtml(data.original_yaml || '')}</pre>
          </div>
          <div style="overflow:auto;">
            <div style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                 color:#66bb6a;background:rgba(102,187,106,0.05);border-bottom:1px solid var(--divider-color);">
              ${this.t('optimizer.label_optimized')}
            </div>
            <pre style="margin:0;padding:14px;font-size:11px;line-height:1.5;overflow:auto;
                 max-height:380px;outline:1px solid rgba(102,187,106,0.4);outline-offset:-1px;">${this.escapeHtml(yamlText || '')}</pre>
          </div>
        </div>
        <div style="padding:12px 16px;border-top:1px solid var(--divider-color);flex-shrink:0;
             display:flex;justify-content:flex-end;gap:10px;background:var(--secondary-background-color);">
          <button class="optim-apply-btn"
            data-yaml="${encodeURIComponent(yamlText || '')}"
            data-entity="${this.escapeHtml(entityId)}"
            style="background:linear-gradient(135deg,#7b68ee,#a855f7);color:white;
                   padding:10px 20px;border-radius:10px;font-weight:600;
                   box-shadow:0 4px 12px rgba(123,104,238,0.4);display:flex;align-items:center;gap:6px;">
            <ha-icon icon="mdi:check-circle-outline" style="--mdc-icon-size:16px;"></ha-icon>
            ${applyLabel}
          </button>
        </div>
      </div>`;

    const panelSplit = hasSplit
      ? mkYamlPanel('optim-tab-split', data.split_automations, this.t('misc.apply_split') || 'Apply split', true)
      : '';
    const panelModern = hasMod
      ? mkYamlPanel('optim-tab-modern', data.modernised_yaml, this.t('misc.apply_modernize') || 'Apply modernization', false)
      : '';

    // Blueprint panel
    const bp = data.blueprint_match || {};
    const panelBP = hasBlueprint ? `
      <div id="optim-tab-blueprint" class="optim-panel" style="display:none;padding:20px;overflow-y:auto;flex:1;">
        <div style="background:rgba(232,168,56,0.1);border:1px solid #e8a838;border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:13px;font-weight:700;color:#e65100;margin-bottom:8px;">
            ${this.t('optimizer.blueprint_match')}
          </div>
          ${bp.path ? `<div style="font-family:monospace;font-size:12px;background:var(--secondary-background-color);
              padding:6px 10px;border-radius:6px;margin-bottom:8px;">${this.escapeHtml(bp.path)}</div>` : ''}
          <div style="font-size:13px;line-height:1.6;">${this.escapeHtml(bp.reason || bp.raw || '')}</div>
        </div>
        ${bp.inputs_yaml ? `
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;
               color:var(--secondary-text-color);margin-bottom:8px;">${this.t('optimizer.blueprint_yaml')}</div>
          <pre style="background:var(--secondary-background-color);padding:14px;border-radius:10px;
               font-size:11px;overflow:auto;max-height:280px;border:1px solid var(--divider-color);">${this.escapeHtml(bp.inputs_yaml)}</pre>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:flex-end;">
          <button class="optim-apply-btn"
            data-yaml="${encodeURIComponent(bp.inputs_yaml)}"
            data-entity="${this.escapeHtml(entityId)}"
            style="background:linear-gradient(135deg,#e8a838,#f59e0b);color:white;
                   padding:10px 20px;border-radius:10px;font-weight:600;">
            <ha-icon icon="mdi:puzzle" style="--mdc-icon-size:16px;"></ha-icon>
            Appliquer le blueprint
          </button>
        </div>` : ''}
      </div>` : '';

    modal._updateContent(`
      <div style="display:flex;flex-direction:column;height:100%;max-height:92vh;">

        <!-- Header -->
        <div style="padding:16px 20px;border-bottom:1px solid var(--divider-color);
             flex-shrink:0;background:var(--secondary-background-color);">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <ha-icon icon="mdi:auto-fix" style="--mdc-icon-size:28px;color:#7b68ee;"></ha-icon>
              <div>
                <div style="font-size:16px;font-weight:700;">Optimiseur IA — ${this.escapeHtml(alias)}</div>
                <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(entityId)}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              ${score ? `<span style="font-size:20px;font-weight:800;color:${scoreColor};">${score}</span>
              <span style="font-size:11px;padding:2px 8px;border-radius:6px;background:var(--card-background-color);font-weight:600;">${levelLabel}</span>` : ''}
              <button onclick="this.closest('.haca-modal').remove()"
                style="background:none;border:none;cursor:pointer;color:var(--secondary-text-color);font-size:20px;padding:4px;">✕</button>
            </div>
          </div>
        </div>

        <!-- Tab bar -->
        <div style="display:flex;padding:0 8px;border-bottom:1px solid var(--divider-color);
             flex-shrink:0;overflow-x:auto;background:var(--card-background-color);" id="optim-tab-bar">
          ${tabBtns}
        </div>

        <!-- Tab content area -->
        <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
          ${panelAnalysis}
          ${panelSplit}
          ${panelModern}
          ${panelBP}
        </div>

      </div>
    `);

    // ── Tab switching ──────────────────────────────────────────────────
    modal.querySelectorAll('.optim-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.optim-tab-btn').forEach(b => {
          b.style.borderBottom = '2px solid transparent';
          b.style.color = 'var(--secondary-text-color)';
        });
        modal.querySelectorAll('.optim-panel').forEach(p => {
          p.style.display = 'none'; p.classList.remove('active');
        });
        btn.style.borderBottom = '2px solid var(--primary-color)';
        btn.style.color = 'var(--primary-color)';
        const panel = modal.querySelector('#' + btn.dataset.panel);
        if (panel) { panel.style.display = 'flex'; panel.classList.add('active'); }
      });
    });

    // ── Apply buttons ──────────────────────────────────────────────────
    modal.querySelectorAll('.optim-apply-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const yamlText = decodeURIComponent(btn.dataset.yaml || '');
        const eid      = btn.dataset.entity;
        if (!yamlText || !eid) return;

        btn.disabled = true;
        btn.innerHTML = '<span class="btn-loader"></span> Application…';

        try {
          const res = await this.hass.callWS({
            type:         'call_service',
            domain:       'config_auditor',
            service:      'apply_optimization',
            service_data: { entity_id: eid, new_yaml: yamlText },
            return_response: true,
          });
          const r = res?.response || res || {};
          if (r.success) {
            modal._updateContent(`
              <div style="padding:48px 32px;text-align:center;">
                <div style="font-size:56px;margin-bottom:20px;
                     filter:drop-shadow(0 4px 12px rgba(123,104,238,0.5));">✅</div>
                <h2 style="margin-bottom:12px;">${this.t('optimizer.applied_title')}</h2>
                <p style="color:var(--secondary-text-color);line-height:1.7;margin-bottom:8px;">
                  ${r.message || this.t('optimizer.automations_written').replace('{count}', r.count)}
                </p>
                ${r.backup_path ? `
                <div style="background:var(--secondary-background-color);padding:10px;border-radius:10px;
                     display:inline-flex;align-items:center;gap:8px;border:1px solid var(--divider-color);font-size:12px;">
                  <ha-icon icon="mdi:zip-box-outline" style="color:var(--primary-color);"></ha-icon>
                  Backup : ${this.escapeHtml(r.backup_path.split(/[\\/]/).pop())}
                </div>` : ''}
                <div style="margin-top:28px;">
                  <button onclick="this.closest('.haca-modal').remove()"
                    style="background:linear-gradient(135deg,#7b68ee,#a855f7);color:white;
                           padding:12px 32px;border-radius:10px;font-weight:700;">
                    Fermer & Relancer le scan
                  </button>
                </div>
              </div>
            `);
            setTimeout(() => this.scanAutomations(), 1200);
          } else {
            btn.disabled = false;
            btn.innerHTML = `<ha-icon icon="mdi:check-circle-outline"></ha-icon> ${this.t('optimizer.retry')}`;
            this.showHANotithis._showNotification(this.t('misc.ai_error') + (r.error || this.t('fix.error_unknown')), '', 'haca_error');
          }
        } catch(err) {
          btn.disabled = false;
          btn.innerHTML = `<ha-icon icon="mdi:check-circle-outline"></ha-icon> ${this.t('optimizer.retry')}`;
          this.showHANotithis._showNotification(this.t('misc.ai_error') + err.message, '', 'haca_error');
        }
      });
    });
  }

// ── ai_explain.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  AI COMPLEXITY ANALYSIS MODAL
  // ═══════════════════════════════════════════════════════════════════════

  async _showComplexityAI(row) {
    const kind = row.entity_id.startsWith('script.') ? 'Script' : 'Automation';

    // ── Loading modal ──────────────────────────────────────────────────
    const modal = this.createModal(`
      <div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;">
        <div class="loader"></div>
        <div style="margin-top:20px;font-size:18px;font-weight:500;">${this.t('ai_explain.analyzing')}</div>
        <div style="margin-top:8px;font-size:13px;color:var(--secondary-text-color);">
          ${this.escapeHtml(row.alias)} — Score ${row.score}
        </div>
      </div>
    `);

    try {
      const response = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'analyze_complexity_ai',
        service_data: { row },
        return_response: true,
      });

      const data = response?.response || response || {};
      const explanation  = data.explanation  || this.t('misc.no_explanation');
      const splitProposal = data.split_proposal || '';
      const hasProposal  = data.has_proposal && splitProposal;

      // Score colour
      const s = row.score;
      const [scoreColor, levelText] =
        s >= 50 ? ['#ef5350', '🚨 God Automation'] :
        s >= 30 ? ['#ffa726', '⚠️ Complexe']       :
        s >= 15 ? ['#ffd54f', '🔶 Moyen']           :
                  ['#66bb6a', '✅ Simple'];

      modal._updateContent(`
        <div style="display:flex;flex-direction:column;height:100%;max-height:90vh;">

          <!-- Header -->
          <div style="padding:20px 24px;border-bottom:1px solid var(--divider-color);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <ha-icon icon="mdi:robot" style="--mdc-icon-size:36px;color:var(--primary-color);flex-shrink:0;"></ha-icon>
              <div>
                <div style="font-size:18px;font-weight:700;">${this.escapeHtml(row.alias)}</div>
                <div style="font-size:12px;color:var(--secondary-text-color);">${this.escapeHtml(row.entity_id)}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
              <span style="font-size:22px;font-weight:800;color:${scoreColor};">${row.score}</span>
              <span style="font-size:12px;padding:3px 10px;border-radius:8px;background:var(--secondary-background-color);font-weight:600;">${levelText}</span>
            </div>
          </div>

          <!-- Score breakdown pills -->
          <div style="padding:12px 24px;border-bottom:1px solid var(--divider-color);display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0;background:var(--secondary-background-color);">
            ${row.triggers  !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">${this.t('ai_explain.triggers_label', {n: row.triggers})}</span>` : ''}
            ${row.conditions !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">🔍 ${row.conditions} conditions</span>` : ''}
            ${row.actions   !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">▶ ${row.actions} actions</span>` : ''}
            ${row.templates !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">📝 ${row.templates} templates</span>` : ''}
          </div>

          <!-- Body -->
          <div style="flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:20px;">

            <!-- Explanation -->
            <div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);margin-bottom:8px;">
                <ha-icon icon="mdi:lightbulb-outline" style="--mdc-icon-size:14px;"></ha-icon> Analyse
              </div>
              <div style="background:var(--secondary-background-color);padding:16px;border-radius:12px;line-height:1.7;font-size:14px;white-space:pre-wrap;border-left:4px solid var(--primary-color);">
                ${this.escapeHtml(explanation)}
              </div>
            </div>

            ${hasProposal ? `
            <!-- Refactoring proposal -->
            <div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);margin-bottom:8px;">
                <ha-icon icon="mdi:magic-staff" style="--mdc-icon-size:14px;"></ha-icon> Proposition de refactoring (Dry Run)
              </div>
              <div style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:12px;overflow:hidden;">
                <div style="padding:8px 14px;background:rgba(var(--rgb-primary-color,33,150,243),0.07);font-size:12px;color:var(--secondary-text-color);border-bottom:1px solid var(--divider-color);">
                  ${this.t('ai_explain.preview_only')}
                </div>
                <pre id="split-proposal-pre" style="margin:0;padding:16px;font-size:12px;overflow-x:auto;max-height:320px;line-height:1.5;">${this.escapeHtml(splitProposal)}</pre>
              </div>
            </div>
            ` : `
            <div style="padding:16px;background:var(--secondary-background-color);border-radius:12px;font-size:13px;color:var(--secondary-text-color);text-align:center;">
              ${this.t('ai_explain.no_proposal')}
            </div>
            `}
          </div>

          <!-- Footer -->
          <div style="padding:16px 24px;border-top:1px solid var(--divider-color);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:var(--secondary-background-color);flex-shrink:0;">
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              ${this.getHAEditUrl(row.entity_id) ? `
                <a href="${this.getHAEditUrl(row.entity_id)}" target="_blank" style="text-decoration:none;">
                  <button style="background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">
                    <ha-icon icon="mdi:pencil"></ha-icon> Modifier manuellement
                  </button>
                </a>` : ''}
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="modal-close-btn" style="background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">
                Fermer
              </button>
              ${hasProposal ? `
              <button id="apply-split-btn" style="background:var(--primary-color);color:white;padding:10px 20px;border-radius:12px;box-shadow:0 4px 10px rgba(var(--rgb-primary-color,33,150,243),0.3);">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon> Appliquer le refactoring
              </button>` : ''}
            </div>
          </div>
        </div>
      `);

      // Close button
      modal.querySelector('.modal-close-btn').addEventListener('click', () => {
        if (modal._closeModal) modal._closeModal();
        else modal.parentElement?.remove();
      });

      // Apply button — write split_proposal to scripts.yaml (new scripts) + simplified automation
      if (hasProposal) {
        modal.querySelector('#apply-split-btn').addEventListener('click', async () => {
          const btn = modal.querySelector('#apply-split-btn');
          btn.disabled = true;
          btn.innerHTML = '<span class="btn-loader"></span> Application…';
          try {
            await this.hass.callWS({
              type: 'call_service',
              domain: 'config_auditor',
              service: 'apply_complexity_split',
              service_data: { entity_id: row.entity_id, yaml_proposal: splitProposal },
              return_response: false,
            });
            modal._updateContent(`
              <div style="padding:48px 32px;text-align:center;">
                <div style="font-size:56px;margin-bottom:20px;">✅</div>
                <h2 style="margin-bottom:12px;">${this.t('ai_explain.applied_title')}</h2>
                <p style="color:var(--secondary-text-color);line-height:1.6;">
                  ${this.t('ai_explain.applied_desc')}<br>
                  ${this.t('ai_explain.applied_backup')}
                </p>
                <button onclick="this.closest('.haca-modal').remove()"
                  style="margin-top:24px;background:var(--primary-color);color:white;padding:10px 28px;border-radius:10px;">
                  Fermer
                </button>
              </div>
            `);
            setTimeout(() => this.scanAutomations(), 1500);
          } catch(err) {
            btn.disabled = false;
            btn.innerHTML = '<ha-icon icon="mdi:check-circle-outline"></ha-icon> Appliquer le refactoring';
            this.showHANotithis._showNotification(this.t('misc.error_apply') + err.message, '', 'haca_error');
          }
        });
      }

    } catch(error) {
      modal._updateContent(`
        <div style="padding:32px;text-align:center;color:var(--error-color);">
          <div style="font-size:40px;margin-bottom:16px;">❌</div>
          <div style="font-size:15px;">${this.escapeHtml(error.message || 'Erreur inconnue')}</div>
          <button onclick="this.closest('.haca-modal').remove()"
            style="margin-top:20px;background:var(--primary-color);color:white;padding:8px 20px;border-radius:8px;">
            Fermer
          </button>
        </div>
      `);
    }
  }

// ── dep_graph.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  DEPENDENCY GRAPH — D3.js force-directed
  // ═══════════════════════════════════════════════════════════════════════

  _graphNodeColor(node) {
    if (node.has_issues) {
      return node.max_severity === 'high' ? '#ef5350' :
             node.max_severity === 'medium' ? '#ffa726' : '#ffd54f';
    }
    return {
      automation: '#7b68ee',
      script:     '#20b2aa',
      scene:      '#ffa500',
      entity:     '#6dbf6d',
      blueprint:  '#e8a838',
      device:     '#a0a0b0',
    }[node.type] || '#888';
  }

  _graphNodeRadius(node) {
    const base = { automation: 10, script: 9, scene: 9, blueprint: 10, device: 8, entity: 6 };
    return (base[node.type] || 6) + Math.min(node.degree * 1.2, 12);
  }

  async _loadD3() {
    if (window.d3) return window.d3;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js';
      s.onload = () => resolve(window.d3);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async _renderDepGraph(graphData) {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    const empty = this.shadowRoot.querySelector('#graph-empty');
    if (!svg) return;

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      svg.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    svg.style.display = 'block';
    if (empty) empty.style.display = 'none';

    // Load D3 lazily
    let d3;
    try { d3 = await this._loadD3(); }
    catch(e) { console.error('HACA: D3 load failed', e); return; }

    // Store raw data for filter reuse
    this._graphRawData = graphData;
    this._graphIssuesOnly = this._graphIssuesOnly || false;

    this._drawD3Graph(d3, graphData);
  }

  _drawD3Graph(d3, graphData) {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg) return;

    // ── Stopper l'ancienne simulation AVANT d'en créer une nouvelle ──────────
    // Sans ce stop(), chaque refresh (toutes les 60s sur l'onglet Carte) laisse
    // une simulation D3 zombie tourner en requestAnimationFrame : memory/CPU leak
    // critique qui provoque la page blanche après quelques heures.
    if (this._graphSimulation) {
      this._graphSimulation.stop();
      this._graphSimulation = null;
    }

    // Get dimensions — si le SVG est dans un onglet caché (display:none),
    // clientWidth = 0. On reporte le rendu via requestAnimationFrame pour
    // éviter que la simulation tourne avec W=0 → translate(NaN,NaN) en boucle.
    let W = svg.clientWidth  || svg.parentElement?.clientWidth  || 0;
    let H = svg.clientHeight || svg.parentElement?.clientHeight || 0;

    if (W < 10 || H < 10) {
      // SVG pas encore layouté ou dans onglet caché — on retente dans le prochain frame
      requestAnimationFrame(() => {
        if (this._graphData) this._drawD3Graph(d3, graphData);
      });
      return;
    }

    // Clear previous render
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const svgSel = d3.select(svg);

    // Defs — arrowhead marker
    const defs = svgSel.append('defs');
    const mkArrow = (id, color) => defs.append('marker')
      .attr('id', id)
      .attr('viewBox', '0 -5 10 10').attr('refX', 22).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color);
    mkArrow('arrow-normal', 'var(--divider-color, #aaa)');
    mkArrow('arrow-issue', '#ef5350');
    mkArrow('arrow-blueprint', '#e8a838');

    // Apply active filter
    const typeFilter = this.shadowRoot.querySelector('#graph-type-filter')?.value || 'all';
    const issuesOnly = this._graphIssuesOnly;

    let nodes = graphData.nodes.filter(n =>
      (typeFilter === 'all' || n.type === typeFilter) &&
      (!issuesOnly || n.has_issues)
    );
    const nodeIds = new Set(nodes.map(n => n.id));
    // Include neighbors of filtered nodes so edges make sense
    if (typeFilter !== 'all' || issuesOnly) {
      graphData.edges.forEach(e => {
        if (nodeIds.has(e.source) || nodeIds.has(e.target)) {
          if (!nodeIds.has(e.source)) {
            const nb = graphData.nodes.find(n => n.id === e.source);
            if (nb) { nodes.push(nb); nodeIds.add(nb.id); }
          }
          if (!nodeIds.has(e.target)) {
            const nb = graphData.nodes.find(n => n.id === e.target);
            if (nb) { nodes.push(nb); nodeIds.add(nb.id); }
          }
        }
      });
    }
    const edges = graphData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Deep-clone for simulation (D3 mutates objects)
    const simNodes = nodes.map(n => ({ ...n }));
    const nodeById = Object.fromEntries(simNodes.map(n => [n.id, n]));
    const simEdges = edges.map(e => ({
      ...e,
      source: nodeById[e.source] || e.source,
      target: nodeById[e.target] || e.target,
    })).filter(e => e.source && e.target);

    // Zoom behaviour
    const zoomG = svgSel.append('g').attr('class', 'zoom-root');
    const zoom = d3.zoom().scaleExtent([0.05, 4]).on('zoom', ev => {
      zoomG.attr('transform', ev.transform);
    });
    svgSel.call(zoom);
    this._d3Zoom   = zoom;
    this._d3SvgSel = svgSel;

    // Force simulation
    const simulation = d3.forceSimulation(simNodes)
      .force('link',   d3.forceLink(simEdges).id(d => d.id).distance(d => {
        const types = d.source.type + '-' + d.target.type;
        if (types.includes('blueprint')) return 50;
        if (types.includes('device'))    return 40;
        if (types.includes('entity'))    return 30;
        return 45;
      }).strength(0.8))
      .force('charge', d3.forceManyBody().strength(d => -60 - d.degree * 5))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.08))
      .force('collide', d3.forceCollide(d => this._graphNodeRadius(d) + 3))
      .alphaDecay(0.03);

    this._graphSimulation = simulation;

    // ── Edges ──────────────────────────────────────────────────────────
    const edgeColor = e => e.rel === 'uses_blueprint' ? '#e8a838' :
                            e.rel === 'calls_script'   ? '#20b2aa' :
                            (e.source.has_issues || e.target.has_issues) ? '#ef535066' :
                            'var(--divider-color, #aaa)';
    const arrowId = e => e.rel === 'uses_blueprint' ? 'arrow-blueprint' :
                          (e.source.has_issues || e.target.has_issues) ? 'arrow-issue' :
                          'arrow-normal';

    const link = zoomG.append('g').attr('class', 'links')
      .selectAll('line').data(simEdges).join('line')
      .attr('stroke', edgeColor)
      .attr('stroke-width', e => e.rel === 'calls_script' ? 2 : 1)
      .attr('stroke-dasharray', e => e.rel === 'belongs_to_device' ? '4 3' : null)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', e => 'url(#' + arrowId(e) + ')');

    // ── Nodes ───────────────────────────────────────────────────────────
    const node = zoomG.append('g').attr('class', 'nodes')
      .selectAll('g').data(simNodes).join('g')
      .attr('class', 'node-g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (ev, d) => {
          if (!ev.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => {
          if (!ev.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      )
      .on('click', (ev, d) => {
        ev.stopPropagation();
        this._graphShowSidebar(d);
      });

    // Circle
    node.append('circle')
      .attr('r', d => this._graphNodeRadius(d))
      .attr('fill', d => this._graphNodeColor(d))
      .attr('stroke', d => d.has_issues ? '#b71c1c' : 'rgba(0,0,0,0.15)')
      .attr('stroke-width', d => d.has_issues ? 2.5 : 1)
      .attr('filter', d => d.has_issues ? 'drop-shadow(0 0 4px rgba(239,83,80,0.6))' : null);

    // Issue badge ring (pulsing)
    node.filter(d => d.has_issues && d.max_severity === 'high')
      .append('circle')
      .attr('r', d => this._graphNodeRadius(d) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#ef5350')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5);

    // Label — only show for non-entity or high-degree nodes
    node.filter(d => d.type !== 'entity' || d.degree > 3 || d.has_issues)
      .append('text')
      .text(d => d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label)
      .attr('dy', d => -this._graphNodeRadius(d) - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'var(--primary-text-color)')
      .attr('pointer-events', 'none');

    // Issue count badge
    node.filter(d => d.issue_count > 0)
      .append('text')
      .text(d => d.issue_count)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('fill', 'white')
      .attr('pointer-events', 'none');

    // Click on SVG background → close sidebar
    svgSel.on('click', () => {
      const sb = this.shadowRoot.querySelector('#graph-sidebar');
      if (sb) sb.style.display = 'none';
      node.select('circle').attr('stroke-width', d => d.has_issues ? 2.5 : 1);
    });

    // Tick — guard NaN : si les positions ne sont pas encore calculées (debut simulation)
    // ou si le SVG a été masqué entre-temps, on saute ce frame pour éviter le spam
    // "Expected number, translate(NaN,NaN)" dans la console
    simulation.on('tick', () => {
      link.attr('x1', d => isNaN(d.source.x) ? 0 : d.source.x)
          .attr('y1', d => isNaN(d.source.y) ? 0 : d.source.y)
          .attr('x2', d => isNaN(d.target.x) ? 0 : d.target.x)
          .attr('y2', d => isNaN(d.target.y) ? 0 : d.target.y);
      node.attr('transform', d => {
        if (isNaN(d.x) || isNaN(d.y)) return `translate(${W/2},${H/2})`;
        return `translate(${d.x},${d.y})`;
      });
    });

    // Auto-fit after stabilisation
    simulation.on('end', () => this._graphResetZoom());
  }

  // ── Nettoyage complet D3 (appelé depuis disconnectedCallback) ───────────────
  _graphStopAll() {
    if (this._graphSimulation) {
      this._graphSimulation.stop();
      this._graphSimulation = null;
    }
    this._d3Zoom   = null;
    this._d3SvgSel = null;
    this._graphRawData = null;
  }

  _graphResetZoom() {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg || !this._d3Zoom || !this._d3SvgSel || !window.d3) return;
    const d3 = window.d3;
    const W = svg.clientWidth  || 800;
    const H = svg.clientHeight || 600;
    this._d3SvgSel.transition().duration(500)
      .call(this._d3Zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(0.9).translate(-W / 2, -H / 2));
  }

  _graphApplyFilters() {
    if (!this._graphRawData || !window.d3) return;
    this._drawD3Graph(window.d3, this._graphRawData);
  }

  _graphSearch(query) {
    if (!this._d3SvgSel || !window.d3) return;
    const q = query.toLowerCase().trim();
    this._d3SvgSel.selectAll('.node-g circle').attr('opacity', d => {
      if (!q) return 1;
      const match = d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q);
      return match ? 1 : 0.15;
    });
    this._d3SvgSel.selectAll('.node-g text').attr('opacity', d => {
      if (!q) return 1;
      return (d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q)) ? 1 : 0.1;
    });
  }

  _graphShowSidebar(node) {
    const sb   = this.shadowRoot.querySelector('#graph-sidebar');
    const title = this.shadowRoot.querySelector('#sidebar-title');
    const body  = this.shadowRoot.querySelector('#sidebar-body');
    if (!sb || !title || !body) return;

    // Highlight selected node
    if (this._d3SvgSel) {
      this._d3SvgSel.selectAll('.node-g circle')
        .attr('stroke-width', d => d.id === node.id ? 4 : (d.has_issues ? 2.5 : 1))
        .attr('stroke', d => d.id === node.id ? 'var(--primary-color)' : (d.has_issues ? '#b71c1c' : 'rgba(0,0,0,0.15)'));
    }

    const typeLabels = { automation:'Automation', script:'Script', scene: this.t('graph.legend_scene'),
                         entity: this.t('graph.legend_entity'), blueprint:'Blueprint', device: this.t('graph.legend_device') };
    title.textContent = node.label;

    const editUrl = this.getHAEditUrl(node.id);
    const haStateUrl = `/developer-tools/state`;

    const issueRows = (node.issue_summary || []).map(iss => {
      const sCol = iss.severity === 'high' ? '#ef5350' : iss.severity === 'medium' ? '#ffa726' : '#ffd54f';
      return `<div style="padding:8px;border-radius:8px;background:var(--secondary-background-color);margin-bottom:6px;border-left:3px solid ${sCol};">
        <div style="font-size:11px;font-weight:700;color:${sCol};text-transform:uppercase;">${iss.severity}</div>
        <div style="font-size:12px;margin-top:2px;line-height:1.4;">${this.escapeHtml(iss.message)}</div>
      </div>`;
    }).join('');

    body.innerHTML = `
      <div style="margin-bottom:12px;">
        <span style="background:${this._graphNodeColor(node)};color:white;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;">
          ${typeLabels[node.type] || node.type}
        </span>
        <span style="margin-left:8px;font-size:12px;color:var(--secondary-text-color);">${node.degree} connexion${node.degree !== 1 ? 's' : ''}</span>
      </div>
      <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:12px;word-break:break-all;">${this.escapeHtml(node.id)}</div>

      ${node.issue_count > 0 ? `
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:6px;">
          ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}
        </div>
        ${issueRows}
      ` : `<div style="font-size:13px;color:#66bb6a;margin-bottom:12px;">${this.t('graph.no_issues')}</div>`}

      <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
        ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--primary-color);color:white;border-radius:8px;padding:8px;">
            <ha-icon icon="mdi:pencil" style="--mdc-icon-size:14px;"></ha-icon> Modifier dans HA
          </button>
        </a>` : ''}
        ${node.type === 'entity' ? `<a href="${haStateUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;">
            <ha-icon icon="mdi:eye" style="--mdc-icon-size:14px;"></ha-icon> ${this.t('graph.view_state')}
          </button>
        </a>` : ''}
      </div>`;

    sb.style.display = 'block';
  }

  // ── Export SVG ────────────────────────────────────────────────────────────
  _graphExportSVG() {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg) return;

    // Clone so we can embed styles without touching the live DOM
    const clone = svg.cloneNode(true);
    const W = svg.clientWidth  || 800;
    const H = svg.clientHeight || 600;
    clone.setAttribute('width',  W);
    clone.setAttribute('height', H);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Embed minimal inline styles so the SVG renders stand-alone
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = [
      'text { font-family: sans-serif; font-size: 10px; fill: #333; }',
      'line { stroke-opacity: 0.6; }',
      'circle { stroke-width: 1; }',
    ].join(' ');
    clone.insertBefore(style, clone.firstChild);

    const serial  = new XMLSerializer();
    const svgStr  = serial.serializeToString(clone);
    const blob    = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `haca-graph-${new Date().toISOString().slice(0,10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Export PNG ────────────────────────────────────────────────────────────
  _graphExportPNG() {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg) return;

    const W = svg.clientWidth  || 800;
    const H = svg.clientHeight || 600;

    // Serialise to SVG data-URI
    const clone = svg.cloneNode(true);
    clone.setAttribute('width',  W);
    clone.setAttribute('height', H);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = [
      'text { font-family: sans-serif; font-size: 10px; fill: #333; }',
      'line { stroke-opacity: 0.6; }',
      'circle { stroke-width: 1; }',
    ].join(' ');
    clone.insertBefore(style, clone.firstChild);

    const serial = new XMLSerializer();
    const svgStr = serial.serializeToString(clone);
    const svgB64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));

    // Draw on canvas → PNG blob
    const canvas  = document.createElement('canvas');
    canvas.width  = W * 2;   // 2x for retina
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      canvas.toBlob(blob => {
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `haca-graph-${new Date().toISOString().slice(0,10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.onerror = () => {
      // Fallback: download as SVG if PNG rendering fails
      console.warn('[HACA] PNG export failed, falling back to SVG');
      this._graphExportSVG();
    };
    img.src = svgB64;
  }

// ── battery.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════
  //  BATTERY MONITOR RENDER
  // ═══════════════════════════════════════════════════════════════════════

  _renderBatteryTables(list) {
    this._batteryList = list;

    // ── Stat cards ───────────────────────────────────────────────────────
    const cards = this.shadowRoot.querySelector('#bat-stat-cards');
    if (cards) {
      const critical = list.filter(b => b.severity === 'high').length;
      const low      = list.filter(b => b.severity === 'medium').length;
      const warning  = list.filter(b => b.severity === 'low').length;
      const ok       = list.filter(b => !b.severity).length;
      const total    = list.length;
      cards.innerHTML = [
        { label: this.t('battery.stat_critical'), val: critical, color: '#ef5350', icon: 'mdi:battery-alert' },
        { label: this.t('battery.stat_low'),      val: low,      color: '#ffa726', icon: 'mdi:battery-20' },
        { label: this.t('battery.stat_watch'),    val: warning,  color: '#ffd54f', icon: 'mdi:battery-50' },
        { label: this.t('battery.stat_ok'),       val: ok,       color: '#66bb6a', icon: 'mdi:battery' },
        { label: this.t('battery.stat_total'),    val: total,    color: 'var(--primary-color)', icon: 'mdi:battery-check' },
      ].map(s => `
        <div style="background:var(--secondary-background-color);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:4px;border:1px solid var(--divider-color);">
          <div style="display:flex;align-items:center;gap:6px;">
            <ha-icon icon="${s.icon}" style="--mdc-icon-size:18px;color:${s.color};"></ha-icon>
            <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--secondary-text-color);">${s.label}</span>
          </div>
          <div style="font-size:26px;font-weight:800;color:${s.color};line-height:1;">${s.val}</div>
        </div>`).join('');
    }

    // ── Summary text ─────────────────────────────────────────────────────
    const txt = this.shadowRoot.querySelector('#bat-summary-text');
    if (txt) {
      const alerts = list.filter(b => b.severity).length;
      txt.textContent = alerts > 0
        ? (alerts === 1 ? this.t('battery.alerts_summary_one') : this.t('battery.alerts_summary_other', {count: alerts}))
        : list.length > 0 ? this.t('battery.all_ok_summary', {count: list.length}) : this.t('battery.none_detected');
      txt.style.color = alerts > 0 ? '#ffa726' : 'var(--secondary-text-color)';
    }

    // ── Full table (main batteries tab) ──────────────────────────────────
    this._applyBatteryFilter(
      this.shadowRoot.querySelector('#bat-filter-select')?.value || 'all'
    );

    // ── Mini table (in Entités segment) ──────────────────────────────────
    const miniTbody = this.shadowRoot.querySelector('#bat-mini-tbody');
    if (miniTbody) {
      const alertBats = list.filter(b => b.severity);
      if (!alertBats.length && !list.length) {
        miniTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--secondary-text-color);">${this.t('battery.run_scan')}</td></tr>`;
      } else if (!alertBats.length) {
        miniTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:16px;color:#66bb6a;">${this.t('battery.all_ok_mini')}</td></tr>`;
      } else {
        miniTbody.innerHTML = alertBats.slice(0, 10).map(b => this._batRow(b)).join('');
      }
    }
  }

  _applyBatteryFilter(filterVal) {
    const tbody = this.shadowRoot.querySelector('#bat-tbody');
    if (!tbody) return;
    const list = this._batteryList || [];
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('battery.run_scan')}</td></tr>`;
      this._removeBatPagBar();
      return;
    }

    let filtered = list;
    if (filterVal === 'alert')  filtered = list.filter(b => b.severity);
    else if (filterVal === 'high')   filtered = list.filter(b => b.severity === 'high');
    else if (filterVal === 'medium') filtered = list.filter(b => b.severity === 'medium');
    else if (filterVal === 'low')    filtered = list.filter(b => b.severity === 'low');
    else if (filterVal === 'ok')     filtered = list.filter(b => !b.severity);

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('battery.no_category')}</td></tr>`;
      this._removeBatPagBar();
      return;
    }

    // ── Pagination ─────────────────────────────────────────────────────────
    const PAG_ID = 'battery-table';
    if (this._batLastFilter !== filterVal) {
      this._pagSet(PAG_ID, { page: 0 }, () => {});
      this._batLastFilter = filterVal;
    }
    this._batFiltered = filtered;
    const st = this._pagState(PAG_ID);
    const paged = this._pagSlice(filtered, st.page, st.pageSize);

    tbody.innerHTML = paged.map(b => this._batRow(b)).join('');

    // Barre de pagination sous le tableau
    this._removeBatPagBar();
    const table = tbody.closest('table');
    const wrap  = table?.parentElement;
    if (wrap) {
      wrap.insertAdjacentHTML('afterend', this._pagHTML(PAG_ID, filtered.length, st.page, st.pageSize));
      const pagBar = wrap.nextElementSibling;
      if (pagBar?.classList.contains('pag-bar')) {
        this._pagWire(pagBar.parentElement, () => this._applyBatteryFilter(this._batLastFilter || 'all'));
      }
    }
  }

  _removeBatPagBar() {
    // Supprimer l'éventuelle barre de pagination existante sous le tableau batteries
    const existing = this.shadowRoot.querySelector('.pag-bar[data-pag-id="battery-table"]');
    if (existing) existing.remove();
  }

  _batRow(b) {
    const level = b.level;
    const [barColor, statusBg, statusText] =
      b.severity === 'high'   ? ['#ef5350', 'rgba(239,83,80,0.12)',   this.t('battery.status_critical')] :
      b.severity === 'medium' ? ['#ffa726', 'rgba(255,167,38,0.12)',  this.t('battery.status_low')]      :
      b.severity === 'low'    ? ['#ffd54f', 'rgba(255,213,79,0.12)',  this.t('battery.status_watch')]    :
                                ['#66bb6a', 'rgba(102,187,106,0.10)', this.t('battery.status_ok')];
    const barPct = Math.round(level);
    const editUrl = `/developer-tools/state`;

    return `<tr style="border-bottom:1px solid var(--divider-color);">
      <td style="padding:8px 10px;max-width:240px;">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(b.friendly_name)}">
          ${this.escapeHtml(b.friendly_name)}
        </div>
        <div style="font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(b.entity_id)}</div>
      </td>
      <td style="padding:8px 10px;text-align:center;min-width:120px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <span style="font-weight:700;font-size:16px;color:${barColor};">${level.toFixed(0)} %</span>
          <div style="width:80px;height:6px;background:var(--divider-color);border-radius:3px;overflow:hidden;">
            <div style="width:${barPct}%;height:100%;background:${barColor};border-radius:3px;transition:width 0.4s;"></div>
          </div>
        </div>
      </td>
      <td style="padding:8px 10px;text-align:center;">
        <span style="background:${statusBg};border-radius:8px;padding:3px 10px;font-size:12px;font-weight:600;white-space:nowrap;">${statusText}</span>
      </td>
    </tr>`;
  }

  _restoreFilterChip(containerId, filter) {
    const bar = this.shadowRoot.querySelector(`#filter-bar-${containerId}`);
    if (!bar) return;
    bar.querySelectorAll('.filter-chip').forEach(c => { c.className = 'filter-chip'; });
    const chip = bar.querySelector(`[data-filter="${filter}"]`);
    if (chip) chip.classList.add(`active-${filter}`);
  }

  // Helper method to get Home Assistant edit URL for an entity
  getHAEditUrl(entityId) {
    if (!entityId) return null;

    const entityIdParts = entityId.split('.');
    const entityType = entityIdParts[0];

    // Get the item ID from state attributes
    const state = this.hass?.states?.[entityId];
    const itemId = state?.attributes?.id;

    // Map entity types to their edit URLs
    if (entityType === 'automation' && itemId) {
      return `/config/automation/edit/${itemId}`;
    } else if (entityType === 'script' && itemId) {
      return `/config/script/edit/${itemId}`;
    } else if (entityType === 'scene' && itemId) {
      return `/config/scene/edit/${itemId}`;
    } else if (entityType === 'automation') {
      // Fallback: try to use entity_id without the prefix
      return `/config/automation/edit/${entityIdParts[1]}`;
    } else if (entityType === 'script') {
      return `/config/script/edit/${entityIdParts[1]}`;
    } else if (entityType === 'scene') {
      return `/config/scene/edit/${entityIdParts[1]}`;
    }

    return null;
  }

  renderIssues(issues, containerId, severityFilter) {
    const container = this.shadowRoot.querySelector(`#${containerId}`);
    if (!container) return;

    // Store full list on container for filtering/export
    container._allIssues = issues;

    // ── Extended filter: type-based shortcuts ────────────────────────────
    const GHOST_TYPES     = new Set(['ghost_automation', 'never_triggered']);
    const DUPLICATE_TYPES = new Set(['duplicate_automation', 'probable_duplicate_automation']);

    let filtered;
    if (!severityFilter || severityFilter === 'all') {
      filtered = issues;
    } else if (severityFilter === 'ghost') {
      filtered = issues.filter(i => GHOST_TYPES.has(i.type));
    } else if (severityFilter === 'duplicate') {
      filtered = issues.filter(i => DUPLICATE_TYPES.has(i.type));
    } else {
      filtered = issues.filter(i => i.severity === severityFilter);
    }

    if (filtered.length === 0) {
      const msg = (severityFilter && severityFilter !== 'all')
        ? this.t('messages.no_issues_filtered')
        : this.t('messages.no_issues');
      container.innerHTML = `
        <div class="empty-state">
            <ha-icon icon="mdi:check-decagram-outline"></ha-icon>
            <p>${msg}</p>
        </div>`;
      return;
    }

    // ── Pagination ────────────────────────────────────────────────────────
    // Si le filtre a changé, revenir en page 0
    if (container._lastFilter !== severityFilter) {
      this._pagSet(containerId, { page: 0 }, () => {});
      container._lastFilter = severityFilter;
    }
    container._filteredIssues = filtered; // pour re-render depuis paginator

    const st = this._pagState(containerId);
    const paged = this._pagSlice(filtered, st.page, st.pageSize);

    // Store paged list by index — buttons use data-idx, never raw JSON in DOM
    container._renderedIssues = paged;

    container.innerHTML = paged.map((i, idx) => {
      const isFixable = ['device_id_in_trigger', 'device_id_in_action', 'device_id_in_target', 'device_trigger_platform', 'device_id_in_condition', 'device_condition_platform', 'incorrect_mode_motion_single', 'template_simple_state', 'no_description', 'no_alias', 'broken_device_reference', 'zombie_entity'].includes(i.type) || i.fix_available;
      const icon = i.severity === 'high' ? 'mdi:alert-decagram' : (i.severity === 'medium' ? 'mdi:alert' : 'mdi:information');
      const isGhost     = i.type === 'ghost_automation' || i.type === 'never_triggered';
      const isDuplicate = i.type === 'duplicate_automation' || i.type === 'probable_duplicate_automation';
      const cardIcon    = isGhost ? 'mdi:ghost-outline' : isDuplicate ? 'mdi:content-copy' : icon;
      const isSecurity = i.type.includes('security') || i.type.includes('secret') || i.type === 'sensitive_data_exposure';
      const isDashboard = i.type === 'dashboard_missing_entity';
      const editUrl = isDashboard ? null : this.getHAEditUrl(i.entity_id);
      // For dashboard issues: link to the Lovelace dashboard editor
      // dashboard_url is stored by the analyzer: /lovelace/0 or /dashboard_id/0
      const dashboardUrl = isDashboard ? (i.dashboard_url || '/lovelace/0') : null;

      return `
      <div class="issue-item ${i.severity}" style="${isSecurity ? 'border-left-color: var(--error-color, #ef5350);' : ''}">
        <div class="issue-main">
            <div class="issue-info">
                <div class="issue-header-row">
                    <ha-icon icon="${isSecurity ? 'mdi:shield-alert' : cardIcon}" style="--mdc-icon-size: 17px; flex-shrink:0; ${isSecurity ? 'color: var(--error-color, #ef5350);' : isGhost ? 'color: #9c27b0;' : isDuplicate ? 'color: #ffa726;' : ''}"></ha-icon>
                    <div class="issue-title">${this.escapeHtml(i.alias || i.entity_id || '')}</div>
                </div>
                <div class="issue-entity">${this.escapeHtml(i.entity_id || '')}</div>
                ${i.type === 'zombie_entity' && (i.automation_names || i.source_name) ? `
                <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;display:flex;align-items:center;gap:4px;">
                    <ha-icon icon="mdi:robot" style="--mdc-icon-size:12px;flex-shrink:0;"></ha-icon>
                    <span>${this.t('issues.in_automations')} ${this.escapeHtml((i.automation_names || [i.source_name]).slice(0,3).join(', '))}</span>
                </div>` : i.type === 'dashboard_missing_entity' ? `
                <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;display:flex;align-items:center;gap:4px;">
                    <ha-icon icon="mdi:view-dashboard-outline" style="--mdc-icon-size:12px;flex-shrink:0;"></ha-icon>
                    <span>${this.escapeHtml(i.source_name || i.dashboard || '?')} &rsaquo; ${this.escapeHtml((i.locations || [i.location || '?']).slice(0,2).join(', '))}</span>
                </div>` : (i.location && i.location !== '—' ? `
                <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;display:flex;align-items:center;gap:4px;">
                    <ha-icon icon="mdi:map-marker-outline" style="--mdc-icon-size:12px;flex-shrink:0;"></ha-icon>
                    <span>${this.escapeHtml(i.location)}</span>
                </div>` : '')}
            </div>
            <div class="issue-btns">
                ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration: none;"><button class="edit-ha-btn" style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);"><ha-icon icon="mdi:pencil"></ha-icon> ${this.t('actions.edit_ha')}</button></a>` : ''}
                ${dashboardUrl ? `<a href="${dashboardUrl}" target="_blank" style="text-decoration: none;"><button class="edit-ha-btn" style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);"><ha-icon icon="mdi:view-dashboard-edit-outline"></ha-icon> ${this.t('issues.open_dashboard')}</button></a>` : ''}
                <button class="explain-btn" data-idx="${idx}" style="background: var(--accent-color, #03a9f4); color: white;">
                    <ha-icon icon="mdi:robot"></ha-icon> IA
                </button>
                ${i.entity_id && i.entity_id.startsWith('automation.') && (() => {
                  const scores = this._lastData?.complexity_scores || [];
                  const row = scores.find(s => s.entity_id === i.entity_id);
                  return row && row.score >= 15;
                })() ? `
                <button class="optimize-btn" data-idx="${idx}"
                  title="${this.t('issues.complexity_score_title', {score: (this._lastData?.complexity_scores||[]).find(s=>s.entity_id===i.entity_id)?.score||0})}"
                  style="background:linear-gradient(135deg,#7b68ee,#a855f7);color:white;display:flex;align-items:center;gap:4px;">
                  <ha-icon icon="mdi:auto-fix" style="--mdc-icon-size:15px;"></ha-icon> ${this.t('issues.optimize')}
                </button>` : ''}
                ${isFixable ? `<button class="fix-btn" data-idx="${idx}"><ha-icon icon="mdi:magic-staff"></ha-icon> ${this.t('actions.fix')}</button>` : ''}
            </div>
        </div>
        <div class="issue-message">${this.escapeHtml(i.message || '')}</div>
        ${i.complexity_detail ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 9px;font-size:11px;font-family:monospace;font-weight:700;">
            ⚡ Score ${i.complexity_detail.score}
          </span>
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 9px;font-size:11px;">
            🔀 ${i.complexity_detail.triggers} ${this.t('issues.complexity_triggers')}
          </span>
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 9px;font-size:11px;">
            🔍 ${i.complexity_detail.conditions} ${this.t('issues.complexity_conditions')}
          </span>
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 9px;font-size:11px;">
            ▶ ${i.complexity_detail.actions} ${this.t('issues.complexity_actions')}
          </span>
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 9px;font-size:11px;">
            📝 ${i.complexity_detail.templates} ${this.t('issues.complexity_templates')}
          </span>
        </div>` : ''}

        ${(i.type === 'ghost_automation' || i.type === 'never_triggered') ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center;">
          ${i.last_triggered_days_ago != null ? `
          <span style="background:rgba(255,167,38,0.12);border:1px solid #ffa726;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:600;color:#e65100;">
            ⏱ ${this.t('issues.ghost_last_triggered', {days: i.last_triggered_days_ago})}
          </span>` : `
          <span style="background:rgba(239,83,80,0.10);border:1px solid #ef5350;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:600;color:#b71c1c;">
            ${this.t('issues.ghost_never_triggered')}
          </span>`}
          ${i.unavailable_triggers && i.unavailable_triggers.length ? `
          <span style="background:rgba(239,83,80,0.10);border:1px solid #ef5350;border-radius:6px;padding:2px 10px;font-size:11px;color:#b71c1c;" title="${i.unavailable_triggers.join(', ')}">
            ${i.unavailable_triggers.length === 1 ? this.t('issues.ghost_unavailable_one') : this.t('issues.ghost_unavailable_other', {count: i.unavailable_triggers.length})}
          </span>` : ''}
        </div>` : ''}

        ${(i.type === 'duplicate_automation' || i.type === 'probable_duplicate_automation') ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center;">
          ${i.type === 'probable_duplicate_automation' ? `
          <span style="background:rgba(255,167,38,0.12);border:1px solid #ffa726;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;color:#e65100;">
            ${this.t('issues.duplicate_jaccard', {pct: i.similarity_pct})}
          </span>` : `
          <span style="background:rgba(239,83,80,0.10);border:1px solid #ef5350;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;color:#b71c1c;">
            ${this.t('issues.duplicate_exact')}
          </span>`}
          ${i.similar_to ? `
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:11px;color:var(--secondary-text-color);" title="${this.escapeHtml(i.similar_to)}">
            ↔ ${this.escapeHtml(i.similar_to.replace('automation.',''))}
          </span>` : ''}
          ${i.duplicate_ids && i.duplicate_ids.length ? i.duplicate_ids.slice(0,3).map(d => `
          <span style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:11px;color:var(--secondary-text-color);" title="${this.escapeHtml(d)}">
            ↔ ${this.escapeHtml(d.replace('automation.',''))}
          </span>`).join('') : ''}
        </div>` : ''}

        ${i.recommendation ? `
            <div class="issue-reco">
                <ha-icon icon="mdi:lightbulb-outline" style="--mdc-icon-size: 16px; flex-shrink:0; margin-top:1px;"></ha-icon>
                <span>${this.escapeHtml(i.recommendation)}</span>
            </div>
        ` : ''}
      </div>
    `}).join('');

    container.querySelectorAll('.fix-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const issue = container._renderedIssues[idx];
        if (issue) this.showFixPreview(issue);
      });
    });

    container.querySelectorAll('.optimize-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const issue = container._renderedIssues?.[idx];
        if (issue) this._showOptimizer(issue);
      });
    });

    container.querySelectorAll('.explain-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const issue = container._renderedIssues[idx];
        if (issue) this.explainWithAI(issue);
      });
    });

    // ── Barre de pagination ──────────────────────────────────────────────
    container.insertAdjacentHTML('beforeend',
      this._pagHTML(containerId, filtered.length, st.page, st.pageSize)
    );
    this._pagWire(container, () => {
      // Re-render depuis les données filtrées stockées sur le conteneur
      this.renderIssues(container._allIssues, containerId, container._lastFilter);
      // Restaurer l'état du chip actif (renderIssues ne touche pas aux chips)
      this._restoreFilterChip(containerId, container._lastFilter || 'all');
    });
  }

  async explainWithAI(issue) {
    const card = this.createModal(`
        <div style="padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center;">
            <div class="loader"></div>
            <div style="margin-top: 20px; font-size: 18px; font-weight: 500; color: var(--primary-text-color);">🤖 ${this.t('ai.analyzing')}</div>
            <div style="margin-top: 8px; font-size: 14px; color: var(--secondary-text-color);">${this.t('seconds')}</div>
        </div>
    `);

    try {
      const response = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'explain_issue_ai',
        service_data: { issue: issue },
        return_response: true
      });
      let explanation = this.t('ai.no_explanation');

      if (response && response.response && response.response.explanation) {
        explanation = response.response.explanation;
      } else if (response && response.explanation) {
        explanation = response.explanation;
      }

      card._updateContent(`
        <div style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--divider-color); padding-bottom: 16px;">
                <ha-icon icon="mdi:robot" style="--mdc-icon-size: 48px; color: var(--primary-color);"></ha-icon>
                <div>
                    <h2 style="margin: 0;">${this.t('modals.ai_analysis')}</h2>
                    <div style="font-size: 14px; opacity: 0.7;">${issue.alias || issue.entity_id}</div>
                </div>
            </div>
            
            <div style="background: var(--secondary-background-color); padding: 20px; border-radius: 12px; line-height: 1.6; font-size: 15px; color: var(--primary-text-color); white-space: pre-wrap; flex: 1; overflow-y: auto; min-height: 0;">${explanation}</div>
            
        </div>
      `);

    } catch (error) {
      card._updateContent(`<div style="padding: 24px; color: var(--error-color);">❌ ${this.t('notifications.error')}: ${error.message}</div>`);
      setTimeout(() => card.parentElement.remove(), 4000);
    }
  }

  async showFixPreview(issue) {
    // Handle description/alias issues with AI suggestion
    if (['no_description', 'no_alias'].includes(issue.type)) {
      this.fixDescriptionAI(issue);
      return;
    }

    // Handle zombie entity - entity referenced but doesn't exist
    if (issue.type === 'zombie_entity') {
      this.showZombieEntityFix(issue);
      return;
    }

    // Handle broken device reference - cannot be auto-fixed, show explanation
    if (issue.type === 'broken_device_reference') {
      // Determine edit URL based on entity type and ID
      let editUrl = '';
      const entityId = issue.entity_id || '';
      const entityIdParts = entityId.split('.');
      const entityType = entityIdParts[0];

      // Get the automation/script/scene ID from state attributes
      const state = this.hass.states[entityId];
      const itemId = state?.attributes?.id;

      if (entityType === 'automation' && itemId) {
        editUrl = `/config/automation/edit/${itemId}`;
      } else if (entityType === 'script' && itemId) {
        editUrl = `/config/script/edit/${itemId}`;
      } else if (entityType === 'scene' && itemId) {
        editUrl = `/config/scene/edit/${itemId}`;
      }

      const card = this.createModal(`
        <div style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--divider-color); padding-bottom: 16px;">
                <ha-icon icon="mdi:alert-circle" style="--mdc-icon-size: 48px; color: var(--error-color);"></ha-icon>
                <div>
                    <h2 style="margin: 0;">${this.t('modals.broken_device_ref')}</h2>
                    <div style="font-size: 14px; opacity: 0.7;">${issue.entity_id}</div>
                </div>
            </div>
            
            <div style="background: rgba(239, 83, 80, 0.1); padding: 20px; border-radius: 12px; border-left: 4px solid var(--error-color); margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: var(--error-color);">⚠️ ${this.t('modals.cannot_auto_fix')}</div>
                <div style="line-height: 1.6;">${issue.message}</div>
            </div>
            
            <div style="background: var(--secondary-background-color); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <ha-icon icon="mdi:lightbulb-outline" style="color: var(--primary-color);"></ha-icon>
                    ${this.t('modals.how_to_fix')}
                </div>
                <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>${this.t('instructions.open_yaml_editor')}</li>
                    <li>${this.t('instructions.find_device_ref')}: <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;">${issue.device_id || this.t('modals.unknown_device_id')}</code></li>
                    <li>${this.t('instructions.replace_entity')}</li>
                    <li>${this.t('instructions.save_reload')}</li>
                </ol>
            </div>
            
            <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                <button class="close-btn" style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);">${this.t('actions.close')}</button>
                ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration: none;"><button class="edit-btn" style="background: var(--primary-color); color: white;"><ha-icon icon="mdi:pencil"></ha-icon> ${this.t('modals.open_editor')}</button></a>` : ''}
            </div>
        </div>
      `);
      card.querySelector('.close-btn')?.addEventListener('click', () => { if (card._closeModal) card._closeModal(); else card.parentElement?.remove(); });
      return;
    }

    // Determine service payload based on issue type
    let service = '';
    let serviceData = {};

    if (['device_id_in_trigger', 'device_id_in_action', 'device_id_in_target', 'device_trigger_platform', 'device_id_in_condition', 'device_condition_platform'].includes(issue.type)) {
      service = 'preview_device_id';

      // Extract automation_id from entity_id
      // Try multiple strategies to find the automation ID
      let automation_id = null;

      // Strategy 1: Get from state attributes
      const state = this.hass.states[issue.entity_id];
      if (state && state.attributes.id) {
        automation_id = state.attributes.id;
      }

      // Strategy 2: Extract from entity_id (automation.xxx -> xxx)
      if (!automation_id && issue.entity_id && issue.entity_id.startsWith('automation.')) {
        const entity_name = issue.entity_id.replace('automation.', '');
        // Try to find automation by alias that matches the entity name
        automation_id = entity_name;
      }

      // Strategy 3: Use the entity_id itself as fallback
      if (!automation_id) {
        automation_id = issue.entity_id;
      }

      if (automation_id) {
        serviceData = { automation_id: automation_id };
      } else {
        console.warn("Could not find automation ID for", issue.entity_id);
        this.showHANotification(this.t('fix.cannot_find_automation'), issue.entity_id || '', 'haca_error');
        return;
      }

    } else if (issue.type === 'incorrect_mode_motion_single') {
      service = 'preview_mode';
      const state = this.hass.states[issue.entity_id];
      if (state && state.attributes.id) {
        serviceData = { automation_id: state.attributes.id, mode: 'restart' };
      } else {
        this.showHANotification(this.t('fix.cannot_find_automation'), issue.entity_id || '', 'haca_error');
        return;
      }
    } else if (issue.type === 'template_simple_state') {
      service = 'preview_template';
      const state = this.hass.states[issue.entity_id];
      if (state && state.attributes.id) {
        serviceData = { automation_id: state.attributes.id };
      } else {
        this.showHANotification(this.t('fix.cannot_find_automation'), issue.entity_id || '', 'haca_error');
        return;
      }
    }

    // Show loading modal
    const modal = this.createModal(this.t('reports.loading_proposal'));

    try {
      const result = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: service,
        service_data: serviceData,
        return_response: true
      });

      const response = result.response || result;

      if (response.success) {
        this.renderDiffModal(modal, response, issue, service, serviceData);
      } else {
        modal._updateContent(`<div style="padding:20px;color:red">${this.t('notifications.error')}: ${response.error || this.t('fix.error_unknown')}</div>`);
        setTimeout(() => modal._closeModal && modal._closeModal(), 3000);
      }
    } catch (e) {
      modal._updateContent(`<div style="padding:20px;color:red">${this.t('notifications.error')}: ${e.message}</div>`);
      setTimeout(() => modal._closeModal && modal._closeModal(), 3000);
    }
  }

  createModal(content) {
    // Append to document.body — Shadow DOM rend le Light DOM du host invisible,
    // donc tout appendChild(this) serait invisible. document.body est toujours visible.
    const existing = document.body.querySelector('.haca-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'haca-modal';
    const _isMobile = window.innerWidth <= 600;
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 9999;
        display: flex; justify-content: center; align-items: ${_isMobile ? 'flex-end' : 'center'};
      `;

    const card = document.createElement('div');
    card.className = 'haca-modal-card';
    const _mobile = window.innerWidth <= 600;
    card.style.cssText = _mobile
      ? `background: var(--card-background-color); width: 100%; max-width: 100%;
         max-height: 95vh; overflow: hidden; border-radius: 16px 16px 0 0; padding: 0;
         box-shadow: 0 -4px 24px rgba(0,0,0,0.3); display: flex; flex-direction: column; position: relative;`
      : `background: var(--card-background-color); width: 92%; max-width: 1000px;
         max-height: 90vh; overflow: hidden; border-radius: 16px; padding: 0;
         box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column; position: relative;`;

    // Add close button absolutely positioned in top right of modal card
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '<ha-icon icon="mdi:close"></ha-icon>';
    closeBtn.style.cssText = `
        position: absolute;
        top: 14px;
        right: 9px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: var(--secondary-background-color);
        color: #333;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 100;
        flex-shrink: 0;
      `;

    // Function to close modal
    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'var(--error-color, #ef5350)';
      closeBtn.style.color = 'white';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'var(--secondary-background-color)';
      closeBtn.style.color = 'black';
    });

    card.appendChild(closeBtn);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content-wrapper';
    contentWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;';
    contentWrapper.innerHTML = typeof content === 'string' ? content : '';
    if (typeof content !== 'string') contentWrapper.appendChild(content);
    card.appendChild(contentWrapper);

    modal.appendChild(card);
    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Store reference to closeModal function and closeBtn on the card
    card._closeModal = closeModal;
    card._closeBtn = closeBtn;

    // Helper method to update content while preserving close button
    card._updateContent = (html) => {
      contentWrapper.innerHTML = html;
    };

    return card;
  }

  /**
   * Ouvre le modal diff/dry-run depuis un événement HA Repairs.
   *
   * Appelé par _subscribeToRepairsFix() quand le backend fire
   * "haca_open_fix_modal". Crée le modal au niveau document.body
   * pour qu'il soit visible depuis n'importe quel panneau HA
   * (l'utilisateur est probablement sur la page HA Repairs).
   *
   * @param {Object} data  Données de l'event : automation_id, fix_type,
   *                       issue_type, entity_id, alias, mode, message...
   */
  async showZombieEntityFix(issue) {
    const zombieId = issue.entity_id;
    const automationIds = issue.automation_ids || (issue.automation_id ? [issue.automation_id] : []);

    // Show loading modal while fetching fuzzy suggestions
    const card = this.createModal(`
      <div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;">
        <div class="loader"></div>
        <div style="margin-top:20px;font-size:18px;font-weight:500;">🔍 ${this.t('zombie.searching')}</div>
      </div>
    `);

    let suggestions = [];
    try {
      const resp = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'get_fuzzy_suggestions',
        service_data: { entity_id: zombieId },
        return_response: true
      });
      suggestions = resp?.response?.suggestions || resp?.suggestions || [];
    } catch (e) { /* no suggestions available */ }

    const suggestionsHtml = suggestions.length > 0
      ? `<div style="margin-bottom:16px;">
          <div style="font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
            <ha-icon icon="mdi:lightbulb-on-outline" style="color:var(--warning-color);--mdc-icon-size:18px;"></ha-icon>
            ${this.t('zombie.similar_detected')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${suggestions.map(s => `
              <button class="suggestion-btn" data-value="${s}"
                style="background:var(--secondary-background-color);color:var(--primary-text-color);
                       border:1px solid var(--primary-color);border-radius:8px;padding:6px 14px;
                       font-size:13px;cursor:pointer;">
                <ha-icon icon="mdi:swap-horizontal" style="--mdc-icon-size:14px;"></ha-icon> ${s}
              </button>`).join('')}
          </div>
        </div>`
      : `<div style="margin-bottom:16px;color:var(--secondary-text-color);font-size:13px;">
           ${this.t('misc.no_similar_entity')}
         </div>`;

    const automationsHtml = automationIds.length > 0
      ? automationIds.map(aid => {
          const state = this.hass.states[aid];
          const label = state?.attributes?.friendly_name || aid;
          return `<li style="padding:4px 0;"><code style="font-size:12px;background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:4px;">${label}</code></li>`;
        }).join('')
      : `<li>${this.t('zombie.unknown_automation')}</li>`;

    card._updateContent(`
      <div style="padding:24px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;border-bottom:1px solid var(--divider-color);padding-bottom:16px;">
          <ha-icon icon="mdi:ghost-outline" style="--mdc-icon-size:42px;color:var(--error-color);"></ha-icon>
          <div>
            <h2 style="margin:0;">${this.t('zombie.entity_not_found')}</h2>
            <div style="font-size:13px;opacity:0.7;">${zombieId}</div>
          </div>
        </div>

        <div style="background:rgba(239,83,80,0.08);padding:14px 18px;border-radius:10px;border-left:4px solid var(--error-color);margin-bottom:20px;font-size:14px;">
          ${issue.message}<br>
          <div style="margin-top:6px;opacity:0.8;font-size:13px;">${this.t('zombie.referenced_in', {count: automationIds.length})}</div>
          <ul style="margin:6px 0 0 0;padding-left:20px;">${automationsHtml}</ul>
        </div>

        ${suggestionsHtml}

        <div style="margin-bottom:20px;">
          <label style="font-weight:600;font-size:14px;display:block;margin-bottom:8px;">
            ${this.t('zombie.replace_with')}
          </label>
          <input id="new-entity-input" type="text"
            placeholder="${this.t('battery.entity_placeholder')}"
            style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--divider-color);
                   background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;box-sizing:border-box;">
        </div>

        <div style="background:var(--secondary-background-color);padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:13px;color:var(--secondary-text-color);">
          <ha-icon icon="mdi:shield-check-outline" style="--mdc-icon-size:15px;"></ha-icon>
          ${this.t('zombie.auto_backup_info')}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div id="zombie-editor-btn"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
            <button class="close-btn" style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">${this.t('actions.cancel')}</button>
            <button id="apply-zombie-single-btn" style="background:var(--primary-color);color:white;font-weight:600;" ${automationIds.length <= 1 ? 'style="display:none"' : ''}>
              <ha-icon icon="mdi:magic-staff"></ha-icon> ${this.t('zombie.fix_this')}
            </button>
            <button id="apply-zombie-btn" style="background:var(--error-color);color:white;font-weight:600;" ${automationIds.length <= 1 ? '' : ''}>
              <ha-icon icon="mdi:magic-staff"></ha-icon> ${automationIds.length > 1 ? this.t('zombie.fix_all', {count: automationIds.length}) : this.t('modals.apply_correction')}
            </button>
          </div>
        </div>
      </div>
    `);

    // Suggestion chips fill the input
    card.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelector('#new-entity-input').value = btn.dataset.value;
        card.querySelectorAll('.suggestion-btn').forEach(b => b.style.borderColor = 'var(--primary-color)');
        btn.style.borderColor = 'var(--success-color, #4caf50)';
        btn.style.background = 'rgba(76,175,80,0.12)';
      });
    });

    card.querySelector('.close-btn').addEventListener('click', () => {
      if (card._closeModal) card._closeModal();
    });

    // "Modifier manuellement" — open HA editor for the first impacted automation
    const zombieEditorContainer = card.querySelector('#zombie-editor-btn');
    if (zombieEditorContainer && automationIds.length > 0) {
      const firstAutomationId = automationIds[0];
      const editorUrl = this.getHAEditUrl(firstAutomationId);
      if (editorUrl) {
        zombieEditorContainer.innerHTML = `
          <a href="${editorUrl}" target="_blank" style="text-decoration:none;">
            <button style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">
              <ha-icon icon="mdi:pencil"></ha-icon> ${this.t('zombie.edit_manual')}
            </button>
          </a>`;
      }
    }

    // Helper: apply fix to a subset of automations
    const applyZombieFix = async (targetIds, btn) => {
      const newEntityId = card.querySelector('#new-entity-input').value.trim();
      btn.disabled = true;
      btn.innerHTML = `<span class="btn-loader"></span> ${this.t('zombie.applying')}`;
      let successCount = 0;
      let errors = [];
      for (const automationId of targetIds) {
        try {
          const resp = await this.hass.callWS({
            type: 'call_service',
            domain: 'config_auditor',
            service: 'apply_zombie_fix',
            service_data: { automation_id: automationId, old_entity_id: zombieId, new_entity_id: newEntityId },
            return_response: true
          });
          const result = resp?.response || resp;
          if (result?.success) successCount++;
          else errors.push(result?.error || this.t('fix.error_unknown'));
        } catch (e) { errors.push(e.message); }
      }
      if (card._closeModal) card._closeModal();
      if (errors.length === 0) {
        this.showToastNotification({ title: this.t('zombie.fix_success_title'), message: this.t('zombie.fix_success_msg', {entity: zombieId, count: successCount}), type: 'success' });
      } else {
        this.showToastNotification({ title: this.t('zombie.errors_partial_title'), message: this.t('misc.errors_partial', {ok: successCount, errors: errors.length}), type: 'warning' });
      }
      setTimeout(() => this.loadData(), 1500);
    };

    // "Corriger cette automation" — applies only to first (the issue clicked)
    const singleBtn = card.querySelector('#apply-zombie-single-btn');
    if (singleBtn) {
      if (automationIds.length <= 1) singleBtn.style.display = 'none';
      singleBtn.addEventListener('click', () => applyZombieFix([automationIds[0]], singleBtn));
    }

    // "Corriger toutes" — applies to all referencing automations
    card.querySelector('#apply-zombie-btn').addEventListener('click', async (e) => {
      applyZombieFix(automationIds, e.currentTarget);
    });
  }


  async fixDescriptionAI(issue) {
    const card = this.createModal(`
        <div style="padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center;">
            <div class="loader"></div>
            <div style="margin-top: 20px; font-size: 18px; font-weight: 500; color: var(--primary-text-color);">🤖 ${this.t('ai.generating')}</div>
            <div style="margin-top: 8px; font-size: 14px; color: var(--secondary-text-color);">${this.t('ai.searching')}</div>
        </div>
    `);

    try {
      const result = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'suggest_description_ai',
        service_data: { entity_id: issue.entity_id || issue.alias },
        return_response: true
      });

      const response = result.response || result;
      if (!response.success) throw new Error(response.error || this.t('ai.no_explanation'));

      card._updateContent(`
            <div style="padding: 24px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--divider-color); padding-bottom: 16px;">
                    <ha-icon icon="mdi:robot-confused-outline" style="--mdc-icon-size: 40px; color: var(--primary-color);"></ha-icon>
                    <div>
                        <h2 style="margin: 0;">${this.t('modals.suggest_description')}</h2>
                        <div style="font-size: 14px; opacity: 0.7;">${issue.alias || issue.entity_id}</div>
                    </div>
                </div>

                <div style="color: var(--primary-text-color); margin-bottom: 12px; font-weight: 500;">${this.t('modals.ai_proposition')}</div>
                <textarea id="desc-input" style="width: 100%; height: 100px; padding: 12px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--secondary-background-color); color: var(--primary-text-color); font-family: inherit; font-size: 14px; box-sizing: border-box; resize: none; margin-bottom: 4px;">${response.suggestion}</textarea>
                <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 20px;">${this.t('modals.edit_text')}</div>
                
                <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="close-btn" style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);">${this.t('actions.cancel')}</button>
                    <button class="apply-btn" style="background: var(--primary-color); color: white;">${this.t('actions.apply')}</button>
                </div>
            </div>
        `);

      card.querySelector('.close-btn')?.addEventListener('click', () => { if (card._closeModal) card._closeModal(); else card.parentElement?.remove(); });
      card.querySelector('.apply-btn').addEventListener('click', async () => {
        const desc = card.querySelector('#desc-input').value;
        card._updateContent(`
                <div style="padding: 40px; text-align: center;">
                    <div class="loader"></div>
                    <p style="margin-top: 20px;">${this.t('messages.yaml_updating')}</p>
                </div>`);

        try {
          await this.hass.callService('config_auditor', 'fix_description', {
            entity_id: issue.entity_id || issue.alias,
            description: desc
          });

          // Trigger a new scan so the issue disappears from the list
          await this.hass.callService('config_auditor', 'scan_automations');

          // Wait for backend processing and sensor updates
          setTimeout(() => {
            this.updateFromHass();
            card.parentElement.remove();
          }, 1500);

        } catch (err) {
          this.showHANotification(
            '❌ ' + this.t('notifications.error'),
            err.message,
            'haca_error'
          );
          if (card._closeModal) card._closeModal();
          else card.parentElement?.remove();
        }
      });

    } catch (e) {
      card._updateContent(`
            <div style="padding: 24px;">
                <h2 style="color: var(--error-color);">❌ ${this.t('notifications.error')}</h2>
                <p>${e.message}</p>
                <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
                    <button class="close-btn" style="background: var(--primary-color);">${this.t('actions.close')}</button>
                </div>
            </div>
        `);
      card.querySelector('.close-btn')?.addEventListener('click', () => { if (card._closeModal) card._closeModal(); else card.parentElement?.remove(); });
    }
  }

  renderDiffModal(card, result, issue, previewService, serviceData) {
    card._updateContent(`
        <div class="section-header" style="background: var(--secondary-background-color); border-bottom: 1px solid var(--divider-color); padding: 20px 24px; padding-right: 48px; flex-shrink: 0;">
            <h2 style="margin:0; font-size: 20px; display: flex; align-items: center; gap: 12px;">
                <ha-icon icon="mdi:magic-staff"></ha-icon> ${this.t('modals.correction_proposal')}
            </h2>
        </div>
        <div style="padding: 24px; flex: 1; overflow-y: auto; min-height: 0;">
            <div style="margin-bottom: 24px; background: rgba(var(--rgb-primary-color), 0.05); padding: 16px; border-radius: 12px; border-left: 4px solid var(--primary-color);">
                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <ha-icon icon="mdi:robot" style="--mdc-icon-size: 18px; color: var(--primary-color);"></ha-icon>
                    <strong>${this.t('modals.automation')}:</strong> <span style="font-weight: 500;">${result.alias}</span> (${result.automation_id})
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size: 18px; color: var(--error-color);"></ha-icon>
                    <strong>${this.t('modals.problem')}:</strong> ${issue.message}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div>
                    <h3 style="margin-top:0; color: var(--error-color); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                        <ha-icon icon="mdi:minus-box-outline"></ha-icon> ${this.t('modals.before')}
                    </h3>
                    <pre style="background: var(--secondary-background-color); padding: 16px; overflow: auto; border-radius: 12px; font-size: 12px; border: 1px solid var(--divider-color); max-height: 400px;">${this.escapeHtml(result.current_yaml)}</pre>
                </div>
                <div>
                    <h3 style="margin-top:0; color: var(--success-color, #4caf50); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                        <ha-icon icon="mdi:plus-box-outline"></ha-icon> ${this.t('modals.after')}
                    </h3>
                    <pre style="background: var(--secondary-background-color); padding: 16px; overflow: auto; border-radius: 12px; font-size: 12px; border: 1px solid var(--divider-color); max-height: 400px; outline: 1px solid var(--success-color, #4caf50); outline-offset: -1px;">${this.highlightDiff(result.new_yaml, result.current_yaml)}</pre>
                </div>
            </div>
            
            <div style="background: var(--secondary-background-color); padding: 20px; border-radius: 12px; border: 1px solid var(--divider-color);">
                <div style="font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <ha-icon icon="mdi:playlist-check"></ha-icon>
                    ${this.t('modals.changes_identified')} (${result.changes_count}):
                </div>
                <ul style="margin: 0; padding-left: 24px; line-height: 1.6; color: var(--primary-text-color);">
                    ${result.changes.map(c => `<li style="margin-bottom: 4px;">${c.description}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div style="padding: 20px 24px; border-top: 1px solid var(--divider-color); display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; background: var(--secondary-background-color); flex-shrink: 0;">
            <div id="edit-btn-container"></div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;">
                <button style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);" onclick="this.closest('.haca-modal').remove()"><ha-icon icon="mdi:close"></ha-icon> ${this.t('actions.cancel')}</button>
                <button id="apply-fix-btn" style="background: var(--primary-color); color: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(var(--rgb-primary-color), 0.3);">
                    <ha-icon icon="mdi:check-circle-outline"></ha-icon> ${this.t('modals.apply_correction')}
                </button>
            </div>
        </div>
      `);

    // "Modifier manuellement" button — open HA editor for this automation/script
    const editUrl = this.getHAEditUrl(issue.entity_id);
    const editContainer = card.querySelector('#edit-btn-container');
    if (editUrl && editContainer) {
      editContainer.innerHTML = `
        <a href="${editUrl}" target="_blank" style="text-decoration:none;">
          <button style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">
            <ha-icon icon="mdi:pencil"></ha-icon> ${this.t('zombie.edit_manual')}
          </button>
        </a>`;
    }

    card.querySelector('#apply-fix-btn').addEventListener('click', () => {
      this.applyFix(issue, previewService, serviceData, card);
    });
  }

  async applyFix(issue, previewService, serviceData, card) {
    const btn = card.querySelector('#apply-fix-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-loader"></span> ${this.t('fix.applying')}`;

    // Determine apply service based on preview service
    let applyService = '';
    if (previewService === 'preview_device_id') applyService = 'fix_device_id';
    else if (previewService === 'preview_mode') applyService = 'fix_mode';
    else if (previewService === 'preview_template') applyService = 'fix_template';


    try {
      const result = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: applyService,
        service_data: serviceData,
        return_response: true
      });

      const response = result.response || result;

      if (response.success) {
        card._updateContent(`
                <div style="padding: 48px 32px; text-align: center; animation: fadeIn 0.4s ease-out;">
                    <div style="font-size: 64px; margin-bottom: 24px; filter: drop-shadow(0 4px 12px rgba(76, 175, 80, 0.4));">✅</div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--primary-text-color);">${this.t('fix.success')}</h2>
                    <p style="color: var(--secondary-text-color); margin-bottom: 24px; line-height: 1.6;">${response.message}</p>
                    ${response.backup_path ? `
                        <div style="background: var(--secondary-background-color); padding: 12px; border-radius: 12px; margin-bottom: 32px; display: inline-flex; align-items: center; gap: 10px; border: 1px solid var(--divider-color);">
                            <ha-icon icon="mdi:zip-box-outline" style="color: var(--primary-color);"></ha-icon>
                            <span style="font-family: monospace; font-size: 12px;">${this.t('backup.backup_created')}: ${response.backup_path.split(/[\\/]/).pop()}</span>
                        </div>
                    ` : ''}
                    <div>
                        <button style="background: var(--primary-color); color: white; padding: 12px 32px; font-weight: 600;" onclick="this.closest('.haca-modal').remove()">${this.t('actions.close')}</button>
                    </div>
                </div>
              `);

        // Refresh data
        setTimeout(() => this.scanAutomations(), 1000);
      } else {
        this.showHANotification('❌ ' + this.t('notifications.error'), response.error || this.t('fix.error_unknown'), 'haca_error');
        btn.disabled = false;
        btn.innerHTML = `<ha-icon icon="mdi:check-circle-outline"></ha-icon> ${this.t('modals.apply_correction')}`;
      }
    } catch (e) {
      this.showHANotification('❌ ' + this.t('notifications.error'), e.message, 'haca_error');
      btn.disabled = false;
      btn.innerHTML = `<ha-icon icon="mdi:check-circle-outline"></ha-icon> ${this.t('modals.apply_correction')}`;
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  highlightDiff(newText, oldText) {
    // Real line-by-line diff implementation
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');

    // Build LCS (Longest Common Subsequence) matrix
    const lcs = this._buildLCSMatrix(oldLines, newLines);

    // Generate diff output
    const diffLines = [];
    this._generateDiffLines(oldLines, newLines, lcs, oldLines.length, newLines.length, diffLines);

    // Format diff with colors
    return diffLines.map(line => {
      const escapedLine = this.escapeHtml(line.text);
      if (line.type === 'added') {
        return `<div style="background: rgba(76, 175, 80, 0.15); border-left: 3px solid #4caf50; padding-left: 8px; margin-left: -3px;"><span style="color: #4caf50; font-weight: bold;">+</span> ${escapedLine}</div>`;
      } else if (line.type === 'removed') {
        return `<div style="background: rgba(244, 67, 54, 0.15); border-left: 3px solid #f44336; padding-left: 8px; margin-left: -3px;"><span style="color: #f44336; font-weight: bold;">-</span> ${escapedLine}</div>`;
      } else {
        return `<div style="padding-left: 11px;"><span style="color: var(--secondary-text-color);"> </span> ${escapedLine}</div>`;
      }
    }).join('');
  }

  // Build LCS matrix for diff algorithm
  _buildLCSMatrix(oldLines, newLines) {
    const m = oldLines.length;
    const n = newLines.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp;
  }

  // Generate diff lines by backtracking through LCS matrix
  _generateDiffLines(oldLines, newLines, lcs, i, j, result) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      this._generateDiffLines(oldLines, newLines, lcs, i - 1, j - 1, result);
      result.push({ type: 'unchanged', text: oldLines[i - 1] });
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      this._generateDiffLines(oldLines, newLines, lcs, i, j - 1, result);
      result.push({ type: 'added', text: newLines[j - 1] });
    } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
      this._generateDiffLines(oldLines, newLines, lcs, i - 1, j, result);
      result.push({ type: 'removed', text: oldLines[i - 1] });
    }
  }

  updateFromHass() {
    // Conservé pour compatibilité avec les appels internes (scan buttons, fix callbacks, etc.)
    this.loadData();
  }

  // Helper method to show loader on a button
  _setButtonLoading(btn, loading, originalContent) {
    if (!btn) return;

    if (loading) {
      btn.classList.add('scanning');
      btn.disabled = true;
      btn.innerHTML = `<span class="btn-loader"></span> ${this.t('messages.scan_in_progress')}`;
    } else {
      btn.classList.remove('scanning');
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  }

  async scanAll() {
    if (this._scanAllInProgress) return;
    this._scanAllInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-all');
    const originalContent = `<ha-icon icon="mdi:magnify-scan"></ha-icon> ${this.t('buttons.scan_all')}`;
    this._setButtonLoading(btn, true, originalContent);

    // Timeout de sécurité : si haca_scan_complete n'arrive pas en 5 min,
    // on déverrouille quand même le bouton
    const SCAN_TIMEOUT_MS = 5 * 60 * 1000;
    let scanTimeoutId = null;
    let unsubScanComplete = null;

    const _cleanup = () => {
      if (scanTimeoutId) { clearTimeout(scanTimeoutId); scanTimeoutId = null; }
      if (unsubScanComplete) { try { unsubScanComplete(); } catch (_) {} unsubScanComplete = null; }
      this._scanAllInProgress = false;
      this._setButtonLoading(btn, false, originalContent);
    };

    try {
      // S'abonner à haca_scan_complete AVANT de lancer le scan
      // pour ne manquer aucun événement (race condition impossible)
      if (this.hass?.connection) {
        unsubScanComplete = await this.hass.connection.subscribeEvents((event) => {
          _cleanup();
          this.loadData();
        }, 'haca_scan_complete');
      }

      // Timeout de sécurité
      scanTimeoutId = setTimeout(() => {
        console.warn('[HACA] Scan timeout — forcing UI unlock');
        _cleanup();
        this.loadData();
      }, SCAN_TIMEOUT_MS);

      // Lancer le scan (fire-and-forget côté backend, répond immédiatement)
      const result = await this.hass.callWS({ type: 'haca/scan_all' });
      if (result && result.accepted === false) {
        // Scan déjà en cours côté backend
        _cleanup();
      }
    } catch (error) {
      console.error('[HACA] Scan error:', error);
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _cleanup();
    }
  }

  async scanAutomations() {
    if (this._scanAutoInProgress) return;
    this._scanAutoInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-auto');
    const originalContent = `<ha-icon icon="mdi:robot"></ha-icon> ${this.t('buttons.automations')}`;
    this._setButtonLoading(btn, true, originalContent);
    let unsubDone = null;
    let tid = null;
    const _done = () => {
      if (tid) { clearTimeout(tid); tid = null; }
      if (unsubDone) { try { unsubDone(); } catch (_) {} unsubDone = null; }
      this._scanAutoInProgress = false;
      this._setButtonLoading(btn, false, originalContent);
    };
    try {
      if (this.hass?.connection) {
        unsubDone = await this.hass.connection.subscribeEvents(() => {
          _done(); this.loadData();
        }, 'haca_scan_complete');
      }
      tid = setTimeout(() => { _done(); this.loadData(); }, 5 * 60 * 1000);
      await this.hass.callService('config_auditor', 'scan_automations');
    } catch (error) {
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _done();
    }
  }

  async scanEntities() {
    if (this._scanEntityInProgress) return;
    this._scanEntityInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-entity');
    const originalContent = `<ha-icon icon="mdi:lightning-bolt"></ha-icon> ${this.t('buttons.entities')}`;
    this._setButtonLoading(btn, true, originalContent);
    let unsubDone = null;
    let tid = null;
    const _done = () => {
      if (tid) { clearTimeout(tid); tid = null; }
      if (unsubDone) { try { unsubDone(); } catch (_) {} unsubDone = null; }
      this._scanEntityInProgress = false;
      this._setButtonLoading(btn, false, originalContent);
    };
    try {
      if (this.hass?.connection) {
        unsubDone = await this.hass.connection.subscribeEvents(() => {
          _done(); this.loadData();
        }, 'haca_scan_complete');
      }
      tid = setTimeout(() => { _done(); this.loadData(); }, 5 * 60 * 1000);
      await this.hass.callService('config_auditor', 'scan_entities');
    } catch (error) {
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _done();
    }
  }

  showToastNotification(options = {}) {
    const {
      title = 'Notification',
      message = '',
      icon = 'mdi:information',
      iconColor = 'var(--primary-color, #03a9f4)',
      iconBg = 'linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #0288d1 100%)',
      autoDismiss = 5000,
      actionButton = null
    } = options;

    // Add animation keyframes if not exists
    if (!document.querySelector('#haca-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'haca-toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.className = 'haca-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
      max-width: 420px;
      min-width: 320px;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${iconBg}; padding: 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);">
          <ha-icon icon="${icon}" style="--mdc-icon-size: 24px; color: ${iconColor};"></ha-icon>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 16px;">${title}</div>
          <div style="font-size: 12px; opacity: 0.7;">${message}</div>
        </div>
        <button class="close-toast" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 6px; border-radius: 8px; cursor: pointer;">
          <ha-icon icon="mdi:close" style="--mdc-icon-size: 18px;"></ha-icon>
        </button>
      </div>
      ${actionButton ? `
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 11px; opacity: 0.6; display: flex; align-items: center; gap: 4px;">
            <ha-icon icon="mdi:shield-check-outline" style="--mdc-icon-size: 14px;"></ha-icon>
            ${this.t('notifications.reported_by')}
          </div>
          ${actionButton}
        </div>
      ` : `
        <div style="font-size: 11px; opacity: 0.6; display: flex; align-items: center; gap: 4px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          <ha-icon icon="mdi:shield-check-outline" style="--mdc-icon-size: 14px;"></ha-icon>
          ${this.t('notifications.reported_by')}
        </div>
      `}
    `;

    document.body.appendChild(toast);

    // Close button
    toast.querySelector('.close-toast').addEventListener('click', () => {
      toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    });

    // Auto-dismiss
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, autoDismiss);

    return toast;
  }

  async generateReport() {
    const btn = this.shadowRoot.querySelector('#create-report');
    const originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="btn-loader"></span> ${this.t('reports.generating')}`;
    }
    try {
      await this.hass.callService('config_auditor', 'generate_report');

      this.showHANotification(
        this.t('notifications.report_generated'),
        this.t('notifications.report_generated_full'),
        'haca_report_generated'
      );

      if (this.shadowRoot.querySelector('.tab[data-tab="reports"]')?.classList.contains('active')) {
        this.loadReports();
      }
    } catch (error) {
      this.showHANotification(
        this.t('notifications.error'),
        error.message,
        'haca_error'
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    }
  }

  async loadReports() {
    const container = this.shadowRoot.querySelector('#reports-list');
    container.innerHTML = this.t('reports.loading');
    try {
      const result = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'list_reports',
        service_data: {},
        return_response: true
      });

      let data = result.response || result;
      let rawReports = data.reports || [];

      // Fallback grouping (if backend hasn't been restarted/updated yet)
      // If the first item has 'format' instead of 'formats', it's the old format
      if (rawReports.length > 0 && rawReports[0].format && !rawReports[0].formats) {
        const sessions = {};
        const pattern = /report_(\d{8}_\d{6})/;

        rawReports.forEach(r => {
          const match = r.name.match(pattern);
          if (!match) return;
          const sessionId = match[1];
          if (!sessions[sessionId]) {
            sessions[sessionId] = {
              session_id: sessionId,
              created: r.created,
              formats: {}
            };
          }
          sessions[sessionId].formats[r.format] = {
            name: r.name,
            size: r.size
          };
        });
        rawReports = Object.values(sessions).sort((a, b) => b.session_id.localeCompare(a.session_id));
      }

      this.renderReports(rawReports);
    } catch (error) {
      container.innerHTML = `<div class="empty-state">❌ ${this.t('notifications.error')}: ${error.message}</div>`;
    }
  }

  renderReports(reports) {
    const container = this.shadowRoot.querySelector('#reports-list');
    const PAG_ID = 'reports-list';

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
            <ha-icon icon="mdi:file-search-outline"></ha-icon>
            <p>${this.t('messages.no_reports')}</p>
        </div>`;
      return;
    }

    // Store full list and apply pagination
    container._allReports = reports;
    const valid = reports.filter(s => s && s.formats);
    const st = this._pagState(PAG_ID);
    const paged = this._pagSlice(valid, st.page, st.pageSize);

    try {
      container.innerHTML = `
        <!-- Desktop table -->
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr>
              <th>${this.t('tables.audit_date')}</th>
              <th>${this.t('tables.available_formats')}</th>
              <th style="width:80px;">${this.t('tables.action')}</th>
            </tr></thead>
            <tbody>
              ${paged.map(s => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                      <div style="background:var(--primary-color);color:white;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <ha-icon icon="mdi:calendar-check"></ha-icon>
                      </div>
                      <div>
                        <div style="font-weight:600;font-size:14px;white-space:nowrap;">${new Date(s.created).toLocaleString()}</div>
                        <div style="font-size:11px;color:var(--secondary-text-color);font-family:monospace;">ID: ${s.session_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                      ${Object.entries(s.formats).map(([ext, info]) => `
                        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px;border:1px solid var(--divider-color);border-radius:10px;background:var(--secondary-background-color);flex-shrink:0;">
                          <span style="font-size:10px;font-weight:800;color:var(--primary-color);">${ext.toUpperCase()}</span>
                          <div style="display:flex;gap:5px;">
                            <button class="view-report-btn" data-name="${info.name}" title="${this.t('actions.view')}" style="padding:5px;background:white;color:var(--primary-color);border:1px solid var(--divider-color);border-radius:7px;">
                              <ha-icon icon="mdi:eye-outline" style="--mdc-icon-size:16px;"></ha-icon>
                            </button>
                            <button class="dl-report-btn" data-name="${info.name}" title="${this.t('actions.download')}" style="padding:5px;background:white;color:var(--success-color,#4caf50);border:1px solid var(--divider-color);border-radius:7px;">
                              <ha-icon icon="mdi:download-outline" style="--mdc-icon-size:16px;"></ha-icon>
                            </button>
                          </div>
                          <span style="font-size:10px;color:var(--secondary-text-color);">${Math.round(info.size / 1024)} KB</span>
                        </div>
                      `).join('')}
                    </div>
                  </td>
                  <td>
                    <button class="delete-report-btn" data-session="${s.session_id}" style="padding:8px;background:var(--error-color,#ef5350);color:white;border:none;border-radius:8px;">
                      <ha-icon icon="mdi:delete-outline" style="--mdc-icon-size:18px;"></ha-icon>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <!-- Mobile cards (paginés comme le tableau desktop) -->
        <div class="mobile-cards">
          ${paged.map(s => `
            <div class="m-card">
              <div class="m-card-title">
                <ha-icon icon="mdi:calendar-check" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
                ${new Date(s.created).toLocaleString()}
              </div>
              <div class="m-card-meta">ID: ${s.session_id}</div>
              <div class="fmt-pills">
                ${Object.entries(s.formats).map(([ext, info]) => `
                  <div class="fmt-pill">
                    <span class="fmt-pill-label">${ext.toUpperCase()} · ${Math.round(info.size / 1024)} KB</span>
                    <div class="fmt-pill-btns">
                      <button class="view-report-btn" data-name="${info.name}" style="color:var(--primary-color);">
                        <ha-icon icon="mdi:eye-outline" style="--mdc-icon-size:16px;"></ha-icon>
                      </button>
                      <button class="dl-report-btn" data-name="${info.name}" style="color:var(--success-color,#4caf50);">
                        <ha-icon icon="mdi:download-outline" style="--mdc-icon-size:16px;"></ha-icon>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="m-card-btns">
                <button class="delete-report-btn" data-session="${s.session_id}" style="background:var(--error-color,#ef5350);color:white;">
                  <ha-icon icon="mdi:delete-outline"></ha-icon> ${this.t('actions.delete')}
                </button>
              </div>
            </div>
          `).join('')}
        </div>      `;

      container.querySelectorAll('.view-report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.viewReport(e.currentTarget.dataset.name));
      });
      container.querySelectorAll('.dl-report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.downloadReport(e.currentTarget.dataset.name));
      });
      container.querySelectorAll('.delete-report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.deleteReport(e.currentTarget.dataset.session));
      });

      // Barre de pagination
      container.insertAdjacentHTML('beforeend',
        this._pagHTML(PAG_ID, valid.length, st.page, st.pageSize)
      );
      this._pagWire(container, () => this.renderReports(container._allReports));
    } catch (err) {
      console.error('[HACA] Error rendering reports:', err);
      container.innerHTML = `<div class="empty-state">❌ ${this.t('reports.error_display')}: ${err.message}</div>`;
    }
  }

  async viewReport(name) {
    if (name.endsWith('.pdf')) {
      const card = this.createModal('');
      // Enlarge modal for PDF to almost full screen
      card.style.width = '95%';
      card.style.height = '95%';
      card.style.maxWidth = '1600px';
      card.style.maxHeight = '95vh';

      card._updateContent(`
          <div style="padding: 16px 70px 16px 20px; border-bottom: 1px solid var(--divider-color); display: flex; justify-content: space-between; align-items: center; background: var(--secondary-background-color); gap: 12px; flex-wrap: wrap;">
              <h2 style="margin:0; font-size: 16px; display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                <ha-icon icon="mdi:file-pdf-box" style="color: var(--error-color); flex-shrink: 0;"></ha-icon>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
              </h2>
              <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <a href="/haca_reports/${name}" target="_blank" style="text-decoration: none;">
                  <button style="background: var(--primary-color); color: white; padding: 8px 12px; font-size: 12px;">
                    <ha-icon icon="mdi:fullscreen"></ha-icon> ${this.t('actions.fullscreen')}
                  </button>
                </a>
              </div>
          </div>
          <div style="flex: 1; height: 100%; background: #525659;">
              <iframe src="/haca_reports/${name}" style="width: 100%; height: 85vh; border: none;"></iframe>
          </div>
      `);
      return;
    }

    const card = this.createModal(this.t('reports.loading_report'));
    try {
      const result = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'get_report_content',
        service_data: { filename: name },
        return_response: true
      });

      const data = result.response || result;
      if (data.success) {
        card._updateContent(`
            <div style="padding: 16px 60px 16px 16px; border-bottom: 1px solid var(--divider-color); display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin:0">${name}</h2>
            </div>
            <div style="padding: 16px; flex: 1; max-height: 60vh; overflow-y: auto; background: var(--secondary-background-color); font-family: monospace; white-space: pre-wrap; font-size: 13px;">
                ${data.type === 'json' ? JSON.stringify(data.content, null, 2) : data.content}
            </div>
        `);
      } else {
        card._updateContent(`<div style="padding:20px;color:red">${this.t('notifications.error')}: ${data.error}</div>`);
      }
    } catch (e) {
      card._updateContent(`<div style="padding:20px;color:red">${this.t('notifications.error')}: ${e.message}</div>`);
    }
  }

  async downloadReport(name) {
    const a = document.createElement('a');
    a.href = `/haca_reports/${name}`;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  }

  async deleteReport(sessionId) {
    if (!confirm(this.t('report.confirm_delete') + '\n\nID: ' + sessionId)) return;

    try {
      const result = await this.hass.callWS({
        type: 'call_service',
        domain: 'config_auditor',
        service: 'delete_report',
        service_data: { session_id: sessionId },
        return_response: true
      });

      const response = result.response || result;

      if (response.success) {
        this.showHANotification(
          this.t('notifications.report_deleted'),
          `${response.deleted_count} ${this.t('notifications.files_deleted')}`,
          'haca_report_deleted'
        );
        // Refresh the reports list
        this.loadReports();
      } else {
        this.showHANotification(
          this.t('notifications.error'),
          response.error || this.t('fix.error_unknown'),
          'haca_error'
        );
      }
    } catch (error) {
      this.showHANotification(
        this.t('notifications.error'),
        error.message,
        'haca_error'
      );
    }
  }

  exportCSV(issues, containerId) {
    if (!issues || issues.length === 0) {
      this.showHANotification(
        this.t('notifications.error'),
        this.t('messages.no_issues'),
        'haca_csv_empty'
      );
      return;
    }
    const headers = ['entity_id', 'alias', 'type', 'severity', 'message', 'location', 'recommendation'];
    const rows = [headers];
    issues.forEach(i => {
      rows.push(headers.map(h => {
        const val = String(i[h] || '');
        return '"' + val.replace(/"/g, '""') + '"';
      }));
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    a.download = `haca-${containerId}-${date}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 200);
  }



}

customElements.define('haca-panel', HacaPanel);

})();
