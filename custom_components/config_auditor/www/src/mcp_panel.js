// ── mcp_panel.js ──────────────────────────────────────────────────────────
// Section MCP Server + Agent IA dans l'onglet Configuration
// v1.5.0 — agent config tabs (12 agents, grille pills)
// ──────────────────────────────────────────────────────────────────────────

// Token placeholder (never changes)
var TOKEN_RAW = '<YOUR_HA_TOKEN>';

// ── Agent config factory ─────────────────────────────────────────────────
// Called with (mcpUrl, _t) from inside renderMcpSection.
// Result is cached in _agentConfigsCache for _hacaAgentSwitch.
var _agentConfigsCache = [];

function _buildAgentConfigs(mcpUrl, _t) {
  return [
    {
      id: 'claude-code',
      label: 'Claude Code',
      icon: '⬛',
      hint: _t('mcp.hint_claude_code', 'Fichier : ~/.claude/claude_desktop_config.json  (ou --mcp-config pour Claude Code CLI)'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          command: 'npx', args: ['-y','@modelcontextprotocol/server-proxy'],
          env: { MCP_SERVER_URL: mcpUrl, MCP_AUTH_HEADER: 'Authorization: Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'claude-desktop',
      label: 'Claude Desktop',
      icon: '🖥️',
      hint: _t('mcp.hint_claude_desktop', 'Fichier : claude_desktop_config.json  (même format que Claude Code)'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          command: 'npx', args: ['-y','@modelcontextprotocol/server-proxy'],
          env: { MCP_SERVER_URL: mcpUrl, MCP_AUTH_HEADER: 'Authorization: Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'cursor',
      label: 'Cursor',
      icon: '🔵',
      hint: _t('mcp.hint_cursor', 'Cursor → Settings → Tools & MCP → + Add new MCP server  |  Fichier : ~/.cursor/mcp.json'),
      snippet: function() {
        // mcp-remote is the correct proxy for remote HTTP servers in Cursor.
        // The --header arg avoids spaces (Windows bug) via HA_TOKEN env var.
        return JSON.stringify({ mcpServers: { haca: {
          command: 'npx',
          args: ['mcp-remote', mcpUrl, '--header', 'Authorization:${HA_TOKEN}'],
          env: { HA_TOKEN: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'vscode',
      label: 'VS Code / Copilot',
      icon: '🟦',
      hint: _t('mcp.hint_vscode', 'GitHub Copilot Agent mode → .vscode/mcp.json  (Ctrl+Shift+P → "MCP: Open User Configuration")'),
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
      hint: _t('mcp.hint_windsurf', 'Windsurf → Cascade → MCP Servers → View raw config  |  Fichier : ~/.codeium/windsurf/mcp_config.json'),
      snippet: function() {
        // Windsurf supports remote HTTP natively via serverUrl — no npx proxy needed.
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
      hint: _t('mcp.hint_cline', 'VS Code → extension Cline → MCP Servers → Configure → cline_mcp_settings.json'),
      snippet: function() {
        // Cline uses "url" for HTTP servers. Note: Cline uses "streamableHttp" (camelCase),
        // not "streamable-http". The "url" key alone triggers HTTP transport detection.
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
      label: 'Antigravity',
      icon: '🚀',
      hint: _t('mcp.hint_antigravity', 'Google Antigravity → MCP Servers → Manage → View raw config → ~/.gemini/antigravity/mcp_config.json'),
      snippet: function() {
        return JSON.stringify({ mcpServers: { haca: {
          serverUrl: mcpUrl,
          headers: { Authorization: 'Bearer ' + TOKEN_RAW }
        }}}, null, 2);
      }
    },
    {
      id: 'continue',
      label: 'Continue.dev',
      icon: '🔷',
      hint: _t('mcp.hint_continue', 'Fichier : ~/.continue/config.json → section experimental.modelContextProtocolServers  (mode Agent requis)'),
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
      hint: _t('mcp.hint_openwebui', 'Admin Panel → Tools → MCP → Add Server → coller l\'URL et le header'),
      snippet: function() {
        return 'MCP Server URL : ' + mcpUrl + '\n\nHeader :\nAuthorization: Bearer ' + TOKEN_RAW;
      }
    },
    {
      id: 'n8n',
      label: 'n8n',
      icon: '🔁',
      hint: _t('mcp.hint_n8n', 'Node MCP Client Tool → URL + Auth Header (mode HTTP/SSE)'),
      snippet: function() {
        return 'URL   : ' + mcpUrl + '\nHeader: Authorization: Bearer ' + TOKEN_RAW + '\nMethod: POST  Content-Type: application/json';
      }
    },
    {
      id: 'raw-http',
      label: 'HTTP / REST',
      icon: '🔌',
      hint: _t('mcp.hint_http', 'Tout client HTTP : curl, Postman, Insomnia, etc.'),
      snippet: function() {
        return 'POST ' + mcpUrl + '\nContent-Type: application/json\nAuthorization: Bearer ' + TOKEN_RAW + '\n\n{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/list",\n  "params": {}\n}';
      }
    },
    {
      id: 'gemini-cli',
      label: 'Gemini CLI',
      icon: '✨',
      hint: _t('mcp.hint_gemini', 'Fichier : ~/.gemini/settings.json → section mcpServers'),
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

  var snippetEl = container.querySelector('#agent-snippet');
  var hintEl    = container.querySelector('#agent-hint');
  if (snippetEl) snippetEl.textContent = cfg.snippet();
  if (hintEl)    hintEl.textContent    = cfg.hint;

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
        _t('mcp.correlations_detected','Corrélations détectées') + ' (' + correlations.length + ')' +
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
      '<div id="agent-hint" style="font-size:11px;color:var(--secondary-text-color);margin-bottom:8px;min-height:16px;">' +
        escM(firstCfg.hint) +
      '</div>' +
      '<div style="display:flex;align-items:flex-start;gap:6px;">' +
        '<pre id="agent-snippet" style="flex:1;font-size:11px;margin:0;overflow-x:auto;overflow-y:visible;white-space:pre-wrap;' +
          'background:var(--secondary-background-color);border-radius:8px;padding:10px 14px;">' +
          escM(firstCfg.snippet()) +
        '</pre>' +
        '<button id="agent-copy-btn" class="icon-btn" title="' + _t('mcp.copy','Copier') + '"' +
          ' style="flex-shrink:0;margin-top:2px;" onclick="(function(){' +
            'var s=document.querySelector(\'haca-panel\').shadowRoot.querySelector(\'#agent-snippet\');' +
            'if(s)try{navigator.clipboard.writeText(s.textContent);}catch(e){}' +
          '})()">' +
          _i('content-copy', 16) +
        '</button>' +
      '</div>' +
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
        _t('mcp.title','Serveur MCP HACA') +
        ' <span style="font-size:11px;background:var(--primary-color);color:white;' +
        'padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;">v1.4.1</span>' +
      '</div>' +
      '<p style="margin:6px 0 14px;font-size:13px;color:var(--secondary-text-color);">' +
        _t('mcp.subtitle','Connectez Claude Code (ou tout agent IA compatible MCP) à votre HA : audit, création d\'automatisations, débogage, dashboards.') +
      '</p>' +

      // Endpoint
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;">' +
          _t('mcp.endpoint_label','Endpoint JSON-RPC 2.0') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<code style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
            escM(mcpUrl) + '</code>' +
          '<button class="icon-btn" onclick="(function(){try{navigator.clipboard.writeText(\'' +
            escM(mcpUrl) + '\');}catch(e){}})()" title="' + _t('mcp.copy') + '">' + _i('content-save',16) + '</button>' +
        '</div>' +
      '</div>' +

      // Auth — lien correct vers /profile/security
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;">' +
          _t('mcp.auth_label','Authentification') +
        '</div>' +
        '<code style="font-size:12px;">Authorization: Bearer &lt;' +
          _t('mcp.long_lived_token','Votre token HA longue durée') + '&gt;</code>' +
        '<div style="font-size:12px;color:var(--secondary-text-color);margin-top:6px;">' +
          _t('mcp.token_hint','Créez un token dans votre profil HA →') +
          ' <a href="/profile/security" target="_top" style="color:var(--primary-color);text-decoration:underline;">' +
          escM(_t('mcp.token_link','Profil → Sécurité')) + '</a>' +
        '</div>' +
      '</div>' +

      // Agent config tabs
      '<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
        '<div style="font-size:12px;font-weight:600;margin-bottom:10px;">' +
          _i('connection',14) + ' ' + _t('mcp.agent_configs_title', 'Configuration par agent IA') +
        '</div>' +
        snippetHtml +
      '</div>' +

      // Tool categories
      '<div style="font-size:12px;color:var(--secondary-text-color);margin-bottom:8px;font-weight:600;">' +
        _t('mcp.tools_exposed') +
        ' <span style="font-weight:400;opacity:0.7;">(' + _t('mcp.tools_count_label','65 outils') + ')</span>' +
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
