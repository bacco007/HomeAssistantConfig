import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--primary-text-color);
    font-family: inherit;
  }
  .track {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: var(--disabled-color, #bdbdbd);
    transition: background 0.2s ease;
    flex: 0 0 auto;
  }
  .track.on {
    background: var(--primary-color, #03a9f4);
  }
  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s ease;
  }
  .track.on .thumb {
    transform: translateX(16px);
  }
  input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;
