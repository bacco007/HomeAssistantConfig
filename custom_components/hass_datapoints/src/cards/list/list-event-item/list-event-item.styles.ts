import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .event-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--divider-color, #eee);
    border-radius: 12px;
    position: relative;
    transition: background 0.15s;
  }

  .event-item.simple {
    align-items: center;
  }

  .event-item:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.02));
  }

  .event-item:last-child {
    border-bottom: none;
  }

  .event-item.is-hidden .ev-icon-main,
  .event-item:hover .ev-icon-main {
    opacity: 0.22;
  }

  .event-item.is-hidden {
    opacity: 0.58;
    background: color-mix(
      in srgb,
      var(--disabled-text-color, #9aa0a6) 8%,
      transparent
    );
  }

  .event-item.is-hidden .ev-message,
  .event-item.is-hidden .ev-full-message,
  .event-item.is-hidden .ev-time-below,
  .event-item.is-hidden .ev-history-link,
  .event-item.is-hidden .ev-entity-chip {
    color: color-mix(in srgb, var(--primary-text-color, #111) 60%, transparent);
  }

  .event-item.expandable {
    cursor: pointer;
  }

  .ev-icon-wrap {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ev-icon-main {
    transition: opacity 120ms ease;
  }

  .ev-body {
    flex: 1;
    min-width: 0;
  }

  .ev-header {
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  .ev-header-text {
    flex: 1;
    min-width: 0;
  }

  .ev-message {
    display: block;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.45;
    color: var(--primary-text-color);
    word-break: break-word;
  }

  .ev-dev-badge {
    display: inline-block;
    font-size: 0.68em;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    background: #ff9800;
    padding: 1px 5px;
    border-radius: 4px;
    vertical-align: middle;
    margin-left: 4px;
  }

  .ev-meta {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ev-history-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--secondary-text-color);
    padding: 0;
    margin: 0;
    cursor: pointer;
    font: inherit;
    text-align: left;
    border-radius: 8px;
    text-decoration: none;
    border: none;
    background: none;
  }

  .ev-history-link:hover {
    text-decoration: underline;
  }

  .ev-time-below {
    font-size: 0.92rem;
    font-weight: 500;
    line-height: 1.35;
    color: var(--secondary-text-color);
    display: block;
  }

  .ev-history-link ha-icon {
    --mdc-icon-size: 18px;
  }

  .ann-expand-chip {
    display: inline-flex;
    align-items: center;
    margin-top: 4px;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 0.75em;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  .ev-full-message {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--primary-text-color);
    margin-top: 10px;
  }

  .ev-full-message.hidden {
    display: none;
  }

  .ev-full-message span {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .ev-entities {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .ev-entity-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.92em;
    line-height: 1.2;
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    padding: 4px 7px;
    border-radius: 999px;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: background 0.15s;
  }

  .ev-entity-chip:hover {
    background: color-mix(in srgb, var(--primary-color) 22%, transparent);
  }

  .ev-entity-chip ha-icon,
  .ev-entity-chip ha-state-icon {
    --mdc-icon-size: 16px;
    flex: 0 0 auto;
  }

  .ev-entity-chip-text {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    line-height: 1.15;
  }

  .ev-entity-chip-primary,
  .ev-entity-chip-secondary {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ev-entity-chip-primary {
    font-weight: 600;
  }

  .ev-entity-chip-secondary {
    font-size: 0.74rem;
    opacity: 0.78;
  }

  .ev-actions {
    display: flex;
    gap: 0;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .event-item:hover .ev-actions,
  .event-item.is-hidden .ev-actions,
  .event-item:focus-within .ev-actions {
    opacity: 1;
  }
`;
