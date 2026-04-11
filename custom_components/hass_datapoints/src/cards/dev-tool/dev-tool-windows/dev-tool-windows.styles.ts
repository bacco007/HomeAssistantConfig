import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .windows-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .windows-sub {
    font-size: 0.82em;
    color: var(--secondary-text-color);
  }

  .add-window-btn {
    font-size: 0.8em;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    border-radius: 14px;
    background: none;
    cursor: pointer;
    padding: 3px 10px;
    font: inherit;
  }

  .window-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 8px;
    padding: 10px 10px 10px 12px;
    margin-bottom: 6px;
  }

  .window-fields {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-end;
  }

  .w-label-wrap {
    flex: 1.2;
    min-width: 90px;
  }

  .w-start-wrap {
    flex: 1.8;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .w-end-wrap {
    flex: 1.8;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .w-start-label,
  .w-field-label {
    font-size: 0.72em;
    color: var(--secondary-text-color);
    padding-left: 2px;
    margin-bottom: 3px;
  }

  .w-start,
  .w-end,
  .w-label-native {
    padding: 9px 10px;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-radius: 4px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.85em;
  }

  .remove-window-btn {
    flex-shrink: 0;
    align-self: center;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 6px;
    border-radius: 50%;
    line-height: 0;
  }

  .remove-window-btn:hover {
    color: var(--error-color, #f44336);
    background: rgba(244, 67, 54, 0.1);
  }

  .remove-window-btn[disabled] {
    opacity: 0.25;
    pointer-events: none;
  }

  .remove-window-btn ha-icon {
    --mdc-icon-size: 18px;
  }
`;
