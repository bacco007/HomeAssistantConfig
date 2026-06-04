import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    resetSnippetSelectionState,
    setLastSnippetHighlightRange,
    setSnippetAutoHighlight
} from '../../js/core/snippet_selection_bridge.js';

const mockEmit = vi.fn();
const mockQuickSearchOpen = vi.fn();

const mockAppState = {
    selectedWidgetIds: ['w1'],
    selectedWidgetId: 'w1',
    showGrid: false,
    showDebugGrid: false,
    showRulers: false,
    isUndoRedoInProgress: false,
    currentPage: {
        widgets: [{ id: 'w1', x: 10, y: 10, width: 20, height: 10, locked: false }]
    },
    getSelectedWidgets: vi.fn(),
    getCurrentPage: vi.fn(() => mockAppState.currentPage),
    getCanvasDimensions: vi.fn(() => ({ width: 100, height: 100 })),
    recordHistory: vi.fn(),
    updateWidgets: vi.fn(),
    setShowGrid: vi.fn((v) => { mockAppState.showGrid = v; }),
    setShowDebugGrid: vi.fn((v) => { mockAppState.showDebugGrid = v; }),
    setShowRulers: vi.fn((v) => { mockAppState.showRulers = v; }),
    selectAllWidgets: vi.fn(),
    selectWidgets: vi.fn(),
    deleteWidget: vi.fn(),
    copyWidget: vi.fn(),
    pasteWidget: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn()
};

vi.mock('../../js/core/state', () => ({
    AppState: mockAppState
}));

