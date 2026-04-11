import { css } from "lit";

export const styles = css`
  .method-computing-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 6px;
    vertical-align: middle;
    flex-shrink: 0;
  }

  .method-computing-spinner {
    display: inline-block;
    width: 8px;
    height: 8px;
    border: 1.5px solid var(--divider-color, #ccc);
    border-top-color: var(--primary-color, #03a9f4);
    border-radius: 50%;
    animation: analysis-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  .method-computing-progress {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--primary-color, #03a9f4);
    line-height: 1;
  }

  @keyframes analysis-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .method-list {
    display: grid;
    gap: var(--dp-spacing-sm, 8px);
  }

  .method-item {
    display: grid;
    gap: var(--dp-spacing-sm, 8px);
  }

  ha-tooltip {
    --ha-tooltip-padding: var(--dp-spacing-md, calc(var(--spacing, 8px) * 1.5));
  }

  ha-tooltip::part(body) {
    padding: var(--dp-spacing-md, calc(var(--spacing, 8px) * 1.5));
  }

  .method-help {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 50%;
    border: 1px solid var(--secondary-text-color, #888);
    background: transparent;
    color: var(--secondary-text-color, #888);
    font-size: 9px;
    font-weight: 700;
    cursor: help;
    padding: 0;
    vertical-align: middle;
    appearance: none;
    -webkit-appearance: none;
  }

  .method-help:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
`;
