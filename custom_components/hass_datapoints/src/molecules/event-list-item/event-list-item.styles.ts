import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, #333);
  }
  .icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.75rem;
  }
  .content {
    flex: 1;
    min-width: 0;
  }
  .message {
    font-size: 0.85rem;
    color: var(--primary-text-color);
    word-break: break-word;
  }
  .annotation {
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    margin-top: 2px;
    font-style: italic;
  }
  .time {
    font-size: 0.72rem;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    border-radius: 4px;
  }
  .action-btn:hover {
    background: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
  }
  .action-btn.delete:hover {
    color: var(--error-color, #f44336);
  }
`;
