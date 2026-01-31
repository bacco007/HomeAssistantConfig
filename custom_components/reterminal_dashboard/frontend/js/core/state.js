// Imports removed - using global scope
// deepClone from helpers.js
// emit, EVENTS from events.js
// DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, ORIENTATIONS from constants.js

class StateStore {
    constructor() {
        this.state = {
            pages: [],
            currentPageIndex: 0,
            selectedWidgetIds: [],
            clipboardWidgets: [],

            // Current layout ID (for multi-layout support)
            currentLayoutId: "reterminal_e1001",

            // Device Settings
            deviceName: "Layout 1",
            deviceModel: "reterminal_e1001",
            settings: {
                orientation: ORIENTATIONS.LANDSCAPE,
                dark_mode: false,
                sleep_enabled: false,
                sleep_start_hour: 0,
                sleep_end_hour: 5,
                manual_refresh_only: false,
                deep_sleep_enabled: false,
                deep_sleep_interval: 600,
                daily_refresh_enabled: false,
                daily_refresh_time: "08:00",
                no_refresh_start_hour: null,
                no_refresh_end_hour: null,
                editor_light_mode: false,
                grid_opacity: 8,
                device_model: "reterminal_e1001", // Ensure it's in settings too for consistency
                ai_provider: "gemini",
                ai_api_key_gemini: "",
                ai_api_key_openai: "",
                ai_api_key_openrouter: "",
                ai_model_gemini: "gemini-1.5-flash",
                ai_model_openai: "gpt-4o",
                ai_model_openrouter: "",
                ai_model_filter: "",
                extended_latin_glyphs: false, // Enable GF_Latin_Core glyphset for diacritics (ľščťž, etc.)
                auto_cycle_enabled: false,
                auto_cycle_interval_s: 30,
                refresh_interval: 600
            },

            // Editor State
            snapEnabled: true,
            showGrid: true,
            zoomLevel: 1.0,

            // Cache
            widgetsById: new Map()
        };

        this.historyStack = [];
        this.historyIndex = -1;

        // Initialize with default page
        this.reset();

        // Sync global
        if (this.state.settings.device_model) {
            window.currentDeviceModel = this.state.settings.device_model;
        }

        // Listen for internal state changes to trigger local storage save
        on(EVENTS.STATE_CHANGED, () => {
            if (!hasHaBackend()) {
                this.saveToLocalStorage();
            }
        });

        // Load AI keys from dedicated local storage
        this.loadAIKeysFromLocalStorage();
    }

    reset() {
        this.state.pages = [{
            id: "page_0",
            name: "Overview",
            layout: null,  // null = absolute positioning, "4x4" = grid shorthand
            widgets: []
        }];
        this.state.currentPageIndex = 0;
        this.rebuildWidgetsIndex();
        this.recordHistory();
    }

    // --- Getters ---

    get pages() { return this.state.pages; }
    get currentPageIndex() { return this.state.currentPageIndex; }
    get selectedWidgetId() { return this.state.selectedWidgetIds[0] || null; }
    get selectedWidgetIds() { return this.state.selectedWidgetIds; }
    get settings() { return this.state.settings; }
    get deviceName() { return this.state.deviceName; }
    get deviceModel() { return this.state.deviceModel; }
    get currentLayoutId() { return this.state.currentLayoutId; }
    get snapEnabled() { return this.state.snapEnabled; }
    get showGrid() { return this.state.showGrid; }
    get zoomLevel() { return this.state.zoomLevel; }

    getCurrentPage() {
        return this.state.pages[this.state.currentPageIndex] || this.state.pages[0];
    }

    getWidgetById(id) {
        return this.state.widgetsById.get(id);
    }

    getSelectedWidget() {
        return this.state.selectedWidgetIds.length > 0 ? this.getWidgetById(this.state.selectedWidgetIds[0]) : null;
    }

    getSelectedWidgets() {
        return this.state.selectedWidgetIds.map(id => this.getWidgetById(id)).filter(w => !!w);
    }

