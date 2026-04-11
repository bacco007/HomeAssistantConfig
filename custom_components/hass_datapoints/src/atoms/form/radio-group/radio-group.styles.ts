import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  fieldset {
    border: none;
    margin: 0;
    padding: 0;
  }
  .radio-group {
    display: grid;
    gap: var(--dp-spacing-xs, 4px);
  }
  .radio-option {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-xs, 4px);
    font-size: 0.9rem;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .radio-option input[type="radio"] {
    cursor: pointer;
  }
`;
