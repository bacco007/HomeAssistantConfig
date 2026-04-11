import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .switch-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .switch-row ha-formfield {
    flex: 1;
  }
  .help-icon {
    color: var(--secondary-text-color);
    cursor: default;
    flex-shrink: 0;
    position: relative;
    font-size: 0.85rem;
  }
  .help-icon:hover .help-tooltip {
    display: block;
  }
  .help-tooltip {
    display: none;
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.78rem;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
    pointer-events: none;
  }
`;
