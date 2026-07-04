import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLogger = {
    log: vi.fn(),
    warn: vi.fn()
};

vi.mock('../../js/utils/logger.js', () => ({
    Logger: mockLogger
}));

function setReadyState(value) {
    Object.defineProperty(document, 'readyState', {
        configurable: true,
        value
    });
}

async function loadSplittersModule() {
    vi.resetModules();
    await import('../../js/ui/splitters.js');
}

describe('splitters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        document.body.innerHTML = '';
        setReadyState('complete');
    });

    it('retries when the splitter layout is not available yet', async () => {
        const timeoutSpy = vi.spyOn(global, 'setTimeout');

        await loadSplittersModule();

        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
    });

    it('warns and retries when the app shell exists but splitter elements are still missing', async () => {
        document.body.innerHTML = `<div class="app-content"></div>`;
        const timeoutSpy = vi.spyOn(global, 'setTimeout');

        await loadSplittersModule();

        expect(mockLogger.warn).toHaveBeenCalledWith('[Splitters] Layout elements not found, retrying...');
        expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('resizes sidebar, right panel, and code panel from drag events', async () => {
        document.body.innerHTML = `
            <div class="app-content">
              <div class="sidebar" style="min-width:100px; max-width:800px;"></div>
              <div id="resizer-left"></div>
              <div class="right-panel" style="min-width:120px; max-width:700px;"></div>
              <div id="resizer-right"></div>
              <div class="code-panel" style="min-height:50px; max-height:600px;"></div>
              <div id="resizer-bottom"></div>
            </div>
        `;

        const sidebar = document.querySelector('.sidebar');
        const rightPanel = document.querySelector('.right-panel');
        const codePanel = document.querySelector('.code-panel');
        const leftResizer = document.getElementById('resizer-left');
        const rightResizer = document.getElementById('resizer-right');
        const bottomResizer = document.getElementById('resizer-bottom');
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        Object.defineProperty(sidebar, 'offsetWidth', { configurable: true, value: 300 });
        Object.defineProperty(rightPanel, 'offsetWidth', { configurable: true, value: 320 });
        Object.defineProperty(codePanel, 'offsetHeight', { configurable: true, value: 200 });

        await loadSplittersModule();

        leftResizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 160 }));
        expect(sidebar.style.width).toBe('360px');

        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(document.body.style.cursor).toBe('default');
        expect(document.body.style.userSelect).toBe('');

        rightResizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 400 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 350 }));
        expect(rightPanel.style.width).toBe('370px');

        bottomResizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 500 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientY: 450 }));
        expect(codePanel.style.height).toBe('250px');
        expect(JSON.parse(localStorage.getItem('esphome-designer-splitter-sizes'))).toMatchObject({
            left: 360,
            right: 370,
            bottom: 250
        });

        expect(mockLogger.log).toHaveBeenCalledWith('[Splitters] Initializing draggable panels...');
        expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'resize' }));
    });

    it('restores saved splitter sizes during initialization', async () => {
        localStorage.setItem('esphome-designer-splitter-sizes', JSON.stringify({
            left: 280,
            right: 360,
            bottom: 240
        }));
        document.body.innerHTML = `
            <div class="app-content">
              <div class="sidebar" style="min-width:100px; max-width:800px;"></div>
              <div id="resizer-left"></div>
              <div class="right-panel" style="min-width:120px; max-width:700px;"></div>
              <div id="resizer-right"></div>
              <div class="code-panel" style="min-height:50px; max-height:600px;"></div>
              <div id="resizer-bottom"></div>
            </div>
        `;

        await loadSplittersModule();

        expect(document.querySelector('.sidebar').style.width).toBe('280px');
        expect(document.querySelector('.right-panel').style.width).toBe('360px');
        expect(document.querySelector('.code-panel').style.height).toBe('240px');
    });

    it('ignores malformed saved splitter sizes', async () => {
        localStorage.setItem('esphome-designer-splitter-sizes', '{not json');
        document.body.innerHTML = `
            <div class="app-content">
              <div class="sidebar" style="min-width:100px; max-width:800px;"></div>
              <div id="resizer-left"></div>
              <div class="right-panel" style="min-width:120px; max-width:700px;"></div>
              <div id="resizer-right"></div>
            </div>
        `;

        await loadSplittersModule();

        expect(document.querySelector('.sidebar').style.width).toBe('');
        expect(document.querySelector('.right-panel').style.width).toBe('');
    });

    it('keeps resizing even when splitter size persistence fails', async () => {
        document.body.innerHTML = `
            <div class="app-content">
              <div class="sidebar" style="min-width:100px; max-width:800px;"></div>
              <div id="resizer-left"></div>
              <div class="right-panel" style="min-width:120px; max-width:700px;"></div>
              <div id="resizer-right"></div>
            </div>
        `;
        const sidebar = document.querySelector('.sidebar');
        const leftResizer = document.getElementById('resizer-left');
        Object.defineProperty(sidebar, 'offsetWidth', { configurable: true, value: 300 });
        const realLocalStorage = window.localStorage;
        const fakeLocalStorage = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(() => {
                throw new Error('quota exceeded');
            })
        };
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: fakeLocalStorage
        });

        await loadSplittersModule();

        leftResizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 140 }));
        window.dispatchEvent(new MouseEvent('mouseup'));

        expect(sidebar.style.width).toBe('340px');
        expect(fakeLocalStorage.setItem).toHaveBeenCalledWith(
            'esphome-designer-splitter-sizes',
            JSON.stringify({ left: 340 })
        );
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: realLocalStorage
        });
    });

    it('waits for DOMContentLoaded when the document is still loading', async () => {
        document.body.innerHTML = `
            <div class="app-content">
              <div class="sidebar" style="min-width:100px; max-width:800px;"></div>
              <div id="resizer-left"></div>
              <div class="right-panel" style="min-width:120px; max-width:700px;"></div>
              <div id="resizer-right"></div>
            </div>
        `;
        setReadyState('loading');

        await loadSplittersModule();

        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(mockLogger.log).toHaveBeenCalledWith('[Splitters] Initializing draggable panels...');
    });
});
