import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }
  .context-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
    font-size: 0.82rem;
    font-family: inherit;
  }
  .context-chip ha-icon,
  .context-chip ha-state-icon {
    --mdc-icon-size: 14px;
    flex: 0 0 auto;
  }
  .context-chip-text {
    display: inline-flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.15;
  }
  .context-chip-primary,
  .context-chip-secondary {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .context-chip-primary {
    font-weight: 600;
  }
  .context-chip-secondary {
    font-size: 0.74rem;
    opacity: 0.8;
  }
  .context-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    flex: 0 0 auto;
  }
  .context-chip-remove:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
  .context-chip-remove ha-icon {
    --mdc-icon-size: 12px;
    pointer-events: none;
  }
`;
