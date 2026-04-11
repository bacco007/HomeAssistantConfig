import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .header {
    padding: 8px 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .name {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--secondary-text-color);
    line-height: 40px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    pointer-events: none;
  }

  .icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--state-icon-color, var(--secondary-text-color));
  }

  .icon ha-state-icon {
    --mdc-icon-size: 24px;
  }

  .info {
    display: flex;
    align-items: baseline;
    padding: 0 16px 16px;
    margin-top: -4px;
    line-height: var(--ha-line-height-condensed);
    pointer-events: none;
  }

  .value {
    font-size: var(--ha-font-size-3xl, 2.5rem);
    font-weight: var(--ha-font-weight-normal, 400);
    line-height: 0.95;
    letter-spacing: -0.03em;
    color: var(--primary-text-color);
  }

  .measurement {
    font-size: 1rem;
    color: var(--secondary-text-color);
    font-weight: 400;
    pointer-events: none;
  }

  .first-part {
    order: -1;
    margin-right: 4px;
    margin-inline-end: 4px;
    margin-inline-start: initial;
  }
`;
