import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  .chart-tab {
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-bottom: 2px solid transparent;
    transition:
      border-color 120ms ease,
      color 120ms ease,
      opacity 120ms ease;
  }

  .chart-tab:hover {
    border-bottom-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 44%,
      transparent
    );
  }

  .chart-tab:hover .chart-tab-trigger {
    color: var(--primary-text-color);
  }

  .chart-tab.previewing {
    border-bottom-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 62%,
      transparent
    );
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
    transition:
      border-color 120ms ease,
      color 120ms ease,
      opacity 120ms ease;
  }

  .chart-tab-trigger:hover,
  .chart-tab-trigger:focus-visible {
    color: var(--primary-text-color);
    outline: none;
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
    border: 2px solid
      color-mix(in srgb, var(--secondary-text-color, #6b7280) 28%, transparent);
    border-top-color: currentColor;
    animation: chart-spinner 0.9s linear infinite;
    flex: 0 0 auto;
  }

  @keyframes chart-spinner {
    to {
      transform: rotate(360deg);
    }
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

  .chart-tab.active .chart-tab-detail,
  .chart-tab.previewing .chart-tab-detail,
  .chart-tab:hover .chart-tab-detail,
  .chart-tab-trigger:hover .chart-tab-detail,
  .chart-tab-trigger:focus-visible .chart-tab-detail {
    color: color-mix(
      in srgb,
      var(--secondary-text-color, #6b7280) 88%,
      var(--primary-text-color, #111)
    );
  }

  .chart-tab-actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: -2px;
    padding-right: var(--dp-spacing-md);
    padding-bottom: 2px;
    align-self: center;
    flex: 0 0 auto;
  }

  .chart-tab-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    flex: 0 0 auto;
  }

  .chart-tab-action ha-icon {
    --mdc-icon-size: 12px;
    display: block;
  }

  .chart-tab-action:hover,
  .chart-tab-action:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 8%,
      transparent
    );
    color: var(--primary-text-color);
    outline: none;
  }

  .chart-tab-action.delete {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 7%,
      transparent
    );
  }

  .chart-tab-action.delete:hover,
  .chart-tab-action.delete:focus-visible {
    background: color-mix(
      in srgb,
      var(--error-color, #db4437) 14%,
      transparent
    );
    color: var(--error-color, #db4437);
  }
`;
