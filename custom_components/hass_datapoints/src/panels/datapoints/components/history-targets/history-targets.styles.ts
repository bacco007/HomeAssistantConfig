import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .history-targets {
    display: grid;
    gap: var(--dp-spacing-md);
  }

  :host([sidebar-collapsed]) .history-targets {
    display: flex;
    min-height: 100%;
    height: 100%;
    flex-direction: column;
    align-content: stretch;
  }

  .history-target-rows {
    width: 100%;
  }

  .sidebar-section-header {
    display: grid;
    gap: var(--dp-spacing-xs);
  }

  .sidebar-section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .sidebar-section-subtitle {
    font-size: 0.82rem;
    color: var(--secondary-text-color);
  }

  .history-target-picker-slot {
    min-width: 0;
    margin-top: 0;
    margin-bottom: calc(var(--spacing, 8px) * 2);
  }

  .history-targets-collapsed-summary {
    display: none;
    grid-auto-rows: max-content;
    gap: var(--dp-spacing-sm);
    justify-items: center;
    padding-top: calc(var(--spacing, 8px) * 5);
  }

  .history-targets-collapsed-item {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    padding: 0;
    margin: 0;
    box-shadow: inset 0 0 0 1px
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 4%,
      transparent
    );
    color: var(--secondary-text-color);
    --mdc-icon-size: 18px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  .history-targets-collapsed-item:hover,
  .history-targets-collapsed-item:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 8%,
      transparent
    );
    outline: none;
  }

  .history-targets-collapsed-item.is-hidden {
    opacity: 0.55;
  }

  .history-targets-collapsed-item::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 3px var(--row-color, transparent);
    pointer-events: none;
  }

  .history-targets-collapsed-item ha-state-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin: 0;
  }

  .history-targets-collapsed-add-container,
  .history-targets-collapsed-preferences-container {
    display: none;
    grid-auto-rows: max-content;
    justify-items: center;
  }

  .history-targets.collapsed .history-targets-collapsed-add-container,
  .history-targets.collapsed .history-targets-collapsed-preferences-container {
    display: grid;
  }

  .history-targets-collapsed-add-container {
    padding-top: calc(var(--spacing, 8px));
  }

  .history-targets-collapsed-preferences-container {
    padding-top: var(--dp-spacing-sm);
  }

  .history-targets-collapsed-add,
  .history-targets-collapsed-preferences {
    display: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 0;
    padding: 0;
    margin: 0;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 4%,
      transparent
    );
    color: var(--secondary-text-color);
    --mdc-icon-size: 16px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    transition: background 120ms ease;
  }

  .history-targets-collapsed-add {
    background: color-mix(
      in srgb,
      var(--primary-color, #3b82f6) 18%,
      transparent
    );
    color: var(--primary-color, #3b82f6);
  }

  .history-targets-collapsed-add:hover,
  .history-targets-collapsed-add:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-color, #3b82f6) 26%,
      transparent
    );
    outline: none;
  }

  .history-targets-collapsed-preferences:hover,
  .history-targets-collapsed-preferences:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 8%,
      transparent
    );
    outline: none;
  }

  :host([sidebar-collapsed]) .history-targets-collapsed-add,
  :host([sidebar-collapsed]) .history-targets-collapsed-preferences {
    display: inline-flex;
  }

  :host([sidebar-collapsed]) .history-target-rows,
  :host([sidebar-collapsed]) .history-target-picker-slot,
  :host([sidebar-collapsed]) .sidebar-section-header {
    display: none;
  }

  :host([sidebar-collapsed]) .history-targets-collapsed-summary {
    display: grid;
  }

  .history-target-rows {
    display: grid;
    gap: calc(var(--spacing, 8px) * 1.25);
  }
`;
