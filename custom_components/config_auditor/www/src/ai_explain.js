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
    const hid = issue.haca_id    || '';
    const ctx = issue.message
      ? `\n${this.t('diag_prompts.context_label')}: ${issue.message}` : '';
    const rec = issue.recommendation
      ? `\n${this.t('diag_prompts.rec_label')}: ${issue.recommendation}` : '';
    const idLine = hid ? `\n${this.t('diag_prompts.issue_id_label')}: ${hid}` : '';

    // ── diag() — YAML before/after diff ────────────────────────────────
    const diag = (readCmd, problemKey, hintKey = null) => {
      const problem  = this.t(`diag_prompts.problems.${problemKey}`, {eid, alias: a});
      const hintLine = hintKey
        ? `\n${this.t('diag_prompts.hint_prefix')} ${this.t(`diag_prompts.hints.${hintKey}`)}`
        : '';
      return [
        this.t('diag_prompts.marker'),
        `${this.t('diag_prompts.header', {alias: a, eid, problem})}${idLine}${ctx}${rec}`,
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
        `${this.t('diag_prompts.header', {alias: a, eid, problem})}${idLine}${ctx}${rec}`,
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
