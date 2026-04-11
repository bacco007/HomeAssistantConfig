import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  /* ---- track overlays (positioned inside range-timeline's .range-track) ---- */

  .range-hover-preview {
    position: absolute;
    top: 14px;
    height: 14px;
    border-radius: 4px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 26%,
      transparent
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-hover-preview.visible {
    opacity: 1;
  }

  .range-comparison-preview {
    position: absolute;
    top: -4px;
    height: 12px;
    z-index: 2;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 18%,
      transparent
    );
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--primary-color, #03a9f4) 58%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-comparison-preview.visible {
    opacity: 1;
  }

  .range-zoom-highlight {
    position: absolute;
    top: -6px;
    height: 16px;
    z-index: 2;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 14%,
      transparent
    );
    box-shadow:
      inset 0 0 0 2px var(--primary-color, #03a9f4),
      0 0 0 1px
        color-mix(in srgb, var(--card-background-color, #fff) 72%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-zoom-highlight.visible {
    opacity: 1;
  }

  .range-zoom-window-highlight {
    position: absolute;
    top: -4px;
    height: 12px;
    z-index: 4;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 52%,
      transparent
    );
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--primary-color, #03a9f4) 85%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-zoom-window-highlight.visible {
    opacity: 1;
  }

  /* ---- timeline overlays (positioned inside range-timeline's .range-timeline) ---- */

  .range-event-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .range-event-dot {
    position: absolute;
    bottom: 18px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .range-chart-hover-line {
    position: absolute;
    top: 2px;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: var(--primary-color, #03a9f4);
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
    z-index: 2;
  }

  .range-chart-hover-line.visible {
    opacity: 1;
  }

  .range-chart-hover-window-line {
    position: absolute;
    top: 2px;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: var(--primary-color, #03a9f4);
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
    z-index: 2;
  }

  .range-chart-hover-window-line.visible {
    opacity: 0.45;
  }
`;
