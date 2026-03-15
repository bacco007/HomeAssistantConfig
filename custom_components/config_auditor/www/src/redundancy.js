  // ═══════════════════════════════════════════════════════════════════
  //  REDUNDANCY — loadRedundancy · _renderRedundancy
  // ═══════════════════════════════════════════════════════════════════

  async loadRedundancy() {
    const container = this.shadowRoot.querySelector('#redundancy-container');
    if (!container) return;
    if (this._redundancyLoaded) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">
      <div class="loader" style="margin:0 auto 8px;"></div>${this.t('redundancy.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_redundancy' });
      this._redundancyData = result;
      this._renderRedundancy(result);
      this._redundancyLoaded = true;
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('redundancy.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderRedundancy(data) {
    const container = this.shadowRoot.querySelector('#redundancy-container');
    if (!container) return;

    const blueprints = data.blueprint_matches   || [];
    const natives    = data.native_feature_matches || [];
    const overlaps   = data.trigger_overlaps    || [];
    const total      = data.total || (blueprints.length + natives.length + overlaps.length);

    if (!total) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--secondary-text-color);">
        <div style="font-size:36px;margin-bottom:12px;">✅</div>
        <div style="font-weight:600;">${this.t('redundancy.all_good')}</div></div>`;
      return;
    }

    // ── Summary bar ───────────────────────────────────────────────────
    const summaryHtml = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;">
        ${blueprints.length ? `<div style="background:rgba(156,39,176,0.08);border:1px solid rgba(156,39,176,0.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('blueprint', 14)} <span style="font-weight:700;color:#9c27b0;">${blueprints.length}</span> ${this.t('redundancy.type_blueprint')}
        </div>` : ''}
        ${natives.length ? `<div style="background:rgba(33,150,243,0.08);border:1px solid rgba(33,150,243,0.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('home-outline', 14)} <span style="font-weight:700;color:#2196f3;">${natives.length}</span> ${this.t('redundancy.type_native')}
        </div>` : ''}
        ${overlaps.length ? `<div style="background:rgba(255,87,34,0.08);border:1px solid rgba(255,87,34,0.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;">
          ${_icon('source-merge', 14)} <span style="font-weight:700;color:#ff5722;">${overlaps.length}</span> ${this.t('redundancy.type_overlap')}
        </div>` : ''}
      </div>`;

    // ── Blueprint candidates ──────────────────────────────────────────
    const bpHtml = blueprints.length ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9c27b0;margin-bottom:10px;display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid var(--divider-color);">
          ${_icon('blueprint', 13)} ${this.t('redundancy.section_blueprint')}
        </div>
        ${blueprints.map(b => this._redundancyBlueprintRow(b)).join('')}
      </div>` : '';

    // ── Native HA feature replacements ───────────────────────────────
    const nativeHtml = natives.length ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#2196f3;margin-bottom:10px;display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid var(--divider-color);">
          ${_icon('home-outline', 13)} ${this.t('redundancy.section_native')}
        </div>
        ${natives.map(n => this._redundancyNativeRow(n)).join('')}
      </div>` : '';

    // ── Trigger overlaps ──────────────────────────────────────────────
    const overlapHtml = overlaps.length ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#ff5722;margin-bottom:10px;display:flex;align-items:center;gap:6px;padding-bottom:6px;border-bottom:1px solid var(--divider-color);">
          ${_icon('source-merge', 13)} ${this.t('redundancy.section_overlap')}
        </div>
        ${overlaps.slice(0, 25).map(o => this._redundancyOverlapRow(o)).join('')}
        ${overlaps.length > 25 ? `<div style="font-size:12px;color:var(--secondary-text-color);text-align:center;padding:8px;">${this.t('redundancy.more_items').replace('{n}', overlaps.length - 25)}</div>` : ''}
      </div>` : '';

    container.innerHTML = summaryHtml + bpHtml + nativeHtml + overlapHtml;

    container.querySelectorAll('[data-redund-ai-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showRedundancyAI({
          entity_id:  btn.dataset.redundAiBtn,
          alias:      btn.dataset.alias || '',
          type:       btn.dataset.type  || '',
          detail:     btn.dataset.detail || '',
        });
      });
    });
  }

  _redundancyBlueprintRow(b) {
    const editUrl = this.getHAEditUrl(b.entity_id);
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid #9c27b0;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:140px;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;" title="${this.escapeHtml(b.alias)}">${this.escapeHtml(b.alias)}</div>
          <div style="font-size:11px;margin-top:3px;">
            <span style="background:rgba(156,39,176,0.1);color:#9c27b0;border-radius:5px;padding:1px 7px;font-weight:600;">${this.escapeHtml(b.pattern)}</span>
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:3px;">${this.t('redundancy.blueprint_hint')}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;">
          ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button></a>` : ''}
          <button data-redund-ai-btn="${this.escapeHtml(b.entity_id)}" data-alias="${this.escapeHtml(b.alias)}" data-type="blueprint" data-detail="${this.escapeHtml(b.pattern)}"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  _redundancyNativeRow(n) {
    const editUrl = this.getHAEditUrl(n.entity_id);
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid #2196f3;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:140px;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;" title="${this.escapeHtml(n.alias)}">${this.escapeHtml(n.alias)}</div>
          <div style="font-size:11px;margin-top:3px;">
            <span style="background:rgba(33,150,243,0.1);color:#2196f3;border-radius:5px;padding:1px 7px;font-weight:600;">${this.escapeHtml(n.native_feature)}</span>
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:3px;">${this.t('redundancy.native_hint')}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;">
          ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button></a>` : ''}
          <button data-redund-ai-btn="${this.escapeHtml(n.entity_id)}" data-alias="${this.escapeHtml(n.alias)}" data-type="native" data-detail="${this.escapeHtml(n.native_feature)}"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  _redundancyOverlapRow(o) {
    const edit1 = this.getHAEditUrl(o.entity_id_a);
    const edit2 = this.getHAEditUrl(o.entity_id_b);
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid #ff5722;border-radius:10px;padding:10px 14px;margin-bottom:6px;">
        <div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
          <div style="flex:1;min-width:160px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              ${_icon('source-merge', 13, '#ff5722')}
              <span style="font-size:11px;background:rgba(255,87,34,0.1);color:#ff5722;border-radius:5px;padding:1px 7px;font-weight:600;">${this.escapeHtml(o.trigger_sig)}</span>
            </div>
            <div style="font-size:12px;display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
              <span style="background:var(--secondary-background-color);border-radius:5px;padding:1px 8px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(o.alias_a)}">${this.escapeHtml(o.alias_a)}</span>
              <span style="color:var(--secondary-text-color);align-self:center;">↔</span>
              <span style="background:var(--secondary-background-color);border-radius:5px;padding:1px 8px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(o.alias_b)}">${this.escapeHtml(o.alias_b)}</span>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;flex-wrap:wrap;">
            ${edit1 ? `<a href="${edit1}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:4px 9px;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:3px;">${_icon('pencil-outline',11)} A</button></a>` : ''}
            ${edit2 ? `<a href="${edit2}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:4px 9px;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:3px;">${_icon('pencil-outline',11)} B</button></a>` : ''}
            <button data-redund-ai-btn="${this.escapeHtml(o.entity_id_a)}" data-alias="${this.escapeHtml(o.alias_a + ' ↔ ' + o.alias_b)}" data-type="overlap" data-detail="${this.escapeHtml(o.entity_id_b + '|' + o.trigger_sig)}"
              style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:4px 9px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
              ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
            </button>
          </div>
        </div>
      </div>`;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  REDUNDANCY — _showRedundancyAI
  //  All text from this.t('diag_prompts.redundancy.*') — zero hardcoded strings.
  // ════════════════════════════════════════════════════════════════════════

  async _showRedundancyAI(item) {
    let chatPrompt = '';
    const eid   = item.entity_id || '';
    const alias = item.alias     || eid;
    const t     = (k, p) => this.t(k, p);

    if (item.type === 'blueprint') {
      const patternLine = item.detail
        ? `\n${t('diag_prompts.redundancy.pattern_label')}: ${item.detail}`
        : '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.redundancy.blueprint_problem')})}${patternLine}`,
        '',
        t('diag_prompts.read_with', {cmd: `haca_get_automation("${eid}")`}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.redundancy.blueprint_step1'),
        t('diag_prompts.redundancy.blueprint_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.redundancy.blueprint_choice_proceed'),
        t('diag_prompts.redundancy.blueprint_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else if (item.type === 'native') {
      const detail = item.detail || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.redundancy.native_problem', {detail})})}`,
        '',
        t('diag_prompts.read_with', {cmd: `haca_get_automation("${eid}")`}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.redundancy.native_step1'),
        t('diag_prompts.redundancy.native_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.choice_apply'),
        t('diag_prompts.choice_backup_apply'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else {
      // overlap — two automations with same trigger
      const [eid_b, trigger_sig] = (item.detail || '').split('|');
      const alias_a = item.alias.split(' ↔ ')[0] || alias;
      const alias_b = item.alias.split(' ↔ ')[1] || eid_b || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.redundancy.overlap_problem', {alias_a, eid_a: eid, alias_b, trigger: trigger_sig})})}`,
        '',
        t('diag_prompts.redundancy.overlap_read', {eid_a: eid, eid_b: eid_b || alias_b}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.redundancy.overlap_step1'),
        t('diag_prompts.redundancy.overlap_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.redundancy.overlap_choice_proceed'),
        t('diag_prompts.redundancy.overlap_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');
    }

    this._redundancyLoaded = false;
    this._openChatWithMessage(chatPrompt);
  }

