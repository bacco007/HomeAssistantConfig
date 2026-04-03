  // ═══════════════════════════════════════════════════════════════════
  //  INTEGRATIONS — loadIntegrations · _renderIntegrations
  // ═══════════════════════════════════════════════════════════════════

  async loadIntegrations() {
    const container = this.shadowRoot.querySelector('#integrations-container');
    if (!container) return;
    if (this._integrationsLoaded) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">
      <div class="loader" style="margin:0 auto 8px;"></div>${this.t('integrations.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_integrations' });
      this._integrationsData = result;
      this._integrationsFilter = 'all';
      this._integrationsSort = 'name';
      this._integrationsSearch = '';
      this._integPageSize = 25;
      this._integPage = 0;
      this._renderIntegrationsShell(container);
      this._renderIntegrationsList(container);
      this._integrationsLoaded = true;
      // Update dashboard stat card
      const statEl = this.shadowRoot.querySelector('#integrations-count');
      if (statEl) statEl.textContent = String(result.total || 0);
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('integrations.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderIntegrationsShell(container) {
    if (!container || !this._integrationsData) return;
    const data = this._integrationsData;
    const t = (k, p) => this.t(k, p);
    const esc = (s) => this.escapeHtml(s);
    const filter = this._integrationsFilter || 'all';
    const sort = this._integrationsSort || 'name';
    const search = this._integrationsSearch || '';

    const statCard = (count, label, filterKey, color) => {
      const active = filter === filterKey ? 'border:2px solid ' + color + ';' : '';
      return `<div class="integ-stat-card" data-filter="${filterKey}" style="cursor:pointer;background:var(--card-background-color);border-radius:10px;padding:10px 16px;min-width:80px;text-align:center;${active}">
        <div style="font-size:22px;font-weight:700;color:${color};">${count}</div>
        <div style="font-size:11px;color:var(--secondary-text-color);margin-top:2px;">${esc(label)}</div>
      </div>`;
    };

    const statsHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        ${statCard(data.total, t('integrations.stat_total'), 'all', 'var(--primary-text-color)')}
        ${statCard(data.hacs_count, 'HACS', 'hacs', '#9c27b0')}
        ${statCard(data.core_count, 'Core', 'core', '#2196f3')}
        ${data.card_count ? statCard(data.card_count, t('integrations.stat_cards'), 'cards', '#e91e63') : ''}
        ${data.theme_count ? statCard(data.theme_count, t('integrations.stat_themes'), 'themes', '#4caf50') : ''}
        ${data.custom_count ? statCard(data.custom_count, 'Custom', 'custom', '#ff9800') : ''}
        ${data.app_count ? statCard(data.app_count, t('integrations.stat_apps'), 'apps', 'rgb(241,196,71)') : ''}
        ${statCard(data.unused_count, t('integrations.stat_unused'), 'unused', 'var(--error-color,#ef5350)')}
        ${data.update_count ? statCard(data.update_count, t('integrations.stat_updates'), 'updates', 'var(--warning-color,#ff9800)') : ''}
      </div>`;

    const hacsWarning = !data.hacs_available ? `
      <div style="background:rgba(255,152,0,0.1);border:1px solid rgba(255,152,0,0.3);border-radius:10px;padding:10px 16px;margin-bottom:14px;font-size:12px;color:var(--warning-color,#ff9800);display:flex;align-items:center;gap:8px;">
        ${_icon('alert', 16)} ${t('integrations.no_hacs')}
      </div>` : '';

    const supervisorWarning = !data.supervisor_available ? `
      <div style="background:rgba(241,196,71,0.1);border:1px solid rgba(241,196,71,0.3);border-radius:10px;padding:10px 16px;margin-bottom:14px;font-size:12px;color:rgb(200,160,40);display:flex;align-items:center;gap:8px;">
        ${_icon('alert', 16)} ${t('integrations.no_supervisor')}
      </div>` : '';

    const searchHtml = `
      <div style="margin-bottom:14px;display:flex;gap:8px;align-items:center;">
        <div style="flex:1;position:relative;">
          <input id="integ-search" type="text" placeholder="${t('integrations.search_placeholder')}"
            value="${esc(search)}"
            style="width:100%;padding:8px 12px 8px 34px;border:1px solid var(--divider-color);border-radius:8px;font-size:13px;background:var(--secondary-background-color);color:var(--primary-text-color);box-sizing:border-box;">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);opacity:0.5;">${_icon('magnify', 16)}</span>
        </div>
        <select id="integ-sort" style="padding:8px 12px;border:1px solid var(--divider-color);border-radius:8px;font-size:12px;background:var(--secondary-background-color);color:var(--primary-text-color);">
          <option value="name" ${sort === 'name' ? 'selected' : ''}>${t('integrations.sort_name')}</option>
          <option value="type" ${sort === 'type' ? 'selected' : ''}>${t('integrations.sort_type')}</option>
          <option value="entities" ${sort === 'entities' ? 'selected' : ''}>${t('integrations.sort_entities')}</option>
          <option value="age" ${sort === 'age' ? 'selected' : ''}>${t('integrations.sort_age')}</option>
        </select>
        <button id="integ-csv-btn" title="${t('integrations.export_csv')}" style="padding:6px 10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;">
          ${_icon('download', 14)} CSV
        </button>
        <button id="integ-md-btn" title="${t('integrations.export_md')}" style="padding:6px 10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;">
          ${_icon('download', 14)} MD
        </button>
      </div>`;

    container.innerHTML = statsHtml + hacsWarning + supervisorWarning + searchHtml +
      '<div id="integ-count-label" style="font-size:11px;color:var(--secondary-text-color);margin-bottom:8px;"></div>' +
      '<div id="integ-list"></div>' +
      '<div id="integ-pag" style="margin-top:12px;"></div>';

    // Wire stat cards
    container.querySelectorAll('.integ-stat-card').forEach(card => {
      card.addEventListener('click', () => {
        this._integrationsFilter = card.dataset.filter;
        this._integPage = 0;
        this._renderIntegrationsShell(container);
        this._renderIntegrationsList(container);
      });
    });

    // Wire search — only re-renders list, NOT shell → keeps focus
    const searchInput = container.querySelector('#integ-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._integrationsSearch = e.target.value;
        this._integPage = 0;
        this._renderIntegrationsList(container);
      });
      if (search) {
        searchInput.focus();
        searchInput.setSelectionRange(search.length, search.length);
      }
    }

    // Wire sort
    const sortSelect = container.querySelector('#integ-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this._integrationsSort = e.target.value;
        this._integPage = 0;
        this._renderIntegrationsList(container);
      });
    }

    // Wire CSV export
    const csvBtn = container.querySelector('#integ-csv-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => this._exportIntegrationsCSV());
    }
    const mdBtn = container.querySelector('#integ-md-btn');
    if (mdBtn) {
      mdBtn.addEventListener('click', () => this._exportIntegrationsMD());
    }
  }

  _renderIntegrationsList(container) {
    if (!container) container = this.shadowRoot.querySelector('#integrations-container');
    if (!container || !this._integrationsData) return;
    const data = this._integrationsData;
    const t = (k, p) => this.t(k, p);
    const esc = (s) => this.escapeHtml(s);

    const TYPE_CFG = {
      hacs:       { color: '#9c27b0', bg: 'rgba(156,39,176,0.08)', label: 'HACS',   icon: 'puzzle' },
      custom:     { color: '#ff9800', bg: 'rgba(255,152,0,0.08)',   label: 'CUSTOM', icon: 'code-tags' },
      core:       { color: '#2196f3', bg: 'rgba(33,150,243,0.08)',  label: 'CORE',   icon: 'home-assistant' },
      hacs_card:  { color: '#e91e63', bg: 'rgba(233,30,99,0.08)',   label: 'CARD',   icon: 'card-outline' },
      hacs_theme: { color: '#4caf50', bg: 'rgba(76,175,80,0.08)',   label: 'THEME',  icon: 'palette' },
      app:        { color: 'rgb(241,196,71)', bg: 'rgba(241,196,71,0.10)', label: 'APP', icon: 'package-variant' },
    };

    const filter = this._integrationsFilter || 'all';
    const search = (this._integrationsSearch || '').toLowerCase();
    let items = (data.integrations || []).slice();

    if (filter === 'hacs')     items = items.filter(i => i.type === 'hacs');
    if (filter === 'core')     items = items.filter(i => i.type === 'core');
    if (filter === 'cards')    items = items.filter(i => i.type === 'hacs_card');
    if (filter === 'themes')   items = items.filter(i => i.type === 'hacs_theme');
    if (filter === 'custom')   items = items.filter(i => i.type === 'custom');
    if (filter === 'apps')     items = items.filter(i => i.type === 'app');
    if (filter === 'unused')   items = items.filter(i => !i.in_use);
    if (filter === 'updates')  items = items.filter(i => i.update_available);

    if (search) {
      items = items.filter(i =>
        (i.name || '').toLowerCase().includes(search) ||
        (i.domain || '').toLowerCase().includes(search)
      );
    }

    const sort = this._integrationsSort || 'name';
    if (sort === 'name')     items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sort === 'type')     items.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    if (sort === 'entities') items.sort((a, b) => (b.entity_count || 0) - (a.entity_count || 0));
    if (sort === 'age')      items.sort((a, b) => (b.age_days || 0) - (a.age_days || 0));

    const total = items.length;
    const pageSize = this._integPageSize || 25;
    const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
    const page = Math.min(this._integPage || 0, maxPage);
    const paged = items.slice(page * pageSize, (page + 1) * pageSize);

    const countLabel = container.querySelector('#integ-count-label');
    if (countLabel) countLabel.textContent = t('integrations.showing', {count: total, total: data.total});

    const listEl = container.querySelector('#integ-list');
    if (!listEl) return;

    if (paged.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;padding:32px;color:var(--secondary-text-color);">${_icon('check-circle-outline', 36)}<div style="margin-top:8px;">${t('integrations.none_found')}</div></div>`;
    } else {
      listEl.innerHTML = paged.map(i => {
        const tc = TYPE_CFG[i.type] || TYPE_CFG.core;
        const useBadge = i.in_use
          ? `<span style="font-size:9px;background:var(--success-color,#4caf50);color:white;border-radius:4px;padding:2px 7px;font-weight:600;">${t('integrations.in_use')}</span>`
          : `<span style="font-size:9px;background:var(--error-color,#ef5350);color:white;border-radius:4px;padding:2px 7px;font-weight:600;">${t('integrations.unused')}</span>`;
        const updateBadge = i.update_available
          ? `<span style="font-size:9px;background:var(--warning-color,#ff9800);color:white;border-radius:4px;padding:2px 7px;font-weight:600;">${_icon('arrow-up-circle',9)} ${esc(i.available_version)}</span>`
          : '';
        const isOrphan = (i.entity_count > 0 && i.config_entries === 0 && !i.in_use);
        const orphanBadge = isOrphan
          ? `<span style="font-size:9px;background:#ff5722;color:white;border-radius:4px;padding:2px 7px;font-weight:600;" title="${t('integrations.orphan_tooltip')}">${_icon('alert',9)} ${t('integrations.orphan')}</span>`
          : '';
        const ageTxt = i.age_days != null ? t('integrations.age_days', {days: i.age_days}) : '';
        const docLink = i.documentation
          ? `<a href="${esc(i.documentation)}" target="_blank" rel="noopener" style="color:var(--primary-color);text-decoration:none;font-size:11px;display:inline-flex;align-items:center;gap:3px;">${_icon('open-in-new',11)} ${t('integrations.docs')}</a>`
          : '';
        const settingsLink = i.type !== 'hacs_theme' && i.type !== 'hacs_card' && i.in_use
          ? `<a href="/config/integrations/integration/${esc(i.domain)}" target="_top" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:4px 9px;cursor:pointer;font-size:11px;display:inline-flex;align-items:center;gap:3px;">${_icon('cog-outline',11)} ${t('integrations.settings')}</button></a>`
          : '';
        const aiBtn = (!i.in_use || isOrphan)
          ? `<button class="integ-ai-btn" data-domain="${esc(i.domain)}" data-name="${esc(i.name)}" data-type="${esc(i.type)}" data-entities="${i.entity_count}"
              style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:4px 9px;cursor:pointer;font-size:11px;display:inline-flex;align-items:center;gap:3px;">
              ${_icon('robot',11)} ${t('integrations.ask_ai')}
            </button>`
          : '';

        return `
        <div style="background:${tc.bg};border:1px solid var(--divider-color);border-left:3px solid ${tc.color};border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="flex-shrink:0;width:36px;height:36px;border-radius:8px;background:${tc.color};color:white;display:flex;align-items:center;justify-content:center;">
            ${_icon(tc.icon, 20)}
          </div>
          <div style="flex:1;min-width:160px;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-weight:600;font-size:13px;">${esc(i.name)}</span>
              <span style="font-size:9px;background:${tc.color};color:white;border-radius:4px;padding:1px 6px;font-weight:600;">${tc.label}</span>
              ${useBadge}
              ${updateBadge}
              ${orphanBadge}
            </div>
            <div style="font-size:11px;color:var(--secondary-text-color);margin-top:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-family:monospace;">${esc(i.domain)}</span>
              ${i.version ? `<span>v${esc(i.version)}</span>` : ''}
              ${i.entity_count ? `<span>${_icon('counter',10)} ${i.entity_count} ${t('integrations.entities')}</span>` : ''}
              ${ageTxt ? `<span>${_icon('calendar-outline',10)} ${esc(ageTxt)}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;flex-wrap:wrap;">
            ${docLink}
            ${settingsLink}
            ${aiBtn}
          </div>
        </div>`;
      }).join('');
    }

    // Pagination controls
    const pagEl = container.querySelector('#integ-pag');
    if (pagEl && total > pageSize) {
      const totalPages = maxPage + 1;
      pagEl.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;">
          <button class="integ-pag-btn" data-page="${page - 1}" ${page <= 0 ? 'disabled' : ''}
            style="padding:5px 12px;border:1px solid var(--divider-color);border-radius:6px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer;font-size:12px;">
            ${_icon('chevron-left', 14)}
          </button>
          <span style="font-size:12px;color:var(--secondary-text-color);">${page + 1} / ${totalPages}</span>
          <button class="integ-pag-btn" data-page="${page + 1}" ${page >= maxPage ? 'disabled' : ''}
            style="padding:5px 12px;border:1px solid var(--divider-color);border-radius:6px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer;font-size:12px;">
            ${_icon('chevron-right', 14)}
          </button>
        </div>`;
      pagEl.querySelectorAll('.integ-pag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = parseInt(btn.dataset.page, 10);
          if (p >= 0 && p <= maxPage) {
            this._integPage = p;
            this._renderIntegrationsList(container);
          }
        });
      });
    } else if (pagEl) {
      pagEl.innerHTML = '';
    }

    // Wire AI buttons
    listEl.querySelectorAll('.integ-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._askAIAboutIntegration(btn.dataset.domain, btn.dataset.name, btn.dataset.type, btn.dataset.entities);
      });
    });
  }

  _askAIAboutIntegration(domain, name, type, entityCount) {
    const t = (k, p) => this.t(k, p);
    const prompt = [
      t('diag_prompts.marker'),
      t('integrations.ai_prompt_header', {name: name, domain: domain}),
      t('integrations.ai_prompt_type', {type: type}),
      parseInt(entityCount, 10) > 0
        ? t('integrations.ai_prompt_orphan', {count: entityCount})
        : t('integrations.ai_prompt_unused'),
      '',
      t('integrations.ai_prompt_instructions'),
    ].join('\n');
    this._openChatWithMessage(prompt);
  }

  _exportIntegrationsCSV() {
    if (!this._integrationsData) return;
    const items = this._integrationsData.integrations || [];
    const headers = ['name', 'domain', 'type', 'version', 'available_version', 'in_use', 'entity_count', 'config_entries', 'age_days', 'documentation'];
    const csvRows = [headers.join(',')];
    for (const i of items) {
      const row = headers.map(h => {
        let v = i[h];
        if (v === true) v = 'yes';
        if (v === false) v = 'no';
        if (v == null) v = '';
        return '"' + String(v).replace(/"/g, '""') + '"';
      });
      csvRows.push(row.join(','));
    }
    const csv = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'haca_integrations.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 200);
  }

  _exportIntegrationsMD() {
    if (!this._integrationsData) return;
    const data = this._integrationsData;
    const items = data.integrations || [];
    const typeLabel = { hacs: 'HACS', custom: 'CUSTOM', core: 'CORE', hacs_card: 'CARD', hacs_theme: 'THEME', app: 'APP' };

    const lines = [];
    lines.push('# HACA — Integration Monitor Report');
    lines.push('');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total integrations | ${data.total} |`);
    lines.push(`| HACS integrations | ${data.hacs_count} |`);
    lines.push(`| Core integrations | ${data.core_count} |`);
    if (data.custom_count) lines.push(`| Custom integrations | ${data.custom_count} |`);
    if (data.card_count) lines.push(`| HACS cards | ${data.card_count} |`);
    if (data.theme_count) lines.push(`| HACS themes | ${data.theme_count} |`);
    if (data.app_count) lines.push(`| Apps (add-ons) | ${data.app_count} |`);
    lines.push(`| **Unused** | **${data.unused_count}** |`);
    if (data.update_count) lines.push(`| Updates available | ${data.update_count} |`);
    lines.push('');

    // Group by type
    const groups = {};
    for (const i of items) {
      const t = i.type || 'unknown';
      if (!groups[t]) groups[t] = [];
      groups[t].push(i);
    }

    for (const [type, list] of Object.entries(groups)) {
      lines.push(`## ${typeLabel[type] || type.toUpperCase()} (${list.length})`);
      lines.push('');
      lines.push('| Name | Domain | Version | Status | Entities | Age |');
      lines.push('|------|--------|---------|--------|----------|-----|');
      for (const i of list) {
        const status = i.in_use ? '✅ In use' : '❌ Unused';
        const age = i.age_days != null ? `${i.age_days}d` : '—';
        const ver = i.version || '—';
        const upd = i.update_available ? ` → ${i.available_version}` : '';
        lines.push(`| ${i.name} | \`${i.domain}\` | ${ver}${upd} | ${status} | ${i.entity_count || 0} | ${age} |`);
      }
      lines.push('');
    }

    // Unused section
    const unused = items.filter(i => !i.in_use);
    if (unused.length > 0) {
      lines.push('## ⚠️ Unused Integrations');
      lines.push('');
      for (const i of unused) {
        const orphan = (i.entity_count > 0 && i.config_entries === 0) ? ' — ⚠️ ORPHAN ENTITIES' : '';
        lines.push(`- **${i.name}** (\`${i.domain}\`) — ${typeLabel[i.type] || i.type}${i.entity_count ? `, ${i.entity_count} entities` : ''}${orphan}`);
      }
      lines.push('');
    }

    const md = lines.join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'haca_integrations.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 200);
  }
