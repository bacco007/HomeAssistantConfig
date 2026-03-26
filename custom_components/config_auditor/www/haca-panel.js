// HACA-BUILD: e0ac90fd  2026-03-23T12:29:51Z
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
      { id: 'god_automation',                     fixable: false },
      { id: 'complex_automation',                 fixable: false },
    ]
  },
  {
    id: 'scripts', icon: 'mdi:script-text',
    types: [
      { id: 'script_cycle',                      fixable: false },
      { id: 'script_call_depth',                 fixable: false },
      { id: 'script_single_mode_loop',           fixable: false },
      { id: 'script_orphan',                     fixable: false },
      { id: 'script_blueprint_candidate',        fixable: false },
      { id: 'empty_script',                      fixable: false },
    ]
  },
  {
    id: 'scenes', icon: 'mdi:palette',
    types: [
      { id: 'scene_entity_unavailable',          fixable: false },
      { id: 'scene_not_triggered',               fixable: false },
      { id: 'scene_duplicate',                   fixable: false },
      { id: 'empty_scene',                       fixable: false },
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
    id: 'helpers', icon: 'mdi:cog-outline',
    types: [
      { id: 'helper_unused',                     fixable: false },
      { id: 'helper_orphaned_disabled_only',     fixable: false },
      { id: 'helper_no_friendly_name',           fixable: false },
      { id: 'input_number_invalid_range',        fixable: false },
      { id: 'input_select_duplicate_options',    fixable: false },
      { id: 'input_select_empty_option',         fixable: false },
      { id: 'input_text_invalid_pattern',        fixable: false },
      { id: 'timer_never_started',               fixable: false },
      { id: 'timer_orphaned',                    fixable: false },
      { id: 'timer_zero_duration',               fixable: false },
      { id: 'template_sensor_no_metadata',       fixable: false },
      { id: 'template_sensor_cycle',             fixable: false },
      { id: 'template_missing_availability',     fixable: false },
      { id: 'template_no_unavailable_check',     fixable: false },
      { id: 'template_now_without_trigger',      fixable: false },
    ]
  },
  {
    id: 'groups', icon: 'mdi:group',
    types: [
      { id: 'group_empty',                       fixable: false },
      { id: 'group_missing_entities',            fixable: false },
      { id: 'group_all_unavailable',             fixable: false },
      { id: 'group_nested_deep',                 fixable: false },
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
  {
    id: 'compliance', icon: 'mdi:shield-check-outline',
    types: [
      { id: 'compliance_no_friendly_name',          fixable: false },
      { id: 'compliance_raw_entity_name',           fixable: false },
      { id: 'compliance_area_no_icon',              fixable: false },
      { id: 'compliance_unused_label',              fixable: false },
      { id: 'compliance_automation_no_description', fixable: false },
      { id: 'compliance_automation_no_unique_id',   fixable: false },
      { id: 'compliance_script_no_description',     fixable: false },
      { id: 'compliance_entity_no_area',            fixable: false },
      { id: 'compliance_helper_no_icon',            fixable: false },
      { id: 'compliance_helper_no_area',            fixable: false },
    ]
  },
];

// ─── Rendering ────────────────────────────────────────────────────────────

function renderConfigTab(options, lang, t) {
  // t() is the translation function passed from the panel component
  if (!t) t = (key) => key; // fallback: return key as-is
  var _icon = window._icon || function(n,s){return '';};
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
      _icon((cat.icon || "").replace("mdi:",""), 18) +
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
    _icon("cog", 28) +
    '<div>' +
    '<div class="cfg-header-title">' + t('config.title') + '</div>' +
    '<div class="cfg-header-sub">' + t('config.general_settings_sub') + '</div>' +
    '</div>' +
    '</div>' +

    // ── Section : Scan ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title">' + _icon("magnify-scan", 18) + t('config.automatic_scan') + '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.scan_interval_minutes') + '</span><span class="cfg-row-hint">0 = ' + t('config.manual_only') + ' · 5 – 1440 min</span></div>' +
    '<input type="number" id="cfg-scan-interval" class="cfg-input" min="0" max="1440" value="' + (options.scan_interval != null ? options.scan_interval : 60) + '">' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.startup_delay') + '</span><span class="cfg-row-hint">0 – 300 s</span></div>' +
    '<input type="number" id="cfg-startup-delay" class="cfg-input" min="0" max="300" value="' + (options.startup_delay_seconds != null ? options.startup_delay_seconds : 60) + '">' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.startup_scan') + '</span><span class="cfg-row-hint">' + t('config.startup_scan_hint') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-startup-scan"' + (options.startup_scan_enabled !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '</div>' +

    // ── Section : Événements ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title">' + _icon("bell-ring-outline", 18) + t('config.event_monitoring') + '</div>' +
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
    _icon("checkbox-multiple-marked-outline", 18) +
    t('config.issue_types') +
    '</div>' +
    '<div class="cfg-section-hint">' +
    t('config.issue_types_hint') +
    '</div>' +
    '<div class="cfg-categories-root">' + categorySections + '</div>' +
    '</div>' +

    // ── Section : Batteries ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title">' + _icon("battery", 18) + t('config.battery_thresholds') + '</div>' +
    '<div class="cfg-row"><div class="cfg-row-label"><span>🔴 ' + t('config.battery_critical') + '</span></div><input type="number" id="cfg-battery-critical" class="cfg-input" min="1" max="50" value="' + (options.battery_critical || 5) + '"></div>' +
    '<div class="cfg-row"><div class="cfg-row-label"><span>🟠 ' + t('config.battery_low') + '</span></div><input type="number" id="cfg-battery-low" class="cfg-input" min="5" max="50" value="' + (options.battery_low || 15) + '"></div>' +
    '<div class="cfg-row"><div class="cfg-row-label"><span>🟡 ' + t('config.battery_warning') + '</span></div><input type="number" id="cfg-battery-warning" class="cfg-input" min="10" max="75" value="' + (options.battery_warning || 25) + '"></div>' +
    '<div style="margin-top:8px;padding:9px 13px;background:rgba(3,169,244,0.12);border-left:3px solid #0288d1;border-radius:6px;font-size:12px;color:var(--primary-text-color);">ℹ️ ' + t('battery_scan_note') + '</div>' +
    '</div>' +

    // ── Section : Historique ──
    '<div class="cfg-section">' +
    '<div class="cfg-section-title">' + _icon("history", 18) + t('config.history_backups') + '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.history_retention') + '</span><span class="cfg-row-hint">30 – 730</span></div>' +
    '<input type="number" id="cfg-history-retention" class="cfg-input" min="30" max="730" value="' + (options.history_retention_days || 365) + '">' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.auto_backup') + '</span><span class="cfg-row-hint">' + t('config.recommended') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-backup-enabled"' + (options.backup_enabled !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.ha_repairs') + '</span><span class="cfg-row-hint">' + t('config.ha_repairs_hint') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-repairs-enabled"' + (options.repairs_enabled !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span>' + t('config.battery_notifications') + '</span><span class="cfg-row-hint">' + t('config.battery_notifications_hint') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-battery-notif"' + (options.battery_notifications_enabled !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '</div>' +

    // ── Section Diagnostics & Logs ──
    '<div class="cfg-section" style="margin-top:4px;">' +
    '<div class="cfg-section-title">' + _icon("bug", 18) + t('config.diagnostics_logs') + '</div>' +
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

    // ── Ignore label section (outside cfg-actions) ──
    `<div class="cfg-section" style="padding:16px 20px;">
      <div class="cfg-section-title">${_icon("label-off-outline", 18)}${t('config.haca_ignore_title')}</div>
      <div class="cfg-row-hint" style="margin-top:8px;line-height:1.6;">${t('config.haca_ignore_info')}</div>
      <div class="cfg-row-hint" style="margin-top:6px;">
        <code style="background:var(--code-background-color,rgba(0,0,0,0.1));padding:2px 6px;border-radius:4px;">haca_ignore</code>
      </div>
    </div>` +

    // ── Boutons ──
    '<div class="cfg-actions">' +
      '<button class="cfg-btn cfg-btn-secondary" id="cfg-reset-btn">' + _icon("restore", 18) + t('config.reset') + '</button>' +
      '<button class="cfg-btn cfg-btn-primary" id="cfg-save-btn">' + _icon("content-save", 18) + t('config.save') + '</button>' +
    '</div>' +
    '<div id="cfg-save-status" class="cfg-save-status" style="display:none;"></div>' +

    // ── v1.4.0 : Section MCP + Agent IA ──────────────────────────────────
    '<div id="mcp-section-container" style="margin-top:8px;padding:0 4px;">' +
    '<div style="padding:20px;text-align:center;color:var(--secondary-text-color);font-size:13px;">' +
    _icon("loading", 20) + ' MCP / AI Agent...' +
    '</div></div>' +

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
  .cfg-actions { display: flex; gap: 12px; justify-content: flex-end; padding: 8px 0; flex-wrap: wrap; }
  .cfg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s, transform 0.1s; white-space: nowrap; height: 40px; box-sizing: border-box; }
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
  startup_scan_enabled: true,
  event_monitoring_enabled: true,
  event_debounce_seconds: 30,
  excluded_issue_types: [],
  battery_critical: 5,
  battery_low: 15,
  battery_warning: 25,
  history_retention_days: 365,
  backup_enabled: true,
  repairs_enabled: true,
  battery_notifications_enabled: true,
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
    scan_interval: (function() { var el = q('#cfg-scan-interval'); if (!el) return 60; var v = parseInt(el.value, 10); return isNaN(v) ? 60 : Math.max(0, v); })(),
    startup_delay_seconds: num('#cfg-startup-delay', 60),
    startup_scan_enabled: bool('#cfg-startup-scan', true),
    event_monitoring_enabled: bool('#cfg-event-monitoring', true),
    event_debounce_seconds: num('#cfg-event-debounce', 30),
    excluded_issue_types: excluded,
    battery_critical: num('#cfg-battery-critical', 5),
    battery_low: num('#cfg-battery-low', 15),
    battery_warning: num('#cfg-battery-warning', 25),
    history_retention_days: num('#cfg-history-retention', 365),
    backup_enabled: bool('#cfg-backup-enabled', true),
    repairs_enabled: bool('#cfg-repairs-enabled', true),
    battery_notifications_enabled: bool('#cfg-battery-notif', true),
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
  const HACA_VERSION = '1.6.1'; // build marker

  // Dans l'iframe (embed_iframe:true), ha-icon n'est pas enregistré.
  // On copie la définition depuis le document parent où HA l'a déjà défini.
  if (!customElements.get('ha-icon') && window.parent !== window) {
    try {
      const ParentHaIcon = window.parent.customElements.get('ha-icon');
      if (ParentHaIcon) customElements.define('ha-icon', ParentHaIcon);
    } catch(_) {}
  }

  // Table des paths MDI — remplace ha-icon pour éviter les problèmes dans l'iframe
  const _MDI = {
    'alert-circle': 'M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
    'alert-circle-outline': 'M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z',
    'archive-arrow-down-outline': 'M20 21H4V10H6V19H18V10H20V21M3 3H21V9H3V3M5 5V7H19V5M10.5 11V14H8L12 18L16 14H13.5V11',
    'archive-off-outline': 'M8.2 5L6.2 3H21V9H12.2L10.2 7H19V5H8.2M20 16.8V10H18V14.8L20 16.8M20 19.35V19.34L18 17.34V17.35L9.66 9H9.66L7.66 7H7.66L6.13 5.47L2.39 1.73L1.11 3L3 4.89V9H7.11L17.11 19H6V10H4V21H19.11L20.84 22.73L22.11 21.46L20 19.35Z',
    'auto-fix': 'M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z',
    'backup-restore': 'M12,3A9,9 0 0,0 3,12H0L4,16L8,12H5A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19C10.5,19 9.09,18.5 7.94,17.7L6.5,19.14C8.04,20.3 9.94,21 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M14,12A2,2 0 0,0 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12Z',
    'battery': 'M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4Z',
    'battery-alert': 'M13 14H11V8H13M13 18H11V16H13M16.7 4H15V2H9V4H7.3C6.6 4 6 4.6 6 5.3V20.6C6 21.4 6.6 22 7.3 22H16.6C17.3 22 17.9 21.4 17.9 20.7V5.3C18 4.6 17.4 4 16.7 4Z',
    'bell-ring-outline': 'M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M17,11A5,5 0 0,0 12,6A5,5 0 0,0 7,11V18H17V11M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z',
    'bug': 'M14,12H10V10H14M14,16H10V14H14M20,8H17.19C16.74,7.22 16.12,6.55 15.37,6.04L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.04,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6.04C7.88,6.55 7.26,7.22 6.81,8H4V10H6.09C6.04,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.04,15.67 6.09,16H4V18H6.81C7.85,19.79 9.78,21 12,21C14.22,21 16.15,19.79 17.19,18H20V16H17.91C17.96,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.96,10.33 17.91,10H20V8Z',
    'calendar-check': 'M19,19H5V8H19M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M16.53,11.06L15.47,10L10.59,14.88L8.47,12.76L7.41,13.82L10.59,17L16.53,11.06Z',
    'chart-bar': 'M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z',
    'chart-line': 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z',
    'chart-timeline-variant': 'M3,14L3.5,14.07L8.07,9.5C7.89,8.85 8.06,8.11 8.59,7.59C9.37,6.8 10.63,6.8 11.41,7.59C11.94,8.11 12.11,8.85 11.93,9.5L14.5,12.07L15,12C15.18,12 15.35,12 15.5,12.07L19.07,8.5C19,8.35 19,8.18 19,8A2,2 0 0,1 21,6A2,2 0 0,1 23,8A2,2 0 0,1 21,10C20.82,10 20.65,10 20.5,9.93L16.93,13.5C17,13.65 17,13.82 17,14A2,2 0 0,1 15,16A2,2 0 0,1 13,14L13.07,13.5L10.5,10.93C10.18,11 9.82,11 9.5,10.93L4.93,15.5L5,16A2,2 0 0,1 3,18A2,2 0 0,1 1,16A2,2 0 0,1 3,14Z',
    'check-circle-outline': 'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z',
    'check-decagram-outline': 'M23 12L20.6 9.2L20.9 5.5L17.3 4.7L15.4 1.5L12 3L8.6 1.5L6.7 4.7L3.1 5.5L3.4 9.2L1 12L3.4 14.8L3.1 18.5L6.7 19.3L8.6 22.5L12 21L15.4 22.5L17.3 19.3L20.9 18.5L20.6 14.8L23 12M18.7 16.9L16 17.5L14.6 19.9L12 18.8L9.4 19.9L8 17.5L5.3 16.9L5.5 14.1L3.7 12L5.5 9.9L5.3 7.1L8 6.5L9.4 4.1L12 5.2L14.6 4.1L16 6.5L18.7 7.1L18.5 9.9L20.3 12L18.5 14.1L18.7 16.9M16.6 7.6L18 9L10 17L6 13L7.4 11.6L10 14.2L16.6 7.6Z',
    'checkbox-multiple-marked-outline': 'M20,16V10H22V16A2,2 0 0,1 20,18H8C6.89,18 6,17.1 6,16V4C6,2.89 6.89,2 8,2H16V4H8V16H20M10.91,7.08L14,10.17L20.59,3.58L22,5L14,13L9.5,8.5L10.91,7.08M16,20V22H4A2,2 0 0,1 2,20V7H4V20H16Z',
    'close': 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
    'cog': 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z',
    'content-save': 'M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z',
    'database-alert-outline': 'M10 3C5.58 3 2 4.79 2 7V17C2 19.21 5.59 21 10 21S18 19.21 18 17V7C18 4.79 14.42 3 10 3M16 17C16 17.5 13.87 19 10 19S4 17.5 4 17V14.77C5.61 15.55 7.72 16 10 16S14.39 15.55 16 14.77V17M16 12.45C14.7 13.4 12.42 14 10 14S5.3 13.4 4 12.45V9.64C5.47 10.47 7.61 11 10 11S14.53 10.47 16 9.64V12.45M10 9C6.13 9 4 7.5 4 7S6.13 5 10 5 16 6.5 16 7 13.87 9 10 9M22 7V13H20V7H22M20 15H22V17H20V15Z',
    'database-check-outline': 'M20 13.09V7C20 4.79 16.42 3 12 3S4 4.79 4 7V17C4 19.21 7.59 21 12 21C12.46 21 12.9 21 13.33 20.94C13.12 20.33 13 19.68 13 19L13 18.95C12.68 19 12.35 19 12 19C8.13 19 6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16C12.65 16 13.27 15.96 13.88 15.89C14.93 14.16 16.83 13 19 13C19.34 13 19.67 13.04 20 13.09M18 12.45C16.7 13.4 14.42 14 12 14S7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11S16.53 10.47 18 9.64V12.45M12 9C8.13 9 6 7.5 6 7S8.13 5 12 5 18 6.5 18 7 15.87 9 12 9M22.5 17.25L17.75 22L15 19L16.16 17.84L17.75 19.43L21.34 15.84L22.5 17.25Z',
    'database-off-outline': 'M2.39 1.73L1.11 3L4.21 6.1C4.08 6.39 4 6.69 4 7V17C4 19.21 7.59 21 12 21C14.3 21 16.38 20.5 17.84 19.73L20.84 22.73L22.11 21.46L2.39 1.73M6 9.64C6.76 10.07 7.7 10.42 8.76 10.65L12.11 14C12.07 14 12.04 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64M12 19C8.13 19 6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16C12.68 16 13.34 15.95 14 15.87L16.34 18.23C15.33 18.65 13.87 19 12 19M8.64 5.44L7.06 3.86C8.42 3.33 10.13 3 12 3C16.42 3 20 4.79 20 7V16.8L18 14.8V14.77L18 14.78L16.45 13.25C17.05 13.03 17.58 12.76 18 12.45V9.64C16.97 10.22 15.61 10.65 14.06 10.86L12.19 9C15.94 8.94 18 7.5 18 7C18 6.5 15.87 5 12 5C10.66 5 9.54 5.18 8.64 5.44Z',
    'delete-outline': 'M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z',
    'delete-sweep-outline': 'M15,16H19V18H15V16M15,8H22V10H15V8M15,12H21V14H15V12M11,10V18H5V10H11M13,8H3V18A2,2 0 0,0 5,20H11A2,2 0 0,0 13,18V8M14,5H11L10,4H6L5,5H2V7H14V5Z',
    'download-outline': 'M13,5V11H14.17L12,13.17L9.83,11H11V5H13M15,3H9V9H5L12,16L19,9H15V3M19,18H5V20H19V18Z',
    'eye': 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z',
    'eye-outline': 'M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z',
    'file-chart-outline': 'M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M9 13V19H7V13H9M15 15V19H17V15H15M11 11V19H13V11H11Z',
    'file-delimited-outline': 'M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M10 19L12 15H9V10H15V15L13 19H10',
    'file-document-outline': 'M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12V14H16V12H8M8,16V18H13V16H8Z',
    'file-document-plus': 'M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H13.81C13.28 21.09 13 20.05 13 19C13 18.67 13.03 18.33 13.08 18H6V16H13.81C14.27 15.2 14.91 14.5 15.68 14H6V12H18V13.08C18.33 13.03 18.67 13 19 13S19.67 13.03 20 13.08V8L14 2M13 9V3.5L18.5 9H13M18 15V18H15V20H18V23H20V20H23V18H20V15H18Z',
    'file-pdf-box': 'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9.5 11.5C9.5 12.3 8.8 13 8 13H7V15H5.5V9H8C8.8 9 9.5 9.7 9.5 10.5V11.5M14.5 13.5C14.5 14.3 13.8 15 13 15H10.5V9H13C13.8 9 14.5 9.7 14.5 10.5V13.5M18.5 10.5H17V11.5H18.5V13H17V15H15.5V9H18.5V10.5M12 10.5H13V13.5H12V10.5M7 10.5H8V11.5H7V10.5Z',
    'file-search-outline': 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H13C12.59,21.75 12.2,21.44 11.86,21.1C11.53,20.77 11.25,20.4 11,20H6V4H13V9H18V10.18C18.71,10.34 19.39,10.61 20,11V8L14,2M20.31,18.9C21.64,16.79 21,14 18.91,12.68C16.8,11.35 14,12 12.69,14.08C11.35,16.19 12,18.97 14.09,20.3C15.55,21.23 17.41,21.23 18.88,20.32L22,23.39L23.39,22L20.31,18.9M16.5,19A2.5,2.5 0 0,1 14,16.5A2.5,2.5 0 0,1 16.5,14A2.5,2.5 0 0,1 19,16.5A2.5,2.5 0 0,1 16.5,19Z',
    'fit-to-screen': 'M17 4H20C21.1 4 22 4.9 22 6V8H20V6H17V4M4 8V6H7V4H4C2.9 4 2 4.9 2 6V8H4M20 16V18H17V20H20C21.1 20 22 19.1 22 18V16H20M7 18H4V16H2V18C2 19.1 2.9 20 4 20H7V18M18 8H6V16H18V8Z',
    'fullscreen': 'M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z',
    'gauge': 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,14.4 19,16.5 17.3,18C15.9,16.7 14,16 12,16C10,16 8.2,16.7 6.7,18C5,16.5 4,14.4 4,12A8,8 0 0,1 12,4M14,5.89C13.62,5.9 13.26,6.15 13.1,6.54L11.81,9.77L11.71,10C11,10.13 10.41,10.6 10.14,11.26C9.73,12.29 10.23,13.45 11.26,13.86C12.29,14.27 13.45,13.77 13.86,12.74C14.12,12.08 14,11.32 13.57,10.76L13.67,10.5L14.96,7.29L14.97,7.26C15.17,6.75 14.92,6.17 14.41,5.96C14.28,5.91 14.15,5.89 14,5.89M10,6A1,1 0 0,0 9,7A1,1 0 0,0 10,8A1,1 0 0,0 11,7A1,1 0 0,0 10,6M7,9A1,1 0 0,0 6,10A1,1 0 0,0 7,11A1,1 0 0,0 8,10A1,1 0 0,0 7,9M17,9A1,1 0 0,0 16,10A1,1 0 0,0 17,11A1,1 0 0,0 18,10A1,1 0 0,0 17,9Z',
    'ghost-outline': 'M12 2C7.03 2 3 6.03 3 11V22L6 19L9 22L12 19L15 22L18 19L21 22V11C21 6.03 16.97 2 12 2M19 17.17L18 16.17L16.59 17.59L15 19.17L13.41 17.59L12 16.17L10.59 17.59L9 19.17L7.41 17.59L6 16.17L5 17.17V11C5 7.14 8.14 4 12 4S19 7.14 19 11V17.17M11 10C11 11.11 10.11 12 9 12S7 11.11 7 10 7.9 8 9 8 11 8.9 11 10M17 10C17 11.11 16.11 12 15 12S13 11.11 13 10 13.9 8 15 8 17 8.9 17 10Z',
    'graph': 'M19.5 17C19.37 17 19.24 17 19.11 17.04L17.5 13.79C17.95 13.34 18.25 12.71 18.25 12C18.25 10.62 17.13 9.5 15.75 9.5C15.62 9.5 15.5 9.5 15.36 9.54L13.73 6.29C14.21 5.84 14.5 5.21 14.5 4.5C14.5 3.12 13.38 2 12 2S9.5 3.12 9.5 4.5C9.5 5.21 9.79 5.84 10.26 6.29L8.64 9.54C8.5 9.5 8.38 9.5 8.25 9.5C6.87 9.5 5.75 10.62 5.75 12C5.75 12.71 6.05 13.34 6.5 13.79L4.89 17.04C4.76 17 4.63 17 4.5 17C3.12 17 2 18.12 2 19.5C2 20.88 3.12 22 4.5 22S7 20.88 7 19.5C7 18.8 6.71 18.16 6.24 17.71L7.86 14.46C8 14.5 8.12 14.5 8.25 14.5C8.38 14.5 8.5 14.5 8.64 14.46L10.27 17.71C9.8 18.16 9.5 18.8 9.5 19.5C9.5 20.88 10.62 22 12 22S14.5 20.88 14.5 19.5C14.5 18.12 13.38 17 12 17C11.87 17 11.74 17 11.61 17.04L10 13.79C10.46 13.34 10.75 12.71 10.75 12S10.46 10.66 10 10.21L11.61 6.96C11.74 7 11.87 7 12 7S12.26 7 12.39 6.96L14 10.21C13.55 10.66 13.25 11.3 13.25 12C13.25 13.38 14.37 14.5 15.75 14.5C15.88 14.5 16 14.5 16.14 14.46L17.77 17.71C17.3 18.16 17 18.8 17 19.5C17 20.88 18.12 22 19.5 22S22 20.88 22 19.5C22 18.12 20.88 17 19.5 17Z',
    'history': 'M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3',
    'image': 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z',
    'image-outline': 'M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z',
    'label-off-outline': 'M2,4.27L3.28,3L20,19.72L18.73,21L16.63,18.9C16.43,18.96 16.22,19 16,19H5A2,2 0 0,1 3,17V7C3,6.5 3.17,6.07 3.46,5.73L2,4.27M5,17H14.73L5,7.27V17M19.55,12L16,7H9.82L7.83,5H16C16.67,5 17.27,5.33 17.63,5.84L22,12L19,16.2L17.59,14.76L19.55,12Z',
    'lightbulb-on-outline': 'M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z',
    'lightbulb-outline': 'M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z',
    'lightning-bolt': 'M11 15H6L13 1V9H18L11 23V15Z',
    'loading': 'M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z',
    'magic-staff': 'M17.5 9C16.12 9 15 7.88 15 6.5S16.12 4 17.5 4 20 5.12 20 6.5 18.88 9 17.5 9M14.43 8.15L2 20.59L3.41 22L15.85 9.57C15.25 9.24 14.76 8.75 14.43 8.15M13 5L13.63 3.63L15 3L13.63 2.37L13 1L12.38 2.37L11 3L12.38 3.63L13 5M21 5L21.63 3.63L23 3L21.63 2.37L21 1L20.38 2.37L19 3L20.38 3.63L21 5M21 9L20.38 10.37L19 11L20.38 11.63L21 13L21.63 11.63L23 11L21.63 10.37L21 9Z',
    'magnify-scan': 'M17 22V20H20V17H22V20.5C22 20.89 21.84 21.24 21.54 21.54C21.24 21.84 20.89 22 20.5 22H17M7 22H3.5C3.11 22 2.76 21.84 2.46 21.54C2.16 21.24 2 20.89 2 20.5V17H4V20H7V22M17 2H20.5C20.89 2 21.24 2.16 21.54 2.46C21.84 2.76 22 3.11 22 3.5V7H20V4H17V2M7 2V4H4V7H2V3.5C2 3.11 2.16 2.76 2.46 2.46C2.76 2.16 3.11 2 3.5 2H7M10.5 6C13 6 15 8 15 10.5C15 11.38 14.75 12.2 14.31 12.9L17.57 16.16L16.16 17.57L12.9 14.31C12.2 14.75 11.38 15 10.5 15C8 15 6 13 6 10.5C6 8 8 6 10.5 6M10.5 8C9.12 8 8 9.12 8 10.5C8 11.88 9.12 13 10.5 13C11.88 13 13 11.88 13 10.5C13 9.12 11.88 8 10.5 8Z',
    'map-marker-outline': 'M12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5M12,2A7,7 0 0,1 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,10 7,12 12,18.71C17,12 17,10 17,9A5,5 0 0,0 12,4Z',
    'minus-box-outline': 'M19,19V5H5V19H19M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5C3,3.89 3.9,3 5,3H19M17,11V13H7V11H17Z',
    'open-in-new': 'M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z',
    'palette': 'M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z',
    'pencil': 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
    'playlist-check': 'M14 10H3V12H14V10M14 6H3V8H14V6M3 16H10V14H3V16M21.5 11.5L23 13L16 20L11.5 15.5L13 14L16 17L21.5 11.5Z',
    'plus': 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
    'plus-box-outline': 'M19,19V5H5V19H19M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5C3,3.89 3.9,3 5,3H19M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z',
    'puzzle': 'M20.5,11H19V7C19,5.89 18.1,5 17,5H13V3.5A2.5,2.5 0 0,0 10.5,1A2.5,2.5 0 0,0 8,3.5V5H4A2,2 0 0,0 2,7V10.8H3.5C5,10.8 6.2,12 6.2,13.5C6.2,15 5,16.2 3.5,16.2H2V20A2,2 0 0,0 4,22H7.8V20.5C7.8,19 9,17.8 10.5,17.8C12,17.8 13.2,19 13.2,20.5V22H17A2,2 0 0,0 19,20V16H20.5A2.5,2.5 0 0,0 23,13.5A2.5,2.5 0 0,0 20.5,11Z',
    'refresh': 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z',
    'restore': 'M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z',
    'robot': 'M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z',
    'robot-confused': 'M20 4H18V3H20.5C20.78 3 21 3.22 21 3.5V5.5C21 5.78 20.78 6 20.5 6H20V7H19V5H20V4M19 9H20V8H19V9M17 3H16V7H17V3M23 15V18C23 18.55 22.55 19 22 19H21V20C21 21.11 20.11 22 19 22H5C3.9 22 3 21.11 3 20V19H2C1.45 19 1 18.55 1 18V15C1 14.45 1.45 14 2 14H3C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2S14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C14.34 7 14.67 7.03 15 7.08V10H19.74C20.53 11.13 21 12.5 21 14H22C22.55 14 23 14.45 23 15M10 15.5C10 14.12 8.88 13 7.5 13S5 14.12 5 15.5 6.12 18 7.5 18 10 16.88 10 15.5M19 15.5C19 14.12 17.88 13 16.5 13S14 14.12 14 15.5 15.12 18 16.5 18 19 16.88 19 15.5M17 8H16V9H17V8Z',
    'robot-confused-outline': 'M19 8H20V9H19V8M20 5H19V7H20V6H20.5C20.78 6 21 5.78 21 5.5V3.5C21 3.22 20.78 3 20.5 3H18V4H20V5M17 3H16V7H17V3M13.5 15.5C13.5 16.61 14.4 17.5 15.5 17.5S17.5 16.61 17.5 15.5 16.61 13.5 15.5 13.5 13.5 14.4 13.5 15.5M17 8H16V9H17V8M22 14H21C21 12.5 20.53 11.13 19.74 10H16.97C18.19 10.91 19 12.36 19 14V16H21V17H19V20H5V17H3V16H5V14C5 11.24 7.24 9 10 9H14C14.34 9 14.68 9.04 15 9.1V7.08C14.67 7.03 14.34 7 14 7H13V5.73C13.6 5.39 14 4.74 14 4C14 2.9 13.11 2 12 2S10 2.9 10 4C10 4.74 10.4 5.39 11 5.73V7H10C6.13 7 3 10.13 3 14H2C1.45 14 1 14.45 1 15V18C1 18.55 1.45 19 2 19H3V20C3 21.11 3.9 22 5 22H19C20.11 22 21 21.11 21 20V19H22C22.55 19 23 18.55 23 18V15C23 14.45 22.55 14 22 14M8.5 13.5C7.4 13.5 6.5 14.4 6.5 15.5S7.4 17.5 8.5 17.5 10.5 16.61 10.5 15.5 9.61 13.5 8.5 13.5Z',
    'robot-happy-outline': 'M10.5 15.5C10.5 15.87 10.4 16.2 10.22 16.5C9.88 15.91 9.24 15.5 8.5 15.5S7.12 15.91 6.78 16.5C6.61 16.2 6.5 15.87 6.5 15.5C6.5 14.4 7.4 13.5 8.5 13.5S10.5 14.4 10.5 15.5M23 15V18C23 18.55 22.55 19 22 19H21V20C21 21.11 20.11 22 19 22H5C3.9 22 3 21.11 3 20V19H2C1.45 19 1 18.55 1 18V15C1 14.45 1.45 14 2 14H3C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2S14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.87 7 21 10.13 21 14H22C22.55 14 23 14.45 23 15M21 16H19V14C19 11.24 16.76 9 14 9H10C7.24 9 5 11.24 5 14V16H3V17H5V20H19V17H21V16M15.5 13.5C14.4 13.5 13.5 14.4 13.5 15.5C13.5 15.87 13.61 16.2 13.78 16.5C14.12 15.91 14.76 15.5 15.5 15.5S16.88 15.91 17.22 16.5C17.4 16.2 17.5 15.87 17.5 15.5C17.5 14.4 16.61 13.5 15.5 13.5Z',
    'script-text': 'M17.8,20C17.4,21.2 16.3,22 15,22H5C3.3,22 2,20.7 2,19V18H5L14.2,18C14.6,19.2 15.7,20 17,20H17.8M19,2C20.7,2 22,3.3 22,5V6H20V5C20,4.4 19.6,4 19,4C18.4,4 18,4.4 18,5V18H17C16.4,18 16,17.6 16,17V16H5V5C5,3.3 6.3,2 8,2H19M8,6V8H15V6H8M8,10V12H14V10H8Z',
    'send': 'M2,21L23,12L2,3V10L17,12L2,14V21Z',
    'shield-check-outline': 'M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9',
    'shield-lock': 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z',
    'speedometer-slow': 'M12 16C13.66 16 15 14.66 15 13C15 11.88 14.39 10.9 13.5 10.39L3.79 4.77L9.32 14.35C9.82 15.33 10.83 16 12 16M12 3C10.19 3 8.5 3.5 7.03 4.32L9.13 5.53C10 5.19 11 5 12 5C16.42 5 20 8.58 20 13C20 15.21 19.11 17.21 17.66 18.65H17.65C17.26 19.04 17.26 19.67 17.65 20.06C18.04 20.45 18.68 20.45 19.07 20.07C20.88 18.26 22 15.76 22 13C22 7.5 17.5 3 12 3M2 13C2 15.76 3.12 18.26 4.93 20.07C5.32 20.45 5.95 20.45 6.34 20.06C6.73 19.67 6.73 19.04 6.34 18.65C4.89 17.2 4 15.21 4 13C4 12 4.19 11 4.54 10.1L3.33 8C2.5 9.5 2 11.18 2 13Z',
    'swap-horizontal': 'M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z',
    'tune-variant': 'M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z',
    'view-dashboard-edit-outline': 'M21 13.1C20.9 13.1 20.7 13.2 20.6 13.3L19.6 14.3L21.7 16.4L22.7 15.4C22.9 15.2 22.9 14.8 22.7 14.6L21.4 13.3C21.3 13.2 21.2 13.1 21 13.1M19.1 14.9L13 20.9V23H15.1L21.2 16.9L19.1 14.9M21 3H13V9H21V3M19 7H15V5H19V7M13 18.06V11H21V11.1C20.24 11.1 19.57 11.5 19.19 11.89L18.07 13H15V16.07L13 18.06M11 3H3V13H11V3M9 11H5V5H9V11M11 20.06V15H3V21H11V20.06M9 19H5V17H9V19Z',
    'view-dashboard-outline': 'M19,5V7H15V5H19M9,5V11H5V5H9M19,13V19H15V13H19M9,17V19H5V17H9M21,3H13V9H21V3M11,3H3V13H11V3M21,11H13V21H21V11M11,15H3V21H11V15Z',
    'view-list': 'M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z',
    'zip-box-outline': 'M12 17V15H14V17H12M14 13V11H12V13H14M14 9V7H12V9H14M10 11H12V9H10V11M10 15H12V13H10V15M21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5M19 5H12V7H10V5H5V19H19V5Z',
    'arrow-decision': 'M18,20A2,2 0 0,0 20,18A2,2 0 0,0 18,16C17.5,16 17.05,16.19 16.71,16.5L9.91,12.08C9.96,11.89 10,11.7 10,11.5C10,11.3 9.96,11.11 9.91,10.92L16.7,6.5C17.05,6.81 17.5,7 18,7A2,2 0 0,0 20,5A2,2 0 0,0 18,3A2,2 0 0,0 16,5C16,5.2 16.04,5.39 16.09,5.58L9.3,10C8.95,9.69 8.5,9.5 8,9.5A2,2 0 0,0 6,11.5A2,2 0 0,0 8,13.5C8.5,13.5 8.95,13.31 9.3,13L16.09,17.42C16.04,17.61 16,17.8 16,18A2,2 0 0,0 18,20Z',
    'blueprint': 'M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M5,5V19H19V5H5M7,7H17V9H7V7M7,11H17V13H7V11M7,15H14V17H7V15Z',
    'content-copy': 'M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z',
    'content-duplicate': 'M11,15H13V17H11V15M11,7H13V13H11V7M13,2A10,10 0 0,1 23,12A10,10 0 0,1 13,22H11A10,10 0 0,1 1,12A10,10 0 0,1 11,2H13M13,4H11A8,8 0 0,0 3,12A8,8 0 0,0 11,20H13A8,8 0 0,0 21,12A8,8 0 0,0 13,4Z',
    'home-outline': 'M12,5.69L17,10.19V18H15V12H9V18H7V10.19L12,5.69M12,3L2,12H5V20H11V14H13V20H19V12H22L12,3Z',
    'map-legend': 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2M2,22V20H5.5L7,22H2M7,20H9.5L11,22H8.5L7,20M11,20H13.5L15,22H12.5L11,20M15,20H17.5L19,22H16.5L15,20M19,20H22V22H20.5L19,20Z',
    'map-marker-off': 'M16.37,16.1L11.75,11.47L6.64,6.36L5.27,5L4,6.27L6.73,9C6.26,9.91 6,10.93 6,12C6,15.31 8.69,18 12,18C13.07,18 14.09,17.74 15,17.27L17.73,20L19,18.73L17.37,17.1M12,16A4,4 0 0,1 8,12C8,11.39 8.14,10.8 8.4,10.27L13.73,15.6C13.2,15.86 12.61,16 12,16M12,6A4,4 0 0,1 16,10C16,10.19 15.97,10.38 15.95,10.56L17.5,12.11C17.82,11.44 18,10.74 18,10A6,6 0 0,0 12,4C11.26,4 10.56,4.18 9.89,4.5L11.44,6.05C11.62,6.03 11.81,6 12,6M2,4.27L3.28,3L21,20.73L19.73,22L15.9,18.16C14.68,18.71 13.38,19 12,19A7,7 0 0,1 5,12C5,10.62 5.29,9.32 5.84,8.1L2,4.27Z',
    'pencil-outline': 'M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z',
    'source-branch-check': 'M13,14.5A3.5,3.5 0 0,0 9.5,18A3.5,3.5 0 0,0 13,21.5A3.5,3.5 0 0,0 16.5,18A3.5,3.5 0 0,0 13,14.5M6.5,2.5A3.5,3.5 0 0,0 3,6A3.5,3.5 0 0,0 6.5,9.5A3.5,3.5 0 0,0 10,6A3.5,3.5 0 0,0 6.5,2.5M6.5,4A2,2 0 0,1 8.5,6A2,2 0 0,1 6.5,8A2,2 0 0,1 4.5,6A2,2 0 0,1 6.5,4M13,16A2,2 0 0,1 15,18A2,2 0 0,1 13,20A2,2 0 0,1 11,18A2,2 0 0,1 13,16M13.09,11H7.5V8.83C8.94,8.37 10,7.05 10,5.5C10,3.57 8.43,2 6.5,2A3.5,3.5 0 0,0 3,5.5C3,7.05 4.06,8.37 5.5,8.83V15.17C4.06,15.63 3,16.95 3,18.5C3,20.43 4.57,22 6.5,22A3.5,3.5 0 0,0 10,18.5C10,16.95 8.94,15.63 7.5,15.17V13H13.09C13.03,13.5 13,14 13,14.5A5.5,5.5 0 0,0 18.5,20A5.5,5.5 0 0,0 24,14.5A5.5,5.5 0 0,0 18.5,9A5.5,5.5 0 0,0 13.09,11M18.5,11A3.5,3.5 0 0,1 22,14.5A3.5,3.5 0 0,1 18.5,18A3.5,3.5 0 0,1 15,14.5A3.5,3.5 0 0,1 18.5,11Z',
    'source-merge': 'M7,5A2,2 0 0,1 9,7A2,2 0 0,1 7,9C6.06,9 5.27,8.46 4.87,7.68L3,7.68V10C3,11.1 3.9,12 5,12H11C11,12.55 11.45,13 12,13H13V15.07C12.06,15.42 11.38,16.31 11.38,17.38A2.62,2.62 0 0,0 14,20A2.62,2.62 0 0,0 16.62,17.38C16.62,16.31 15.94,15.42 15,15.07V13H16C16.55,13 17,12.55 17,12H21C22.1,12 23,11.1 23,10V7.68H21.13C20.73,8.46 19.94,9 19,9A2,2 0 0,1 17,7A2,2 0 0,1 19,5C19.94,5 20.73,5.54 21.13,6.32H23V4C23,2.9 22.1,2 21,2H17.13C16.73,1.22 15.94,.68 15,.68A2,2 0 0,0 13,.68A2,2 0 0,0 12,2A2,2 0 0,0 13,3.32V5H11C10,5 9.27,5.61 9.05,6.44C8.7,5.85 8.13,5.44 7.5,5.3L7.5,5A2,2 0 0,1 7,5M12,16A1,1 0 0,1 13,17A1,1 0 0,1 12,18A1,1 0 0,1 11,17A1,1 0 0,1 12,16Z',

    'shield-alert': 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5M11,7H13V13H11M11,15H13V17H11',
    'alert-decagram': 'M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M13,17H11V15H13V17M13,13H11V7H13V13Z',
    'eye-off': 'M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z',
    'robot-confused': 'M20 4H18V3H20.5C20.78 3 21 3.22 21 3.5V5.5C21 5.78 20.78 6 20.5 6H20V7H19V5H20V4M19 9H20V8H19V9M17 3H16V7H17V3M23 15V18C23 18.55 22.55 19 22 19H21V20C21 21.11 20.11 22 19 22H5C3.9 22 3 21.11 3 20V19H2C1.45 19 1 18.55 1 18V15C1 14.45 1.45 14 2 14H3C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2S14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C14.34 7 14.67 7.03 15 7.08V10H19.74C20.53 11.13 21 12.5 21 14H22C22.55 14 23 14.45 23 15M10 15.5C10 14.12 8.88 13 7.5 13S5 14.12 5 15.5 6.12 18 7.5 18 10 16.88 10 15.5M19 15.5C19 14.12 17.88 13 16.5 13S14 14.12 14 15.5 15.12 18 16.5 18 19 16.88 19 15.5M17 8H16V9H17V8Z',
    'sort-ascending': 'M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z',
    'sort-descending': 'M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z',
    'page-first': 'M18.41 16.59L13.82 12L18.41 7.41L17 6L11 12L17 18L18.41 16.59M6 6H8V18H6V6Z',
    'page-last':  'M5.59 7.41L10.18 12L5.59 16.59L7 18L13 12L7 6L5.59 7.41M16 6H18V18H16V6Z',
    'cog-outline': 'M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z',
    'menu': 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z',
  };
  function _icon(name, size) {
    const s = size || 24;
    const d = _MDI[name] || '';
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="fill:currentColor;flex-shrink:0;display:inline-block;vertical-align:middle;"><path d="${d}"/></svg>`;
  }
  // Exposer globalement pour config_tab.js, battery.js et autres modules
  window._icon = _icon;

  // Cache partagé entre toutes les instances de haca-panel (survive les navigations HA).
  // HA recrée l'élément à chaque navigation → les propriétés d'instance sont perdues.
  // Ce cache module-level évite tout écran de chargement lors des navigations suivantes.
  // Cache invalidation par version — évite d'afficher les clés brutes après une mise à jour
  if (!window._HC_HACA || window._HC_HACA.version !== '1.5.0') {
    window._HC_HACA = { data: null, translations: null, language: null, pagination: {}, version: '1.5.0' };
  }
  const _HC = window._HC_HACA;

  // ── Surveillance log ────────────────────────────────────────────────────────
  // Persiste dans window._HACA_LOG pour survivre aux navigations dans le même
  function _hlog() {} // logging désactivé en production
  if (!window._HACA_STATE) window._HACA_STATE = {
    booting:false, ready:false, rendered:false, hass:false,
    splash:false, retry:false, errors:0
  };


  class HacaPanel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._translations = {};
      this._lastConnection = null;
      this._language = 'en';
      this._connected = false;
      this._hass       = null;
      this._panel      = null;
      // Le constructor ne fait RIEN d'autre : l'élément n'est pas encore dans le DOM.
      // Tout démarre dans connectedCallback().
      _hlog('INF', 'constructor: element created');
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
      // L'élément est maintenant dans le DOM — c'est ici que tout commence.
      this._connected = true;
      _hlog('INF', 'connectedCallback | fullyReady=' + this._fullyReady + ' booting=' + this._booting);

      // Relancer la surveillance visibilité
      if (!this._visibilityHandler) {
        this._visibilityHandler = () => {
          const v = !document.hidden;
          const empty = !this.shadowRoot?.querySelector('.container');
          _hlog(v ? 'INF' : 'INF',
            'visibilitychange: ' + (v ? 'VISIBLE' : 'HIDDEN') +
            ' | shadowDOM=' + (empty ? 'EMPTY' : 'OK') +
            ' | fullyReady=' + this._fullyReady +
            ' | refreshTimer=' + (this._refreshTimer ? 'alive' : 'DEAD')
          );
          if (v && this._fullyReady) {
            this._syncTheme(); // resync thème au retour sur l'onglet
            this._dataLoading = false;
            if (!this._refreshTimer) this._startAutoRefresh();
            this.loadData();
          }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);
      }

      if (!this._rejectionHandler) {
        this._rejectionHandler = (event) => {
          const msg = event.reason?.message || String(event.reason);
          if (msg.includes('Subscription not found') || msg.includes('not_found') ||
              msg.includes('Connection lost') || msg.includes('Lost connection')) {
            event.preventDefault();
            this._unsubNewIssues = null;
          }
        };
        window.addEventListener('unhandledrejection', this._rejectionHandler);
      }

      // Synchroniser le thème HA dès l'entrée dans le DOM
      this._syncTheme();
      // Démarrer ou reprendre
      this._tryBoot();
    }

    disconnectedCallback() {
      // Lancé quand l'élément est retiré du DOM (navigation hors du panel)
      this._connected = false;
      _hlog('INF', 'disconnectedCallback: navigated away | fullyReady=' + this._fullyReady + ' rendered=' + this._rendered);
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
      if (this._bootRetryTimer) {
        clearInterval(this._bootRetryTimer);
        this._bootRetryTimer = null;
      }
      if (this._visibilityHandler) {
        document.removeEventListener('visibilitychange', this._visibilityHandler);
        this._visibilityHandler = null;
      }
    }

    set panel(panelInfo) {
      this._panel = panelInfo;
      _hlog('INF', 'set panel(): received | connected=' + this._connected);
      // Juste stocker la valeur. _tryBoot() vérifie que tout est prêt.
      this._tryBoot();
    }

    set hass(hass) {
      const wasNull = !this._hass;
      this._hass = hass;
      this._updateLogo();
      if (wasNull) {
        this._syncTheme(); // calcule _dark et _themeVars avant le premier render
      }
      if (wasNull) {
        _hlog('INF', 'set hass(): first hass | connected=' + this._connected + ' fullyReady=' + this._fullyReady);
        // Juste stocker. _tryBoot() vérifie que tout est prêt.
        this._tryBoot();
      }
      // Détection de reconnexion WebSocket
      if (hass?.connection && hass.connection !== this._lastConnection) {
        this._lastConnection = hass.connection;
        this._unsubNewIssues = null;
        _hlog('WRN', 'set hass(): NEW WebSocket connection — resubscribing');
        if (this._fullyReady) {
          this._subscribeToNewIssues();
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




    // Injecte les variables CSS du thème HA dans l'iframe.
    // hass.themes contient les variables de thème actif (overrides custom).
    // Pour le thème "default", on utilise les valeurs HA hardcodées selon darkMode.
    // Copie les règles CSS html{} du document parent dans l'iframe.
    // HA définit toutes ses variables de thème dans des <style> du parent —
    // pas en inline style. En copiant les règles qui ciblent "html", on les
    // rend disponibles dans l'iframe (shadow DOM ET document.body pour les modals).
    // ── Ouvre la fenêtre more-info native de HA pour une entité ──────────
    // Le panel est chargé dans une iframe (embed_iframe: true).
    // Les événements dispatched DANS l'iframe ne remontent pas vers le
    // document parent où HA écoute `hass-more-info` sur <home-assistant>.
    // Solution : dispatcher l'événement directement sur l'élément racine HA
    // du document parent, avec bubbles+composed pour traverser les shadow roots.
    _openMoreInfo(entityId) {
      if (!entityId) return;
      try {
        const parentDoc = window.parent?.document;
        if (!parentDoc) return;
        // <home-assistant> est le root de l'appli HA dans le parent
        const haRoot = parentDoc.querySelector('home-assistant');
        const target = haRoot || parentDoc.body;
        target.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId },
        }));
      } catch (err) {
        // Fallback si l'accès cross-origin échoue (ne devrait pas arriver ici)
        _hlog('WRN', '_openMoreInfo failed: ' + err.message);
      }
    }

    _syncTheme() {
      try {
        const parentDoc = window.parent?.document;
        if (!parentDoc) return;

        // Collecter toutes les règles html/root du parent
        const parts = [];
        for (const sheet of parentDoc.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              const sel = rule.selectorText;
              if (sel === 'html' || sel === ':root') {
                parts.push(rule.cssText);
              }
            }
          } catch(_) {} // feuilles cross-origin ignorées
        }
        if (!parts.length) return;

        // Injecter dans <head> de l'iframe
        let el = document.getElementById('_haca_theme_sync');
        if (!el) {
          el = document.createElement('style');
          el.id = '_haca_theme_sync';
          document.head.appendChild(el);
        }
        el.textContent = parts.join('\n');

        // Corriger le fond body de l'iframe (évite le flash noir)
        document.documentElement.style.background = 'var(--primary-background-color)';
        document.body.style.background = 'var(--primary-background-color)';
        document.body.style.color = 'var(--primary-text-color)';

        // Styles globaux : ha-icon size + hover des boutons dans les modals
        // Doit être dans <head> car les modals sont appendées à document.body (hors shadow DOM)
        let global = document.getElementById('_haca_global');
        if (!global) {
          global = document.createElement('style');
          global.id = '_haca_global';
          document.head.appendChild(global);
        }
        global.textContent = `
          ha-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--mdc-icon-size, 24px);
            height: var(--mdc-icon-size, 24px);
            --mdc-icon-size: 24px;
            color: inherit;
          }
          ha-icon svg, ha-icon svg path {
            fill: currentColor;
          }
          button ha-icon,
          a ha-icon {
            color: inherit;
            pointer-events: none;
          }
          .haca-modal button {
            cursor: pointer;
            transition: filter 0.15s ease, transform 0.1s ease;
          }
          .haca-modal button:hover {
            filter: brightness(1.15);
            transform: translateY(-1px);
          }
          .haca-modal button:active {
            filter: brightness(0.95);
            transform: translateY(0);
          }
          .modal-close-btn {
            width: 32px !important;
            height: 32px !important;
          }
          .modal-close-btn ha-icon {
            --mdc-icon-size: 20px;
            width: 20px;
            height: 20px;
          }
        `;
      } catch(_) {}
    }

    _updateLogo() {
      const logo = this.shadowRoot?.querySelector('#haca-logo');
      if (!logo) return;
      // HA exposes dark mode via hass.themes.darkMode (true/false/undefined)
      // Fallback: check prefers-color-scheme media query
      const hasDark = this._hass?.themes?.darkMode
        ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
      // brand/ is served at /config_auditor_brand (separate static route from www/)
      const src = hasDark
        ? '/config_auditor_brand/dark_icon.png'
        : '/config_auditor_brand/icon.png';
      if (logo.src !== src) logo.src = src;
    }

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
      if (document.getElementById('haca-boot-splash')) return;
      // Ne jamais afficher si l'élément n'est pas dans le DOM
      if (!this._connected) return;
      window._HACA_STATE.splash = true;
      _hlog('INF', '_showBootSplash(): shown');
      const el = document.createElement('div');
      el.id = 'haca-boot-splash';
      // Lire la couleur de fond réelle depuis le document (après _syncTheme)
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-background-color').trim() || '#1a1a1a';
      const fg = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-color').trim() || '#03a9f4';
      el.style.cssText = [
        'position:fixed','inset:0','z-index:9999',
        'display:flex','flex-direction:column','align-items:center','justify-content:center',
        `background:${bg}`,
        'gap:20px','font-family:var(--paper-font-body1_-_font-family,sans-serif)',
      ].join(';');
      el.innerHTML = `
        <style>
          @keyframes haca-boot-spin { to { transform: rotate(360deg); } }
          #haca-boot-splash .haca-spinner {
            width:48px; height:48px; border-radius:50%;
            border:4px solid rgba(128,128,128,0.3);
            border-top-color:${fg};
            animation:haca-boot-spin 0.9s linear infinite;
          }
          #haca-boot-splash .haca-logo {
            font-size:28px; font-weight:700; letter-spacing:2px;
            color:${fg};
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
      document.body.appendChild(el);
    }

    _hideBootSplash() {
      const el = document.getElementById('haca-boot-splash');
      if (!el) return;
      // Ne masquer le splash QUE si cet élément est réellement dans le DOM.
      // HA crée parfois l'élément hors-DOM (pas de connectedCallback) et exécute
      // le boot complet avant insertion. Si on masque le splash à ce moment,
      // l'utilisateur voit une page blanche jusqu'à ce que le vrai élément soit inséré.
      if (!this._connected) {
        _hlog('WRN', '_hideBootSplash(): element NOT in DOM yet (no connectedCallback) — keeping splash visible');
        return;
      }
      window._HACA_STATE.splash = false;
      window._HACA_STATE.retry = false;
      _hlog('INF', '_hideBootSplash(): splash removed — element in DOM and data loaded');
      // Annuler le retry timer : loadData() a réussi, plus besoin de retenter
      if (this._bootRetryTimer) {
        clearInterval(this._bootRetryTimer);
        this._bootRetryTimer = null;
      }
      // Fade out smoothly
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 420);
    }

    // Point d'entrée unique pour démarrer ou reprendre le panel.
    // Vérifie toutes les préconditions avant d'agir.
    _tryBoot() {
      // Préconditions : l'élément doit être dans le DOM, avec hass et panel
      if (!this._connected) return;
      if (!this._hass)      return;
      if (!this._panel)     return;

      if (this._fullyReady) {
        // Déjà initialisé — panel déjà rendu, données en cache → affichage immédiat
        _hlog('INF', '_tryBoot(): already ready, refreshing');
        this._dataLoading = false;
        this._applyCachedData();
        this._startAutoRefresh();
        this.loadData();
        return;
      }

      if (this._booting) return; // boot déjà en cours

      this._boot();
    }

    async _boot() {
      this._booting = true;
      _hlog('INF', '_boot(): starting');
      this._showBootSplash(); // affiché seulement quand boot réel démarre

      try {
        // 1. Traductions
        if (_HC.translations) {
          this._translations = _HC.translations;
          this._language = _HC.language || 'en';
        } else {
          _hlog('INF', '_boot(): loading translations');
          await this.loadTranslations();
          _HC.translations = this._translations;
          _HC.language = this._language;
        }

        // Vérifier qu'on est toujours connecté après l'await
        if (!this._connected) {
          _hlog('WRN', '_boot(): disconnected during translations load, aborting');
          return;
        }

        // 2. Render
        _hlog('INF', '_boot(): render()');
        this._syncTheme(); // injecter le thème avant le premier render
        this.render();
        this.attachListeners();
        this._updateLogo();
        _hlog('INF', '_boot(): render() done');

        // 3. Prêt
        this._fullyReady = true;
        this._startAutoRefresh();

        // 4. Cache immédiat
        if (_HC.data) this.updateUI(_HC.data);

        // 5. Données fraîches
        _hlog('INF', '_boot(): loadData()');
        await this.loadData();

      } catch (err) {
        _hlog('ERR', '_boot(): ' + (err?.message || String(err)));
        if (!this._fullyReady) {
          this._fullyReady = true;
          this._startAutoRefresh();
        }
      } finally {
        this._booting = false;
      }
    }

    _startAutoRefresh() {
      this._stopAutoRefresh(); // annuler tout intervalle existant (et le timer global)
      this._dataErrorCount = 0;
      const timerId = setInterval(() => {
        if (!this._connected || !this._hass) return;
        // Watchdog : après 5 erreurs consécutives, afficher un bandeau d'erreur récupérable
        if (this._dataErrorCount >= 5) {
          if (!this._reconnectOverlayShown) {
            this._reconnectOverlayShown = true;
            _hlog('ERR', '_startAutoRefresh(): 5+ consecutive errors — showing reconnect banner');
            this._showReconnectBanner();
          }
          this.loadData();
          return;
        }
        if (this._reconnectOverlayShown && this._dataErrorCount === 0) {
          this._reconnectOverlayShown = false;
          this._hideReconnectBanner();
        }
        this.loadData();
      }, 60_000); // 60 secondes
      this._refreshTimer = timerId;
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
      }
    }

    render() {
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          background: var(--primary-background-color, #fafafa);
          color: var(--primary-text-color, #212121);
          font-family: 'Roboto', 'Outfit', sans-serif;
          box-sizing: border-box;
          --mdc-icon-size: 24px;
        }
        ha-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--mdc-icon-size, 24px);
          height: var(--mdc-icon-size, 24px);
          --mdc-icon-size: 24px;
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
        .haca-back-btn { background:none; border:none; cursor:pointer; color:var(--primary-text-color); padding:8px; margin:-8px 0 -8px -8px; border-radius:50%; display:none; }
        .haca-back-btn:hover { background:var(--secondary-background-color); }
        .haca-back-btn ha-icon { --mdc-icon-size:24px; }
        @media (max-width: 1024px) { .haca-back-btn { display: flex; } }
        .header-title { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .header-title ha-icon { --mdc-icon-size: 42px; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
        .header-title #haca-logo { flex-shrink:0; width:42px; height:42px; object-fit:contain; }
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
        button#scan-all { background: rgba(255,255,255,0.95); color: var(--primary-color); font-weight: 700; border: none; }
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
        .stat-card[data-category] { cursor: pointer; }
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
          flex: 0 0 auto;
          padding: 9px 10px;
          background: transparent; cursor: pointer;
          border-radius: 10px; border: none;
          color: var(--secondary-text-color);
          font-weight: 600; white-space: nowrap;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          transition: all 0.2s ease; font-size: 12px;
        }
        .tabs .tab ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
        .tab-label { display: inline; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        /* Badge numérique en superscript — flottant au-dessus de l'icône */
        .tabs .tab { position: relative; }
        .tab-badge-wrap {
          position: absolute; top: 2px; right: 2px;
          background: var(--error-color, #ef5350); color: #fff;
          border-radius: 8px; padding: 1px 5px;
          font-size: 9px; font-weight: 700; line-height: 1.4;
          pointer-events: none;
        }
        .tab-badge-wrap.warning { background: var(--warning-color, #ff9800); }
        .tabs .tab:hover { color: var(--primary-text-color); background: rgba(0,0,0,0.05); }
        .tabs .tab.active { background: var(--card-background-color); color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        /* ── SUB-TABS (inside Issues tab) ────────── */
        .subtabs-container {
          border-bottom: 1px solid var(--divider-color);
          padding: 8px 16px 0;
          background: var(--secondary-background-color);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .subtabs-container::-webkit-scrollbar { display: none; }
        .subtabs {
          display: flex; gap: 2px;
          overflow-x: visible;
          min-width: max-content;
        }
        .subtabs .subtab {
          flex-shrink: 0;
          padding: 7px 10px;
          background: transparent; cursor: pointer;
          border: none; border-bottom: 3px solid transparent;
          color: var(--secondary-text-color);
          font-weight: 500; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
          transition: all 0.2s ease; font-size: 12px;
          border-radius: 0;
        }
        .subtabs .subtab span { max-width: 100px; overflow: hidden; text-overflow: ellipsis; display: inline-block; vertical-align: middle; }
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
        .haca-modal-card { border-radius: 20px !important; overflow: hidden !important; border: 1px solid var(--divider-color); background: var(--card-background-color); }

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
           TABLET  ≤ 1150px  — hide tab text, icon only
           ═══════════════════════════════════════════ */
        @media (max-width: 1150px) {
          .tab-label { display: none; }
          .tabs .tab { gap: 0; padding: 10px; }
        }

        /* ═══════════════════════════════════════════
           MOBILE  ≤ 600px
           ═══════════════════════════════════════════ */
        @media (max-width: 600px) {
          .section-card { padding: 10px; }

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

          /* Top-level tabs: keep labels visible at < 600px via icon-only already */
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
          <button class="haca-back-btn" id="haca-back" title="Menu">${_icon("menu")}</button>
          <div class="header-title">
            <img id="haca-logo" src="" width="42" height="42" style="flex-shrink:0;border-radius:8px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));transition:opacity 0.2s;" alt="HACA">
            <div>
                <h1>${this.t('title')}</h1>
                <div class="header-sub">${this.t('subtitle')} - ${this.t('version')}</div>
            </div>
          </div>
          <div class="actions" style="display:flex;align-items:center;gap:12px;">
            <div id="last-scan-ts" style="font-size:13px;color:var(--primary-text-color);white-space:nowrap;opacity:0.75;text-align:right;line-height:1.3;"></div>
            <button id="scan-all">${_icon("magnify-scan")} ${this.t('buttons.scan_all')}</button>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-card" style="grid-column: span 2; min-width:0; overflow:hidden;" id="health-score-card">
            <div class="stat-header">
              <span class="stat-label">${this.t('stats.health_score')}</span>
              ${_icon("chart-line")}
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
          <div class="stat-card" data-category="security" style="border-left: 5px solid var(--error-color, #ef5350);">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.security')}</span>
                ${_icon("shield-lock")}
            </div>
            <div class="stat-value" id="security-count">0</div>
            <div class="stat-desc">${this.t('stats.security_desc')}</div>
          </div>
          <div class="stat-card" data-category="automations">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.automations')}</span>
                ${_icon("robot-confused")}
            </div>
            <div class="stat-value" id="auto-count">0</div>
            <div class="stat-desc">${this.t('stats.automations_desc')}</div>
          </div>
          <div class="stat-card" data-category="scripts">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.scripts')}</span>
                ${_icon("script-text")}
            </div>
            <div class="stat-value" id="script-count">0</div>
            <div class="stat-desc">${this.t('stats.scripts_desc')}</div>
          </div>
          <div class="stat-card" data-category="scenes">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.scenes')}</span>
                ${_icon("palette")}
            </div>
            <div class="stat-value" id="scene-count">0</div>
            <div class="stat-desc">${this.t('stats.scenes_desc')}</div>
          </div>
          <div class="stat-card" data-category="entities">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.entities')}</span>
                ${_icon("lightning-bolt")}
            </div>
            <div class="stat-value" id="entity-count">0</div>
            <div class="stat-desc">${this.t('stats.entities_desc')}</div>
          </div>
          <div class="stat-card" data-category="helpers">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.helpers')}</span>
                ${_icon("cog-outline")}
            </div>
            <div class="stat-value" id="helper-count">0</div>
            <div class="stat-desc">${this.t('stats.helpers_desc')}</div>
          </div>
          <div class="stat-card" data-category="performance">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.performance')}</span>
                ${_icon("speedometer-slow")}
            </div>
            <div class="stat-value" id="perf-count">0</div>
            <div class="stat-desc">${this.t('stats.performance_desc')}</div>
          </div>
          <div class="stat-card blueprint" data-category="blueprints">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.blueprints')}</span>
                ${_icon("file-document-outline")}
            </div>
            <div class="stat-value" id="blueprint-count">0</div>
            <div class="stat-desc">${this.t('stats.blueprints_desc')}</div>
          </div>
          <div class="stat-card" data-category="dashboards" style="border-top: 3px solid var(--primary-color);">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.dashboards')}</span>
                ${_icon("view-dashboard-outline")}
            </div>
            <div class="stat-value" id="dashboard-count">0</div>
            <div class="stat-desc">${this.t('stats.dashboards_desc')}</div>
          </div>
          <div class="stat-card" id="recorder-stat-btn" style="border-top: 3px solid #ff7043; cursor:pointer;">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.recorder_orphans')}</span>
                ${_icon("database-alert-outline")}
            </div>
            <div class="stat-value" id="recorder-orphan-count">—</div>
            <div class="stat-desc" id="recorder-orphan-mb"></div>
          </div>
        </div>
        
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab active" data-tab="issues" title="${this.t('tab_tooltips.issues')}">
              ${_icon("alert-circle-outline")}
              <span class="tab-label">${this.t('tabs.issues')}</span>
            </button>
            <button class="tab" data-tab="recorder" title="${this.t('tab_tooltips.recorder')}">
              ${_icon("database-alert-outline")}
              <span class="tab-label">${this.t('tabs.recorder')}</span>
            </button>
            <button class="tab" data-tab="history" title="${this.t('tab_tooltips.history')}">
              ${_icon("chart-timeline-variant")}
              <span class="tab-label">${this.t('tabs.history')}</span>
            </button>
            <button class="tab" data-tab="backups" title="${this.t('tab_tooltips.backups')}">
              ${_icon("archive-arrow-down-outline")}
              <span class="tab-label">${this.t('tabs.backups')}</span>
            </button>
            <button class="tab" data-tab="reports" title="${this.t('tab_tooltips.reports')}">
              ${_icon("file-chart-outline")}
              <span class="tab-label">${this.t('tabs.reports')}</span>
            </button>
            <button class="tab" data-tab="carte" title="${this.t('tab_tooltips.carte')}">
              ${_icon("graph")}
              <span class="tab-label">${this.t('tabs.carte')}</span>
            </button>
            <button class="tab" data-tab="batteries" title="${this.t('tab_tooltips.batteries')}">
              ${_icon("battery-alert")}
              <span class="tab-label">${this.t('tabs.batteries')}</span>
              <span id="tab-badge-batteries" class="tab-badge-wrap" style="display:none;"></span>
            </button>
            <button class="tab" data-tab="chat" title="${this.t('tab_tooltips.chat')}">
              ${_icon("robot-happy-outline")}
              <span class="tab-label">${this.t('tabs.chat')}</span>
            </button>
            <button class="tab" data-tab="compliance" title="${this.t('tab_tooltips.compliance')}">
              ${_icon("check-circle-outline")}
              <span class="tab-label">${this.t('tabs.compliance')}</span>
              <span id="tab-badge-compliance" class="tab-badge-wrap warning" style="display:none;"></span>
            </button>
            <button class="tab" data-tab="config" title="${this.t('tab_tooltips.config')}">
              ${_icon("tune-variant")}
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
                <button class="subtab active" data-subtab="all">${_icon("view-list")} <span>${this.t('tabs.all')}</span></button>
                <button class="subtab" data-subtab="security">${_icon("shield-lock")} <span>${this.t('tabs.security')}</span></button>
                <button class="subtab" data-subtab="automations">${_icon("robot")} <span>${this.t('tabs.automations')}</span></button>
                <button class="subtab" data-subtab="scripts">${_icon("script-text")} <span>${this.t('tabs.scripts')}</span></button>
                <button class="subtab" data-subtab="scenes">${_icon("palette")} <span>${this.t('tabs.scenes')}</span></button>
                <button class="subtab" data-subtab="entities">${_icon("lightning-bolt")} <span>${this.t('tabs.entities')}</span></button>
                <button class="subtab" data-subtab="helpers">${_icon("cog-outline")} <span>${this.t('tabs.helpers')}</span></button>
                <button class="subtab" data-subtab="performance">${_icon("gauge")} <span>${this.t('tabs.performance')}</span></button>
                <button class="subtab" data-subtab="blueprints">${_icon("file-document-outline")} <span>${this.t('tabs.blueprints')}</span></button>
                <button class="subtab" data-subtab="dashboards">${_icon("view-dashboard-outline")} <span>${this.t('tabs.dashboards')}</span></button>
                <button class="subtab" data-subtab="area-complexity" title="${this.t('tabs.area_complexity')}">${_icon("map-legend")} <span>${this.t('tabs.area_complexity')}</span></button>
                <button class="subtab" data-subtab="redundancy" title="${this.t('tabs.redundancy')}">${_icon("content-duplicate")} <span>${this.t('tabs.redundancy')}</span></button>
              </div>
            </div>

            <!-- Sub-tab contents -->
            <div id="subtab-all" class="subtab-content active">
              <div class="section-header">
                <h2>${_icon("alert-circle-outline")} ${this.t('sections.all_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-all">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-all">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-all">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-all">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-all">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-all">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-all" class="issue-list"></div>
            </div>

            <div id="subtab-security" class="subtab-content">
              <div class="section-header">
                <h2>${_icon("shield-lock")} ${this.t('sections.security_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-security">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-security">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-security">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-security">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-security">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-security">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-security" class="issue-list"></div>
            </div>

            <div id="subtab-automations" class="subtab-content">
              <div class="section-header">
                <h2>${_icon("robot")} ${this.t('sections.automation_issues')}</h2>
                <div class="segment-bar" id="seg-bar-auto">
                  <button class="segment-btn active" data-seg="auto" data-panel="auto-issues">
                    ${_icon("alert-circle-outline")} ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="auto" data-panel="auto-scores">
                    ${_icon("chart-bar")} ${this.t('subtabs.scores')}
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
                <button class="export-csv-btn" data-target="issues-automations">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
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
                <h2>${_icon("script-text")} ${this.t('sections.script_issues')}</h2>
                <div class="segment-bar" id="seg-bar-scripts">
                  <button class="segment-btn active" data-seg="scripts" data-panel="scripts-issues">
                    ${_icon("alert-circle-outline")} ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="scripts" data-panel="scripts-scores">
                    ${_icon("chart-bar")} ${this.t('subtabs.scores')}
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
                <button class="export-csv-btn" data-target="issues-scripts">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
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
                <h2>${_icon("palette")} ${this.t('sections.scene_issues')}</h2>
                <div class="segment-bar" id="seg-bar-scenes">
                  <button class="segment-btn active" data-seg="scenes" data-panel="scenes-issues">
                    ${_icon("alert-circle-outline")} ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="scenes" data-panel="scenes-scores">
                    ${_icon("chart-bar")} ${this.t('subtabs.stats')}
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
                <button class="export-csv-btn" data-target="issues-scenes">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
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
                <h2>${_icon("lightning-bolt")} ${this.t('sections.entity_issues')}</h2>
                <div class="segment-bar" id="seg-bar-entities">
                  <button class="segment-btn active" data-seg="entities" data-panel="entities-issues">
                    ${_icon("alert-circle-outline")} ${this.t('issues.segment_issues')}
                  </button>
                  <button class="segment-btn" data-seg="entities" data-panel="entities-batteries">
                    ${_icon("battery-alert")} ${this.t('issues.segment_batteries')}
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
                  <button class="export-csv-btn" data-target="issues-entities">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
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
                    ${_icon("open-in-new", 14)} ${this.t('battery.view_full')}
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
            </div><!-- /subtab-entities -->

            <div id="subtab-helpers" class="subtab-content">
              <div class="section-header">
                <h2>${_icon("cog-outline")} ${this.t('sections.helper_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-helpers">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-helpers">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-helpers">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-helpers">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-helpers">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-helpers">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-helpers" class="issue-list"></div>
            </div>

            <div id="subtab-performance" class="subtab-content">
              <div class="section-header">
                <h2>${_icon("gauge")} ${this.t('sections.performance_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-performance">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-performance">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-performance">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-performance">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-performance">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-performance">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-performance" class="issue-list"></div>
            </div>

            <div id="subtab-blueprints" class="subtab-content">
              <div class="section-header">
                <h2>${_icon("file-document-outline")} ${this.t('sections.blueprint_issues')}</h2>
                <div class="segment-bar" id="seg-bar-blueprints">
                  <button class="segment-btn active" data-seg="blueprints" data-panel="blueprints-issues">
                    ${_icon("alert-circle-outline")} ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="blueprints" data-panel="blueprints-scores">
                    ${_icon("chart-bar")} ${this.t('subtabs.stats')}
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
                <button class="export-csv-btn" data-target="issues-blueprints">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
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
                <h2>${_icon("view-dashboard-outline")} ${this.t('sections.dashboard_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-dashboards">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-dashboards">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-dashboards">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-dashboards">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-dashboards">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-dashboards">${_icon("file-delimited-outline", 16)} ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-dashboards" class="issue-list"></div>
            </div>

            <!-- ── v1.5.0 subtab: Area Complexity ─────────────────── -->
            <div id="subtab-area-complexity" class="subtab-content">
              <div style="padding:0 20px 20px;" id="area-complexity-container">
                <div style="text-align:center;padding:32px;color:var(--secondary-text-color);">${this.t('area_complexity.run_scan_first')}</div>
              </div>
            </div>

            <!-- ── v1.5.0 subtab: Redundancy ──────────────────────── -->
            <div id="subtab-redundancy" class="subtab-content">
              <div style="padding:0 20px 20px;" id="redundancy-container">
                <div style="text-align:center;padding:32px;color:var(--secondary-text-color);">${this.t('redundancy.run_scan_first')}</div>
              </div>
            </div>

          </div><!-- /tab-issues -->

          <!-- ══════════════════════════════════════════════════════════
               TAB RECORDER — Orphelins + Impact DB (v1.5.0)
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-recorder" class="tab-content">
            <div class="subtabs-container">
              <div class="subtabs" id="subtabs-recorder">
                <button class="subtab active" data-subtab="rec-orphans">${_icon("database-alert-outline")} <span>${this.t('recorder.subtab_orphans')}</span></button>
                <button class="subtab" data-subtab="rec-impact">${_icon("database-check-outline")} <span>${this.t('recorder.subtab_impact')}</span></button>
              </div>
            </div>

            <!-- SubTab: Orphelins -->
            <div class="subtab-content active" id="subtab-rec-orphans">
              <div class="section-header">
                <h2 style="display:flex;align-items:center;gap:8px;">
                  ${_icon("database-alert-outline")}
                  ${this.t('sections.recorder_orphans')}
                  <span id="recorder-db-badge" style="display:none;font-size:12px;background:#ff7043;color:#fff;padding:2px 8px;border-radius:10px;"></span>
                </h2>
                <div class="section-header-btns">
                  <button id="recorder-purge-all-btn" style="display:none;background:#ff7043;color:#fff;">
                    ${_icon("delete-sweep-outline")} ${this.t('actions.purge_all_orphans')}
                  </button>
                </div>
              </div>
              <div id="recorder-orphan-list" style="padding:16px 20px;">
                <div style="color:var(--secondary-text-color);">${this.t('messages.loading')}</div>
              </div>
            </div><!-- /subtab-rec-orphans -->

            <!-- SubTab: Impact DB -->
            <div class="subtab-content" id="subtab-rec-impact">
              <div style="padding:0 20px 20px;" id="recorder-impact-container">
                <div style="text-align:center;padding:32px;color:var(--secondary-text-color);">${this.t('recorder_impact.run_scan_first')}</div>
              </div>
            </div><!-- /subtab-rec-impact -->

          </div><!-- /tab-recorder -->

          <!-- ══════════════════════════════════════════════════════════
               TAB HISTORY
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-history" class="tab-content">
            <div class="section-header">
              <h2>${_icon("chart-timeline-variant")} ${this.t('sections.history')}</h2>
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
                  ${_icon("delete-outline", 15)} ${this.t('misc.delete_selection')}
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
              <h2>${_icon("archive-arrow-down-outline")} ${this.t('sections.backup_management')}</h2>
              <div class="section-header-btns">
                <button id="create-backup" style="background:var(--primary-color);color:white;">
                  ${_icon("plus")} ${this.t('actions.create_backup')}
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
              <h2>${_icon("file-chart-outline")} ${this.t('sections.report_management')}</h2>
              <div class="section-header-btns">
                <button id="create-report" style="background:var(--success-color,#4caf50);color:white;">
                  ${_icon("file-document-plus")} ${this.t('buttons.report')}
                </button>
                <button id="refresh-reports" style="background:var(--primary-color);color:white;">
                  ${_icon("refresh")} ${this.t('buttons.refresh')}
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
              ${_icon("graph")}
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
                  ${_icon("fit-to-screen", 14)}
                </button>
                <!-- Export SVG -->
                <button id="graph-export-svg-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.export_svg')}">
                  ${_icon("image-outline", 14)} SVG
                </button>
                <!-- Export PNG -->
                <button id="graph-export-png-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.export_png')}">
                  ${_icon("image", 14)} PNG
                </button>
              </div>

              <!-- Search -->
              <input id="graph-search" type="text" placeholder="${this.t('misc.search_node')}"
                style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;width:180px;">
            </div>

            <!-- Graph canvas -->
            <div id="graph-container" style="flex:1;position:relative;overflow:hidden;">
              <div id="graph-empty" style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--secondary-text-color);">
                ${_icon("graph", 48)}
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

            <!-- Battery subtabs -->
            <div class="subtabs-container">
              <div class="subtabs" id="subtabs-battery">
                <button class="subtab active" data-subtab="monitor">${_icon("battery-check")} <span>${this.t('battery.subtab_monitor')}</span></button>
                <button class="subtab" data-subtab="predict">${_icon("chart-timeline-variant")} <span>${this.t('battery.subtab_predict')}</span></button>
              </div>
            </div>

            <!-- SubTab: Monitor -->
            <div class="subtab-content active" id="subtab-battery-monitor">
              <div class="section-header">
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
              <div id="bat-stat-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;padding:0 20px 16px;"></div>
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
            </div><!-- /subtab-battery-monitor -->

            <!-- SubTab: Predict -->
            <div class="subtab-content" id="subtab-battery-predict">
              <div style="padding:0 20px 20px;" id="bat-predict-container">
                <div style="text-align:center;padding:32px;color:var(--secondary-text-color);">
                  ${this.t('battery_predict.run_scan_first')}
                </div>
              </div>
            </div><!-- /subtab-battery-predict -->

          </div><!-- /tab-batteries -->

          <!-- Predict detail modal -->
          <div id="predict-detail-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">
            <div style="background:var(--card-background-color);border-radius:14px;padding:20px;width:90%;max-width:480px;position:relative;">
              <button id="predict-modal-close" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:20px;color:var(--secondary-text-color);">&#x2715;</button>
              <h3 id="predict-modal-title" style="margin:0 0 12px;font-size:16px;font-weight:700;"></h3>
              <div id="predict-modal-chart"></div>
              <div id="predict-modal-stats"></div>
            </div>
          </div>

          <!-- TAB CHAT IA -->
          <div id="tab-chat" class="tab-content">
            <div style="display:flex;flex-direction:column;height:calc(100vh - 220px);padding:0;">

              <!-- Header -->
              <div style="padding:14px 20px 12px;border-bottom:1px solid var(--divider-color);flex-shrink:0;">
                <h2 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
                  ${_icon("robot-happy-outline")}
                  ${this.t('chat.title')}
                </h2>
              </div>

              <!-- Bandeau de configuration LLM API -->
              <div style="flex-shrink:0;background:rgba(var(--rgb-primary-color, 33,150,243),0.07);border-bottom:1px solid rgba(var(--rgb-primary-color, 33,150,243),0.2);padding:10px 20px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <span style="font-size:18px;">⚙️</span>
                <div style="flex:1;min-width:200px;">
                  <div style="font-size:12px;font-weight:600;color:var(--primary-text-color);margin-bottom:2px;">${this.t('chat.setup_title')}</div>
                  <div style="font-size:11px;color:var(--secondary-text-color);">${this.t('chat.setup_steps')}</div>
                </div>
                <a href="/config/voice-assistants" target="_top"
                  style="font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;background:var(--primary-color);color:white;text-decoration:none;white-space:nowrap;display:flex;align-items:center;gap:4px;flex-shrink:0;">
                  ${_icon('open-in-new', 12)} ${this.t('chat.setup_link')}
                </a>
              </div>

              <!-- Exemples (collapsible) -->
              <div id="chat-examples-panel" style="flex-shrink:0;border-bottom:1px solid var(--divider-color);background:var(--secondary-background-color);">
                <button id="chat-examples-toggle"
                  style="width:100%;padding:8px 20px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;color:var(--primary-text-color);font-size:12px;font-weight:600;">
                  <span style="display:flex;align-items:center;gap:6px;">${_icon('lightbulb-on-outline',14)} ${this.t('chat.examples_title')}</span>
                  <span id="chat-examples-chevron" style="transition:transform 0.2s;">${_icon('chevron-down',14)}</span>
                </button>
                <div id="chat-examples-body" style="display:none;padding:0 16px 12px;display:flex;flex-wrap:wrap;gap:6px;">
                  ${this._buildExampleChips()}
                </div>
              </div>

              <!-- Messages -->
              <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;">
                <div style="background:var(--secondary-background-color);border-radius:12px;padding:12px 16px;max-width:85%;align-self:flex-start;">
                  <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:4px;">${this.t('misc.ai_assistant')}</div>
                  <div>${this.t('chat.greeting')}</div>
                </div>
              </div>

              <!-- Input -->
              <div style="padding:12px 20px;border-top:1px solid var(--divider-color);flex-shrink:0;display:flex;gap:8px;align-items:flex-end;">
                <textarea id="chat-input" placeholder="${this.t('chat.placeholder')}" rows="2"
                  style="flex:1;padding:10px 14px;border-radius:12px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;font-family:inherit;resize:vertical;min-height:42px;max-height:120px;outline:none;line-height:1.4;"></textarea>
                <button id="chat-send"
                  style="padding:10px 18px;border-radius:12px;background:var(--primary-color);color:white;border:none;cursor:pointer;font-weight:600;font-size:14px;flex-shrink:0;height:42px;display:flex;align-items:center;gap:6px;">
                  ${_icon("send", 16)}
                  ${this.t('chat.send')}
                </button>
              </div>
            </div>
          </div><!-- /tab-chat -->

          <!-- TAB CONFIGURATION -->
          <div id="tab-config" class="tab-content">
            <div style="padding:40px;text-align:center;color:var(--secondary-text-color);">
              ${_icon("loading", 32)}
              <div style="margin-top:12px;">${this.t('misc.loading_config')}</div>
            </div>
          </div><!-- /tab-config -->

          <!-- ══════════════════════════════════════════════════════════
               TAB COMPLIANCE — Conformité bonnes pratiques HA v1.4.0
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-compliance" class="tab-content">
            <div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;">
              <div class="loader"></div>
              <div style="font-size:15px;color:var(--secondary-text-color);">${this.t('compliance.scanning') || 'Chargement...'}</div>
            </div>
          </div><!-- /tab-compliance -->


          <!-- ── History diff modal ─────────────────────────────────── -->
          <div id="history-diff-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;align-items:center;justify-content:center;">
            <div style="background:var(--card-background-color);border-radius:14px;padding:20px;width:95%;max-width:680px;max-height:85vh;overflow-y:auto;position:relative;">
              <button id="history-diff-close" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:20px;color:var(--secondary-text-color);">&#x2715;</button>
              <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">
                ${_icon("source-branch-check", 18)} ${this.t('history.diff_title')}
              </h3>
              <div id="diff-modal-body"></div>
            </div>
          </div>

        </div><!-- /section-card -->
      </div><!-- /container -->
    `;
    }

    _buildExampleChips() {
      const examples = [
        this.t('chat.ex_audit'),
        this.t('chat.ex_create_auto'),
        this.t('chat.ex_debug'),
        this.t('chat.ex_rename'),
        this.t('chat.ex_history'),
        this.t('chat.ex_helpers'),
        this.t('chat.ex_backup'),
        this.t('chat.ex_template'),
        this.t('chat.ex_delete_auto'),
        this.t('chat.ex_search'),
        this.t('chat.ex_dashboard'),
        this.t('chat.ex_system'),
      ];
      return examples.map(ex => {
        const safe = ex.replace(/"/g, '&quot;');
        return '<button class="chat-example-chip" data-example="' + safe + '"'
          + ' style="font-size:11px;padding:4px 10px;border-radius:16px;border:1px solid var(--divider-color);'
          + 'background:var(--card-background-color);color:var(--primary-text-color);cursor:pointer;'
          + 'white-space:nowrap;transition:all 0.15s;display:inline-flex;align-items:center;gap:4px;"'
          + ' onmouseover="this.style.background=\'var(--primary-color)\';this.style.color=\'white\';this.style.borderColor=\'var(--primary-color)\';"'
          + ' onmouseout="this.style.background=\'var(--card-background-color)\';this.style.color=\'var(--primary-text-color)\';this.style.borderColor=\'var(--divider-color)\';">'
          + safe
          + ' <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.6;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
          + '</button>';
      }).join('');
    }

    attachListeners() {
      this.shadowRoot.querySelector('#scan-all').addEventListener('click', () => this.scanAll());

      // Menu button for mobile apps (opens HA sidebar)
      this.shadowRoot.querySelector('#haca-back')?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hass-toggle-menu', {
          bubbles: true, composed: true,
        }));
      });

      // Chat IA
      const chatSend = this.shadowRoot.querySelector('#chat-send');
      const chatInput = this.shadowRoot.querySelector('#chat-input');
      if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => this._sendChatMessage());
        chatInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendChatMessage(); }
        });
      }

      // Chat examples panel — toggle collapse
      const exToggle = this.shadowRoot.querySelector('#chat-examples-toggle');
      const exBody   = this.shadowRoot.querySelector('#chat-examples-body');
      const exChevron = this.shadowRoot.querySelector('#chat-examples-chevron');
      if (exToggle && exBody) {
        // Start collapsed
        exBody.style.display = 'none';
        exToggle.addEventListener('click', () => {
          const open = exBody.style.display !== 'none';
          exBody.style.display = open ? 'none' : 'flex';
          if (exChevron) exChevron.style.transform = open ? '' : 'rotate(180deg)';
        });
      }

      // Chat example chips — click to inject into input and send
      this.shadowRoot.querySelectorAll('.chat-example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const txt = chip.dataset.example || '';
          if (!txt) return;
          const inp = this.shadowRoot.querySelector('#chat-input');
          if (inp) {
            inp.value = txt;
            // Close examples panel
            if (exBody) exBody.style.display = 'none';
            if (exChevron) exChevron.style.transform = '';
            this._sendChatMessage();
          }
        });
      });

      // Recorder stat-card → navigate to recorder tab
      this.shadowRoot.querySelector('#recorder-stat-btn')?.addEventListener('click', () => this.switchTab('recorder'));

      // Summary stat-cards → jump to Issues tab with matching subtab
      this.shadowRoot.querySelectorAll('.stat-card[data-category]').forEach(card => {
        card.addEventListener('click', () => {
          const cat = card.dataset.category;
          this.switchTab('issues');
          // Small delay to let the Issues tab render before switching subtab
          setTimeout(() => this.switchSubtab(cat), 50);
        });
      });

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

      // Recorder subtabs (orphelins / impact)
      this.shadowRoot.querySelectorAll('#subtabs-recorder .subtab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.shadowRoot.querySelectorAll('#subtabs-recorder .subtab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const id = btn.dataset.subtab;
          this.shadowRoot.querySelectorAll('#tab-recorder .subtab-content').forEach(c => c.classList.remove('active'));
          const panel = this.shadowRoot.querySelector(`#subtab-${id}`);
          if (panel) panel.classList.add('active');
          if (id === 'rec-impact') this.loadRecorderImpact();
        });
      });

      // Battery subtabs (monitor / predict)
      this.shadowRoot.querySelectorAll('#subtabs-battery .subtab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.shadowRoot.querySelectorAll('#subtabs-battery .subtab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const id = btn.dataset.subtab;
          this.shadowRoot.querySelectorAll('#tab-batteries .subtab-content').forEach(c => c.classList.remove('active'));
          const panel = this.shadowRoot.querySelector(`#subtab-battery-${id}`);
          if (panel) panel.classList.add('active');
          if (id === 'predict') this.loadBatteryPredictions();
        });
      });

      // History diff modal close
      this.shadowRoot.querySelector('#history-diff-close')?.addEventListener('click', () => {
        const m = this.shadowRoot.querySelector('#history-diff-modal');
        if (m) m.style.display = 'none';
      });

      // Predict modal close
      this.shadowRoot.querySelector('#predict-modal-close')?.addEventListener('click', () => {
        const m = this.shadowRoot.querySelector('#predict-detail-modal');
        if (m) m.style.display = 'none';
      });

      // Sub-tabs inside Issues tab — scoped to #subtabs-issues only
      this.shadowRoot.querySelectorAll('#subtabs-issues .subtab').forEach(subtab => {
        subtab.addEventListener('click', () => {
          this.switchSubtab(subtab.dataset.subtab);
          const st = subtab.dataset.subtab;
          if (st === 'area-complexity') this.loadAreaComplexity();
          else if (st === 'redundancy') this.loadRedundancy();
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
          throw new Error(this.t('backup.error_loading'));
        }

        this.renderBackups(backups);

      } catch (error) {
        container.innerHTML = `<div class="empty-state">❌ ${this.t('notifications.error')}: ${error.message}</div>`;
      }
    }

    renderBackups(backups) {
      const container = this.shadowRoot.querySelector('#backups-list');
      const PAG_ID = 'backups-list';
      if (backups.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            ${_icon("archive-off-outline")}
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
                    ${_icon("zip-box-outline")}
                    <span style="word-break:break-all;">${this.escapeHtml(b.name)}</span>
                  </div>
                </td>
                <td style="white-space:nowrap;">${new Date(b.created).toLocaleString()}</td>
                <td><span style="background:var(--secondary-background-color);padding:4px 8px;border-radius:6px;font-size:12px;white-space:nowrap;">${Math.round(b.size / 1024)} KB</span></td>
                <td>
                  <div style="display:flex;gap:8px;">
                    <button class="restore-btn" data-path="${b.path}" style="background:var(--warning-color,#ff9800);color:black;">
                      ${_icon("backup-restore")} ${this.t('actions.restore')}
                    </button>
                    <button class="delete-backup-btn" data-path="${b.path}" data-name="${b.name}" style="background:var(--error-color,#ef5350);color:white;">
                      ${_icon("delete-outline")}
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
              ${_icon("zip-box-outline")}
              ${this.escapeHtml(b.name)}
            </div>
            <div class="m-card-meta">📅 ${new Date(b.created).toLocaleString()} · ${Math.round(b.size / 1024)} KB</div>
            <div class="m-card-btns">
              <button class="restore-btn" data-path="${b.path}" style="background:var(--warning-color,#ff9800);color:black;">
                ${_icon("backup-restore")} ${this.t('actions.restore')}
              </button>
              <button class="delete-backup-btn" data-path="${b.path}" data-name="${b.name}" style="background:var(--error-color,#ef5350);color:white;">
                ${_icon("delete-outline")} ${this.t('actions.delete')}
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

      // Rate limiting — 1 requête / 3s pour éviter l'épuisement des quotas IA
      const now = Date.now();
      if (this._lastChatTime && (now - this._lastChatTime) < 3000) {
        const wait = Math.ceil((3000 - (now - this._lastChatTime)) / 1000);
        this._appendChatMsg('assistant',
          `⏳ ${this.t('chat.rate_limit', {wait}) || `Wait ${wait}s`}`);
        return;
      }
      this._lastChatTime = now;

      input.value = '';
      this._appendChatMsg('user', text);

      // Show typing indicator
      const typingDiv = this._appendChatMsg('assistant', '…');
      if (sendBtn) sendBtn.disabled = true;

      try {
        // Appel au handler Python haca/chat qui gère :
        // - Le prompt système HACA + contexte HA
        // - L'agentic loop [HACA_ACTION:] → exécution d'outils
        // - Le fallback conversation/process si pas de réponse
        const wsResult = await this._hass.callWS({
          type: 'haca/chat',
          message: text,
          conversation_id: this._chatConvId || undefined,
        });
        const reply = wsResult?.reply || this.t('misc.no_ai_model');
        this._chatConvId = wsResult?.conversation_id || this._chatConvId;
        typingDiv.querySelector('div:last-child').textContent = reply;
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
      if (tabName === 'compliance') this.loadComplianceTab();
    }

    // Ouvre le tab Chat, pré-remplit et envoie automatiquement le message
    _openChatWithMessage(message) {
      // Gemini flash context limit ~30k tokens ≈ 120k chars. Tronquer à 6000 chars
      // pour laisser de la place au contexte système + historique + réponse.
      const MAX_PROMPT_CHARS = 6000;
      const truncated = message.length > MAX_PROMPT_CHARS
        ? message.slice(0, MAX_PROMPT_CHARS) + '\n…[prompt tronqué]'
        : message;
      // Les modales sont dans document.body (via createModal), pas dans shadowRoot
      document.body.querySelectorAll('.haca-modal').forEach(m => m.remove());
      // Bascule vers le chat
      this.switchTab('chat');
      // Injecte + envoie le message
      const input = this.shadowRoot.querySelector('#chat-input');
      if (input) {
        input.value = truncated;
        setTimeout(() => {
          const sendBtn = this.shadowRoot.querySelector('#chat-send');
          if (sendBtn && !sendBtn.disabled) sendBtn.click();
        }, 80);
      }
    }

    switchSubtab(subtabName) {
      // Scoped strictly to Issues tab — never touch battery/recorder subtabs
      this.shadowRoot.querySelectorAll('#subtabs-issues .subtab').forEach(t => t.classList.remove('active'));
      this.shadowRoot.querySelector(`#subtabs-issues .subtab[data-subtab="${subtabName}"]`)?.classList.add('active');
      this.shadowRoot.querySelectorAll('#tab-issues .subtab-content').forEach(c => c.classList.remove('active'));
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

        // ── v1.4.0 : Section MCP + Agent ───────────────────────────────
        const mcpContainer = el.querySelector('#mcp-section-container');
        if (mcpContainer && typeof renderMcpSection === 'function') {
          try {
            const [mcpStatus, agentStatus] = await Promise.all([
              this._hass.callWS({ type: 'haca/mcp_status' }).catch(() => null),
              this._hass.callWS({ type: 'haca/agent_status' }).catch(() => null),
            ]);
            mcpContainer.innerHTML = renderMcpSection(mcpStatus, agentStatus, this.t.bind(this));

            // Wire copy buttons (use data attributes, not inline onclick)
            const urlCopyBtn = mcpContainer.querySelector('[data-copy-url]');
            if (urlCopyBtn) {
              urlCopyBtn.addEventListener('click', () => {
                const text = urlCopyBtn.dataset.copyUrl;
                if (window._hacaCopy) window._hacaCopy(text);
              });
            }
            const agentCopyBtn = mcpContainer.querySelector('#agent-copy-btn');
            if (agentCopyBtn) {
              agentCopyBtn.addEventListener('click', () => {
                const snippet = mcpContainer.querySelector('#agent-snippet');
                if (snippet && window._hacaCopy) window._hacaCopy(snippet.textContent);
              });
            }

            // Bouton rapport forcé — avec téléchargement MD
            if (typeof wireForceReportButton === 'function') {
              wireForceReportButton(this.shadowRoot, this._hass, this.t.bind(this));
            }

            // Sélecteur fréquence rapport automatique
            const freqSel = this.shadowRoot.querySelector('#agent-report-freq');
            if (freqSel && !freqSel._wired) {
              freqSel._wired = true;
              freqSel.addEventListener('change', async () => {
                try {
                  await this._hass.callWS({
                    type: 'haca/save_options',
                    options: { report_frequency: freqSel.value },
                  });
                } catch(e) {
                  console.warn('[HACA] save report_frequency error', e);
                }
              });
            }
            // Agent config pills — register Shadow DOM container for _hacaAgentSwitch
            const tabsContainer = mcpContainer.querySelector('#agent-config-tabs');
            if (tabsContainer && typeof _hacaAgentSwitchContainer !== 'undefined') {
              window._hacaAgentSwitchContainer = tabsContainer;
            }
          } catch (mcpErr) {
            mcpContainer.innerHTML = `<div style="padding:12px;color:var(--secondary-text-color);font-size:13px;">MCP/Agent: ${mcpErr.message}</div>`;
          }
        }
      } catch (err) {
        el.innerHTML = `<div style="padding:32px;text-align:center;color:var(--error-color);">
        ❌ Erreur de chargement : ${err.message}
      </div>`;
      }
    }

    // ─── Onglet Conformité v1.4.2 ──────────────────────────────────────────

    async loadComplianceTab() {
      const el = this.shadowRoot.querySelector('#tab-compliance');
      if (!el) return;

      // État local persistant sur l'instance
      if (!this._complianceAll)    this._complianceAll    = null;
      if (!this._complianceSort)   this._complianceSort   = 'severity';
      if (!this._complianceFilter) this._complianceFilter = 'all';

      const PAG_ID = 'compliance-list';

      try {
        // Charger seulement si pas encore en cache
        if (!this._complianceAll) {
          el.innerHTML = `<div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;"><div class="loader"></div><div>${this.t('compliance.scanning')}</div></div>`;
          const data = await this._hass.callWS({ type: 'haca/get_data', category: 'compliance', limit: 500 });
          this._complianceAll = data.compliance_issue_list || [];
        }
        this._renderCompliancePage(el, PAG_ID);
      } catch (err) {
        el.innerHTML = `<div style="padding:32px;text-align:center;color:var(--error-color);">❌ ${err.message}</div>`;
      }
    }

    _complianceSortedFiltered() {
      let issues = (this._complianceAll || []).slice();
      // Filtre sévérité
      if (this._complianceFilter && this._complianceFilter !== 'all') {
        issues = issues.filter(i => i.severity === this._complianceFilter);
      }
      // Tri
      const sev = {high:0, medium:1, low:2};
      if (this._complianceSort === 'severity') {
        issues.sort((a,b) => (sev[a.severity]||2) - (sev[b.severity]||2));
      } else if (this._complianceSort === 'type') {
        issues.sort((a,b) => (a.type||'').localeCompare(b.type||''));
      } else if (this._complianceSort === 'entity') {
        issues.sort((a,b) => (a.alias||a.entity_id||'').localeCompare(b.alias||b.entity_id||''));
      }
      return issues;
    }

    _renderCompliancePage(el, PAG_ID) {
      // Si le cache a été invalidé (ex : refresh auto), recharger les données
      if (!this._complianceAll) {
        this.loadComplianceTab();
        return;
      }
      const all = this._complianceAll;
      // Counts sur la totalité (pas filtrée) pour les stat cards
      const counts = {
        total:  all.length,
        high:   all.filter(i => i.severity === 'high').length,
        medium: all.filter(i => i.severity === 'medium').length,
        low:    all.filter(i => i.severity === 'low').length,
        _area_truncated: all.some(i => i.type === 'compliance_entity_no_area_bulk'),
      };

      const filtered = this._complianceSortedFiltered();
      const st    = this._pagState(PAG_ID);
      const paged = this._pagSlice(filtered, st.page, st.pageSize);
      const pagHtml = this._pagHTML(PAG_ID, filtered.length, st.page, st.pageSize);

      // Rendre le HTML
      if (typeof renderComplianceTab === 'function') {
        el.innerHTML = renderComplianceTab(paged, this.t.bind(this), this._complianceSort, this._complianceFilter, pagHtml, counts, false);
      } else {
        el.innerHTML = `<div style="padding:32px;color:var(--error-color);">renderComplianceTab not found</div>`;
        return;
      }

      // Brancher la pagination
      this._pagWire(el, () => this._renderCompliancePage(el, PAG_ID));

      // Boutons de tri
      el.querySelectorAll('.compliance-sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._complianceSort = btn.dataset.sort;
          this._pagSet(PAG_ID, {page: 0}, () => this._renderCompliancePage(el, PAG_ID));
        });
      });

      // Cartes filtre sévérité
      el.querySelectorAll('.compliance-filter-card').forEach(card => {
        card.addEventListener('click', () => {
          this._complianceFilter = card.dataset.filter;
          this._pagSet(PAG_ID, {page: 0}, () => this._renderCompliancePage(el, PAG_ID));
        });
      });

      // Boutons More-Info → ouvre le panneau entité HA
      el.querySelectorAll('.compliance-moreinfo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const eid = btn.dataset.eid;
          if (eid) this._openMoreInfo(eid);
        });
      });

      // Mettre à jour le badge tab
      const badge = this.shadowRoot.querySelector('#tab-badge-compliance');
      if (badge) {
        if (all.length > 0) {
          badge.textContent = all.length > 99 ? '99+' : String(all.length);
          badge.style.display = '';
        } else {
          badge.style.display = 'none';
        }
      }
    }


    _renderComplianceFallback(issues) {
      return `<div style="padding:32px;text-align:center;"><div style="font-size:48px;">✅</div><div style="font-size:18px;margin-top:12px;">${this.t('compliance.all_good')}</div></div>`;
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
          ${_icon("loading", 32)}
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
          saveBtn.innerHTML = _icon("content-save", 18) + ' ' + this.t('config.save');
        }
      }
    }

    async saveConfig(options) {
      await this._hass.callWS({ type: 'haca/save_options', options });
    }

    async loadData() {
      if (!this._hass) return;
      if (!this._connected) return; // élément hors DOM — ne rien faire
      // Garde de concurrence : évite d'empiler des appels si le précédent est encore en cours
      if (this._dataLoading) return;
      this._dataLoading = true;
      try {
        _hlog('INF', 'loadData(): calling haca/get_data');
        const result = await this._hass.callWS({ type: 'haca/get_data' });
        this._cachedData = result;
        _HC.data = result;           // cache module : survive aux navigations
        this._dataErrorCount = 0;
        window._HACA_STATE.errors = 0;
        // Invalider le cache conformité (nouvelles données = rescan)
        this._complianceAll = null;
        _hlog('INF', 'loadData(): SUCCESS score=' + result?.health_score + '%');
        this.updateUI(result);
        // Hide the boot splash on first successful data load
        this._hideBootSplash();
      } catch (error) {
        this._dataErrorCount = (this._dataErrorCount || 0) + 1;
        const msg = error?.message || error?.code || (typeof error === 'object' ? JSON.stringify(error) : String(error));
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
          this._dataErrorCount = (this._dataErrorCount || 0) + 1;
          window._HACA_STATE.errors = this._dataErrorCount;
          const reason = isHacaNotReady ? 'HACA not ready (unknown_command)' : 'WS reconnecting';
          _hlog('WRN', 'loadData(): FAILED #' + this._dataErrorCount + ' — ' + reason + ' | msg=' + msg.substring(0,80));
            // Splash uniquement pendant le boot initial (pas encore fullyReady).
          // Post-boot, une erreur WS est silencieuse — le watchdog auto-refresh retentera.
          if (!this._fullyReady) {
            this._showBootSplash();
          }
          if (!this._bootRetryTimer) {
            window._HACA_STATE.retry = true;
            this._bootRetryTimer = setInterval(() => {
              if (!this._connected || !this._hass) return;
                    // Ne pas effacer le timer ici : loadData() retourne toujours undefined.
              // On efface uniquement quand le boot splash a disparu (= chargement réussi),
              // ce qui est détecté par _hideBootSplash() appelé dans loadData() au succès.
              this.loadData();
            }, 5000);
          }
          // S'assurer que _fullyReady est True même pendant les retries,
          // pour que la navigation et l'auto-refresh fonctionnent.
          if (!this._fullyReady && this._rendered) {
            this._fullyReady = true;
            this._startAutoRefresh();
          }
        } else {
          this._dataErrorCount = (this._dataErrorCount || 0) + 1;
          window._HACA_STATE.errors = this._dataErrorCount;
          _hlog('ERR', 'loadData(): UNEXPECTED ERROR #' + this._dataErrorCount + ' | msg=' + msg);
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

      // Last scan timestamp in header
      const tsEl = this.shadowRoot.querySelector('#last-scan-ts');
      if (tsEl && data.last_scan) {
        try {
          const d = new Date(data.last_scan);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          const hh = String(d.getHours()).padStart(2, '0');
          const mn = String(d.getMinutes()).padStart(2, '0');
          const label = this.t('misc.last_scan') || 'Last scan';
          tsEl.innerHTML = `<span style="font-size:11px;opacity:0.6;">${label}</span><br><span style="font-weight:600;">${dd}/${mm}/${yyyy} ${hh}:${mn}</span>`;
          tsEl.title = d.toLocaleString();
        } catch(e) { tsEl.textContent = ''; }
      }

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
        + (data.scene_issues || 0) + (data.entity_issues || 0) + (data.helper_issues || 0)
        + (data.performance_issues || 0)
        + (data.security_issues || 0) + (data.blueprint_issues || 0) + (data.dashboard_issues || 0);
      const issuesTab = this.shadowRoot.querySelector('.tabs .tab[data-tab="issues"]');
      if (issuesTab) {
        const existingBadge = issuesTab.querySelector('.tab-badge-wrap');
        if (existingBadge) existingBadge.remove();
        if (totalIssues > 0) {
          const badge = document.createElement('span');
          badge.className = 'tab-badge-wrap';
          badge.textContent = totalIssues;
          issuesTab.appendChild(badge);
        }
      }

      // Load sparkline (async, non-blocking)
      this._loadSparkline();
      safeSetText('auto-count', data.automation_issues || 0);
      safeSetText('script-count', data.script_issues || 0);
      safeSetText('scene-count', data.scene_issues || 0);
      safeSetText('entity-count', data.entity_issues || 0);
      safeSetText('helper-count', data.helper_issues || 0);
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
      const helperIssues = data.helper_issue_list || [];
      const allIssues = [...autoIssues, ...scriptIssues, ...sceneIssues, ...entityIssues, ...helperIssues, ...perfIssues, ...securityIssues, ...blueprintIssues, ...dashboardIssues];

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
        ['issues-helpers', helperIssues],
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
        ${_icon("database-off-outline")}
        ${this.t('recorder.db_unavailable')}
      </div>`;
        return;
      }

      if (orphans.length === 0) {
        listEl.innerHTML = `<div style="color:var(--success-color,#4caf50);padding:16px 0;display:flex;align-items:center;gap:8px;">
        ${_icon("database-check-outline")}
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
                  ${_icon("delete-outline", 13)} ${this.t('misc.purge_btn')}
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
          ${_icon("delete-sweep-outline", 15)} ${this.t('misc.purge_selection')}
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
      if (!entityIds || entityIds.length === 0) {
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
        'background:rgba(0,0,0,0.5)', 'display:flex', 'align-items:center',
        'justify-content:center',
      ].join(';');

      const box = document.createElement('div');
      box.style.cssText = [
        'background:var(--card-background-color)', 'border-radius:12px', 'padding:28px',
        'max-width:480px', 'width:90%', 'box-shadow:0 8px 40px rgba(0,0,0,0.3)',
        'color:var(--primary-text-color)',
      ].join(';');
      box.innerHTML = `
      <h3 style="margin:0 0 12px;font-size:18px;color:var(--primary-text-color);">
        ${this.t('recorder.purge_confirm_title')}
      </h3>
      <p style="margin:0 0 12px;font-size:14px;opacity:0.8;">
        ${this.t('recorder.purge_confirm_body').replace('{count}', entityIds.length)}
      </p>
      <ul style="margin:0 0 20px;padding-left:16px;">${preview}${more}</ul>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="haca-purge-cancel"
          style="padding:8px 18px;border-radius:6px;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer;font-size:14px;">
          ${this.t('actions.cancel')}
        </button>
        <button id="haca-purge-confirm"
          style="padding:8px 18px;border-radius:6px;border:none;background:#ff7043;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">
          ${this.t('recorder.purge_button').replace('{count}', entityIds.length)}
        </button>
      </div>`;

      modal.appendChild(box);
      document.body.appendChild(modal);

      const cancelBtn = document.getElementById('haca-purge-cancel');
      const confirmBtn = document.getElementById('haca-purge-confirm');

      // Hover styles
      [cancelBtn, confirmBtn].forEach(btn => {
        btn.style.transition = 'filter 0.15s ease, transform 0.1s ease';
        btn.addEventListener('mouseenter', () => { btn.style.filter = 'brightness(1.12)'; btn.style.transform = 'translateY(-1px)'; });
        btn.addEventListener('mouseleave', () => { btn.style.filter = ''; btn.style.transform = ''; });
      });

      cancelBtn.addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = this.t('recorder.purge_in_progress');

        const hass = this._hass;
        if (!hass || !hass.callWS) {
          modal.remove();
          this._this.showToast(this.t('recorder.purge_error_conn'), 'error');
          return;
        }

        try {
          const result = await hass.callWS({
            type: 'haca/purge_recorder_orphans',
            entity_ids: entityIds,
          });
          modal.remove();
          // Optimistic update: remove purged entities from the list immediately
          // so the user sees the effect at once without waiting for the DB rescan.
          this._removeOrphansFromUI(entityIds);
          // No automatic rescan — the DB WAL checkpoint needs time to propagate.
          // The UI is updated optimistically via _removeOrphansFromUI already.
          this._showToast('✅ ' + this.t('toast.purged_n').replace('{count}', entityIds.length), 'success');
        } catch (err) {
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
        style="padding:4px 8px;border-radius:6px;font-size:12px;border:1px solid var(--divider-color);
               background:var(--secondary-background-color);color:var(--primary-text-color);
               cursor:${disabled ? 'default' : 'pointer'};opacity:${disabled ? '0.4' : '1'};
               display:flex;align-items:center;gap:2px;min-width:32px;justify-content:center;">
        ${label ? label : ''}${icon ? _icon(icon.replace('mdi:',''), 14) : ''}
      </button>`;

    // Page indicator: "Page X / N"
    const pageLabel = this.t('pagination.page_of')
      .replace('{page}', page + 1)
      .replace('{total}', totalPages);

    return `
      <div class="pag-bar" data-pag-id="${id}"
        style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
               gap:8px;padding:12px 4px 4px;border-top:1px solid var(--divider-color);margin-top:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:var(--secondary-text-color);">${this.t('pagination.show')}</span>
          ${sizeBtn(10)}${sizeBtn(50)}${sizeBtn(100)}
        </div>
        <span style="font-size:12px;color:var(--secondary-text-color);">
          ${from}–${to} / <strong>${total}</strong>
        </span>
        <div style="display:flex;gap:4px;align-items:center;">
          ${navBtn('', 'mdi:page-first',  page === 0,              0)}
          ${navBtn(this.t('pagination.prev'), 'mdi:chevron-left',  page === 0,              page - 1)}
          <span style="font-size:12px;color:var(--secondary-text-color);white-space:nowrap;padding:0 4px;">${pageLabel}</span>
          ${navBtn(this.t('pagination.next'), 'mdi:chevron-right', page >= totalPages - 1,  page + 1)}
          ${navBtn('', 'mdi:page-last',   page >= totalPages - 1, totalPages - 1)}
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
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.idx);
        const entry = history[idx];
        if (entry?.ts) this._loadHistoryDiff(entry.ts);
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
        <td style="padding:6px 8px;text-align:center;">
          <button class="history-diff-btn" data-ts="${tsEsc}" style="background:none;border:1px solid var(--divider-color);border-radius:6px;padding:3px 8px;cursor:pointer;font-size:11px;color:var(--primary-color);display:flex;align-items:center;gap:4px;">
            ${_icon('source-branch-check', 12)} Diff
          </button>
        </td>
      </tr>`;
    }).join('');

    // Stocker les données pour le "tout supprimer"
    tbody._historyData = history;

    // Wire diff buttons
    tbody.querySelectorAll('.history-diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ts = btn.dataset.ts;
        if (ts) this._loadHistoryDiff(ts);
      });
    });

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

  // ═══════════════════════════════════════════════════════════════════
  //  HISTORY DIFF — Timeline diff on scan click
  // ═══════════════════════════════════════════════════════════════════

  async _loadHistoryDiff(ts) {
    const modal = this.shadowRoot.querySelector('#history-diff-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.querySelector('#diff-modal-body').innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">${_icon('loading', 22)} ${this.t('history.diff_loading')}</div>`;

    try {
      const result = await this._hass.callWS({ type: 'haca/get_history_diff', ts });
      this._renderHistoryDiff(result);
    } catch (e) {
      const body = modal.querySelector('#diff-modal-body');
      if (body) body.innerHTML = `<div style="color:var(--error-color);padding:16px;">${this.t('history.diff_error')}: ${e.message}</div>`;
    }
  }

  _renderHistoryDiff(data) {
    const modal = modal_el => this.shadowRoot.querySelector(modal_el);
    const body = this.shadowRoot.querySelector('#diff-modal-body');
    if (!body) return;

    const target = data.target;
    const pred   = data.predecessor;
    const diff   = data.diff || {};
    const newIssues = data.new_issues || [];
    const resolved  = data.resolved_issues || [];
    const scoreDelta = data.score_delta || 0;

    if (!pred) {
      body.innerHTML = `<div style="padding:16px;color:var(--secondary-text-color);">${this.t('history.diff_no_predecessor')}</div>`;
      return;
    }

    const deltaColor = scoreDelta > 0 ? '#4caf50' : scoreDelta < 0 ? '#ef5350' : 'var(--secondary-text-color)';
    const deltaStr   = scoreDelta > 0 ? `▲ +${scoreDelta}` : scoreDelta < 0 ? `▼ ${scoreDelta}` : '→ 0';

    // Header
    const headerHtml = `
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--divider-color);">
        <div style="flex:1;min-width:120px;text-align:center;">
          <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:4px;">${pred.date} ${pred.time}</div>
          <div style="font-size:28px;font-weight:800;color:${pred.score >= 80 ? '#4caf50' : pred.score >= 50 ? '#ffa726' : '#ef5350'};">${pred.score}%</div>
        </div>
        <div style="font-size:22px;font-weight:700;color:${deltaColor};">${deltaStr}</div>
        <div style="flex:1;min-width:120px;text-align:center;">
          <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:4px;">${target.date} ${target.time}</div>
          <div style="font-size:28px;font-weight:800;color:${target.score >= 80 ? '#4caf50' : target.score >= 50 ? '#ffa726' : '#ef5350'};">${target.score}%</div>
        </div>
      </div>`;

    // Category diff grid
    const catLabels = {
      automation: this.t('history.diff_cat_automation'),
      script:     this.t('history.diff_cat_script'),
      scene:      this.t('history.diff_cat_scene'),
      entity:     this.t('history.diff_cat_entity'),
      performance:this.t('history.diff_cat_performance'),
      security:   this.t('history.diff_cat_security'),
      blueprint:  this.t('history.diff_cat_blueprint'),
      dashboard:  this.t('history.diff_cat_dashboard'),
    };
    const catCells = Object.entries(diff).map(([cat, d]) => {
      const color = d.delta < 0 ? '#4caf50' : d.delta > 0 ? '#ef5350' : 'var(--secondary-text-color)';
      const sign  = d.delta > 0 ? '+' : '';
      const bg    = d.delta < 0 ? 'rgba(76,175,80,0.08)' : d.delta > 0 ? 'rgba(239,83,80,0.08)' : 'var(--secondary-background-color)';
      return `<div style="background:${bg};border-radius:8px;padding:8px 12px;text-align:center;border:1px solid var(--divider-color);">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:var(--secondary-text-color);margin-bottom:2px;">${catLabels[cat] || cat}</div>
        <div style="font-size:18px;font-weight:800;">${d.new}</div>
        <div style="font-size:12px;color:${color};font-weight:600;">${sign}${d.delta}</div>
      </div>`;
    }).join('');

    // New / resolved issues
    const issueTag = (i, type) => {
      const bg = type === 'new' ? 'rgba(239,83,80,0.12)' : 'rgba(76,175,80,0.12)';
      const col = type === 'new' ? '#ef5350' : '#4caf50';
      const icon = type === 'new' ? 'plus-circle-outline' : 'check-circle-outline';
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:${bg};border-radius:6px;margin-bottom:4px;">
        ${_icon(icon, 16, col)}
        <div style="flex:1;min-width:0;">
          <span style="font-weight:600;font-size:13px;">${this.escapeHtml(i.entity_id || '—')}</span>
          <span style="font-size:11px;color:var(--secondary-text-color);margin-left:6px;">${this.escapeHtml(i.type || '')}</span>
          ${i.severity ? `<span style="background:${col};color:#fff;border-radius:4px;font-size:10px;padding:1px 5px;margin-left:6px;">${i.severity}</span>` : ''}
        </div>
      </div>`;
    };

    const issuesHtml = (newIssues.length || resolved.length) ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
        <div>
          <h5 style="margin:0 0 8px;color:#ef5350;display:flex;align-items:center;gap:6px;">
            ${_icon('plus-circle-outline', 16, '#ef5350')} ${this.t('history.diff_new_issues')} (${newIssues.length})
          </h5>
          ${newIssues.length ? newIssues.map(i => issueTag(i, 'new')).join('') : `<div style="color:var(--secondary-text-color);font-size:13px;">${this.t('history.diff_none')}</div>`}
        </div>
        <div>
          <h5 style="margin:0 0 8px;color:#4caf50;display:flex;align-items:center;gap:6px;">
            ${_icon('check-circle-outline', 16, '#4caf50')} ${this.t('history.diff_resolved')} (${resolved.length})
          </h5>
          ${resolved.length ? resolved.map(i => issueTag(i, 'resolved')).join('') : `<div style="color:var(--secondary-text-color);font-size:13px;">${this.t('history.diff_none')}</div>`}
        </div>
      </div>` : '';

    // Export buttons
    const exportBtns = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;padding-top:14px;border-top:1px solid var(--divider-color);">
        <button id="diff-export-md-btn" style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:8px;padding:7px 14px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('file-document-outline', 14)} ${this.t('history.diff_export_md')}
        </button>
      </div>`;

    body.innerHTML = headerHtml
      + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin-bottom:8px;">${catCells}</div>`
      + issuesHtml
      + exportBtns;

    // Wire export MD
    const mdBtn = body.querySelector('#diff-export-md-btn');
    if (mdBtn) mdBtn.onclick = () => this._exportDiffMarkdown(data);
  }

  _exportDiffMarkdown(data) {
    const t = data.target;
    const p = data.predecessor;
    const diff = data.diff || {};
    let md = `# HACA Audit Diff\n\n**${p.date}** → **${t.date}**\n\n`;
    md += `| Score | ${p.score}% | → | ${t.score}% | Delta: ${data.score_delta > 0 ? '+' : ''}${data.score_delta} pts |\n|---|---|---|---|---|\n\n`;
    md += `## Catégories\n\n| Catégorie | Avant | Après | Delta |\n|---|---|---|---|\n`;
    for (const [cat, d] of Object.entries(diff)) {
      md += `| ${cat} | ${d.old} | ${d.new} | ${d.delta > 0 ? '+' : ''}${d.delta} |\n`;
    }
    if (data.new_issues?.length) {
      md += `\n## Nouveaux problèmes\n\n`;
      data.new_issues.forEach(i => { md += `- 🔴 **${i.entity_id}** \`${i.type}\` (${i.severity}): ${i.message || ''}\n`; });
    }
    if (data.resolved_issues?.length) {
      md += `\n## Problèmes résolus\n\n`;
      data.resolved_issues.forEach(i => { md += `- ✅ **${i.entity_id}** \`${i.type}\`\n`; });
    }
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `haca_diff_${t.date}.md`; a.click();
    URL.revokeObjectURL(url);
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
            ${_icon("robot", 13)} ${this.t('misc.ia_btn')}
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
        fresh.innerHTML = `${_icon(this._complexitySortAsc ? "sort-ascending" : "sort-descending")} ${this.t('tables.score_col')} ${this._complexitySortAsc ? '↑' : '↓'}`;
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
            ${_icon("robot", 13)} ${this.t('misc.ia_btn')}
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
        ${_icon(t.icon.replace("mdi:",""), 15)} ${t.label}
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
            ${_icon("check-circle-outline", 16)}
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
            ${_icon("puzzle", 16)}
            ${this.t('optimizer.apply_blueprint')}
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
              ${_icon("auto-fix", 28)}
              <div>
                <div style="font-size:16px;font-weight:700;">${this.t('actions.ai_explain')} Optimizer — ${this.escapeHtml(alias)}</div>
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
                  ${_icon("zip-box-outline")}
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
            btn.innerHTML = `${_icon("check-circle-outline")} ${this.t('optimizer.retry')}`;
            this.showHANotification(this.t('misc.ai_error') + (r.error || this.t('fix.error_unknown')), '', 'haca_error');
          }
        } catch(err) {
          btn.disabled = false;
          btn.innerHTML = `${_icon("check-circle-outline")} ${this.t('optimizer.retry')}`;
          this.showHANotification(this.t('misc.ai_error') + err.message, '', 'haca_error');
        }
      });
    });
  }

