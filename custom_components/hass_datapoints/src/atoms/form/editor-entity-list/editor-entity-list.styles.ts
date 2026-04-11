import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .entity-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .entity-row ha-selector {
    flex: 1;
    min-width: 0;
  }
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    font-size: 1.1rem;
    color: var(--secondary-text-color);
    line-height: 1;
  }
  .remove-btn:hover {
    color: var(--error-color, #f44336);
  }
  .add-wrap {
    margin-top: 4px;
  }
`;
