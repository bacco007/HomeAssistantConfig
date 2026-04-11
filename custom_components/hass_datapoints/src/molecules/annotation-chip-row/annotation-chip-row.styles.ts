import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .context-form-field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .context-form-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .context-form-help {
    font-size: 0.8rem;
    color: var(--secondary-text-color);
    line-height: 1.45;
  }

  .context-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
`;
