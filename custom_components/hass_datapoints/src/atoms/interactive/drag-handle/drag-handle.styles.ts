import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: grab;
    padding: 4px;
    color: var(--secondary-text-color);
    border-radius: 4px;
  }
  button:hover {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }
  button:active {
    cursor: grabbing;
  }
  ha-icon {
    --mdc-icon-size: 18px;
  }
`;
