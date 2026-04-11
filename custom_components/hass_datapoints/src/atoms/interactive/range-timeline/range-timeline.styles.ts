import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
  }

  .range-selection-jump {
    position: absolute;
    top: 50%;
    width: 30px;
    height: 30px;
    transform: translateY(-50%);
    border: 0;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 94%,
      transparent
    );
    box-shadow:
      0 8px 18px rgba(0, 0, 0, 0.12),
      inset 0 0 0 1px
        color-mix(
          in srgb,
          var(--divider-color, rgba(0, 0, 0, 0.12)) 82%,
          transparent
        );
    color: var(--text-primary-color, #fff);
    cursor: pointer;
    z-index: 12;
  }

  .range-selection-jump[hidden] {
    display: none;
  }

  .range-selection-jump.left {
    left: 6px;
  }

  .range-selection-jump.right {
    right: 6px;
  }

  .range-selection-jump:hover,
  .range-selection-jump:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 100%,
      transparent
    );
    outline: none;
  }

  .range-scroll-viewport {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: stable;
    -webkit-overflow-scrolling: touch;
    cursor: grab;
    touch-action: pan-y;
  }

  .range-scroll-viewport {
    scrollbar-color: transparent transparent;
    transition: scrollbar-color 200ms ease;
  }

  .range-scroll-viewport.scrollbar-visible {
    scrollbar-color: color-mix(
        in srgb,
        var(--primary-text-color, #111) 18%,
        transparent
      )
      transparent;
  }

  .range-scroll-viewport::-webkit-scrollbar {
    height: 8px;
  }

  .range-scroll-viewport::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: transparent;
    transition: background 200ms ease;
  }

  .range-scroll-viewport.scrollbar-visible::-webkit-scrollbar-thumb {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 18%,
      transparent
    );
  }

  .range-scroll-viewport.dragging {
    cursor: grabbing;
  }

  .range-timeline {
    position: relative;
    height: 58px;
    min-width: 100%;
    touch-action: pan-y;
  }

  .range-context-layer,
  .range-label-layer,
  .range-tick-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .range-scale-label {
    position: absolute;
    bottom: 0;
    opacity: 0.7;
    transform: translateX(-50%);
    font-size: 0.76rem;
    line-height: 1;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .range-period-button {
    padding: calc(var(--spacing, 8px) * 0.25) var(--dp-spacing-sm);
    border: 0;
    border-radius: 999px;
    background: none;
    font: inherit;
    color: inherit;
    pointer-events: auto;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    user-select: none;
    -webkit-user-select: none;
    transition:
      background-color 120ms ease,
      box-shadow 120ms ease,
      color 120ms ease;
  }

  .range-period-button:hover {
    color: var(--primary-text-color);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 7%,
      var(--card-background-color, #fff)
    );
    box-shadow: inset 0 0 0 1px
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
  }

  .range-period-button:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent);
    outline-offset: 2px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 7%,
      var(--card-background-color, #fff)
    );
    box-shadow: inset 0 0 0 1px
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
  }

  .range-track {
    position: absolute;
    left: 0;
    right: 0;
    top: 26px;
    transform: translateY(-50%);
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .range-selection {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 82%,
      transparent
    );
    cursor: grab;
  }

  .range-selection.dragging {
    cursor: grabbing;
  }

  .range-tick {
    position: absolute;
    top: 14px;
    height: 14px;
    width: 1px;
    transform: translateX(-50%);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 16%,
      transparent
    );
  }

  .range-tick.major {
    top: 20px;
    height: 18px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 24%,
      transparent
    );
  }

  .range-tick.fine {
    top: 18px;
    height: 8px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 14%,
      transparent
    );
  }

  .range-tick.context {
    top: 2px;
    height: 34px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 38%,
      transparent
    );
  }

  .range-divider {
    position: absolute;
    top: 8px;
    bottom: 22px;
    width: 2px;
    transform: translateX(-50%);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 42%,
      transparent
    );
  }

  .range-context-label {
    font-weight: bold !important;
    position: absolute;
    top: 0;
    transform: translateX(8px);
    font-size: 0.92rem;
    line-height: 1;
    color: var(--primary-text-color);
    white-space: nowrap;
  }

  .range-tooltip {
    position: absolute;
    top: 43px;
    left: 0;
    transform: translate(-50%, 0);
    padding: calc(var(--dp-spacing-sm) + 2px) calc(var(--dp-spacing-md) + 2px);
    border-radius: 10px;
    background: color-mix(in srgb, #0f1218 96%, transparent);
    color: rgba(255, 255, 255, 0.96);
    border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
    font-size: 0.86rem;
    line-height: 1.1;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 120ms ease,
      visibility 120ms ease;
    z-index: 8;
  }

  .range-tooltip-live-hint {
    display: block;
    font-size: 0.78rem;
    opacity: 0.72;
    margin-top: 4px;
  }

  .range-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    width: 10px;
    height: 10px;
    background: inherit;
    transform: translate(-50%, -50%) rotate(45deg);
    border-radius: 2px;
  }

  .range-tooltip.visible {
    opacity: 1;
    visibility: visible;
  }

  .range-tooltip.start {
    z-index: 8;
  }

  .range-tooltip.end {
    z-index: 9;
  }
`;
