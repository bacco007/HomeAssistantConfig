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
        serviceData = { automation_id: automation_id, location: issue.location || null };
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
        if (!response.changes_count) {
          // Entity could not be resolved — show informative message instead of empty diff
          modal._updateContent(`
            <div style="padding:24px;">
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;border-bottom:1px solid var(--divider-color);padding-bottom:16px;">
                ${_icon("alert-circle-outline", 36)}
                <div>
                  <h2 style="margin:0;">${this.t('modals.cannot_auto_fix')}</h2>
                  <div style="font-size:13px;opacity:0.7;">${issue.entity_id}</div>
                </div>
              </div>
              <div style="background:rgba(255,167,38,0.1);padding:16px;border-radius:10px;border-left:4px solid var(--warning-color,#ffa726);margin-bottom:20px;font-size:14px;line-height:1.6;">
                ${this.t('fix.cannot_resolve_entity')}
              </div>
              <div style="display:flex;justify-content:flex-end;gap:12px;">
                <button style="background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px 18px;cursor:pointer;"
                  onclick="this.closest('.haca-modal').remove()">${this.t('actions.close')}</button>
                ${this.getHAEditUrl(issue.entity_id) ? `<a href="${this.getHAEditUrl(issue.entity_id)}" target="_blank" style="text-decoration:none;">
                  <button style="background:var(--primary-color);color:#fff;border:none;border-radius:8px;padding:8px 18px;cursor:pointer;">
                    ${_icon('pencil')} ${this.t('modals.open_editor')}
                  </button></a>` : ''}
              </div>
            </div>`);
        } else {
          this.renderDiffModal(modal, response, issue, service, serviceData);
        }
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

