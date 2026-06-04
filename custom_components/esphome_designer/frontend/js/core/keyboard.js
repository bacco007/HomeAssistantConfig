// @ts-check
import { AppState } from './state';
import { Logger } from '../utils/logger.js';
import { quickSearchInstance } from '../ui/quick_search.js';
import { emit, EVENTS } from './events.js';
import { addBrowserEventListener } from '../utils/browser_runtime.js';

export class KeyboardHandler {
    /** @type {KeyboardHandler | null} */
    static _activeHandler = null;
    /** @type {boolean} */
    static _listenersAttached = false;
    /** @type {((ev: KeyboardEvent) => void) | null} */
    static _boundKeyDown = null;

    constructor() {
        this._seenKeyEvents = new WeakSet();
        KeyboardHandler._activeHandler = this;
        this.init();
    }

    init() {
        if (KeyboardHandler._listenersAttached) {
            return;
        }

        KeyboardHandler._boundKeyDown = (/** @type {KeyboardEvent} */ ev) => {
            const handler = KeyboardHandler._activeHandler;
            if (!handler) {
                return;
            }

            if (handler._seenKeyEvents.has(ev)) {
                return;
            }

            handler._seenKeyEvents.add(ev);
            handler.handleKeyDown(ev);
        };

        if (typeof document?.addEventListener === 'function') {
            document.addEventListener("keydown", KeyboardHandler._boundKeyDown);
        }
        addBrowserEventListener("keydown", KeyboardHandler._boundKeyDown);
        KeyboardHandler._listenersAttached = true;
    }

