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

