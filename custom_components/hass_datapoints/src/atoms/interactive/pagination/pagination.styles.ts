import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    font-size: 0.8rem;
    color: var(--secondary-text-color);
  }
  button {
    background: none;
    border: 1px solid var(--divider-color, #444);
    border-radius: 4px;
    color: var(--primary-text-color);
    cursor: pointer;
    padding: 4px 8px;
    font-family: inherit;
    font-size: 0.8rem;
  }
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  button:not(:disabled):hover {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }
  .info {
    min-width: 120px;
    text-align: center;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sep {
    opacity: 0.55;
  }
`;
