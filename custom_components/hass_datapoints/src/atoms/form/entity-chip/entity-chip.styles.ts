import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.78rem;
    background: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  .remove {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 2px;
    font-size: 0.9rem;
    color: var(--secondary-text-color);
    line-height: 1;
  }
  .remove:hover {
    color: var(--error-color, #f44336);
  }
`;
