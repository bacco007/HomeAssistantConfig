import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .sidebar-options-card {
    display: grid;
    gap: var(--dp-spacing-lg);
  }
`;
