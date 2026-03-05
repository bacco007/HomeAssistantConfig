  // ═══════════════════════════════════════════════════════════════════════
  //  PAGINATION — mixin partagé par tous les onglets HACA
  //
  //  _HC.pagination[id] = { page: 0, pageSize: 10 }
  //  persist dans le cache module → survit aux navigations HA.
  // ═══════════════════════════════════════════════════════════════════════

  /** Lecture de l'état de pagination d'un conteneur. */
  _pagState(id) {
    if (!_HC.pagination)  _HC.pagination = {};
    if (!_HC.pagination[id]) _HC.pagination[id] = { page: 0, pageSize: 10 };
    return _HC.pagination[id];
  }

  /** Mise à jour et re-render immédiat. */
  _pagSet(id, patch, rerenderFn) {
    const st = this._pagState(id);
    Object.assign(st, patch);
    rerenderFn();
  }

  /** Tranche d'items pour la page courante. */
  _pagSlice(items, page, pageSize) {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }

  /**
   * Génère le HTML de la barre de pagination.
   * @param {string}   id         identifiant unique du conteneur
   * @param {number}   total      nombre total d'items
   * @param {number}   page       page courante (0-indexed)
   * @param {number}   pageSize   items par page
   * @returns {string} HTML à injecter sous la liste
   */
  _pagHTML(id, total, page, pageSize) {
    if (total === 0) {
      // Même sans items : afficher le sélecteur de taille pour que l'utilisateur sache qu'il existe
      return `<div class="pag-bar" data-pag-id="${id}"
        style="display:flex;align-items:center;gap:8px;padding:10px 4px 4px;
               border-top:1px solid var(--divider-color);margin-top:8px;">
        <span style="font-size:12px;color:var(--secondary-text-color);">${this.t('pagination.show')}</span>
        ${[10,50,100].map(n => `<button class="pag-size" data-pag-id="${id}" data-size="${n}"
          style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;
                 border:1px solid var(--divider-color);cursor:pointer;
                 background:${pageSize===n?'var(--primary-color)':'var(--secondary-background-color)'};
                 color:${pageSize===n?'#fff':'var(--primary-text-color)'};">${n}</button>`).join('')}
        <span style="font-size:12px;color:var(--secondary-text-color);margin-left:auto;">${this.t('pagination.empty')}</span>
      </div>`;
    }
    const totalPages = Math.ceil(total / pageSize);
    const from = page * pageSize + 1;
    const to   = Math.min((page + 1) * pageSize, total);

    const sizeBtn = (n) => `
      <button class="pag-size" data-pag-id="${id}" data-size="${n}"
        style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid var(--divider-color);
               background:${pageSize === n ? 'var(--primary-color)' : 'var(--secondary-background-color)'};
               color:${pageSize === n ? '#fff' : 'var(--primary-text-color)'};cursor:pointer;">
        ${n}
      </button>`;

    const navBtn = (label, icon, disabled, targetPage) => `
      <button class="pag-nav" data-pag-id="${id}" data-page="${targetPage}"
        ${disabled ? 'disabled' : ''}
        style="padding:4px 10px;border-radius:6px;font-size:12px;border:1px solid var(--divider-color);
               background:var(--secondary-background-color);color:var(--primary-text-color);
               cursor:${disabled ? 'default' : 'pointer'};opacity:${disabled ? '0.4' : '1'};
               display:flex;align-items:center;gap:4px;">
        <ha-icon icon="${icon}" style="--mdc-icon-size:15px;"></ha-icon>${label}
      </button>`;

    return `
      <div class="pag-bar" data-pag-id="${id}"
        style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
               gap:8px;padding:12px 4px 4px;border-top:1px solid var(--divider-color);margin-top:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:var(--secondary-text-color);">${this.t('pagination.show')}</span>
          ${sizeBtn(10)}${sizeBtn(50)}${sizeBtn(100)}
        </div>
        <span style="font-size:12px;color:var(--secondary-text-color);">
          ${from}–${to} sur <strong>${total}</strong>
        </span>
        <div style="display:flex;gap:6px;">
          ${navBtn(this.t('pagination.prev'), 'mdi:chevron-left',  page === 0,              page - 1)}
          ${navBtn(this.t('pagination.next'), 'mdi:chevron-right', page >= totalPages - 1,  page + 1)}
        </div>
      </div>`;
  }

  /**
   * Branche les événements de la barre de pagination dans un conteneur DOM.
   * rerenderFn() sera appelée après chaque changement d'état.
   */
  _pagWire(container, rerenderFn) {
    container.querySelectorAll('.pag-size').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.pagId;
        const size = parseInt(btn.dataset.size);
        this._pagSet(id, { pageSize: size, page: 0 }, rerenderFn);
      });
    });
    container.querySelectorAll('.pag-nav').forEach(btn => {
      if (btn.disabled) return;
      btn.addEventListener('click', () => {
        const id   = btn.dataset.pagId;
        const pg   = parseInt(btn.dataset.page);
        this._pagSet(id, { page: pg }, rerenderFn);
      });
    });
  }
