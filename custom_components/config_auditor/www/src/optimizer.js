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
