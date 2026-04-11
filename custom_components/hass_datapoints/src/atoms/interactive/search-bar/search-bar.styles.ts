import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  charts/statistics/card-statistics {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
  }
  input {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    background: transparent;
    border: 1px solid var(--divider-color, #444);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.85rem;
    color: var(--primary-text-color);
    outline: none;
    font-family: inherit;
  }
  input:focus {
    border-color: var(--primary-color, #03a9f4);
  }
  input::placeholder {
    color: var(--secondary-text-color);
    opacity: 0.6;
  }
`;