    getCanvasDimensions() {
        const model = this.state.deviceModel || this.state.settings.device_model || "reterminal_e1001";
        const profile = (window.DEVICE_PROFILES && window.DEVICE_PROFILES[model]) ? window.DEVICE_PROFILES[model] : null;

        let width = this.state.settings.width || 800; // Default width
        let height = this.state.settings.height || 480; // Default height
        let customRes = !!(this.state.settings.width && this.state.settings.height);

        if (profile && !customRes) {
            if (profile.resolution) {
                width = profile.resolution.width;
                height = profile.resolution.height;
            } else if (profile.display_config) {
                let foundWidth = null;
                let foundHeight = null;

                const parseDim = (line) => {
                    const parts = line.split(":");
                    if (parts.length === 2) return parseInt(parts[1].trim(), 10);
                    return null;
                };

                for (const line of profile.display_config) {
                    if (line.includes("width:")) foundWidth = parseDim(line);
                    if (line.includes("height:")) foundHeight = parseDim(line);
                }

                if (foundWidth && foundHeight) {
                    width = foundWidth;
                    height = foundHeight;
                }
            }

            if (width === 800 && height === 480) {
                if (model.includes("2432s028")) { width = 320; height = 240; }
                else if (model.includes("4827s032r")) { width = 480; height = 272; }
            }
        }

        if (this.state.settings.orientation === ORIENTATIONS.PORTRAIT) {
            return { width: Math.min(width, height), height: Math.max(width, height) };
        } else {
            return { width: Math.max(width, height), height: Math.min(width, height) };
        }
    }

    getCanvasShape() {
        if (this.state.settings.shape) return this.state.settings.shape;
        const model = this.state.deviceModel || this.state.settings.device_model || "reterminal_e1001";
        const profile = (window.DEVICE_PROFILES && window.DEVICE_PROFILES[model]) ? window.DEVICE_PROFILES[model] : null;
        return profile?.shape || "rect";
    }

    getPagesPayload() {
        const settings = { ...this.state.settings };

        // SECURITY: Explictly remove AI API keys from the payload and settings
        // These keys are stored separately in dedicated localStorage and should
        // never be part of a JSON export or Home Assistant backend save.
        Object.keys(settings).forEach(key => {
            if (key.startsWith('ai_api_key_')) {
                delete settings[key];
            }
        });

        return {
            pages: this.state.pages,
            ...settings
        };
    }

    getSettings() {
        return this.state.settings;
    }

    setSettings(newSettings) {
        this.updateSettings(newSettings);
    }

    /**
     * Saves the current layout state to browser localStorage.
     */
    saveToLocalStorage() {
        try {
            const payload = this.getPagesPayload();
            localStorage.setItem('esphome-designer-layout', JSON.stringify(payload));
            // console.log("[StateStore] State saved to localStorage");
        } catch (e) {
            console.warn("[StateStore] Failed to save to localStorage:", e);
        }
    }

    /**
     * Loads the layout state from browser localStorage.
     * @returns {Object|null} The loaded layout or null if not found.
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('esphome-designer-layout');
            if (data) {
                const layout = JSON.parse(data);
                console.log("[StateStore] State loaded from localStorage");
                return layout;
            }
        } catch (e) {
            console.warn("[StateStore] Failed to load from localStorage:", e);
        }
        return null;
    }

    /**
     * Saves sensitive AI API keys to a dedicated localStorage key.
     * These keys are never included in layout exports.
     */
    saveAIKeysToLocalStorage() {
        try {
            const keys = {};
            Object.keys(this.state.settings).forEach(key => {
                if (key.startsWith('ai_api_key_')) {
                    keys[key] = this.state.settings[key];
                }
            });
            localStorage.setItem('esphome-designer-ai-keys', JSON.stringify(keys));
        } catch (e) {
            console.warn("[StateStore] Failed to save AI keys to localStorage:", e);
        }
    }

    /**
     * Loads sensitive AI API keys from the dedicated localStorage key.
     */
    loadAIKeysFromLocalStorage() {
        try {
            const data = localStorage.getItem('esphome-designer-ai-keys');
            if (data) {
                const keys = JSON.parse(data);
                this.state.settings = { ...this.state.settings, ...keys };
                console.log("[StateStore] AI keys loaded from local storage");
            }
        } catch (e) {
            console.warn("[StateStore] Failed to load AI keys from localStorage:", e);
        }
    }

    // --- Actions ---

    setPages(pages) {
        this.state.pages = pages;
        this.rebuildWidgetsIndex();
        emit(EVENTS.STATE_CHANGED);
    }

    setCurrentPageIndex(index) {
        if (index >= 0 && index < this.state.pages.length) {
            this.state.currentPageIndex = index;
            this.state.selectedWidgetIds = []; // Deselect on page change
            emit(EVENTS.PAGE_CHANGED, { index });
            emit(EVENTS.SELECTION_CHANGED, { widgetIds: [] });
        }
    }

