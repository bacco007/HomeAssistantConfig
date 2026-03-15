  // ═══════════════════════════════════════════════════════════════════
  //  UTILS — createModal · showToastNotification · escapeHtml
  // ═══════════════════════════════════════════════════════════════════

  createModal(content) {
    // Append to document.body — Shadow DOM rend le Light DOM du host invisible,
    // donc tout appendChild(this) serait invisible. document.body est toujours visible.
    const existing = document.body.querySelector('.haca-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'haca-modal';
    const _isMobile = window.innerWidth <= 600;
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 9999;
        display: flex; justify-content: center; align-items: ${_isMobile ? 'flex-end' : 'center'};
      `;

    const card = document.createElement('div');
    card.className = 'haca-modal-card';
    const _mobile = window.innerWidth <= 600;
    card.style.cssText = _mobile
      ? `background: var(--card-background-color); width: 100%; max-width: 100%;
         max-height: 95vh; overflow: hidden; border-radius: 16px 16px 0 0; padding: 0;
         box-shadow: 0 -4px 24px rgba(0,0,0,0.3); display: flex; flex-direction: column; position: relative;`
      : `background: var(--card-background-color); width: 92%; max-width: 1000px;
         max-height: 90vh; overflow: hidden; border-radius: 16px; padding: 0;
         box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column; position: relative;`;

    // Add close button absolutely positioned in top right of modal card
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = _icon("close", 18);
    closeBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 100;
        flex-shrink: 0;
      `;

    // Function to close modal
    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'var(--error-color, #ef5350)';
      closeBtn.style.color = 'white';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'var(--secondary-background-color)';
      closeBtn.style.color = 'black';
    });

    card.appendChild(closeBtn);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content-wrapper';
    contentWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;';
    contentWrapper.innerHTML = typeof content === 'string' ? content : '';
    if (typeof content !== 'string') contentWrapper.appendChild(content);
    card.appendChild(contentWrapper);

    modal.appendChild(card);
    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Store reference to closeModal function and closeBtn on the card
    card._closeModal = closeModal;
    card._closeBtn = closeBtn;

    // Helper method to update content while preserving close button
    card._updateContent = (html) => {
      contentWrapper.innerHTML = html;
    };

    return card;
  }

  /**
   * Ouvre le modal diff/dry-run depuis un événement HA Repairs.
   *
   * Appelé par _subscribeToRepairsFix() quand le backend fire
   * "haca_open_fix_modal". Crée le modal au niveau document.body
   * pour qu'il soit visible depuis n'importe quel panneau HA
   * (l'utilisateur est probablement sur la page HA Repairs).
   *
   * @param {Object} data  Données de l'event : automation_id, fix_type,
   *                       issue_type, entity_id, alias, mode, message...
   */
  showToastNotification(options = {}) {
    const {
      title = 'Notification',
      message = '',
      icon = 'mdi:information',
      iconColor = 'var(--primary-color, #03a9f4)',
      iconBg = 'linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #0288d1 100%)',
      autoDismiss = 5000,
      actionButton = null
    } = options;

    // Add animation keyframes if not exists
    if (!document.querySelector('#haca-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'haca-toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.className = 'haca-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
      max-width: 420px;
      min-width: 320px;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${iconBg}; padding: 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);">
          ${_icon(icon.replace("mdi:", ""), 24)}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 16px;">${title}</div>
          <div style="font-size: 12px; opacity: 0.7;">${message}</div>
        </div>
        <button class="close-toast" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 6px; border-radius: 8px; cursor: pointer;">
          ${_icon("close", 18)}
        </button>
      </div>
      ${actionButton ? `
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 11px; opacity: 0.6; display: flex; align-items: center; gap: 4px;">
            ${_icon("shield-check-outline", 14)}
            ${this.t('notifications.reported_by')}
          </div>
          ${actionButton}
        </div>
      ` : `
        <div style="font-size: 11px; opacity: 0.6; display: flex; align-items: center; gap: 4px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          ${_icon("shield-check-outline", 14)}
          ${this.t('notifications.reported_by')}
        </div>
      `}
    `;

    document.body.appendChild(toast);

    // Close button
    toast.querySelector('.close-toast').addEventListener('click', () => {
      toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    });

    // Auto-dismiss
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, autoDismiss);

    return toast;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

