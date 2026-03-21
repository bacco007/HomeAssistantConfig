/**
 * Entity Manager Panel – Vitest unit tests
 *
 * Run:  npm test
 *
 * The vitest.setup.js file evals entity-manager-panel.js into the jsdom window
 * before these tests run, so customElements.get('entity-manager-panel') works.
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockHass = {
  callWS: vi.fn().mockResolvedValue({}),
  states: {
    'light.living_room': {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: { friendly_name: 'Living Room Light' },
      last_changed: new Date(Date.now() - 60_000).toISOString(),
      last_updated: new Date(Date.now() - 60_000).toISOString(),
    },
  },
  auth: { data: { hassUrl: 'http://localhost:8123' } },
};

// ---------------------------------------------------------------------------
// Panel instance factory
// ---------------------------------------------------------------------------

let Panel;

beforeAll(() => {
  Panel = customElements.get('entity-manager-panel');
  if (!Panel) throw new Error('entity-manager-panel not registered — check vitest.setup.js');
});

function makePanel() {
  const el = new Panel();
  // Bypass the setter to avoid triggering updateView() before the element is
  // connected to the DOM.
  el._hass = { ...mockHass, callWS: vi.fn().mockResolvedValue({}) };
  return el;
}

// ---------------------------------------------------------------------------
// _formatTimeDiff
// ---------------------------------------------------------------------------

describe('_formatTimeDiff(ms)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('returns "?" for null', () => {
    expect(el._formatTimeDiff(null)).toBe('?');
  });

  it('returns "?" for NaN', () => {
    expect(el._formatTimeDiff(NaN)).toBe('?');
  });

  it('formats seconds correctly', () => {
    expect(el._formatTimeDiff(5_000)).toBe('5s');
    expect(el._formatTimeDiff(59_000)).toBe('59s');
  });

  it('formats minutes correctly', () => {
    expect(el._formatTimeDiff(60_000)).toBe('1m');
    expect(el._formatTimeDiff(90_000)).toBe('1m');
    expect(el._formatTimeDiff(3_599_000)).toBe('59m');
  });

  it('formats hours correctly', () => {
    expect(el._formatTimeDiff(3_600_000)).toBe('1h');
    expect(el._formatTimeDiff(86_399_000)).toBe('23h');
  });

  it('formats days correctly', () => {
    expect(el._formatTimeDiff(86_400_000)).toBe('1 day');
    expect(el._formatTimeDiff(2 * 86_400_000)).toBe('2 days');
    // 7 days = 1 week (the function switches to weeks at 7+ days)
    expect(el._formatTimeDiff(7 * 86_400_000)).toBe('1 week');
  });
});

// ---------------------------------------------------------------------------
// _fmtAgo
// ---------------------------------------------------------------------------

describe('_fmtAgo(isoStr, fallback)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('returns default fallback "Never" for null', () => {
    expect(el._fmtAgo(null)).toBe('Never');
  });

  it('returns custom fallback for null', () => {
    expect(el._fmtAgo(null, 'Unknown')).toBe('Unknown');
  });

  it('returns "just now" or a time-ago string for a recent timestamp', () => {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const result = el._fmtAgo(oneMinuteAgo);
    // Should be something like "1m ago" — not the fallback
    expect(result).not.toBe('Never');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains "ago" suffix for past dates', () => {
    const tenMinutesAgo = new Date(Date.now() - 600_000).toISOString();
    expect(el._fmtAgo(tenMinutesAgo)).toContain('ago');
  });
});

// ---------------------------------------------------------------------------
// _escapeHtml / _escapeAttr
// ---------------------------------------------------------------------------

describe('_escapeHtml(str)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('escapes < and >', () => {
    expect(el._escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes ampersand', () => {
    expect(el._escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes double quotes', () => {
    expect(el._escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('passes through plain strings unchanged', () => {
    expect(el._escapeHtml('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(el._escapeHtml('')).toBe('');
  });
});

describe('_escapeAttr(str)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('escapes double quotes in attribute values', () => {
    const result = el._escapeAttr('say "hello"');
    expect(result).not.toContain('"');
  });

  it('handles plain strings', () => {
    expect(el._escapeAttr('sensor.temperature')).toBe('sensor.temperature');
  });
});

// ---------------------------------------------------------------------------
// _collGroup
// ---------------------------------------------------------------------------

describe('_collGroup(label, bodyHtml)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('returns a non-empty HTML string', () => {
    const html = el._collGroup('My Section', '<p>content</p>');
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('includes the label text', () => {
    const html = el._collGroup('Automations (5)', '<div>body</div>');
    expect(html).toContain('Automations (5)');
  });

  it('includes the body HTML', () => {
    const html = el._collGroup('Label', '<span id="inner">content</span>');
    expect(html).toContain('id="inner"');
    expect(html).toContain('content');
  });

  it('includes the em-collapsible class for listener attachment', () => {
    const html = el._collGroup('Label', '<div></div>');
    expect(html).toContain('em-collapsible');
  });

  it('produces a collapse arrow element', () => {
    const html = el._collGroup('Label', '<div></div>');
    // Arrow is either .em-collapse-arrow or .em-collapsible-icon
    const hasArrow = html.includes('em-collapse-arrow') || html.includes('em-collapsible-icon');
    expect(hasArrow).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// _reAttachCollapsibles
// ---------------------------------------------------------------------------

describe('_reAttachCollapsibles(root, opts)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  function buildRoot(bodyDisplay = '') {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="em-collapsible">
        Header
        <span class="em-collapse-arrow"></span>
      </div>
      <div class="em-group-body" style="display:${bodyDisplay}">Body content</div>
    `;
    return root;
  }

  it('toggles body visibility on header click (hide)', () => {
    const root = buildRoot('');
    el._reAttachCollapsibles(root);

    const header = root.querySelector('.em-collapsible');
    const body = root.querySelector('.em-group-body');

    expect(body.style.display).toBe('');
    header.click();
    expect(body.style.display).toBe('none');
  });

  it('toggles body visibility on header click (show again)', () => {
    const root = buildRoot('');
    el._reAttachCollapsibles(root);

    const header = root.querySelector('.em-collapsible');
    const body = root.querySelector('.em-group-body');

    header.click(); // hide
    header.click(); // show
    expect(body.style.display).toBe('');
  });

  it('expands a collapsed body when { expand: true }', () => {
    const root = buildRoot('none');
    el._reAttachCollapsibles(root, { expand: true });
    const body = root.querySelector('.em-group-body');
    expect(body.style.display).toBe('');
  });

  it('resets arrow transform when { expand: true }', () => {
    const root = buildRoot('none');
    const arrow = root.querySelector('.em-collapse-arrow');
    arrow.style.transform = 'rotate(-90deg)';
    el._reAttachCollapsibles(root, { expand: true });
    expect(arrow.style.transform).toBe('');
  });

  it('respects a custom selector', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="custom-toggle">Header</div>
      <div style="">Body</div>
      <div class="em-collapsible">Other</div>
      <div style="">Other body</div>
    `;
    el._reAttachCollapsibles(root, { selector: '.custom-toggle' });

    // Only the custom-toggle should have a click listener
    root.querySelector('.custom-toggle').click();
    expect(root.querySelector('div:nth-child(2)').style.display).toBe('none');
    // .em-collapsible should NOT be wired
    root.querySelector('.em-collapsible').click();
    expect(root.querySelector('div:nth-child(4)').style.display).toBe('');
  });
});

// ---------------------------------------------------------------------------
// _animateStatCounters — RAF cancellation guard
// ---------------------------------------------------------------------------

describe('_animateStatCounters()', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('cancels an existing RAF before starting a new animation', () => {
    const cancelSpy = vi.spyOn(global, 'cancelAnimationFrame');

    // Build a container with a .stat-value whose textContent is ≥ 2 (the early-return guard)
    // and a pre-existing _animRafId to trigger the cancellation path.
    const container = document.createElement('div');
    const stat = document.createElement('span');
    stat.className = 'stat-value';
    stat.textContent = '100'; // must be >= 2 to pass the isNaN/< 2 guard
    stat._animRafId = 42;     // simulate an in-progress animation
    container.appendChild(stat);

    el._animateStatCounters(container);

    expect(cancelSpy).toHaveBeenCalledWith(42);
    cancelSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// _triggerBadge — null vs undefined distinction
// ---------------------------------------------------------------------------

describe('_triggerBadge(item)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  it('returns "Never triggered" badge when last_triggered is explicitly null', () => {
    const html = el._triggerBadge({ last_triggered: null });
    expect(html).toContain('Never triggered');
    expect(html).toContain('em-never-triggered-badge');
  });

  it('does NOT return "Never triggered" when last_triggered is undefined (field absent)', () => {
    // Template sensors have no last_triggered field (undefined, not null)
    const html = el._triggerBadge({ triggered_by: undefined });
    expect(html).not.toContain('Never triggered');
  });

  it('returns human trigger badge for triggered_by="human"', () => {
    const item = { triggered_by: 'human', triggered_by_name: 'alice' };
    const html = el._triggerBadge(item);
    expect(html).toContain('alice');
    expect(html).not.toContain('Never triggered');
  });

  it('returns automation badge for triggered_by="automation"', () => {
    const html = el._triggerBadge({ triggered_by: 'automation' });
    expect(html).toContain('Automation');
    expect(html).not.toContain('Never triggered');
  });

  it('returns system/HA badge for unknown trigger type', () => {
    const html = el._triggerBadge({ triggered_by: 'system' });
    expect(html).toContain('HA');
    expect(html).not.toContain('Never triggered');
  });
});

// ---------------------------------------------------------------------------
// _attachDialogSearch — filtering and group hiding
// ---------------------------------------------------------------------------

describe('_attachDialogSearch(root)', () => {
  let el;
  beforeEach(() => { el = makePanel(); });

  function buildSearchRoot(cards) {
    const root = document.createElement('div');
    root.innerHTML = `<input type="search" id="em-stat-search">`;
    const group = document.createElement('div');
    group.className = 'em-collapsible';
    root.appendChild(group);
    const body = document.createElement('div');
    body.className = 'em-group-body';
    root.appendChild(body);

    cards.forEach(({ id, name }) => {
      const card = document.createElement('div');
      card.className = 'em-mini-card';
      card.dataset.entityId = id;
      const nameEl = document.createElement('span');
      nameEl.className = 'entity-header-device';
      nameEl.textContent = name;
      card.appendChild(nameEl);
      body.appendChild(card);
    });
    return root;
  }

  it('adds the em-stat-search-input class to the input', () => {
    const root = buildSearchRoot([{ id: 'sensor.a', name: 'Sensor A' }]);
    el._attachDialogSearch(root);
    expect(root.querySelector('#em-stat-search').classList.contains('em-stat-search-input')).toBe(true);
  });

  it('hides cards whose entity_id does not match the search term', () => {
    const root = buildSearchRoot([
      { id: 'sensor.temperature', name: 'Temperature' },
      { id: 'light.kitchen', name: 'Kitchen Light' },
    ]);
    el._attachDialogSearch(root);
    const input = root.querySelector('#em-stat-search');
    input.value = 'temperature';
    input.dispatchEvent(new Event('input'));

    const cards = root.querySelectorAll('.em-mini-card');
    expect(cards[0].style.display).toBe(''); // matches
    expect(cards[1].style.display).toBe('none'); // does not match
  });

  it('shows all cards when search is cleared', () => {
    const root = buildSearchRoot([
      { id: 'sensor.foo', name: 'Foo' },
      { id: 'sensor.bar', name: 'Bar' },
    ]);
    el._attachDialogSearch(root);
    const input = root.querySelector('#em-stat-search');

    input.value = 'foo';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));

    root.querySelectorAll('.em-mini-card').forEach(card => {
      expect(card.style.display).not.toBe('none');
    });
  });

  it('hides group header when all cards in the group are hidden', () => {
    const root = buildSearchRoot([{ id: 'sensor.xyz', name: 'XYZ' }]);
    el._attachDialogSearch(root);
    const input = root.querySelector('#em-stat-search');
    input.value = 'no_match_at_all';
    input.dispatchEvent(new Event('input'));

    const body = root.querySelector('.em-group-body');
    expect(body.style.display).toBe('none');
  });

  it('does nothing when there is no #em-stat-search input', () => {
    const root = document.createElement('div'); // no search input
    expect(() => el._attachDialogSearch(root)).not.toThrow();
  });
});
