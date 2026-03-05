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