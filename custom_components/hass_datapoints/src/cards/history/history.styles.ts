import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
  }

  ha-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-header {
    margin: 0;
    padding: 12px 16px 0;
    font-size: 24px;
    font-weight: 400;
    line-height: 48px;
    color: var(--primary-text-color);
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .card-header-title {
    min-width: 0;
    font: inherit;
    line-height: inherit;
    font-weight: inherit;
  }

  .card-header-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    align-self: center;
  }

  hass-datapoints-history-chart {
    flex: 1 1 auto;
    min-height: 0;
  }
`;
