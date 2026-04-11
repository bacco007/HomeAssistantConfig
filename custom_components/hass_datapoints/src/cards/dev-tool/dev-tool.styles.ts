export const styles = `
  :host { display: block; }
  ha-card { padding: 16px; }
  .card-header {
    font-size: 1.1em;
    font-weight: 500;
    margin-bottom: 16px;
    color: var(--primary-text-color);
  }
  .section-title {
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    letter-spacing: 0.06em;
    margin: 0 0 10px;
  }
  ha-selector {
    display: block;
    width: 100%;
  }
  .form-group {
    margin-bottom: 12px;
  }
  .analyze-row {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .divider {
    border: none;
    border-top: 1px solid var(--divider-color, #e0e0e0);
    margin: 20px 0;
  }
  .dev-summary {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    background: var(--secondary-background-color, rgba(0,0,0,0.04));
    border-radius: 8px;
    margin-bottom: 10px;
  }
  .dev-count-label {
    font-size: 0.88em;
    color: var(--primary-text-color);
  }
  .dev-count-num {
    font-weight: 600;
    color: var(--primary-color);
  }
  .delete-btn {
    --mdc-theme-primary: var(--error-color, #f44336);
  }
`;
