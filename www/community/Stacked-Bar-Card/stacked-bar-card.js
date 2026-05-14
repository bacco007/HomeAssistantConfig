// Stacked Bar Card - A stacked bar (horizontal or vertical) for Home Assistant
// Repository: https://github.com/kattcrazy/Stacked-Bar-Card
// Add type="module" to your resource:
//   - url: /local/stacked-bar-card.js
//     type: module
//
import { html, css, LitElement, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

const DEFAULT_COLORS = ['#93B5F2', '#F6B38A', '#D6D6D6', '#FFE08A', '#A8C9F0', '#A6D68A'];

function parseNumber(val) {
  if (val === null || val === undefined) return 0;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : Math.max(0, n);
}

function isTemplate(v) {
  return typeof v === 'string' && v.includes('{{') && v.includes('}}');
}

function isHardcodedNumber(v) {
  if (v == null) return false;
  const s = String(v).trim();
  return s !== '' && !isNaN(Number(s));
}

function getAtPath(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function lightenColor(color) {
  if (!color || typeof color !== 'string') return color;
  if (color.trim().startsWith('var(')) {
    return `color-mix(in srgb, ${color} 75%, white)`;
  }
  const hex = color.replace(/^#/, '');
  if (hex.length !== 6 && hex.length !== 8) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const factor = 0.35;
  const nr = Math.min(255, Math.round(r + (255 - r) * factor));
  const ng = Math.min(255, Math.round(g + (255 - g) * factor));
  const nb = Math.min(255, Math.round(b + (255 - b) * factor));
  return `rgb(${nr},${ng},${nb})`;
}

class StackedHorizontalBarCard extends LitElement {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { type: Object, state: true },
    _templateResults: { type: Object, state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this._config = null;
    this._templateResults = {};
    this._templateUnsubscribes = {};
  }

  static getConfigElement() {
    return document.createElement('stacked-bar-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:stacked-bar-card',
      entities: [],
      sort: 'highest',
      show_title: true,
      show_legend: true,
      show_state: 'legend',
      show_name: 'legend',
      show_unit: 'none',
      unit_source: 'automatic',
    };
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid config');
    const entities = Array.isArray(config.entities) ? config.entities : [];
    this._config = { ...config, entities };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    Object.values(this._templateUnsubscribes).forEach((fn) => { try { fn(); } catch (_) {} });
    this._templateUnsubscribes = {};
    this._templateResults = {};
    super.disconnectedCallback();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('_config')) {
      this._updateTemplateSubscriptions();
    }
  }

  _collectTemplates(cfg, prefix = '') {
    const out = {};
    if (!cfg || typeof cfg !== 'object') return out;
    const keys = Array.isArray(cfg) ? cfg.map((_, i) => String(i)) : Object.keys(cfg);
    for (const k of keys) {
      const v = cfg[k];
      const path = prefix ? `${prefix}.${k}` : k;
      if (isTemplate(v)) {
        out[path] = v;
      } else if (k === 'entities' && Array.isArray(v)) {
        v.forEach((ent, i) => {
          Object.assign(out, this._collectTemplates(ent, `entities.${i}`));
        });
      }
    }
    return out;
  }

  _resolve(path, fallback = undefined) {
    const raw = getAtPath(this._config, path);
    if (isTemplate(raw)) {
      const result = this._templateResults[path];
      return result !== undefined ? result : fallback;
    }
    return raw !== undefined ? raw : fallback;
  }

  async _updateTemplateSubscriptions() {
    const cfg = this._config;
    const hass = this.hass;
    if (!hass || !hass.connection || !cfg) return;

    const templates = this._collectTemplates(cfg);

    Object.keys(this._templateUnsubscribes).forEach((key) => {
      if (!(key in templates)) {
        try { this._templateUnsubscribes[key](); } catch (_) {}
        delete this._templateUnsubscribes[key];
        delete this._templateResults[key];
      }
    });

    for (const [path, template] of Object.entries(templates)) {
      if (this._templateUnsubscribes[path]) continue;

      const entityIds = [];
      const match = path.match(/^entities\.(\d+)/);
      if (match) {
        const ent = cfg.entities?.[parseInt(match[1], 10)];
        if (ent?.entity && !isTemplate(ent.entity)) entityIds.push(ent.entity);
      }

      try {
        let templateStr = String(template).trim();
        // Strip surrounding quotes that can sneak in from YAML/UI and break Jinja (treats as string literal)
        if ((templateStr.startsWith('"') && templateStr.endsWith('"')) || (templateStr.startsWith("'") && templateStr.endsWith("'"))) {
          templateStr = templateStr.slice(1, -1).trim();
        }
        const unsub = await hass.connection.subscribeMessage(
          (msg) => {
            const res = msg.result;
            this._templateResults = { ...this._templateResults, [path]: res };
            this.requestUpdate();
          },
          { type: 'render_template', template: templateStr, entity_ids: entityIds }
        );
        this._templateUnsubscribes[path] = unsub;
      } catch (_) {}
    }
  }

  _getSortedSegments() {
    const cfg = this._config;
    if (!this.hass || !cfg || !cfg.entities?.length) return [];

    const validEntities = cfg.entities
      .map((e, cfgIdx) => (e && (e.entity || isTemplate(e.entity))) ? { ...e, _cfgIdx: cfgIdx } : null)
      .filter(Boolean);
    const segments = validEntities.map((ent, i) => {
      let value;
      const rawEntity = ent.entity;
      if (isTemplate(rawEntity)) {
        value = parseNumber(this._resolve(`entities.${ent._cfgIdx}.entity`));
      } else if (isHardcodedNumber(rawEntity)) {
        value = parseNumber(rawEntity);
      } else {
        const state = rawEntity ? this.hass.states[rawEntity] : null;
        value = state ? parseNumber(state.state) : 0;
      }
      const name = this._resolve(`entities.${ent._cfgIdx}.name`);
      const fallbackName = !isTemplate(rawEntity) && rawEntity ? (this.hass.states[rawEntity]?.attributes?.friendly_name || rawEntity) : null;
      const resolvedName = name != null && name !== '' ? name : (fallbackName || 'Segment');
      const color = this._resolve(`entities.${ent._cfgIdx}.color`) || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const order = this._resolve(`entities.${ent._cfgIdx}.order`);
      return {
        entity: rawEntity || '',
        name: resolvedName,
        value,
        color,
        order: order != null ? order : ent._cfgIdx,
      };
    });

    const sort = this._resolve('sort') || 'highest';
    segments.sort((a, b) => {
      if (sort === 'custom') return (a.order ?? 0) - (b.order ?? 0);
      if (sort === 'abc') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'cba') return (b.name || '').localeCompare(a.name || '');
      if (sort === 'highest') return b.value - a.value;
      if (sort === 'lowest') return a.value - b.value;
      return 0;
    });

    return segments;
  }

  _getDisplayUnit(seg) {
    const source = this._resolve('unit_source') || 'automatic';
    if (source === 'custom') {
      const u = this._resolve('unit_custom');
      return u != null && String(u).trim() !== '' ? String(u).trim() : '';
    }
    const id = seg.entity;
    if (!id || isTemplate(id) || isHardcodedNumber(id)) return '';
    const st = this.hass?.states?.[id];
    const u = st?.attributes?.unit_of_measurement;
    return u != null && String(u).trim() !== '' ? String(u).trim() : '';
  }

  _getCardContent() {
    const cfg = this._config;
    const segments = this._getSortedSegments();
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const barRadiusRaw = this._resolve('bar_radius');
    const barRadius = barRadiusRaw != null && barRadiusRaw !== '' ? barRadiusRaw : 'var(--ha-card-border-radius, 12px)';
    const fillCard = this._resolve('fill_card') === true || this._resolve('remove_background') === true;
    let showState = this._resolve('show_state') || 'legend';
    if (fillCard) {
      if (showState === 'legend') showState = 'none';
      else if (showState === 'both') showState = 'bar';
    }
    let showUnit = this._resolve('show_unit') || 'none';
    if (fillCard) {
      if (showUnit === 'legend') showUnit = 'none';
      else if (showUnit === 'both') showUnit = 'bar';
    }
    if (showState === 'none') showUnit = 'none';
    let showName = this._resolve('show_name') || 'legend';
    if (fillCard) {
      if (showName === 'legend') showName = 'none';
      else if (showName === 'both') showName = 'bar';
    }
    const showLegend = this._resolve('show_legend') !== false;
    const legendSegments = segments;
    const showInLegend = (showState === 'legend' || showState === 'both') && showLegend;
    const showOnBar = showState === 'bar' || showState === 'both' || (showState === 'legend' && !showLegend);
    const showNameInLegend = (showName === 'legend' || showName === 'both') && showLegend;
    const showNameOnBar = showName === 'bar' || showName === 'both' || (showName === 'legend' && !showLegend);
    const showUnitInLegend = (showUnit === 'legend' || showUnit === 'both') && showLegend;
    const showUnitOnBar = showUnit === 'bar' || showUnit === 'both' || (showUnit === 'legend' && !showLegend);
    /** Omit legend row entirely when nothing is configured to appear there (avoids empty swatches). */
    const renderLegendStrip = showInLegend || showNameInLegend || showUnitInLegend;
    const alignment = this._resolve('alignment') ?? this._resolve('title_alignment') ?? this._resolve('legend_alignment') ?? 'left';

    if (segments.length === 0 || total <= 0) {
      const noBg = fillCard;
      return html`
        <div class="card-content empty ${noBg ? 'no-bg' : ''}">
          <span class="empty-text">No data</span>
        </div>
      `;
    }

    const barRadiusPx = typeof barRadius === 'number' ? `${barRadius}px` : String(barRadius);
    const gradient = this._resolve('gradient') || 'none';
    const layout = this._resolve('layout') || 'horizontal';
    const isVertical = layout === 'vertical';
    const barEls = segments.map((seg, i) => {
      const pct = (seg.value / total) * 100;
      const isFirst = i === 0;
      const isLast = i === segments.length - 1;
      const radius = isVertical
        ? `${isLast ? barRadiusPx : 0} ${isLast ? barRadiusPx : 0} ${isFirst ? barRadiusPx : 0} ${isFirst ? barRadiusPx : 0}`
        : `${isFirst ? barRadiusPx : 0} ${isLast ? barRadiusPx : 0} ${isLast ? barRadiusPx : 0} ${isFirst ? barRadiusPx : 0}`;
      let bg = seg.color;
      const light = lightenColor(seg.color);
      if (gradient === 'left') bg = `linear-gradient(90deg, ${seg.color}, ${light})`;
      else if (gradient === 'right') bg = `linear-gradient(90deg, ${light}, ${seg.color})`;
      else if (gradient === 'top') bg = `linear-gradient(180deg, ${seg.color}, ${light})`;
      else if (gradient === 'bottom') bg = `linear-gradient(0deg, ${seg.color}, ${light})`;
      const sizeProp = isVertical ? 'height' : 'width';
      const unitStr = showUnitOnBar || showUnitInLegend ? this._getDisplayUnit(seg) : '';
      const tip = unitStr ? `${seg.name}: ${seg.value} ${unitStr}` : `${seg.name}: ${seg.value}`;
      const minPctBar =
        showNameOnBar && showOnBar ? 14 : showNameOnBar ? 12 : 8;
      const showBarBlock = (showNameOnBar || showOnBar) && pct > minPctBar;
      const barLabel = showBarBlock
        ? html`<div class="segment-inner">
            ${showNameOnBar ? html`<span class="segment-name">${seg.name}</span>` : nothing}
            ${showOnBar
              ? html`<span class="segment-value">${seg.value}${showUnitOnBar && unitStr ? ` ${unitStr}` : ''}</span>`
              : nothing}
          </div>`
        : nothing;
      return html`
        <div class="segment" style="${sizeProp}:${pct}%;background:${bg};border-radius:${radius}" title="${tip}">
          ${barLabel}
        </div>
      `;
    });

    const legendEl = renderLegendStrip
      ? html`
          <div class="legend" style="justify-content:${alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'}">
            ${legendSegments.map(
              (seg) => {
                let swatchBg = seg.color;
                const light = lightenColor(seg.color);
                if (gradient === 'left') swatchBg = `linear-gradient(90deg, ${seg.color}, ${light})`;
                else if (gradient === 'right') swatchBg = `linear-gradient(90deg, ${light}, ${seg.color})`;
                else if (gradient === 'top') swatchBg = `linear-gradient(180deg, ${seg.color}, ${light})`;
                else if (gradient === 'bottom') swatchBg = `linear-gradient(0deg, ${seg.color}, ${light})`;
                const unitStrL = showUnitInLegend ? this._getDisplayUnit(seg) : '';
                let legendText = '';
                if (showNameInLegend) legendText = seg.name;
                if (showInLegend) {
                  if (legendText) legendText += `: ${seg.value}`;
                  else legendText = String(seg.value);
                }
                if (showUnitInLegend && unitStrL) legendText += legendText ? ` ${unitStrL}` : unitStrL;
                return html`
                <div class="legend-item">
                  <span class="legend-swatch" style="background:${swatchBg};border-radius:${barRadiusPx}"></span>
                  <span class="legend-label">${legendText}</span>
                </div>
              `;
              }
            )}
          </div>
        `
      : nothing;

    const showTitle = this._resolve('show_title') !== false;
    const titleVal = this._resolve('title');
    const hasTitle = showTitle && titleVal != null && titleVal !== '';
    const titleEl = hasTitle
      ? html`<div class="card-title" style="text-align:${alignment}">${titleVal}</div>`
      : nothing;

    const titlePos = this._resolve('title_position') || 'top';
    const legendPos = this._resolve('legend_position') || 'bottom';

    const topParts = [];
    if (!fillCard && titlePos === 'top' && hasTitle) topParts.push(titleEl);
    if (!fillCard && legendPos === 'top' && renderLegendStrip) topParts.push(legendEl);
    const bottomParts = [];
    if (!fillCard && legendPos === 'bottom' && renderLegendStrip) bottomParts.push(legendEl);
    if (!fillCard && titlePos === 'bottom' && hasTitle) bottomParts.push(titleEl);
    const topBlock = topParts.length ? html`${topParts}` : null;
    const bottomBlock = bottomParts.length ? html`${bottomParts}` : null;
    const barStyle = 'flex:1 1 0;min-height:24px;overflow:hidden';
    const barDirection = isVertical ? ';flex-direction:column-reverse' : '';

    return html`
      <div class="card-content ${fillCard ? 'no-bg' : ''}">
        <div class="card-inner">
          ${topBlock ? html`<div class="top">${topBlock}</div>` : nothing}
          <div class="bar-container" style="${barStyle};border-radius:${barRadiusPx}">
            <div class="bar" style="border-radius:${barRadiusPx}${barDirection}">${barEls}</div>
            ${gradient === 'inset' ? html`<div class="inset-overlay" style="border-radius:${barRadiusPx};background:linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 40%), linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 40%), linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 40%), linear-gradient(to left, rgba(0,0,0,0.12) 0%, transparent 40%)"></div>` : gradient === 'bevel' ? html`<div class="inset-overlay" style="border-radius:${barRadiusPx};background:linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 40%), linear-gradient(to top, rgba(255,255,255,0.12) 0%, transparent 40%), linear-gradient(to right, rgba(255,255,255,0.12) 0%, transparent 40%), linear-gradient(to left, rgba(255,255,255,0.12) 0%, transparent 40%)"></div>` : nothing}
          </div>
          ${bottomBlock ? html`<div class="bottom">${bottomBlock}</div>` : nothing}
        </div>
      </div>
    `;
  }

  render() {
    if (!this._config) return nothing;
    const fillCard = this._resolve('fill_card') === true || this._resolve('remove_background') === true;
    return html` <ha-card class="${fillCard ? 'no-bg' : ''}">${this._getCardContent()}</ha-card> `;
  }

  static styles = css`
    ha-card {
      background: var(--ha-card-background, var(--card-background-color, var(--sidebar-background-color)));
      border-radius: var(--ha-card-border-radius, 12px);
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    ha-card.no-bg {
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      border: none;
    }
    .card-content {
      padding: 12px 16px;
      color: var(--primary-text-color);
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      align-items: stretch;
    }
    .card-content:not(.empty) {
      justify-content: center;
    }
    .card-content.no-bg {
      padding: 0;
    }
    .card-inner {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      align-items: stretch;
      justify-content: center;
      width: 100%;
    }
    .card-content.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
      flex: 1;
    }
    .empty-text {
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }
    .card-title:last-child {
      margin-bottom: 0;
    }
    .top {
      margin-bottom: 12px;
      flex-shrink: 0;
      width: 100%;
    }
    .bar-container {
      width: 100%;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
    }
    .inset-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .bottom {
      margin-top: 12px;
      flex-shrink: 0;
      width: 100%;
    }
    .bar {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .segment {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 0;
      transition: width 0.3s ease, height 0.3s ease;
    }
    .segment-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 0;
      max-width: 100%;
      gap: 2px;
    }
    .segment-name {
      font-size: calc(var(--ha-font-size-s, 12px) - 1px);
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      padding: 0 4px;
      line-height: 1.1;
    }
    .segment-value {
      font-size: var(--ha-font-size-m);
      font-weight: var(--ha-font-weight-body);
      color: rgba(0, 0, 0, 0.7);
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      padding: 0 4px;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
      width: 100%;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      color: var(--primary-text-color);
    }
  `;
}

customElements.define('stacked-bar-card', StackedHorizontalBarCard);

// Editor
class StackedHorizontalBarCardEditor extends LitElement {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { type: Object, state: true },
    _expandedEntities: { type: Object, state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this._config = {};
    this._expandedEntities = {};
  }

  _toggleEntityExpand(i) {
    const ent = this._config.entities?.[i];
    const currentlyExpanded = this._expandedEntities[i] ?? isTemplate(ent?.entity);
    this._expandedEntities = { ...this._expandedEntities, [i]: !currentlyExpanded };
  }

  setConfig(config) {
    this._config = config || {};
    if (!Array.isArray(this._config.entities)) {
      this._config.entities = [];
    }
  }

  _fire(type, detail) {
    const event = new Event(type, { bubbles: true, cancelable: false, composed: true });
    event.detail = detail;
    this.dispatchEvent(event);
  }

  _valueChanged(field, value) {
    const cfg = { ...this._config };
    if (value === '' || value === null || value === undefined) {
      delete cfg[field];
    } else {
      cfg[field] = value;
    }
    this._config = cfg;
    this._fire('config-changed', { config: cfg });
  }

  _entityChanged(index, field, value) {
    const entities = [...(this._config.entities || [])];
    if (!entities[index]) entities[index] = { entity: '' };
    if (value === '' || value === null || value === undefined) {
      delete entities[index][field];
    } else {
      entities[index][field] = value;
    }
    if (field === 'entity' && value === '') {
      entities.splice(index, 1);
    } else {
      this._valueChanged('entities', entities);
    }
  }

  _addEntity() {
    const entities = [...(this._config.entities || []), { entity: '' }];
    this._valueChanged('entities', entities);
  }

  _removeEntity(index) {
    const entities = [...(this._config.entities || [])];
    entities.splice(index, 1);
    this._valueChanged('entities', entities);
  }

  _getEntityOptions() {
    if (!this.hass || !this.hass.states) return [];
    return Object.keys(this.hass.states).sort();
  }

  render() {
    const c = this._config;
    const entities = c.entities || [];
    const entityOptions = this._getEntityOptions();

    const fillCard = !!(c.fill_card || c.remove_background);
    const showTitle = c.show_title !== false;
    const showLegend = c.show_legend !== false;

    return html`
      <div class="editor">
        ${!fillCard ? html`
        <div class="section">
          <div class="section-header">Title</div>
          <div class="option-row option-row-toggle">
            <label class="toggle-row">
              <span class="toggle-label">Show title</span>
              <span class="toggle-switch">
                <input
                  type="checkbox"
                  class="toggle-input"
                  .checked=${showTitle}
                  @change=${(e) => this._valueChanged('show_title', e.target.checked)}
                />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>
          </div>
          ${showTitle ? html`
          <div class="option-row">
            <label class="option-label">Title</label>
            <input
              type="text"
              class="input"
              .value=${c.title ?? ''}
              placeholder="Card title"
              @input=${(e) => this._valueChanged('title', e.target.value)}
            />
          </div>
          <div class="option-row">
            <label class="option-label">Position</label>
            <select
              class="select"
              .value=${c.title_position ?? 'top'}
              @change=${(e) => this._valueChanged('title_position', e.target.value)}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          ` : nothing}
        </div>

        <div class="section">
          <div class="section-header">Legend</div>
          <div class="option-row option-row-toggle">
            <label class="toggle-row">
              <span class="toggle-label">Show legend</span>
              <span class="toggle-switch">
                <input
                  type="checkbox"
                  class="toggle-input"
                  .checked=${showLegend}
                  @change=${(e) => this._valueChanged('show_legend', e.target.checked)}
                />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>
          </div>
          ${showLegend
            ? html`
                <div class="option-row">
                  <label class="option-label">Legend position</label>
                  <select
                    class="select"
                    .value=${c.legend_position ?? 'bottom'}
                    @change=${(e) => this._valueChanged('legend_position', e.target.value)}
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
                <div class="option-help">
                  The legend row (including swatches) is hidden when name, state, and unit are all on the bar or off.
                </div>
              `
            : nothing}
          <div class="option-row section-subheader">Options</div>
          <div class="option-row">
            <label class="option-label">Show name</label>
            <select
              class="select"
              .value=${c.show_name ?? 'legend'}
              @change=${(e) => this._valueChanged('show_name', e.target.value)}
            >
              <option value="bar">On bar</option>
              <option value="legend">In legend</option>
              <option value="both">Both</option>
              <option value="none">Neither</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Show state</label>
            <select
              class="select"
              .value=${c.show_state ?? 'legend'}
              @change=${(e) => this._valueChanged('show_state', e.target.value)}
            >
              <option value="bar">On bar</option>
              <option value="legend">In legend</option>
              <option value="both">Both</option>
              <option value="none">Neither</option>
            </select>
          </div>
          ${(c.show_state ?? 'legend') !== 'none'
            ? html`
                <div class="option-row">
                  <label class="option-label">Show unit</label>
                  <select
                    class="select"
                    .value=${c.show_unit ?? 'none'}
                    @change=${(e) => this._valueChanged('show_unit', e.target.value)}
                  >
                    <option value="bar">On bar</option>
                    <option value="legend">In legend</option>
                    <option value="both">Both</option>
                    <option value="none">Neither</option>
                  </select>
                </div>
                <div class="option-row">
                  <label class="option-label">Unit source</label>
                  <select
                    class="select"
                    .value=${c.unit_source ?? 'automatic'}
                    @change=${(e) => this._valueChanged('unit_source', e.target.value)}
                  >
                    <option value="automatic">Automatic</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                ${(c.unit_source ?? 'automatic') === 'custom'
                  ? html`
                      <div class="option-row">
                        <label class="option-label">Custom unit</label>
                        <input
                          type="text"
                          class="input"
                          .value=${c.unit_custom ?? ''}
                          placeholder="e.g. kWh, %"
                          @input=${(e) => this._valueChanged('unit_custom', e.target.value)}
                        />
                      </div>
                    `
                  : nothing}
              `
            : nothing}
        </div>
        ` : nothing}

        <div class="section">
          <div class="section-header">Bar</div>
          <div class="option-row">
            <label class="option-label">Sort</label>
            <select class="select" .value=${c.sort ?? 'highest'} @change=${(e) => this._valueChanged('sort', e.target.value)}>
              <option value="abc">A–Z</option>
              <option value="cba">Z–A</option>
              <option value="highest">Highest first</option>
              <option value="lowest">Lowest first</option>
              <option value="custom">Custom (use order)</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Gradient</label>
            <select
              class="select"
              .value=${c.gradient ?? 'none'}
              @change=${(e) => this._valueChanged('gradient', e.target.value)}
            >
              <option value="none">None</option>
              <option value="inset">Inset</option>
              <option value="bevel">Bevel</option>
              <option value="left">Left to right</option>
              <option value="right">Right to left</option>
              <option value="top">Top to bottom</option>
              <option value="bottom">Bottom to top</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Radius (px)</label>
            <input
              type="number"
              class="input"
              min="0"
              max="24"
              .value=${c.bar_radius != null && c.bar_radius !== '' ? c.bar_radius : ''}
              placeholder="Theme default"
              @input=${(e) => {
                const v = e.target.value.trim();
                this._valueChanged('bar_radius', v === '' ? undefined : parseInt(v) || 0);
              }}
            />
          </div>
        </div>

        <div class="section">
          <div class="section-header">Entities</div>
          <div class="option-help">Add entities with numeric state. Values are shown as proportions. Any option (including entity, name, color) accepts Jinja templates.</div>
          ${entities.map(
            (ent, i) => {
              const expanded = this._expandedEntities[i] ?? isTemplate(ent.entity);
              const entityLines = (ent.entity || '').split('\n').length;
              const textareaRows = Math.max(6, entityLines + 1);
              const colorVal = ent.color ?? '';
              const showColorSwatch = colorVal && /^#[0-9A-Fa-f]{3,8}$/.test(colorVal.trim());
              return html`
              <div class="entity-row">
                <div class="entity-fields">
                  <div class="entity-primary-row">
                    <div class="entity-input-wrap">
                      ${expanded
                        ? html`
                            <textarea
                              class="input entity-input entity-textarea"
                              .value=${ent.entity || ''}
                              placeholder="Entity ID or Jinja template"
                              rows="${textareaRows}"
                              @input=${(e) => this._entityChanged(i, 'entity', e.target.value)}
                            ></textarea>
                          `
                        : html`
                            <input
                              type="text"
                              class="input entity-input"
                              .value=${ent.entity || ''}
                              list="entity-list-${i}"
                              placeholder="Entity ID or Jinja template"
                              @input=${(e) => this._entityChanged(i, 'entity', e.target.value)}
                            />
                            <datalist id="entity-list-${i}">
                              ${entityOptions.map((eid) => html`<option value="${eid}">`)}
                            </datalist>
                          `}
                    </div>
                    <button
                      class="expand-btn"
                      type="button"
                      @click=${() => this._toggleEntityExpand(i)}
                      title=${expanded ? 'Collapse' : 'Expand for template'}
                    >
                      <ha-icon icon=${expanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}></ha-icon>
                    </button>
                  </div>
                  <div class="entity-options-row">
                    <input
                      type="text"
                      class="input entity-name-input"
                      .value=${ent.name ?? ''}
                      placeholder="Name override"
                      @input=${(e) => this._entityChanged(i, 'name', e.target.value || undefined)}
                    />
                    <div class="color-with-swatch">
                      ${showColorSwatch ? html`<span class="color-swatch" style="background:${colorVal}"></span>` : nothing}
                      <input
                        type="text"
                        class="input color-input"
                        .value=${colorVal}
                        placeholder="Color (hex or var)"
                        @input=${(e) => this._entityChanged(i, 'color', e.target.value || undefined)}
                      />
                    </div>
                    ${(c.sort || 'highest') === 'custom'
                      ? html`
                          <input
                            type="number"
                            class="input order-input"
                            .value=${ent.order ?? i}
                            placeholder="Order"
                            min="0"
                            @input=${(e) => this._entityChanged(i, 'order', parseInt(e.target.value))}
                          />
                        `
                      : nothing}
                  </div>
                </div>
                <button class="remove-btn" @click=${() => this._removeEntity(i)} title="Remove">
                  <ha-icon icon="mdi:delete"></ha-icon>
                </button>
              </div>
            `;
            }
          )}
          <button class="add-btn" @click=${this._addEntity}>
            <ha-icon icon="mdi:plus"></ha-icon> Add entity
          </button>
        </div>

        <div class="section">
          <div class="section-header">Layout</div>
          <div class="option-row">
            <label class="option-label">Layout</label>
            <select
              class="select"
              .value=${c.layout ?? 'horizontal'}
              @change=${(e) => this._valueChanged('layout', e.target.value)}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
          <div class="option-row">
            <label class="option-label">Alignment</label>
            <select
              class="select"
              .value=${c.alignment ?? c.title_alignment ?? c.legend_alignment ?? 'left'}
              @change=${(e) => this._valueChanged('alignment', e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div class="option-help">Alignment applies to both title and legend</div>
          <div class="option-row option-row-toggle">
            <label class="toggle-row">
              <span class="toggle-label">Fill card</span>
              <span class="toggle-switch">
                <input
                  type="checkbox"
                  class="toggle-input"
                  .checked=${fillCard}
                  @change=${(e) => {
                    this._valueChanged('fill_card', e.target.checked);
                    this._valueChanged('remove_background', undefined);
                  }}
                />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>
          </div>
          <div class="option-help">When enabled, removes the card background and hides title/legend options</div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .editor {
      padding: 20px;
      background: var(--secondary-background-color, var(--card-background-color, #1c1c1c));
      color: var(--primary-text-color);
      font-family: var(--mdc-typography-font-family, Roboto, sans-serif);
    }
    .section {
      margin-bottom: 20px;
      padding: 16px;
      background: var(--card-background-color, var(--ha-card-background, rgba(0, 0, 0, 0.2)));
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    }
    .section:last-child {
      margin-bottom: 0;
    }
    .section-header {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-subheader {
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      margin-top: 4px;
    }
    .option-row {
      margin-bottom: 16px;
    }
    .option-row:last-of-type {
      margin-bottom: 0;
    }
    .option-label {
      display: block;
      font-size: 14px;
      color: var(--primary-text-color);
      margin-bottom: 6px;
    }
    .option-row-toggle {
      margin-bottom: 14px;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      cursor: pointer;
      gap: 12px;
    }
    .toggle-label {
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .toggle-switch {
      position: relative;
      flex-shrink: 0;
    }
    .toggle-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
      pointer-events: none;
    }
    .toggle-track {
      display: flex;
      align-items: center;
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: var(--disabled-color, rgba(255, 255, 255, 0.2));
      transition: background 0.2s ease;
      padding: 0 2px;
      box-sizing: border-box;
    }
    .toggle-input:checked + .toggle-track {
      background: var(--primary-color);
    }
    .toggle-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease;
    }
    .toggle-input:checked + .toggle-track .toggle-thumb {
      transform: translateX(20px);
      background: rgba(255, 255, 255, 0.95);
    }
    .option-help {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .input,
    .select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      background: var(--card-background-color, var(--ha-card-background, #fff));
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
    }
    .input:focus,
    .select:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .input:disabled,
    .input.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .select {
      cursor: pointer;
    }
    .select option {
      background: var(--card-background-color, var(--ha-card-background, #fff));
      color: var(--primary-text-color);
    }
    .entity-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
      padding: 14px;
      background: var(--input-fill-color, rgba(0, 0, 0, 0.2));
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
    }
    .entity-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }
    .entity-primary-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      width: 100%;
    }
    .entity-input-wrap {
      flex: 1;
      min-width: 0;
    }
    .entity-input-wrap .entity-input {
      width: 100%;
      box-sizing: border-box;
    }
    .entity-input-wrap .entity-textarea {
      resize: vertical;
      min-height: 80px;
    }
    .entity-options-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .entity-options-row .entity-name-input {
      flex: 1;
      min-width: 100px;
    }
    .color-with-swatch {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      flex-shrink: 0;
      border: 1px solid var(--divider-color, rgba(255,255,255,0.2));
    }
    .entity-options-row .color-input {
      min-width: 80px;
      max-width: 120px;
    }
    .entity-options-row .order-input {
      width: 60px;
      min-width: 60px;
    }
    .expand-btn {
      padding: 8px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .expand-btn:hover {
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.1);
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .checkbox-label input {
      margin-right: 6px;
    }
    .remove-btn {
      padding: 8px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .remove-btn:hover {
      color: var(--error-color, #f44336);
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);
    }
    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px dashed var(--divider-color);
      background: transparent;
      color: var(--primary-color);
      font-size: 14px;
      cursor: pointer;
      width: 100%;
      justify-content: center;
    }
    .add-btn:hover {
      background: rgba(var(--rgb-primary-color), 0.1);
      border-color: var(--primary-color);
    }
  `;
}

customElements.define('stacked-bar-card-editor', StackedHorizontalBarCardEditor);
