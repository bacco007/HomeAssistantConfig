import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
  }

  .chart-wrap {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .chart-viewport {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  canvas {
    display: block;
  }

  .chart-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 168px;
    padding: 18px 18px 16px;
    border-radius: 18px;
    transform: translate(-50%, -50%);
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 92%,
      transparent
    );
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    color: var(--secondary-text-color);
    z-index: 2;
    text-align: center;
  }

  .chart-loading-spinner {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
    border-top-color: var(--primary-color, #03a9f4);
    animation: sensor-chart-spinner 0.9s linear infinite;
  }

  .chart-loading-label {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .icon-overlay {
    display: contents;
  }

  .ann-icon {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(-50%, -50%);
    pointer-events: auto;
    cursor: pointer;
    box-shadow: 0 0 0 2px var(--card-background-color, #fff);
    z-index: 1;
  }

  .ann-hit {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: auto;
    cursor: pointer;
    background: transparent;
    z-index: 2;
  }

  .ann-icon ha-icon {
    --mdc-icon-size: 12px;
  }

  .tooltip {
    position: absolute;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 0.8em;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    display: none;
    max-width: 220px;
    z-index: 10;
    color: var(--primary-text-color);
  }

  .tt-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    flex-shrink: 0;
  }

  .tt-time {
    color: var(--secondary-text-color);
    margin-bottom: 3px;
  }

  .tt-value {
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }

  .tt-message {
    font-weight: 500;
  }

  .tt-annotation {
    color: var(--secondary-text-color);
    margin-top: 4px;
    white-space: pre-wrap;
  }

  .tt-entities {
    color: var(--secondary-text-color);
    margin-top: 6px;
    white-space: pre-wrap;
  }

  @keyframes sensor-chart-spinner {
    to {
      transform: rotate(360deg);
    }
  }
`;