// ── ai_explain.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  AI EXPLAIN — explainWithAI (issue) · _showComplexityAI (scores)
  // ═══════════════════════════════════════════════════════════════════

  // Issue types that get a simple "suggest + editable field + apply" modal
  _SIMPLE_FIX_TYPES = new Set(['no_description', 'no_alias']);

  async explainWithAI(issue) {
    if (this._SIMPLE_FIX_TYPES.has(issue.type)) {
      return this._showSimpleFixModal(issue);
    }
    return this._showExplainModal(issue);
  }

  // ── Simple fix modal : spinner → editable suggestion → apply / manual / close ──
  async _showSimpleFixModal(issue) {
    const alias = this.escapeHtml(issue.alias || issue.entity_id || '');
    const card = this.createModal(`
      <div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;">
        <div class="loader"></div>
        <div style="margin-top:20px;font-size:17px;font-weight:500;">🤖 ${this.t('ai.analyzing')}</div>
        <div style="margin-top:8px;font-size:13px;color:var(--secondary-text-color);">${alias}</div>
      </div>
    `);

    try {
      const res = await this.hass.callWS({ type: 'haca/ai_suggest_fix', issue });
      const { field, suggestion, entity_id } = res;

      // Edit URL for "manual" button
      const state  = this.hass.states[entity_id] || {};
      const itemId = state.attributes?.id;
      const domain = entity_id.split('.')[0];
      const editUrl = itemId ? `/config/${domain}/edit/${itemId}` : null;

      const fieldLabel = field === 'description' ? this.t('misc.description')
                                                  : this.t('misc.alias');

      card._updateContent(`
        <div style="display:flex;flex-direction:column;height:100%;max-height:85vh;">
          <!-- Header -->
          <div style="padding:20px 52px 16px 20px;border-bottom:1px solid var(--divider-color);flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${_icon("robot", 32)}
              <div>
                <div style="font-size:16px;font-weight:700;">${alias}</div>
                <div style="font-size:12px;color:var(--secondary-text-color);">${fieldLabel} — ${this.t('misc.ai_suggestion')}</div>
              </div>
            </div>
          </div>
          <!-- Body -->
          <div style="flex:1;overflow-y:auto;padding:20px;">
            <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:8px;">
              ${fieldLabel}
            </div>
            <textarea id="haca-fix-textarea"
              style="width:100%;min-height:90px;padding:12px;border:1px solid var(--divider-color);border-radius:10px;font-size:14px;line-height:1.6;background:var(--secondary-background-color);color:var(--primary-text-color);resize:vertical;font-family:inherit;box-sizing:border-box;"
            >${this.escapeHtml(suggestion)}</textarea>
          </div>
          <!-- Footer -->
          <div style="padding:14px 20px;border-top:1px solid var(--divider-color);display:flex;justify-content:flex-end;gap:10px;flex-shrink:0;background:var(--secondary-background-color);flex-wrap:wrap;">
            <button id="haca-fix-close"
              style="padding:9px 18px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);cursor:pointer;font-size:13px;">
              ${this.t('actions.close')}
            </button>
            ${editUrl ? `
            <a href="${editUrl}" target="_top" style="text-decoration:none;">
              <button style="padding:9px 18px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;">
                ${_icon('pencil', 14)} ${this.t('zombie.edit_manual')}
              </button>
            </a>` : ''}
            <button id="haca-fix-apply"
              style="padding:9px 20px;border-radius:8px;border:none;background:var(--primary-color);color:white;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
              ${_icon('check-circle-outline', 14)} ${this.t('misc.apply_ai')}
            </button>
          </div>
        </div>
      `);

      card.querySelector('#haca-fix-close').addEventListener('click', () => card.closest('.haca-modal').remove());

      card.querySelector('#haca-fix-apply').addEventListener('click', async () => {
        const btn   = card.querySelector('#haca-fix-apply');
        const value = card.querySelector('#haca-fix-textarea').value.trim();
        if (!value) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="btn-loader"></span> ${this.t('fix.applying')}`;

        try {
          await this.hass.callWS({
            type: 'haca/apply_field_fix',
            entity_id,
            field,
            value,
            alias: issue.alias || '',
          });
          card._updateContent(`
            <div style="padding:48px 32px;text-align:center;">
              <div style="font-size:52px;margin-bottom:16px;">✅</div>
              <h2 style="margin-bottom:10px;">${this.t('misc.applied')}</h2>
              <p style="color:var(--secondary-text-color);">${fieldLabel} mis à jour avec succès.</p>
              <button onclick="this.closest('.haca-modal').remove()"
                style="margin-top:20px;background:var(--primary-color);color:white;padding:10px 28px;border-radius:10px;border:none;cursor:pointer;font-size:14px;">
                ${this.t('actions.close')}
              </button>
            </div>
          `);
          setTimeout(() => this.scanAutomations?.(), 1500);
        } catch(err) {
          btn.disabled = false;
          btn.innerHTML = `${_icon('check-circle-outline', 14)} ${this.t('misc.apply_ai')}`;
          this.showHANotification(`❌ ${err.message}`, '', 'haca_error');
        }
      });

    } catch(err) {
      card._updateContent(`
        <div style="padding:32px;text-align:center;color:var(--error-color);">
          <div style="font-size:40px;margin-bottom:12px;">❌</div>
          <div>${this.escapeHtml(err.message || 'Erreur inconnue')}</div>
          <button onclick="this.closest('.haca-modal').remove()"
            style="margin-top:16px;background:var(--primary-color);color:white;padding:8px 20px;border-radius:8px;border:none;cursor:pointer;">
            ${this.t('actions.close')}
          </button>
        </div>
      `);
    }
  }

  // ── Explain modal : affiche une explication de l'issue (pas de champ éditable) ──
  async _showExplainModal(issue) {
    const card = this.createModal(`
        <div style="padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center;">
            <div class="loader"></div>
            <div style="margin-top: 20px; font-size: 18px; font-weight: 500; color: var(--primary-text-color);">🤖 ${this.t('ai.analyzing')}</div>
            <div style="margin-top: 8px; font-size: 14px; color: var(--secondary-text-color);">${this.t('seconds')}</div>
        </div>
    `);

    try {
      const response = await this.hass.callWS({
        type: 'haca/explain_issue',
        issue,
      });
      const explanation = response?.explanation || this.t('ai.no_explanation');

      card._updateContent(`
        <div style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--divider-color); padding-bottom: 16px;">
                ${_icon("robot", 48)}
                <div>
                    <h2 style="margin: 0;">${this.t('modals.ai_analysis')}</h2>
                    <div style="font-size: 14px; opacity: 0.7;">${this.escapeHtml(issue.alias || issue.entity_id)}</div>
                </div>
            </div>
            <div style="background: var(--secondary-background-color); padding: 20px; border-radius: 12px; line-height: 1.6; font-size: 15px; color: var(--primary-text-color); white-space: pre-wrap;">${this.escapeHtml(explanation)}</div>
        </div>
      `);
    } catch (error) {
      card._updateContent(`<div style="padding: 24px; color: var(--error-color);">❌ ${error.message}</div>`);
      setTimeout(() => card.closest('.haca-modal')?.remove(), 4000);
    }
  }


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
        s >= 50 ? ['#ef5350', this.t('complexity.level_god')]     :
        s >= 30 ? ['#ffa726', this.t('complexity.level_complex')] :
        s >= 15 ? ['#ffd54f', this.t('complexity.level_medium')]  :
                  ['#66bb6a', this.t('complexity.level_simple')];

      modal._updateContent(`
        <div style="display:flex;flex-direction:column;height:100%;max-height:90vh;">

          <!-- Header -->
          <div style="padding:20px 60px 20px 24px;border-bottom:1px solid var(--divider-color);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${_icon("robot", 36)}
              <div>
                <div style="font-size:18px;font-weight:700;">${this.escapeHtml(row.alias)}</div>
                <div style="font-size:12px;color:var(--secondary-text-color);">${this.escapeHtml(row.entity_id)}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;margin-right:8px;">
              <span style="font-size:22px;font-weight:800;color:${scoreColor};">${row.score}</span>
              <span style="font-size:12px;padding:3px 10px;border-radius:8px;background:var(--secondary-background-color);font-weight:600;">${levelText}</span>
            </div>
          </div>

          <!-- Score breakdown pills -->
          <div style="padding:12px 24px;border-bottom:1px solid var(--divider-color);display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0;background:var(--secondary-background-color);">
            ${row.triggers  !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">${this.t('ai_explain.triggers_label', {n: row.triggers})}</span>` : ''}
            ${row.conditions !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">${this.t('ai_explain.conditions_label', {n: row.conditions})}</span>` : ''}
            ${row.actions   !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">${this.t('ai_explain.actions_label', {n: row.actions})}</span>` : ''}
            ${row.templates !== undefined ? `<span style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;padding:2px 10px;font-size:12px;">${this.t('ai_explain.templates_label', {n: row.templates})}</span>` : ''}
          </div>

          <!-- Body -->
          <div style="flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:20px;">

            <!-- Explanation -->
            <div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);margin-bottom:8px;">
                ${_icon("lightbulb-outline", 14)} ${this.t('ai_explain.analysis_title')}
              </div>
              <div style="background:var(--secondary-background-color);padding:16px;border-radius:12px;line-height:1.7;font-size:14px;white-space:pre-wrap;border-left:4px solid var(--primary-color);">
                ${this.escapeHtml(explanation)}
              </div>
            </div>

            ${hasProposal ? `
            <!-- Refactoring proposal -->
            <div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);margin-bottom:8px;">
                ${_icon("magic-staff", 14)} ${this.t('ai_explain.refactoring_title')}
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
          <div style="padding:16px 24px;border-top:1px solid var(--divider-color);display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px;background:var(--secondary-background-color);flex-shrink:0;">
            ${this.getHAEditUrl(row.entity_id) ? `
              <a href="${this.getHAEditUrl(row.entity_id)}" target="_blank" style="text-decoration:none;">
                <button style="background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);padding:10px 22px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;">
                  ${_icon("pencil")} ${this.t('zombie.edit_manual')}
                </button>
              </a>` : ''}
            ${hasProposal ? `
            <button id="apply-split-btn" style="background:var(--primary-color);color:white;padding:10px 20px;border-radius:12px;box-shadow:0 4px 10px rgba(var(--rgb-primary-color,33,150,243),0.3);">
              ${_icon("check-circle-outline")} ${this.t('ai_explain.apply_btn')}
            </button>` : ''}
          </div>
        </div>
      `);

      // Apply button — write split_proposal to scripts.yaml (new scripts) + simplified automation
      if (hasProposal) {
        modal.querySelector('#apply-split-btn').addEventListener('click', async () => {
          const btn = modal.querySelector('#apply-split-btn');
          btn.disabled = true;
          btn.innerHTML = '<span class="btn-loader"></span> ' + this.t('ai_explain.applying');
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
                  ${this.t('ai_explain.close')}
                </button>
              </div>
            `);
            setTimeout(() => this.scanAutomations(), 1500);
          } catch(err) {
            btn.disabled = false;
            btn.innerHTML = _icon("check-circle-outline") + ' ' + this.t('ai_explain.apply_btn');
            this.showHANotification(this.t('misc.error_apply') + err.message, '', 'haca_error');
          }
        });
      }

    } catch(error) {
      modal._updateContent(`
        <div style="padding:32px;text-align:center;color:var(--error-color);">
          <div style="font-size:40px;margin-bottom:16px;">❌</div>
          <div style="font-size:15px;">${this.escapeHtml(error.message || this.t('misc.error_unknown'))}</div>
          <button onclick="this.closest('.haca-modal').remove()"
            style="margin-top:20px;background:var(--primary-color);color:white;padding:8px 20px;border-radius:8px;">
            ${this.t('ai_explain.close')}
          </button>
        </div>
      `);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════
  //  _buildActionPrompt(issue) → string|null
  //
  //  ALL text from this.t('diag_prompts.*') — zero hardcoded strings.
  //  The AI will: read → explain → show YAML diff → present menu → WAIT.
  //  Returns null for purely informational issues → fallback to explainWithAI.
  // ═══════════════════════════════════════════════════════════════════════
  _buildActionPrompt(issue) {
    const t   = issue.type       || '';
    const eid = issue.entity_id  || '';
    const a   = issue.alias      || eid;
    const ctx = issue.message
      ? `\n${this.t('diag_prompts.context_label')}: ${issue.message}` : '';
    const rec = issue.recommendation
      ? `\n${this.t('diag_prompts.rec_label')}: ${issue.recommendation}` : '';

    // ── diag() — YAML before/after diff ────────────────────────────────
    const diag = (readCmd, problemKey, hintKey = null) => {
      const problem  = this.t(`diag_prompts.problems.${problemKey}`, {eid, alias: a});
      const hintLine = hintKey
        ? `\n${this.t('diag_prompts.hint_prefix')} ${this.t(`diag_prompts.hints.${hintKey}`)}`
        : '';
      return [
        this.t('diag_prompts.marker'),
        `${this.t('diag_prompts.header', {alias: a, eid, problem})}${ctx}${rec}`,
        '',
        this.t('diag_prompts.read_with', {cmd: readCmd}) + hintLine,
        '',
        this.t('diag_prompts.then'),
        this.t('diag_prompts.step1_yaml'),
        this.t('diag_prompts.step2_yaml'),
        this.t('diag_prompts.step3'),
        '',
        this.t('diag_prompts.menu_title'),
        this.t('diag_prompts.choice_apply'),
        this.t('diag_prompts.choice_backup_apply'),
        this.t('diag_prompts.choice_manual'),
        this.t('diag_prompts.choice_cancel'),
      ].join('\n');
    };

    // ── diagAction() — delete/enable/rename, no YAML diff ──────────────
    const diagAction = (readCmd, problemKey, proposedKey, hintKey = null) => {
      const problem  = this.t(`diag_prompts.problems.${problemKey}`, {eid, alias: a});
      const proposed = this.t(`diag_prompts.proposed.${proposedKey}`);
      const hintLine = hintKey
        ? `\n${this.t('diag_prompts.hint_prefix')} ${this.t(`diag_prompts.hints.${hintKey}`)}`
        : '';
      return [
        this.t('diag_prompts.marker'),
        `${this.t('diag_prompts.header', {alias: a, eid, problem})}${ctx}${rec}`,
        '',
        this.t('diag_prompts.read_with', {cmd: readCmd}) + hintLine,
        '',
        this.t('diag_prompts.then'),
        this.t('diag_prompts.step1_action'),
        this.t('diag_prompts.step2_action', {proposed}),
        this.t('diag_prompts.step3'),
        '',
        this.t('diag_prompts.menu_title'),
        this.t('diag_prompts.choice_proceed'),
        this.t('diag_prompts.choice_backup_proceed'),
        this.t('diag_prompts.choice_manual'),
        this.t('diag_prompts.choice_cancel'),
      ].join('\n');
    };

    // ── AUTOMATIONS ────────────────────────────────────────────────────
    if (t === 'no_alias')
      return diag(`haca_get_automation("${eid}")`, 'no_alias', 'no_alias');
    if (t === 'no_description')
      return diag(`haca_get_automation("${eid}")`, 'no_description', 'no_description');
    if (t === 'never_triggered' || t === 'ghost_automation')
      return diagAction(`haca_get_automation("${eid}")`, 'never_triggered', 'never_triggered');
    if (t === 'duplicate_automation' || t === 'probable_duplicate_automation')
      return diagAction(`haca_get_automation("${eid}")`, 'duplicate', 'duplicate');
    if (t === 'device_id_in_trigger' || t === 'device_id_in_action' ||
        t === 'device_id_in_condition' || t === 'device_id_in_target')
      return diag(`haca_get_automation("${eid}")`, 'device_id', 'device_id');
    if (t === 'device_trigger_platform' || t === 'device_condition_platform')
      return diag(`haca_get_automation("${eid}")`, 'device_platform', 'device_platform');
    if (t === 'deprecated_service')
      return diag(`haca_get_automation("${eid}")`, 'deprecated_service', 'deprecated_service');
    if (t === 'unknown_service')
      return diag(`haca_get_automation("${eid}")`, 'unknown_service', 'unknown_service');
    if (t === 'unknown_area_reference')
      return diag(`haca_get_automation("${eid}")`, 'unknown_area', 'unknown_area');
    if (t === 'unknown_label_reference')
      return diag(`haca_get_automation("${eid}")`, 'unknown_label', 'unknown_label');
    if (t === 'incorrect_mode_motion_single')
      return diag(`haca_get_automation("${eid}")`, 'mode_motion_single', 'mode_motion_single');
    if (t === 'template_simple_state' || t === 'template_numeric_comparison' ||
        t === 'template_time_check')
      return diag(`haca_get_automation("${eid}")`, 'template_simple', 'template_simple');
    if (t === 'wait_template_vs_wait_for_trigger')
      return diag(`haca_get_automation("${eid}")`, 'wait_template', 'wait_template');
    if (t === 'excessive_delay')
      return diag(`haca_get_automation("${eid}")`, 'excessive_delay', 'excessive_delay');
    if (t === 'script_blueprint_candidate' || t === 'blueprint_candidate')
      return diagAction(`haca_get_automation("${eid}")`, 'blueprint_candidate', 'blueprint_candidate', 'blueprint_candidate');
    if (t === 'blueprint_missing_path' || t === 'blueprint_file_not_found')
      return diagAction(`haca_get_automation("${eid}")`, 'blueprint_missing', 'blueprint_missing');
    if (t === 'blueprint_no_inputs' || t === 'blueprint_empty_input')
      return diag(`haca_get_automation("${eid}")`, 'blueprint_inputs', 'blueprint_inputs');

    // ── SCRIPTS ────────────────────────────────────────────────────────
    if (t === 'empty_script')
      return diagAction(`ha_get_script("${eid}")`, 'empty_script', 'empty_script');
    if (t === 'script_orphan')
      return diagAction(`ha_get_script("${eid}")`, 'script_orphan', 'script_orphan', 'helper_unused');
    if (t === 'script_cycle')
      return diag(`ha_get_script("${eid}")`, 'script_cycle', 'script_cycle');
    if (t === 'script_call_depth')
      return diag(`ha_get_script("${eid}")`, 'script_depth', 'script_depth');
    if (t === 'script_single_mode_loop')
      return diag(`ha_get_script("${eid}")`, 'script_single_mode', 'script_single_mode');

    // ── SCENES ─────────────────────────────────────────────────────────
    if (t === 'empty_scene')
      return diagAction(`ha_get_scene("${eid}")`, 'empty_scene', 'empty_scene');
    if (t === 'scene_duplicate')
      return diagAction(`ha_get_scene("${eid}")`, 'scene_duplicate', 'scene_duplicate');
    if (t === 'scene_entity_unavailable')
      return diag(`ha_get_scene("${eid}")`, 'scene_unavailable', 'scene_unavailable');
    if (t === 'scene_not_triggered')
      return diagAction(`ha_get_scene("${eid}")`, 'scene_not_triggered', 'scene_not_triggered');

    // ── ENTITIES ───────────────────────────────────────────────────────
    if (t === 'zombie_entity' || t === 'ghost_registry_entry')
      return diagAction(`ha_get_entity_detail("${eid}")`, 'zombie_entity', 'zombie_entity', 'zombie_entity');
    if (t === 'disabled_but_referenced')
      return diagAction(`ha_get_entity_detail("${eid}")`, 'disabled_referenced', 'disabled_referenced');
    if (t === 'broken_device_reference')
      return diagAction(`ha_get_entity_detail("${eid}")`, 'broken_device', 'broken_device');

    // ── HELPERS ────────────────────────────────────────────────────────
    if (t === 'helper_unused' || t === 'unused_input_boolean')
      return diagAction(`ha_get_helper("${eid}")`, 'helper_unused', 'helper_unused', 'helper_unused');
    if (t === 'helper_orphaned_disabled_only')
      return diagAction(`ha_get_helper("${eid}")`, 'helper_disabled_only', 'helper_disabled_only');
    if (t === 'helper_no_friendly_name')
      return diag(`ha_get_helper("${eid}")`, 'helper_no_name', 'helper_no_name');
    if (t === 'input_number_invalid_range')
      return diag(`ha_get_helper("${eid}")`, 'input_number_range', 'input_number_range');
    if (t === 'input_select_duplicate_options')
      return diag(`ha_get_helper("${eid}")`, 'input_select_duplicate', 'input_select_duplicate');
    if (t === 'input_select_empty_option')
      return diag(`ha_get_helper("${eid}")`, 'input_select_empty', 'input_select_empty');
    if (t === 'input_text_invalid_pattern')
      return diag(`ha_get_helper("${eid}")`, 'input_text_pattern', 'input_text_pattern');
    if (t === 'timer_zero_duration')
      return diag(`ha_get_helper("${eid}")`, 'timer_zero', 'timer_zero');
    if (t === 'timer_orphaned')
      return diagAction(`ha_get_helper("${eid}")`, 'timer_orphaned', 'timer_orphaned');
    if (t === 'timer_never_started')
      return diagAction(`ha_get_helper("${eid}")`, 'timer_never_started', 'timer_never_started');

    // ── DASHBOARDS ─────────────────────────────────────────────────────
    if (t === 'dashboard_missing_entity')
      return diag(`ha_get_lovelace()`, 'dashboard_missing', 'dashboard_missing');

    // ── SECURITY ───────────────────────────────────────────────────────
    if (t === 'hardcoded_secret' || t === 'sensitive_data_exposure')
      return diag(`ha_get_config_file("configuration.yaml")`, 'hardcoded_secret', 'hardcoded_secret');

    // ── PERFORMANCE ────────────────────────────────────────────────────
    if (t === 'missing_state_class')
      return diag(`ha_get_config_file("configuration.yaml")`, 'missing_state_class', 'missing_state_class');
    if (t === 'template_sensor_no_metadata')
      return diag(`ha_get_config_file("configuration.yaml")`, 'template_no_metadata', 'template_no_metadata');
    if (t === 'template_no_unavailable_check' || t === 'template_missing_availability')
      return diag(`haca_get_automation("${eid}")`, 'template_no_unavail', 'template_no_unavail');
    if (t === 'template_now_without_trigger')
      return diag(`haca_get_automation("${eid}")`, 'template_now_trigger', 'template_now_trigger');
    if (t === 'template_sensor_cycle')
      return diag(`ha_get_config_file("configuration.yaml")`, 'template_cycle', 'template_cycle');

    // ── GROUPS ─────────────────────────────────────────────────────────
    if (t === 'group_empty' || t === 'group_all_unavailable')
      return diagAction(`ha_get_config_file("groups.yaml")`, 'group_empty', 'group_empty');
    if (t === 'group_missing_entities')
      return diag(`ha_get_config_file("groups.yaml")`, 'group_missing', 'group_missing');
    if (t === 'group_nested_deep')
      return diag(`ha_get_config_file("groups.yaml")`, 'group_nested', 'group_nested');

    // ── ZONES ──────────────────────────────────────────────────────────
    if (t === 'zone_no_entity')
      return diagAction(`ha_get_entities(domain="person")`, 'zone_no_entity', 'zone_no_entity');
    if (t === 'unknown_floor_reference')
      return diag(`haca_get_automation("${eid}")`, 'unknown_floor', 'unknown_floor');

    // ── COMPLIANCE ─────────────────────────────────────────────────────
    if (t === 'compliance_entity_no_name')
      return diag(`ha_get_entity_detail("${eid}")`, 'compliance_no_name', 'compliance_no_name');
    if (t === 'compliance_automation_no_unique_id')
      return diag(`haca_get_automation("${eid}")`, 'compliance_no_uid', 'compliance_no_uid');

    // ── AREA COMPLEXITY (v1.5) ─────────────────────────────────────────
    if (t === 'area_high_complexity' || t === 'area_split_suggested')
      return diagAction(`ha_get_entities(area="${eid}")`, 'area_high', 'area_high', 'area_high');
    if (t === 'area_merge_suggested')
      return diagAction(`ha_get_entities(area="${eid}")`, 'area_merge', 'area_merge', 'area_merge');

    // ── REDUNDANCY (v1.5) ──────────────────────────────────────────────
    if (t === 'redundancy_overlap')
      return diag(`haca_get_automation("${eid}")`, 'redundancy_overlap', 'redundancy_overlap');
    if (t === 'redundancy_blueprint_candidate')
      return diagAction(`haca_get_automation("${eid}")`, 'redundancy_blueprint', 'redundancy_blueprint', 'blueprint_candidate');
    if (t === 'redundancy_native_ha')
      return diag(`haca_get_automation("${eid}")`, 'redundancy_native', 'redundancy_native');

    // null → purely informational → fallback to explainWithAI
    // (unavailable_entity, unknown_state, high_complexity_actions, etc.)
    return null;
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
    catch(e) { return; }

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

    const editUrl    = this.getHAEditUrl(node.id);
    const haStateUrl = `/developer-tools/state`;

    // ── Build relationship maps from raw graph data ───────────────────────
    // IMPORTANT: D3 mute les edges pendant la simulation — source/target
    // deviennent des objets nœuds, pas des strings. On normalise avec ?.id ?? e.source.
    const edges     = (this._graphRawData?.edges  || []);
    const nodeIndex = Object.fromEntries((this._graphRawData?.nodes || []).map(n => [n.id, n]));

    const _edgeSrc = e => (typeof e.source === 'object' ? e.source?.id : e.source) ?? '';
    const _edgeTgt = e => (typeof e.target === 'object' ? e.target?.id : e.target) ?? '';

    // "Uses" = edges where this node is the source
    const uses = edges
      .filter(e => _edgeSrc(e) === node.id)
      .map(e => ({ node: nodeIndex[_edgeTgt(e)], rel: e.rel, id: _edgeTgt(e) }))
      .filter(e => e.node);

    // "Used by" = edges where this node is the target
    const usedBy = edges
      .filter(e => _edgeTgt(e) === node.id)
      .map(e => ({ node: nodeIndex[_edgeSrc(e)], rel: e.rel, id: _edgeSrc(e) }))
      .filter(e => e.node);

    const relColor = { automation:'#7b68ee', script:'#20b2aa', scene:'#ffa500',
                       entity:'#6dbf6d', blueprint:'#e8a838', device:'#a0a0b0' };

    const _relItem = (entry) => {
      const n   = entry.node;
      const col = relColor[n.type] || '#888';
      const lbl = this.escapeHtml(n.label || n.id);
      const eid = this.escapeHtml(n.id);
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:var(--secondary-background-color);margin-bottom:4px;cursor:pointer;"
                   data-node-id="${eid}" class="graph-rel-item">
        <span style="width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0;"></span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${eid}">${lbl}</div>
          <div style="font-size:10px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${eid}</div>
        </div>
        <span style="font-size:10px;background:${col}22;color:${col};border-radius:4px;padding:1px 5px;flex-shrink:0;">${n.type}</span>
      </div>`;
    };

    const _relSection = (label, items, icon) => {
      if (!items.length) return '';
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:6px;display:flex;align-items:center;gap:4px;">
            ${_icon(icon, 12)} ${label} <span style="margin-left:4px;background:var(--secondary-background-color);border-radius:10px;padding:1px 7px;font-size:10px;color:var(--primary-text-color);">${items.length}</span>
          </div>
          ${items.map(_relItem).join('')}
        </div>`;
    };

    // ── Issues ────────────────────────────────────────────────────────────
    const issueRows = (node.issue_summary || []).map(iss => {
      const sCol = iss.severity === 'high' ? '#ef5350' : iss.severity === 'medium' ? '#ffa726' : '#ffd54f';
      return `<div style="padding:8px;border-radius:8px;background:var(--secondary-background-color);margin-bottom:6px;border-left:3px solid ${sCol};">
        <div style="font-size:11px;font-weight:700;color:${sCol};text-transform:uppercase;">${iss.severity}</div>
        <div style="font-size:12px;margin-top:2px;line-height:1.4;">${this.escapeHtml(iss.message)}</div>
      </div>`;
    }).join('');

    body.innerHTML = `
      <!-- Type badge + degree -->
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <span style="background:${this._graphNodeColor(node)};color:white;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;">
          ${typeLabels[node.type] || node.type}
        </span>
        <span style="font-size:12px;color:var(--secondary-text-color);">${node.degree} connexion${node.degree !== 1 ? 's' : ''}</span>
      </div>
      <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:14px;word-break:break-all;">${this.escapeHtml(node.id)}</div>

      <!-- Issues -->
      ${node.issue_count > 0 ? `
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:6px;">
          ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}
        </div>
        ${issueRows}
      ` : `<div style="font-size:13px;color:#66bb6a;margin-bottom:14px;">${this.t('graph.no_issues')}</div>`}

      <!-- Relationships -->
      ${_relSection(this.t('graph.used_by'), usedBy, 'arrow-left-circle-outline')}
      ${_relSection(this.t('graph.uses'), uses, 'arrow-right-circle-outline')}

      ${!usedBy.length && !uses.length ? `
        <div style="padding:12px;background:var(--secondary-background-color);border-radius:8px;font-size:12px;color:var(--secondary-text-color);text-align:center;margin-bottom:14px;">
          ${_icon('link-off', 14)} ${this.t('graph.orphan')}
        </div>` : ''}

      <!-- Actions -->
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
        ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--primary-color);color:white;border-radius:8px;padding:8px;border:none;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${_icon("pencil", 14)} Modifier dans HA
          </button>
        </a>` : ''}
        ${node.type === 'entity' ? `<a href="${haStateUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${_icon("eye", 14)} ${this.t('graph.view_state')}
          </button>
        </a>` : ''}
        <button id="sidebar-export-csv"
          style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
          ${_icon("file-delimited-outline", 14)} ${this.t('graph.export_node_csv')}
        </button>
        <button id="sidebar-export-md"
          style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
          ${_icon("language-markdown-outline", 14)} ${this.t('graph.export_node_md')}
        </button>
      </div>`;

    sb.style.display = 'block';

    // Sauvegarder les données du nœud courant dans le sidebar lui-même.
    // Si _graphStopAll() est appelé (disconnect, refresh), _graphRawData devient null
    // mais les données déjà capturées restent disponibles via sb._hacaNodeData.
    sb._hacaNodeData = { node, usedBy, uses,
      allNodes: (this._graphRawData?.nodes || []) };

    // Click on a relation item → navigate to that node in the sidebar
    body.querySelectorAll('.graph-rel-item').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.dataset.nodeId;
        // Prefer live data, fallback to saved snapshot
        const nodeList = this._graphRawData?.nodes || sb._hacaNodeData?.allNodes || [];
        const targetNode = nodeList.find(n => n.id === targetId);
        if (targetNode) this._graphShowSidebar(targetNode);
      });
    });

    // Export CSV — données capturées en closure, indépendantes de _graphRawData
    body.querySelector('#sidebar-export-csv')?.addEventListener('click', () => {
      this._graphExportNodeCSV(node, usedBy, uses);
    });
    // Export MD — idem
    body.querySelector('#sidebar-export-md')?.addEventListener('click', () => {
      this._graphExportNodeMD(node, usedBy, uses);
    });
  }

  // ── Export CSV: relations for one node ───────────────────────────────────
  _graphExportNodeCSV(node, usedBy, uses) {
    const rows = [['entity_id', 'label', 'type', 'relationship', 'direction']];
    usedBy.forEach(e => rows.push([e.id, e.node.label || e.id, e.node.type, e.rel, 'used_by']));
    uses.forEach(e   => rows.push([e.id, e.node.label || e.id, e.node.type, e.rel, 'uses']));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const slug = (node.label || node.id).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    this._downloadText(csv, `haca-relations-${slug}.csv`, 'text/csv');
  }

  // ── Export MD: relations for one node ────────────────────────────────────
  _graphExportNodeMD(node, usedBy, uses) {
    const typeLabel = this.t(`graph.legend_${node.type}`) || node.type;
    const slug = (node.label || node.id).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');

    let md = `# ${node.label || node.id}\n`;
    md += `\`${node.id}\` · ${typeLabel} · ${node.degree} ${this.t('graph.connections') || 'connections'}\n`;
    if (node.issue_count > 0) md += `⚠️ ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}\n`;
    md += '\n';

    if (usedBy.length) {
      md += `## ← ${this.t('graph.used_by')} (${usedBy.length})\n\n`;
      usedBy.forEach(e => {
        const tl = this.t(`graph.legend_${e.node.type}`) || e.node.type;
        md += `- ${e.node.label || e.id}  \`${e.id}\`  *(${tl})*\n`;
      });
      md += '\n';
    }

    if (uses.length) {
      md += `## → ${this.t('graph.uses')} (${uses.length})\n\n`;
      uses.forEach(e => {
        const tl = this.t(`graph.legend_${e.node.type}`) || e.node.type;
        md += `- ${e.node.label || e.id}  \`${e.id}\`  *(${tl})*\n`;
      });
      md += '\n';
    }

    if (!usedBy.length && !uses.length) {
      md += `> ${this.t('graph.orphan')}\n\n`;
    }

    md += `---\n*HACA — ${date}*\n`;
    this._downloadText(md, `haca-${slug}.md`, 'text/markdown');
  }

  // ── Export CSV: ALL relationships in the graph ────────────────────────────
  _graphExportRelationshipsCSV() {
    if (!this._graphRawData) return;
    const { nodes, edges } = this._graphRawData;
    const nodeIndex = Object.fromEntries(nodes.map(n => [n.id, n]));
    const _src = e => (typeof e.source === 'object' ? e.source?.id : e.source) ?? '';
    const _tgt = e => (typeof e.target === 'object' ? e.target?.id : e.target) ?? '';

    const rows = [['source_id', 'source_label', 'source_type', 'relationship', 'target_id', 'target_label', 'target_type']];
    edges.forEach(e => {
      const sid = _src(e); const tid = _tgt(e);
      const s = nodeIndex[sid] || { label: sid, type: '' };
      const t = nodeIndex[tid] || { label: tid, type: '' };
      rows.push([sid, s.label || sid, s.type, e.rel, tid, t.label || tid, t.type]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    this._downloadText(csv, `haca-relations-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
  }

  // ── Export MD: ALL relationships in the graph ─────────────────────────────
  _graphExportRelationshipsMD() {
    if (!this._graphRawData) return;
    const { nodes, edges } = this._graphRawData;
    const nodeIndex = Object.fromEntries(nodes.map(n => [n.id, n]));
    const _src = e => (typeof e.source === 'object' ? e.source?.id : e.source) ?? '';
    const _tgt = e => (typeof e.target === 'object' ? e.target?.id : e.target) ?? '';

    // Index: node → qui l'utilise / ce qu'il utilise
    const byTarget = {};
    const bySource = {};
    edges.forEach(e => {
      const sid = _src(e); const tid = _tgt(e);
      if (!byTarget[tid]) byTarget[tid] = [];
      byTarget[tid].push(sid);
      if (!bySource[sid]) bySource[sid] = [];
      bySource[sid].push(tid);
    });

    const date = new Date().toISOString().slice(0, 10);
    const order = { automation:0, script:1, scene:2, blueprint:3, entity:4, device:5 };
    const sorted = [...nodes].sort((a, b) =>
      (order[a.type] ?? 9) - (order[b.type] ?? 9) || (a.label || a.id).localeCompare(b.label || b.id)
    );

    let md = `# ${this.t('graph.title') || 'Dependency Graph'}\n`;
    md += `${date} · ${nodes.length} ${this.t('graph.md_nodes') || 'nodes'} · ${edges.length} ${this.t('graph.md_edges') || 'connections'}\n\n`;

    // Group by type for readability
    const typeOrder = ['automation', 'script', 'scene', 'blueprint', 'entity', 'device'];
    for (const type of typeOrder) {
      const group = sorted.filter(n => n.type === type);
      if (!group.length) continue;

      const typeLabel = this.t(`graph.legend_${type}`) || type;
      md += `---\n\n## ${typeLabel} (${group.length})\n\n`;

      for (const node of group) {
        const usedByIds = byTarget[node.id] || [];
        const usesIds   = bySource[node.id] || [];

        md += `### ${node.label || node.id}\n`;
        md += `\`${node.id}\``;
        if (node.issue_count > 0) md += ` · ⚠️ ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}`;
        md += '\n\n';

        if (usedByIds.length) {
          md += `**← ${this.t('graph.used_by')}**\n`;
          usedByIds.forEach(sid => {
            const s = nodeIndex[sid];
            md += `- ${s?.label || sid}  \`${sid}\`\n`;
          });
          md += '\n';
        }
        if (usesIds.length) {
          md += `**→ ${this.t('graph.uses')}**\n`;
          usesIds.forEach(tid => {
            const t = nodeIndex[tid];
            md += `- ${t?.label || tid}  \`${tid}\`\n`;
          });
          md += '\n';
        }
        if (!usedByIds.length && !usesIds.length) {
          md += `*${this.t('graph.orphan')}*\n\n`;
        }
      }
    }

    md += `---\n*HACA*\n`;
    this._downloadText(md, `haca-report-${date}.md`, 'text/markdown');
  }

  _downloadText(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      this._graphExportSVG();
    };
    img.src = svgB64;
  }

// ── utils.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  UTILS — createModal · showToastNotification · escapeHtml
  // ═══════════════════════════════════════════════════════════════════

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
        background: rgba(0,0,0,0.5); z-index: 9999;
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
    closeBtn.innerHTML = _icon("close", 18);
    closeBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
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
          ${_icon(icon.replace("mdi:", ""), 24)}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 16px;">${title}</div>
          <div style="font-size: 12px; opacity: 0.7;">${message}</div>
        </div>
        <button class="close-toast" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 6px; border-radius: 8px; cursor: pointer;">
          ${_icon("close", 18)}
        </button>
      </div>
      ${actionButton ? `
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 11px; opacity: 0.6; display: flex; align-items: center; gap: 4px;">
            ${_icon("shield-check-outline", 14)}
            ${this.t('notifications.reported_by')}
          </div>
          ${actionButton}
        </div>
      ` : `
        <div style="font-size: 11px; opacity: 0.6; display: flex; align-items: center; gap: 4px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          ${_icon("shield-check-outline", 14)}
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

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


// ── scan.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  SCAN — scanAll · scanAutomations · scanEntities
  // ═══════════════════════════════════════════════════════════════════

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
    const originalContent = `${_icon("magnify-scan")} ${this.t('buttons.scan_all')}`;
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
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _cleanup();
    }
  }

  async scanAutomations() {
    if (this._scanAutoInProgress) return;
    this._scanAutoInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-auto');
    const originalContent = `${_icon("robot")} ${this.t('buttons.automations')}`;
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
    const originalContent = `${_icon("lightning-bolt")} ${this.t('buttons.entities')}`;
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


// ── fixes.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  FIXES — preview · apply · diff · zombie · description AI
  // ═══════════════════════════════════════════════════════════════════

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
                ${_icon("alert-circle", 48)}
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
                    ${_icon("lightbulb-outline")}
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
                ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration: none;"><button class="edit-btn" style="background: var(--primary-color); color: white;">${_icon("pencil")} ${this.t('modals.open_editor')}</button></a>` : ''}
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
            ${_icon("lightbulb-on-outline", 18)}
            ${this.t('zombie.similar_detected')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${suggestions.map(s => `
              <button class="suggestion-btn" data-value="${s}"
                style="background:var(--secondary-background-color);color:var(--primary-text-color);
                       border:1px solid var(--primary-color);border-radius:8px;padding:6px 14px;
                       font-size:13px;cursor:pointer;">
                ${_icon("swap-horizontal", 14)} ${s}
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
          ${_icon("ghost-outline", 42)}
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
          ${_icon("shield-check-outline", 15)}
          ${this.t('zombie.auto_backup_info')}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div id="zombie-editor-btn"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
            <button class="close-btn" style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">${this.t('actions.cancel')}</button>
            <button id="apply-zombie-single-btn" style="background:var(--primary-color);color:white;font-weight:600;" ${automationIds.length <= 1 ? 'style="display:none"' : ''}>
              ${_icon("magic-staff")} ${this.t('zombie.fix_this')}
            </button>
            <button id="apply-zombie-btn" style="background:var(--error-color);color:white;font-weight:600;" ${automationIds.length <= 1 ? '' : ''}>
              ${_icon("magic-staff")} ${automationIds.length > 1 ? this.t('zombie.fix_all', {count: automationIds.length}) : this.t('modals.apply_correction')}
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
              ${_icon("pencil")} ${this.t('zombie.edit_manual')}
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
                    ${_icon("robot-confused-outline", 40)}
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
                ${_icon("magic-staff")} ${this.t('modals.correction_proposal')}
            </h2>
        </div>
        <div style="padding: 24px; flex: 1; overflow-y: auto; min-height: 0;">
            <div style="margin-bottom: 24px; background: rgba(var(--rgb-primary-color), 0.05); padding: 16px; border-radius: 12px; border-left: 4px solid var(--primary-color);">
                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    ${_icon("robot", 18)}
                    <strong>${this.t('modals.automation')}:</strong> <span style="font-weight: 500;">${result.alias}</span> (${result.automation_id})
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${_icon("alert-circle-outline", 18)}
                    <strong>${this.t('modals.problem')}:</strong> ${issue.message}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div>
                    <h3 style="margin-top:0; color: var(--error-color); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                        ${_icon("minus-box-outline")} ${this.t('modals.before')}
                    </h3>
                    <pre style="background: var(--secondary-background-color); padding: 16px; overflow: auto; border-radius: 12px; font-size: 12px; border: 1px solid var(--divider-color); max-height: 400px;">${this.escapeHtml(result.current_yaml)}</pre>
                </div>
                <div>
                    <h3 style="margin-top:0; color: var(--success-color, #4caf50); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                        ${_icon("plus-box-outline")} ${this.t('modals.after')}
                    </h3>
                    <pre style="background: var(--secondary-background-color); padding: 16px; overflow: auto; border-radius: 12px; font-size: 12px; border: 1px solid var(--divider-color); max-height: 400px; outline: 1px solid var(--success-color, #4caf50); outline-offset: -1px;">${this.highlightDiff(result.new_yaml, result.current_yaml)}</pre>
                </div>
            </div>
            
            <div style="background: var(--secondary-background-color); padding: 20px; border-radius: 12px; border: 1px solid var(--divider-color);">
                <div style="font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    ${_icon("playlist-check")}
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
                <button style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);" onclick="this.closest('.haca-modal').remove()">${_icon("close")} ${this.t('actions.cancel')}</button>
                <button id="apply-fix-btn" style="background: var(--primary-color); color: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(var(--rgb-primary-color), 0.3);">
                    ${_icon("check-circle-outline")} ${this.t('modals.apply_correction')}
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
            ${_icon("pencil")} ${this.t('zombie.edit_manual')}
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
                            ${_icon("zip-box-outline")}
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
        btn.innerHTML = `${_icon("check-circle-outline")} ${this.t('modals.apply_correction')}`;
      }
    } catch (e) {
      this.showHANotification('❌ ' + this.t('notifications.error'), e.message, 'haca_error');
      btn.disabled = false;
      btn.innerHTML = `${_icon("check-circle-outline")} ${this.t('modals.apply_correction')}`;
    }
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


// ── reports.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  REPORTS — generate · load · render · view · download · delete
  // ═══════════════════════════════════════════════════════════════════

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
      container.innerHTML = `<div class="empty-state">${this.escapeHtml(this.t('notifications.error'))}: ${this.escapeHtml(error.message)}</div>`;
    }
  }

  renderReports(reports) {
    const container = this.shadowRoot.querySelector('#reports-list');
    const PAG_ID = 'reports-list';
    const esc = (s) => this.escapeHtml(s);

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
            ${_icon("file-search-outline")}
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
              ${paged.map(s => {
                const isAgent = s.report_type === 'agent';
                const iconName = isAgent ? 'robot-happy-outline' : 'calendar-check';
                const iconBg   = isAgent ? 'var(--success-color,#4caf50)' : 'var(--primary-color)';
                const label    = isAgent
                  ? `<span style="font-size:10px;background:var(--success-color,#4caf50);color:white;border-radius:4px;padding:1px 6px;font-weight:700;margin-left:6px;">Agent</span>`
                  : '';
                return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                      <div style="background:${iconBg};color:white;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        ${_icon(iconName)}
                      </div>
                      <div>
                        <div style="font-weight:600;font-size:14px;white-space:nowrap;">${esc(new Date(s.created).toLocaleString())}${label}</div>
                        <div style="font-size:11px;color:var(--secondary-text-color);font-family:monospace;">ID: ${esc(s.session_id)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                      ${Object.entries(s.formats).map(([ext, info]) => `
                        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px;border:1px solid var(--divider-color);border-radius:10px;background:var(--secondary-background-color);flex-shrink:0;">
                          <span style="font-size:10px;font-weight:800;color:var(--primary-color);">${esc(ext.toUpperCase())}</span>
                          <div style="display:flex;gap:5px;">
                            <button class="view-report-btn" data-name="${esc(info.name)}" title="${this.t('actions.view')}" style="padding:5px;background:var(--card-background-color,var(--secondary-background-color));color:var(--primary-color);border:1px solid var(--divider-color);border-radius:7px;">
                              ${_icon("eye-outline", 16)}
                            </button>
                            <button class="dl-report-btn" data-name="${esc(info.name)}" title="${this.t('actions.download')}" style="padding:5px;background:white;color:var(--success-color,#4caf50);border:1px solid var(--divider-color);border-radius:7px;">
                              ${_icon("download-outline", 16)}
                            </button>
                          </div>
                          <span style="font-size:10px;color:var(--secondary-text-color);">${Math.round(info.size / 1024)} KB</span>
                        </div>
                      `).join('')}
                    </div>
                  </td>
                  <td>
                    <button class="delete-report-btn" data-session="${esc(s.session_id)}" style="padding:8px;background:var(--error-color,#ef5350);color:white;border:none;border-radius:8px;">
                      ${_icon("delete-outline", 18)}
                    </button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <!-- Mobile cards (paginés comme le tableau desktop) -->
        <div class="mobile-cards">
          ${paged.map(s => `
            <div class="m-card">
              <div class="m-card-title">
                ${_icon("calendar-check")}
                ${esc(new Date(s.created).toLocaleString())}
              </div>
              <div class="m-card-meta">ID: ${esc(s.session_id)}</div>
              <div class="fmt-pills">
                ${Object.entries(s.formats).map(([ext, info]) => `
                  <div class="fmt-pill">
                    <span class="fmt-pill-label">${esc(ext.toUpperCase())} · ${Math.round(info.size / 1024)} KB</span>
                    <div class="fmt-pill-btns">
                      <button class="view-report-btn" data-name="${esc(info.name)}" style="color:var(--primary-color);">
                        ${_icon("eye-outline", 16)}
                      </button>
                      <button class="dl-report-btn" data-name="${esc(info.name)}" style="color:var(--success-color,#4caf50);">
                        ${_icon("download-outline", 16)}
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="m-card-btns">
                <button class="delete-report-btn" data-session="${esc(s.session_id)}" style="background:var(--error-color,#ef5350);color:white;">
                  ${_icon("delete-outline")} ${this.t('actions.delete')}
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
      container.innerHTML = `<div class="empty-state">${this.escapeHtml(this.t('reports.error_display'))}: ${this.escapeHtml(err.message)}</div>`;
    }
  }

  async viewReport(name) {
    const esc = (s) => this.escapeHtml(s);
    if (name.endsWith('.pdf')) {
      const safeName = encodeURIComponent(name);
      const card = this.createModal('');
      // Enlarge modal for PDF to almost full screen
      card.style.width = '95%';
      card.style.height = '95%';
      card.style.maxWidth = '1600px';
      card.style.maxHeight = '95vh';

      card._updateContent(`
          <div style="padding: 16px 70px 16px 20px; border-bottom: 1px solid var(--divider-color); display: flex; justify-content: space-between; align-items: center; background: var(--secondary-background-color); gap: 12px; flex-wrap: wrap;">
              <h2 style="margin:0; font-size: 16px; display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                ${_icon("file-pdf-box")}
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(name)}</span>
              </h2>
              <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <a href="/haca_reports/${safeName}" target="_blank" style="text-decoration: none;">
                  <button style="background: var(--primary-color); color: white; padding: 8px 12px; font-size: 12px;">
                    ${_icon("fullscreen")} ${this.t('actions.fullscreen')}
                  </button>
                </a>
              </div>
          </div>
          <div style="flex: 1; height: 100%; background: #525659;">
              <iframe src="/haca_reports/${safeName}" style="width: 100%; height: 85vh; border: none;"></iframe>
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
                <h2 style="margin:0">${esc(name)}</h2>
            </div>
            <div style="padding: 16px; flex: 1; max-height: 60vh; overflow-y: auto; background: var(--secondary-background-color); font-family: monospace; white-space: pre-wrap; font-size: 13px;">
                ${esc(data.type === 'json' ? JSON.stringify(data.content, null, 2) : data.content)}
            </div>
        `);
      } else {
        card._updateContent(`<div style="padding:20px;color:red">${this.t('notifications.error')}: ${esc(data.error)}</div>`);
      }
    } catch (e) {
      card._updateContent(`<div style="padding:20px;color:red">${this.t('notifications.error')}: ${esc(e.message)}</div>`);
    }
  }

  async downloadReport(name) {
    const a = document.createElement('a');
    a.href = `/haca_reports/${encodeURIComponent(name)}`;
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


// ── issues.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  ISSUE RENDERING — renderIssues · getHAEditUrl · exportCSV
  // ═══════════════════════════════════════════════════════════════════

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
            ${_icon("check-decagram-outline")}
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

      // v1.2.0 — "Ouvrir l'entité" button
      // Logique inversée : on exclut les quelques domaines qui ont déjà un bouton dédié
      // (automation/script/scene → bouton "Éditer") ou qui ne sont pas de vraies entités HA.
      // Tous les autres domaines (stt, tts, weather, update, event, image, todo,
      // sensor, input_*, timer, switch, light, ...) ouvrent la fenêtre more-info.
      const DOMAINS_NO_MORE_INFO = new Set([
        'automation', 'script', 'scene',   // ont leur propre bouton "Éditer"
        'persistent_notification',          // pas une entité interactive
      ]);
      const entityDomain = i.entity_id ? i.entity_id.split('.')[0] : '';
      // Une entité HA valide a forcément un domaine (contient un point)
      const hasValidEntityId = i.entity_id && i.entity_id.includes('.');
      const isRealEntity = hasValidEntityId && !DOMAINS_NO_MORE_INFO.has(entityDomain);
      const isZombieEntity = i.type === 'zombie_entity';
      // v1.3.0 — blueprint candidate gets a special AI generate button
      const isBlueprintCandidate = i.type === 'script_blueprint_candidate';

      // Source file badge for automations with _source_file metadata (feature b)
      const sourceFile = i.source_file || '';
      const isNonStandardSource = sourceFile && sourceFile !== 'automations.yaml';

      return `
      <div class="issue-item ${i.severity}" style="${isSecurity ? 'border-left-color: var(--error-color, #ef5350);' : ''}">
        <div class="issue-main">
            <div class="issue-info">
                <div class="issue-header-row">
                    ${_icon((isSecurity ? 'shield-alert' : cardIcon.replace('mdi:', '')), 17)}
                    <div class="issue-title">${this.escapeHtml(i.alias || i.entity_id || '')}</div>
                    ${isNonStandardSource ? `<span title="${this.escapeHtml(sourceFile)}" style="margin-left:6px;font-size:10px;background:var(--info-color,#2196f3);color:white;border-radius:4px;padding:1px 6px;opacity:0.85;">${_icon('file-document-outline',10)} ${sourceFile.startsWith('packages/') ? 'pkg' : sourceFile.startsWith('.storage') ? 'UI' : 'incl'}</span>` : ''}
                </div>
                <div class="issue-entity">${this.escapeHtml(i.entity_id || '')}</div>
                ${i.type === 'zombie_entity' && (i.automation_names || i.source_name) ? `
                <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;display:flex;align-items:center;gap:4px;">
                    ${_icon("robot", 12)}
                    <span>${this.t('issues.in_automations')} ${this.escapeHtml((i.automation_names || [i.source_name]).slice(0,3).join(', '))}</span>
                </div>` : i.type === 'dashboard_missing_entity' ? `
                <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;display:flex;align-items:center;gap:4px;">
                    ${_icon("view-dashboard-outline", 12)}
                    <span>${this.escapeHtml(i.source_name || i.dashboard || '?')} &rsaquo; ${this.escapeHtml((i.locations || [i.location || '?']).slice(0,2).join(', '))}</span>
                </div>` : (i.location && i.location !== '—' ? `
                <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;display:flex;align-items:center;gap:4px;">
                    ${_icon("map-marker-outline", 12)}
                    <span>${this.escapeHtml(i.location)}</span>
                </div>` : '')}
            </div>
            <div class="issue-btns">
                ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration: none;"><button class="edit-ha-btn" style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);">${_icon("pencil")} ${this.t('actions.edit_ha')}</button></a>` : ''}
                ${dashboardUrl ? `<a href="${dashboardUrl}" target="_blank" style="text-decoration: none;"><button class="edit-ha-btn" style="background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);">${_icon("view-dashboard-edit-outline")} ${this.t('issues.open_dashboard')}</button></a>` : ''}
                ${isRealEntity && !isZombieEntity ? `<button class="open-entity-btn" data-idx="${idx}" title="${this.t('actions.open_entity')}" style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);">${_icon("open-in-new")} ${this.t('actions.open_entity')}</button>` : ''}
                ${isZombieEntity ? `<a href="/config/entities" target="_blank" style="text-decoration:none;"><button class="edit-ha-btn" style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);" title="${this.t('actions.view_entities_list')}">${_icon("format-list-bulleted")} ${this.t('actions.view_entities_list')}</button></a>` : ''}
                <button class="explain-btn" data-idx="${idx}" style="background: var(--accent-color, #03a9f4); color: white;">
                    ${_icon("robot")} ${this.t('actions.ai_explain')}
                </button>
                ${i.entity_id && i.entity_id.startsWith('automation.') && (() => {
                  const scores = this._lastData?.complexity_scores || [];
                  const row = scores.find(s => s.entity_id === i.entity_id);
                  return row && row.score >= 15;
                })() ? `
                <button class="optimize-btn" data-idx="${idx}"
                  title="${this.t('issues.complexity_score_title', {score: (this._lastData?.complexity_scores||[]).find(s=>s.entity_id===i.entity_id)?.score||0})}"
                  style="background:linear-gradient(135deg,#7b68ee,#a855f7);color:white;display:flex;align-items:center;gap:4px;">
                  ${_icon("auto-fix", 15)} ${this.t('issues.optimize')}
                </button>` : ''}
                ${isFixable ? `<button class="fix-btn" data-idx="${idx}">${_icon("magic-staff")} ${this.t('actions.fix')}</button>` : ''}
                ${isBlueprintCandidate ? `<button class="blueprint-ai-btn" data-idx="${idx}" style="background:linear-gradient(135deg,#0ea5e9,#6366f1);color:white;border:none;display:flex;align-items:center;gap:4px;" title="${this.t('actions.generate_blueprint')}">${_icon("robot", 15)} ${this.t('actions.generate_blueprint')}</button>` : ''}
            </div>
        </div>
        <div class="issue-message">${this.escapeHtml(i.message || '')}</div>
        ${(() => { const hk = 'issue_types.hints.' + (i.type || ''); const hv = this.t(hk); return (hv && hv !== hk) ? `<div style="font-size:11px;color:var(--secondary-text-color);margin-top:4px;font-style:italic;opacity:0.85;">${this.escapeHtml(hv)}</div>` : ''; })()}
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
                ${_icon("lightbulb-outline", 16)}
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
        const idx   = parseInt(e.currentTarget.dataset.idx, 10);
        const issue = container._renderedIssues[idx];
        if (!issue) return;
        const prompt = this._buildActionPrompt(issue);
        if (prompt) {
          this._openChatWithMessage(prompt);
        } else {
          this.explainWithAI(issue);
        }
      });
    });

    // v1.2.0 — Open entity in HA more-info dialog
    // The panel runs inside an embed_iframe → events must be dispatched on the
    // <home-assistant> element of the PARENT document, not on this iframe's shadow DOM.
    container.querySelectorAll('.open-entity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const issue = container._renderedIssues?.[idx];
        if (!issue?.entity_id) return;
        this._openMoreInfo(issue.entity_id);
      });
    });

    // v1.3.0 — Blueprint AI generation button
    container.querySelectorAll('.blueprint-ai-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const issue = container._renderedIssues?.[idx];
        if (!issue) return;
        const prompt = this._buildActionPrompt(issue);
        if (prompt) {
          this._openChatWithMessage(prompt);
        } else {
          this.explainWithAI(issue);
        }
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

// ── battery.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  BATTERY MONITOR — _renderBatteryTables · _applyBatteryFilter · _batRow
  // ═══════════════════════════════════════════════════════════════════

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
            ${_icon(s.icon.replace("mdi:", ""), 18)}
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

// ── battery_predict.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  BATTERY PREDICTION — _renderBatteryPredictions · _renderPredictChart
  // ═══════════════════════════════════════════════════════════════════

  async loadBatteryPredictions() {
    const container = this.shadowRoot.querySelector('#bat-predict-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">${_icon('loading', 20)} ${this.t('battery_predict.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_battery_predictions' });
      this._batteryPredictions = result.predictions || [];
      this._renderBatteryPredictions(this._batteryPredictions, result.alert_7d || 0);
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('battery_predict.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  async _exportBatteryCSV() {
    try {
      const result = await this._hass.callWS({ type: 'haca/export_battery_csv' });
      const csv = result.csv || '';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'haca_battery_history.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(this.t('battery_predict.export_error') + e.message);
    }
  }

  _renderBatteryPredictions(predictions, alert7d) {
    const container = this.shadowRoot.querySelector('#bat-predict-container');
    if (!container) return;

    if (!predictions || predictions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--secondary-text-color);">
          ${_icon('chart-timeline-variant', 32)}
          <div style="margin-top:8px;">${this.t('battery_predict.no_data')}</div>
          <div style="font-size:12px;margin-top:4px;opacity:0.7;">${this.t('battery_predict.no_data_hint')}</div>
        </div>`;
      return;
    }

    const alertOnes = predictions.filter(p => p.alert_7d);
    const normalOnes = predictions.filter(p => !p.alert_7d && p.days_to_critical !== null);
    const unknownOnes = predictions.filter(p => p.days_to_critical === null);

    // Banner if J-7 alerts exist
    const banner = alert7d > 0 ? `
      <div style="background:rgba(239,83,80,0.12);border:1px solid #ef5350;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">
        ${_icon('battery-alert', 22, '#ef5350')}
        <span style="color:#ef5350;font-weight:700;">
          ${this.t('battery_predict.alert_banner').replace('{count}', alert7d)}
        </span>
      </div>` : '';

    // Summary bar
    const summaryBar = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
        <div style="background:rgba(239,83,80,0.1);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#ef5350;letter-spacing:0.5px;">${this.t('battery_predict.stat_alert7d')}</div>
          <div style="font-size:24px;font-weight:800;color:#ef5350;">${alert7d}</div>
        </div>
        <div style="background:rgba(255,167,38,0.1);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#ffa726;letter-spacing:0.5px;">${this.t('battery_predict.stat_tracked')}</div>
          <div style="font-size:24px;font-weight:800;color:#ffa726;">${predictions.length}</div>
        </div>
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;display:flex;align-items:center;justify-content:flex-end;">
          <button id="bat-export-csv-btn" style="background:var(--primary-color);color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
            ${_icon('download', 16)} ${this.t('battery_predict.export_csv')}
          </button>
        </div>
      </div>`;

    // Predictions table
    const rows = [...alertOnes, ...normalOnes, ...unknownOnes].map(p => this._predRow(p)).join('');

    container.innerHTML = banner + summaryBar + `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid var(--divider-color);">
              <th style="text-align:left;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_device')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_current')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_slope')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_trend')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_predicted_date')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_days')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Wire CSV export button
    const csvBtn = container.querySelector('#bat-export-csv-btn');
    if (csvBtn) csvBtn.onclick = () => this._exportBatteryCSV();

    // Wire sparkline clicks
    container.querySelectorAll('[data-predict-sparkline]').forEach(el => {
      const eid = el.dataset.predictSparkline;
      const pred = predictions.find(p => p.entity_id === eid);
      if (pred) el.onclick = () => this._showPredictModal(pred);
    });
  }

  _predRow(p) {
    const alert7d  = p.alert_7d;
    const noData   = p.days_to_critical === null;
    const charging = p.slope_per_day > 0;

    const rowBg = alert7d ? 'background:rgba(239,83,80,0.05);' : '';

    let statusCell;
    if (noData || charging) {
      statusCell = `<span style="color:var(--secondary-text-color);font-size:12px;">—</span>`;
    } else if (alert7d) {
      statusCell = `<span style="background:rgba(239,83,80,0.15);color:#ef5350;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:700;">${this.t('battery_predict.urgent')}</span>`;
    } else {
      statusCell = `<span style="background:rgba(76,175,80,0.1);color:#4caf50;border-radius:6px;padding:2px 8px;font-size:12px;">${this.t('battery_predict.ok')}</span>`;
    }

    const slopeColor = p.slope_per_day < -2 ? '#ef5350' : p.slope_per_day < 0 ? '#ffa726' : '#4caf50';
    const slopeStr = noData ? '—' : `${p.slope_per_day > 0 ? '+' : ''}${p.slope_per_day}%/j`;

    const daysStr = noData ? '—'
      : p.days_to_critical === 0 ? '<span style="color:#ef5350;font-weight:700;">⚠ Maintenant</span>'
      : `${Math.ceil(p.days_to_critical)} j`;

    const dateStr = p.predicted_date ? p.predicted_date.slice(0, 10) : '—';

    // Mini sparkline
    const sparkHtml = this._miniSparkline(p.history_points || [], p.alert_7d, p.days_to_critical);

    return `<tr style="${rowBg}border-bottom:1px solid var(--divider-color);">
      <td style="padding:8px 10px;">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" title="${this.escapeHtml(p.friendly_name)}">${this.escapeHtml(p.friendly_name)}</div>
        <div style="font-size:11px;color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis;max-width:200px;">${this.escapeHtml(p.entity_id)}</div>
      </td>
      <td style="padding:8px 10px;text-align:center;font-weight:700;">${p.current_level}%</td>
      <td style="padding:8px 10px;text-align:center;font-weight:600;color:${slopeColor};">${slopeStr}</td>
      <td style="padding:8px 10px;text-align:center;cursor:pointer;" data-predict-sparkline="${this.escapeHtml(p.entity_id)}" title="${this.t('battery_predict.click_detail')}">
        ${sparkHtml}
      </td>
      <td style="padding:8px 10px;text-align:center;font-size:13px;">${dateStr}</td>
      <td style="padding:8px 10px;text-align:center;">${daysStr}</td>
    </tr>`;
  }

  _miniSparkline(points, alert7d, daysLeft) {
    if (!points || points.length < 2) return '<span style="color:var(--secondary-text-color);font-size:11px;">N/A</span>';
    const W = 80, H = 28, pad = 2;
    const xs = points.map(p => p.day);
    const ys = points.map(p => p.level);
    const minX = Math.min(...xs), maxX = Math.max(...xs) || 1;
    const minY = Math.max(0, Math.min(...ys) - 5), maxY = Math.min(100, Math.max(...ys) + 5);
    const rangeY = maxY - minY || 1;
    const toX = x => pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2);
    const toY = y => (H - pad) - ((y - minY) / rangeY) * (H - pad * 2);
    const lineColor = alert7d ? '#ef5350' : daysLeft === null ? '#4caf50' : '#ffa726';
    const pts = points.map(p => `${toX(p.day).toFixed(1)},${toY(p.level).toFixed(1)}`).join(' ');
    return `<svg width="${W}" height="${H}" style="overflow:visible;"><polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }

  _showPredictModal(pred) {
    const modal = this.shadowRoot.querySelector('#predict-detail-modal');
    if (!modal) return;

    const W = 400, H = 180, padL = 36, padR = 12, padT = 16, padB = 24;
    const points = pred.history_points || [];
    if (points.length < 2) { modal.style.display = 'none'; return; }

    const xs = points.map(p => p.day);
    const ys = points.map(p => p.level);
    const minX = Math.min(...xs), maxX = Math.max(...xs, 7);
    const minY = 0, maxY = 100;
    const toX = x => padL + ((x - minX) / (maxX - minX || 1)) * (W - padL - padR);
    const toY = y => padT + ((maxY - y) / (maxY - minY)) * (H - padT - padB);

    // Regression line projection
    const lastX = xs[xs.length - 1];
    const projEnd = pred.days_to_critical !== null ? Math.min(lastX + Math.ceil(pred.days_to_critical) + 3, lastX + 30) : lastX + 14;
    const intcpt = pred.current_level;
    const slope  = pred.slope_per_day;

    const lineColor = pred.alert_7d ? '#ef5350' : '#ffa726';
    const pts = points.map(p => `${toX(p.day).toFixed(1)},${toY(p.level).toFixed(1)}`).join(' ');

    // Projection dashed line from last point to critical
    const projPts = [
      `${toX(0).toFixed(1)},${toY(Math.min(100, Math.max(0, intcpt))).toFixed(1)}`,
      `${toX(projEnd).toFixed(1)},${toY(Math.min(100, Math.max(0, intcpt + slope * projEnd))).toFixed(1)}`,
    ].join(' ');

    // Critical threshold line
    const critY = toY(10);
    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const y = toY(v);
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--divider-color)" stroke-width="0.5" stroke-dasharray="${v ? '3,3' : ''}"/>
        <text x="${padL - 4}" y="${y}" text-anchor="end" font-size="8" fill="var(--secondary-text-color)" dominant-baseline="middle">${v}</text>`;
    }).join('');

    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;">
      ${gridLines}
      <line x1="${padL}" y1="${critY}" x2="${W - padR}" y2="${critY}" stroke="#ef5350" stroke-width="1" stroke-dasharray="4,2" opacity="0.6"/>
      <text x="${W - padR - 2}" y="${critY - 3}" text-anchor="end" font-size="8" fill="#ef5350">10%</text>
      <polyline points="${projPts}" fill="none" stroke="${lineColor}" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6"/>
      <polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${points.map(p => `<circle cx="${toX(p.day).toFixed(1)}" cy="${toY(p.level).toFixed(1)}" r="3" fill="${lineColor}" stroke="var(--card-background-color)" stroke-width="1.5"/>`).join('')}
    </svg>`;

    modal.querySelector('#predict-modal-title').textContent = pred.friendly_name;
    modal.querySelector('#predict-modal-chart').innerHTML = svg;
    modal.querySelector('#predict-modal-stats').innerHTML = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:13px;padding-top:8px;">
        <span>${this.t('battery_predict.col_current')}: <strong>${pred.current_level}%</strong></span>
        <span>${this.t('battery_predict.col_slope')}: <strong style="color:${pred.slope_per_day < 0 ? '#ef5350' : '#4caf50'}">${pred.slope_per_day > 0 ? '+' : ''}${pred.slope_per_day}%/j</strong></span>
        ${pred.predicted_date ? `<span>${this.t('battery_predict.col_predicted_date')}: <strong>${pred.predicted_date.slice(0,10)}</strong></span>` : ''}
        <span>R²: <strong>${pred.r2}</strong></span>
      </div>`;
    modal.style.display = 'flex';
  }


// ── area_heatmap.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  AREA COMPLEXITY — loadAreaComplexity · _renderAreaHeatmap
  // ═══════════════════════════════════════════════════════════════════

  async loadAreaComplexity() {
    const container = this.shadowRoot.querySelector('#area-complexity-container');
    if (!container) return;
    if (this._areaComplexityLoaded) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">
      <div class="loader" style="margin:0 auto 8px;"></div>${this.t('area_complexity.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_area_complexity' });
      this._areaComplexityData = result;
      this._renderAreaHeatmap(result);
      this._areaComplexityLoaded = true;
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('area_complexity.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderAreaHeatmap(data) {
    const container = this.shadowRoot.querySelector('#area-complexity-container');
    if (!container) return;

    const areaStats      = (data.area_stats || []).filter(s => s.area_id !== '__no_area__');
    const noAreaEntry    = (data.area_stats || []).find(s => s.area_id === '__no_area__');
    const crossArea      = data.cross_area_automations || [];
    const consolidations = data.consolidation_suggestions || [];

    if (!areaStats.length && !crossArea.length) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--secondary-text-color);">
        <div style="font-size:36px;margin-bottom:12px;">🗺️</div>
        <div>${this.t('area_complexity.no_data')}</div></div>`;
      return;
    }

    const heatCells = areaStats.map(s => {
      const h = s.heat_value;
      const [border, textColor] =
        h >= 75 ? ['#ef5350', '#ef5350'] :
        h >= 40 ? ['#ffa726', '#ffa726'] :
                  ['#4caf50', '#4caf50'];
      return `
        <div style="background:var(--card-background-color);border:1px solid ${border};border-radius:10px;padding:12px;overflow:hidden;position:relative;">
          <div style="position:absolute;bottom:0;left:0;width:${Math.max(4, h)}%;height:3px;background:${textColor};opacity:0.45;"></div>
          <div style="font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px;"
               title="${this.escapeHtml(s.area_name)}">${this.escapeHtml(s.area_name)}</div>
          <div style="font-size:26px;font-weight:800;color:${textColor};line-height:1;">${h}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:3px;">
            ${s.auto_count} auto · Ø${s.avg_score}
            ${s.high_complexity > 0 ? `<span style="color:#ef5350;font-weight:600;margin-left:4px;">⬆${s.high_complexity}</span>` : ''}
          </div>
        </div>`;
    }).join('');

    const legend = `
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px;font-size:12px;align-items:center;">
        <span style="font-weight:600;color:var(--secondary-text-color);">${this.t('area_complexity.legend')}</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#4caf50;display:inline-block;"></span>0–39</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#ffa726;display:inline-block;"></span>40–74</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#ef5350;display:inline-block;"></span>75–100</span>
      </div>`;

    const noAreaHtml = noAreaEntry ? `
      <div style="background:rgba(255,152,0,0.08);border:1px solid rgba(255,152,0,0.25);border-radius:8px;padding:9px 14px;margin-top:14px;font-size:12px;display:flex;align-items:center;gap:6px;">
        ${_icon('map-marker-off', 14, '#ffa726')} ${this.t('area_complexity.no_area_count').replace('{count}', noAreaEntry.auto_count)}
      </div>` : '';

    const crossHtml = crossArea.length ? `
      <div style="margin-top:22px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          ${_icon('arrow-decision', 13)} ${this.t('area_complexity.cross_area_title')} <span style="background:var(--secondary-background-color);padding:1px 7px;border-radius:10px;font-size:11px;">${crossArea.length}</span>
        </div>
        ${crossArea.slice(0, 15).map(c => this._crossAreaRow(c)).join('')}
      </div>` : '';

    const suggHtml = consolidations.length ? `
      <div style="margin-top:22px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          ${_icon('lightbulb-outline', 13)} ${this.t('area_complexity.suggestions_title')} <span style="background:var(--secondary-background-color);padding:1px 7px;border-radius:10px;font-size:11px;">${consolidations.length}</span>
        </div>
        ${consolidations.map(s => this._areaConsolidationRow(s)).join('')}
      </div>` : '';

    container.innerHTML = legend
      + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">${heatCells}</div>`
      + noAreaHtml + crossHtml + suggHtml;

    container.querySelectorAll('[data-area-ai-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showAreaSuggestionAI({
          entity_id:   btn.dataset.areaAiBtn,
          alias:       btn.dataset.alias || '',
          area_name:   btn.dataset.area  || '',
          suggestion:  btn.dataset.suggestion || '',
          auto_count:  btn.dataset.count || '',
          avg_score:   btn.dataset.avg   || '',
        });
      });
    });
  }

  _crossAreaRow(c) {
    const editUrl = this.getHAEditUrl(c.entity_id);
    const scoreColor = c.score >= 50 ? '#ef5350' : c.score >= 30 ? '#ffa726' : '#4caf50';
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;" title="${this.escapeHtml(c.alias)}">${this.escapeHtml(c.alias)}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:2px;">${(c.area_names||[]).join(' · ')}</div>
        </div>
        <span style="font-weight:800;font-size:15px;color:${scoreColor};flex-shrink:0;">${c.score}</span>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button></a>` : ''}
          <button data-area-ai-btn="${this.escapeHtml(c.entity_id)}" data-alias="${this.escapeHtml(c.alias)}" data-area="${this.escapeHtml((c.area_names||[]).join(', '))}" data-suggestion="cross_area"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  _areaConsolidationRow(s) {
    const descMap = {
      merge_simple_automations: this.t('area_complexity.suggestion_merge').replace('{count}', s.auto_count).replace('{avg}', s.avg_score),
      split_complex_automations: this.t('area_complexity.suggestion_split').replace('{count}', s.auto_count).replace('{avg}', s.avg_score),
    };
    const desc = descMap[s.suggestion] || s.suggestion;
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid var(--primary-color);border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:160px;">
          <div style="font-weight:700;font-size:13px;">${this.escapeHtml(s.area_name)}</div>
          <div style="font-size:12px;color:var(--secondary-text-color);margin-top:3px;">${this.escapeHtml(desc)}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;">
          <a href="/config/automation" target="_blank" style="text-decoration:none;">
            <button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button>
          </a>
          <button data-area-ai-btn="_area_${this.escapeHtml(s.area_id)}" data-alias="${this.escapeHtml(s.area_name)}" data-area="${this.escapeHtml(s.area_name)}" data-suggestion="${s.suggestion}" data-count="${s.auto_count||''}" data-avg="${s.avg_score||''}"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  AREA HEATMAP — _showAreaSuggestionAI
  //  All text from this.t('diag_prompts.area.*') — zero hardcoded strings.
  // ════════════════════════════════════════════════════════════════════════

  async _showAreaSuggestionAI(item) {
    let chatPrompt = '';
    const eid   = item.entity_id || '';
    const alias = item.alias     || eid;
    const t     = (k, p) => this.t(k, p);

    if (item.suggestion === 'cross_area') {
      const areas = item.area_name || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.area.cross_area_problem', {areas})})}`,
        '',
        t('diag_prompts.read_with', {cmd: `haca_get_automation("${eid}")`}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.area.cross_area_step1'),
        t('diag_prompts.area.cross_area_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.area.cross_area_choice_proceed'),
        t('diag_prompts.area.cross_area_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else if (item.suggestion === 'merge_simple_automations') {
      const area  = item.area_name || '';
      const count = item.auto_count || '';
      const score = item.avg_score  || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias: area, eid: area, problem: t('diag_prompts.area.merge_problem', {area, count, score})})}`,
        '',
        t('diag_prompts.area.merge_read', {area}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.area.merge_step1'),
        t('diag_prompts.area.merge_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.area.merge_choice_proceed'),
        t('diag_prompts.area.merge_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else {
      // high complexity — split suggestion
      const area  = item.area_name || '';
      const score = item.avg_score  || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias: area, eid: area, problem: t('diag_prompts.area.split_problem', {area, score})})}`,
        '',
        t('diag_prompts.area.split_read', {area}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.area.split_step1'),
        t('diag_prompts.area.split_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.area.split_choice_proceed'),
        t('diag_prompts.area.split_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');
    }

    this._areaComplexityLoaded = false;
    this._openChatWithMessage(chatPrompt);
  }


