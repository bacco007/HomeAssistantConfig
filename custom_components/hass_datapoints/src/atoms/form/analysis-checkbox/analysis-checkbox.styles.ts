import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
  }
  label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--primary-text-color);
  }
  label.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  input[type="checkbox"] {
    cursor: pointer;
    margin: 0;
  }
  input[type="checkbox"]:disabled {
    cursor: not-allowed;
  }
`;
