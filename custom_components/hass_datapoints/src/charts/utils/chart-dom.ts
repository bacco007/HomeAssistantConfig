import { html, render, type TemplateResult } from "lit";
import { ChartRenderer, type ResolvedAxis } from "@/lib/chart/chart-renderer";

/**
 * Shared chart card DOM utilities – styles, shell HTML, canvas setup, axis
 * overlays, hover dots, and tooltip positioning.
 *
 * This module lives outside of `lib/` because it touches the DOM.  Pure
 * formatting helpers remain in `lib/chart/chart-shell.ts`.
 */

/**
 * Returns the DOM root containing the chart's elements.
 * Supports both shadow-root cards and light-DOM sub-components.
 */
type ChartDomHost = HTMLElement;

interface HoverDotValue {
  hasValue?: boolean;
  y?: number;
  axisSide?: "left" | "right";
  color?: Nullable<string>;
  opacity?: number;
}

interface TooltipBounds {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

interface AxisOverlayRenderer {
  pad: {
    left: number;
    right: number;
    top: number;
  };
  yOf: (tick: number, min: number, max: number) => number;
  _formatAxisTick: (tick: number, unit?: string) => string;
}

function getRoot(card: ChartDomHost): Document | ShadowRoot {
  const rootNode = card.shadowRoot ?? card.getRootNode();
  if (rootNode instanceof ShadowRoot || rootNode instanceof Document) {
    return rootNode;
  }
  return document;
}

export const CHART_STYLE = `
  :host {
    display: block;
    height: 100%;
    min-height: 0;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
    --dp-spacing-xl: calc(var(--spacing, 8px) * 2.5);
    --ha-tooltip-background-color: color-mix(in srgb, #0f1218 96%, transparent);
    --ha-tooltip-text-color: rgba(255, 255, 255, 0.96);
    --ha-tooltip-padding: calc(var(--dp-spacing-sm) + 2px) calc(var(--dp-spacing-md) + 2px);
    --ha-tooltip-border-radius: 10px;
    --ha-tooltip-arrow-size: 10px;
    --ha-tooltip-font-size: 0.86rem;
    --ha-tooltip-line-height: 1.1;
  }
  ha-card { padding: 0; overflow: visible; height: 100%; display: flex; flex-direction: column; }
  .card-header {
    padding: var(--dp-spacing-lg) var(--dp-spacing-lg) 0;
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 0 0 auto;
  }
  .chart-top-slot[hidden] {
    display: none;
  }
  .chart-top-slot {
    position: relative;
    flex: 0 0 auto;
    min-width: 0;
    z-index: 1;
    margin-left: -13px;
    margin-right: -13px;
    margin-top: -5px;
  }
  .chart-tabs-shell {
    position: relative;
    min-width: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    z-index: 1;
    display: flex;
    align-items: center;
    gap: calc(var(--dp-spacing-sm, 8px));
  }
  .chart-tabs-rail {
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    padding-right: 10px;
    flex-grow: 1;
  }
  .chart-tabs-rail::-webkit-scrollbar {
    display: none;
  }
  .chart-tabs {
    display: flex;
    align-items: flex-end;
    width: 100%;
    min-width: 0;
    gap: 0;
    padding: 0 var(--dp-spacing-md);
    box-sizing: border-box;
  }
  .chart-tab {
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-bottom: 2px solid transparent;
    transition: border-color 120ms ease, color 120ms ease, opacity 120ms ease;
  }
  .chart-tab-trigger {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    flex: 1 1 auto;
    min-width: 0;
    border: 0;
    border-radius: 0;
    padding: var(--dp-spacing-sm) var(--dp-spacing-md);
    background: transparent;
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 0.86rem;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition: border-color 120ms ease, color 120ms ease, opacity 120ms ease;
  }
  .chart-tab-trigger:hover,
  .chart-tab-trigger:focus-visible {
    color: var(--primary-text-color);
    outline: none;
  }
  .chart-tab:hover {
    border-bottom-color: color-mix(in srgb, var(--primary-color, #03a9f4) 44%, transparent);
  }
  .chart-tab:hover .chart-tab-trigger {
    color: var(--primary-text-color);
  }
  .chart-tab.previewing {
    border-bottom-color: color-mix(in srgb, var(--primary-color, #03a9f4) 62%, transparent);
  }
  .chart-tab.previewing .chart-tab-trigger {
    color: var(--primary-text-color);
  }
  .chart-tab.active {
    border-bottom-color: var(--primary-color, #03a9f4);
  }
  .chart-tab.loading .chart-tab-trigger,
  .chart-tab.loading .chart-tab-actions {
    opacity: 0.55;
  }
  .chart-tab.loading .chart-tab-trigger,
  .chart-tab.loading .chart-tab-trigger .chart-tab-detail,
  .chart-tab.loading .chart-tab-action {
    color: var(--secondary-text-color);
  }
  .chart-tab.active .chart-tab-trigger {
    color: var(--primary-text-color);
    font-weight: 600;
    cursor: default;
  }
  .chart-tab-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  .chart-tab-main {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .chart-tab-label {
    font-weight: inherit;
  }
  .chart-tab-spinner {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--secondary-text-color, #6b7280) 28%, transparent);
    border-top-color: currentColor;
    animation: chart-spinner 0.9s linear infinite;
    flex: 0 0 auto;
  }
  .chart-tab-detail {
    font-size: 0.73rem;
    line-height: 1.2;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  .chart-tab-detail-row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    line-height: 1;
  }
  .chart-tab-preview-row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    line-height: 1;
  }
  .chart-tab-preview {
    font-size: 0.68rem;
    line-height: 1.15;
    color: color-mix(in srgb, var(--warning-color, #f59e0b) 58%, var(--secondary-text-color, #6b7280));
    font-weight: 500;
  }
  .chart-tab-actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: -2px;
    padding-right: var(--dp-spacing-md);
    padding-bottom: 2px;
    align-self: center;
    transform: translateY(0);
  }
  .chart-tab-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    --mdc-icon-size: 14px;
    transition: background 120ms ease;
  }
  .chart-tab-action:hover {
    background: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
  }
  .chart-wrap {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
    --dp-chart-axis-left-width: 0px;
    --dp-chart-axis-right-width: 0px;
    padding-left: var(--dp-chart-axis-left-width);
    padding-right: var(--dp-chart-axis-right-width);
  }
  .chart-scroll-viewport {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(128,128,128,0.3) transparent;
  }
  .chart-stage {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .chart-loading {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 10;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .chart-loading.active {
    display: inline-flex;
  }
  .chart-loading-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid rgba(128, 128, 128, 0.2);
    border-top-color: var(--primary-color, #03a9f4);
    animation: chart-spinner 0.9s linear infinite;
  }
  @keyframes chart-spinner {
    to { transform: rotate(360deg); }
  }
  .chart-message {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 9;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    font-size: 0.9em;
    text-align: center;
    padding: var(--dp-spacing-lg);
    pointer-events: none;
  }
  .chart-message:not(:empty) {
    display: flex;
  }
  canvas {
    display: block;
  }
  .chart-icon-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .chart-crosshair {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .crosshair-line {
    position: absolute;
  }
  .crosshair-line.vertical {
    top: 0;
    bottom: 0;
    width: 1px;
    background: color-mix(in srgb, var(--divider-color, rgba(0,0,0,0.12)) 80%, transparent);
  }
  .crosshair-line.horizontal {
    left: 0;
    right: 0;
    height: 1px;
  }
  .crosshair-line.series {
    left: 0;
    right: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.3;
  }
  .crosshair-line.series.emphasized {
    opacity: 0.55;
  }
  .crosshair-line.series.subtle {
    opacity: 0.18;
  }
  .crosshair-points {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .crosshair-point {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.85);
    transform: translate(-50%, -50%);
  }
  .chart-add-annotation {
    position: absolute;
    bottom: 0;
    transform: translate(-50%, 0);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 0;
    background: var(--primary-color, #03a9f4);
    color: white;
    cursor: pointer;
    padding: 0;
    --mdc-icon-size: 14px;
    opacity: 0.92;
    transition: opacity 120ms ease, transform 120ms ease;
  }
  .chart-add-annotation:hover {
    opacity: 1;
    transform: translate(-50%, 0) scale(1.12);
  }
  .chart-zoom-selection {
    position: absolute;
    top: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent);
    border-left: 1px solid color-mix(in srgb, var(--primary-color, #03a9f4) 80%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--primary-color, #03a9f4) 80%, transparent);
    pointer-events: none;
  }
  .chart-axis-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
    overflow: visible;
    z-index: 5;
  }
  .chart-axis-overlay.left {
    left: calc(-1 * var(--dp-chart-axis-left-width, 0px));
    width: var(--dp-chart-axis-left-width, 0px);
  }
  .chart-axis-overlay.right {
    right: calc(-1 * var(--dp-chart-axis-right-width, 0px));
    width: var(--dp-chart-axis-right-width, 0px);
  }
  .chart-axis-overlay.visible {
    background: var(--ha-card-background, var(--card-background-color, white));
  }
  .chart-axis-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--divider-color, rgba(0,0,0,0.12));
  }
  .chart-axis-overlay.left .chart-axis-divider {
    right: 0;
  }
  .chart-axis-overlay.right .chart-axis-divider {
    left: 0;
  }
  .chart-axis-label {
    position: absolute;
    font-size: 0.72rem;
    line-height: 1;
    color: var(--secondary-text-color);
    transform: translateY(-50%);
    white-space: nowrap;
    padding: 0 6px;
  }
  .chart-axis-unit {
    position: absolute;
    font-size: 0.72rem;
    line-height: 1;
    color: var(--secondary-text-color);
    white-space: nowrap;
    padding: 0 6px;
    opacity: 0.7;
  }
  .chart-axis-hover-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid var(--ha-card-background, var(--card-background-color, white));
    transform: translateY(-50%);
    pointer-events: none;
  }
  .chart-axis-hover-dot.left {
    right: -4px;
  }
  .chart-axis-hover-dot.right {
    left: -4px;
  }
  .chart-zoom-out {
    position: absolute;
    top: var(--dp-spacing-sm);
    right: var(--dp-spacing-sm);
    z-index: 20;
    display: inline-flex;
    align-items: center;
    gap: var(--dp-spacing-xs);
    border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
    border-radius: 999px;
    background: var(--ha-card-background, var(--card-background-color, white));
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.78rem;
    padding: 4px 10px 4px 6px;
    cursor: pointer;
    --mdc-icon-size: 16px;
    opacity: 0.88;
    transition: opacity 120ms ease;
  }
  .chart-zoom-out:hover {
    opacity: 1;
  }
  .chart-adjust-axis {
    position: absolute;
    bottom: var(--dp-spacing-sm);
    right: var(--dp-spacing-sm);
    z-index: 20;
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
    border-radius: 999px;
    background: var(--ha-card-background, var(--card-background-color, white));
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 0.72rem;
    padding: 3px 10px;
    cursor: pointer;
    opacity: 0.78;
    transition: opacity 120ms ease;
  }
  .chart-adjust-axis:hover {
    opacity: 1;
  }
  .chart-preview-overlay {
    position: absolute;
    inset: 0;
    z-index: 8;
    background: color-mix(in srgb, var(--ha-card-background, var(--card-background-color, white)) 62%, transparent);
    backdrop-filter: blur(1px);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .chart-preview-overlay[hidden] {
    display: none;
  }
  .tooltip {
    display: none;
    position: fixed;
    z-index: 300;
    min-width: 120px;
    max-width: 340px;
    background: var(--ha-tooltip-background-color, color-mix(in srgb, #0f1218 96%, transparent));
    color: var(--ha-tooltip-text-color, rgba(255, 255, 255, 0.96));
    border-radius: var(--ha-tooltip-border-radius, 10px);
    padding: var(--ha-tooltip-padding, 10px 14px);
    font-size: var(--ha-tooltip-font-size, 0.86rem);
    line-height: var(--ha-tooltip-line-height, 1.1);
    pointer-events: none;
    gap: var(--dp-spacing-xs);
    flex-direction: column;
    overflow: hidden;
  }
  .tooltip.secondary {
    min-width: 160px;
    max-width: 300px;
  }
  .annotation-tooltip {
    pointer-events: all;
    cursor: pointer;
  }
  .tt-time {
    font-size: 0.78rem;
    opacity: 0.7;
    white-space: nowrap;
  }
  .tt-value {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .tt-series {
    display: grid;
    gap: calc(var(--spacing, 8px) * 0.3);
    min-width: 0;
  }
  .tt-series-row {
    display: flex;
    align-items: baseline;
    gap: var(--dp-spacing-xs);
    min-width: 0;
  }
  .tt-series-row.subordinate {
    opacity: 0.78;
    padding-left: 12px;
  }
  .tt-series-main {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-xs);
    min-width: 0;
    flex: 1 1 0;
    overflow: hidden;
  }
  .tt-series-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.84rem;
  }
  .tt-series-value {
    font-weight: 600;
    white-space: nowrap;
    font-size: 0.84rem;
  }
  .tt-message-row {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-xs);
    min-width: 0;
  }
  .tt-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: 0 0 auto;
  }
  .tt-message {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tt-annotation {
    font-size: 0.82rem;
    opacity: 0.82;
    white-space: pre-wrap;
  }
  .tt-secondary {
    display: grid;
    gap: calc(var(--spacing, 8px) * 0.5);
  }
  .tt-secondary-title {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.72);
  }
  .tt-secondary-text {
    font-size: 0.88rem;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.9);
    white-space: pre-wrap;
  }
  .tt-secondary-text.muted {
    color: rgba(255, 255, 255, 0.74);
  }
  .tt-entities {
    display: flex;
    flex-wrap: wrap;
    gap: var(--dp-spacing-xs);
    margin-top: calc(var(--spacing, 8px) * 0.75);
  }
  .tt-entity-chip {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.5);
    max-width: 100%;
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, #ffffff 10%, transparent);
    color: rgba(255, 255, 255, 0.82);
    white-space: nowrap;
  }
  .tt-entity-chip ha-icon {
    --mdc-icon-size: 12px;
    flex: 0 0 auto;
  }
  .tt-entity-chip span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chart-modal[hidden] {
    display: none;
  }
  .chart-modal {
    position: absolute;
    inset: 0;
    z-index: 250;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--dp-spacing-lg);
    box-sizing: border-box;
  }
  .chart-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 18, 24, 0.42);
    backdrop-filter: blur(2px);
  }
  .chart-modal-panel {
    position: relative;
    z-index: 1;
    width: min(560px, calc(100vw - (var(--spacing, 8px) * 4)));
    max-height: calc(100% - (var(--spacing, 8px) * 4));
    overflow: auto;
    border-radius: 16px;
  }
`;

export function buildChartCardShell(title?: Nullable<string>): string {
  return `
    <style>${CHART_STYLE}</style>
    <ha-card>
      ${title ? `<div class="card-header">${title}</div>` : ""}
      <div class="chart-top-slot" id="chart-top-slot" hidden></div>
      <div class="chart-wrap">
        <div class="chart-preview-overlay" id="chart-preview-overlay" hidden></div>
        <div class="chart-scroll-viewport" id="chart-scroll-viewport">
          <div class="chart-stage" id="chart-stage">
            <div class="chart-loading active" id="loading" aria-hidden="true">
              <div class="chart-loading-spinner"></div>
            </div>
            <div class="chart-message" id="chart-message"></div>
            <canvas id="chart"></canvas>
            <div class="chart-icon-overlay" id="chart-icon-overlay"></div>
            <div class="chart-crosshair" id="chart-crosshair" hidden>
              <div class="crosshair-line vertical" id="crosshair-vertical"></div>
              <div class="crosshair-line horizontal" id="crosshair-horizontal"></div>
              <div class="crosshair-points" id="crosshair-points"></div>
            </div>
            <button type="button" class="chart-add-annotation" id="chart-add-annotation" hidden aria-label="Create data point">
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
            <ha-tooltip for="chart-add-annotation" placement="bottom" distance="8" show-delay="1000">Create Data Point</ha-tooltip>
            <div class="chart-zoom-selection" id="chart-zoom-selection" hidden></div>
          </div>
        </div>
        <div class="chart-axis-overlay left" id="chart-axis-left"></div>
        <div class="chart-axis-overlay right" id="chart-axis-right"></div>
        <button type="button" class="chart-zoom-out" id="chart-zoom-out" hidden>
          <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
          <span>Zoom out</span>
        </button>
        <button type="button" class="chart-adjust-axis" id="chart-adjust-axis" hidden>
          <span>Adjust Y-Axis</span>
        </button>
        <div class="tooltip" id="tooltip">
          <div class="tt-time" id="tt-time"></div>
          <div class="tt-value" id="tt-value" style="display:none"></div>
          <div class="tt-series" id="tt-series" style="display:none"></div>
          <div class="tt-message-row" id="tt-message-row" style="display:none">
            <span class="tt-dot" id="tt-dot"></span>
            <span class="tt-message" id="tt-message"></span>
          </div>
          <div class="tt-annotation" id="tt-annotation" style="display:none"></div>
          <div class="tt-entities" id="tt-entities" style="display:none"></div>
        </div>
        <div class="tooltip secondary" id="anomaly-tooltip">
          <div class="tt-secondary">
            <div class="tt-secondary-title" id="tt-secondary-title"></div>
            <div class="tt-secondary-text" id="tt-secondary-description"></div>
            <div class="tt-secondary-text" id="tt-secondary-alert"></div>
            <div class="tt-secondary-text muted" id="tt-secondary-instruction"></div>
          </div>
        </div>
        <div id="annotation-tooltips"></div>
      <div class="legend" id="legend"></div>
    </ha-card>`;
}

/**
 * Reads the HA `--secondary-text-color` CSS variable from the given element so
 * canvas-drawn axis labels use the correct colour for the active light/dark theme.
 * Falls back to the dark-mode default when the variable is unavailable.
 */
export function resolveChartLabelColor(
  el: Nullable<Element> | undefined
): string {
  if (!el) {
    return "rgba(214,218,224,0.92)";
  }
  const raw = getComputedStyle(el)
    .getPropertyValue("--secondary-text-color")
    .trim();
  if (raw) {
    return raw;
  }
  return "rgba(214,218,224,0.92)";
}

export function setupCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  cssHeight?: Nullable<number>,
  cssWidth: Nullable<number> = null
): { w: number; h: number } {
  const dpr = window.devicePixelRatio || 1;
  // Safari caps canvas pixel dimensions at 16,383. Chrome/Firefox at ~32,767.
  // Use the Safari limit (16,383) so the canvas is never silently blanked by
  // the browser resetting it to 300×150 when dimensions are exceeded.
  const maxCssDim = Math.floor(16383 / dpr);
  const styles = getComputedStyle(container);
  const paddingX =
    (Number.parseFloat(styles.paddingLeft || "0") || 0) +
    (Number.parseFloat(styles.paddingRight || "0") || 0);
  const paddingY =
    (Number.parseFloat(styles.paddingTop || "0") || 0) +
    (Number.parseFloat(styles.paddingBottom || "0") || 0);
  const measuredWidth = cssWidth ?? (container.clientWidth || 360);
  const w = Math.min(
    maxCssDim,
    Math.max(1, Math.round(measuredWidth - paddingX))
  );
  const requestedHeight = cssHeight ?? container.clientHeight ?? 220;
  const h = Math.min(
    maxCssDim,
    Math.max(40, Math.round(requestedHeight - paddingY))
  );
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx && typeof ctx.scale === "function") {
    ctx.scale(dpr, dpr);
  }
  return { w, h };
}

