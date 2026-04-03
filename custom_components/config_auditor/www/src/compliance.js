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
        (issue.haca_id ? '<div style="margin-top:4px;display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' +
          '<span style="font-size:9px;font-weight:600;color:var(--secondary-text-color);">ID =</span>' +
          '<code class="haca-id-badge-compl" data-haca-id="' + esc(issue.haca_id) + '" title="' + t('issues.click_to_copy_id') + '" style="font-size:9px;font-family:monospace;background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:4px;padding:2px 7px;color:var(--primary-text-color);cursor:pointer;display:inline-flex;align-items:center;gap:3px;line-height:14px;">' +
            _i('content-copy',9) + ' ' + esc(issue.haca_id) +
          '</code>' +
        '</div>' : '') +
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
