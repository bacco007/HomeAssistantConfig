  // ═══════════════════════════════════════════════════════════════════════
  //  COMPLEXITY RANKING TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderComplexityTable(scores) {
    const tbody = this.shadowRoot.querySelector('#complexity-tbody');
    if (!tbody) return;

    // Store for sorting
    this._complexityScores = scores;
    this._complexitySortKey = this._complexitySortKey || 'score';
    this._complexitySortAsc = this._complexitySortAsc ?? false;

    this._drawComplexityTable();
    this._attachComplexitySortListeners();
  }

  _drawComplexityTable() {
    const tbody = this.shadowRoot.querySelector('#complexity-tbody');
    if (!tbody) return;
    const scores = this._complexityScores || [];

    if (scores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--secondary-text-color);">
        ${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const sorted = [...scores].sort((a, b) => {
      const av = a[this._complexitySortKey] ?? 0;
      const bv = b[this._complexitySortKey] ?? 0;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return this._complexitySortAsc ? cmp : -cmp;
    });

    tbody.innerHTML = sorted.map((row, i) => {
      const score = row.score;
      // Colour + label per threshold
      const [scoreColor, levelBg, levelText] =
        score >= 50 ? ['#ef5350', 'rgba(239,83,80,0.12)', this.t('complexity.level_god')] :
        score >= 30 ? ['#ffa726', 'rgba(255,167,38,0.12)', this.t('complexity.level_complex')] :
        score >= 15 ? ['#ffd54f', 'rgba(255,213,79,0.10)', this.t('complexity.level_medium')] :
                      ['#66bb6a', 'rgba(102,187,106,0.10)', this.t('complexity.level_simple')];

      // Score bar (visual, max = highest score in dataset)
      const maxScore = sorted[0]?.score || 1;
      const barPct = Math.round((score / Math.max(maxScore, 1)) * 100);

      const editUrl = this.getHAEditUrl(row.entity_id);

      return `<tr style="border-bottom:1px solid var(--divider-color);${i === 0 ? 'background:rgba(var(--rgb-primary-color,33,150,243),0.03);' : ''}">
        <td style="padding:8px 10px;max-width:220px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(row.alias)}">
            ${editUrl
              ? `<a href="${editUrl}" target="_blank" style="color:var(--primary-text-color);text-decoration:none;">${this.escapeHtml(row.alias)}</a>`
              : this.escapeHtml(row.alias)}
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(row.entity_id)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:80px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <span style="font-weight:700;font-size:16px;color:${scoreColor};">${score}</span>
            <div style="width:48px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:${scoreColor};border-radius:2px;transition:width 0.4s;"></div>
            </div>
          </div>
        </td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.triggers}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.conditions}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.actions}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.templates}</td>
        <td style="padding:8px 10px;text-align:center;">
          <span style="background:${levelBg};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;white-space:nowrap;">${levelText}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;">
          <button class="cplx-ai-btn" data-entity="${row.entity_id}"
            style="background:var(--accent-color,#03a9f4);color:white;padding:4px 10px;font-size:11px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;">
            ${_icon("robot", 13)} ${this.t('misc.ia_btn')}
          </button>
        </td>
      </tr>`;
    }).join('');

    // Wire AI buttons
    tbody.querySelectorAll('.cplx-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = (this._complexityScores || []).find(r => r.entity_id === btn.dataset.entity);
        if (row) this._showComplexityAI(row);
      });
    });
  }

  _attachComplexitySortListeners() {
    // Header click to sort
    const ths = this.shadowRoot.querySelectorAll('#complexity-table-container th[data-sort]');
    ths.forEach(th => {
      // Remove old listener by cloning
      const fresh = th.cloneNode(true);
      th.parentNode.replaceChild(fresh, th);
      fresh.addEventListener('click', () => {
        const key = fresh.dataset.sort;
        if (this._complexitySortKey === key) {
          this._complexitySortAsc = !this._complexitySortAsc;
        } else {
          this._complexitySortKey = key;
          this._complexitySortAsc = false;
        }
        this._drawComplexityTable();
        this._attachComplexitySortListeners();
      });
    });

    // Sort button (shortcut: toggle score asc/desc)
    const btn = this.shadowRoot.querySelector('#complexity-sort-btn');
    if (btn) {
      const fresh = btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh, btn);
      fresh.addEventListener('click', () => {
        this._complexitySortKey = 'score';
        this._complexitySortAsc = !this._complexitySortAsc;
        fresh.innerHTML = `${_icon(this._complexitySortAsc ? "sort-ascending" : "sort-descending")} ${this.t('tables.score_col')} ${this._complexitySortAsc ? '↑' : '↓'}`;
        this._drawComplexityTable();
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SEGMENT CONTROL — 3rd navigation level (Issues / Scores)
  // ═══════════════════════════════════════════════════════════════════════

  _switchSegment(clickedBtn) {
    const segId   = clickedBtn.dataset.seg;
    const panelId = 'seg-' + clickedBtn.dataset.panel; // IDs are "seg-auto-issues" etc.

    // Toggle buttons in this segment bar
    this.shadowRoot.querySelectorAll(`.segment-btn[data-seg="${segId}"]`).forEach(b => {
      b.classList.toggle('active', b === clickedBtn);
    });

    // Show the target panel, hide the others in the same group
    this.shadowRoot.querySelectorAll(`[id^="seg-${segId}-"]`).forEach(panel => {
      panel.classList.toggle('active', panel.id === panelId);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SCRIPT COMPLEXITY TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderScriptComplexityTable(scores) {
    const tbody = this.shadowRoot.querySelector('#script-complexity-tbody');
    if (!tbody) return;
    this._scriptComplexityScores = scores;

    if (!scores.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const maxScore = scores[0]?.score || 1;
    tbody.innerHTML = scores.map((row, i) => {
      const score = row.score;
      const [scoreColor, levelBg, levelText] =
        score >= 50 ? ['#ef5350', 'rgba(239,83,80,0.12)',  this.t('complexity.level_god')] :
        score >= 30 ? ['#ffa726', 'rgba(255,167,38,0.12)', this.t('complexity.level_complex')] :
        score >= 15 ? ['#ffd54f', 'rgba(255,213,79,0.10)', this.t('complexity.level_medium')] :
                      ['#66bb6a', 'rgba(102,187,106,0.10)',this.t('complexity.level_simple')];
      const barPct = Math.round((score / Math.max(maxScore, 1)) * 100);
      const editUrl = this.getHAEditUrl(row.entity_id);

      return `<tr style="border-bottom:1px solid var(--divider-color);${i===0?'background:rgba(var(--rgb-primary-color,33,150,243),0.03);':''}">
        <td style="padding:8px 10px;max-width:240px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(row.alias)}">
            ${editUrl ? `<a href="${editUrl}" target="_blank" style="color:var(--primary-text-color);text-decoration:none;">${this.escapeHtml(row.alias)}</a>` : this.escapeHtml(row.alias)}
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(row.entity_id)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:80px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <span style="font-weight:700;font-size:16px;color:${scoreColor};">${score}</span>
            <div style="width:48px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:${scoreColor};border-radius:2px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.actions}</td>
        <td style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);">${row.templates}</td>
        <td style="padding:8px 10px;text-align:center;">
          <span style="background:${levelBg};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;white-space:nowrap;">${levelText}</span>
        </td>
        <td style="padding:6px 8px;text-align:center;">
          <button class="cplx-ai-btn" data-entity="${row.entity_id}"
            style="background:var(--accent-color,#03a9f4);color:white;padding:4px 10px;font-size:11px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;">
            ${_icon("robot", 13)} ${this.t('misc.ia_btn')}
          </button>
        </td>
      </tr>`;
    }).join('');

    // Wire AI buttons
    tbody.querySelectorAll('.cplx-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = (this._scriptComplexityScores || []).find(r => r.entity_id === btn.dataset.entity);
        if (row) this._showComplexityAI(row);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SCENE STATS TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderSceneStatsTable(stats) {
    const tbody = this.shadowRoot.querySelector('#scene-stats-tbody');
    if (!tbody) return;

    if (!stats.length) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const maxE = stats[0]?.entities || 1;
    tbody.innerHTML = stats.map((row, i) => {
      const barPct = Math.round((row.entities / Math.max(maxE, 1)) * 100);
      const editUrl = this.getHAEditUrl(row.entity_id);
      return `<tr style="border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 10px;max-width:260px;">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(row.alias)}">
            ${editUrl ? `<a href="${editUrl}" target="_blank" style="color:var(--primary-text-color);text-decoration:none;">${this.escapeHtml(row.alias)}</a>` : this.escapeHtml(row.alias)}
          </div>
          <div style="font-size:11px;color:var(--secondary-text-color);">${this.escapeHtml(row.entity_id)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:120px;">
          <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
            <span style="font-weight:700;font-size:15px;">${row.entities}</span>
            <div style="width:60px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:var(--primary-color);border-radius:2px;"></div>
            </div>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  BLUEPRINT STATS TABLE
  // ═══════════════════════════════════════════════════════════════════════

  _renderBlueprintStatsTable(stats) {
    const tbody = this.shadowRoot.querySelector('#blueprint-stats-tbody');
    if (!tbody) return;

    if (!stats.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>`;
      return;
    }

    const maxC = stats[0]?.count || 1;
    tbody.innerHTML = stats.map(row => {
      const barPct = Math.round((row.count / Math.max(maxC, 1)) * 100);
      const shortPath = row.path.split('/').pop();
      const autoList = (row.automations || []).slice(0, 5).map(a => this.escapeHtml(a)).join(', ')
        + (row.automations.length > 5 ? ` +${row.automations.length - 5}` : '');

      return `<tr style="border-bottom:1px solid var(--divider-color);">
        <td style="padding:8px 10px;max-width:240px;">
          <div style="font-weight:600;" title="${this.escapeHtml(row.path)}">${this.escapeHtml(shortPath)}</div>
          <div style="font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(row.path)}</div>
        </td>
        <td style="padding:8px 10px;text-align:center;min-width:110px;">
          <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
            <span style="font-weight:700;font-size:15px;">${row.count}</span>
            <div style="width:50px;height:4px;background:var(--divider-color);border-radius:2px;overflow:hidden;">
              <div style="width:${barPct}%;height:100%;background:var(--primary-color);border-radius:2px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:8px 10px;font-size:12px;color:var(--secondary-text-color);">${autoList || '—'}</td>
      </tr>`;
    }).join('');
  }
