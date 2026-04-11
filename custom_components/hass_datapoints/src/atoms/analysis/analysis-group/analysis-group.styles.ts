import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .group {
    display: grid;
    gap: var(--dp-spacing-sm);
    border-radius: 6px;
  }

  .group-body {
    display: grid;
    gap: var(--dp-spacing-sm);
    padding: var(--dp-spacing-sm);
    border-left: 3px solid var(--primary-color);
    margin-left: 5px;
    padding-left: var(--dp-spacing-md);
  }

  .option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    color: var(--primary-text-color);
    font-size: 0.84rem;
    cursor: pointer;
  }

  .option.top {
    align-items: flex-start;
  }

  .option.is-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .option input[type="checkbox"] {
    margin: 0;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }

  .help-text {
    display: inline-block;
    color: var(--secondary-text-color);
    opacity: 0.8;
    padding-top: 2px;
  }
`;
