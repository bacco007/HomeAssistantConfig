import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
  }

  .section {
    display: grid;
    gap: var(--dp-spacing-sm);
  }
`;
