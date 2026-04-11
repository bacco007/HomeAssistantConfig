import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .ann-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--divider-color, #eee);
    cursor: default;
  }

  .ann-item:last-child {
    border-bottom: none;
  }

  .ann-item.simple {
    align-items: center;
  }

  .ann-item.is-hidden .ann-icon-main,
  .ann-item:hover .ann-icon-main {
    opacity: 0.22;
  }

  .ann-icon-wrap {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px var(--card-background-color, #fff);
  }

  .ann-icon-main {
    transition: opacity 120ms ease;
  }

  .ann-visibility-btn {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 84%,
      transparent
    );
    color: var(--primary-text-color);
    cursor: pointer;
    opacity: 0;
    transition: opacity 120ms ease;
    padding: 0;
    font: inherit;
  }

  .ann-item:hover .ann-visibility-btn,
  .ann-item.is-hidden .ann-visibility-btn {
    opacity: 1;
  }

  .ann-body {
    flex: 1;
    min-width: 0;
  }

  .ann-header {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .ann-msg {
    font-size: 0.85em;
    font-weight: 500;
    color: var(--primary-text-color);
    word-break: break-word;
    flex: 1;
    min-width: 0;
  }

  .ann-dev-badge {
    display: inline-block;
    font-size: 0.68em;
    font-weight: 700;
    color: #fff;
    background: #ff9800;
    padding: 1px 5px;
    border-radius: 4px;
    vertical-align: middle;
    margin-left: 4px;
  }

  .ann-time-wrap {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .ann-time {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .ann-history-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--secondary-text-color);
    padding: 0;
    cursor: pointer;
  }

  .ann-history-btn ha-icon {
    --mdc-icon-size: 14px;
  }

  .ann-note {
    font-size: 0.78em;
    color: var(--secondary-text-color);
    margin-top: 2px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .ann-note.hidden {
    display: none;
  }

  .ann-expand-chip {
    display: inline-flex;
    align-items: center;
    margin-top: 4px;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 0.75em;
    font-weight: 600;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
`;
