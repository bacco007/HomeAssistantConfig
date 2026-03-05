  // ═══════════════════════════════════════════════════════════════════════
  //  AUDIT HISTORY
  // ═══════════════════════════════════════════════════════════════════════

  async _loadSparkline() {
    if (this._sparklineLoading) return;
    this._sparklineLoading = true;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_history', limit: 30 });
      const history = result.history || [];
      this._renderSparkline(history);
      this._renderHealthTrend(history);
    } catch (e) {
      // Non-fatal — sparkline is decorative
    } finally {
      this._sparklineLoading = false;
    }
  }

  _renderSparkline(history) {
    const svg = this.shadowRoot.querySelector('#sparkline-svg');
    if (!svg || history.length < 2) return;

    const scores = history.map(h => h.score);
    const W = svg.clientWidth || 200;
    const H = 52;
    const pad = 4;
    const minS = Math.max(0, Math.min(...scores) - 5);
    const maxS = Math.min(100, Math.max(...scores) + 5);
    const range = maxS - minS || 1;

    const xs = scores.map((_, i) => pad + (i / (scores.length - 1)) * (W - pad * 2));
    const ys = scores.map(s => H - pad - ((s - minS) / range) * (H - pad * 2));

    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
    const area = `M${xs[0]},${H} ` + xs.map((x, i) => `L${x},${ys[i]}`).join(' ') + ` L${xs[xs.length-1]},${H} Z`;

    const col = 'var(--primary-color)';
    svg.innerHTML = `
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${col}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#sparkGrad)"/>
      <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>
      ${xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="2.5" fill="${col}" opacity="0.7"/>`).join('')}
    `;
  }

  _renderHealthTrend(history) {
    const el = this.shadowRoot.querySelector('#health-score-trend');
    if (!el || history.length < 2) return;
    const last  = history[history.length - 1].score;
    const prev  = history[history.length - 2].score;
    const delta = last - prev;
    if (delta === 0) {
      el.textContent = this.t('history.stable');
      el.style.color = 'var(--secondary-text-color)';
    } else if (delta > 0) {
      el.textContent = this.t('history.trend_up').replace('{delta}', delta);
      el.style.color = 'var(--success-color,#4caf50)';
    } else {
      el.textContent = this.t('history.trend_down').replace('{delta}', delta);
      el.style.color = 'var(--error-color,#ef5350)';
    }
  }

  async loadHistory() {
    const rangeEl = this.shadowRoot.querySelector('#history-range');
    const limit = parseInt(rangeEl?.value || '30');

    try {
      const result = await this._hass.callWS({ type: 'haca/get_history', limit });
      const history = result.history || [];
      this._renderHistoryChart(history);
      this._renderHistorySummary(history);
      this._renderHistoryTable(history);
    } catch (e) {
      const tbody = this.shadowRoot.querySelector('#history-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--error-color);">${this.t('history.error')}${e.message}</td></tr>`;
    }
  }

  _renderHistoryChart(history) {
    const svg = this.shadowRoot.querySelector('#history-chart-svg');
    if (!svg || history.length < 2) return;

    const W = svg.clientWidth || 600;
    const H = 180;
    const padL = 40, padR = 12, padT = 12, padB = 8;
    const scores = history.map(h => h.score);
    const minS = 0, maxS = 100;

    const toX = i => padL + (i / (scores.length - 1)) * (W - padL - padR);
    const toY = s => padT + ((maxS - s) / (maxS - minS)) * (H - padT - padB);

    const xs = scores.map((_, i) => toX(i));
    const ys = scores.map(s => toY(s));

    // Grid lines at 0, 25, 50, 75, 100
    const grid = [0, 25, 50, 75, 100].map(v => {
      const y = toY(v);
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"
        stroke="var(--divider-color)" stroke-width="0.5" stroke-dasharray="${v === 0 || v === 100 ? '' : '3,3'}"/>
        <text x="${padL - 4}" y="${y}" text-anchor="end" font-size="9"
          fill="var(--secondary-text-color)" dominant-baseline="middle">${v}</text>`;
    }).join('');

    const area = `M${xs[0]},${H - padB} ` + xs.map((x, i) => `L${x},${ys[i]}`).join(' ')
      + ` L${xs[xs.length-1]},${H - padB} Z`;
    const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');

    // Dots with hit areas
    const dots = xs.map((x, i) => {
      const s = scores[i];
      const col = s >= 80 ? '#4caf50' : s >= 50 ? '#ffa726' : '#ef5350';
      return `<circle class="hist-dot" cx="${x}" cy="${ys[i]}" r="4"
        fill="${col}" stroke="var(--card-background-color)" stroke-width="2"
        data-idx="${i}" style="cursor:pointer;"/>`;
    }).join('');

    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0.02"/>
        </linearGradient>
        <clipPath id="chartClip">
          <rect x="${padL}" y="${padT}" width="${W - padL - padR}" height="${H - padT - padB}"/>
        </clipPath>
      </defs>
      ${grid}
      <g clip-path="url(#chartClip)">
        <path d="${area}" fill="url(#chartGrad)"/>
        <path d="${line}" fill="none" stroke="var(--primary-color)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      </g>
      ${dots}
    `;

    // Tooltip on dot hover
    const tooltip = this.shadowRoot.querySelector('#history-tooltip');
    svg.querySelectorAll('.hist-dot').forEach(dot => {
      const _posTooltip = (e) => {
        const tipW = tooltip.offsetWidth || 180;
        const tipH = tooltip.offsetHeight || 64;
        // e.offsetX/Y gives coordinates relative to the SVG element — no getBoundingClientRect needed
        const mx = e.offsetX;
        const my = e.offsetY;
        const svgW = svg.clientWidth  || 600;
        const svgH = svg.clientHeight || 300;
        let left = mx + 14;
        if (left + tipW > svgW - 4) left = mx - tipW - 14;
        left = Math.max(4, left);
        let top = my - tipH - 8;
        if (top < 4) top = my + 18;
        top = Math.min(svgH - tipH - 4, Math.max(4, top));
        tooltip.style.left = `${left}px`;
        tooltip.style.top  = `${top}px`;
      };
      dot.addEventListener('mouseenter', (e) => {
        const idx = parseInt(dot.dataset.idx);
        const entry = history[idx];
        if (!tooltip || !entry) return;
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div style="font-weight:700;margin-bottom:4px;">${entry.date} ${entry.time}</div>
          <div>${this.t('history.score_tooltip')} <strong style="color:${scores[idx] >= 80 ? '#4caf50' : scores[idx] >= 50 ? '#ffa726' : '#ef5350'}">${entry.score}%</strong></div>
          <div style="color:var(--secondary-text-color);font-size:11px;margin-top:2px;">${this.t('history.issues_total').replace('{total}', entry.total)}</div>`;
        _posTooltip(e);
      });
      dot.addEventListener('mousemove', (e) => { if (tooltip.style.display !== 'none') _posTooltip(e); });
      dot.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.display = 'none';
      });
    });

    // X-axis labels (show ~5 evenly spaced)
    const xLabels = this.shadowRoot.querySelector('#history-x-labels');
    if (xLabels) {
      const step = Math.max(1, Math.floor(history.length / 5));
      const labelItems = history
        .filter((_, i) => i % step === 0 || i === history.length - 1)
        .map(h => `<span>${h.date.slice(5)}</span>`)
        .join('');
      xLabels.innerHTML = labelItems;
    }
  }

  _renderHistorySummary(history) {
    const el = this.shadowRoot.querySelector('#history-summary');
    if (!el || history.length === 0) return;

    const scores = history.map(h => h.score);
    const latest = history[history.length - 1];
    const best   = Math.max(...scores);
    const worst  = Math.min(...scores);
    const avg    = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const trend7 = history.length >= 7
      ? latest.score - history[history.length - 7].score : null;

    const card = (icon, label, value, color='var(--primary-text-color)') =>
      `<div style="background:var(--secondary-background-color);border-radius:10px;padding:12px 14px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--secondary-text-color);letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
        <div style="font-size:22px;font-weight:700;color:${color};">${value}</div>
      </div>`;

    el.innerHTML = [
      card('mdi:star', this.t('history.best'), best + '%', '#4caf50'),
      card('mdi:alert', this.t('history.worst'), worst + '%', worst < 50 ? '#ef5350' : 'var(--primary-text-color)'),
      card('mdi:approximately-equal', this.t('history.avg'), avg + '%'),
      trend7 !== null
        ? card('mdi:trending-up', this.t('history.trend_7d'),
            (trend7 >= 0 ? '+' : '') + trend7 + ' pts',
            trend7 > 0 ? '#4caf50' : trend7 < 0 ? '#ef5350' : 'var(--secondary-text-color)')
        : '',
      card('mdi:counter', this.t('history.scans'), history.length),
    ].join('');
  }

  _renderHistoryTable(history) {
    const tbody = this.shadowRoot.querySelector('#history-tbody');
    if (!tbody) return;

    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('history.no_data')}</td></tr>`;
      this._updateHistoryDeleteBar();
      return;
    }

    // Most recent first
    const reversed = [...history].reverse();

    // ── Pagination ──────────────────────────────────────────────────────
    const PAG_ID = 'history-tbody';
    const st = this._pagState(PAG_ID);
    const paged = this._pagSlice(reversed, st.page, st.pageSize);

    tbody.innerHTML = paged.map((entry, i) => {
      const prev = reversed[i + 1];
      const delta = prev ? entry.score - prev.score : null;
      const deltaStr = delta === null ? '—'
        : delta > 0 ? `<span style="color:#4caf50">▲ +${delta}</span>`
        : delta < 0 ? `<span style="color:#ef5350">▼ ${delta}</span>`
        : '<span style="color:var(--secondary-text-color)">→</span>';

      const scoreCol = entry.score >= 80 ? '#4caf50' : entry.score >= 50 ? '#ffa726' : '#ef5350';
      const bg = i === 0 ? 'background:rgba(var(--rgb-primary-color,33,150,243),0.05);' : '';
      const tsEsc = (entry.ts || '').replace(/"/g, '&quot;');

      return `<tr style="${bg}border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 10px;">
          <input type="checkbox" class="history-cb" data-ts="${tsEsc}" style="cursor:pointer;">
        </td>
        <td style="padding:8px 10px;">${entry.date} <span style="color:var(--secondary-text-color);font-size:11px;">${entry.time}</span></td>
        <td style="padding:8px 10px;text-align:center;font-weight:700;color:${scoreCol};">${entry.score}%</td>
        <td style="padding:8px 10px;text-align:center;">${deltaStr}</td>
        <td style="padding:8px 10px;text-align:center;">${entry.total ?? '—'}</td>
      </tr>`;
    }).join('');

    // Stocker les données pour le "tout supprimer"
    tbody._historyData = history;

    // Listeners checkboxes
    this._attachHistoryDeleteListeners(history);
    this._updateHistoryDeleteBar();

    // Barre de pagination
    // tbody.parentElement = <table> (pas de .table-wrap ici)
    // La barre est insérée APRÈS <table> comme sibling → supprimer dans le parent
    const tableEl = tbody.closest('table') || tbody.parentElement;
    const tableParent = tableEl?.parentElement;
    if (tableParent) {
      // Supprimer toutes les barres existantes dans le parent (évite l'accumulation)
      tableParent.querySelectorAll('.pag-bar[data-pag-id="history-tbody"]')
        .forEach(el => el.remove());
      tableEl.insertAdjacentHTML('afterend',
        this._pagHTML(PAG_ID, reversed.length, st.page, st.pageSize)
      );
      this._pagWire(tableParent, () => this._renderHistoryTable(history));
    }
  }

  _attachHistoryDeleteListeners(history) {
    // Select-all
    const selAll = this.shadowRoot.querySelector('#history-select-all');
    if (selAll) {
      selAll.onchange = () => {
        this.shadowRoot.querySelectorAll('.history-cb').forEach(cb => { cb.checked = selAll.checked; });
        this._updateHistoryDeleteBar();
      };
    }

    // Individual checkboxes
    this.shadowRoot.querySelectorAll('.history-cb').forEach(cb => {
      cb.onchange = () => {
        const all = this.shadowRoot.querySelectorAll('.history-cb');
        const checked = this.shadowRoot.querySelectorAll('.history-cb:checked');
        const selAllEl = this.shadowRoot.querySelector('#history-select-all');
        if (selAllEl) {
          selAllEl.checked = checked.length === all.length;
          selAllEl.indeterminate = checked.length > 0 && checked.length < all.length;
        }
        this._updateHistoryDeleteBar();
      };
    });

    // Delete selected
    const delBtn = this.shadowRoot.querySelector('#history-delete-selected');
    if (delBtn) {
      delBtn.onclick = () => this._deleteSelectedHistory();
    }

    // Delete all
    const delAllBtn = this.shadowRoot.querySelector('#history-delete-all');
    if (delAllBtn) {
      delAllBtn.onclick = () => this._deleteAllHistory(history);
    }
  }

  _updateHistoryDeleteBar() {
    const bar = this.shadowRoot.querySelector('#history-delete-bar');
    const countEl = this.shadowRoot.querySelector('#history-selected-count');
    if (!bar) return;
    const checked = this.shadowRoot.querySelectorAll('.history-cb:checked');
    const total = this.shadowRoot.querySelectorAll('.history-cb');
    if (checked.length > 0) {
      bar.style.display = 'flex';
      if (countEl) countEl.textContent = this.t('history.entries_selected').replace('{count}', checked.length).replace('{total}', total.length);
    } else {
      bar.style.display = 'none';
    }
  }

  async _deleteSelectedHistory() {
    const checked = [...this.shadowRoot.querySelectorAll('.history-cb:checked')];
    if (checked.length === 0) return;
    const timestamps = checked.map(cb => cb.dataset.ts).filter(Boolean);
    if (!confirm(this.t('history.confirm_delete').replace('{count}', timestamps.length))) return;
    await this._doDeleteHistory(timestamps);
  }

  async _deleteAllHistory(history) {
    const total = history.length;
    if (!confirm(this.t('history.confirm_delete_all').replace('{total}', total))) return;
    const timestamps = history.map(e => e.ts).filter(Boolean);
    await this._doDeleteHistory(timestamps);
  }

  async _doDeleteHistory(timestamps) {
    try {
      const result = await this._hass.callWS({
        type: 'haca/delete_history',
        timestamps,
      });
      const deleted = result?.deleted ?? timestamps.length;
      // Recharger l'historique
      await this.loadHistory();
      // Feedback rapide
      const bar = this.shadowRoot.querySelector('#history-delete-bar');
      if (bar) {
        const msg = document.createElement('span');
        msg.style.cssText = 'color:var(--success-color,#4caf50);font-size:13px;font-weight:600;';
        msg.textContent = this.t('history.deleted').replace('{count}', deleted);
        bar.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
      }
    } catch (e) {
      alert(this.t('history.delete_error') + e.message);
    }
  }

