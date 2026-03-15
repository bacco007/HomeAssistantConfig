  // ═══════════════════════════════════════════════════════════════════
  //  RECORDER IMPACT — _renderRecorderImpact
  // ═══════════════════════════════════════════════════════════════════

  async loadRecorderImpact() {
    const container = this.shadowRoot.querySelector('#recorder-impact-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">${_icon('loading', 20)} ${this.t('recorder_impact.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_recorder_impact' });
      this._renderRecorderImpact(result);
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('recorder_impact.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderRecorderImpact(data) {
    const container = this.shadowRoot.querySelector('#recorder-impact-container');
    if (!container) return;

    const top10      = data.top10 || [];
    const excludes   = data.exclude_suggestions || [];
    const totalWrites = data.total_writes_per_day || 0;
    const mbPerYear  = data.estimated_mb_per_year || 0;
    const mbSaved    = data.total_mb_saved || 0;

    if (!top10.length) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--secondary-text-color);">${this.t('recorder_impact.no_data')}</div>`;
      return;
    }

    // Summary bar
    const summaryHtml = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 14px;flex:1;min-width:140px;border:1px solid var(--divider-color);">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--secondary-text-color);letter-spacing:0.5px;">${this.t('recorder_impact.total_writes_day')}</div>
          <div style="font-size:22px;font-weight:800;">${totalWrites.toLocaleString()}</div>
        </div>
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 14px;flex:1;min-width:140px;border:1px solid var(--divider-color);">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--secondary-text-color);letter-spacing:0.5px;">${this.t('recorder_impact.est_mb_year')}</div>
          <div style="font-size:22px;font-weight:800;">${mbPerYear} MB</div>
        </div>
        ${mbSaved > 0 ? `<div style="background:rgba(76,175,80,0.1);border-radius:8px;padding:8px 14px;flex:1;min-width:140px;border:1px solid rgba(76,175,80,0.3);">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#4caf50;letter-spacing:0.5px;">${this.t('recorder_impact.potential_saved')}</div>
          <div style="font-size:22px;font-weight:800;color:#4caf50;">${mbSaved} MB/an</div>
        </div>` : ''}
      </div>`;

    // Top 10 table
    const maxWrites = top10[0]?.writes_per_day || 1;
    const tableRows = top10.map((a, i) => {
      const barPct = Math.round(a.writes_per_day / maxWrites * 100);
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
      return `<tr style="border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 6px;text-align:center;font-size:14px;">${rank}</td>
        <td style="padding:8px 10px;max-width:240px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(a.alias)}">${this.escapeHtml(a.alias)}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(a.entity_id)}</div>
          <div style="margin-top:4px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
            <div style="width:${barPct}%;height:100%;background:${i < 3 ? '#ef5350' : '#ffa726'};border-radius:2px;"></div>
          </div>
        </td>
        <td style="padding:8px 10px;text-align:center;font-weight:700;">${a.writes_per_day}/j</td>
        <td style="padding:8px 10px;text-align:center;font-size:12px;color:var(--secondary-text-color);">${a.mb_per_year} MB/an</td>
        <td style="padding:8px 10px;text-align:center;font-size:12px;">${a.trigger_freq}/j</td>
      </tr>`;
    }).join('');

    // Exclude suggestions
    const excludeHtml = excludes.length ? `
      <h4 style="margin:20px 0 10px;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;">
        ${_icon('database-off-outline', 16)} ${this.t('recorder_impact.exclude_title')}
      </h4>
      <div style="background:rgba(76,175,80,0.08);border-radius:10px;padding:14px;border:1px solid rgba(76,175,80,0.2);">
        ${excludes.slice(0, 10).map(s => `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--divider-color);">
            ${_icon('code-tags', 14, '#4caf50')}
            <code style="flex:1;font-size:12px;">${this.escapeHtml(s.entity_id)}</code>
            <span style="font-size:12px;color:var(--secondary-text-color);">${s.writes_per_day}/j</span>
            <span style="font-size:12px;color:#4caf50;font-weight:600;">−${s.mb_saved_per_year} MB/an</span>
          </div>`).join('')}
        <div style="margin-top:12px;">
          <button id="copy-recorder-yaml-btn" style="background:var(--primary-color);color:#fff;border:none;border-radius:8px;padding:7px 14px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
            ${_icon('content-copy', 14)} ${this.t('recorder_impact.copy_yaml')}
          </button>
        </div>
      </div>` : '';

    container.innerHTML = summaryHtml + `
      <h4 style="margin:0 0 10px;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;">
        ${_icon('database-alert-outline', 16)} ${this.t('recorder_impact.top10_title')}
      </h4>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid var(--divider-color);">
            <th style="padding:8px 6px;font-size:12px;color:var(--secondary-text-color);">#</th>
            <th style="text-align:left;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_automation')}</th>
            <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_writes')}</th>
            <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_size')}</th>
            <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${this.t('recorder_impact.col_freq')}</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${excludeHtml}`;

    // Wire copy YAML button
    const copyBtn = container.querySelector('#copy-recorder-yaml-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const yaml = excludes.map(s => `      - ${s.entity_id}`).join('\n');
        const full = `recorder:\n  exclude:\n    entities:\n${yaml}`;
        navigator.clipboard?.writeText(full).then(() => {
          copyBtn.textContent = '✓ ' + this.t('recorder_impact.copied');
          setTimeout(() => {
            copyBtn.innerHTML = `${_icon('content-copy', 14)} ${this.t('recorder_impact.copy_yaml')}`;
          }, 2000);
        });
      };
    }
  }