// ── redundancy.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  REDUNDANCY — loadRedundancy · _renderRedundancy
  // ═══════════════════════════════════════════════════════════════════

  async loadRedundancy() {
    const container = this.shadowRoot.querySelector('#redundancy-container');
    if (!container) return;
    if (this._redundancyLoaded) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">
      <div class="loader" style="margin:0 auto 8px;"></div>${this.t('redundancy.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_redundancy' });
      this._redundancyData = result;
      this._renderRedundancy(result);
      this._redundancyLoaded = true;
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('redundancy.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderRedundancy(data) {
    const container = this.shadowRoot.querySelector('#redundancy-container');
    if (!container) return;

    const blueprints = data.blueprint_matches   || [];
    const natives    = data.native_feature_matches || [];
    const overlaps   = data.trigger_overlaps    || [];
    const total      = data.total || (blueprints.length + natives.length + overlaps.length);

    if (!total) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--secondary-text-color);">
        <div style="font-size:36px;margin-bottom:12px;">✅</div>
        <div style="font-weight:600;">${this.t('redundancy.all_good')}</div></div>`;
      return;
    }

    // ── Summary bar ───────────────────────────────────────────────────
    const summaryHtml = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;">
        ${blueprints.length ? `<div style="background:rgba(156,39,176,0.08);border:1px solid rgba(156,39,176,0.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('blueprint', 14)} <span style="font-weight:700;color:#9c27b0;">${blueprints.length}</span> ${this.t('redundancy.type_blueprint')}
        </div>` : ''}
        ${natives.length ? `<div style="background:rgba(33,150,243,0.08);border:1px solid rgba(33,150,243,0.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('home-outline', 14)} <span style="font-weight:700;color:#2196f3;">${natives.length}</span> ${this.t('redundancy.type_native')}
        </div>` : ''}
        ${overlaps.length ? `<div style="background:rgba(255,87,34,0.08);border:1px solid rgba(255,87,34,0.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('source-merge', 14)} <span style="font-weight:700;color:#ff5722;">${overlaps.length}</span> ${this.t('redundancy.type_overlap')}
        </div>` : ''}
      </div>`;

    // ── Blueprint candidates ──────────────────────────────────────────
    const bpHtml = blueprints.length ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9c27b0;margin-bottom:10px;display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid var(--divider-color);">
          ${_icon('blueprint', 13)} ${this.t('redundancy.section_blueprint')}
        </div>
        ${blueprints.map(b => this._redundancyBlueprintRow(b)).join('')}
      </div>` : '';

    // ── Native HA feature replacements ───────────────────────────────
    const nativeHtml = natives.length ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#2196f3;margin-bottom:10px;display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid var(--divider-color);">
          ${_icon('home-outline', 13)} ${this.t('redundancy.section_native')}
        </div>
        ${natives.map(n => this._redundancyNativeRow(n)).join('')}
      </div>` : '';

    // ── Trigger overlaps ──────────────────────────────────────────────
    const overlapHtml = overlaps.length ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#ff5722;margin-bottom:10px;display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid var(--divider-color);">
          ${_icon('source-merge', 13)} ${this.t('redundancy.section_overlap')}
        </div>
        ${overlaps.slice(0, 25).map(o => this._redundancyOverlapRow(o)).join('')}
        ${overlaps.length > 25 ? `<div style="font-size:12px;color:var(--secondary-text-color);text-align:center;padding:8px;">${this.t('redundancy.more_items').replace('{n}', overlaps.length - 25)}</div>` : ''}
      </div>` : '';

    container.innerHTML = summaryHtml + bpHtml + nativeHtml + overlapHtml;

    container.querySelectorAll('[data-redund-ai-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showRedundancyAI({
          entity_id:  btn.dataset.redundAiBtn,
          alias:      btn.dataset.alias || '',
          type:       btn.dataset.type  || '',
          detail:     btn.dataset.detail || '',
        });
      });
    });
  }

  _redundancyBlueprintRow(b) {
    const editUrl = this.getHAEditUrl(b.entity_id);
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid #9c27b0;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:140px;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;" title="${this.escapeHtml(b.alias)}">${this.escapeHtml(b.alias)}</div>
          <div style="font-size:11px;margin-top:3px;">
            <span style="background:rgba(156,39,176,0.1);color:#9c27b0;border-radius:5px;padding:1px 7px;font-weight:600;">${this.escapeHtml(b.pattern)}</span>
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:3px;">${this.t('redundancy.blueprint_hint')}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;">
          ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button></a>` : ''}
          <button data-redund-ai-btn="${this.escapeHtml(b.entity_id)}" data-alias="${this.escapeHtml(b.alias)}" data-type="blueprint" data-detail="${this.escapeHtml(b.pattern)}"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  _redundancyNativeRow(n) {
    const editUrl = this.getHAEditUrl(n.entity_id);
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid #2196f3;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:140px;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;" title="${this.escapeHtml(n.alias)}">${this.escapeHtml(n.alias)}</div>
          <div style="font-size:11px;margin-top:3px;">
            <span style="background:rgba(33,150,243,0.1);color:#2196f3;border-radius:5px;padding:1px 7px;font-weight:600;">${this.escapeHtml(n.native_feature)}</span>
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:3px;">${this.t('redundancy.native_hint')}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;">
          ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button></a>` : ''}
          <button data-redund-ai-btn="${this.escapeHtml(n.entity_id)}" data-alias="${this.escapeHtml(n.alias)}" data-type="native" data-detail="${this.escapeHtml(n.native_feature)}"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  _redundancyOverlapRow(o) {
    const edit1 = this.getHAEditUrl(o.entity_id_a);
    const edit2 = this.getHAEditUrl(o.entity_id_b);
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid #ff5722;border-radius:10px;padding:10px 14px;margin-bottom:6px;">
        <div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
          <div style="flex:1;min-width:160px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              ${_icon('source-merge', 13, '#ff5722')}
              <span style="font-size:11px;background:rgba(255,87,34,0.1);color:#ff5722;border-radius:5px;padding:1px 7px;font-weight:600;">${this.escapeHtml(o.trigger_sig)}</span>
            </div>
            <div style="font-size:12px;display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
              <span style="background:var(--secondary-background-color);border-radius:5px;padding:1px 8px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(o.alias_a)}">${this.escapeHtml(o.alias_a)}</span>
              <span style="color:var(--secondary-text-color);align-self:center;">↔</span>
              <span style="background:var(--secondary-background-color);border-radius:5px;padding:1px 8px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(o.alias_b)}">${this.escapeHtml(o.alias_b)}</span>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;flex-wrap:wrap;">
            ${edit1 ? `<a href="${edit1}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:4px 9px;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:3px;">${_icon('pencil-outline',11)} A</button></a>` : ''}
            ${edit2 ? `<a href="${edit2}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:4px 9px;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:3px;">${_icon('pencil-outline',11)} B</button></a>` : ''}
            <button data-redund-ai-btn="${this.escapeHtml(o.entity_id_a)}" data-alias="${this.escapeHtml(o.alias_a + ' ↔ ' + o.alias_b)}" data-type="overlap" data-detail="${this.escapeHtml(o.entity_id_b + '|' + o.trigger_sig)}"
              style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:4px 9px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
              ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
            </button>
          </div>
        </div>
      </div>`;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  REDUNDANCY — _showRedundancyAI
  //  All text from this.t('diag_prompts.redundancy.*') — zero hardcoded strings.
  // ════════════════════════════════════════════════════════════════════════

  async _showRedundancyAI(item) {
    let chatPrompt = '';
    const eid   = item.entity_id || '';
    const alias = item.alias     || eid;
    const t     = (k, p) => this.t(k, p);

    if (item.type === 'blueprint') {
      const patternLine = item.detail
        ? `\n${t('diag_prompts.redundancy.pattern_label')}: ${item.detail}`
        : '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.redundancy.blueprint_problem')})}${patternLine}`,
        '',
        t('diag_prompts.read_with', {cmd: `haca_get_automation("${eid}")`}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.redundancy.blueprint_step1'),
        t('diag_prompts.redundancy.blueprint_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.redundancy.blueprint_choice_proceed'),
        t('diag_prompts.redundancy.blueprint_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else if (item.type === 'native') {
      const detail = item.detail || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.redundancy.native_problem', {detail})})}`,
        '',
        t('diag_prompts.read_with', {cmd: `haca_get_automation("${eid}")`}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.redundancy.native_step1'),
        t('diag_prompts.redundancy.native_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.choice_apply'),
        t('diag_prompts.choice_backup_apply'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else {
      // overlap — two automations with same trigger
      const [eid_b, trigger_sig] = (item.detail || '').split('|');
      const alias_a = item.alias.split(' ↔ ')[0] || alias;
      const alias_b = item.alias.split(' ↔ ')[1] || eid_b || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.redundancy.overlap_problem', {alias_a, eid_a: eid, alias_b, trigger: trigger_sig})})}`,
        '',
        t('diag_prompts.redundancy.overlap_read', {eid_a: eid, eid_b: eid_b || alias_b}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.redundancy.overlap_step1'),
        t('diag_prompts.redundancy.overlap_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.redundancy.overlap_choice_proceed'),
        t('diag_prompts.redundancy.overlap_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');
    }

    this._redundancyLoaded = false;
    this._openChatWithMessage(chatPrompt);
  }


// ── recorder_impact.js ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  //  RECORDER IMPACT — _renderRecorderImpact
  // ═══════════════════════════════════════════════════════════════════

  async loadRecorderImpact() {
    const container = this.shadowRoot.querySelector('#recorder-impact-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">${_icon('loading', 20)} ${this.t('recorder_impact.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_recorder_impact' });
      this._renderRecorderImpact(result);
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('recorder_impact.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderRecorderImpact(data) {
    const container = this.shadowRoot.querySelector('#recorder-impact-container');
    if (!container) return;

    const top10      = data.top10 || [];
    const excludes   = data.exclude_suggestions || [];
    const totalWrites = data.total_writes_per_day || 0;
    const mbPerYear  = data.estimated_mb_per_year || 0;
    const mbSaved    = data.total_mb_saved || 0;

    if (!top10.length) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--secondary-text-color);">${this.t('recorder_impact.no_data')}</div>`;
      return;
    }

    // Summary bar
    const summaryHtml = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 14px;flex:1;min-width:140px;border:1px solid var(--divider-color);">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--secondary-text-color);letter-spacing:0.5px;">${this.t('recorder_impact.total_writes_day')}</div>
          <div style="font-size:22px;font-weight:800;">${totalWrites.toLocaleString()}</div>
        </div>
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 14px;flex:1;min-width:140px;border:1px solid var(--divider-color);">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--secondary-text-color);letter-spacing:0.5px;">${this.t('recorder_impact.est_mb_year')}</div>
          <div style="font-size:22px;font-weight:800;">${mbPerYear} MB</div>
        </div>
        ${mbSaved > 0 ? `<div style="background:rgba(76,175,80,0.1);border-radius:8px;padding:8px 14px;flex:1;min-width:140px;border:1px solid rgba(76,175,80,0.3);">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#4caf50;letter-spacing:0.5px;">${this.t('recorder_impact.potential_saved')}</div>
          <div style="font-size:22px;font-weight:800;color:#4caf50;">${mbSaved} MB/an</div>
        </div>` : ''}
      </div>`;

    // Top 10 table
    const maxWrites = top10[0]?.writes_per_day || 1;
    const tableRows = top10.map((a, i) => {
      const barPct = Math.round(a.writes_per_day / maxWrites * 100);
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
      return `<tr style="border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 6px;text-align:center;font-size:14px;">${rank}</td>
        <td style="padding:8px 10px;max-width:240px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(a.alias)}">${this.escapeHtml(a.alias)}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(a.entity_id)}</div>
          <div style="margin-top:4px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
            <div style="width:${barPct}%;height:100%;background:${i < 3 ? '#ef5350' : '#ffa726'};border-radius:2px;"></div>
          </div>
        </td>
        <td style="padding:8px 10px;text-align:center;font-weight:700;">${a.writes_per_day}/j</td>
        <td style="padding:8px 10px;text-align:center;font-size:12px;color:var(--secondary-text-color);">${a.mb_per_year} MB/an</td>
        <td style="padding:8px 10px;text-align:center;font-size:12px;">${a.trigger_freq}/j</td>
      </tr>`;
    }).join('');

    // Exclude suggestions
    const excludeHtml = excludes.length ? `
      <h4 style="margin:20px 0 10px;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;">
        ${_icon('database-off-outline', 16)} ${this.t('recorder_impact.exclude_title')}
      </h4>
      <div style="background:rgba(76,175,80,0.08);border-radius:10px;padding:14px;border:1px solid rgba(76,175,80,0.2);">
        ${excludes.slice(0, 10).map(s => `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--divider-color);">
            ${_icon('code-tags', 14, '#4caf50')}
            <code style="flex:1;font-size:12px;">${this.escapeHtml(s.entity_id)}</code>
            <span style="font-size:12px;color:var(--secondary-text-color);">${s.writes_per_day}/j</span>
            <span style="font-size:12px;color:#4caf50;font-weight:600;">−${s.mb_saved_per_year} MB/an</span>
          </div>`).join('')}
        <div style="margin-top:12px;">
          <button id="copy-recorder-yaml-btn" style="background:var(--primary-color);color:#fff;border:none;border-radius:8px;padding:7px 14px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
            ${_icon('content-copy', 14)} ${this.t('recorder_impact.copy_yaml')}
          </button>
        </div>
      </div>` : '';

    container.innerHTML = summaryHtml + `
      <h4 style="margin:0 0 10px;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;">
        ${_icon('database-alert-outline', 16)} ${this.t('recorder_impact.top10_title')}
      </h4>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid var(--divider-color);">
            <th style="padding:8px 6px;font-size:12px;color:var(--secondary-text-color);">#</th>
            <th style="text-align:left;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_automation')}</th>
            <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_writes')}</th>
            <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_size')}</th>
            <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_freq')}</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${excludeHtml}`;

    // Wire copy YAML button
    const copyBtn = container.querySelector('#copy-recorder-yaml-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const yaml = excludes.map(s => `      - ${s.entity_id}`).join('\n');
        const full = `recorder:\n  exclude:\n    entities:\n${yaml}`;
        navigator.clipboard?.writeText(full).then(() => {
          copyBtn.textContent = '✓ ' + this.t('recorder_impact.copied');
          setTimeout(() => {
            copyBtn.innerHTML = `${_icon('content-copy', 14)} ${this.t('recorder_impact.copy_yaml')}`;
          }, 2000);
        });
      };
    }
  }


