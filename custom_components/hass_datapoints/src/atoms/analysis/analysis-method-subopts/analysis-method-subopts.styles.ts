import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-sm: var(--spacing, 8px);
  }

  .subopts {
    padding-left: calc(var(--spacing, 8px) * 1.5);
    display: grid;
    gap: var(--dp-spacing-sm);
    justify-items: start;
    border-left: 3px solid var(--primary-color);
    margin-left: 5px;
  }
`;