vi.mock('../../js/utils/logger.js', () => ({
    Logger: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

vi.mock('../../js/ui/quick_search.js', () => ({
    quickSearchInstance: {
        open: mockQuickSearchOpen
    }
}));

vi.mock('../../js/core/events.js', () => ({
    emit: mockEmit,
    EVENTS: {
        STATE_CHANGED: 'STATE_CHANGED'
    }
}));

function makeKeyEvent(overrides = {}) {
    const ev = {
        key: '',
        code: '',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        target: document.body,
        preventDefault: vi.fn(),
        ...overrides
    };
    return ev;
}

describe('KeyboardHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockAppState.selectedWidgetIds = ['w1'];
        mockAppState.selectedWidgetId = 'w1';
        mockAppState.showGrid = false;
        mockAppState.showDebugGrid = false;
        mockAppState.showRulers = false;
        mockAppState.currentPage = {
            widgets: [{ id: 'w1', x: 10, y: 10, width: 20, height: 10, locked: false }]
        };
        mockAppState.getSelectedWidgets.mockImplementation(() => {
            const selected = new Set(mockAppState.selectedWidgetIds);
            return mockAppState.currentPage.widgets.filter((widget) => selected.has(widget.id));
        });

        document.body.innerHTML = `
            <button id="gridToggleBtn"></button>
            <button id="debugGridToggleBtn"></button>
            <button id="rulersToggleBtn"></button>
            <textarea id="snippetBox"></textarea>
            <input id="inputA" />
        `;

        resetSnippetSelectionState();
        setSnippetAutoHighlight(true);
        setLastSnippetHighlightRange({ start: 0, end: 5 });
    });

    it('opens quick search on Shift+Space even from input fields', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const input = document.getElementById('inputA');
        const blurSpy = vi.spyOn(input, 'blur');

        const ev = makeKeyEvent({ shiftKey: true, code: 'Space', target: input });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).toHaveBeenCalled();
        expect(blurSpy).toHaveBeenCalled();
        expect(mockQuickSearchOpen).toHaveBeenCalled();
    });

    it('deletes selection with Delete key outside inputs', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const ev = makeKeyEvent({ key: 'Delete', target: document.body });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).toHaveBeenCalled();
        expect(mockAppState.deleteWidget).toHaveBeenCalledWith(null);
    });

    it('leaves snippet text deletion alone even when auto-highlight metadata exists', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();
        const snippet = /** @type {HTMLTextAreaElement} */ (document.getElementById('snippetBox'));
        snippet.value = 'hello';
        snippet.setSelectionRange(0, 5);

        const ev = makeKeyEvent({ key: 'Delete', target: snippet });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.deleteWidget).not.toHaveBeenCalled();
    });

    it('does not hijack delete while typing in ordinary inputs', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();
        const input = document.getElementById('inputA');

        const ev = makeKeyEvent({ key: 'Delete', target: input });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.deleteWidget).not.toHaveBeenCalled();
    });

    it('nudges selected widgets by one pixel with arrow keys', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const ev = makeKeyEvent({ key: 'ArrowRight', target: document.body });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).toHaveBeenCalled();
        expect(mockAppState.currentPage.widgets[0]).toMatchObject({ x: 11, y: 10 });
        expect(mockAppState.recordHistory).toHaveBeenCalled();
        expect(mockEmit).toHaveBeenCalledWith('STATE_CHANGED');
    });

    it('nudges selected widgets by ten pixels when Shift is held', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const ev = makeKeyEvent({ key: 'ArrowDown', shiftKey: true, target: document.body });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).toHaveBeenCalled();
        expect(mockAppState.currentPage.widgets[0]).toMatchObject({ x: 10, y: 20 });
        expect(mockAppState.recordHistory).toHaveBeenCalled();
    });

    it('nudges selected groups together with their children', async () => {
        mockAppState.selectedWidgetIds = ['group_1'];
        mockAppState.currentPage = {
            widgets: [
                { id: 'group_1', type: 'group', x: 20, y: 20, width: 40, height: 40, locked: false },
                { id: 'child_1', parentId: 'group_1', x: 25, y: 25, width: 10, height: 10, locked: false },
                { id: 'w2', x: 80, y: 80, width: 10, height: 10, locked: false }
            ]
        };
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        handler.handleKeyDown(makeKeyEvent({ key: 'ArrowUp', target: document.body }));

        expect(mockAppState.currentPage.widgets[0]).toMatchObject({ x: 20, y: 19 });
        expect(mockAppState.currentPage.widgets[1]).toMatchObject({ x: 25, y: 24 });
        expect(mockAppState.currentPage.widgets[2]).toMatchObject({ x: 80, y: 80 });
    });

    it('leaves arrow key navigation alone inside editable fields', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();
        const input = document.getElementById('inputA');

        const ev = makeKeyEvent({ key: 'ArrowRight', target: input });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.currentPage.widgets[0]).toMatchObject({ x: 10, y: 10 });
        expect(mockAppState.recordHistory).not.toHaveBeenCalled();
    });

    it('leaves native snippet copy and paste alone even when auto-highlight is active', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const snippet = /** @type {HTMLTextAreaElement} */ (document.getElementById('snippetBox'));

        const copyEv = makeKeyEvent({ key: 'c', metaKey: true, target: snippet });
        handler.handleKeyDown(copyEv);
        expect(copyEv.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.copyWidget).not.toHaveBeenCalled();

        const pasteEv = makeKeyEvent({ key: 'v', metaKey: true, target: snippet });
        handler.handleKeyDown(pasteEv);
        expect(pasteEv.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.pasteWidget).not.toHaveBeenCalled();
    });

    it('leaves native copy and paste alone when snippet auto-highlight is disabled', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();
        const snippet = /** @type {HTMLTextAreaElement} */ (document.getElementById('snippetBox'));
        setSnippetAutoHighlight(false);

        const copyEv = makeKeyEvent({ key: 'c', ctrlKey: true, target: snippet });
        handler.handleKeyDown(copyEv);
        const pasteEv = makeKeyEvent({ key: 'v', ctrlKey: true, target: snippet });
        handler.handleKeyDown(pasteEv);

        expect(copyEv.preventDefault).not.toHaveBeenCalled();
        expect(pasteEv.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.copyWidget).not.toHaveBeenCalled();
        expect(mockAppState.pasteWidget).not.toHaveBeenCalled();
    });

    it('runs undo and redo flows and resets in-progress flag', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const undoEv = makeKeyEvent({ key: 'z', ctrlKey: true, target: document.body });
        handler.handleKeyDown(undoEv);
        expect(mockAppState.undo).toHaveBeenCalled();
        expect(mockAppState.isUndoRedoInProgress).toBe(true);

        vi.advanceTimersByTime(120);
        expect(mockAppState.isUndoRedoInProgress).toBe(false);

        const redoEv = makeKeyEvent({ key: 'y', ctrlKey: true, target: document.body });
        handler.handleKeyDown(redoEv);
        expect(mockAppState.redo).toHaveBeenCalled();
    });

    it('does not hijack undo or redo for editable fields, including the snippet box', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();
        const input = document.getElementById('inputA');
        const snippet = document.getElementById('snippetBox');

        const undoEv = makeKeyEvent({ key: 'z', ctrlKey: true, target: input });
        handler.handleKeyDown(undoEv);
        const redoEv = makeKeyEvent({ key: 'y', ctrlKey: true, target: input });
        handler.handleKeyDown(redoEv);
        const snippetUndoEv = makeKeyEvent({ key: 'z', metaKey: true, target: snippet });
        handler.handleKeyDown(snippetUndoEv);

        expect(undoEv.preventDefault).not.toHaveBeenCalled();
        expect(redoEv.preventDefault).not.toHaveBeenCalled();
        expect(snippetUndoEv.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.undo).not.toHaveBeenCalled();
        expect(mockAppState.redo).not.toHaveBeenCalled();
    });

    it('toggles lock/grid/debug/rulers and updates UI button states', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const lockEv = makeKeyEvent({ key: 'l', ctrlKey: true, target: document.body });
        handler.handleKeyDown(lockEv);
        expect(mockAppState.updateWidgets).toHaveBeenCalledWith(['w1'], { locked: true });

        const gridEv = makeKeyEvent({ key: 'g', target: document.body });
        handler.handleKeyDown(gridEv);
        expect(mockAppState.setShowGrid).toHaveBeenCalledWith(true);
        expect(document.getElementById('gridToggleBtn')?.classList.contains('active')).toBe(true);
        expect(mockEmit).toHaveBeenCalledWith('STATE_CHANGED');

        const debugEv = makeKeyEvent({ key: 'd', target: document.body });
        handler.handleKeyDown(debugEv);
        expect(mockAppState.setShowDebugGrid).toHaveBeenCalledWith(true);
        expect(document.getElementById('debugGridToggleBtn')?.classList.contains('active')).toBe(true);

        const rulersEv = makeKeyEvent({ key: 'r', target: document.body });
        handler.handleKeyDown(rulersEv);
        expect(mockAppState.setShowRulers).toHaveBeenCalledWith(true);
        expect(document.getElementById('rulersToggleBtn')?.classList.contains('active')).toBe(true);
    });

    it('selects all widgets outside editable fields and validates static input detection', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const selectAllEv = makeKeyEvent({ key: 'a', ctrlKey: true, target: document.body });
        handler.handleKeyDown(selectAllEv);

        expect(selectAllEv.preventDefault).toHaveBeenCalled();
        expect(mockAppState.selectAllWidgets).toHaveBeenCalled();
        expect(KeyboardHandler.isInput(document.getElementById('snippetBox'))).toBe(true);
        expect(KeyboardHandler.isInput(document.body)).toBe(false);
        expect(KeyboardHandler.isInput(null)).toBe(false);
    });

    it('leaves native copy alone when a DOM text selection exists outside inputs', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();
        const selectionSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
            isCollapsed: false,
            toString: () => 'ESPHome Designer'
        });

        const ev = makeKeyEvent({ key: 'c', metaKey: true, target: document.body });
        handler.handleKeyDown(ev);

        expect(ev.preventDefault).not.toHaveBeenCalled();
        expect(mockAppState.copyWidget).not.toHaveBeenCalled();
        selectionSpy.mockRestore();
    });

    it('handles Escape by blurring input and clearing selection', async () => {
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        const handler = new KeyboardHandler();

        const input = document.getElementById('inputA');
        const blurSpy = vi.spyOn(input, 'blur');
        input.focus();

        const escEv = makeKeyEvent({ key: 'Escape', target: input });
        handler.handleKeyDown(escEv);

        expect(blurSpy).toHaveBeenCalled();
        expect(mockAppState.selectWidgets).toHaveBeenCalledWith([]);
        expect(mockEmit).toHaveBeenCalledWith('STATE_CHANGED');
    });

    it('handles copy, paste, and undo from real canvas keydown events', async () => {
        document.body.innerHTML += '<div id="canvas" tabindex="-1"></div>';
        const { KeyboardHandler } = await import('../../js/core/keyboard.js');
        new KeyboardHandler();

        const canvas = /** @type {HTMLElement} */ (document.getElementById('canvas'));
        canvas.focus();

        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true }));
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true }));
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));

        expect(mockAppState.copyWidget).toHaveBeenCalledTimes(1);
        expect(mockAppState.pasteWidget).toHaveBeenCalledTimes(1);
        expect(mockAppState.undo).toHaveBeenCalledTimes(1);
    });
});
