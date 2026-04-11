import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  button {
    width: 100%;
    min-height: 38px;
    padding: var(--dp-spacing-sm, 8px) var(--dp-spacing-sm, 8px);
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm, 8px);
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  button:hover,
  button:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 6%,
      transparent
    );
    outline: none;
  }
  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button[disabled]:hover {
    background: transparent;
  }
  ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    flex: 0 0 auto;
  }
`;
