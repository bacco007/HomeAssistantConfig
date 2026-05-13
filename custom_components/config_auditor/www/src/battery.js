  // ═══════════════════════════════════════════════════════════════════
  //  BATTERY MONITOR — _renderBatteryTables · _applyBatteryFilter · _batRow
  // ═══════════════════════════════════════════════════════════════════

  _renderBatteryTables(list) {
    this._batteryList = list;
    this._batteryData = list;

    // ── Battery Notes detection ─────────────────────────────────────────
    // BN creates dedicated entities: sensor.*_battery_plus, sensor.*_battery_type,
    // sensor.*_battery_last_replaced. We detect their presence directly.
    const banner = this.shadowRoot.querySelector('#battery-notes-banner');
    if (banner && !this._bnBannerDismissed) {
      let bnInstalled = false;
      try {
        const states = (this.hass && this.hass.states) || {};
        for (const eid of Object.keys(states)) {
          if (eid.startsWith('sensor.') && (
            eid.endsWith('_battery_plus') ||
            eid.endsWith('_battery_last_replaced') ||
            eid.endsWith('_battery_type')
          )) { bnInstalled = true; break; }
        }
      } catch { /* ignore */ }
      banner.style.display = bnInstalled ? 'none' : '';
    }

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
            ${_icon(s.icon.replace("mdi:", ""), 18)}
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

    // Wire mark-as-replaced buttons
    tbody.querySelectorAll('.mark-replaced-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eid = btn.dataset.eid;
        if (!eid) return;
        btn.disabled = true;
        try {
          await this.hass.callWS({ type: 'haca/mark_battery_replaced', entity_id: eid });
          // Update local data and re-render
          const b = (this._batteryData || []).find(x => x.entity_id === eid);
          if (b) b.battery_last_replaced = new Date().toISOString();
          this._applyBatteryFilter(this._batLastFilter || 'all');
          this._showToast(this.t('battery.mark_replaced_done'));
        } catch (err) {
          btn.disabled = false;
          const msg = (err && (err.message || err.code || JSON.stringify(err))) || 'unknown';
          this._showToast(this.t('notifications.error') + ': ' + msg, 'error');
        }
      });
    });

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

    const btaq = b.battery_type_and_quantity || b.battery_type || '';
    const lastReplaced = b.battery_last_replaced ? new Date(b.battery_last_replaced).toLocaleDateString() : '';
    const typeCell = btaq
      ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(33,150,243,0.1);
           border:1px solid rgba(33,150,243,0.25);border-radius:6px;padding:2px 7px;font-size:12px;
           font-weight:700;color:var(--primary-color);white-space:nowrap;"
           title="${this.t('battery.battery_notes_tooltip')}">
           ${_icon('battery-unknown',12)} ${this.escapeHtml(btaq)}
         </span>`
      : `<span style="font-size:11px;color:var(--secondary-text-color);opacity:0.4;">—</span>`;
    const replCell = lastReplaced
      ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
           <span style="font-size:12px;color:var(--secondary-text-color);">${lastReplaced}</span>
           <button class="mark-replaced-btn" data-eid="${this.escapeHtml(b.entity_id)}"
             style="font-size:10px;background:none;border:1px solid var(--divider-color);border-radius:6px;padding:1px 6px;cursor:pointer;color:var(--secondary-text-color);"
             title="${this.t('battery.mark_replaced_tooltip')}">${this.t('battery.mark_replaced')}</button>
         </div>`
      : `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
           <span style="font-size:11px;color:var(--secondary-text-color);opacity:0.4;">${this.t('battery.never_replaced')}</span>
           <button class="mark-replaced-btn" data-eid="${this.escapeHtml(b.entity_id)}"
             style="font-size:10px;background:none;border:1px solid var(--divider-color);border-radius:6px;padding:1px 6px;cursor:pointer;color:var(--primary-color);"
             title="${this.t('battery.mark_replaced_tooltip')}">${this.t('battery.mark_replaced')}</button>
         </div>`;

    const mfrModel = [b.manufacturer, b.model].filter(Boolean).join(' ');
    const mfrCell = mfrModel
      ? `<div style="font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(mfrModel)}">${this.escapeHtml(mfrModel)}</div>`
      : `<span style="font-size:11px;color:var(--secondary-text-color);opacity:0.4;">—</span>`;

    return `<tr style="border-bottom:1px solid var(--divider-color);">
      <td style="padding:8px 10px;max-width:180px;">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(b.friendly_name)}">
          ${this.escapeHtml(b.friendly_name)}
        </div>
        <div style="font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(b.entity_id)}</div>
      </td>
      <td style="padding:8px 10px;max-width:130px;">${mfrCell}</td>
      <td style="padding:8px 10px;text-align:center;min-width:120px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <span style="font-weight:700;font-size:16px;color:${barColor};">${level.toFixed(0)} %</span>
          <div style="width:80px;height:6px;background:var(--divider-color);border-radius:3px;overflow:hidden;">
            <div style="width:${barPct}%;height:100%;background:${barColor};border-radius:3px;transition:width 0.4s;"></div>
          </div>
        </div>
      </td>
      <td style="padding:8px 10px;text-align:center;">${typeCell}</td>
      <td style="padding:8px 10px;text-align:center;">${replCell}</td>
      <td style="padding:8px 10px;text-align:center;">
        <span style="background:${statusBg};border-radius:8px;padding:3px 10px;font-size:12px;font-weight:600;white-space:nowrap;">${statusText}</span>
      </td>
    </tr>`;
  }
