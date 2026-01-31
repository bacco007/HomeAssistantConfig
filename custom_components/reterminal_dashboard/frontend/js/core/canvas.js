// Imports removed - using global scope
// AppState from state.js
// on, EVENTS from events.js
// SNAP_DISTANCE from constants.js
// getColorStyle from device.js
// FeatureRegistry from feature_registry.js

class Canvas {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.canvasContainer = document.getElementById("canvasContainer");
        this.viewport = document.querySelector(".canvas-viewport");
        this.dragState = null;
        this.panX = 0;
        this.panY = 0;

        // Touch state for mobile devices
        this.touchState = null;    // Single-touch widget drag state
        this.pinchState = null;    // Two-finger pinch/pan state
        this.lastTapTime = 0;      // Double-tap detection

        // Bind handlers once for proper removal
        this._boundMouseMove = this._onMouseMove.bind(this);
        this._boundMouseUp = this._onMouseUp.bind(this);
        this._boundTouchMove = this._onTouchMove.bind(this);
        this._boundTouchEnd = this._onTouchEnd.bind(this);

        this.init();
    }

    init() {
        // Subscribe to events
        on(EVENTS.STATE_CHANGED, () => this.render());
        on(EVENTS.PAGE_CHANGED, () => this.render());
        on(EVENTS.SELECTION_CHANGED, () => this.render());
        on(EVENTS.SETTINGS_CHANGED, () => {
            this.render();
            this.applyZoom();
        });
        on(EVENTS.ZOOM_CHANGED, () => this.applyZoom());

        this.setupPanning();
        this.setupInteractions();
        this.setupZoomControls();
        this.setupDragAndDrop();
        this.setupTouchInteractions();
        this.render();
        this.applyZoom();

        // Start a 1-second interval to update time-dependent widgets (like datetime)
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            // SKIP auto-render during active interaction to prevent DOM detachment
            if (this.touchState || this.pinchState || this.dragState || this.panState) return;

            // Only re-render if there is a datetime widget on the current page to avoid unnecessary overhead
            const page = AppState.getCurrentPage();
            if (page && page.widgets.some(w => w.type === 'datetime')) {
                this.render();
            }
        }, 1000);
    }

    render() {
        if (!this.canvas) return;

        const page = AppState.getCurrentPage();
        const existingGrid = this.canvas.querySelector(".canvas-grid");
        const existingGuides = this.canvas.querySelectorAll(".snap-guide");

        this.canvas.innerHTML = "";

        // Ensure grid exists if enabled
        if (AppState.showGrid) {
            let grid = existingGrid;
            if (!grid) {
                grid = document.createElement("div");
                grid.className = "canvas-grid";
            }
            this.canvas.appendChild(grid);
        }

        existingGuides.forEach((g) => this.canvas.appendChild(g));

        // Apply orientation/size
        const dims = AppState.getCanvasDimensions();
        this.canvas.style.width = `${dims.width}px`;
        this.canvas.style.height = `${dims.height}px`;

        // Apply device shape (e.g. round)
        const shape = AppState.getCanvasShape();

        if (shape === "round") {
            this.canvas.style.borderRadius = "50%";
            this.canvas.style.overflow = "hidden";
            this.canvas.style.boxShadow = "0 0 0 10px rgba(0,0,0,0.1)"; // Optional: hint at the bezel
        } else {
            this.canvas.style.borderRadius = "0";
            this.canvas.style.overflow = "visible";
            this.canvas.style.boxShadow = "none";
        }

        // Apply dark mode/theme
        if (AppState.settings.editor_light_mode) {
            this.canvas.classList.add("light-mode");
        } else {
            this.canvas.classList.remove("light-mode");
        }

        // Apply black background mode for canvas preview (per-page overrides global)
        const effectiveDarkMode = this.getEffectiveDarkMode();
        if (effectiveDarkMode) {
            this.canvas.classList.add("dark");
        } else {
            this.canvas.classList.remove("dark");
        }

        // Render LVGL grid overlay if page has grid layout
        if (page && page.layout && /^\d+x\d+$/.test(page.layout)) {
            this._renderLvglGridOverlay(page.layout, dims, effectiveDarkMode);
        }

        if (!page) return;

        for (const widget of page.widgets) {
            const el = document.createElement("div");
            el.className = "widget";
            el.style.left = widget.x + "px";
            el.style.top = widget.y + "px";
            el.style.width = widget.width + "px";
            el.style.height = widget.height + "px";
            el.dataset.id = widget.id;

            if (AppState.selectedWidgetIds.includes(widget.id)) {
                el.classList.add("active");
            }

            if (widget.locked) {
                el.classList.add("locked");
            }

            const type = (widget.type || "").toLowerCase();

            // Feature Registry Integration - use window.FeatureRegistry for global access
            const feature = window.FeatureRegistry ? window.FeatureRegistry.get(type) : null;
            if (feature && feature.render) {
                feature.render(el, widget, { getColorStyle });
                this._addResizeHandle(el);
                this.canvas.appendChild(el);
                continue;
            } else if (window.FeatureRegistry) {
                // If not found, try to load it asynchronously
                window.FeatureRegistry.load(type).then(loadedFeature => {
                    if (loadedFeature) {
                        console.log(`[Canvas] Feature '${type}' loaded, triggering re-render.`);
                        this.render();
                    }
                });

                // Debug: log when falling back to legacy
                console.warn(`[Canvas] No FeatureRegistry render for type '${type}', using legacy while loading...`);
            } else {
                console.error(`[Canvas] FeatureRegistry not defined on window!`);
            }

            // Legacy Rendering Logic
            this._renderLegacyWidget(el, widget);

            this._addResizeHandle(el);
            this.canvas.appendChild(el);
        }
    }

    /**
     * Determines the effective dark mode for the current page.
     * Per-page setting overrides global setting.
     * @returns {boolean} true if dark mode should be active
     */
    getEffectiveDarkMode() {
        const page = AppState.getCurrentPage();
        const pageDarkMode = page?.dark_mode;

        // "inherit" or undefined = use global setting
        // "dark" = force dark mode
        // "light" = force light mode
        if (pageDarkMode === "dark") return true;
        if (pageDarkMode === "light") return false;
        return !!AppState.settings.dark_mode;
    }

    /**
     * Renders LVGL grid overlay on canvas when page has grid layout.
     * @param {string} layout - Grid layout string like "4x4"
     * @param {Object} dims - Canvas dimensions {width, height}
     * @param {boolean} isDark - Whether dark mode is active
     */
    _renderLvglGridOverlay(layout, dims, isDark) {
        const match = layout.match(/^(\d+)x(\d+)$/);
        if (!match) return;

        const rows = parseInt(match[1], 10);
        const cols = parseInt(match[2], 10);
        const cellWidth = dims.width / cols;
        const cellHeight = dims.height / rows;

        // Create grid container
        const gridOverlay = document.createElement("div");
        gridOverlay.className = "lvgl-grid-overlay";
        gridOverlay.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            display: grid;
            grid-template-rows: repeat(${rows}, 1fr);
            grid-template-columns: repeat(${cols}, 1fr);
            pointer-events: none;
            z-index: 1;
        `;

        const lineColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
        const labelColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";

        // Create grid cells with labels
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement("div");
                cell.style.cssText = `
                    border: 1px dashed ${lineColor};
                    position: relative;
                    box-sizing: border-box;
                `;

                // Add label in top-left corner
                const label = document.createElement("span");
                label.textContent = `${r},${c}`;
                label.style.cssText = `
                    position: absolute;
                    top: 2px; left: 4px;
                    font-size: 10px;
                    color: ${labelColor};
                    font-family: monospace;
                    pointer-events: none;
                `;
                cell.appendChild(label);
                gridOverlay.appendChild(cell);
            }
        }

        this.canvas.appendChild(gridOverlay);
    }

    _addResizeHandle(el) {
        const handle = document.createElement("div");
        handle.className = "widget-resize-handle";

        // Make handle larger/easier to grab for lines
        // We can check if the element has specific classes or just apply general styles
        // Since this is a generic method, we might want to ensure the CSS handles it, 
        // but we can also add inline styles if needed for specific cases.
        // For now, let's rely on the CSS class but maybe ensure it's positioned well.

        el.appendChild(handle);
    }


    _renderLegacyWidget(el, widget) {
        const type = widget.type;
        const props = widget.props || {};

        // Common Styles
        el.style.opacity = (props.opacity !== undefined ? props.opacity : 100) / 100;

        if (type === "shape_rect") {
            // Migrated to features/shape_rect/render.js
        }
        else if (type === "shape_circle") {
            // Migrated to features/shape_circle/render.js
        }
        else if (type === "line") {
            // Migrated to features/line/render.js
        }

        else if (type === "datetime") {
            // Migrated to features/datetime/render.js
        }
        /*
        else {
            // Migrated to features/text/render.js
        }
        */

        else if (type === "icon") {
            // Migrated to features/icon/render.js
        }
        else if (type === "battery_icon") {
            // Migrated to features/battery_icon/render.js
        }
        else if (type === "weather_icon") {
            // Migrated to features/weather_icon/render.js
        }
        else if (type === "image") {
            // Migrated to features/image/render.js
        }
        else if (type === "online_image") {
            // Migrated to features/online_image/render.js
        }
        else if (type === "progress_bar") {
            // Migrated to features/progress_bar/render.js
        }
        else if (type === "touch_area") {
            // Migrated to features/touch_area/render.js
        }
        else if (type === "graph") {
            // Migrated to features/graph/render.js
        }
        else if (type === "lvgl_label") {
            // Migrated to features/lvgl_label/render.js
        }
        else if (type === "lvgl_line") {
            // Migrated to features/lvgl_line/render.js
        }
        else if (type === "lvgl_meter") {
            const range = 270;
            const endAngle = startAngle + range;

            const toRad = (deg) => deg * (Math.PI / 180);

            // 1. Draw Scale (Arc)
            // Arc path
            const startRad = toRad(startAngle);
            const endRad = toRad(endAngle);

            // Calculate arc points
            const arcR = r - Math.max(scaleWidth, tickLength) / 2; // Inset slightly

            const x1 = cx + arcR * Math.cos(startRad);
            const y1 = cy + arcR * Math.sin(startRad);
            const x2 = cx + arcR * Math.cos(endRad);
            const y2 = cy + arcR * Math.sin(endRad);

            const d = `M ${x1} ${y1} A ${arcR} ${arcR} 0 1 1 ${x2} ${y2}`;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            path.style.fill = "none";
            path.style.stroke = props.color || "black";
            path.style.strokeWidth = `${scaleWidth}px`;
            path.style.strokeLinecap = "round";
            svg.appendChild(path);

            // 2. Draw Ticks
            if (tickCount > 1) {
                const tickGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                tickGroup.style.stroke = props.color || "black";
                tickGroup.style.strokeWidth = "2px";

                for (let i = 0; i < tickCount; i++) {
                    const pct = i / (tickCount - 1);
                    const angle = startAngle + (range * pct);
                    const rad = toRad(angle);

                    const tx1 = cx + (arcR - scaleWidth / 2) * Math.cos(rad);
                    const ty1 = cy + (arcR - scaleWidth / 2) * Math.sin(rad);
                    const tx2 = cx + (arcR - scaleWidth / 2 - 10) * Math.cos(rad); // 10px tick length default
                    const ty2 = cy + (arcR - scaleWidth / 2 - 10) * Math.sin(rad);

                    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    tick.setAttribute("x1", tx1);
                    tick.setAttribute("y1", ty1);
                    tick.setAttribute("x2", tx2);
                    tick.setAttribute("y2", ty2);
                    tickGroup.appendChild(tick);
                }
                svg.appendChild(tickGroup);
            }

            // 3. Draw Needle
            const pct = Math.max(0, Math.min(1, (val - min) / (max - min)));
            const needleAngle = startAngle + (range * pct);
            const needleRad = toRad(needleAngle);

            const nx = cx + (arcR - 10) * Math.cos(needleRad);
            const ny = cy + (arcR - 10) * Math.sin(needleRad);

            const needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
            needle.setAttribute("x1", cx);
            needle.setAttribute("y1", cy);
            needle.setAttribute("x2", nx);
            needle.setAttribute("y2", ny);
            needle.style.stroke = props.indicator_color || "red";
            needle.style.strokeWidth = `${indicatorWidth}px`;
            needle.style.strokeLinecap = "round";
            svg.appendChild(needle);

            // Center pivot
            const pivot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pivot.setAttribute("cx", cx);
            pivot.setAttribute("cy", cy);
            pivot.setAttribute("r", indicatorWidth); // Match pivot to needle width roughly
            pivot.style.fill = props.indicator_color || "red";
            svg.appendChild(pivot);

            el.appendChild(svg);
        }
        else {
            el.textContent = `Unknown: ${type}`;
            el.style.border = "1px solid red";
        }
    }

    setupInteractions() {
        this.canvas.addEventListener("mousedown", (ev) => {
            if (ev.button !== 0) return; // Only handle left-click for widgets

            const widgetEl = ev.target.closest(".widget");
            const rect = this.canvas.getBoundingClientRect();
            const zoom = AppState.zoomLevel;

            if (widgetEl) {
                const widgetId = widgetEl.dataset.id;
                const isShift = ev.shiftKey;

                // If shift is held, toggle selection. Otherwise, if the clicked widget isn't already 
                // part of the selection, make it the sole selection.
                if (isShift) {
                    AppState.selectWidget(widgetId, true);
                } else if (!AppState.selectedWidgetIds.includes(widgetId)) {
                    AppState.selectWidget(widgetId, false);
                }

                const widget = AppState.getWidgetById(widgetId);
                if (!widget) return;

                const isResizeHandle = ev.target.classList.contains("widget-resize-handle");

                if (isResizeHandle) {
                    if (widget.locked) return; // Prevent resize if locked
                    this.dragState = {
                        mode: "resize",
                        id: widgetId,
                        startX: ev.clientX,
                        startY: ev.clientY,
                        startW: widget.width,
                        startH: widget.height
                    };
                } else {
                    if (widget.locked) return; // Prevent move if locked

                    // Capture start positions for all selected widgets
                    const selectedWidgets = AppState.getSelectedWidgets();
                    const widgetOffsets = selectedWidgets.map(w => ({
                        id: w.id,
                        startX: w.x,
                        startY: w.y,
                        // Offset relative to the initial click point
                        clickOffsetX: (ev.clientX - rect.left) / zoom - w.x,
                        clickOffsetY: (ev.clientY - rect.top) / zoom - w.y
                    }));

                    this.dragState = {
                        mode: "move",
                        id: widgetId,
                        widgets: widgetOffsets
                    };
                }

                window.addEventListener("mousemove", this._boundMouseMove);
                window.addEventListener("mouseup", this._boundMouseUp);
                ev.preventDefault();
            } else {
                // Clicked on canvas background - release focus from inputs (e.g. YAML box)
                if (document.activeElement) {
                    document.activeElement.blur();
                }

                // Clicked on canvas background - start lasso
                const startX = (ev.clientX - rect.left) / zoom;
                const startY = (ev.clientY - rect.top) / zoom;

                this.lassoState = {
                    startX,
                    startY,
                    rect: null
                };

                // Create lasso element
                this.lassoEl = document.createElement("div");
                this.lassoEl.className = "lasso-selection";
                this.canvas.appendChild(this.lassoEl);

                window.addEventListener("mousemove", this._boundMouseMove);
                window.addEventListener("mouseup", this._boundMouseUp);
                ev.preventDefault();
            }
        });
    }

    setupPanning() {
        if (!this.viewport) return;

        this.viewport.addEventListener("mousedown", (ev) => {
            if (ev.button === 1) { // Middle button
                ev.preventDefault();
                ev.stopPropagation();

                this.panState = {
                    startX: ev.clientX,
                    startY: ev.clientY,
                    startPanX: this.panX,
                    startPanY: this.panY
                };

                this.viewport.style.cursor = "grabbing";
                document.body.classList.add("panning-active");

                const onPanningMove = (moveEv) => {
                    if (this.panState) {
                        const dx = moveEv.clientX - this.panState.startX;
                        const dy = moveEv.clientY - this.panState.startY;
                        this.panX = this.panState.startPanX + dx;
                        this.panY = this.panState.startPanY + dy;
                        this.applyZoom();
                    }
                };

                const onPanningUp = () => {
                    this.panState = null;
                    this.viewport.style.cursor = "auto";
                    document.body.classList.remove("panning-active");
                    window.removeEventListener("mousemove", onPanningMove);
                    window.removeEventListener("mouseup", onPanningUp);
                };

                window.addEventListener("mousemove", onPanningMove);
                window.addEventListener("mouseup", onPanningUp);
            }
        });
    }

    setupZoomControls() {
        // Zoom buttons
        const zoomInBtn = document.getElementById("zoomInBtn");
        const zoomOutBtn = document.getElementById("zoomOutBtn");
        const zoomResetBtn = document.getElementById("zoomResetBtn");
        const gridOpacityInput = document.getElementById("editorGridOpacity");

        if (zoomInBtn) {
            zoomInBtn.addEventListener("click", () => this.zoomIn());
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener("click", () => this.zoomOut());
        }
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener("click", () => this.zoomReset());
        }
        if (gridOpacityInput) {
            gridOpacityInput.addEventListener("input", (e) => {
                AppState.updateSettings({ grid_opacity: parseInt(e.target.value, 10) });
            });
        }

        // Mouse wheel zoom on canvas container
        // Differentiates between mouse wheel (zoom) and touchpad scroll (pan)
        if (this.canvasContainer) {
            this.canvasContainer.addEventListener("wheel", (ev) => {
                ev.preventDefault();

                // Detect pinch-to-zoom (Ctrl+wheel on trackpads or Ctrl+scroll on mouse)
                if (ev.ctrlKey) {
                    // Pinch zoom: deltaY is inverted, scale more smoothly
                    const delta = ev.deltaY > 0 ? -0.05 : 0.05;
                    const newZoom = AppState.zoomLevel + delta;
                    AppState.setZoomLevel(newZoom);
                } else {
                    // Detect if this is a mouse wheel vs touchpad scroll
                    // Mouse wheel: quantized deltaY (typically ±100/±120), no deltaX
                    // Touchpad: fractional deltaY, often has deltaX for horizontal scroll
                    const isMouse = ev.deltaMode === 0 && ev.deltaX === 0 && Math.abs(ev.deltaY) >= 50;

                    if (isMouse) {
                        // Mouse wheel: zoom in/out
                        const delta = ev.deltaY > 0 ? -0.1 : 0.1;
                        AppState.setZoomLevel(AppState.zoomLevel + delta);
                    } else {
                        // Touchpad two-finger scroll: pan the canvas
                        this.panX -= ev.deltaX;
                        this.panY -= ev.deltaY;
                        this.applyZoom();
                    }
                }
            }, { passive: false });
        }

        // Capture wheel events on viewport (dark area) to prevent browser zoom
        if (this.viewport) {
            this.viewport.addEventListener("wheel", (ev) => {
                ev.preventDefault();
                // Forward the event logic - detect mouse vs touchpad same as above
                if (ev.ctrlKey) {
                    const delta = ev.deltaY > 0 ? -0.05 : 0.05;
                    AppState.setZoomLevel(AppState.zoomLevel + delta);
                } else {
                    const isMouse = ev.deltaMode === 0 && ev.deltaX === 0 && Math.abs(ev.deltaY) >= 50;
                    if (isMouse) {
                        const delta = ev.deltaY > 0 ? -0.1 : 0.1;
                        AppState.setZoomLevel(AppState.zoomLevel + delta);
                    } else {
                        this.panX -= ev.deltaX;
                        this.panY -= ev.deltaY;
                        this.applyZoom();
                    }
                }
            }, { passive: false });
        }

        // Keyboard shortcuts for zoom
        document.addEventListener("keydown", (ev) => {
            if (ev.ctrlKey && (ev.key === "+" || ev.key === "=")) {
                ev.preventDefault();
                this.zoomIn();
            } else if (ev.ctrlKey && ev.key === "-") {
                ev.preventDefault();
                this.zoomOut();
            } else if (ev.ctrlKey && ev.key === "0") {
                ev.preventDefault();
                this.zoomReset();
            } else if (ev.ctrlKey && ev.key.toLowerCase() === "r") {
                ev.preventDefault();
                this.zoomReset();
            }
        });
    }

    setupDragAndDrop() {
        if (!this.canvas) return;

        this.canvas.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });

        this.canvas.addEventListener("drop", (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("application/widget-type");
            console.log("[Canvas] Drop detected type:", type);

            if (type) {
                const rect = this.canvas.getBoundingClientRect();
                const zoom = AppState.zoomLevel;

                // Calculate position relative to canvas, accounting for zoom
                const x = (e.clientX - rect.left) / zoom;
                const y = (e.clientY - rect.top) / zoom;

                try {
                    const widget = WidgetFactory.createWidget(type);
                    // Center the widget on the drop point
                    widget.x = Math.round(x - widget.width / 2);
                    widget.y = Math.round(y - widget.height / 2);

                    AppState.addWidget(widget);
                    console.log("[Canvas] Widget added via drag & drop:", type);
                } catch (err) {
                    console.error("[Canvas] error creating widget from drop:", err);
                }
            }
        });
    }

    zoomIn() {
        AppState.setZoomLevel(AppState.zoomLevel + 0.1);
    }

    zoomOut() {
        AppState.setZoomLevel(AppState.zoomLevel - 0.1);
    }

    zoomReset() {
        AppState.setZoomLevel(1.0);
        this.panX = 0;
        this.panY = 0;
        this.applyZoom();
    }

    applyZoom() {
        const zoom = AppState.zoomLevel;
        const dims = AppState.getCanvasDimensions();
        const settings = AppState.settings;

        if (this.canvas) {
            this.canvas.style.transform = `scale(${zoom})`;
            // Change transform origin to 0 0 for predictable scrolling container
            this.canvas.style.transformOrigin = "0 0";
        }

        if (this.canvasContainer) {
            // Apply panning via transform on the container
            this.canvasContainer.style.transform = `translate(${this.panX}px, ${this.panY}px)`;

            // Force the container to match the scaled size so parents overflow correctly
            this.canvasContainer.style.width = (dims.width * zoom) + "px";
            this.canvasContainer.style.height = (dims.height * zoom) + "px";
        }

        // Apply grid opacity
        const opacity = (settings.grid_opacity !== undefined ? settings.grid_opacity : 8) / 100;
        document.documentElement.style.setProperty('--grid-opacity', opacity.toString());

        // Update zoom level display
        const zoomLevelEl = document.getElementById("zoomLevel");
        if (zoomLevelEl) {
            zoomLevelEl.textContent = Math.round(zoom * 100) + "%";
        }
    }

    _onMouseMove(ev) {
        const zoom = AppState.zoomLevel;
        const dims = AppState.getCanvasDimensions();

        if (this.dragState) {
            if (this.dragState.mode === "move") {
                const rect = this.canvas.getBoundingClientRect();

                // Primary widget delta for snapping
                const primaryWidget = AppState.getWidgetById(this.dragState.id);
                if (!primaryWidget) return;

                const primaryOffset = this.dragState.widgets.find(w => w.id === this.dragState.id);

                let targetX = (ev.clientX - rect.left) / zoom - primaryOffset.clickOffsetX;
                let targetY = (ev.clientY - rect.top) / zoom - primaryOffset.clickOffsetY;

                // Snap logic using the primary widget
                const page = AppState.getCurrentPage();
                if (page?.layout && !ev.altKey) {
                    const snappedToGrid = this._snapToGridCell(targetX, targetY, primaryWidget.width, primaryWidget.height, page.layout, dims);
                    targetX = snappedToGrid.x;
                    targetY = snappedToGrid.y;
                } else {
                    const snapped = this.applySnapToPosition(primaryWidget, targetX, targetY, ev.altKey, dims);
                    targetX = snapped.x;
                    targetY = snapped.y;
                }

                // Calculate displacement based on snapped target
                const dx = targetX - primaryOffset.startX;
                const dy = targetY - primaryOffset.startY;

                // Move all selected widgets by the same displacement
                for (const wInfo of this.dragState.widgets) {
                    const widget = AppState.getWidgetById(wInfo.id);
                    if (widget && !widget.locked) {
                        widget.x = wInfo.startX + dx;
                        widget.y = wInfo.startY + dy;
                    }
                }
            } else if (this.dragState.mode === "resize") {
                const widget = AppState.getWidgetById(this.dragState.id);
                if (!widget) return;

                let w = this.dragState.startW + (ev.clientX - this.dragState.startX) / zoom;
                let h = this.dragState.startH + (ev.clientY - this.dragState.startY) / zoom;

                const wtype = (widget.type || "").toLowerCase();

                if (wtype === "line" || wtype === "lvgl_line") {
                    const props = widget.props || {};
                    const orientation = props.orientation || "horizontal";
                    const strokeWidth = parseInt(props.stroke_width || props.line_width || 3, 10);

                    if (orientation === "vertical") {
                        w = strokeWidth;
                        h = Math.max(10, h);
                    } else {
                        h = strokeWidth;
                        w = Math.max(10, w);
                    }
                }

                const minSize = 1;
                w = Math.max(minSize, Math.min(dims.width - widget.x, w));
                h = Math.max(minSize, Math.min(dims.height - widget.y, h));
                widget.width = Math.round(w);
                widget.height = Math.round(h);

                if (wtype === "icon" || wtype === "weather_icon" || wtype === "battery_icon" || wtype === "wifi_signal") {
                    const props = widget.props || {};
                    if (props.fit_icon_to_frame) {
                        const padding = 4;
                        const maxDim = Math.max(8, Math.min(widget.width - padding * 2, widget.height - padding * 2));
                        props.size = Math.round(maxDim);
                    } else {
                        const newSize = Math.max(8, Math.min(widget.width, widget.height));
                        props.size = Math.round(newSize);
                    }
                } else if (wtype === "shape_circle") {
                    const size = Math.max(widget.width, widget.height);
                    widget.width = size;
                    widget.height = size;
                }
            }
            this.render();
        } else if (this.lassoState) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = (ev.clientX - rect.left) / zoom;
            const currentY = (ev.clientY - rect.top) / zoom;

            const x = Math.min(this.lassoState.startX, currentX);
            const y = Math.min(this.lassoState.startY, currentY);
            const w = Math.abs(currentX - this.lassoState.startX);
            const h = Math.abs(currentY - this.lassoState.startY);

            this.lassoState.rect = { x, y, w, h };

            if (this.lassoEl) {
                this.lassoEl.style.left = x + "px";
                this.lassoEl.style.top = y + "px";
                this.lassoEl.style.width = w + "px";
                this.lassoEl.style.height = h + "px";
            }
        }
    }

    _onMouseUp(ev) {
        if (this.dragState) {
            const widgetId = this.dragState.id;
            this.dragState = null;
            this.clearSnapGuides();
            window.removeEventListener("mousemove", this._boundMouseMove);
            window.removeEventListener("mouseup", this._boundMouseUp);

            this._updateWidgetGridCell(widgetId);

            AppState.recordHistory();
            emit(EVENTS.STATE_CHANGED);
            this.render();
        } else if (this.lassoState) {
            window.removeEventListener("mousemove", this._boundMouseMove);
            window.removeEventListener("mouseup", this._boundMouseUp);

            if (this.lassoEl) {
                this.lassoEl.remove();
                this.lassoEl = null;
            }

            if (this.lassoState.rect) {
                const { x, y, w, h } = this.lassoState.rect;
                const page = AppState.getCurrentPage();
                const selectedIds = [];

                if (page) {
                    for (const widget of page.widgets) {
                        // Check if widget bounds intersect with lasso rect
                        const widgetRect = {
                            x1: widget.x,
                            y1: widget.y,
                            x2: widget.x + widget.width,
                            y2: widget.y + widget.height
                        };

                        const lassoRect = {
                            x1: x,
                            y1: y,
                            x2: x + w,
                            y2: y + h
                        };

                        const intersects = !(widgetRect.x2 < lassoRect.x1 ||
                            widgetRect.x1 > lassoRect.x2 ||
                            widgetRect.y2 < lassoRect.y1 ||
                            widgetRect.y1 > lassoRect.y2);

                        if (intersects) {
                            selectedIds.push(widget.id);
                        }
                    }
                }

                AppState.selectWidgets(selectedIds);
            } else {
                // Clicked without dragging - clear selection
                AppState.selectWidgets([]);
            }

            this.lassoState = null;
            this.render();
        }
    }

    /**
     * Auto-detects which grid cell a widget is in based on its position.
     * Updates grid_cell_row_pos and grid_cell_column_pos in widget props.
     */
    _updateWidgetGridCell(widgetId) {
        const page = AppState.getCurrentPage();
        if (!page || !page.layout) return;

        const match = page.layout.match(/^(\d+)x(\d+)$/);
        if (!match) return;

        const widget = AppState.getWidgetById(widgetId);
        if (!widget) return;

        const rows = parseInt(match[1], 10);
        const cols = parseInt(match[2], 10);
        const dims = AppState.getCanvasDimensions();
        const cellWidth = dims.width / cols;
        const cellHeight = dims.height / rows;

        // Calculate cell based on widget center
        const centerX = widget.x + widget.width / 2;
        const centerY = widget.y + widget.height / 2;

        const col = Math.floor(centerX / cellWidth);
        const row = Math.floor(centerY / cellHeight);

        // Clamp to valid range
        const clampedRow = Math.max(0, Math.min(rows - 1, row));
        const clampedCol = Math.max(0, Math.min(cols - 1, col));

        // Update widget props with detected grid position
        const newProps = {
            ...widget.props,
            grid_cell_row_pos: clampedRow,
            grid_cell_column_pos: clampedCol
        };

        // Also detect span based on widget size
        const rowSpan = Math.max(1, Math.round(widget.height / cellHeight));
        const colSpan = Math.max(1, Math.round(widget.width / cellWidth));
        newProps.grid_cell_row_span = rowSpan;
        newProps.grid_cell_column_span = colSpan;

        AppState.updateWidget(widgetId, { props: newProps });
    }

    /**
     * Snaps x/y position to the nearest grid cell boundary.
     * @returns {{x: number, y: number}} Snapped position
     */
    _snapToGridCell(x, y, widgetWidth, widgetHeight, layout, dims) {
        const match = layout.match(/^(\d+)x(\d+)$/);
        if (!match) return { x, y };

        const rows = parseInt(match[1], 10);
        const cols = parseInt(match[2], 10);
        const cellWidth = dims.width / cols;
        const cellHeight = dims.height / rows;

        // Snap to nearest cell boundary based on widget center
        const centerX = x + widgetWidth / 2;
        const centerY = y + widgetHeight / 2;

        const col = Math.round(centerX / cellWidth - 0.5);
        const row = Math.round(centerY / cellHeight - 0.5);

        // Clamp to valid range
        const clampedCol = Math.max(0, Math.min(cols - 1, col));
        const clampedRow = Math.max(0, Math.min(rows - 1, row));

        return {
            x: Math.round(clampedCol * cellWidth),
            y: Math.round(clampedRow * cellHeight)
        };
    }

    // --- Snapping ---

    clearSnapGuides() {
        const guides = this.canvas.querySelectorAll(".snap-guide");
        guides.forEach((g) => g.remove());
    }

    addSnapGuideVertical(x) {
        const guide = document.createElement("div");
        guide.className = "snap-guide snap-guide-vertical";
        guide.style.left = `${x}px`;
        this.canvas.appendChild(guide);
    }

    addSnapGuideHorizontal(y) {
        const guide = document.createElement("div");
        guide.className = "snap-guide snap-guide-horizontal";
        guide.style.top = `${y}px`;
        this.canvas.appendChild(guide);
    }

    getSnapLines(excludeWidgetId, dims) {
        const page = AppState.getCurrentPage();
        const vertical = [];
        const horizontal = [];

        vertical.push(0, dims.width / 2, dims.width);
        horizontal.push(0, dims.height / 2, dims.height);

        if (page && Array.isArray(page.widgets)) {
            for (const w of page.widgets) {
                if (!w || w.id === excludeWidgetId) continue;
                const left = w.x;
                const right = w.x + (w.width || 0);
                const top = w.y;
                const bottom = w.y + (w.height || 0);
                const cx = left + (w.width || 0) / 2;
                const cy = top + (w.height || 0) / 2;
                vertical.push(left, cx, right);
                horizontal.push(top, cy, bottom);
            }
        }

        return { vertical, horizontal };
    }

    applySnapToPosition(widget, x, y, altKey, dims) {
        if (!AppState.snapEnabled || altKey) {
            this.clearSnapGuides();
            return { x: Math.round(x), y: Math.round(y) };
        }

        const snapLines = this.getSnapLines(widget.id, dims);
        const w = widget.width || 0;
        const h = widget.height || 0;

        let snappedX = x;
        let snappedY = y;
        let snappedV = null;
        let snappedH = null;

        // Vertical Snap
        const vCandidates = [
            { val: x, apply: (line) => (snappedX = line) },
            { val: x + w / 2, apply: (line) => (snappedX = line - w / 2) },
            { val: x + w, apply: (line) => (snappedX = line - w) }
        ];

        let bestDeltaV = SNAP_DISTANCE + 1;
        for (const cand of vCandidates) {
            for (const line of snapLines.vertical) {
                const delta = Math.abs(cand.val - line);
                if (delta <= SNAP_DISTANCE && delta < bestDeltaV) {
                    bestDeltaV = delta;
                    snappedV = line;
                    cand.apply(line);
                }
            }
        }

        // Horizontal Snap
        const hCandidates = [
            { val: y, apply: (line) => (snappedY = line) },
            { val: y + h / 2, apply: (line) => (snappedY = line - h / 2) },
            { val: y + h, apply: (line) => (snappedY = line - h) }
        ];

        let bestDeltaH = SNAP_DISTANCE + 1;
        for (const cand of hCandidates) {
            for (const line of snapLines.horizontal) {
                const delta = Math.abs(cand.val - line);
                if (delta <= SNAP_DISTANCE && delta < bestDeltaH) {
                    bestDeltaH = delta;
                    snappedH = line;
                    cand.apply(line);
                }
            }
        }

        snappedX = Math.max(0, Math.min(dims.width - w, snappedX));
        snappedY = Math.max(0, Math.min(dims.height - h, snappedY));

        this.clearSnapGuides();
        if (snappedV != null) this.addSnapGuideVertical(snappedV);
        if (snappedH != null) this.addSnapGuideHorizontal(snappedH);

        return {
            x: Math.round(snappedX),
            y: Math.round(snappedY)
        };
    }

    // --- Touch Interactions for Mobile Devices ---

    /**
     * Sets up touch event handlers for mobile/tablet devices.
     * Supports: widget drag, canvas panning, pinch-to-zoom, double-tap reset.
     */
    setupTouchInteractions() {
        if (!this.canvas || !this.canvasContainer) return;

        // Touch start on canvas (for widget interaction and panning)
        this.canvas.addEventListener("touchstart", (ev) => {
            const touches = ev.touches;

            if (touches.length === 2) {
                // Two-finger: start pinch/pan mode
                ev.preventDefault();
                this.pinchState = {
                    startDistance: this._getTouchDistance(touches[0], touches[1]),
                    startZoom: AppState.zoomLevel,
                    startPanX: this.panX,
                    startPanY: this.panY,
                    startCenterX: (touches[0].clientX + touches[1].clientX) / 2,
                    startCenterY: (touches[0].clientY + touches[1].clientY) / 2
                };
                this.touchState = null;
                return;
            }

            if (touches.length === 1) {
                const touch = touches[0];
                const widgetEl = touch.target.closest(".widget");

                if (widgetEl) {
                    // TOUCHING A WIDGET: Prepare for direct manipulation
                    // We DO NOT call selectWidget here to avoid a re-render that would 
                    // detach the element from the touch stream.
                    ev.preventDefault();

                    const widgetId = widgetEl.dataset.id;
                    const widget = AppState.getWidgetById(widgetId);
                    if (!widget) return;

                    const isResizeHandle = touch.target.classList.contains("widget-resize-handle");

                    if (isResizeHandle) {
                        this.touchState = {
                            mode: "resize",
                            id: widgetId,
                            startX: touch.clientX,
                            startY: touch.clientY,
                            startW: widget.width,
                            startH: widget.height,
                            el: widgetEl
                        };
                    } else {
                        this.touchState = {
                            mode: "move",
                            id: widgetId,
                            startTouchX: touch.clientX,
                            startTouchY: touch.clientY,
                            startWidgetX: widget.x,
                            startWidgetY: widget.y,
                            hasMoved: false,
                            el: widgetEl
                        };
                    }

                    window.addEventListener("touchmove", this._boundTouchMove, { passive: false });
                    window.addEventListener("touchend", this._boundTouchEnd);
                    window.addEventListener("touchcancel", this._boundTouchEnd);

                } else {
                    // TOUCHING EMPTY CANVAS: Pan or double-tap zoom reset
                    const now = Date.now();
                    if (now - this.lastTapTime < 300) {
                        this.zoomReset();
                        this.lastTapTime = 0;
                        ev.preventDefault();
                        return;
                    }
                    this.lastTapTime = now;

                    ev.preventDefault();
                    this.touchState = {
                        mode: "pan",
                        startTouchX: touch.clientX,
                        startTouchY: touch.clientY,
                        startPanX: this.panX,
                        startPanY: this.panY
                    };

                    window.addEventListener("touchmove", this._boundTouchMove, { passive: false });
                    window.addEventListener("touchend", this._boundTouchEnd);
                    window.addEventListener("touchcancel", this._boundTouchEnd);
                }
            }
        }, { passive: false });

        // Also capture two-finger gestures on the viewport/container for pinch zoom
        this.canvasContainer.addEventListener("touchstart", (ev) => {
            if (ev.touches.length === 2) {
                ev.preventDefault();
                const touches = ev.touches;
                this.pinchState = {
                    startDistance: this._getTouchDistance(touches[0], touches[1]),
                    startZoom: AppState.zoomLevel,
                    startPanX: this.panX,
                    startPanY: this.panY,
                    startCenterX: (touches[0].clientX + touches[1].clientX) / 2,
                    startCenterY: (touches[0].clientY + touches[1].clientY) / 2
                };
                this.touchState = null;

                window.addEventListener("touchmove", this._boundTouchMove, { passive: false });
                window.addEventListener("touchend", this._boundTouchEnd);
                window.addEventListener("touchcancel", this._boundTouchEnd);
            }
        }, { passive: false });
    }

    /**
     * Handles touch move events for widget drag, panning, and pinch zoom.
     */
    _onTouchMove(ev) {
        const touches = ev.touches;

        // Handle pinch/pan with two fingers
        if (this.pinchState && touches.length === 2) {
            ev.preventDefault();
            const currentDistance = this._getTouchDistance(touches[0], touches[1]);
            const scale = currentDistance / this.pinchState.startDistance;
            const newZoom = Math.max(0.25, Math.min(4, this.pinchState.startZoom * scale));
            AppState.setZoomLevel(newZoom);

            // Also pan based on center point movement
            const currentCenterX = (touches[0].clientX + touches[1].clientX) / 2;
            const currentCenterY = (touches[0].clientY + touches[1].clientY) / 2;
            const dx = currentCenterX - this.pinchState.startCenterX;
            const dy = currentCenterY - this.pinchState.startCenterY;
            this.panX = this.pinchState.startPanX + dx;
            this.panY = this.pinchState.startPanY + dy;
            this.applyZoom();
            return;
        }

        // Handle single-finger interactions
        if (this.touchState && touches.length === 1) {
            ev.preventDefault();
            const touch = touches[0];

            if (this.touchState.mode === "pan") {
                // Canvas panning
                const dx = touch.clientX - this.touchState.startTouchX;
                const dy = touch.clientY - this.touchState.startTouchY;
                this.panX = this.touchState.startPanX + dx;
                this.panY = this.touchState.startPanY + dy;
                this.applyZoom();
            } else if (this.touchState.mode === "move") {
                // Widget move with small deadzone
                const dx = touch.clientX - this.touchState.startTouchX;
                const dy = touch.clientY - this.touchState.startTouchY;

                if (!this.touchState.hasMoved && Math.hypot(dx, dy) < 5) {
                    return; // Small deadzone
                }
                this.touchState.hasMoved = true;

                const widget = AppState.getWidgetById(this.touchState.id);
                if (!widget) return;

                const dims = AppState.getCanvasDimensions();
                const zoom = AppState.zoomLevel;

                let x = this.touchState.startWidgetX + dx / zoom;
                let y = this.touchState.startWidgetY + dy / zoom;

                // Clamp to canvas
                x = Math.max(0, Math.min(dims.width - widget.width, x));
                y = Math.max(0, Math.min(dims.height - widget.height, y));

                // Update internal state
                widget.x = x;
                widget.y = y;

                // Direct DOM update instead of render() to preserve touch stream
                if (this.touchState.el) {
                    this.touchState.el.style.left = x + "px";
                    this.touchState.el.style.top = y + "px";
                }
            } else if (this.touchState.mode === "resize") {
                // Widget resize
                const widget = AppState.getWidgetById(this.touchState.id);
                if (!widget) return;

                const dims = AppState.getCanvasDimensions();
                const zoom = AppState.zoomLevel;

                let w = this.touchState.startW + (touch.clientX - this.touchState.startX) / zoom;
                let h = this.touchState.startH + (touch.clientY - this.touchState.startY) / zoom;

                const wtype = (widget.type || "").toLowerCase();

                // Special handling for line widgets
                if (wtype === "line" || wtype === "lvgl_line") {
                    const props = widget.props || {};
                    const orientation = props.orientation || "horizontal";
                    const strokeWidth = parseInt(props.stroke_width || props.line_width || 3, 10);

                    if (orientation === "vertical") {
                        w = strokeWidth;
                        h = Math.max(10, h);
                    } else {
                        h = strokeWidth;
                        w = Math.max(10, w);
                    }
                }

                // Clamp to canvas bounds
                const minSize = 20; // Ensure widget doesn't disappear
                w = Math.max(minSize, Math.min(dims.width - widget.x, w));
                h = Math.max(minSize, Math.min(dims.height - widget.y, h));

                widget.width = w;
                widget.height = h;

                // Direct DOM update instead of render() to preserve touch stream
                if (this.touchState.el) {
                    this.touchState.el.style.width = w + "px";
                    this.touchState.el.style.height = h + "px";
                }
            }
        }
    }

    /**
     * Handles touch end/cancel events.
     */
    _onTouchEnd(ev) {
        if (this.touchState) {
            const widgetId = this.touchState.id;
            const mode = this.touchState.mode;
            const hasMoved = this.touchState.hasMoved;

            // Handle final snapping and selection for widgets
            if (widgetId) {
                const widget = AppState.getWidgetById(widgetId);
                if (widget) {
                    if (mode === "move" && hasMoved) {
                        // Apply final snapping on release
                        const dims = AppState.getCanvasDimensions();
                        const page = AppState.getCurrentPage();
                        if (page?.layout) {
                            const snapped = this._snapToGridCell(widget.x, widget.y, widget.width, widget.height, page.layout, dims);
                            widget.x = snapped.x;
                            widget.y = snapped.y;
                        } else {
                            const snapped = this.applySnapToPosition(widget, widget.x, widget.y, false, dims);
                            widget.x = snapped.x;
                            widget.y = snapped.y;
                        }
                    } else if (mode === "resize") {
                        // Integer rounding for final dimensions
                        widget.width = Math.round(widget.width);
                        widget.height = Math.round(widget.height);
                    }

                    // Perform selection at the end to avoid DOM detachment during gesture
                    AppState.selectWidget(widgetId);
                }

                if ((mode === "move" || mode === "resize") && hasMoved) {
                    this._updateWidgetGridCell(widgetId);
                    AppState.recordHistory();
                    emit(EVENTS.STATE_CHANGED);
                }
            }

            this.touchState = null;
            this.clearSnapGuides();
            this.render();
        }

        if (this.pinchState) {
            this.pinchState = null;
        }

        window.removeEventListener("touchmove", this._boundTouchMove);
        window.removeEventListener("touchend", this._boundTouchEnd);
        window.removeEventListener("touchcancel", this._boundTouchEnd);
    }

    /**
     * Calculate distance between two touch points.
     */
    _getTouchDistance(t1, t2) {
        return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }
}