// ── closer.js ──────────────────────────────────────────

} // end class HacaPanel

customElements.define('haca-panel', HacaPanel);

})();
// HACA v1.5.2 build 20260315101444
// rebuild 1773570326
// guard-fix 1773571782
// cards-v2 1773579684
// getConfigForm 1773580618
// cache-bust-hash 1773583990
// light-dom 1773585606
// ha-card-once 1773586339
// final-v2 1773587653
// final-haca-type 1773589750
// diag 1773591162
// tap-action 1773593088
// more-info-click 1773593856
// v1.6.0 1773643943
// v1.6.0-fixes 1773681423
// fixes-final 1773683656
// bugfixes-batch 1774013056
// v1.6.1 1774015757
// v1.6.1-final 1774023231
// v1.6.1-final2 1774023319
// v1.6.1-fixes 1774025426
// v1.6.1-hotfix 1774028461
// v1.6.1-auth-fix 1774042391
// v1.6.1-diag 1774044878
// v1.6.1-scorebat 1774047517
// v1.6.1-cleanup 1774079091
// v1.6.1-i18n-mcp 1774080741
// v1.6.1-i18n-complete 1774082649
// v1.6.1-mcp-i18n-fix 1774083871
// v1.6.1-scanfix 1774085103
// v1.6.1-scorenum 1774086594
// v1.6.1-guides 1774094227
// v1.6.1-uvcurl 1774094637
// v1.6.1-guidescope 1774100422
// v1.6.1-fixes4 1774250881
// v1.6.1-lovelace 1774253385
// v1.6.1-llmprompt 1774256092
// v1.6.1-tooldescs 1774256746
// v1.6.2 1774267623
// v1.6.2-i18n-final 1774268990

