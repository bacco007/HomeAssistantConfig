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
                <div style="margin-top:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    ${i.haca_id ? `<span style="display:inline-flex;align-items:center;gap:4px;line-height:16px;"><span style="font-size:10px;font-weight:600;color:var(--secondary-text-color);">ID =</span><code class="haca-id-badge" title="${this.t('issues.click_to_copy_id')}" data-haca-id="${this.escapeHtml(i.haca_id)}" style="font-size:10px;font-family:monospace;background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:4px;padding:2px 8px;color:var(--primary-text-color);cursor:pointer;display:inline-flex;align-items:center;gap:4px;line-height:16px;">${_icon('content-copy',10)} ${this.escapeHtml(i.haca_id)}</code></span>` : ''}
                    ${isFixable
                      ? `<span style="font-size:9px;background:var(--success-color,#4caf50);color:white;border-radius:4px;padding:2px 7px;font-weight:700;display:inline-flex;align-items:center;gap:3px;line-height:16px;">${_icon('wrench',10)} ${this.t('issues.fixable')}</span>`
                      : `<span style="font-size:9px;background:var(--disabled-color,#9e9e9e);color:white;border-radius:4px;padding:2px 7px;font-weight:600;display:inline-flex;align-items:center;gap:3px;line-height:16px;">${_icon('wrench-off',10)} ${this.t('issues.not_fixable')}</span>`
                    }
                </div>
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

    // Click-to-copy for HACA issue IDs
    container.querySelectorAll('.haca-id-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.hacaId;
        if (id) {
          window._hacaCopyId(id,
            (msg) => this._showToast(msg),
            this.t('issues.id_copied', {id: id})
          );
        }
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
