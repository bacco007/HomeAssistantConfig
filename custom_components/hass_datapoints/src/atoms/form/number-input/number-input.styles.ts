import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  input {
    font: inherit;
    font-size: 0.85rem;
    padding: 2px 6px;
    border-radius: 6px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    width: 5em;
  }
  .suffix {
    font-size: 0.85rem;
    color: var(--secondary-text-color, #666);
  }
`;
