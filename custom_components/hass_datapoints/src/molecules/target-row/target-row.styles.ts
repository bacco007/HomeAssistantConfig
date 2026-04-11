import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
    --dp-spacing-xl: calc(var(--spacing, 8px) * 2.5);
  }

  .history-target-row {
    display: grid;
    position: relative;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      "handle name actions"
      ". analysis analysis";
    gap: var(--dp-spacing-sm);
    align-items: center;
    margin: 0;
    padding: calc(var(--spacing, 8px) * 1.125) calc(var(--spacing, 8px) * 1.25);
    border-radius: 16px;
    background: var(--card-background-color, #fff);
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    transition:
      border-color 140ms ease,
      background-color 140ms ease;
    padding-bottom: 0;
    padding-left: 3px;
  }

  .history-target-row.analysis-open {
    padding-bottom: calc(var(--spacing, 8px) * 1.125);
  }

  .history-target-row.is-hidden {
    opacity: 0.62;
  }

  .history-target-row:hover {
    border-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 24%,
      var(--divider-color, rgba(0, 0, 0, 0.12))
    );
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 2%,
      var(--card-background-color, #fff)
    );
  }

  .history-target-row.is-dragging {
    opacity: 0.35;
  }

  .history-target-row.is-drag-over-before {
    box-shadow: inset 0 3px 0 -1px var(--primary-color, #03a9f4);
  }

  .history-target-row.is-drag-over-after {
    box-shadow: inset 0 -3px 0 -1px var(--primary-color, #03a9f4);
  }

  .history-target-drag-handle {
    grid-area: handle;
    align-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--secondary-text-color);
    opacity: 0;
    transition:
      opacity 140ms ease,
      background-color 120ms ease;
    touch-action: none;
    margin-right: calc(var(--dp-spacing-xs) * -0.5);
    margin-left: -8px;
    position: absolute;
  }

  .history-target-drag-handle ha-icon {
    --mdc-icon-size: 16px;
    display: block;
    pointer-events: none;
  }

  .history-target-row:hover .history-target-drag-handle {
    opacity: 0.45;
  }

  .history-target-drag-handle:hover,
  .history-target-drag-handle:focus-visible {
    opacity: 1;
    outline: none;
  }

  .history-target-name {
    grid-area: name;
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--dp-spacing-sm);
    align-items: center;
  }

  .history-target-name-text {
    min-width: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .history-target-entity-id {
    margin-top: 4px;
    font-size: 0.74rem;
    font-weight: 400;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-target-color-field {
    position: relative;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    overflow: hidden;
  }

  .history-target-controls {
    display: contents;
  }

  .history-target-color-icon {
    position: absolute;
    inset: 0;
    display: inline-grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--row-icon-color, var(--text-primary-color, #fff));
    pointer-events: none;
    z-index: 1;
  }

  .history-target-color-icon ha-state-icon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  .history-target-color {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 10px;
    padding: 0;
    background: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    z-index: 2;
  }

  .history-target-color::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .history-target-color::-webkit-color-swatch {
    border: none;
    border-radius: 10px;
  }

  .history-target-color::-moz-color-swatch {
    border: none;
    border-radius: 10px;
  }

  .history-target-color-field::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--row-color, transparent);
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, rgba(0, 0, 0, 0.18) 70%, transparent);
  }

  .history-target-color:focus-visible + .history-target-color-icon {
    outline: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 55%, transparent);
    outline-offset: 2px;
    border-radius: inherit;
  }

  .history-target-actions {
    grid-area: actions;
    justify-self: end;
    align-self: center;
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
  }

  .history-target-analysis-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    min-width: 24px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition:
      background-color 120ms ease,
      color 120ms ease;
  }

  .history-target-analysis-toggle ha-icon {
    --mdc-icon-size: 16px;
    display: block;
    transition: transform 120ms ease;
  }

  .history-target-analysis-toggle.is-open ha-icon {
    transform: rotate(180deg);
  }

  .history-target-analysis-toggle:hover,
  .history-target-analysis-toggle:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 8%,
      transparent
    );
    color: var(--primary-text-color);
    outline: none;
  }

  .history-target-visible-toggle {
    position: relative;
    display: inline-flex;
    width: 34px;
    height: 20px;
    flex: 0 0 auto;
    cursor: pointer;
  }

  .history-target-visible-toggle input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .history-target-visible-toggle-track {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--secondary-text-color, #6b7280) 45%,
      transparent
    );
    transition: background-color 120ms ease;
  }

  .history-target-visible-toggle-track::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--card-background-color, #fff);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: transform 120ms ease;
  }

  .history-target-visible-toggle
    input:checked
    + .history-target-visible-toggle-track {
    background: var(--primary-color);
  }

  .history-target-visible-toggle
    input:checked
    + .history-target-visible-toggle-track::after {
    transform: translateX(14px);
  }

  .history-target-visible-toggle
    input:focus-visible
    + .history-target-visible-toggle-track {
    outline: 2px solid color-mix(in srgb, var(--primary-color) 55%, transparent);
    outline-offset: 2px;
  }

  .history-target-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    min-width: 16px;
    line-height: 16px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 7%,
      transparent
    );
    color: var(--secondary-text-color);
    cursor: pointer;
    flex: 0 0 auto;
  }

  .history-target-remove ha-icon {
    --mdc-icon-size: 12px;
    display: block;
  }

  .history-target-remove:hover,
  .history-target-remove:focus-visible {
    background: color-mix(
      in srgb,
      var(--error-color, #db4437) 14%,
      transparent
    );
    color: var(--error-color, #db4437);
    outline: none;
  }

  /* ── Analysis panel ─────────────────────────────────────── */

  .history-target-analysis {
    grid-area: analysis;
    display: grid;
    gap: var(--dp-spacing-sm);
    padding-top: calc(var(--spacing, 8px) * 0.25);
    border-top: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 78%,
        transparent
      );
  }

  .history-target-analysis-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--dp-spacing-sm);
  }

  .history-target-analysis-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    border-radius: 6px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 12%,
      transparent
    );
    color: var(--primary-color, #03a9f4);
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  .history-target-analysis-copy-btn:disabled {
    background: color-mix(
      in srgb,
      var(--disabled-color, #bdbdbd) 12%,
      transparent
    );
    color: var(--disabled-color, #bdbdbd);
  }

  .history-target-analysis-copy-btn:not(:disabled):hover,
  .history-target-analysis-copy-btn:not(:disabled):focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 20%,
      transparent
    );
  }

  .history-target-analysis-copy-btn ha-icon {
    --mdc-icon-size: 14px;
  }

  .history-target-analysis-grid {
    display: grid;
    gap: var(--dp-spacing-sm);
    padding-top: var(--dp-spacing-sm);
  }

  .history-target-analysis-option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    color: var(--primary-text-color);
    font-size: 0.84rem;
    cursor: pointer;
  }

  .history-target-analysis-option.is-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .history-target-analysis-option input[type="checkbox"] {
    margin: 0;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }

  /* Skeleton loading state shown while HA entity data is unavailable */
  @keyframes dp-skeleton-shimmer {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 0.7;
    }
  }

  .skeleton {
    background: var(--divider-color, rgba(0, 0, 0, 0.12));
    border-radius: 4px;
    animation: dp-skeleton-shimmer 1.4s ease-in-out infinite;
    display: inline-block;
  }

  .skeleton-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .skeleton-name {
    height: 0.9em;
    width: 120px;
    margin-bottom: -3px;
    border-radius: 4px;
  }

  .skeleton-entity-id {
    height: 0.7em;
    width: 80px;
    border-radius: 4px;
  }
`;
