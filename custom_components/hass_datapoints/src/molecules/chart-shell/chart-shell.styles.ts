import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
    min-height: 0;
  }
  ha-card {
    padding: 0;
    overflow: visible;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .card-header {
    padding: var(--dp-spacing-lg, 16px) var(--dp-spacing-lg, 16px) 0;
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .card-header-title {
    min-width: 0;
  }
  .card-header-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  .chart-wrap {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
  }
  loading-indicator {
    position: absolute;
    top: var(--dp-spacing-sm, 8px);
    left: var(--dp-spacing-md, 12px);
    z-index: 6;
  }
  chart-message {
    position: absolute;
    inset: 0;
    z-index: 2;
  }
  ::slotted(*) {
    width: 100%;
    height: 100%;
  }
`;
