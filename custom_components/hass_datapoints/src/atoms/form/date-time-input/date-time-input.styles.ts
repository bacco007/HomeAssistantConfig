import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  label {
    display: block;
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
  input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    border: 1px solid var(--divider-color, #444);
    border-radius: 6px;
    background: transparent;
    color: var(--primary-text-color);
    font-size: 0.85rem;
    font-family: inherit;
  }
  input:focus {
    border-color: var(--primary-color, #03a9f4);
    outline: none;
  }
`;