// ── compliance.js ──────────────────────────────────────────
// ── compliance.js ─────────────────────────────────────────────────────────
// Onglet Conformité — bonnes pratiques HA v1.4.2
// Zéro texte hardcodé — toutes les chaînes viennent des fichiers de traduction
// ──────────────────────────────────────────────────────────────────────────

// Couleurs de fond par type d'issue (cohérent avec les badges sévérité)
var COMPLIANCE_TYPE_COLORS = {
  compliance_no_friendly_name:          'rgba(33,150,243,0.13)',
  compliance_raw_entity_name:           'rgba(33,150,243,0.08)',
  compliance_area_no_icon:              'rgba(156,39,176,0.13)',
  compliance_unused_label:              'rgba(255,152,0,0.15)',
  compliance_automation_no_description: 'rgba(244,67,54,0.13)',
  compliance_automation_no_unique_id:   'rgba(244,67,54,0.18)',
  compliance_script_no_description:     'rgba(255,87,34,0.13)',
  compliance_entity_no_area:            'rgba(0,188,212,0.13)',
  compliance_entity_no_area_bulk:       'rgba(0,150,136,0.18)',
  compliance_helper_no_icon:            'rgba(121,85,72,0.13)',
  compliance_helper_no_area:            'rgba(0,188,212,0.10)',
};
var COMPLIANCE_TYPE_TEXT_COLORS = {
  compliance_no_friendly_name:          '#1565c0',
  compliance_raw_entity_name:           '#1976d2',
  compliance_area_no_icon:              '#6a1b9a',
  compliance_unused_label:              '#e65100',
  compliance_automation_no_description: '#b71c1c',
  compliance_automation_no_unique_id:   '#c62828',
  compliance_script_no_description:     '#bf360c',
  compliance_entity_no_area:            '#006064',
  compliance_entity_no_area_bulk:       '#00695c',
  compliance_helper_no_icon:            '#4e342e',
  compliance_helper_no_area:            '#00838f',
};

