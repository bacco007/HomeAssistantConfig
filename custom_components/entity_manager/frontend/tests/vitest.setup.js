import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock localStorage — jsdom's implementation may be absent or non-functional in
// some Vitest environments (e.g. when --localstorage-file flag is present).
const _lsData = {};
global.localStorage = {
  getItem: (key) => Object.prototype.hasOwnProperty.call(_lsData, key) ? _lsData[key] : null,
  setItem: (key, val) => { _lsData[key] = String(val); },
  removeItem: (key) => { delete _lsData[key]; },
  clear: () => { Object.keys(_lsData).forEach(k => delete _lsData[k]); },
  get length() { return Object.keys(_lsData).length; },
  key: (i) => Object.keys(_lsData)[i] ?? null,
};

// Mock fetch — prevents CSS link errors when the panel loads its stylesheet
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  text: () => Promise.resolve(''),
});

// requestAnimationFrame polyfill — jsdom doesn't implement it
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = clearTimeout;
}

// performance.now polyfill
if (!global.performance) {
  global.performance = { now: () => Date.now() };
}

// CSS.escape polyfill
if (!global.CSS) {
  global.CSS = {
    escape: (s) => String(s).replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1'),
  };
}

// Load the panel into the jsdom window scope so customElements.get() works in tests
const panelCode = readFileSync(
  resolve(__dirname, '../entity-manager-panel.js'),
  'utf8',
);
window.eval(panelCode);
