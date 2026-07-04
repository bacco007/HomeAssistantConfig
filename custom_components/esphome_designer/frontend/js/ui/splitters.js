/**
 * Handles panel resizing via draggable splitters.
 */
import { Logger } from '../utils/logger.js';
import { addBrowserEventListener, dispatchBrowserEvent, removeBrowserEventListener } from '../utils/browser_runtime.js';

const STORAGE_KEY = 'esphome-designer-splitter-sizes';

function readSavedSizes() {
    try {
        const raw = window.localStorage?.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeSavedSize(key, value) {
    const numericValue = parseInt(String(value), 10);
    if (!Number.isFinite(numericValue)) return;

    try {
        const next = { ...readSavedSizes(), [key]: numericValue };
        window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Ignore storage failures; resizing should still work.
    }
}

function getBoundedSize(target, orientation, value) {
    const numericValue = parseInt(String(value), 10);
    if (!Number.isFinite(numericValue)) return null;

    const styles = getComputedStyle(target);
    const min = parseInt(orientation === 'vertical' ? styles.minWidth : styles.minHeight) || 0;
    const max = parseInt(orientation === 'vertical' ? styles.maxWidth : styles.maxHeight) || Number.MAX_SAFE_INTEGER;
    return Math.max(min, Math.min(max, numericValue));
}

function restoreSize(target, orientation, key, savedSizes) {
    const value = getBoundedSize(target, orientation, savedSizes[key]);
    if (value === null) return;

    if (orientation === 'vertical') target.style.width = value + 'px';
    else target.style.height = value + 'px';
}

function init() {
    const leftResizer = /** @type {HTMLElement | null} */ (document.getElementById('resizer-left'));
    const rightResizer = /** @type {HTMLElement | null} */ (document.getElementById('resizer-right'));
    const sidebar = /** @type {HTMLElement | null} */ (document.querySelector('.sidebar'));
    const rightPanel = /** @type {HTMLElement | null} */ (document.querySelector('.right-panel'));
    const appContent = document.querySelector('.app-content');

    if (!appContent) {
        setTimeout(init, 100);
        return;
    }

    if (!leftResizer || !rightResizer || !sidebar || !rightPanel) {
        Logger.warn("[Splitters] Layout elements not found, retrying...");
        setTimeout(init, 500);
        return;
    }

    Logger.log("[Splitters] Initializing draggable panels...");

    const savedSizes = readSavedSizes();
    restoreSize(sidebar, 'vertical', 'left', savedSizes);
    restoreSize(rightPanel, 'vertical', 'right', savedSizes);

    /**
     * @param {HTMLElement} resizer
     * @param {HTMLElement} target
     * @param {'vertical' | 'horizontal'} orientation
     * @param {string} storageKey
     */
    function setupResizer(resizer, target, orientation, storageKey) {
        let startPos = 0;
        let startSize = 0;

        resizer.addEventListener('mousedown', function (e) {
            if (orientation === 'vertical') {
                startPos = e.clientX;
                startSize = target.offsetWidth;
                document.body.style.cursor = 'col-resize';
            } else {
                startPos = e.clientY;
                startSize = target.offsetHeight;
                document.body.style.cursor = 'row-resize';
            }

            resizer.classList.add('dragging');
            document.body.style.userSelect = 'none';

            /** @param {MouseEvent} moveE */
            function onMouseMove(moveE) {
                let delta;
                if (orientation === 'vertical') {
                    delta = moveE.clientX - startPos;
                    // For right panel, delta is inverted
                    if (resizer.id === 'resizer-right') delta = -delta;

                    const newWidth = startSize + delta;
                    const min = parseInt(getComputedStyle(target).minWidth) || 100;
                    const max = parseInt(getComputedStyle(target).maxWidth) || 800;

                    if (newWidth >= min && newWidth <= max) {
                        target.style.width = newWidth + 'px';
                        writeSavedSize(storageKey, newWidth);
                    }
                } else {
                    // Horizontal resizer (bottom panel)
                    delta = startPos - moveE.clientY; // Inverted because panel is at the bottom

                    const newHeight = startSize + delta;
                    const min = parseInt(getComputedStyle(target).minHeight) || 50;
                    const max = parseInt(getComputedStyle(target).maxHeight) || 800;

                    if (newHeight >= min && newHeight <= max) {
                        target.style.height = newHeight + 'px';
                        writeSavedSize(storageKey, newHeight);
                    }
                }

                dispatchBrowserEvent(new Event('resize'));
            }

            function onMouseUp() {
                resizer.classList.remove('dragging');
                document.body.style.cursor = 'default';
                document.body.style.userSelect = '';
                removeBrowserEventListener('mousemove', onMouseMove);
                removeBrowserEventListener('mouseup', onMouseUp);
            }

            addBrowserEventListener('mousemove', onMouseMove);
            addBrowserEventListener('mouseup', onMouseUp);
        });
    }

    const bottomResizer = /** @type {HTMLElement | null} */ (document.getElementById('resizer-bottom'));
    const codePanel = /** @type {HTMLElement | null} */ (document.querySelector('.code-panel'));

    setupResizer(leftResizer, sidebar, 'vertical', 'left');
    setupResizer(rightResizer, rightPanel, 'vertical', 'right');
    if (bottomResizer && codePanel) {
        restoreSize(codePanel, 'horizontal', 'bottom', savedSizes);
        setupResizer(bottomResizer, codePanel, 'horizontal', 'bottom');
    }
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