function _complianceOpenUrl(issue) {
  var type = (issue.type || '');
  if (type.indexOf('automation') !== -1) return '/config/automation';
  if (type.indexOf('script') !== -1)     return '/config/script';
  if (type === 'compliance_area_no_icon') return '/config/areas';
  if (type.indexOf('label') !== -1)      return '/config/labels';
  var eid = issue.entity_id || '';
  if (!eid || eid === 'entity.*') return '/config/entities';
  var domain = eid.split('.')[0];
  if (['input_boolean','input_text','input_number','input_select','input_datetime',
       'input_button','counter','timer','schedule'].indexOf(domain) !== -1)
    return '/config/helpers';
  // For entity_no_area, link directly to device list
  if (type === 'compliance_entity_no_area' || type === 'compliance_entity_no_area_bulk')
    return '/config/devices';
  return '/config/entities';
}

/**
 * Rendu HTML d'une page de conformité.
 * Tout l'état (sort, filter, page) est géré par loadComplianceTab() dans core.js.
 */
function renderComplianceTab(items, t, sortBy, filterBy, pagHtml, counts, scanning) {
  var _i = window._icon || function(){ return ''; };

  function esc(s) {
    return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
  }

  var sevColor = { high:'var(--error-color,#ef5350)', medium:'var(--warning-color,#ff9800)', low:'var(--info-color,#2196f3)' };
  var sevIcon  = { high:'alert-circle', medium:'alert-circle-outline', low:'information-outline' };

  if (scanning) {
    return '<div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;"><div class="loader"></div>' +
      '<div style="font-size:16px;font-weight:500;">' + t('compliance.scanning') + '</div></div>';
  }

  var c = counts || {total:0, high:0, medium:0, low:0};
  if (c.total === 0) {
    return '<div style="padding:48px 32px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;">' +
      '<div style="font-size:56px;">✅</div>' +
      '<div style="font-size:20px;font-weight:700;">' + t('compliance.all_good') + '</div>' +
      '<div style="font-size:14px;color:var(--secondary-text-color);max-width:420px;line-height:1.6;">' + t('compliance.all_good_subtitle') + '</div></div>';
  }

  // ── Stats cards cliquables (filtre par sévérité) ──────────────────────────
  function statCard(count, label, filterVal, color) {
    var active = filterBy === filterVal;
    return '<div class="compliance-filter-card" data-filter="' + filterVal + '" ' +
      'style="background:var(--secondary-background-color);border-radius:12px;padding:12px 18px;flex:1;min-width:90px;text-align:center;cursor:pointer;' +
      'border:2px solid ' + (active ? (color||'var(--primary-color)') : 'transparent') + ';transition:border-color 0.15s;">' +
      '<div style="font-size:26px;font-weight:800;color:' + (color||'var(--primary-text-color)') + ';">' + count + '</div>' +
      '<div style="font-size:11px;color:var(--secondary-text-color);margin-top:2px;">' + esc(label) + '</div></div>';
  }

  var statsHtml =
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">' +
      statCard(c.total,  t('compliance.total_issues'), 'all',    null) +
      (c.high   > 0 ? statCard(c.high,   t('severity.high'),   'high',   sevColor.high)   : '') +
      (c.medium > 0 ? statCard(c.medium, t('severity.medium'), 'medium', sevColor.medium) : '') +
      (c.low    > 0 ? statCard(c.low,    t('severity.low'),    'low',    sevColor.low)    : '') +
    '</div>';

  // ── Barre de tri ──────────────────────────────────────────────────────────
  function sortBtn(val, label) {
    var active = sortBy === val;
    return '<button class="compliance-sort-btn" data-sort="' + val + '" style="' +
      'padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;' +
      'border:1px solid var(--divider-color);transition:background 0.15s;' +
      'background:' + (active ? 'var(--primary-color)' : 'var(--secondary-background-color)') + ';' +
      'color:' + (active ? '#fff' : 'var(--primary-text-color)') + ';">' + label + '</button>';
  }

  var sortBarHtml =
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-wrap:wrap;">' +
      '<span style="font-size:12px;color:var(--secondary-text-color);">' + t('compliance.sort_label') + '</span>' +
      sortBtn('severity', t('compliance.sort_severity')) +
      sortBtn('type',     t('compliance.sort_type'))     +
      sortBtn('entity',   t('compliance.sort_entity'))   +
    '</div>';

  // ── Lignes du tableau ────────────────────────────────────────────────────
  var rows = (items || []).map(function(issue) {
    var sev      = issue.severity || 'low';
    var color    = sevColor[sev] || 'var(--secondary-text-color)';
    var alias    = esc(issue.alias || issue.entity_id || '');
    var eid      = esc(issue.entity_id || '');
    var msg;
    if (issue.message_key) {
      // Traduction côté JS avec remplacement des paramètres {name}, {alias}, etc.
      var raw = t('compliance_messages.' + issue.message_key) || issue.message || '';
      var params = issue.message_params || {};
      msg = esc(raw.replace(/\{(\w+)\}/g, function(_, k) { return esc(String(params[k] !== undefined ? params[k] : '{' + k + '}')); }));
    } else {
      msg = esc(issue.message || '');
    }
    var itype    = issue.type || '';
    var typeBg   = COMPLIANCE_TYPE_COLORS[itype]      || 'var(--secondary-background-color)';
    var typeTxt  = COMPLIANCE_TYPE_TEXT_COLORS[itype] || 'var(--secondary-text-color)';
    // Lire depuis issue_types.types (source unique partagée avec la Config)
    var typeLabel = t('issue_types.types.' + itype) || t('compliance.types.' + itype) || esc(itype);
    var openUrl  = _complianceOpenUrl(issue);
    // Sérialiser l'issue pour le bouton AI Fix (échapper les apostrophes)
    var issueData = esc(JSON.stringify(issue));

    // Can we fire more-info for this entity? (real entity, not entity.*)
    var canMoreInfo = eid && eid.indexOf('.') !== -1 && eid !== 'entity.*' &&
      ['automation','script','scene'].indexOf(eid.split('.')[0]) === -1;

    return '<tr style="border-bottom:1px solid var(--divider-color);">' +
      '<td style="width:28px;padding:10px 4px 10px 12px;vertical-align:top;">' +
        '<span style="color:' + color + ';">' + _i(sevIcon[sev]||'information-outline', 17) + '</span>' +
      '</td>' +
      '<td style="padding:10px 8px;vertical-align:top;min-width:110px;max-width:200px;">' +
        '<div style="font-weight:600;font-size:13px;word-break:break-word;">' + alias + '</div>' +
        (eid && eid !== alias ? '<div style="font-size:10px;color:var(--secondary-text-color);font-family:monospace;word-break:break-all;">' + eid + '</div>' : '') +
      '</td>' +
      '<td style="padding:10px 6px;vertical-align:top;white-space:nowrap;">' +
        '<span style="font-size:11px;background:' + typeBg + ';color:' + typeTxt + ';border-radius:6px;padding:3px 8px;font-weight:600;">' +
          typeLabel +
        '</span>' +
      '</td>' +
      '<td style="padding:10px 8px;font-size:13px;color:var(--secondary-text-color);word-break:break-word;">' + msg + '</td>' +
      '<td style="padding:10px 12px;vertical-align:top;white-space:nowrap;">' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap;">' +
          (canMoreInfo ?
            '<button class="compliance-moreinfo-btn" data-eid="' + eid + '" ' +
               'style="padding:4px 9px;border-radius:7px;font-size:11px;font-weight:600;' +
                 'background:var(--secondary-background-color);color:var(--primary-text-color);' +
                 'border:1px solid var(--divider-color);cursor:pointer;display:inline-flex;align-items:center;gap:3px;">' +
              _i('information-outline', 12) + t('compliance.btn_moreinfo') +
            '</button>'
          : '') +
          '<a href="' + openUrl + '" target="_top" ' +
             'style="padding:4px 9px;border-radius:7px;font-size:11px;font-weight:600;' +
               'background:var(--secondary-background-color);color:var(--primary-text-color);' +
               'border:1px solid var(--divider-color);text-decoration:none;display:inline-flex;align-items:center;gap:3px;">' +
            _i('open-in-new', 12) + t('compliance.btn_open') +
          '</a>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');

  var tableHtml =
    '<div style="overflow-x:auto;border-radius:12px;border:1px solid var(--divider-color);">' +
      '<table style="width:100%;border-collapse:collapse;">' +
        '<thead>' +
          '<tr style="background:var(--secondary-background-color);">' +
            '<th style="width:28px;padding:9px 4px;"></th>' +
            '<th style="text-align:left;padding:9px 8px;font-size:11px;text-transform:uppercase;color:var(--secondary-text-color);font-weight:700;">' + t('compliance.col_entity')  + '</th>' +
            '<th style="text-align:left;padding:9px 6px;font-size:11px;text-transform:uppercase;color:var(--secondary-text-color);font-weight:700;">' + t('compliance.col_type')    + '</th>' +
            '<th style="text-align:left;padding:9px 8px;font-size:11px;text-transform:uppercase;color:var(--secondary-text-color);font-weight:700;">' + t('compliance.col_message') + '</th>' +
            '<th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:var(--secondary-text-color);font-weight:700;">' + t('compliance.col_actions') + '</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
    '</div>';

  // Banner avertissement si la liste d'entités sans area est tronquée (> 150)
  var hasTruncated = !!(counts && counts._area_truncated);
  var truncationBanner = hasTruncated
    ? '<div style="margin-bottom:10px;padding:9px 13px;background:rgba(255,152,0,0.10);border-left:3px solid #f57c00;border-radius:6px;font-size:12px;color:var(--primary-text-color);display:flex;align-items:center;gap:8px;">' +
        _i('alert-circle-outline', 14) +
        '<span>' + t('compliance.area_limit_notice') + '</span>' +
      '</div>'
    : '';

  return '<div style="padding:16px;">' + statsHtml + sortBarHtml + truncationBanner + tableHtml + (pagHtml || '') + '</div>';
}

// ── mcp_panel.js ──────────────────────────────────────────
// ── mcp_panel.js ──────────────────────────────────────────────────────────
// Section MCP Server + Agent IA dans l'onglet Configuration
// v1.5.0 — agent config tabs (12 agents, grille pills)
// ──────────────────────────────────────────────────────────────────────────

// Token placeholder (never changes)
var TOKEN_RAW = '<YOUR_HA_TOKEN>';

// Clipboard helper — works on both HTTP and HTTPS
function _hacaCopy(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(function() {});
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }
}
// Expose globally for inline onclick handlers
window._hacaCopy = _hacaCopy;