    selectWidget(widgetId, multi = false) {
        if (multi) {
            const idx = this.state.selectedWidgetIds.indexOf(widgetId);
            if (idx === -1) {
                if (widgetId) this.state.selectedWidgetIds.push(widgetId);
            } else {
                this.state.selectedWidgetIds.splice(idx, 1);
            }
        } else {
            this.state.selectedWidgetIds = widgetId ? [widgetId] : [];
        }
        emit(EVENTS.SELECTION_CHANGED, { widgetIds: this.state.selectedWidgetIds });
    }

    selectWidgets(widgetIds) {
        this.state.selectedWidgetIds = widgetIds || [];
        emit(EVENTS.SELECTION_CHANGED, { widgetIds: this.state.selectedWidgetIds });
    }

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };

        // If any AI API keys were updated, save them to dedicated local storage
        const hasAIKeys = Object.keys(newSettings).some(key => key.startsWith('ai_api_key_'));
        if (hasAIKeys) {
            this.saveAIKeysToLocalStorage();
        }

        emit(EVENTS.SETTINGS_CHANGED, this.state.settings);
        emit(EVENTS.STATE_CHANGED);
    }

    setDeviceName(name) {
        this.state.deviceName = name;
        this.state.settings.device_name = name;
        emit(EVENTS.SETTINGS_CHANGED, { deviceName: name });
        this.updateLayoutIndicator();
    }

    setDeviceModel(model) {
        this.state.deviceModel = model;
        // Sync global for canvas rounding logic
        window.currentDeviceModel = model;
        emit(EVENTS.SETTINGS_CHANGED, { deviceModel: model });
        this.updateLayoutIndicator();
    }

    setCurrentLayoutId(layoutId) {
        this.state.currentLayoutId = layoutId;
        console.log("[AppState] Current layout ID set to:", layoutId);
        // Update the UI indicator
        this.updateLayoutIndicator();
    }

    updateLayoutIndicator() {
        const nameEl = document.getElementById('currentLayoutName');
        const deviceEl = document.getElementById('currentLayoutDevice');
        if (nameEl) {
            nameEl.textContent = this.state.deviceName || this.state.currentLayoutId || "Unknown";
        }
        if (deviceEl) {
            const model = this.state.deviceModel || this.state.settings?.device_model || "";
            if (model.includes("e1002")) {
                deviceEl.textContent = "(E1002)";
            } else if (model.includes("e1001")) {
                deviceEl.textContent = "(E1001)";
            } else {
                deviceEl.textContent = "";
            }
        }
    }

    setSnapEnabled(enabled) {
        this.state.snapEnabled = enabled;
        emit(EVENTS.SETTINGS_CHANGED, { snapEnabled: enabled });
    }

    setShowGrid(enabled) {
        this.state.showGrid = enabled;
        emit(EVENTS.SETTINGS_CHANGED, { showGrid: enabled });
    }

    setZoomLevel(level) {
        // Clamp zoom level between 10% and 300%
        this.state.zoomLevel = Math.max(0.1, Math.min(3.0, level));
        emit(EVENTS.ZOOM_CHANGED, { zoomLevel: this.state.zoomLevel });
    }

    // --- Widget Operations ---

    addWidget(widget) {
        const page = this.getCurrentPage();
        page.widgets.push(widget);
        this.state.widgetsById.set(widget.id, widget);
        this.recordHistory();
        emit(EVENTS.STATE_CHANGED);  // Update YAML first
        this.selectWidget(widget.id);  // Then highlight it
    }

    updateWidget(widgetId, updates) {
        const widget = this.getWidgetById(widgetId);
        if (widget) {
            Object.assign(widget, updates);
            emit(EVENTS.STATE_CHANGED);
        }
    }

    updateWidgets(widgetIds, updates) {
        let changed = false;
        for (const id of widgetIds) {
            const widget = this.getWidgetById(id);
            if (widget) {
                Object.assign(widget, updates);
                changed = true;
            }
        }
        if (changed) {
            emit(EVENTS.STATE_CHANGED);
        }
    }

    deleteWidget(widgetId) {
        let idsToDelete = (widgetId && !this.state.selectedWidgetIds.includes(widgetId))
            ? [widgetId]
            : [...this.state.selectedWidgetIds];

        if (idsToDelete.length === 0) return;

        // Filter out locked widgets
        const totalRequested = idsToDelete.length;
        idsToDelete = idsToDelete.filter(id => {
            const w = this.getWidgetById(id);
            return w && !w.locked;
        });

        const skippedCount = totalRequested - idsToDelete.length;
        if (skippedCount > 0 && typeof showToast === 'function') {
            showToast(`${skippedCount} locked widget(s) cannot be deleted`, "warning");
        }

        if (idsToDelete.length === 0) return;

        const page = this.getCurrentPage();
        let changed = false;

        for (const id of idsToDelete) {
            const idx = page.widgets.findIndex(w => w.id === id);
            if (idx !== -1) {
                page.widgets.splice(idx, 1);
                this.state.widgetsById.delete(id);
                changed = true;
            }
        }

        if (changed) {
            this.state.selectedWidgetIds = [];
            this.recordHistory();
            emit(EVENTS.STATE_CHANGED);
            emit(EVENTS.SELECTION_CHANGED, { widgetIds: [] });
        }
    }

    copyWidget() {
        if (this.state.selectedWidgetIds.length > 0) {
            this.state.clipboardWidgets = this.getSelectedWidgets().map(w => deepClone(w));
            console.log("Copied widgets:", this.state.clipboardWidgets.length);
        }
    }

    pasteWidget() {
        if (this.state.clipboardWidgets && this.state.clipboardWidgets.length > 0) {
            const newIds = [];
            const page = this.getCurrentPage();
            const dims = this.getCanvasDimensions();

            for (const copiedWidget of this.state.clipboardWidgets) {
                const newWidget = deepClone(copiedWidget);
                newWidget.id = "w_" + Date.now() + "_" + Math.floor(Math.random() * 1000) + "_" + Math.floor(Math.random() * 100);

                // Initial offset
                newWidget.x += 20;
                newWidget.y += 20;

                // Smart Cascade: Prevent exact overlap with existing widgets
                let attempts = 0;
                const maxAttempts = 50;

                while (attempts < maxAttempts) {
                    const collision = page.widgets.some(w =>
                        Math.abs(w.x - newWidget.x) < 10 && Math.abs(w.y - newWidget.y) < 10
                    );
                    if (!collision) break;
                    newWidget.x += 20;
                    newWidget.y += 20;
                    attempts++;
                }

                // Ensure it fits on canvas
                if (newWidget.x + newWidget.width > dims.width) newWidget.x = Math.max(0, dims.width - newWidget.width);
                if (newWidget.y + newWidget.height > dims.height) newWidget.y = Math.max(0, dims.height - newWidget.height);

                page.widgets.push(newWidget);
                this.state.widgetsById.set(newWidget.id, newWidget);
                newIds.push(newWidget.id);
            }

            if (newIds.length > 0) {
                this.recordHistory();
                emit(EVENTS.STATE_CHANGED);
                this.selectWidgets(newIds);
            }
        }
    }

    // --- History (Undo/Redo) ---

    recordHistory() {
        // Deep copy state for history
        const snapshot = {
            pages: deepClone(this.state.pages),
            settings: deepClone(this.state.settings),
            deviceName: this.state.deviceName
        };

        // Deduplicate
        if (this.historyIndex >= 0) {
            const lastSnapshot = this.historyStack[this.historyIndex];
            if (JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) {
                return;
            }
        }

        // Truncate future
        if (this.historyIndex < this.historyStack.length - 1) {
            this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
        }

        this.historyStack.push(snapshot);
        this.historyIndex++;

        // Limit stack
        if (this.historyStack.length > 50) {
            this.historyStack.shift();
            this.historyIndex--;
        }

        emit(EVENTS.HISTORY_CHANGED, { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreSnapshot(this.historyStack[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.historyStack.length - 1) {
            this.historyIndex++;
            this.restoreSnapshot(this.historyStack[this.historyIndex]);
        }
    }

    canUndo() { return this.historyIndex > 0; }
    canRedo() { return this.historyIndex < this.historyStack.length - 1; }

    restoreSnapshot(snapshot) {
        this.state.pages = deepClone(snapshot.pages);
        this.state.settings = deepClone(snapshot.settings);
        this.state.deviceName = snapshot.deviceName;

        this.rebuildWidgetsIndex();

        // Validate current page index
        if (this.state.currentPageIndex >= this.state.pages.length) {
            this.state.currentPageIndex = 0;
        }

        this.state.selectedWidgetIds = [];
        emit(EVENTS.STATE_CHANGED);
        emit(EVENTS.SELECTION_CHANGED, { widgetIds: [] });
        emit(EVENTS.HISTORY_CHANGED, { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }

    // --- Internal ---

    rebuildWidgetsIndex() {
        this.state.widgetsById.clear();
        for (const page of this.state.pages) {
            for (const w of page.widgets) {
                this.state.widgetsById.set(w.id, w);
            }
        }
    }
}

const AppState = new StateStore();
window.AppState = AppState;
