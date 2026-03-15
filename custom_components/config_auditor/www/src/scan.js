  // ═══════════════════════════════════════════════════════════════════
  //  SCAN — scanAll · scanAutomations · scanEntities
  // ═══════════════════════════════════════════════════════════════════

  updateFromHass() {
    // Conservé pour compatibilité avec les appels internes (scan buttons, fix callbacks, etc.)
    this.loadData();
  }

  // Helper method to show loader on a button
  _setButtonLoading(btn, loading, originalContent) {
    if (!btn) return;

    if (loading) {
      btn.classList.add('scanning');
      btn.disabled = true;
      btn.innerHTML = `<span class="btn-loader"></span> ${this.t('messages.scan_in_progress')}`;
    } else {
      btn.classList.remove('scanning');
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  }

  async scanAll() {
    if (this._scanAllInProgress) return;
    this._scanAllInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-all');
    const originalContent = `${_icon("magnify-scan")} ${this.t('buttons.scan_all')}`;
    this._setButtonLoading(btn, true, originalContent);

    // Timeout de sécurité : si haca_scan_complete n'arrive pas en 5 min,
    // on déverrouille quand même le bouton
    const SCAN_TIMEOUT_MS = 5 * 60 * 1000;
    let scanTimeoutId = null;
    let unsubScanComplete = null;

    const _cleanup = () => {
      if (scanTimeoutId) { clearTimeout(scanTimeoutId); scanTimeoutId = null; }
      if (unsubScanComplete) { try { unsubScanComplete(); } catch (_) {} unsubScanComplete = null; }
      this._scanAllInProgress = false;
      this._setButtonLoading(btn, false, originalContent);
    };

    try {
      // S'abonner à haca_scan_complete AVANT de lancer le scan
      // pour ne manquer aucun événement (race condition impossible)
      if (this.hass?.connection) {
        unsubScanComplete = await this.hass.connection.subscribeEvents((event) => {
          _cleanup();
          this.loadData();
        }, 'haca_scan_complete');
      }

      // Timeout de sécurité
      scanTimeoutId = setTimeout(() => {
        _cleanup();
        this.loadData();
      }, SCAN_TIMEOUT_MS);

      // Lancer le scan (fire-and-forget côté backend, répond immédiatement)
      const result = await this.hass.callWS({ type: 'haca/scan_all' });
      if (result && result.accepted === false) {
        // Scan déjà en cours côté backend
        _cleanup();
      }
    } catch (error) {
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _cleanup();
    }
  }

  async scanAutomations() {
    if (this._scanAutoInProgress) return;
    this._scanAutoInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-auto');
    const originalContent = `${_icon("robot")} ${this.t('buttons.automations')}`;
    this._setButtonLoading(btn, true, originalContent);
    let unsubDone = null;
    let tid = null;
    const _done = () => {
      if (tid) { clearTimeout(tid); tid = null; }
      if (unsubDone) { try { unsubDone(); } catch (_) {} unsubDone = null; }
      this._scanAutoInProgress = false;
      this._setButtonLoading(btn, false, originalContent);
    };
    try {
      if (this.hass?.connection) {
        unsubDone = await this.hass.connection.subscribeEvents(() => {
          _done(); this.loadData();
        }, 'haca_scan_complete');
      }
      tid = setTimeout(() => { _done(); this.loadData(); }, 5 * 60 * 1000);
      await this.hass.callService('config_auditor', 'scan_automations');
    } catch (error) {
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _done();
    }
  }

  async scanEntities() {
    if (this._scanEntityInProgress) return;
    this._scanEntityInProgress = true;
    const btn = this.shadowRoot.querySelector('#scan-entity');
    const originalContent = `${_icon("lightning-bolt")} ${this.t('buttons.entities')}`;
    this._setButtonLoading(btn, true, originalContent);
    let unsubDone = null;
    let tid = null;
    const _done = () => {
      if (tid) { clearTimeout(tid); tid = null; }
      if (unsubDone) { try { unsubDone(); } catch (_) {} unsubDone = null; }
      this._scanEntityInProgress = false;
      this._setButtonLoading(btn, false, originalContent);
    };
    try {
      if (this.hass?.connection) {
        unsubDone = await this.hass.connection.subscribeEvents(() => {
          _done(); this.loadData();
        }, 'haca_scan_complete');
      }
      tid = setTimeout(() => { _done(); this.loadData(); }, 5 * 60 * 1000);
      await this.hass.callService('config_auditor', 'scan_entities');
    } catch (error) {
      this.showHANotification('❌ ' + this.t('notifications.error'), error.message, 'haca_error');
      _done();
    }
  }

