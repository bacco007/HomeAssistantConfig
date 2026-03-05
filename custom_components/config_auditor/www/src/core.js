(function () {
  'use strict';
  if (customElements.get('haca-panel')) return; // already loaded, skip entirely

  // Cache partagé entre toutes les instances de haca-panel (survive les navigations HA).
  // HA recrée l'élément à chaque navigation → les propriétés d'instance sont perdues.
  // Ce cache module-level évite tout écran de chargement lors des navigations suivantes.
  const _HC = { data: null, translations: null, language: null, pagination: {} };


  class HacaPanel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._translations = {};
      this._lastConnection = null; // tracks WS connection object to detect reconnects
      this._language = 'en';
      // English as default fallback

      // ── Boot splash: shown immediately so the user never sees a blank page ──
      // Displayed as soon as the element is created (before any data loads).
      // Removed once the first successful loadData() call completes.
      this._showBootSplash();
    }

    // Get translation from JSON — no hardcoded fallbacks
    t(key, params = {}) {
      const keys = key.split('.');
      let value = this._translations;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // key missing from JSON
        }
      }
      if (typeof value === 'string') {
        for (const [param, val] of Object.entries(params)) {
          value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
        }
      }
      return value || key;
    }

    // ── Cycle de vie du WebComponent ─────────────────────────────────────────

    connectedCallback() {
      // Lancé quand l'élément est inséré dans le DOM (navigation vers le panel)
      this._connected = true;

      // ── Garde globale contre les Promise rejections non capturées ────────
      // Empêche Chrome/Firefox d'afficher une page blanche sur une erreur async
      // (ex: "Subscription not found" lors d'une reconnexion WebSocket).
      if (!this._rejectionHandler) {
        this._rejectionHandler = (event) => {
          const reason = event.reason;
          const msg = reason?.message || String(reason);
          // Ne pas avaler les erreurs importantes, seulement les erreurs HA-WS connues
          if (msg.includes('Subscription not found') ||
              msg.includes('not_found') ||
              msg.includes('Connection lost') ||
              msg.includes('Lost connection')) {
            event.preventDefault(); // évite la propagation vers la console comme "Uncaught"
            console.debug('[HACA] WS subscription stale (reconnect in progress):', msg);
            // Réinitialiser l'état des souscriptions pour le prochain set hass()
            this._unsubNewIssues = null;
          }
        };
        window.addEventListener('unhandledrejection', this._rejectionHandler);
      }
      if (this._fullyReady) {
        // Panel déjà initialisé — on rafraîchit les données et on relance l'auto-refresh
        // Réinitialiser les gardes pour que le refresh reparte proprement
        this._dataLoading = false;
        this._dataErrorCount = 0;
        this._applyCachedData();
        this._startAutoRefresh();
        this.loadData();
      }
    }

    disconnectedCallback() {
      // Lancé quand l'élément est retiré du DOM (navigation hors du panel)
      this._connected = false;
      this._stopAutoRefresh();

      // Retirer le handler de rejections non capturées
      if (this._rejectionHandler) {
        window.removeEventListener('unhandledrejection', this._rejectionHandler);
        this._rejectionHandler = null;
      }

      // ── Stopper la simulation D3 (évite des dizaines de requestAnimationFrame zombies)
      if (typeof this._graphStopAll === 'function') this._graphStopAll();

      // ── Désabonner l'event subscription HACA (évite les callbacks sur élément détaché)
      if (this._unsubNewIssues) {
        try { this._unsubNewIssues(); } catch (_) { }
        this._unsubNewIssues = null;
      }
      // Cancel boot retry loop on disconnect
      if (this._bootRetryTimer) {
        clearInterval(this._bootRetryTimer);
        this._bootRetryTimer = null;
      }
    }

    set panel(panelInfo) {
      this._panel = panelInfo;
      // set panel() n'est appelé qu'une seule fois par HA — on déclenche l'init complète
      if (!this._initialized) {
        this._initialized = true;
        this._boot();
      }
    }

    set hass(hass) {
      const wasNull = !this._hass;
      this._hass = hass;
      // set hass() est appelé par HA à CHAQUE changement d'état → ne jamais appeler render() ici.
      // On l'utilise uniquement pour débloquer l'init si hass arrive après set panel().
      if (wasNull && this._initialized && !this._fullyReady) {
        this._boot();
      }

      // ── Détection de reconnexion WebSocket ───────────────────────────────
      // Quand HA reconnecte, hass.connection est un NOUVEL objet.
      // Les anciennes souscriptions (IDs) sont invalides sur la nouvelle connexion.
      // → Invalider _unsubNewIssues sans l'appeler (conn morte) et réécouter.
      if (hass?.connection && hass.connection !== this._lastConnection) {
        this._lastConnection = hass.connection;
        // Invalider l'ancienne souscription sans l'appeler (connexion morte)
        this._unsubNewIssues = null;
        // Réécouter sur la nouvelle connexion
        if (this._fullyReady) {
          this._subscribeToNewIssues();
          // Recharger les données après reconnexion
          this.loadData();
        }
      }
    }

    get hass() {
      return this._hass;
    }

    // ── Boot overlay ─────────────────────────────────────────────────────────
    // Affiche un écran de chargement propre pendant le démarrage de HA ou la
    // reconnexion WebSocket. Évite la page blanche perçue par l'utilisateur.



    _showReconnectBanner() {
      // Bannière discrète EN HAUT du panel uniquement — ne couvre JAMAIS la sidebar HA
      let banner = this.shadowRoot.querySelector('#haca-reconnect-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'haca-reconnect-banner';
        banner.style.cssText = [
          'padding:10px 20px', 'text-align:center',
          'background:var(--warning-color,#ffa726)', 'color:#fff',
          'font-size:13px', 'font-weight:500',
          'position:sticky', 'top:0', 'z-index:100',
          'border-radius:8px', 'margin-bottom:8px',
        ].join(';');
        banner.textContent = this.t('misc.reconnecting');
        const container = this.shadowRoot.querySelector('.container');
        if (container) container.prepend(banner);
        else this.shadowRoot.appendChild(banner);
      }
    }

    _hideReconnectBanner() {
      const banner = this.shadowRoot.querySelector('#haca-reconnect-banner');
      if (banner) banner.remove();
    }

    // ── Boot splash (full panel overlay while HACA backend is not yet ready) ─
    _showBootSplash() {
      // Inject immediately into shadowRoot — no render() needed
      if (this.shadowRoot.querySelector('#haca-boot-splash')) return;
      const el = document.createElement('div');
      el.id = 'haca-boot-splash';
      el.style.cssText = [
        'position:fixed','inset:0','z-index:9999',
        'display:flex','flex-direction:column','align-items:center','justify-content:center',
        'background:var(--primary-background-color,#fff)',
        'gap:20px','font-family:var(--paper-font-body1_-_font-family,sans-serif)',
      ].join(';');
      el.innerHTML = `
        <style>
          @keyframes haca-boot-spin { to { transform: rotate(360deg); } }
          #haca-boot-splash .haca-spinner {
            width:48px; height:48px; border-radius:50%;
            border:4px solid var(--divider-color,#e0e0e0);
            border-top-color:var(--primary-color,#03a9f4);
            animation:haca-boot-spin 0.9s linear infinite;
          }
          #haca-boot-splash .haca-logo {
            font-size:28px; font-weight:700; letter-spacing:2px;
            color:var(--primary-color,#03a9f4);
          }
          #haca-boot-splash .haca-msg {
            font-size:14px; color:var(--secondary-text-color,#888);
            max-width:280px; text-align:center; line-height:1.5;
          }
          #haca-boot-splash .haca-dots::after {
            content:''; animation:haca-dots 1.5s steps(4,end) infinite;
          }
          @keyframes haca-dots {
            0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} 100%{content:''}
          }
        </style>
        <div class="haca-logo">H.A.C.A</div>
        <div class="haca-spinner"></div>
        <div class="haca-msg">Home Assistant Config Auditor<br><span class="haca-dots">Loading</span></div>
      `;
      this.shadowRoot.appendChild(el);
    }

    _hideBootSplash() {
      const el = this.shadowRoot.querySelector('#haca-boot-splash');
      if (!el) return;
      // Fade out smoothly
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 420);
    }

    async _boot() {
      // Evite les doubles appels si set panel() et set hass() se chevauchent
      if (this._booting) return;
      if (!this._hass) return;
      this._booting = true;

      try {
        // 1. Traductions : depuis le cache module si disponible, sinon charger
        if (_HC.translations) {
          this._translations = _HC.translations;
          this._language = _HC.language || 'en';
        } else {
          await this.loadTranslations();
          _HC.translations = this._translations;
          _HC.language = this._language;
        }

        // 2. Render unique — une seule fois par instance
        if (!this._rendered) {
          this._rendered = true;
          this.render();
          this.attachListeners();
        }

        // 3. Données : depuis le cache module si disponible → affichage immédiat, zéro flash
        if (_HC.data) {
          this.updateUI(_HC.data);
        }

        // 4. Charger les données fraîches (silencieux si cache dispo)
        await this.loadData();

        this._fullyReady = true;
        this._startAutoRefresh();
      } catch (err) {
        console.error('[HACA] Boot error:', err);
      } finally {
        this._booting = false;
      }
    }

    _startAutoRefresh() {
      this._stopAutoRefresh(); // annuler tout intervalle existant
      this._dataErrorCount = 0;
      this._refreshTimer = setInterval(() => {
        if (!this._connected || !this._hass) return;
        // Watchdog : après 5 erreurs consécutives, afficher un bandeau d'erreur récupérable
        if (this._dataErrorCount >= 5) {
          // Trop d'erreurs consécutives → HA probablement en cours de redémarrage
          if (!this._reconnectOverlayShown) {
            this._reconnectOverlayShown = true;
            this._showReconnectBanner();
          }
          // Continuer à essayer — HA va revenir
          this.loadData();
          return;
        }
        // Si l'overlay était affiché (reconnexion réussie par loadData), le masquer
        if (this._reconnectOverlayShown && this._dataErrorCount === 0) {
          this._reconnectOverlayShown = false;
          this._hideReconnectBanner();
        }
        this.loadData();
      }, 60_000); // 60 secondes
    }

    _stopAutoRefresh() {
      if (this._refreshTimer) {
        clearInterval(this._refreshTimer);
        this._refreshTimer = null;
      }
    }

    // Ré-applique la dernière réponse de l'API sans refaire d'appel réseau
    _applyCachedData() {
      if (this._cachedData) {
        this.updateUI(this._cachedData);
      }
    }

    async loadTranslations() {
      if (!this._hass) return;
      try {
        const lang = this._hass.language || 'en';
        const result = await this._hass.callWS({ type: 'haca/get_translations', language: lang });
        if (result && result.translations) {
          this._translations = result.translations;
          this._language = result.language || lang;
        }
      } catch (error) {
        console.warn('[HACA] Could not load translations, using defaults:', error);
      }
    }

    render() {
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          font-family: 'Roboto', 'Outfit', sans-serif;
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: inherit; }
        .container { max-width: 1400px; margin: 0 auto; animation: haca-fadeIn 0.5s ease-out; }

        @keyframes haca-fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes haca-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── HEADER ───────────────────────────────── */
        .header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color, #03a9f4) 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .header-title { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .header-title ha-icon { --mdc-icon-size: 42px; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
        .header h1 { margin: 0; font-size: 28px; font-weight: 500; letter-spacing: -0.5px; }
        .header-sub { font-size: 13px; opacity: 0.8; font-weight: 400; }
        .actions { display: flex; gap: 10px; flex-wrap: wrap; }

        /* ── BUTTONS ──────────────────────────────── */
        /* Boutons du header : fond sombre, texte blanc */
        .header button {
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .header button:hover { background: rgba(255,255,255,0.25); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .header button:active { transform: translateY(0); }

        /* Boutons hors header : fond neutre, hover coloré lisible */
        button {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        button:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* ── Boutons primaires dans les modals (appliquer, valider) ── */
        .haca-modal button[style*="var(--primary-color)"], .haca-modal button#apply-fix-btn {
          background: var(--primary-color);
          color: white;
          border-color: transparent;
        }
        .haca-modal button[style*="var(--primary-color)"]:hover, .haca-modal button#apply-fix-btn:hover {
          background: var(--primary-color);
          filter: brightness(1.1);
          color: white;
          border-color: transparent;
        }
        /* Bouton danger dans les modals */
        .haca-modal button[style*="var(--error-color)"], .haca-modal button[style*="#ef5350"], .haca-modal button[style*="#ff7043"] {
          background: var(--error-color, #ef5350);
          color: white;
          border-color: transparent;
        }
        .haca-modal button[style*="var(--error-color)"]:hover, .haca-modal button[style*="#ef5350"]:hover, .haca-modal button[style*="#ff7043"]:hover {
          filter: brightness(1.1);
          color: white;
          background: var(--error-color, #ef5350);
        }
        /* Bouton close (✕) — hover rouge */
        .modal-close-btn:hover {
          background: var(--error-color, #ef5350) !important;
          color: white !important;
        }
        button#scan-all { background: white; color: var(--primary-color); font-weight: 700; border: none; }
        button#scan-all:hover { background: rgba(255,255,255,0.9); }

        .btn-loader {
          width: 14px; height: 14px;
          border: 2px solid transparent; border-top-color: currentColor;
          border-radius: 50%; animation: haca-btn-spin 0.8s linear infinite; display: inline-block;
        }
        @keyframes haca-btn-spin { to { transform: rotate(360deg); } }
        button.scanning { pointer-events: none; }
        button.scanning ha-icon { display: none; }

        /* ── STAT CARDS ───────────────────────────── */
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: var(--card-background-color);
          padding: 20px;
          border-radius: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.05));
          border: 1px solid var(--divider-color);
          display: flex; flex-direction: column; gap: 8px;
          transition: transform 0.3s ease;
        }
        .stat-card.blueprint { border-left: 5px solid var(--info-color, #26c6da); }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-header { display: flex; justify-content: space-between; align-items: center; }
        .stat-label { color: var(--secondary-text-color); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
        .stat-icon { color: var(--primary-color); opacity: 0.8; }
        .stat-value { font-size: 38px; font-weight: 700; color: var(--primary-text-color); margin-top: 2px; }
        .stat-desc { font-size: 12px; color: var(--secondary-text-color); }

        /* ── TABS (top-level) ─────────────────────── */
        .tabs-container {
          margin-bottom: 20px;
          position: sticky; top: 0; z-index: 10;
          background: var(--primary-background-color);
          padding: 8px 0;
        }
        .tabs {
          display: flex; gap: 6px;
          background: var(--secondary-background-color);
          padding: 5px; border-radius: 14px;
          overflow-x: auto; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .tabs::-webkit-scrollbar { display: none; }
        .tabs .tab {
          flex: 1; min-width: 0;
          padding: 12px 20px;
          background: transparent; cursor: pointer;
          border-radius: 10px; border: none;
          color: var(--secondary-text-color);
          font-weight: 600; white-space: nowrap;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease; font-size: 14px;
        }
        .tabs .tab ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
        .tab-label { display: inline; }
        .tabs .tab:hover { color: var(--primary-text-color); background: rgba(0,0,0,0.05); }
        .tabs .tab.active { background: var(--card-background-color); color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        /* ── SUB-TABS (inside Issues tab) ────────── */
        .subtabs-container {
          border-bottom: 1px solid var(--divider-color);
          padding: 8px 16px 0;
          background: var(--secondary-background-color);
        }
        .subtabs {
          display: flex; gap: 2px;
          overflow-x: auto; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .subtabs::-webkit-scrollbar { display: none; }
        .subtabs .subtab {
          flex-shrink: 0;
          padding: 8px 14px;
          background: transparent; cursor: pointer;
          border: none; border-bottom: 3px solid transparent;
          color: var(--secondary-text-color);
          font-weight: 500; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s ease; font-size: 13px;
          border-radius: 0;
        }
        .subtabs .subtab ha-icon { --mdc-icon-size: 15px; flex-shrink: 0; }
        .subtabs .subtab:hover { color: var(--primary-text-color); }
        .subtabs .subtab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 700; }
        .subtab-content { display: none; }
        .subtab-content.active { display: block; animation: haca-fadeIn 0.2s ease-out; }

        /* ── SEGMENT CONTROL (3rd level: Issues / Score) ── */
        .segment-bar {
          display: inline-flex;
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .segment-btn {
          padding: 5px 14px;
          border: none; border-radius: 6px;
          background: transparent;
          color: var(--secondary-text-color);
          font-size: 12px; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .segment-btn ha-icon { --mdc-icon-size: 14px; }
        .segment-btn.active {
          background: var(--card-background-color);
          color: var(--primary-color);
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }
        .segment-btn:hover:not(.active) { color: var(--primary-text-color); }
        .segment-panel { display: none; }
        .segment-panel.active { display: block; animation: haca-fadeIn 0.2s ease-out; }

        /* ── SECTION CARD ─────────────────────────── */
        .tab-content { display: none; animation: haca-fadeIn 0.3s ease-out; }
        .tab-content.active { display: block; }
        .section-card {
          background: var(--card-background-color);
          padding: 0; border-radius: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.05));
          border: 1px solid var(--divider-color); overflow: hidden;
        }
        /* Issues tab: no top padding since subtabs bar starts right away */
        #tab-issues { padding-top: 0; }
        .section-header {
          padding: 18px 22px; border-bottom: 1px solid var(--divider-color);
          display: flex; justify-content: space-between; align-items: center;
          background: var(--secondary-background-color); flex-wrap: wrap; gap: 10px;
        }
        .section-header h2 { margin: 0; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .section-header-btns { display: flex; gap: 10px; flex-wrap: wrap; }

        /* ── ISSUE ITEMS ──────────────────────────── */
        .issue-list { padding: 8px 20px 20px; }
        .issue-item {
          padding: 18px;
          margin: 14px 0;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-left: 6px solid var(--primary-color);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .issue-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .issue-item.high   { border-left-color: var(--error-color, #ef5350); background: rgba(239,83,80,0.02); }
        .issue-item.medium { border-left-color: var(--warning-color, #ffa726); background: rgba(255,167,38,0.02); }
        .issue-item.low    { border-left-color: var(--info-color, #26c6da); background: rgba(38,198,218,0.02); }

        /* Issue layout: info left, buttons right — stacks on mobile */
        .issue-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
        .issue-info { flex: 1; min-width: 0; }
        .issue-btns { display: flex; gap: 8px; flex-shrink: 0; align-items: flex-start; }
        .issue-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .issue-title { font-size: 15px; font-weight: 600; color: var(--primary-text-color); word-break: break-word; }
        .issue-entity {
          font-size: 12px; color: var(--secondary-text-color);
          font-family: 'SFMono-Regular', Consolas, monospace;
          background: var(--secondary-background-color);
          padding: 2px 6px; border-radius: 4px;
          display: inline-block; max-width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .issue-message { margin: 10px 0 0; line-height: 1.5; color: var(--primary-text-color); opacity: 0.9; font-size: 14px; }
        .issue-reco {
          margin-top: 10px; font-size: 13px; color: var(--secondary-text-color);
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px;
        }

        .fix-btn {
          background: var(--primary-color); color: white;
          padding: 8px 14px; font-size: 12px; font-weight: 600;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(var(--rgb-primary-color),0.3); border: none;
        }
        .fix-btn:hover { background: var(--accent-color, #03a9f4); color: white !important; opacity: 0.9; }

        /* ── EMPTY STATE ──────────────────────────── */
        .empty-state { text-align: center; padding: 52px 20px; color: var(--secondary-text-color); }
        .empty-state ha-icon { --mdc-icon-size: 60px; opacity: 0.3; margin-bottom: 14px; display: block; }

        /* ── TABLES ───────────────────────────────── */
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 480px; }
        .data-table th { padding: 14px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--secondary-text-color); font-weight: 700; border-bottom: 2px solid var(--divider-color); white-space: nowrap; }
        .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--divider-color); vertical-align: middle; }
        .data-table tr:last-child td { border-bottom: none; }

        /* ── MOBILE CARD LIST (backup/report rows) ── */
        .mobile-cards { display: none; }
        .m-card {
          border: 1px solid var(--divider-color);
          border-radius: 12px; padding: 14px; margin: 10px 16px;
          background: var(--secondary-background-color);
        }
        .m-card-title { font-weight: 600; font-size: 14px; word-break: break-all; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
        .m-card-meta { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 10px; }
        .m-card-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .m-card-btns button { flex: 1; min-width: 100px; justify-content: center; }
        /* Format pills in report cards */
        .fmt-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
        .fmt-pill { border: 1px solid var(--divider-color); border-radius: 10px; padding: 8px 10px; background: var(--card-background-color); }
        .fmt-pill-label { font-size: 10px; font-weight: 800; color: var(--primary-color); text-transform: uppercase; display: block; margin-bottom: 5px; }
        .fmt-pill-btns { display: flex; gap: 5px; }
        .fmt-pill-btns button { padding: 5px; background: var(--secondary-background-color) !important; border: 1px solid var(--divider-color) !important; border-radius: 7px !important; }

        /* ── FILTER BAR ───────────────────────────── */
        .filter-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 22px; border-bottom: 1px solid var(--divider-color);
          background: var(--secondary-background-color); flex-wrap: wrap;
        }
        .filter-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--secondary-text-color); letter-spacing: 0.5px; }
        .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-chip {
          padding: 5px 14px; border-radius: 20px; border: 1px solid var(--divider-color);
          background: var(--card-background-color); color: var(--secondary-text-color);
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
        }
        .filter-chip:hover { background: color-mix(in srgb, var(--primary-color) 12%, transparent); border-color: var(--primary-color); color: var(--primary-text-color); transform: none; box-shadow: none; }
        .filter-chip.active-all    { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .filter-chip.active-high   { background: var(--error-color, #ef5350); color: white; border-color: var(--error-color, #ef5350); }
        .filter-chip.active-medium { background: var(--warning-color, #ffa726); color: white; border-color: var(--warning-color, #ffa726); }
        .filter-chip.active-low    { background: var(--info-color, #26c6da); color: white; border-color: var(--info-color, #26c6da); }
        .export-csv-btn {
          margin-left: auto; padding: 5px 14px; border-radius: 20px;
          border: 1px solid var(--divider-color); background: var(--card-background-color);
          color: var(--secondary-text-color); font-size: 12px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;
        }
        .export-csv-btn:hover { background: var(--card-background-color); border-color: var(--success-color, #4caf50); color: var(--success-color, #4caf50); transform: none; box-shadow: none; }

        /* ── MODAL ────────────────────────────────── */
        .haca-modal-card { border-radius: 20px !important; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.1); }

        /* ── LOADER ───────────────────────────────── */
        .loader {
          width: 48px; height: 48px;
          border: 5px solid rgba(0,0,0,0.08);
          border-bottom-color: var(--primary-color);
          border-radius: 50%; display: inline-block;
          box-sizing: border-box;
          animation: haca-rotation 1s linear infinite; margin: 20px auto;
        }
        @keyframes haca-rotation { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }

        /* ═══════════════════════════════════════════
           TABLET  ≤ 900px  — hide tab text
           ═══════════════════════════════════════════ */
        @media (max-width: 900px) {
          .tab-label { display: none; }
          .tabs .tab { gap: 0; padding: 10px; }
        }

        /* ═══════════════════════════════════════════
           MOBILE  ≤ 600px
           ═══════════════════════════════════════════ */
        @media (max-width: 600px) {
          { padding: 10px; }

          /* Header */
          .header { padding: 14px 16px; border-radius: 12px; gap: 12px; }
          .header-title ha-icon { --mdc-icon-size: 30px; }
          .header h1 { font-size: 20px; }
          .header-sub { display: none; }
          .actions { width: 100%; }
          .actions button { flex: 1; justify-content: center; }

          /* Stats: 2-col grid */
          .stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
          .stat-card { padding: 12px; gap: 4px; }
          .stat-value { font-size: 28px; }
          .stat-label { font-size: 10px; }
          .stat-desc { display: none; }

          /* Top-level tabs: keep labels visible, reduce padding */
          .tabs .tab { padding: 10px 12px; font-size: 13px; }
          .tabs-container { padding: 6px 0; }
          /* Sub-tabs: icon-only on small screens */
          .subtabs .subtab span { display: none; }
          .subtabs .subtab { padding: 8px 10px; }

          /* Issues */
          .issue-list { padding: 6px 10px 16px; }
          .issue-item { padding: 12px; margin: 10px 0; }
          .issue-main { flex-direction: column; gap: 10px; }
          .issue-btns { width: 100%; }
          .issue-btns button { flex: 1; justify-content: center; }
          .issue-title { font-size: 14px; }
          .issue-message { font-size: 13px; }

          /* Section headers */
          .section-header { padding: 12px 14px; }
          .section-header h2 { font-size: 14px; }
          .section-header-btns { width: 100%; }
          .section-header-btns button { flex: 1; justify-content: center; }

          /* Filter bar */
          .filter-bar { padding: 8px 12px; gap: 8px; }
          .export-csv-btn { margin-left: 0; width: 100%; justify-content: center; }

          /* Tables → card view */
          .table-wrap { display: none; }
          .mobile-cards { display: block; }

          /* Modals: bottom-sheet style */
          .haca-modal {
            align-items: flex-end !important;
          }
          .haca-modal > div {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 95vh !important;
            border-radius: 16px 16px 0 0 !important;
          }
        }
        /* ── Config tab (injected from config_tab.js) ─── */
  .cfg-root { max-width: 860px; margin: 0 auto; padding: 24px 20px 48px; display: flex; flex-direction: column; gap: 20px; }
  .cfg-header { display: flex; align-items: center; gap: 16px; padding: 20px 24px; background: var(--card-background-color); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .cfg-header-title { font-size: 1.2em; font-weight: 700; color: var(--primary-text-color); }
  .cfg-header-sub { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 2px; }
  .cfg-section { background: var(--card-background-color); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
  .cfg-section-title { display: flex; align-items: center; gap: 8px; padding: 16px 20px 12px; font-weight: 700; font-size: 0.9em; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--divider-color); }
  .cfg-section-hint { font-size: 0.82em; color: var(--secondary-text-color); padding: 10px 20px; background: rgba(var(--rgb-primary-color,33,150,243),0.04); border-bottom: 1px solid var(--divider-color); line-height: 1.5; }
  .cfg-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; gap: 16px; border-bottom: 1px solid var(--divider-color); }
  .cfg-row:last-child { border-bottom: none; }
  .cfg-row-label { display: flex; flex-direction: column; gap: 3px; flex: 1; }
  .cfg-row-label > span:first-child { font-size: 0.92em; color: var(--primary-text-color); }
  .cfg-row-hint { font-size: 0.78em; color: var(--secondary-text-color); }
  .cfg-input { width: 90px; padding: 8px 12px; border: 1.5px solid var(--divider-color); border-radius: 8px; background: var(--primary-background-color); color: var(--primary-text-color); font-size: 0.9em; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .cfg-input:focus { outline: none; border-color: var(--primary-color); }
  .cfg-toggle { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; cursor: pointer; }
  .cfg-toggle-sm { width: 40px; height: 22px; }
  .cfg-toggle input { opacity: 0; width: 0; height: 0; }
  .cfg-toggle-slider { position: absolute; inset: 0; background: var(--disabled-text-color,#bbb); border-radius: 26px; transition: 0.25s; }
  .cfg-toggle-slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.25); }
  .cfg-toggle-sm .cfg-toggle-slider::before { height: 16px; width: 16px; left: 3px; bottom: 3px; }
  .cfg-toggle input:checked + .cfg-toggle-slider { background: var(--primary-color); }
  .cfg-toggle input:checked + .cfg-toggle-slider::before { transform: translateX(22px); }
  .cfg-toggle-sm input:checked + .cfg-toggle-slider::before { transform: translateX(18px); }
  /* ── Issue type list ── */
  .cfg-categories-root { padding: 0 0 8px; }
  .cfg-cat-section { border-bottom: 1px solid var(--divider-color); }
  .cfg-cat-section:last-child { border-bottom: none; }
  .cfg-cat-section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(var(--rgb-primary-color,33,150,243),0.04); cursor: pointer; }
  .cfg-cat-header-left { display: flex; align-items: center; gap: 10px; }
  .cfg-cat-section-title { font-weight: 700; font-size: 0.88em; color: var(--primary-text-color); }
  .cfg-cat-count { font-size: 0.78em; color: var(--secondary-text-color); margin-left: 4px; }
  .cfg-cat-header-actions { display: flex; gap: 6px; }
  .cfg-cat-all-btn { font-size: 0.75em; padding: 3px 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--secondary-text-color); cursor: pointer; }
  .cfg-cat-all-btn:hover { background: var(--primary-background-color); color: var(--primary-text-color); }
  .cfg-type-list { display: flex; flex-direction: column; }
  .cfg-type-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 20px 9px 32px; gap: 12px; border-bottom: 1px solid var(--divider-color); transition: background 0.15s; cursor: default; }
  .cfg-type-row:last-child { border-bottom: none; }
  .cfg-type-row.disabled { opacity: 0.45; background: rgba(0,0,0,0.015); }
  .cfg-type-row:hover { background: rgba(var(--rgb-primary-color,33,150,243),0.03); }
  .cfg-type-label { font-size: 0.85em; color: var(--primary-text-color); flex: 1; }
  .cfg-badge { font-size: 0.72em; padding: 1px 6px; border-radius: 3px; margin-left: 6px; font-weight: 600; vertical-align: middle; }
  .cfg-badge-fix { background: rgba(34,197,94,0.15); color: #15803d; border: 1px solid rgba(34,197,94,0.4); }
  /* ── Actions ── */
  .cfg-actions { display: flex; gap: 12px; justify-content: flex-end; padding: 8px 0; }
  .cfg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s, transform 0.1s; }
  .cfg-btn:active { transform: scale(0.97); }
  .cfg-btn-primary { background: var(--primary-color); color: white; border-color: transparent; }
  .cfg-btn-primary:hover { background: var(--primary-color); color: white; filter: brightness(1.1); border-color: transparent; }
  .cfg-btn-secondary { background: var(--card-background-color); color: var(--primary-text-color); border: 1.5px solid var(--divider-color); }
  .cfg-btn-secondary:hover { background: color-mix(in srgb, var(--error-color, #ef5350) 15%, transparent); color: var(--error-color, #ef5350); border-color: var(--error-color, #ef5350); }
  .cfg-save-status { padding: 12px 20px; border-radius: 8px; font-size: 0.88em; font-weight: 500; text-align: center; animation: fadeIn 0.2s ease-out; }
  .cfg-save-status.success { background: rgba(34,197,94,0.15); color: #15803d; border: 1px solid rgba(34,197,94,0.3); }
  .cfg-save-status.error { background: rgba(239,68,68,0.12); color: #dc2626; border: 1px solid rgba(239,68,68,0.3); }
        @keyframes hacarot {
          to { stroke-dashoffset: -120; }
        }      </style>
      <div class="container">
        <div class="header">
          <div class="header-title">
            <ha-icon icon="mdi:shield-check-outline"></ha-icon>
            <div>
                <h1>${this.t('title')}</h1>
                <div class="header-sub">${this.t('subtitle')} - ${this.t('version')}</div>
            </div>
          </div>
          <div class="actions">
            <button id="scan-all"><ha-icon icon="mdi:magnify-scan"></ha-icon> ${this.t('buttons.scan_all')}</button>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-card" style="grid-column: span 2; min-width:0; overflow:hidden;" id="health-score-card">
            <div class="stat-header">
              <span class="stat-label">${this.t('stats.health_score')}</span>
              <ha-icon icon="mdi:chart-line" class="stat-icon"></ha-icon>
            </div>
            <div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;">
              <div>
                <div class="stat-value" id="health-score">--</div>
                <div class="stat-desc" id="health-score-trend" style="margin-top:2px;"></div>
              </div>
              <div style="flex:1;min-width:120px;height:52px;overflow:hidden;border-radius:6px;">
                <svg id="sparkline-svg" width="100%" height="52" preserveAspectRatio="none"
                  style="display:block;overflow:hidden;">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <text x="50%" y="50%" text-anchor="middle" fill="var(--secondary-text-color)"
                    font-size="10" dominant-baseline="middle">Historique…</text>
                </svg>
              </div>
            </div>
          </div>
          <div class="stat-card" style="border-left: 5px solid var(--error-color, #ef5350);">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.security')}</span>
                <ha-icon icon="mdi:shield-lock" style="color: var(--error-color, #ef5350);"></ha-icon>
            </div>
            <div class="stat-value" id="security-count">0</div>
            <div class="stat-desc">${this.t('stats.security_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.automations')}</span>
                <ha-icon icon="mdi:robot-confused" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="auto-count">0</div>
            <div class="stat-desc">${this.t('stats.automations_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.scripts')}</span>
                <ha-icon icon="mdi:script-text" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="script-count">0</div>
            <div class="stat-desc">${this.t('stats.scripts_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.scenes')}</span>
                <ha-icon icon="mdi:palette" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="scene-count">0</div>
            <div class="stat-desc">${this.t('stats.scenes_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.entities')}</span>
                <ha-icon icon="mdi:lightning-bolt" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="entity-count">0</div>
            <div class="stat-desc">${this.t('stats.entities_desc')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.performance')}</span>
                <ha-icon icon="mdi:speedometer-slow" class="stat-icon"></ha-icon>
            </div>
            <div class="stat-value" id="perf-count">0</div>
            <div class="stat-desc">${this.t('stats.performance_desc')}</div>
          </div>
          <div class="stat-card blueprint">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.blueprints')}</span>
                <ha-icon icon="mdi:file-document-outline" style="color: var(--info-color, #26c6da);"></ha-icon>
            </div>
            <div class="stat-value" id="blueprint-count">0</div>
            <div class="stat-desc">${this.t('stats.blueprints_desc')}</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--primary-color);">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.dashboards')}</span>
                <ha-icon icon="mdi:view-dashboard-outline" style="color: var(--primary-color);"></ha-icon>
            </div>
            <div class="stat-value" id="dashboard-count">0</div>
            <div class="stat-desc">${this.t('stats.dashboards_desc')}</div>
          </div>
          <div class="stat-card" id="recorder-stat-card" style="border-top: 3px solid #ff7043; cursor:pointer;" id="recorder-stat-btn" style="cursor:pointer;">
            <div class="stat-header">
                <span class="stat-label">${this.t('stats.recorder_orphans')}</span>
                <ha-icon icon="mdi:database-alert-outline" style="color:#ff7043;"></ha-icon>
            </div>
            <div class="stat-value" id="recorder-orphan-count">—</div>
            <div class="stat-desc" id="recorder-orphan-mb"></div>
          </div>
        </div>
        
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab active" data-tab="issues">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.issues')}</span>
            </button>
            <button class="tab" data-tab="recorder">
              <ha-icon icon="mdi:database-alert-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.recorder')}</span>
            </button>
            <button class="tab" data-tab="history">
              <ha-icon icon="mdi:chart-timeline-variant"></ha-icon>
              <span class="tab-label">${this.t('tabs.history')}</span>
            </button>
            <button class="tab" data-tab="backups">
              <ha-icon icon="mdi:archive-arrow-down-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.backups')}</span>
            </button>
            <button class="tab" data-tab="reports">
              <ha-icon icon="mdi:file-chart-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.reports')}</span>
            </button>
            <button class="tab" data-tab="carte">
              <ha-icon icon="mdi:graph"></ha-icon>
              <span class="tab-label">${this.t('tabs.carte')}</span>
            </button>
            <button class="tab" data-tab="batteries">
              <ha-icon icon="mdi:battery-alert"></ha-icon>
              <span class="tab-label">${this.t('tabs.batteries')}</span>
              <span id="tab-badge-batteries" style="display:none;background:#ef5350;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:4px;"></span>
            </button>
            <button class="tab" data-tab="chat">
              <ha-icon icon="mdi:robot-happy-outline"></ha-icon>
              <span class="tab-label">${this.t('tabs.chat')}</span>
            </button>
            <button class="tab" data-tab="config">
              <ha-icon icon="mdi:tune-variant"></ha-icon>
              <span class="tab-label">${this.t('tabs.config')}</span>
            </button>
          </div>
        </div>

        <div class="section-card">

          <!-- ══════════════════════════════════════════════════════════
               TAB ISSUES — sub-tabs for each category
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-issues" class="tab-content active">

            <!-- Sub-tab bar -->
            <div class="subtabs-container">
              <div class="subtabs" id="subtabs-issues">
                <button class="subtab active" data-subtab="all"><ha-icon icon="mdi:view-list"></ha-icon> <span>${this.t('tabs.all')}</span></button>
                <button class="subtab" data-subtab="security"><ha-icon icon="mdi:shield-lock"></ha-icon> <span>${this.t('tabs.security')}</span></button>
                <button class="subtab" data-subtab="automations"><ha-icon icon="mdi:robot"></ha-icon> <span>${this.t('tabs.automations')}</span></button>
                <button class="subtab" data-subtab="scripts"><ha-icon icon="mdi:script-text"></ha-icon> <span>${this.t('tabs.scripts')}</span></button>
                <button class="subtab" data-subtab="scenes"><ha-icon icon="mdi:palette"></ha-icon> <span>${this.t('tabs.scenes')}</span></button>
                <button class="subtab" data-subtab="entities"><ha-icon icon="mdi:lightning-bolt"></ha-icon> <span>${this.t('tabs.entities')}</span></button>
                <button class="subtab" data-subtab="performance"><ha-icon icon="mdi:gauge"></ha-icon> <span>${this.t('tabs.performance')}</span></button>
                <button class="subtab" data-subtab="blueprints"><ha-icon icon="mdi:file-document-outline"></ha-icon> <span>${this.t('tabs.blueprints')}</span></button>
                <button class="subtab" data-subtab="dashboards"><ha-icon icon="mdi:view-dashboard-outline"></ha-icon> <span>${this.t('tabs.dashboards')}</span></button>
              </div>
            </div>

            <!-- Sub-tab contents -->
            <div id="subtab-all" class="subtab-content active">
              <div class="section-header">
                <h2><ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('sections.all_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-all">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-all">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-all">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-all">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-all">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-all"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-all" class="issue-list"></div>
            </div>

            <div id="subtab-security" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:shield-lock"></ha-icon> ${this.t('sections.security_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-security">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-security">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-security">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-security">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-security">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-security"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-security" class="issue-list"></div>
            </div>

            <div id="subtab-automations" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:robot"></ha-icon> ${this.t('sections.automation_issues')}</h2>
                <div class="segment-bar" id="seg-bar-auto">
                  <button class="segment-btn active" data-seg="auto" data-panel="auto-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="auto" data-panel="auto-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.scores')}
                  </button>
                </div>
              </div>
              <!-- Issues panel -->
              <div id="seg-auto-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-automations">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-automations">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-automations">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-automations">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-automations">${this.t('filter.low')}</button>
                  <button class="filter-chip" data-filter="ghost" data-target="issues-automations" title="${this.t('filter.ghost_title')}">
                    ${this.t('filter.ghost_label')}
                  </button>
                  <button class="filter-chip" data-filter="duplicate" data-target="issues-automations" title="${this.t('filter.duplicate_title')}">
                    ${this.t('filter.duplicate_label')}
                  </button>
                </div>
                <button class="export-csv-btn" data-target="issues-automations"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-automations" class="issue-list"></div>
              </div>
              <!-- Scores panel -->
              <div id="seg-auto-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('tables.complexity_score')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:480px;" id="complexity-table-container">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;cursor:pointer;" data-sort="alias">${this.t('tables.automation_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;cursor:pointer;" data-sort="score">${this.t('tables.score_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.triggers_col')}">🔀</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.conditions_col')}">🔍</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.actions_col_recursive')}">▶</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.templates_col')}">📝</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.level_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;"></th>
                    </tr></thead>
                    <tbody id="complexity-tbody">
                      <tr><td colspan="7" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-scripts" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:script-text"></ha-icon> ${this.t('sections.script_issues')}</h2>
                <div class="segment-bar" id="seg-bar-scripts">
                  <button class="segment-btn active" data-seg="scripts" data-panel="scripts-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="scripts" data-panel="scripts-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.scores')}
                  </button>
                </div>
              </div>
              <div id="seg-scripts-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-scripts">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-scripts">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-scripts">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-scripts">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-scripts">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-scripts"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-scripts" class="issue-list"></div>
              </div>
              <div id="seg-scripts-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('sections.scripts_complexity')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:380px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('graph.legend_script')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.score_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.actions_col_recursive')}">▶ ${this.t('tables.actions_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;" title="${this.t('tables.templates_col')}">📝 ${this.t('tables.templates_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.level_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;"></th>
                    </tr></thead>
                    <tbody id="script-complexity-tbody">
                      <tr><td colspan="5" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_scores')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-scenes" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:palette"></ha-icon> ${this.t('sections.scene_issues')}</h2>
                <div class="segment-bar" id="seg-bar-scenes">
                  <button class="segment-btn active" data-seg="scenes" data-panel="scenes-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="scenes" data-panel="scenes-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.stats')}
                  </button>
                </div>
              </div>
              <div id="seg-scenes-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-scenes">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-scenes">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-scenes">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-scenes">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-scenes">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-scenes"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-scenes" class="issue-list"></div>
              </div>
              <div id="seg-scenes-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('sections.all_scenes_stats')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:300px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.scene')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.entities_controlled')}</th>
                    </tr></thead>
                    <tbody id="scene-stats-tbody">
                      <tr><td colspan="2" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_stats')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-entities" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:lightning-bolt"></ha-icon> ${this.t('sections.entity_issues')}</h2>
                <div class="segment-bar" id="seg-bar-entities">
                  <button class="segment-btn active" data-seg="entities" data-panel="entities-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('issues.segment_issues')}
                  </button>
                  <button class="segment-btn" data-seg="entities" data-panel="entities-batteries">
                    <ha-icon icon="mdi:battery-alert"></ha-icon> ${this.t('issues.segment_batteries')}
                  </button>
                </div>
              </div>
              <!-- Issues panel -->
              <div id="seg-entities-issues" class="segment-panel active">
                <div class="filter-bar" id="filter-bar-issues-entities">
                  <span class="filter-label">${this.t('filter.label')}</span>
                  <div class="filter-chips">
                    <button class="filter-chip active-all" data-filter="all" data-target="issues-entities">${this.t('filter.all')}</button>
                    <button class="filter-chip" data-filter="high" data-target="issues-entities">${this.t('filter.high')}</button>
                    <button class="filter-chip" data-filter="medium" data-target="issues-entities">${this.t('filter.medium')}</button>
                    <button class="filter-chip" data-filter="low" data-target="issues-entities">${this.t('filter.low')}</button>
                  </div>
                  <button class="export-csv-btn" data-target="issues-entities"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
                </div>
                <div id="issues-entities" class="issue-list"></div>
              </div>
              <!-- Batteries mini-panel (quick view, full detail in Batteries tab) -->
              <div id="seg-entities-batteries" class="segment-panel">
                <div style="padding:12px 20px 4px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                    ${this.t('battery.detected_title')}
                  </span>
                  <button id="goto-batteries-tab" style="background:var(--secondary-background-color);color:var(--primary-color);border:1px solid var(--primary-color);font-size:12px;padding:4px 12px;border-radius:8px;cursor:pointer;">
                    <ha-icon icon="mdi:open-in-new" style="--mdc-icon-size:14px;"></ha-icon> ${this.t('battery.view_full')}
                  </button>
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:320px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.device')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.level_col')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.status_col')}</th>
                    </tr></thead>
                    <tbody id="bat-mini-tbody">
                      <tr><td colspan="3" style="text-align:center;padding:16px;color:var(--secondary-text-color);">${this.t('battery.run_scan')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-performance" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:gauge"></ha-icon> ${this.t('sections.performance_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-performance">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-performance">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-performance">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-performance">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-performance">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-performance"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-performance" class="issue-list"></div>
            </div>

            <div id="subtab-blueprints" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:file-document-outline"></ha-icon> ${this.t('sections.blueprint_issues')}</h2>
                <div class="segment-bar" id="seg-bar-blueprints">
                  <button class="segment-btn active" data-seg="blueprints" data-panel="blueprints-issues">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon> ${this.t('subtabs.issues')}
                  </button>
                  <button class="segment-btn" data-seg="blueprints" data-panel="blueprints-scores">
                    <ha-icon icon="mdi:chart-bar"></ha-icon> ${this.t('subtabs.stats')}
                  </button>
                </div>
              </div>
              <div id="seg-blueprints-issues" class="segment-panel active">
              <div class="filter-bar" id="filter-bar-issues-blueprints">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-blueprints">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-blueprints">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-blueprints">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-blueprints">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-blueprints"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-blueprints" class="issue-list"></div>
              </div>
              <div id="seg-blueprints-scores" class="segment-panel">
                <div style="padding:12px 20px 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--secondary-text-color);">
                  ${this.t('sections.blueprints_usage')}
                </div>
                <div style="padding:0 20px 16px;overflow-x:auto;">
                  <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:380px;">
                    <thead><tr style="border-bottom:2px solid var(--divider-color);">
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('graph.legend_blueprint')}</th>
                      <th style="padding:6px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.usages_col')}</th>
                      <th style="padding:6px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tabs.automations')}</th>
                    </tr></thead>
                    <tbody id="blueprint-stats-tbody">
                      <tr><td colspan="3" style="text-align:center;padding:20px;color:var(--secondary-text-color);">${this.t('misc.run_scan_stats')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="subtab-dashboards" class="subtab-content">
              <div class="section-header">
                <h2><ha-icon icon="mdi:view-dashboard-outline"></ha-icon> ${this.t('sections.dashboard_issues')}</h2>
              </div>
              <div class="filter-bar" id="filter-bar-issues-dashboards">
                <span class="filter-label">${this.t('filter.label')}</span>
                <div class="filter-chips">
                  <button class="filter-chip active-all" data-filter="all" data-target="issues-dashboards">${this.t('filter.all')}</button>
                  <button class="filter-chip" data-filter="high" data-target="issues-dashboards">${this.t('filter.high')}</button>
                  <button class="filter-chip" data-filter="medium" data-target="issues-dashboards">${this.t('filter.medium')}</button>
                  <button class="filter-chip" data-filter="low" data-target="issues-dashboards">${this.t('filter.low')}</button>
                </div>
                <button class="export-csv-btn" data-target="issues-dashboards"><ha-icon icon="mdi:file-delimited-outline" style="--mdc-icon-size:16px;"></ha-icon> ${this.t('filter.export_csv')}</button>
              </div>
              <div id="issues-dashboards" class="issue-list"></div>
            </div>

          </div><!-- /tab-issues -->

          <!-- ══════════════════════════════════════════════════════════
               TAB RECORDER ORPHANS
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-recorder" class="tab-content">
            <div class="section-header">
              <h2 style="display:flex;align-items:center;gap:8px;">
                <ha-icon icon="mdi:database-alert-outline" style="color:#ff7043;"></ha-icon>
                ${this.t('sections.recorder_orphans')}
                <span id="recorder-db-badge" style="display:none;font-size:12px;background:#ff7043;color:#fff;padding:2px 8px;border-radius:10px;"></span>
              </h2>
              <div class="section-header-btns">
                <button id="recorder-purge-all-btn" style="display:none;background:#ff7043;color:#fff;">
                  <ha-icon icon="mdi:delete-sweep-outline"></ha-icon> ${this.t('actions.purge_all_orphans')}
                </button>
              </div>
            </div>
            <div id="recorder-orphan-list" style="padding:16px 20px;">
              <div style="color:var(--secondary-text-color);">${this.t('messages.loading')}</div>
            </div>
          </div><!-- /tab-recorder -->

          <!-- ══════════════════════════════════════════════════════════
               TAB HISTORY
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-history" class="tab-content">
            <div class="section-header">
              <h2><ha-icon icon="mdi:chart-timeline-variant"></ha-icon> ${this.t('sections.history')}</h2>
              <div class="section-header-btns">
                <select id="history-range" style="padding:6px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:13px;cursor:pointer;">
                  <option value="14">${this.t('history.days', { n: 14 })}</option>
                  <option value="30" selected>${this.t('history.days', { n: 30 })}</option>
                  <option value="60">${this.t('history.days', { n: 60 })}</option>
                  <option value="90">${this.t('history.days', { n: 90 })}</option>
                </select>
              </div>
            </div>
            <div style="padding:20px 20px 0;">
              <div style="position:relative;width:100%;height:180px;background:var(--secondary-background-color);border-radius:12px;overflow:hidden;">
                <svg id="history-chart-svg" width="100%" height="180" preserveAspectRatio="none" style="display:block;">
                  <text x="50%" y="50%" text-anchor="middle" fill="var(--secondary-text-color)" font-size="13" dominant-baseline="middle">${this.t('misc.no_data')}</text>
                </svg>
                <div id="history-tooltip" style="display:none;position:absolute;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px 12px;font-size:12px;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10;min-width:130px;"></div>
              </div>
              <div id="history-x-labels" style="display:flex;justify-content:space-between;padding:4px 0 16px;font-size:10px;color:var(--secondary-text-color);"></div>
            </div>
            <div id="history-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;padding:0 20px 20px;"></div>
            <div style="padding:0 20px 20px;">
              <div id="history-delete-bar" style="display:none;padding:8px 0 12px;display:flex;align-items:center;gap:10px;">
                <span id="history-selected-count" style="font-size:13px;color:var(--secondary-text-color);"></span>
                <button id="history-delete-selected" style="background:var(--error-color,#ef5350);color:#fff;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                  <ha-icon icon="mdi:delete-outline" style="--mdc-icon-size:15px;"></ha-icon> ${this.t('misc.delete_selection')}
                </button>
                <button id="history-delete-all" style="background:transparent;color:var(--error-color,#ef5350);border:1px solid var(--error-color,#ef5350);border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;">
                  Tout supprimer
                </button>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:13px;" id="history-table">
                <thead>
                  <tr style="border-bottom:2px solid var(--divider-color);">
                    <th style="padding:8px 10px;width:36px;">
                      <input type="checkbox" id="history-select-all" title="${this.t('misc.select_all_toggle')}" style="cursor:pointer;">
                    </th>
                    <th style="padding:8px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.date')}</th>
                    <th style="padding:8px 10px;text-align:center;">${this.t('history.score_label')}</th>
                    <th style="padding:8px 10px;text-align:center;">Δ</th>
                    <th style="padding:8px 10px;text-align:center;" title="${this.t('tabs.issues')}">${this.t('tabs.issues')}</th>
                  </tr>
                </thead>
                <tbody id="history-tbody">
                  <tr><td colspan="5" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('misc.loading')}</td></tr>
                </tbody>
              </table>
            </div>
          </div><!-- /tab-history -->

          <!-- ══════════════════════════════════════════════════════════
               TAB BACKUPS
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-backups" class="tab-content">
            <div class="section-header">
              <h2><ha-icon icon="mdi:archive-arrow-down-outline"></ha-icon> ${this.t('sections.backup_management')}</h2>
              <div class="section-header-btns">
                <button id="create-backup" style="background:var(--primary-color);color:white;">
                  <ha-icon icon="mdi:plus"></ha-icon> ${this.t('actions.create_backup')}
                </button>
              </div>
            </div>
            <div id="backups-list" style="padding:0;">${this.t('messages.loading')}</div>
          </div><!-- /tab-backups -->

          <!-- ══════════════════════════════════════════════════════════
               TAB REPORTS
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-reports" class="tab-content">
            <div class="section-header">
              <h2><ha-icon icon="mdi:file-chart-outline"></ha-icon> ${this.t('sections.report_management')}</h2>
              <div class="section-header-btns">
                <button id="create-report" style="background:var(--success-color,#4caf50);color:white;">
                  <ha-icon icon="mdi:file-document-plus"></ha-icon> ${this.t('buttons.report')}
                </button>
                <button id="refresh-reports" style="background:var(--primary-color);color:white;">
                  <ha-icon icon="mdi:refresh"></ha-icon> ${this.t('buttons.refresh')}
                </button>
              </div>
            </div>
            <div id="reports-list" style="padding:0;">${this.t('messages.loading')}</div>
          </div><!-- /tab-reports -->

          <!-- ══════════════════════════════════════════════════════════
               TAB CARTE — Dependency graph
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-carte" class="tab-content" style="padding:0;">
            <div class="carte-inner" style="display:flex;flex-direction:column;height:calc(100vh - 180px);">

            <!-- Toolbar -->
            <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--divider-color);flex-shrink:0;flex-wrap:wrap;background:var(--secondary-background-color);">
              <ha-icon icon="mdi:graph" style="color:var(--primary-color);"></ha-icon>
              <strong style="font-size:14px;">${this.t('graph.title')}</strong>
              <div style="flex:1;"></div>

              <!-- Legend -->
              <div id="graph-legend" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;">
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#7b68ee;display:inline-block;"></span>${this.t('graph.legend_automation')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#20b2aa;display:inline-block;"></span>${this.t('graph.legend_script')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ffa500;display:inline-block;"></span>${this.t('graph.legend_scene')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#6dbf6d;display:inline-block;"></span>${this.t('graph.legend_entity')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#e8a838;display:inline-block;"></span>${this.t('graph.legend_blueprint')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#a0a0b0;display:inline-block;"></span>${this.t('graph.legend_device')}</span>
                <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ef5350;display:inline-block;border:2px solid #b71c1c;"></span>${this.t('graph.legend_issue')}</span>
              </div>

              <div style="display:flex;gap:6px;margin-left:8px;">
                <!-- Type filter -->
                <select id="graph-type-filter" style="padding:5px 8px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;">
                  <option value="all">${this.t('filter_type.all')}</option>
                  <option value="automation">${this.t('filter_type.automation')}</option>
                  <option value="script">${this.t('filter_type.script')}</option>
                  <option value="scene">${this.t('filter_type.scene')}</option>
                  <option value="entity">${this.t('filter_type.entity')}</option>
                  <option value="blueprint">${this.t('filter_type.blueprint')}</option>
                  <option value="device">${this.t('filter_type.device')}</option>
                </select>
                <!-- Issues only toggle -->
                <button id="graph-issues-toggle" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;">
                  ${this.t('graph.issues_only')}
                </button>
                <!-- Reset zoom -->
                <button id="graph-reset-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.reset_view')}">
                  <ha-icon icon="mdi:fit-to-screen" style="--mdc-icon-size:14px;"></ha-icon>
                </button>
                <!-- Export SVG -->
                <button id="graph-export-svg-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.export_svg')}">
                  <ha-icon icon="mdi:image-outline" style="--mdc-icon-size:14px;"></ha-icon> SVG
                </button>
                <!-- Export PNG -->
                <button id="graph-export-png-btn" style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;cursor:pointer;" title="${this.t('graph.export_png')}">
                  <ha-icon icon="mdi:image" style="--mdc-icon-size:14px;"></ha-icon> PNG
                </button>
              </div>

              <!-- Search -->
              <input id="graph-search" type="text" placeholder="${this.t('misc.search_node')}"
                style="padding:5px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:12px;width:180px;">
            </div>

            <!-- Graph canvas -->
            <div id="graph-container" style="flex:1;position:relative;overflow:hidden;">
              <div id="graph-empty" style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--secondary-text-color);">
                <ha-icon icon="mdi:graph" style="--mdc-icon-size:48px;opacity:0.3;"></ha-icon>
                <span>${this.t('misc.run_scan_graph')}</span>
              </div>
              <svg id="dep-graph-svg" style="width:100%;height:100%;display:none;"></svg>
              <!-- Sidebar lives inside graph-container so it's clipped with the graph -->
              <div id="graph-sidebar" style="display:none;position:absolute;top:0;right:0;width:300px;height:100%;background:var(--card-background-color);border-left:1px solid var(--divider-color);padding:16px;overflow-y:auto;box-shadow:-4px 0 12px rgba(0,0,0,0.1);z-index:10;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <strong id="sidebar-title" style="font-size:15px;"></strong>
                  <button id="sidebar-close" style="background:none;border:none;cursor:pointer;color:var(--secondary-text-color);">✕</button>
                </div>
                <div id="sidebar-body"></div>
              </div>
            </div>

            </div><!-- /carte-inner -->
          </div><!-- /tab-carte -->

          <!-- ══════════════════════════════════════════════════════════
               TAB BATTERIES — Battery monitor
               ══════════════════════════════════════════════════════════ -->
          <div id="tab-batteries" class="tab-content">

            <!-- Summary bar -->
            <div class="section-header">
              <h2 style="display:flex;align-items:center;gap:8px;">
                <ha-icon icon="mdi:battery-alert" style="color:#ffa726;"></ha-icon>
                Moniteur de Batteries
              </h2>
              <div class="section-header-btns" style="display:flex;align-items:center;gap:10px;">
                <span id="bat-summary-text" style="font-size:13px;color:var(--secondary-text-color);"></span>
                <select id="bat-filter-select" style="padding:6px 10px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:13px;cursor:pointer;">
                  <option value="all">${this.t('battery.filter_all')}</option>
                  <option value="alert">${this.t('battery.filter_alert')}</option>
                  <option value="high">${this.t('battery.filter_critical')}</option>
                  <option value="medium">${this.t('battery.filter_low')}</option>
                  <option value="low">${this.t('battery.filter_watch')}</option>
                  <option value="ok">${this.t('battery.filter_ok')}</option>
                </select>
              </div>
            </div>

            <!-- Stat cards -->
            <div id="bat-stat-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;padding:0 20px 16px;"></div>

            <!-- Battery table -->
            <div style="padding:0 20px 20px;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:420px;">
                <thead>
                  <tr style="border-bottom:2px solid var(--divider-color);">
                    <th style="padding:8px 10px;text-align:left;color:var(--secondary-text-color);font-weight:600;">${this.t('tables.device')}</th>
                    <th style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;min-width:120px;">${this.t('tables.level_col')}</th>
                    <th style="padding:8px 10px;text-align:center;color:var(--secondary-text-color);font-weight:600;min-width:90px;">${this.t('tables.status_col')}</th>
                  </tr>
                </thead>
                <tbody id="bat-tbody">
                  <tr><td colspan="3" style="text-align:center;padding:24px;color:var(--secondary-text-color);">${this.t('battery.run_scan')}</td></tr>
                </tbody>
              </table>
            </div>
          </div><!-- /tab-batteries -->

          <!-- TAB CHAT IA -->
          <div id="tab-chat" class="tab-content">
            <div style="display:flex;flex-direction:column;height:calc(100vh - 220px);padding:0;">
              <div style="padding:16px 20px 12px;border-bottom:1px solid var(--divider-color);flex-shrink:0;">
                <h2 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
                  <ha-icon icon="mdi:robot-happy-outline" style="color:var(--primary-color);"></ha-icon>
                  ${this.t('chat.title')}
                </h2>
                <p style="margin:6px 0 0;font-size:12px;color:var(--secondary-text-color);">
                  ${this.t('chat.subtitle')}
                </p>
              </div>
              <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;">
                <div style="background:var(--secondary-background-color);border-radius:12px;padding:12px 16px;max-width:85%;align-self:flex-start;">
                  <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:4px;">${this.t('misc.ai_assistant')}</div>
                  <div>${this.t('chat.greeting')}</div>
                </div>
              </div>
              <div style="padding:12px 20px;border-top:1px solid var(--divider-color);flex-shrink:0;display:flex;gap:8px;align-items:flex-end;">
                <textarea id="chat-input" placeholder="${this.t('chat.placeholder')}" rows="2"
                  style="flex:1;padding:10px 14px;border-radius:12px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;font-family:inherit;resize:vertical;min-height:42px;max-height:120px;outline:none;line-height:1.4;"></textarea>
                <button id="chat-send"
                  style="padding:10px 18px;border-radius:12px;background:var(--primary-color);color:white;border:none;cursor:pointer;font-weight:600;font-size:14px;flex-shrink:0;height:42px;display:flex;align-items:center;gap:6px;">
                  <ha-icon icon="mdi:send" style="--mdc-icon-size:16px;"></ha-icon>
                  ${this.t('chat.send')}
                </button>
              </div>
            </div>
          </div><!-- /tab-chat -->

          <!-- TAB CONFIGURATION -->
          <div id="tab-config" class="tab-content">
            <div style="padding:40px;text-align:center;color:var(--secondary-text-color);">
              <ha-icon icon="mdi:loading" style="--mdc-icon-size:32px;animation:haca-spin 1s linear infinite;"></ha-icon>
              <div style="margin-top:12px;">${this.t('misc.loading_config')}</div>
            </div>
          </div><!-- /tab-config -->

        </div><!-- /section-card -->
      </div><!-- /container -->
    `;
    }

    attachListeners() {
      this.shadowRoot.querySelector('#scan-all').addEventListener('click', () => this.scanAll());

      // Chat IA
      const chatSend = this.shadowRoot.querySelector('#chat-send');
      const chatInput = this.shadowRoot.querySelector('#chat-input');
      if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => this._sendChatMessage());
        chatInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendChatMessage(); }
        });
      }

      // Recorder stat-card → navigate to recorder tab
      this.shadowRoot.querySelector('#recorder-stat-btn')?.addEventListener('click', () => this.switchTab('recorder'));

      // "Vue complète" in batteries mini-panel → go to batteries tab
      this.shadowRoot.querySelector('#goto-batteries-tab')?.addEventListener('click', () => this.switchTab('batteries'));

      // Graph toolbar
      this.shadowRoot.querySelector('#graph-reset-btn')?.addEventListener('click', () => this._graphResetZoom());
      this.shadowRoot.querySelector('#graph-export-svg-btn')?.addEventListener('click', () => this._graphExportSVG());
      this.shadowRoot.querySelector('#graph-export-png-btn')?.addEventListener('click', () => this._graphExportPNG());
      this.shadowRoot.querySelector('#graph-type-filter')?.addEventListener('change', e => this._graphApplyFilters());
      this.shadowRoot.querySelector('#graph-issues-toggle')?.addEventListener('click', () => {
        const btn = this.shadowRoot.querySelector('#graph-issues-toggle');
        this._graphIssuesOnly = !this._graphIssuesOnly;
        btn.style.background = this._graphIssuesOnly ? 'var(--error-color)' : 'var(--card-background-color)';
        btn.style.color = this._graphIssuesOnly ? 'white' : 'var(--primary-text-color)';
        this._graphApplyFilters();
      });
      this.shadowRoot.querySelector('#graph-search')?.addEventListener('input', e => this._graphSearch(e.target.value));
      this.shadowRoot.querySelector('#sidebar-close')?.addEventListener('click', () => {
        const sb = this.shadowRoot.querySelector('#graph-sidebar');
        if (sb) sb.style.display = 'none';
      });

      // Battery filter select
      this.shadowRoot.querySelector('#bat-filter-select')?.addEventListener('change', (e) => {
        this._applyBatteryFilter(e.target.value);
      });

      // Backup listeners
      this.shadowRoot.querySelector('#create-backup').addEventListener('click', () => this.createBackup());

      // Report listeners
      this.shadowRoot.querySelector('#create-report')?.addEventListener('click', () => this.generateReport());

      // Top-level tabs
      this.shadowRoot.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.dataset.tab;
          this.switchTab(tabName);
          if (tabName === 'backups') {
            this.loadBackups();
          } else if (tabName === 'reports') {
            this.loadReports();
          } else if (tabName === 'history') {
            this.loadHistory();
          } else if (tabName === 'recorder') {
            // Recorder data is already loaded via updateUI — nothing extra needed
          } else if (tabName === 'batteries') {
            // Battery data is already loaded via updateUI — nothing extra needed
          } else if (tabName === 'carte') {
            if (this._graphData) this._renderDepGraph(this._graphData);
          }
        });
      });

      // Sub-tabs inside Issues tab
      this.shadowRoot.querySelectorAll('.subtabs .subtab').forEach(subtab => {
        subtab.addEventListener('click', () => {
          this.switchSubtab(subtab.dataset.subtab);
        });
      });

      // Segment controls (3rd level: Issues / Scores)
      this.shadowRoot.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => this._switchSegment(btn));
      });

      this.shadowRoot.querySelector('#refresh-reports')?.addEventListener('click', () => this.loadReports());

      // History range selector
      this.shadowRoot.querySelector('#history-range')?.addEventListener('change', () => this.loadHistory());

      // Subscribe to new issues event from backend
      this._subscribeToNewIssues();


      // Severity filter chips
      this.shadowRoot.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          const btn = e.currentTarget;
          const filter = btn.dataset.filter;
          const targetId = btn.dataset.target;
          // Update active chip style in this filter bar
          const bar = this.shadowRoot.querySelector(`#filter-bar-${targetId}`);
          if (bar) {
            bar.querySelectorAll('.filter-chip').forEach(c => {
              c.className = 'filter-chip'; // reset
            });
            btn.classList.add(`active-${filter}`);
          }
          // Re-render with filter
          const container = this.shadowRoot.querySelector(`#${targetId}`);
          const allIssues = container?._allIssues || [];
          this.renderIssues(allIssues, targetId, filter);
        });
      });

      // CSV export buttons
      this.shadowRoot.querySelectorAll('.export-csv-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetId = e.currentTarget.dataset.target;
          const container = this.shadowRoot.querySelector(`#${targetId}`);
          const issues = container?._allIssues || [];
          this.exportCSV(issues, targetId);
        });
      });
    }

    _subscribeToNewIssues() {
      // Déjà abonné (et la souscription est encore valide) — ne pas dupliquer
      if (this._unsubNewIssues) return;
      if (!this.hass?.connection) return;

      this.hass.connection.subscribeEvents((event) => {
        if (event.event_type === 'haca_new_issues_detected') {
          const data = event.data || {};
          this.showNewIssuesNotification(data);
        }
      }, 'haca_new_issues_detected').then(unsub => {
        this._unsubNewIssues = unsub;
      }).catch(e => {
        // Peut arriver pendant une reconnexion — silencieux, réessai au prochain set hass()
        console.debug('[HACA] subscribeEvents failed (will retry on reconnect):', e?.message);
      });
    }


    // Show Home Assistant persistent notification
    async showHANotification(title, message, notificationId = 'haca_notification') {
      try {
        await this.hass.callService('persistent_notification', 'create', {
          title: title,
          message: message,
          notification_id: notificationId
        });
      } catch (error) {
        console.error('[HACA] Error creating notification:', error);
      }
    }

    showNewIssuesNotification(data) {
      const count = data.count || 0;
      const issues = data.issues || [];

      if (count === 0) return;

      // Use Home Assistant persistent notification
      const title = count === 1 ? this.t('notifications.new_issue') : `${count} ${this.t('notifications.new_issues')}`;
      let message = this.t('notifications.config_modified') + '\n\n';

      if (issues.length > 0) {
        for (let i = 0; i < Math.min(issues.length, 3); i++) {
          const issue = issues[i];
          message += `• **${issue.alias || issue.entity_id}** - ${issue.type || 'Issue'}\n`;
        }
        if (issues.length > 3) {
          message += this.t('notifications.and_others', { count: issues.length - 3 });
        }
      }

      message += `\n\n${this.t('notifications.reported_by')}`;

      this.showHANotification(title, message, 'haca_new_issues');

      // Also update the UI
      this.updateFromHass();
    }

    async loadBackups() {
      const container = this.shadowRoot.querySelector('#backups-list');
      container.innerHTML = this.t('backup.loading');
      try {
        const result = await this.hass.callWS({
          type: 'call_service',
          domain: 'config_auditor',
          service: 'list_backups',
          service_data: {},
          return_response: true
        });

        // Handle potential response wrapping (some HA versions wrap in 'response')
        let data = result;
        if (result && result.response) {
          data = result.response;
        }

        const backups = data.backups || data || [];

        // Safety check if backups is not an array
        if (!Array.isArray(backups)) {
          console.error('[HACA] Invalid backups data format:', backups);
          throw new Error(this.t('backup.error_loading'));
        }

        this.renderBackups(backups);

      } catch (error) {
        console.error('[HACA] Error loading backups:', error);
        container.innerHTML = `<div class="empty-state">❌ ${this.t('notifications.error')}: ${error.message}</div>`;
      }
    }

    renderBackups(backups) {
      const container = this.shadowRoot.querySelector('#backups-list');
      const PAG_ID = 'backups-list';
      if (backups.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            <ha-icon icon="mdi:archive-off-outline"></ha-icon>
            <p>${this.t('messages.no_backups')}</p>
        </div>`;
        return;
      }

      container._allBackups = backups;
      const st = this._pagState(PAG_ID);
      const paged = this._pagSlice(backups, st.page, st.pageSize);

      container.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>${this.t('tables.name')}</th>
            <th>${this.t('tables.date')}</th>
            <th>${this.t('tables.size')}</th>
            <th>${this.t('tables.action')}</th>
          </tr></thead>
          <tbody>
            ${paged.map(b => `
              <tr>
                <td style="font-weight:500;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <ha-icon icon="mdi:zip-box-outline" style="color:var(--secondary-text-color);flex-shrink:0;"></ha-icon>
                    <span style="word-break:break-all;">${this.escapeHtml(b.name)}</span>
                  </div>
                </td>
                <td style="white-space:nowrap;">${new Date(b.created).toLocaleString()}</td>
                <td><span style="background:var(--secondary-background-color);padding:4px 8px;border-radius:6px;font-size:12px;white-space:nowrap;">${Math.round(b.size / 1024)} KB</span></td>
                <td>
                  <div style="display:flex;gap:8px;">
                    <button class="restore-btn" data-path="${b.path}" style="background:var(--warning-color,#ff9800);color:black;">
                      <ha-icon icon="mdi:backup-restore"></ha-icon> ${this.t('actions.restore')}
                    </button>
                    <button class="delete-backup-btn" data-path="${b.path}" data-name="${b.name}" style="background:var(--error-color,#ef5350);color:white;">
                      <ha-icon icon="mdi:delete-outline"></ha-icon>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="mobile-cards">
        ${backups.map(b => `
          <div class="m-card">
            <div class="m-card-title">
              <ha-icon icon="mdi:zip-box-outline" style="color:var(--secondary-text-color);flex-shrink:0;margin-top:1px;"></ha-icon>
              ${this.escapeHtml(b.name)}
            </div>
            <div class="m-card-meta">📅 ${new Date(b.created).toLocaleString()} · ${Math.round(b.size / 1024)} KB</div>
            <div class="m-card-btns">
              <button class="restore-btn" data-path="${b.path}" style="background:var(--warning-color,#ff9800);color:black;">
                <ha-icon icon="mdi:backup-restore"></ha-icon> ${this.t('actions.restore')}
              </button>
              <button class="delete-backup-btn" data-path="${b.path}" data-name="${b.name}" style="background:var(--error-color,#ef5350);color:white;">
                <ha-icon icon="mdi:delete-outline"></ha-icon> ${this.t('actions.delete')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

      container.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.restoreBackup(e.currentTarget.dataset.path));
      });

      container.querySelectorAll('.delete-backup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.deleteBackup(e.currentTarget.dataset.path, e.currentTarget.dataset.name));
      });

      // Barre de pagination
      container.insertAdjacentHTML('beforeend',
        this._pagHTML(PAG_ID, backups.length, st.page, st.pageSize)
      );
      this._pagWire(container, () => this.renderBackups(container._allBackups));
    }

    async createBackup() {
      if (!confirm(this.t('backup.confirm_create'))) return;
      try {
        const result = await this.hass.callWS({
          type: 'call_service',
          domain: 'config_auditor',
          service: 'create_backup',
          service_data: {},
          return_response: true
        });

        this.showHANotification(this.t('notifications.report_generated'), this.t('notifications.backup_created_success'), 'haca_backup');
        this.loadBackups();
      } catch (error) {
        this.showHANotification(this.t('notifications.error'), error.message, 'haca_error');
      }
    }

    async restoreBackup(path) {
      if (!confirm(this.t('backup.confirm_restore'))) return;
      try {
        await this.hass.callService('config_auditor', 'restore_backup', { backup_path: path });
        this.showHANotification(this.t('notifications.report_generated'), this.t('notifications.backup_restored_success'), 'haca_restore');
      } catch (error) {
        this.showHANotification(this.t('notifications.error'), error.message, 'haca_error');
      }
    }

    async deleteBackup(path, name) {
      if (!confirm(this.t('backup.confirm_delete') + '\n\n' + name)) return;

      try {
        const result = await this.hass.callWS({
          type: 'call_service',
          domain: 'config_auditor',
          service: 'delete_backup',
          service_data: { backup_path: path },
          return_response: true
        });

        const response = result.response || result;

        if (response.success) {
          this.showHANotification(
            this.t('notifications.backup_deleted'),
            response.message || `${response.deleted_file}`,
            'haca_backup_deleted'
          );
          // Refresh the backups list
          this.loadBackups();
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

    // ── Chat IA ──────────────────────────────────────────────────────────────

    _appendChatMsg(role, text) {
      const container = this.shadowRoot.querySelector('#chat-messages');
      if (!container) return;
      const isUser = role === 'user';
      const div = document.createElement('div');
      div.style.cssText = [
        'border-radius:12px', 'padding:12px 16px', 'max-width:85%',
        isUser ? 'align-self:flex-end;background:var(--primary-color);color:white'
          : 'align-self:flex-start;background:var(--secondary-background-color)'
      ].join(';');
      if (!isUser) {
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:11px;color:var(--secondary-text-color);margin-bottom:4px';
        lbl.textContent = this.t('misc.ai_assistant');
        div.appendChild(lbl);
      }
      const content = document.createElement('div');
      content.style.cssText = 'white-space:pre-wrap;line-height:1.5;font-size:14px';
      content.textContent = text;
      div.appendChild(content);
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }

    async _sendChatMessage() {
      const input = this.shadowRoot.querySelector('#chat-input');
      const sendBtn = this.shadowRoot.querySelector('#chat-send');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      this._appendChatMsg('user', text);

      // Build context from last scan results
      const stats = this._lastStats || {};
      const ctx = stats.total_issues != null
        ? this.t('ai_prompts.chat_context').replace('{total_issues}',stats.total_issues).replace('{automations}',stats.automations_count||0).replace('{scripts}',stats.scripts_count||0)
        : '';

      // Show typing indicator
      const typingDiv = this._appendChatMsg('assistant', '…');
      if (sendBtn) sendBtn.disabled = true;

      try {
        // ai_task.generate_data — service officiel HA pour les tâches IA.
        // IMPORTANT : ce service exige return_response=true, sinon HA retourne 400.
        // callService() accepte un 6e argument `returnResponse` (bool) qui ajoute
        // return_response:true dans le message WebSocket sous-jacent.
        // La réponse arrive dans result.response = { data: "...", conversation_id: "..." }
        let reply = null;

        try {
          const result = await this._hass.callService(
            'ai_task',
            'generate_data',
            {
              task_name: 'HACA Chat',
              instructions: ctx + text,
            },
            undefined, // target — aucun pour ai_task
            false,     // notifyOnError — on gère nous-mêmes
            true       // returnResponse — REQUIS pour récupérer la réponse
          );
          const data = result?.response?.data;
          if (data) {
            reply = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            this._chatConvId = result?.response?.conversation_id || null;
          }
        } catch (aiErr) {
          // ai_task non disponible (aucun modèle IA configuré dans HA) → fallback
          console.warn('[HACA] ai_task.generate_data indisponible:', aiErr.message);
        }

        // Fallback : conversation/process (Assist pipeline avec agent IA configuré)
        if (!reply) {
          try {
            const wsResult = await this._hass.callWS({
              type: 'conversation/process',
              text: ctx + text,
              language: this._hass.language || 'en',
              conversation_id: this._chatConvId || null,
            });
            this._chatConvId = wsResult.conversation_id;
            reply = wsResult.response?.speech?.plain?.speech
              || wsResult.response?.speech?.text
              || null;
          } catch (convErr) {
            console.warn('[HACA] conversation/process indisponible:', convErr.message);
          }
        }

        if (reply) {
          typingDiv.querySelector('div:last-child').textContent = reply;
        } else {
          typingDiv.querySelector('div:last-child').textContent = this.t('misc.no_ai_model');
        }
      } catch (e) {
        typingDiv.querySelector('div:last-child').textContent = this.t('misc.ai_error') + (e.message || String(e));
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        const container = this.shadowRoot.querySelector('#chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
      }
    }

    switchTab(tabName) {
      this.shadowRoot.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
      this.shadowRoot.querySelector(`.tabs .tab[data-tab="${tabName}"]`)?.classList.add('active');
      this.shadowRoot.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.shadowRoot.querySelector(`#tab-${tabName}`)?.classList.add('active');
      this._activeTab = tabName;
      if (tabName === 'config') this.loadConfigTab();
    }

    switchSubtab(subtabName) {
      this.shadowRoot.querySelectorAll('.subtabs .subtab').forEach(t => t.classList.remove('active'));
      this.shadowRoot.querySelector(`.subtabs .subtab[data-subtab="${subtabName}"]`)?.classList.add('active');
      this.shadowRoot.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      this.shadowRoot.querySelector(`#subtab-${subtabName}`)?.classList.add('active');
    }

    // ─── Onglet Configuration ──────────────────────────────────────────────

    async loadConfigTab() {
      const el = this.shadowRoot.querySelector('#tab-config');
      if (!el) return;

      try {
        const result = await this._hass.callWS({ type: 'haca/get_options' });
        const options = result.options || {};
        const lang = this._language || 'en';

        el.innerHTML = renderConfigTab(options, lang, this.t.bind(this));
        this._attachConfigListeners(el, options);
      } catch (err) {
        el.innerHTML = `<div style="padding:32px;text-align:center;color:var(--error-color);">
        ❌ Erreur de chargement : ${err.message}
      </div>`;
      }
    }

    _attachConfigListeners(el, options) {
      const lang = this._language || 'en';
      const t = (fr, en) => lang === 'fr' ? fr : en;

      // Compteurs initiaux
      _updateTypeCounts(el);

      // Toggle types individuels
      el.querySelectorAll('.cfg-type-toggle').forEach(cb => {
        cb.addEventListener('change', () => {
          const row = el.querySelector(`.cfg-type-row[data-type="${cb.dataset.type}"]`);
          if (row) {
            row.classList.toggle('disabled', !cb.checked);
            if (!cb.checked) row.classList.remove('enabled');
          }
          _updateTypeCounts(el);
        });
      });

      // Boutons "Tout activer / désactiver" par catégorie
      el.querySelectorAll('.cfg-cat-all-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const catId = btn.dataset.cat;
          const action = btn.dataset.action; // 'enable' | 'disable'
          const list = el.querySelector(`#types-${catId}`);
          if (!list) return;
          list.querySelectorAll('.cfg-type-toggle').forEach(cb => {
            cb.checked = (action === 'enable');
            const row = el.querySelector(`.cfg-type-row[data-type="${cb.dataset.type}"]`);
            if (row) row.classList.toggle('disabled', !cb.checked);
          });
          _updateTypeCounts(el);
        });
      });

      // Toggle monitoring → afficher/masquer délai debounce
      const monitoringCb = el.querySelector('#cfg-event-monitoring');
      const debounceRow = el.querySelector('#cfg-debounce-row');
      if (monitoringCb && debounceRow) {
        const updateDebounce = () => {
          debounceRow.style.opacity = monitoringCb.checked ? '1' : '0.4';
          const inp = debounceRow.querySelector('input');
          if (inp) inp.disabled = !monitoringCb.checked;
        };
        monitoringCb.addEventListener('change', updateDebounce);
        updateDebounce();
      }

      // Bouton Réinitialiser
      el.querySelector('#cfg-reset-btn')?.addEventListener('click', () => {
        if (confirm(this.t('toast.config_reset_confirm'))) {
          el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--secondary-text-color);">
          <ha-icon icon="mdi:loading" style="--mdc-icon-size:32px;animation:haca-spin 1s linear infinite;"></ha-icon>
          <div style="margin-top:12px;">${this.t('config.resetting')}</div>
        </div>`;
          this.saveConfig(DEFAULT_OPTIONS).then(() => this.loadConfigTab());
        }
      });

      // Bouton Enregistrer
      el.querySelector('#cfg-save-btn')?.addEventListener('click', () => this._doSaveConfig(el));

      // Toggle debug — état restauré depuis options (persisté dans entry.options)
      // L'état est sauvegardé via le bouton Enregistrer (inclus dans collectFormOptions)
      // set_log_level est appliqué côté backend lors du save_options.
      const debugToggle = el.querySelector('#cfg-debug-toggle');
      if (debugToggle) {
        // Restaurer depuis les options HA (source de vérité persistante)
        debugToggle.checked = !!(options.debug_mode);
        window.__haca_debug_mode = debugToggle.checked;
      }
    }

    async _doSaveConfig(el) {
      const lang = this._language || 'en';
      const t = (fr, en) => lang === 'fr' ? fr : en;
      const statusEl = el.querySelector('#cfg-save-status');
      const saveBtn = el.querySelector('#cfg-save-btn');

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';
        saveBtn.innerHTML = '<span class="btn-loader"></span> ' + this.t('config.saving');
      }

      try {
        const options = collectFormOptions(el);
        await this.saveConfig(options);

        if (statusEl) {
          // Vérifier si event_monitoring a changé (nécessite un redémarrage HA pour s'appliquer)
          const prevMonitoring = this._lastSavedOptions?.event_monitoring_enabled;
          const newMonitoring = options.event_monitoring_enabled;
          const monitoringChanged = prevMonitoring !== undefined && prevMonitoring !== newMonitoring;

          statusEl.className = 'cfg-save-status success';
          statusEl.textContent = monitoringChanged
            ? '✅ ' + t(
              this.t('toast.config_saved_restart'))
            : '✅ ' + this.t('toast.config_saved');
          statusEl.style.display = 'block';
          this._lastSavedOptions = options;
          setTimeout(() => { statusEl.style.display = 'none'; }, monitoringChanged ? 6000 : 3500);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.className = 'cfg-save-status error';
          statusEl.textContent = '❌ ' + this.t('config.save_error') + err.message;
          statusEl.style.display = 'block';
        }
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          saveBtn.innerHTML = '<ha-icon icon="mdi:content-save" style="--mdc-icon-size:18px;"></ha-icon> ' + this.t('config.save');
        }
      }
    }

    async saveConfig(options) {
      await this._hass.callWS({ type: 'haca/save_options', options });
    }

    async loadData() {
      if (!this._hass) return;
      // Garde de concurrence : évite d'empiler des appels si le précédent est encore en cours
      if (this._dataLoading) return;
      this._dataLoading = true;
      try {
        const result = await this._hass.callWS({ type: 'haca/get_data' });
        this._cachedData = result;
        _HC.data = result;           // cache module : survive aux navigations
        this._dataErrorCount = 0;
        this.updateUI(result);
        // Hide the boot splash on first successful data load
        this._hideBootSplash();
      } catch (error) {
        this._dataErrorCount = (this._dataErrorCount || 0) + 1;
        const msg = error?.message || String(error);
        // Erreurs de reconnexion WS → silencieuses (le watchdog relancera loadData)
        const isWsReconnect = msg.includes('not_found') ||
          msg.includes('Connection lost') ||
          msg.includes('Lost connection') ||
          msg.includes('Subscription not found');
        // HACA backend not yet available (HA still starting up) — keep splash, retry
        const isHacaNotReady = msg.includes('unknown_command') ||
          msg.includes('haca/get_data') ||
          msg.includes('Unknown command');
        if (isWsReconnect || isHacaNotReady) {
          console.debug('[HACA] loadData: backend not ready, will retry…');
          // Ensure boot splash stays visible during startup retry loop
          this._showBootSplash();
          if (!this._bootRetryTimer) {
            this._bootRetryTimer = setInterval(() => {
              if (!this._connected || !this._hass) return;
              console.debug('[HACA] Boot retry…');
              this.loadData().then(() => {
                // Success handled inside loadData (hideBootSplash called there)
                clearInterval(this._bootRetryTimer);
                this._bootRetryTimer = null;
              });
            }, 5000);
          }
        } else {
          console.error('[HACA] Error loading data:', error);
          const el = this.shadowRoot.querySelector('#issues-all');
          if (el) el.innerHTML = `<div class="empty-state">❌ ${msg}</div>`;
        }
      } finally {
        // Libère le verrou dans tous les cas (succès, erreur, ou rejet de Promise)
        this._dataLoading = false;
      }
    }

    updateUI(data) {
      this._lastData = data;

      const safeSetText = (id, val) => {
        const el = this.shadowRoot.querySelector(`#${id}`);
        if (el) el.textContent = val;
      };

      const score = data.health_score || 0;
      safeSetText('health-score', score + '%');

      // Health score card colour
      const hsCard = this.shadowRoot.querySelector('#health-score-card');
      if (hsCard) {
        const col = score >= 80 ? 'var(--success-color,#4caf50)'
          : score >= 50 ? 'var(--warning-color,#ffa726)'
            : 'var(--error-color,#ef5350)';
        hsCard.style.borderLeft = `5px solid ${col}`;
      }

      // Update Issues tab badge with total issue count
      const totalIssues = (data.automation_issues || 0) + (data.script_issues || 0)
        + (data.scene_issues || 0) + (data.entity_issues || 0) + (data.performance_issues || 0)
        + (data.security_issues || 0) + (data.blueprint_issues || 0) + (data.dashboard_issues || 0);
      const issuesTab = this.shadowRoot.querySelector('.tabs .tab[data-tab="issues"]');
      if (issuesTab) {
        const existingBadge = issuesTab.querySelector('.tab-count');
        if (existingBadge) existingBadge.remove();
        if (totalIssues > 0) {
          const badge = document.createElement('span');
          badge.className = 'tab-count';
          badge.textContent = totalIssues;
          badge.style.cssText = 'background:var(--error-color,#ef5350);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:4px;';
          issuesTab.appendChild(badge);
        }
      }

      // Load sparkline (async, non-blocking)
      this._loadSparkline();
      safeSetText('auto-count', data.automation_issues || 0);
      safeSetText('script-count', data.script_issues || 0);
      safeSetText('scene-count', data.scene_issues || 0);
      safeSetText('entity-count', data.entity_issues || 0);
      safeSetText('perf-count', data.performance_issues || 0);
      safeSetText('security-count', data.security_issues || 0);
      safeSetText('blueprint-count', data.blueprint_issues || 0);
      safeSetText('dashboard-count', data.dashboard_issues || 0);

      // ── Recorder orphans ──────────────────────────────────────────────
      this._updateRecorderOrphans(data);

      // ── Complexity / stats tables ─────────────────────────────────────
      this._renderComplexityTable(data.complexity_scores || []);

      // ── Dependency graph ─────────────────────────────────────────────
      this._graphData = data.dependency_graph || { nodes: [], edges: [] };
      if (this._activeTab === 'carte') {
        this._renderDepGraph(this._graphData);
      }

      // ── Battery monitor ───────────────────────────────────────────────
      this._renderBatteryTables(data.battery_list || []);
      // Badge on batteries tab
      const batAlerts = data.battery_alerts || 0;
      const batBadge = this.shadowRoot.querySelector('#tab-badge-batteries');
      if (batBadge) {
        batBadge.textContent = batAlerts;
        batBadge.style.display = batAlerts > 0 ? 'inline' : 'none';
      }
      this._renderScriptComplexityTable(data.script_complexity_scores || []);
      this._renderSceneStatsTable(data.scene_stats || []);
      this._renderBlueprintStatsTable(data.blueprint_stats || []);

      const autoIssues = data.automation_issue_list || [];
      const scriptIssues = data.script_issue_list || [];
      const sceneIssues = data.scene_issue_list || [];
      const entityIssues = data.entity_issue_list || [];
      const perfIssues = data.performance_issue_list || [];
      const securityIssues = data.security_issue_list || [];
      const blueprintIssues = data.blueprint_issue_list || [];
      const dashboardIssues = data.dashboard_issue_list || [];
      const allIssues = [...autoIssues, ...scriptIssues, ...sceneIssues, ...entityIssues, ...perfIssues, ...securityIssues, ...blueprintIssues, ...dashboardIssues];

      // ── Preserve active filters across refreshes ──────────────────────────
      // Read the currently active filter for each container from the DOM chips,
      // then reapply after renderIssues so auto-refresh never resets the view.
      const getActiveFilter = (containerId) => {
        const bar = this.shadowRoot.querySelector(`#filter-bar-${containerId}`);
        if (!bar) return 'all';
        const active = bar.querySelector('[class*="active-"]');
        if (!active) return 'all';
        const cls = [...active.classList].find(c => c.startsWith('active-'));
        return cls ? cls.replace('active-', '') : 'all';
      };

      const containers = [
        ['issues-all', allIssues],
        ['issues-automations', autoIssues],
        ['issues-scripts', scriptIssues],
        ['issues-scenes', sceneIssues],
        ['issues-entities', entityIssues],
        ['issues-performance', perfIssues],
        ['issues-security', securityIssues],
        ['issues-blueprints', blueprintIssues],
        ['issues-dashboards', dashboardIssues],
      ];

      for (const [cid, issues] of containers) {
        const activeFilter = getActiveFilter(cid);
        // Always store the full list (needed for future filter changes)
        const container = this.shadowRoot.querySelector(`#${cid}`);
        if (container) container._allIssues = issues;
        // Render with the currently active filter
        this.renderIssues(issues, cid, activeFilter === 'all' ? undefined : activeFilter);
        // Restore chip active state (renderIssues doesn't touch chips)
        this._restoreFilterChip(cid, activeFilter);
      }
    }


    _updateRecorderOrphans(data) {
      const orphans = data.recorder_orphans || [];
      const count = data.recorder_orphan_count || 0;
      const mb = data.recorder_wasted_mb || 0;
      const dbOk = data.recorder_db_available !== false;

      // Stat card
      const countEl = this.shadowRoot.querySelector('#recorder-orphan-count');
      const mbEl = this.shadowRoot.querySelector('#recorder-orphan-mb');
      if (countEl) countEl.textContent = dbOk ? count : '—';
      if (mbEl) mbEl.textContent = dbOk ? (mb > 0 ? this.t('recorder.wasted_mb', { mb }) : this.t('recorder.db_clean')) : this.t('recorder.db_unavailable_short');

      // Badge on sub-section header
      const badge = this.shadowRoot.querySelector('#recorder-db-badge');
      if (badge) {
        if (!dbOk) {
          badge.textContent = this.t('recorder.unavailable_badge'); badge.style.display = '';
        } else if (count > 0) {
          badge.textContent = `${count} orphelin(s) · ~${mb} MB`; badge.style.display = '';
        } else {
          badge.style.display = 'none';
        }
      }

      // Purge-all button
      const purgeAllBtn = this.shadowRoot.querySelector('#recorder-purge-all-btn');
      if (purgeAllBtn) {
        purgeAllBtn.style.display = (dbOk && count > 0) ? '' : 'none';
        purgeAllBtn.onclick = () => this._purgeRecorderOrphans(orphans.map(o => o.entity_id));
      }

      // Orphan list
      const listEl = this.shadowRoot.querySelector('#recorder-orphan-list');
      if (!listEl) return;

      if (!dbOk) {
        listEl.innerHTML = `<div style="color:var(--secondary-text-color);padding:16px 0;">
        <ha-icon icon="mdi:database-off-outline"></ha-icon>
        ${this.t('recorder.db_unavailable')}
      </div>`;
        return;
      }

      if (orphans.length === 0) {
        listEl.innerHTML = `<div style="color:var(--success-color,#4caf50);padding:16px 0;display:flex;align-items:center;gap:8px;">
        <ha-icon icon="mdi:database-check-outline"></ha-icon>
        ${this.t('recorder.no_orphans')}
      </div>`;
        return;
      }

      // Render table with pagination
      const PAG_ID = 'recorder-orphan-list';
      listEl._allOrphans = orphans;
      const st = this._pagState(PAG_ID);
      const pagedOrphans = this._pagSlice(orphans, st.page, st.pageSize);

      listEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;">
        <thead>
          <tr style="border-bottom:2px solid var(--divider-color);text-align:left;">
            <th style="padding:8px 12px;width:32px;">
              <input type="checkbox" id="recorder-select-all" title="${this.t('recorder.select_all')}">
            </th>
            <th style="padding:8px 12px;">${this.t('tables.entity_id_col')}</th>
            <th style="padding:8px 12px;text-align:right;">${this.t('recorder.states_col')}</th>
            <th style="padding:8px 12px;text-align:right;">${this.t('tables.stats_col')}</th>
            <th style="padding:8px 12px;text-align:right;">${this.t('recorder.size_col')}</th>
            <th style="padding:8px 12px;text-align:center;">${this.t('tables.action_col')}</th>
          </tr>
        </thead>
        <tbody>
          ${pagedOrphans.map((o, idx) => `
            <tr style="border-bottom:1px solid var(--divider-color);">
              <td style="padding:8px 12px;">
                <input type="checkbox" class="recorder-orphan-cb" data-entity="${this.escapeHtml(o.entity_id)}" checked>
              </td>
              <td style="padding:8px 12px;font-family:monospace;color:var(--primary-text-color);">
                ${this.escapeHtml(o.entity_id)}
                ${o.has_stats ? '<span style="font-size:10px;background:var(--info-color,#26c6da);color:#fff;padding:1px 5px;border-radius:8px;margin-left:4px;">stats</span>' : ''}
              </td>
              <td style="padding:8px 12px;text-align:right;color:var(--secondary-text-color);">${o.state_rows.toLocaleString()}</td>
              <td style="padding:8px 12px;text-align:right;color:var(--secondary-text-color);">${o.stat_rows.toLocaleString()}</td>
              <td style="padding:8px 12px;text-align:right;font-weight:600;color:#ff7043;">
                ${o.est_mb >= 0.1 ? o.est_mb + ' MB' : '<1 KB'}
              </td>
              <td style="padding:8px 12px;text-align:center;">
                <button class="recorder-purge-one" data-entity="${this.escapeHtml(o.entity_id)}"
                  style="font-size:11px;padding:4px 10px;background:#ff7043;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                  <ha-icon icon="mdi:delete-outline" style="--mdc-icon-size:13px;"></ha-icon> ${this.t('misc.purge_btn')}
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;color:var(--secondary-text-color);">
          ${this.t('recorder.estimated_total', {mb, count})}
        </span>
        <button id="recorder-purge-selected-btn" style="background:#ff7043;color:#fff;font-size:12px;padding:6px 14px;">
          <ha-icon icon="mdi:delete-sweep-outline" style="--mdc-icon-size:15px;"></ha-icon> ${this.t('misc.purge_selection')}
        </button>
      </div>`;

      // Wire up select-all
      const selectAll = listEl.querySelector('#recorder-select-all');
      if (selectAll) {
        selectAll.addEventListener('change', (e) => {
          listEl.querySelectorAll('.recorder-orphan-cb').forEach(cb => cb.checked = e.target.checked);
        });
      }

      // Wire up individual purge buttons
      listEl.querySelectorAll('.recorder-purge-one').forEach(btn => {
        btn.addEventListener('click', () => this._purgeRecorderOrphans([btn.dataset.entity]));
      });

      // Wire up purge-selected button
      const purgeSelBtn = listEl.querySelector('#recorder-purge-selected-btn');
      if (purgeSelBtn) {
        purgeSelBtn.addEventListener('click', () => {
          const selected = [...listEl.querySelectorAll('.recorder-orphan-cb:checked')]
            .map(cb => cb.dataset.entity);
          if (selected.length === 0) { alert(this.t('recorder.no_entity_selected')); return; }
          this._purgeRecorderOrphans(selected);
        });
      }

      // Barre de pagination
      listEl.insertAdjacentHTML('beforeend',
        this._pagHTML(PAG_ID, orphans.length, st.page, st.pageSize)
      );
      this._pagWire(listEl, () => {
        // Re-render depuis le cache data complet
        if (this._lastData) this._updateRecorderOrphans(this._lastData);
      });
    }

    _purgeRecorderOrphans(entityIds) {
      console.error('[HACA Purge] _purgeRecorderOrphans called, entityIds:', entityIds);
      if (!entityIds || entityIds.length === 0) {
        console.error('[HACA Purge] Empty entityIds, aborting');
        return;
      }

      // Remove any existing modal
      document.getElementById('haca-purge-modal')?.remove();

      const preview = entityIds.slice(0, 6).map(e =>
        `<li style="font-family:monospace;font-size:12px;padding:2px 0;">${this.escapeHtml(e)}</li>`
      ).join('');
      const more = entityIds.length > 6
        ? `<li style="color:var(--secondary-text-color);font-size:12px;">...et ${entityIds.length - 6} autre(s)</li>` : '';

      // Append to document.body so position:fixed works regardless of panel ancestors
      const modal = document.createElement('div');
      modal.id = 'haca-purge-modal';
      modal.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0', 'z-index:99999',
        'background:rgba(0,0,0,0.6)', 'display:flex', 'align-items:center',
        'justify-content:center',
      ].join(';');

      const box = document.createElement('div');
      box.style.cssText = [
        'background:#1e1e2e', 'border-radius:12px', 'padding:28px',
        'max-width:480px', 'width:90%', 'box-shadow:0 8px 40px rgba(0,0,0,0.5)',
        'color:#e0e0e0',
      ].join(';');
      box.innerHTML = `
      <h3 style="margin:0 0 12px;font-size:18px;color:#fff;">
        ${this.t('recorder.purge_confirm_title')}
      </h3>
      <p style="margin:0 0 12px;font-size:14px;opacity:0.8;">
        ${this.t('recorder.purge_confirm_body').replace('{count}', entityIds.length)}
      </p>
      <ul style="margin:0 0 20px;padding-left:16px;">${preview}${more}</ul>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="haca-purge-cancel"
          style="padding:8px 18px;border-radius:6px;border:1px solid #555;background:#333;color:#fff;cursor:pointer;font-size:14px;">
          ${this.t('actions.cancel')}
        </button>
        <button id="haca-purge-confirm"
          style="padding:8px 18px;border-radius:6px;border:none;background:#ff7043;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">
          ${this.t('recorder.purge_button').replace('{count}', entityIds.length)}
        </button>
      </div>`;

      modal.appendChild(box);
      document.body.appendChild(modal);
      console.error('[HACA Purge] Modal appended to document.body');

      const cancelBtn = document.getElementById('haca-purge-cancel');
      const confirmBtn = document.getElementById('haca-purge-confirm');
      console.error('[HACA Purge] cancelBtn:', cancelBtn, 'confirmBtn:', confirmBtn);

      cancelBtn.addEventListener('click', () => { console.error('[HACA Purge] Cancelled'); modal.remove(); });
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      confirmBtn.addEventListener('click', async () => {
        console.error('[HACA Purge] Confirm clicked, entityIds:', entityIds);
        confirmBtn.disabled = true;
        confirmBtn.textContent = this.t('recorder.purge_in_progress');

        const hass = this._hass;
        console.error('[HACA Purge] this._hass:', hass);
        if (!hass || !hass.callWS) {
          console.error('[HACA Purge] _hass or callWS is missing!');
          modal.remove();
          this._this.showToast(this.t('recorder.purge_error_conn'), 'error');
          return;
        }

        try {
          console.error('[HACA Purge] Calling haca/purge_recorder_orphans via callWS');
          const result = await hass.callWS({
            type: 'haca/purge_recorder_orphans',
            entity_ids: entityIds,
          });
          console.error('[HACA Purge] callWS success, result:', result);
          modal.remove();
          // Optimistic update: remove purged entities from the list immediately
          // so the user sees the effect at once without waiting for the DB rescan.
          this._removeOrphansFromUI(entityIds);
          // No automatic rescan — the DB WAL checkpoint needs time to propagate.
          // The UI is updated optimistically via _removeOrphansFromUI already.
          this._showToast('✅ ' + this.t('toast.purged_n').replace('{count}', entityIds.length), 'success');
        } catch (err) {
          console.error('[HACA Purge] callWS error:', err);
          modal.remove();
          this._this.showToast(this.t('recorder.purge_error').replace('{error}', err.message || String(err)), 'error');
        }
      });
    }

    _showToast(message, type = 'info') {
      document.getElementById('haca-toast')?.remove();
      const toast = document.createElement('div');
      toast.id = 'haca-toast';
      const bg = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#1976d2';
      toast.style.cssText = [
        'position:fixed', 'bottom:28px', 'left:50%', 'transform:translateX(-50%)',
        'z-index:100000', `background:${bg}`, 'color:#fff', 'padding:14px 28px',
        'border-radius:8px', 'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
        'font-size:14px', 'max-width:90%', 'text-align:center', 'font-weight:500',
      ].join(';');
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 7000);
    }

    _removeOrphansFromUI(purgedIds) {
      const purgedSet = new Set(purgedIds);

      // Update the orphan count badge
      const countEl = this.shadowRoot.querySelector('#recorder-orphan-count');
      const mbEl = this.shadowRoot.querySelector('#recorder-orphan-mb');
      const badge = this.shadowRoot.querySelector('#recorder-db-badge');

      // Remove rows from the table
      const listEl = this.shadowRoot.querySelector('#recorder-orphan-list');
      if (listEl) {
        purgedIds.forEach(eid => {
          // Find the row by its checkbox data-entity attribute
          const cb = listEl.querySelector(`.recorder-orphan-cb[data-entity="${CSS.escape(eid)}"]`);
          if (cb) cb.closest('tr')?.remove();
          // Also match purge-one buttons
          const btn = listEl.querySelector(`.recorder-purge-one[data-entity="${CSS.escape(eid)}"]`);
          if (btn) btn.closest('tr')?.remove();
        });

        // Update remaining count in the stat card
        const remaining = listEl.querySelectorAll('.recorder-orphan-cb').length;
        if (countEl) countEl.textContent = remaining;
        if (remaining === 0) {
          if (mbEl) mbEl.textContent = this.t('recorder.db_clean_rescanning');
          if (badge) badge.style.display = 'none';
          listEl.innerHTML = `<div style="color:#4caf50;padding:16px 0;display:flex;align-items:center;gap:8px;">
          ${this.t('recorder.no_orphans_rescanning')}
        </div>`;
          // Hide purge-all button
          const purgeAllBtn = this.shadowRoot.querySelector('#recorder-purge-all-btn');
          if (purgeAllBtn) purgeAllBtn.style.display = 'none';
        }
      }
    }

