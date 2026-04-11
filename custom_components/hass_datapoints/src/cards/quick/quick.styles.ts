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
    justify-content: flex-start;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    gap: 12px;
  }
  feedback-banner {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 2px;
    --dp-feedback-margin-top: 0;
    --dp-feedback-padding: 2px 8px;
    --dp-feedback-radius: 4px;
  }
  .card-header {
    padding: 16px 16px 0;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5;
    color: var(--primary-text-color);
  }
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    flex: 1 1 auto;
    min-height: 0;
  }
  .card-content.with-header {
    padding-top: 12px;
  }
  .input-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .input-row ha-textfield {
    flex: 1;
  }
  .no-permission {
    color: var(--secondary-text-color);
    font-size: 0.875rem;
    margin: 0;
  }
`;
