import { css } from "lit";

export const styles = css`
  :host {
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
    display: block;
  }

  .monitors-panel {
    padding: var(--dp-spacing-sm);
    max-width: 860px;
    margin: 0 auto;
  }

  .monitors-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--dp-spacing-md);
  }

  .monitors-header h2 {
    margin: 0;
    font-size: 1.1em;
    font-weight: 500;
  }

  .monitors-empty {
    text-align: center;
    color: var(--secondary-text-color);
    padding: var(--dp-spacing-lg);
  }

  .monitors-grid {
    display: grid;
    gap: var(--dp-spacing-sm);
  }

  .monitor-card {
    background: var(--card-background-color, var(--secondary-background-color));
    border-radius: 8px;
    padding: var(--dp-spacing-sm) var(--dp-spacing-md);
    box-shadow: var(--ha-card-box-shadow, none);
    display: grid;
    gap: var(--dp-spacing-xs);
    transition: opacity 200ms ease;
    opacity: 1;
  }

  .monitor-card[data-enabled="false"] {
    opacity: 0.65;
  }

  .monitor-card[data-enabled="false"]:hover {
    opacity: 0.85;
  }

  .monitor-card-header {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm);
    flex-wrap: wrap;
  }

  .monitor-name {
    font-weight: 500;
    flex: 1;
  }

  .monitor-anomaly-indicator {
    font-size: 0.78em;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
    white-space: nowrap;
    background: var(--error-color, #db4437);
    color: white;
  }

  .monitor-toggle-btn {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--secondary-text-color);
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    transition: color 120ms ease;
    --mdc-icon-size: 28px;
    appearance: none;
    -webkit-appearance: none;
  }

  .monitor-card[data-enabled="true"] .monitor-toggle-btn {
    color: var(--primary-color, #03a9f4);
  }

  .monitor-toggle-btn:hover {
    color: var(--primary-color, #03a9f4);
  }

  .monitor-entities {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .monitor-overlap-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .overlap-op {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0 2px;
  }

  .overlap-prefix {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .monitor-stats {
    display: flex;
    gap: var(--dp-spacing-md);
    align-items: center;
    flex-wrap: wrap;
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }

  .monitor-sparkline {
    flex: 0 0 auto;
  }

  .monitor-actions {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: var(--dp-spacing-xs);
    border-top: 1px solid var(--divider-color);
    padding-top: var(--dp-spacing-xs);
  }

  .monitor-actions-spacer {
    flex: 1;
  }

  a.device-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85em;
    color: var(--primary-color);
    text-decoration: none;
    padding: 0 4px;
  }

  a.device-link:hover {
    text-decoration: underline;
  }

  a.device-link ha-icon {
    --mdc-icon-size: 16px;
  }

  /* ---- Small action buttons (edit/delete) ---- */

  .small-btn {
    --mdc-button-height: 28px;
    font-size: 0.78rem;
    --mdc-layout-grid-margin-desktop: 8px;
  }

  .delete-btn {
    --mdc-theme-primary: var(--error-color, #db4437);
  }

  /* ---- "New monitor" button ---- */

  .new-monitor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 0;
    border-radius: 6px;
    font: inherit;
    font-size: 0.9rem;
    color: var(--primary-color, #3b82f6);
    background: color-mix(
      in srgb,
      var(--primary-color, #3b82f6) 14%,
      transparent
    );
    cursor: pointer;
    --mdc-icon-size: 18px;
    appearance: none;
    -webkit-appearance: none;
    transition: background 120ms ease;
  }

  .new-monitor-btn:hover,
  .new-monitor-btn:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-color, #3b82f6) 22%,
      transparent
    );
    outline: none;
  }
`;
