import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
  }

  .ann-section {
    border-top: 1px solid var(--divider-color, #eee);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ann-list {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
  }

  .pagination-footer {
    border-top: 1px solid var(--divider-color, #eee);
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 92%,
      var(--primary-background-color, #f7f7f7)
    );
  }

  .ann-empty {
    text-align: center;
    padding: 16px;
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }
`;
