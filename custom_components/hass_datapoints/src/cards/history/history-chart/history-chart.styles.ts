export const styles = `
  hass-datapoints-history-chart {
    position: relative;
    display: flex;
    flex-direction: column;
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
    padding: var(--dp-spacing-lg);
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 0 0 auto;
    line-height: 1.3;
  }
  .chart-top-slot[hidden] {
    display: none;
  }
  .chart-top-slot {
    position: relative;
    flex: 0 0 auto;
    min-width: 0;
    margin-left: calc(var(--dp-spacing-md) * -1);
    margin-right: calc(var(--dp-spacing-md) * -1);
    margin-top: -5px;
    z-index: 1;
  }
  .chart-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding: var(--dp-spacing-sm) var(--dp-spacing-md) var(--dp-spacing-md);
    box-sizing: border-box;
    overflow: visible;
    isolation: isolate;
    z-index: 3;
  }
  .chart-preview-overlay[hidden] {
    display: none;
  }
  .chart-preview-overlay {
    position: absolute;
    top: calc(var(--dp-chart-top-slot-height, 0px) + var(--dp-spacing-sm));
    left: var(--dp-spacing-md);
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: min(340px, calc(100% - (var(--dp-spacing-lg) * 2)));
    padding: 8px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--card-background-color, #fff) 90%, transparent);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(4px);
    pointer-events: none;
    z-index: 4;
  }
  .chart-preview-kicker {
    font-size: 0.68rem;
    line-height: 1.15;
    color: color-mix(in srgb, var(--warning-color, #f59e0b) 72%, var(--secondary-text-color, #6b7280));
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .chart-preview-title {
    font-size: 0.84rem;
    line-height: 1.2;
    color: var(--primary-text-color);
    font-weight: 600;
  }
  .chart-preview-line {
    font-size: 0.74rem;
    line-height: 1.2;
    color: var(--secondary-text-color);
  }
  .chart-preview-line strong {
    color: color-mix(in srgb, var(--warning-color, #f59e0b) 72%, var(--primary-text-color, #111));
    font-weight: 600;
  }
  .chart-scroll-viewport {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: stable both-edges;
    -webkit-overflow-scrolling: touch;
  }
  .chart-stage {
    position: relative;
    min-height: 100%;
  }
  .chart-icon-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }
  .chart-event-icon {
    position: absolute;
    width: 18px;
    height: 18px;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    cursor: pointer;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    border-radius: 50%;
  }
  .chart-event-icon ha-icon {
    --mdc-icon-size: 14px;
    pointer-events: none;
  }
  .chart-axis-overlay {
    position: absolute;
    top: calc(var(--dp-chart-top-slot-height, 0px) + 5px);
    bottom: 0;
    display: none;
    pointer-events: none;
    background: var(--card-background-color, var(--primary-background-color, #fff));
    overflow: hidden;
    z-index: 3;
    border-bottom-left-radius: 11px;
  }
  .chart-axis-overlay.visible {
    display: block;
  }
  .chart-axis-overlay.left {
    left: 0;
  }
  .chart-axis-overlay.right {
    right: 0;
  }
  .chart-axis-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(128,128,128,0.35);
  }
  .chart-axis-overlay.left .chart-axis-divider {
    right: 0;
  }
  .chart-axis-overlay.right .chart-axis-divider {
    left: 0;
  }
  .chart-axis-label,
  .chart-axis-unit {
    position: absolute;
    color: var(--secondary-text-color);
    font: 12px sans-serif;
    line-height: 1;
    white-space: nowrap;
  }
  .chart-axis-label {
    transform: translateY(calc(-50% + 6px));
  }
  .chart-axis-unit {
    font-weight: 500;
  }
  canvas { display: block; }
  .chart-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    gap: var(--dp-spacing-sm);
    min-width: calc(var(--spacing, 8px) * 12);
    min-height: calc(var(--spacing, 8px) * 5);
    padding: var(--dp-spacing-sm) var(--dp-spacing-md);
    border-radius: 999px;
    background: color-mix(in srgb, var(--card-background-color, #fff) 92%, transparent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    z-index: 6;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }
  .chart-loading.active {
    display: inline-flex;
  }
  .chart-loading-spinner {
    width: calc(var(--spacing, 8px) * 2);
    height: calc(var(--spacing, 8px) * 2);
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
    border-top-color: var(--primary-color, #03a9f4);
    animation: chart-spinner 0.9s linear infinite;
  }
  .chart-loading::after {
    content: none;
  }
  .chart-loading-label {
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    font-weight: 500;
  }
  @keyframes chart-spinner {
    to {
      transform: rotate(360deg);
    }
  }
  .chart-message {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    padding: calc(var(--spacing, 8px) * 5) var(--dp-spacing-lg);
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.95rem;
    pointer-events: none;
    z-index: 2;
  }
  .chart-message.visible {
    display: flex;
  }
  .chart-crosshair {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .chart-crosshair[hidden] {
    display: none;
  }
  .crosshair-line {
    position: absolute;
    background: color-mix(in srgb, var(--primary-text-color, #111) 24%, transparent);
  }
  .crosshair-line.vertical {
    width: 1px;
    transform: translateX(-50%);
  }
  .crosshair-line.horizontal {
    height: 1px;
    transform: translateY(-50%);
  }
  .crosshair-line.horizontal.series {
    left: 0;
    width: 100%;
  }
  .crosshair-line.horizontal.series.subtle {
    background: currentColor;
    opacity: 0.22;
  }
  .crosshair-line.horizontal.series.emphasized {
    height: 0;
    background: transparent;
    border-top: 1px dashed currentColor;
    opacity: 0.9;
  }
  .crosshair-points {
    position: absolute;
    inset: 0;
  }
  .crosshair-point {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    transform: translate(-50%, -50%);
  }
  .crosshair-axis-dot {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
    box-shadow: 0 1px 4px rgba(0,0,0,0.28);
    transform: translate(-50%, -50%);
  }
  .chart-axis-hover-dot {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
    box-shadow: 0 1px 4px rgba(0,0,0,0.28);
    top: 0;
    transform: translateY(-50%);
  }
  .chart-axis-hover-dot.left {
    right: 0;
    transform: translate(50%, -50%);
  }
  .chart-axis-hover-dot.right {
    left: 0;
    transform: translate(-50%, -50%);
  }
  .chart-zoom-selection {
    position: absolute;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--primary-color, #03a9f4) 78%, transparent);
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease;
  }
  .chart-zoom-selection.visible {
    opacity: 1;
  }
  .chart-add-annotation {
    position: absolute;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    border: 1px solid color-mix(in srgb, var(--secondary-text-color, #616161) 22%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--secondary-background-color, #f3f4f6) 94%, transparent);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
    color: var(--secondary-text-color, #616161);
    cursor: pointer;
    z-index: 4;
    transform: translate(-50%, -50%);
  }
  .chart-add-annotation ha-icon {
    --mdc-icon-size: 14px;
    pointer-events: none;
  }
  .chart-add-annotation:hover,
  .chart-add-annotation:focus-visible {
    background: color-mix(in srgb, var(--secondary-background-color, #f3f4f6) 82%, transparent);
    color: var(--primary-text-color);
    outline: none;
  }
  .chart-add-annotation[hidden] {
    display: none;
  }
  .chart-zoom-out {
    position: absolute;
    top: calc(var(--dp-chart-top-slot-height, 0px) + var(--dp-spacing-sm));
    right: var(--dp-spacing-lg);
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    padding: calc(var(--spacing, 8px) * 0.875) var(--dp-spacing-md);
    border: 1px solid color-mix(in srgb, var(--primary-color, #03a9f4) 26%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 12%, var(--card-background-color, #fff));
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    color: var(--primary-color, #03a9f4);
    font: inherit;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    z-index: 4;
  }
  .chart-zoom-out ha-icon {
    --mdc-icon-size: 16px;
  }
  .chart-zoom-out[hidden] {
    display: none;
  }
  .chart-zoom-out:hover,
  .chart-zoom-out:focus-visible {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, var(--card-background-color, #fff));
    outline: none;
  }
  .chart-adjust-axis {
    position: absolute;
    left: calc(var(--dp-chart-axis-left-width, 0px) + var(--dp-spacing-sm, 8px));
    bottom: calc(var(--dp-chart-axis-bottom-height, 50px) + var(--dp-spacing-sm, 8px));
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    padding: calc(var(--spacing, 8px) * 0.875) var(--dp-spacing-md);
    border: 1px solid color-mix(in srgb, var(--primary-color, #03a9f4) 26%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 12%, var(--card-background-color, #fff));
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    color: var(--primary-color, #03a9f4);
    font: inherit;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    z-index: 4;
  }
  .chart-adjust-axis[hidden] {
    display: none;
  }
  .chart-adjust-axis:hover,
  .chart-adjust-axis:focus-visible {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, var(--card-background-color, #fff));
    outline: none;
  }
  .legend {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--dp-spacing-sm);
    padding: var(--dp-spacing-sm) var(--dp-spacing-md) var(--dp-spacing-md);
    padding-left: calc(var(--dp-spacing-md) + var(--dp-chart-axis-left-width, 0px));
    padding-right: max(var(--dp-spacing-md), var(--dp-chart-axis-right-width, 0px));
    flex: 0 0 auto;
    border-top: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }
  .legend.wrap-rows {
    flex-wrap: wrap;
    align-items: flex-start;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc((30px * 3) + (var(--dp-spacing-sm) * 2));
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.625);
    font-size: 0.78em;
    color: var(--secondary-text-color);
    flex: 0 0 auto;
  }
  .legend.wrap-rows .legend-item {
    max-width: 100%;
  }
  .legend-toggle {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.625);
    border: 0;
    padding: calc(var(--spacing, 8px) * 0.375) var(--dp-spacing-sm);
    background: none;
    font: inherit;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
    border-radius: 999px;
    transition: opacity 120ms ease, color 120ms ease, background-color 120ms ease;
    white-space: nowrap;
  }
  .legend-toggle:hover,
  .legend-toggle:focus-visible {
    color: var(--primary-text-color);
    background: color-mix(in srgb, var(--primary-text-color, #111) 6%, transparent);
    outline: none;
  }
  .legend-toggle[aria-pressed="false"] {
    opacity: 0.45;
  }
  .legend-line {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex: 0 0 12px;
  }
  .legend-label {
    display: inline-block;
    min-width: 0;
  }
  .tooltip {
    position: fixed;
    background: color-mix(in srgb, #0f1218 96%, transparent);
    border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
    border-radius: 10px;
    padding: calc(var(--dp-spacing-sm) + 2px) calc(var(--dp-spacing-md) + 2px);
    font-size: 0.86rem;
    line-height: 1.1;
    box-shadow: 0 10px 24px rgba(0,0,0,0.28);
    pointer-events: none;
    display: none;
    max-width: clamp(220px, 30vw, 320px);
    z-index: 1200;
    color: rgba(255, 255, 255, 0.96);
  }
  .tt-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-right: var(--dp-spacing-xs);
    flex-shrink: 0;
  }
  .tt-time { color: rgba(255, 255, 255, 0.72); margin-bottom: calc(var(--spacing, 8px) * 0.375); }
  .tt-value { color: rgba(255, 255, 255, 0.78); margin-bottom: var(--dp-spacing-xs); }
  .tt-series {
    display: grid;
    gap: var(--dp-spacing-xs);
    margin-bottom: var(--dp-spacing-xs);
  }
  .tt-series-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--dp-spacing-md);
    min-width: 0;
  }
  .tt-series-row.subordinate {
    padding-left: calc(var(--spacing, 8px) * 2.25);
  }
  .tt-series-main {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
  }
  .tt-series-label {
    min-width: 0;
    color: rgba(255, 255, 255, 0.76);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tt-series-value {
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.96);
    font-weight: 500;
    white-space: nowrap;
    text-align: right;
  }
  .tt-message-row {
    display: flex;
    align-items: flex-start;
    gap: var(--dp-spacing-xs);
  }
  .tt-message { font-weight: 500; }
  .tt-annotation {
    color: rgba(255, 255, 255, 0.74);
    margin-top: var(--dp-spacing-xs);
    margin-left: calc(8px + var(--dp-spacing-xs) + calc(var(--spacing, 8px) * 0.75));
    white-space: pre-wrap;
    line-height: 1.4;
  }
  .tooltip.secondary {
    max-width: 260px;
  }
  .tooltip.annotation-tooltip {
    max-width: 300px;
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
`;
