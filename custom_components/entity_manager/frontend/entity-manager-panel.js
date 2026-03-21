// Entity Manager Panel - Updated UI v2.0
// Loads external CSS for cleaner code organization

const EM_VERSION = '2.17.0';

// Determine base URL for loading external resources
const _emScripts = document.querySelectorAll('script[src*="entity-manager-panel"]');
const _emBaseUrl = _emScripts.length > 0 
  ? _emScripts[_emScripts.length - 1].src.replace(/\/[^/]+$/, '/')
  : '/api/entity_manager/frontend/';

// HA label color palette — name sent to HA, hex used for display only
const HA_LABEL_COLORS = [
  ['red', '#f44336'], ['pink', '#e91e63'], ['purple', '#9c27b0'],
  ['deep-purple', '#673ab7'], ['indigo', '#3f51b5'], ['blue', '#2196f3'],
  ['light-blue', '#03a9f4'], ['cyan', '#00bcd4'], ['teal', '#009688'],
  ['green', '#4caf50'], ['light-green', '#8bc34a'], ['lime', '#cddc39'],
  ['yellow', '#ffeb3b'], ['amber', '#ffc107'], ['orange', '#ff9800'],
  ['deep-orange', '#ff5722'], ['brown', '#795548'], ['grey', '#9e9e9e'],
  ['blue-grey', '#607d8b'],
];

// Predefined themes (inlined for reliable loading)
const PREDEFINED_THEMES = {
  'Light': {
    mode: 'light',
    variables: {
      '--em-primary': '#2196f3',
      '--em-primary-dark': '#1565c0',
      '--em-primary-light': '#64b5f6',
      '--em-success': '#4caf50',
      '--em-success-dark': '#388e3c',
      '--em-danger': '#f44336',
      '--em-danger-dark': '#d32f2f',
      '--em-warning': '#ff9800',
      '--em-warning-dark': '#f57c00',
      '--em-text-primary': '#212121',
      '--em-text-secondary': '#757575',
      '--em-text-disabled': '#9e9e9e',
      '--em-bg-primary': '#ffffff',
      '--em-bg-secondary': '#f5f5f5',
      '--em-bg-hover': 'rgba(0,0,0,0.04)',
      '--em-border': '#e0e0e0',
      '--em-border-light': '#eeeeee'
    }
  },
  'Dark': {
    mode: 'dark',
    variables: {
      '--em-primary': '#42a5f5',
      '--em-primary-dark': '#1e88e5',
      '--em-primary-light': '#90caf9',
      '--em-success': '#66bb6a',
      '--em-success-dark': '#43a047',
      '--em-danger': '#ef5350',
      '--em-danger-dark': '#e53935',
      '--em-warning': '#ffa726',
      '--em-warning-dark': '#fb8c00',
      '--em-text-primary': '#e0e0e0',
      '--em-text-secondary': '#9e9e9e',
      '--em-text-disabled': '#616161',
      '--em-bg-primary': '#1e1e1e',
      '--em-bg-secondary': '#121212',
      '--em-bg-hover': 'rgba(255,255,255,0.08)',
      '--em-border': '#333333',
      '--em-border-light': '#2c2c2c'
    }
  },
  'High Contrast': {
    mode: 'dark',
    variables: {
      '--em-primary': '#00e5ff',
      '--em-primary-dark': '#00b8d4',
      '--em-primary-light': '#84ffff',
      '--em-success': '#00ff00',
      '--em-success-dark': '#00cc00',
      '--em-danger': '#ff0000',
      '--em-danger-dark': '#cc0000',
      '--em-warning': '#ffff00',
      '--em-warning-dark': '#ffcc00',
      '--em-text-primary': '#ffffff',
      '--em-text-secondary': '#cccccc',
      '--em-text-disabled': '#888888',
      '--em-bg-primary': '#000000',
      '--em-bg-secondary': '#0a0a0a',
      '--em-bg-hover': 'rgba(255,255,255,0.15)',
      '--em-border': '#ffffff',
      '--em-border-light': '#666666'
    }
  },
  'OLED Black': {
    mode: 'dark',
    variables: {
      '--em-primary': '#bb86fc',
      '--em-primary-dark': '#9c64fb',
      '--em-primary-light': '#d4b8fd',
      '--em-success': '#03dac6',
      '--em-success-dark': '#00a896',
      '--em-danger': '#cf6679',
      '--em-danger-dark': '#b00020',
      '--em-warning': '#ffb74d',
      '--em-warning-dark': '#ffa000',
      '--em-text-primary': '#ffffff',
      '--em-text-secondary': '#b0b0b0',
      '--em-text-disabled': '#606060',
      '--em-bg-primary': '#000000',
      '--em-bg-secondary': '#000000',
      '--em-bg-hover': 'rgba(255,255,255,0.1)',
      '--em-border': '#1f1f1f',
      '--em-border-light': '#121212'
    }
  }
};

// Load external CSS
if (!document.querySelector('link[href*="entity-manager-panel.css"]')) {
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = _emBaseUrl + 'entity-manager-panel.css?v=' + Date.now();
  cssLink.onerror = () => console.error('[Entity Manager] Failed to load CSS from:', cssLink.href);
  document.head.appendChild(cssLink);
}

// Stat dialog tint mapping: type → CSS tint class (see em-sug-* rules in CSS)
const EM_STAT_TINT = {
  automation:  'em-sug-disable',
  script:      'em-sug-disable',
  helper:      'em-sug-labels',
  template:    'em-sug-naming',
  unavailable: 'em-sug-health',
  orphaned:    'em-sug-area',
  health:      'em-sug-disable',   // stale entities dialog
  updates:     'em-sug-naming',    // pending updates dialog
  hacs:        'em-sug-labels',
  lovelace:    'em-sug-naming',
};

// Activity log action type definitions (used in _showActivityLog)
const EM_ACT_TYPES = [
  { id: 'all',     label: 'All' },
  { id: 'enable',  label: 'Enable' },
  { id: 'disable', label: 'Disable' },
  { id: 'rename',  label: 'Rename' },
  { id: 'area',    label: 'Area' },
];

// Icon + color per action type (format strings need this._escapeHtml so live in _showActivityLog)
const EM_ACT_META = {
  enable:  { icon: '✓', color: 'var(--em-success)' },
  disable: { icon: '✕', color: 'var(--em-danger)'  },
  rename:  { icon: '✎', color: 'var(--em-primary)' },
  area:    { icon: '📍', color: '#f44336'           },
};

class EntityManagerPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this.data = [];
    this.deviceInfo = {};
    this.expandedIntegrations = new Set();
    this.expandedDevices = new Set();
    this.selectedEntities = new Set();
    this.selectedUpdates = new Set();
    this.searchTerm = '';
    this.viewState = 'all';
    this.viewMode = 'integrations'; // 'integrations' | 'devices'
    this._viewingSelected = false;
    this._bulkRenameMode = false;
    this._activeView = null;
    this._pendingSuggestionsSection = null;
    this.selectedDomain = 'all';
    this.selectedIntegrationFilter = null; // Filter to show only one integration
    this.integrationViewFilter = {};       // Per-integration entity state filter: 'enabled' | 'disabled' | undefined
    this.deviceViewFilter = {};            // Per-device entity state filter: 'enabled' | 'disabled' | undefined
    this.showAllSidebarIntegrations = false; // Show all integrations in sidebar
    this.updateFilter = 'all'; // all, available, stable, beta
    this.selectedUpdateType = 'all'; // all, device, integration
    this.hideUpToDate = false; // Hide up-to-date items
    this.ghostDeviceCount = 0;
    this.neverTriggeredCount = 0;
    this.cleanupCount = 0;
    this.showOfflineOnly = localStorage.getItem('em-show-offline-only') === 'true';
    this.deviceTypeFilter = localStorage.getItem('em-device-type-filter') || 'all';
    this.backupBeforeUpdate = localStorage.getItem('em-backup-before-update') === 'true';
    this.haAutoBackup = null; // null = unavailable/unknown, {core,addon} = loaded from hassio
    this.domainOptions = [];
    this.isLoading = false;
    this.updateEntities = [];
    this.automationCount = 0;
    this.scriptCount = 0;
    this.helperCount = 0;
    this.updateCount = 0;
    this.hacsCount = 0;
    this.hacsItems = null;
    this.templateCount = 0;
    this.lovelaceCardCount = 0;
    this.configHealthCount = 0;
    this._playAnimations = true; // play on first load; re-armed on sidebar navigation

    // Theme customization state
    this.activeTheme = 'default'; // 'default' follows HA, or saved theme name
    this.customThemes = this._loadSavedThemes();
    
    // Favorites state
    this.favorites = this._loadFavorites();
    this._showOnlyFavorites = false;
    
    // Activity log state
    this.activityLog = this._loadActivityLog();

    // Brands token for integration icon URLs (HA 2026.3+)
    this._brandsToken = '';
    
    // Sidebar state
    this.sidebarCollapsed = localStorage.getItem('em-sidebar-collapsed') === 'true';
    // Which sidebar sections are open — stored as array of IDs; default all closed
    const _ssSaved = localStorage.getItem('em-sidebar-sections');
    this.sidebarOpenSections = new Set(_ssSaved ? JSON.parse(_ssSaved) : []);
    
    // Undo/Redo state — persisted to localStorage so panel re-creations don't lose the stack
    try { this.undoStack = JSON.parse(localStorage.getItem('em_undoStack') || '[]'); } catch { this.undoStack = []; }
    try { this.redoStack = JSON.parse(localStorage.getItem('em_redoStack') || '[]'); } catch { this.redoStack = []; }
    this.maxUndoSteps = 50;
    
    // Saved filter presets
    this.filterPresets = this._loadFilterPresets();
    
    // Custom columns
    this.visibleColumns = this._loadVisibleColumns();
    
    // Entity aliases
    this.entityAliases = this._loadEntityAliases();
    
    // Groups state
    this.smartGroupMode = localStorage.getItem('em-smart-group-mode') || 'integration'; // integration, room, type, device-name, custom
    this.deviceNameFilter = localStorage.getItem('em-device-name-filter') || ''; // active keyword for device-name mode
    this.savedDeviceFilters = JSON.parse(localStorage.getItem('em-saved-device-filters') || '[]'); // [{label, pattern}]
    this.customGroups = JSON.parse(localStorage.getItem('em-custom-groups') || '[]'); // [{id, name, entityIds[]}]
    this.floorsData = null; // Lazy-loaded from entity_manager/get_areas_and_floors
    this._renderedSmartGroups = null; // Cached filtered groups from last smart-group render
    this.entityAreaMap = null;        // entity_id → area_id for orphan entities (no device)
    this.areaLookup = new Map(); // area_id → { areaName, floorName }
    this._lastActivityCache = new Map(); // entity_id → last_active_ts_ms (from recorder, survives restarts)
    
    // Lazy loading state
    this.visibleEntityCounts = {}; // Track visible entities per integration
    this.initialLoadCount = 20; // Initial entities to show
    this.loadMoreCount = 20; // Entities to load on "Load More"
    
    // Drag and drop state
    this.dragDropEnabled = true;
    this.draggedEntity = null;
    this.dragOverEntity = null;
    this.entityOrder = this._loadEntityOrder(); // Custom ordering
    
    // Labels filter state
    this.selectedLabelFilter = null;
    this.labelsCache = null; // Cache for HA labels
    this.labeledEntitiesCache = null; // Cache for entities with labels
    this.labeledDevicesCache = null;  // Cache for devices with labels
    this.labeledAreasCache = null;    // Cache for areas with labels
    this.showAllSidebarLabels = false;
    this.labelsVisibleCount = 8; // lazy-scroll: items visible at a time
    
    // Listen for theme changes
    this._themeObserver = new MutationObserver(() => {
      this.updateTheme();
    });
  }

  _loadFromStorage(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  _saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded or private mode */ }
  }

  _escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Option B: count-up animation for numeric stat values ──────────────────
  _animateStatCounters(container) {
    container.querySelectorAll('.stat-value').forEach(el => {
      const num = parseInt(el.textContent.trim(), 10);
      if (isNaN(num) || num < 2) return;
      // Cancel any in-progress animation on this element before starting a new one
      if (el._animRafId) cancelAnimationFrame(el._animRafId);
      const duration = Math.min(2700, 750 + Math.sqrt(num) * 54);
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - t) ** 3; // cubic ease-out
        el.textContent = Math.round(eased * num);
        if (t < 1) el._animRafId = requestAnimationFrame(tick);
        else { el.textContent = num; el._animRafId = null; }
      };
      el.textContent = '0';
      el._animRafId = requestAnimationFrame(tick);
    });
  }

  // ── Option D: attach one delegated ripple listener to main content ─────────
  _attachRippleListener() {
    // Skip on devices that prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.content.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'em-ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;`
        + `left:${e.clientX - rect.left - size / 2}px;`
        + `top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      // Primary cleanup via animationend; fallback timeout in case event doesn't fire
      const cleanup = () => ripple.remove();
      ripple.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 650);
    });
  }

  _escapeAttr(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  _sanitizeUrl(url) {
    if (!url) return '';
    const s = String(url).trim();
    if (s.startsWith('data:image/')) return s;
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    return '';
  }

  // Shared dialog helpers ─────────────────────────────────────────────────────

  /** "Nd ago" / "Nh ago" / "Nm ago" string, or fallback when isoStr is falsy */
  _fmtAgo(isoStr, fallback = 'Never') {
    if (!isoStr) return fallback;
    const ms = Date.now() - new Date(isoStr).getTime();
    if (isNaN(ms)) return fallback;
    return this._formatTimeDiff(ms) + ' ago';
  }

  /** Collapsible group section (collapsed by default) used in entity-list dialogs */
  _collGroup(label, bodyHtml) {
    return `
      <div class="entity-list-group">
        <div class="entity-list-group-title em-collapsible" style="cursor:pointer;user-select:none;display:flex;align-items:center;gap:8px">
          <span class="em-collapse-arrow em-collapsible-icon" style="transform:rotate(-90deg)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
          ${label}
        </div>
        <div class="em-group-body" style="display:none">${bodyHtml}</div>
      </div>
    `;
  }

  /**
   * Attach collapsible toggle listeners to all `.em-collapsible` headers inside `root`.
   * @param {Element} root  - Container to scope the query to.
   * @param {object}  opts
   * @param {boolean} opts.expand   - If true, expand all groups before wiring (default: false).
   * @param {string}  opts.selector - Override the element selector (default: '.em-collapsible').
   */
  _reAttachCollapsibles(root, { expand = false, selector = '.em-collapsible' } = {}) {
    root.querySelectorAll(selector).forEach(h => {
      const b = h.nextElementSibling;
      if (!b) return;
      const arrow = () => h.querySelector('.em-collapse-arrow') || h.querySelector('.em-collapsible-icon');
      if (expand) {
        b.style.display = '';
        const a = arrow();
        if (a) a.style.transform = '';
      }
      // Skip already-bound elements to prevent double-listener when nodes are moved between containers
      if (h.dataset.collapsibleBound) return;
      h.dataset.collapsibleBound = '1';
      h.addEventListener('click', () => {
        const collapsed = b.style.display === 'none';
        b.style.display = collapsed ? '' : 'none';
        const a = arrow();
        if (a) a.style.transform = collapsed ? '' : 'rotate(-90deg)';
      });
    });
  }

  /**
   * Wire up the `#em-stat-search` input inside a dialog overlay.
   * Filters `.em-mini-card` elements by entity ID / name text, and hides
   * empty collapsible groups so headers don't float alone.
   * @param {HTMLElement} root - The overlay/dialog root element.
   */
  _attachDialogSearch(root) {
    const input = root.querySelector('#em-stat-search, .em-inline-search');
    if (!input) return;
    input.classList.add('em-stat-search-input');
    input.addEventListener('focus', () => input.classList.add('focused'));
    input.addEventListener('blur',  () => input.classList.remove('focused'));
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      root.querySelectorAll('.em-mini-card[data-entity-id]').forEach(card => {
        const eid  = (card.dataset.entityId || '').toLowerCase();
        const name = (card.querySelector('.entity-header-device')?.textContent || '').toLowerCase();
        card.style.display = (!term || eid.includes(term) || name.includes(term)) ? '' : 'none';
      });
      // Hide collapsible group if all its cards are hidden
      root.querySelectorAll('.em-group-body').forEach(body => {
        const hasVisible = [...body.querySelectorAll('.em-mini-card')].some(c => c.style.display !== 'none');
        const hdr = body.previousElementSibling;
        body.style.display = hasVisible || !term ? '' : 'none';
        if (hdr) hdr.style.display = hasVisible || !term ? '' : 'none';
      });
    });
  }

  /** Coloured "triggered by" badge used in automation / template dialogs */
  _triggerBadge(item) {
    // null = automation that has never fired; undefined = field absent (e.g. template sensors)
    if (item.last_triggered === null) return `<span class="em-never-triggered-badge">Never triggered</span>`;
    if (item.triggered_by === 'human') {
      const who = item.triggered_by_name ? ` (${this._escapeHtml(item.triggered_by_name)})` : '';
      return `<span style="color:var(--em-success)">Human${who}</span>`;
    }
    if (item.triggered_by === 'automation') return `<span style="color:var(--em-primary)">Automation / Script</span>`;
    return `<span style="opacity:0.6">HA / System</span>`;
  }

  /** Mini entity card used in stat dialogs — matches the visual style of main view entity cards */
  _renderMiniEntityCard({ entity_id, name, state, stateColor, timeAgo, infoLine, actionsHtml, contentHtml, checkboxHtml = '', extraClass = '', navigatePath = null, compact = false, superLabel = null, extraChip = null }) {
    const eid = this._escapeAttr(entity_id);
    const linkAttr = navigatePath
      ? `data-open-path="${this._escapeAttr(navigatePath)}"`
      : `data-open-entity="${eid}"`;
    // Compact info chip — only shown when no superLabel (superLabel replaces it)
    const infoChip = compact && infoLine && !superLabel
      ? `<span class="entity-platform" style="font-size:10px;background:var(--em-bg-primary);border:1px solid var(--em-border);border-radius:4px;padding:1px 5px;white-space:nowrap;flex-shrink:0">${this._escapeHtml(infoLine)}</span>`
      : '';
    // Name column — with optional superLabel (e.g. integration name) above entity name
    const nameCol = superLabel
      ? `<div style="display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden">
           <span style="font-size:9px;color:var(--em-text-secondary);line-height:1.2;text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this._escapeHtml(superLabel)}</span>
           <span class="entity-header-device" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this._escapeHtml(name)}</span>
         </div>`
      : `<span class="entity-header-device" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(name)}</span>`;
    // Chip section — Cur + state + Avg + extraChip when extraChip present, otherwise plain state chip
    const colorStyle = stateColor ? `border-color:${this._escapeAttr(stateColor)};color:${this._escapeAttr(stateColor)}` : '';
    const chipSection = extraChip != null && state != null
      ? `<span style="font-size:9px;color:var(--em-text-secondary);flex-shrink:0">Cur</span>
         <span class="entity-header-state" style="${colorStyle}">${this._escapeHtml(state)}</span>
         <span style="font-size:9px;color:var(--em-text-secondary);flex-shrink:0">Avg</span>
         <span class="entity-header-state" style="opacity:0.65${colorStyle ? ';' + colorStyle : ''}">${this._escapeHtml(extraChip)}</span>`
      : state != null ? `<span class="entity-header-state" style="${colorStyle}">${this._escapeHtml(state)}</span>` : '';
    return `
      <div class="entity-item entity-list-item em-mini-card ${extraClass}" data-entity-id="${eid}">
        <div class="entity-card-header">
          ${checkboxHtml}
          ${nameCol}
          ${infoChip}
          ${chipSection}
          ${timeAgo ? `<span class="entity-header-time">${this._escapeHtml(timeAgo)}</span>` : ''}
          <button class="em-mini-card-link" ${linkAttr} title="Open in Home Assistant"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z"/><text x="12" y="17.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="white" font-family="sans-serif">HA</text></svg></button>
        </div>
        ${compact ? '' : `<div class="entity-card-body" style="padding:6px 10px 4px">
          <div class="entity-id" style="font-size:12px;opacity:0.8">${this._escapeHtml(entity_id)}</div>
          ${infoLine ? `<div class="entity-platform" style="font-size:11px;margin-top:2px">${infoLine}</div>` : ''}
        </div>`}
        ${contentHtml ? `<div class="em-mini-card-content">${contentHtml}</div>` : ''}
        ${actionsHtml ? `<div class="em-mini-card-actions">${actionsHtml}</div>` : ''}
      </div>
    `;
  }

  _renderDialogBulkBar(actions) {
    const btns = actions.map(a =>
      `<button class="em-dialog-btn em-dialog-btn-${a.variant || 'secondary'} em-bulk-action-btn"
         data-bulk-action="${this._escapeAttr(a.id)}">${this._escapeHtml(a.label)}</button>`
    ).join('');
    return `<div class="em-dialog-bulk-bar" id="em-dialog-bulk-bar">
      <span class="em-bulk-count">0 selected</span>${btns}
      <button class="em-dialog-btn em-dialog-btn-secondary em-bulk-deselect-all">Deselect all</button>
    </div>`;
  }

  _attachDialogBulkListeners(overlay, actions) {
    const bar = overlay.querySelector('#em-dialog-bulk-bar');
    if (!bar) return;
    const getChecked = () => [...overlay.querySelectorAll('.em-dlg-sel:checked')];
    const refresh = () => {
      const n = getChecked().length;
      bar.classList.toggle('is-visible', n >= 1);
      bar.querySelector('.em-bulk-count').textContent = `${n} selected`;
    };
    overlay.addEventListener('change', e => {
      if (e.target.classList.contains('em-dlg-sel')) refresh();
    });
    bar.querySelector('.em-bulk-deselect-all').addEventListener('click', () => {
      overlay.querySelectorAll('.em-dlg-sel').forEach(cb => { cb.checked = false; });
      refresh();
    });
    bar.querySelectorAll('.em-bulk-action-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = actions.find(a => a.id === btn.dataset.bulkAction);
        if (!action) return;
        const checked = getChecked();
        action.handler(
          checked.map(cb => cb.dataset.entityId),
          checked.map(cb => cb.dataset.entityName || cb.dataset.entityId)
        );
      });
    });
  }

  _showCreateHelperDialog() {
    const helperTypes = [
      { id: 'input_boolean', label: 'Toggle', fields: [] },
      { id: 'input_number', label: 'Number', fields: [
        { id: 'min', label: 'Min', type: 'number', default: '0' },
        { id: 'max', label: 'Max', type: 'number', default: '100' },
        { id: 'step', label: 'Step', type: 'number', default: '1' },
      ]},
      { id: 'input_text', label: 'Text', fields: [
        { id: 'min', label: 'Min length', type: 'number', default: '0' },
        { id: 'max', label: 'Max length', type: 'number', default: '100' },
      ]},
      { id: 'input_select', label: 'Dropdown', fields: [
        { id: 'options', label: 'Options (comma-separated)', type: 'text', default: 'Option 1, Option 2' },
      ]},
      { id: 'input_datetime', label: 'Date/Time', fields: [
        { id: 'has_date', label: 'Has Date', type: 'checkbox', default: true },
        { id: 'has_time', label: 'Has Time', type: 'checkbox', default: true },
      ]},
      { id: 'input_button', label: 'Button', fields: [] },
      { id: 'counter', label: 'Counter', fields: [
        { id: 'initial', label: 'Initial value', type: 'number', default: '0' },
        { id: 'step', label: 'Step', type: 'number', default: '1' },
        { id: 'min', label: 'Min (optional)', type: 'number', default: '' },
        { id: 'max', label: 'Max (optional)', type: 'number', default: '' },
      ]},
      { id: 'timer', label: 'Timer', fields: [
        { id: 'duration', label: 'Duration (HH:MM:SS)', type: 'text', default: '00:05:00' },
      ]},
    ];

    const typeOptionsHtml = helperTypes.map(t =>
      `<option value="${t.id}">${t.label} (${t.id})</option>`
    ).join('');

    const renderExtraFields = (typeId) => {
      const ht = helperTypes.find(t => t.id === typeId);
      if (!ht || !ht.fields.length) return '';
      return ht.fields.map(f => {
        if (f.type === 'checkbox') {
          return `<div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <input type="checkbox" id="em-ch-${f.id}" ${f.default ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--em-primary)">
            <label for="em-ch-${f.id}" style="font-size:0.85em;font-weight:600;color:var(--em-text-secondary)">${f.label}</label>
          </div>`;
        }
        return `<div>
          <label style="display:block;font-size:0.85em;font-weight:600;margin-bottom:4px;color:var(--em-text-secondary)">${f.label}</label>
          <input type="${f.type || 'text'}" id="em-ch-${f.id}" value="${f.default}"
            style="width:100%;padding:8px;border:1px solid var(--em-border);border-radius:6px;background:var(--em-surface);color:var(--em-text);font-size:0.9em;box-sizing:border-box">
        </div>`;
      }).join('');
    };

    const { overlay, closeDialog } = this.createDialog({
      title: 'Create New Helper',
      color: '#9c27b0',
      contentHtml: `
        <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0">
          <div>
            <label style="display:block;font-size:0.85em;font-weight:600;margin-bottom:6px;color:var(--em-text-secondary)">Helper Type</label>
            <select id="em-ch-type" style="width:100%;padding:8px;border:1px solid var(--em-border);border-radius:6px;background:var(--em-surface);color:var(--em-text);font-size:0.9em">
              ${typeOptionsHtml}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.85em;font-weight:600;margin-bottom:6px;color:var(--em-text-secondary)">Name</label>
            <input type="text" id="em-ch-name" placeholder="e.g. Living Room Toggle"
              style="width:100%;padding:8px;border:1px solid var(--em-border);border-radius:6px;background:var(--em-surface);color:var(--em-text);font-size:0.9em;box-sizing:border-box">
          </div>
          <div id="em-ch-extra-fields"></div>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary" id="em-ch-cancel">Cancel</button>
        <button class="em-dialog-btn" id="em-ch-create" style="background:var(--em-primary);color:#fff;border:none">Create</button>
      `,
    });

    const typeSelect = overlay.querySelector('#em-ch-type');
    const extraFields = overlay.querySelector('#em-ch-extra-fields');

    const updateFields = () => {
      extraFields.innerHTML = renderExtraFields(typeSelect.value);
    };
    typeSelect.addEventListener('change', updateFields);
    updateFields();

    overlay.querySelector('#em-ch-cancel').addEventListener('click', closeDialog);

    overlay.querySelector('#em-ch-create').addEventListener('click', async () => {
      const typeId = typeSelect.value;
      const name = overlay.querySelector('#em-ch-name').value.trim();
      if (!name) { this._showToast('Please enter a name', 'warning'); return; }

      const getVal = (id) => overlay.querySelector(`#em-ch-${id}`)?.value ?? '';
      const getChecked = (id) => overlay.querySelector(`#em-ch-${id}`)?.checked ?? false;
      const getNum = (id) => { const v = getVal(id); return v !== '' ? parseFloat(v) : undefined; };

      let payload = { name };
      if (typeId === 'input_number') {
        payload = { ...payload, min: getNum('min') ?? 0, max: getNum('max') ?? 100, step: getNum('step') ?? 1, mode: 'slider' };
      } else if (typeId === 'input_text') {
        const min = getNum('min'), max = getNum('max');
        if (min !== undefined) payload.min = min;
        if (max !== undefined) payload.max = max;
      } else if (typeId === 'input_select') {
        const opts = getVal('options').split(',').map(o => o.trim()).filter(Boolean);
        if (!opts.length) { this._showToast('Please enter at least one option', 'warning'); return; }
        payload.options = opts;
      } else if (typeId === 'input_datetime') {
        payload.has_date = getChecked('has_date');
        payload.has_time = getChecked('has_time');
        if (!payload.has_date && !payload.has_time) {
          this._showToast('Select at least date or time', 'warning'); return;
        }
      } else if (typeId === 'counter') {
        payload.initial = getNum('initial') ?? 0;
        payload.step = getNum('step') ?? 1;
        const min = getNum('min'), max = getNum('max');
        if (min !== undefined && getVal('min') !== '') payload.minimum = min;
        if (max !== undefined && getVal('max') !== '') payload.maximum = max;
      } else if (typeId === 'timer') {
        const dur = getVal('duration').trim();
        if (dur) payload.duration = dur;
      }

      try {
        await this._hass.callWS({ type: `${typeId}/create`, ...payload });
        this._showToast(`Helper "${name}" created`, 'success');
        closeDialog();
      } catch (err) {
        this._showToast(`Failed to create helper: ${err.message || err}`, 'error');
      }
    });
  }

  _contrastColor(cssColor) {
    if (!cssColor) return '#ffffff';
    try {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillStyle = cssColor;
      const hex = ctx.fillStyle.replace('#', '');
      if (hex.length !== 6) return '#ffffff';
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#212121' : '#ffffff';
    } catch {
      return '#ffffff';
    }
  }

  // Map an HA label color name (e.g. "blue-grey") to a hex value for CSS.
  // Falls through for plain hex values or unknown names.
  _labelColorCss(color) {
    if (!color) return 'var(--em-primary)';
    const entry = HA_LABEL_COLORS.find(([name]) => name === color);
    return entry ? entry[1] : color;
  }

  // ── Label target selector helpers ──────────────────────────────
  _labelTargetSelectorHtml(id = 'em-label-target', defaultTarget = 'both', hasDevice = true) {
    const opts = [
      { val: 'entity', label: 'Entity', title: 'Entity registry — shown in Settings → Entities' },
      ...(hasDevice ? [
        { val: 'device', label: 'Device', title: 'Device registry — shown in Settings → Devices' },
        { val: 'both',   label: 'Both',   title: 'Apply to both entity and device registries' },
      ] : []),
    ];
    return `<div style="margin-bottom:12px">
      <label style="font-size:12px;color:var(--em-text-secondary);display:block;margin-bottom:5px">Apply label to</label>
      <div id="${id}" style="display:flex;gap:5px">
        ${opts.map(o => `<button class="em-target-btn${o.val === defaultTarget ? ' active' : ''}" data-target="${o.val}" title="${o.title}"
          style="flex:1;padding:5px 8px;border-radius:6px;border:1px solid var(--em-border);cursor:pointer;font-size:12px;
                 background:${o.val === defaultTarget ? 'var(--em-primary)' : 'var(--em-bg-hover)'};
                 color:${o.val === defaultTarget ? 'white' : 'var(--em-text-primary)'};
                 font-weight:${o.val === defaultTarget ? '600' : '400'}">${o.label}</button>`).join('')}
      </div>
    </div>`;
  }

  _attachTargetSelector(overlayEl, id) {
    overlayEl.querySelector(`#${id}`)?.addEventListener('click', (e) => {
      const btn = e.target.closest('.em-target-btn');
      if (!btn) return;
      const parent = btn.closest(`#${id}`);
      parent.querySelectorAll('.em-target-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.style.background = active ? 'var(--em-primary)' : 'var(--em-bg-hover)';
        b.style.color      = active ? 'white' : 'var(--em-text-primary)';
        b.style.fontWeight = active ? '600' : '400';
      });
    });
  }

  _getTargetValue(overlayEl, id) {
    return overlayEl.querySelector(`#${id} .em-target-btn.active`)?.dataset.target || 'both';
  }

  _fuzzyMatch(text, pattern) {
    // Fuzzy matching: check if pattern characters appear in order in text
    if (!text || !pattern) return !pattern;
    text = String(text).toLowerCase();
    let patternIdx = 0;
    for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
      if (text[i] === pattern[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === pattern.length;
  }

  _isColorDark(color) {
    // Parse hex or rgb color and check luminance
    let r, g, b;
    const hex = color.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      r = parseInt(h.substring(0, 2), 16);
      g = parseInt(h.substring(2, 4), 16);
      b = parseInt(h.substring(4, 6), 16);
    } else {
      const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (rgb) {
        r = parseInt(rgb[1]); g = parseInt(rgb[2]); b = parseInt(rgb[3]);
      } else {
        return false;
      }
    }
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  connectedCallback() {
    // Observe theme changes on document
    this._themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    this.updateTheme();

    // Re-arm animations when user navigates to this panel from the sidebar
    this._locationChangedHandler = () => {
      if (window.location.pathname.includes('/entity_manager')) {
        this._playAnimations = true;
      }
    };
    window.addEventListener('location-changed', this._locationChangedHandler);
  }

  disconnectedCallback() {
    if (this._themeObserver) this._themeObserver.disconnect();
    if (this._themeOutsideHandler) document.removeEventListener('click', this._themeOutsideHandler);
    if (this._domainOutsideHandler) document.removeEventListener('click', this._domainOutsideHandler);
    if (this._locationChangedHandler) window.removeEventListener('location-changed', this._locationChangedHandler);
  }

  // Re-render sidebar in place and re-attach listeners + labels.
  _reRenderSidebar() {
    const layout = this.querySelector('.em-layout');
    if (!layout) return;
    const oldSidebar = layout.querySelector('.em-sidebar');
    if (!oldSidebar) return;
    oldSidebar.outerHTML = this._renderSidebar();
    this._attachSidebarListeners();
    this._loadAndDisplayLabels();
  }

  /**
   * Render or hide the entity health alert banner above the stat cards.
   * Threshold is stored in localStorage; dismiss state is in-memory (cleared on reload).
   * Guards against re-rendering when the count hasn't changed to avoid listener accumulation.
   */
  _updateHealthBanner() {
    const banner = this.content?.querySelector('#em-health-banner');
    if (!banner) return;
    const threshold = parseInt(this._loadFromStorage('em-health-alert-threshold', '5'), 10) || 5;
    const unavail = this.unavailableCount || 0;
    // Persist dismiss state so it survives page reload within the same session
    const storedDismiss = parseInt(this._loadFromStorage('em-health-banner-dismissed', '-1'), 10);
    const dismissed = storedDismiss === unavail;
    const shouldShow = unavail >= threshold && !dismissed;
    if (!shouldShow) {
      banner.style.display = 'none';
      return;
    }
    // Skip re-render if the banner is already showing the correct count (avoids listener accumulation)
    if (banner.dataset.renderedCount === String(unavail)) {
      banner.style.display = '';
      return;
    }
    banner.dataset.renderedCount = String(unavail);
    banner.style.display = '';
    banner.innerHTML = `
      <div class="em-health-banner">
        <span class="em-health-banner-icon">⚠</span>
        <span class="em-health-banner-msg">
          <strong>${unavail} entities unavailable</strong> — exceeds your alert threshold of ${threshold}.
          <button class="em-health-banner-link" data-action="view-unavailable">View Unavailable</button>
        </span>
        <button class="em-health-banner-settings" title="Change alert threshold">⚙</button>
        <button class="em-health-banner-dismiss" title="Dismiss">✕</button>
      </div>`;
    banner.querySelector('[data-action="view-unavailable"]')?.addEventListener('click', () => {
      this.showEntityListDialog('unavailable');
    });
    banner.querySelector('.em-health-banner-settings')?.addEventListener('click', () => {
      const newVal = prompt(`Entity health alert threshold (currently ${threshold}):\nSet to 0 to disable.`, String(threshold));
      if (newVal === null) return;
      const n = parseInt(newVal, 10);
      if (!isNaN(n) && n >= 0) {
        this._saveToStorage('em-health-alert-threshold', String(n));
        delete banner.dataset.renderedCount; // force re-render with new threshold
        this._updateHealthBanner();
      }
    });
    banner.querySelector('.em-health-banner-dismiss')?.addEventListener('click', () => {
      this._saveToStorage('em-health-banner-dismissed', String(unavail));
      banner.style.display = 'none';
    });
  }

  updateTheme() {
    // If a predefined theme is active, apply it
    if (this.activeTheme !== 'default' && PREDEFINED_THEMES[this.activeTheme]) {
      this._applyCustomTheme(PREDEFINED_THEMES[this.activeTheme]);
      return;
    }
    
    // If a custom theme is active, apply it instead of following HA
    if (this.activeTheme !== 'default' && this.customThemes[this.activeTheme]) {
      this._applyCustomTheme(this.customThemes[this.activeTheme]);
      return;
    }
    
    // Detect dark mode from Home Assistant theme
    const haTheme = document.documentElement.getAttribute('data-theme');
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-background-color')?.trim() || '';
    const isDark =
      haTheme === 'dark' ||
      (bgColor && this._isColorDark(bgColor)) ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Clear any custom theme overrides
    this._clearCustomThemeOverrides();
  }
  
  _applyCustomTheme(theme) {
    // Set base theme mode
    this.setAttribute('data-theme', theme.mode || 'light');
    
    // Apply custom CSS variable overrides
    if (theme.variables) {
      Object.entries(theme.variables).forEach(([key, value]) => {
        this.style.setProperty(key, value);
      });
    }
    
    // Apply background image if set
    if (theme.backgroundImage) {
      const safeUrl = this._sanitizeUrl(theme.backgroundImage);
      if (!safeUrl) return;
      this.style.setProperty('--em-bg-image', `url("${safeUrl.replace(/"/g, '')}")`);
      this.style.setProperty('--em-bg-overlay', (theme.backgroundOverlay || 'rgba(0,0,0,0.7)').replace(/[;{}]/g, ''));
      this.classList.add('has-bg-image');
    } else {
      this.style.removeProperty('--em-bg-image');
      this.style.removeProperty('--em-bg-overlay');
      this.classList.remove('has-bg-image');
    }
  }
  
  _clearCustomThemeOverrides() {
    // Remove any custom CSS variables set on this element
    const customVars = [
      '--em-primary', '--em-primary-dark', '--em-primary-light',
      '--em-success', '--em-success-dark', '--em-danger', '--em-danger-dark',
      '--em-warning', '--em-warning-dark', '--em-text-primary', '--em-text-secondary',
      '--em-text-disabled', '--em-bg-primary', '--em-bg-secondary', '--em-bg-hover',
      '--em-border', '--em-border-light', '--em-shadow', '--em-shadow-hover',
      '--em-bg-image', '--em-bg-overlay'
    ];
    customVars.forEach(v => this.style.removeProperty(v));
    this.classList.remove('has-bg-image');
  }
  
  _exportThemes() {
    const exportData = {
      version: 1,
      themes: this.customThemes,
      activeTheme: this.activeTheme
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'entity-manager-themes.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  
  _importThemes() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.themes || typeof data.themes !== 'object') {
          this._showToast('Invalid theme file format', 'error');
          return;
        }
        
        // Merge imported themes with existing (imported themes override)
        const importCount = Object.keys(data.themes).length;
        Object.entries(data.themes).forEach(([name, theme]) => {
          // Skip reserved names
          if (name !== 'default' && !PREDEFINED_THEMES[name]) {
            // Sanitize theme data
            const sanitized = { mode: theme.mode === 'dark' ? 'dark' : 'light' };
            if (theme.variables && typeof theme.variables === 'object') {
              sanitized.variables = {};
              Object.entries(theme.variables).forEach(([key, value]) => {
                if (typeof key === 'string' && key.startsWith('--em-') && typeof value === 'string' && !value.includes('expression') && !value.includes('javascript:')) {
                  sanitized.variables[key] = value;
                }
              });
            }
            if (theme.backgroundImage) {
              const safeUrl = this._sanitizeUrl(theme.backgroundImage);
              if (safeUrl) sanitized.backgroundImage = safeUrl;
            }
            if (theme.backgroundOverlay && typeof theme.backgroundOverlay === 'string') {
              sanitized.backgroundOverlay = theme.backgroundOverlay.replace(/[;{}]/g, '');
            }
            this.customThemes[name] = sanitized;
          }
        });
        
        this._saveThemesToStorage();
        this._updateThemeDropdownList();
        this._showToast(`Imported ${importCount} theme(s) successfully!`, 'success');
      } catch (err) {
        this._showToast('Failed to import themes: ' + err.message, 'error');
      }
    };
    input.click();
  }
  
  _handleLocalImageUpload() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }
  
  _loadSavedThemes() {
    return this._loadFromStorage('em-custom-themes', {});
  }
  
  _saveThemesToStorage() {
    try {
      localStorage.setItem('em-custom-themes', JSON.stringify(this.customThemes));
      localStorage.setItem('em-active-theme', this.activeTheme);
    } catch (e) {
      console.warn('Could not save themes:', e);
    }
  }
  
  _loadActiveTheme() {
    try {
      const saved = localStorage.getItem('em-active-theme');
      if (saved && (saved === 'default' || PREDEFINED_THEMES[saved] || this.customThemes[saved])) {
        this.activeTheme = saved;
      }
    } catch {
      this.activeTheme = 'default';
    }
  }
  
  _getCurrentThemeVariables() {
    // Capture current computed CSS variables as a theme
    const computedStyle = getComputedStyle(this);
    const variables = {};
    const varNames = [
      '--em-primary', '--em-primary-dark', '--em-primary-light',
      '--em-success', '--em-success-dark', '--em-danger', '--em-danger-dark',
      '--em-warning', '--em-warning-dark', '--em-text-primary', '--em-text-secondary',
      '--em-text-disabled', '--em-bg-primary', '--em-bg-secondary', '--em-bg-hover',
      '--em-border', '--em-border-light'
    ];
    
    varNames.forEach(name => {
      const value = computedStyle.getPropertyValue(name).trim();
      if (value) {
        variables[name] = value;
      }
    });
    
    return {
      mode: this.getAttribute('data-theme') || 'light',
      variables
    };
  }
  
  _saveCurrentTheme() {
    this._showPromptDialog(
      'Save Theme',
      'Enter a name for this theme:',
      `Theme ${Object.keys(this.customThemes).length + 1}`,
      (name) => {
        if (name === 'default' || PREDEFINED_THEMES[name]) {
          this._showToast(`"${name}" is a reserved theme name.`, 'error');
          return;
        }
        const theme = this._getCurrentThemeVariables();
        this.customThemes[name] = theme;
        this._saveThemesToStorage();
        this._updateThemeDropdownList();
        this._setActiveTheme(name);
      }
    );
  }
  
  _deleteCustomTheme(name) {
    this.showConfirmDialog('Delete Theme', `Delete theme "${name}"?`, () => {
      delete this.customThemes[name];
      this._saveThemesToStorage();
      if (this.activeTheme === name) {
        this._setActiveTheme('default');
      }
      this._updateThemeDropdownList();
    });
  }
  
  _setActiveTheme(name) {
    this.activeTheme = name;
    this._saveThemesToStorage();
    this.updateTheme();
    this._updateThemeDropdownUI();
  }
  
  _updateThemeDropdownUI() {
    // Update dropdown button label
    const label = this.querySelector('#theme-btn-label');
    if (label) {
      label.textContent = this.activeTheme === 'default' ? 'Theme' : this.activeTheme;
    }
    
    // Update active states in dropdown
    const items = this.querySelectorAll('.theme-dropdown-item[data-theme]');
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.theme === this.activeTheme);
    });
  }
  
  _updateThemeDropdownList() {
    const list = this.querySelector('#saved-themes-list');
    if (!list) return;
    
    let html = '';
    
    // Add predefined themes section
    html += '<div style="padding: 4px 16px; color: var(--em-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Predefined</div>';
    Object.keys(PREDEFINED_THEMES).forEach(name => {
      const safeName = this._escapeHtml(name);
      const safeAttrName = this._escapeAttr(name);
      html += `
        <div class="theme-dropdown-item ${this.activeTheme === name ? 'active' : ''}" data-theme="${safeAttrName}">
          <svg viewBox="0 0 24 24"><path d="M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" fill="currentColor"/></svg>
          <span style="flex:1">${safeName}</span>
        </div>
      `;
    });

    // Add custom themes section
    const customThemeNames = Object.keys(this.customThemes);
    html += '<div class="theme-dropdown-divider"></div>';
    html += '<div style="padding: 4px 16px; color: var(--em-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Custom</div>';

    if (customThemeNames.length === 0) {
      html += '<div class="theme-dropdown-item" style="color: var(--em-text-secondary); font-style: italic; font-size: 12px;">No saved themes</div>';
    } else {
      customThemeNames.forEach(name => {
        const safeName = this._escapeHtml(name);
        const safeAttrName = this._escapeAttr(name);
        html += `
          <div class="theme-dropdown-item ${this.activeTheme === name ? 'active' : ''}" data-theme="${safeAttrName}">
            <svg viewBox="0 0 24 24"><path d="M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" fill="currentColor"/></svg>
            <span style="flex:1">${safeName}</span>
            <span class="edit-theme-btn" data-edit="${safeAttrName}" style="color: inherit; font-size: 14px; padding: 2px 4px; opacity: 0.7;" title="Edit theme">✎</span>
            <span class="delete-theme-btn" data-delete="${safeAttrName}" style="color: var(--em-danger); font-size: 16px;" title="Delete theme">&times;</span>
          </div>
        `;
      });
    }
    
    list.innerHTML = html;
  }
  
  _openThemeEditor(editThemeName = null) {
    const overlay = this.querySelector('#theme-editor-overlay');
    if (overlay) {
      this._editingThemeName = editThemeName;
      const theme = editThemeName ? this.customThemes[editThemeName] : null;
      
      // Update header and button text
      const headerTitle = overlay.querySelector('.theme-editor-header h3');
      const saveBtn = overlay.querySelector('#theme-editor-save');
      if (headerTitle) headerTitle.textContent = editThemeName ? 'Edit Theme' : 'Create Custom Theme';
      if (saveBtn) saveBtn.textContent = editThemeName ? 'Save Changes' : 'Create Theme';
      
      // Set name
      const nameInput = this.querySelector('#theme-editor-name');
      if (nameInput) nameInput.value = editThemeName || `My Theme ${Object.keys(this.customThemes).length + 1}`;
      
      // Set mode
      const lightMode = this.querySelector('#theme-mode-light');
      const darkMode = this.querySelector('#theme-mode-dark');
      if (theme?.mode === 'dark') {
        if (darkMode) darkMode.checked = true;
      } else {
        if (lightMode) lightMode.checked = true;
      }
      
      // Set colors or reset to defaults
      if (theme?.variables) {
        this._loadThemeColorsToEditor(theme.variables);
      } else {
        this._resetThemeEditorColors();
      }
      this._updateThemeEditorPreview();
      
      // Handle background image
      const bgNone = this.querySelector('input[name="bg-type"][value="none"]');
      const bgUrl = this.querySelector('input[name="bg-type"][value="url"]');
      const bgLocal = this.querySelector('input[name="bg-type"][value="local"]');
      const bgUrlInput = this.querySelector('#bg-url-input');
      const bgLocalInput = this.querySelector('#bg-local-input');
      const bgOverlayRow = this.querySelector('#bg-overlay-row');
      const bgUrlField = this.querySelector('#te-bg-url');
      const bgPreview = this.querySelector('#te-bg-local-preview');
      
      if (theme?.backgroundImage) {
        if (theme.backgroundImage.startsWith('data:')) {
          // Local image (base64)
          if (bgLocal) bgLocal.checked = true;
          if (bgUrlInput) bgUrlInput.style.display = 'none';
          if (bgLocalInput) bgLocalInput.style.display = 'block';
          this._tempLocalBgImage = theme.backgroundImage;
          if (bgPreview) {
            bgPreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = this._sanitizeUrl(theme.backgroundImage);
            img.alt = 'Background preview';
            bgPreview.appendChild(img);
            bgPreview.classList.add('has-image');
          }
        } else {
          // Web URL
          if (bgUrl) bgUrl.checked = true;
          if (bgUrlInput) bgUrlInput.style.display = 'block';
          if (bgLocalInput) bgLocalInput.style.display = 'none';
          if (bgUrlField) bgUrlField.value = theme.backgroundImage;
        }
        if (bgOverlayRow) bgOverlayRow.style.display = 'flex';
        
        // Parse overlay
        if (theme.backgroundOverlay) {
          const match = theme.backgroundOverlay.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]+)?\)/);
          if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            const overlayColor = this.querySelector('#te-bg-overlay');
            const overlayOpacity = this.querySelector('#te-bg-overlay-opacity');
            const overlayValue = this.querySelector('#te-bg-overlay-value');
            if (overlayColor) overlayColor.value = `#${r}${g}${b}`;
            const opacity = Math.round((parseFloat(match[4]) || 0.7) * 100);
            if (overlayOpacity) overlayOpacity.value = opacity;
            if (overlayValue) overlayValue.textContent = `${opacity}%`;
          }
        }
      } else {
        if (bgNone) bgNone.checked = true;
        if (bgUrlInput) bgUrlInput.style.display = 'none';
        if (bgLocalInput) bgLocalInput.style.display = 'none';
        if (bgOverlayRow) bgOverlayRow.style.display = 'none';
        if (bgUrlField) bgUrlField.value = '';
        if (bgPreview) {
          bgPreview.innerHTML = '';
          bgPreview.classList.remove('has-image');
        }
        const overlayColor = this.querySelector('#te-bg-overlay');
        const overlayOpacity = this.querySelector('#te-bg-overlay-opacity');
        const overlayValue = this.querySelector('#te-bg-overlay-value');
        if (overlayColor) overlayColor.value = '#000000';
        if (overlayOpacity) overlayOpacity.value = 70;
        if (overlayValue) overlayValue.textContent = '70%';
        this._tempLocalBgImage = null;
      }
      
      overlay.classList.add('active');
    }
  }
  
  _loadThemeColorsToEditor(variables) {
    const mapping = {
      '--em-primary': 'te-primary',
      '--em-primary-dark': 'te-primary-dark',
      '--em-primary-light': 'te-primary-light',
      '--em-success': 'te-success',
      '--em-danger': 'te-danger',
      '--em-warning': 'te-warning',
      '--em-bg-primary': 'te-bg-primary',
      '--em-bg-secondary': 'te-bg-secondary',
      '--em-text-primary': 'te-text-primary',
      '--em-border': 'te-border'
    };
    
    Object.entries(mapping).forEach(([varName, inputId]) => {
      const value = variables[varName];
      if (value && value.startsWith('#')) {
        const input = this.querySelector(`#${inputId}`);
        if (input) {
          input.value = value;
          const hex = this.querySelector(`.color-hex[data-for="${inputId}"]`);
          if (hex) hex.textContent = value;
        }
      }
    });
  }
  
  _closeThemeEditor() {
    const overlay = this.querySelector('#theme-editor-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    // Clear editing state
    this._editingThemeName = null;
    this._tempLocalBgImage = null;
  }
  
  _resetThemeEditorColors() {
    const defaults = {
      'te-primary': '#2196f3',
      'te-primary-dark': '#1565c0',
      'te-primary-light': '#64b5f6',
      'te-success': '#4caf50',
      'te-danger': '#f44336',
      'te-warning': '#ff9800',
      'te-bg-primary': '#ffffff',
      'te-bg-secondary': '#f5f5f5',
      'te-text-primary': '#212121',
      'te-border': '#e0e0e0'
    };
    
    Object.entries(defaults).forEach(([id, value]) => {
      const input = this.querySelector(`#${id}`);
      if (input) {
        input.value = value;
        const hex = this.querySelector(`.color-hex[data-for="${id}"]`);
        if (hex) hex.textContent = value;
      }
    });
  }
  
  _updateThemeEditorPreview() {
    const preview = this.querySelector('#theme-preview');
    if (!preview) return;
    
    const isDark = this.querySelector('#theme-mode-dark')?.checked;
    const primary = this.querySelector('#te-primary')?.value || '#2196f3';
    const success = this.querySelector('#te-success')?.value || '#4caf50';
    const danger = this.querySelector('#te-danger')?.value || '#f44336';
    const warning = this.querySelector('#te-warning')?.value || '#ff9800';
    const bgPrimary = this.querySelector('#te-bg-primary')?.value || '#ffffff';
    const textPrimary = this.querySelector('#te-text-primary')?.value || '#212121';
    
    preview.style.background = bgPrimary;
    preview.style.color = textPrimary;
    
    const chips = {
      'preview-chip-primary': primary,
      'preview-chip-success': success,
      'preview-chip-danger': danger,
      'preview-chip-warning': warning
    };
    
    Object.entries(chips).forEach(([id, color]) => {
      const chip = this.querySelector(`#${id}`);
      if (chip) {
        chip.style.background = color;
        chip.style.color = this._contrastColor(color);
      }
    });
  }
  
  
  _darkenColor(hex, percent) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * percent));
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * percent));
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * percent));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  _lightenColor(hex, percent) {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(255 * percent));
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(255 * percent));
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(255 * percent));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  _createThemeFromEditor() {
    const name = this.querySelector('#theme-editor-name')?.value?.trim();
    if (!name) {
      this._showToast('Please enter a theme name', 'error');
      return;
    }

    if (name === 'default' || PREDEFINED_THEMES[name]) {
      this._showToast(`"${name}" is a reserved theme name.`, 'error');
      return;
    }

    // Check if name conflicts with another theme (when editing)
    const isEditing = !!this._editingThemeName;
    if (isEditing && name !== this._editingThemeName && this.customThemes[name]) {
      this._showToast(`A theme named "${name}" already exists.`, 'error');
      return;
    }
    
    const isDark = this.querySelector('#theme-mode-dark')?.checked;
    const primary = this.querySelector('#te-primary')?.value || '#2196f3';
    const success = this.querySelector('#te-success')?.value || '#4caf50';
    const danger = this.querySelector('#te-danger')?.value || '#f44336';
    const warning = this.querySelector('#te-warning')?.value || '#ff9800';
    const bgPrimary = this.querySelector('#te-bg-primary')?.value || '#ffffff';
    const bgSecondary = this.querySelector('#te-bg-secondary')?.value || '#f5f5f5';
    const textPrimary = this.querySelector('#te-text-primary')?.value || '#212121';
    const border = this.querySelector('#te-border')?.value || '#e0e0e0';
    
    const theme = {
      mode: isDark ? 'dark' : 'light',
      variables: {
        '--em-primary': primary,
        '--em-primary-dark': this.querySelector('#te-primary-dark')?.value || this._darkenColor(primary, 0.15),
        '--em-primary-light': this.querySelector('#te-primary-light')?.value || this._lightenColor(primary, 0.2),
        '--em-success': success,
        '--em-success-dark': this._darkenColor(success, 0.15),
        '--em-danger': danger,
        '--em-danger-dark': this._darkenColor(danger, 0.15),
        '--em-warning': warning,
        '--em-warning-dark': this._darkenColor(warning, 0.15),
        '--em-text-primary': textPrimary,
        '--em-text-secondary': this._lightenColor(textPrimary, 0.3),
        '--em-text-disabled': this._lightenColor(textPrimary, 0.5),
        '--em-bg-primary': bgPrimary,
        '--em-bg-secondary': bgSecondary,
        '--em-bg-hover': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        '--em-border': border,
        '--em-border-light': this._lightenColor(border, 0.05)
      }
    };
    
    // Handle background image
    const bgType = this.querySelector('input[name="bg-type"]:checked')?.value;
    if (bgType === 'url') {
      const url = this.querySelector('#te-bg-url')?.value?.trim();
      if (url) {
        theme.backgroundImage = url;
      }
    } else if (bgType === 'local' && this._tempLocalBgImage) {
      theme.backgroundImage = this._tempLocalBgImage;
    }
    
    // Handle background overlay
    if (theme.backgroundImage) {
      const overlayColor = this.querySelector('#te-bg-overlay')?.value || '#000000';
      const overlayOpacity = (this.querySelector('#te-bg-overlay-opacity')?.value || 70) / 100;
      // Convert hex to rgba
      const r = parseInt(overlayColor.slice(1, 3), 16);
      const g = parseInt(overlayColor.slice(3, 5), 16);
      const b = parseInt(overlayColor.slice(5, 7), 16);
      theme.backgroundOverlay = `rgba(${r},${g},${b},${overlayOpacity})`;
    }
    
    // If editing and name changed, delete the old theme
    if (isEditing && name !== this._editingThemeName) {
      delete this.customThemes[this._editingThemeName];
      // If the deleted theme was active, we'll switch to the new one
      if (this.activeTheme === this._editingThemeName) {
        this.activeTheme = name;
      }
    }
    
    this.customThemes[name] = theme;
    this._saveThemesToStorage();
    this._updateThemeDropdownList();
    this._setActiveTheme(name);
    this._closeThemeEditor();
    
    // Clear temp data
    this._tempLocalBgImage = null;
    this._editingThemeName = null;
  }
  
  _setupThemeEditor() {
    const overlay = this.querySelector('#theme-editor-overlay');
    if (!overlay) return;
    
    // Close button
    const closeBtn = this.querySelector('#theme-editor-close');
    const cancelBtn = this.querySelector('#theme-editor-cancel');
    const saveBtn = this.querySelector('#theme-editor-save');
    
    if (closeBtn) closeBtn.addEventListener('click', () => this._closeThemeEditor());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeThemeEditor());
    if (saveBtn) saveBtn.addEventListener('click', () => this._createThemeFromEditor());
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._closeThemeEditor();
    });
    
    // Color input changes
    const colorInputs = overlay.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const hex = overlay.querySelector(`.color-hex[data-for="${e.target.id}"]`);
        if (hex) hex.textContent = e.target.value;
        this._updateThemeEditorPreview();
      });
    });
    
    // Mode change
    const modeInputs = overlay.querySelectorAll('input[name="theme-mode"]');
    modeInputs.forEach(input => {
      input.addEventListener('change', () => {
        const isDark = this.querySelector('#theme-mode-dark')?.checked;
        // Update default colors based on mode
        if (isDark) {
          const bgInput = this.querySelector('#te-bg-primary');
          const bgSecInput = this.querySelector('#te-bg-secondary');
          const textInput = this.querySelector('#te-text-primary');
          const borderInput = this.querySelector('#te-border');
          if (bgInput && bgInput.value === '#ffffff') bgInput.value = '#1e1e1e';
          if (bgSecInput && bgSecInput.value === '#f5f5f5') bgSecInput.value = '#2d2d2d';
          if (textInput && textInput.value === '#212121') textInput.value = '#e0e0e0';
          if (borderInput && borderInput.value === '#e0e0e0') borderInput.value = '#424242';
        } else {
          const bgInput = this.querySelector('#te-bg-primary');
          const bgSecInput = this.querySelector('#te-bg-secondary');
          const textInput = this.querySelector('#te-text-primary');
          const borderInput = this.querySelector('#te-border');
          if (bgInput && bgInput.value === '#1e1e1e') bgInput.value = '#ffffff';
          if (bgSecInput && bgSecInput.value === '#2d2d2d') bgSecInput.value = '#f5f5f5';
          if (textInput && textInput.value === '#e0e0e0') textInput.value = '#212121';
          if (borderInput && borderInput.value === '#424242') borderInput.value = '#e0e0e0';
        }
        // Update hex displays
        colorInputs.forEach(ci => {
          const hex = overlay.querySelector(`.color-hex[data-for="${ci.id}"]`);
          if (hex) hex.textContent = ci.value;
        });
        this._updateThemeEditorPreview();
      });
    });
    
    // Background type selection
    const bgTypeInputs = overlay.querySelectorAll('input[name="bg-type"]');
    const bgUrlInput = overlay.querySelector('#bg-url-input');
    const bgLocalInput = overlay.querySelector('#bg-local-input');
    const bgOverlayRow = overlay.querySelector('#bg-overlay-row');
    
    bgTypeInputs.forEach(input => {
      input.addEventListener('change', () => {
        const type = overlay.querySelector('input[name="bg-type"]:checked')?.value;
        bgUrlInput.style.display = type === 'url' ? 'block' : 'none';
        bgLocalInput.style.display = type === 'local' ? 'block' : 'none';
        bgOverlayRow.style.display = type !== 'none' ? 'flex' : 'none';
      });
    });
    
    // Local file upload button
    const localBtn = overlay.querySelector('#te-bg-local-btn');
    const localPreview = overlay.querySelector('#te-bg-local-preview');
    if (localBtn) {
      localBtn.addEventListener('click', async () => {
        const imageData = await this._handleLocalImageUpload();
        if (imageData) {
          this._tempLocalBgImage = imageData;
          localPreview.innerHTML = '';
          const img = document.createElement('img');
          img.src = this._sanitizeUrl(imageData);
          img.alt = 'Background preview';
          localPreview.appendChild(img);
          localPreview.classList.add('has-image');
        }
      });
    }
    
    // Overlay opacity slider
    const overlayOpacity = overlay.querySelector('#te-bg-overlay-opacity');
    const overlayValue = overlay.querySelector('#te-bg-overlay-value');
    if (overlayOpacity && overlayValue) {
      overlayOpacity.addEventListener('input', () => {
        overlayValue.textContent = `${overlayOpacity.value}%`;
      });
    }
  }

  // ===== TOAST NOTIFICATION SYSTEM =====
  
  _showToast(message, type = 'info', duration = 10000) {
    // Remove existing toast if any
    const existing = document.querySelector('.em-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `em-toast em-toast-${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span class="em-toast-icon">${icons[type] || icons.info}</span>
      <span class="em-toast-message">${this._escapeHtml(message)}</span>
      <button class="em-toast-close">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('em-toast-show'));
    
    const closeBtn = toast.querySelector('.em-toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('em-toast-show');
      setTimeout(() => toast.remove(), 300);
    });
    
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove('em-toast-show');
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
  }
  
  _selectAllVisible() {
    const checkboxes = this.querySelectorAll('.entity-checkbox:not(:checked)');
    checkboxes.forEach(cb => {
      cb.checked = true;
      this.selectedEntities.add(cb.dataset.entityId);
    });
    this.querySelectorAll('.integration-select-checkbox').forEach(cb => {
      cb.checked = true;
      cb.indeterminate = false;
    });
    this._updateSelectionUI();
    this._showToast(`Selected ${checkboxes.length} entities`, 'success');
  }
  
  _deselectAll() {
    this.selectedEntities.clear();
    this.querySelectorAll('.entity-checkbox:checked').forEach(cb => cb.checked = false);
    this.querySelectorAll('.integration-select-checkbox').forEach(cb => {
      cb.checked = false;
      cb.indeterminate = false;
    });
    this._updateSelectionUI();
    this._showToast('Selection cleared', 'info');
  }

  _updateIntegrationCheckboxState(integrationId) {
    if (!integrationId) return;
    const integrationCb = this.content && this.content.querySelector(`.integration-select-checkbox[data-integration="${integrationId}"]`);
    if (!integrationCb) return;
    const entityCbs = Array.from(this.content.querySelectorAll(`.entity-checkbox[data-integration="${integrationId}"]`));
    if (entityCbs.length === 0) return;
    const checkedCount = entityCbs.filter(cb => cb.checked).length;
    if (checkedCount === 0) {
      integrationCb.checked = false;
      integrationCb.indeterminate = false;
    } else if (checkedCount === entityCbs.length) {
      integrationCb.checked = true;
      integrationCb.indeterminate = false;
    } else {
      integrationCb.checked = false;
      integrationCb.indeterminate = true;
    }
  }

  _updateSmartGroupCheckboxState(groupKey) {
    if (!groupKey || !this.content) return;
    const cb = this.content.querySelector(`.smart-group-select-checkbox[data-group-key="${CSS.escape(groupKey)}"]`);
    if (!cb) return;
    const entityCbs = Array.from(
      this.content.querySelectorAll(`.smart-group[data-smart-group="${CSS.escape(groupKey)}"] .entity-checkbox`)
    );
    if (entityCbs.length === 0) return;
    const n = entityCbs.filter(c => c.checked).length;
    if (n === 0) {
      cb.checked = false;
      cb.indeterminate = false;
    } else if (n === entityCbs.length) {
      cb.checked = true;
      cb.indeterminate = false;
    } else {
      cb.checked = false;
      cb.indeterminate = true;
    }
  }

  /**
   * Bulk-assign an area to a list of entity objects.
   * Entities with a device → update device_registry (deduped, affects all device entities).
   * Orphan entities (no device) → update entity_registry directly.
   */
  async _assignAreaToEntities(entities, areaId) {
    const seenDevices = new Set();
    for (const ent of entities) {
      // Prefer device-id from entity object; fall back to entityDeviceMap for filtered views
      const deviceId = ent.device_id || this.entityDeviceMap?.get(ent.entity_id) || null;
      if (deviceId) {
        if (!seenDevices.has(deviceId)) {
          seenDevices.add(deviceId);
          const oldAreaId = this.deviceInfo?.[deviceId]?.area_id || null;
          try {
            await this._hass.callWS({ type: 'config/device_registry/update', device_id: deviceId, area_id: areaId });
          } catch (e) {
            throw e;
          }
          this._pushUndoAction({ type: 'assign_device_area', deviceId, oldAreaId, newAreaId: areaId });
        }
        const oldEntityAreaId = this.entityAreaMap?.get(ent.entity_id) || null;
        try {
          await this._hass.callWS({ type: 'config/entity_registry/update', entity_id: ent.entity_id, area_id: areaId });
        } catch (e) {
          throw e;
        }
        if (oldEntityAreaId !== areaId) {
          this._pushUndoAction({ type: 'assign_entity_area', entityId: ent.entity_id, oldAreaId: oldEntityAreaId, newAreaId: areaId });
        }
      } else {
        const oldAreaId = this.entityAreaMap?.get(ent.entity_id) || null;
        try {
          await this._hass.callWS({ type: 'config/entity_registry/update', entity_id: ent.entity_id, area_id: areaId });
        } catch (e) {
          throw e;
        }
        this._pushUndoAction({ type: 'assign_entity_area', entityId: ent.entity_id, oldAreaId, newAreaId: areaId });
      }
    }
  }

  /**
   * Resolve a set/array of entity ID strings to entity objects from this.data.
   */
  _resolveEntitiesById(entityIds) {
    const ids = new Set(entityIds);
    const result = [];
    const found = new Set();
    for (const integration of (this.data || [])) {
      for (const dev of Object.values(integration.devices || {})) {
        for (const ent of (dev.entities || [])) {
          if (ids.has(ent.entity_id)) { result.push(ent); found.add(ent.entity_id); }
        }
      }
    }
    // Fallback: for entities not in this.data (filtered view), create minimal objects
    // using the entity registry map loaded in loadDeviceInfo().
    for (const eid of ids) {
      if (!found.has(eid)) {
        const device_id = this.entityDeviceMap?.get(eid) || null;
        result.push({ entity_id: eid, device_id, deviceName: device_id ? (this.deviceInfo?.[device_id]?.name_by_user || this.deviceInfo?.[device_id]?.name || null) : null });
      }
    }
    return result;
  }

  _closeAllDropdowns() {
    this.querySelectorAll('.theme-dropdown-menu.active, .domain-menu.open').forEach(el => {
      el.classList.remove('active', 'open');
    });
    // Close any overlay dialogs
    const overlay = document.querySelector('.confirm-dialog-overlay, .theme-editor-overlay.active');
    if (overlay) {
      overlay.remove();
    }
  }
  
  _updateSelectionUI() {
    const count = this.selectedEntities.size;
    const selectionBar = this.querySelector('#selection-bar');
    if (selectionBar) {
      selectionBar.style.display = count > 0 ? 'flex' : 'none';
      const countSpan = selectionBar.querySelector('.selection-count');
      if (countSpan) countSpan.textContent = count;
    }
  }
  
  // ===== BULK RENAME =====
  
  async _openBulkRenameDialog() {
    this._bulkRenameMode = true;
    this.querySelector('#main-content')?.classList.add('em-bulk-rename-active');
    try {
      this._bulkRenameData = await this._hass.callWS({ type: 'entity_manager/get_disabled_entities', state: 'all' });
    } catch (_) {
      this._bulkRenameData = this.data || [];
    }
    this.updateView();
  }

  _openView(viewType) {
    this._activeView = viewType;
    this.content.classList.add('em-view-active');
    this.updateView();
  }

  _closeView() {
    this._activeView = null;
    this.content.classList.remove('em-view-active');
    this.updateView();
  }

  _refreshView() {
    const contentEl = this.content.querySelector('#content');
    if (contentEl) contentEl.innerHTML = '';
    this._renderActiveView();
  }

  // Expand a named section in the suggestions inline view body and scroll it into view.
  // Works whether called immediately after render or while the view is already open.
  _expandSuggestionsSection(dialogBody, section) {
    if (!dialogBody || !section) return;
    const sectionMap = { naming: 'Naming Improvements', labels: 'Label Suggestions' };
    const heading = sectionMap[section];
    if (!heading) return;
    const expand = () => {
      dialogBody.querySelectorAll('.em-collapsible').forEach(h => {
        if (h.textContent.includes(heading)) {
          const body = h.nextElementSibling;
          if (body) {
            body.style.display = '';
            const arrow = h.querySelector('.em-collapse-arrow, .em-collapsible-icon');
            if (arrow) arrow.style.transform = '';
          }
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    };
    // Use two nested rafs — first raf ensures layout is committed after innerHTML,
    // second raf ensures scrollIntoView works after the element is visible.
    requestAnimationFrame(() => requestAnimationFrame(expand));
  }

  _renderActiveView() {
    const dispatch = {
      'automations-helpers': () => this._renderAutomationsHelpersView(),
      'health-cleanup':      () => this._renderHealthCleanupView(),
      'template':            () => this.showEntityListDialog('template',   { inline: true }),
      'hacs':                () => this.showEntityListDialog('hacs',       { inline: true }),
      'lovelace':            () => this.showEntityListDialog('lovelace',   { inline: true }),
      'suggestions':         () => {
        const s = this._pendingSuggestionsSection;
        this._pendingSuggestionsSection = null;
        const contentEl = this.content.querySelector('#content');
        const existingView = contentEl?.querySelector('.em-inline-view[data-view="suggestions"]');
        if (existingView && s) {
          // View already open — scroll to and expand the target section directly
          this._expandSuggestionsSection(existingView.querySelector('.em-inline-view-body'), s);
          return;
        }
        this._showSuggestionsDialog(s, { inline: true });
      },
      'browsers':            () => this._showBrowserModDialog(             { inline: true }),
      'activity-log':        () => this._renderActivityLogView(),
      'activity-timeline':   () => this._renderActivityTimelineView(),
    };
    dispatch[this._activeView]?.();
  }

  async _renderAutomationsHelpersView() {
    const contentEl = this.content.querySelector('#content');
    // Guard: don't re-render while content is already loaded
    if (contentEl.querySelector('.em-inline-view[data-view="automations-helpers"]')) return;
    const total = (this.automationCount || 0) + (this.scriptCount || 0) + (this.helperCount || 0);
    const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    const svgRefresh = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
    contentEl.innerHTML = `
      <div class="em-inline-view" data-view="automations-helpers">
        <div class="em-inline-view-header">
          <button class="em-inline-back-btn">${svgBack} Back</button>
          <span class="em-inline-view-title">⚡ Automations &amp; Helpers <span class="em-inline-count">(${total})</span></span>
          <input class="em-inline-search em-dialog-search" placeholder="Search automations, scripts, helpers…">
          <button class="em-inline-refresh-btn" title="Refresh">${svgRefresh}</button>
        </div>
        <div class="em-inline-view-body" id="em-auto-helpers-body">
          <div style="padding:28px;text-align:center;color:var(--em-text-secondary)">Loading…</div>
        </div>
      </div>`;
    contentEl.querySelector('.em-inline-back-btn').addEventListener('click', () => this._closeView());
    contentEl.querySelector('.em-inline-refresh-btn').addEventListener('click', () => this._refreshView());
    // Load data then render — calls same logic as showEntityListDialog but for 3 types merged
    await this._renderMergedEntitySections(['automation', 'script', 'helper'], contentEl.querySelector('#em-auto-helpers-body'));
    this._attachDialogSearch(contentEl);
  }

  async _renderHealthCleanupView() {
    const contentEl = this.content.querySelector('#content');
    // Guard: don't re-render while content is already loaded
    if (contentEl.querySelector('.em-inline-view[data-view="health-cleanup"]')) return;
    const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    const svgRefresh = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
    contentEl.innerHTML = `
      <div class="em-inline-view" data-view="health-cleanup">
        <div class="em-inline-view-header">
          <button class="em-inline-back-btn">${svgBack} Back</button>
          <span class="em-inline-view-title">🩺 Health &amp; Cleanup</span>
          <input class="em-inline-search em-dialog-search" placeholder="Search…">
          <button class="em-inline-refresh-btn" title="Refresh">${svgRefresh}</button>
        </div>
        <div class="em-inline-view-body" id="em-health-cleanup-body">
          <div style="padding:28px;text-align:center;color:var(--em-text-secondary)">Loading…</div>
        </div>
      </div>`;
    contentEl.querySelector('.em-inline-back-btn').addEventListener('click', () => this._closeView());
    contentEl.querySelector('.em-inline-refresh-btn').addEventListener('click', () => this._refreshView());
    await this._renderMergedEntitySections(['cleanup', 'config-health', 'unavailable'], contentEl.querySelector('#em-health-cleanup-body'));
    this._attachDialogSearch(contentEl);
  }

  async _renderMergedEntitySections(types, bodyEl) {
    const sectionTitles = {
      'automation':    'Automations',
      'script':        'Scripts',
      'helper':        'Helpers',
      'config-health': 'Config Errors',
      'unavailable':   'Unavailable Entities',
      'cleanup':       'Cleanup',
    };
    const sectionEmojis = { automation:'⚡', script:'📜', helper:'🔧', 'config-health':'🔴', unavailable:'⚠️', cleanup:'🧹' };
    const sectionTints  = { automation:'em-sug-primary', script:'em-sug-naming', helper:'em-sug-labels', 'config-health':'em-sug-area', unavailable:'em-sug-health', cleanup:'em-sug-disable' };

    // Build all section shells upfront as collapsible groups with a loading placeholder
    let html = '';
    for (const t of types) {
      const tint = sectionTints[t] || '';
      const emoji = sectionEmojis[t] || '';
      const title = sectionTitles[t] || t;
      const loadingBody = `<div style="padding:20px;text-align:center;color:var(--em-text-secondary);font-size:13px">Loading…</div>`;
      html += `<div class="em-inline-section em-sug-section ${tint}" id="em-section-${t}">${this._collGroup(`${emoji} ${title}`, loadingBody)}</div>`;
    }
    bodyEl.innerHTML = html;
    // Wire collapsibles on the shells; all start collapsed by default
    this._reAttachCollapsibles(bodyEl);

    // Load each section async and inject content into the group body
    for (const t of types) {
      const sectionEl = bodyEl.querySelector(`#em-section-${t}`);
      const groupBody = sectionEl.querySelector('.em-group-body');
      try {
        if (t === 'config-health' || t === 'cleanup') {
          // These dialogs attach all button listeners to their container element via delegation.
          // Pass groupBody directly so listeners remain live; skip the temp+move pattern.
          groupBody.innerHTML = '';
          if (t === 'config-health') {
            await this._showConfigEntryHealthDialog({ inline: true, container: groupBody });
          } else {
            await this._showCleanupDialog({ inline: true, container: groupBody });
          }
        } else {
          // Load into a temporary detached container, then move nodes (preserving listeners).
          // Unwrap the single outer _collGroup wrapper that showEntityListDialog adds for
          // automation/script/helper to avoid a duplicate section header.
          // For types with multiple side-by-side groups (e.g. unavailable by domain),
          // move all content directly.
          const temp = document.createElement('div');
          await this.showEntityListDialog(t, { inline: true, container: temp });
          const rootGroups = temp.querySelectorAll('.entity-list-group');
          const source = rootGroups.length === 1 ? rootGroups[0].querySelector('.em-group-body') : temp;
          groupBody.innerHTML = '';
          while (source && source.firstChild) groupBody.appendChild(source.firstChild);
          this._reAttachCollapsibles(groupBody);
        }
        // Update the section title with a count badge
        const count = groupBody.querySelectorAll('.em-mini-card, .entity-list-item').length;
        const titleEl = sectionEl.querySelector('.entity-list-group-title');
        if (titleEl && count > 0) {
          const chevronEl = titleEl.querySelector('.em-collapse-arrow, .em-collapsible-icon');
          const chevronHtml = chevronEl ? chevronEl.outerHTML : '';
          titleEl.innerHTML = `${chevronHtml}${sectionEmojis[t]} ${sectionTitles[t]} <span style="opacity:0.55;font-weight:400;font-size:12px">(${count})</span>`;
        }
      } catch (e) {
        groupBody.innerHTML = `<div style="padding:12px;color:var(--em-danger)">Failed to load ${sectionTitles[t]}: ${e.message}</div>`;
      }
    }
  }

  async _renderEntityListSection(type, containerEl) {
    // Calls showEntityListDialog's body-building logic for a single type and injects into containerEl
    // This renders the section inline (not as a full dialog)
    await this.showEntityListDialog(type, { inline: true, container: containerEl });
  }

  async _renderConfigHealthSection(containerEl) {
    await this._showConfigEntryHealthDialog({ inline: true, container: containerEl });
  }

  async _renderCleanupSection(containerEl) {
    this._showCleanupDialog({ inline: true, container: containerEl });
  }

  _renderBulkRenameView() {
    const contentEl = this.content.querySelector('#content');
    if (!contentEl) return;

    // Guard: don't re-render while user is working (preserves input state)
    if (contentEl.querySelector('.em-bulk-rename-view')) return;

    const exitMode = async () => {
      this._bulkRenameMode = false;
      this.querySelector('#main-content')?.classList.remove('em-bulk-rename-active');
      await this.loadData();
    };

    const executeRenames = async (renameMap) => {
      if (renameMap.length === 0) {
        this._showToast('No changes to apply.', 'info');
        return;
      }
      this._showToast(`Renaming ${renameMap.length} entities...`, 'info', 0);
      const renameByDomain = {};
      for (const item of renameMap) {
        const d = item.old.split('.')[0];
        if (!renameByDomain[d]) renameByDomain[d] = [];
        renameByDomain[d].push(item);
      }
      let successCount = 0, errorCount = 0;
      for (const [, items] of Object.entries(renameByDomain)) {
        const results = await Promise.allSettled(
          items.map(item => this.renameEntity(item.old, item.new))
        );
        successCount += results.filter(r => r.status === 'fulfilled').length;
        errorCount += results.filter(r => r.status === 'rejected').length;
      }
      document.querySelector('.em-toast')?.remove();
      if (errorCount === 0) {
        this._showToast(`Successfully renamed ${successCount} entities`, 'success');
      } else {
        this._showToast(`Renamed ${successCount}, failed ${errorCount}`, 'warning');
      }
      await exitMode();
    };

    // ── Build entity list grouped by integration → device ───────────
    const preSelected = new Set(this.selectedEntities);
    const hassStates = this._hass?.states || {};
    const renameData = this._bulkRenameData || this.data || [];
    const coveredIds = new Set();

    const domainColors = {
      light:'#f59e0b', switch:'#3b82f6', sensor:'#10b981', binary_sensor:'#8b5cf6',
      automation:'#ec4899', script:'#6366f1', input_boolean:'#14b8a6',
      media_player:'#f97316', climate:'#ef4444', cover:'#84cc16',
    };

    const makePickerRow = (entityId) => {
      const hs = hassStates[entityId] || {};
      const domain = entityId.split('.')[0];
      const objectId = entityId.slice(entityId.indexOf('.') + 1);
      const name = hs.attributes?.friendly_name || '';
      const state = hs.state || '';
      const dc = domainColors[domain] || 'var(--em-text-secondary)';
      const checked = preSelected.has(entityId);
      coveredIds.add(entityId);
      return `<div class="bulk-rename-picker-row${checked ? ' is-checked' : ''}" data-entity-id="${this._escapeAttr(entityId)}">
        <input type="checkbox" class="brp-cb"${checked ? ' checked' : ''} data-entity-id="${this._escapeAttr(entityId)}">
        <span style="font-size:10px;font-weight:600;padding:1px 5px;border-radius:3px;border:1px solid ${dc};color:${dc};white-space:nowrap;flex-shrink:0">${this._escapeHtml(domain)}</span>
        <span style="font-family:monospace;font-size:11px;font-weight:600;color:var(--em-text-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1" title="${this._escapeAttr(entityId)}">${this._escapeHtml(objectId)}</span>
        ${name ? `<span style="font-size:11px;color:var(--em-text-secondary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px">${this._escapeHtml(name)}</span>` : ''}
        <span style="font-size:10px;padding:1px 6px;border-radius:3px;background:var(--em-bg-secondary);color:var(--em-text-secondary);flex-shrink:0">${this._escapeHtml(state)}</span>
      </div>`;
    };

    const chevronCollapsed = `<svg class="brp-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-90deg)"><polyline points="6 9 12 15 18 9"/></svg>`;

    const filterToSelected = preSelected.size > 0;

    const groupsHtml = renameData.map(intg => {
      const intgName = intg.integration || 'unknown';
      let intgTotal = 0;
      const devicesHtml = Object.entries(intg.devices || {}).map(([deviceId, device]) => {
        let entities = (device.entities || []).slice().sort((a, b) => a.entity_id.localeCompare(b.entity_id));
        if (filterToSelected) entities = entities.filter(e => preSelected.has(e.entity_id));
        if (!entities.length) return '';
        intgTotal += entities.length;
        const devName = deviceId === 'no_device'
          ? 'No device'
          : (this.deviceInfo?.[deviceId]?.name_by_user || this.deviceInfo?.[deviceId]?.name || 'Unknown device');
        const rowsHtml = entities.map(e => makePickerRow(e.entity_id)).join('');
        return `<div class="brp-dev-group">
          <div class="brp-dev-header">
            <input type="checkbox" class="brp-dev-cb" style="flex-shrink:0;accent-color:var(--em-primary);width:13px;height:13px;cursor:pointer;" title="Select all in device">
            ${chevronCollapsed}
            <span class="brp-dev-name">${this._escapeHtml(devName)}</span>
            <span class="brp-group-count">${entities.length}</span>
          </div>
          <div class="brp-dev-body" style="display:none">${rowsHtml}</div>
        </div>`;
      }).join('');
      if (!intgTotal) return '';
      return `<div class="brp-int-group">
        <div class="brp-int-header">
          <input type="checkbox" class="brp-int-cb" style="flex-shrink:0;accent-color:#fff;width:14px;height:14px;cursor:pointer;" title="Select all in group">
          ${chevronCollapsed}
          <span class="brp-int-name">${this._escapeHtml(intgName)}</span>
          <span class="brp-group-count">${intgTotal}</span>
        </div>
        <div class="brp-int-body" style="display:none">${devicesHtml}</div>
      </div>`;
    }).join('');

    // Entities from hass.states not in renameData — group by domain
    const extraByDomain = {};
    for (const [id, s] of Object.entries(hassStates).sort(([a], [b]) => a.localeCompare(b))) {
      if (coveredIds.has(id)) continue;
      if (filterToSelected && !preSelected.has(id)) continue;
      const domain = id.split('.')[0];
      if (!extraByDomain[domain]) extraByDomain[domain] = [];
      extraByDomain[domain].push(id);
    }
    const extraHtml = Object.entries(extraByDomain).sort(([a], [b]) => a.localeCompare(b)).map(([domain, ids]) => {
      const rowsHtml = ids.map(makePickerRow).join('');
      return `<div class="brp-int-group">
        <div class="brp-int-header">
          <input type="checkbox" class="brp-int-cb" style="flex-shrink:0;accent-color:#fff;width:14px;height:14px;cursor:pointer;" title="Select all in group">
          ${chevronCollapsed}
          <span class="brp-int-name">${this._escapeHtml(domain)}</span>
          <span class="brp-group-count">${ids.length}</span>
        </div>
        <div class="brp-int-body" style="display:none">
          <div class="brp-dev-group">
            <div class="brp-dev-body">${rowsHtml}</div>
          </div>
        </div>
      </div>`;
    }).join('');

    const pickerRowsHtml = groupsHtml + extraHtml;

    const queueEmptyHtml = `<div class="bulk-rename-queue-empty">Check entities above to add them to the rename queue</div>`;

    // ── Render inline view into #content ─────────────────────────────
    contentEl.innerHTML = `
      <div class="em-bulk-rename-view">

        <!-- Banner with action buttons -->
        <div class="em-bulk-rename-banner">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Bulk Rename Entities
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0">
            <button id="brp-deselect-all-top" class="btn" style="padding:4px 12px;font-size:12px;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.5);color:#fff;border-radius:6px;cursor:pointer;">Deselect all</button>
            <button id="brq-rename-btn-top" class="btn" style="padding:4px 14px;font-size:12px;background:rgba(255,255,255,0.9);border:1.5px solid rgba(255,255,255,0.9);color:var(--em-primary);font-weight:700;border-radius:6px;cursor:pointer;" disabled>Rename 0</button>
            <button id="brv-exit" class="btn" style="padding:4px 14px;font-size:12px;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.5);color:#fff;border-radius:6px;cursor:pointer;">✕ Exit</button>
          </div>
        </div>

        <!-- FIND & REPLACE -->
        <div class="bulk-rename-pattern-card">
          <div class="bulk-rename-pattern-header">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Find &amp; Replace
          </div>
          <div class="bulk-rename-pattern-body">
            <div class="bulk-rename-pattern-inputs">
              <div class="bulk-rename-field">
                <label class="bulk-rename-field-label">Find</label>
                <input type="text" id="bulk-find" class="bulk-rename-field-input" placeholder="e.g., living_room_">
              </div>
              <div class="bulk-rename-field-arrow">→</div>
              <div class="bulk-rename-field">
                <label class="bulk-rename-field-label">Replace with</label>
                <input type="text" id="bulk-replace" class="bulk-rename-field-input" placeholder="e.g., lounge_">
              </div>
            </div>
            <div class="bulk-rename-pattern-footer">
              <label class="bulk-rename-opt-label"><input type="checkbox" id="bulk-find-regex"> Regex</label>
              <label class="bulk-rename-opt-label"><input type="checkbox" id="bulk-find-case"> Case sensitive</label>
              <button class="btn btn-primary" id="bulk-apply-pattern" style="margin-left:auto;padding:5px 16px;font-size:12px;">Apply to queue</button>
            </div>
          </div>
        </div>

        <!-- SPLIT: left = entity picker, right = rename queue -->
        <div class="brv-split">

          <!-- LEFT: search bar + entity list -->
          <div class="bulk-rename-top-box">
            <div class="bulk-rename-top-bar">
              <div style="position:relative;flex:1;min-width:180px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                     style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--em-text-secondary);pointer-events:none">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input id="brp-search" type="text" placeholder="Search by entity ID or name…"
                       style="width:100%;box-sizing:border-box;padding:6px 8px 6px 28px;border:1.5px solid var(--em-border);border-radius:6px;background:var(--em-bg-secondary);color:var(--em-text-primary);font-size:12px;">
              </div>
              <label class="bulk-rename-opt-label"><input type="checkbox" id="bulk-regex"> Regex</label>
              <label class="bulk-rename-opt-label"><input type="checkbox" id="bulk-case"> Case sensitive</label>
              <span id="brp-sel-count" style="font-size:11px;color:var(--em-primary);font-weight:600;white-space:nowrap;flex-shrink:0;padding:2px 9px;background:rgba(33,150,243,0.1);border:1px solid rgba(33,150,243,0.3);border-radius:10px;">${preSelected.size} selected</span>
            </div>
            <div class="bulk-rename-picker-list" id="brp-list">
              ${pickerRowsHtml}
            </div>
          </div>

          <!-- RIGHT: rename queue -->
          <div class="bulk-rename-bottom-box">
            <div class="brv-queue-header">
              <span style="font-size:12px;font-weight:700;color:var(--em-text-primary)">Rename queue</span>
              <span id="brq-count" style="font-size:11px;color:var(--em-primary);font-weight:600;margin-left:auto;padding:2px 9px;background:rgba(33,150,243,0.1);border:1px solid rgba(33,150,243,0.3);border-radius:10px;">0 queued</span>
            </div>
            <div class="bulk-rename-queue-inner" id="brq-rows">
              ${queueEmptyHtml}
            </div>
          </div>

        </div>

        <!-- Hidden anchor elements for bottom button wiring (no UI) -->
        <button id="brp-deselect-all" style="display:none"></button>
        <button id="brq-rename-btn" style="display:none" disabled></button>

      </div>
    `;

    const view = contentEl.querySelector('.em-bulk-rename-view');

    const makeQueueRow = (entityId) => {
      const dot = entityId.indexOf('.');
      const domain = entityId.slice(0, dot);
      const objectId = entityId.slice(dot + 1);
      const friendlyName = this._hass?.states[entityId]?.attributes?.friendly_name || '';
      const row = document.createElement('div');
      row.className = 'bulk-rename-entity-row';
      row.dataset.oldEntity = entityId;
      row.innerHTML = `
        <div class="brq-row-from">
          <span class="brq-row-id"><span class="brq-row-domain">${this._escapeHtml(domain)}.</span>${this._escapeHtml(objectId)}</span>
          ${friendlyName ? `<span class="brq-row-name">${this._escapeHtml(friendlyName)}</span>` : ''}
          <button class="brq-remove" title="Remove">×</button>
        </div>
        <div class="brq-row-input-line">
          <span class="brq-row-domain">${this._escapeHtml(domain)}.</span>
          <input type="text" class="bulk-new-name" value="${this._escapeAttr(objectId)}" placeholder="new_name">
        </div>
        <div class="brq-row-preview">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--em-text-secondary)"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="brq-preview-id">${this._escapeHtml(entityId)}</span>
        </div>
      `;
      row.querySelector('.bulk-new-name').addEventListener('input', syncRenameBtn);
      return row;
    };

    const queueRows = view.querySelector('#brq-rows');
    const renameBtn = view.querySelector('#brq-rename-btn');
    const selCountEl = view.querySelector('#brp-sel-count');
    const qCountEl = view.querySelector('#brq-count');

    const syncRenameBtn = () => {
      const rows = [...queueRows.querySelectorAll('.bulk-rename-entity-row')];
      let changes = 0;
      rows.forEach(r => {
        const old = r.dataset.oldEntity;
        const domain = old.slice(0, old.indexOf('.'));
        const oid = old.slice(old.indexOf('.') + 1);
        const nv = r.querySelector('.bulk-new-name').value.trim();
        const changed = nv && nv !== oid;
        if (changed) changes++;
        r.classList.toggle('is-renamed', changed);
        // Update live preview
        const preview = r.querySelector('.brq-preview-id');
        if (preview) {
          preview.textContent = `${domain}.${nv || oid}`;
          preview.classList.toggle('brq-preview-changed', changed);
        }
      });
      const renameBtnTop = view.querySelector('#brq-rename-btn-top');
      const label = `Rename ${changes || rows.length}`;
      renameBtn.disabled = rows.length === 0;
      renameBtn.textContent = label;
      if (renameBtnTop) { renameBtnTop.disabled = rows.length === 0; renameBtnTop.textContent = label; }
      qCountEl.textContent = `${rows.length} queued`;
      if (rows.length === 0 && !queueRows.querySelector('.bulk-rename-queue-empty')) {
        queueRows.innerHTML = queueEmptyHtml;
      }
    };

    const addToQueue = (entityId) => {
      if (queueRows.querySelector(`[data-old-entity="${CSS.escape(entityId)}"]`)) return;
      const empty = queueRows.querySelector('.bulk-rename-queue-empty');
      if (empty) empty.remove();
      queueRows.appendChild(makeQueueRow(entityId));
      syncRenameBtn();
    };

    const removeFromQueue = (entityId) => {
      queueRows.querySelector(`[data-old-entity="${CSS.escape(entityId)}"]`)?.remove();
      // Uncheck in picker
      const cb = view.querySelector(`#brp-list .brp-cb[data-entity-id="${CSS.escape(entityId)}"]`);
      if (cb) { cb.checked = false; cb.closest('.bulk-rename-picker-row')?.classList.remove('is-checked'); }
      syncRenameBtn();
    };

    // ── Pre-populate queue for pre-selected entities ─────────────────
    preSelected.forEach(id => addToQueue(id));
    const initSelCount = preSelected.size;
    if (selCountEl) selCountEl.textContent = `${initSelCount} selected`;

    // ── Picker filter (search bar + find input, updates group visibility) ──
    const filterPickerList = () => {
      const q = view.querySelector('#brp-search').value.trim();
      const findVal = view.querySelector('#bulk-find').value;
      const useRegex = view.querySelector('#bulk-find-regex').checked;
      const caseSensitive = view.querySelector('#bulk-find-case').checked;

      let findPattern = null;
      if (findVal) {
        try {
          const flags = caseSensitive ? '' : 'i';
          findPattern = useRegex
            ? new RegExp(findVal, flags)
            : new RegExp(findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        } catch (_) { /* invalid regex — ignore */ }
      }

      view.querySelectorAll('#brp-list .bulk-rename-picker-row').forEach(row => {
        const id = row.dataset.entityId;
        const name = this._hass?.states[id]?.attributes?.friendly_name || '';
        const searchMatch = !q || id.toLowerCase().includes(q.toLowerCase()) || name.toLowerCase().includes(q.toLowerCase());
        const findMatch = !findPattern || findPattern.test(id) || findPattern.test(name);
        row.style.display = (searchMatch && findMatch) ? '' : 'none';
      });
      // Hide device groups with no visible rows
      view.querySelectorAll('#brp-list .brp-dev-group').forEach(dg => {
        const anyVisible = [...dg.querySelectorAll('.bulk-rename-picker-row')].some(r => r.style.display !== 'none');
        dg.style.display = anyVisible ? '' : 'none';
      });
      // Hide integration groups with no visible device groups
      view.querySelectorAll('#brp-list .brp-int-group').forEach(ig => {
        const anyVisible = [...ig.querySelectorAll('.brp-dev-group')].some(dg => dg.style.display !== 'none');
        ig.style.display = anyVisible ? '' : 'none';
      });
    };

    view.querySelector('#brp-search').addEventListener('input', filterPickerList);
    view.querySelector('#bulk-find').addEventListener('input', filterPickerList);
    view.querySelector('#bulk-find-regex').addEventListener('change', filterPickerList);
    view.querySelector('#bulk-find-case').addEventListener('change', filterPickerList);

    // ── Integration/device header checkboxes: select all in group ────
    view.querySelector('#brp-list').addEventListener('change', (e) => {
      const intCb = e.target.closest('.brp-int-cb');
      if (intCb) {
        const body = intCb.closest('.brp-int-header').nextElementSibling;
        body.querySelectorAll('.brp-cb').forEach(cb => {
          if (cb.checked !== intCb.checked) {
            cb.checked = intCb.checked;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        return;
      }
      const devCb = e.target.closest('.brp-dev-cb');
      if (devCb) {
        const body = devCb.closest('.brp-dev-header').nextElementSibling;
        body.querySelectorAll('.brp-cb').forEach(cb => {
          if (cb.checked !== devCb.checked) {
            cb.checked = devCb.checked;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        return;
      }
    }, true); // capture phase so it fires before the collapse click handler

    // ── Collapsible integration/device headers ────────────────────────
    view.querySelector('#brp-list').addEventListener('click', (e) => {
      const intHeader = e.target.closest('.brp-int-header');
      if (intHeader && !e.target.closest('.bulk-rename-picker-row') && !e.target.closest('.brp-int-cb')) {
        const body = intHeader.nextElementSibling;
        const chevron = intHeader.querySelector('.brp-chevron');
        const collapsed = body.style.display === 'none';
        body.style.display = collapsed ? '' : 'none';
        if (chevron) chevron.style.transform = collapsed ? '' : 'rotate(-90deg)';
        return;
      }
      const devHeader = e.target.closest('.brp-dev-header');
      if (devHeader && !e.target.closest('.bulk-rename-picker-row') && !e.target.closest('.brp-dev-cb')) {
        const body = devHeader.nextElementSibling;
        const chevron = devHeader.querySelector('.brp-chevron');
        const collapsed = body.style.display === 'none';
        body.style.display = collapsed ? '' : 'none';
        if (chevron) chevron.style.transform = collapsed ? '' : 'rotate(-90deg)';
        return;
      }
      // Clicking a picker row toggles its checkbox
      const row = e.target.closest('.bulk-rename-picker-row');
      if (!row || e.target.closest('.brp-cb')) return;
      const cb = row.querySelector('.brp-cb');
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // ── Picker checkbox toggle ────────────────────────────────────────
    view.querySelector('#brp-list').addEventListener('change', (e) => {
      const cb = e.target.closest('.brp-cb');
      if (!cb) return;
      const entityId = cb.dataset.entityId;
      const row = cb.closest('.bulk-rename-picker-row');
      if (cb.checked) {
        row.classList.add('is-checked');
        addToQueue(entityId);
      } else {
        row.classList.remove('is-checked');
        removeFromQueue(entityId);
      }
      const checked = view.querySelectorAll('#brp-list .brp-cb:checked').length;
      if (selCountEl) selCountEl.textContent = `${checked} selected`;
    });

    // ── Deselect all ─────────────────────────────────────────────────
    const doDeselectAll = () => {
      view.querySelectorAll('#brp-list .brp-cb:checked').forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      });
      // Also uncheck all group header checkboxes
      view.querySelectorAll('#brp-list .brp-int-cb, #brp-list .brp-dev-cb').forEach(cb => { cb.checked = false; cb.indeterminate = false; });
    };
    view.querySelector('#brp-deselect-all').addEventListener('click', doDeselectAll);
    view.querySelector('#brp-deselect-all-top').addEventListener('click', doDeselectAll);

    // ── Queue: remove button ──────────────────────────────────────────
    queueRows.addEventListener('click', (e) => {
      const btn = e.target.closest('.brq-remove');
      if (!btn) return;
      removeFromQueue(btn.closest('.bulk-rename-entity-row').dataset.oldEntity);
    });

    // ── Rename ────────────────────────────────────────────────────────
    const doRename = async () => {
      const renameMap = [];
      queueRows.querySelectorAll('.bulk-rename-entity-row').forEach(row => {
        const old = row.dataset.oldEntity;
        const domain = old.slice(0, old.indexOf('.'));
        const objectId = old.slice(old.indexOf('.') + 1);
        const newVal = row.querySelector('.bulk-new-name').value.trim();
        if (newVal && newVal !== objectId) renameMap.push({ old, new: `${domain}.${newVal}` });
      });
      await executeRenames(renameMap);
    };
    renameBtn.addEventListener('click', doRename);
    view.querySelector('#brq-rename-btn-top').addEventListener('click', doRename);

    // ── Exit button ───────────────────────────────────────────────────
    view.querySelector('#brv-exit').addEventListener('click', exitMode);

    // ── Find & Replace: Apply to queue ───────────────────────────────
    view.querySelector('#bulk-apply-pattern').addEventListener('click', () => {
      const findVal = view.querySelector('#bulk-find').value;
      const replaceVal = view.querySelector('#bulk-replace').value;
      if (!findVal) return;
      const useRegex = view.querySelector('#bulk-find-regex').checked;
      const caseSensitive = view.querySelector('#bulk-find-case').checked;
      const flags = caseSensitive ? 'g' : 'gi';
      let pattern;
      try {
        pattern = useRegex ? new RegExp(findVal, flags) : new RegExp(findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      } catch (_) {
        this._showToast('Invalid regex pattern', 'error');
        return;
      }
      view.querySelectorAll('#brq-rows .bulk-rename-entity-row').forEach(row => {
        const entityId = row.dataset.oldEntity;
        const objectId = entityId.slice(entityId.indexOf('.') + 1);
        const newVal = objectId.replace(pattern, replaceVal);
        if (newVal !== objectId) {
          row.querySelector('.bulk-new-name').value = newVal;
        }
      });
      syncRenameBtn();
    });
  }
  
  // ===== CONTEXT MENU =====
  
  _buildContextMenuHTML(hasMultipleSelected, isDisabled, isFavorite) {
    if (hasMultipleSelected) {
      return `
        <div class="em-context-header" style="padding:8px 12px;color:var(--em-text-secondary);font-size:11px;border-bottom:1px solid var(--em-border);">
          ${this.selectedEntities.size} entities selected
        </div>
        <div class="em-context-item" data-action="bulk-rename"><span class="icon">✎</span> Bulk Rename Selected</div>
        <div class="em-context-item" data-action="bulk-enable"><span class="icon">✓</span> Enable All Selected</div>
        <div class="em-context-item" data-action="bulk-disable"><span class="icon">✕</span> Disable All Selected</div>
        <div class="em-context-divider"></div>
        <div class="em-context-item" data-action="bulk-labels"><span class="icon">🔖</span> Add Labels to Selected</div>
        <div class="em-context-item" data-action="bulk-remove-labels"><span class="icon">🏷️</span> Remove Labels from Selected</div>
        <div class="em-context-item" data-action="bulk-favorite"><span class="icon">★</span> Add All to Favorites</div>
        <div class="em-context-divider"></div>
        <div class="em-context-item" data-action="clear-selection"><span class="icon">✗</span> Clear Selection</div>
        <div class="em-context-divider"></div>
        <div class="em-context-item em-context-danger" data-action="bulk-delete"><span class="icon">🗑</span> Delete Selected</div>
      `;
    }
    return `
      <div class="em-context-item" data-action="rename"><span class="icon">✎</span> Rename</div>
      <div class="em-context-item" data-action="${isDisabled ? 'enable' : 'disable'}">
        <span class="icon">${isDisabled ? '✓' : '✕'}</span> ${isDisabled ? 'Enable' : 'Disable'}
      </div>
      <div class="em-context-divider"></div>
      <div class="em-context-item" data-action="favorite">
        <span class="icon">${isFavorite ? '★' : '☆'}</span> ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </div>
<div class="em-context-item" data-action="labels"><span class="icon">🔖</span> Manage Labels</div>
      <div class="em-context-item" data-action="assign-area"><span class="icon">📍</span> Assign to area</div>
      <div class="em-context-item" data-action="assign-device"><span class="icon">🔌</span> Assign to device</div>
      <div class="em-context-item" data-action="alias"><span class="icon">📝</span> Set Alias</div>
<div class="em-context-divider"></div>
      <div class="em-context-item" data-action="copy-id"><span class="icon">📋</span> Copy Entity ID</div>
      <div class="em-context-item" data-action="open-ha"><span class="icon"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:middle"><path d="M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z"/><text x="12" y="17.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="white" font-family="sans-serif">HA</text></svg></span> Open in HA</div>
    `;
  }

  async _handleContextMenuAction(action, entityId) {
    switch (action) {
      case 'rename':        this.showRenameDialog(entityId); break;
      case 'enable':        await this.enableEntity(entityId); break;
      case 'disable':       await this.disableEntity(entityId); break;
      case 'favorite':      this._toggleFavorite(entityId); break;
      case 'labels':        this._showLabelEditor(entityId); break;
      case 'assign-area': {
        // If the right-clicked entity is part of a multi-selection, assign all selected
        const ids = (this.selectedEntities.size > 1 && this.selectedEntities.has(entityId))
          ? [...this.selectedEntities]
          : [entityId];
        const entities = this._resolveEntitiesById(ids);
        const title = ids.length > 1
          ? `Assign area to ${ids.length} selected entit${ids.length !== 1 ? 'ies' : 'y'}`
          : 'Assign entity to area';
        await this._showAreaFloorDialog(title, entities);
        break;
      }
      case 'assign-device': {
        this._showDevicePickerDialog(entityId, async (deviceId, deviceName) => {
          try {
            await this._hass.callWS({ type: 'entity_manager/assign_entity_device', entity_id: entityId, device_id: deviceId });
            this._pushUndoAction({ type: 'assign_entity_device', entityId, oldDeviceId: null, newDeviceId: deviceId, deviceName });
            this._showToast(`${entityId} assigned to ${deviceName}`, 'success');
            this.loadData();
          } catch (err) {
            this._showToast('Assign failed: ' + (err.message || err), 'error');
          }
        });
        break;
      }
      case 'alias':         this._showAliasEditor(entityId); break;
      case 'copy-id':
        navigator.clipboard.writeText(entityId);
        this._showToast('Entity ID copied to clipboard', 'success');
        break;
      case 'open-ha':
        history.pushState(null, '', `/config/entities/entity/${entityId}`);
        window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
        break;
      case 'bulk-rename':   this._openBulkRenameDialog(); break;
      case 'bulk-enable':   await this._bulkEnableSelected(); break;
      case 'bulk-disable':  await this._disableSelectedEntities(); break;
      case 'bulk-delete':   await this._showBulkDeleteDialog(); break;
      case 'bulk-labels':          this._showBulkLabelEditor(); break;
      case 'bulk-remove-labels':   this._showBulkLabelRemover(); break;
      case 'bulk-favorite':
        for (const id of this.selectedEntities) {
          if (!this.favorites.has(id)) this._toggleFavorite(id);
        }
        this._showToast(`Added ${this.selectedEntities.size} entities to favorites`, 'success');
        break;
      case 'clear-selection':
        this.selectedEntities.clear();
        this.updateSelectedCount();
        this.updateView();
        this._showToast('Selection cleared', 'info');
        break;
    }
  }

  async _showBulkDeleteDialog() {
    const ids = [...this.selectedEntities];
    if (!ids.length) return;

    const LARGE_BATCH = 10; // skip per-entity scans above this count
    const isLarge = ids.length > LARGE_BATCH;

    const { overlay, closeDialog } = this.createDialog({
      title: '⚠ Delete Entities',
      color: 'var(--em-danger)',
      contentHtml: `<div id="bulk-del-body" style="padding:16px;text-align:center;color:var(--em-text-secondary)">${isLarge ? 'Preparing…' : 'Checking references…'}</div>`,
      actionsHtml: `
        <button id="bulk-del-cancel" style="padding:8px 20px;border:2px solid var(--em-border);background:transparent;color:var(--em-text-primary);border-radius:8px;cursor:pointer">Cancel</button>
        <button id="bulk-del-confirm" style="padding:8px 20px;border:2px solid var(--em-danger);background:var(--em-danger);color:#fff;border-radius:8px;cursor:pointer;font-weight:600" disabled>Delete</button>
      `,
    });

    overlay.querySelector('#bulk-del-cancel').addEventListener('click', closeDialog);

    const body = overlay.querySelector('#bulk-del-body');
    body.style.cssText = 'padding:16px;text-align:left';

    if (isLarge) {
      // Large batch — skip per-entity WS scans to avoid flooding HA
      body.innerHTML = `
        <div style="background:rgba(229,57,53,0.08);border:1px solid var(--em-danger);border-radius:8px;padding:10px 14px;margin-bottom:12px">
          <div style="font-weight:600;color:var(--em-danger);margin-bottom:4px">⚠ This cannot be undone</div>
          <div style="font-size:13px">Removes <strong>${ids.length} entities</strong> from the HA entity registry.
            Automations, scripts, or helpers referencing these entities may stop working.
          </div>
        </div>
        <div style="max-height:260px;overflow-y:auto;padding:0 2px;font-size:12px;font-family:monospace">
          ${ids.map(id => `<div style="padding:3px 0;border-bottom:1px solid var(--em-border)">${this._escapeHtml(id)}</div>`).join('')}
        </div>`;
    } else {
      // Small batch — do per-entity detail + YAML ref scan sequentially to avoid flood
      const details = [];
      const refs = [];
      for (const id of ids) {
        const [det, ref] = await Promise.all([
          this._hass.callWS({ type: 'entity_manager/get_entity_details', entity_id: id }).catch(() => null),
          this._hass.callWS({ type: 'entity_manager/update_yaml_references', old_entity_id: id, new_entity_id: id, dry_run: true }).catch(() => null),
        ]);
        details.push(det);
        refs.push(ref);
      }

      let totalRefs = 0;
      const entityRows = ids.map((id, i) => {
        const det = details[i];
        const ref = refs[i];
        const integration = det?.config_entry?.domain || det?.entity?.platform || id.split('.')[0];
        const deviceName = det?.device?.name || '';
        const area = det?.area?.name || '';
        const files = ref?.files_updated || [];
        totalRefs += files.reduce((s, f) => s + (f.replacements || 0), 0);
        const metaParts = [integration, deviceName, area].filter(Boolean);
        const refHtml = files.length
          ? `<div style="margin-top:3px;font-size:10px;color:var(--em-danger)">⚠ Referenced in: ${files.map(f => this._escapeHtml(f.file)).join(', ')}</div>`
          : '';
        return `<div style="padding:7px 0;border-bottom:1px solid var(--em-border)">
          <div style="font-size:12px;font-family:monospace;font-weight:600">${this._escapeHtml(id)}</div>
          <div style="font-size:11px;color:var(--em-text-secondary);margin-top:1px">${metaParts.map(p => this._escapeHtml(p)).join(' · ')}</div>
          ${refHtml}
        </div>`;
      }).join('');

      const allRefFiles = [...new Set(refs.flatMap(r => (r?.files_updated || []).map(f => f.file)))];
      body.innerHTML = `
        <div style="background:rgba(229,57,53,0.08);border:1px solid var(--em-danger);border-radius:8px;padding:10px 14px;margin-bottom:12px">
          <div style="font-weight:600;color:var(--em-danger);margin-bottom:4px">⚠ This cannot be undone</div>
          <div style="font-size:13px">Removes ${ids.length} entit${ids.length !== 1 ? 'ies' : 'y'} from the HA entity registry.
            ${totalRefs > 0 ? `<strong style="color:var(--em-danger)">${totalRefs} YAML reference${totalRefs !== 1 ? 's' : ''} across ${allRefFiles.length} file${allRefFiles.length !== 1 ? 's' : ''} will break.</strong>` : ''}
            Automations, scripts, or helpers referencing these entities may stop working.
          </div>
        </div>
        <div style="max-height:300px;overflow-y:auto;padding:0 2px">${entityRows}</div>`;
    }

    const confirmBtn = overlay.querySelector('#bulk-del-confirm');
    confirmBtn.disabled = false;
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting…';
      // Delete in parallel batches of 10 to avoid flooding HA
      const CHUNK = 10;
      const errors = [];
      for (let i = 0; i < ids.length; i += CHUNK) {
        const chunk = ids.slice(i, i + CHUNK);
        const results = await Promise.allSettled(
          chunk.map(id => this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: id }))
        );
        results.forEach((r, j) => {
          if (r.status === 'fulfilled') {
            this.selectedEntities.delete(chunk[j]);
          } else {
            const msg = r.reason?.message || r.reason?.code || String(r.reason);
            console.warn('[EM] Failed to delete entity:', chunk[j], r.reason);
            errors.push(`${chunk[j]}: ${msg}`);
          }
        });
      }
      closeDialog();
      this.updateSelectedCount();
      await this.loadData();
      if (errors.length > 0) {
        const succeeded = ids.length - errors.length;
        const summary = succeeded > 0 ? `Deleted ${succeeded}, ` : '';
        this._showToast(`${summary}${errors.length} failed — ${errors[0]}`, 'error');
      } else {
        this._showToast(`Deleted ${ids.length} entit${ids.length !== 1 ? 'ies' : 'y'}`, 'success');
      }
    });
  }

  async _showEntityDetailsDialog(entityId) {
    // Show a loading dialog immediately
    const { overlay, closeDialog } = this.createDialog({
      title: entityId,
      color: 'var(--em-primary)',
      contentHtml: `<div id="em-edd-body" style="padding:40px;text-align:center;color:var(--em-text-secondary)">Loading entity details…</div>`,
      actionsHtml: `<button id="em-edd-close" style="padding:8px 20px;border:2px solid var(--em-primary);background:transparent;color:var(--em-text-primary);border-radius:8px;cursor:pointer">Close</button>`,
      extraClass: 'em-entity-detail',
    });
    overlay.querySelector('#em-edd-close')?.addEventListener('click', closeDialog);

    // Fetch registry details + history in parallel
    let details, history;
    try {
      [details, history] = await Promise.all([
        this._hass.callWS({ type: 'entity_manager/get_entity_details', entity_id: entityId }),
        this._hass.callWS({
          type: 'history/history_during_period',
          entity_ids: [entityId],
          start_time: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          minimal_response: true,
          no_attributes: true,
          significant_changes_only: false,
        }).catch(() => null),
      ]);
    } catch (err) {
      overlay.querySelector('#em-edd-body').innerHTML =
        `<div style="padding:20px;color:var(--em-danger)">Failed to load details: ${this._escapeHtml(String(err))}</div>`;
      return;
    }

    const e = details.entity;
    const d = details.device;
    const area = details.area;
    const ce = details.config_entry;
    const entityLabels = details.labels || [];
    const deviceLabels = details.device_labels || [];
    const state = this._hass?.states[entityId];
    const isDisabled = !!e.disabled_by;

    // ── Helpers ────────────────────────────────────────────────────
    const row = (label, value, extra = '') => value != null && value !== ''
      ? `<div class="entity-item" style="margin-bottom:4px;cursor:default">
           <div class="entity-card-header">
             <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:var(--em-text-secondary);font-weight:600">${label}</span>
           </div>
           <div class="entity-card-body">
             <div style="font-size:14px;font-weight:500;word-break:break-all;white-space:normal;overflow:visible">${value}${extra}</div>
           </div>
         </div>`
      : '';

    const stateColor = (s) => {
      if (!s) return 'var(--em-text-secondary)';
      if (s === 'on' || s === 'home' || s === 'open') return '#4caf50';
      if (s === 'off' || s === 'not_home' || s === 'closed') return 'var(--em-text-secondary)';
      if (s === 'unavailable' || s === 'unknown') return '#ff9800';
      return 'var(--em-text-primary)';
    };

    // ── Section: Overview ──────────────────────────────────────────
    const domain = entityId.split('.')[0];
    const overviewHtml = `<div class="device-list" style="padding:8px 0">
      ${row('Entity ID', `<code style="font-family:monospace;background:var(--em-bg-hover);padding:2px 6px;border-radius:4px">${this._escapeHtml(e.entity_id)}</code>`)}
      ${row('Friendly name', this._escapeHtml(state?.attributes?.friendly_name || e.original_name || e.name || '—'))}
      ${row('Domain', `<span style="text-transform:uppercase;font-size:11px;background:var(--em-bg-hover);padding:2px 8px;border-radius:4px">${this._escapeHtml(domain)}</span>`)}
      ${row('Platform', this._escapeHtml(e.platform || '—'))}
      ${row('Unique ID', `<code style="font-family:monospace;font-size:11px;opacity:0.7">${this._escapeHtml(e.unique_id || '—')}</code>`)}
      ${e.aliases?.length ? row('Aliases', e.aliases.map(a => `<span style="background:var(--em-bg-hover);padding:2px 8px;border-radius:12px;margin-right:4px;font-size:12px">${this._escapeHtml(a)}</span>`).join('')) : ''}
    </div>`;

    // ── Section: Current State ─────────────────────────────────────
    const attrs = state?.attributes || {};
    const attrRows = Object.entries(attrs)
      .filter(([k]) => k !== 'friendly_name')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => {
        const displayVal = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return row(k, this._escapeHtml(displayVal));
      }).join('');

    const stateHtml = state ? `<div style="padding:8px 0">
      <div style="margin-bottom:12px">
        <span style="font-size:28px;font-weight:700;color:${stateColor(state.state)}">${this._escapeHtml(state.state)}</span>
        ${attrs.unit_of_measurement ? `<span style="font-size:16px;color:var(--em-text-secondary);margin-left:4px">${this._escapeHtml(attrs.unit_of_measurement)}</span>` : ''}
      </div>
      <div class="device-list">
        ${row('Last changed', this._fmtAgo(state.last_changed))}
        ${row('Last updated', this._fmtAgo(state.last_updated))}
        ${attrRows || ''}
      </div>
      ${!attrRows ? '<div style="color:var(--em-text-secondary);font-size:12px;padding:4px 0">No attributes</div>' : ''}
    </div>` : `<div style="padding:16px 0;color:var(--em-text-secondary)">No state available (entity may be disabled)</div>`;

    // ── Section: Registry ──────────────────────────────────────────
    const registryHtml = `<div class="device-list" style="padding:8px 0">
      ${row('Status', isDisabled
        ? `<span style="color:var(--em-danger);font-weight:600">Disabled</span> <span style="color:var(--em-text-secondary);font-size:12px">(by ${this._escapeHtml(e.disabled_by)})</span>`
        : `<span style="color:var(--em-success);font-weight:600">Enabled</span>`)}
      ${e.hidden_by ? row('Hidden by', this._escapeHtml(e.hidden_by)) : ''}
      ${row('Entity category', this._escapeHtml(e.entity_category || '—'))}
      ${row('Device class', this._escapeHtml(e.device_class || e.original_device_class || '—'))}
      ${row('Unit of measurement', this._escapeHtml(e.unit_of_measurement || '—'))}
      ${row('Icon', this._escapeHtml(e.icon || e.original_icon || '—'))}
      ${e.supported_features ? row('Supported features', `<code style="font-size:11px">${e.supported_features}</code>`) : ''}
      ${Object.keys(e.capabilities || {}).length ? row('Capabilities', Object.entries(e.capabilities).map(([k, v]) =>
        `<span style="font-size:11px"><strong>${this._escapeHtml(k)}</strong>: ${this._escapeHtml(v)}</span>`).join('<br>')) : ''}
    </div>`;

    // ── Section: Device ────────────────────────────────────────────
    const deviceHtml = d ? `<div class="device-list" style="padding:8px 0">
      ${row('Name', this._escapeHtml(d.name_by_user || d.name || '—'))}
      ${row('Manufacturer', this._escapeHtml(d.manufacturer || '—'))}
      ${row('Model', this._escapeHtml(d.model || '—'))}
      ${d.model_id ? row('Model ID', this._escapeHtml(d.model_id)) : ''}
      ${d.sw_version ? row('SW version', this._escapeHtml(d.sw_version)) : ''}
      ${d.hw_version ? row('HW version', this._escapeHtml(d.hw_version)) : ''}
      ${d.serial_number ? row('Serial number', `<code style="font-size:11px">${this._escapeHtml(d.serial_number)}</code>`) : ''}
      ${d.configuration_url ? row('Config URL', `<a href="${this._escapeAttr(d.configuration_url)}" target="_blank" style="color:var(--em-primary)">${this._escapeHtml(d.configuration_url)}</a>`) : ''}
      ${d.connections?.length ? row('Connections', d.connections.map(([t, v]) =>
        `<span style="font-size:11px"><strong>${this._escapeHtml(t)}</strong>: <code>${this._escapeHtml(v)}</code></span>`).join('<br>')) : ''}
      ${d.identifiers?.length ? row('Identifiers', d.identifiers.map(([t, v]) =>
        `<span style="font-size:11px"><strong>${this._escapeHtml(t)}</strong>: <code>${this._escapeHtml(v)}</code></span>`).join('<br>')) : ''}
    </div>` : '';

    // ── Section: Integration ───────────────────────────────────────
    const integrationHtml = ce ? `<div class="device-list" style="padding:8px 0">
      ${row('Title', this._escapeHtml(ce.title || '—'))}
      ${row('Domain', this._escapeHtml(ce.domain || '—'))}
      ${row('Source', this._escapeHtml(ce.source || '—'))}
      ${row('Version', ce.version != null ? String(ce.version) : '—')}
      ${row('State', this._escapeHtml(ce.state || '—'))}
      ${ce.disabled_by ? row('Disabled by', this._escapeHtml(ce.disabled_by)) : ''}
    </div>` : '';

    // ── Section: Area ──────────────────────────────────────────────
    const areaHtml = area ? `<div class="device-list" style="padding:8px 0">
      ${row('Name', this._escapeHtml(area.name))}
      ${area.aliases?.length ? row('Aliases', area.aliases.map(a =>
        `<span style="background:var(--em-bg-hover);padding:2px 8px;border-radius:12px;margin-right:4px;font-size:12px">${this._escapeHtml(a)}</span>`).join('')) : ''}
    </div>` : '';

    // ── Section: Labels ────────────────────────────────────────────
    const labelChipHtml = (labelObjs) => labelObjs.length
      ? labelObjs.map(l => `<span style="background:${this._escapeAttr(this._labelColorCss(l.color))};color:white;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600">${this._escapeHtml(l.name)}</span>`).join('')
      : `<span style="color:var(--em-text-secondary);font-size:13px">None</span>`;
    const manageBtnStyle = 'padding:5px 12px;border-radius:6px;border:1px solid var(--em-border);background:var(--em-bg-hover);color:var(--em-text-primary);cursor:pointer;font-size:12px';
    const labelSubHead = (text) => `<div style="font-size:11px;color:var(--em-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${text}</div>`;

    const labelsHtml = `<div style="padding:8px 0;display:flex;flex-direction:column;gap:12px">
      <div>
        ${labelSubHead('Entity Labels <span style="opacity:0.5;font-weight:400">— shown in Settings → Entities</span>')}
        <div id="em-edd-entity-label-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:7px">${labelChipHtml(entityLabels)}</div>
        <button id="em-edd-manage-entity-labels" style="${manageBtnStyle}">🔖 ${entityLabels.length ? 'Edit' : 'Add'}</button>
      </div>
      ${d ? `<div>
        ${labelSubHead('Device Labels <span style="opacity:0.5;font-weight:400">— shown in Settings → Devices</span>')}
        <div id="em-edd-device-label-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:7px">${labelChipHtml(deviceLabels)}</div>
        <button id="em-edd-manage-device-labels" style="${manageBtnStyle}">🔖 ${deviceLabels.length ? 'Edit' : 'Add'}</button>
      </div>` : ''}
    </div>`;

    // ── Section: History ───────────────────────────────────────────
    const histItems = history ? Object.values(history)[0] : null;
    const histHtml = histItems?.length ? (() => {
      const sorted = [...histItems].reverse().slice(0, 30);
      return `<div class="device-list" style="padding:8px 0">
        ${sorted.map(h => {
          const sv = h.s || h.state || '—';
          const sc = stateColor(sv);
          const ts = h.last_changed || (h.lu ? new Date(h.lu * 1000).toISOString() : '');
          return `<div class="entity-item" style="cursor:default">
            <div class="entity-card-header">
              <span class="entity-header-time" style="font-size:11px">🕐 ${this._escapeHtml(this._fmtAgo(ts))}</span>
            </div>
            <div class="entity-card-body">
              <div class="entity-id" style="font-size:14px;font-weight:600;color:${sc}">${this._escapeHtml(sv)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    })() : `<div style="padding:16px 0;color:var(--em-text-secondary)">No history available</div>`;

    // ── Section: Statistics ────────────────────────────────────────
    const st = this._hass?.states[entityId];
    const statsSectionHtml = `<div class="device-list" style="padding:8px 0">
      ${row('Entity ID', `<code style="font-family:monospace;background:var(--em-bg-hover);padding:2px 6px;border-radius:4px">${this._escapeHtml(entityId)}</code>`)}
      ${row('Current State', st?.state ? `<strong style="color:${stateColor(st.state)}">${this._escapeHtml(st.state)}</strong>` : '—')}
      ${row('Last Changed', st?.last_changed ? this._fmtAgo(st.last_changed) : '—')}
      ${row('Last Updated', st?.last_updated ? this._fmtAgo(st.last_updated) : '—')}
      ${row('Attributes', st?.attributes ? String(Object.keys(st.attributes).length) + ' attributes' : '0')}
      ${st?.attributes ? Object.entries(st.attributes).slice(0, 15).map(([k, v]) => row(this._escapeHtml(k), this._escapeHtml(String(v)))).join('') : ''}
    </div>`;

    // ── Section: Dependencies ──────────────────────────────────────
    let sameDeviceEntities = [];
    (this.data || []).forEach(int => {
      Object.values(int.devices).forEach(dev => {
        if (dev.entities.some(en => en.entity_id === entityId)) {
          sameDeviceEntities = dev.entities.filter(en => en.entity_id !== entityId).slice(0, 20);
        }
      });
    });
    const depHtml = sameDeviceEntities.length
      ? `<div class="device-list" style="padding:8px 0">${sameDeviceEntities.map(en => {
          const es = this._hass?.states[en.entity_id];
          const sv = en.is_disabled ? 'disabled' : (es?.state ?? '—');
          const sc = sv === 'on' || sv === 'open' ? 'var(--em-success)'
            : sv === 'unavailable' ? 'var(--em-warning)'
            : sv === 'disabled' ? 'var(--em-danger)'
            : 'var(--em-text-secondary)';
          return `<div class="entity-item" style="cursor:default">
            <div class="entity-card-header">
              <span class="entity-header-state" style="border-color:${sc};color:${sc}">⚡ ${this._escapeHtml(sv)}</span>
            </div>
            <div class="entity-card-body">
              <div class="entity-id">${this._escapeHtml(en.entity_id)}</div>
              ${en.original_name ? `<div class="entity-name">${this._escapeHtml(en.original_name)}</div>` : ''}
            </div>
          </div>`;
        }).join('')}</div>`
      : '<p style="font-size:0.9em;opacity:0.6;padding:8px 0">No related entities from same device</p>';

    // ── Section: Automation Impact placeholder ─────────────────────
    const impactPlaceholder = `<div id="em-impact-placeholder" style="padding:12px;text-align:center;opacity:0.6;font-size:0.9em">Scanning automations…</div>`;

    // ── Assemble sections ──────────────────────────────────────────
    // Open overview + state by default; rest collapsed
    const openGroup = (label, bodyHtml) => `
      <div class="entity-list-group">
        <div class="entity-list-group-title em-collapsible" style="cursor:pointer;user-select:none;display:flex;align-items:center;gap:8px">
          <span class="em-collapse-arrow em-collapsible-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
          ${label}
        </div>
        <div class="em-group-body">${bodyHtml}</div>
      </div>`;

    let sectionsHtml = openGroup('Overview', overviewHtml);
    sectionsHtml += openGroup('Current State', stateHtml);
    sectionsHtml += this._collGroup('Registry', registryHtml);
    if (d)   sectionsHtml += this._collGroup('Device', deviceHtml);
    if (ce)  sectionsHtml += this._collGroup('Integration', integrationHtml);
    if (area) sectionsHtml += this._collGroup(`Area: ${this._escapeHtml(area.name)}`, areaHtml);
    const totalLabelCount = entityLabels.length + deviceLabels.length;
    sectionsHtml += this._collGroup(`Labels${totalLabelCount ? ` (${totalLabelCount})` : ''}`, labelsHtml);
    sectionsHtml += this._collGroup('Statistics', statsSectionHtml);
    sectionsHtml += this._collGroup(`Dependencies (${sameDeviceEntities.length})`, depHtml);
    sectionsHtml += this._collGroup('Automation Impact', impactPlaceholder);
    sectionsHtml += this._collGroup('State History', histHtml);

    const friendlyTitle = state?.attributes?.friendly_name || e.original_name || entityId;

    // Update dialog content
    overlay.querySelector('#em-edd-body').innerHTML = `
      <div style="padding:4px 8px 0">
        ${friendlyTitle !== entityId ? `<div style="font-size:13px;color:var(--em-text-secondary);margin-bottom:10px;font-family:monospace">${this._escapeHtml(entityId)}</div>` : ''}
        ${sectionsHtml}
      </div>`;
    overlay.querySelector('.confirm-dialog-header h2').textContent = friendlyTitle;

    // Actions row - Close only
    const btnBase = 'padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;border:2px solid';
    overlay.querySelector('.confirm-dialog-actions').innerHTML = `
      <button id="em-edd-close" style="${btnBase} var(--em-primary);background:transparent;color:var(--em-text-primary)">Close</button>`;

    // Attach listeners
    overlay.querySelector('#em-edd-close')?.addEventListener('click', closeDialog);

    // Async automation impact scan
    requestAnimationFrame(async () => {
      try {
        const states = await this._hass.callWS({ type: 'get_states' });
        const affected = states.filter(s =>
          (s.entity_id.startsWith('automation.') || s.entity_id.startsWith('script.')) &&
          (s.attributes?.friendly_name?.toLowerCase().includes(entityId.toLowerCase()) ||
           s.entity_id.toLowerCase().includes(entityId.split('.')[1]?.toLowerCase() || ''))
        );
        const impactContent = affected.length
          ? `<div class="device-list" style="padding:8px 0">${affected.map(s => `
              <div class="entity-item" style="cursor:default">
                <div class="entity-card-header">
                  <span class="entity-header-state">${s.entity_id.startsWith('automation.') ? '⚙️ Automation' : '📜 Script'}</span>
                </div>
                <div class="entity-card-body">
                  <div class="entity-id">${this._escapeHtml(s.attributes?.friendly_name || s.entity_id)}</div>
                  <div class="entity-name">${this._escapeHtml(s.entity_id)}</div>
                </div>
              </div>`).join('')}</div>`
          : '<p style="font-size:0.9em;opacity:0.6;padding:8px 0">No automations or scripts appear to reference this entity</p>';
        const ph = overlay.querySelector('#em-impact-placeholder');
        if (ph) ph.outerHTML = impactContent;
      } catch (err) {
        const ph = overlay.querySelector('#em-impact-placeholder');
        if (ph) ph.textContent = 'Failed to load automation impact';
      }
    });

    // Manage entity labels
    overlay.querySelector('#em-edd-manage-entity-labels')?.addEventListener('click', () => {
      this._showLabelEditor(entityId, 'entity').then(async () => {
        const updatedIds = await this._getEntityLabels(entityId);
        const allLabels = await this._loadHALabels();
        const chipsEl = overlay.querySelector('#em-edd-entity-label-chips');
        const btn = overlay.querySelector('#em-edd-manage-entity-labels');
        if (chipsEl) chipsEl.innerHTML = labelChipHtml(updatedIds.map(id => allLabels.find(l => l.label_id === id)).filter(Boolean));
        if (btn) btn.textContent = `🔖 ${updatedIds.length ? 'Edit' : 'Add'}`;
      });
    });

    // Manage device labels
    overlay.querySelector('#em-edd-manage-device-labels')?.addEventListener('click', () => {
      this._showLabelEditor(entityId, 'device').then(async () => {
        const deviceId = e.device_id;
        if (!deviceId) return;
        const updatedIds = await this._getDeviceLabels(deviceId);
        const allLabels = await this._loadHALabels();
        const chipsEl = overlay.querySelector('#em-edd-device-label-chips');
        const btn = overlay.querySelector('#em-edd-manage-device-labels');
        if (chipsEl) chipsEl.innerHTML = labelChipHtml(updatedIds.map(id => allLabels.find(l => l.label_id === id)).filter(Boolean));
        if (btn) btn.textContent = `🔖 ${updatedIds.length ? 'Edit' : 'Add'}`;
      });
    });

    // Collapsible toggle listeners
    this._reAttachCollapsibles(overlay);
  }

  _showContextMenu(e, entityId) {
    e.preventDefault();
    document.querySelector('.em-context-menu')?.remove();

    const entity = this._findEntityById(entityId);
    const isFavorite = this.favorites.has(entityId);
    const isDisabled = entity?.is_disabled;
    const hasMultipleSelected = this.selectedEntities.size > 1;

    if (hasMultipleSelected && !this.selectedEntities.has(entityId)) {
      this.selectedEntities.add(entityId);
    }

    const menu = document.createElement('div');
    menu.className = 'em-context-menu';
    menu.innerHTML = this._buildContextMenuHTML(hasMultipleSelected, isDisabled, isFavorite);

    // Position and clamp to viewport
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth)  menu.style.left = `${e.clientX - rect.width}px`;
    if (rect.left < 0)                   menu.style.left = '0px';
    if (rect.bottom > window.innerHeight) menu.style.top = `${e.clientY - rect.height}px`;
    if (rect.top < 0)                    menu.style.top = '0px';

    menu.addEventListener('click', async (evt) => {
      const action = evt.target.closest('.em-context-item')?.dataset.action;
      menu.remove();
      if (action) await this._handleContextMenuAction(action, entityId);
    });

    const closeMenu = (evt) => {
      if (!menu.contains(evt.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
  }
  
  _findEntityById(entityId) {
    if (!this.data) return null;
    for (const integration of this.data) {
      for (const device of Object.values(integration.devices)) {
        const entity = device.entities.find(e => e.entity_id === entityId);
        if (entity) return entity;
      }
    }
    return null;
  }
  
  // ===== FAVORITES =====
  
  _loadFavorites() {
    return new Set(this._loadFromStorage('em-favorites', []));
  }
  
  _saveFavorites() {
    this._saveToStorage('em-favorites', [...this.favorites]);
  }
  
  _toggleFavorite(entityId) {
    if (this.favorites.has(entityId)) {
      this.favorites.delete(entityId);
      this._showToast('Removed from favorites', 'info');
    } else {
      this.favorites.add(entityId);
      this._showToast('Added to favorites', 'success');
    }
    this._saveFavorites();
    this._updateFavoritesUI();
  }
  
  _updateFavoritesUI() {
    // Update star icons on entities
    this.querySelectorAll('.entity-item').forEach(item => {
      const entityId = item.querySelector('.entity-checkbox')?.dataset.entityId;
      if (entityId) {
        const starBtn = item.querySelector('.favorite-btn');
        if (starBtn) {
          starBtn.textContent = this.favorites.has(entityId) ? '★' : '☆';
          starBtn.classList.toggle('is-favorite', this.favorites.has(entityId));
        }
      }
    });
    
    // Update sidebar favorites count
    const favCount = this.querySelector('#favorites-count');
    if (favCount) favCount.textContent = this.favorites.size;
  }
  
  // ===== HELP GUIDE =====
  
  _showHelpGuide() {
    const sections = [
      { id: 'search',      icon: '🔍', title: 'Search & Filter' },
      { id: 'enable',      icon: '✓',  title: 'Enable / Disable Entities' },
      { id: 'rename',      icon: '✎',  title: 'Rename Entities' },
      { id: 'bulk',        icon: '⬜',  title: 'Bulk Operations' },
      { id: 'favorites',   icon: '★',  title: 'Favorites' },
      { id: 'aliases',     icon: '📝',  title: 'Aliases' },
      { id: 'labels',      icon: '🏷️', title: 'Labels' },
      { id: 'suggestions', icon: '💡',  title: 'Suggestions' },
      { id: 'smartgroups', icon: '📂',  title: 'Groups' },
      { id: 'statcards',   icon: '📊',  title: 'Stat Card Dialogs' },
      { id: 'cleanup',     icon: '🧹',  title: 'Cleanup' },
      { id: 'updates',     icon: '🆕',  title: 'Updates' },
      { id: 'undo',        icon: '↩',  title: 'Undo / Redo' },
      { id: 'export',      icon: '📤',  title: 'Export / Import' },
      { id: 'hacs',        icon: '🛒',  title: 'HACS Store' },
      { id: 'lovelace',    icon: '🎴',  title: 'Lovelace Cards' },
      { id: 'activity',    icon: '📋',  title: 'Activity Log' },
      { id: 'themes',      icon: '🎨',  title: 'Themes' },
      { id: 'columns',     icon: '⚙️',  title: 'Columns' },
    ];

    const toc = sections.map(s =>
      `<a class="help-toc-item" href="#help-${s.id}" style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;color:var(--em-text-secondary);text-decoration:none;font-size:13px;transition:background 0.1s">
         <span style="width:18px;text-align:center">${s.icon}</span>${s.title}
       </a>`
    ).join('');

    const { overlay, closeDialog } = this.createDialog({
      title: 'Entity Manager Help Guide',
      color: 'var(--em-primary)',
      extraClass: 'em-wide',
      contentHtml: `
        <div style="display:flex;gap:0;max-height:520px;overflow:hidden">
          <style>
            .help-toc-item:hover { background: var(--em-bg-secondary) !important; color: var(--em-primary) !important; }
            .help-section { margin-bottom: 24px; scroll-margin-top: 8px; }
            .help-section h3 { color: var(--em-primary); margin: 0 0 8px 0; font-size: 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--em-border); padding-bottom: 6px; }
            .help-section p  { margin: 0 0 8px 0; color: var(--em-text-secondary); font-size: 13px; }
            .help-section ul { margin: 0; padding-left: 18px; color: var(--em-text-secondary); font-size: 13px; }
            .help-section li { margin-bottom: 4px; }
          </style>

          <!-- TOC column -->
          <nav style="width:190px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--em-border);padding:8px 6px;display:flex;flex-direction:column;gap:1px">
            ${toc}
          </nav>

          <!-- Content column -->
          <div id="help-content" style="flex:1;overflow-y:auto;padding:16px 20px;min-width:0">

            <div class="help-section" id="help-search">
              <h3>🔍 Search &amp; Filter</h3>
              <ul>
                <li><strong>Search bar:</strong> fuzzy-match on entity ID, name, device, or integration</li>
                <li><strong>Domain filter:</strong> show only one entity type (lights, sensors, etc.)</li>
                <li><strong>Status filter:</strong> All / Enabled Only / Disabled Only</li>
                <li><strong>Sidebar → Integrations:</strong> click to filter by integration</li>
                <li><strong>Sidebar → Labels:</strong> click to filter by HA label</li>
                <li><strong>Sidebar → Domains:</strong> click to filter by domain</li>
              </ul>
            </div>

            <div class="help-section" id="help-enable">
              <h3>✓ Enable / Disable Entities</h3>
              <ul>
                <li>Click the <strong>Enable / Disable</strong> button on any entity card</li>
                <li>Right-click → Enable / Disable for quick access</li>
                <li>Use per-device <strong>Enable All / Disable All</strong> buttons</li>
                <li>Use per-integration filter buttons (View Enabled / View Disabled)</li>
              </ul>
            </div>

            <div class="help-section" id="help-rename">
              <h3>✎ Rename Entities</h3>
              <ul>
                <li>Click <strong>✎</strong> on any entity card to rename it</li>
                <li>Lowercase letters, numbers, and underscores only</li>
                <li>References in automations and scripts update automatically</li>
                <li>Right-click → Rename for the same dialog</li>
              </ul>
            </div>

            <div class="help-section" id="help-bulk">
              <h3>⬜ Bulk Operations</h3>
              <ul>
                <li>Check entity checkboxes to select multiple entities</li>
                <li>A floating action bar appears with Enable / Disable / Rename options</li>
                <li><strong>Bulk Rename:</strong> apply prefix, suffix, regex replacements to all selected</li>
                <li>Use the integration-level checkbox to select an entire integration at once</li>
                <li>Sidebar → Actions → Deselect All to clear selection</li>
              </ul>
            </div>

            <div class="help-section" id="help-favorites">
              <h3>★ Favorites</h3>
              <ul>
                <li>Click <strong>☆</strong> on any entity card to mark as favorite</li>
                <li>Sidebar → Actions → Favorites to show only favorites</li>
                <li>Favorites are stored locally in your browser</li>
              </ul>
            </div>

            <div class="help-section" id="help-aliases">
              <h3>📝 Aliases</h3>
              <ul>
                <li>Right-click an entity → <strong>Set Alias</strong> to give it an alternative display name</li>
                <li>Aliases are searchable and shown above the entity ID in the card</li>
                <li>Stored in HA entity registry — shared across browsers</li>
              </ul>
            </div>

            <div class="help-section" id="help-labels">
              <h3>🏷️ Labels</h3>
              <ul>
                <li>HA-native labels applied to entities, devices, and areas</li>
                <li>Sidebar → Labels groups them by: <strong>Devices / Areas / Automations / Scripts / Scenes / Entities</strong></li>
                <li>Click a label in the sidebar to filter the main view</li>
                <li>Right-click an entity → <strong>Manage Labels</strong> to add/remove labels</li>
                <li>Create new labels from the Manage Labels dialog</li>
                <li>Click <strong>✎</strong> next to a label in the sidebar to edit name/color</li>
              </ul>
            </div>

            <div class="help-section" id="help-suggestions">
              <h3>💡 Suggestions</h3>
              <ul>
                <li>Click the <strong>Suggestions</strong> stat card to analyse your entities</li>
                <li>🟣 <strong>Health Issues</strong> — entities unavailable 7+ days → suggest disable</li>
                <li>⬜ <strong>Disable Candidates</strong> — diagnostic entities unchanged 30+ days</li>
                <li>🟠 <strong>Naming Improvements</strong> — auto-generated hashes or generic names</li>
                <li>🔴 <strong>Area Assignment</strong> — devices with no area — bulk-assign directly from the dialog</li>
                <li>🟡 <strong>Label Suggestions</strong> — smart HA label recommendations — click <em>Apply to N</em> to create &amp; assign instantly</li>
                <li>Each section is colour-tinted for quick scanning</li>
              </ul>
            </div>

            <div class="help-section" id="help-smartgroups">
              <h3>📂 Groups</h3>
              <ul>
                <li>Sidebar → Groups to group entities by area, domain, or status</li>
                <li><strong>No Area:</strong> entities/devices not assigned to any room</li>
                <li><strong>By Domain:</strong> all lights together, all sensors together, etc.</li>
                <li>Each group shows entity count and bulk-assign area button</li>
              </ul>
            </div>

            <div class="help-section" id="help-statcards">
              <h3>📊 Stat Card Dialogs</h3>
              <ul>
                <li>Click any stat card (Automations, Scripts, Helpers, Templates, Unavailable…) to open its dialog</li>
                <li>Items appear as <strong>mini entity cards</strong> — same style as the main view: name · state · time-ago in the header, entity ID in the body</li>
                <li>Click <strong>↗</strong> on any card to jump to HA: Automations and Scripts open their editor directly; all others open the HA more-info popup</li>
                <li>Bulk checkboxes, Rename, and Labels work inside dialogs the same as in the main view</li>
              </ul>
            </div>

            <div class="help-section" id="help-cleanup">
              <h3>🧹 Cleanup</h3>
              <ul>
                <li>Click the <strong>Cleanup</strong> stat card to open the housekeeping view</li>
                <li><strong>Orphaned entities</strong> — entities with no parent device (YAML remnants or integration leftovers) — Remove or Assign to device</li>
                <li><strong>Stale entities</strong> — no state change in 30+ days — Keep (hide for 30 d), Disable, or Remove</li>
                <li><strong>Ghost devices</strong> — devices registered in HA but with zero entities — Remove</li>
              </ul>
            </div>

            <div class="help-section" id="help-updates">
              <h3>🆕 Updates</h3>
              <ul>
                <li>Click the <strong>Updates</strong> stat card to see pending HA updates</li>
                <li>Select individual entities and install updates one by one or in bulk</li>
                <li>Live progress ring shows installation percentage</li>
                <li>Optional: create an HA auto-backup before installing</li>
                <li>Updates queue sequentially — Active → Done / Failed</li>
              </ul>
            </div>

            <div class="help-section" id="help-undo">
              <h3>↩ Undo / Redo</h3>
              <ul>
                <li>Sidebar → Actions → Undo / Redo buttons</li>
                <li>Up to 50 undo steps — works for enable, disable, and rename</li>
              </ul>
            </div>

            <div class="help-section" id="help-export">
              <h3>📤 Export / Import</h3>
              <ul>
                <li>Sidebar → Actions → Export saves favorites &amp; aliases to a JSON file</li>
                <li>Import restores a previously exported file</li>
                <li>Useful before major bulk changes</li>
              </ul>
            </div>

            <div class="help-section" id="help-hacs">
              <h3>🛒 HACS Store</h3>
              <ul>
                <li>Click the <strong>HACS Store</strong> stat card to browse HACS integrations</li>
                <li>Search by name, filter by category (Integration, Frontend, etc.)</li>
                <li>Toggle <em>My Downloads</em> to see only installed items</li>
                <li>Click any item to open its HACS page in a new tab</li>
              </ul>
            </div>

            <div class="help-section" id="help-lovelace">
              <h3>🎴 Lovelace Cards</h3>
              <ul>
                <li>Click the <strong>Lovelace</strong> stat card to see all your dashboards</li>
                <li>Shows card type breakdown as a bar chart</li>
                <li>Lists all entity references across dashboards</li>
              </ul>
            </div>

            <div class="help-section" id="help-activity">
              <h3>📋 Activity Log</h3>
              <ul>
                <li>Sidebar → Activity Log to open the full HA logbook view</li>
                <li>Shows all entity state changes across your entire Home Assistant — not just Entity Manager actions</li>
                <li>Default range: last 7 days — switch to 1h / 6h / 24h / 7d with the range buttons</li>
                <li><strong>Search bar:</strong> filter by entity ID, device name, or message text</li>
                <li><strong>Integration filter:</strong> click integration chips to show only selected integrations</li>
                <li><strong>Device filter:</strong> narrow down to specific devices within an integration</li>
                <li>Filter selections are saved and restored next time you open the log</li>
                <li>Events grouped by Integration → Device → Entity for easy navigation</li>
                <li>Shows who or what triggered each change: 🤖 Automation, ⚙️ Script, 👤 User</li>
              </ul>
            </div>

            <div class="help-section" id="help-themes">
              <h3>🎨 Themes</h3>
              <ul>
                <li>Click the theme button (🎨) in the header toolbar</li>
                <li>Built-in: Light, Dark, High Contrast, OLED Black</li>
                <li>Create custom themes with your own color palette</li>
                <li>Theme choice saved per browser</li>
              </ul>
            </div>

            <div class="help-section" id="help-columns">
              <h3>⚙️ Columns</h3>
              <ul>
                <li>Sidebar → Columns to toggle which columns appear on entity cards</li>
                <li>Available: Device, Current State, Last Changed, Enable/Disable Status, Alias, Actions</li>
                <li>Preferences saved automatically in browser storage</li>
              </ul>
            </div>


          </div>
        </div>
      `,
      actionsHtml: `<button class="btn btn-primary em-help-close">Close</button>`
    });

    overlay.querySelector('.em-help-close').addEventListener('click', closeDialog);

    // TOC click → scroll to section
    overlay.querySelectorAll('.help-toc-item').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = overlay.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
  
  // ===== ACTIVITY LOG =====
  
  _loadActivityLog() {
    return this._loadFromStorage('em-activity-log', []);
  }
  
  _saveActivityLog() {
    // Keep only last 100 entries
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(-100);
    }
    this._saveToStorage('em-activity-log', this.activityLog);
  }
  
  _logActivity(action, details) {
    this.activityLog.push({
      action,
      details,
      timestamp: new Date().toISOString()
    });
    this._saveActivityLog();
  }
  
  _showActivityLog() {
    const filterBtns = EM_ACT_TYPES.map(t =>
      `<button class="act-type-btn${t.id === 'all' ? ' active' : ''}" data-type="${t.id}">${t.label}</button>`
    ).join('');

    const { overlay, closeDialog } = this.createDialog({
      title: '📋 EM Action Log',
      color: 'var(--em-primary)',
      contentHtml: `
        <div style="padding:0 4px 4px">
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 0">
            ${filterBtns}
            <input id="em-act-search" type="search" placeholder="Search…" autocomplete="off"
              style="flex:1;min-width:120px;padding:4px 10px;border-radius:8px;border:2px solid var(--em-border);
                     background:var(--em-bg-secondary);color:var(--em-text-primary);font-size:12px;outline:none">
          </div>
          <div id="em-act-log-list" style="max-height:420px;overflow-y:auto"></div>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary" id="em-act-export-btn">Export CSV</button>
        <button class="btn btn-secondary" id="em-act-clear-btn">Clear Log</button>
        <button class="btn btn-secondary" id="em-act-close-btn">Close</button>
      `
    });

    let activeType = 'all';
    let searchTerm = '';

    const renderList = () => {
      const list = overlay.querySelector('#em-act-log-list');
      if (!list) return;
      const entries = this.activityLog.slice().reverse().filter(e => {
        if (activeType !== 'all' && e.action !== activeType) return false;
        if (searchTerm) {
          const haystack = [e.action, JSON.stringify(e.details || {})].join(' ').toLowerCase();
          if (!haystack.includes(searchTerm)) return false;
        }
        return true;
      });
      if (!entries.length) {
        list.innerHTML = `<p style="text-align:center;padding:20px;opacity:0.6">No entries found.</p>`;
        return;
      }
      list.innerHTML = entries.map(entry => {
        const meta = EM_ACT_META[entry.action] || { icon: '•', color: 'inherit' };
        const time = new Date(entry.timestamp).toLocaleString();
        const d = entry.details || {};
        const text = {
          enable:  `Enabled <strong>${this._escapeHtml(d.entity || '')}</strong>`,
          disable: `Disabled <strong>${this._escapeHtml(d.entity || '')}</strong>`,
          rename:  `Renamed <strong>${this._escapeHtml(d.from || '')}</strong> → <strong>${this._escapeHtml(d.to || '')}</strong>`,
          area:    `Assigned area <strong>${this._escapeHtml(d.area || '')}</strong> to <strong>${this._escapeHtml(d.entity || '')}</strong>`,
        }[entry.action] || this._escapeHtml(entry.action);
        return `<div class="activity-item" style="display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid var(--em-border-light)">
          <span style="color:${meta.color};min-width:16px;flex-shrink:0">${meta.icon}</span>
          <span style="flex:1;font-size:13px">${text}</span>
          <span style="font-size:11px;opacity:0.6;white-space:nowrap">${time}</span>
        </div>`;
      }).join('');
    };

    renderList();

    overlay.querySelectorAll('.act-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeType = btn.dataset.type;
        overlay.querySelectorAll('.act-type-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderList();
      });
    });

    overlay.querySelector('#em-act-search')?.addEventListener('input', e => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderList();
    });

    overlay.querySelector('#em-act-close-btn').addEventListener('click', closeDialog);

    overlay.querySelector('#em-act-clear-btn').addEventListener('click', () => {
      if (!confirm('Clear all EM action log entries?')) return;
      this.activityLog = [];
      this._saveActivityLog();
      renderList();
      this._showToast('Activity log cleared', 'info');
    });

    overlay.querySelector('#em-act-export-btn').addEventListener('click', () => {
      const rows = [['timestamp', 'action', 'details']];
      this.activityLog.forEach(e => rows.push([e.timestamp, e.action, JSON.stringify(e.details || {})]));
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      const a = Object.assign(document.createElement('a'), {
        href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
        download: `em-action-log-${new Date().toISOString().split('T')[0]}.csv`,
      });
      a.click();
    });
  }
  
  // ===== UNDO/REDO SYSTEM =====
  
  _pushUndoAction(action) {
    this.undoStack.push(action);
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo when new action
    try { localStorage.setItem('em_undoStack', JSON.stringify(this.undoStack)); } catch {}
    try { localStorage.setItem('em_redoStack', '[]'); } catch {}
    this._updateUndoRedoUI();
  }
  
  async _executeAction(action, isUndo) {
    const verb = isUndo ? 'Undid' : 'Redid';
    switch (action.type) {
      case 'enable':
        await (isUndo ? this.disableEntity : this.enableEntity).call(this, action.entityId, true);
        this._showToast(`${verb} enable: ${action.entityId}`, 'info');
        break;
      case 'disable':
        await (isUndo ? this.enableEntity : this.disableEntity).call(this, action.entityId, true);
        this._showToast(`${verb} disable: ${action.entityId}`, 'info');
        break;
      case 'rename':
        await this.renameEntity(isUndo ? action.newId : action.oldId, isUndo ? action.oldId : action.newId, true);
        this._showToast(`${verb} rename`, 'info');
        break;
      case 'bulk_enable':
        for (const id of action.entityIds) await (isUndo ? this.disableEntity : this.enableEntity).call(this, id, true);
        this._showToast(`${verb} bulk enable (${action.entityIds.length})`, 'info');
        break;
      case 'bulk_disable':
        for (const id of action.entityIds) await (isUndo ? this.enableEntity : this.disableEntity).call(this, id, true);
        this._showToast(`${verb} bulk disable (${action.entityIds.length})`, 'info');
        break;
      case 'assign_entity_area':
        await this._hass.callWS({ type: 'config/entity_registry/update', entity_id: action.entityId, area_id: isUndo ? action.oldAreaId : action.newAreaId });
        this.floorsData = null;
        this._showToast(`${verb} area assignment`, 'info');
        break;
      case 'assign_device_area':
        await this._hass.callWS({ type: 'config/device_registry/update', device_id: action.deviceId, area_id: isUndo ? action.oldAreaId : action.newAreaId });
        this.floorsData = null;
        this._showToast(`${verb} area assignment`, 'info');
        break;
      case 'labels_change': {
        const el = isUndo ? action.beforeEntity : action.afterEntity;
        const dl = isUndo ? action.beforeDevice : action.afterDevice;
        await this._hass.callWS({ type: 'config/entity_registry/update', entity_id: action.entityId, labels: el });
        if (action.deviceId && dl) {
          await this._hass.callWS({ type: 'config/device_registry/update', device_id: action.deviceId, labels: dl });
        }
        this.labeledEntitiesCache = null;
        this.labeledDevicesCache = null;
        this._showToast(`${verb} label changes`, 'info');
        break;
      }
      case 'display_name_change':
        await this._hass.callWS({
          type: 'entity_manager/update_entity_display_name',
          entity_id: action.entityId,
          name: (isUndo ? action.oldName : action.newName) || null,
        });
        this._showToast(`${verb} display name`, 'info');
        break;
      case 'assign_entity_device':
        if (isUndo) {
          await this._hass.callWS({ type: 'entity_manager/unassign_entity_device', entity_id: action.entityId });
        } else {
          await this._hass.callWS({ type: 'entity_manager/assign_entity_device', entity_id: action.entityId, device_id: action.newDeviceId });
        }
        this._showToast(`${verb} device assignment`, 'info');
        break;
    }
  }

  async _undo() {
    if (this.undoStack.length === 0) { this._showToast('Nothing to undo', 'info'); return; }
    const action = this.undoStack.pop();
    this.redoStack.push(action);
    try { localStorage.setItem('em_undoStack', JSON.stringify(this.undoStack)); } catch {}
    try { localStorage.setItem('em_redoStack', JSON.stringify(this.redoStack)); } catch {}
    try {
      await this._executeAction(action, true);
    } catch (err) {
      // Restore stack on failure
      this.redoStack.pop();
      this.undoStack.push(action);
      try { localStorage.setItem('em_undoStack', JSON.stringify(this.undoStack)); } catch {}
      try { localStorage.setItem('em_redoStack', JSON.stringify(this.redoStack)); } catch {}
      this._showToast(`Undo failed: ${err.message || err}`, 'error');
      this._updateUndoRedoUI();
      return;
    }
    this._updateUndoRedoUI();
    await this.loadData();
  }

  async _redo() {
    if (this.redoStack.length === 0) { this._showToast('Nothing to redo', 'info'); return; }
    const action = this.redoStack.pop();
    this.undoStack.push(action);
    try { localStorage.setItem('em_undoStack', JSON.stringify(this.undoStack)); } catch {}
    try { localStorage.setItem('em_redoStack', JSON.stringify(this.redoStack)); } catch {}
    try {
      await this._executeAction(action, false);
    } catch (err) {
      // Restore stack on failure
      this.undoStack.pop();
      this.redoStack.push(action);
      try { localStorage.setItem('em_undoStack', JSON.stringify(this.undoStack)); } catch {}
      try { localStorage.setItem('em_redoStack', JSON.stringify(this.redoStack)); } catch {}
      this._showToast(`Redo failed: ${err.message || err}`, 'error');
      this._updateUndoRedoUI();
      return;
    }
    this._updateUndoRedoUI();
    await this.loadData();
  }
  
  _updateUndoRedoUI() {
    const btn = this.querySelector('#history-btn');
    if (!btn) return;
    const total = this.undoStack.length;
    const countEl = btn.querySelector('.count');
    if (total > 0) {
      if (countEl) countEl.textContent = total;
      else {
        const span = document.createElement('span');
        span.className = 'count';
        span.textContent = total;
        btn.appendChild(span);
      }
    } else {
      if (countEl) countEl.remove();
    }
    btn.style.opacity = (this.undoStack.length === 0 && this.redoStack.length === 0) ? '0.5' : '';
  }

  _describeAction(action) {
    switch (action.type) {
      case 'enable':
        return `Enabled ${action.entityId}`;
      case 'disable':
        return `Disabled ${action.entityId}`;
      case 'bulk_enable':
        return `Bulk enabled ${action.entityIds?.length ?? '?'} entities`;
      case 'bulk_disable':
        return `Bulk disabled ${action.entityIds?.length ?? '?'} entities`;
      case 'rename':
        return `Renamed ${action.oldId} → ${action.newId}`;
      case 'display_name_change':
        return `Display name: "${action.newName || '(cleared)'}" on ${action.entityId}`;
      case 'labels_change':
        return `Changed labels on ${action.entityId}`;
      case 'assign_entity_device':
        return `Assigned ${action.entityId} to ${action.deviceName || 'device'}`;
      case 'assign_entity_area':
        return `Assigned ${action.entityId} to area`;
      case 'assign_device_area':
        return `Assigned device to area`;
      default:
        return action.type ?? 'Unknown action';
    }
  }

  _showHistoryDialog() {
    const buildList = () => {
      const redoRows = [...this.redoStack].reverse().map((action, i) => {
        return `<div class="em-history-row em-history-redo" data-stack="redo" data-steps="${i + 1}">
          <span class="em-history-icon">↪</span>
          <span class="em-history-label">${this._escapeHtml(this._describeAction(action))}</span>
          <button class="em-history-row-btn">Redo</button>
        </div>`;
      }).join('');

      const undoRows = [...this.undoStack].reverse().map((action, i) => {
        return `<div class="em-history-row em-history-undo" data-stack="undo" data-steps="${i + 1}">
          <span class="em-history-icon">↩</span>
          <span class="em-history-label">${this._escapeHtml(this._describeAction(action))}</span>
          <button class="em-history-row-btn">Undo</button>
        </div>`;
      }).join('');

      const emptyMsg = (!this.undoStack.length && !this.redoStack.length)
        ? `<div class="em-history-empty">No history yet</div>` : '';

      const redoHeader = redoRows
        ? `<div class="em-history-section-label">These are actions you have undone — click Redo to reapply them.</div>` : '';
      const undoHeader = undoRows
        ? `<div class="em-history-section-label">These are actions you have taken — click Undo to reverse them.</div>` : '';

      const divider = (redoRows || undoRows)
        ? `<div class="em-history-divider">▶ Current state</div>` : '';

      return `${redoHeader}${redoRows}${divider}${undoHeader}${undoRows}${emptyMsg}`;
    };

    const { overlay, closeDialog } = this.createDialog({
      title: '↺ History',
      color: 'var(--em-primary)',
      contentHtml: `<div id="em-history-list">${buildList()}</div>`,
      actionsHtml: `<button class="btn btn-secondary" id="em-history-clear" style="color:var(--em-danger);border-color:var(--em-danger)">Clear History</button>
                    <button class="btn btn-secondary" id="em-history-close">Close</button>`,
    });

    overlay.querySelector('#em-history-close').addEventListener('click', closeDialog);

    const listEl = overlay.querySelector('#em-history-list');
    overlay.querySelector('#em-history-clear').addEventListener('click', () => {
      this.undoStack = [];
      this.redoStack = [];
      try { localStorage.setItem('em_undoStack', '[]'); } catch {}
      try { localStorage.setItem('em_redoStack', '[]'); } catch {}
      this._updateUndoRedoUI();
      listEl.innerHTML = buildList();
    });
    listEl.addEventListener('click', async (e) => {
      const row = e.target.closest('.em-history-row');
      if (!row) return;
      const stack = row.dataset.stack;
      const steps = parseInt(row.dataset.steps, 10);
      for (let i = 0; i < steps; i++) {
        if (stack === 'undo') {
          if (this.undoStack.length === 0) break;
          await this._undo();
        } else {
          if (this.redoStack.length === 0) break;
          await this._redo();
        }
      }
      listEl.innerHTML = buildList();
    });
  }

  // ===== FILTER PRESETS =====
  
  _loadFilterPresets() {
    return this._loadFromStorage('em-filter-presets', []);
  }

  _saveFilterPresets() {
    this._saveToStorage('em-filter-presets', this.filterPresets);
  }
  
  _saveEntityPreset() {
    const entityIds = [...(this.selectedEntities || new Set())];
    if (!entityIds.length) { this._showToast('No entities selected', 'info'); return; }
    this._showPromptDialog('Save Preset', 'Name for this preset:', `Preset ${Date.now() % 1000}`, name => {
      if (!name?.trim()) return;
      const presets = this._loadFromStorage('em-presets', []);
      presets.push({ id: `ep_${Date.now()}`, name: name.trim(), entityIds });
      this._saveToStorage('em-presets', presets);
      this._reRenderSidebar();
      this._showToast(`Preset "${name.trim()}" saved (${entityIds.length} entities)`, 'success');
    });
  }

  _saveCurrentFilterPreset(presetName) {
    const savePreset = (name) => {
      const preset = {
        id: Date.now(),
        name,
        filters: {
          viewState: this.viewState,
          selectedDomain: this.selectedDomain,
          searchTerm: this.searchTerm,
          smartGroupMode: this.smartGroupMode
        },
        // Keep flat properties for backwards compatibility
        viewState: this.viewState,
        selectedDomain: this.selectedDomain,
        searchTerm: this.searchTerm,
        smartGroupMode: this.smartGroupMode
      };

      this.filterPresets.push(preset);
      this._saveFilterPresets();
      this._showToast(`View "${name}" saved`, 'success');
      this._reRenderSidebar();
    };

    if (presetName) {
      savePreset(presetName);
    } else {
      this._showPromptDialog('Save Filter Preset', 'Enter preset name:', '', savePreset);
    }
  }
  
  _applyFilterPreset(presetId) {
    const preset = this.filterPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    this.viewState = preset.viewState || 'all';
    this.selectedDomain = preset.selectedDomain || 'all';
    this.searchTerm = preset.searchTerm || '';
    if (preset.smartGroupMode) this.smartGroupMode = preset.smartGroupMode;
    
    // Update UI
    const searchInput = this.content?.querySelector('#search-input');
    if (searchInput) searchInput.value = this.searchTerm;
    this.setActiveFilter();
    this.updateView();
    
    this._showToast(`Applied preset: ${preset.name}`, 'success');
  }
  
  _deleteFilterPreset(presetId) {
    this.filterPresets = this.filterPresets.filter(p => p.id !== presetId);
    this._saveFilterPresets();
    this._reRenderSidebar();
    this._showToast('View deleted', 'info');
  }
  
  _updateFilterPresetsUI() {
    const container = this.querySelector('#filter-presets-list');
    if (!container) return;
    
    container.innerHTML = this.filterPresets.map(preset => `
      <div class="filter-preset-item" data-preset-id="${preset.id}">
        <span class="preset-name">${preset.name}</span>
        <button class="preset-delete" data-delete="${preset.id}">&times;</button>
      </div>
    `).join('');
  }
  
  // ===== CUSTOM COLUMNS =====
  
  _loadVisibleColumns() {
    return this._loadFromStorage('em-visible-columns',
      ['checkbox', 'favorite', 'name', 'id', 'device', 'state', 'status', 'actions']);
  }
  
  _saveVisibleColumns() {
    this._saveToStorage('em-visible-columns', this.visibleColumns);
  }
  
  _showColumnSettings() {
    const allColumns = [
      { id: 'checkbox', name: 'Selection', required: true },
      { id: 'favorite', name: 'Favorite' },
      { id: 'name', name: 'Name' },
      { id: 'id', name: 'Entity ID' },
      { id: 'device', name: 'Device' },
      { id: 'state', name: 'Current State' },
      { id: 'lastChanged', name: 'Last Changed' },
      { id: 'status', name: 'Enable/Disable Status' },
      { id: 'alias', name: 'Alias' },
      { id: 'actions', name: 'Actions', required: true }
    ];
    
    const { overlay, closeDialog } = this.createDialog({
      title: 'Configure Columns',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="column-settings">
          <p style="color: var(--em-text-secondary); margin-bottom: 12px;">Select columns to display:</p>
          ${allColumns.map(col => `
            <label class="column-toggle">
              <input type="checkbox" data-col="${col.id}" 
                ${this.visibleColumns.includes(col.id) ? 'checked' : ''} 
                ${col.required ? 'disabled' : ''}>
              ${col.name} ${col.required ? '(required)' : ''}
            </label>
          `).join('')}
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary cancel-btn">Cancel</button>
        <button class="btn btn-primary save-btn">Save</button>
      `
    });
    
    overlay.querySelector('.cancel-btn').addEventListener('click', closeDialog);
    overlay.querySelector('.save-btn').addEventListener('click', () => {
      this.visibleColumns = [];
      overlay.querySelectorAll('input[data-col]:checked').forEach(cb => {
        this.visibleColumns.push(cb.dataset.col);
      });
      this._saveVisibleColumns();
      closeDialog();
      this.updateView();
      this._showToast('Columns updated', 'success');
    });
  }
  
  // ===== ENTITY LABELS (Home Assistant Labels) =====
  
  async _loadHALabels() {
    try {
      const result = await this._hass.callWS({ type: 'config/label_registry/list' });
      this.labelsCache = result || [];
      return this.labelsCache;
    } catch (e) {
      console.error('Error loading labels:', e);
      return [];
    }
  }
  
  async _loadLabeledEntities() {
    try {
      const entityRegistry = await this._hass.callWS({ type: 'config/entity_registry/list' });
      const labels = this.labelsCache || await this._loadHALabels();
      
      // Group entities by label
      const labeledEntities = {};
      
      for (const entity of entityRegistry) {
        const entityLabels = entity.labels
          ? (Array.isArray(entity.labels) ? entity.labels : Array.from(entity.labels))
          : [];
        if (entityLabels.length > 0) {
          for (const labelId of entityLabels) {
            if (!labeledEntities[labelId]) {
              const labelInfo = labels.find(l => l.label_id === labelId);
              labeledEntities[labelId] = {
                label_id: labelId,
                name: labelInfo?.name || labelId,
                color: labelInfo?.color || 'blue',
                entities: [],
                byIntegration: {}
              };
            }
            
            // Get integration (domain prefix)
            const domain = entity.entity_id.split('.')[0];
            labeledEntities[labelId].entities.push(entity.entity_id);
            
            if (!labeledEntities[labelId].byIntegration[domain]) {
              labeledEntities[labelId].byIntegration[domain] = [];
            }
            labeledEntities[labelId].byIntegration[domain].push(entity.entity_id);
          }
        }
      }
      
      this.labeledEntitiesCache = labeledEntities;
      return labeledEntities;
    } catch (e) {
      console.error('Error loading labeled entities:', e);
      return {};
    }
  }
  
  async _loadLabeledDevices() {
    try {
      const deviceRegistry = await this._hass.callWS({ type: 'config/device_registry/list' });
      const labels = this.labelsCache || await this._loadHALabels();

      // Build entity ID lookup from this.data: deviceId → entity_ids[]
      const deviceEntityMap = {};
      for (const intg of (this.data || [])) {
        for (const [devId, dev] of Object.entries(intg.devices || {})) {
          deviceEntityMap[devId] = (dev.entities || []).map(e => e.entity_id);
        }
      }

      const labeledDevices = {};
      for (const device of deviceRegistry) {
        const devLabels = device.labels
          ? (Array.isArray(device.labels) ? device.labels : Array.from(device.labels))
          : [];
        for (const labelId of devLabels) {
          if (!labeledDevices[labelId]) {
            const labelInfo = labels.find(l => l.label_id === labelId);
            labeledDevices[labelId] = {
              label_id: labelId,
              name: labelInfo?.name || labelId,
              color: labelInfo?.color || 'blue',
              deviceIds: [],
              deviceCount: 0,
              entityIds: [],
            };
          }
          labeledDevices[labelId].deviceIds.push(device.id);
          labeledDevices[labelId].deviceCount++;
          for (const eid of (deviceEntityMap[device.id] || [])) {
            labeledDevices[labelId].entityIds.push(eid);
          }
        }
      }

      this.labeledDevicesCache = labeledDevices;
      return labeledDevices;
    } catch (e) {
      console.error('Error loading labeled devices:', e);
      this.labeledDevicesCache = {};
      return {};
    }
  }

  async _loadLabeledAreas() {
    try {
      const [areaRegistry, entityRegistry, deviceRegistry] = await Promise.all([
        this._hass.callWS({ type: 'config/area_registry/list' }),
        this._hass.callWS({ type: 'config/entity_registry/list' }),
        this._hass.callWS({ type: 'config/device_registry/list' }),
      ]);
      const labels = this.labelsCache || await this._loadHALabels();

      // area → entity IDs (direct assignment + via device)
      const areaEntities = {};
      const deviceAreaMap = {};
      for (const d of deviceRegistry) { if (d.area_id) deviceAreaMap[d.id] = d.area_id; }
      for (const e of entityRegistry) {
        const areaId = e.area_id || deviceAreaMap[e.device_id];
        if (areaId) {
          if (!areaEntities[areaId]) areaEntities[areaId] = [];
          areaEntities[areaId].push(e.entity_id);
        }
      }

      const labeledAreas = {};
      for (const area of areaRegistry) {
        const areaLabels = area.labels
          ? (Array.isArray(area.labels) ? area.labels : Array.from(area.labels))
          : [];
        for (const labelId of areaLabels) {
          if (!labeledAreas[labelId]) {
            const labelInfo = labels.find(l => l.label_id === labelId);
            labeledAreas[labelId] = {
              label_id: labelId,
              name: labelInfo?.name || labelId,
              color: labelInfo?.color || 'blue',
              areaIds: [],
              areaCount: 0,
              entityIds: [],
            };
          }
          labeledAreas[labelId].areaIds.push(area.id);
          labeledAreas[labelId].areaCount++;
          for (const eid of (areaEntities[area.id] || [])) {
            if (!labeledAreas[labelId].entityIds.includes(eid))
              labeledAreas[labelId].entityIds.push(eid);
          }
        }
      }

      this.labeledAreasCache = labeledAreas;
      return labeledAreas;
    } catch (e) {
      console.error('Error loading labeled areas:', e);
      this.labeledAreasCache = {};
      return {};
    }
  }

  async _loadAndDisplayLabels() {
    const labelsList = this.querySelector('#labels-list');
    if (!labelsList) return;

    // If all caches already populated, render immediately — no loading flash
    if (this.labeledEntitiesCache && this.labeledDevicesCache && this.labeledAreasCache) {
      this._renderLabelsList(labelsList, this.labeledEntitiesCache, this.labeledDevicesCache, this.labeledAreasCache);
      return;
    }

    // First load — show spinner while fetching
    labelsList.innerHTML = '<div class="sidebar-item" style="opacity: 0.5;"><span class="icon">⏳</span><span class="label">Loading...</span></div>';

    try {
      await Promise.all([this._loadLabeledEntities(), this._loadLabeledDevices(), this._loadLabeledAreas()]);
      this._renderLabelsList(labelsList, this.labeledEntitiesCache, this.labeledDevicesCache, this.labeledAreasCache);
    } catch (e) {
      console.error('Error displaying labels:', e);
      labelsList.innerHTML = '<div class="sidebar-item" style="color: var(--em-error);"><span class="icon">⚠️</span><span class="label">Error loading labels</span></div>';
    }
  }

  _renderLabelsList(labelsList, labeledEntities, labeledDevices = {}, labeledAreas = {}) {
    const deviceLabels = Object.values(labeledDevices || {}).sort((a, b) => b.deviceCount - a.deviceCount);
    const areaLabels   = Object.values(labeledAreas   || {}).sort((a, b) => b.areaCount  - a.areaCount);

    // Split entity labels by domain into Automations / Scripts / Scenes / Entities
    const automationLabels = [], scriptLabels = [], sceneLabels = [], otherEntityLabels = [];
    for (const label of Object.values(labeledEntities || {})) {
      const auto   = label.entities.filter(e => e.startsWith('automation.')).length;
      const script = label.entities.filter(e => e.startsWith('script.')).length;
      const scene  = label.entities.filter(e => e.startsWith('scene.')).length;
      const other  = label.entities.length - auto - script - scene;
      if (auto)   automationLabels.push({ ...label, _count: auto });
      if (script) scriptLabels.push({ ...label, _count: script });
      if (scene)  sceneLabels.push({ ...label, _count: scene });
      if (other)  otherEntityLabels.push({ ...label, _count: other });
    }
    automationLabels.sort((a, b) => b._count - a._count);
    scriptLabels.sort((a, b) => b._count - a._count);
    sceneLabels.sort((a, b) => b._count - a._count);
    otherEntityLabels.sort((a, b) => b._count - a._count);

    const totalCount = deviceLabels.length + areaLabels.length +
      automationLabels.length + scriptLabels.length + sceneLabels.length + otherEntityLabels.length;

    if (totalCount === 0) {
      labelsList.innerHTML = '<div class="sidebar-item" style="opacity: 0.7;"><span class="icon">📝</span><span class="label">No labeled items</span></div>';
      return;
    }

    const renderLabelItem = (label, count) => `
      <div class="sidebar-item ${this.selectedLabelFilter === label.label_id ? 'active' : ''}" data-label-id="${this._escapeAttr(label.label_id)}">
        <span class="icon" style="color: ${this._escapeAttr(this._labelColorCss(label.color))};">●</span>
        <span class="label">${this._escapeHtml(label.name)}</span>
        <span class="count">${count}</span>
        <button data-edit-label="${this._escapeAttr(label.label_id)}"
          style="background:none;border:none;cursor:pointer;color:var(--em-text-secondary);padding:0 2px;font-size:13px;line-height:1;opacity:0.7;flex-shrink:0"
          title="Edit label">✎</button>
      </div>`;

    const limit = this.labelsVisibleCount;
    let shown = 0;
    let html = '';

    const renderSection = (header, items, countKey) => {
      if (!items.length) return;
      html += `<div class="sidebar-sub-header">${header}</div>`;
      for (const label of items) {
        if (shown >= limit) return;
        html += renderLabelItem(label, label[countKey] ?? label._count);
        shown++;
      }
    };

    renderSection('Devices',     deviceLabels,        'deviceCount');
    renderSection('Areas',       areaLabels,          'areaCount');
    renderSection('Automations', automationLabels,    '_count');
    renderSection('Scripts',     scriptLabels,        '_count');
    renderSection('Scenes',      sceneLabels,         '_count');
    renderSection('Entities',    otherEntityLabels,   '_count');

    if (shown < totalCount) {
      html += `<div class="em-labels-sentinel" style="height:1px;margin:4px 0"></div>`;
    }

    html += `<div class="sidebar-item" data-action="load-labels" style="opacity: 0.7;"><span class="icon">🔄</span><span class="label">Refresh</span></div>`;

    labelsList.innerHTML = html;

    const sentinel = labelsList.querySelector('.em-labels-sentinel');
    if (sentinel) {
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          this.labelsVisibleCount += 8;
          this._renderLabelsList(labelsList, this.labeledEntitiesCache || {}, this.labeledDevicesCache || {}, this.labeledAreasCache || {});
        }
      }, { root: labelsList.closest('.em-sidebar'), threshold: 0.1 });
      io.observe(sentinel);
    }
  }
  
  async _filterByLabel(labelId) {
    // Store the selected label filter
    this.selectedLabelFilter = labelId;
    this._showOnlyFavorites = false;
    this.selectedIntegrationFilter = null;
    
    // Load labeled entities if not cached
    if (!this.labeledEntitiesCache) {
      await this._loadLabeledEntities();
    }
    
    const labelData = this.labeledEntitiesCache[labelId];
    if (labelData) {
      this._showToast(`Filtering by label: ${labelData.name}`, 'info');
    }
    
    // Update the view
    this.updateView();
    
    // Re-render sidebar to update active states
    this._reRenderSidebar();
  }

  async _getEntityLabels(entityId) {
    try {
      // Use /get (not /list) — list omits labels in some HA versions
      const entry = await this._hass.callWS({
        type: 'config/entity_registry/get',
        entity_id: entityId,
      });
      // Normalise: HA may return a Set-like or plain array
      const raw = entry?.labels;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : Array.from(raw);
    } catch (e) {
      console.error('Error getting entity labels:', e);
      return [];
    }
  }
  
  async _getDeviceLabels(deviceId) {
    try {
      const entry = await this._hass.callWS({
        type: 'config/device_registry/get',
        device_id: deviceId,
      });
      const raw = entry?.labels;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : Array.from(raw);
    } catch (e) {
      console.error('Error getting device labels:', e);
      return [];
    }
  }

  async _getEntityDeviceId(entityId) {
    try {
      const entry = await this._hass.callWS({
        type: 'config/entity_registry/get',
        entity_id: entityId,
      });
      return entry?.device_id || null;
    } catch { return null; }
  }

  async _addLabelToEntity(entityId, labelId, target = 'both') {
    try {
      if (target === 'entity' || target === 'both') {
        const currentLabels = await this._getEntityLabels(entityId);
        if (!currentLabels.includes(labelId)) {
          await this._hass.callWS({
            type: 'config/entity_registry/update',
            entity_id: entityId,
            labels: [...currentLabels, labelId],
          });
        }
      }
      if (target === 'device' || target === 'both') {
        const deviceId = await this._getEntityDeviceId(entityId);
        if (deviceId) {
          const devLabels = await this._getDeviceLabels(deviceId);
          if (!devLabels.includes(labelId)) {
            await this._hass.callWS({
              type: 'config/device_registry/update',
              device_id: deviceId,
              labels: [...devLabels, labelId],
            });
          }
        }
      }
    } catch (e) {
      console.error('Error adding label:', e);
      throw e;
    }
  }

  async _removeLabelFromEntity(entityId, labelId, target = 'both') {
    try {
      let beforeEntity = [], afterEntity = [], beforeDevice = [], afterDevice = [], deviceId = null;
      if (target === 'entity' || target === 'both') {
        beforeEntity = await this._getEntityLabels(entityId);
        afterEntity = beforeEntity.filter(l => l !== labelId);
        await this._hass.callWS({
          type: 'config/entity_registry/update',
          entity_id: entityId,
          labels: afterEntity,
        });
      }
      if (target === 'device' || target === 'both') {
        deviceId = await this._getEntityDeviceId(entityId);
        if (deviceId) {
          beforeDevice = await this._getDeviceLabels(deviceId);
          if (beforeDevice.includes(labelId)) {
            afterDevice = beforeDevice.filter(l => l !== labelId);
            await this._hass.callWS({
              type: 'config/device_registry/update',
              device_id: deviceId,
              labels: afterDevice,
            });
          } else {
            afterDevice = beforeDevice;
          }
        }
      }
      this._pushUndoAction({ type: 'labels_change', entityId, deviceId, beforeEntity, afterEntity, beforeDevice, afterDevice });
    } catch (e) {
      console.error('Error removing label:', e);
      throw e;
    }
  }
  
  async _createLabel(name, color = null, icon = null, description = null) {
    try {
      const result = await this._hass.callWS({
        type: 'config/label_registry/create',
        name: name,
        color: color,
        icon: icon,
        description: description
      });
      return result;
    } catch (e) {
      console.error('Error creating label:', e);
      throw e;
    }
  }
  
  async _showLabelEditDialog(label, selectedEntityIds = []) {
    const currentColor = label.color || 'blue';
    const swatchHtml = HA_LABEL_COLORS.map(([name, hex]) =>
      `<button class="em-label-swatch${name === currentColor ? ' selected' : ''}" data-color="${name}" style="background:${hex}" title="${name}"></button>`
    ).join('');

    const haSelection = selectedEntityIds.length > 0;
    const selectionHtml = haSelection ? `
      <div style="padding:10px 12px;background:var(--em-bg-secondary);border-radius:8px;border:1px solid var(--em-border)">
        <div style="font-size:12px;color:var(--em-text-secondary);margin-bottom:8px">
          ${selectedEntityIds.length} ${selectedEntityIds.length === 1 ? 'entity' : 'entities'} selected
        </div>
        ${this._labelTargetSelectorHtml('em-edit-label-target', 'both', true)}
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" id="em-label-add-selected" style="flex:1">+ Add to selected</button>
          <button class="btn btn-secondary" id="em-label-remove-selected" style="flex:1">− Remove from selected</button>
        </div>
      </div>
      <hr style="border:none;border-top:1px solid var(--em-border);margin:4px 0">
    ` : '';

    const { overlay, closeDialog } = this.createDialog({
      title: `Edit Label: ${label.name}`,
      color: 'var(--em-primary)',
      contentHtml: `
        <div style="display:flex;flex-direction:column;gap:12px;padding:4px 0">
          ${selectionHtml}
          <div>
            <label style="font-size:12px;color:var(--em-text-secondary);display:block;margin-bottom:4px">Label name</label>
            <input id="em-label-edit-name" type="text" value="${this._escapeAttr(label.name)}"
              style="width:100%;box-sizing:border-box;padding:8px;border:1px solid var(--em-border);border-radius:6px;background:var(--em-bg-primary);color:var(--em-text-primary);font-size:14px">
          </div>
          <div>
            <label style="font-size:12px;color:var(--em-text-secondary);display:block;margin-bottom:6px">Color</label>
            <div class="em-label-color-picker" id="em-label-edit-color" data-value="${this._escapeAttr(currentColor)}">
              ${swatchHtml}
            </div>
          </div>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-danger" id="em-label-delete-btn" style="margin-right:auto">Delete</button>
        <button class="btn btn-secondary confirm-no">Cancel</button>
        <button class="btn btn-primary" id="em-label-save-btn">Save</button>
      `
    });

    // Bulk add/remove for selected entities
    if (haSelection) {
      this._attachTargetSelector(overlay, 'em-edit-label-target');

      overlay.querySelector('#em-label-add-selected').addEventListener('click', async () => {
        const target = this._getTargetValue(overlay, 'em-edit-label-target');
        this._showToast(`Adding "${label.name}" to ${selectedEntityIds.length} entities…`, 'info', 0);
        let ok = 0, fail = 0;
        for (const entityId of selectedEntityIds) {
          try { await this._addLabelToEntity(entityId, label.label_id, target); ok++; }
          catch { fail++; }
        }
        this.labeledEntitiesCache = null;
        this.labeledDevicesCache = null;
        this.labeledAreasCache = null;
        closeDialog();
        this._loadAndDisplayLabels();
        this._showToast(fail ? `Added to ${ok}, failed ${fail}` : `Added "${label.name}" to ${ok} entities`, fail ? 'warning' : 'success');
      });

      overlay.querySelector('#em-label-remove-selected').addEventListener('click', async () => {
        const target = this._getTargetValue(overlay, 'em-edit-label-target');
        this._showToast(`Removing "${label.name}" from ${selectedEntityIds.length} entities…`, 'info', 0);
        let ok = 0, fail = 0;
        for (const entityId of selectedEntityIds) {
          try { await this._removeLabelFromEntity(entityId, label.label_id, target); ok++; }
          catch { fail++; }
        }
        this.labeledEntitiesCache = null;
        this.labeledDevicesCache = null;
        this.labeledAreasCache = null;
        closeDialog();
        this._loadAndDisplayLabels();
        this._showToast(fail ? `Removed from ${ok}, failed ${fail}` : `Removed "${label.name}" from ${ok} entities`, fail ? 'warning' : 'success');
      });
    }

    // Swatch picker
    overlay.querySelector('#em-label-edit-color').addEventListener('click', (e) => {
      const swatch = e.target.closest('.em-label-swatch');
      if (!swatch) return;
      const picker = swatch.closest('.em-label-color-picker');
      picker.querySelectorAll('.em-label-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      picker.dataset.value = swatch.dataset.color;
    });

    // Save
    overlay.querySelector('#em-label-save-btn').addEventListener('click', async () => {
      const name = overlay.querySelector('#em-label-edit-name').value.trim();
      const color = overlay.querySelector('#em-label-edit-color').dataset.value || 'blue';
      if (!name) { this._showToast('Label name cannot be empty', 'warning'); return; }
      try {
        await this._hass.callWS({ type: 'config/label_registry/update', label_id: label.label_id, name, color });
        this._showToast(`Label "${name}" updated`, 'success');
        this.labelsCache = null;
        this.labeledEntitiesCache = null;
        this.labeledDevicesCache = null;
        this.labeledAreasCache = null;
        closeDialog();
        this._loadAndDisplayLabels();
      } catch (e) {
        this._showToast('Error updating label', 'error');
      }
    });

    // Delete
    overlay.querySelector('#em-label-delete-btn').addEventListener('click', async () => {
      if (!confirm(`Delete label "${label.name}"? This will remove it from all entities.`)) return;
      try {
        await this._hass.callWS({ type: 'config/label_registry/delete', label_id: label.label_id });
        this._showToast(`Label "${label.name}" deleted`, 'success');
        this.labelsCache = null;
        this.labeledEntitiesCache = null;
        this.labeledDevicesCache = null;
        this.labeledAreasCache = null;
        closeDialog();
        this._loadAndDisplayLabels();
      } catch (e) {
        this._showToast('Error deleting label', 'error');
      }
    });

    overlay.querySelector('.confirm-no').addEventListener('click', closeDialog);
  }

  async _showLabelEditor(entityId, defaultTarget = 'both') {
    const [allLabels, deviceId] = await Promise.all([
      this._loadHALabels(),
      this._getEntityDeviceId(entityId),
    ]);

    // Snapshot labels before editing for undo
    const [beforeEntityLabels, beforeDeviceLabels] = await Promise.all([
      this._getEntityLabels(entityId),
      deviceId ? this._getDeviceLabels(deviceId) : Promise.resolve([]),
    ]);

    // If entity has no device, clamp target to 'entity'
    if (!deviceId && defaultTarget !== 'entity') defaultTarget = 'entity';

    // Fetch initial labels for the chosen target
    const getLabelsForTarget = async (target) => {
      if (target === 'device' && deviceId) return await this._getDeviceLabels(deviceId);
      if (target === 'both' && deviceId) {
        const [el, dl] = await Promise.all([this._getEntityLabels(entityId), this._getDeviceLabels(deviceId)]);
        return [...new Set([...el, ...dl])];
      }
      return await this._getEntityLabels(entityId);
    };

    const initialLabels = await getLabelsForTarget(defaultTarget);

    const sectionTitleFor = (t) =>
      t === 'device' ? 'Device Labels' : t === 'entity' ? 'Entity Labels' : 'Current Labels';

    const renderChips = (labelIds) => labelIds.length === 0
      ? '<span style="color:var(--em-text-secondary);font-size:13px">No labels assigned</span>'
      : labelIds.map(labelId => {
          const label = allLabels.find(l => l.label_id === labelId);
          const chipColor = this._labelColorCss(label?.color);
          const textColor = this._contrastColor(chipColor);
          return `<span class="label-chip" style="background:${this._escapeAttr(chipColor)};color:${textColor};padding:4px 8px;border-radius:12px;margin:2px;display:inline-block;font-size:12px">
            ${this._escapeHtml(label?.name || labelId)}
            <button data-remove="${this._escapeAttr(labelId)}" style="background:none;border:none;color:${textColor};cursor:pointer;margin-left:4px">&times;</button>
          </span>`;
        }).join('');

    const renderAvailable = (currentIds) => allLabels.length === 0
      ? '<p style="color:var(--em-text-secondary)">No labels defined yet.</p>'
      : allLabels.map(label => `
          <div class="label-option" data-label-id="${this._escapeAttr(label.label_id)}"
            style="padding:8px;cursor:pointer;border-radius:4px;margin:4px 0;display:flex;align-items:center;gap:8px;${currentIds.includes(label.label_id) ? 'opacity:0.5' : ''}">
            <span style="width:16px;height:16px;border-radius:50%;background:${this._escapeAttr(this._labelColorCss(label.color))};display:inline-block;flex-shrink:0"></span>
            <span>${this._escapeHtml(label.name)}</span>
            ${currentIds.includes(label.label_id)
              ? '<span style="margin-left:auto;color:var(--em-success)">✓</span>'
              : '<span style="margin-left:auto;color:var(--em-text-secondary)">+ Add</span>'}
          </div>`).join('');

    const { overlay, closeDialog } = this.createDialog({
      title: 'Manage Labels',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="label-editor">
          <p style="color:var(--em-text-secondary);margin-bottom:10px;font-size:12px;font-family:monospace">${this._escapeHtml(entityId)}</p>
          ${this._labelTargetSelectorHtml('em-label-target', defaultTarget, !!deviceId)}
          <div class="current-labels" style="margin-bottom:14px">
            <div id="em-label-section-title" style="font-size:12px;color:var(--em-text-secondary);margin-bottom:5px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">
              ${sectionTitleFor(defaultTarget)}
            </div>
            <div id="entity-labels" style="min-height:28px">${renderChips(initialLabels)}</div>
          </div>
          <div class="available-labels">
            <div style="font-size:12px;color:var(--em-text-secondary);margin-bottom:5px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Available Labels</div>
            <div id="available-labels" style="max-height:150px;overflow-y:auto">${renderAvailable(initialLabels)}</div>
          </div>
          <div class="create-label" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--em-border)">
            <strong>Create New Label:</strong>
            <div style="display:flex;gap:8px;margin-top:8px">
              <input type="text" id="new-label-name" placeholder="Label name"
                style="flex:1;padding:8px;border:1px solid var(--em-border);border-radius:4px;background:var(--em-surface);color:var(--em-text)">
            </div>
            <div class="em-label-color-picker" id="new-label-color" data-value="blue" style="margin-top:8px">
              ${HA_LABEL_COLORS.map(([name, hex]) => `<button class="em-label-swatch${name === 'blue' ? ' selected' : ''}" data-color="${name}" style="background:${hex}" title="${name}"></button>`).join('')}
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:8px">
              <button class="btn btn-primary" id="create-label-btn">Create</button>
            </div>
          </div>
        </div>`,
      actionsHtml: `<button class="btn btn-primary">Done</button>`
    });

    const refreshLabels = async () => {
      this.labeledEntitiesCache = null;
      this.labeledDevicesCache = null;
      this.labeledAreasCache = null;
      const target = this._getTargetValue(overlay, 'em-label-target');
      const updated = await getLabelsForTarget(target);
      overlay.querySelector('#em-label-section-title').textContent = sectionTitleFor(target);
      overlay.querySelector('#entity-labels').innerHTML = renderChips(updated);
      overlay.querySelector('#available-labels').innerHTML = renderAvailable(updated);
    };

    // Target selector — re-render when changed
    this._attachTargetSelector(overlay, 'em-label-target');
    overlay.querySelector('#em-label-target')?.addEventListener('click', () => requestAnimationFrame(refreshLabels));

    // Add label
    overlay.querySelector('#available-labels').addEventListener('click', async (e) => {
      const option = e.target.closest('.label-option');
      if (!option) return;
      const labelId = option.dataset.labelId;
      const target = this._getTargetValue(overlay, 'em-label-target');
      const current = await getLabelsForTarget(target);
      if (!current.includes(labelId)) {
        try {
          await this._addLabelToEntity(entityId, labelId, target);
          this._showToast('Label added', 'success');
          await refreshLabels();
        } catch { this._showToast('Error adding label', 'error'); }
      }
    });

    // Remove label chip
    overlay.querySelector('#entity-labels').addEventListener('click', async (e) => {
      const removeBtn = e.target.closest('[data-remove]');
      if (!removeBtn) return;
      const target = this._getTargetValue(overlay, 'em-label-target');
      try {
        await this._removeLabelFromEntity(entityId, removeBtn.dataset.remove, target);
        this._showToast('Label removed', 'success');
        await refreshLabels();
      } catch { this._showToast('Error removing label', 'error'); }
    });

    // Swatch picker
    overlay.querySelector('#new-label-color').addEventListener('click', (e) => {
      const swatch = e.target.closest('.em-label-swatch');
      if (!swatch) return;
      const picker = swatch.closest('.em-label-color-picker');
      picker.querySelectorAll('.em-label-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      picker.dataset.value = swatch.dataset.color;
    });

    // Create label
    overlay.querySelector('#create-label-btn').addEventListener('click', async () => {
      const nameInput = overlay.querySelector('#new-label-name');
      const colorPicker = overlay.querySelector('#new-label-color');
      const name = nameInput.value.trim();
      const color = colorPicker.dataset.value || 'blue';
      if (!name) { this._showToast('Please enter a label name', 'warning'); return; }
      try {
        const newLabel = await this._createLabel(name, color);
        allLabels.push(newLabel);
        nameInput.value = '';
        this._showToast(`Label "${name}" created`, 'success');
        await refreshLabels();
      } catch { this._showToast('Error creating label', 'error'); }
    });

    overlay.querySelector('.confirm-dialog-actions .btn-primary').addEventListener('click', async () => {
      const [afterEntityLabels, afterDeviceLabels] = await Promise.all([
        this._getEntityLabels(entityId),
        deviceId ? this._getDeviceLabels(deviceId) : Promise.resolve([]),
      ]);
      const entityChanged = JSON.stringify([...beforeEntityLabels].sort()) !== JSON.stringify([...afterEntityLabels].sort());
      const deviceChanged = JSON.stringify([...beforeDeviceLabels].sort()) !== JSON.stringify([...afterDeviceLabels].sort());
      if (entityChanged || deviceChanged) {
        this._pushUndoAction({ type: 'labels_change', entityId, deviceId, beforeEntity: beforeEntityLabels, afterEntity: afterEntityLabels, beforeDevice: beforeDeviceLabels, afterDevice: afterDeviceLabels });
      }
      closeDialog();
      this._loadAndDisplayLabels();
    });
  }

  async _showBulkLabelEditor() {
    const allLabels = await this._loadHALabels();
    const entityCount = this.selectedEntities.size;
    
    const { overlay, closeDialog } = this.createDialog({
      title: 'Add Labels to Selected Entities',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="bulk-label-editor">
          <p style="color: var(--em-text-secondary); margin-bottom: 8px;">Add labels to ${entityCount} selected ${entityCount === 1 ? 'entity' : 'entities'}</p>
          ${this._labelTargetSelectorHtml('em-bulk-label-target', 'both', true)}
          <div style="margin-bottom:16px;">
            <div id="em-label-entities-toggle" style="cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--em-text-secondary);padding:4px 0;">
              <span id="em-label-entities-arrow" style="display:inline-flex;transition:transform 0.15s;transform:rotate(-90deg)">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
              Show selected entities
            </div>
            <div id="em-label-entities-body" style="display:none;margin-top:8px;max-height:120px;overflow-y:auto;background:var(--em-bg-secondary);border-radius:6px;padding:8px;">
              ${Array.from(this.selectedEntities).map(id => `
                <div style="font-size: 12px; padding: 2px 4px; font-family: monospace; color: var(--em-text-primary);">${this._escapeHtml(id)}</div>
              `).join('')}
            </div>
          </div>
          <div class="label-selection" id="label-selection" style="max-height: 200px; overflow-y: auto;">
            ${allLabels.length === 0 ? '<p style="color: var(--em-text-secondary);">No labels defined yet.</p>' :
              allLabels.map(label => `
                <label class="label-checkbox">
                  <input type="checkbox" data-label-id="${label.label_id}">
                  <span style="width:20px;height:20px;border-radius:50%;background:${this._labelColorCss(label.color)};display:inline-block;flex-shrink:0;border:1px solid rgba(0,0,0,0.15)"></span>
                  <span>${label.name}</span>
                </label>
              `).join('')}
          </div>
          <div class="create-label" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--em-border);">
            <strong>Create New Label:</strong>
            <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center;">
              <input type="text" id="new-label-name" placeholder="Label name" style="flex: 1; padding: 8px; border: 1px solid var(--em-border); border-radius: 4px; background: var(--em-surface); color: var(--em-text);">
            </div>
            <div class="em-label-color-picker" id="new-label-color" data-value="blue" style="margin-top:8px">
              ${HA_LABEL_COLORS.map(([name, hex]) => `<button class="em-label-swatch${name === 'blue' ? ' selected' : ''}" data-color="${name}" style="background:${hex}" title="${name}"></button>`).join('')}
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:8px">
              <button class="btn btn-secondary" id="create-label-btn">Create</button>
            </div>
          </div>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary confirm-no">Cancel</button>
        <button class="btn btn-primary" id="apply-labels-btn">Apply Labels</button>
      `
    });
    
    // Target selector
    this._attachTargetSelector(overlay, 'em-bulk-label-target');

    // Selected entities toggle
    overlay.querySelector('#em-label-entities-toggle')?.addEventListener('click', () => {
      const body = overlay.querySelector('#em-label-entities-body');
      const arrow = overlay.querySelector('#em-label-entities-arrow');
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : '';
      arrow.style.transform = open ? 'rotate(-90deg)' : '';
    });

    // Swatch picker click handler (bulk dialog)
    overlay.querySelector('#new-label-color').addEventListener('click', (e) => {
      const swatch = e.target.closest('.em-label-swatch');
      if (!swatch) return;
      const picker = swatch.closest('.em-label-color-picker');
      picker.querySelectorAll('.em-label-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      picker.dataset.value = swatch.dataset.color;
    });

    // Handle creating new label in bulk editor
    overlay.querySelector('#create-label-btn').addEventListener('click', async () => {
      const nameInput = overlay.querySelector('#new-label-name');
      const colorPicker = overlay.querySelector('#new-label-color');
      const name = nameInput.value.trim();
      const color = colorPicker.dataset.value || 'blue';

      if (!name) {
        this._showToast('Please enter a label name', 'warning');
        return;
      }

      try {
        const newLabel = await this._createLabel(name, color);
        allLabels.push(newLabel);
        nameInput.value = '';
        this._showToast(`Label "${name}" created`, 'success');
        
        // Refresh label selection list
        const selectionContainer = overlay.querySelector('#label-selection');
        selectionContainer.innerHTML = allLabels.map(label => `
          <label class="label-checkbox" style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 4px; margin: 4px 0;">
            <input type="checkbox" data-label-id="${this._escapeAttr(label.label_id)}">
            <span style="width: 16px; height: 16px; border-radius: 50%; background: ${this._escapeAttr(this._labelColorCss(label.color))}; display: inline-block;"></span>
            <span>${this._escapeHtml(label.name)}</span>
          </label>
        `).join('');
      } catch (e) {
        this._showToast('Error creating label', 'error');
      }
    });
    
    overlay.querySelector('#apply-labels-btn').addEventListener('click', async () => {
      const selectedLabels = Array.from(overlay.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.dataset.labelId);
      const target = this._getTargetValue(overlay, 'em-bulk-label-target');

      if (selectedLabels.length === 0) {
        this._showToast('Select at least one label', 'warning');
        return;
      }

      closeDialog();
      this._showToast(`Adding labels to ${entityCount} entities...`, 'info', 0);

      let successCount = 0;
      for (const entityId of this.selectedEntities) {
        try {
          if (target === 'entity' || target === 'both') {
            const currentLabels = await this._getEntityLabels(entityId);
            const newLabels = [...new Set([...currentLabels, ...selectedLabels])];
            await this._hass.callWS({ type: 'config/entity_registry/update', entity_id: entityId, labels: newLabels });
          }
          if (target === 'device' || target === 'both') {
            const deviceId = await this._getEntityDeviceId(entityId);
            if (deviceId) {
              const devLabels = await this._getDeviceLabels(deviceId);
              const newDevLabels = [...new Set([...devLabels, ...selectedLabels])];
              await this._hass.callWS({ type: 'config/device_registry/update', device_id: deviceId, labels: newDevLabels });
            }
          }
          successCount++;
        } catch (e) {
          console.error('Error adding labels to', entityId, e);
        }
      }

      document.querySelector('.em-toast')?.remove();
      this._showToast(`Added labels to ${successCount} entities`, 'success');
    });
    
    overlay.querySelector('.confirm-no').addEventListener('click', closeDialog);
  }
  
  // ===== ENTITY ALIASES =====
  
  _loadEntityAliases() {
    return this._loadFromStorage('em-entity-aliases', {});
  }

  _saveEntityAliases() {
    this._saveToStorage('em-entity-aliases', this.entityAliases);
  }
  
  _setEntityAlias(entityId, alias) {
    if (alias) {
      this.entityAliases[entityId] = alias;
    } else {
      delete this.entityAliases[entityId];
    }
    this._saveEntityAliases();
  }
  
  async _showBulkLabelRemover() {
    if (!this.selectedEntities?.size) return;
    const entityIds = [...this.selectedEntities];

    // Collect all label IDs present on any selected entity
    const labelPresence = new Map(); // labelId → Set of entityIds that have it
    for (const eid of entityIds) {
      try {
        const current = await this._getEntityLabels(eid);
        for (const lid of current) {
          if (!labelPresence.has(lid)) labelPresence.set(lid, new Set());
          labelPresence.get(lid).add(eid);
        }
      } catch (e) { console.warn('[EM] label cache error', e); }
    }

    const allLabels = await this._loadHALabels();
    const presentLabels = allLabels.filter(l => labelPresence.has(l.label_id));

    const { overlay, closeDialog } = this.createDialog({
      title: 'Remove Labels from Selected',
      color: '#f44336',
      contentHtml: `
        <div class="bulk-label-editor">
          <p style="color:var(--em-text-secondary);margin-bottom:8px">Remove labels from ${entityIds.length} selected ${entityIds.length === 1 ? 'entity' : 'entities'}</p>
          ${presentLabels.length === 0
            ? '<p style="color:var(--em-text-secondary);padding:16px 0">No labels found on selected entities.</p>'
            : `<div style="max-height:220px;overflow-y:auto">
                ${presentLabels.map(l => `
                  <label class="label-checkbox" style="display:flex;align-items:center;gap:8px;padding:8px;cursor:pointer;border-radius:4px;margin:4px 0">
                    <input type="checkbox" data-label-id="${this._escapeAttr(l.label_id)}">
                    <span style="width:16px;height:16px;border-radius:50%;background:${this._labelColorCss(l.color)};display:inline-block;flex-shrink:0"></span>
                    <span>${this._escapeHtml(l.name)}</span>
                    <span style="font-size:10px;opacity:0.5;margin-left:auto">${labelPresence.get(l.label_id).size} entit${labelPresence.get(l.label_id).size !== 1 ? 'ies' : 'y'}</span>
                  </label>`).join('')}
              </div>`
          }
        </div>`,
      actionsHtml: `
        <button class="btn btn-secondary confirm-no">Cancel</button>
        <button class="btn" style="background:var(--em-danger);color:#fff;border:none" id="apply-remove-labels-btn"${presentLabels.length === 0 ? ' disabled' : ''}>Remove Labels</button>`,
    });

    overlay.querySelector('.confirm-no').addEventListener('click', closeDialog);
    overlay.querySelector('#apply-remove-labels-btn')?.addEventListener('click', async () => {
      const toRemove = new Set(
        Array.from(overlay.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.dataset.labelId)
      );
      if (!toRemove.size) { this._showToast('Select at least one label', 'warning'); return; }

      closeDialog();
      this._showToast(`Removing labels from ${entityIds.length} entities…`, 'info', 0);
      let ok = 0;
      for (const eid of entityIds) {
        try {
          const current = await this._getEntityLabels(eid);
          const updated = current.filter(lid => !toRemove.has(lid));
          if (updated.length !== current.length) {
            await this._hass.callWS({ type: 'config/entity_registry/update', entity_id: eid, labels: updated });
            ok++;
          }
        } catch (e) { console.warn('[EM] label remove error', e); }
      }
      document.querySelector('.em-toast')?.remove();
      this._showToast(`Labels removed from ${ok} entit${ok !== 1 ? 'ies' : 'y'}`, 'success');
    });
  }

  _showAliasEditor(entityId) {
    const currentAlias = this.entityAliases[entityId] || '';
    
    const { overlay, closeDialog } = this.createDialog({
      title: 'Set Entity Alias',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="alias-editor">
          <p style="color: var(--em-text-secondary); margin-bottom: 8px;">Entity: ${entityId}</p>
          <input type="text" id="alias-input" class="rename-input" 
            value="${currentAlias}" placeholder="Enter a friendly alias...">
          <p style="color: var(--em-text-secondary); font-size: 12px; margin-top: 8px;">
            Leave empty to use default name
          </p>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary cancel-btn">Cancel</button>
        <button class="btn btn-primary save-btn">Save</button>
      `
    });
    
    overlay.querySelector('.cancel-btn').addEventListener('click', closeDialog);
    overlay.querySelector('.save-btn').addEventListener('click', () => {
      const alias = overlay.querySelector('#alias-input').value.trim();
      this._setEntityAlias(entityId, alias);
      closeDialog();
      this.updateView();
      this._showToast(alias ? 'Alias set' : 'Alias removed', 'success');
    });
  }
  
  // ===== DRAG AND DROP =====
  
  _loadEntityOrder() {
    return this._loadFromStorage('em-entity-order', {});
  }

  _saveEntityOrder() {
    this._saveToStorage('em-entity-order', this.entityOrder);
  }
  
  _initDragDrop(entityItem) {
    if (!this.dragDropEnabled) return;
    
    entityItem.setAttribute('draggable', 'true');
    
    entityItem.addEventListener('dragstart', (e) => {
      this.draggedEntity = entityItem.dataset.entityId;
      entityItem.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.draggedEntity);
    });
    
    entityItem.addEventListener('dragend', () => {
      entityItem.classList.remove('dragging');
      this.draggedEntity = null;
      this.dragOverEntity = null;
      
      // Remove all drag-over classes
      this.content.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
      });
    });
    
    entityItem.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!this.draggedEntity || this.draggedEntity === entityItem.dataset.entityId) return;
      
      e.dataTransfer.dropEffect = 'move';
      
      const rect = entityItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      // Remove previous drag-over states
      this.content.querySelectorAll('.drag-over').forEach(el => {
        if (el !== entityItem) {
          el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        }
      });
      
      entityItem.classList.add('drag-over');
      if (e.clientY < midY) {
        entityItem.classList.add('drag-over-top');
        entityItem.classList.remove('drag-over-bottom');
      } else {
        entityItem.classList.add('drag-over-bottom');
        entityItem.classList.remove('drag-over-top');
      }
    });
    
    entityItem.addEventListener('dragleave', () => {
      entityItem.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    });
    
    entityItem.addEventListener('drop', (e) => {
      e.preventDefault();
      entityItem.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
      
      if (!this.draggedEntity || this.draggedEntity === entityItem.dataset.entityId) return;
      
      const targetId = entityItem.dataset.entityId;
      const integrationEl = entityItem.closest('.entity-list');
      const integrationId = integrationEl?.dataset.integration;
      
      if (!integrationId) return;
      
      // Get current order or create new one
      if (!this.entityOrder[integrationId]) {
        this.entityOrder[integrationId] = [];
      }
      
      // Determine position
      const rect = entityItem.getBoundingClientRect();
      const insertBefore = e.clientY < rect.top + rect.height / 2;
      
      // Update order
      const order = this.entityOrder[integrationId];
      const draggedIdx = order.indexOf(this.draggedEntity);
      const targetIdx = order.indexOf(targetId);
      
      // Remove dragged from current position if exists
      if (draggedIdx > -1) {
        order.splice(draggedIdx, 1);
      }
      
      // Find new target index (may have shifted)
      let newTargetIdx = order.indexOf(targetId);
      if (newTargetIdx === -1) {
        // Target not in order yet, add it
        order.push(targetId);
        newTargetIdx = order.length - 1;
      }
      
      // Insert at correct position
      const insertIdx = insertBefore ? newTargetIdx : newTargetIdx + 1;
      order.splice(insertIdx, 0, this.draggedEntity);
      
      this._saveEntityOrder();
      this._showToast('Entity order updated', 'success');
      this.updateView();
    });
  }
  
  _attachDragDropListeners() {
    if (!this.dragDropEnabled) return;
    
    this.content.querySelectorAll('.entity-item').forEach(item => {
      this._initDragDrop(item);
    });
  }
  
  // ===== GROUPS =====

  _setSmartGroupMode(mode) {
    this.smartGroupMode = mode;
    localStorage.setItem('em-smart-group-mode', mode);
    if (mode === 'floor' && !this.floorsData) {
      // Fetch floor/area data then re-render
      this._hass.callWS({ type: 'entity_manager/get_areas_and_floors' }).then(data => {
        this.floorsData = data;
        this.updateView();
      }).catch(() => {
        this.floorsData = { floors: [], areas: [] };
        this.updateView();
      });
    } else {
      this.updateView();
    }
  }
  
  _getSmartGroups() {

    const groups = {};
    
    (this.data || []).forEach(integration => {
      Object.entries(integration.devices).forEach(([deviceId, device]) => {
        device.entities.forEach(entity => {
          let groupKey;
          
          switch (this.smartGroupMode) {
            case 'room':
              // Group by area/room if available
              const deviceInfo = this.deviceInfo[deviceId];
              groupKey = deviceInfo?.area_id || 'Unassigned';
              break;
            case 'type':
              // Group by entity domain
              groupKey = entity.entity_id.split('.')[0];
              break;
            case 'floor': {
              // Group by floor → area. Use floorsData cache; fall back to area name or "No Area"
              const fDevInfo = this.deviceInfo[deviceId];
              const areaId = fDevInfo?.area_id || null;
              if (!areaId) { groupKey = 'No Floor / No Area'; break; }
              const areaObj = (this.floorsData?.areas || []).find(a => a.area_id === areaId);
              const areaName = areaObj?.name || areaId;
              const floorId = areaObj?.floor_id;
              if (floorId) {
                const floorObj = (this.floorsData?.floors || []).find(f => f.floor_id === floorId);
                groupKey = `${floorObj?.name || floorId} › ${areaName}`;
              } else {
                groupKey = `No Floor › ${areaName}`;
              }
              break;
            }
            case 'device-name': {
              // Filter by device name keyword, then group by device name
              const devName = (this.getDeviceName(deviceId) || '').toLowerCase();
              const keyword = (this.deviceNameFilter || '').toLowerCase().trim();
              if (keyword && !this._fuzzyMatch(devName, keyword)) return; // skip non-matching
              groupKey = this.getDeviceName(deviceId) || 'Unknown Device';
              break;
            }
            case 'custom': {
              // Find the first custom group that contains this entity
              const cg = (this.customGroups || []).find(g => g.entityIds.includes(entity.entity_id));
              groupKey = cg ? cg.name : '📦 Ungrouped';
              break;
            }
            default: // integration
              groupKey = integration.integration;
          }
          
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push({
            ...entity,
            integration: integration.integration,
            deviceId,
            deviceName: this.getDeviceName(deviceId)
          });
        });
      });
    });
    
    return groups;
  }
  
  // ===== AUTOMATION IMPACT ANALYSIS =====
  
  async _analyzeAutomationImpact(entityId) {
    this._showToast('Analyzing automations...', 'info', 2000);
    
    try {
      // Get all automations
      const automations = Object.entries(this._hass.states)
        .filter(([id]) => id.startsWith('automation.'))
        .map(([id, state]) => ({ id, ...state }));
      
      // Get all scripts
      const scripts = Object.entries(this._hass.states)
        .filter(([id]) => id.startsWith('script.'))
        .map(([id, state]) => ({ id, ...state }));
      
      // Get automation configs (if available via API)
      const impactedAutomations = [];
      const impactedScripts = [];
      
      // Simple text search in automation/script names and entity IDs
      for (const auto of automations) {
        if (auto.attributes?.friendly_name?.toLowerCase().includes(entityId.split('.')[1]) ||
            auto.id.includes(entityId.split('.')[1])) {
          impactedAutomations.push(auto);
        }
      }
      
      for (const script of scripts) {
        if (script.attributes?.friendly_name?.toLowerCase().includes(entityId.split('.')[1]) ||
            script.id.includes(entityId.split('.')[1])) {
          impactedScripts.push(script);
        }
      }
      
      const { overlay, closeDialog } = this.createDialog({
        title: 'Automation Impact Analysis',
        color: 'var(--em-warning)',
        contentHtml: `
          <div class="impact-analysis">
            <p style="margin-bottom: 12px;"><strong>Entity:</strong> ${entityId}</p>
            
            <div class="impact-section">
              <h4>Potentially Affected Automations (${impactedAutomations.length})</h4>
              ${impactedAutomations.length === 0 ? '<p style="color: var(--em-text-secondary);">None found</p>' : ''}
              ${impactedAutomations.map(a => `
                <div class="impact-item">
                  <span class="impact-name">${a.attributes?.friendly_name || a.id}</span>
                  <span class="impact-state ${a.state}">${a.state}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="impact-section">
              <h4>Potentially Affected Scripts (${impactedScripts.length})</h4>
              ${impactedScripts.length === 0 ? '<p style="color: var(--em-text-secondary);">None found</p>' : ''}
              ${impactedScripts.map(s => `
                <div class="impact-item">
                  <span class="impact-name">${s.attributes?.friendly_name || s.id}</span>
                </div>
              `).join('')}
            </div>
            
            <p style="margin-top: 16px; color: var(--em-text-secondary); font-size: 12px;">
              Note: This is a basic analysis. Check your automation YAML for complete impact.
            </p>
          </div>
        `,
        actionsHtml: `<button class="btn btn-primary">Close</button>`
      });
      
      overlay.querySelector('.btn-primary').addEventListener('click', closeDialog);
    } catch (e) {
      this._showToast('Error analyzing impact', 'error');
      console.error('Impact analysis error:', e);
    }
  }
  
  // ===== ENTITY DEPENDENCIES =====
  
  _showEntityDependencies(entityId) {
    const entity = this._findEntityById(entityId);
    const state = this._hass.states[entityId];
    
    // Find related entities
    const domain = entityId.split('.')[0];
    const name = entityId.split('.')[1];
    
    const relatedEntities = Object.keys(this._hass.states).filter(id => {
      if (id === entityId) return false;
      // Same device
      const device = this._getDeviceForEntity(entityId);
      const otherDevice = this._getDeviceForEntity(id);
      return device && otherDevice && device === otherDevice;
    });
    
    const { overlay, closeDialog } = this.createDialog({
      title: 'Entity Dependencies',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="dependencies-view">
          <div class="dep-section">
            <h4>Entity Details</h4>
            <p><strong>ID:</strong> ${entityId}</p>
            <p><strong>Domain:</strong> ${domain}</p>
            <p><strong>State:</strong> ${state?.state || 'unknown'}</p>
          </div>
          
          <div class="dep-section">
            <h4>Same Device Entities (${relatedEntities.length})</h4>
            <div class="dep-list">
              ${relatedEntities.slice(0, 20).map(id => `
                <div class="dep-item">
                  <span>${id}</span>
                  <span class="dep-state">${this._hass.states[id]?.state || 'N/A'}</span>
                </div>
              `).join('')}
              ${relatedEntities.length > 20 ? `<p>...and ${relatedEntities.length - 20} more</p>` : ''}
              ${relatedEntities.length === 0 ? '<p style="color: var(--em-text-secondary);">No related entities</p>' : ''}
            </div>
          </div>
        </div>
      `,
      actionsHtml: `<button class="btn btn-primary">Close</button>`
    });
    
    overlay.querySelector('.btn-primary').addEventListener('click', closeDialog);
  }
  
  _getDeviceForEntity(entityId) {
    for (const integration of (this.data || [])) {
      for (const [deviceId, device] of Object.entries(integration.devices)) {
        if (device.entities.some(e => e.entity_id === entityId)) {
          return deviceId;
        }
      }
    }
    return null;
  }
  
  // ===== EXPORT ENTITY CONFIG =====

  async _exportEntityConfig() {
    try {
      // Fetch authoritative entity list from backend (all entities, not just filtered view)
      const entities = await this._hass.callWS({ type: 'entity_manager/export_states' });
      const config = {
        version: 2,
        exportDate: new Date().toISOString(),
        haUrl: window.location.origin,
        entities,
        favorites: [...this.favorites],
        aliases: this.entityAliases,
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `entity-manager-${new Date().toISOString().slice(0, 10)}.json`,
      });
      a.click();
      URL.revokeObjectURL(a.href);
      this._showToast(`Exported ${entities.length} entities`, 'success');
    } catch (err) {
      this._showToast('Export failed: ' + (err.message || err), 'error');
      console.warn('[EM] Export failed', err);
    }
  }

  _importEntityConfig() {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json' });
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const config = JSON.parse(await file.text());
        if (config.version !== 1 && config.version !== 2) {
          this._showToast('Unsupported config version', 'error');
          return;
        }

        // ── EM-local data (favorites, aliases) ───────────────────────────
        let localMsg = '';
        if (config.favorites?.length) {
          config.favorites.forEach(f => this.favorites.add(f));
          this._saveFavorites();
          localMsg += ` ${config.favorites.length} favorites,`;
        }
        if (config.aliases && Object.keys(config.aliases).length) {
          Object.assign(this.entityAliases, config.aliases);
          this._saveEntityAliases();
          localMsg += ` ${Object.keys(config.aliases).length} aliases,`;
        }

        // ── Entity enable/disable states ─────────────────────────────────
        const entities = config.entities;
        if (!entities?.length) {
          if (localMsg) {
            this._showToast(`Imported:${localMsg.replace(/,$/, '')}`, 'success');
            this.updateView();
          } else {
            this._showToast('Nothing to import', 'info');
          }
          return;
        }

        const toApply = entities.filter(({ entity_id, is_disabled }) => {
          const current = this._findEntityById(entity_id);
          // Only apply entries that differ from current state (skip unknowns)
          return current && Boolean(current.is_disabled) !== Boolean(is_disabled);
        });

        if (!confirm(`Apply ${toApply.length} enable/disable changes from this export?\n\n` +
                     `(${entities.length - toApply.length} already match current state)`)) return;

        const result = await this._hass.callWS({
          type: 'entity_manager/import_entity_states',
          entities: toApply.map(({ entity_id, is_disabled }) => ({ entity_id, is_disabled: Boolean(is_disabled) })),
        });

        const summary = `Applied ${result.success} changes` +
          (result.failed ? `, ${result.failed} failed` : '') +
          (localMsg ? `;${localMsg.replace(/,$/, '')}` : '');
        this._showToast(summary, result.failed ? 'warning' : 'success');
        this.loadData();
      } catch (err) {
        this._showToast('Import failed: ' + (err.message || err), 'error');
        console.warn('[EM] Import failed', err);
      }
    };
    input.click();
  }
  
  // ===== ENTITY STATISTICS =====
  
  _showEntityStatistics(entityId) {
    const state = this._hass.states[entityId];
    const entity = this._findEntityById(entityId);
    
    const lastChanged = state?.last_changed ? new Date(state.last_changed) : null;
    const lastUpdated = state?.last_updated ? new Date(state.last_updated) : null;
    const now = new Date();
    
    const timeSinceChange = lastChanged ? this._formatTimeDiff(now - lastChanged) : 'Unknown';
    const timeSinceUpdate = lastUpdated ? this._formatTimeDiff(now - lastUpdated) : 'Unknown';
    
    const attributes = state?.attributes || {};
    
    const { overlay, closeDialog } = this.createDialog({
      title: 'Entity Statistics',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="entity-stats-view">
          <div class="stat-row">
            <span class="stat-label">Entity ID</span>
            <span class="stat-value">${entityId}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Current State</span>
            <span class="stat-value">${state?.state || 'unknown'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Last Changed</span>
            <span class="stat-value">${timeSinceChange} ago</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Last Updated</span>
            <span class="stat-value">${timeSinceUpdate} ago</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Status</span>
            <span class="stat-value">${entity?.is_disabled ? 'Disabled' : 'Enabled'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Attributes</span>
            <span class="stat-value">${Object.keys(attributes).length}</span>
          </div>
          
          <h4 style="margin-top: 16px;">Attributes</h4>
          <div class="attributes-list">
            ${Object.entries(attributes).slice(0, 15).map(([key, val]) => `
              <div class="attr-row">
                <span class="attr-key">${key}</span>
                <span class="attr-val">${typeof val === 'object' ? JSON.stringify(val) : val}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      actionsHtml: `<button class="btn btn-primary">Close</button>`
    });
    
    overlay.querySelector('.btn-primary').addEventListener('click', closeDialog);
  }
  
  _formatTimeDiff(ms) {
    if (ms == null || isNaN(ms)) return '?';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    if (weeks < 8) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    const months = Math.floor(days / 30);
    if (months < 24) return `${months} month${months !== 1 ? 's' : ''}`;
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  // ===== STATE HISTORY =====
  
  async _showStateHistory(entityId) {
    this._showToast('Loading history...', 'info', 2000);
    
    try {
      // Get history for last 24 hours
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
      
      const response = await this._hass.callApi(
        'GET',
        `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`
      );
      
      const history = response?.[0] || [];
      
      const { overlay, closeDialog } = this.createDialog({
        title: 'State History (24h)',
        color: 'var(--em-primary)',
        contentHtml: `
          <div class="state-history-view">
            <p style="margin-bottom: 12px;"><strong>Entity:</strong> ${entityId}</p>
            <div class="history-list" style="max-height: 400px; overflow-y: auto;">
              ${history.length === 0 ? '<p style="color: var(--em-text-secondary);">No history available</p>' : ''}
              ${history.slice().reverse().slice(0, 50).map(entry => `
                <div class="history-item">
                  <span class="history-state">${entry.state}</span>
                  <span class="history-time">${new Date(entry.last_changed).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `,
        actionsHtml: `<button class="btn btn-primary">Close</button>`
      });
      
      overlay.querySelector('.btn-primary').addEventListener('click', closeDialog);
    } catch (e) {
      this._showToast('Error loading history', 'error');
      console.error('History error:', e);
    }
  }
  
  // ===== BATCH PREVIEW =====
  
  _showBatchPreview(action, entityIds) {
    const entities = entityIds.map(id => ({
      id,
      name: this._findEntityById(id)?.original_name || id,
      state: this._hass.states[id]?.state || 'unknown',
      isDisabled: this._findEntityById(id)?.is_disabled
    }));
    
    const { overlay, closeDialog } = this.createDialog({
      title: `Preview: ${action === 'enable' ? 'Enable' : 'Disable'} ${entities.length} Entities`,
      color: action === 'enable' ? 'var(--em-success)' : 'var(--em-danger)',
      contentHtml: `
        <div class="batch-preview">
          <p style="margin-bottom: 12px;">The following entities will be ${action}d:</p>
          <div class="batch-list" style="max-height: 300px; overflow-y: auto;">
            ${entities.map(e => `
              <div class="batch-item">
                <span class="batch-name">${e.name || e.id}</span>
                <span class="batch-id">${e.id}</span>
                <span class="batch-state">${e.state}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary cancel-btn">Cancel</button>
        <button class="btn ${action === 'enable' ? 'btn-success' : 'btn-danger'} confirm-btn">
          ${action === 'enable' ? 'Enable' : 'Disable'} All
        </button>
      `
    });
    
    return new Promise(resolve => {
      overlay.querySelector('.cancel-btn').addEventListener('click', () => {
        closeDialog();
        resolve(false);
      });
      overlay.querySelector('.confirm-btn').addEventListener('click', () => {
        closeDialog();
        resolve(true);
      });
    });
  }

  // ===== SIDEBAR =====
  
  _toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('em-sidebar-collapsed', this.sidebarCollapsed);
    
    const sidebar = this.querySelector('.em-sidebar');
    const mainContent = this.querySelector('#main-content');
    
    if (sidebar) {
      sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    }
    if (mainContent) {
      mainContent.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
    }
  }
  
  _renderSidebar() {
    // Group integrations for quick nav (handle case when data not loaded yet)
    const integrationList = (this.data || []).map(int => ({
      name: int.integration,
      count: Object.values(int.devices).reduce((sum, d) => sum + d.entities.length, 0)
    })).sort((a, b) => b.count - a.count);
    
    return `
      <div class="em-sidebar ${this.sidebarCollapsed ? 'collapsed' : ''}">
        <div class="sidebar-header">
          <span class="sidebar-title">Navigation</span>
          <button class="sidebar-toggle" id="sidebar-toggle-btn">◀</button>
        </div>
        
        <div class="sidebar-section ${this.sidebarOpenSections.has('actions') ? '' : 'section-collapsed'}">
          <div class="sidebar-section-title" data-section-id="actions">Actions<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          <div class="sidebar-item" data-action="activity-timeline">
            <span class="icon">🕐</span>
            <span class="label">Last Activity</span>
          </div>
          <div class="sidebar-item" data-action="activity-log">
            <span class="icon">📋</span>
            <span class="label">Activity Log</span>
            ${(() => {
              const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
              const count = Object.values(this._hass?.states || {})
                .filter(s => new Date(s.last_changed).getTime() > dayAgo).length;
              return count > 0 ? `<span class="sidebar-count-badge">${count}</span>` : '';
            })()}
          </div>
          <div class="sidebar-item" data-action="columns">
            <span class="icon">⚙️</span>
            <span class="label">Columns</span>
          </div>
          <div class="sidebar-item" data-filter="favorites">
            <span class="icon">★</span>
            <span class="label">Favorites</span>
            <span class="count" id="favorites-count">${this.favorites.size}</span>
          </div>
          <div id="em-selection-group" class="${this.selectedEntities.size > 0 ? 'has-selection' : ''}">
            <div class="sidebar-item" data-action="enable-selected" style="${this.selectedEntities.size === 0 ? 'opacity:0.4;pointer-events:none' : ''}">
              <span class="icon">✓</span>
              <span class="label">Enable Selected</span>
              <span class="count${this.selectedEntities.size > 0 ? ' em-sel-active' : ''}" id="sidebar-selected-count">${this.selectedEntities.size || ''}</span>
            </div>
            <div class="sidebar-item" data-action="disable-selected" style="${this.selectedEntities.size === 0 ? 'opacity:0.4;pointer-events:none' : ''}">
              <span class="icon">✕</span>
              <span class="label">Disable Selected</span>
            </div>
            <div class="sidebar-item" data-action="assign-area-selected" style="${this.selectedEntities.size === 0 ? 'opacity:0.4;pointer-events:none' : ''}">
              <span class="icon">📍</span>
              <span class="label">Area Assignments</span>
            </div>
            <div class="sidebar-item" data-action="view-selected" style="${this.selectedEntities.size === 0 ? 'opacity:0.4;pointer-events:none' : ''}">
              <span class="icon">👁</span>
              <span class="label">View Selected</span>
            </div>
            <div class="sidebar-item" data-action="deselect-all" style="${this.selectedEntities.size === 0 ? 'opacity:0.4;pointer-events:none' : ''}">
              <span class="icon">☐</span>
              <span class="label">Deselect All</span>
            </div>
            <div class="sidebar-item" data-action="bulk-rename">
              <span class="icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </span>
              <span class="label">Bulk Rename</span>
            </div>
          </div>
          <div class="sidebar-item" data-action="history" id="history-btn" ${(this.undoStack.length === 0 && this.redoStack.length === 0) ? 'style="opacity:0.5"' : ''}>
            <span class="icon">↺</span>
            <span class="label">History</span>
            ${this.undoStack.length > 0 ? `<span class="count">${this.undoStack.length}</span>` : ''}
          </div>
          <div class="sidebar-item" data-action="naming-improvements">
            <span class="icon">✏️</span>
            <span class="label">Naming Improvements</span>
          </div>
          <div class="sidebar-item" data-action="label-suggestions">
            <span class="icon">🏷️</span>
            <span class="label">Label Suggestions</span>
          </div>
          <div class="sidebar-item" data-action="naming-improvements">
            <span class="icon">✏️</span>
            <span class="label">Naming Improvements</span>
          </div>
          <div class="sidebar-item" data-action="label-suggestions">
            <span class="icon">🏷️</span>
            <span class="label">Label Suggestions</span>
          </div>
          <div class="sidebar-item" data-action="refresh">
            <span class="icon">↺</span>
            <span class="label">Refresh</span>
          </div>
          <div class="sidebar-item" data-action="import">
            <span class="icon">📥</span>
            <span class="label">Import Config</span>
          </div>
          <div class="sidebar-item" data-action="export">
            <span class="icon">📤</span>
            <span class="label">Export Config</span>
          </div>
        </div>
        
        <div class="sidebar-section ${this.sidebarOpenSections.has('labels') ? '' : 'section-collapsed'}" id="labels-section">
          <div class="sidebar-section-title" data-section-id="labels">Labels<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          ${this.selectedLabelFilter ? `
            <div class="sidebar-item active" data-action="clear-label-filter">
              <span class="icon">✕</span>
              <span class="label">Show All</span>
            </div>
          ` : ''}
          <div id="labels-list">
            <div class="sidebar-item" style="opacity: 0.5;">
              <span class="icon">⏳</span>
              <span class="label">Loading labels...</span>
            </div>
          </div>
        </div>
        
        <div class="sidebar-section ${this.sidebarOpenSections.has('smart-groups') ? '' : 'section-collapsed'}">
          <div class="sidebar-section-title" data-section-id="smart-groups">Groups<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          <div class="sidebar-item ${this.smartGroupMode === 'integration' ? 'active' : ''}" data-group-mode="integration">
            <span class="icon">🔌</span>
            <span class="label">By Integration</span>
          </div>
          <div class="sidebar-item ${this.smartGroupMode === 'room' ? 'active' : ''}" data-group-mode="room">
            <span class="icon">🏠</span>
            <span class="label">By Area</span>
          </div>
          <div class="sidebar-item ${this.smartGroupMode === 'type' ? 'active' : ''}" data-group-mode="type">
            <span class="icon">📂</span>
            <span class="label">By Type</span>
          </div>
          <div class="sidebar-item ${this.smartGroupMode === 'floor' ? 'active' : ''}" data-group-mode="floor">
            <span class="icon">🏢</span>
            <span class="label">By Floor</span>
          </div>
          <div class="sidebar-item ${this.smartGroupMode === 'device-name' ? 'active' : ''}" data-group-mode="device-name">
            <span class="icon">🔍</span>
            <span class="label">By Device Name</span>
          </div>
          ${(this.customGroups || []).map(cg => `
            <div class="sidebar-item em-custom-group-sidebar-item ${this.smartGroupMode === 'custom' ? 'active' : ''}"
                 data-group-mode="custom" data-cg-id="${this._escapeAttr(cg.id)}" style="padding-left:14px">
              <span class="icon" style="font-size:13px">⊞</span>
              <span class="label" style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                    title="${this._escapeAttr(cg.name)}">${this._escapeHtml(cg.name)}
                <span style="opacity:0.5;font-size:10px;margin-left:3px">(${cg.entityIds.length})</span>
              </span>
              <button class="em-custom-group-edit-btn" data-cg-id="${this._escapeAttr(cg.id)}"
                title="Edit group" style="background:none;border:none;cursor:pointer;color:var(--em-text-secondary);font-size:14px;padding:2px 4px;line-height:1">✎</button>
              <button class="em-custom-group-delete-btn" data-cg-id="${this._escapeAttr(cg.id)}"
                title="Delete group" style="background:none;border:none;cursor:pointer;color:var(--em-danger);font-size:14px;padding:2px 4px;line-height:1">✕</button>
            </div>`).join('')}
          <div style="padding:4px 8px 6px">
            <button class="em-new-custom-group-btn" data-action="new-custom-group"
              style="background:var(--em-primary);color:#fff;border:none;border-radius:6px;
                     padding:5px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px">
              ＋ New Group
            </button>
          </div>
            ${this.smartGroupMode === 'device-name' ? `
              <div style="padding:6px 8px 4px">
                <div style="display:flex;gap:4px">
                  <input id="em-device-name-filter-input" type="text" placeholder="e.g. Shelly"
                    value="${this._escapeAttr(this.deviceNameFilter)}"
                    style="flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:1px solid var(--em-border);
                           background:var(--em-bg-primary);color:var(--em-text-primary);font-size:12px">
                  <button id="em-device-filter-save" title="Save as quick filter"
                    style="padding:6px 8px;border-radius:6px;border:1px solid var(--em-border);
                           background:var(--em-bg-hover);color:var(--em-text-primary);cursor:pointer;font-size:13px">＋</button>
                </div>
                ${this.savedDeviceFilters.length > 0 ? `
                  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
                    ${this.savedDeviceFilters.map((f, i) => `
                      <span class="em-device-filter-chip ${this.deviceNameFilter === f.pattern ? 'active' : ''}"
                        data-filter-pattern="${this._escapeAttr(f.pattern)}"
                        style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:12px;
                               font-size:11px;cursor:pointer;border:1px solid var(--em-border);
                               background:${this.deviceNameFilter === f.pattern ? 'var(--em-primary)' : 'var(--em-bg-hover)'};
                               color:${this.deviceNameFilter === f.pattern ? 'white' : 'var(--em-text-primary)'}">
                        ${this._escapeHtml(f.label)}
                        <button data-filter-remove="${i}"
                          style="background:none;border:none;cursor:pointer;color:inherit;padding:0;font-size:11px;line-height:1;opacity:0.7">✕</button>
                      </span>`).join('')}
                  </div>` : ''}
              </div>` : ''}
        </div>

        <div class="sidebar-section ${this.sidebarOpenSections.has('views') ? '' : 'section-collapsed'}">
          <div class="sidebar-section-title" data-section-id="views">Saved Views<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          <div class="sidebar-item" data-action="save-preset" title="Save current filters as a named view">
            <span class="icon">＋</span>
            <span class="label">Save current view</span>
          </div>
          ${this.filterPresets.length === 0 ? '' : this.filterPresets.map(p => `
            <div class="sidebar-item" data-preset-id="${p.id}" title="Apply: ${this._escapeHtml(p.name)}">
              <span class="icon">🔖</span>
              <span class="label">${this._escapeHtml(p.name)}</span>
              <button class="preset-delete" data-delete="${p.id}" title="Delete view" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--em-text-secondary);padding:2px 4px;font-size:13px">✕</button>
            </div>`).join('')}
        </div>

        <div class="sidebar-section ${this.sidebarOpenSections.has('presets') ? '' : 'section-collapsed'}">
          <div class="sidebar-section-title" data-section-id="presets">Presets<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          ${(() => {
            const presets = this._loadFromStorage('em-presets', []);
            const hasSel = this.selectedEntities?.size > 0;
            const saveBtn = `
              <div class="sidebar-item ${hasSel ? '' : 'disabled'}" data-action="save-entity-preset" title="${hasSel ? 'Save selected entities as a preset' : 'Select entities first'}">
                <span class="icon">＋</span>
                <span class="label" style="opacity:${hasSel ? 1 : 0.4}">Save selection as preset</span>
              </div>`;
            if (!presets.length) return saveBtn;
            const rows = presets.map(p => `
              <div class="sidebar-item em-preset-row" style="flex-wrap:wrap;gap:4px;padding:6px 8px" data-ep-id="${this._escapeAttr(p.id)}">
                <span class="label" style="flex:1;font-size:12px" title="${p.entityIds.length} entities">${this._escapeHtml(p.name)}</span>
                <span style="font-size:10px;opacity:0.5;flex-shrink:0">${p.entityIds.length}</span>
                <div style="display:flex;gap:3px;flex-basis:100%">
                  <button class="btn em-preset-enable" data-ep-id="${this._escapeAttr(p.id)}" style="flex:1;font-size:10px;padding:2px 0;background:var(--em-success);color:#fff;border:none;border-radius:3px">Enable</button>
                  <button class="btn em-preset-disable" data-ep-id="${this._escapeAttr(p.id)}" style="flex:1;font-size:10px;padding:2px 0;background:var(--em-danger);color:#fff;border:none;border-radius:3px">Disable</button>
                  <button class="btn em-preset-rename-btn" data-ep-id="${this._escapeAttr(p.id)}" style="font-size:10px;padding:2px 6px;background:transparent;border:1px solid var(--divider-color);border-radius:3px" title="Rename">✎</button>
                  <button class="btn em-preset-delete" data-ep-id="${this._escapeAttr(p.id)}" style="font-size:10px;padding:2px 6px;background:transparent;border:1px solid var(--divider-color);border-radius:3px;color:var(--em-danger)" title="Delete">✕</button>
                </div>
              </div>`).join('');
            return saveBtn + rows;
          })()}
        </div>

        <div class="sidebar-section ${this.sidebarOpenSections.has('integrations') ? '' : 'section-collapsed'}">
          <div class="sidebar-section-title" data-section-id="integrations">Integrations<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          ${this.selectedIntegrationFilter ? `
            <div class="sidebar-item active" data-action="clear-integration-filter">
              <span class="icon">✕</span>
              <span class="label">Show All Integrations</span>
            </div>
          ` : ''}
          ${integrationList.length === 0 ? `
            <div class="sidebar-item" style="opacity: 0.5;">
              <span class="icon">⏳</span>
              <span class="label">Loading...</span>
            </div>
          ` : ''}
          ${(this.showAllSidebarIntegrations ? integrationList : integrationList.slice(0, 10)).map(int => `
            <div class="sidebar-item ${this.selectedIntegrationFilter === int.name ? 'active' : ''}" data-integration="${int.name}">
              <img class="sidebar-icon" src="${this._brandIconUrl(int.name)}"
                   onerror="this.style.display='none'" alt="">
              <span class="label">${int.name}</span>
              <span class="count">${int.count}</span>
            </div>
          `).join('')}
          ${!this.showAllSidebarIntegrations && integrationList.length > 10 ? `<div class="sidebar-item more" data-action="show-all-integrations">+${integrationList.length - 10} more...</div>` : ''}
          ${this.showAllSidebarIntegrations && integrationList.length > 10 ? `<div class="sidebar-item" data-action="collapse-integrations"><span class="icon">▲</span><span class="label">Show less</span></div>` : ''}
        </div>
        
        <div class="sidebar-section ${this.sidebarOpenSections.has('help') ? '' : 'section-collapsed'}">
          <div class="sidebar-section-title" data-section-id="help">Help<svg class="em-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
          <div class="sidebar-item" data-action="help-guide">
            <span class="icon">❓</span>
            <span class="label">Help Guide</span>
          </div>

        </div>
      </div>
    `;
  }
  
  
  // ===== DISABLE SELECTED ENTITIES =====
  
  async _disableSelectedEntities() {
    if (this.selectedEntities.size === 0) return;
    
    const count = this.selectedEntities.size;
    
    this.showConfirmDialog(
      'Disable Selected Entities',
      `Are you sure you want to disable ${count} selected entities?`,
      async () => {
        this._showToast(`Disabling ${count} entities...`, 'info', 0);
        
        // Group entities by integration (domain prefix)
        const entitiesByIntegration = {};
        for (const entityId of this.selectedEntities) {
          const domain = entityId.split('.')[0];
          if (!entitiesByIntegration[domain]) {
            entitiesByIntegration[domain] = [];
          }
          entitiesByIntegration[domain].push(entityId);
        }
        
        let successCount = 0;
        
        // Process integrations one at a time, but devices/entities within each in parallel
        for (const [domain, entities] of Object.entries(entitiesByIntegration)) {
          const results = await Promise.allSettled(
            entities.map(entityId => this.disableEntity(entityId))
          );
          successCount += results.filter(r => r.status === 'fulfilled').length;
        }
        
        document.querySelector('.em-toast')?.remove();
        this._showToast(`Disabled ${successCount} entities`, 'success');
        
        this.selectedEntities.clear();
        await this.loadData();
      }
    );
  }

  async _bulkEnableSelected() {
    if (this.selectedEntities.size === 0) return;
    
    const count = this.selectedEntities.size;
    
    this.showConfirmDialog(
      'Enable Selected Entities',
      `Are you sure you want to enable ${count} selected entities?`,
      async () => {
        this._showToast(`Enabling ${count} entities...`, 'info', 0);
        
        // Group entities by integration (domain prefix)
        const entitiesByIntegration = {};
        for (const entityId of this.selectedEntities) {
          const domain = entityId.split('.')[0];
          if (!entitiesByIntegration[domain]) {
            entitiesByIntegration[domain] = [];
          }
          entitiesByIntegration[domain].push(entityId);
        }
        
        let successCount = 0;
        
        // Process integrations one at a time, but devices/entities within each in parallel
        for (const [domain, entities] of Object.entries(entitiesByIntegration)) {
          const results = await Promise.allSettled(
            entities.map(entityId => this.enableEntity(entityId))
          );
          successCount += results.filter(r => r.status === 'fulfilled').length;
        }
        
        document.querySelector('.em-toast')?.remove();
        this._showToast(`Enabled ${successCount} entities`, 'success');
        
        this.selectedEntities.clear();
        await this.loadData();
      }
    );
  }

  set hass(hass) {
    this._hass = hass;

    // ── Sync toggle button / card border to live entity state ──
    if (this.content) {
      this.content.querySelectorAll('.toggle-entity').forEach(btn => {
        const entityId = btn.dataset.entityId;
        const st = hass.states?.[entityId]?.state;
        const on = st === 'on' || st === 'open' || st === 'unlocked'
          || st === 'playing' || st === 'cleaning';
        btn.classList.toggle('toggle-on', on);
        btn.title = on ? 'Turn off' : 'Turn on';
        const card = btn.closest('.entity-item');
        if (card) card.classList.toggle('entity-is-on', on);
      });
    }

    // ── Watch pending update installs: detect completion / percentage ──
    if (this._pendingUpdateWatches?.size > 0) {
      for (const entityId of [...this._pendingUpdateWatches]) {
        const st = hass.states?.[entityId];
        if (!st) continue;
        if (st.state === 'off') {
          // Entity reports no update available → installation complete
          this._pendingUpdateWatches.delete(entityId);
          this._setUpdateRowState(entityId, 'done');
          setTimeout(() => this.loadUpdates(), 2000);
        } else if (st.attributes.in_progress === true) {
          const pct = st.attributes.update_percentage;
          if (pct != null && typeof pct === 'number') {
            this._updateRowProgress(entityId, Math.round(pct));
          }
        }
      }
    }

    if (!this.content && hass) {
      try {
        this.render();
        this.loadData();
      } catch (e) {
        console.error('Entity Manager render error:', e);
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'padding: 20px; color: red;';
        errDiv.textContent = 'Error loading Entity Manager: ' + e.message;
        this.innerHTML = '';
        this.appendChild(errDiv);
      }
    }
  }

  get hass() {
    return this._hass;
  }

  _fireEvent(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  // ── Brands proxy API (HA 2026.3+) ────────────────────────────────────────

  async _fetchBrandsToken() {
    try {
      const res = await this._hass.callWS({ type: 'brands/access_token' });
      this._brandsToken = res.access_token || res.token || '';
    } catch (_) {
      // Older HA versions don't have this command — fall back to CDN URLs
      this._brandsToken = null; // null = use CDN fallback
    }
  }

  /** Returns the correct brand icon URL for a given integration domain. */
  _brandIconUrl(domain) {
    const d = encodeURIComponent(domain);
    if (this._brandsToken) {
      return `/api/brands/integration/${d}/icon.png?token=${this._brandsToken}`;
    }
    // Fallback: CDN (works on HA < 2026.3 or before token arrives)
    // /_/ = "best available" path on the brands CDN
    return `https://brands.home-assistant.io/_/${d}/icon.png`;
  }

  async loadData() {
    this.setLoading(true);
    try {
      // 'updates' is a frontend-only view — map it to 'all' for the backend
      const backendState = ['all', 'disabled', 'enabled'].includes(this.viewState)
        ? this.viewState : 'all';
      const result = await this._hass.callWS({
        type: 'entity_manager/get_disabled_entities',
        state: backendState,
      });
      
      this.data = Array.isArray(result) ? result.map(integration => {
        const devicesObj = {};
        Object.entries(integration.devices).forEach(([deviceId, device]) => {
          devicesObj[deviceId] = {
            name: device.name || deviceId,
            entities: Array.isArray(device.entities) ? device.entities : [],
          };
        });
        
        return {
          integration: integration.integration,
          devices: devicesObj,
        };
      }) : [];

      this.domainOptions = this.extractDomains(this.data);
      this.updateDomainOptions();

      // Load last-activity cache from recorder (non-blocking — re-renders when ready)
      this._loadLastActivityCache();

      // Fetch brands token lazily (non-blocking — icons fall back to CDN until ready)
      // Only fetch when in initial '' state; null means already tried and failed (old HA)
      if (this._brandsToken === '') this._fetchBrandsToken();

      await this.loadDeviceInfo();
    } catch (error) {
      console.error('Entity Manager Error:', error);
      this.showErrorDialog(`Error loading entities: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  // Fetch last-activity timestamps from the recorder DB (survives HA restarts).
  // Results are cached in localStorage for 1 hour to avoid hammering the DB on every loadData().
  // Falls back to state.last_changed in the entity card if cache is empty (first load or recorder unavailable).
  async _loadLastActivityCache() {
    const CACHE_KEY = 'em_lastActivityCache';
    const TTL = 60 * 60 * 1000; // 1 hour

    // Check if localStorage cache is still fresh
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.ts) < TTL) {
        this._lastActivityCache = new Map(Object.entries(cached.data || {}));
        return; // cache is fresh — no WS call needed
      }
    } catch (_) { /* corrupt cache — refetch */ }

    // Collect all entity IDs currently loaded
    const entityIds = [];
    for (const intg of this.data || []) {
      for (const device of Object.values(intg.devices || {})) {
        for (const entity of device.entities || []) {
          entityIds.push(entity.entity_id);
        }
      }
    }
    if (!entityIds.length) return;

    try {
      const result = await this._hass.callWS({
        type: 'entity_manager/get_last_activity',
        entity_ids: entityIds,
      });
      this._lastActivityCache = new Map(Object.entries(result || {}));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: result || {} }));
      } catch (_) { /* storage full — cache in memory only */ }
      // Re-render with accurate timestamps now that the cache is loaded
      this.updateView();
    } catch (err) {
      console.warn('Entity Manager: Last activity cache load failed:', err);
    }
  }

  async loadDeviceInfo() {
    // Device registry is critical — must succeed for device names to show correctly.
    try {
      const deviceResult = await this._hass.callWS({ type: 'config/device_registry/list' });
      this.deviceInfo = deviceResult.reduce((acc, device) => {
        acc[device.id] = device;
        return acc;
      }, {});
    } catch (error) {
      console.error('Entity Manager - Error loading device info:', error);
    }

    // Entity registry → entity_id→{device_id, area_id} map (supplementary).
    try {
      const entityList = await this._hass.callWS({ type: 'config/entity_registry/list' });
      this.entityDeviceMap = new Map(
        entityList.filter(e => e.device_id).map(e => [e.entity_id, e.device_id])
      );
      // entity-level area override — for ALL entities that have area_id set on the entity itself.
      // In HA, entity-level area takes precedence over device-level area.
      this.entityAreaMap = new Map(
        entityList.filter(e => e.area_id).map(e => [e.entity_id, e.area_id])
      );
    } catch (error) {
      console.error('Entity Manager - Error loading entity registry map:', error);
    }

    // Floor/area data — use native HA registries directly (more reliable than custom WS handler).
    try {
      const [areaList, floorList] = await Promise.all([
        this._hass.callWS({ type: 'config/area_registry/list' }).catch(() => []),
        this._hass.callWS({ type: 'config/floor_registry/list' }).catch(() => []),
      ]);
      const floorNameMap = new Map((floorList || []).map(f => [f.floor_id, f.name]));
      this.areaLookup = new Map((areaList || []).map(a => [
        a.area_id,
        { areaName: a.name, floorName: a.floor_id ? (floorNameMap.get(a.floor_id) || '') : '' }
      ]));
      // Keep floorsData in sync for dialogs that use it
      this.floorsData = { areas: areaList || [], floors: floorList || [] };
    } catch (error) {
      console.error('Entity Manager - Error loading floor/area data:', error);
    }

    this.loadCounts();
  }

  async loadCounts() {
    try {
      // Get all states to count automations, scripts, helpers, and other entities
      const states = await this._hass.callWS({ type: 'get_states' });
      
      this.automationCount = states.filter(s => s.entity_id.startsWith('automation.')).length;
      this.scriptCount = states.filter(s => s.entity_id.startsWith('script.')).length;
      this.helperCount = states.filter(s => s.entity_id.startsWith('input_')).length +
                         states.filter(s => s.entity_id.startsWith('variable.')).length;
      // Count pending updates (update.* entities with state 'on' = update available)
      this.updateCount = states.filter(s => s.entity_id.startsWith('update.') && s.state === 'on').length;
      // Count entities stuck in unavailable
      this.unavailableCount = states.filter(s => s.state === 'unavailable').length;
      // Count entities not updated in 30+ days (excluding meta-states and dismissed)
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = Date.now() - thirtyDaysMs;
      const staleDismissed = this._loadFromStorage('em-stale-dismissed', {});
      const staleDismissedActive = new Set(
        Object.entries(staleDismissed).filter(([, ts]) => Date.now() - ts < thirtyDaysMs).map(([eid]) => eid)
      );
      this.healthCount = states.filter(s => {
        if (s.state === 'unavailable' || s.state === 'unknown') return false;
        if (!s.last_updated) return false;
        if (staleDismissedActive.has(s.entity_id)) return false;
        return new Date(s.last_updated).getTime() < thirtyDaysAgo;
      }).length;
      // Count orphaned entities (no device) from entity registry data
      this.orphanedCount = 0;
      if (this.data) {
        this.data.forEach(integration => {
          const noDevice = integration.devices['no_device'];
          if (noDevice) this.orphanedCount += noDevice.entities.length;
        });
      }
      // Ghost devices: in deviceInfo but no entities in loaded data
      const devicesWithEntities = new Set();
      (this.data || []).forEach(int => {
        Object.keys(int.devices).forEach(id => { if (id !== 'no_device') devicesWithEntities.add(id); });
      });
      this.ghostDeviceCount = Object.keys(this.deviceInfo).filter(id => !devicesWithEntities.has(id)).length;

      // Never-triggered automations + scripts
      this.neverTriggeredCount = Object.values(this._hass?.states || {}).filter(s =>
        (s.entity_id.startsWith('automation.') || s.entity_id.startsWith('script.')) &&
        !s.attributes?.last_triggered
      ).length;

      // Total cleanup count
      this.cleanupCount = (this.orphanedCount || 0) + (this.healthCount || 0) + (this.ghostDeviceCount || 0) + (this.neverTriggeredCount || 0);

      // Config entry health count (non-blocking — stat card updates when ready)
      this._hass.callWS({ type: 'entity_manager/get_config_entry_health' }).then(entries => {
        this.configHealthCount = entries.length;
        const healthCard = this.querySelector('[data-stat-type="config-health"] .stat-value');
        if (healthCard) {
          healthCard.textContent = String(this.configHealthCount);
          healthCard.style.color = this.configHealthCount > 0 ? 'var(--em-danger)' : 'var(--em-success)';
        }
      }).catch(() => { this.configHealthCount = 0; });
      // Count templates via backend (covers YAML platform=template + template.* domain)
      try {
        const templateSensors = await this._hass.callWS({ type: 'entity_manager/get_template_sensors' });
        this.templateSensors = templateSensors;
        this.templateCount = templateSensors.length;
      } catch (e) {
        this.templateSensors = null;
        this.templateCount = states.filter(s => s.entity_id.startsWith('template.')).length;
      }
      // Count HACS store items via backend scan
      try {
        const hacsItems = await this._hass.callWS({ type: 'entity_manager/list_hacs_items' });
        this.hacsItems = hacsItems;
        this.hacsCount = (hacsItems?.store || []).length;
      } catch (e) {
        this.hacsItems = null;
        this.hacsCount = 0;
      }
      // Collect unique card types across dashboards (recursive, cache configs for dialog reuse)
      const _llCollectTypes = (cards, types) => {
        for (const c of (cards || [])) {
          if (!c || typeof c !== 'object') continue;
          if (c.type) types.add(c.type);
          if (c.cards) _llCollectTypes(c.cards, types);
          if (c.card) _llCollectTypes([c.card], types);
          if (c.elements) _llCollectTypes(c.elements, types);
        }
      };
      try {
        const dashboards = await this._hass.callWS({ type: 'lovelace/dashboards/list' });
        this.lovelaceDashboardList = dashboards || [];
        const types = new Set();
        for (const dashboard of this.lovelaceDashboardList) {
          try {
            const config = await this._hass.callWS({ type: 'lovelace/config', url_path: dashboard.url_path || null });
            dashboard._config = config;
            (config?.views || []).forEach(view => {
              _llCollectTypes(view.cards || [], types);
              (view.sections || []).forEach(s => { if (s) _llCollectTypes(s.cards || [], types); });
            });
          } catch (e) { console.warn('[EM] lovelace config fetch failed for dashboard', dashboard.url_path, e); }
        }
        this.lovelaceCardCount = types.size;
      } catch (e) {
        this.lovelaceDashboardList = [];
        try {
          const config = await this._hass.callWS({ type: 'lovelace/config' });
          const types = new Set();
          _llCollectTypes(config?.views?.flatMap(v => v.cards || []) || [], types);
          this.lovelaceCardCount = types.size;
        } catch (e2) {
          this.lovelaceCardCount = 0;
        }
      }
      
      this.updateView();
      
      // Refresh sidebar to show integrations
      this._reRenderSidebar();
    } catch (error) {
      console.error('Entity Manager - Error loading counts:', error);
      this.updateView();
    }
  }

  getDeviceName(deviceId) {
    const dev = this.deviceInfo?.[deviceId];
    if (!dev) return deviceId;
    const name = dev.name_by_user || dev.name;
    if (name) return name;
    // Fallback: model or manufacturer to avoid showing raw UUID
    if (dev.model && dev.manufacturer) return `${dev.manufacturer} ${dev.model}`;
    if (dev.model) return dev.model;
    if (dev.manufacturer) return dev.manufacturer;
    return 'Unknown Device';
  }

  getDeviceType(deviceId) {
    const dev = this.deviceInfo[deviceId];
    if (!dev) return 'unknown';
    const identifiers = (dev.identifiers || []).map(id => id[0]);
    const connections = dev.connections || [];
    if (identifiers.includes('mobile_app')) return 'mobile';
    if (identifiers.some(i => ['homeassistant', 'hassio', 'hassio_os', 'hassio_supervisor', 'system_health'].includes(i))) return 'system';
    if (connections.length > 0) return 'hardware';
    if (dev.entry_type === 'service') return 'virtual';
    return 'cloud';
  }

  _deviceTypeMeta() {
    return {
      hardware: { label: 'Hardware', color: 'var(--em-success)' },
      virtual:  { label: 'Virtual',  color: 'var(--em-primary)' },
      mobile:   { label: 'Mobile',   color: '#9c27b0' },
      system:   { label: 'System',   color: 'var(--em-warning)' },
      cloud:    { label: 'Cloud',    color: '#00bcd4' },
      unknown:  { label: 'Unknown',   color: 'var(--em-text-secondary)' },
    };
  }

  extractDomains(data) {
    const domains = new Set();
    data.forEach(integration => {
      Object.values(integration.devices).forEach(device => {
        device.entities.forEach(entity => {
          if (entity.entity_id && entity.entity_id.includes('.')) {
            domains.add(entity.entity_id.split('.')[0]);
          }
        });
      });
    });
    return Array.from(domains).sort();
  }

  updateDomainOptions() {
    const select = this.querySelector('#toolbar-domain-select');
    if (!select) return;

    const current = this.domainOptions.includes(this.selectedDomain) ? this.selectedDomain : 'all';
    this.selectedDomain = current;

    select.innerHTML = `<option value="all">All Domains</option>` +
      this.domainOptions.map(d => `<option value="${this._escapeAttr(d)}"${d === current ? ' selected' : ''}>${this._escapeHtml(d)}</option>`).join('');
    select.value = current;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    const refreshItem = this.querySelector('.em-sidebar [data-action="refresh"]');
    if (refreshItem) refreshItem.style.opacity = isLoading ? '0.4' : '';
  }

  render() {
    // Clear any existing content
    this.innerHTML = '';

    // Load CSS into the component by fetching and injecting as style element
    fetch(_emBaseUrl + 'entity-manager-panel.css?v=' + Date.now())
      .then(r => r.text())
      .then(css => {
        const styleEl = document.createElement('style');
        styleEl.textContent = css;
        this.insertBefore(styleEl, this.firstChild);
      })
      .catch(e => console.error('[Entity Manager] Failed to load CSS:', e));

    // Create app header
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = `
      <button class="menu-btn" id="menu-btn" aria-label="Menu">
        <svg viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" fill="currentColor"/></svg>
      </button>
      <button class="mobile-sidebar-btn" id="mobile-sidebar-btn" aria-label="Toggle Navigation">
        <svg viewBox="0 0 24 24"><path d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,19.15 12,20V6.5C10.55,5.4 8.45,5 6.5,5Z" fill="currentColor"/></svg>
      </button>
      <span class="app-header-title">Entity Manager <span class="em-version-badge">v${EM_VERSION}</span></span>
      <div class="header-right">
        <div class="theme-dropdown-container">
          <button class="theme-dropdown-btn" id="theme-dropdown-btn">
            <svg viewBox="0 0 24 24"><path d="M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,15.31L23.31,12L20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31Z" fill="currentColor"/></svg>
            <span id="theme-btn-label">Theme</span>
          </button>
          <div class="theme-dropdown-menu" id="theme-dropdown-menu">
            <div class="theme-dropdown-item ${this.activeTheme === 'default' ? 'active' : ''}" data-theme="default">
              <svg viewBox="0 0 24 24"><path d="M12,18V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,15.31L23.31,12L20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31Z" fill="currentColor"/></svg>
              Default (Follow HA)
            </div>
            <div class="theme-dropdown-divider"></div>
            <div id="saved-themes-list"></div>
            <div class="theme-dropdown-divider"></div>
            <div class="theme-dropdown-item save-btn" id="save-theme-btn">
              <svg viewBox="0 0 24 24"><path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z" fill="currentColor"/></svg>
              Save Current Theme
            </div>
            <div class="theme-dropdown-item" id="create-theme-btn" style="color: var(--em-primary); font-weight: 500;">
              <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
              Create New Theme
            </div>
            <div class="theme-dropdown-divider"></div>
            <div class="theme-dropdown-item" id="import-themes-btn">
              <svg viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13.5,16V19H10.5V16H8L12,12L16,16H13.5M13,9V3.5L18.5,9H13Z" fill="currentColor"/></svg>
              Import Themes
            </div>
            <div class="theme-dropdown-item" id="export-themes-btn">
              <svg viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13.5,13V16H10.5V13H8L12,9L16,13H13.5M13,9V3.5L18.5,9H13Z" fill="currentColor"/></svg>
              Export Themes
            </div>
          </div>
        </div>
      </div>
    `;
    this.appendChild(header);
    
    // Create theme editor overlay
    const themeEditor = document.createElement('div');
    themeEditor.className = 'theme-editor-overlay';
    themeEditor.id = 'theme-editor-overlay';
    themeEditor.innerHTML = `
      <div class="theme-editor">
        <div class="theme-editor-header">
          <h3>Create Custom Theme</h3>
          <button class="theme-editor-close" id="theme-editor-close">&times;</button>
        </div>
        <div class="theme-editor-content">
          <input type="text" class="theme-editor-name" id="theme-editor-name" placeholder="Theme Name" value="My Custom Theme">
          
          <div class="theme-editor-section">
            <div class="theme-editor-section-title">Base Mode</div>
            <div class="theme-editor-mode">
              <input type="radio" name="theme-mode" id="theme-mode-light" value="light" checked>
              <label for="theme-mode-light">☀️ Light</label>
              <input type="radio" name="theme-mode" id="theme-mode-dark" value="dark">
              <label for="theme-mode-dark">🌙 Dark</label>
            </div>
          </div>
          
          <div class="theme-editor-section">
            <div class="theme-editor-section-title">Primary Colors</div>
            <div class="theme-editor-row">
              <label>Primary</label>
              <input type="color" id="te-primary" value="#2196f3">
              <span class="color-hex" data-for="te-primary">#2196f3</span>
            </div>
            <div class="theme-editor-row">
              <label>Primary Dark</label>
              <input type="color" id="te-primary-dark" value="#1565c0">
              <span class="color-hex" data-for="te-primary-dark">#1565c0</span>
            </div>
            <div class="theme-editor-row">
              <label>Primary Light</label>
              <input type="color" id="te-primary-light" value="#64b5f6">
              <span class="color-hex" data-for="te-primary-light">#64b5f6</span>
            </div>
          </div>
          
          <div class="theme-editor-section">
            <div class="theme-editor-section-title">Status Colors</div>
            <div class="theme-editor-row">
              <label>Success</label>
              <input type="color" id="te-success" value="#4caf50">
              <span class="color-hex" data-for="te-success">#4caf50</span>
            </div>
            <div class="theme-editor-row">
              <label>Danger</label>
              <input type="color" id="te-danger" value="#f44336">
              <span class="color-hex" data-for="te-danger">#f44336</span>
            </div>
            <div class="theme-editor-row">
              <label>Warning</label>
              <input type="color" id="te-warning" value="#ff9800">
              <span class="color-hex" data-for="te-warning">#ff9800</span>
            </div>
          </div>
          
          <div class="theme-editor-section">
            <div class="theme-editor-section-title">Background & Text</div>
            <div class="theme-editor-row">
              <label>Background</label>
              <input type="color" id="te-bg-primary" value="#ffffff">
              <span class="color-hex" data-for="te-bg-primary">#ffffff</span>
            </div>
            <div class="theme-editor-row">
              <label>Secondary BG</label>
              <input type="color" id="te-bg-secondary" value="#f5f5f5">
              <span class="color-hex" data-for="te-bg-secondary">#f5f5f5</span>
            </div>
            <div class="theme-editor-row">
              <label>Text</label>
              <input type="color" id="te-text-primary" value="#212121">
              <span class="color-hex" data-for="te-text-primary">#212121</span>
            </div>
            <div class="theme-editor-row">
              <label>Border</label>
              <input type="color" id="te-border" value="#e0e0e0">
              <span class="color-hex" data-for="te-border">#e0e0e0</span>
            </div>
          </div>
          
          <div class="theme-editor-section">
            <div class="theme-editor-section-title">Background Image (Optional)</div>
            <div class="theme-editor-bg-type">
              <label class="theme-editor-radio">
                <input type="radio" name="bg-type" value="none" checked>
                <span>None</span>
              </label>
              <label class="theme-editor-radio">
                <input type="radio" name="bg-type" value="url">
                <span>Web URL</span>
              </label>
              <label class="theme-editor-radio">
                <input type="radio" name="bg-type" value="local">
                <span>Local File</span>
              </label>
            </div>
            <div id="bg-url-input" class="theme-editor-bg-input" style="display: none;">
              <input type="text" id="te-bg-url" placeholder="https://example.com/image.jpg" class="theme-editor-name">
            </div>
            <div id="bg-local-input" class="theme-editor-bg-input" style="display: none;">
              <button class="theme-editor-btn" id="te-bg-local-btn" style="width: 100%;">
                <svg viewBox="0 0 24 24" style="width:18px;height:18px;margin-right:8px;vertical-align:middle;"><path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" fill="currentColor"/></svg>
                Choose Image File
              </button>
              <div id="te-bg-local-preview" class="theme-editor-bg-preview"></div>
            </div>
            <div class="theme-editor-row" id="bg-overlay-row" style="display: none; margin-top: 12px;">
              <label>Overlay</label>
              <input type="color" id="te-bg-overlay" value="#000000">
              <input type="range" id="te-bg-overlay-opacity" min="0" max="100" value="70" style="flex: 1;">
              <span id="te-bg-overlay-value">70%</span>
            </div>
          </div>
          
          <div class="theme-editor-preview" id="theme-preview">
            <div class="theme-editor-preview-title">Preview</div>
            <div class="theme-editor-preview-chips">
              <span class="theme-preview-chip" id="preview-chip-primary">Primary</span>
              <span class="theme-preview-chip" id="preview-chip-success">Success</span>
              <span class="theme-preview-chip" id="preview-chip-danger">Danger</span>
              <span class="theme-preview-chip" id="preview-chip-warning">Warning</span>
            </div>
          </div>
        </div>
        <div class="theme-editor-actions">
          <button class="theme-editor-btn cancel" id="theme-editor-cancel">Cancel</button>
          <button class="theme-editor-btn save" id="theme-editor-save">Create Theme</button>
        </div>
      </div>
    `;
    this.appendChild(themeEditor);

    // Create layout container with sidebar
    const layout = document.createElement('div');
    layout.className = 'em-layout';
    layout.innerHTML = this._renderSidebar();
    this.appendChild(layout);

    // Create main content area
    this.content = document.createElement('div');
    this.content.id = 'main-content';
    this.content.className = this.sidebarCollapsed ? 'sidebar-collapsed' : '';
    layout.appendChild(this.content);

    // Persistent delegated listener for mini-card HA links (works for async-loaded sections)
    this.content.addEventListener('click', (e) => {
      const btn = e.target.closest('.em-mini-card-link');
      if (!btn) return;
      e.stopPropagation();
      if (btn.dataset.openPath) {
        history.pushState(null, '', btn.dataset.openPath);
        window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
      } else if (btn.dataset.openEntity) {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          detail: { entityId: btn.dataset.openEntity },
          bubbles: true,
          composed: true,
        }));
      }
    });

    // Fill content with HTML
    this.content.innerHTML = `
      <div class="header">
        <h1>Entity Manager</h1>
        <p>Manage entities by integration and device</p>
      </div>
      
      <div id="em-health-banner" style="display:none"></div>
      <div class="stats" id="stats"></div>
      
      <div class="toolbar">
        <div class="filter-group">
          <button class="filter-toggle" data-filter="all">All</button>
          <button class="filter-toggle" data-filter="enabled">Enabled</button>
          <button class="filter-toggle" data-filter="disabled">Disabled</button>
          <button class="filter-toggle" data-filter="updates">Updates</button>
        </div>
        <div class="domain-dropdown" id="update-filter-dropdown" style="display: none;">
          <button class="domain-button" id="update-filter-button" aria-label="Filter updates" type="button">
            <span id="update-filter-label">All Updates</span>
            <span aria-hidden="true">▾</span>
          </button>
          <div class="domain-menu" id="update-filter-menu" role="listbox" aria-label="Update filter options">
            <div class="domain-option active" data-update-filter="all">All Updates</div>
            <div class="domain-option" data-update-filter="stable">Stable Only</div>
            <div class="domain-option" data-update-filter="beta">Beta Only</div>
          </div>
        </div>
        <div class="domain-dropdown" id="update-type-dropdown" style="display: none;">
          <button class="domain-button" id="update-type-button" aria-label="Filter by type" type="button">
            <span id="update-type-label">All Types</span>
            <span aria-hidden="true">▾</span>
          </button>
          <div class="domain-menu" id="update-type-menu" role="listbox" aria-label="Update type options">
            <div class="domain-option active" data-update-type="all">All Types</div>
            <div class="domain-option" data-update-type="device">Devices</div>
            <div class="domain-option" data-update-type="integration">Integrations</div>
          </div>
        </div>
        <label class="hide-uptodate-label" id="hide-uptodate-label" style="display: none;">
          <input type="checkbox" id="hide-uptodate-checkbox" />
          <span>Hide Up-to-Date</span>
        </label>
      </div>

      <div class="toolbar-row-2">
        <select id="toolbar-domain-select" class="toolbar-select">
          <option value="all">All Domains</option>
        </select>
        <div class="filter-group" id="view-mode-group">
          <button class="filter-toggle view-mode-toggle" data-view-mode="integrations">Integrations</button>
          <button class="filter-toggle view-mode-toggle" data-view-mode="devices">Devices</button>
        </div>
        <select id="device-type-select" class="toolbar-select" style="display: none;">
          <option value="all">All Types</option>
          <option value="hardware">⚡ Hardware</option>
          <option value="cloud">☁️ Cloud</option>
          <option value="virtual">🔧 Virtual</option>
          <option value="mobile">📱 Mobile</option>
          <option value="system">🏠 HA System</option>
        </select>
        <label class="hide-uptodate-label" id="hide-unavailable-label" style="display: none;">
          <input type="checkbox" id="hide-unavailable-checkbox" ${this.showOfflineOnly ? 'checked' : ''} />
          <span>Offline only</span>
        </label>
      </div>

      <div class="toolbar-search">
        <input
          type="text"
          class="search-box"
          placeholder="Search entities, devices, or integrations..."
          id="search-input"
        />
      </div>

      <div id="content"></div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Handle menu button (it's outside content div)
    const menuBtn = this.querySelector('#menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        this._fireEvent('hass-toggle-menu');
      });
    }
    
    // Handle mobile sidebar toggle button
    const mobileSidebarBtn = this.querySelector('#mobile-sidebar-btn');
    if (mobileSidebarBtn) {
      mobileSidebarBtn.addEventListener('click', () => {
        this._toggleSidebar();
      });
    }
    
    // Handle theme dropdown
    const themeDropdownBtn = this.querySelector('#theme-dropdown-btn');
    const themeDropdownMenu = this.querySelector('#theme-dropdown-menu');
    if (themeDropdownBtn && themeDropdownMenu) {
      // Load saved theme and update UI
      this._loadActiveTheme();
      this._updateThemeDropdownList();
      this._updateThemeDropdownUI();
      this.updateTheme();
      
      themeDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdownMenu.classList.toggle('active');
      });
      
      themeDropdownMenu.addEventListener('click', (e) => {
        // Handle delete button
        const deleteBtn = e.target.closest('.delete-theme-btn');
        if (deleteBtn) {
          e.stopPropagation();
          this._deleteCustomTheme(deleteBtn.dataset.delete);
          return;
        }
        
        // Handle edit button
        const editBtn = e.target.closest('.edit-theme-btn');
        if (editBtn) {
          e.stopPropagation();
          themeDropdownMenu.classList.remove('active');
          this._openThemeEditor(editBtn.dataset.edit);
          return;
        }
        
        // Handle save button
        if (e.target.closest('#save-theme-btn')) {
          this._saveCurrentTheme();
          themeDropdownMenu.classList.remove('active');
          return;
        }
        
        // Handle create theme button
        if (e.target.closest('#create-theme-btn')) {
          themeDropdownMenu.classList.remove('active');
          this._openThemeEditor();
          return;
        }
        
        // Handle import themes button
        if (e.target.closest('#import-themes-btn')) {
          themeDropdownMenu.classList.remove('active');
          this._importThemes();
          return;
        }
        
        // Handle export themes button
        if (e.target.closest('#export-themes-btn')) {
          themeDropdownMenu.classList.remove('active');
          this._exportThemes();
          return;
        }
        
        // Handle theme selection
        const item = e.target.closest('.theme-dropdown-item[data-theme]');
        if (item && item.dataset.theme) {
          this._setActiveTheme(item.dataset.theme);
          themeDropdownMenu.classList.remove('active');
        }
      });
      
      // Theme editor event handlers
      this._setupThemeEditor();
      
      // Close dropdown when clicking outside
      if (!this._themeOutsideHandler) {
        this._themeOutsideHandler = (event) => {
          if (!themeDropdownMenu.classList.contains('active')) return;
          if (!themeDropdownMenu.contains(event.target) && !themeDropdownBtn.contains(event.target)) {
            themeDropdownMenu.classList.remove('active');
          }
        };
        document.addEventListener('click', this._themeOutsideHandler);
      }
    }

    // Handle search
    const searchInput = this.content.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        clearTimeout(this._searchDebounceTimer);
        this._searchDebounceTimer = setTimeout(() => {
          this.searchTerm = value;
          this.updateView();
        }, 200);
      });
    }

    // Handle filter buttons
    this.content.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewState = btn.dataset.filter;
        this.selectedIntegrationFilter = null; // Clear integration filter when switching view
        this._showOnlyFavorites = false; // Clear favorites filter
        this._viewingSelected = false; // Exit "view selected" mode
        this.setActiveFilter();
        
        // Update sidebar to clear active integration
        this._reRenderSidebar();

        // Show/hide update filter dropdown and buttons
        const updateFilterDropdown = this.content.querySelector('#update-filter-dropdown');

        if (this.viewState === 'updates') {
          updateFilterDropdown.style.display = 'block';
          const updateTypeDropdown = this.content.querySelector('#update-type-dropdown');
          if (updateTypeDropdown) updateTypeDropdown.style.display = 'block';
          const hideLabel = this.content.querySelector('#hide-uptodate-label');
          if (hideLabel) hideLabel.style.display = 'flex';
          this.loadUpdates();
        } else {
          updateFilterDropdown.style.display = 'none';
          const updateTypeDropdown = this.content.querySelector('#update-type-dropdown');
          if (updateTypeDropdown) updateTypeDropdown.style.display = 'none';
          const hideLabel = this.content.querySelector('#hide-uptodate-label');
          if (hideLabel) hideLabel.style.display = 'none';
          this.loadData();
        }
      });
    });

    // Domain select in toolbar
    const domainSelect = this.content.querySelector('#toolbar-domain-select');
    if (domainSelect) {
      domainSelect.addEventListener('change', () => {
        this.selectedDomain = domainSelect.value;
        this._showOnlyFavorites = false;
        this.updateView();
      });
    }

    // View mode buttons
    const hideUnavailableLabel = this.content.querySelector('#hide-unavailable-label');
    const deviceTypeSelect = this.content.querySelector('#device-type-select');
    if (hideUnavailableLabel && this.viewMode === 'devices') hideUnavailableLabel.style.display = 'flex';
    if (deviceTypeSelect) {
      if (this.viewMode === 'devices') deviceTypeSelect.style.display = '';
      deviceTypeSelect.value = this.deviceTypeFilter;
    }
    this.content.querySelectorAll('.view-mode-toggle').forEach(btn => {
      if (btn.dataset.viewMode === this.viewMode) btn.classList.add('active');
      btn.addEventListener('click', () => {
        this.viewMode = btn.dataset.viewMode;
        this.content.querySelectorAll('.view-mode-toggle').forEach(b => b.classList.toggle('active', b === btn));
        const lbl = this.content.querySelector('#hide-unavailable-label');
        if (lbl) lbl.style.display = this.viewMode === 'devices' ? 'flex' : 'none';
        const sel = this.content.querySelector('#device-type-select');
        if (sel) sel.style.display = this.viewMode === 'devices' ? '' : 'none';
        // Exit updates view when switching to Integrations or Devices
        if (this.viewState === 'updates') {
          this.viewState = 'all';
          this.setActiveFilter();
          const updateFilterDropdown = this.content.querySelector('#update-filter-dropdown');
          if (updateFilterDropdown) updateFilterDropdown.style.display = 'none';
          const updateTypeDropdown = this.content.querySelector('#update-type-dropdown');
          if (updateTypeDropdown) updateTypeDropdown.style.display = 'none';
          const hideLabel = this.content.querySelector('#hide-uptodate-label');
          if (hideLabel) hideLabel.style.display = 'none';
          this.loadData();
        } else {
          this.updateView();
        }
      });
    });

    // Offline only checkbox
    const hideUnavailableCheckbox = this.content.querySelector('#hide-unavailable-checkbox');
    if (hideUnavailableCheckbox) {
      hideUnavailableCheckbox.addEventListener('change', (e) => {
        this.showOfflineOnly = e.target.checked;
        localStorage.setItem('em-show-offline-only', this.showOfflineOnly);
        this.updateView();
      });
    }

    // Device type filter select
    const deviceTypeSelectEl = this.content.querySelector('#device-type-select');
    if (deviceTypeSelectEl) {
      deviceTypeSelectEl.addEventListener('change', (e) => {
        this.deviceTypeFilter = e.target.value;
        localStorage.setItem('em-device-type-filter', this.deviceTypeFilter);
        this.updateView();
      });
    }

    // Handle update filter
    const updateFilterButton = this.content.querySelector('#update-filter-button');
    const updateFilterMenu = this.content.querySelector('#update-filter-menu');
    if (updateFilterButton && updateFilterMenu) {
      updateFilterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        updateFilterMenu.classList.toggle('open');
      });

      updateFilterMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.domain-option');
        if (!option) return;
        this.updateFilter = option.dataset.updateFilter;
        const label = this.content.querySelector('#update-filter-label');
        label.textContent = option.textContent;
        
        // Update active state
        updateFilterMenu.querySelectorAll('.domain-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Auto-enable hide up-to-date when a filter is selected
        if (this.updateFilter !== 'all') {
          this.hideUpToDate = true;
          const hideCheckbox = this.content.querySelector('#hide-uptodate-checkbox');
          if (hideCheckbox) hideCheckbox.checked = true;
        }
        
        updateFilterMenu.classList.remove('open');
        this.renderUpdates();
      });
    }
    
    // Handle hide up-to-date checkbox
    const hideCheckbox = this.content.querySelector('#hide-uptodate-checkbox');
    if (hideCheckbox) {
      hideCheckbox.addEventListener('change', (e) => {
        this.hideUpToDate = e.target.checked;
        this.renderUpdates();
      });
    }
    
    // Handle update type filter
    const updateTypeButton = this.content.querySelector('#update-type-button');
    const updateTypeMenu = this.content.querySelector('#update-type-menu');
    if (updateTypeButton && updateTypeMenu) {
      updateTypeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        updateTypeMenu.classList.toggle('open');
      });

      updateTypeMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.domain-option');
        if (!option) return;
        this.selectedUpdateType = option.dataset.updateType;
        const label = this.content.querySelector('#update-type-label');
        label.textContent = option.textContent;
        
        // Update active state
        updateTypeMenu.querySelectorAll('.domain-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        updateTypeMenu.classList.remove('open');
        this.renderUpdates();
      });
    }
    
    // Handle sidebar toggle
    const sidebarToggle = this.querySelector('#sidebar-toggle-btn');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => this._toggleSidebar());
    }
    
    // Setup sidebar click handlers
    this._attachSidebarListeners();

    this.setActiveFilter();
  }
  
  _attachSidebarListeners() {
    // Handle sidebar toggle button
    const sidebarToggle = this.querySelector('#sidebar-toggle-btn');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => this._toggleSidebar());
    }

    // Handle collapsible section titles
    this.querySelector('.em-sidebar')?.querySelectorAll('.sidebar-section-title[data-section-id]').forEach(title => {
      title.addEventListener('click', () => {
        const id = title.dataset.sectionId;
        const section = title.closest('.sidebar-section');
        const isCollapsed = section.classList.contains('section-collapsed');
        section.classList.toggle('section-collapsed', !isCollapsed);
        if (isCollapsed) {
          this.sidebarOpenSections.add(id);
        } else {
          this.sidebarOpenSections.delete(id);
        }
        localStorage.setItem('em-sidebar-sections', JSON.stringify([...this.sidebarOpenSections]));
      });
    });
    
    // Handle click outside sidebar on mobile to close it
    const mainContent = this.querySelector('#main-content');
    if (mainContent) {
      mainContent.addEventListener('click', (e) => {
        // Only on mobile (check if sidebar is in fixed/overlay mode)
        const sidebar = this.querySelector('.em-sidebar');
        if (sidebar && !this.sidebarCollapsed && window.innerWidth <= 768) {
          this._toggleSidebar();
        }
      });
    }
    
    // Handle sidebar items
    this.querySelector('.em-sidebar')?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.preset-delete');
      if (deleteBtn) {
        e.stopPropagation();
        this._deleteFilterPreset(parseInt(deleteBtn.dataset.delete));
        return;
      }
      // Custom group — edit
      const cgEditBtn = e.target.closest('.em-custom-group-edit-btn');
      if (cgEditBtn) {
        e.stopPropagation();
        const cgId = cgEditBtn.dataset.cgId;
        const grp = (this.customGroups || []).find(g => g.id === cgId);
        if (grp) this._showGroupEditorDialog(grp);
        return;
      }
      // Custom group — delete
      const cgDelBtn = e.target.closest('.em-custom-group-delete-btn');
      if (cgDelBtn) {
        e.stopPropagation();
        const cgId = cgDelBtn.dataset.cgId;
        const grp = (this.customGroups || []).find(g => g.id === cgId);
        if (!grp) return;
        this.showConfirmDialog(`Delete group "${grp.name}"?`, 'This only removes the grouping — entities are not affected.', () => {
          this.customGroups = (this.customGroups || []).filter(g => g.id !== cgId);
          localStorage.setItem('em-custom-groups', JSON.stringify(this.customGroups));
          this._reRenderSidebar();
          this.updateView();
        });
        return;
      }
      // Label edit button
      const editLabelBtn = e.target.closest('[data-edit-label]');
      if (editLabelBtn) {
        e.stopPropagation();
        const labelId = editLabelBtn.dataset.editLabel;
        const label = (this.labeledEntitiesCache || {})[labelId] || (this.labelsCache || []).find(l => l.label_id === labelId);
        if (label) this._showLabelEditDialog(label, Array.from(this.selectedEntities));
        return;
      }
      // Device name filter chip remove button
      const filterRemoveBtn = e.target.closest('[data-filter-remove]');
      if (filterRemoveBtn) {
        e.stopPropagation();
        const idx = parseInt(filterRemoveBtn.dataset.filterRemove);
        const removedPattern = (this.savedDeviceFilters[idx] || {}).pattern;
        this.savedDeviceFilters.splice(idx, 1);
        localStorage.setItem('em-saved-device-filters', JSON.stringify(this.savedDeviceFilters));
        // If the removed filter was active, clear it
        if (this.deviceNameFilter === removedPattern) {
          this.deviceNameFilter = '';
          localStorage.setItem('em-device-name-filter', '');
        }
        this._reRenderSidebar();
        this.updateView();
        return;
      }
      // Device name filter chip click (activate saved filter)
      const filterChip = e.target.closest('.em-device-filter-chip');
      if (filterChip) {
        e.stopPropagation();
        const pattern = filterChip.dataset.filterPattern;
        // Toggle: clicking active chip clears filter
        if (this.deviceNameFilter === pattern) {
          this.deviceNameFilter = '';
        } else {
          this.deviceNameFilter = pattern;
        }
        localStorage.setItem('em-device-name-filter', this.deviceNameFilter);
        this._reRenderSidebar();
        this.updateView();
        return;
      }
      const item = e.target.closest('.sidebar-item');
      if (item) { this._handleSidebarItemAction(item); return; }
      const btn = e.target.closest('[data-action]');
      if (btn) this._handleSidebarItemAction(btn);
    });

    // Device name filter: live input filtering
    const deviceFilterInput = this.querySelector('#em-device-name-filter-input');
    if (deviceFilterInput) {
      deviceFilterInput.addEventListener('input', (e) => {
        this.deviceNameFilter = e.target.value;
        localStorage.setItem('em-device-name-filter', this.deviceNameFilter);
        this.updateView();
        // Update chip active states without full re-render
        this.querySelector('.em-sidebar')?.querySelectorAll('.em-device-filter-chip').forEach(chip => {
          const isActive = chip.dataset.filterPattern === this.deviceNameFilter;
          chip.classList.toggle('active', isActive);
          chip.style.background = isActive ? 'var(--em-primary)' : 'var(--em-bg-hover)';
          chip.style.color = isActive ? 'white' : 'var(--em-text-primary)';
        });
      });
    }

    // Device name filter: save button (＋)
    const deviceFilterSave = this.querySelector('#em-device-filter-save');
    if (deviceFilterSave) {
      deviceFilterSave.addEventListener('click', () => {
        const keyword = this.deviceNameFilter.trim();
        if (!keyword) return;
        // Don't save duplicates
        if (this.savedDeviceFilters.some(f => f.pattern === keyword)) {
          this._showToast(`"${keyword}" is already saved`, 'info');
          return;
        }
        this.savedDeviceFilters.push({ label: keyword, pattern: keyword });
        localStorage.setItem('em-saved-device-filters', JSON.stringify(this.savedDeviceFilters));
        this._reRenderSidebar();
        this._showToast(`Saved filter: "${keyword}"`, 'success');
      });
    }
  }

  async _handleSidebarItemAction(item) {
    const action = item.dataset.action;
    const integration = item.dataset.integration;
    const filter = item.dataset.filter;
    const presetId = item.dataset.presetId;
    const groupMode = item.dataset.groupMode;

    if (action === 'activity-timeline') {
      this._openView('activity-timeline');
    } else if (action === 'activity-log') {
      this._openView('activity-log');
    } else if (action === 'columns') {
      this._showColumnSettings();
    } else if (action === 'clear-integration-filter') {
      this.selectedIntegrationFilter = null;
      this.updateView();
      this._reRenderSidebar();
      this._showToast('Showing all integrations', 'info');
    } else if (action === 'show-all-integrations') {
      this.showAllSidebarIntegrations = true;
      this._reRenderSidebar();
    } else if (action === 'collapse-integrations') {
      this.showAllSidebarIntegrations = false;
      this._reRenderSidebar();
    } else if (action === 'history') {
      this._showHistoryDialog();
    } else if (action === 'export') {
      this._exportEntityConfig();
    } else if (action === 'import') {
      this._importEntityConfig();
    } else if (action === 'assign-area-selected') {
      if (!this.selectedEntities.size) return;
      const entities = this._resolveEntitiesById([...this.selectedEntities]);
      try {
        await this._showAreaFloorDialog(`Assign area to ${entities.length} selected entit${entities.length !== 1 ? 'ies' : 'y'}`, entities);
      } catch (e) {
        console.error('[EM] Area assignment failed:', e);
        this._showToast('Failed to open area assignment: ' + (e.message || e), 'error');
      }
    } else if (action === 'naming-improvements') {
      this._pendingSuggestionsSection = 'naming';
      this._openView('suggestions');
    } else if (action === 'label-suggestions') {
      this._pendingSuggestionsSection = 'labels';
      this._openView('suggestions');
    } else if (action === 'new-custom-group') {
      this._showGroupEditorDialog(null);
    } else if (action === 'save-preset') {
      this._saveCurrentFilterPreset();
    } else if (action === 'save-entity-preset') {
      if (this.selectedEntities?.size > 0) this._saveEntityPreset();
    } else if (groupMode) {
      this._setSmartGroupMode(groupMode);
      this.querySelector('.em-sidebar').querySelectorAll('[data-group-mode]').forEach(el => {
        el.classList.toggle('active', el.dataset.groupMode === groupMode);
      });
    } else if (presetId) {
      this._applyFilterPreset(parseInt(presetId));
    } else if (filter === 'favorites') {
      this.searchTerm = '';
      const searchInput = this.content.querySelector('#search-input');
      if (searchInput) searchInput.value = '';
      this._showOnlyFavorites = true;
      this.updateView();
      this._showToast('Showing favorites only', 'info');
    } else if (action === 'load-labels') {
      this.labeledEntitiesCache = null;
      this.labeledDevicesCache = null;
      this.labeledAreasCache = null;
      this.labelsCache = null;
      this.labelsVisibleCount = 8;
      this._loadAndDisplayLabels();
    } else if (action === 'clear-label-filter') {
      this.selectedLabelFilter = null;
      this.updateView();
      this._reRenderSidebar();
      this._showToast('Showing all entities', 'info');
    } else if (action === 'show-all-labels' || action === 'collapse-labels') {
      // No-op — replaced by lazy scroll sentinel
    } else if (action === 'help-guide') {
      this._showHelpGuide();
    } else if (action === 'enable-selected') {
      this.bulkEnable();
    } else if (action === 'disable-selected') {
      this.bulkDisable();
    } else if (action === 'deselect-all') {
      this.selectedEntities.clear();
      this._viewingSelected = false;
      this.updateSelectedCount();
      this._reRenderSidebar();
      this.updateView();
      this._showToast('Selection cleared', 'info');
    } else if (action === 'bulk-rename') {
      this._openBulkRenameDialog();
    } else if (action === 'view-selected') {
      if (!this.selectedEntities.size) return;
      this._viewingSelected = true;
      this._reRenderSidebar();
      this.updateView();
    } else if (action === 'refresh') {
      if (this.viewState === 'updates') {
        this.loadUpdates();
      } else {
        this.loadData();
      }
    } else if (item.dataset.domain !== undefined) {
      this.selectedDomain = item.dataset.domain;
      this._showOnlyFavorites = false;
      this.updateView();
      this.updateDomainOptions();
    } else if (item.dataset.labelId) {
      this._filterByLabel(item.dataset.labelId);
    } else if (integration) {
      this._showOnlyFavorites = false;
      this.viewState = 'all';
      this.selectedDomain = 'all';
      this.searchTerm = '';
      this.selectedIntegrationFilter = integration;
      const searchInput = this.content.querySelector('#search-input');
      if (searchInput) searchInput.value = '';
      this.expandedIntegrations.add(integration);
      this.updateView();
      this._reRenderSidebar();
      this._showToast(`Showing ${integration} entities`, 'info');
    }

    // Entity preset buttons (Enable / Disable / Rename / Delete)
    this.querySelector('.em-sidebar')?.querySelectorAll('.em-preset-enable, .em-preset-disable, .em-preset-rename-btn, .em-preset-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const epId = btn.dataset.epId;
        const presets = this._loadFromStorage('em-presets', []);
        const preset = presets.find(p => p.id === epId);
        if (!preset) return;

        if (btn.classList.contains('em-preset-enable') || btn.classList.contains('em-preset-disable')) {
          const isEnable = btn.classList.contains('em-preset-enable');
          if (!preset.entityIds.length) { this._showToast('Preset is empty', 'info'); return; }
          btn.disabled = true;
          btn.textContent = '…';
          try {
            const wsType = isEnable ? 'entity_manager/bulk_enable' : 'entity_manager/bulk_disable';
            const res = await this._hass.callWS({ type: wsType, entity_ids: preset.entityIds });
            const n = res.success?.length ?? preset.entityIds.length;
            this._showToast(`${isEnable ? 'Enabled' : 'Disabled'} ${n} entit${n !== 1 ? 'ies' : 'y'} in "${preset.name}"`, 'success');
            await this.loadData();
          } catch (err) {
            this._showToast('Preset action failed: ' + (err.message || err), 'error');
            btn.disabled = false;
            btn.textContent = isEnable ? 'Enable' : 'Disable';
          }

        } else if (btn.classList.contains('em-preset-rename-btn')) {
          this._showPromptDialog('Rename Preset', `New name for "${preset.name}":`, preset.name, newName => {
            if (!newName?.trim()) return;
            preset.name = newName.trim();
            this._saveToStorage('em-presets', presets);
            this._reRenderSidebar();
          });

        } else if (btn.classList.contains('em-preset-delete')) {
          if (!confirm(`Delete preset "${preset.name}"?`)) return;
          const updated = presets.filter(p => p.id !== epId);
          this._saveToStorage('em-presets', updated);
          this._reRenderSidebar();
        }
      });
    });

    // Option D: single delegated ripple listener for all .btn clicks
    this._attachRippleListener();
  }

  setActiveFilter() {
    const buttons = this.content.querySelectorAll('[data-filter]');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.viewState);
    });
  }

  updateView() {
    const statsEl = this.content.querySelector('#stats');
    const contentEl = this.content.querySelector('#content');

    // "Bulk Rename" inline view — render rename panel instead of entity list
    if (this._bulkRenameMode) {
      this._renderBulkRenameView();
      return;
    }

    // Active inline view (stat card panels)
    if (this._activeView) {
      this._renderActiveView();
      return;
    }

    // "View Selected" mode — render only selected entities
    if (this._viewingSelected) {
      if (!this.selectedEntities.size) {
        this._viewingSelected = false;
      } else {
        // Collect selected entities from data, preserve integration grouping
        const selectedGroups = [];
        for (const intgData of (this.data || [])) {
          const matchingDevices = {};
          for (const [devId, device] of Object.entries(intgData.devices)) {
            const sel = device.entities.filter(e => this.selectedEntities.has(e.entity_id));
            if (sel.length) matchingDevices[devId] = { ...device, entities: sel };
          }
          if (Object.keys(matchingDevices).length) {
            selectedGroups.push({ ...intgData, devices: matchingDevices });
          }
        }
        const total = this.selectedEntities.size;
        contentEl.innerHTML = `
          <div class="em-view-selected-banner">
            <span>👁 Viewing <strong>${total}</strong> selected entit${total !== 1 ? 'ies' : 'y'}</span>
            <button class="em-view-selected-exit" id="em-exit-view-selected">✕ Exit</button>
          </div>
          ${selectedGroups.map(intg => this.renderIntegration(intg)).join('')}
        `;
        contentEl.querySelector('#em-exit-view-selected')?.addEventListener('click', () => {
          this._viewingSelected = false;
          this._reRenderSidebar();
          this.updateView();
        });
        this.attachIntegrationListeners();
        return;
      }
    }

    this.updateDomainOptions();

    let filteredData = this.data;
    const hasDomainFilter = this.selectedDomain && this.selectedDomain !== 'all';
    const hasSearch = Boolean(this.searchTerm);
    const showOnlyFavorites = this._showOnlyFavorites;
    const hasIntegrationFilter = Boolean(this.selectedIntegrationFilter);
    const hasLabelFilter = Boolean(this.selectedLabelFilter);
    
    // Get entities for selected label (merge entity labels + device labels)
    let labeledEntityIds = null;
    if (hasLabelFilter) {
      const fromEntities = this.labeledEntitiesCache?.[this.selectedLabelFilter]?.entities || [];
      const fromDevices  = this.labeledDevicesCache?.[this.selectedLabelFilter]?.entityIds  || [];
      const fromAreas    = this.labeledAreasCache?.[this.selectedLabelFilter]?.entityIds    || [];
      if (fromEntities.length > 0 || fromDevices.length > 0 || fromAreas.length > 0) {
        labeledEntityIds = new Set([...fromEntities, ...fromDevices, ...fromAreas]);
      }
    }
    
    // Filter by selected integration first
    if (hasIntegrationFilter) {
      filteredData = filteredData.filter(int => int.integration === this.selectedIntegrationFilter);
    }
    
    // Apply domain, search, favorites, and label filters
    if (hasDomainFilter || hasSearch || showOnlyFavorites || hasLabelFilter) {
      filteredData = filteredData.map(integration => {
        const filteredDevices = {};
        Object.entries(integration.devices).forEach(([deviceId, device]) => {
          // Filter entities by domain, search, favorites, and label
          const filteredEntities = device.entities.filter(entity => {
            // Label filter
            if (hasLabelFilter && labeledEntityIds && !labeledEntityIds.has(entity.entity_id)) return false;
            
            // Favorites filter
            if (showOnlyFavorites && !this.favorites.has(entity.entity_id)) return false;
            
            const matchesDomain = !hasDomainFilter || entity.entity_id.startsWith(`${this.selectedDomain}.`);
            if (!matchesDomain) return false;

            if (!hasSearch) return true;

            const entityId = entity.entity_id.toLowerCase();
            const originalName = entity.original_name ? entity.original_name.toLowerCase() : '';
            const integrationName = integration.integration.toLowerCase();
            const deviceName = this.getDeviceName(deviceId).toLowerCase();

            // Use fuzzy matching for search
            const termLower = this.searchTerm.toLowerCase();
            return (
              this._fuzzyMatch(entityId, termLower) ||
              this._fuzzyMatch(originalName, termLower) ||
              this._fuzzyMatch(integrationName, termLower) ||
              this._fuzzyMatch(deviceName, termLower)
            );
          });

          if (filteredEntities.length > 0) {
            filteredDevices[deviceId] = {
              ...device,
              entities: filteredEntities
            };
          }
        });

        return {
          ...integration,
          devices: filteredDevices
        };
      }).filter(integration => Object.keys(integration.devices).length > 0);
    }

    // Calculate stats with enabled/disabled breakdown
    const totalIntegrations = filteredData.length;
    const totalDevices = filteredData.reduce((sum, int) => sum + Object.keys(int.devices).length, 0);
    
    let totalEntities = 0;
    let disabledEntities = 0;
    let enabledEntities = 0;
    
    filteredData.forEach(integration => {
      Object.values(integration.devices).forEach(device => {
        device.entities.forEach(entity => {
          totalEntities++;
          if (entity.is_disabled) {
            disabledEntities++;
          } else {
            enabledEntities++;
          }
        });
      });
    });

    // Render stats
    statsEl.innerHTML = `
      <div class="stat-card" data-stat-type="integrations">
        <div class="stat-label">Integrations</div>
        <div class="stat-value">${totalIntegrations}</div>
      </div>
      ${(() => {
        if (this.viewMode === 'devices' && this.deviceTypeFilter !== 'all') {
          const typeMeta = this._deviceTypeMeta();
          const m = typeMeta[this.deviceTypeFilter] || typeMeta.unknown;
          const typeCount = Object.keys(this.deviceInfo).filter(id => this.getDeviceType(id) === this.deviceTypeFilter).length;
          return `<div class="stat-card" data-stat-type="devices">
            <div class="stat-label">Devices · <span style="color:${m.color}">${m.label}</span></div>
            <div class="stat-value">${typeCount}</div>
          </div>`;
        }
        return `<div class="stat-card" data-stat-type="devices">
          <div class="stat-label">Devices</div>
          <div class="stat-value">${totalDevices}</div>
        </div>`;
      })()}
      <div class="stat-card" data-stat-type="entities">
        <div class="stat-label">Total Entities</div>
        <div class="stat-value">${totalEntities}</div>
      </div>
      <div class="stat-card clickable-stat" data-stat-type="automations-helpers" title="Click to view automations, scripts &amp; helpers">
        <div class="stat-label">Auto / Scripts / Helpers</div>
        <div class="stat-value">${(this.automationCount || 0) + (this.scriptCount || 0) + (this.helperCount || 0)}</div>
      </div>
      <div class="stat-card clickable-stat" data-stat-type="template" title="Click to view templates">
        <div class="stat-label">Templates</div>
        <div class="stat-value">${this.templateCount}</div>
      </div>
      <div class="stat-card clickable-stat" data-stat-type="health-cleanup" title="Click to view health &amp; cleanup">
        <div class="stat-label">Health &amp; Cleanup</div>
        <div class="stat-value" style="color: ${(this.unavailableCount || 0) + (this.cleanupCount || 0) + (this.configHealthCount || 0) > 0 ? 'var(--em-danger)' : 'var(--em-success)'} !important;">${(this.unavailableCount || 0) + (this.cleanupCount || 0) + (this.configHealthCount || 0)}</div>
      </div>
      <div class="stat-card clickable-stat" data-stat-type="hacs" title="Click to view HACS store">
        <div class="stat-label">HACS Store</div>
        <div class="stat-value">${this.hacsCount}</div>
      </div>
      <div class="stat-card clickable-stat" data-stat-type="lovelace" title="Click to view Lovelace cards">
        <div class="stat-label">Card Types</div>
        <div class="stat-value stat-value-lovelace">${this.lovelaceCardCount}</div>
      </div>
      <div class="stat-card clickable-stat" data-stat-type="suggestions" title="Analyze entities for improvements">
        <div class="stat-label">Suggestions</div>
        <div class="stat-value">💡</div>
      </div>
      ${(() => {
        const bm = (this.data || []).find(i => i.integration === 'browser_mod');
        if (!bm) return '';
        const browserEntries = Object.entries(bm.devices).filter(([k]) => k !== 'no_device');
        const browserCount = browserEntries.length;
        const staleThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let hasStale = false;
        let activeCount = 0;
        browserEntries.forEach(([, device]) => {
          const lastActive = device.entities.reduce((max, e) => {
            const t = this._hass?.states[e.entity_id]?.last_changed;
            return t ? Math.max(max, new Date(t).getTime()) : max;
          }, 0);
          if (lastActive && lastActive < staleThreshold) hasStale = true;
          const activeEnt = device.entities.find(e => e.entity_id.startsWith('binary_sensor.') && e.entity_id.endsWith('_active'));
          if (activeEnt && this._hass?.states[activeEnt.entity_id]?.state === 'on') activeCount++;
        });
        const activeLabel = activeCount > 0 ? `<div style="font-size:0.72em;color:var(--em-success);margin-top:2px">● ${activeCount} active</div>` : '';
        return `
          <div class="stat-card clickable-stat" data-stat-type="browsers" title="Click to manage browser_mod browsers">
            <div class="stat-label">Browsers${hasStale ? ' ⚠' : ''}</div>
            <div class="stat-value">${browserCount}</div>
            ${activeLabel}
          </div>`;
      })()}
    `;

    // Entity health alert banner — shown above stat cards when unavailable count exceeds threshold
    this._updateHealthBanner();

    // Attach click listeners to clickable stat cards
    statsEl.querySelectorAll('.clickable-stat[data-stat-type]').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.statType;
        if (type === 'entities') {
          this._showAllEntitiesDialog();
        } else {
          this._openView(type);
        }
      });
    });

    const allBtn = this.content.querySelector('[data-filter="all"]');
    const enabledBtn = this.content.querySelector('[data-filter="enabled"]');
    const disabledBtn = this.content.querySelector('[data-filter="disabled"]');
    const updatesBtn = this.content.querySelector('[data-filter="updates"]');
    if (allBtn) allBtn.innerHTML = `All (<span class="filter-count">${totalEntities}</span>)`;
    if (enabledBtn) enabledBtn.innerHTML = `Enabled (<span class="filter-count">${enabledEntities}</span>)`;
    if (disabledBtn) disabledBtn.innerHTML = `Disabled (<span class="filter-count">${disabledEntities}</span>)`;
    if (updatesBtn) updatesBtn.innerHTML = `Updates (<span class="filter-count">${this.updateCount}</span>)`;

    // Option B: animate stat counters; Option C: stagger stat cards (only on panel load/navigation)
    if (this._playAnimations) {
      this._animateStatCounters(statsEl);
      statsEl.querySelectorAll('.stat-card').forEach((card, i) => {
        card.style.animation = `em-stagger-in 1.05s ease both`;
        card.style.animationDelay = `${i * 105}ms`;
      });
      this._playAnimations = false;
    }

    // Render content
    if (filteredData.length === 0) {
      let emptyMessage = 'No entities found';
      let emptyDesc = '';
      
      if (hasSearch) {
        emptyMessage = 'No matching entities';
        emptyDesc = `No entities match "${this._escapeHtml(this.searchTerm)}"`;
      } else if (hasDomainFilter) {
        emptyMessage = 'No entities in domain';
        emptyDesc = `No entities found for domain "${this._escapeHtml(this.selectedDomain)}"`;
      } else if (this.viewState === 'disabled') {
        emptyMessage = 'No disabled entities';
        emptyDesc = 'All entities are currently enabled';
      } else if (this.viewState === 'enabled') {
        emptyMessage = 'No enabled entities';
        emptyDesc = 'All entities are currently disabled';
      } else {
        emptyMessage = 'No entities';
        emptyDesc = 'No entities found in the system';
      }
      
      contentEl.innerHTML = `
        <div class="empty-state">
          <h2>${emptyMessage}</h2>
          <p>${emptyDesc}</p>
        </div>
      `;
      return;
    }

    // Check if groups mode is active
    if (this.smartGroupMode !== 'integration') {
      const smartGroups = this._getSmartGroups();
      if (smartGroups) {
        // Apply the same filters to smart groups
        const filteredGroups = {};
        Object.entries(smartGroups).forEach(([groupKey, entities]) => {
          const filtered = entities.filter(entity => {
            // View state filter
            if (this.viewState === 'enabled' && entity.is_disabled) return false;
            if (this.viewState === 'disabled' && !entity.is_disabled) return false;
            
            // Domain filter
            if (this.selectedDomain !== 'all' && !entity.entity_id.startsWith(`${this.selectedDomain}.`)) return false;
            
            // Favorites filter
            if (this._showOnlyFavorites && !this.favorites.has(entity.entity_id)) return false;
            
            // Search filter
            if (this.searchTerm) {
              const term = this.searchTerm.toLowerCase();
              return entity.entity_id.toLowerCase().includes(term) ||
                     (entity.original_name || '').toLowerCase().includes(term) ||
                     entity.integration.toLowerCase().includes(term);
            }
            
            return true;
          });
          
          if (filtered.length > 0) {
            filteredGroups[groupKey] = filtered;
          }
        });
        
        this._renderedSmartGroups = filteredGroups;
        contentEl.innerHTML = this._renderSmartGroups(filteredGroups);
        this.attachIntegrationListeners();
        if (this._playAnimations) {
          contentEl.querySelectorAll('.smart-group').forEach((el, i) => {
            el.style.animation = `em-stagger-in 1.2s ease both`;
            el.style.animationDelay = `${i * 165}ms`;
          });
        }
        return;
      }
    }

    const sortedData = [...filteredData].sort((a, b) =>
      a.integration.localeCompare(b.integration, undefined, { sensitivity: 'base' })
    );

    // View mode: integrations / devices
    if (this.viewMode === 'integrations') {
      contentEl.innerHTML = this._renderIntegrationsView(sortedData);
      this.attachIntegrationListeners();
      return;
    }
    if (this.viewMode === 'devices') {
      contentEl.innerHTML = this._renderDevicesView(sortedData);
      this.attachIntegrationListeners();
      return;
    }

    contentEl.innerHTML = sortedData.map(integration =>
      this.renderIntegration(integration)
    ).join('');

    // Re-attach event listeners for integration headers and entity checkboxes
    this.attachIntegrationListeners();

    // Option C: stagger integration group cards (only on panel load/navigation)
    if (this._playAnimations) {
      contentEl.querySelectorAll('.integration-group').forEach((el, i) => {
        el.style.animation = `em-stagger-in 1.2s ease both`;
        el.style.animationDelay = `${i * 165}ms`;
      });
    }
  }

  _renderSmartGroups(groups) {
    const sortedKeys = Object.keys(groups).sort();
    
    const modeLabels = {
      'room': 'Room',
      'type': 'Entity Type',
      'floor': 'Floor'
    };

    const modeIcons = {
      'room': '🏠',
      'type': '📂',
      'floor': '🏢'
    };

    return sortedKeys.map(groupKey => {
      const entities = groups[groupKey];
      const isExpanded = this.expandedIntegrations.has(`smart_${groupKey}`);
      const enabledCount = entities.filter(e => !e.is_disabled).length;
      const disabledCount = entities.filter(e => e.is_disabled).length;

      // Format group name
      let displayName = groupKey;
      if (this.smartGroupMode === 'type') {
        displayName = groupKey.charAt(0).toUpperCase() + groupKey.slice(1).replace(/_/g, ' ');
      } else if (this.smartGroupMode === 'room') {
        displayName = groupKey === 'Unassigned' ? '📍 Unassigned' : groupKey;
      } else if (this.smartGroupMode === 'floor') {
        // groupKey is already formatted as "Floor › Area" or "No Floor › Area" or "No Floor / No Area"
        displayName = groupKey;
      }
      
      const isUnassigned = (this.smartGroupMode === 'room'  && groupKey === 'Unassigned') ||
                           (this.smartGroupMode === 'floor' && groupKey === 'No Floor / No Area');

      return `
        <div class="smart-group ${isExpanded ? 'expanded' : ''}" data-smart-group="${this._escapeAttr(groupKey)}">
          <div class="smart-group-header" data-smart-group-toggle="${this._escapeAttr(groupKey)}">
            <label class="smart-group-select-wrap" title="Select all in this group">
              <input type="checkbox" class="smart-group-select-checkbox" data-group-key="${this._escapeAttr(groupKey)}">
            </label>
            <span class="smart-group-icon">${modeIcons[this.smartGroupMode] || '📁'}</span>
            <span class="smart-group-name">${this._escapeHtml(displayName)}</span>
            <span class="smart-group-count">${entities.length} entities</span>
            <span class="smart-group-stats">
              <span style="color:var(--em-success)">${enabledCount}</span> /
              <span style="color:var(--em-danger)">${disabledCount}</span>
            </span>
            <div class="smart-group-actions">
              <button class="btn btn-secondary smart-group-enable-all" data-group-key="${this._escapeAttr(groupKey)}">Enable All</button>
              <button class="btn btn-secondary smart-group-disable-all" data-group-key="${this._escapeAttr(groupKey)}">Disable All</button>
              <button class="btn btn-secondary smart-group-assign-area" data-group-key="${this._escapeAttr(groupKey)}" title="Assign area to all entities in this group" style="color:var(--em-primary);border-color:var(--em-primary)">📍 Assign Area</button>
              ${this.smartGroupMode === 'custom' && groupKey !== '📦 Ungrouped' ? `
                <button class="btn btn-secondary smart-group-delete-custom" data-group-key="${this._escapeAttr(groupKey)}" title="Delete this custom group" style="color:var(--em-danger);border-color:var(--em-danger)">🗑 Delete</button>
              ` : ''}
            </div>
            <span class="smart-group-expand"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
          </div>
          ${isExpanded ? `
            <div class="smart-group-content">
              ${isUnassigned ? (() => {
                // Sub-group unassigned entities: Integration → Device → Entities
                const byIntg = {};
                for (const entity of entities) {
                  const intg = entity.integration || 'unknown';
                  if (!byIntg[intg]) byIntg[intg] = {};
                  const devId = entity.device_id || '__no_device__';
                  if (!byIntg[intg][devId]) byIntg[intg][devId] = [];
                  byIntg[intg][devId].push(entity);
                }
                return Object.entries(byIntg).sort(([a],[b]) => a.localeCompare(b)).map(([intg, byDev]) => {
                  const intgTotal = Object.values(byDev).flat().length;
                  const intgLabel = `${this._escapeHtml(intg.charAt(0).toUpperCase() + intg.slice(1))} <span style="opacity:0.6;font-size:11px">(${intgTotal})</span>`;
                  const devGroups = Object.entries(byDev).map(([devId, devEnts]) => {
                    const devName = devId === '__no_device__' ? 'No device' : this.getDeviceName(devId);
                    const devLabel = `${this._escapeHtml(devName)} <span style="opacity:0.6;font-size:11px">(${devEnts.length})</span>`;
                    const devBody = devEnts.map(e => this._renderEntityItem(e, e.integration)).join('');
                    return this._collGroup(devLabel, devBody);
                  }).join('');
                  return this._collGroup(intgLabel, devGroups);
                }).join('');
              })() : entities.map(entity => this._renderEntityItem(entity, entity.integration)).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  _renderIntegrationsView(sortedData) {
    if (!sortedData.length) {
      return `<div class="empty-state"><h2>No integrations found</h2><p>Try adjusting your filters</p></div>`;
    }
    return sortedData.map(integration => this.renderIntegration(integration)).join('');
  }

  _renderDevicesView(sortedData) {
    const allDevices = [];
    sortedData.forEach(integration => {
      Object.entries(integration.devices).forEach(([deviceId, device]) => {
        const name = (this.deviceInfo?.[deviceId]?.name_by_user || this.deviceInfo?.[deviceId]?.name || deviceId || '').trim();
        allDevices.push({ deviceId, device, integration: integration.integration, name });
      });
    });

    // Filter offline / type
    const isDeviceOffline = (device) => {
      const withState = device.entities.filter(e => this._hass?.states[e.entity_id]);
      return withState.length > 0 && withState.every(e => this._hass.states[e.entity_id].state === 'unavailable');
    };
    const filteredDevices = allDevices.filter(({ device, deviceId }) => {
      if (this.showOfflineOnly && !isDeviceOffline(device)) return false;
      if (this.deviceTypeFilter !== 'all' && this.getDeviceType(deviceId) !== this.deviceTypeFilter) return false;
      return true;
    });

    if (!filteredDevices.length) {
      return `<div class="empty-state"><h2>No devices found</h2><p>Try adjusting your filters</p></div>`;
    }

    filteredDevices.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    return filteredDevices.map(({ deviceId, device, integration }) =>
      this._renderDeviceCard(deviceId, device, integration)
    ).join('');
  }

  _showIntegrationDetailDialog(integrationName) {
    const integration = (this.data || []).find(i => i.integration === integrationName);
    if (!integration) return;
    const intLabel = integrationName.charAt(0).toUpperCase() + integrationName.slice(1);
    const deviceEntries = Object.entries(integration.devices).filter(([d]) => d !== 'no_device');
    const total = integration.total_entities;
    const disabled = integration.disabled_entities;
    const deviceCount = deviceEntries.length;

    // Overview
    const overviewHtml = `
      <div style="padding:4px 0">
        ${[
          ['Integration', intLabel],
          ['Domain / Platform', integrationName],
          ['Devices', String(deviceCount)],
          ['Total Entities', String(total)],
          ['Disabled Entities', disabled > 0 ? `<span style="color:var(--em-warning)">${disabled}</span>` : '0'],
        ].map(([k, v]) => `
          <div style="display:flex;gap:12px;padding:5px 0;border-bottom:1px solid var(--em-border)">
            <span style="font-size:0.82em;opacity:0.65;min-width:130px;flex-shrink:0">${k}</span>
            <span style="font-size:0.9em">${v}</span>
          </div>`).join('')}
      </div>`;

    // Devices list
    const devicesHtml = deviceEntries.length
      ? deviceEntries.map(([deviceId, device]) => {
          const devName = this.getDeviceName ? this.getDeviceName(deviceId) : (this.deviceInfo?.[deviceId]?.name_by_user || this.deviceInfo?.[deviceId]?.name || deviceId);
          const dc = device.entities.filter(e => e.is_disabled).length;
          return `<div style="padding:6px 0;border-bottom:1px solid var(--em-border);display:flex;gap:8px;align-items:center">
            <span style="flex:1;font-size:0.9em">${this._escapeHtml(devName)}</span>
            <span style="font-size:0.82em;opacity:0.6">${device.entities.length} entit${device.entities.length !== 1 ? 'ies' : 'y'}${dc > 0 ? ` · <span style="color:var(--em-warning)">${dc} disabled</span>` : ''}</span>
          </div>`;
        }).join('')
      : '<p style="opacity:0.5;font-size:0.9em;padding:8px 0">No devices</p>';

    // Statistics - domain breakdown
    const domainCounts = {};
    Object.values(integration.devices).forEach(dev => {
      dev.entities.forEach(e => {
        const dom = e.entity_id.split('.')[0];
        domainCounts[dom] = (domainCounts[dom] || 0) + 1;
      });
    });
    const statsHtml = Object.entries(domainCounts).sort((a,b) => b[1]-a[1]).map(([dom, count]) =>
      `<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--em-border)">
        <span style="flex:1;font-size:0.9em">${this._escapeHtml(dom)}</span>
        <span style="font-size:0.82em;opacity:0.7">${count} entit${count !== 1 ? 'ies' : 'y'}</span>
      </div>`
    ).join('');

    const bodyHtml = `
      ${this._collGroup('<strong>Overview</strong>', overviewHtml, true)}
      ${this._collGroup(`Devices (${deviceCount})`, `<div style="padding:0 4px">${devicesHtml}</div>`)}
      ${this._collGroup('Statistics', `<div style="padding:0 4px">${statsHtml}</div>`)}
    `;

    const { overlay: intOverlay, closeDialog: closeIntDialog } = this.createDialog({
      title: intLabel,
      color: 'var(--em-primary)',
      extraClass: 'entity-list-dialog',
      contentHtml: `<div class="entity-list-content">${bodyHtml}</div>`,
      actionsHtml: `<button class="btn btn-secondary" id="em-int-detail-close">Close</button>`,
    });

    this._reAttachCollapsibles(intOverlay);
    intOverlay.querySelector('#em-int-detail-close')?.addEventListener('click', closeIntDialog);
  }

  _showDeviceDetailDialog(deviceId, integrationName) {
    const integration = (this.data || []).find(i => i.integration === integrationName || i.devices[deviceId]);
    const device = integration?.devices[deviceId];
    if (!device) return;
    const intName = integration.integration;
    const intLabel = intName.charAt(0).toUpperCase() + intName.slice(1);
    const devInfo = this.deviceInfo?.[deviceId] || {};
    const devName = devInfo.name_by_user || devInfo.name || deviceId;
    const total = device.entities.length;
    const disabled = device.entities.filter(e => e.is_disabled).length;

    // Overview
    const overviewRows = [
      ['Device Name', devName],
      ['Integration', intLabel],
      devInfo.manufacturer ? ['Manufacturer', devInfo.manufacturer] : null,
      devInfo.model ? ['Model', devInfo.model] : null,
      devInfo.sw_version ? ['SW Version', devInfo.sw_version] : null,
      devInfo.hw_version ? ['HW Version', devInfo.hw_version] : null,
      devInfo.serial_number ? ['Serial Number', `<code style="font-size:0.85em">${this._escapeHtml(devInfo.serial_number)}</code>`] : null,
      ['Total Entities', String(total)],
      ['Disabled Entities', disabled > 0 ? `<span style="color:var(--em-warning)">${disabled}</span>` : '0'],
    ].filter(Boolean);

    const overviewHtml = `<div style="padding:4px 0">
      ${overviewRows.map(([k, v]) => `
        <div style="display:flex;gap:12px;padding:5px 0;border-bottom:1px solid var(--em-border)">
          <span style="font-size:0.82em;opacity:0.65;min-width:130px;flex-shrink:0">${k}</span>
          <span style="font-size:0.9em">${v}</span>
        </div>`).join('')}
    </div>`;

    // Entities list
    const entitiesHtml = device.entities.map(entity => {
      const st = this._hass?.states[entity.entity_id];
      const stateVal = entity.is_disabled ? 'disabled' : (st?.state ?? '—');
      const stateColor = entity.is_disabled ? '#9e9e9e' : (stateVal === 'unavailable' ? 'var(--em-danger)' : (stateVal === 'on' ? 'var(--em-success)' : 'var(--em-bg-secondary)'));
      const textColor = (entity.is_disabled || stateVal === 'unavailable' || stateVal === 'on') ? '#fff' : 'var(--em-text-primary)';
      return `<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--em-border);align-items:center;flex-wrap:wrap">
        <span style="flex:1;font-size:0.85em">${this._escapeHtml(entity.original_name || entity.entity_id)}</span>
        <span style="font-size:0.78em;opacity:0.6;flex:1;min-width:100px">${this._escapeHtml(entity.entity_id)}</span>
        <span style="padding:1px 8px;border-radius:10px;font-size:0.78em;font-weight:600;background:${stateColor};color:${textColor};white-space:nowrap">${this._escapeHtml(stateVal)}</span>
      </div>`;
    }).join('');

    // Statistics
    const domainCounts = {};
    device.entities.forEach(e => {
      const dom = e.entity_id.split('.')[0];
      domainCounts[dom] = (domainCounts[dom] || 0) + 1;
    });
    const statsHtml = Object.entries(domainCounts).sort((a,b) => b[1]-a[1]).map(([dom, count]) =>
      `<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--em-border)">
        <span style="flex:1;font-size:0.9em">${this._escapeHtml(dom)}</span>
        <span style="font-size:0.82em;opacity:0.7">${count}</span>
      </div>`
    ).join('');

    const bodyHtml = `
      ${this._collGroup('<strong>Overview</strong>', overviewHtml, true)}
      ${this._collGroup(`Entities (${total})`, `<div style="padding:0 4px">${entitiesHtml}</div>`)}
      ${this._collGroup('Statistics', `<div style="padding:0 4px">${statsHtml}</div>`)}
    `;

    const { overlay: devOverlay, closeDialog: closeDevDialog } = this.createDialog({
      title: devName,
      color: 'var(--em-primary)',
      extraClass: 'entity-list-dialog',
      contentHtml: `<div class="entity-list-content">${bodyHtml}</div>`,
      actionsHtml: `<button class="btn btn-secondary" id="em-dev-detail-close">Close</button>`,
    });

    this._reAttachCollapsibles(devOverlay);
    devOverlay.querySelector('#em-dev-detail-close')?.addEventListener('click', closeDevDialog);
  }

  _renderDeviceCard(deviceId, device, integration) {
    const _dvf = this.deviceViewFilter[deviceId];
    const filterClass = _dvf === 'enabled' ? 'em-filter-enabled' : _dvf === 'disabled' ? 'em-filter-disabled' : '';
    return this._buildDeviceCard(deviceId, device, integration, {
      showSelectCheckbox: true,
      showViewFilters: true,
      filterClass,
      filterAttr: this._escapeAttr(deviceId),
    });
  }

  renderIntegration(integration) {
    const isExpanded = this.expandedIntegrations.has(integration.integration);
    const deviceCount = Object.keys(integration.devices).length;
    
    let entityCount = 0;
    let disabledCount = 0;
    let enabledCount = 0;
    
    // Collect all entities from all devices
    const allEntities = [];
    Object.entries(integration.devices).forEach(([deviceId, device]) => {
      device.entities.forEach(entity => {
        entityCount++;
        if (entity.is_disabled) {
          disabledCount++;
        } else {
          enabledCount++;
        }
        allEntities.push({
          ...entity,
          deviceId,
          deviceName: this.getDeviceName(deviceId)
        });
      });
    });

    const intName = this._escapeAttr(integration.integration);
    const intDisplay = this._escapeHtml(integration.integration.charAt(0).toUpperCase() + integration.integration.slice(1));
    const intInitial = this._escapeHtml(integration.integration.charAt(0).toUpperCase());

    const _ivf = this.integrationViewFilter[integration.integration];
    const _filterClass = _ivf === 'enabled' ? 'em-filter-enabled' : _ivf === 'disabled' ? 'em-filter-disabled' : '';

    return `
      <div class="integration-group integration-card ${_filterClass}" data-integration="${intName}">
        <div class="integration-header" data-integration="${intName}">
          <div class="integration-select-wrapper" title="Select all in this integration">
            <label class="integration-select-label">
              <input type="checkbox" class="integration-select-checkbox" data-integration="${intName}">
              <span class="integration-select-text">Select all</span>
            </label>
          </div>
          <div class="integration-logo-container">
            <img class="integration-logo" src="${this._brandIconUrl(integration.integration)}" alt="${intName}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22><text x=%2224%22 y=%2232%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999%22>${intInitial}</text></svg>'">
          </div>
          <span class="integration-icon ${isExpanded ? 'expanded' : ''}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          <div class="integration-info">
            <div class="integration-name">${intDisplay}</div>
            <div class="integration-stats">${deviceCount} device${deviceCount !== 1 ? 's' : ''} • ${entityCount} entit${entityCount !== 1 ? 'ies' : 'y'} (<span style="color:var(--em-success)">${enabledCount} enabled</span> / <span style="color:var(--em-danger)">${disabledCount} disabled</span>)</div>
          </div>
          <div class="integration-actions">
            <button class="btn view-integration-enabled ${_ivf === 'enabled' ? 'btn-primary' : 'btn-secondary'}" data-integration="${intName}" title="Show only enabled entities" style="${_ivf === 'enabled' ? '' : 'color:var(--em-success);border-color:var(--em-success)'}">View Enabled</button>
            <button class="btn view-integration-disabled ${_ivf === 'disabled' ? 'btn-primary' : 'btn-secondary'}" data-integration="${intName}" title="Show only disabled entities" style="${_ivf === 'disabled' ? '' : 'color:var(--em-danger);border-color:var(--em-danger)'}">View Disabled</button>
            <button class="btn btn-secondary enable-integration" data-integration="${intName}">Enable All</button>
            <button class="btn btn-secondary disable-integration" data-integration="${intName}">Disable All</button>
          </div>
        </div>
        ${isExpanded ? `
          <div class="integration-devices" data-integration="${intName}">
            ${Object.entries(integration.devices)
              .sort(([idA], [idB]) =>
                this.getDeviceName(idA).localeCompare(this.getDeviceName(idB), undefined, { sensitivity: 'base' })
              )
              .map(([deviceId, device]) =>
                this.renderDevice(deviceId, device, integration.integration)
              ).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityListWithLazyLoad(entities, integrationId) {
    // Get current visible count for this integration
    const visibleCount = this.visibleEntityCounts[integrationId] || this.initialLoadCount;
    const visibleEntities = entities.slice(0, visibleCount);
    const hasMore = entities.length > visibleCount;
    const remainingCount = entities.length - visibleCount;

    const entityHtml = visibleEntities.map(entity => this._renderEntityItem(entity, integrationId)).join('');
    
    const loadMoreBtn = hasMore ? `
      <div class="load-more-container">
        <button class="btn btn-secondary load-more-btn" data-integration="${integrationId}" data-remaining="${remainingCount}">
          Load More (${remainingCount} remaining)
        </button>
        <button class="btn btn-secondary load-all-btn" data-integration="${integrationId}" data-total="${entities.length}">
          Load All
        </button>
      </div>
    ` : '';

    return entityHtml + loadMoreBtn;
  }

  _renderEntityItem(entity, integrationId) {
    const alias = this.entityAliases[entity.entity_id] || '';
    const eid = this._escapeAttr(entity.entity_id);
    const iid = this._escapeAttr(integrationId);
    const col = (id) => this.visibleColumns.includes(id);
    const configUrl = entity.device_id ? (this.deviceInfo?.[entity.device_id]?.configuration_url || '') : '';
    const state = this._hass?.states[entity.entity_id];

    const TOGGLE_DOMAINS = new Set(['light','switch','input_boolean','fan','automation',
      'media_player','remote','siren','vacuum','humidifier','cover','lock','climate',
      'water_heater','script','valve','lawn_mower']);
    const domain = entity.entity_id.split('.')[0];
    const isToggleable = TOGGLE_DOMAINS.has(domain) && !entity.is_disabled;
    const isPressable = domain === 'button' && !entity.is_disabled;
    const isOn = state?.state === 'on' || state?.state === 'open' || state?.state === 'unlocked'
      || state?.state === 'playing' || state?.state === 'cleaning';

    // Area / floor lookup — entity-level area takes precedence over device-level (HA behaviour)
    const entityAreaId  = this.entityAreaMap?.get(entity.entity_id) || null;
    const deviceAreaId  = entity.device_id ? (this.deviceInfo?.[entity.device_id]?.area_id || null) : null;
    const effectiveAreaId = entityAreaId || deviceAreaId;
    const areaInfo = effectiveAreaId ? (this.areaLookup?.get(effectiveAreaId) || null) : null;

    // Header band: device name, area+floor chip, state chip, time chip
    const deviceChip = col('device') && entity.deviceName
      ? `<span class="entity-header-device">📱 ${this._escapeHtml(entity.deviceName)}</span>` : '';
    const canAssignArea = !!entity.device_id || !!entityAreaId;
    const areaChip = canAssignArea
      ? `<span class="entity-header-area${areaInfo ? '' : ' em-area-unset'}"
             title="${areaInfo ? this._escapeAttr(areaInfo.areaName) : 'No area assigned'}">📍 ${areaInfo ? this._escapeHtml(areaInfo.areaName) : '<span class="em-area-placeholder">No area</span>'}</span>`
      : '';
    const floorChip = canAssignArea
      ? `<span class="entity-header-floor-chip${(areaInfo && areaInfo.floorName) ? '' : ' em-area-unset'}"
             title="${(areaInfo && areaInfo.floorName) ? this._escapeAttr(areaInfo.floorName) : 'No floor assigned'}">🏢 ${(areaInfo && areaInfo.floorName) ? this._escapeHtml(areaInfo.floorName) : '<span class="em-area-placeholder">No floor</span>'}</span>`
      : '';
    const isIsoDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s);
    const rawState = state?.state ?? '';
    const stateDisplay = isIsoDate(rawState)
      ? this._fmtAgo(rawState)
      : rawState + (state?.attributes?.unit_of_measurement ? ' ' + state.attributes.unit_of_measurement : '');
    const stateChip = col('state') && state
      ? `<span class="entity-header-chip-label">State</span><span class="entity-header-state">⚡ ${this._escapeHtml(stateDisplay)}</span>` : '';
    // Use recorder-backed cache for last-active timestamp (survives HA restarts).
    // Falls back to state.last_changed if the cache hasn't loaded yet.
    const _cachedTs = this._lastActivityCache?.get(entity.entity_id);
    const _timeMs = _cachedTs ?? (state?.last_changed ? new Date(state.last_changed).getTime() : null);
    const timeChip = col('lastChanged') && _timeMs
      ? `<span class="entity-header-chip-label">Last active</span><span class="entity-header-time">🕐 ${this._escapeHtml(this._formatTimeDiff(Date.now() - _timeMs))} ago</span>` : '';
    const hasHeader = deviceChip || areaChip || floorChip || stateChip || timeChip;

    const hasBottom = col('checkbox') || col('favorite') || col('actions');

    return `
      <div class="entity-item${isToggleable && isOn ? ' entity-is-on' : ''}" data-entity-id="${eid}" data-disabled="${entity.is_disabled ? 'true' : 'false'}">
        ${hasHeader ? `<div class="entity-card-header">${deviceChip}${areaChip}${floorChip}${stateChip}${timeChip}</div>` : ''}
        <div class="entity-card-body">
          ${col('alias') && alias ? `<div class="entity-alias" style="font-size: 13px; color: var(--em-primary); font-weight: 500;">${this._escapeHtml(alias)}</div>` : ''}
          ${col('name') && entity.original_name ? `<div class="entity-name">${this._escapeHtml(entity.original_name)}</div>` : ''}
          ${col('device') && entity.deviceName ? `<div class="entity-device-name">${this._escapeHtml(entity.deviceName)}</div>` : ''}
          ${col('id') ? `<div class="entity-id">${this._escapeHtml(entity.entity_id)}</div>` : ''}
        </div>
        ${col('status') ? `<span class="entity-badge" style="background: ${entity.is_disabled ? '#f44336' : '#4caf50'} !important;">${entity.is_disabled ? 'Disabled' : 'Enabled'}</span>` : ''}
        ${hasBottom ? `<div class="entity-item-bottom">
          <div class="entity-bottom-left">
            ${col('checkbox') ? `<input type="checkbox" class="entity-checkbox" data-entity-id="${eid}" data-integration="${iid}" data-device-id="${this._escapeAttr(entity.device_id || '')}"${this.selectedEntities.has(entity.entity_id) ? ' checked' : ''}>` : ''}
            ${col('favorite') ? `<button class="favorite-btn ${this.favorites.has(entity.entity_id) ? 'is-favorite' : ''}" data-entity-id="${eid}" title="Toggle favorite">
              ${this.favorites.has(entity.entity_id) ? '★' : '☆'}
            </button>` : ''}
          </div>
          ${col('actions') ? `<div class="entity-actions">
            <button class="icon-btn open-ha-btn" data-entity-id="${eid}" title="Open in Home Assistant">
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 3L2 12h3v9h6v-5h2v5h6v-9h3L12 3z"/><text x="12" y="17.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="white" font-family="sans-serif">HA</text></svg>
            </button>
            ${configUrl ? `<a class="icon-btn entity-config-url" href="${this._escapeAttr(configUrl)}" target="_blank" title="Open device page">🔗</a>` : ''}
            ${isToggleable ? `<button class="icon-btn toggle-entity${isOn ? ' toggle-on' : ''}" data-entity-id="${eid}" title="${isOn ? 'Turn off' : 'Turn on'}"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>` : ''}
            ${isPressable ? `<button class="icon-btn press-entity" data-entity-id="${eid}" title="Press">▶</button>` : ''}
            <button class="icon-btn rename-entity" data-entity-id="${eid}" title="Rename">✎</button>
            <button class="icon-btn enable-entity" data-entity-id="${eid}" title="Enable">✓</button>
            <button class="icon-btn disable-entity" data-entity-id="${eid}" title="Disable">✕</button>
            <button class="icon-btn bulk-rename-btn" data-action="bulk-rename" title="Bulk Rename Selected" ${this.selectedEntities.size >= 2 ? '' : 'disabled'}>✎✎</button>
            <button class="icon-btn bulk-labels-btn" data-action="bulk-labels" title="Bulk Labels Selected" ${this.selectedEntities.size >= 2 ? '' : 'disabled'}>🏷️</button>
            <button class="icon-btn bulk-delete-btn" data-action="bulk-delete" title="Delete Selected" style="display:${this.selectedEntities.has(eid) ? '' : 'none'}">🗑</button>
          </div>` : ''}
        </div>` : ''}
      </div>
    `;
  }

  _loadMoreEntities(integrationId, loadAll = false) {
    const integration = (this.data || []).find(int => int.integration === integrationId);
    if (!integration) return;

    const totalEntities = Object.values(integration.devices || {}).reduce(
      (count, device) => count + (device.entities?.length || 0), 0
    );

    if (loadAll) {
      this.visibleEntityCounts[integrationId] = totalEntities;
    } else {
      const currentCount = this.visibleEntityCounts[integrationId] || this.initialLoadCount;
      this.visibleEntityCounts[integrationId] = Math.min(currentCount + this.loadMoreCount, totalEntities);
    }

    this.updateView();
  }

  _buildDeviceCard(deviceId, device, integration, opts = {}) {
    const {
      showSelectCheckbox = false,
      showViewFilters = false,
      filterClass = '',
      filterAttr = '',
    } = opts;

    const isExpanded = this.expandedDevices.has(deviceId);
    const enabledCount = device.entities.filter(e => !e.is_disabled).length;
    const disabledCount = device.entities.filter(e => e.is_disabled).length;
    const deviceEntityIds = device.entities.map(e => this._escapeAttr(e.entity_id)).join(',');
    const areaId = this.deviceInfo?.[deviceId]?.area_id;
    const areaName = areaId ? (this.floorsData?.areas?.find(a => a.area_id === areaId)?.name || areaId) : null;

    const selectedCount = device.entities.filter(e => this.selectedEntities.has(e.entity_id)).length;
    const totalCount = device.entities.length;
    const selectionIndicator = selectedCount === 0 ? '' :
      selectedCount === totalCount
        ? '<span class="device-sel-indicator device-sel-all" title="All entities selected">✓</span>'
        : `<span class="device-sel-indicator device-sel-partial" title="${selectedCount}/${totalCount} selected">✓</span>`;

    const devName = this.getDeviceName(deviceId);
    const deviceIdEsc = this._escapeAttr(deviceId);
    const SENSOR_DOMAINS = new Set(['sensor', 'binary_sensor']);
    const CAT_BUCKETS = [
      { label: '⚡ Controls',       cls: 'cat-controls',     match: e => !e.entity_category && !SENSOR_DOMAINS.has(e.entity_id.split('.')[0]) },
      { label: '📊 Sensors',        cls: 'cat-sensors',      match: e => !e.entity_category && SENSOR_DOMAINS.has(e.entity_id.split('.')[0]) },
      { label: '⚙️ Configuration',  cls: 'cat-config',       match: e => e.entity_category === 'config' },
      { label: '🔧 Diagnostic',     cls: 'cat-diagnostic',   match: e => e.entity_category === 'diagnostic' },
      { label: '📡 Connectivity',   cls: 'cat-connectivity', match: e => e.entity_category === 'connectivity' },
    ];
    const allEntitiesForDevice = device.entities.map(e => ({ ...e, deviceName: devName, integration }));
    const catCardsHtml = isExpanded ? CAT_BUCKETS
      .map(b => ({ ...b, entities: allEntitiesForDevice.filter(b.match).sort((a, z) =>
        (a.original_name || a.entity_id).localeCompare(z.original_name || z.entity_id, undefined, { sensitivity: 'base' })
      )}))
      .filter(b => b.entities.length > 0)
      .map(b => this._renderCatCard(devName, b.label, b.cls, b.entities, deviceId))
      .join('') : '';

    const { label: typeLabel, color: typeColor } = (this._deviceTypeMeta()[this.getDeviceType(deviceId)] || this._deviceTypeMeta().unknown);
    const typeBadge = `<span class="device-type-badge" style="font-size:10px;padding:1px 7px;border-radius:10px;border:1px solid ${typeColor};color:${typeColor};white-space:nowrap;flex-shrink:0">${typeLabel}</span>`;

    const viewFilterBtns = showViewFilters ? `
            <button class="btn view-device-enabled ${filterClass === 'em-filter-enabled' ? 'btn-primary' : 'btn-secondary'}" data-device-id="${deviceIdEsc}" title="Show only enabled entities" style="${filterClass === 'em-filter-enabled' ? '' : 'color:var(--em-success);border-color:var(--em-success)'}">View Enabled</button>
            <button class="btn view-device-disabled ${filterClass === 'em-filter-disabled' ? 'btn-primary' : 'btn-secondary'}" data-device-id="${deviceIdEsc}" title="Show only disabled entities" style="${filterClass === 'em-filter-disabled' ? '' : 'color:var(--em-danger);border-color:var(--em-danger)'}">View Disabled</button>` : '';

    return `
      <div class="device-item ${isExpanded ? 'device-expanded' : ''} ${filterClass}" ${filterAttr ? `data-device-id-filter="${filterAttr}"` : ''}>
        <div class="device-header" data-device="${deviceIdEsc}">
          ${showSelectCheckbox ? `<label class="device-select-label" title="Select all entities in this device">
            <input type="checkbox" class="device-select-checkbox" data-device-id="${deviceIdEsc}">
          </label>` : ''}
          <span class="device-icon ${isExpanded ? 'expanded' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          <span class="device-name-wrap">
            <span class="device-name">${this._escapeHtml(devName)}</span>${selectionIndicator}
          </span>
          ${typeBadge}
          <span class="device-count">${device.entities.length} entit${device.entities.length !== 1 ? 'ies' : 'y'} (<span class="count-enabled">${enabledCount}</span>/<span class="count-disabled">${disabledCount}</span>)</span>
          <div class="device-bulk-actions" data-device-entities="${deviceEntityIds}">${viewFilterBtns}
            <button class="device-enable-all" data-device="${deviceIdEsc}" title="Enable all entities in this device">Enable All</button>
            <button class="device-disable-all" data-device="${deviceIdEsc}" title="Disable all entities in this device">Disable All</button>
          </div>
        </div>
        ${isExpanded ? `<div class="device-name-group-body">${catCardsHtml}</div>` : ''}
      </div>
    `;
  }

  renderDevice(deviceId, device, integration) {
    return this._buildDeviceCard(deviceId, device, integration);
  }

  _renderCatCard(name, label, cls, entities, primaryDeviceId, preExpanded = false) {
    const enabledCount = entities.filter(e => !e.is_disabled).length;
    const disabledCount = entities.filter(e => e.is_disabled).length;
    const entityIds = entities.map(e => this._escapeAttr(e.entity_id)).join(',');
    const areaId = this.deviceInfo?.[primaryDeviceId]?.area_id;
    const areaName = areaId ? (this.floorsData?.areas?.find(a => a.area_id === areaId)?.name || areaId) : null;
    const entitiesHtml = entities.map(e => this._renderEntityItem(e, e.integration)).join('');

    return `
      <div class="device-item">
        <div class="device-header em-cat-card-toggle">
          <span class="device-icon ${preExpanded ? 'expanded' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          <span class="device-name-wrap"><span class="device-name">${this._escapeHtml(name)}</span></span>
          <span class="device-count">${entities.length} entit${entities.length !== 1 ? 'ies' : 'y'} (<span class="count-enabled">${enabledCount}</span>/<span class="count-disabled">${disabledCount}</span>)</span>
          <span class="device-cat-chip ${cls}">${label}</span>
          <div class="device-bulk-actions">
            <button class="device-enable-all" data-entity-ids="${entityIds}" title="Enable all">Enable All</button>
            <button class="device-disable-all" data-entity-ids="${entityIds}" title="Disable all">Disable All</button>
          </div>
        </div>
        <div class="device-entity-list" style="${preExpanded ? '' : 'display:none'}">${entitiesHtml}</div>
      </div>`;
  }

  _updateDeviceSelectionIndicators() {
    this.content.querySelectorAll('.device-header:not(.em-cat-card-toggle)').forEach(header => {
      const deviceId = header.dataset.device;
      let entities = [];
      for (const intg of (this.data || [])) {
        if (intg.devices[deviceId]) { entities = intg.devices[deviceId].entities; break; }
      }
      if (!entities.length) return;
      const selectedCount = entities.filter(e => this.selectedEntities.has(e.entity_id)).length;
      const totalCount = entities.length;
      header.querySelector('.device-sel-indicator')?.remove();
      if (selectedCount === 0) return;
      const span = document.createElement('span');
      span.className = `device-sel-indicator ${selectedCount === totalCount ? 'device-sel-all' : 'device-sel-partial'}`;
      span.title = selectedCount === totalCount ? 'All entities selected' : `${selectedCount}/${totalCount} selected`;
      span.textContent = '✓';
      header.querySelector('.device-name').insertAdjacentElement('afterend', span);
    });
  }

  attachIntegrationListeners() {
    // Category card toggles (same-name group → category cards) — pure DOM, no re-render
    this.content.querySelectorAll('.em-cat-card-toggle').forEach(header => {
      header.addEventListener('click', e => {
        if (e.target.closest('.device-bulk-actions')) return;
        const body = header.nextElementSibling;
        const icon = header.querySelector('.device-icon');
        if (!body) return;
        const hidden = body.style.display === 'none';
        body.style.display = hidden ? '' : 'none';
        if (icon) icon.classList.toggle('expanded', hidden);
      });
    });

    // Device name-group toggle (same-name device groups in Devices view)
    this.content.querySelectorAll('.em-name-group-toggle').forEach(header => {
      header.addEventListener('click', () => {
        const groupKey = header.dataset.groupKey;
        if (this.expandedIntegrations.has(groupKey)) {
          this.expandedIntegrations.delete(groupKey);
        } else {
          this.expandedIntegrations.add(groupKey);
        }
        this.updateView();
      });
    });

    // Collapsible sub-groups inside smart group content (e.g. Unassigned grouped by integration)
    this._reAttachCollapsibles(this.content, { selector: '.smart-group-content .em-collapsible' });

    // Smart group headers
    this.content.querySelectorAll('.smart-group-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.smart-group-select-wrap')) return;
        if (e.target.closest('.smart-group-actions')) return;
        const groupKey = header.dataset.smartGroupToggle;
        const expandKey = `smart_${groupKey}`;
        if (this.expandedIntegrations.has(expandKey)) {
          this.expandedIntegrations.delete(expandKey);
        } else {
          this.expandedIntegrations.add(expandKey);
        }
        this.updateView();
      });
    });

    // Smart group select-all checkboxes
    this.content.querySelectorAll('.smart-group-select-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        e.stopPropagation();
        const groupKey = checkbox.dataset.groupKey;
        // Use the cached groups from the last render — same data the user sees.
        // Fall back to _getSmartGroups() if cache is stale/missing.
        const groups = this._renderedSmartGroups || this._getSmartGroups();
        const entities = groups[groupKey] || [];
        // _renderedSmartGroups entities are already filtered by viewState/domain/search —
        // no secondary filter needed here. Directly add/remove from selection.
        for (const entity of entities) {
          if (checkbox.checked) {
            this.selectedEntities.add(entity.entity_id);
          } else {
            this.selectedEntities.delete(entity.entity_id);
          }
        }
        // Sync visible entity checkboxes in the expanded group
        const groupEl = this.content.querySelector(`.smart-group[data-smart-group="${CSS.escape(groupKey)}"]`);
        if (groupEl) {
          groupEl.querySelectorAll('.entity-checkbox').forEach(cb => {
            cb.checked = checkbox.checked;
          });
        }
        this.updateSelectedCount();
        this._updateDeviceSelectionIndicators();
      });
    });

    // Smart group Enable All / Disable All
    this.content.querySelectorAll('.smart-group-enable-all, .smart-group-disable-all').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const isEnable = btn.classList.contains('smart-group-enable-all');
        const groupKey = btn.dataset.groupKey;
        const groups = this._renderedSmartGroups || this._getSmartGroups();
        const entities = groups[groupKey] || [];
        const entityIds = entities.map(en => en.entity_id);
        if (!entityIds.length) return;
        btn.disabled = true;
        btn.textContent = '…';
        try {
          const wsType = isEnable ? 'entity_manager/bulk_enable' : 'entity_manager/bulk_disable';
          const res = await this._hass.callWS({ type: wsType, entity_ids: entityIds });
          const n = res?.succeeded?.length ?? entityIds.length;
          this._pushUndoAction({ type: isEnable ? 'bulk_enable' : 'bulk_disable', entityIds, timestamp: Date.now() });
          this._showToast(`${isEnable ? 'Enabled' : 'Disabled'} ${n} entit${n !== 1 ? 'ies' : 'y'}`, 'success');
          await this.loadData();
        } catch (err) {
          this._showToast(`Bulk ${isEnable ? 'enable' : 'disable'} failed: ${err.message || err}`, 'error');
          btn.disabled = false;
          btn.textContent = isEnable ? 'Enable All' : 'Disable All';
        }
      });
    });

    // Smart group "Assign Area" buttons
    this.content.querySelectorAll('.smart-group-assign-area').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const groupKey = btn.dataset.groupKey;
        const groups = this._renderedSmartGroups || this._getSmartGroups();
        const entities = this._resolveEntitiesById((groups[groupKey] || []).map(en => en.entity_id));
        if (!entities.length) return;
        await this._showAreaFloorDialog(`Assign area to ${entities.length} entit${entities.length !== 1 ? 'ies' : 'y'}`, entities);
      });
    });

    // Custom group delete buttons on group headers
    this.content.querySelectorAll('.smart-group-delete-custom').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const groupName = btn.dataset.groupKey;
        const grp = (this.customGroups || []).find(g => g.name === groupName);
        if (!grp) return;
        this.showConfirmDialog(`Delete group "${grp.name}"?`, 'This only removes the grouping — entities are not affected.', () => {
          this.customGroups = (this.customGroups || []).filter(g => g.id !== grp.id);
          localStorage.setItem('em-custom-groups', JSON.stringify(this.customGroups));
          this._reRenderSidebar();
          this.updateView();
        });
      });
    });

    // Integration headers
    this.content.querySelectorAll('.integration-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.integration-select-wrapper')) return;
        const integration = header.dataset.integration;
        if (this.expandedIntegrations.has(integration)) {
          this.expandedIntegrations.delete(integration);
        } else {
          this.expandedIntegrations.add(integration);
        }
        this.updateView();
      });
    });

    // Device card expand/collapse (Devices view)
    this.content.querySelectorAll('[data-device-expand]').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.integration-select-wrapper')) return;
        const deviceId = header.dataset.deviceExpand;
        if (this.expandedDevices.has(deviceId)) {
          this.expandedDevices.delete(deviceId);
        } else {
          this.expandedDevices.add(deviceId);
        }
        this.updateView();
      });
    });

    // Device select-all checkboxes (Devices view)
    this.content.querySelectorAll('.device-select-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const deviceId = checkbox.dataset.deviceId;
        // Find the device entities from data
        let deviceEntities = [];
        for (const intg of (this.data || [])) {
          if (intg.devices[deviceId]) {
            deviceEntities = intg.devices[deviceId].entities;
            break;
          }
        }
        // Sync visible entity checkboxes (device is expanded)
        const term = this.searchTerm?.toLowerCase() || '';
        const visibleCbs = this.content.querySelectorAll(`.entity-checkbox[data-device-id="${CSS.escape(deviceId)}"]`);
        if (visibleCbs.length > 0) {
          visibleCbs.forEach(cb => {
            const entityId = cb.dataset.entityId;
            if (term && !entityId.toLowerCase().includes(term)) return;
            cb.checked = checkbox.checked;
            if (checkbox.checked) this.selectedEntities.add(entityId);
            else this.selectedEntities.delete(entityId);
          });
        } else {
          deviceEntities.forEach(entity => {
            if (this.viewState === 'disabled' && !entity.is_disabled) return;
            if (this.viewState === 'enabled' && entity.is_disabled) return;
            if (this.selectedDomain && this.selectedDomain !== 'all' &&
                !entity.entity_id.startsWith(`${this.selectedDomain}.`)) return;
            if (term && !entity.entity_id.toLowerCase().includes(term) &&
                !(entity.original_name || '').toLowerCase().includes(term)) return;
            if (checkbox.checked) this.selectedEntities.add(entity.entity_id);
            else this.selectedEntities.delete(entity.entity_id);
          });
        }
        this._updateSelectionUI();
        this.updateSelectedCount();
        this._updateDeviceSelectionIndicators();
      });
    });

    // Device headers (exclude category card headers which handle their own toggle)
    this.content.querySelectorAll('.device-header:not(.em-cat-card-toggle)').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.device-bulk-actions')) return;
        if (e.target.closest('.device-select-label')) return;
        const deviceId = header.dataset.device;
        if (this.expandedDevices.has(deviceId)) {
          this.expandedDevices.delete(deviceId);
        } else {
          this.expandedDevices.add(deviceId);
        }
        this.updateView();
      });
    });

    // Device-level bulk enable / disable
    this.content.querySelectorAll('.device-enable-all, .device-disable-all').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isEnable = btn.classList.contains('device-enable-all');
        const deviceId = btn.dataset.device;
        let entityIds = [];
        if (deviceId) {
          for (const intg of (this.data || [])) {
            const dev = intg.devices[deviceId];
            if (dev) { entityIds = dev.entities.map(en => en.entity_id); break; }
          }
        } else if (btn.dataset.entityIds) {
          entityIds = btn.dataset.entityIds.split(',').filter(Boolean);
        }
        if (!entityIds.length) return;
        btn.disabled = true;
        btn.textContent = '…';
        try {
          const wsType = isEnable ? 'entity_manager/bulk_enable' : 'entity_manager/bulk_disable';
          const res = await this._hass.callWS({ type: wsType, entity_ids: entityIds });
          const n = res.success?.length ?? entityIds.length;
          this._showToast(`${isEnable ? 'Enabled' : 'Disabled'} ${n} entit${n !== 1 ? 'ies' : 'y'}`, 'success');
          this._pushUndoAction({ type: isEnable ? 'bulk_enable' : 'bulk_disable', entityIds, timestamp: Date.now() });
          await this.loadData();
        } catch (err) {
          this._showToast(`Bulk ${isEnable ? 'enable' : 'disable'} failed: ` + (err.message || err), 'error');
          btn.disabled = false;
          btn.textContent = isEnable ? 'Enable All' : 'Disable All';
        }
      });
    });

    // Integration select-all checkboxes
    this.content.querySelectorAll('.integration-select-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const integrationId = checkbox.dataset.integration;
        const entityCheckboxes = this.content.querySelectorAll(`.entity-checkbox[data-integration="${integrationId}"]`);
        if (entityCheckboxes.length > 0) {
          // Entities visible in DOM — sync them
          entityCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            if (checkbox.checked) {
              this.selectedEntities.add(cb.dataset.entityId);
            } else {
              this.selectedEntities.delete(cb.dataset.entityId);
            }
          });
        } else {
          // Integration is collapsed — operate on this.data directly, respecting all active filters
          const intData = (this.data || []).find(i => i.integration === integrationId);
          if (intData) {
            const term = this.searchTerm?.toLowerCase() || '';
            Object.values(intData.devices).forEach(device => {
              device.entities.forEach(entity => {
                if (this.viewState === 'disabled' && !entity.is_disabled) return;
                if (this.viewState === 'enabled' && entity.is_disabled) return;
                if (this.selectedDomain && this.selectedDomain !== 'all' &&
                    !entity.entity_id.startsWith(`${this.selectedDomain}.`)) return;
                if (term && !entity.entity_id.toLowerCase().includes(term) &&
                    !(entity.original_name || '').toLowerCase().includes(term)) return;
                if (checkbox.checked) {
                  this.selectedEntities.add(entity.entity_id);
                } else {
                  this.selectedEntities.delete(entity.entity_id);
                }
              });
            });
          }
        }
        checkbox.indeterminate = false;
        this.updateSelectedCount();
        this._updateDeviceSelectionIndicators();
      });
    });

    // Entity checkboxes
    this.content.querySelectorAll('.entity-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selectedEntities.add(checkbox.dataset.entityId);
        } else {
          this.selectedEntities.delete(checkbox.dataset.entityId);
        }
        this.updateSelectedCount();
        this._updateIntegrationCheckboxState(checkbox.dataset.integration);
        const sg = checkbox.closest('.smart-group');
        if (sg) this._updateSmartGroupCheckboxState(sg.dataset.smartGroup);
        this._updateDeviceSelectionIndicators();
      });
    });

    // Open in HA buttons (entity card)
    this.content.querySelectorAll('.open-ha-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        history.pushState(null, '', `/config/entities/entity/${btn.dataset.entityId}`);
        window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
      });
    });


    // Enable/Disable buttons
    this.content.querySelectorAll('.rename-entity').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showRenameDialog(btn.dataset.entityId);
      });
    });

    this.content.querySelectorAll('.enable-entity').forEach(btn => {
      btn.addEventListener('click', () => {
        this.enableEntity(btn.dataset.entityId);
      });
    });

    this.content.querySelectorAll('.disable-entity').forEach(btn => {
      btn.addEventListener('click', () => {
        this.disableEntity(btn.dataset.entityId);
      });
    });

    this.content.querySelectorAll('.toggle-entity').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const entityId = btn.dataset.entityId;
        try {
          await this._hass.callWS({
            type: 'call_service',
            domain: 'homeassistant',
            service: 'toggle',
            service_data: { entity_id: entityId },
          });
          // Optimistic UI: flip active class while waiting for state update
          btn.classList.toggle('toggle-on');
          btn.title = btn.classList.contains('toggle-on') ? 'Turn off' : 'Turn on';
        } catch (err) {
          this._showToast(`Toggle failed: ${err}`, 'danger');
        }
      });
    });

    this.content.querySelectorAll('.press-entity').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const entityId = btn.dataset.entityId;
        try {
          await this._hass.callWS({
            type: 'call_service',
            domain: 'button',
            service: 'press',
            target: { entity_id: entityId },
          });
          this._showToast(`Pressed ${entityId}`, 'success');
        } catch (err) {
          this._showToast(`Press failed: ${err?.message || err}`, 'danger');
          console.error('[EM] button.press failed', entityId, err);
        }
      });
    });

    this.content.querySelectorAll('[data-action="bulk-rename"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openBulkRenameDialog();
      });
    });

    this.content.querySelectorAll('[data-action="bulk-labels"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showBulkLabelEditor();
      });
    });

    this.content.querySelectorAll('[data-action="bulk-delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showBulkDeleteDialog();
      });
    });

    this.content.querySelectorAll('.enable-integration').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const integration = btn.dataset.integration;
        this.showConfirmDialog(
          `Enable all entities in ${integration}?`,
          `Are you sure you want to enable all entities in the ${integration} integration?`,
          () => this.enableIntegration(integration)
        );
      });
    });

    this.content.querySelectorAll('.disable-integration').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const integration = btn.dataset.integration;
        this.showConfirmDialog(
          `Disable all entities in ${integration}?`,
          `Are you sure you want to disable all entities in the ${integration} integration? This may affect automations and dashboards.`,
          () => this.disableIntegration(integration)
        );
      });
    });

    this.content.querySelectorAll('.view-integration-enabled, .view-integration-disabled').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const integration = btn.dataset.integration;
        const filterType = btn.classList.contains('view-integration-enabled') ? 'enabled' : 'disabled';
        const current = this.integrationViewFilter[integration];

        // Toggle: clicking the active filter clears it
        this.integrationViewFilter[integration] = current === filterType ? undefined : filterType;

        // Expand the integration so the entity list is visible
        this.expandedIntegrations.add(integration);

        // Apply immediately via CSS class on the existing container (no full re-render needed)
        const container = this.content.querySelector(`.integration-group[data-integration="${CSS.escape(integration)}"]`);
        if (container) {
          container.classList.remove('em-filter-enabled', 'em-filter-disabled');
          if (this.integrationViewFilter[integration]) {
            container.classList.add(`em-filter-${this.integrationViewFilter[integration]}`);
          }
          // Update button active states within this header
          container.querySelector('.view-integration-enabled')?.classList.toggle('btn-primary', this.integrationViewFilter[integration] === 'enabled');
          container.querySelector('.view-integration-enabled')?.classList.toggle('btn-secondary', this.integrationViewFilter[integration] !== 'enabled');
          container.querySelector('.view-integration-disabled')?.classList.toggle('btn-primary', this.integrationViewFilter[integration] === 'disabled');
          container.querySelector('.view-integration-disabled')?.classList.toggle('btn-secondary', this.integrationViewFilter[integration] !== 'disabled');
        } else {
          // Integration was collapsed — re-render to expand it with the filter applied
          this.updateView();
        }
      });
    });

    // Device view enabled/disabled filter buttons (devices view)
    this.content.querySelectorAll('.view-device-enabled, .view-device-disabled').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const deviceId = btn.dataset.deviceId;
        const filterType = btn.classList.contains('view-device-enabled') ? 'enabled' : 'disabled';
        const current = this.deviceViewFilter[deviceId];

        // Toggle: clicking the active filter clears it
        this.deviceViewFilter[deviceId] = current === filterType ? undefined : filterType;

        // Expand the device so the entity list is visible
        this.expandedDevices.add(deviceId);

        // Apply immediately via CSS class on the existing container (no full re-render needed)
        const container = this.content.querySelector(`.device-item[data-device-id-filter="${CSS.escape(deviceId)}"]`);
        if (container) {
          container.classList.remove('em-filter-enabled', 'em-filter-disabled');
          if (this.deviceViewFilter[deviceId]) {
            container.classList.add(`em-filter-${this.deviceViewFilter[deviceId]}`);
          }
          container.querySelector('.view-device-enabled')?.classList.toggle('btn-primary', this.deviceViewFilter[deviceId] === 'enabled');
          container.querySelector('.view-device-enabled')?.classList.toggle('btn-secondary', this.deviceViewFilter[deviceId] !== 'enabled');
          container.querySelector('.view-device-disabled')?.classList.toggle('btn-primary', this.deviceViewFilter[deviceId] === 'disabled');
          container.querySelector('.view-device-disabled')?.classList.toggle('btn-secondary', this.deviceViewFilter[deviceId] !== 'disabled');
        } else {
          this.updateView();
        }
      });
    });

    // Favorite buttons
    this.content.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleFavorite(btn.dataset.entityId);
      });
    });
    
    // Click entity card → full detail dialog
    this.content.querySelectorAll('.entity-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        if (e.target.closest('button, input, label')) return;
        const entityId = item.dataset.entityId;
        if (entityId) this._showEntityDetailsDialog(entityId);
      });
    });

    // Context menu on right-click
    this.content.querySelectorAll('.entity-item').forEach(item => {
      item.addEventListener('contextmenu', (e) => {
        const entityId = item.dataset.entityId;
        if (entityId) {
          this._showContextMenu(e, entityId);
        }
      });
    });
    
    // Load More buttons
    this.content.querySelectorAll('.load-more-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._loadMoreEntities(btn.dataset.integration, false);
      });
    });
    
    // Load All buttons
    this.content.querySelectorAll('.load-all-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._loadMoreEntities(btn.dataset.integration, true);
      });
    });
    
    // Drag and drop
    this._attachDragDropListeners();
    
  }

  updateSelectedCount() {
    if (!this.content) return;
    const selectedCount = this.selectedEntities.size;

    // Update sidebar count badge and selection group highlight
    const sidebarCount = this.querySelector('#sidebar-selected-count');
    if (sidebarCount) {
      sidebarCount.textContent = selectedCount || '';
      sidebarCount.classList.toggle('em-sel-active', selectedCount > 0);
    }
    const selGroup = this.querySelector('#em-selection-group');
    if (selGroup) selGroup.classList.toggle('has-selection', selectedCount > 0);

    // Dim/enable selection-dependent sidebar actions
    ['enable-selected', 'disable-selected', 'assign-area-selected', 'deselect-all', 'view-selected'].forEach(a => {
      const el = this.querySelector(`.em-sidebar [data-action="${a}"]`);
      if (el) {
        el.style.opacity = selectedCount === 0 ? '0.4' : '';
        el.style.pointerEvents = selectedCount === 0 ? 'none' : '';
      }
    });

    // Auto-expand the Actions section when entities are selected so the selection
    // group is visible (it lives inside the collapsible Actions section)
    if (selectedCount > 0) {
      const sg = this.querySelector('#em-selection-group');
      if (sg) {
        const section = sg.closest('.sidebar-section');
        if (section && section.classList.contains('section-collapsed')) {
          const id = section.querySelector('[data-section-id]')?.dataset.sectionId;
          section.classList.remove('section-collapsed');
          if (id) {
            this.sidebarOpenSections.add(id);
            localStorage.setItem('em-sidebar-sections', JSON.stringify([...this.sidebarOpenSections]));
          }
        }
      }
    }

    // Enable/disable bulk action buttons on entity cards
    const bulkActive = selectedCount >= 2;
    this.content.querySelectorAll('[data-action="bulk-rename"], [data-action="bulk-labels"]').forEach(btn => {
      btn.disabled = !bulkActive;
    });

    // Show/hide delete button — only on the specific card that is selected
    this.content.querySelectorAll('[data-action="bulk-delete"]').forEach(btn => {
      const cardEntityId = btn.closest('[data-entity-id]')?.dataset.entityId;
      btn.style.display = cardEntityId && this.selectedEntities.has(cardEntityId) ? '' : 'none';
    });
  }

  async enableEntity(entityId, skipUndo = false) {
    try {
      await this._hass.callWS({
        type: 'entity_manager/enable_entity',
        entity_id: entityId,
      });
      
      // Push undo action (skip when called from undo/redo)
      if (!skipUndo) {
        this._pushUndoAction({
          type: 'enable',
          entityId: entityId
        });
        this._logActivity('enable', { entity: entityId });
      }
      
      this.selectedEntities.delete(entityId);
      this.updateSelectedCount();
      this.loadData();
      if (!skipUndo) this._showToast(`Enabled ${entityId}`);
    } catch (error) {
      this.showErrorDialog(`Error enabling entity: ${error.message}`);
    }
  }

  async disableEntity(entityId, skipUndo = false) {
    try {
      await this._hass.callWS({
        type: 'entity_manager/disable_entity',
        entity_id: entityId,
      });
      
      // Push undo action (skip when called from undo/redo)
      if (!skipUndo) {
        this._pushUndoAction({
          type: 'disable',
          entityId: entityId
        });
        this._logActivity('disable', { entity: entityId });
      }
      
      this.selectedEntities.delete(entityId);
      this.updateSelectedCount();
      this.loadData();
      if (!skipUndo) this._showToast(`Disabled ${entityId}`);
    } catch (error) {
      this.showErrorDialog(`Error disabling entity: ${error.message}`);
    }
  }

  async enableIntegration(integration) {
    const integrationData = this.data.find(int => int.integration === integration);
    if (!integrationData || !integrationData.devices) {
      return;
    }
    
    const entityIds = Object.values(integrationData.devices)
      .flatMap(device => device.entities.map(e => e.entity_id));
    
    if (entityIds.length > 0) {
      await this.bulkEnableEntities(entityIds);
    }
  }

  async disableIntegration(integration) {
    const integrationData = this.data.find(int => int.integration === integration);
    if (!integrationData || !integrationData.devices) {
      return;
    }
    
    const entityIds = Object.values(integrationData.devices)
      .flatMap(device => device.entities.map(e => e.entity_id));
    
    if (entityIds.length > 0) {
      await this.bulkDisable(entityIds);
    }
  }

  async bulkEnable() {
    if (this.selectedEntities.size === 0) {
      this.showErrorDialog('No entities selected');
      return;
    }
    this.setLoading(true);
    try {
      const entityIdsCopy = Array.from(this.selectedEntities);
      await this.bulkEnableEntities(entityIdsCopy);
    } finally {
      this.setLoading(false);
    }
  }

  async bulkDisable(entityIds = null) {
    const toDisable = entityIds || Array.from(this.selectedEntities);
    if (toDisable.length === 0) {
      this.showErrorDialog('No entities selected');
      return;
    }

    this.setLoading(true);
    try {
      await this._hass.callWS({
        type: 'entity_manager/bulk_disable',
        entity_ids: toDisable,
      });
      
      // Push undo action for bulk disable
      this._pushUndoAction({
        type: 'bulk_disable',
        entityIds: [...toDisable],
        undo: async () => await this._hass.callWS({ type: 'entity_manager/bulk_enable', entity_ids: toDisable })
      });
      
      this.selectedEntities.clear();
      this.updateSelectedCount();
      this.loadData();
      this._showToast(`Disabled ${toDisable.length} entities`);
    } catch (error) {
      this.showErrorDialog(`Error disabling entities: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async bulkEnableEntities(entityIds) {
    this.setLoading(true);
    try {
      await this._hass.callWS({
        type: 'entity_manager/bulk_enable',
        entity_ids: entityIds,
      });
      
      // Push undo action for bulk enable
      this._pushUndoAction({
        type: 'bulk_enable',
        entityIds: [...entityIds],
        undo: async () => await this._hass.callWS({ type: 'entity_manager/bulk_disable', entity_ids: entityIds })
      });
      
      this.selectedEntities.clear();
      this.updateSelectedCount();
      this.loadData();
      this._showToast(`Enabled ${entityIds.length} entities`);
    } catch (error) {
      this.showErrorDialog(`Error enabling entities: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async _loadHaAutoBackup() {
    try {
      const result = await this._hass.callWS({ type: 'hassio/update/config/info' });
      // Response shape: { core_backup_before_update: bool, add_on_backup_before_update: bool }
      if (result && typeof result.core_backup_before_update === 'boolean') {
        this.haAutoBackup = {
          core: result.core_backup_before_update,
          addon: result.add_on_backup_before_update ?? result.core_backup_before_update,
        };
      } else {
        this.haAutoBackup = null;
      }
    } catch {
      this.haAutoBackup = null; // Hassio not available (plain HA Core)
    }
  }

  async _toggleHaAutoBackup() {
    if (this.haAutoBackup === null) return;
    const newVal = !this.haAutoBackup.core;
    try {
      await this._hass.callWS({
        type: 'hassio/update/config/update',
        core_backup_before_update: newVal,
        add_on_backup_before_update: newVal,
      });
      this.haAutoBackup = { core: newVal, addon: newVal };
      // Re-render the whole backup row in place
      const row = this.content?.querySelector('#ha-auto-backup-toggle')?.closest('div[style]');
      if (row) {
        row.style.borderColor = newVal ? 'var(--em-success)' : 'var(--em-danger)';
        row.style.background = newVal ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.08)';
        const btn = row.querySelector('#ha-auto-backup-toggle');
        if (btn) {
          btn.textContent = newVal ? 'ON' : 'OFF';
          btn.style.background = newVal ? 'var(--em-success)' : 'var(--em-danger)';
          btn.style.borderColor = newVal ? 'var(--em-success)' : 'var(--em-danger)';
        }
        const desc = row.querySelector('span:last-child');
        if (desc) desc.textContent = newVal
          ? 'HA will automatically create a backup before every update'
          : 'No automatic backup will be created before updates';
      }
      this._showToast(`HA auto-backup before updates: ${newVal ? 'enabled' : 'disabled'}`, 'success');
    } catch (err) {
      this._showToast(`Failed to update setting: ${err.message}`, 'error');
    }
  }

  async loadUpdates() {
    this.setLoading(true);
    try {
      // Get all update entities from Home Assistant
      const [states] = await Promise.all([
        this._hass.callWS({ type: 'get_states' }),
        this._loadHaAutoBackup(),
      ]);
      this.updateEntities = states.filter(state => state.entity_id.startsWith('update.'));
      this.renderUpdates();
    } catch (error) {
      console.error('Error loading updates:', error);
      this.showErrorDialog(`Error loading updates: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  renderUpdates() {
    const content = this.content.querySelector('#content');
    if (!content) return;

    // Filter updates based on selected filter
    let filteredUpdates = this.updateEntities;
    
    if (this.updateFilter === 'available') {
      filteredUpdates = this.updateEntities.filter(update => update.state === 'on');
    } else if (this.updateFilter === 'stable') {
      filteredUpdates = this.updateEntities.filter(update => {
        const latestVersion = update.attributes.latest_version || '';
        return !latestVersion.toLowerCase().includes('beta') && 
               !latestVersion.toLowerCase().includes('rc') &&
               !latestVersion.toLowerCase().includes('dev');
      });
    } else if (this.updateFilter === 'beta') {
      filteredUpdates = this.updateEntities.filter(update => {
        const latestVersion = update.attributes.latest_version || '';
        return latestVersion.toLowerCase().includes('beta') || 
               latestVersion.toLowerCase().includes('rc') ||
               latestVersion.toLowerCase().includes('dev');
      });
    }

    // Apply device/integration type filter.
    // HA sets device_class (e.g. 'firmware') on hardware updates; software/integration
    // updates leave device_class unset — use this as the sole discriminator.
    if (this.selectedUpdateType === 'device') {
      filteredUpdates = filteredUpdates.filter(update => !!update.attributes.device_class);
    } else if (this.selectedUpdateType === 'integration') {
      filteredUpdates = filteredUpdates.filter(update => !update.attributes.device_class);
    }
    
    // Apply search filter
    if (this.searchTerm) {
      filteredUpdates = filteredUpdates.filter(update => {
        const title = (update.attributes.title || update.attributes.friendly_name || update.entity_id).toLowerCase();
        return title.includes(this.searchTerm);
      });
    }

    // Hide up-to-date items if checkbox is checked
    if (this.hideUpToDate) {
      filteredUpdates = filteredUpdates.filter(update => update.state === 'on');
    }

    // Sort updates alphabetically by title
    filteredUpdates.sort((a, b) => {
      const aTitle = (a.attributes.title || a.attributes.friendly_name || a.entity_id).toLowerCase();
      const bTitle = (b.attributes.title || b.attributes.friendly_name || b.entity_id).toLowerCase();
      return aTitle.localeCompare(bTitle, undefined, { sensitivity: 'base' });
    });

    if (filteredUpdates.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <h2>No Updates Available</h2>
          <p>All systems are up to date!</p>
        </div>
      `;
      return;
    }

    const availableUpdates = filteredUpdates.filter(u => u.state === 'on');
    const backupSupportedCount = availableUpdates.filter(u => !!(u.attributes.supported_features & 8)).length;

    const haBackupRow = this.haAutoBackup !== null ? (() => {
      const on = this.haAutoBackup.core;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:10px 14px;border-radius:10px;margin-top:10px;
                    border:2px solid ${on ? '#4caf50' : '#f44336'};
                    background:${on ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.08)'}">
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-size:13px;font-weight:600;color:var(--em-text-primary)">🛡 HA Auto-backup before updates</span>
            <span style="font-size:11px;color:var(--em-text-secondary)">
              ${on ? 'HA will automatically create a backup before every update' : 'No automatic backup will be created before updates'}
            </span>
          </div>
          <button id="ha-auto-backup-toggle"
            title="Toggle HA's global backup before update setting"
            style="padding:7px 20px;border-radius:20px;border:2px solid ${on ? '#4caf50' : '#f44336'};
                   background:${on ? '#4caf50' : '#f44336'};color:white;
                   cursor:pointer;font-size:13px;font-weight:700;min-width:64px;flex-shrink:0">
            ${on ? 'ON' : 'OFF'}
          </button>
        </div>`;
    })() : '';

    content.innerHTML = `
      <div class="update-select-all">
        <div class="select-all-pill">
          <label class="select-all-label" for="select-all-updates">
            <input type="checkbox" id="select-all-updates" ${availableUpdates.length === 0 ? 'disabled' : ''}>
            <span>Select All (${availableUpdates.length})</span>
          </label>
          <div class="em-update-expand-wrap">
            <button class="em-update-expand-btn" id="update-selected">
              Update (<span id="update-count">0</span>)
            </button>
          </div>
        </div>
        ${backupSupportedCount > 0 ? `
        <label class="select-all-label" title="Check backup for all entities that support it">
          <input type="checkbox" id="select-all-backups">
          <span>🛡 Backup All (${backupSupportedCount})</span>
        </label>` : ''}
      </div>
      ${haBackupRow}
      <div class="update-list">
        ${filteredUpdates.map(update => this.renderUpdateItem(update)).join('')}
      </div>
    `;

    this.attachUpdateListeners();
  }

  renderUpdateItem(update) {
    const entityId = update.entity_id;
    const title = update.attributes.title || update.attributes.friendly_name || entityId;
    const currentVersion = update.attributes.installed_version || 'Unknown';
    const latestVersion = update.attributes.latest_version || 'Unknown';
    const hasUpdate = update.state === 'on';
    const isBeta = latestVersion.toLowerCase().includes('beta') || 
                   latestVersion.toLowerCase().includes('rc') ||
                   latestVersion.toLowerCase().includes('dev');
    const releaseUrl = update.attributes.release_url || null;
    
    const supportsBackup = hasUpdate && !!(update.attributes.supported_features & 8);

    const updateClasses = ['update-item'];
    if (hasUpdate) updateClasses.push('has-update');
    if (isBeta) updateClasses.push('beta');

    return `
      <div class="${updateClasses.join(' ')}" data-entity-id="${this._escapeAttr(entityId)}">
        <input type="checkbox" class="update-checkbox" data-update-id="${this._escapeAttr(entityId)}" ${!hasUpdate ? 'disabled' : ''}>
        <div class="update-icon">📦</div>
        <div class="update-info">
          <div class="update-title">${this._escapeHtml(title)}</div>
          <div class="update-details">
            <div class="update-version">
              <span>Current:</span>
              <span class="version-badge current">${this._escapeHtml(currentVersion)}</span>
            </div>
            ${hasUpdate ? `
              <div class="update-version">
                <span>→</span>
                <span class="version-badge ${isBeta ? 'beta' : 'latest'}">${this._escapeHtml(latestVersion)}</span>
              </div>
            ` : '<span style="color: var(--em-success);">✓ Up to date</span>'}
          </div>
        </div>
        ${hasUpdate ? `
          <div class="update-actions">
            ${supportsBackup ? `
              <label class="update-btn skip-btn update-backup-label" title="Create a backup before installing this update"
                style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;user-select:none;border-color:var(--em-success);color:var(--em-success)">
                <input type="checkbox" class="update-backup-checkbox" data-entity-id="${this._escapeAttr(entityId)}"
                  style="accent-color:var(--em-success);width:14px;height:14px;cursor:pointer;margin:0">
                <span>🛡 Backup</span>
              </label>` : ''}
            ${releaseUrl ? `<button class="update-btn skip-btn" data-action="release-notes" data-url="${this._escapeAttr(releaseUrl)}" style="border-color:var(--em-primary);color:var(--em-primary)">Release Notes</button>` : ''}
            <button class="update-btn" data-action="update" data-entity-id="${this._escapeAttr(entityId)}">Update</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  attachUpdateListeners() {
    // HA global auto-backup toggle
    this.content.querySelector('#ha-auto-backup-toggle')?.addEventListener('click', () => {
      this._toggleHaAutoBackup();
    });

    // Handle select all checkbox
    const selectAllCheckbox = this.content.querySelector('#select-all-updates');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        this.content.querySelectorAll('.update-checkbox:not(:disabled)').forEach(checkbox => {
          checkbox.checked = isChecked;
          const updateId = checkbox.dataset.updateId;
          if (isChecked) {
            this.selectedUpdates.add(updateId);
          } else {
            this.selectedUpdates.delete(updateId);
          }
        });
        this.updateSelectedUpdateCount();
      });
    }

    // Handle select-all-backups checkbox
    const selectAllBackups = this.content.querySelector('#select-all-backups');
    if (selectAllBackups) {
      selectAllBackups.addEventListener('change', (e) => {
        this.content.querySelectorAll('.update-backup-checkbox').forEach(cb => {
          cb.checked = e.target.checked;
        });
      });
    }

    // Handle update checkboxes
    this.content.querySelectorAll('.update-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const updateId = e.target.dataset.updateId;
        if (e.target.checked) {
          this.selectedUpdates.add(updateId);
        } else {
          this.selectedUpdates.delete(updateId);
        }
        this.updateSelectedUpdateCount();
      });
    });

    // Handle individual update buttons
    this.content.querySelectorAll('.update-btn[data-action="update"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const entityId = btn.dataset.entityId;
        
        // Find the update entity to get title and version info
        const updateEntity = this.updateEntities.find(u => u.entity_id === entityId);
        const title = updateEntity?.attributes.title || updateEntity?.attributes.friendly_name || entityId;
        const currentVersion = updateEntity?.attributes.installed_version || 'Unknown';
        const latestVersion = updateEntity?.attributes.latest_version || 'Unknown';
        
        const backupCb = btn.closest('.update-item')?.querySelector('.update-backup-checkbox');
        const doBackup = backupCb?.checked ?? false;
        const backupNote = doBackup ? '\n\n🛡 A backup will be created before installing.' : '';
        this.showConfirmDialog(
          'Confirm Update',
          `Are you sure you want to update ${title} from version ${currentVersion} to ${latestVersion}?${backupNote}`,
          () => this.performUpdate(entityId, doBackup)
        );
      });
    });

    // Handle release notes buttons
    this.content.querySelectorAll('.update-btn[data-action="release-notes"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(btn.dataset.url, '_blank');
      });
    });

    // Handle update-selected button (lives inside #content, re-bound each render)
    const updateSelectedBtn = this.content.querySelector('#update-selected');
    if (updateSelectedBtn) {
      updateSelectedBtn.addEventListener('click', () => {
        if (this.selectedUpdates.size === 0) return;
        this.confirmBulkUpdate();
      });
    }
  }

  updateSelectedUpdateCount() {
    const countSpan = this.content?.querySelector('#update-count');
    if (countSpan) countSpan.textContent = this.selectedUpdates.size;
    const wrap = this.content?.querySelector('.em-update-expand-wrap');
    if (wrap) wrap.classList.toggle('is-visible', this.selectedUpdates.size > 0);
  }

  // Switch the update row from indeterminate spinner to a filled SVG progress ring.
  // Called when HA reports update_percentage on the entity during installation.
  _updateRowProgress(entityId, pct) {
    const row = this.content?.querySelector(`.update-item[data-entity-id="${CSS.escape(entityId)}"]`);
    if (!row || !row.classList.contains('is-active')) return;
    const actionsEl = row.querySelector('.update-actions');
    if (!actionsEl) return;

    const circumference = 62.83; // 2π × radius 10
    const offset = (circumference * (1 - pct / 100)).toFixed(2);

    if (actionsEl.querySelector('.em-progress-ring')) {
      // Ring already shown — update dashoffset and percentage text
      const fill = actionsEl.querySelector('.em-ring-fill');
      if (fill) fill.setAttribute('stroke-dashoffset', offset);
      const pctEl = actionsEl.querySelector('.em-update-pct');
      if (pctEl) pctEl.textContent = `${pct}%`;
    } else {
      // Replace indeterminate spinner with determinate SVG ring
      actionsEl.innerHTML = `
        <svg class="em-progress-ring" width="28" height="28" viewBox="0 0 28 28" style="flex-shrink:0">
          <circle cx="14" cy="14" r="10" fill="none" stroke="color-mix(in srgb, var(--em-primary) 25%, transparent)" stroke-width="3"/>
          <circle cx="14" cy="14" r="10" fill="none" stroke="var(--em-primary)" stroke-width="3"
            stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset}"
            transform="rotate(-90 14 14)" stroke-linecap="round" class="em-ring-fill"/>
        </svg>
        <span style="font-size:13px;color:var(--em-primary);font-weight:500">
          Updating… <span class="em-update-pct">${pct}%</span>
        </span>`;
    }
  }

  _setUpdateRowState(entityId, state, { backup = false } = {}) {
    const row = this.content?.querySelector(`.update-item[data-entity-id="${CSS.escape(entityId)}"]`);
    if (!row) return;

    row.classList.remove('is-queued', 'is-active', 'is-done', 'is-failed');
    if (!state) return;
    row.classList.add(`is-${state}`);

    const actionsEl = row.querySelector('.update-actions');
    if (!actionsEl) return;

    if (state === 'queued') {
      actionsEl.innerHTML = `<span style="font-size:12px;color:var(--em-text-secondary);padding:8px 12px">⏳ Queued</span>`;
    } else if (state === 'active') {
      actionsEl.innerHTML = `
        <div class="em-update-spinner"></div>
        <span style="font-size:13px;color:var(--em-primary);font-weight:500">
          ${backup ? '🛡 Backing up…' : 'Updating…'}
        </span>`;
    } else if (state === 'done') {
      actionsEl.innerHTML = `<span style="font-size:14px;color:var(--em-success);font-weight:700">✓ Updated</span>`;
    } else if (state === 'failed') {
      actionsEl.innerHTML = `<span style="font-size:14px;color:var(--em-danger);font-weight:700">✕ Failed</span>`;
    }
  }

  async performUpdate(entityId, backup = false) {
    this._setUpdateRowState(entityId, 'active', { backup });
    if (!this._pendingUpdateWatches) this._pendingUpdateWatches = new Set();
    this._pendingUpdateWatches.add(entityId);

    // Fallback: if the entity state never transitions to 'off' within 5 minutes
    // (e.g. HA doesn't push a state update), mark as done anyway.
    const fallbackTimer = setTimeout(() => {
      if (this._pendingUpdateWatches?.has(entityId)) {
        this._pendingUpdateWatches.delete(entityId);
        this._setUpdateRowState(entityId, 'done');
        setTimeout(() => this.loadUpdates(), 2000);
      }
    }, 300000);

    try {
      await this._hass.callService('update', 'install', {
        entity_id: entityId,
        ...(backup && { backup: true }),
      });
      // Service accepted — state watcher in set hass() will detect completion
      // and call _setUpdateRowState(entityId, 'done') + loadUpdates().
    } catch (error) {
      clearTimeout(fallbackTimer);
      this._pendingUpdateWatches?.delete(entityId);
      console.error('Error performing update:', error);
      this._setUpdateRowState(entityId, 'failed');
      this.showErrorDialog(`Error updating ${entityId}: ${error.message}`);
    }
  }

  confirmBulkUpdate() {
    const count = this.selectedUpdates.size;
    const selectedEntityIds = Array.from(this.selectedUpdates);

    // Capture per-entity backup state before dialog opens
    const backupMap = {};
    selectedEntityIds.forEach(entityId => {
      const cb = this.content.querySelector(`.update-backup-checkbox[data-entity-id="${CSS.escape(entityId)}"]`);
      backupMap[entityId] = cb?.checked ?? false;
    });

    const updateList = selectedEntityIds.map(entityId => {
      const update = this.updateEntities.find(u => u.entity_id === entityId);
      const title = update?.attributes.title || update?.attributes.friendly_name || entityId;
      return `• ${title}${backupMap[entityId] ? ' 🛡' : ''}`;
    }).join('\n');

    const backupCount = Object.values(backupMap).filter(Boolean).length;
    const backupNote = backupCount > 0 ? `\n\n🛡 ${backupCount} item${backupCount !== 1 ? 's' : ''} will be backed up before updating.` : '';
    this.showConfirmDialog(
      'Confirm Bulk Update',
      `Are you sure you want to update the following ${count} item${count !== 1 ? 's' : ''}?\n\n${updateList}${backupNote}\n\nThis action cannot be undone.`,
      () => this.performBulkUpdate(backupMap)
    );
  }

  async performBulkUpdate(backupMap = {}) {
    const entityIds = Array.from(this.selectedUpdates);

    this.setLoading(true);

    // Mark all selected rows as queued upfront
    entityIds.forEach(id => this._setUpdateRowState(id, 'queued'));

    // Always sequential — HA backup (whether from our checkbox or HA's global
    // "backup before update" setting) is single-threaded and cannot run in parallel.
    const succeeded = [];
    const failed = [];

    for (let i = 0; i < entityIds.length; i++) {
      const entityId = entityIds[i];
      const backup = !!backupMap[entityId];
      const update = this.updateEntities?.find(u => u.entity_id === entityId);
      const title = update?.attributes?.title || update?.attributes?.friendly_name || entityId;
      const step = `${i + 1}/${entityIds.length}`;

      // Activate this row + show toast
      this._setUpdateRowState(entityId, 'active', { backup });
      this._showToast(
        backup ? `🛡 Backing up & updating ${title} (${step})…` : `⬆ Updating ${title} (${step})…`,
        'info', 0
      );

      try {
        await this._hass.callService('update', 'install', {
          entity_id: entityId,
          ...(backup && { backup: true }),
        });
        this._setUpdateRowState(entityId, 'done');
        succeeded.push(title);
      } catch (err) {
        console.error(`Error updating ${entityId}:`, err);
        this._setUpdateRowState(entityId, 'failed');
        failed.push(title);
      }
    }

    // Final summary toast
    const parts = [];
    if (succeeded.length) parts.push(`✓ ${succeeded.length} updated`);
    if (failed.length) parts.push(`✕ ${failed.length} failed`);
    this._showToast(parts.join(' · '), failed.length ? 'warning' : 'success');

    this.selectedUpdates.clear();
    this.updateSelectedUpdateCount();
    this.setLoading(false);
    setTimeout(() => this.loadUpdates(), 3000);
  }

  _showAllEntitiesDialog() {
    const integrations = this.data || [];

    // Detect raw config entry IDs used as platform names (32-char hex, no underscores/spaces).
    // Real integration names always contain letters outside a-f (e.g. "shelly", "mqtt", "zwave_js")
    // or use underscores. Config entry IDs are purely hexadecimal.
    const isHashId = s => s.length >= 20 && /^[0-9a-f]+$/i.test(s);

    const renderEntityRow = entity => {
      const name = this._escapeHtml(entity.original_name || entity.entity_id);
      const disabled = entity.is_disabled;
      const dot = `<span style="font-size:9px;color:${disabled ? 'var(--em-text-muted, #9e9e9e)' : 'var(--em-success)'}">●</span>`;
      const catBadge = entity.entity_category
        ? `<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:var(--em-bg-secondary);color:var(--em-text-secondary);flex-shrink:0">${this._escapeHtml(entity.entity_category)}</span>`
        : '';
      const disabledBadge = disabled
        ? `<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(244,67,54,0.1);color:var(--em-danger);flex-shrink:0">disabled</span>`
        : '';
      return `<div class="entity-list-item em-entity-row" style="padding:7px 14px;cursor:pointer"
                   data-entity-id="${this._escapeAttr(entity.entity_id)}">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  ${dot}
                  <span style="font-weight:600;font-size:13px">${name}</span>
                  <span style="font-size:11px;opacity:0.6;font-family:monospace">${this._escapeHtml(entity.entity_id)}</span>
                  ${catBadge}${disabledBadge}
                </div>
              </div>`;
    };

    const renderIntegration = integ => {
      const integLabel = integ.integration.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const allEntities = Object.values(integ.devices).flatMap(d => d.entities || []);

      const deviceGroupsHtml = Object.entries(integ.devices)
        .filter(([, dev]) => (dev.entities || []).length > 0)
        .sort(([idA, devA], [idB, devB]) => {
          if (idA === 'no_device') return 1;
          if (idB === 'no_device') return -1;
          return (devA.name || '').localeCompare(devB.name || '');
        })
        .map(([devId, dev]) => {
          const devLabel = devId === 'no_device'
            ? 'No Device (Orphaned)'
            : this._escapeHtml(dev.name || 'Unknown Device');

          const entitiesHtml = (dev.entities || [])
            .slice().sort((a, b) => (a.original_name || a.entity_id).localeCompare(b.original_name || b.entity_id))
            .map(renderEntityRow).join('');

          const cnt = dev.entities.length;
          return this._collGroup(
            `<span style="display:flex;align-items:center;gap:8px;flex:1">
              <span>${devLabel}</span>
              <span style="font-size:11px;opacity:0.55">${cnt} ${cnt === 1 ? 'entity' : 'entities'}</span>
            </span>`,
            entitiesHtml
          );
        }).join('');

      return { label: integLabel, count: allEntities.length, html: deviceGroupsHtml };
    };

    let totalCount = 0;
    const namedGroups = [];
    const otherEntities = [];   // collect all entities from hash-named integrations

    for (const integ of integrations) {
      const allEntities = Object.values(integ.devices).flatMap(d => d.entities || []);
      if (!allEntities.length) continue;
      totalCount += allEntities.length;

      if (isHashId(integ.integration)) {
        otherEntities.push(...allEntities);
      } else {
        namedGroups.push(renderIntegration(integ));
      }
    }

    namedGroups.sort((a, b) => a.label.localeCompare(b.label));

    const namedHtml = namedGroups.map(g =>
      this._collGroup(
        `<span style="display:flex;align-items:center;gap:8px;flex:1">
          <span style="font-weight:700">${this._escapeHtml(g.label)}</span>
          <span style="font-size:11px;opacity:0.55">${g.count} ${g.count === 1 ? 'entity' : 'entities'}</span>
        </span>`,
        g.html
      )
    ).join('');

    const otherHtml = otherEntities.length
      ? this._collGroup(
          `<span style="display:flex;align-items:center;gap:8px;flex:1">
            <span style="font-weight:700">Other</span>
            <span style="font-size:11px;opacity:0.55">${otherEntities.length} ${otherEntities.length === 1 ? 'entity' : 'entities'}</span>
          </span>`,
          otherEntities
            .slice().sort((a, b) => (a.original_name || a.entity_id).localeCompare(b.original_name || b.entity_id))
            .map(renderEntityRow).join('')
        )
      : '';

    const { overlay, closeDialog } = this.createDialog({
      title: `All Entities (${totalCount})`,
      color: 'var(--em-primary)',
      extraClass: 'entity-list-dialog',
      contentHtml: `
        <div class="entity-list-content">
          ${namedHtml + otherHtml || '<p style="text-align:center;padding:20px;opacity:0.6">No entities found</p>'}
        </div>`,
      actionsHtml: `<button class="btn btn-secondary" id="close-all-entities">Close</button>`
    });

    overlay.querySelector('#close-all-entities').addEventListener('click', closeDialog);

    this._reAttachCollapsibles(overlay);

    overlay.querySelectorAll('.em-entity-row[data-entity-id]').forEach(row => {
      row.addEventListener('click', () => this._showEntityDetailsDialog(row.dataset.entityId));
    });
  }

  async _renderActivityLogView() {
    const contentEl = this.content.querySelector('#content');
    // Guard: don't re-render while already loaded (preserves state during hass updates)
    if (contentEl.querySelector('.em-inline-view[data-view="activity-log"]')) return;

    const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    const svgRefresh = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;

    contentEl.innerHTML = `
      <div class="em-inline-view" data-view="activity-log">
        <div class="em-inline-view-header" style="flex-wrap:wrap;gap:8px">
          <button class="em-inline-back-btn">${svgBack} Back</button>
          <span class="em-inline-view-title">📋 Activity Log</span>
          <input id="act-search" type="text" placeholder="Search entity, device, message…"
            style="flex:1;min-width:160px;padding:6px 10px;border-radius:8px;border:2px solid var(--em-primary);
                   background:var(--em-bg-secondary);color:var(--em-text-primary);font-size:12px;outline:none;
                   box-shadow:0 0 0 2px color-mix(in srgb, var(--em-primary) 20%, transparent)">
          <div id="act-range-btns" style="display:flex;gap:3px">
            ${[1,6,24,168].map((h,i) => {
              const label = ['1h','6h','24h','7d'][i];
              const active = h === 1;
              return `<button class="act-range-btn" data-hours="${h}"
                style="background:${active?'var(--em-primary)':'transparent'};color:${active?'#fff':'var(--em-text-primary)'};
                       border:1px solid ${active?'var(--em-primary)':'var(--em-border)'};border-radius:12px;
                       padding:4px 10px;font-size:11px;cursor:pointer">${label}</button>`;
            }).join('')}
          </div>
          <button class="btn btn-secondary act-em-log-btn" title="View enable/disable/rename actions logged by EM" style="font-size:12px;padding:4px 10px">EM Actions</button>
          <button class="em-inline-refresh-btn" title="Refresh">${svgRefresh}</button>
        </div>
        <div class="em-inline-view-body">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div id="act-insights" style="display:none;width:290px;flex-shrink:0;overflow-y:auto"></div>
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
              <div id="act-filter-panel"></div>
              <div id="act-log-body" style="min-height:80px;display:flex;align-items:center;justify-content:center">
                <span style="color:var(--em-text-secondary);font-size:13px">Loading…</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const container = contentEl;
    container.querySelector('.em-inline-back-btn').addEventListener('click', () => this._closeView());
    container.querySelector('.em-inline-refresh-btn').addEventListener('click', () => this._refreshView());
    container.querySelector('.act-em-log-btn').addEventListener('click', () => this._showActivityLog());

    // Fetch registries to build area-aware entity lookup
    const [areaRegistry, deviceRegistry, entityRegistry] = await Promise.all([
      this._hass.callWS({ type: 'config/area_registry/list' }).catch(() => []),
      this._hass.callWS({ type: 'config/device_registry/list' }).catch(() => []),
      this._hass.callWS({ type: 'config/entity_registry/list' }).catch(() => []),
    ]);
    const areaNameMap   = new Map(areaRegistry.map(a => [a.area_id, a.name]));
    const deviceAreaMap = new Map(deviceRegistry.map(d => [d.id, d.area_id]));
    const entityAreaMap = new Map(entityRegistry.map(e => [e.entity_id, e.area_id]));

    const entityMap = {};
    for (const intg of (this.data || [])) {
      for (const [devId, dev] of Object.entries(intg.devices || {})) {
        const devName = dev.name || (devId === 'no_device' ? '(No Device)' : 'Unknown Device');
        for (const ent of (dev.entities || [])) {
          const areaId   = entityAreaMap.get(ent.entity_id) || deviceAreaMap.get(devId);
          const areaName = (areaId && areaNameMap.get(areaId)) || 'No Room';
          entityMap[ent.entity_id] = { integration: intg.integration, device_name: devName, area_name: areaName };
        }
      }
    }

    const watchKey = 'em-activity-watch';
    let watchConfig  = this._loadFromStorage(watchKey, { rooms: null });
    let allEvents    = [];
    let searchTerm   = '';
    let currentHours = 1;
    let checkedRooms = watchConfig.rooms === null ? null : new Set(watchConfig.rooms || []);

    const saveWatch = () => {
      this._saveToStorage(watchKey, { rooms: checkedRooms === null ? null : [...checkedRooms] });
    };

    const renderEventRow = (evt, today) => {
      const d = new Date(evt.when);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dayPfx  = d.toDateString() !== today
        ? `<span style="font-size:9px;opacity:0.65">${d.toLocaleDateString([],{month:'short',day:'numeric'})} </span>` : '';
      const unit = this._hass?.states?.[evt.entity_id]?.attributes?.unit_of_measurement || '';
      const stateVal = evt.state !== undefined && evt.state !== null ? `${evt.state}${unit ? ' '+unit : ''}` : '—';
      return `<div style="display:flex;align-items:baseline;gap:8px;padding:3px 0;border-bottom:1px solid var(--em-border-light)">
        <span style="font-size:10px;color:var(--em-text-secondary);min-width:52px;flex-shrink:0;font-variant-numeric:tabular-nums">${dayPfx}${timeStr}</span>
        <span style="font-size:12px;flex:1;min-width:0">${this._escapeHtml(stateVal)}</span>
      </div>`;
    };

    const CHART_UNIT_COLORS = {
      'V': 'var(--em-primary)',
      'kWh': 'var(--em-success)', 'Wh': 'var(--em-success)', 'MWh': 'var(--em-success)',
      'W': 'var(--em-warning)', 'kW': 'var(--em-warning)',
      '°C': '#ff7043', '°F': '#ff7043', 'K': '#ff7043',
      'dBm': '#9c27b0', 'ms': '#78909c', '%': 'var(--em-primary)', 'A': '#26c6da',
    };

    const renderSensorChart = (sortedNewestFirst, unit, color) => {
      const raw = sortedNewestFirst.slice(0, 60).reverse();
      const pairs = raw.map(e => ({ v: parseFloat(e.state), t: e.when })).filter(p => !isNaN(p.v));
      if (pairs.length < 2) return null;
      const vals  = pairs.map(p => p.v);
      const minV  = Math.min(...vals), maxV = Math.max(...vals);
      const avgV  = vals.reduce((a, b) => a + b, 0) / vals.length;
      const current = vals[vals.length - 1];
      const range = maxV - minV || 1;
      const n = pairs.length;
      const VW = 300, VH = 100, PAD_L = 4, PAD_R = 4, PAD_TOP = 14, PAD_BOT = 18;
      const chartW = VW - PAD_L - PAD_R, chartH = VH - PAD_TOP - PAD_BOT;
      const bw = Math.max(1, (chartW / n) * 0.72);
      const fmt = v => { const a=Math.abs(v); if(a>=1000)return Math.round(v).toString(); if(a>=10)return Number(v.toFixed(1)).toString(); return Number(v.toFixed(2)).toString(); };
      const fmtTime = ms => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const minIdx=vals.indexOf(minV), maxIdx=vals.indexOf(maxV), lastIdx=n-1, sparse=n<=15;
      const timeStep = n<=5?1:n<=15?2:n<=30?Math.ceil(n/5):Math.ceil(n/4);
      const timeIdxSet = new Set();
      for (let i=0;i<n;i+=timeStep) timeIdxSet.add(i);
      timeIdxSet.add(lastIdx);
      const barsEl=[], valLabels=[], timeLabels=[];
      pairs.forEach(({v,t},i) => {
        const bh=Math.max(2,((v-minV)/range)*(chartH-4)+3), x=PAD_L+(i/n)*chartW, y=PAD_TOP+chartH-bh, cx=x+bw/2, isLast=i===lastIdx;
        const tooltip=`${fmt(v)} ${unit}\n${fmtTime(t)}`;
        barsEl.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="currentColor" rx="0.8" opacity="${isLast?'1':'0.72'}"><title>${tooltip}</title></rect>`);
        const isKey=i===maxIdx||i===minIdx||isLast;
        if(sparse||isKey){const ly=Math.max(PAD_TOP-1,y-2);valLabels.push(`<text x="${cx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="${sparse?7:7.5}" font-weight="${isKey?'700':'400'}" fill="currentColor" opacity="${isKey?'1':'0.65'}">${fmt(v)}</text>`);}
        if(timeIdxSet.has(i))timeLabels.push(`<text x="${cx.toFixed(1)}" y="${(VH-2).toFixed(1)}" text-anchor="middle" font-size="6.5" fill="currentColor" opacity="0.5">${fmtTime(t)}</text>`);
      });
      const avgY=(PAD_TOP+chartH-((avgV-minV)/range*(chartH-4)+3)).toFixed(1);
      const avgLine=`<line x1="${PAD_L}" y1="${avgY}" x2="${VW-PAD_R}" y2="${avgY}" stroke="currentColor" stroke-width="1" stroke-dasharray="5,3" opacity="0.45"/>`;
      const avgLbl=`<text x="${(VW-PAD_R-1).toFixed(1)}" y="${(parseFloat(avgY)-2).toFixed(1)}" text-anchor="end" font-size="6.5" fill="currentColor" opacity="0.55" font-weight="600">avg ${fmt(avgV)} ${this._escapeHtml(unit)}</text>`;
      const contentHtml=`<div style="padding:8px 10px 4px"><svg viewBox="0 0 ${VW} ${VH}" style="display:block;width:100%;height:auto;color:${color}" xmlns="http://www.w3.org/2000/svg">${barsEl.join('')}${valLabels.join('')}${timeLabels.join('')}${avgLine}${avgLbl}</svg></div>`;
      return { contentHtml, currentFmt: `${fmt(current)} ${this._escapeHtml(unit)}`, avgFmt: `${fmt(avgV)} ${this._escapeHtml(unit)}` };
    };

    const renderBody = () => {
      const body = container.querySelector('#act-log-body');
      const term = searchTerm.toLowerCase();
      const grouped = {};
      for (const evt of allEvents) {
        const eid = evt.entity_id;
        if (!eid) continue;
        const info = entityMap[eid] || { integration: eid.split('.')[0], device_name: evt.name || eid, area_name: 'No Room' };
        const { device_name, area_name } = info;
        if (checkedRooms instanceof Set && !checkedRooms.has(area_name)) continue;
        if (term && !eid.toLowerCase().includes(term) &&
            !device_name.toLowerCase().includes(term) &&
            !area_name.toLowerCase().includes(term) &&
            !(evt.message || '').toLowerCase().includes(term) &&
            !(evt.name || '').toLowerCase().includes(term) &&
            !(evt.context_name || '').toLowerCase().includes(term)) continue;
        if (!grouped[area_name]) grouped[area_name] = {};
        if (!grouped[area_name][device_name]) grouped[area_name][device_name] = {};
        if (!grouped[area_name][device_name][eid]) grouped[area_name][device_name][eid] = [];
        grouped[area_name][device_name][eid].push(evt);
      }

      if (!Object.keys(grouped).length) {
        body.style.cssText = 'min-height:80px';
        const noneSelected = checkedRooms instanceof Set && checkedRooms.size === 0;
        body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--em-text-secondary);font-size:13px">
          ${noneSelected ? '☝️ Select rooms above to view activity' : 'No matching activity.'}</div>`;
        return;
      }

      const today = new Date().toDateString();
      const roomOrder = Object.keys(grouped).sort((a,b) => a==='No Room'?1:b==='No Room'?-1:a.localeCompare(b));

      const expandGroup = (headerHtml, bodyHtml) => {
        return `<div style="margin-bottom:4px">
          <div class="act-group-hdr"
            style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;
                   background:var(--em-bg-secondary);cursor:pointer;user-select:none;border:1px solid var(--em-border)">
            <span class="act-arrow" style="display:inline-flex;align-items:center;opacity:0.6;transition:transform 0.2s;transform:rotate(-90deg)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
            ${headerHtml}
          </div>
          <div style="padding-left:10px;display:none">${bodyHtml}</div>
        </div>`;
      };

      let html = '';
      for (const roomName of roomOrder) {
        let roomTotal = 0, devicesHtml = '';
        for (const [devName, entities] of Object.entries(grouped[roomName]).sort(([a],[b]) => a.localeCompare(b))) {
          let devTotal = 0, entitiesHtml = '';
          for (const [eid, evts] of Object.entries(entities)) {
            const sorted = evts.slice().sort((a,b) => new Date(b.when)-new Date(a.when));
            devTotal += sorted.length;
            const friendlyName = this._hass?.states?.[eid]?.attributes?.friendly_name || eid.split('.')[1] || eid;
            const meta = entityMap[eid];
            const mostRecent = sorted[0];
            const unit = this._hass?.states?.[eid]?.attributes?.unit_of_measurement || '';
            const rawState = mostRecent?.state != null ? `${mostRecent.state}${unit?' '+unit:''}` : null;
            const stateVal = rawState && rawState.length > 14 ? rawState.slice(0,12)+'…' : rawState;
            const infoLine = meta?.integration || eid.split('.')[0];
            const chartColor = CHART_UNIT_COLORS[unit] || null;
            const chartResult = chartColor ? renderSensorChart(sorted, unit, chartColor) : null;
            const ROW_CAP = 15;
            const overflow = !chartResult && sorted.length > ROW_CAP ? sorted.length - ROW_CAP : 0;
            const visibleRows = !chartResult ? sorted.slice(0, ROW_CAP) : sorted;
            const moreNote = overflow > 0 ? `<div style="font-size:11px;text-align:center;padding:4px 0;opacity:0.55">… and ${overflow} more change${overflow!==1?'s':''}</div>` : '';
            const contentHtml = chartResult ? chartResult.contentHtml : visibleRows.map(e => renderEventRow(e, today)).join('') + moreNote;
            entitiesHtml += this._renderMiniEntityCard({
              entity_id: eid, name: friendlyName,
              state: chartResult ? chartResult.currentFmt : stateVal,
              infoLine: null, superLabel: infoLine,
              extraChip: chartResult ? chartResult.avgFmt : null,
              contentHtml, compact: true,
            });
          }
          if (devTotal) {
            devicesHtml += expandGroup(
              `<span style="font-size:12px">📱 ${this._escapeHtml(devName)}</span><span style="font-size:10px;color:var(--em-text-secondary);margin-left:auto">(${devTotal})</span>`,
              `<div style="display:flex;flex-direction:column;gap:8px;padding:6px 0 4px">${entitiesHtml}</div>`
            );
            roomTotal += devTotal;
          }
        }
        const roomIcon = roomName === 'No Room' ? '📦' : '🏠';
        html += expandGroup(
          `<span style="font-size:13px;font-weight:600">${roomIcon} ${this._escapeHtml(roomName)}</span><span style="font-size:10px;color:var(--em-text-secondary);margin-left:auto">(${roomTotal})</span>`,
          devicesHtml
        );
      }

      body.style.cssText = 'min-height:80px';
      body.innerHTML = `<div style="padding:4px 0 8px">${html}</div>`;
      body.querySelectorAll('.act-group-hdr').forEach(hdr => {
        hdr.addEventListener('click', () => {
          const target = hdr.nextElementSibling;
          const arrow  = hdr.querySelector('.act-arrow');
          const isOpen = target.style.display !== 'none';
          target.style.display = isOpen ? 'none' : '';
          if (arrow) arrow.style.transform = isOpen ? 'rotate(-90deg)' : '';
        });
      });
    };

    const renderFilterPanel = () => {
      const panel = container.querySelector('#act-filter-panel');
      const roomSet = new Set(Object.values(entityMap).map(info => info.area_name));
      if (!roomSet.size) { panel.innerHTML = ''; return; }
      const rooms = [...roomSet].sort((a,b) => a==='No Room'?1:b==='No Room'?-1:a.localeCompare(b));
      const chipStyle = (active) =>
        `display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid var(--em-border);margin:2px;
         background:${active?'var(--em-primary)':'var(--em-bg-secondary)'};color:${active?'#fff':'var(--em-text-primary)'}`;
      const allChecked  = checkedRooms === null;
      const noneChecked = checkedRooms instanceof Set && checkedRooms.size === 0;
      const chips = rooms.map(r => {
        const on = allChecked || (checkedRooms instanceof Set && checkedRooms.has(r));
        return `<span class="act-room-chip" data-room="${this._escapeAttr(r)}" style="${chipStyle(on)}">${this._escapeHtml(r)}</span>`;
      }).join('');
      panel.innerHTML = `
        <div style="border:1px solid var(--em-border);border-radius:8px;padding:6px 10px;background:var(--em-bg-secondary)">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:0">
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--em-text-secondary);margin-right:6px">Rooms</span>
            <span class="act-room-chip" data-room="__all__"  style="${chipStyle(allChecked)};font-weight:600">All</span>
            <span class="act-room-chip" data-room="__none__" style="${chipStyle(noneChecked)};font-weight:600">None</span>
            ${chips}
          </div>
        </div>`;
      panel.querySelectorAll('.act-room-chip').forEach(chip => {
        chip.addEventListener('click', async () => {
          const val = chip.dataset.room;
          if (val === '__all__')        { checkedRooms = null; }
          else if (val === '__none__')  { checkedRooms = new Set(); }
          else {
            let set = checkedRooms === null ? new Set(rooms) : new Set(checkedRooms);
            if (set.has(val)) set.delete(val); else set.add(val);
            checkedRooms = set;
          }
          saveWatch();
          renderFilterPanel();
          await loadLog(currentHours);
        });
      });
    };

    const loadLog = async (hours) => {
      currentHours = hours;
      const body = container.querySelector('#act-log-body');
      if (checkedRooms instanceof Set && checkedRooms.size === 0) {
        body.style.cssText = 'min-height:80px';
        body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--em-text-secondary);font-size:13px">☝️ Select rooms above to view activity</div>`;
        allEvents = [];
        return;
      }
      body.style.cssText = 'min-height:80px;display:flex;align-items:center;justify-content:center';
      body.innerHTML = `<span style="color:var(--em-text-secondary);font-size:13px">Loading…</span>`;
      const ENTITY_FETCH_CAP = 400;
      let entityIdsToFetch;
      if (checkedRooms === null) {
        entityIdsToFetch = Object.keys(entityMap).slice(0, ENTITY_FETCH_CAP);
      } else {
        entityIdsToFetch = Object.entries(entityMap)
          .filter(([, info]) => checkedRooms.has(info.area_name))
          .map(([eid]) => eid).slice(0, ENTITY_FETCH_CAP);
      }
      if (!entityIdsToFetch.length) {
        body.style.cssText = 'min-height:80px';
        body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--em-text-secondary);font-size:13px">No entities found for selected rooms.</div>`;
        allEvents = [];
        return;
      }
      const endTime   = new Date().toISOString();
      const startTime = new Date(Date.now() - hours * 3600000).toISOString();
      try {
        const history = await this._hass.callWS({
          type: 'history/history_during_period',
          start_time: startTime, end_time: endTime,
          entity_ids: entityIdsToFetch,
          significant_changes_only: true, minimal_response: true, no_attributes: true,
        });
        allEvents = [];
        for (const [eid, states] of Object.entries(history || {})) {
          for (const s of states) {
            const ts = s.lc ?? s.lu ?? s.last_changed ?? s.last_updated;
            allEvents.push({ entity_id: eid, when: ts > 1e10 ? ts : ts * 1000, state: s.s ?? s.state, name: this._hass?.states?.[eid]?.attributes?.friendly_name || eid });
          }
        }
        allEvents.sort((a,b) => new Date(b.when)-new Date(a.when));

        // ── Most Active insights ──────────────────────────────────────────
        const entityCounts={}, deviceCounts={}, integCounts={};
        const entityLastSeen={}, deviceLastSeen={}, integLastSeen={};
        for (const ev of allEvents) {
          entityCounts[ev.entity_id]=(entityCounts[ev.entity_id]||0)+1;
          if (!entityLastSeen[ev.entity_id]||ev.when>entityLastSeen[ev.entity_id]) entityLastSeen[ev.entity_id]=ev.when;
          const meta=entityMap[ev.entity_id];
          if (meta?.device_name&&meta.device_name!==ev.entity_id) {
            deviceCounts[meta.device_name]=(deviceCounts[meta.device_name]||0)+1;
            if (!deviceLastSeen[meta.device_name]||ev.when>deviceLastSeen[meta.device_name]) deviceLastSeen[meta.device_name]=ev.when;
          }
          const integ=meta?.integration||ev.entity_id.split('.')[0];
          integCounts[integ]=(integCounts[integ]||0)+1;
          if (!integLastSeen[integ]||ev.when>integLastSeen[integ]) integLastSeen[integ]=ev.when;
        }
        const topN=(obj,n=7)=>Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n);
        const topEntities=topN(entityCounts), topDevices=topN(deviceCounts), topInteg=topN(integCounts);
        const deviceMeta={}, integDevices={}, integEntities={};
        for (const [eid,meta] of Object.entries(entityMap)) {
          const integ=meta.integration||eid.split('.')[0];
          if (meta.device_name&&meta.device_name!==eid) {
            if (!deviceMeta[meta.device_name]) deviceMeta[meta.device_name]={integration:meta.integration,area_name:meta.area_name};
            if (!integDevices[integ]) integDevices[integ]=new Set();
            integDevices[integ].add(meta.device_name);
          }
          if (!integEntities[integ]) integEntities[integ]=new Set();
          integEntities[integ].add(eid);
        }
        const fmtAgo=ms=>{if(!ms)return'';const d=new Date(ms);return !isNaN(d.getTime())?this._fmtAgo(d.toISOString()):'';};
        const fullBar=(pct,color)=>`<div style="width:100%;background:rgba(128,128,128,0.15);border-radius:3px;height:5px;margin:4px 0 3px"><div style="background:${color};width:${pct}%;height:5px;border-radius:3px;min-width:2px;transition:width 0.4s ease"></div></div>`;
        const countBadge=(n,color)=>`<span style="font-size:12px;font-weight:700;color:${color};flex-shrink:0">${n} <span style="font-size:9px;font-weight:400;opacity:0.6">events</span></span>`;
        const rowStyle='padding:6px 0;border-bottom:1px solid var(--em-border-light)';
        const sub=t=>`<div style="font-size:10px;color:var(--em-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t}</div>`;
        const agoLine=t=>t?`<div style="font-size:10px;opacity:0.45;margin-top:1px">last seen ${t}</div>`:'';
        const renderEntityCol=items=>{const max=items[0]?.[1]||1;return items.map(([eid,count])=>{const name=this._hass?.states?.[eid]?.attributes?.friendly_name||eid.split('.')[1]||eid;const meta=entityMap[eid];const pct=Math.round(count/max*100);const subParts=[this._escapeHtml(eid)];if(meta?.area_name&&meta.area_name!=='No Room')subParts.push(this._escapeHtml(meta.area_name));const agoStr=fmtAgo(entityLastSeen[eid]);return`<div style="${rowStyle}"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px"><span style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1" title="${this._escapeAttr(eid)}">${this._escapeHtml(name)}</span>${countBadge(count,'var(--em-primary)')}</div>${fullBar(pct,'var(--em-primary)')}${sub(subParts.join(' · '))}${agoLine(agoStr)}</div>`;}).join('');};
        const renderDeviceCol=items=>{const max=items[0]?.[1]||1;return items.map(([devName,count])=>{const meta=deviceMeta[devName]||{};const pct=Math.round(count/max*100);const subParts=[];if(meta.integration)subParts.push(this._escapeHtml(meta.integration));if(meta.area_name&&meta.area_name!=='No Room')subParts.push(this._escapeHtml(meta.area_name));const agoStr=fmtAgo(deviceLastSeen[devName]);return`<div style="${rowStyle}"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px"><span style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1" title="${this._escapeAttr(devName)}">${this._escapeHtml(devName)}</span>${countBadge(count,'var(--em-warning)')}</div>${fullBar(pct,'var(--em-warning)')}${subParts.length?sub(subParts.join(' · ')):''}${agoLine(agoStr)}</div>`;}).join('');};
        const renderIntegCol=items=>{const max=items[0]?.[1]||1;return items.map(([integ,count])=>{const devCount=integDevices[integ]?.size||0;const entCount=integEntities[integ]?.size||0;const pct=Math.round(count/max*100);const agoStr=fmtAgo(integLastSeen[integ]);return`<div style="${rowStyle}"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px"><span style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1" title="${this._escapeAttr(integ)}">${this._escapeHtml(integ)}</span>${countBadge(count,'var(--em-success)')}</div>${fullBar(pct,'var(--em-success)')}${sub(`${devCount} device${devCount!==1?'s':''} · ${entCount} entit${entCount!==1?'ies':'y'}`)}${agoLine(agoStr)}</div>`;}).join('');};
        const colBox=(icon,label,color,content)=>`<div style="background:var(--em-bg-secondary);border-radius:8px;border:1px solid var(--em-border);padding:10px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${color};margin-bottom:4px">${icon} ${label}</div>${content}</div>`;
        const insightsEl = container.querySelector('#act-insights');
        insightsEl.style.display = '';
        insightsEl.innerHTML = `
          <div style="font-size:11px;font-weight:700;letter-spacing:0.3px;color:var(--em-text-secondary);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--em-border)">🏆 Top Active</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${colBox('🔥','Top Entities','var(--em-primary)',renderEntityCol(topEntities))}
            ${colBox('📦','Top Devices','var(--em-warning)',renderDeviceCol(topDevices))}
            ${colBox('🔌','Top Integrations','var(--em-success)',renderIntegCol(topInteg))}
          </div>`;
      } catch (e) {
        const body2 = container.querySelector('#act-log-body');
        body2.style.cssText = 'min-height:80px';
        body2.innerHTML = `<div style="padding:16px;color:var(--em-danger);font-size:13px">⚠ Could not load history: ${this._escapeHtml(e.message || String(e))}</div>`;
        return;
      }
      if (!allEvents.length) {
        body.style.cssText = 'min-height:80px';
        body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--em-text-secondary);font-size:13px">No entity activity in this period.</div>`;
        return;
      }
      renderBody();
    };

    container.querySelector('#act-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderBody();
    });
    container.querySelector('#act-range-btns').addEventListener('click', async (e) => {
      const btn = e.target.closest('.act-range-btn');
      if (!btn) return;
      const hours = parseInt(btn.dataset.hours, 10);
      container.querySelectorAll('.act-range-btn').forEach(b => {
        const active = parseInt(b.dataset.hours, 10) === hours;
        b.style.background  = active ? 'var(--em-primary)' : 'transparent';
        b.style.color       = active ? '#fff' : 'var(--em-text-primary)';
        b.style.borderColor = active ? 'var(--em-primary)' : 'var(--em-border)';
      });
      await loadLog(hours);
    });

    renderFilterPanel();
    await loadLog(1);
  }

  // ===== LAST ACTIVITY TIMELINE VIEW =====

  // Build and return the HTML for the timeline body sections based on filter + search.
  _buildTimelineBody(items, activeFilter, searchTerm) {
    const now = Date.now();
    const filterFn = {
      'all':      () => true,
      'today':    i => i.ts && (now - i.ts) < 86400000,
      'week':     i => i.ts && (now - i.ts) < 7 * 86400000,
      'month':    i => i.ts && (now - i.ts) < 30 * 86400000,
      '3months':  i => i.ts && (now - i.ts) < 90 * 86400000,
      '6months':  i => i.ts && (now - i.ts) < 180 * 86400000,
      '1year':    i => i.ts && (now - i.ts) < 365 * 86400000,
      'older':    i => !i.ts || (now - i.ts) >= 365 * 86400000,
      'never':    i => !i.ts,
    }[activeFilter] ?? (() => true);

    const q = searchTerm.trim().toLowerCase();
    const searchFn = q
      ? i => i.eid.includes(q) || i.name.toLowerCase().includes(q)
             || i.deviceName.toLowerCase().includes(q) || i.integration.toLowerCase().includes(q)
      : () => true;

    const filtered = items.filter(i => filterFn(i) && searchFn(i));
    if (!filtered.length) {
      return `<div style="text-align:center;padding:40px;color:var(--em-text-secondary);font-size:13px">No items match the current filter.</div>`;
    }

    const timeRow = (i) => {
      const timeEl = i.ts
        ? `<span class="em-timeline-time">🕐 ${this._escapeHtml(this._formatTimeDiff(now - i.ts))} ago</span>`
        : `<span class="em-timeline-never">Never</span>`;
      const deviceEl = i.deviceName
        ? `<span class="em-timeline-device">${this._escapeHtml(i.deviceName)}</span>` : '';
      return `<div class="em-timeline-row" data-entity-id="${this._escapeAttr(i.eid)}">
        <span class="em-timeline-name">${this._escapeHtml(i.name)}</span>
        <span class="em-timeline-id">${this._escapeHtml(i.eid)}</span>
        ${deviceEl}
        ${timeEl}
      </div>`;
    };

    const makeSection = (emoji, label, catItems) => {
      if (!catItems.length) return '';
      const sorted = catItems.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
      const rows = sorted.map(timeRow).join('');
      return this._collGroup(`${emoji} ${label} (${sorted.length})`, rows);
    };

    // All known domain-group categories in display order
    const SECTION_DEFS = [
      { key: 'automations', emoji: '🤖', label: 'Automations' },
      { key: 'scripts',     emoji: '⚡', label: 'Scripts' },
      { key: 'helpers',     emoji: '🎛️', label: 'Helpers' },
      { key: 'templates',   emoji: '🧩', label: 'Templates' },
      { key: 'lights',      emoji: '💡', label: 'Lights' },
      { key: 'switches',    emoji: '🔌', label: 'Switches' },
      { key: 'sensors',     emoji: '🌡️', label: 'Sensors' },
      { key: 'binary',      emoji: '🔍', label: 'Binary Sensors' },
      { key: 'media',       emoji: '📺', label: 'Media Players' },
      { key: 'climate',     emoji: '❄️', label: 'Climate & Environment' },
      { key: 'security',    emoji: '🔒', label: 'Security' },
      { key: 'cameras',     emoji: '📷', label: 'Cameras' },
      { key: 'tracking',    emoji: '📍', label: 'People & Tracking' },
      { key: 'controls',    emoji: '🔘', label: 'Controls' },
      { key: 'updates',     emoji: '⬆️', label: 'Updates' },
      { key: 'other',       emoji: '⚙️', label: 'Other' },
    ];

    const byCategory = {};
    for (const { key } of SECTION_DEFS) byCategory[key] = [];
    for (const i of filtered) {
      (byCategory[i.category] || byCategory.other).push(i);
    }

    // "Other" sub-grouped by integration for navigability
    const otherByIntg = {};
    for (const i of byCategory.other) {
      const k = i.integration || i.domain;
      if (!otherByIntg[k]) otherByIntg[k] = [];
      otherByIntg[k].push(i);
    }
    const otherInner = Object.keys(otherByIntg).sort().map(intg => {
      const g = otherByIntg[intg].slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
      return this._collGroup(intg.replace(/_/g, ' ') + ` (${g.length})`, g.map(timeRow).join(''));
    }).join('');
    const otherSection = byCategory.other.length
      ? this._collGroup(`⚙️ Other (${byCategory.other.length})`, `<div>${otherInner}</div>`)
      : '';

    return [
      ...SECTION_DEFS.filter(d => d.key !== 'other').map(({ key, emoji, label }) => makeSection(emoji, label, byCategory[key])),
      otherSection,
    ].join('');
  }

  _renderActivityTimelineView() {
    const contentEl = this.content.querySelector('#content');
    if (!contentEl) return;
    // Guard: preserve filter/search state during hass updates
    if (contentEl.querySelector('.em-inline-view[data-view="activity-timeline"]')) return;

    // Build entity→integration lookup from loaded entity tree
    const entityIntegrationMap = new Map();
    for (const intg of this.data || []) {
      for (const dev of Object.values(intg.devices || {})) {
        for (const e of dev.entities || []) {
          entityIntegrationMap.set(e.entity_id, intg.integration);
        }
      }
    }

    const HELPER_DOMAINS = new Set([
      'input_boolean', 'input_button', 'input_datetime', 'input_number',
      'input_select', 'input_text', 'counter', 'timer', 'variable',
    ]);
    const templateIds = new Set((this.templateSensors || []).map(t => t.entity_id));

    // Domain → category key for entity grouping
    const DOMAIN_CATEGORY = {
      light: 'lights',
      switch: 'switches',
      sensor: 'sensors',
      binary_sensor: 'binary',
      media_player: 'media', remote: 'media',
      climate: 'climate', weather: 'climate', fan: 'climate', humidifier: 'climate',
      cover: 'security', lock: 'security', alarm_control_panel: 'security', siren: 'security',
      camera: 'cameras', image: 'cameras',
      device_tracker: 'tracking', person: 'tracking', zone: 'tracking',
      button: 'controls', number: 'controls', select: 'controls',
      text: 'controls', event: 'controls',
      update: 'updates',
    };

    // Build unified item list from all HA states
    const items = Object.values(this._hass?.states || {}).map(s => {
      const domain = s.entity_id.split('.')[0];
      let category = 'other';
      if (domain === 'automation') category = 'automations';
      else if (domain === 'script') category = 'scripts';
      else if (HELPER_DOMAINS.has(domain)) category = 'helpers';
      else if (templateIds.has(s.entity_id)) category = 'templates';
      else category = DOMAIN_CATEGORY[domain] || 'other';

      let ts = null;
      if (category === 'automations' || category === 'scripts') {
        if (s.attributes?.last_triggered) ts = new Date(s.attributes.last_triggered).getTime();
      } else {
        ts = this._lastActivityCache?.get(s.entity_id)
          ?? (s.last_changed ? new Date(s.last_changed).getTime() : null);
      }

      const deviceId = this.entityDeviceMap?.get(s.entity_id);
      const device = deviceId ? this.deviceInfo?.[deviceId] : null;
      const deviceName = device ? (device.name_by_user || device.name || '') : '';
      const integration = entityIntegrationMap.get(s.entity_id) || domain;

      return {
        eid: s.entity_id,
        name: s.attributes?.friendly_name || s.entity_id,
        domain, category, ts, deviceName, integration, state: s.state,
      };
    });

    const activeFilter = localStorage.getItem('em-at-filter') || 'all';
    const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    const svgRefresh = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>`;

    const filterPills = ['all','today','week','month','3months','6months','1year','older','never'].map(f => {
      const labels = { all:'All', today:'Today', week:'This Week', month:'1 Month', '3months':'3 Months', '6months':'6 Months', '1year':'1 Year', older:'Older', never:'Never' };
      const isActive = f === activeFilter;
      return `<button class="em-at-filter${isActive ? ' active' : ''}${f==='never' ? ' never-filter' : ''}" data-filter="${f}">${labels[f]}</button>`;
    }).join('');

    contentEl.innerHTML = `
      <div class="em-inline-view" data-view="activity-timeline">
        <div class="em-inline-view-header" style="flex-wrap:wrap;gap:8px;align-items:center">
          <button class="em-inline-back-btn">${svgBack} Back</button>
          <span class="em-inline-view-title">🕐 Last Activity</span>
          <span id="em-at-count" class="sidebar-count-badge" style="font-size:12px"></span>
          <input id="em-at-search" type="text" class="em-at-search-input" placeholder="Search name, entity ID, device…" style="flex:1;min-width:140px;max-width:260px;padding:5px 10px;border-radius:6px;border:1.5px solid var(--em-border);background:var(--em-bg-secondary);color:var(--em-text);font-size:13px">
          <div class="em-at-filters">${filterPills}</div>
          <button class="em-inline-refresh-btn" id="em-at-refresh" title="Refresh timestamps">${svgRefresh}</button>
        </div>
        <div class="em-inline-view-body" id="em-at-body">
          ${this._buildTimelineBody(items, activeFilter, '')}
        </div>
      </div>`;

    // Auto-expand first collapsible section
    const firstGroup = contentEl.querySelector('.em-group-body');
    const firstArrow = contentEl.querySelector('.em-collapse-arrow, .em-collapsible-icon');
    if (firstGroup) firstGroup.style.display = '';
    if (firstArrow) firstArrow.style.transform = '';

    this._reAttachCollapsibles(contentEl);

    const bodyEl = contentEl.querySelector('#em-at-body');
    const countEl = contentEl.querySelector('#em-at-count');
    const updateCount = () => {
      if (countEl) countEl.textContent = bodyEl.querySelectorAll('.em-timeline-row').length.toLocaleString();
    };
    updateCount();

    let debounceTimer;

    // Back button
    contentEl.querySelector('.em-inline-back-btn')?.addEventListener('click', () => this._closeView());

    // Filter pills
    contentEl.querySelector('.em-at-filters')?.addEventListener('click', e => {
      const btn = e.target.closest('.em-at-filter');
      if (!btn) return;
      const f = btn.dataset.filter;
      localStorage.setItem('em-at-filter', f);
      contentEl.querySelectorAll('.em-at-filter').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
      const q = contentEl.querySelector('#em-at-search')?.value || '';
      bodyEl.innerHTML = this._buildTimelineBody(items, f, q);
      this._reAttachCollapsibles(bodyEl);
      updateCount();
    });

    // Search
    contentEl.querySelector('#em-at-search')?.addEventListener('input', e => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const f = localStorage.getItem('em-at-filter') || 'all';
        bodyEl.innerHTML = this._buildTimelineBody(items, f, e.target.value);
        this._reAttachCollapsibles(bodyEl);
        updateCount();
      }, 200);
    });

    // Refresh — invalidate cache and reload
    contentEl.querySelector('#em-at-refresh')?.addEventListener('click', () => {
      try { localStorage.removeItem('em_lastActivityCache'); } catch (_) {}
      this._loadLastActivityCache(); // re-fetches from recorder; calls updateView() when done
    });

    // Row click → entity details
    bodyEl.addEventListener('click', e => {
      const row = e.target.closest('.em-timeline-row[data-entity-id]');
      if (!row) return;
      this._showEntityDetailsDialog(row.dataset.entityId);
    });
  }

  /**
   * Combined area + floor assignment dialog.
   * Left panel: scrollable area list (filtered by floor) + floor filter list.
   * Right panel: entity/device info + live assignment preview.
   * Clicking Apply calls _assignAreaToEntities(entities, selectedAreaId).
   */
  async _showAreaFloorDialog(title, entities) {
    // Load directly from native HA registries — more reliable than the EM custom WS handler
    let floors = [];
    let areas  = [];
    try {
      floors = (await this._hass.callWS({ type: 'config/floor_registry/list' }) || [])
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { console.warn('EM: floor_registry/list failed', e); }
    try {
      areas = (await this._hass.callWS({ type: 'config/area_registry/list' }) || [])
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { console.warn('EM: area_registry/list failed', e); }

    const floorName = new Map(floors.map(f => [f.floor_id, f.name]));

    // Helper to refresh both lists after create operations
    const refreshRegistries = async () => {
      try {
        floors = (await this._hass.callWS({ type: 'config/floor_registry/list' }) || [])
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) { /* keep current */ }
      try {
        areas = (await this._hass.callWS({ type: 'config/area_registry/list' }) || [])
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) { /* keep current */ }
      floors.forEach(f => floorName.set(f.floor_id, f.name));
    };

    // Dialog state
    let selectedAreaId  = undefined; // undefined = nothing chosen, null = "No Area"
    let selectedFloorId = null;      // null = no floor filter

    // Build entity info HTML — all entities as 2-col grid cards
    const buildInfoHtml = () => {
      return entities.map(e => {
        const friendlyName = this._hass?.states?.[e.entity_id]?.attributes?.friendly_name || e.original_name || null;
        const name = this._escapeHtml(e.deviceName || friendlyName || e.entity_id);
        const subName = (e.deviceName && friendlyName && friendlyName !== e.deviceName)
          ? `<div style="font-size:10px;color:var(--em-text-secondary);margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(friendlyName)}</div>` : '';
        const currentAreaId = e.device_id
          ? (this.deviceInfo?.[e.device_id]?.area_id || null)
          : (this.entityAreaMap?.get(e.entity_id) || null);
        const info = currentAreaId ? (this.areaLookup?.get(currentAreaId) || null) : null;
        const curArea  = info?.areaName  ? `<span style="color:var(--em-success)">📍 ${this._escapeHtml(info.areaName)}</span>`  : `<span style="opacity:0.45;font-style:italic">No area</span>`;
        const curFloor = info?.floorName ? `<span style="color:var(--em-text-secondary)">🏢 ${this._escapeHtml(info.floorName)}</span>` : '';
        return `<div class="em-afd-entity-card">
          <div class="em-afd-entity-name">${name}</div>
          ${subName}
          <div style="font-size:10px;font-family:monospace;color:var(--em-text-secondary);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(e.entity_id)}</div>
          <div class="em-afd-meta">${curArea}${curFloor ? ` &nbsp;${curFloor}` : ''}</div>
        </div>`;
      }).join('');
    };

    // Build a friendly subject name from the entity/device being assigned
    const _afdSubject = (() => {
      if (entities.length === 1) {
        const e = entities[0];
        return e.deviceName
          || this._hass?.states?.[e.entity_id]?.attributes?.friendly_name
          || e.original_name
          || e.entity_id;
      }
      const deviceIds = [...new Set(entities.map(e => e.device_id || this.entityDeviceMap?.get(e.entity_id)).filter(Boolean))];
      if (deviceIds.length === 1) {
        const dev = this.deviceInfo?.[deviceIds[0]];
        return dev?.name_by_user || dev?.name || entities[0].deviceName || `${entities.length} entities`;
      }
      return `${entities.length} entities`;
    })();

    const { overlay, closeDialog } = this.createDialog({
      title: `Assigning ${_afdSubject} to area`,
      extraClass: 'em-afd-dialog',
      contentHtml: `
        <div class="em-afd-wrap">
          <div class="em-afd-top">
            <div class="em-afd-left">
              <div class="em-afd-section">
                <div class="em-afd-section-toggle" data-section="floor">
                  <span class="em-afd-section-arrow"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
                  <span class="em-afd-dropdown-label">1. Select floor</span>
                </div>
                <div class="em-afd-section-body" data-body="floor">
                  <div class="em-afd-floor-list"></div>
                  <button class="em-afd-create-btn em-afd-create-floor">＋ Create a new floor</button>
                </div>
              </div>
            </div>
            <div class="em-afd-right">
              <div class="em-afd-section">
                <div class="em-afd-section-toggle" data-section="area">
                  <span class="em-afd-section-arrow"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
                  <span class="em-afd-dropdown-label em-afd-area-label">2. Select area</span>
                </div>
                <div class="em-afd-section-body" data-body="area">
                  <div class="em-afd-area-list"></div>
                  <button class="em-afd-create-btn em-afd-create-area">＋ Create an area</button>
                </div>
              </div>
            </div>
          </div>
          <hr class="em-afd-divider">
          <div class="em-afd-info-box">${buildInfoHtml()}</div>
        </div>`,
      actionsHtml: `
        <button class="btn em-afd-apply-btn" disabled>Select an area first</button>
        <button class="btn btn-secondary em-afd-cancel-btn">Cancel</button>`,
    });

    const areaListEl  = overlay.querySelector('.em-afd-area-list');
    const floorListEl = overlay.querySelector('.em-afd-floor-list');
    const areaLabelEl = overlay.querySelector('.em-afd-area-label');
    const infoBoxEl   = overlay.querySelector('.em-afd-info-box');
    const applyBtn    = overlay.querySelector('.em-afd-apply-btn');

    const updateAreaLabel = () => {
      if (selectedFloorId) {
        const fName = floors.find(f => f.floor_id === selectedFloorId)?.name || selectedFloorId;
        areaLabelEl.textContent = `2. Select area (new areas placed on ${fName})`;
      } else {
        areaLabelEl.textContent = '2. Select area';
      }
    };

    const updateApplyBtn = () => {
      const hasSelection = selectedAreaId !== undefined && selectedAreaId !== null && selectedFloorId !== null;
      infoBoxEl.classList.toggle('em-afd-info-selected', hasSelection);
      if (selectedAreaId === undefined) {
        applyBtn.disabled = true;
        applyBtn.innerHTML = 'Select an area first';
      } else if (selectedAreaId === null) {
        applyBtn.disabled = false;
        applyBtn.innerHTML = 'Remove area &amp; floor assignment';
      } else {
        const area  = areas.find(a => a.area_id === selectedAreaId);
        const aName = area?.name || selectedAreaId;
        const fName = area?.floor_id ? (floorName.get(area.floor_id) || '') : '';
        applyBtn.disabled = false;
        const floorPart = fName
          ? ` <span style="font-size:11px;opacity:0.75;font-weight:400">· ${this._escapeHtml(fName)}</span>`
          : '';
        applyBtn.innerHTML = `Assign to <strong style="text-decoration:underline">${this._escapeHtml(aName)}</strong>${floorPart}`;
      }
    };

    const updatePreview = () => {
      updateAreaLabel();
      updateApplyBtn();
    };

    const renderAreaList = () => {
      // Always show all areas — floor selection only affects new area creation and preview,
      // not which areas are visible. Users should always be able to find their area.
      const isClearSel = selectedAreaId === null;
      let html = `<div class="em-afd-row em-afd-clear${isClearSel ? ' em-afd-selected' : ''}" data-area-id="__clear__">
        <span>🚫</span>
        <span style="flex:1">No area</span>
        ${isClearSel ? '<span style="color:var(--em-primary);font-weight:700">✓</span>' : ''}
      </div>`;

      if (areas.length) {
        html += areas.map(a => {
          const isSel = selectedAreaId === a.area_id;
          const fName = a.floor_id ? floorName.get(a.floor_id) : null;
          return `<div class="em-afd-row${isSel ? ' em-afd-selected' : ''}" data-area-id="${this._escapeAttr(a.area_id)}">
            <span>📍</span>
            <div style="flex:1;min-width:0">
              <div>${this._escapeHtml(a.name)}</div>
              ${fName ? `<div style="font-size:11px;color:var(--em-text-secondary);margin-top:1px">🏢 ${this._escapeHtml(fName)}</div>` : ''}
            </div>
            ${isSel ? '<span style="color:var(--em-primary);font-weight:700">✓</span>' : ''}
          </div>`;
        }).join('');
      } else {
        html += `<div style="padding:8px 10px;font-size:12px;opacity:0.55;font-style:italic">No areas defined yet</div>`;
      }

      areaListEl.innerHTML = html;
      areaListEl.querySelectorAll('.em-afd-row').forEach(row => {
        row.addEventListener('click', () => {
          selectedAreaId = row.dataset.areaId === '__clear__' ? null : row.dataset.areaId;
          // If user picks an area on a different floor, update selectedFloorId to match
          if (selectedAreaId) {
            const pickedArea = areas.find(a => a.area_id === selectedAreaId);
            if (pickedArea?.floor_id) selectedFloorId = pickedArea.floor_id;
          }
          renderAreaList();
          renderFloorList();
          updatePreview();
        });
      });
    };

    const renderFloorList = () => {
      if (!floors.length) {
        floorListEl.innerHTML = `<div style="padding:8px 10px;font-size:12px;opacity:0.55;font-style:italic">No floors defined</div>`;
        return;
      }
      floorListEl.innerHTML = floors.map(f => {
        const isSel = selectedFloorId === f.floor_id;
        return `<div class="em-afd-row${isSel ? ' em-afd-selected' : ''}" data-floor-id="${this._escapeAttr(f.floor_id)}">
          <span>🏢</span>
          <span style="flex:1">${this._escapeHtml(f.name)}</span>
          ${isSel ? '<span style="color:var(--em-primary);font-weight:700">✓</span>' : ''}
        </div>`;
      }).join('');

      floorListEl.querySelectorAll('.em-afd-row').forEach(row => {
        row.addEventListener('click', () => {
          // Toggle floor selection — only affects new area creation and area label
          selectedFloorId = selectedFloorId === row.dataset.floorId ? null : row.dataset.floorId;
          updateAreaLabel();
          renderFloorList();
          updatePreview();
        });
      });
    };

    // Create area (attached to selected floor if one is active)
    overlay.querySelector('.em-afd-create-area').addEventListener('click', () => {
      this._showPromptDialog('Create new area', 'Enter area name:', '', async (name) => {
        if (!name?.trim()) return;
        try {
          const opts = { name: name.trim() };
          if (selectedFloorId) opts.floor_id = selectedFloorId;
          const newArea = await this._hass.callWS({ type: 'config/area_registry/create', ...opts });
          await refreshRegistries();
          selectedAreaId = newArea.area_id;
          renderFloorList();
          renderAreaList();
          updatePreview();
        } catch (e) {
          this._showToast('Failed to create area: ' + (e.message || e), 'error');
        }
      });
    });

    // Create floor
    overlay.querySelector('.em-afd-create-floor').addEventListener('click', () => {
      this._showPromptDialog('Create new floor', 'Enter floor name:', '', async (name) => {
        if (!name?.trim()) return;
        try {
          const newFloor = await this._hass.callWS({ type: 'config/floor_registry/create', name: name.trim() });
          await refreshRegistries();
          selectedFloorId = newFloor.floor_id;
          updateAreaLabel();
          renderFloorList();
          renderAreaList();
        } catch (e) {
          this._showToast('Failed to create floor: ' + (e.message || e), 'error');
        }
        return;
      });
    });

    // Apply
    applyBtn.addEventListener('click', async () => {
      const areaId = selectedAreaId === undefined ? undefined : (selectedAreaId || null);
      if (areaId === undefined) return;
      try {
        await this._assignAreaToEntities(entities, areaId);
        this.floorsData = null;
        const n = entities.length;
        const areaName = areaId ? (areas.find(a => a.area_id === areaId)?.name || areaId) : 'None';
        entities.forEach(e => {
          this._logActivity('area', { entity: e.deviceName || e.entity_id, area: areaName });
        });
        this._showToast(`Area updated for ${n} entit${n !== 1 ? 'ies' : 'y'}`, 'success');
        closeDialog();
        await this.loadData();
      } catch (e) {
        this._showToast('Failed to assign area: ' + (e.message || e), 'error');
      }
    });

    overlay.querySelector('.em-afd-cancel-btn').addEventListener('click', closeDialog);

    renderFloorList();
    renderAreaList();

    // Collapsible section toggles (SVG chevron rotates when collapsed)
    overlay.querySelectorAll('.em-afd-section-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const key     = toggle.dataset.section;
        const body    = overlay.querySelector(`.em-afd-section-body[data-body="${key}"]`);
        const arrow   = toggle.querySelector('.em-afd-section-arrow');
        const section = toggle.closest('.em-afd-section');
        const isOpen  = body.style.display !== 'none';
        body.style.display = isOpen ? 'none' : '';
        arrow.style.transform = isOpen ? 'rotate(-90deg)' : '';
        section.classList.toggle('em-afd-collapsed', isOpen);
      });
    });

    overlay.querySelector('.em-floor-cancel-btn').addEventListener('click', closeDialog);
  }

  _showDevicePickerDialog(entityId, onSelect) {
    const devices = Object.entries(this.deviceInfo || {});

    // Build deviceId → integration map from this.data
    const deviceIntegMap = {};
    (this.data || []).forEach(integ => {
      Object.keys(integ.devices).forEach(deviceId => {
        if (deviceId !== 'no_device') deviceIntegMap[deviceId] = integ.integration;
      });
    });

    const renderList = (list) => {
      if (list.length === 0) return `<div style="padding:16px;text-align:center;opacity:0.6">No devices found.</div>`;

      // Group by integration
      const byInteg = {};
      list.forEach(([id, dev]) => {
        const integ = deviceIntegMap[id] || 'other';
        if (!byInteg[integ]) byInteg[integ] = [];
        byInteg[integ].push([id, dev]);
      });

      return Object.entries(byInteg).sort(([a], [b]) => a.localeCompare(b)).map(([integ, items]) => {
        const label = integ.charAt(0).toUpperCase() + integ.slice(1).replace(/_/g, ' ');
        const itemsHtml = items.map(([id, dev]) => {
          const name = this._escapeHtml(dev.name_by_user || dev.name || id);
          const mfr = dev.manufacturer ? `<span style="opacity:0.55;font-size:11px"> · ${this._escapeHtml(dev.manufacturer)}</span>` : '';
          const model = dev.model ? `<div style="font-size:11px;opacity:0.5;margin-top:1px">${this._escapeHtml(dev.model)}</div>` : '';
          return `<div class="entity-list-item em-device-picker-option" data-device-id="${this._escapeAttr(id)}" data-device-name="${this._escapeAttr(dev.name_by_user || dev.name || id)}"
              style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--em-border)">
            <div style="font-weight:600;font-size:13px">${name}${mfr}</div>
            ${model}
          </div>`;
        }).join('');
        return `<div style="border:2px solid var(--em-primary);border-radius:8px;margin:6px 10px;overflow:hidden">
          <div style="padding:6px 12px;background:rgba(var(--em-primary-rgb,33,150,243),0.08);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--em-primary);border-bottom:2px solid var(--em-primary)">
            ${this._escapeHtml(label)} <span style="font-weight:400;opacity:0.7">(${items.length})</span>
          </div>
          ${itemsHtml}
        </div>`;
      }).join('');
    };

    let filtered = devices;

    const { overlay, closeDialog } = this.createDialog({
      title: `Assign to device`,
      contentHtml: `
        <div style="padding:8px 12px 4px">
          <input id="em-device-picker-search" type="text" placeholder="Search devices…"
            style="width:100%;box-sizing:border-box;padding:8px 10px;border:2px solid var(--em-border);border-radius:8px;background:var(--em-bg-secondary);color:var(--em-text);font-size:14px">
        </div>
        <div id="em-device-picker-list" style="max-height:52vh;overflow-y:auto;padding:4px 0 8px">
          ${renderList(filtered)}
        </div>`,
      actionsHtml: `<button class="btn btn-secondary" id="em-device-picker-cancel">Cancel</button>`,
    });

    const listEl = overlay.querySelector('#em-device-picker-list');
    const searchEl = overlay.querySelector('#em-device-picker-search');

    searchEl.focus();
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.toLowerCase().trim();
      filtered = q
        ? devices.filter(([id, dev]) => {
            const name = (dev.name_by_user || dev.name || id).toLowerCase();
            const mfr = (dev.manufacturer || '').toLowerCase();
            const model = (dev.model || '').toLowerCase();
            const integ = (deviceIntegMap[id] || '').toLowerCase();
            return name.includes(q) || mfr.includes(q) || model.includes(q) || integ.includes(q);
          })
        : devices;
      listEl.innerHTML = renderList(filtered);
    });

    listEl.addEventListener('click', (e) => {
      const opt = e.target.closest('.em-device-picker-option');
      if (!opt) return;
      const deviceId   = opt.dataset.deviceId;
      const deviceName = opt.dataset.deviceName;
      const integ      = deviceIntegMap[deviceId] || 'unknown';
      const integLabel = integ.charAt(0).toUpperCase() + integ.slice(1).replace(/_/g, ' ');
      const { overlay: confirmOverlay, closeDialog: closeConfirm } = this.createDialog({
        title: 'Confirm assignment',
        color: 'var(--em-warning)',
        contentHtml: `
          <div style="padding:8px 4px 4px">
            <p style="margin:0 0 12px">Assign <strong>${this._escapeHtml(entityId)}</strong> to:</p>
            <div style="border:2px solid var(--em-primary);border-radius:8px;overflow:hidden;margin-bottom:4px">
              <div style="padding:6px 12px;background:rgba(var(--em-primary-rgb,33,150,243),0.08);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--em-primary);border-bottom:2px solid var(--em-primary)">
                ${this._escapeHtml(integLabel)}
              </div>
              <div style="padding:10px 14px;font-weight:600;font-size:13px">${this._escapeHtml(deviceName)}</div>
            </div>
            <p style="margin:12px 0 0;font-size:12px;opacity:0.65">This will move the entity into this device's registry entry.</p>
          </div>`,
        actionsHtml: `
          <button class="btn btn-secondary" id="em-dpc-cancel">Cancel</button>
          <button class="btn btn-primary" id="em-dpc-confirm">Assign</button>`,
      });
      confirmOverlay.querySelector('#em-dpc-cancel').addEventListener('click', closeConfirm);
      confirmOverlay.querySelector('#em-dpc-confirm').addEventListener('click', () => {
        closeConfirm();
        closeDialog();
        onSelect(deviceId, deviceName);
      });
    });

    overlay.querySelector('#em-device-picker-cancel').addEventListener('click', closeDialog);
  }

  async _showSuggestionsDialog(section = null, { inline = false } = {}) {
    const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    const svgRefresh = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
    let overlay, closeDialog;
    if (inline) {
      const contentEl = this.content.querySelector('#content');
      // Guard: don't re-render while content is already loaded
      if (contentEl.querySelector('.em-inline-view[data-view="suggestions"]')) return;
      contentEl.innerHTML = `
        <div class="em-inline-view" data-view="suggestions">
          <div class="em-inline-view-header">
            <button class="em-inline-back-btn">${svgBack} Back</button>
            <span class="em-inline-view-title">💡 Entity Suggestions</span>
            <input class="em-inline-search em-dialog-search" placeholder="Search suggestions…">
            <button class="em-inline-refresh-btn" title="Refresh">${svgRefresh}</button>
          </div>
          <div class="em-inline-view-body">
            <div style="padding:28px;text-align:center;color:var(--em-text-secondary)">
              <div style="font-size:32px;margin-bottom:10px">🔍</div>
              Analyzing entities…
            </div>
          </div>
        </div>`;
      overlay = contentEl;
      closeDialog = () => this._closeView();
      overlay.querySelector('.em-inline-back-btn').addEventListener('click', closeDialog);
      overlay.querySelector('.em-inline-refresh-btn').addEventListener('click', () => this._refreshView());
    } else {
      const result = this.createDialog({
        title: '💡 Entity Suggestions',
        extraClass: 'em-suggestions',
        contentHtml: `<div style="padding:28px;text-align:center;color:var(--em-text-secondary)">
          <div style="font-size:32px;margin-bottom:10px">🔍</div>
          Analyzing entities…
        </div>`,
        actionsHtml: `<button class="btn btn-secondary em-sug-close">Done</button>`,
      });
      overlay = result.overlay;
      closeDialog = result.closeDialog;
      overlay.querySelector('.em-sug-close').addEventListener('click', closeDialog);
    }

    const [entityRegistry, deviceRegistry, labelRegistry] = await Promise.all([
      this._hass.callWS({ type: 'config/entity_registry/list' }).catch(() => []),
      this._hass.callWS({ type: 'config/device_registry/list' }).catch(() => []),
      this._hass.callWS({ type: 'config/label_registry/list' }).catch(() => []),
    ]);
    const entityAreaMap = new Map();
    const deviceAreaMap = new Map();
    for (const e of entityRegistry) { if (e.area_id) entityAreaMap.set(e.entity_id, e.area_id); }
    for (const d of deviceRegistry) { if (d.area_id) deviceAreaMap.set(d.id, d.area_id); }

    const states  = this._hass?.states || {};
    const now     = Date.now();
    const day7ms  = 7  * 86400000;
    const day30ms = 30 * 86400000;
    const helperDomains = new Set(['input_boolean','input_number','input_select','input_text',
      'input_datetime','timer','counter','schedule','template','group','scene','automation','script']);
    const genericNames  = new Set(['sensor','switch','light','binary_sensor','button','number',
      'select','text','event','device_automation']);

    const allEntities = [];
    for (const intg of (this.data || [])) {
      for (const [devId, dev] of Object.entries(intg.devices || {})) {
        const devEntityCount = (dev.entities || []).length;
        for (const entity of (dev.entities || [])) {
          allEntities.push({ ...entity, integration: intg.integration, deviceName: dev.name || null, deviceEntityCount: devEntityCount });
        }
      }
    }

    const health = [], disable = [], naming = [], area = [];
    const seenDevicesForArea = new Set();

    for (const entity of allEntities) {
      const state  = states[entity.entity_id];
      const name   = state?.attributes?.friendly_name || entity.original_name || entity.entity_id;
      const updMs  = state?.last_updated  ? Date.parse(state.last_updated)  : null;
      const chgMs  = state?.last_changed  ? Date.parse(state.last_changed)  : null;
      const domain = entity.entity_id.split('.')[0];

      if (!entity.is_disabled && state?.state === 'unavailable' && updMs && (now - updMs) > day7ms) {
        health.push({ entity, name, reason: `Unavailable for ${this._fmtAgo(state.last_updated)}`, action: 'disable', actionLabel: 'Disable' });
      }
      if (!entity.is_disabled && entity.entity_category === 'diagnostic' && chgMs && (now - chgMs) > day30ms) {
        disable.push({ entity, name, reason: `Diagnostic, unchanged for ${this._fmtAgo(state?.last_changed)}`, action: 'disable', actionLabel: 'Disable' });
      }
      if (!entity.is_disabled && state?.state === 'unavailable' && updMs && (now - updMs) > day30ms
          && !health.find(h => h.entity.entity_id === entity.entity_id)) {
        disable.push({ entity, name, reason: `Unavailable for ${this._fmtAgo(state.last_updated)}`, action: 'disable', actionLabel: 'Disable' });
      }

      const localId = entity.entity_id.split('.')[1] || '';
      const hasHash = /[0-9a-f]{8,}/i.test(localId);
      const nameGeneric = genericNames.has((entity.original_name || '').toLowerCase().trim());
      if (!entity.is_disabled && (hasHash || nameGeneric)) {
        naming.push({ entity, name, reason: hasHash ? 'Entity ID contains auto-generated hash' : 'Generic entity name — consider something descriptive', action: 'rename', actionLabel: 'Rename' });
      }

      if (!entity.is_disabled && entity.device_id && !helperDomains.has(domain)) {
        const entityArea = entityAreaMap.get(entity.entity_id) || entity.area_id;
        const deviceArea = deviceAreaMap.get(entity.device_id);
        if (!entityArea && !deviceArea && !seenDevicesForArea.has(entity.device_id)) {
          seenDevicesForArea.add(entity.device_id);
          area.push({ entity, name: entity.deviceName || entity.device_id,
            reason: `No area assigned · ${entity.deviceEntityCount} entit${entity.deviceEntityCount !== 1 ? 'ies' : 'y'}`,
            action: 'assign-area', actionLabel: 'Assign Area', deviceId: entity.device_id });
        }
      }
    }

    // ── Label suggestions ──────────────────────────────────────────
    const existingLabelsByName = new Map(labelRegistry.map(l => [l.name.toLowerCase(), l]));
    const entityCurrentLabels  = new Map();
    for (const e of entityRegistry) {
      if (e.labels?.length) entityCurrentLabels.set(e.entity_id, new Set(e.labels));
    }

    const LABEL_DEFS = [
      { label: 'Lights',               emoji: '💡', match: (e, st) => e.entity_id.split('.')[0] === 'light' },
      { label: 'Dimmable Lights',      emoji: '🔆', match: (e, st) => e.entity_id.split('.')[0] === 'light' && (st?.attributes?.supported_color_modes || []).some(m => !['onoff','unknown'].includes(m)) },
      { label: 'Switches',             emoji: '🔌', match: (e, st) => e.entity_id.split('.')[0] === 'switch' },
      { label: 'Temperature Sensors',  emoji: '🌡️', match: (e, st) => e.entity_id.split('.')[0] === 'sensor' && st?.attributes?.device_class === 'temperature' },
      { label: 'Humidity Sensors',     emoji: '💧', match: (e, st) => e.entity_id.split('.')[0] === 'sensor' && st?.attributes?.device_class === 'humidity' },
      { label: 'Motion Sensors',       emoji: '🚶', match: (e, st) => e.entity_id.split('.')[0] === 'binary_sensor' && st?.attributes?.device_class === 'motion' },
      { label: 'Door Sensors',         emoji: '🚪', match: (e, st) => e.entity_id.split('.')[0] === 'binary_sensor' && st?.attributes?.device_class === 'door' },
      { label: 'Window Sensors',       emoji: '🪟', match: (e, st) => e.entity_id.split('.')[0] === 'binary_sensor' && st?.attributes?.device_class === 'window' },
      { label: 'Vibration Sensors',    emoji: '📳', match: (e, st) => e.entity_id.split('.')[0] === 'binary_sensor' && st?.attributes?.device_class === 'vibration' },
      { label: 'Energy Monitoring',    emoji: '⚡', match: (e, st) => e.entity_id.split('.')[0] === 'sensor' && (st?.attributes?.device_class === 'energy' || st?.attributes?.device_class === 'power') },
      { label: 'Covers',               emoji: '🟫', match: (e, st) => e.entity_id.split('.')[0] === 'cover' },
      { label: 'Climate',              emoji: '❄️', match: (e, st) => e.entity_id.split('.')[0] === 'climate' },
      { label: 'Media Players',        emoji: '🎵', match: (e, st) => e.entity_id.split('.')[0] === 'media_player' },
      { label: 'Cameras',              emoji: '📷', match: (e, st) => e.entity_id.split('.')[0] === 'camera' },
      { label: 'Locks',                emoji: '🔒', match: (e, st) => e.entity_id.split('.')[0] === 'lock' },
      { label: 'Fans',                 emoji: '🌀', match: (e, st) => e.entity_id.split('.')[0] === 'fan' },
      { label: 'Vacuums',              emoji: '🧹', match: (e, st) => e.entity_id.split('.')[0] === 'vacuum' },
      { label: 'Presence Detection',   emoji: '👤', match: (e, st) => ['device_tracker','person'].includes(e.entity_id.split('.')[0]) },
    ];

    const labelGroups = [];
    for (const def of LABEL_DEFS) {
      const existingLabel = existingLabelsByName.get(def.label.toLowerCase());
      const untagged = allEntities.filter(e => {
        if (e.is_disabled) return false;
        if (!def.match(e, states[e.entity_id])) return false;
        if (existingLabel) {
          const cur = entityCurrentLabels.get(e.entity_id);
          if (cur?.has(existingLabel.label_id)) return false;
        }
        return true;
      });
      if (untagged.length > 0) labelGroups.push({ ...def, entities: untagged, existingLabel: existingLabel || null });
    }

    health.sort((a, b) => a.entity.entity_id.localeCompare(b.entity.entity_id));
    disable.sort((a, b) => a.entity.entity_id.localeCompare(b.entity.entity_id));
    naming.sort((a, b) => a.entity.entity_id.localeCompare(b.entity.entity_id));
    area.sort((a, b) => a.entity.entity_id.localeCompare(b.entity.entity_id));
    labelGroups.sort((a, b) => (a.deviceName || a.label || '').localeCompare(b.deviceName || b.label || ''));

    const total = health.length + disable.length + naming.length + area.length + labelGroups.length;

    const svgChev = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

    const renderRow = (item, sectionKey) => `
      <div class="em-sug-row em-sug-naming-row" data-entity-id="${this._escapeAttr(item.entity.entity_id)}" style="display:flex;gap:10px;padding:7px 4px 7px 12px;border-bottom:1px solid var(--em-border-light);align-items:center">
        <input type="checkbox" class="em-sug-action-cb em-sug-cb-${sectionKey}" data-entity-id="${this._escapeAttr(item.entity.entity_id)}"
               style="flex-shrink:0;cursor:pointer;width:15px;height:15px;accent-color:var(--em-primary)">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(item.name)}</div>
          <div style="font-size:11px;font-family:monospace;color:var(--em-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(item.entity.entity_id)}</div>
          <div style="font-size:11px;color:var(--em-text-secondary);margin-top:2px">${this._escapeHtml(item.reason)}</div>
        </div>
        <button class="em-sug-action btn btn-sm" data-action="${this._escapeAttr(item.action)}"
            data-entity-id="${this._escapeAttr(item.entity.entity_id)}" style="flex-shrink:0;white-space:nowrap">
          ${item.actionLabel}
        </button>
      </div>`;

    const renderSection = (emoji, title, items, sectionKey) => {
      const groups = new Map();
      const noDevice = [];
      for (const item of items) {
        const did = item.entity.device_id;
        if (!did) { noDevice.push(item); continue; }
        if (!groups.has(did)) groups.set(did, { deviceName: item.entity.deviceName || did, items: [] });
        groups.get(did).items.push(item);
      }
      let rows = '';
      for (const group of groups.values()) {
        const entityRows = group.items.map(i => renderRow(i, sectionKey)).join('');
        rows += `
          <div class="em-naming-device-group" style="border-bottom:1px solid var(--em-border)">
            <div class="em-naming-device-toggle" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;user-select:none;background:var(--em-bg-secondary)">
              <span class="em-naming-arrow em-collapsible-icon" style="transition:transform 0.15s;transform:rotate(-90deg)">${svgChev}</span>
              <span style="font-size:12px;font-weight:700;color:var(--em-text-primary);text-transform:uppercase;letter-spacing:0.04em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(group.deviceName)}</span>
              <span style="font-size:11px;color:var(--em-text-secondary);margin-right:4px">${group.items.length} entit${group.items.length !== 1 ? 'ies' : 'y'}</span>
              <input type="checkbox" class="em-sug-section-select-all" data-section="${sectionKey}" title="Select all in group"
                     style="cursor:pointer;width:14px;height:14px;accent-color:var(--em-primary);flex-shrink:0">
            </div>
            <div class="em-naming-device-body" style="display:none">${entityRows}</div>
          </div>`;
      }
      rows += noDevice.map(i => renderRow(i, sectionKey)).join('');
      const bulkLabel = items[0]?.actionLabel || 'Apply';
      const body = `<div style="padding:2px 0">
        <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid var(--em-border);background:var(--em-bg-secondary)">
          <button class="btn btn-primary btn-sm em-sug-bulk-btn" data-section="${sectionKey}" data-action="${items[0]?.action || ''}"
                  disabled style="opacity:0.4;pointer-events:none">${bulkLabel} Selected (0)</button>
          <span style="font-size:11px;color:var(--em-text-secondary)">Check entities to bulk ${bulkLabel.toLowerCase()}</span>
        </div>
        ${rows || '<div style="padding:8px 4px;color:var(--em-text-secondary)">None</div>'}
      </div>`;
      return this._collGroup(`${emoji} ${title} <span style="opacity:0.55;font-weight:400;font-size:12px">(${items.length})</span>`, body);
    };

    const renderNamingRow = (item) => `
      <div class="em-sug-row em-sug-naming-row" style="display:flex;gap:10px;padding:7px 4px 7px 12px;border-bottom:1px solid var(--em-border-light);align-items:center">
        <input type="checkbox" class="em-sug-naming-cb" data-entity-id="${this._escapeAttr(item.entity.entity_id)}"
               style="flex-shrink:0;cursor:pointer;width:15px;height:15px;accent-color:var(--em-primary)">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(item.name)}</div>
          <div style="font-size:11px;font-family:monospace;color:var(--em-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(item.entity.entity_id)}</div>
          <div style="font-size:11px;color:var(--em-text-secondary);margin-top:2px">${this._escapeHtml(item.reason)}</div>
        </div>
        <button class="em-sug-action btn btn-sm" data-action="rename"
            data-entity-id="${this._escapeAttr(item.entity.entity_id)}" style="flex-shrink:0;white-space:nowrap">Rename</button>
      </div>`;

    const renderNamingSection = (emoji, title, items) => {
      const groups = new Map();
      const noDevice = [];
      for (const item of items) {
        const did = item.entity.device_id;
        if (!did) { noDevice.push(item); continue; }
        if (!groups.has(did)) groups.set(did, { deviceName: item.entity.deviceName || did, items: [] });
        groups.get(did).items.push(item);
      }
      let rows = '';
      for (const group of groups.values()) {
        const entityRows = group.items.map(renderNamingRow).join('');
        rows += `
          <div class="em-naming-device-group" style="border-bottom:1px solid var(--em-border)">
            <div class="em-naming-device-toggle" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;user-select:none;background:var(--em-bg-secondary)">
              <span class="em-naming-arrow em-collapsible-icon" style="transition:transform 0.15s;transform:rotate(-90deg)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
              <span style="font-size:12px;font-weight:700;color:var(--em-text-primary);text-transform:uppercase;letter-spacing:0.04em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(group.deviceName)}</span>
              <span style="font-size:11px;color:var(--em-text-secondary);margin-right:4px">${group.items.length} entit${group.items.length !== 1 ? 'ies' : 'y'}</span>
              <input type="checkbox" class="em-naming-group-select-all" title="Select all in group"
                     style="cursor:pointer;width:14px;height:14px;accent-color:var(--em-primary);flex-shrink:0">
            </div>
            <div class="em-naming-device-body" style="display:none">${entityRows}</div>
          </div>`;
      }
      rows += noDevice.map(renderNamingRow).join('');
      const body = `<div style="padding:2px 0">
        <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid var(--em-border);background:var(--em-bg-secondary)">
          <button class="btn btn-primary btn-sm em-naming-rename-btn" disabled style="opacity:0.4;pointer-events:none">Rename Selected (0)</button>
          <span style="font-size:11px;color:var(--em-text-secondary)">Check entities to bulk rename</span>
        </div>
        ${rows || '<div style="padding:8px 4px;color:var(--em-text-secondary)">None</div>'}
      </div>`;
      return this._collGroup(`${emoji} ${title} <span style="opacity:0.55;font-weight:400;font-size:12px">(${items.length})</span>`, body);
    };

    const renderAreaSection = (emoji, title, items) => {
      const svgChev = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      const rows = items.map(item => {
        // Show all entities belonging to this device as context rows
        const deviceEntities = allEntities.filter(e => e.device_id === item.deviceId);
        const entityRows = deviceEntities.map(e => `
          <div class="em-sug-row" style="display:flex;gap:10px;padding:7px 4px 7px 12px;border-bottom:1px solid var(--em-border-light);align-items:center">
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(e.original_name || e.entity_id)}</div>
              <div style="font-size:11px;font-family:monospace;color:var(--em-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(e.entity_id)}</div>
            </div>
          </div>`).join('');
        return `
          <div class="em-naming-device-group em-sug-area-card" data-device-id="${this._escapeAttr(item.deviceId)}" style="border-bottom:1px solid var(--em-border)">
            <div class="em-naming-device-toggle" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;user-select:none;background:var(--em-bg-secondary)">
              <span class="em-naming-arrow em-collapsible-icon" style="transition:transform 0.15s;transform:rotate(-90deg)">${svgChev}</span>
              <span style="font-size:12px;font-weight:700;color:var(--em-text-primary);text-transform:uppercase;letter-spacing:0.04em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(item.name)}</span>
              <span style="font-size:11px;color:var(--em-text-secondary);margin-right:4px">${deviceEntities.length || item.entity.deviceEntityCount || ''} entit${(deviceEntities.length || 1) !== 1 ? 'ies' : 'y'}</span>
              <button class="em-sug-action em-assign-btn btn btn-sm" data-action="assign-area"
                  data-entity-id="${this._escapeAttr(item.entity.entity_id)}"
                  data-device-id="${this._escapeAttr(item.deviceId)}"
                  style="flex-shrink:0;white-space:nowrap">📍 Assign Area</button>
            </div>
            <div class="em-naming-device-body" style="display:none">${entityRows || '<div style="padding:8px 12px;font-size:12px;opacity:0.6">No entity details available</div>'}</div>
          </div>`;
      }).join('');
      const body = `<div style="padding:2px 0">
        ${rows || '<div style="padding:8px 4px;color:var(--em-text-secondary)">None</div>'}
      </div>`;
      return this._collGroup(`${emoji} ${title} <span style="opacity:0.55;font-weight:400;font-size:12px">(${items.length})</span>`, body);
    };

    const renderLabelSuggestionsSection = (groups) => {
      if (!groups.length) return '';
      const svgChev = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      const rows = groups.map(g => {
        const labelKey = this._escapeAttr(g.label);
        const entityRows = g.entities.map(e => {
          const name = this._hass?.states?.[e.entity_id]?.attributes?.friendly_name || e.original_name || e.entity_id;
          return `
          <div class="em-sug-row em-sug-naming-row" style="display:flex;gap:10px;padding:7px 4px 7px 12px;border-bottom:1px solid var(--em-border-light);align-items:center">
            <input type="checkbox" class="em-label-sug-cb" data-entity-id="${this._escapeAttr(e.entity_id)}" data-label-key="${labelKey}"
                   checked style="flex-shrink:0;cursor:pointer;width:15px;height:15px;accent-color:var(--em-primary)">
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(name)}</div>
              <div style="font-size:11px;font-family:monospace;color:var(--em-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(e.entity_id)}</div>
            </div>
          </div>`;
        }).join('');
        return `
          <div class="em-naming-device-group em-label-sug-card" data-label-name="${labelKey}" style="border-bottom:1px solid var(--em-border)">
            <div class="em-naming-device-toggle" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;user-select:none;background:var(--em-bg-secondary)">
              <span class="em-naming-arrow em-collapsible-icon" style="transition:transform 0.15s;transform:rotate(-90deg)">${svgChev}</span>
              <span style="font-size:16px;flex-shrink:0">${g.emoji}</span>
              <span style="font-size:12px;font-weight:700;color:var(--em-text-primary);text-transform:uppercase;letter-spacing:0.04em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(g.label)}</span>
              <span style="font-size:11px;color:var(--em-text-secondary);margin-right:2px">${g.entities.length} entit${g.entities.length !== 1 ? 'ies' : 'y'}</span>
              <span style="font-size:11px;color:${g.existingLabel ? 'var(--em-primary)' : 'var(--em-warning)'};margin-right:4px">${g.existingLabel ? 'exists' : 'new'}</span>
              <input type="checkbox" class="em-label-group-select-all" data-label-key="${labelKey}" title="Select all in group"
                     checked style="cursor:pointer;width:14px;height:14px;accent-color:var(--em-primary);flex-shrink:0">
              <button class="em-assign-btn em-label-apply-btn"
                      data-label-name="${labelKey}"
                      data-entity-ids="${this._escapeAttr(g.entities.map(e => e.entity_id).join(','))}"
                      style="margin-left:4px">Apply to <span class="em-label-apply-count">${g.entities.length}</span></button>
            </div>
            <div class="em-naming-device-body" style="display:none">${entityRows}</div>
          </div>`;
      }).join('');
      const body = `<div style="padding:2px 0">${rows}</div>`;
      return this._collGroup(`🏷️ Label Suggestions <span style="opacity:0.55;font-weight:400;font-size:12px">(${groups.length} group${groups.length !== 1 ? 's' : ''})</span>`, body);
    };

    const dialogBody = overlay.querySelector('.em-inline-view-body') || overlay.querySelector('.confirm-dialog-box > *:not(.confirm-dialog-header):not(.confirm-dialog-actions)');
    dialogBody.innerHTML = `<div style="padding:8px 8px 4px">
      ${total === 0
        ? `<div style="padding:32px;text-align:center;color:var(--em-success);font-size:15px">✓ No suggestions — everything looks great!</div>`
        : `<div style="font-size:12px;color:var(--em-text-secondary);margin-bottom:10px">
             Found <strong style="color:var(--em-text-primary)">${total}</strong> suggestion${total !== 1 ? 's' : ''} across <strong style="color:var(--em-text-primary)">${allEntities.length}</strong> entities.
           </div>
           <div class="em-sug-section em-sug-health">${renderSection('🏥', 'Health Issues', health, 'health')}</div>
           <div class="em-sug-section em-sug-disable">${renderSection('🚫', 'Disable Candidates', disable, 'disable')}</div>
           <div class="em-sug-section em-sug-naming">${renderNamingSection('✏️', 'Naming Improvements', naming)}</div>
           <div class="em-sug-section em-sug-area">${renderAreaSection('📍', 'Area Assignment', area)}</div>
           <div class="em-sug-section em-sug-labels">${renderLabelSuggestionsSection(labelGroups)}</div>`
      }
    </div>`;

    this._reAttachCollapsibles(dialogBody);

    // Wire search bar — filters suggestion rows and hides empty sections
    const sugSearchInput = overlay.querySelector('.em-inline-search');
    if (sugSearchInput) {
      sugSearchInput.addEventListener('input', () => {
        const term = sugSearchInput.value.trim().toLowerCase();
        dialogBody.querySelectorAll('.em-sug-row, .em-sug-area-card, .em-label-sug-card').forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = (!term || text.includes(term)) ? '' : 'none';
        });
        // Hide outer collapsible sections if all their rows are hidden
        dialogBody.querySelectorAll('.em-group-body').forEach(body => {
          const hasVisible = [...body.querySelectorAll('.em-sug-row, .em-sug-area-card, .em-label-sug-card')]
            .some(r => r.style.display !== 'none');
          const hdr = body.previousElementSibling;
          body.style.display = hasVisible || !term ? '' : 'none';
          if (hdr) hdr.style.display = hasVisible || !term ? '' : 'none';
        });
      });
    }

    if (section) {
      this._expandSuggestionsSection(dialogBody, section);
    }

    dialogBody.querySelectorAll('.em-naming-device-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('.em-naming-device-group');
        const body = group.querySelector('.em-naming-device-body');
        const arrow = toggle.querySelector('.em-naming-arrow');
        const collapsed = body.style.display === 'none';
        body.style.display = collapsed ? '' : 'none';
        arrow.style.transform = collapsed ? '' : 'rotate(-90deg)';
      });
    });

    const updateNamingBulkBar = () => {
      const checked = [...dialogBody.querySelectorAll('.em-sug-naming-cb:checked')];
      const btn = dialogBody.querySelector('.em-naming-rename-btn');
      if (!btn) return;
      if (checked.length > 0) {
        btn.textContent = `Rename Selected (${checked.length})`;
        btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = '';
      } else {
        btn.textContent = 'Rename Selected (0)';
        btn.disabled = true; btn.style.opacity = '0.4'; btn.style.pointerEvents = 'none';
      }
    };
    dialogBody.querySelectorAll('.em-sug-naming-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const group = cb.closest('.em-naming-device-group');
        if (group) {
          const groupCbs = [...group.querySelectorAll('.em-sug-naming-cb')];
          const groupChecked = groupCbs.filter(c => c.checked).length;
          const groupSelectAll = group.querySelector('.em-naming-group-select-all');
          if (groupSelectAll) {
            groupSelectAll.checked = groupChecked === groupCbs.length;
            groupSelectAll.indeterminate = groupChecked > 0 && groupChecked < groupCbs.length;
          }
        }
        updateNamingBulkBar();
      });
    });
    dialogBody.querySelectorAll('.em-naming-group-select-all').forEach(selectAll => {
      selectAll.addEventListener('click', e => e.stopPropagation());
      selectAll.addEventListener('change', () => {
        const group = selectAll.closest('.em-naming-device-group');
        const body = group.querySelector('.em-naming-device-body');
        const arrow = group.querySelector('.em-naming-arrow');
        body.style.display = ''; arrow.style.transform = '';
        group.querySelectorAll('.em-sug-naming-cb').forEach(cb => { cb.checked = selectAll.checked; });
        updateNamingBulkBar();
      });
    });
    const namingRenameBtn = dialogBody.querySelector('.em-naming-rename-btn');
    if (namingRenameBtn) {
      namingRenameBtn.addEventListener('click', () => {
        const checkedIds = [...dialogBody.querySelectorAll('.em-sug-naming-cb:checked')].map(cb => cb.dataset.entityId);
        if (checkedIds.length === 0) return;
        closeDialog();
        const prevSelected = this.selectedEntities;
        this.selectedEntities = new Set(checkedIds);
        this._openBulkRenameDialog();
        this.selectedEntities = prevSelected;
      });
    }

    // Health / Disable Candidates — checkbox + bulk bar logic
    const updateSectionBulkBar = (sectionKey) => {
      const checked = [...dialogBody.querySelectorAll(`.em-sug-cb-${sectionKey}:checked`)];
      const btn = dialogBody.querySelector(`.em-sug-bulk-btn[data-section="${sectionKey}"]`);
      if (!btn) return;
      if (checked.length > 0) {
        const label = btn.dataset.action === 'disable' ? 'Disable' : 'Apply';
        btn.textContent = `${label} Selected (${checked.length})`;
        btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = '';
      } else {
        const label = btn.dataset.action === 'disable' ? 'Disable' : 'Apply';
        btn.textContent = `${label} Selected (0)`;
        btn.disabled = true; btn.style.opacity = '0.4'; btn.style.pointerEvents = 'none';
      }
    };

    dialogBody.querySelectorAll('.em-sug-action-cb').forEach(cb => {
      cb.addEventListener('click', e => e.stopPropagation());
      cb.addEventListener('change', () => {
        const group = cb.closest('.em-naming-device-group');
        if (group) {
          const groupCbs = [...group.querySelectorAll('.em-sug-action-cb')];
          const groupChecked = groupCbs.filter(c => c.checked).length;
          const selectAll = group.querySelector('.em-sug-section-select-all');
          if (selectAll) {
            selectAll.checked = groupChecked === groupCbs.length;
            selectAll.indeterminate = groupChecked > 0 && groupChecked < groupCbs.length;
          }
        }
        // Determine which section this cb belongs to and update its bar
        ['health', 'disable'].forEach(key => {
          if (cb.classList.contains(`em-sug-cb-${key}`)) updateSectionBulkBar(key);
        });
      });
    });

    dialogBody.querySelectorAll('.em-sug-section-select-all').forEach(selectAll => {
      selectAll.addEventListener('click', e => e.stopPropagation());
      selectAll.addEventListener('change', () => {
        const group = selectAll.closest('.em-naming-device-group');
        const body = group?.querySelector('.em-naming-device-body');
        const arrow = group?.querySelector('.em-naming-arrow');
        if (body) { body.style.display = ''; }
        if (arrow) { arrow.style.transform = ''; }
        group?.querySelectorAll('.em-sug-action-cb').forEach(cb => { cb.checked = selectAll.checked; });
        updateSectionBulkBar(selectAll.dataset.section);
      });
    });

    dialogBody.querySelectorAll('.em-sug-bulk-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sectionKey = btn.dataset.section;
        const checked = [...dialogBody.querySelectorAll(`.em-sug-cb-${sectionKey}:checked`)];
        if (!checked.length) return;
        btn.disabled = true; btn.style.opacity = '0.4'; btn.style.pointerEvents = 'none';
        btn.textContent = `Working…`;
        for (const cb of checked) {
          const entityId = cb.dataset.entityId;
          try {
            await this.disableEntity(entityId);
            dialogBody.querySelector(`.em-sug-row[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
          } catch (e) {
            console.warn('[EM] disable entity failed', entityId, e);
            this._showToast(`Failed to disable ${entityId}`, 'error');
          }
        }
        updateSectionBulkBar(sectionKey);
      });
    });

    // Label group: checkbox per entity updates the Apply button count
    dialogBody.querySelectorAll('.em-label-sug-cb').forEach(cb => {
      cb.addEventListener('click', e => e.stopPropagation());
      cb.addEventListener('change', () => {
        const group = cb.closest('.em-label-sug-card');
        const labelKey = group?.dataset.labelName;
        if (!group || !labelKey) return;
        const allCbs = [...group.querySelectorAll('.em-label-sug-cb')];
        const checkedCbs = allCbs.filter(c => c.checked);
        const selectAll = group.querySelector('.em-label-group-select-all');
        if (selectAll) {
          selectAll.checked = checkedCbs.length === allCbs.length;
          selectAll.indeterminate = checkedCbs.length > 0 && checkedCbs.length < allCbs.length;
        }
        const applyBtn = group.querySelector('.em-label-apply-btn');
        const countEl = applyBtn?.querySelector('.em-label-apply-count');
        if (countEl) countEl.textContent = checkedCbs.length;
        if (applyBtn) {
          applyBtn.disabled = checkedCbs.length === 0;
          applyBtn.dataset.entityIds = checkedCbs.map(c => c.dataset.entityId).join(',');
        }
      });
    });

    dialogBody.querySelectorAll('.em-label-group-select-all').forEach(selectAll => {
      selectAll.addEventListener('click', e => e.stopPropagation());
      selectAll.addEventListener('change', () => {
        const group = selectAll.closest('.em-label-sug-card');
        const body = group?.querySelector('.em-naming-device-body');
        const arrow = group?.querySelector('.em-naming-arrow');
        if (body) { body.style.display = ''; }
        if (arrow) { arrow.style.transform = ''; }
        group?.querySelectorAll('.em-label-sug-cb').forEach(cb => { cb.checked = selectAll.checked; });
        // Sync apply button
        const allCbs = [...(group?.querySelectorAll('.em-label-sug-cb') || [])];
        const checkedCbs = allCbs.filter(c => c.checked);
        const applyBtn = group?.querySelector('.em-label-apply-btn');
        const countEl = applyBtn?.querySelector('.em-label-apply-count');
        if (countEl) countEl.textContent = checkedCbs.length;
        if (applyBtn) {
          applyBtn.disabled = checkedCbs.length === 0;
          applyBtn.dataset.entityIds = checkedCbs.map(c => c.dataset.entityId).join(',');
        }
      });
    });

    dialogBody.querySelectorAll('.em-sug-action').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const { action, entityId, deviceId } = btn.dataset;
        const card = btn.closest('.em-sug-area-card, .em-sug-row');
        if (action === 'disable') {
          btn.disabled = true; btn.textContent = '…';
          await this.disableEntity(entityId);
          card?.remove();
        } else if (action === 'rename') {
          closeDialog();
          this.showRenameDialog(entityId);
        } else if (action === 'assign-area') {
          const entityObj = this._resolveEntitiesById([entityId])[0] || { entity_id: entityId, device_id: deviceId };
          closeDialog();
          await this._showAreaFloorDialog('Assign device to area', [entityObj]);
        }
      });
    });

    // Label suggestion apply — preview dialog with checkboxes before confirming
    const applyLabel = async (labelName, entityIds, triggerBtn) => {
      const isNew = !existingLabelsByName.has(labelName.toLowerCase());

      const entityListHtml = entityIds.map(eid => {
        const name = this._hass?.states?.[eid]?.attributes?.friendly_name || eid;
        return `<label class="entity-list-item em-label-entity-row" style="padding:8px 12px;display:flex;gap:10px;align-items:center;cursor:pointer">
          <input type="checkbox" class="em-label-entity-cb" data-entity-id="${this._escapeAttr(eid)}" checked style="flex-shrink:0;width:16px;height:16px;cursor:pointer">
          <span style="font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this._escapeHtml(name)}</span>
          <span style="font-size:11px;opacity:0.6;font-family:monospace;flex-shrink:0">${this._escapeHtml(eid)}</span>
        </label>`;
      }).join('');

      const { overlay: previewOverlay, closeDialog: closePreview } = this.createDialog({
        title: `Apply label: ${labelName}`,
        color: 'var(--em-primary)',
        contentHtml: `
          <div style="padding:10px 14px 6px">
            <div style="margin-bottom:8px;font-size:13px">
              ${isNew
                ? `<span style="color:var(--em-warning);font-weight:600">⚠ New label</span> — <strong>"${this._escapeHtml(labelName)}"</strong> will be created.`
                : `Label <strong>"${this._escapeHtml(labelName)}"</strong> will be added to:`}
            </div>
            <div style="border:1px solid var(--em-border);border-radius:8px;overflow:hidden">
              <label style="display:flex;gap:10px;align-items:center;padding:8px 12px;background:var(--em-bg-secondary);border-bottom:1px solid var(--em-border);cursor:pointer;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">
                <input type="checkbox" id="em-label-select-all" checked style="width:16px;height:16px;cursor:pointer">
                Select all
                <span id="em-label-selected-count" style="margin-left:auto;font-weight:400;opacity:0.7">${entityIds.length} of ${entityIds.length} selected</span>
              </label>
              <div style="max-height:40vh;overflow-y:auto">
                ${entityListHtml}
              </div>
            </div>
          </div>`,
        actionsHtml: `
          <button class="btn btn-secondary" id="em-label-preview-cancel">Cancel</button>
          <button class="btn btn-primary" id="em-label-preview-confirm">Apply to <span id="em-label-confirm-count">${entityIds.length}</span></button>`,
      });

      const selectAll = previewOverlay.querySelector('#em-label-select-all');
      const countSpan = previewOverlay.querySelector('#em-label-selected-count');
      const confirmCount = previewOverlay.querySelector('#em-label-confirm-count');
      const confirmBtn = previewOverlay.querySelector('#em-label-preview-confirm');

      const updateCounts = () => {
        const checked = [...previewOverlay.querySelectorAll('.em-label-entity-cb:checked')];
        const total = previewOverlay.querySelectorAll('.em-label-entity-cb').length;
        countSpan.textContent = `${checked.length} of ${total} selected`;
        confirmCount.textContent = checked.length;
        confirmBtn.disabled = checked.length === 0;
        selectAll.indeterminate = checked.length > 0 && checked.length < total;
        selectAll.checked = checked.length === total;
      };

      selectAll.addEventListener('change', () => {
        previewOverlay.querySelectorAll('.em-label-entity-cb').forEach(cb => { cb.checked = selectAll.checked; });
        updateCounts();
      });

      previewOverlay.querySelectorAll('.em-label-entity-cb').forEach(cb => {
        cb.addEventListener('change', updateCounts);
      });

      previewOverlay.querySelector('#em-label-preview-cancel').addEventListener('click', closePreview);
      previewOverlay.querySelector('#em-label-preview-confirm').addEventListener('click', async () => {
        const selected = [...previewOverlay.querySelectorAll('.em-label-entity-cb:checked')].map(cb => cb.dataset.entityId);
        if (!selected.length) return;
        closePreview();
        if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = '…'; }
        try {
          let labelId;
          const found = existingLabelsByName.get(labelName.toLowerCase());
          if (found) {
            labelId = found.label_id;
          } else {
            const created = await this._hass.callWS({ type: 'config/label_registry/create', name: labelName });
            labelId = created.label_id;
            existingLabelsByName.set(labelName.toLowerCase(), created);
          }
          await Promise.all(selected.map(eid => {
            const cur = [...(entityCurrentLabels.get(eid) || new Set())];
            if (cur.includes(labelId)) return null;
            return this._hass.callWS({ type: 'config/entity_registry/update', entity_id: eid, labels: [...cur, labelId] });
          }).filter(Boolean));
          const sug = triggerBtn?.closest('.em-label-sug-card');
          if (sug) sug.innerHTML = `<div style="padding:8px 4px;color:var(--em-success);font-size:13px">✓ "${this._escapeHtml(labelName)}" applied to ${selected.length} entit${selected.length !== 1 ? 'ies' : 'y'}</div>`;
          this.labeledEntitiesCache = null; this.labeledDevicesCache = null; this.labeledAreasCache = null;
        } catch {
          if (triggerBtn) { triggerBtn.disabled = false; triggerBtn.textContent = `Apply to ${entityIds.length}`; }
        }
      });
    };

    dialogBody.querySelectorAll('.em-label-apply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const entityIds = btn.dataset.entityIds.split(',').filter(Boolean);
        applyLabel(btn.dataset.labelName, entityIds, btn);
      });
    });
  }

  async _showConfigEntryHealthDialog({ inline = false, container = null } = {}) {
    let overlay, closeDialog;
    if (inline && container) {
      container.innerHTML = `<div style="padding:16px;text-align:center;color:var(--secondary-text-color)">Loading…</div>`;
      overlay = container;
      closeDialog = () => {};
    } else {
      const result = this.createDialog({
        title: 'Integration Config Errors',
        color: '#f44336',
        searchPlaceholder: 'Search integrations…',
        contentHtml: `<div style="padding:16px;text-align:center;color:var(--secondary-text-color)">Loading…</div>`,
        actionsHtml: `<button class="btn btn-secondary em-health-close">Close</button>`,
      });
      overlay = result.overlay;
      closeDialog = result.closeDialog;
      overlay.querySelector('.em-health-close').addEventListener('click', closeDialog);
    }

    const render = (entries) => {
      const body = (inline && container)
        ? container
        : overlay.querySelector('.confirm-dialog-box > *:not(.confirm-dialog-header):not(.confirm-dialog-actions)');
      if (!entries.length) {
        body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--em-success);font-size:15px">✓ All integrations are healthy</div>`;
        return;
      }

      const stateLabel = { setup_error: 'Setup Error', setup_retry: 'Retrying', failed_unload: 'Failed Unload', migration_error: 'Migration Error', not_loaded: 'Not Loaded' };
      const stateColor = { setup_error: '#f44336', setup_retry: '#ff9800', failed_unload: '#f44336', migration_error: '#9c27b0', not_loaded: '#607d8b' };

      const byState = {};
      entries.forEach(e => {
        const s = e.state;
        if (!byState[s]) byState[s] = [];
        byState[s].push(e);
      });

      let html = '';
      for (const [state, items] of Object.entries(byState)) {
        const label = stateLabel[state] || state;
        const color = stateColor[state] || '#607d8b';
        const rows = items.map(e => this._renderMiniEntityCard({
          entity_id: e.entry_id,
          name: e.title || e.domain,
          state: label,
          stateColor: color,
          timeAgo: '',
          infoLine: `${this._escapeHtml(e.domain)}${e.disabled_by ? ' · disabled' : ''}`,
          checkboxHtml: `<img src="${this._brandIconUrl(e.domain)}" style="width:20px;height:20px;flex-shrink:0;margin-right:4px" onerror="this.style.display='none'" alt="">`,
          actionsHtml: e.disabled_by
            ? `<span class="em-disabled-badge">${this._escapeHtml(e.disabled_by)}</span>`
            : `<button class="em-dialog-btn em-dialog-btn-secondary em-reload-entry" data-entry-id="${this._escapeHtml(e.entry_id)}">Reload</button>`,
        })).join('');
        html += this._collGroup(
          `<span style="color:${color}">${label}</span> <span style="font-size:11px;color:var(--secondary-text-color)">(${items.length})</span>`,
          rows
        );
      }
      body.innerHTML = `<div class="em-sug-section em-sug-health" style="padding:0">${html}</div>`;
      this._attachDialogSearch(overlay);

      this._reAttachCollapsibles(body);
      const _chBody = body.querySelector('.em-group-body');
      const _chArrow = body.querySelector('.em-collapse-arrow, .em-collapsible-icon');
      if (_chBody) _chBody.style.display = '';
      if (_chArrow) _chArrow.style.transform = '';

      body.querySelectorAll('.em-reload-entry').forEach(btn => {
        btn.addEventListener('click', async () => {
          const entryId = btn.dataset.entryId;
          btn.disabled = true;
          btn.textContent = 'Reloading…';
          try {
            await this._hass.callWS({ type: 'config_entries/reload', entry_id: entryId });
            this._showToast('Integration reloading…', 'success');
            await new Promise(r => setTimeout(r, 1500));
            const fresh = await this._hass.callWS({ type: 'entity_manager/get_config_entry_health' });
            this.configHealthCount = fresh.length;
            render(fresh);
          } catch (e) {
            this._showToast('Reload failed: ' + (e.message || e), 'error');
            btn.disabled = false;
            btn.textContent = 'Reload';
          }
        });
      });
    };

    try {
      const entries = await this._hass.callWS({ type: 'entity_manager/get_config_entry_health' });
      render(entries);
    } catch (e) {
      const body = (inline && container)
        ? container
        : overlay.querySelector('.confirm-dialog-box > *:not(.confirm-dialog-header):not(.confirm-dialog-actions)');
      body.innerHTML = `<div style="padding:16px;color:var(--error-color)">⚠ ${this._escapeHtml(String(e.message || e))}</div>`;
    }
  }

  async _showBrowserModDialog({ inline = false } = {}) {
    // Guard: don't re-render while inline view is already loaded
    if (inline && this.content.querySelector('.em-inline-view[data-view="browsers"]')) return;

    const bmIntegration = (this.data || []).find(i => i.integration === 'browser_mod');
    if (!bmIntegration) {
      this._showToast('browser_mod integration not found', 'error');
      return;
    }

    const staleThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Fetch entity registry once to find config_entry_ids
    let registry = [];
    try {
      registry = await this._hass.callWS({ type: 'config/entity_registry/list' });
    } catch (e) { console.warn('[EM] registry fetch failed', e); }

    // Build per-browser info
    const browsers = Object.entries(bmIntegration.devices)
      .filter(([deviceId]) => deviceId !== 'no_device')
      .map(([deviceId, device]) => {
        const entities = device.entities;

        // Last active = most-recent last_changed across all entities
        let lastActive = 0;
        entities.forEach(e => {
          const t = this._hass?.states[e.entity_id]?.last_changed;
          if (t) lastActive = Math.max(lastActive, new Date(t).getTime());
        });

        // Live activity from browser_mod entity states
        const activeEnt = entities.find(e => e.entity_id.startsWith('binary_sensor.') && e.entity_id.endsWith('_active'));
        const visibilityEnt = entities.find(e => e.entity_id.startsWith('sensor.') && e.entity_id.endsWith('_visibility'));
        const pathEnt = entities.find(e => e.entity_id.startsWith('sensor.') && e.entity_id.endsWith('_path'));
        const isActive = activeEnt ? this._hass?.states[activeEnt.entity_id]?.state === 'on' : false;
        const isVisible = visibilityEnt ? this._hass?.states[visibilityEnt.entity_id]?.state === 'visible' : false;
        const currentPath = pathEnt ? this._hass?.states[pathEnt.entity_id]?.state : null;

        // browser_mod browser_id: unique_id of the active binary_sensor is "{browser_id}_active"
        const activeRegEntry = registry.find(r => r.entity_id === activeEnt?.entity_id);
        const browserId = activeRegEntry?.unique_id?.replace(/_active$/, '') ?? null;

        return {
          deviceId,
          name: this.getDeviceName(deviceId) || deviceId,
          entities,
          lastActive,
          isStale: lastActive > 0 && lastActive < staleThreshold,
          neverSeen: lastActive === 0,
          isActive,
          isVisible,
          currentPath,
          browserId,
        };
      })
      .sort((a, b) => {
        // Active first, then visible, then by last activity
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        if (a.isVisible !== b.isVisible) return a.isVisible ? -1 : 1;
        return b.lastActive - a.lastActive;
      });

    const staleIds = browsers.filter(b => (b.isStale || b.neverSeen) && b.browserId).map(b => b.browserId);

    const renderBrowser = (b) => {
      const eid = this._escapeAttr(b.deviceId);
      const lastActiveStr = b.neverSeen ? 'Never seen'
        : b.isStale ? `${this._fmtAgo(new Date(b.lastActive).toISOString())} ⚠ stale`
        : this._fmtAgo(new Date(b.lastActive).toISOString());

      // Status badge: active > visible > stale/never
      let statusBadge = '';
      if (b.isActive) {
        statusBadge = `<span style="background:var(--em-success);color:#fff;padding:1px 8px;border-radius:10px;font-size:0.78em;margin-left:6px;vertical-align:middle">● Active</span>`;
      } else if (b.isVisible) {
        statusBadge = `<span style="background:var(--em-primary);color:#fff;padding:1px 8px;border-radius:10px;font-size:0.78em;margin-left:6px;vertical-align:middle">● Visible</span>`;
      } else if (b.neverSeen) {
        statusBadge = `<span style="background:var(--em-warning);color:#fff;padding:1px 7px;border-radius:10px;font-size:0.78em;margin-left:6px;vertical-align:middle">never active</span>`;
      } else if (b.isStale) {
        statusBadge = `<span style="background:var(--em-warning);color:#fff;padding:1px 7px;border-radius:10px;font-size:0.78em;margin-left:6px;vertical-align:middle">stale</span>`;
      }

      const pathHtml = (b.isActive || b.isVisible) && b.currentPath
        ? `<span style="font-size:0.8em;opacity:0.6;flex-basis:100%;margin-top:2px;padding-left:2px">📍 ${this._escapeHtml(b.currentPath)}</span>`
        : '';

      const deregisterBtn = b.browserId
        ? `<button class="btn em-dialog-btn em-dialog-btn-danger em-bm-deregister" data-browser-id="${this._escapeAttr(b.browserId)}" data-device-id="${eid}">Deregister</button>`
        : `<a href="/config/integrations/integration/browser_mod" target="_blank"
              style="font-size:0.8em;color:var(--em-primary);padding:3px 6px;text-decoration:none">Manage ↗</a>`;

      const browserIdChip = b.browserId
        ? `<span class="em-bm-browser-id-chip" data-browser-id="${this._escapeAttr(b.browserId)}"
              title="Click to view in browser_mod settings"
              style="display:inline-flex;align-items:center;gap:4px;font-family:monospace;font-size:0.75em;
                     background:rgba(128,128,128,0.12);border:1px solid rgba(128,128,128,0.25);
                     border-radius:4px;padding:1px 4px 1px 7px;cursor:pointer;user-select:none;
                     flex-basis:100%;margin-top:4px;max-width:fit-content;opacity:0.8;
                     transition:background 0.2s,border-color 0.2s">
              <span style="opacity:0.6;font-size:0.9em">ID</span>
              <span class="em-bm-id-text">${this._escapeHtml(b.browserId)}</span>
              <span style="opacity:0.4;font-size:0.85em;margin-left:2px">↗</span>
              <button class="em-bm-copy-btn" data-browser-id="${this._escapeAttr(b.browserId)}"
                title="Copy to clipboard"
                style="background:none;border:none;cursor:pointer;padding:1px 5px;font-size:1em;
                       opacity:0.45;line-height:1;border-left:1px solid rgba(128,128,128,0.25);
                       margin-left:4px">⎘</button>
           </span>`
        : '';

      return `
        <div class="entity-list-item" style="padding:10px 12px" data-device-id="${eid}">
          <div class="entity-list-row" style="flex-wrap:wrap;align-items:center;gap:6px">
            <span class="entity-list-name" style="font-weight:600;flex:1;min-width:140px">
              ${this._escapeHtml(b.name)}${statusBadge}
            </span>
            <span class="entity-list-id-inline" style="font-size:0.82em;opacity:0.65;flex:1;min-width:100px">
              ${b.entities.length} entit${b.entities.length !== 1 ? 'ies' : 'y'}
            </span>
            <span style="font-size:0.82em;opacity:0.75;flex:1;min-width:120px">
              Last active: <strong>${lastActiveStr}</strong>
            </span>
            ${browserIdChip}
            ${pathHtml}
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button class="btn btn-secondary em-bm-disable-all" data-device-id="${eid}"
                style="padding:3px 10px;font-size:0.8em">Disable all</button>
              ${deregisterBtn}
            </div>
          </div>
        </div>
      `;
    };

    const staleCount = browsers.filter(b => b.isStale || b.neverSeen).length;
    const infoBar = staleCount > 0 ? `
      <div class="em-rename-preview-box" style="font-size:0.9em">
        ⚠ ${staleCount} browser${staleCount !== 1 ? 's' : ''} with no activity in 7+ days — use "Clean up stale" to deregister them
      </div>` : '';

    const activeCount = browsers.filter(b => b.isActive).length;
    const visibleCount = browsers.filter(b => !b.isActive && b.isVisible).length;
    const activitySuffix = activeCount > 0
      ? ` — ${activeCount} active${visibleCount > 0 ? `, ${visibleCount} visible` : ''}`
      : visibleCount > 0 ? ` — ${visibleCount} visible` : '';

    const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    const svgRefreshBM = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
    const browserCardsHtml = browsers.length === 0
      ? '<p style="text-align:center;padding:24px;opacity:0.6">No registered browsers found.</p>'
      : browsers.map(renderBrowser).join('');
    const bmBrowserListHtml = `<div class="em-sug-section em-sug-health" id="em-bm-list">${this._collGroup('🌐 Registered Browsers (' + browsers.length + ')', browserCardsHtml)}</div>`;
    const bmBodyHtml = `
      <div class="entity-list-content">
        <div style="padding:0 0 8px">
          <input id="em-bm-search" type="search" placeholder="Search browsers…" autocomplete="off"
            style="width:100%;box-sizing:border-box;padding:7px 12px;border-radius:8px;border:2px solid var(--em-border);background:var(--em-bg-secondary);color:var(--em-text-primary);font-size:0.9em;outline:none;transition:border-color 0.15s">
        </div>
        ${infoBar}
        ${bmBrowserListHtml}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center">
          ${staleIds.length > 0
            ? `<button class="btn em-dialog-btn em-dialog-btn-warning" id="em-bm-cleanup-stale">
                 Clean up stale (${staleIds.length})
               </button>`
            : ''}
          ${(() => {
            const activeBrowser = browsers.find(b => b.isActive && b.browserId);
            const othersWithId = browsers.filter(b => !b.isActive && b.browserId);
            return activeBrowser && othersWithId.length > 0
              ? `<button class="btn em-dialog-btn-danger" id="em-bm-deregister-others">
                   Deregister all but active (${othersWithId.length})
                 </button>`
              : '';
          })()}
        </div>
      </div>`;
    let overlay, closeDialog;
    if (inline) {
      const contentEl = this.content.querySelector('#content');
      contentEl.innerHTML = `
        <div class="em-inline-view" data-view="browsers">
          <div class="em-inline-view-header">
            <button class="em-inline-back-btn">${svgBack} Back</button>
            <span class="em-inline-view-title">🌐 browser_mod Browsers (${browsers.length}${activitySuffix})</span>
            <button class="em-inline-refresh-btn" title="Refresh">${svgRefreshBM}</button>
          </div>
          <div class="em-inline-view-body">
            ${bmBodyHtml}
          </div>
        </div>`;
      overlay = contentEl;
      closeDialog = () => this._closeView();
      overlay.querySelector('.em-inline-back-btn').addEventListener('click', closeDialog);
      overlay.querySelector('.em-inline-refresh-btn').addEventListener('click', () => this._refreshView());
      this._reAttachCollapsibles(overlay, { expand: true });
    } else {
      const result = this.createDialog({
        title: `browser_mod Browsers (${browsers.length}${activitySuffix})`,
        color: '#2196f3',
        extraClass: 'entity-list-dialog',
        contentHtml: bmBodyHtml,
        actionsHtml: `
          <div style="display:flex;gap:8px;flex-wrap:wrap;width:100%;align-items:center">
            <div style="display:flex;gap:8px;margin-right:auto;flex-wrap:wrap">
              ${staleIds.length > 0
                ? `<button class="btn em-dialog-btn em-dialog-btn-warning" id="em-bm-cleanup-stale">
                     Clean up stale (${staleIds.length})
                   </button>`
                : ''}
              ${(() => {
                const activeBrowser = browsers.find(b => b.isActive && b.browserId);
                const othersWithId = browsers.filter(b => !b.isActive && b.browserId);
                return activeBrowser && othersWithId.length > 0
                  ? `<button class="btn em-dialog-btn-danger" id="em-bm-deregister-others">
                       Deregister all but active (${othersWithId.length})
                     </button>`
                  : '';
              })()}
            </div>
            <button class="btn btn-secondary" id="close-bm-dialog">Close</button>
          </div>`,
      });
      overlay = result.overlay;
      closeDialog = result.closeDialog;
      overlay.querySelector('#close-bm-dialog').addEventListener('click', closeDialog);
    }

    // Search bar — filter browser items by name or browser ID text
    const bmSearch = overlay.querySelector('#em-bm-search');
    if (bmSearch) {
      bmSearch.addEventListener('input', () => {
        const q = bmSearch.value.toLowerCase().trim();
        overlay.querySelectorAll('.entity-list-item[data-device-id]').forEach(item => {
          item.style.display = (!q || item.innerText.toLowerCase().includes(q)) ? '' : 'none';
        });
      });
    }

    // Chip click → flash + navigate to browser_mod settings
    overlay.querySelectorAll('.em-bm-browser-id-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.style.background = 'rgba(33,150,243,0.18)';
        chip.style.borderColor = 'rgba(33,150,243,0.7)';
        setTimeout(() => {
          closeDialog();
          window.history.pushState(null, '', '/config/integrations/integration/browser_mod');
          window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
        }, 220);
      });
    });

    // Copy icon inside chip → copy to clipboard (no navigation)
    overlay.querySelectorAll('.em-bm-copy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.browserId;
        try {
          await navigator.clipboard.writeText(id);
          const prev = btn.textContent;
          btn.textContent = '✓';
          btn.style.color = 'var(--em-success)';
          btn.style.opacity = '1';
          setTimeout(() => { btn.textContent = prev; btn.style.color = ''; btn.style.opacity = ''; }, 1500);
        } catch (e) {
          console.warn('[EM] clipboard copy failed', e);
          this._showToast(`Browser ID: ${id}`, 'info');
        }
      });
    });

    // Disable all entities for a browser
    overlay.querySelectorAll('.em-bm-disable-all').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const deviceId = btn.dataset.deviceId;
        const browser = browsers.find(b => b.deviceId === deviceId);
        if (!browser) return;
        btn.disabled = true;
        btn.textContent = 'Disabling…';
        try {
          for (const entity of browser.entities) {
            await this._hass.callWS({
              type: 'entity_manager/disable_entity',
              entity_id: entity.entity_id,
            });
          }
          this._showToast(`Disabled ${browser.entities.length} entities for ${browser.name}`, 'success');
          btn.textContent = 'Disabled';
        } catch (err) {
          this._showToast(`Failed: ${err.message}`, 'error');
          btn.disabled = false;
          btn.textContent = 'Disable all';
        }
      });
    });

    // Deregister individual browser via browser_mod.deregister_browser service
    overlay.querySelectorAll('.em-bm-deregister').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const browserId = btn.dataset.browserId;
        const deviceId = btn.dataset.deviceId;
        const browser = browsers.find(b => b.deviceId === deviceId);
        if (!confirm(`Deregister browser "${browser?.name}"?\n\nThis removes it from browser_mod. All its entities will be deleted.`)) return;
        btn.disabled = true;
        btn.textContent = 'Deregistering…';
        try {
          await this._hass.callService('browser_mod', 'deregister_browser', { browser_id: browserId });
          btn.closest('.entity-list-item')?.remove();
          this._showToast(`Deregistered ${browser?.name}`, 'success');
          this.loadData();
        } catch (err) {
          this._showToast(`Deregister failed: ${err.message}`, 'error');
          btn.disabled = false;
          btn.textContent = 'Deregister';
        }
      });
    });

    // Clean up all stale browsers at once
    const cleanupBtn = overlay.querySelector('#em-bm-cleanup-stale');
    if (cleanupBtn) {
      cleanupBtn.addEventListener('click', async () => {
        if (!confirm(`Deregister ${staleIds.length} stale browser${staleIds.length !== 1 ? 's' : ''}?\n\nAll browsers with no activity in 7+ days will be removed.`)) return;
        cleanupBtn.disabled = true;
        cleanupBtn.textContent = 'Cleaning up…';
        try {
          await this._hass.callService('browser_mod', 'deregister_browser', { browser_id: staleIds });
          this._showToast(`Deregistered ${staleIds.length} stale browser${staleIds.length !== 1 ? 's' : ''}`, 'success');
          closeDialog();
          this.loadData();
        } catch (err) {
          this._showToast(`Cleanup failed: ${err.message}`, 'error');
          cleanupBtn.disabled = false;
          cleanupBtn.textContent = `Clean up stale (${staleIds.length})`;
        }
      });
    }

    // Deregister all but the currently active browser
    const deregOthersBtn = overlay.querySelector('#em-bm-deregister-others');
    if (deregOthersBtn) {
      const activeBrowser = browsers.find(b => b.isActive && b.browserId);
      const otherIds = browsers.filter(b => !b.isActive && b.browserId).map(b => b.browserId);
      deregOthersBtn.addEventListener('click', async () => {
        if (!confirm(`Deregister ${otherIds.length} browser${otherIds.length !== 1 ? 's' : ''}?\n\nKeeps "${activeBrowser?.name}" and removes everything else.`)) return;
        deregOthersBtn.disabled = true;
        deregOthersBtn.textContent = 'Deregistering…';
        try {
          await this._hass.callService('browser_mod', 'deregister_browser', { browser_id: otherIds });
          this._showToast(`Deregistered ${otherIds.length} browser${otherIds.length !== 1 ? 's' : ''}`, 'success');
          closeDialog();
          this.loadData();
        } catch (err) {
          this._showToast(`Deregister failed: ${err.message}`, 'error');
          deregOthersBtn.disabled = false;
          deregOthersBtn.textContent = `Deregister all but active (${otherIds.length})`;
        }
      });
    }
  }

  _showCleanupDialog({ inline = false, container = null } = {}) {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - thirtyDaysMs;
    const dismissed = this._loadFromStorage('em-stale-dismissed', {});
    const states = Object.values(this._hass?.states || {});

    // ── Section 1: Orphaned entities ──────────────────────────────────
    const orphanedEntities = [];
    (this.data || []).forEach(integration => {
      const noDevice = integration.devices['no_device'];
      if (noDevice) noDevice.entities.forEach(e => orphanedEntities.push({ ...e, integration: integration.integration }));
    });

    // Split: YAML-defined (no config_entry_id) vs integration-backed
    const yamlOrphaned = orphanedEntities.filter(e => !e.config_entry_id);
    const integOrphaned = orphanedEntities.filter(e => e.config_entry_id);

    const orphanedByInteg = {};
    integOrphaned.forEach(e => {
      if (!orphanedByInteg[e.integration]) orphanedByInteg[e.integration] = [];
      orphanedByInteg[e.integration].push(e);
    });

    const _renderOrphanCard = (e, isYaml) => {
      const stateObj = this._hass?.states?.[e.entity_id];
      const currentState = stateObj ? String(stateObj.state) : null;
      const lastUpdated = stateObj?.last_updated ? this._fmtAgo(stateObj.last_updated, 'Never') : 'Never seen';
      return this._renderMiniEntityCard({
        entity_id: e.entity_id,
        name: e.original_name || e.entity_id,
        state: currentState ?? 'not in states',
        stateColor: currentState ? 'var(--em-primary)' : 'var(--em-danger)',
        timeAgo: lastUpdated,
        infoLine: isYaml ? `📄 YAML · ${this._escapeHtml(e.integration)}` : `🔌 ${this._escapeHtml(e.integration)}`,
        extraClass: 'em-cleanup-orphaned-row',
        actionsHtml: `
          <button class="em-assign-btn em-cleanup-assign-orphaned" data-entity-id="${this._escapeAttr(e.entity_id)}">Assign to device</button>
          <button class="em-dialog-btn em-dialog-btn-danger em-cleanup-remove-orphaned" data-entity-id="${this._escapeAttr(e.entity_id)}"${isYaml ? ' title="YAML entity — will re-appear on restart"' : ''}>Remove</button>`,
      });
    };

    const yamlOrphanedHtml = yamlOrphaned.length === 0
      ? '<p style="text-align:center;padding:16px;opacity:0.6">No YAML orphaned entities.</p>'
      : `<p style="padding:6px 12px 2px;font-size:11px;opacity:0.6;margin:0">YAML entities will re-appear on restart if removed from the registry.</p>
         ${yamlOrphaned.map(e => _renderOrphanCard(e, true)).join('')}`;

    const integOrphanedHtml = integOrphaned.length === 0
      ? '<p style="text-align:center;padding:16px;opacity:0.6">No integration orphaned entities.</p>'
      : Object.entries(orphanedByInteg).sort().map(([integ, items]) => {
          const integLabel = integ.charAt(0).toUpperCase() + integ.slice(1);
          return this._collGroup(`${integLabel} (${items.length})`, items.map(e => _renderOrphanCard(e, false)).join(''));
        }).join('');

    const orphanedHtml = orphanedEntities.length === 0
      ? '<p style="text-align:center;padding:24px;opacity:0.6">No orphaned entities found.</p>'
      : `
        <div style="padding:6px 12px 4px;display:flex;justify-content:flex-end">
          <button class="em-dialog-btn em-dialog-btn-danger em-cleanup-remove-all-orphaned">Remove All (${orphanedEntities.length})</button>
        </div>
        <div class="em-sug-section em-sug-naming" style="margin:0 8px 8px">
          ${this._collGroup(`📄 YAML Config Entities (${yamlOrphaned.length})`, yamlOrphanedHtml)}
        </div>
        <div class="em-sug-section em-sug-area" style="margin:0 8px 8px">
          ${this._collGroup(`🔌 Integration Orphans (${integOrphaned.length})`, integOrphanedHtml)}
        </div>`;

    // ── Section 2: Stale entities ─────────────────────────────────────
    const staleEntities = states.filter(s => {
      if (s.state === 'unavailable' || s.state === 'unknown') return false;
      if (!s.last_updated) return false;
      const d = dismissed[s.entity_id];
      if (d && Date.now() - d < thirtyDaysMs) return false;
      return new Date(s.last_updated).getTime() < thirtyDaysAgo;
    });

    const staleHtml = staleEntities.length === 0
      ? '<p style="text-align:center;padding:24px;opacity:0.6">No stale entities found.</p>'
      : staleEntities.map(s => this._renderMiniEntityCard({
          entity_id: s.entity_id,
          name: s.attributes?.friendly_name || s.entity_id,
          state: String(s.state),
          stateColor: 'var(--em-warning)',
          timeAgo: this._fmtAgo(s.last_updated, 'Unknown'),
          infoLine: `Domain: ${this._escapeHtml(s.entity_id.split('.')[0])}`,
          extraClass: 'em-cleanup-stale-row',
          actionsHtml: `
            <button class="em-dialog-btn em-dialog-btn-secondary em-cleanup-stale-keep" data-entity-id="${this._escapeAttr(s.entity_id)}" title="Hide for 30 days">Keep</button>
            <button class="em-dialog-btn em-dialog-btn-warning em-cleanup-stale-disable" data-entity-id="${this._escapeAttr(s.entity_id)}" title="Disable entity">Disable</button>
            <button class="em-dialog-btn em-dialog-btn-danger em-cleanup-stale-remove" data-entity-id="${this._escapeAttr(s.entity_id)}" title="Remove from registry">Remove</button>`,
        })).join('');

    // ── Section 3: Ghost devices ───────────────────────────────────────
    const devicesWithEntities = new Set();
    (this.data || []).forEach(int => {
      Object.keys(int.devices).forEach(id => { if (id !== 'no_device') devicesWithEntities.add(id); });
    });
    const ghostDevices = Object.entries(this.deviceInfo).filter(([id]) => !devicesWithEntities.has(id));

    const ghostHtml = ghostDevices.length === 0
      ? '<p style="text-align:center;padding:24px;opacity:0.6">No ghost devices found.</p>'
      : ghostDevices.map(([id, dev]) => `
          <div class="entity-list-item" style="padding:10px 12px">
            <div class="entity-list-row" style="flex-wrap:wrap;align-items:center;gap:6px">
              <span class="entity-list-name" style="font-weight:600;flex:1;min-width:0">${this._escapeHtml(dev.name_by_user || dev.name || id)}</span>
              ${dev.manufacturer ? `<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;opacity:0.7">${this._escapeHtml(dev.manufacturer)}</span>` : ''}
              ${dev.model ? `<span style="font-size:10px;opacity:0.6">${this._escapeHtml(dev.model)}</span>` : ''}
              <span style="margin-left:auto">
                <button class="em-dialog-btn em-dialog-btn-secondary em-cleanup-open-device" data-device-id="${this._escapeAttr(id)}" title="Open device page in HA">Open in HA</button>
              </span>
            </div>
          </div>`).join('');

    // ── Section 4: Never-triggered automations & scripts ──────────────
    const neverTriggered = states.filter(s =>
      (s.entity_id.startsWith('automation.') || s.entity_id.startsWith('script.')) &&
      !s.attributes?.last_triggered
    );

    const neverHtml = neverTriggered.length === 0
      ? '<p style="text-align:center;padding:24px;opacity:0.6">All automations and scripts have been triggered.</p>'
      : neverTriggered.map(s => {
          const domain = s.entity_id.split('.')[0];
          const editPath = domain === 'automation'
            ? `/config/automation/edit/${s.attributes?.id || s.entity_id}`
            : `/config/script/edit/${s.entity_id.split('.')[1]}`;
          return this._renderMiniEntityCard({
            entity_id: s.entity_id,
            name: s.attributes?.friendly_name || s.entity_id,
            state: String(s.state),
            stateColor: s.state === 'on' ? 'var(--em-success)' : 'var(--em-text-secondary)',
            timeAgo: 'Never triggered',
            infoLine: `Domain: ${this._escapeHtml(domain)}`,
            extraClass: 'em-cleanup-never-row',
            navigatePath: editPath,
          });
        }).join('');

    const cleanupContentHtml = `
      <div style="padding:8px 8px 4px">
        <div class="em-sug-section em-sug-area">
          ${this._collGroup(`🧹 Orphaned Entities (${orphanedEntities.length})`, orphanedHtml)}
        </div>
        <div class="em-sug-section em-sug-disable">
          ${this._collGroup(`Stale Entities — 30d+ (${staleEntities.length})`, staleHtml)}
        </div>
        <div class="em-sug-section em-sug-health">
          ${this._collGroup(`Ghost Devices (${ghostDevices.length})`, ghostHtml)}
        </div>
        <div class="em-sug-section em-sug-naming">
          ${this._collGroup(`Never Triggered (${neverTriggered.length})`, neverHtml)}
        </div>
      </div>`;
    let overlay, closeDialog;
    if (inline && container) {
      container.innerHTML = cleanupContentHtml;
      overlay = container;
      closeDialog = () => {};
    } else {
      const result = this.createDialog({
        title: 'Cleanup',
        color: '#ff9800',
        searchPlaceholder: 'Search cleanup items…',
        contentHtml: cleanupContentHtml,
        actionsHtml: `<button class="btn btn-secondary" id="em-cleanup-close">Close</button>`,
      });
      overlay = result.overlay;
      closeDialog = result.closeDialog;
      overlay.querySelector('#em-cleanup-close')?.addEventListener('click', closeDialog);
    }

    this._reAttachCollapsibles(overlay);
    this._attachDialogSearch(overlay);

    // ── Listeners ─────────────────────────────────────────────────────
    // Remove All orphaned
    overlay.querySelector('.em-cleanup-remove-all-orphaned')?.addEventListener('click', async (e) => {
      if (!confirm(`Remove all ${orphanedEntities.length} orphaned entities? This cannot be undone.`)) return;
      const btn = e.target;
      btn.disabled = true; btn.textContent = 'Removing…';
      let removed = 0;
      for (const ent of orphanedEntities) {
        try {
          await this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: ent.entity_id });
          overlay.querySelector(`.em-cleanup-orphaned-row[data-entity-id="${CSS.escape(ent.entity_id)}"]`)?.remove();
          removed++;
        } catch (e) {
          console.warn('[EM] remove orphaned entity failed', ent.entity_id, e);
          this._showToast(`Remove failed: ${e.message || e}`, 'error');
        }
      }
      this.orphanedCount = Math.max(0, (this.orphanedCount || 0) - removed);
      this.cleanupCount = Math.max(0, (this.cleanupCount || 0) - removed);
      this._showToast(`Removed ${removed} orphaned entities`, 'success');
      btn.textContent = 'Done';
    });

    // Assign orphaned entity to a device
    overlay.addEventListener('click', async (e) => {
      const assignBtn = e.target.closest('.em-cleanup-assign-orphaned');
      if (!assignBtn) return;
      const entityId = assignBtn.dataset.entityId;
      this._showDevicePickerDialog(entityId, async (deviceId, deviceName) => {
        assignBtn.disabled = true; assignBtn.textContent = 'Assigning…';
        try {
          await this._hass.callWS({ type: 'entity_manager/assign_entity_device', entity_id: entityId, device_id: deviceId });
          this._pushUndoAction({ type: 'assign_entity_device', entityId, oldDeviceId: null, newDeviceId: deviceId, deviceName });
          overlay.querySelector(`.em-cleanup-orphaned-row[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
          this.orphanedCount = Math.max(0, (this.orphanedCount || 0) - 1);
          this.cleanupCount = Math.max(0, (this.cleanupCount || 0) - 1);
          this._showToast(`${entityId} assigned to ${deviceName}`, 'success');
          this.loadData();
        } catch (err) {
          assignBtn.disabled = false; assignBtn.textContent = 'Assign to device';
          this._showToast('Assign failed: ' + (err.message || err), 'error');
        }
      });
    });

    // Remove single orphaned
    overlay.addEventListener('click', async (e) => {
      const removeOrphan = e.target.closest('.em-cleanup-remove-orphaned');
      if (removeOrphan) {
        const entityId = removeOrphan.dataset.entityId;
        if (!confirm(`Remove ${entityId}? This cannot be undone.`)) return;
        removeOrphan.disabled = true; removeOrphan.textContent = '…';
        try {
          await this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: entityId });
          overlay.querySelector(`.em-cleanup-orphaned-row[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
          this.orphanedCount = Math.max(0, (this.orphanedCount || 0) - 1);
          this.cleanupCount = Math.max(0, (this.cleanupCount || 0) - 1);
          this._showToast(`${entityId} removed`, 'success');
        } catch (err) {
          removeOrphan.disabled = false; removeOrphan.textContent = 'Remove';
          this._showToast('Remove failed: ' + (err.message || err), 'error');
        }
        return;
      }

      const keepBtn = e.target.closest('.em-cleanup-stale-keep');
      const disableBtn = e.target.closest('.em-cleanup-stale-disable');
      const removeStale = e.target.closest('.em-cleanup-stale-remove');
      const openDevice = e.target.closest('.em-cleanup-open-device');

      if (keepBtn) {
        const entityId = keepBtn.dataset.entityId;
        dismissed[entityId] = Date.now();
        this._saveToStorage('em-stale-dismissed', dismissed);
        overlay.querySelector(`.em-cleanup-stale-row[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
        this.healthCount = Math.max(0, (this.healthCount || 0) - 1);
        this.cleanupCount = Math.max(0, (this.cleanupCount || 0) - 1);
        this._showToast(`${entityId} hidden for 30 days`, 'info');
      }

      if (disableBtn) {
        const entityId = disableBtn.dataset.entityId;
        disableBtn.disabled = true; disableBtn.textContent = '…';
        try {
          await this._hass.callWS({ type: 'entity_manager/disable_entity', entity_id: entityId });
          overlay.querySelector(`.em-cleanup-stale-row[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
          this.healthCount = Math.max(0, (this.healthCount || 0) - 1);
          this.cleanupCount = Math.max(0, (this.cleanupCount || 0) - 1);
          this._showToast(`${entityId} disabled`, 'success');
        } catch (err) {
          disableBtn.disabled = false; disableBtn.textContent = 'Disable';
          this._showToast('Disable failed: ' + (err.message || err), 'error');
        }
      }

      if (removeStale) {
        const entityId = removeStale.dataset.entityId;
        if (!confirm(`Remove ${entityId}? This cannot be undone.`)) return;
        removeStale.disabled = true; removeStale.textContent = '…';
        try {
          await this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: entityId });
          overlay.querySelector(`.em-cleanup-stale-row[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
          this.healthCount = Math.max(0, (this.healthCount || 0) - 1);
          this.cleanupCount = Math.max(0, (this.cleanupCount || 0) - 1);
          this._showToast(`${entityId} removed`, 'success');
        } catch (err) {
          removeStale.disabled = false; removeStale.textContent = 'Remove';
          this._showToast('Remove failed: ' + (err.message || err), 'error');
        }
      }

      if (openDevice) {
        const deviceId = openDevice.dataset.deviceId;
        closeDialog();
        history.pushState(null, '', `/config/devices/device/${deviceId}`);
        window.dispatchEvent(new CustomEvent('location-changed'));
      }

    });
  }

  async showEntityListDialog(type, { inline = false, container = null } = {}) {
    let title = '';
    let entities = [];
    let color = '';
    let allowToggle = false;
    let groupedHtml = '';
    let bulkBarHtml = '';

    try {
        const states = await this._hass.callWS({ type: 'get_states' });
        

        if (type === 'automation') {
          title = 'Automations';
          color = '#2196f3';
          allowToggle = true;

          try {
            const automations = await this._hass.callWS({ type: 'entity_manager/get_automations' });
            const autoBody = automations.slice().sort((a, b) => a.name.localeCompare(b.name)).map(a => {
              const st = this._hass?.states[a.entity_id];
              const attrs = st?.attributes || {};
              const eid = this._escapeAttr(a.entity_id);
              return this._renderMiniEntityCard({
                entity_id: a.entity_id,
                name: a.name,
                state: a.state === 'on' ? 'On' : 'Off',
                stateColor: a.state === 'on' ? 'var(--em-success)' : 'var(--em-text-secondary)',
                timeAgo: a.last_triggered ? this._fmtAgo(a.last_triggered) : 'Never triggered',
                infoLine: `${this._triggerBadge(a)}${attrs.mode ? ` · Mode: ${this._escapeHtml(attrs.mode)}` : ''}${attrs.current != null ? ` · Runs: ${attrs.current}/${attrs.max ?? 1}` : ''}`,
                checkboxHtml: `<input type="checkbox" class="em-dialog-row-checkbox em-dlg-sel" data-entity-id="${eid}" data-entity-name="${this._escapeAttr(a.name)}" style="flex-shrink:0;cursor:pointer;accent-color:var(--em-primary);margin-right:4px">`,
                navigatePath: attrs.id ? `/config/automation/edit/${attrs.id}` : null,
                actionsHtml: `
                  <button class="entity-list-toggle ${a.state === 'on' ? 'on' : 'off'} em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-entity-type="automation">${a.state === 'on' ? 'On' : 'Off'}</button>
                  <button class="entity-list-action-btn edit-btn em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-entity-type="automation">Edit</button>
                  <button class="em-entity-rename em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-current-name="${this._escapeAttr(a.name)}">Rename</button>`,
              });
            }).join('');
            groupedHtml = this._collGroup(`Automations (${automations.length})`, autoBody);
            bulkBarHtml = this._renderDialogBulkBar([
              { id: 'bulk-rename', label: 'Rename…' },
              { id: 'bulk-labels', label: 'Add Labels…' },
              { id: 'bulk-area',   label: 'Assign Area…' },
              { id: 'bulk-remove', label: 'Remove…', variant: 'danger' },
            ]);
            entities = automations.map(a => ({ id: a.entity_id, name: a.name, state: a.state }));
          } catch (e) {
            entities = states.filter(s => s.entity_id.startsWith('automation.'))
              .map(s => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id, state: s.state }));
          }
        } else if (type === 'script') {
          title = 'Scripts';
          color = '#ff9800';
          allowToggle = false; // handled inline

          const scriptStates = states.filter(s => s.entity_id.startsWith('script.'));
          const scriptBody = scriptStates.slice().sort((a, b) => {
            const na = a.attributes.friendly_name || a.entity_id;
            const nb = b.attributes.friendly_name || b.entity_id;
            return na.localeCompare(nb);
          }).map(s => {
            const isRunning = s.state === 'on';
            const attrs = s.attributes;
            const lastTriggered = attrs.last_triggered;
            const mode = attrs.mode || 'single';
            const eid = this._escapeAttr(s.entity_id);
            const sName = attrs.friendly_name || s.entity_id;
            return this._renderMiniEntityCard({
              entity_id: s.entity_id,
              name: sName,
              state: isRunning ? 'Running' : 'Idle',
              stateColor: isRunning ? 'var(--em-warning)' : 'var(--em-text-secondary)',
              timeAgo: lastTriggered ? this._fmtAgo(lastTriggered) : 'Never run',
              infoLine: `${lastTriggered ? '' : '<span class="em-never-triggered-badge">Never run</span> · '}Mode: ${this._escapeHtml(mode)}${attrs.current != null ? ` · Runs: ${attrs.current}/${attrs.max ?? 1}` : ''}`,
              checkboxHtml: `<input type="checkbox" class="em-dialog-row-checkbox em-dlg-sel" data-entity-id="${eid}" data-entity-name="${this._escapeAttr(sName)}" style="flex-shrink:0;cursor:pointer;accent-color:var(--em-primary);margin-right:4px">`,
              navigatePath: `/config/script/edit/${s.entity_id.split('.')[1]}`,
              actionsHtml: `
                <button class="entity-list-action-btn edit-btn em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-entity-type="script">Edit</button>
                <button class="em-entity-rename em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-current-name="${this._escapeAttr(sName)}">Rename</button>`,
            });
          }).join('');
          groupedHtml = scriptStates.length
            ? this._collGroup(`Scripts (${scriptStates.length})`, scriptBody)
            : '<p style="text-align:center;padding:24px;opacity:0.6">No scripts found.</p>';
          if (scriptStates.length) {
            bulkBarHtml = this._renderDialogBulkBar([
              { id: 'bulk-rename', label: 'Rename…' },
              { id: 'bulk-labels', label: 'Add Labels…' },
              { id: 'bulk-remove', label: 'Remove…', variant: 'danger' },
            ]);
          }
          entities = scriptStates.map(s => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id, state: s.state }));

        } else if (type === 'helper') {
          title = 'Helpers';
          color = '#9c27b0';
          allowToggle = false; // handled inline

          const helperDomains = ['input_boolean', 'input_number', 'input_text', 'input_select',
            'input_datetime', 'input_button', 'counter', 'timer', 'variable'];
          const helperStates = states.filter(s => helperDomains.some(d => s.entity_id.startsWith(d + '.')));

          const byDomain = {};
          helperStates.forEach(s => {
            const domain = s.entity_id.split('.')[0];
            if (!byDomain[domain]) byDomain[domain] = [];
            byDomain[domain].push(s);
          });

          const renderHelperItem = (s) => {
            const domain = s.entity_id.split('.')[0];
            const attrs = s.attributes;
            const isBoolean = domain === 'input_boolean';
            const unit = attrs.unit_of_measurement ? ` ${this._escapeHtml(attrs.unit_of_measurement)}` : '';
            const stateColor = isBoolean ? (s.state === 'on' ? '#4caf50' : '#9e9e9e') : '#9c27b0';
            const stateText = isBoolean ? (s.state === 'on' ? 'On' : 'Off') : this._escapeHtml(s.state) + unit;

            // Build domain-specific extra info line
            let extraInfo = '';
            if (domain === 'input_number' && (attrs.min != null || attrs.max != null)) {
              extraInfo = `Range: ${attrs.min ?? '?'} – ${attrs.max ?? '?'}${attrs.step != null ? ` · Step: ${attrs.step}` : ''}`;
            } else if (domain === 'input_select' && attrs.options?.length) {
              extraInfo = `Options: ${this._escapeHtml(attrs.options.join(', '))}`;
            } else if (domain === 'timer' && attrs.duration) {
              extraInfo = `Duration: ${this._escapeHtml(attrs.duration)}${attrs.remaining ? ` · Remaining: ${this._escapeHtml(attrs.remaining)}` : ''}`;
            } else if (domain === 'counter' && attrs.step != null) {
              extraInfo = `Step: ${attrs.step}${attrs.min != null ? ` · Min: ${attrs.min}` : ''}${attrs.max != null ? ` · Max: ${attrs.max}` : ''}`;
            }
            const eid = this._escapeAttr(s.entity_id);
            const hName = attrs.friendly_name || s.entity_id;
            return this._renderMiniEntityCard({
              entity_id: s.entity_id,
              name: hName,
              state: stateText,
              stateColor: stateColor,
              timeAgo: this._fmtAgo(s.last_changed),
              infoLine: extraInfo || this._escapeHtml(domain.replace(/_/g, ' ')),
              checkboxHtml: `<input type="checkbox" class="em-dialog-row-checkbox em-dlg-sel" data-entity-id="${eid}" data-entity-name="${this._escapeAttr(hName)}" style="flex-shrink:0;cursor:pointer;accent-color:var(--em-primary);margin-right:4px">`,
              actionsHtml: `
                <button class="em-entity-rename em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-current-name="${this._escapeAttr(hName)}">Rename</button>
                <button class="em-entity-remove em-dialog-btn em-dialog-btn-danger" data-entity-id="${eid}" data-entity-type="helper">Remove</button>`,
            });
          };

          if (helperStates.length === 0) {
            groupedHtml = '<p style="text-align:center;padding:24px;opacity:0.6">No helpers found.</p>';
          } else {
            const domainGroups = Object.entries(byDomain).sort().map(([domain, items]) => {
              const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;
                           color:var(--em-text-secondary);padding:8px 4px 4px;margin-top:4px">${domainLabel} (${items.length})</div>
                      ${items.map(renderHelperItem).join('')}`;
            }).join('');
            groupedHtml = this._collGroup(`Helpers (${helperStates.length})`, domainGroups);
            bulkBarHtml = this._renderDialogBulkBar([
              { id: 'bulk-rename', label: 'Rename…' },
              { id: 'bulk-labels', label: 'Add Labels…' },
              { id: 'bulk-area',   label: 'Assign Area…' },
              { id: 'bulk-remove', label: 'Remove…', variant: 'danger' },
            ]);
          }
          entities = helperStates.map(s => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id, state: s.state }));
        } else if (type === 'template') {
          title = '📐 Templates';
          color = '#ff9800';
          allowToggle = false;

          try {
            const templateList = await this._hass.callWS({ type: 'entity_manager/get_template_sensors' });
            this.templateSensors = templateList;

            // Enrich each template with last_real_changed from recorder history.
            // This survives restarts: templates briefly go unknown on restart, which
            // resets last_changed. We scan history (oldest→newest) ignoring
            // unknown/unavailable to find when the real value last actually changed.
            try {
              const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
              const historyResult = await this._hass.callWS({
                type: 'history/history_during_period',
                start_time: start,
                entity_ids: templateList.map(t => t.entity_id),
                minimal_response: true,
                no_attributes: true,
              });
              for (const t of templateList) {
                const history = historyResult?.[t.entity_id] || [];
                let lastRealValue = null;
                let lastRealChangeTime = null;
                for (const entry of history) {
                  const s = entry.s !== undefined ? entry.s : entry.state;
                  const lc = entry.lc !== undefined ? entry.lc : entry.last_changed;
                  if (!s || s === 'unknown' || s === 'unavailable') continue;
                  if (s !== lastRealValue) {
                    lastRealValue = s;
                    // lc can be a unix timestamp (number) or ISO string
                    lastRealChangeTime = typeof lc === 'number'
                      ? new Date(lc * 1000).toISOString()
                      : lc;
                  }
                }
                if (lastRealChangeTime) t.last_real_changed = lastRealChangeTime;
              }
            } catch (_histErr) {
              // Recorder not available — fall back to last_changed
            }

            const _stateDisplay = (t) => {
              const s = t.state;
              if (s === null || s === undefined || s === '')
                return t.disabled
                  ? `<span style="color:var(--em-danger)">No state (disabled)</span>`
                  : `<span style="opacity:0.5">—</span>`;
              if (s === 'unknown')
                return `<span style="color:var(--em-warning)" title="Template has not been evaluated yet">Not evaluated</span>`;
              if (s === 'unavailable')
                return `<span style="color:var(--em-danger)" title="A dependency is offline or the template has an error">Unavailable</span>`;
              const uom = t.unit_of_measurement ? ` ${this._escapeHtml(t.unit_of_measurement)}` : '';
              return `<span>${this._escapeHtml(String(s))}${uom}</span>`;
            };

            const renderTemplateItem = (t) => {
              const eid = this._escapeAttr(t.entity_id);
              const tName = t.name || t.entity_id;
              const uniqueIdAttr = t.unique_id ? this._escapeAttr(t.unique_id) : '';
              const connectedPart = t.connected_entities?.length
                ? ` · Connected: ${t.connected_entities.length}` : '';
              return this._renderMiniEntityCard({
                entity_id: t.entity_id,
                name: tName,
                state: t.disabled ? 'disabled' : _stateDisplay(t).replace(/<[^>]*>/g, ''),
                stateColor: t.disabled ? 'var(--em-danger)' : 'var(--em-primary)',
                timeAgo: this._fmtAgo(t.last_real_changed || t.last_changed, 'Unknown'),
                infoLine: `${this._triggerBadge(t)}${connectedPart}`,
                checkboxHtml: `<input type="checkbox" class="em-dialog-row-checkbox em-dlg-sel" data-entity-id="${eid}" data-entity-name="${this._escapeAttr(tName)}" style="flex-shrink:0;cursor:pointer;accent-color:var(--em-primary);margin-right:4px">`,
                actionsHtml: `
                  ${t.unique_id
                    ? `<button class="em-tpl-open em-dialog-btn em-dialog-btn-primary" data-entity-id="${eid}" data-unique-id="${uniqueIdAttr}">Edit</button>`
                    : `<button class="em-tpl-register em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}">Register</button>`}
                  <button class="em-tpl-edit em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}" data-current-name="${this._escapeAttr(tName)}">Rename</button>
                  <button class="em-tpl-remove em-dialog-btn em-dialog-btn-danger" data-entity-id="${eid}">Remove</button>`,
              });
            };

            // Group by domain (sensor, binary_sensor, template, etc.)
            const byDomain = {};
            templateList.forEach(t => {
              const domain = t.entity_id.split('.')[0];
              if (!byDomain[domain]) byDomain[domain] = [];
              byDomain[domain].push(t);
            });

            if (Object.keys(byDomain).length === 0) {
              groupedHtml = '<p style="text-align:center;padding:24px;opacity:0.6">No template sensors found.</p>';
            } else {
              groupedHtml = Object.entries(byDomain).sort().map(([domain, items]) => {
                const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return this._collGroup(`📐 ${domainLabel} (${items.length})`, items.map(renderTemplateItem).join(''));
              }).join('');
              bulkBarHtml = this._renderDialogBulkBar([
                { id: 'bulk-rename', label: 'Rename…' },
                { id: 'bulk-remove', label: 'Remove…', variant: 'danger' },
              ]);
            }

            entities = templateList.map(t => ({ id: t.entity_id, name: t.name || t.entity_id }));
          } catch (e) {
            // Fallback to simple state-based list
            entities = states.filter(s => s.entity_id.startsWith('template.'))
              .map(s => ({
                id: s.entity_id,
                name: s.attributes.friendly_name || s.entity_id,
                state: s.state
              }));
          }
        } else if (type === 'updates') {
          title = 'Pending Updates';
          color = '#ff9800';
          allowToggle = false;

          const updateEntities = states.filter(s => s.entity_id.startsWith('update.') && s.state === 'on');
          if (updateEntities.length === 0) {
            groupedHtml = '<p style="text-align:center;padding:24px;opacity:0.6">Everything is up to date!</p>';
          } else {
            const updateCards = updateEntities.map(s => {
              const inst = s.attributes.installed_version || '?';
              const latest = s.attributes.latest_version || '?';
              const releaseUrl = s.attributes.release_url || '';
              return this._renderMiniEntityCard({
                entity_id: s.entity_id,
                name: s.attributes.friendly_name || s.entity_id,
                state: latest,
                stateColor: 'var(--em-primary)',
                timeAgo: '',
                infoLine: `${this._escapeHtml(inst)} → <strong style="color:var(--em-success)">${this._escapeHtml(latest)}</strong>`,
                actionsHtml: releaseUrl
                  ? `<a href="${this._escapeAttr(releaseUrl)}" target="_blank" rel="noopener" class="em-dialog-btn em-dialog-btn-secondary">Release notes ↗</a>`
                  : '',
              });
            }).join('');
            groupedHtml = this._collGroup(`Pending Updates (${updateEntities.length})`, updateCards);
          }
          entities = updateEntities.map(s => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id }));

        } else if (type === 'unavailable') {
          title = 'Unavailable Entities';
          color = '#f44336';
          allowToggle = false;

          const unavailEntities = states.filter(s => s.state === 'unavailable');
          const unavailByDomain = {};
          unavailEntities.forEach(s => {
            const d = s.entity_id.split('.')[0];
            if (!unavailByDomain[d]) unavailByDomain[d] = [];
            unavailByDomain[d].push(s);
          });

          // Build entity rows; lastSeenMap filled in after async history fetch
          const _unavailRows = (items, lastSeenMap) => items.map(s => {
            const lsTs = lastSeenMap[s.entity_id];
            const eid = this._escapeAttr(s.entity_id);
            return this._renderMiniEntityCard({
              entity_id: s.entity_id,
              name: s.attributes.friendly_name || s.entity_id,
              state: 'unavailable',
              stateColor: 'var(--em-danger)',
              timeAgo: `Down ${this._fmtAgo(s.last_changed, 'Unknown')}`,
              infoLine: lsTs
                ? `Last seen: ${this._fmtAgo(new Date(lsTs).toISOString())}`
                : 'Last seen: unknown (>90d)',
              actionsHtml: `
                <button class="em-unavail-disable em-dialog-btn em-dialog-btn-secondary" data-entity-id="${eid}">Disable</button>
                <button class="em-unavail-remove em-dialog-btn em-dialog-btn-danger" data-entity-id="${eid}">Remove</button>`,
            });
          }).join('');

          const _buildUnavailHtml = (lastSeenMap) =>
            Object.entries(unavailByDomain).sort().map(([domain, items]) => {
              const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return this._collGroup(`${domainLabel} (${items.length})`, _unavailRows(items, lastSeenMap));
            }).join('');

          if (unavailEntities.length === 0) {
            groupedHtml = '<p style="text-align:center;padding:24px;opacity:0.6">All entities are reachable!</p>';
          } else {
            // Render immediately; patch in last-seen after history arrives
            groupedHtml = _buildUnavailHtml({});
            setTimeout(async () => {
              try {
                const hist = await this._hass.callWS({
                  type: 'history/history_during_period',
                  start_time: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                  end_time: new Date().toISOString(),
                  entity_ids: unavailEntities.map(s => s.entity_id),
                  minimal_response: true,
                  no_attributes: true,
                });
                const lastSeenMap = {};
                for (const [eid, records] of Object.entries(hist || {})) {
                  for (let i = records.length - 1; i >= 0; i--) {
                    const r = records[i];
                    const st = r.state ?? r.s;
                    if (st && st !== 'unavailable' && st !== 'unknown') {
                      lastSeenMap[eid] = r.last_changed ?? r.lu;
                      break;
                    }
                  }
                }
                if (overlay?.isConnected) {
                  const contentEl = overlay.querySelector('.confirm-dialog-box > *:not(.confirm-dialog-header):not(.confirm-dialog-actions)');
                  if (contentEl) {
                    contentEl.innerHTML = `<div class="entity-list-body">${_buildUnavailHtml(lastSeenMap)}</div>`;
                    this._reAttachCollapsibles(contentEl);
                    const _uvBody = contentEl.querySelector('.em-group-body');
                    const _uvArrow = contentEl.querySelector('.em-collapse-arrow, .em-collapsible-icon');
                    if (_uvBody) _uvBody.style.display = '';
                    if (_uvArrow) _uvArrow.style.transform = '';
                  }
                }
              } catch (e) { console.warn('[EM] history fetch unavailable', e); }
            }, 0);
          }
          entities = unavailEntities.map(s => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id }));

        } else if (type === 'orphaned') {
          title = 'Orphaned Entities (No Device)';
          color = '#ff9800';
          allowToggle = false;

          const orphanedByIntegration = {};
          (this.data || []).forEach(integration => {
            const noDevice = integration.devices['no_device'];
            if (noDevice && noDevice.entities.length > 0) {
              orphanedByIntegration[integration.integration] = noDevice.entities;
            }
          });

          if (Object.keys(orphanedByIntegration).length === 0) {
            groupedHtml = '<p style="text-align:center;padding:24px;opacity:0.6">No orphaned entities found.</p>';
          } else {
            groupedHtml = Object.entries(orphanedByIntegration).sort().map(([integ, items]) => {
              const integLabel = integ.charAt(0).toUpperCase() + integ.slice(1);
              const body = items.map(e => {
                const stateObj = this._hass?.states?.[e.entity_id];
                const currentState = stateObj ? String(stateObj.state) : null;
                return this._renderMiniEntityCard({
                  entity_id: e.entity_id,
                  name: e.original_name || e.entity_id,
                  state: e.is_disabled ? 'Disabled' : (currentState ?? 'Orphaned'),
                  stateColor: e.is_disabled ? 'var(--em-warning)' : (currentState ? 'var(--em-primary)' : 'var(--em-danger)'),
                  timeAgo: stateObj?.last_updated ? this._fmtAgo(stateObj.last_updated, 'Never') : 'Never seen',
                  infoLine: `🔌 ${this._escapeHtml(integ)}`,
                  actionsHtml: `<button class="em-dialog-btn em-dialog-btn-danger em-orphaned-remove" data-entity-id="${this._escapeAttr(e.entity_id)}">Remove</button>`,
                });
              }).join('');
              return this._collGroup(`${integLabel} (${items.length})`, body);
            }).join('');
          }
          entities = Object.values(orphanedByIntegration).flat().map(e => ({ id: e.entity_id, name: e.original_name || e.entity_id }));

          // Wire Remove button after dialog renders
          setTimeout(() => {
            if (!overlay?.isConnected) return;
            overlay.addEventListener('click', async (e) => {
              const btn = e.target.closest('.em-orphaned-remove');
              if (!btn) return;
              const entityId = btn.dataset.entityId;
              if (!confirm(`Remove ${entityId} from the entity registry?\n\nThis cannot be undone.`)) return;
              btn.disabled = true;
              btn.textContent = '…';
              try {
                const res = await this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: entityId });
                overlay.querySelector(`.em-mini-card[data-entity-id="${CSS.escape(entityId)}"]`)?.remove();
                this._showToast(`${entityId} removed${res.warning ? ' — ' + res.warning : ''}`, res.warning ? 'warning' : 'success');
                overlay.querySelectorAll('.em-group-body').forEach(body => {
                  if (!body.querySelector('.em-mini-card')) {
                    body.previousElementSibling?.remove();
                    body.remove();
                  }
                });
              } catch (err) {
                btn.disabled = false;
                btn.textContent = 'Remove';
                this._showToast('Remove failed: ' + (err.message || err), 'error');
              }
            });
          }, 0);

        } else if (type === 'health') {
          title = 'Stale Entities (No update in 30+ days)';
          color = '#ff9800';
          allowToggle = false;

          // Load dismissed map — entity_id → timestamp; dismiss hides for 30 days
          const dismissedRaw = this._loadFromStorage('em-stale-dismissed', {});
          const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          // Prune expired dismissals
          const dismissed = Object.fromEntries(
            Object.entries(dismissedRaw).filter(([, ts]) => now - ts < thirtyDaysMs)
          );

          const thirtyDaysAgo = now - thirtyDaysMs;
          const staleEntities = states.filter(s => {
            if (s.state === 'unavailable' || s.state === 'unknown') return false;
            if (!s.last_updated) return false;
            if (dismissed[s.entity_id]) return false;
            return new Date(s.last_updated).getTime() < thirtyDaysAgo;
          });

          const staleByDomain = {};
          staleEntities.forEach(s => {
            const d = s.entity_id.split('.')[0];
            if (!staleByDomain[d]) staleByDomain[d] = [];
            staleByDomain[d].push(s);
          });

          // Build a single entity row with Keep / Disable / Remove actions
          const _staleRow = (s) => this._renderMiniEntityCard({
            entity_id: s.entity_id,
            name: s.attributes?.friendly_name || s.entity_id,
            state: String(s.state),
            stateColor: 'var(--em-text-secondary)',
            timeAgo: `<span style="color:var(--em-warning)">${this._fmtAgo(s.last_updated, 'Unknown')}</span>`,
            infoLine: this._escapeHtml(s.entity_id.split('.')[0]),
            extraClass: 'em-stale-row',
            actionsHtml: `
              <button class="em-stale-keep em-dialog-btn em-dialog-btn-secondary" data-entity-id="${this._escapeAttr(s.entity_id)}" title="Hide from stale list for 30 days">Keep</button>
              <button class="em-stale-disable em-dialog-btn em-dialog-btn-warning" data-entity-id="${this._escapeAttr(s.entity_id)}" title="Disable this entity">Disable</button>
              <button class="em-stale-remove em-dialog-btn em-dialog-btn-danger" data-entity-id="${this._escapeAttr(s.entity_id)}" title="Remove from registry">Remove</button>`,
          });

          if (staleEntities.length === 0) {
            groupedHtml = '<p style="text-align:center;padding:24px;opacity:0.6">All entities are reporting regularly.</p>';
          } else {
            groupedHtml = Object.entries(staleByDomain).sort().map(([domain, items]) => {
              const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return this._collGroup(`${domainLabel} (${items.length})`, items.map(_staleRow).join(''));
            }).join('');
          }
          entities = staleEntities.map(s => ({ id: s.entity_id, name: s.attributes.friendly_name || s.entity_id }));

          // Attach stale action handlers after dialog renders
          setTimeout(() => {
            if (!overlay?.isConnected) return;
            // Helper: remove a row from dialog and decrement domain count badge
            const _removeStaleRow = (entityId) => {
              const row = overlay.querySelector(`.em-mini-card[data-entity-id="${CSS.escape(entityId)}"]`);
              if (!row) return;
              const groupBody = row.closest('.em-group-body');
              row.remove();
              if (groupBody && !groupBody.querySelector('.em-mini-card')) {
                groupBody.closest('.em-collapsible')?.nextElementSibling?.remove();
                groupBody.closest('.em-collapsible')?.remove();
              }
            };

            overlay.addEventListener('click', async (e) => {
              const keepBtn = e.target.closest('.em-stale-keep');
              const disableBtn = e.target.closest('.em-stale-disable');
              const removeBtn = e.target.closest('.em-stale-remove');
              if (!keepBtn && !disableBtn && !removeBtn) return;

              const entityId = (keepBtn || disableBtn || removeBtn).dataset.entityId;

              if (keepBtn) {
                dismissed[entityId] = Date.now();
                this._saveToStorage('em-stale-dismissed', dismissed);
                _removeStaleRow(entityId);
                this.healthCount = Math.max(0, (this.healthCount || 0) - 1);
                this._showToast(`${entityId} hidden for 30 days`, 'info');

              } else if (disableBtn) {
                disableBtn.disabled = true;
                disableBtn.textContent = '…';
                try {
                  await this._hass.callWS({ type: 'entity_manager/disable_entity', entity_id: entityId });
                  _removeStaleRow(entityId);
                  this.healthCount = Math.max(0, (this.healthCount || 0) - 1);
                  this._showToast(`${entityId} disabled`, 'success');
                } catch (err) {
                  disableBtn.disabled = false;
                  disableBtn.textContent = 'Disable';
                  this._showToast('Disable failed: ' + (err.message || err), 'error');
                }

              } else if (removeBtn) {
                if (!confirm(`Remove ${entityId} from the entity registry?\n\nThis cannot be undone.`)) return;
                removeBtn.disabled = true;
                removeBtn.textContent = '…';
                try {
                  const res = await this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: entityId });
                  _removeStaleRow(entityId);
                  this.healthCount = Math.max(0, (this.healthCount || 0) - 1);
                  this._showToast(`${entityId} removed${res.warning ? ' — ' + res.warning : ''}`, res.warning ? 'warning' : 'success');
                } catch (err) {
                  removeBtn.disabled = false;
                  removeBtn.textContent = 'Remove';
                  this._showToast('Remove failed: ' + (err.message || err), 'error');
                }
              }
            });
          }, 0);

        } else if (type === 'hacs') {
          title = '🧩 HACS Store';
          color = '#4caf50';
          allowToggle = false;

          try {
            const hacsItems = this.hacsItems || await this._hass.callWS({ type: 'entity_manager/list_hacs_items' });
            this.hacsItems = hacsItems;
            const store = hacsItems?.store || [];
            const installedNames = new Set((hacsItems?.installed_names || []).map(n => n.toLowerCase()));
            const cutoffDays = hacsItems?.cutoff_days || 7;

            // Category metadata: id matches what hacs.data uses
            const filters = [
              { id: 'all',         label: 'All' },
              { id: 'integration', label: 'Integrations' },
              { id: 'plugin',      label: 'Plugins' },
              { id: 'theme',       label: 'Themes' },
              { id: 'appdaemon',   label: 'AppDaemon' },
              { id: 'template',    label: 'Templates' },
            ];

            // Count per category
            const catCounts = {};
            store.forEach(item => {
              const cat = item.category || 'unknown';
              catCounts[cat] = (catCounts[cat] || 0) + 1;
            });
            const totalCount = store.length;
            const newCount = store.filter(i => i.new).length;
            const installedCount = store.filter(i => installedNames.has((i.name || '').toLowerCase())).length;

            const filtersHtml = filters.map(f => {
              const count = f.id === 'all' ? totalCount : (catCounts[f.id] || 0);
              return `<button class="btn btn-secondary hacs-filter-btn" data-hacs-filter="${f.id}">${this._escapeHtml(f.label)} <span style="opacity:0.7;font-size:0.85em">(${count})</span></button>`;
            }).join('');

            const summaryHtml = `
              <div class="entity-list-group" style="margin-bottom: 12px;">
                <div class="entity-list-group-title">📦 Summary</div>
                <div class="entity-list-item"><div class="entity-list-row">
                  <span class="entity-list-name">Total in Store</span>
                  <span class="entity-list-id-inline">${totalCount}</span>
                </div></div>
                <div class="entity-list-item"><div class="entity-list-row">
                  <span class="entity-list-name">Installed on this system</span>
                  <span class="entity-list-id-inline">${installedCount}</span>
                </div></div>
                <div class="entity-list-item"><div class="entity-list-row">
                  <span class="entity-list-name">New (last ${cutoffDays} days)</span>
                  <span class="entity-list-id-inline">${newCount}</span>
                </div></div>
              </div>
              <div class="entity-list-group" style="margin-bottom: 12px;">
                <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
                  <input id="hacs-search" type="search" placeholder="Search store…" autocomplete="off"
                    style="flex:1;padding:6px 10px;border-radius:6px;border:2px solid #2196f3;background:var(--em-bg-secondary,#121212);color:var(--em-text-primary,#e0e0e0);font-size:0.9em;outline:none">
                  <button class="btn btn-secondary hacs-my-downloads-btn" title="Show only installed items">
                    My Downloads (${installedCount})
                  </button>
                </div>
                <div class="entity-list-group-title" style="margin-bottom:6px">Filter by category</div>
                <div class="entity-list-row" style="gap: 8px; flex-wrap: wrap;">${filtersHtml}</div>
              </div>
            `;

            const renderStoreItem = (item) => {
              const isInstalled = installedNames.has((item.name || '').toLowerCase());
              const badges = [
                isInstalled ? `<span style="background:var(--em-success);color:#fff;padding:2px 8px;border-radius:10px;font-size:0.82em;margin-left:6px;vertical-align:middle">installed</span>` : '',
                item.new ? `<span style="background:var(--em-warning);color:#fff;padding:2px 8px;border-radius:10px;font-size:0.82em;margin-left:6px;vertical-align:middle">new</span>` : '',
              ].join('');
              const meta = [
                item.full_name ? this._escapeHtml(item.full_name) : '',
                item.downloads ? `⬇ ${item.downloads.toLocaleString()}` : '',
                item.stars ? `★ ${item.stars}` : '',
                item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '',
              ].filter(Boolean).join(' · ');
              const desc = item.description ? `<div style="font-size:0.9em;opacity:0.85;margin-top:3px;white-space:normal;line-height:1.4">${this._escapeHtml(item.description)}</div>` : '';
              return `
                <div class="entity-list-item hacs-store-item" style="cursor:pointer;padding:10px 12px"
                  data-hacs-category="${this._escapeAttr(item.category || 'unknown')}"
                  data-repo-name="${this._escapeAttr((item.name || '').toLowerCase())}"
                  data-repo-fullname="${this._escapeAttr(item.full_name || '')}"
                  data-repo-desc="${this._escapeAttr(item.description || '')}"
                  data-installed="${isInstalled ? '1' : '0'}"
                  title="Open on GitHub">
                  <div class="entity-list-row" style="flex-wrap:wrap;align-items:center">
                    <span class="entity-list-name" style="font-size:1em;font-weight:600">${this._escapeHtml(item.name)}${badges}</span>
                    <span style="font-size:0.85em;opacity:0.75;margin-top:2px;width:100%">${meta}</span>
                  </div>
                  ${desc}
                </div>
              `;
            };

            groupedHtml = `
              ${summaryHtml}
              <div class="entity-list-group">
                <div class="entity-list-group-title">🧩 HACS Store (${totalCount})</div>
                <p id="hacs-no-results" style="display:none;text-align:center;padding:12px;opacity:0.7;font-style:italic"></p>
                ${store.length ? store.map(renderStoreItem).join('') : '<p style="text-align:center;padding:12px">No store data available — check HACS is installed</p>'}
              </div>
            `;

            entities = store.map(item => ({
              id: item.full_name || item.name,
              name: item.name,
              category: item.category || 'unknown',
            }));
          } catch (e) {
            groupedHtml = `<p style="text-align:center;padding:24px;opacity:0.6">HACS store data not available.<br>Ensure HACS is installed and Home Assistant has been restarted.</p>`;
            entities = [];
          }
        } else if (type === 'lovelace') {
          title = '📊 Lovelace';
          color = '#9c27b0';
          allowToggle = false;
          try {
            // Use cached data from loadCounts or re-fetch
            let dashboardList = this.lovelaceDashboardList;
            if (!dashboardList) {
              dashboardList = await this._hass.callWS({ type: 'lovelace/dashboards/list' }) || [];
            }
            // Ensure configs are loaded
            for (const dash of dashboardList) {
              if (!dash._config) {
                try {
                  dash._config = await this._hass.callWS({ type: 'lovelace/config', url_path: dash.url_path || null });
                } catch (e) { console.warn('[EM] lovelace config fetch failed', dash.url_path, e); }
              }
            }

            // Recursively extract all card objects with their location path
            const extractAllCards = (cards, path) => {
              const out = [];
              for (const card of (cards || [])) {
                if (!card || typeof card !== 'object') continue;
                out.push({ card, path });
                if (card.cards) out.push(...extractAllCards(card.cards, path));
                if (card.card) out.push(...extractAllCards([card.card], path));
                if (card.elements) out.push(...extractAllCards(card.elements, path));
              }
              return out;
            };

            // Extract entity_ids referenced in a card config
            const extractEntities = (card) => {
              const ids = new Set();
              const add = (v) => { if (typeof v === 'string' && v.includes('.')) ids.add(v); };
              add(card.entity);
              add(card.entity_id);
              add(card.camera_image);
              (Array.isArray(card.entities) ? card.entities : []).forEach(e => {
                if (typeof e === 'string') add(e);
                else if (e?.entity) add(e.entity);
              });
              (card.conditions || []).forEach(c => { if (c) add(c.entity); });
              return [...ids];
            };

            // Build stats
            const cardTypeCount = {};
            const entityRefs = {}; // entity_id → Set of paths
            const dashboardStats = [];
            let totalCards = 0;

            for (const dash of dashboardList) {
              if (!dash._config) continue;
              const dashName = dash.title || dash.url_path || 'Overview';
              const dashUrl = dash.url_path ? `/lovelace/${dash.url_path}` : '/lovelace';
              let dashCards = 0;
              let dashViews = 0;

              for (const [vi, view] of (dash._config.views || []).entries()) {
                dashViews++;
                const viewName = view.title || view.path || `View ${vi + 1}`;
                const viewCards = [...(view.cards || [])];
                (view.sections || []).forEach(s => { if (s) viewCards.push(...(s.cards || [])); });
                const allCards = extractAllCards(viewCards, `${dashName} › ${viewName}`);
                dashCards += allCards.length;

                for (const { card, path } of allCards) {
                  const t = card.type || 'entities';
                  cardTypeCount[t] = (cardTypeCount[t] || 0) + 1;
                  extractEntities(card).forEach(eid => {
                    if (!entityRefs[eid]) entityRefs[eid] = new Set();
                    entityRefs[eid].add(path);
                  });
                }
              }
              totalCards += dashCards;
              dashboardStats.push({ name: dashName, url: dashUrl, views: dashViews, cards: dashCards });
            }

            // ── Group 1: Dashboards ──────────────────────────────────────────
            const dashHtml = dashboardStats.length ? dashboardStats.map(d => `
              <div class="entity-list-item" style="padding:9px 12px">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <span style="font-weight:600;flex:1;min-width:120px">${this._escapeHtml(d.name)}</span>
                  <span style="font-size:0.8em;opacity:0.55">${this._escapeHtml(d.url)}</span>
                  <span style="font-size:0.82em;opacity:0.75">${d.views} view${d.views !== 1 ? 's' : ''}</span>
                  <span style="font-size:0.82em;font-weight:600;color:#9c27b0">${d.cards} card${d.cards !== 1 ? 's' : ''}</span>
                  <a href="${this._escapeHtml(d.url)}" target="_blank"
                     style="font-size:0.8em;color:var(--em-primary);text-decoration:none;flex-shrink:0">Open ↗</a>
                </div>
              </div>
            `).join('') : '<p style="padding:12px;opacity:0.6">No dashboards found.</p>';

            // ── Load HACS plugin data for card type enrichment ───────────────
            const hacsData = this.hacsItems || await this._hass.callWS({ type: 'entity_manager/list_hacs_items' }).catch(() => null);
            if (hacsData) this.hacsItems = hacsData;
            const hacsInstalledNames = new Set((hacsData?.installed_names || []).map(n => n.toLowerCase()));
            const hacsPlugins = (hacsData?.store || []).filter(i => i.category === 'plugin');
            const hacsInstalled = hacsPlugins.filter(i => hacsInstalledNames.has((i.name || '').toLowerCase()));

            // Match a card type string to an installed HACS plugin
            const findHacsPlugin = (cardType) => {
              const cardSlug = cardType.replace('custom:', '').toLowerCase();
              return hacsInstalled.find(i => {
                const slug = (i.name || '').toLowerCase().replace(/[\s_]/g, '-');
                return cardSlug === slug || cardSlug.includes(slug) || slug.includes(cardSlug);
              });
            };

            // ── Group 2: Card types ──────────────────────────────────────────
            const HA_BUILTIN_CARDS = new Set([
              'alarm-panel','badge','button','calendar','camera','conditional',
              'entities','entity','entity-filter','gauge','glance','grid',
              'history-graph','horizontal-stack','humidifier','iframe','light',
              'logbook','map','markdown','media-control','picture','picture-elements',
              'picture-entity','picture-glance','plant-status','sensor',
              'shopping-list','statistics-graph','thermostat','tile','todo-list',
              'vertical-stack','weather-forecast','webpage',
              // Energy dashboard cards
              'energy-date-selection','energy-distribution','energy-gas-graph',
              'energy-grid-neutrality-gauge','energy-solar-consumed-gauge',
              'energy-solar-graph','energy-sources-table','energy-usage-graph',
              'energy-water-graph',
            ]);

            const sortedTypes = Object.entries(cardTypeCount).sort((a, b) => b[1] - a[1]);
            const maxTypeCount = sortedTypes[0]?.[1] || 1;
            let hacsInUseCount = 0;
            const cardTypeHtml = sortedTypes.length ? sortedTypes.map(([t, count]) => {
              const isCustom = t.startsWith('custom:');
              const isBuiltin = HA_BUILTIN_CARDS.has(t);
              const hacsPlugin = isCustom ? findHacsPlugin(t) : null;
              if (hacsPlugin) hacsInUseCount++;
              const barColor = isCustom ? '#ff9800' : '#9c27b0';
              const pct = Math.round((count / maxTypeCount) * 100);
              const badge = isBuiltin
                ? `<span style="font-size:0.7em;padding:1px 6px;border-radius:10px;background:#e3f2fd;color:#1565c0;font-weight:600;flex-shrink:0">built-in</span>`
                : hacsPlugin
                  ? `<span style="font-size:0.7em;padding:1px 6px;border-radius:10px;background:#e8f5e9;color:#2e7d32;font-weight:600;flex-shrink:0">HACS: ${this._escapeHtml(hacsPlugin.name)}</span>`
                  : isCustom
                    ? `<span style="font-size:0.7em;padding:1px 6px;border-radius:10px;background:#fff3e0;color:#e65100;font-weight:600;flex-shrink:0">custom</span>`
                    : `<span style="font-size:0.7em;padding:1px 6px;border-radius:10px;background:rgba(128,128,128,0.15);color:inherit;opacity:0.6;flex-shrink:0">unknown</span>`;
              return `
                <div class="entity-list-item" style="padding:7px 12px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <code style="flex:0 0 190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.83em;${isCustom ? 'color:var(--em-warning)' : ''}">${this._escapeHtml(t)}</code>
                    ${badge}
                    <div style="flex:1;background:rgba(128,128,128,0.15);border-radius:3px;height:7px">
                      <div style="background:${barColor};width:${pct}%;height:7px;border-radius:3px;min-width:3px"></div>
                    </div>
                    <span style="font-size:0.85em;font-weight:600;flex:0 0 28px;text-align:right;color:${barColor}">${count}</span>
                  </div>
                </div>`;
            }).join('') : '<p style="padding:12px;opacity:0.6">No cards found.</p>';

            // ── Group 3: Entity references ───────────────────────────────────
            const sortedRefs = Object.entries(entityRefs)
              .map(([eid, paths]) => [eid, [...paths]])
              .sort((a, b) => b[1].length - a[1].length);
            const entityRefHtml = sortedRefs.length ? sortedRefs.map(([eid, locs]) => {
              const state = this._hass.states?.[eid];
              const fname = state?.attributes?.friendly_name || '';
              const preview = locs.slice(0, 2).join(' · ');
              const more = locs.length > 2 ? ` +${locs.length - 2} more` : '';
              return `
                <div class="entity-list-item" style="padding:7px 12px">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    ${fname ? `<span style="font-weight:600">${this._escapeHtml(fname)}</span>` : ''}
                    <span style="font-size:0.82em;opacity:0.65">${this._escapeHtml(eid)}</span>
                    <span style="margin-left:auto;font-size:0.82em;font-weight:700;color:#9c27b0">${locs.length}×</span>
                  </div>
                  <div style="font-size:0.78em;opacity:0.5;margin-top:2px">${this._escapeHtml(preview)}${more}</div>
                </div>`;
            }).join('') : '<p style="padding:12px;opacity:0.6">No entity references found.</p>';

            groupedHtml = [
              `<div class="em-sug-section em-sug-naming">${this._collGroup(`🖥️ Dashboards (${dashboardStats.length})`, dashHtml)}</div>`,
              `<div class="em-sug-section em-sug-labels">${this._collGroup(`🃏 Card Types (${sortedTypes.length} types · ${totalCards} total · ${hacsInUseCount} HACS)`, cardTypeHtml)}</div>`,
              `<div class="em-sug-section em-sug-area">${this._collGroup(`🔗 Entities in Lovelace (${sortedRefs.length})`, entityRefHtml)}</div>`,
            ].join('');

            entities = new Array(totalCards).fill(null); // drives the dialog title count
          } catch (e) {
            console.error('Lovelace dialog error:', e);
            groupedHtml = `<p style="padding:20px;text-align:center;opacity:0.6">Error loading Lovelace config: ${this._escapeHtml(e.message)}</p>`;
            entities = [];
          }
        }

      // Sort by name
      entities.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
      
      const entityList = entities.filter(Boolean).map(e => `
        <div class="entity-list-item">
          <div class="entity-list-row">
            <span class="entity-list-name">${e.name}</span>
            <span class="entity-list-id-inline">${e.id}</span>
            ${e.meta ? `<span class="entity-list-id-inline">${e.meta}</span>` : ''}
            <span class="entity-list-actions">
              ${allowToggle ? `
                <button class="entity-list-toggle ${e.state === 'on' ? 'on' : 'off'}" data-entity-id="${e.id}" data-entity-type="${type}">
                  ${e.state === 'on' ? 'On' : 'Off'}
                </button>
              ` : ''}
              <button class="entity-list-action-btn info-btn" data-entity-id="${e.id}" title="Show info">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/></svg>
              </button>
              <button class="entity-list-action-btn edit-btn" data-entity-id="${e.id}" data-entity-type="${type}" title="Edit in HA">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" fill="currentColor"/></svg>
              </button>
            </span>
          </div>
        </div>
      `).join('');

      // C1: wrap groupedHtml with Suggestions-style tint section per dialog type
      const tintedGroupedHtml = (groupedHtml && EM_STAT_TINT[type])
        ? `<div class="em-sug-section ${EM_STAT_TINT[type]}">${groupedHtml}</div>`
        : groupedHtml;
      const listHtml = tintedGroupedHtml || entityList;

      const svgBack = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
      const svgRefreshEL = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
      const createBtnHtml = ['automation', 'script', 'helper'].includes(type)
        ? `<button class="btn btn-secondary" id="em-create-new-btn">+ New ${type === 'automation' ? 'Automation' : type === 'script' ? 'Script' : 'Helper'}</button>`
        : '';
      let overlay, closeDialog;
      if (inline && container) {
        // Section mode — inject into an existing container element (used by combined views)
        // Do NOT wrap in _collGroup — listHtml already contains the _collGroup from groupedHtml
        container.innerHTML = `<div class="entity-list-content">${bulkBarHtml}${listHtml || '<p style="text-align:center;padding:20px">No items found</p>'}</div>`;
        overlay = container;
        closeDialog = () => {};
        this._reAttachCollapsibles(container);
      } else if (inline) {
        // Full inline view mode — replaces #content
        const contentEl = this.content.querySelector('#content');
        // Guard: don't re-render while content is already loaded for this type
        if (contentEl.querySelector(`.em-inline-view[data-view="${CSS.escape(type)}"]`)) return;
        contentEl.innerHTML = `
          <div class="em-inline-view" data-view="${this._escapeAttr(type)}">
            <div class="em-inline-view-header">
              <button class="em-inline-back-btn">${svgBack} Back</button>
              <span class="em-inline-view-title">${this._escapeHtml(title)} <span class="em-inline-count">(${entities.length})</span></span>
              <input class="em-inline-search em-dialog-search" placeholder="Search ${this._escapeHtml(title.toLowerCase())}…">
              ${createBtnHtml}
              <button class="em-inline-refresh-btn" title="Refresh">${svgRefreshEL}</button>
            </div>
            <div class="em-inline-view-body">
              <div class="entity-list-content">
                ${bulkBarHtml}
                ${listHtml || '<p style="text-align:center;padding:20px">No items found</p>'}
              </div>
            </div>
          </div>`;
        overlay = contentEl;
        closeDialog = () => this._closeView();
        overlay.querySelector('.em-inline-back-btn').addEventListener('click', closeDialog);
        overlay.querySelector('.em-inline-refresh-btn').addEventListener('click', () => this._refreshView());
        this._reAttachCollapsibles(overlay, { expand: true });
      } else {
        const result = this.createDialog({
          title: `${title} (${entities.length})`,
          color,
          extraClass: 'entity-list-dialog',
          searchPlaceholder: `Search ${title.toLowerCase()}…`,
          contentHtml: `
            <div class="entity-list-content">
              ${bulkBarHtml}
              ${listHtml || '<p style="text-align: center; padding: 20px;">No items found</p>'}
            </div>
          `,
          actionsHtml: `<button class="btn btn-secondary" id="close-entity-list">Close</button>
            ${['automation', 'script', 'helper'].includes(type)
              ? `<button class="em-dialog-btn em-dialog-btn-secondary" id="em-create-new-btn" style="margin-left:auto">
                  + New ${type === 'automation' ? 'Automation' : type === 'script' ? 'Script' : 'Helper'}
                </button>` : ''}`
        });
        overlay = result.overlay;
        closeDialog = result.closeDialog;
        overlay.querySelector('#close-entity-list').addEventListener('click', closeDialog);
      }

      // Search bar — filter mini cards + hide empty collapsible groups
      this._attachDialogSearch(overlay);

      const createNewBtn = overlay.querySelector('#em-create-new-btn');
      if (createNewBtn) {
        createNewBtn.addEventListener('click', () => {
          if (type === 'automation') {
            closeDialog();
            history.pushState(null, '', '/config/automation/edit/new');
            window.dispatchEvent(new CustomEvent('location-changed'));
          } else if (type === 'script') {
            closeDialog();
            history.pushState(null, '', '/config/script/edit/new');
            window.dispatchEvent(new CustomEvent('location-changed'));
          } else if (type === 'helper') {
            this._showCreateHelperDialog();
          }
        });
      }

      // Collapsible group headers — only for dialog (modal) mode.
      // Both inline modes already called _reAttachCollapsibles above;
      // calling it again would add duplicate listeners that cancel each other out.
      if (!inline) {
        this._reAttachCollapsibles(overlay);
        const _firstBody = overlay.querySelector('.em-group-body');
        const _firstArrow = overlay.querySelector('.em-collapse-arrow, .em-collapsible-icon');
        if (_firstBody) _firstBody.style.display = '';
        if (_firstArrow) _firstArrow.style.transform = '';
      }

      // Bulk selection toolbar (Automations / Scripts / Helpers / Templates)
      const _bulkRemoveHandler = async (entityIds, entityNames) => {
        const preview = entityNames.slice(0, 3).join(', ') + (entityNames.length > 3 ? ` and ${entityNames.length - 3} more` : '');
        if (!confirm(`Remove ${entityIds.length} entit${entityIds.length !== 1 ? 'ies' : 'y'} from the entity registry?\n\n${preview}\n\nThis cannot be undone.`)) return;
        const results = await Promise.allSettled(
          entityIds.map(eid => this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: eid }))
        );
        let ok = 0, fail = 0;
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            overlay.querySelector(`.em-mini-card[data-entity-id="${CSS.escape(entityIds[i])}"]`)?.remove();
            ok++;
          } else {
            fail++;
          }
        });
        if (ok)   this._showToast(`Removed ${ok} entit${ok !== 1 ? 'ies' : 'y'}${fail ? `, ${fail} failed` : ''}`, fail ? 'warning' : 'success');
        if (fail) this._showToast(`${fail} could not be removed`, 'error');
        // Hide groups that are now empty
        overlay.querySelectorAll('.em-group-body').forEach(body => {
          if (!body.querySelector('.em-mini-card')) {
            body.previousElementSibling?.remove();
            body.remove();
          }
        });
      };

      const _bulkRenameHandler = (entityIds) => {
        const saved = this.selectedEntities;
        this.selectedEntities = new Set(entityIds);
        this._openBulkRenameDialog();
        this.selectedEntities = saved;
      };
      const _bulkLabelsHandler = (entityIds) => {
        const saved = this.selectedEntities;
        this.selectedEntities = new Set(entityIds);
        this._showBulkLabelEditor();
        this.selectedEntities = saved;
      };
      const _bulkAreaHandler = (entityIds) => {
        const entities = this._resolveEntitiesById(entityIds);
        this._showAreaFloorDialog('Assign area to selected', entities);
      };
      const bulkActions = {
        automation: [
          { id: 'bulk-rename', handler: _bulkRenameHandler },
          { id: 'bulk-labels', handler: _bulkLabelsHandler },
          { id: 'bulk-area',   handler: _bulkAreaHandler },
          { id: 'bulk-remove', handler: _bulkRemoveHandler },
        ],
        script: [
          { id: 'bulk-rename', handler: _bulkRenameHandler },
          { id: 'bulk-labels', handler: _bulkLabelsHandler },
          { id: 'bulk-remove', handler: _bulkRemoveHandler },
        ],
        helper: [
          { id: 'bulk-rename', handler: _bulkRenameHandler },
          { id: 'bulk-labels', handler: _bulkLabelsHandler },
          { id: 'bulk-area',   handler: _bulkAreaHandler },
          { id: 'bulk-remove', handler: _bulkRemoveHandler },
        ],
        template: [
          { id: 'bulk-rename', handler: _bulkRenameHandler },
          { id: 'bulk-remove', handler: _bulkRemoveHandler },
        ],
      };
      if (bulkActions[type]) {
        this._attachDialogBulkListeners(overlay, bulkActions[type]);
      }

      // Template entity: Edit in HA
      overlay.querySelectorAll('.em-tpl-open').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const uniqueId = btn.dataset.uniqueId;
          const entityId = btn.dataset.entityId;
          // UI-created templates have a unique_id → deep-link to helpers edit page
          // YAML-defined templates have no unique_id → open entity settings page
          const path = uniqueId
            ? `/config/helpers/edit/${uniqueId}`
            : `/config/entities/entity/${entityId}`;
          closeDialog();
          history.pushState(null, '', path);
          window.dispatchEvent(new CustomEvent('location-changed'));
        });
      });

      // Template entity: Register unique_id in YAML
      overlay.querySelectorAll('.em-tpl-register').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          btn.disabled = true;
          btn.textContent = 'Registering…';
          try {
            const result = await this._hass.callWS({
              type: 'entity_manager/register_template',
              entity_id: entityId,
            });
            if (result.success) {
              // Replace Register button with Edit button
              const editBtn = document.createElement('button');
              editBtn.className = 'em-tpl-open em-dialog-btn em-dialog-btn-primary';
              editBtn.dataset.entityId = entityId;
              editBtn.dataset.uniqueId = result.unique_id;
              editBtn.title = 'Edit in Home Assistant';
              editBtn.textContent = 'Edit';
              editBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                closeDialog();
                history.pushState(null, '', `/config/helpers/edit/${result.unique_id}`);
                window.dispatchEvent(new CustomEvent('location-changed'));
              });
              btn.replaceWith(editBtn);
              this._showToast(`Template registered in ${result.file} and reloaded.`);
            } else {
              // Auto-inject failed — show manual snippet
              const { overlay: snippetOverlay } = this.createDialog({
                title: 'Manual Registration Required',
                color: '#ff9800',
                contentHtml: `
                  <div style="display:flex;flex-direction:column;gap:12px;padding:4px 0">
                    <p style="margin:0">Could not locate the template automatically in your YAML files. Add this line inside your template definition, then reload your templates:</p>
                    <code style="display:block;padding:10px 12px;background:var(--em-bg-secondary);border-radius:6px;font-size:13px;word-break:break-all">unique_id: ${this._escapeHtml(result.unique_id)}</code>
                    <p style="margin:0;font-size:12px;color:var(--em-text-secondary)">After adding, restart HA or call <strong>template.reload</strong> from Developer Tools, then reopen this dialog — the Edit button will appear.</p>
                  </div>
                `,
                actions: [{ label: 'Copy', primary: true, id: 'copy-uid' }, { label: 'Close', id: 'close-uid' }],
              });
              snippetOverlay.querySelector('[data-action="copy-uid"]')?.addEventListener('click', () => {
                navigator.clipboard.writeText(result.unique_id).catch(() => {});
                this._showToast('unique_id copied to clipboard');
              });
              snippetOverlay.querySelector('[data-action="close-uid"]')?.addEventListener('click', () => {
                snippetOverlay.remove();
              });
              btn.disabled = false;
              btn.textContent = 'Register';
            }
          } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Register';
            this._showToast(`Registration failed: ${err.message || err}`, 'error');
          }
        });
      });

      // Template entity: Rename
      overlay.querySelectorAll('.em-tpl-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          const [domain, ...rest] = entityId.split('.');
          const currentObjectId = rest.join('.');
          const currentDisplayName = btn.dataset.currentName || '';

          const escapedDomain = this._escapeHtml(domain);
          const escapedObjectId = this._escapeHtml(currentObjectId);
          const escapedDisplayName = this._escapeHtml(currentDisplayName);

          const { overlay: editOverlay, closeDialog: closeEdit } = this.createDialog({
            title: `Edit Template Entity`,
            color: '#2196f3',
            contentHtml: `
              <div style="display:flex;flex-direction:column;gap:16px;padding:4px 0">
                <div>
                  <label style="font-size:0.85em;opacity:0.7;display:block;margin-bottom:6px">
                    Entity ID <span style="opacity:0.55">(domain: ${escapedDomain})</span>
                  </label>
                  <div style="display:flex;align-items:center;gap:4px">
                    <span style="opacity:0.55;font-size:0.9em;flex-shrink:0">${escapedDomain}.</span>
                    <input id="tpl-edit-id" type="text" value="${escapedObjectId}"
                      style="flex:1;padding:7px 10px;border:1px solid var(--em-border,#e0e0e0);border-radius:4px;font-size:0.9em;background:var(--em-bg-primary,#fff);color:var(--em-text-primary,#212121)"
                      placeholder="object_id">
                  </div>
                  <div style="font-size:0.78em;opacity:0.5;margin-top:4px">Lowercase letters, numbers and underscores only. Changing this updates references in UI automations &amp; scripts.</div>
                </div>
                <div>
                  <label style="font-size:0.85em;opacity:0.7;display:block;margin-bottom:6px">
                    Display name <span style="opacity:0.55">(optional override)</span>
                  </label>
                  <input id="tpl-edit-name" type="text" value="${escapedDisplayName}"
                    style="width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid var(--em-border,#e0e0e0);border-radius:4px;font-size:0.9em;background:var(--em-bg-primary,#fff);color:var(--em-text-primary,#212121)"
                    placeholder="Leave blank to use default">
                </div>
              </div>
            `,
            actionsHtml: `
              <button class="btn btn-secondary" id="tpl-edit-cancel">Cancel</button>
              <button class="btn btn-primary" id="tpl-edit-save">Save</button>
            `,
          });

          editOverlay.querySelector('#tpl-edit-cancel').addEventListener('click', closeEdit);
          setTimeout(() => editOverlay.querySelector('#tpl-edit-id')?.focus(), 50);

          editOverlay.querySelector('#tpl-edit-save').addEventListener('click', async () => {
            const newObjectId = editOverlay.querySelector('#tpl-edit-id').value.trim();
            const newDisplayName = editOverlay.querySelector('#tpl-edit-name').value.trim();

            if (!newObjectId) {
              this._showToast('Entity ID cannot be empty', 'error');
              return;
            }
            if (!/^[a-z0-9_]+$/.test(newObjectId)) {
              this._showToast('Entity ID: only lowercase letters, numbers, underscores', 'error');
              return;
            }

            const newEntityId = `${domain}.${newObjectId}`;
            const saveBtn = editOverlay.querySelector('#tpl-edit-save');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving…';

            let idChanged = false;
            try {
              if (newEntityId !== entityId) {
                await this._hass.callWS({
                  type: 'entity_manager/rename_entity',
                  old_entity_id: entityId,
                  new_entity_id: newEntityId,
                });
                idChanged = true;
              }

              const targetId = idChanged ? newEntityId : entityId;
              if (newDisplayName !== currentDisplayName) {
                await this._hass.callWS({
                  type: 'entity_manager/update_entity_display_name',
                  entity_id: targetId,
                  name: newDisplayName || null,
                });
                this._pushUndoAction({ type: 'display_name_change', entityId: targetId, oldName: currentDisplayName, newName: newDisplayName });
              }

              // Update YAML config files if entity_id changed
              let yamlResult = null;
              if (idChanged) {
                saveBtn.textContent = 'Updating YAML…';
                try {
                  yamlResult = await this._hass.callWS({
                    type: 'entity_manager/update_yaml_references',
                    old_entity_id: entityId,
                    new_entity_id: newEntityId,
                  });
                } catch (yamlErr) {
                  console.warn('YAML update failed:', yamlErr);
                  yamlResult = { total_replacements: 0, files_updated: [], errors: [{ file: '?', error: yamlErr.message }] };
                }
              }

              closeEdit();

              // Update the row in the parent dialog
              const itemEl = btn.closest('.entity-list-item');
              if (itemEl) {
                if (idChanged) {
                  const idEl = itemEl.querySelector('.entity-list-id-inline');
                  if (idEl) idEl.textContent = newEntityId;
                  btn.dataset.entityId = newEntityId;
                  const removeBtn = itemEl.querySelector('.em-tpl-remove');
                  if (removeBtn) removeBtn.dataset.entityId = newEntityId;
                }
                const nameEl = itemEl.querySelector('.entity-list-name');
                if (nameEl) nameEl.firstChild.textContent = newDisplayName || (idChanged ? newEntityId : entityId);
                btn.dataset.currentName = newDisplayName;
              }

              // Build a meaningful toast message
              if (idChanged && yamlResult) {
                const fileCount = yamlResult.files_updated.length;
                const replCount = yamlResult.total_replacements;
                const errCount = yamlResult.errors.length;
                let msg = `Renamed to ${newEntityId}.`;
                if (replCount > 0) {
                  msg += ` Updated ${replCount} reference${replCount !== 1 ? 's' : ''} in ${fileCount} YAML file${fileCount !== 1 ? 's' : ''}.`;
                } else {
                  msg += ' No YAML references found.';
                }
                if (errCount > 0) msg += ` ⚠️ ${errCount} file error(s) — check logs.`;
                this._showToast(msg, replCount > 0 ? 'success' : 'info', 6000);
              } else {
                this._showToast(`Saved ${idChanged ? newEntityId : entityId}`, 'success');
              }

              if (idChanged) this.loadCounts();
            } catch (err) {
              console.error('Edit template entity error:', err);
              saveBtn.disabled = false;
              saveBtn.textContent = 'Save';
              this.showErrorDialog(`Failed to update: ${err.message}`);
            }
          });
        });
      });

      // Template entity: Remove
      overlay.querySelectorAll('.em-tpl-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          if (!confirm(`Remove template entity "${entityId}"?\n\nThis cannot be undone.`)) return;
          btn.disabled = true;
          try {
            const result = await this._hass.callWS({
              type: 'entity_manager/remove_entity',
              entity_id: entityId,
            });
            if (result.warning) {
              this._showToast(result.warning, 'warning', 6000);
            }
            // Remove the item row from the dialog
            const itemEl = btn.closest('.entity-list-item');
            if (itemEl) itemEl.remove();
            this._showToast(`Removed ${entityId}`, 'success');
            // Refresh counts
            this.loadCounts();
          } catch (err) {
            console.error('Remove error:', err);
            this.showErrorDialog(`Failed to remove ${entityId}: ${err.message}`);
          } finally {
            btn.disabled = false;
          }
        });
      });

      if (allowToggle) {
        overlay.querySelectorAll('.entity-list-toggle').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const entityId = btn.dataset.entityId;
            const currentlyOn = btn.classList.contains('on');

            btn.disabled = true;
            btn.style.opacity = '0.7';
            try {
              await this._hass.callService('homeassistant', 'toggle', {
                entity_id: entityId
              });
              const nextOn = !currentlyOn;
              btn.classList.toggle('on', nextOn);
              btn.classList.toggle('off', !nextOn);
              btn.textContent = nextOn ? 'On' : 'Off';
            } catch (error) {
              console.error('Error toggling entity:', error);
              this.showErrorDialog(`Error toggling ${entityId}: ${error.message}`);
            } finally {
              btn.disabled = false;
              btn.style.opacity = '';
            }
          });
        });
      }

      // HACS store: search + category filter + My Downloads + item click
      const hacsFilterButtons = overlay.querySelectorAll('.hacs-filter-btn');
      const hacsSearchInput = overlay.querySelector('#hacs-search');
      const hacsMyDownloadsBtn = overlay.querySelector('.hacs-my-downloads-btn');

      {
        let activeCatFilter = 'all';
        let myDownloadsOnly = false;

        const noResultsEl = overlay.querySelector('#hacs-no-results');

        const applyHacsFilters = () => {
          const items = overlay.querySelectorAll('.hacs-store-item');
          const term = (hacsSearchInput?.value || '').toLowerCase().trim();
          let visibleCount = 0;

          items.forEach(item => {
            const category = item.dataset.hacsCategory || 'unknown';
            const isInstalled = item.dataset.installed === '1';

            const catOk = activeCatFilter === 'all' || category === activeCatFilter;
            const installedOk = !myDownloadsOnly || isInstalled;
            // Search against all visible text in the item — name, full_name, description, meta
            const searchOk = !term || item.textContent.toLowerCase().includes(term);

            const show = catOk && installedOk && searchOk;
            item.style.display = show ? '' : 'none';
            if (show) visibleCount++;
          });

          // Show/hide no-results message
          if (noResultsEl) {
            noResultsEl.style.display = items.length > 0 && visibleCount === 0 ? '' : 'none';
            if (term) noResultsEl.textContent = `No results for "${term}"`;
          }

          // Update active state on filter buttons
          hacsFilterButtons.forEach(btn => {
            btn.classList.toggle('btn-primary', btn.dataset.hacsFilter === activeCatFilter);
            btn.classList.toggle('btn-secondary', btn.dataset.hacsFilter !== activeCatFilter);
          });
          if (hacsMyDownloadsBtn) {
            hacsMyDownloadsBtn.classList.toggle('btn-primary', myDownloadsOnly);
            hacsMyDownloadsBtn.classList.toggle('btn-secondary', !myDownloadsOnly);
          }
        };

        // Category filter buttons
        hacsFilterButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            activeCatFilter = btn.dataset.hacsFilter || 'all';
            applyHacsFilters();
          });
        });

        // My Downloads toggle
        if (hacsMyDownloadsBtn) {
          hacsMyDownloadsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            myDownloadsOnly = !myDownloadsOnly;
            applyHacsFilters();
          });
        }

        // Live search — instant, no debounce; also covers the clear-X button on type="search"
        if (hacsSearchInput) {
          hacsSearchInput.addEventListener('input', () => applyHacsFilters());
          hacsSearchInput.addEventListener('search', () => applyHacsFilters());
          hacsSearchInput.addEventListener('click', e => e.stopPropagation());
        }

        // Click item → flash highlight, open GitHub repo in new tab
        overlay.addEventListener('click', (e) => {
          const item = e.target.closest('.hacs-store-item');
          if (!item) return;
          e.stopPropagation();
          const fullName = item.dataset.repoFullname;

          // Flash highlight for visual feedback
          item.style.transition = 'background 0.15s ease';
          item.style.background = 'rgba(33,150,243,0.35)';
          setTimeout(() => { item.style.background = ''; item.style.transition = ''; }, 400);

          if (fullName) {
            window.open(`https://github.com/${fullName}`, '_blank', 'noopener');
          }
        });

        applyHacsFilters();
      }

      // Rename (automation / script / helper)
      overlay.querySelectorAll('.em-entity-rename').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          const currentName = btn.dataset.currentName || '';
          const { overlay: rnOverlay, closeDialog: closeRename } = this.createDialog({
            title: 'Rename',
            color: 'var(--em-primary)',
            contentHtml: `
              <div style="padding:4px 0">
                <label style="font-size:0.85em;opacity:0.7;display:block;margin-bottom:6px">Display name</label>
                <input id="em-rename-input" type="text" value="${this._escapeHtml(currentName)}"
                  style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--em-border,#e0e0e0);border-radius:4px;font-size:0.95em;background:var(--em-bg-primary,#fff);color:var(--em-text-primary,#212121)"
                  placeholder="Enter display name">
                <p style="font-size:0.82em;opacity:0.6;margin-top:8px">${this._escapeHtml(entityId)}</p>
              </div>`,
            actionsHtml: `<button class="btn btn-secondary" id="em-rename-cancel">Cancel</button>
                          <button class="btn btn-primary" id="em-rename-save">Save</button>`,
          });
          const input = rnOverlay.querySelector('#em-rename-input');
          input.focus(); input.select();
          const doSave = async () => {
            const newName = input.value.trim();
            try {
              await this._hass.callWS({
                type: 'entity_manager/update_entity_display_name',
                entity_id: entityId,
                name: newName || null,
              });
              this._pushUndoAction({ type: 'display_name_change', entityId, oldName: currentName, newName });
              btn.dataset.currentName = newName;
              const row = btn.closest('.entity-list-item');
              if (row) {
                const nameEl = row.querySelector('.entity-list-name');
                if (nameEl) nameEl.childNodes[0].textContent = newName || entityId;
              }
              closeRename();
              this._showToast(`Renamed to "${newName || entityId}"`, 'success');
            } catch (err) {
              this._showToast(`Rename failed: ${err.message}`, 'error');
            }
          };
          rnOverlay.querySelector('#em-rename-cancel').addEventListener('click', closeRename);
          rnOverlay.querySelector('#em-rename-save').addEventListener('click', doSave);
          input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') doSave();
            if (ev.key === 'Escape') closeRename();
          });
        });
      });

      // Remove (automation / script / helper)
      overlay.querySelectorAll('.em-entity-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          const domain = entityId.split('.')[0];
          const nameEl = btn.closest('.entity-list-item')?.querySelector('.entity-list-name');
          const displayName = nameEl?.childNodes[0]?.textContent?.trim() || entityId;

          if (!confirm(`Remove "${displayName}"?\n\n${entityId}\n\nThis cannot be undone.`)) return;

          btn.disabled = true;
          try {
            // Get unique_id from entity registry
            const reg = await this._hass.callWS({ type: 'config/entity_registry/list' });
            const entry = reg.find(r => r.entity_id === entityId);
            const uniqueId = entry?.unique_id;
            if (!uniqueId) {
              throw new Error('Entity has no unique ID — it may be YAML-defined and must be removed there.');
            }

            let wsCmd;
            if (domain === 'automation') {
              wsCmd = { type: 'config/automation/delete', automation_id: uniqueId };
            } else if (domain === 'script') {
              wsCmd = { type: 'config/script/delete', script_id: uniqueId };
            } else if (['input_boolean','input_number','input_text','input_select',
                        'input_datetime','input_button'].includes(domain)) {
              wsCmd = { type: `${domain}/delete`, [`${domain}_id`]: uniqueId };
            } else if (domain === 'counter') {
              wsCmd = { type: 'counter/delete', counter_id: uniqueId };
            } else if (domain === 'timer') {
              wsCmd = { type: 'timer/delete', timer_id: uniqueId };
            } else {
              throw new Error(`Removal of "${domain}" entities is not supported from this panel.`);
            }

            await this._hass.callWS(wsCmd);
            btn.closest('.entity-list-item')?.remove();
            this._showToast(`Removed ${entityId}`, 'success');
            this.loadCounts();
          } catch (err) {
            console.error('Remove error:', err);
            this._showToast(`Remove failed: ${err.message}`, 'error', 6000);
          } finally {
            btn.disabled = false;
          }
        });
      });

      // Edit buttons - navigate to HA's edit page
      overlay.querySelectorAll('.entity-list-action-btn.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          const entityType = btn.dataset.entityType;
          let editPath = '';

          if (entityType === 'automation' || entityType === 'script') {
            // HA editor URLs use the automation/script unique_id (UUID), not the entity object_id
            try {
              const reg = await this._hass.callWS({ type: 'config/entity_registry/list' });
              const entry = reg.find(r => r.entity_id === entityId);
              const uniqueId = entry?.unique_id;
              if (uniqueId) {
                editPath = entityType === 'automation'
                  ? `/config/automation/edit/${encodeURIComponent(uniqueId)}`
                  : `/config/script/edit/${encodeURIComponent(uniqueId)}`;
              } else {
                // YAML-defined — no unique_id, fall back to list page
                editPath = entityType === 'automation'
                  ? '/config/automation/dashboard'
                  : '/config/script/dashboard';
                this._showToast(`This ${entityType} is YAML-defined — opening the list instead.`, 'info', 4000);
              }
            } catch {
              editPath = entityType === 'automation'
                ? '/config/automation/dashboard'
                : '/config/script/dashboard';
            }
          } else if (entityType === 'helper') {
            // Helpers don't have individual edit URLs in HA — editing is dialog-based on the helpers page.
            // Template helpers have their own page; everything else goes to /config/helpers.
            const domain = entityId.split('.')[0];
            editPath = domain === 'template' ? '/config/template' : '/config/helpers';
          }

          if (editPath) {
            closeDialog();
            history.pushState(null, '', editPath);
            window.dispatchEvent(new CustomEvent('location-changed'));
          }
        });
      });

      // Unavailable: Disable
      overlay.querySelectorAll('.em-unavail-disable').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          btn.disabled = true;
          try {
            await this._hass.callWS({ type: 'entity_manager/disable_entity', entity_id: entityId });
            btn.closest('.entity-list-item')?.remove();
            this._showToast(`Disabled ${entityId}`, 'success');
            this.loadCounts();
          } catch (err) {
            this._showToast(`Failed: ${err.message}`, 'error', 5000);
          } finally { btn.disabled = false; }
        });
      });

      // Unavailable: Remove
      overlay.querySelectorAll('.em-unavail-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const entityId = btn.dataset.entityId;
          if (!confirm(`Remove "${entityId}" from the entity registry?\n\nThis cannot be undone.`)) return;
          btn.disabled = true;
          try {
            await this._hass.callWS({ type: 'entity_manager/remove_entity', entity_id: entityId });
            btn.closest('.entity-list-item')?.remove();
            this._showToast(`Removed ${entityId}`, 'success');
            this.loadCounts();
          } catch (err) {
            this._showToast(`Failed: ${err.message}`, 'error', 5000);
          } finally { btn.disabled = false; }
        });
      });

    } catch (error) {
      console.error('Error loading entity list:', error);
      this.showErrorDialog(`Error loading ${title}: ${error.message}`);
    }
  }

  createDialog({ title, color, contentHtml, actionsHtml, extraClass = '', searchPlaceholder = '' }) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';
    overlay.setAttribute('data-theme', this.getAttribute('data-theme') || 'light');
    // Copy --em-* variables from the panel's inline style to the overlay so that
    // dialogs (appended to document.body, outside the panel's cascade) resolve
    // the correct colours when EM light mode is active with HA dark theme.
    [
      '--em-bg-primary', '--em-bg-secondary', '--em-bg-hover',
      '--em-text-primary', '--em-text-secondary', '--em-text-disabled',
      '--em-border', '--em-border-light',
      '--em-primary', '--em-primary-dark', '--em-primary-light',
      '--em-success', '--em-danger', '--em-warning',
    ].forEach(v => {
      const val = this.style.getPropertyValue(v);
      if (val) overlay.style.setProperty(v, val);
    });
    overlay.innerHTML = `
      <div class="confirm-dialog-box ${this._escapeAttr(extraClass)}">
        <div class="confirm-dialog-header"${color ? ` style="border-color: ${this._escapeAttr(color)};"` : ''}>
          <h2${color ? ` style="color: ${this._escapeAttr(color)};"` : ''}>${this._escapeHtml(title)}</h2>
          ${searchPlaceholder ? `<input id="em-stat-search" type="search" class="em-stat-search-input em-header-search" placeholder="${this._escapeAttr(searchPlaceholder)}" autocomplete="off">` : ''}
        </div>
        ${contentHtml}
        <div class="confirm-dialog-actions">
          ${actionsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('em-dialog-open');

    const closeDialog = () => {
      document.body.classList.remove('em-dialog-open');
      overlay.remove();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
        return;
      }
      const linkBtn = e.target.closest('[data-open-path],[data-open-entity]');
      if (linkBtn) {
        e.stopPropagation();
        closeDialog();
        if (linkBtn.dataset.openPath) {
          history.pushState(null, '', linkBtn.dataset.openPath);
          window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
        } else {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            detail: { entityId: linkBtn.dataset.openEntity },
            bubbles: true,
            composed: true,
          }));
        }
      }
    });

    return { overlay, closeDialog };
  }

  showErrorDialog(message) {
    this._fireEvent('hass-notification', {
      message,
      action: {
        action: 'dismiss',
        text: 'Dismiss',
      },
    });
  }

  showConfirmDialog(title, message, onConfirm) {
    const { overlay, closeDialog } = this.createDialog({
      title,
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="confirm-dialog-content">
          <p>${this._escapeHtml(message)}</p>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary confirm-no">No</button>
        <button class="btn btn-primary confirm-yes">Yes</button>
      `
    });

    const yesBtn = overlay.querySelector('.confirm-yes');
    const noBtn = overlay.querySelector('.confirm-no');

    yesBtn.addEventListener('click', () => {
      closeDialog();
      onConfirm();
    });

    noBtn.addEventListener('click', closeDialog);
  }

  _showGroupEditorDialog(existingGroup = null) {
    const isEdit = !!existingGroup;
    // Live selection set — synced from checkboxes, persists across search re-renders
    const selected = new Set(existingGroup?.entityIds || []);

    const buildTree = (filterText = '') => {
      const ft = filterText.toLowerCase();
      let html = '';
      const sortedIntegrations = [...(this.data || [])].sort((a, b) => a.integration.localeCompare(b.integration));
      for (const integration of sortedIntegrations) {
        const intName = integration.integration;
        let devHtml = '';
        let intTotal = 0;
        const sortedDevices = Object.entries(integration.devices || {}).sort(([keyA], [keyB]) =>
          this.getDeviceName(keyA).localeCompare(this.getDeviceName(keyB)));
        for (const [devKey, dev] of sortedDevices) {
          const devName = devKey === 'no_device' ? 'Orphan Entities' : this.getDeviceName(devKey);
          let entHtml = '';
          let devTotal = 0;
          const sortedEntities = [...(dev.entities || [])].sort((a, b) => a.entity_id.localeCompare(b.entity_id));
          for (const ent of sortedEntities) {
            const eid = ent.entity_id;
            const dispName = ent.original_name || '';
            if (ft && !eid.toLowerCase().includes(ft) && !dispName.toLowerCase().includes(ft) &&
                !devName.toLowerCase().includes(ft) && !intName.toLowerCase().includes(ft)) continue;
            const chk = selected.has(eid) ? 'checked' : '';
            entHtml += `<label class="cgd-ent-row">
              <input type="checkbox" class="cgd-ent-cb" data-eid="${this._escapeAttr(eid)}" ${chk}>
              <span class="cgd-ent-id">${this._escapeHtml(eid)}</span>
              ${dispName ? `<span class="cgd-ent-name">${this._escapeHtml(dispName)}</span>` : ''}
            </label>`;
            devTotal++;
          }
          if (!entHtml) continue;
          intTotal += devTotal;
          devHtml += `<div class="cgd-dev-block">
            <div class="cgd-dev-hdr">
              <input type="checkbox" class="cgd-dev-cb">
              <span class="cgd-arrow">▶</span>
              <span class="cgd-dev-name">${this._escapeHtml(devName)}</span>
              <span class="cgd-cnt">${devTotal}</span>
            </div>
            <div class="cgd-dev-body" style="display:none">${entHtml}</div>
          </div>`;
        }
        if (!devHtml) continue;
        html += `<div class="cgd-int-block">
          <div class="cgd-int-hdr">
            <input type="checkbox" class="cgd-int-cb">
            <span class="cgd-arrow">▶</span>
            <span class="cgd-int-name">${this._escapeHtml(intName)}</span>
            <span class="cgd-cnt">${intTotal}</span>
          </div>
          <div class="cgd-int-body" style="display:none">${devHtml}</div>
        </div>`;
      }
      return html || `<div style="padding:16px;text-align:center;color:var(--em-text-secondary);font-style:italic">No entities found</div>`;
    };

    const { overlay, closeDialog } = this.createDialog({
      title: isEdit ? `Edit: ${existingGroup.name}` : 'New Group',
      color: 'var(--em-primary)',
      contentHtml: `<div class="cgd-wrap">
        <input type="text" class="cgd-name-input" id="cgd-name" placeholder="Group name…"
          value="${isEdit ? this._escapeAttr(existingGroup.name) : ''}">
        <input type="text" class="cgd-search-input" id="cgd-search" placeholder="🔍 Filter integrations, devices, entities…">
        <div class="cgd-tree" id="cgd-tree">${buildTree()}</div>
      </div>`,
      actionsHtml: `
        <button class="btn btn-secondary" id="cgd-cancel">Cancel</button>
        <span id="cgd-sel-count" style="font-size:12px;color:var(--em-text-secondary);margin:0 8px;white-space:nowrap"></span>
        <button class="btn" id="cgd-save" style="background:var(--em-primary);color:#fff;border:none">
          ${isEdit ? 'Save Changes' : 'Create Group'}
        </button>
      `
    });

    const treeEl = overlay.querySelector('#cgd-tree');
    const searchInput = overlay.querySelector('#cgd-search');
    const nameInput = overlay.querySelector('#cgd-name');
    const selCountEl = overlay.querySelector('#cgd-sel-count');

    const updateCount = () => { selCountEl.textContent = `${selected.size} selected`; };

    const syncDevCb = devBlock => {
      const cb = devBlock.querySelector('.cgd-dev-cb');
      const ents = devBlock.querySelectorAll('.cgd-ent-cb');
      const n = [...ents].filter(c => c.checked).length;
      cb.indeterminate = n > 0 && n < ents.length;
      cb.checked = ents.length > 0 && n === ents.length;
    };

    const syncIntCb = intBlock => {
      const cb = intBlock.querySelector('.cgd-int-cb');
      const ents = intBlock.querySelectorAll('.cgd-ent-cb');
      const n = [...ents].filter(c => c.checked).length;
      cb.indeterminate = n > 0 && n < ents.length;
      cb.checked = ents.length > 0 && n === ents.length;
    };

    const initState = () => {
      treeEl.querySelectorAll('.cgd-dev-block').forEach(syncDevCb);
      treeEl.querySelectorAll('.cgd-int-block').forEach(syncIntCb);
      updateCount();
    };
    initState();

    treeEl.addEventListener('click', e => {
      const intHdr = e.target.closest('.cgd-int-hdr');
      const devHdr = e.target.closest('.cgd-dev-hdr');
      if (intHdr && e.target.tagName !== 'INPUT') {
        const body = intHdr.nextElementSibling;
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : '';
        intHdr.querySelector('.cgd-arrow').textContent = open ? '▶' : '▼';
      }
      if (devHdr && e.target.tagName !== 'INPUT') {
        const body = devHdr.nextElementSibling;
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : '';
        devHdr.querySelector('.cgd-arrow').textContent = open ? '▶' : '▼';
      }
    });

    treeEl.addEventListener('change', e => {
      const t = e.target;
      if (t.classList.contains('cgd-int-cb')) {
        const intBlock = t.closest('.cgd-int-block');
        intBlock.querySelectorAll('.cgd-ent-cb').forEach(cb => {
          cb.checked = t.checked;
          if (t.checked) selected.add(cb.dataset.eid); else selected.delete(cb.dataset.eid);
        });
        intBlock.querySelectorAll('.cgd-dev-cb').forEach(cb => { cb.checked = t.checked; cb.indeterminate = false; });
        t.indeterminate = false;
      } else if (t.classList.contains('cgd-dev-cb')) {
        const devBlock = t.closest('.cgd-dev-block');
        devBlock.querySelectorAll('.cgd-ent-cb').forEach(cb => {
          cb.checked = t.checked;
          if (t.checked) selected.add(cb.dataset.eid); else selected.delete(cb.dataset.eid);
        });
        t.indeterminate = false;
        syncIntCb(t.closest('.cgd-int-block'));
      } else if (t.classList.contains('cgd-ent-cb')) {
        if (t.checked) selected.add(t.dataset.eid); else selected.delete(t.dataset.eid);
        syncDevCb(t.closest('.cgd-dev-block'));
        syncIntCb(t.closest('.cgd-int-block'));
      }
      updateCount();
    });

    let debounce;
    searchInput.addEventListener('input', () => {
      // Persist visible checkbox state into `selected` before re-render
      treeEl.querySelectorAll('.cgd-ent-cb').forEach(cb => {
        if (cb.checked) selected.add(cb.dataset.eid); else selected.delete(cb.dataset.eid);
      });
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        treeEl.innerHTML = buildTree(searchInput.value);
        if (searchInput.value.trim()) {
          treeEl.querySelectorAll('.cgd-int-body,.cgd-dev-body').forEach(b => { b.style.display = ''; });
          treeEl.querySelectorAll('.cgd-arrow').forEach(a => { a.textContent = '▼'; });
        }
        initState();
      }, 200);
    });

    overlay.querySelector('#cgd-save').addEventListener('click', () => {
      // Sync final visible state
      treeEl.querySelectorAll('.cgd-ent-cb').forEach(cb => {
        if (cb.checked) selected.add(cb.dataset.eid); else selected.delete(cb.dataset.eid);
      });
      const name = nameInput.value.trim();
      if (!name) { this._showToast('Enter a group name', 'warning'); nameInput.focus(); return; }
      const entityIds = [...selected];
      if (!entityIds.length) { this._showToast('Select at least one entity', 'warning'); return; }

      if (isEdit) {
        this.customGroups = this.customGroups.map(g => g.id === existingGroup.id ? { ...g, name, entityIds } : g);
      } else {
        this.customGroups = [...(this.customGroups || []), { id: `cg-${Date.now()}`, name, entityIds }];
      }
      localStorage.setItem('em-custom-groups', JSON.stringify(this.customGroups));
      this._setSmartGroupMode('custom');
      closeDialog();
      this._reRenderSidebar();
      this.updateView();
      this._showToast(isEdit ? `Group "${name}" updated` : `Group "${name}" created with ${entityIds.length} entit${entityIds.length !== 1 ? 'ies' : 'y'}`, 'success');
    });

    overlay.querySelector('#cgd-cancel').addEventListener('click', closeDialog);
    nameInput.focus();
  }

  _showPromptDialog(title, message, defaultValue, onSubmit) {
    const { overlay, closeDialog } = this.createDialog({
      title,
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="confirm-dialog-content">
          <p>${this._escapeHtml(message)}</p>
          <input type="text" class="rename-input" id="prompt-dialog-input" value="${this._escapeAttr(defaultValue || '')}" style="margin-top: 8px;">
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary confirm-no">Cancel</button>
        <button class="btn btn-primary confirm-yes">OK</button>
      `
    });

    const input = overlay.querySelector('#prompt-dialog-input');
    const yesBtn = overlay.querySelector('.confirm-yes');
    const noBtn = overlay.querySelector('.confirm-no');

    input.focus();
    input.select();

    const submit = () => {
      const value = input.value.trim();
      closeDialog();
      if (value) onSubmit(value);
    };

    yesBtn.addEventListener('click', submit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submit();
    });
    noBtn.addEventListener('click', closeDialog);
  }

  showRenameDialog(entityId) {
    const { overlay, closeDialog } = this.createDialog({
      title: 'Rename Entity',
      color: 'var(--em-primary)',
      contentHtml: `
        <div class="confirm-dialog-content">
          <p style="margin-bottom: 12px;">Current Entity ID: <strong>${this._escapeHtml(entityId)}</strong></p>
          <p style="margin-bottom: 8px; color: #666;">Enter new entity ID (without domain prefix):</p>
          <input type="text" id="rename-input" class="rename-input" placeholder="new_entity_name" value="${this._escapeAttr(entityId.split('.')[1])}" pattern="[a-z0-9_]+" title="Only lowercase letters, numbers, and underscores">
          <p style="margin-top: 8px; font-size: 14px; color:var(--em-danger);">⚠️ This will update the entity ID across all automations, scripts, and helpers.</p>
        </div>
      `,
      actionsHtml: `
        <button class="btn btn-secondary confirm-no">Cancel</button>
        <button class="btn btn-primary confirm-yes">Rename</button>
      `
    });

    const input = overlay.querySelector('#rename-input');
    const yesBtn = overlay.querySelector('.confirm-yes');
    const noBtn = overlay.querySelector('.confirm-no');

    input.focus();
    input.select();

    const performRename = async () => {
      const newName = input.value.trim();
      if (!newName) {
        this.showErrorDialog('Please enter a valid entity name');
        return;
      }

      if (!/^[a-z0-9_]+$/.test(newName)) {
        this.showErrorDialog('Entity name can only contain lowercase letters, numbers, and underscores');
        return;
      }

      const domain = entityId.split('.')[0];
      const newEntityId = `${domain}.${newName}`;

      if (newEntityId === entityId) {
        closeDialog();
        return;
      }

      // Dry-run: scan YAML for references before committing
      yesBtn.disabled = true;
      yesBtn.textContent = 'Checking…';
      try {
        const preview = await this._hass.callWS({
          type: 'entity_manager/update_yaml_references',
          old_entity_id: entityId,
          new_entity_id: newEntityId,
          dry_run: true,
        });

        if (preview.total_replacements === 0) {
          // No YAML references — rename immediately
          closeDialog();
          await this.renameEntity(entityId, newEntityId);
          return;
        }

        // Show preview in-place inside the dialog before confirming
        const content = overlay.querySelector('.confirm-dialog-content');
        const fileRows = preview.files_updated.map(f =>
          `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(128,128,128,.1)">
             <span style="font-size:12px;font-family:monospace">${this._escapeHtml(f.file)}</span>
             <span style="font-size:11px;color:var(--secondary-text-color)">${f.replacements} ref${f.replacements !== 1 ? 's' : ''}</span>
           </div>`).join('');
        content.innerHTML = `
          <p style="margin-bottom:8px">Rename <strong>${this._escapeHtml(entityId)}</strong> → <strong>${this._escapeHtml(newEntityId)}</strong></p>
          <div class="em-rename-preview-box">
            <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--em-warning)">
              ${preview.total_replacements} reference${preview.total_replacements !== 1 ? 's' : ''} in ${preview.files_updated.length} file${preview.files_updated.length !== 1 ? 's' : ''} will be updated:
            </div>
            <div style="max-height:180px;overflow-y:auto">${fileRows}</div>
          </div>
          <p style="font-size:12px;opacity:0.7">Confirm to rename the entity and update all references.</p>
        `;
        yesBtn.disabled = false;
        yesBtn.textContent = 'Confirm Rename';

        // Replace the click handler to commit on next click
        const newHandler = async () => {
          yesBtn.disabled = true;
          yesBtn.textContent = 'Renaming…';
          closeDialog();
          await this.renameEntity(entityId, newEntityId);
        };
        yesBtn.replaceWith(yesBtn.cloneNode(true)); // Remove old listeners
        overlay.querySelector('.confirm-yes').addEventListener('click', newHandler);

      } catch (e) {
        // dry_run failed (old HA?) — proceed without preview
        console.warn('[EM] dry-run failed, proceeding without preview', e);
        closeDialog();
        await this.renameEntity(entityId, newEntityId);
      }
    };

    yesBtn.addEventListener('click', performRename);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performRename();
      }
    });

    noBtn.addEventListener('click', closeDialog);
  }

  async renameEntity(oldEntityId, newEntityId, skipUndo = false) {
    try {
      await this._hass.callWS({
        type: 'entity_manager/rename_entity',
        old_entity_id: oldEntityId,
        new_entity_id: newEntityId,
      });
      
      // Push undo action and log activity (skip when called from undo/redo)
      if (!skipUndo) {
        this._pushUndoAction({
          type: 'rename',
          oldId: oldEntityId,
          newId: newEntityId
        });
        this._logActivity('rename', { from: oldEntityId, to: newEntityId });
      }
      
      this._fireEvent('hass-notification', {
        message: `Entity renamed from ${oldEntityId} to ${newEntityId}`,
      });
      
      await this.loadData();
    } catch (error) {
      console.error('Error renaming entity:', error);
      this.showErrorDialog(`Error renaming entity: ${error.message}`);
    }
  }
}

customElements.define('entity-manager-panel', EntityManagerPanel);
