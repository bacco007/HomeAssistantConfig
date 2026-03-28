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

    // ── Section Severity Filters ──
    '<div class="cfg-section" style="margin-top:4px;">' +
    '<div class="cfg-section-title">' + _icon("filter-variant", 18) + t('config.severity_filters_title') + '</div>' +
    '<div class="cfg-row-hint" style="margin-bottom:8px;">' + t('config.severity_filters_hint') + '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span style="color:var(--error-color,#ef5350);font-weight:600;">' + _icon("alert-circle", 14) + ' ' + t('config.severity_high') + '</span><span class="cfg-row-hint">' + t('config.severity_high_hint') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-notify-high"' + (options.notify_high_severity !== false ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span style="color:var(--warning-color,#ff9800);font-weight:600;">' + _icon("alert", 14) + ' ' + t('config.severity_medium') + '</span><span class="cfg-row-hint">' + t('config.severity_medium_hint') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-notify-medium"' + (options.notify_medium_severity === true ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
    '</div>' +
    '<div class="cfg-row">' +
    '<div class="cfg-row-label"><span style="color:var(--info-color,#26c6da);font-weight:600;">' + _icon("information-outline", 14) + ' ' + t('config.severity_low') + '</span><span class="cfg-row-hint">' + t('config.severity_low_hint') + '</span></div>' +
    '<label class="cfg-toggle"><input type="checkbox" id="cfg-notify-low"' + (options.notify_low_severity === true ? ' checked' : '') + '><span class="cfg-toggle-slider"></span></label>' +
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

    // ── Dashboard creation section ──
    `<div class="cfg-section" style="padding:16px 20px;">
      <div class="cfg-section-title">${_icon("view-dashboard-outline", 18)}${t('config.dashboard_section_title')}</div>
      <div class="cfg-row-hint" style="margin-top:8px;line-height:1.6;">${t('config.dashboard_section_hint')}</div>
      <div style="margin-top:14px;">
        <button class="cfg-btn cfg-btn-secondary" id="cfg-create-dashboard-btn" style="width:100%;">
          ${_icon("view-dashboard-outline", 18)} ${t('buttons.create_dashboard')}
        </button>
      </div>
      <div id="cfg-dashboard-status" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:0.88em;text-align:center;"></div>
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
  notify_high_severity: true,
  notify_medium_severity: false,
  notify_low_severity: false,
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
    notify_high_severity: bool('#cfg-notify-high', true),
    notify_medium_severity: bool('#cfg-notify-medium', false),
    notify_low_severity: bool('#cfg-notify-low', false),
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