// ── Agent config factory ─────────────────────────────────────────────────
// Called with (mcpUrl, _t) from inside renderMcpSection.
// Result is cached in _agentConfigsCache for _hacaAgentSwitch.
var _agentConfigsCache = [];

function _buildAgentConfigs(mcpUrl, _t) {
  var _i = window._icon || function(n,s){return '';};
  function escM(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  return [
    {
      id: 'claude-code',
      label: 'Claude Code',
      icon: '⬛',
      hint: _t('mcp.hint_claude_code'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          url: mcpUrl, type: 'http',
          headers: { Authorization: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'claude-desktop',
      label: 'Claude Desktop',
      icon: '🖥️',
      hint: _t('mcp.hint_claude_desktop'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          command: 'uvx',
          args: ['mcp-proxy', '--transport', 'streamablehttp', '-H', 'Authorization', 'Bearer ' + TOKEN_RAW, mcpUrl]
        }}}, null, 2);
      },
      guide: function() {
        var snip = JSON.stringify({ mcpServers: { haca: {
          command: 'uvx',
          args: ['mcp-proxy', '--transport', 'streamablehttp', '-H', 'Authorization', 'Bearer ' + TOKEN_RAW, mcpUrl]
        }}}, null, 2);
        return '<div style="background:rgba(33,150,243,0.08);border:1px solid rgba(33,150,243,0.25);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;line-height:1.6;color:var(--primary-text-color);">' +
          _t('mcp.guide_stdio_info') +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px;">1. ' + _t('mcp.guide_install_uv') + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">' +
          '<div style="background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;">' +
            '<div style="font-size:11px;font-weight:600;color:var(--secondary-text-color);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Windows</div>' +
            '<code style="font-size:12px;">winget install astral-sh.uv -e</code>' +
          '</div>' +
          '<div style="background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;">' +
            '<div style="font-size:11px;font-weight:600;color:var(--secondary-text-color);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">macOS / Linux</div>' +
            '<code style="font-size:11px;">curl -LsSf https://astral.sh/uv/install.sh | sh</code>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px;">2. ' + _t('mcp.guide_paste_json') + '</div>' +
        '<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:14px;">' +
          '<pre style="flex:1;font-size:11px;margin:0;overflow-x:auto;white-space:pre-wrap;background:var(--secondary-background-color);border-radius:8px;padding:10px 14px;">' + escM(snip) + '</pre>' +
          '<button class="icon-btn guide-copy-btn" style="flex-shrink:0;margin-top:2px;" title="' + _t('mcp.copy') + '">' + _i('content-copy',16) + '</button>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px;">3. ' + _t('mcp.guide_config_file') + '</div>' +
        '<div style="display:grid;gap:4px;margin-bottom:14px;">' +
          '<div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 12px;display:flex;align-items:baseline;gap:8px;">' +
            '<span style="font-size:11px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;min-width:52px;">Windows</span>' +
            '<code style="font-size:11px;word-break:break-all;">%APPDATA%\\Claude\\claude_desktop_config.json</code>' +
          '</div>' +
          '<div style="padding:2px 12px 2px 68px;font-size:11px;color:var(--secondary-text-color);">' +
            _t('mcp.guide_win_path_detail') +
          '</div>' +
          '<div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 12px;display:flex;align-items:baseline;gap:8px;">' +
            '<span style="font-size:11px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;min-width:52px;">macOS</span>' +
            '<code style="font-size:11px;word-break:break-all;">~/Library/Application Support/Claude/claude_desktop_config.json</code>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:4px;">4. ' + _t('mcp.guide_restart_claude') + '</div>' +
        '<div style="font-size:13px;color:var(--secondary-text-color);">' + _t('mcp.guide_restart_detail') + '</div>';
      }
    },
    {
      id: 'cursor',
      label: 'Cursor',
      icon: '🔵',
      hint: _t('mcp.hint_cursor'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          url: mcpUrl,
          headers: { Authorization: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'vscode',
      label: 'VS Code / Copilot',
      icon: '🟦',
      hint: _t('mcp.hint_vscode'),
      snippet: function() {
        return JSON.stringify({ servers: { haca: {
          type: 'http', url: mcpUrl,
          headers: { Authorization: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'windsurf',
      label: 'Windsurf',
      icon: '🌊',
      hint: _t('mcp.hint_windsurf'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          serverUrl: mcpUrl,
          headers: { Authorization: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'cline',
      label: 'Cline',
      icon: '🤖',
      hint: _t('mcp.hint_cline'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          url: mcpUrl,
          type: 'streamableHttp',
          headers: { Authorization: 'Bearer ' + TOKEN_RAW },
          alwaysAllow: [],
          disabled: false
        }}}, null, 2);
      }
    },
    {
      id: 'antigravity',
      label: 'Antigravity / Gemini',
      icon: '🚀',
      hint: _t('mcp.hint_antigravity'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          command: 'mcp-proxy',
          args: ['--transport', 'streamablehttp', '-H', 'Authorization', 'Bearer ' + TOKEN_RAW, mcpUrl]
        }}}, null, 2);
      },
      guide: function() {
        var snip = JSON.stringify({ mcpServers: { haca: {
          command: 'mcp-proxy',
          args: ['--transport', 'streamablehttp', '-H', 'Authorization', 'Bearer ' + TOKEN_RAW, mcpUrl]
        }}}, null, 2);
        return '<div style="background:rgba(33,150,243,0.08);border:1px solid rgba(33,150,243,0.25);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;line-height:1.6;color:var(--primary-text-color);">' +
          _t('mcp.guide_proxy_info') +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px;">1. ' + _t('mcp.guide_install_proxy') + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">' +
          '<div style="background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;">' +
            '<div style="font-size:11px;font-weight:600;color:var(--secondary-text-color);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Windows</div>' +
            '<code style="font-size:12px;">pip install mcp-proxy</code>' +
          '</div>' +
          '<div style="background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;">' +
            '<div style="font-size:11px;font-weight:600;color:var(--secondary-text-color);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">macOS / Linux</div>' +
            '<code style="font-size:12px;">pip install mcp-proxy</code>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px;">2. ' + _t('mcp.guide_paste_json') + '</div>' +
        '<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:14px;">' +
          '<pre style="flex:1;font-size:11px;margin:0;overflow-x:auto;white-space:pre-wrap;background:var(--secondary-background-color);border-radius:8px;padding:10px 14px;">' + escM(snip) + '</pre>' +
          '<button class="icon-btn guide-copy-btn" style="flex-shrink:0;margin-top:2px;" title="' + _t('mcp.copy') + '">' + _i('content-copy',16) + '</button>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:4px;">3. ' + _t('mcp.guide_paste_in_agent') + '</div>' +
        '<div style="font-size:13px;color:var(--secondary-text-color);">' + _t('mcp.guide_antigravity_detail') + '</div>';
      }
    },
    {
      id: 'continue',
      label: 'Continue.dev',
      icon: '🔷',
      hint: _t('mcp.hint_continue'),
      snippet: function() {
        // Continue.dev uses experimental.modelContextProtocolServers in config.json.
        // type must be "streamable-http" (not "http").
        // Auth headers go inside requestOptions.headers (not directly in transport).
        return JSON.stringify({ experimental: { modelContextProtocolServers: [{
          transport: {
            type: 'streamable-http',
            url: mcpUrl,
            requestOptions: {
              headers: { Authorization: 'Bearer ' + TOKEN_RAW }
            }
          }
        }]}}, null, 2);
      }
    },
    {
      id: 'openwebui',
      label: 'Open WebUI',
      icon: '🌐',
      hint: _t('mcp.hint_openwebui'),
      snippet: function() {
        return 'MCP Server URL : ' + mcpUrl + '\n\nHeader :\nAuthorization: Bearer ' + TOKEN_RAW;
      }
    },
    {
      id: 'n8n',
      label: 'n8n',
      icon: '🔁',
      hint: _t('mcp.hint_n8n'),
      snippet: function() {
        return 'URL   : ' + mcpUrl + '\nHeader: Authorization: Bearer ' + TOKEN_RAW + '\nMethod: POST  Content-Type: application/json';
      }
    },
    {
      id: 'raw-http',
      label: 'HTTP / REST',
      icon: '🔌',
      hint: _t('mcp.hint_http'),
      snippet: function() {
        return 'POST ' + mcpUrl + '\nContent-Type: application/json\nAuthorization: Bearer ' + TOKEN_RAW + '\n\n{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/list",\n  "params": {}\n}';
      }
    },
    {
      id: 'gemini-cli',
      label: 'Gemini CLI',
      icon: '✨',
      hint: _t('mcp.hint_gemini'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          httpUrl: mcpUrl,
          headers: { Authorization: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
  ];
}

// Global switch helper — called via onclick="window._hacaAgentSwitch('id')" in HTML
// Works inside Shadow DOM via the stored reference
var _hacaAgentSwitchContainer = null;

function _hacaAgentSwitch(id) {
  var container = _hacaAgentSwitchContainer;
  if (!container) return;
  var cfg = _agentConfigsCache.find(function(a){ return a.id === id; });
  if (!cfg) return;

  var simpleEl = container.querySelector('#agent-simple');
  var guideEl  = container.querySelector('#agent-guide');

  if (cfg.guide) {
    // Expanded guide mode
    if (simpleEl) simpleEl.style.display = 'none';
    if (guideEl) {
      guideEl.style.display = 'block';
      guideEl.innerHTML = cfg.guide();
      // Attach copy handler on guide copy button
      var copyBtn = guideEl.querySelector('.guide-copy-btn');
      if (copyBtn) {
        var pre = guideEl.querySelector('pre');
        copyBtn.addEventListener('click', function() {
          _hacaCopy(pre ? pre.textContent : '');
        });
      }
    }
  } else {
    // Simple hint + snippet mode
    if (guideEl) guideEl.style.display = 'none';
    if (simpleEl) simpleEl.style.display = 'block';
    var snippetEl = container.querySelector('#agent-snippet');
    var hintEl    = container.querySelector('#agent-hint');
    if (snippetEl) snippetEl.textContent = cfg.snippet();
    if (hintEl)    hintEl.textContent    = cfg.hint;
  }

  container.querySelectorAll('[data-agent-tab]').forEach(function(b) {
    var active = b.dataset.agentTab === id;
    b.style.fontWeight   = active ? '700' : '500';
    b.style.background   = active ? 'var(--primary-color)' : 'var(--card-background-color)';
    b.style.color        = active ? 'white' : 'var(--secondary-text-color)';
    b.style.borderColor  = active ? 'var(--primary-color)' : 'var(--divider-color)';
  });
}


function renderMcpSection(mcpStatus, agentStatus, t) {
  var _i = window._icon || function(n,s){return '';};

  function _t(key, fallback) {
    var result = (typeof t === 'function') ? t(key) : key;
    return (result === key && fallback) ? fallback : result;
  }
  function escM(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  var mcpUrl    = (mcpStatus  && mcpStatus.full_url) || '/api/haca_mcp';
  var mcpSnippet = (mcpStatus && mcpStatus.claude_code_snippet) || '';
  var agentActive    = agentStatus && agentStatus.active;
  var correlations   = (agentStatus && agentStatus.correlations) || [];
  var lastReport     = (agentStatus && agentStatus.last_weekly_report) || null;

  // ── Tool categories — toutes les 58 fonctions _tool_* ─────────────────
  var toolCategories = [
    {
      icon: '📊', key: 'mcp.cat_audit', fallback: 'Audit HACA',
      color: '',
      tools: ['haca_get_score','haca_get_issues','haca_get_automation',
              'haca_fix_suggestion','haca_apply_fix','haca_get_batteries','haca_explain_issue']
    },
    {
      icon: '🔍', key: 'mcp.cat_discovery', fallback: 'Recherche & Découverte',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_get_entities','ha_deep_search','ha_get_entity_detail',
              'ha_list_services','ha_get_score','ha_get_issues','ha_get_batteries']
    },
    {
      icon: '⚡', key: 'mcp.cat_control', fallback: 'Contrôle',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_call_service','ha_reload_core','ha_rename_entity',
              'ha_enable_entity','ha_remove_entity','ha_manage_entity_labels',
              'ha_list_labels','ha_create_label']
    },
    {
      icon: '🤖', key: 'mcp.cat_automations', fallback: 'Automations & Scripts',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_get_automation','ha_create_automation','ha_update_automation','ha_remove_automation',
              'ha_get_script','ha_create_script','ha_update_script','ha_remove_script',
              'ha_get_automation_traces']
    },
    {
      icon: '📐', key: 'mcp.cat_blueprints', fallback: 'Blueprints',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_list_blueprints','ha_get_blueprint','ha_create_blueprint',
              'ha_import_blueprint','ha_update_blueprint','ha_remove_blueprint']
    },
    {
      icon: '🎨', key: 'mcp.cat_scenes', fallback: 'Scènes',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_get_scene','ha_create_scene','ha_update_scene','ha_remove_scene']
    },
    {
      icon: '🖥️', key: 'mcp.cat_dashboard', fallback: 'Tableaux de bord',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_get_lovelace','ha_list_dashboards','ha_add_lovelace_card',
              'ha_update_lovelace_card','ha_remove_lovelace_card']
    },
    {
      icon: '📈', key: 'mcp.cat_monitoring', fallback: 'Monitoring & Historique',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_get_history','ha_get_statistics','ha_get_logbook',
              'ha_get_system_health','ha_get_updates']
    },
    {
      icon: '🧩', key: 'mcp.cat_helpers', fallback: 'Helpers & Zones',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_config_list_helpers','ha_config_set_helper','ha_config_remove_helper',
              'ha_get_helper','ha_update_helper',
              'ha_config_set_area']
    },
    {
      icon: '⚙️', key: 'mcp.cat_config', fallback: 'Fichiers de configuration',
      color: 'rgba(var(--rgb-primary-color),0.07)',
      tools: ['ha_get_config_file','ha_update_config_file']
    },
    {
      icon: '🛡️', key: 'mcp.cat_safety', fallback: 'Sécurité & Validation',
      color: 'rgba(33,150,243,0.08)',
      tools: ['ha_backup_create','ha_check_config','ha_eval_template',
              'ha_fix_suggestion','ha_apply_fix','ha_explain_issue']
    },
  ];

  var toolBadge = function(name, color) {
    return '<span style="display:inline-block;font-size:10px;font-family:monospace;background:' +
      (color || 'var(--secondary-background-color)') +
      ';border:1px solid var(--divider-color);border-radius:4px;padding:2px 6px;margin:2px;">' +
      escM(name) + '</span>';
  };

  var categoriesHtml = toolCategories.map(function(cat) {
    var badges = cat.tools.map(function(n){ return toolBadge(n, cat.color); }).join('');
    return '<div style="margin-bottom:10px;">' +
      '<div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:5px;font-weight:600;">' +
        cat.icon + ' ' + _t(cat.key, cat.fallback) +
      '</div>' +
      '<div style="flex-wrap:wrap;display:flex;gap:2px;">' + badges + '</div>' +
    '</div>';
  }).join('');

  // Corrélations
  var correlationsHtml = '';
  if (correlations.length > 0) {
    correlationsHtml = '<div style="margin-top:12px;">' +
      '<div style="font-weight:500;font-size:13px;margin-bottom:8px;">🔗 ' +
        _t('mcp.correlations_detected') + ' (' + correlations.length + ')' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
        correlations.slice(0,3).map(function(c) {
          return '<div style="background:var(--secondary-background-color);padding:8px 12px;border-radius:8px;font-size:13px;">' +
            (c.severity === 'high' ? '🔴' : '🟡') + ' ' + escM(c.message || '') + '</div>';
        }).join('') +
      '</div></div>';
  }

  // ── Agent config pills grid ──────────────────────────────────────────────
  // Build configs with the now-known mcpUrl and local _t
  _agentConfigsCache = _buildAgentConfigs(mcpUrl, _t);

  function buildAgentTabs(containerId) {
    var cfgs = _agentConfigsCache;
    var firstCfg = cfgs[0];

    // Pills grid — flex-wrap, all 12 visible in 3-4 rows
    var pillsHtml = cfgs.map(function(ag, i) {
      var active = i === 0;
      var onclick = 'window._hacaAgentSwitch(\'' + ag.id + '\')';
      return '<button data-agent-tab="' + ag.id + '" onclick="' + onclick + '"' +
        ' style="padding:5px 10px;font-size:11px;font-weight:' + (active ? '700' : '500') + ';' +
        'border-radius:20px;border:1px solid ' + (active ? 'var(--primary-color)' : 'var(--divider-color)') + ';' +
        'background:' + (active ? 'var(--primary-color)' : 'var(--card-background-color)') + ';' +
        'color:' + (active ? 'white' : 'var(--secondary-text-color)') + ';' +
        'cursor:pointer;white-space:nowrap;transition:all 0.15s;">' +
        ag.icon + ' ' + ag.label +
        '</button>';
    }).join('');

    return '<div id="' + containerId + '">' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' +
        pillsHtml +
      '</div>' +
      '<div id="agent-simple">' +
        '<div id="agent-hint" style="font-size:11px;color:var(--secondary-text-color);margin-bottom:8px;min-height:16px;">' +
          escM(firstCfg.hint) +
        '</div>' +
        '<div style="display:flex;align-items:flex-start;gap:6px;">' +
          '<pre id="agent-snippet" style="flex:1;font-size:11px;margin:0;overflow-x:auto;overflow-y:visible;white-space:pre-wrap;' +
            'background:var(--secondary-background-color);border-radius:8px;padding:10px 14px;">' +
            escM(firstCfg.snippet()) +
          '</pre>' +
          '<button id="agent-copy-btn" class="icon-btn" title="' + _t('mcp.copy') + '"' +
            ' style="flex-shrink:0;margin-top:2px;">' +
            _i('content-copy', 16) +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div id="agent-guide" style="display:none;"></div>' +
    '</div>';
  }

  var snippetHtml = buildAgentTabs('agent-config-tabs');

  // Dernier rapport
  var lastReportHtml = '';
  if (lastReport) {
    lastReportHtml =
      '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:8px;">' +
        _t('agent.last_report','Dernier rapport') + ': ' + new Date(lastReport).toLocaleDateString() +
      '</div>';
  }

  return (
    // ── Serveur MCP ─────────────────────────────────────────────────────────
    '<div class="cfg-section" style="margin-top:8px;">' +
      '<div class="cfg-section-title">' + _i('puzzle',18) + ' ' +
        _t('mcp.title') +
        ' <span style="font-size:11px;background:var(--primary-color);color:white;' +
        'padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;">v1.6.2</span>' +
      '</div>' +
      '<p style="margin:6px 0 14px;font-size:13px;color:var(--secondary-text-color);">' +
        _t('mcp.subtitle') +
      '</p>' +

      // IP warning
      '<div style="background:rgba(255,152,0,0.08);border:1px solid rgba(255,152,0,0.3);border-radius:10px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:flex-start;gap:8px;">' +
        '<span style="font-size:16px;flex-shrink:0;">⚠️</span>' +
        '<span style="font-size:12px;color:var(--primary-text-color);line-height:1.5;">' +
          _t('mcp.ip_warning') +
        '</span>' +
      '</div>' +

      // Endpoint
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;">' +
          _t('mcp.endpoint_label') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<code style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
            escM(mcpUrl) + '</code>' +
          '<button class="icon-btn" data-copy-url="' + escM(mcpUrl) + '" title="' + _t('mcp.copy') + '">' + _i('content-copy',16) + '</button>' +
        '</div>' +
      '</div>' +

      // Auth — lien correct vers /profile/security
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;">' +
          _t('mcp.auth_label') +
        '</div>' +
        '<code style="font-size:12px;">Authorization: Bearer &lt;' +
          _t('mcp.long_lived_token') + '&gt;</code>' +
        '<div style="font-size:12px;color:var(--secondary-text-color);margin-top:6px;">' +
          _t('mcp.token_hint') +
          ' <a href="/profile/security" target="_top" style="color:var(--primary-color);text-decoration:underline;">' +
          escM(_t('mcp.token_link')) + '</a>' +
        '</div>' +
      '</div>' +

      // Agent config tabs
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;font-weight:600;margin-bottom:10px;">' +
          _i('connection',14) + ' ' + _t('mcp.agent_configs_title') +
        '</div>' +
        snippetHtml +
      '</div>' +

      // Tool categories
      '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:8px;font-weight:600;">' +
        _t('mcp.tools_exposed') +
        ' <span style="font-weight:400;opacity:0.7;">(' + _t('mcp.tools_count_label') + ')</span>' +
      '</div>' +
      categoriesHtml +

    '</div>' +

    // ── Agent IA Proactif ────────────────────────────────────────────────────
    '<div class="cfg-section" style="margin-top:8px;">' +
      '<div class="cfg-section-title">' + _i('robot-happy-outline',18) + ' ' +
        _t('agent.title','Agent IA Proactif') +
        ' <span style="font-size:11px;background:' +
          (agentActive ? 'var(--success-color,#4caf50)' : 'var(--disabled-color,#9e9e9e)') +
          ';color:white;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;">' +
          (agentActive ? _t('agent.active','Actif') : _t('agent.inactive','Inactif')) +
        '</span>' +
      '</div>' +
      '<p style="margin:6px 0 12px;font-size:13px;color:var(--secondary-text-color);">' +
        _t('agent.subtitle','Analyse en arrière-plan, corrélations d\'issues et rapport automatique.') +
      '</p>' +

      // Bandeau configuration LLM API
      '<div style="background:rgba(var(--rgb-primary-color,33,150,243),0.07);border:1px solid rgba(var(--rgb-primary-color,33,150,243),0.2);border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
        '<span style="font-size:18px;flex-shrink:0;">⚙️</span>' +
        '<div style="flex:1;min-width:160px;">' +
          '<div style="font-size:12px;font-weight:700;color:var(--primary-text-color);margin-bottom:2px;">' +
            _t('chat.setup_title','Configuration requise') +
          '</div>' +
          '<div style="font-size:11px;color:var(--secondary-text-color);">' +
            _t('chat.setup_steps','Paramètres → Assistants vocaux → [votre agent] → LLM API → HACA') +
          '</div>' +
        '</div>' +
        '<a href="/config/voice-assistants" target="_top" style="font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;background:var(--primary-color);color:white;text-decoration:none;white-space:nowrap;display:flex;align-items:center;gap:4px;flex-shrink:0;">' +
          _t('chat.setup_link','Ouvrir les Assistants vocaux') +
        '</a>' +
      '</div>' +

      // Fréquence du rapport automatique
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">' +
          _i('calendar-clock',14) + ' ' + _t('agent.report_freq_label','Fréquence du rapport automatique') +
        '</div>' +
        '<select id="agent-report-freq" style="width:100%;padding:8px 12px;border-radius:8px;' +
          'border:1px solid var(--divider-color);background:var(--card-background-color);' +
          'color:var(--primary-text-color);font-size:13px;cursor:pointer;">' +
          '<option value="daily"'   + (agentStatus && agentStatus.report_frequency === 'daily'   ? ' selected' : '') + '>' + _t('agent.freq_daily',  'Quotidien') + '</option>' +
          '<option value="weekly"'  + (!agentStatus || !agentStatus.report_frequency || agentStatus.report_frequency === 'weekly'  ? ' selected' : '') + '>' + _t('agent.freq_weekly', 'Hebdomadaire (défaut)') + '</option>' +
          '<option value="monthly"' + (agentStatus && agentStatus.report_frequency === 'monthly' ? ' selected' : '') + '>' + _t('agent.freq_monthly','Mensuel') + '</option>' +
          '<option value="never"'   + (agentStatus && agentStatus.report_frequency === 'never'   ? ' selected' : '') + '>' + _t('agent.freq_never',  'Jamais (désactivé)') + '</option>' +
        '</select>' +
        '<div style="font-size:11px;color:var(--secondary-text-color);margin-top:6px;">' +
          _t('agent.report_freq_hint','La vérification a lieu toutes les heures. Le rapport est envoyé dès que la fréquence choisie est atteinte.') +
        '</div>' +
      '</div>' +

      lastReportHtml +
      correlationsHtml +
      '<button class="cfg-btn cfg-btn-secondary" id="force-weekly-report-btn" ' +
        'style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;">' +
        _i('bell-ring-outline',16) + ' ' +
        _t('agent.force_report','Générer le rapport maintenant') +
      '</button>' +
      '<div id="force-report-status" style="font-size:12px;color:var(--secondary-text-color);margin-top:8px;"></div>' +
    '</div>'
  );
}