    /**
     * @param {KeyboardEvent} ev
     */
    handleKeyDown(ev) {
        // Debug
        // Key event handling

        const state = AppState;
        if (!state) {
            Logger.error("KeyboardHandler: AppState not found!");
            return;
        }

        const hasSelection = state.selectedWidgetIds.length > 0;
        const htmlTarget = ev.target instanceof HTMLElement ? ev.target : null;
        const isEditableTarget = KeyboardHandler.isInput(htmlTarget);
        const hasNativeSelection = KeyboardHandler.hasNativeTextSelection(htmlTarget);

        // Quick Search: Shift+Space
        // Quick Search: Shift+Space
        if (ev.shiftKey && ev.code === "Space") {
            // Always trigger, even in input fields
            // Blur the current input if it's focused (e.g. YAML snippet box)
            if (htmlTarget && KeyboardHandler.isInput(htmlTarget)) {
                htmlTarget.blur();
            }

            ev.preventDefault();
            if (quickSearchInstance) {
                quickSearchInstance.open();
            }
            return;
        }

        if ((ev.key === "Delete" || ev.key === "Backspace") && hasSelection) {
            if (isEditableTarget) {
                return;
            }
            ev.preventDefault();
            this.deleteWidget(null);
            return;
        }

        const arrowDelta = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0]
        }[ev.key];
        if (arrowDelta && hasSelection && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
            if (isEditableTarget) {
                return;
            }

            const delta = ev.shiftKey ? 10 : 1;
            ev.preventDefault();
            this.nudgeSelectedWidgets(arrowDelta[0] * delta, arrowDelta[1] * delta);
            return;
        }

        // Copy: Ctrl+C
        if ((ev.ctrlKey || ev.metaKey) && ev.key && ev.key.toLowerCase() === "c") {
            if (isEditableTarget || hasNativeSelection) {
                return;
            }
            ev.preventDefault();
            this.copyWidget();
            return;
        }

        // Paste: Ctrl+V
        if ((ev.ctrlKey || ev.metaKey) && ev.key && ev.key.toLowerCase() === "v") {
            if (isEditableTarget) {
                return;
            }
            ev.preventDefault();
            this.pasteWidget();
            return;
        }

        // Undo: Ctrl+Z
        if ((ev.ctrlKey || ev.metaKey) && ev.key && ev.key.toLowerCase() === "z" && !ev.shiftKey) {
            if (isEditableTarget) {
                return;
            }
            ev.preventDefault();
            // Prevent focus stealing during undo state restoration
            state.isUndoRedoInProgress = true;
            state.undo();
            setTimeout(() => { state.isUndoRedoInProgress = false; }, 100);
            return;
        }

        // Redo: Ctrl+Y or Ctrl+Shift+Z
        if ((ev.ctrlKey || ev.metaKey) && ev.key && (ev.key.toLowerCase() === "y" || (ev.key.toLowerCase() === "z" && ev.shiftKey))) {
            if (isEditableTarget) {
                return;
            }
            ev.preventDefault();
            // Prevent focus stealing during redo state restoration
            state.isUndoRedoInProgress = true;
            state.redo();
            setTimeout(() => { state.isUndoRedoInProgress = false; }, 100);
            return;
        }

        // Lock/Unlock: Ctrl+L
        if ((ev.ctrlKey || ev.metaKey) && ev.key && ev.key.toLowerCase() === "l" && hasSelection) {
            ev.preventDefault();
            const selectedWidgets = state.getSelectedWidgets();
            const allLocked = selectedWidgets.every((/** @type {{ locked?: boolean }} */ w) => w.locked);
            // Toggle: if all are locked, unlock them. Otherwise, lock all.
            state.updateWidgets(state.selectedWidgetIds, { locked: !allLocked });
        }

        // Select All: Ctrl+A
        if ((ev.ctrlKey || ev.metaKey) && ev.key && ev.key.toLowerCase() === "a") {
            if (ev.target instanceof HTMLElement && !KeyboardHandler.isInput(ev.target) && !hasNativeSelection) {
                ev.preventDefault();
                state.selectAllWidgets();
                return;
            }
        }

        // Toggle Grid: G (if not typing)
        if (ev.key && ev.key.toLowerCase() === "g" && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey) {
            if (ev.target instanceof HTMLElement && (ev.target.tagName !== "INPUT" && ev.target.tagName !== "TEXTAREA")) {
                ev.preventDefault();
                const newState = !state.showGrid;
                state.setShowGrid(newState);

                // Exclusive logic
                if (newState) {
                    state.setShowDebugGrid(false);
                    const debugBtn = document.getElementById("debugGridToggleBtn");
                    if (debugBtn) debugBtn.classList.remove("active");
                }

                // Sync UI button state if exists
                const btn = document.getElementById("gridToggleBtn");
                if (btn) btn.classList.toggle("active", newState);

                emit(EVENTS.STATE_CHANGED);
                Logger.log(`[Keyboard] Grid toggled: ${newState}`);
                return;
            }
        }

        // Toggle Debug: D (if not typing)
        if (ev.key && ev.key.toLowerCase() === "d" && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey) {
            if (ev.target instanceof HTMLElement && ev.target.tagName !== "INPUT" && ev.target.tagName !== "TEXTAREA") {
                ev.preventDefault();
                const newState = !state.showDebugGrid;
                state.setShowDebugGrid(newState);

                // Exclusive logic
                if (newState) {
                    state.setShowGrid(false);
                    const gridBtn = document.getElementById("gridToggleBtn");
                    if (gridBtn) gridBtn.classList.remove("active");
                }

                // Sync UI button state if exists
                const btn = document.getElementById("debugGridToggleBtn");
                if (btn) btn.classList.toggle("active", newState);

                emit(EVENTS.STATE_CHANGED);
                Logger.log(`[Keyboard] Debug mode toggled: ${newState}`);
                return;
            }
        }

        // Toggle Rulers: R (if not typing)
        if (ev.key && ev.key.toLowerCase() === "r" && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey) {
            if (ev.target instanceof HTMLElement && ev.target.tagName !== "INPUT" && ev.target.tagName !== "TEXTAREA") {
                ev.preventDefault();
                const newState = !state.showRulers;
                state.setShowRulers(newState);
                // Sync UI button state if exists
                const btn = document.getElementById("rulersToggleBtn");
                if (btn) btn.classList.toggle("active", newState);
                Logger.log(`[Keyboard] Rulers toggled: ${newState}`);
                return;
            }
        }

        // Deselect / Escape: Escape key
        if (ev.key === "Escape") {
            if (document.activeElement instanceof HTMLElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
                document.activeElement.blur();
            }
            if (state.selectedWidgetIds.length > 0) {
                state.selectWidgets([]);
                emit(EVENTS.STATE_CHANGED);
            }
        }
    }

    // Add interaction detection for inputs
    /** @param {unknown} el */
    static isInput(el) {
        return !!(el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
    }

    /**
     * @param {HTMLElement | null} target
     * @returns {boolean}
     */
    static hasNativeTextSelection(target) {
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            const start = target.selectionStart ?? 0;
            const end = target.selectionEnd ?? 0;
            return end > start;
        }

        try {
            const selection = globalThis.getSelection?.();
            return !!selection && !selection.isCollapsed && selection.toString().trim().length > 0;
        } catch {
            return false;
        }
    }

    /**
     * @param {number} dx
     * @param {number} dy
     * @returns {boolean}
     */
    nudgeSelectedWidgets(dx, dy) {
        const state = AppState;
        const page = state.getCurrentPage?.();
        const selectedIds = new Set(state.selectedWidgetIds);
        const selectedWidgets = state.getSelectedWidgets();
        const widgetsToMove = [];
        for (const widget of selectedWidgets) {
            if (!widget || widget.locked) continue;
            widgetsToMove.push(widget);
            if (widget.type === "group" && page?.widgets) {
                widgetsToMove.push(...page.widgets.filter((child) => child.parentId === widget.id && !child.locked && !selectedIds.has(child.id)));
            }
        }

        if (!widgetsToMove.length) {
            return false;
        }

        const dims = /** @type {{ width?: number, height?: number }} */ (state.getCanvasDimensions?.() || {});
        const maxWidth = Number(dims.width) || Infinity;
        const maxHeight = Number(dims.height) || Infinity;
        let changed = false;

        for (const widget of widgetsToMove) {
            const width = Number(widget.width) || 0;
            const height = Number(widget.height) || 0;
            const maxX = Number.isFinite(maxWidth) ? Math.max(0, maxWidth - width) : Infinity;
            const maxY = Number.isFinite(maxHeight) ? Math.max(0, maxHeight - height) : Infinity;
            const currentX = Number(widget.x) || 0;
            const currentY = Number(widget.y) || 0;
            const nextX = Math.min(maxX, Math.max(0, currentX + dx));
            const nextY = Math.min(maxY, Math.max(0, currentY + dy));

            if (nextX !== widget.x || nextY !== widget.y) {
                widget.x = nextX;
                widget.y = nextY;
                changed = true;
            }
        }

        if (!changed) {
            return false;
        }

        if (typeof state.recordHistory === "function") {
            state.recordHistory();
        }
        emit(EVENTS.STATE_CHANGED);
        return true;
    }

    /** @param {any} widgetId */
    deleteWidget(widgetId) {
        const state = AppState;
        if (state) state.deleteWidget(widgetId);
    }

    copyWidget() {
        const state = AppState;
        if (state) state.copyWidget();
    }

    pasteWidget() {
        const state = AppState;
        if (state) state.pasteWidget();
    }
}
