import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-sm: var(--spacing, 8px);
  }

  .subopts {
    padding-left: calc(var(--spacing, 8px) * 1.25);
    padding-top: 2px;
    display: grid;
    gap: calc(var(--dp-spacing-sm) * 0.75);
    justify-items: start;
    margin-left: 1px;
  }
`;
