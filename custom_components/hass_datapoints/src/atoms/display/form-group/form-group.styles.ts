import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 0;
  }
  .form-group {
    display: grid;
    gap: 6px;
    min-width: 0;
  }
  .form-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .form-help {
    font-size: 0.8rem;
    color: var(--secondary-text-color);
    line-height: 1.45;
  }
`;
