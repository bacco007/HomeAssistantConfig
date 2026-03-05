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
