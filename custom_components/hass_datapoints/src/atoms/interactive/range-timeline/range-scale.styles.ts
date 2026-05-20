import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
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
`;
