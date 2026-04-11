import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
  }
  ha-card {
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .card-header {
    padding: 16px 16px 0;
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 0 0 auto;
  }
  .search-wrap {
    padding: var(--dp-spacing-md);
    flex: 0 0 auto;
    border-bottom: 1px solid var(--divider-color, #eee);
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 92%,
      var(--primary-background-color, #f7f7f7)
    );
  }
  .search-wrap input {
    width: 100%;
  }
  .list-scroll {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
  }
  .event-list {
    padding: 0 12px 12px;
    box-sizing: border-box;
  }
  .pagination-wrap {
    flex: 0 0 auto;
    border-top: 1px solid var(--divider-color, #eee);
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 92%,
      var(--primary-background-color, #f7f7f7)
    );
  }
  .empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  .empty ha-icon {
    --mdc-icon-size: 32px;
    display: block;
    margin: 0 auto 8px;
    opacity: 0.5;
  }
`;
