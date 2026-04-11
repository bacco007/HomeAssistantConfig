import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
  }
  button {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: 1px solid var(--divider-color, #444);
    border-radius: 6px;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    font-family: inherit;
  }
  button:hover {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }
  button[aria-pressed="false"] {
    opacity: 0.5;
  }
`;