export function renderChartAxisOverlays(
  card: ChartDomHost,
  renderer: Nullable<AxisOverlayRenderer>,
  axes: ResolvedAxis[] = []
): void {
  const leftEl = getRoot(card)?.getElementById("chart-axis-left");
  const rightEl = getRoot(card)?.getElementById("chart-axis-right");
  if (!leftEl || !rightEl || !renderer) {
    return;
  }

  const leftWidth = Math.max(0, renderer.pad.left);
  const rightWidth = Math.max(0, renderer.pad.right);
  leftEl.style.width = `${leftWidth}px`;
  rightEl.style.width = `${rightWidth}px`;

  const chartWrap = getRoot(card).querySelector(".chart-wrap");
  const chartWrapEl = chartWrap instanceof HTMLElement ? chartWrap : card;
  if (chartWrapEl) {
    chartWrapEl.style.setProperty(
      "--dp-chart-axis-left-width",
      `${leftWidth}px`
    );
    chartWrapEl.style.setProperty(
      "--dp-chart-axis-right-width",
      `${rightWidth}px`
    );
  }

  const axisSlotWidth = ChartRenderer.AXIS_SLOT_WIDTH;
  const axisOffset = (axis: ResolvedAxis) =>
    10 + (axis.slot ?? 0) * axisSlotWidth;
  const unitCounts = axes.reduce((counts: Map<string, number>, axis) => {
    if (!axis?.unit) {
      return counts;
    }
    counts.set(axis.unit, (counts.get(axis.unit) || 0) + 1);
    return counts;
  }, new Map());
  const axisTextStyle = (axis: ResolvedAxis) => {
    const duplicateUnit = !!axis?.unit && (unitCounts.get(axis.unit) || 0) > 1;
    if (!duplicateUnit || !axis?.color) {
      return "";
    }
    return `color:${axis.color};`;
  };

  const buildAxisMarkup = (axis: ResolvedAxis): TemplateResult => {
    const labelItems = (axis.ticks || []).map((tick: number) => {
      const y = renderer.yOf(tick, axis.min, axis.max);
      const sideStyle =
        axis.side === "left"
          ? `right:${axisOffset(axis)}px;text-align:right;`
          : `left:${axisOffset(axis)}px;text-align:left;`;
      return html`<div
        class="chart-axis-label"
        style="top:${Math.round(y) + 1}px;${sideStyle}${axisTextStyle(axis)}"
      >
        ${renderer._formatAxisTick(tick, axis.unit)}
      </div>`;
    });
    const unitItem = axis.unit
      ? html`<div
          class="chart-axis-unit"
          style="top:${Math.max(0, renderer.pad.top - 18)}px;${axis.side ===
          "left"
            ? `right:${axisOffset(axis)}px;text-align:right;`
            : `left:${axisOffset(axis)}px;text-align:left;`}${axisTextStyle(
            axis
          )}"
        >
          ${axis.unit}
        </div>`
      : "";
    return html`${labelItems}${unitItem}`;
  };

  const leftAxes = axes.filter((axis) => axis.side !== "right");
  const rightAxes = axes.filter((axis) => axis.side === "right");

  render(
    leftAxes.length
      ? html`<div class="chart-axis-divider"></div>
          ${leftAxes.map((axis) => buildAxisMarkup(axis))}`
      : html``,
    leftEl
  );
  render(
    rightAxes.length
      ? html`<div class="chart-axis-divider"></div>
          ${rightAxes.map((axis) => buildAxisMarkup(axis))}`
      : html``,
    rightEl
  );

  leftEl.classList.toggle("visible", !!leftAxes.length);
  rightEl.classList.toggle("visible", !!rightAxes.length);
}

