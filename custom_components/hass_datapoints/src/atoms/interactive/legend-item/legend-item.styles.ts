import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
  }
  button {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.625);
    font-size: 0.72rem;
    color: var(--secondary-text-color);
    flex: 0 0 auto;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    white-space: nowrap;
    font-family: inherit;
  }
  button:hover {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }
  .legend-line {
    width: calc(var(--spacing, 8px) * 2);
    height: 3px;
    border-radius: 2px;
    flex-shrink: 0;
  }
`;
