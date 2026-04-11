import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .label {
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
`;
