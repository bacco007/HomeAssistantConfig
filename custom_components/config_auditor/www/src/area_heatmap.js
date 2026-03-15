  // ═══════════════════════════════════════════════════════════════════
  //  AREA COMPLEXITY — loadAreaComplexity · _renderAreaHeatmap
  // ═══════════════════════════════════════════════════════════════════

  async loadAreaComplexity() {
    const container = this.shadowRoot.querySelector('#area-complexity-container');
    if (!container) return;
    if (this._areaComplexityLoaded) return;
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--secondary-text-color);">
      <div class="loader" style="margin:0 auto 8px;"></div>${this.t('area_complexity.loading')}</div>`;
    try {
      const result = await this._hass.callWS({ type: 'haca/get_area_complexity' });
      this._areaComplexityData = result;
      this._renderAreaHeatmap(result);
      this._areaComplexityLoaded = true;
    } catch (e) {
      container.innerHTML = `<div style="padding:16px;color:var(--error-color);">${this.t('area_complexity.error')}: ${this.escapeHtml(e.message)}</div>`;
    }
  }

  _renderAreaHeatmap(data) {
    const container = this.shadowRoot.querySelector('#area-complexity-container');
    if (!container) return;

    const areaStats      = (data.area_stats || []).filter(s => s.area_id !== '__no_area__');
    const noAreaEntry    = (data.area_stats || []).find(s => s.area_id === '__no_area__');
    const crossArea      = data.cross_area_automations || [];
    const consolidations = data.consolidation_suggestions || [];

    if (!areaStats.length && !crossArea.length) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--secondary-text-color);">
        <div style="font-size:36px;margin-bottom:12px;">🗺️</div>
        <div>${this.t('area_complexity.no_data')}</div></div>`;
      return;
    }

    const heatCells = areaStats.map(s => {
      const h = s.heat_value;
      const [border, textColor] =
        h >= 75 ? ['#ef5350', '#ef5350'] :
        h >= 40 ? ['#ffa726', '#ffa726'] :
                  ['#4caf50', '#4caf50'];
      return `
        <div style="background:var(--card-background-color);border:1px solid ${border};border-radius:10px;padding:12px;overflow:hidden;position:relative;">
          <div style="position:absolute;bottom:0;left:0;width:${Math.max(4, h)}%;height:3px;background:${textColor};opacity:0.45;"></div>
          <div style="font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px;"
               title="${this.escapeHtml(s.area_name)}">${this.escapeHtml(s.area_name)}</div>
          <div style="font-size:26px;font-weight:800;color:${textColor};line-height:1;">${h}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:3px;">
            ${s.auto_count} auto · Ø${s.avg_score}
            ${s.high_complexity > 0 ? `<span style="color:#ef5350;font-weight:600;margin-left:4px;">⬆${s.high_complexity}</span>` : ''}
          </div>
        </div>`;
    }).join('');

    const legend = `
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px;font-size:12px;align-items:center;">
        <span style="font-weight:600;color:var(--secondary-text-color);">${this.t('area_complexity.legend')}</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#4caf50;display:inline-block;"></span>0–39</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#ffa726;display:inline-block;"></span>40–74</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#ef5350;display:inline-block;"></span>75–100</span>
      </div>`;

    const noAreaHtml = noAreaEntry ? `
      <div style="background:rgba(255,152,0,0.08);border:1px solid rgba(255,152,0,0.25);border-radius:8px;padding:9px 14px;margin-top:14px;font-size:12px;display:flex;align-items:center;gap:6px;">
        ${_icon('map-marker-off', 14, '#ffa726')} ${this.t('area_complexity.no_area_count').replace('{count}', noAreaEntry.auto_count)}
      </div>` : '';

    const crossHtml = crossArea.length ? `
      <div style="margin-top:22px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          ${_icon('arrow-decision', 13)} ${this.t('area_complexity.cross_area_title')} <span style="background:var(--secondary-background-color);padding:1px 7px;border-radius:10px;font-size:11px;">${crossArea.length}</span>
        </div>
        ${crossArea.slice(0, 15).map(c => this._crossAreaRow(c)).join('')}
      </div>` : '';

    const suggHtml = consolidations.length ? `
      <div style="margin-top:22px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          ${_icon('lightbulb-outline', 13)} ${this.t('area_complexity.suggestions_title')} <span style="background:var(--secondary-background-color);padding:1px 7px;border-radius:10px;font-size:11px;">${consolidations.length}</span>
        </div>
        ${consolidations.map(s => this._areaConsolidationRow(s)).join('')}
      </div>` : '';

    container.innerHTML = legend
      + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">${heatCells}</div>`
      + noAreaHtml + crossHtml + suggHtml;

    container.querySelectorAll('[data-area-ai-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showAreaSuggestionAI({
          entity_id:   btn.dataset.areaAiBtn,
          alias:       btn.dataset.alias || '',
          area_name:   btn.dataset.area  || '',
          suggestion:  btn.dataset.suggestion || '',
          auto_count:  btn.dataset.count || '',
          avg_score:   btn.dataset.avg   || '',
        });
      });
    });
  }

  _crossAreaRow(c) {
    const editUrl = this.getHAEditUrl(c.entity_id);
    const scoreColor = c.score >= 50 ? '#ef5350' : c.score >= 30 ? '#ffa726' : '#4caf50';
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;" title="${this.escapeHtml(c.alias)}">${this.escapeHtml(c.alias)}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:2px;">${(c.area_names||[]).join(' · ')}</div>
        </div>
        <span style="font-weight:800;font-size:15px;color:${scoreColor};flex-shrink:0;">${c.score}</span>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;"><button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button></a>` : ''}
          <button data-area-ai-btn="${this.escapeHtml(c.entity_id)}" data-alias="${this.escapeHtml(c.alias)}" data-area="${this.escapeHtml((c.area_names||[]).join(', '))}" data-suggestion="cross_area"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  _areaConsolidationRow(s) {
    const descMap = {
      merge_simple_automations: this.t('area_complexity.suggestion_merge').replace('{count}', s.auto_count).replace('{avg}', s.avg_score),
      split_complex_automations: this.t('area_complexity.suggestion_split').replace('{count}', s.auto_count).replace('{avg}', s.avg_score),
    };
    const desc = descMap[s.suggestion] || s.suggestion;
    return `
      <div style="background:var(--card-background-color);border:1px solid var(--divider-color);border-left:3px solid var(--primary-color);border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;min-width:160px;">
          <div style="font-weight:700;font-size:13px;">${this.escapeHtml(s.area_name)}</div>
          <div style="font-size:12px;color:var(--secondary-text-color);margin-top:3px;">${this.escapeHtml(desc)}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:center;">
          <a href="/config/automation" target="_blank" style="text-decoration:none;">
            <button style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">${_icon('pencil-outline',12)} ${this.t('area_complexity.btn_edit')}</button>
          </a>
          <button data-area-ai-btn="_area_${this.escapeHtml(s.area_id)}" data-alias="${this.escapeHtml(s.area_name)}" data-area="${this.escapeHtml(s.area_name)}" data-suggestion="${s.suggestion}" data-count="${s.auto_count||''}" data-avg="${s.avg_score||''}"
            style="background:var(--primary-color);color:white;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;">
            ${_icon('robot',12)} ${this.t('area_complexity.btn_ai')}
          </button>
        </div>
      </div>`;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  AREA HEATMAP — _showAreaSuggestionAI
  //  All text from this.t('diag_prompts.area.*') — zero hardcoded strings.
  // ════════════════════════════════════════════════════════════════════════

  async _showAreaSuggestionAI(item) {
    let chatPrompt = '';
    const eid   = item.entity_id || '';
    const alias = item.alias     || eid;
    const t     = (k, p) => this.t(k, p);

    if (item.suggestion === 'cross_area') {
      const areas = item.area_name || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias, eid, problem: t('diag_prompts.area.cross_area_problem', {areas})})}`,
        '',
        t('diag_prompts.read_with', {cmd: `haca_get_automation("${eid}")`}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.area.cross_area_step1'),
        t('diag_prompts.area.cross_area_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.area.cross_area_choice_proceed'),
        t('diag_prompts.area.cross_area_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else if (item.suggestion === 'merge_simple_automations') {
      const area  = item.area_name || '';
      const count = item.auto_count || '';
      const score = item.avg_score  || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias: area, eid: area, problem: t('diag_prompts.area.merge_problem', {area, count, score})})}`,
        '',
        t('diag_prompts.area.merge_read', {area}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.area.merge_step1'),
        t('diag_prompts.area.merge_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.area.merge_choice_proceed'),
        t('diag_prompts.area.merge_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');

    } else {
      // high complexity — split suggestion
      const area  = item.area_name || '';
      const score = item.avg_score  || '';
      chatPrompt = [
        t('diag_prompts.marker'),
        `${t('diag_prompts.header', {alias: area, eid: area, problem: t('diag_prompts.area.split_problem', {area, score})})}`,
        '',
        t('diag_prompts.area.split_read', {area}),
        '',
        t('diag_prompts.then'),
        t('diag_prompts.area.split_step1'),
        t('diag_prompts.area.split_step2'),
        t('diag_prompts.step3'),
        '',
        t('diag_prompts.menu_title'),
        t('diag_prompts.area.split_choice_proceed'),
        t('diag_prompts.area.split_choice_backup'),
        t('diag_prompts.choice_manual'),
        t('diag_prompts.choice_cancel'),
      ].join('\n');
    }

    this._areaComplexityLoaded = false;
    this._openChatWithMessage(chatPrompt);
  }

