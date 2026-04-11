import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .swatch-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .label {
    font-size: 0.875rem;
    color: var(--primary-text-color);
  }
  .swatch-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--divider-color, #ccc);
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    background: transparent;
  }
  .swatch-btn input[type="color"] {
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
  .swatch-inner {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    pointer-events: none;
  }
`;