export function renderChartAxisHoverDots(
  card: ChartDomHost,
  hoverValues: HoverDotValue[] = []
): void {
  const root = getRoot(card);
  const leftEl = root.getElementById("chart-axis-left");
  const rightEl = root.getElementById("chart-axis-right");
  const scrollViewport = root.getElementById("chart-scroll-viewport");
  if (!leftEl || !rightEl) {
    return;
  }

  leftEl
    .querySelectorAll(".chart-axis-hover-dot")
    .forEach((el: Element) => el.remove());
  rightEl
    .querySelectorAll(".chart-axis-hover-dot")
    .forEach((el: Element) => el.remove());
  const verticalOffset = scrollViewport?.offsetTop || 0;

  hoverValues
    .filter(
      (entry): entry is HoverDotValue & { y: number } =>
        entry?.hasValue !== false && Number.isFinite(entry?.y)
    )
    .forEach((entry) => {
      const target = entry.axisSide === "right" ? rightEl : leftEl;
      const dot = document.createElement("span");
      dot.className = `chart-axis-hover-dot ${entry.axisSide === "right" ? "right" : "left"}`;
      dot.style.top = `${verticalOffset + entry.y}px`;
      dot.style.background = entry.color || "#03a9f4";
      dot.style.opacity = `${Number.isFinite(entry.opacity) ? entry.opacity : 1}`;
      target.appendChild(dot);
    });
}

export function positionTooltip(
  tooltip: HTMLElement,
  clientX: number,
  clientY: number,
  bounds: Nullable<TooltipBounds> = null
): void {
  tooltip.style.display = "block";
  const tipRect = tooltip.getBoundingClientRect();
  const tipW = tipRect.width || 220;
  const tipH = tipRect.height || 64;
  const gap = 12;
  const minLeft = Number.isFinite(bounds?.left)
    ? (bounds?.left as number)
    : gap;
  const maxLeft = Number.isFinite(bounds?.right)
    ? (bounds?.right as number)
    : window.innerWidth - gap;
  const minTop = Number.isFinite(bounds?.top) ? (bounds?.top as number) : gap;
  const maxTop = Number.isFinite(bounds?.bottom)
    ? (bounds?.bottom as number)
    : window.innerHeight - gap;

  let left = clientX + gap;
  if (left + tipW > maxLeft) {
    left = clientX - tipW - gap;
  }

  let top = clientY - tipH - gap;
  if (top < minTop) {
    top = clientY + gap;
  }
  if (top + tipH > maxTop) {
    top = Math.max(minTop, clientY - tipH - gap);
  }

  left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft - tipW));
  top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop - tipH));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}
