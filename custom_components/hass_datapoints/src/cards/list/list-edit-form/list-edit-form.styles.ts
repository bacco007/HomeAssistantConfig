import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .edit-form {
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 8px;
    padding: 10px;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .full-width-field {
    display: block;
    width: 100%;
  }

  .edit-row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .edit-row > * {
    min-width: 0;
  }

  .annotation-edit {
    display: block;
    width: 100%;
    min-height: 72px;
    resize: vertical;
    box-sizing: border-box;
    padding: 8px 10px;
    border: 1px solid var(--divider-color, #9e9e9e);
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    line-height: 1.45;
  }

  .color-swatch-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--divider-color, #ccc);
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    flex-shrink: 0;
    background: none;
    position: relative;
  }

  .color-swatch-btn input[type="color"] {
    position: absolute;
    top: -4px;
    left: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    border: none;
    cursor: pointer;
    padding: 0;
    background: none;
    opacity: 0;
  }

  .color-swatch-inner {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    pointer-events: none;
  }
`;