// ── Gestion du bouton "Forcer rapport" (appelé depuis core.js) ────────────

function wireForceReportButton(shadowRoot, hass, t) {
  var btn = shadowRoot.querySelector('#force-weekly-report-btn');
  if (!btn || btn._wiredForceReport) return;
  btn._wiredForceReport = true;

  btn.addEventListener('click', async function() {
    var _i = window._icon || function(n,s){return '';};
    var statusEl = shadowRoot.querySelector('#force-report-status');
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-loader"></span> ' + t('agent.generating');
    if (statusEl) statusEl.textContent = '';

    try {
      var result = await new Promise(function(resolve, reject) {
        hass.connection.sendMessagePromise({type: 'haca/agent_force_report'})
          .then(resolve).catch(reject);
      });

      btn.disabled = false;
      btn.innerHTML = _i('bell-ring-outline',16) + ' ' + t('agent.force_report');

      if (result && result.success) {
        if (result.markdown) {
          _downloadMdReport(result.markdown, result.filename || 'haca_report.md');
        }
        if (statusEl) {
          statusEl.innerHTML = '✅ ' + t('agent.force_report_done') +
            (result.filename ? ' <strong>' + result.filename + '</strong> ' + t('agent.force_report_downloaded') : '') +
            '<br><span style="color:var(--secondary-text-color);">' + t('agent.force_report_notif') + '</span>';
        }
      }
    } catch(err) {
      btn.disabled = false;
      btn.innerHTML = _i('bell-ring-outline',16) + ' ' + t('agent.force_report');
      if (statusEl) statusEl.textContent = '❌ ' + t('agent.force_report_error') + ' ' + (err.message || err);
    }
  });
}

function _downloadMdReport(markdown, filename) {
  try {
    var blob = new Blob([markdown], {type: 'text/markdown;charset=utf-8'});
    var url  = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || ('haca_report_' + new Date().toISOString().slice(0,10) + '.md');
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  } catch(e) {
    console.warn('[HACA] MD download error:', e);
  }
}

