import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .checkbox-group {
    display: grid;
    gap: var(--dp-spacing-xs, 4px);
  }
  .checkbox-option {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-xs, 4px);
    font-size: 0.9rem;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .checkbox-option input[type="checkbox"] {
    cursor: pointer;
  }
`;
