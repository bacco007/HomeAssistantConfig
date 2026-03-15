  // ═══════════════════════════════════════════════════════════════════
  //  BATTERY PREDICTION — _renderBatteryPredictions · _renderPredictChart
  // ═══════════════════════════════════════════════════════════════════

  async loadBatteryPredictions() {
    const container = this.shadowRoot.querySelector('#bat-predict-container');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">${_icon('loading', 20)} ${this.t('battery_predict.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_battery_predictions' });
      this._batteryPredictions = result.predictions || [];
      this._renderBatteryPredictions(this._batteryPredictions, result.alert_7d || 0);
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('battery_predict.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  async _exportBatteryCSV() {
    try {
      const result = await this._hass.callWS({ type: 'haca/export_battery_csv' });
      const csv = result.csv || '';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'haca_battery_history.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(this.t('battery_predict.export_error') + e.message);
    }
  }

  _renderBatteryPredictions(predictions, alert7d) {
    const container = this.shadowRoot.querySelector('#bat-predict-container');
    if (!container) return;

    if (!predictions || predictions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--secondary-text-color);">
          ${_icon('chart-timeline-variant', 32)}
          <div style="margin-top:8px;">${this.t('battery_predict.no_data')}</div>
          <div style="font-size:12px;margin-top:4px;opacity:0.7;">${this.t('battery_predict.no_data_hint')}</div>
        </div>`;
      return;
    }

    const alertOnes = predictions.filter(p => p.alert_7d);
    const normalOnes = predictions.filter(p => !p.alert_7d && p.days_to_critical !== null);
    const unknownOnes = predictions.filter(p => p.days_to_critical === null);

    // Banner if J-7 alerts exist
    const banner = alert7d > 0 ? `
      <div style="background:rgba(239,83,80,0.12);border:1px solid #ef5350;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">
        ${_icon('battery-alert', 22, '#ef5350')}
        <span style="color:#ef5350;font-weight:700;">
          ${this.t('battery_predict.alert_banner').replace('{count}', alert7d)}
        </span>
      </div>` : '';

    // Summary bar
    const summaryBar = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
        <div style="background:rgba(239,83,80,0.1);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#ef5350;letter-spacing:0.5px;">${this.t('battery_predict.stat_alert7d')}</div>
          <div style="font-size:24px;font-weight:800;color:#ef5350;">${alert7d}</div>
        </div>
        <div style="background:rgba(255,167,38,0.1);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#ffa726;letter-spacing:0.5px;">${this.t('battery_predict.stat_tracked')}</div>
          <div style="font-size:24px;font-weight:800;color:#ffa726;">${predictions.length}</div>
        </div>
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;display:flex;align-items:center;justify-content:flex-end;">
          <button id="bat-export-csv-btn" style="background:var(--primary-color);color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
            ${_icon('download', 16)} ${this.t('battery_predict.export_csv')}
          </button>
        </div>
      </div>`;

    // Predictions table
    const rows = [...alertOnes, ...normalOnes, ...unknownOnes].map(p => this._predRow(p)).join('');

    container.innerHTML = banner + summaryBar + `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid var(--divider-color);">
              <th style="text-align:left;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_device')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_current')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_slope')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_trend')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_predicted_date')}</th>
              <th style="text-align:center;padding:8px 10px;font-size:12px;color:var(--secondary-text-color);font-weight:600;">${this.t('battery_predict.col_days')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Wire CSV export button
    const csvBtn = container.querySelector('#bat-export-csv-btn');
    if (csvBtn) csvBtn.onclick = () => this._exportBatteryCSV();

    // Wire sparkline clicks
    container.querySelectorAll('[data-predict-sparkline]').forEach(el => {
      const eid = el.dataset.predictSparkline;
      const pred = predictions.find(p => p.entity_id === eid);
      if (pred) el.onclick = () => this._showPredictModal(pred);
    });
  }

  _predRow(p) {
    const alert7d  = p.alert_7d;
    const noData   = p.days_to_critical === null;
    const charging = p.slope_per_day > 0;

    const rowBg = alert7d ? 'background:rgba(239,83,80,0.05);' : '';

    let statusCell;
    if (noData || charging) {
      statusCell = `<span style="color:var(--secondary-text-color);font-size:12px;">—</span>`;
    } else if (alert7d) {
      statusCell = `<span style="background:rgba(239,83,80,0.15);color:#ef5350;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:700;">${this.t('battery_predict.urgent')}</span>`;
    } else {
      statusCell = `<span style="background:rgba(76,175,80,0.1);color:#4caf50;border-radius:6px;padding:2px 8px;font-size:12px;">${this.t('battery_predict.ok')}</span>`;
    }

    const slopeColor = p.slope_per_day < -2 ? '#ef5350' : p.slope_per_day < 0 ? '#ffa726' : '#4caf50';
    const slopeStr = noData ? '—' : `${p.slope_per_day > 0 ? '+' : ''}${p.slope_per_day}%/j`;

    const daysStr = noData ? '—'
      : p.days_to_critical === 0 ? '<span style="color:#ef5350;font-weight:700;">⚠ Maintenant</span>'
      : `${Math.ceil(p.days_to_critical)} j`;

    const dateStr = p.predicted_date ? p.predicted_date.slice(0, 10) : '—';

    // Mini sparkline
    const sparkHtml = this._miniSparkline(p.history_points || [], p.alert_7d, p.days_to_critical);

    return `<tr style="${rowBg}border-bottom:1px solid var(--divider-color);">
      <td style="padding:8px 10px;">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" title="${this.escapeHtml(p.friendly_name)}">${this.escapeHtml(p.friendly_name)}</div>
        <div style="font-size:11px;color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis;max-width:200px;">${this.escapeHtml(p.entity_id)}</div>
      </td>
      <td style="padding:8px 10px;text-align:center;font-weight:700;">${p.current_level}%</td>
      <td style="padding:8px 10px;text-align:center;font-weight:600;color:${slopeColor};">${slopeStr}</td>
      <td style="padding:8px 10px;text-align:center;cursor:pointer;" data-predict-sparkline="${this.escapeHtml(p.entity_id)}" title="${this.t('battery_predict.click_detail')}">
        ${sparkHtml}
      </td>
      <td style="padding:8px 10px;text-align:center;font-size:13px;">${dateStr}</td>
      <td style="padding:8px 10px;text-align:center;">${daysStr}</td>
    </tr>`;
  }

  _miniSparkline(points, alert7d, daysLeft) {
    if (!points || points.length < 2) return '<span style="color:var(--secondary-text-color);font-size:11px;">N/A</span>';
    const W = 80, H = 28, pad = 2;
    const xs = points.map(p => p.day);
    const ys = points.map(p => p.level);
    const minX = Math.min(...xs), maxX = Math.max(...xs) || 1;
    const minY = Math.max(0, Math.min(...ys) - 5), maxY = Math.min(100, Math.max(...ys) + 5);
    const rangeY = maxY - minY || 1;
    const toX = x => pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2);
    const toY = y => (H - pad) - ((y - minY) / rangeY) * (H - pad * 2);
    const lineColor = alert7d ? '#ef5350' : daysLeft === null ? '#4caf50' : '#ffa726';
    const pts = points.map(p => `${toX(p.day).toFixed(1)},${toY(p.level).toFixed(1)}`).join(' ');
    return `<svg width="${W}" height="${H}" style="overflow:visible;"><polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }

  _showPredictModal(pred) {
    const modal = this.shadowRoot.querySelector('#predict-detail-modal');
    if (!modal) return;

    const W = 400, H = 180, padL = 36, padR = 12, padT = 16, padB = 24;
    const points = pred.history_points || [];
    if (points.length < 2) { modal.style.display = 'none'; return; }

    const xs = points.map(p => p.day);
    const ys = points.map(p => p.level);
    const minX = Math.min(...xs), maxX = Math.max(...xs, 7);
    const minY = 0, maxY = 100;
    const toX = x => padL + ((x - minX) / (maxX - minX || 1)) * (W - padL - padR);
    const toY = y => padT + ((maxY - y) / (maxY - minY)) * (H - padT - padB);

    // Regression line projection
    const lastX = xs[xs.length - 1];
    const projEnd = pred.days_to_critical !== null ? Math.min(lastX + Math.ceil(pred.days_to_critical) + 3, lastX + 30) : lastX + 14;
    const intcpt = pred.current_level;
    const slope  = pred.slope_per_day;

    const lineColor = pred.alert_7d ? '#ef5350' : '#ffa726';
    const pts = points.map(p => `${toX(p.day).toFixed(1)},${toY(p.level).toFixed(1)}`).join(' ');

    // Projection dashed line from last point to critical
    const projPts = [
      `${toX(0).toFixed(1)},${toY(Math.min(100, Math.max(0, intcpt))).toFixed(1)}`,
      `${toX(projEnd).toFixed(1)},${toY(Math.min(100, Math.max(0, intcpt + slope * projEnd))).toFixed(1)}`,
    ].join(' ');

    // Critical threshold line
    const critY = toY(10);
    const gridLines = [0, 25, 50, 75, 100].map(v => {
      const y = toY(v);
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--divider-color)" stroke-width="0.5" stroke-dasharray="${v ? '3,3' : ''}"/>
        <text x="${padL - 4}" y="${y}" text-anchor="end" font-size="8" fill="var(--secondary-text-color)" dominant-baseline="middle">${v}</text>`;
    }).join('');

    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;">
      ${gridLines}
      <line x1="${padL}" y1="${critY}" x2="${W - padR}" y2="${critY}" stroke="#ef5350" stroke-width="1" stroke-dasharray="4,2" opacity="0.6"/>
      <text x="${W - padR - 2}" y="${critY - 3}" text-anchor="end" font-size="8" fill="#ef5350">10%</text>
      <polyline points="${projPts}" fill="none" stroke="${lineColor}" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6"/>
      <polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${points.map(p => `<circle cx="${toX(p.day).toFixed(1)}" cy="${toY(p.level).toFixed(1)}" r="3" fill="${lineColor}" stroke="var(--card-background-color)" stroke-width="1.5"/>`).join('')}
    </svg>`;

    modal.querySelector('#predict-modal-title').textContent = pred.friendly_name;
    modal.querySelector('#predict-modal-chart').innerHTML = svg;
    modal.querySelector('#predict-modal-stats').innerHTML = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:13px;padding-top:8px;">
        <span>${this.t('battery_predict.col_current')}: <strong>${pred.current_level}%</strong></span>
        <span>${this.t('battery_predict.col_slope')}: <strong style="color:${pred.slope_per_day < 0 ? '#ef5350' : '#4caf50'}">${pred.slope_per_day > 0 ? '+' : ''}${pred.slope_per_day}%/j</strong></span>
        ${pred.predicted_date ? `<span>${this.t('battery_predict.col_predicted_date')}: <strong>${pred.predicted_date.slice(0,10)}</strong></span>` : ''}
        <span>R²: <strong>${pred.r2}</strong></span>
      </div>`;
    modal.style.display = 'flex';
  }

