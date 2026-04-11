import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    margin-top: 18px;
  }

  .results-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .selected-summary {
    font-size: 0.84em;
    color: var(--secondary-text-color);
    flex: 1;
  }

  .selected-summary strong {
    color: var(--primary-text-color);
  }

  .window-result {
    margin-bottom: 10px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--divider-color, #e0e0e0);
  }

  .window-result-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    cursor: pointer;
    user-select: none;
  }

  .window-result-toggle {
    font-size: 0.7em;
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }

  .window-result.collapsed .window-result-toggle {
    transform: rotate(-90deg);
  }

  .window-result-title {
    flex: 1;
    font-size: 0.88em;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .window-result-meta {
    font-weight: 400;
    font-size: 0.88em;
    color: var(--secondary-text-color);
  }

  .window-result-links {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }

  .window-link {
    font-size: 0.78em;
    color: var(--primary-color);
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    font: inherit;
  }

  .window-result-body {
    display: block;
  }

  .window-result.collapsed .window-result-body {
    display: none;
  }

  .changes-list {
    max-height: 260px;
    overflow-y: auto;
  }

  .change-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 7px 12px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
    cursor: pointer;
  }

  .change-info {
    flex: 1;
    min-width: 0;
  }

  .change-msg {
    font-size: 0.88em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .change-meta {
    font-size: 0.76em;
    color: var(--secondary-text-color);
    margin-top: 1px;
  }

  .empty-changes {
    padding: 16px 12px;
    font-size: 0.84em;
    color: var(--secondary-text-color);
  }
`;
