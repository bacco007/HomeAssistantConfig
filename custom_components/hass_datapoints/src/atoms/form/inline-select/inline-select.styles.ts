import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
  }
  select {
    font: inherit;
    font-size: 0.85rem;
    padding: 2px 6px;
    border-radius: 6px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    cursor: pointer;
  }
  select:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
