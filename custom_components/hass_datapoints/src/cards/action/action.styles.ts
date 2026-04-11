import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  ha-card {
    padding: 16px;
  }

  .card-header {
    font-size: 1.1em;
    font-weight: 500;
    margin-bottom: 16px;
    color: var(--primary-text-color);
  }

  .form-group {
    margin-bottom: 12px;
  }

  .row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .row .form-group {
    flex: 1;
    min-width: 0;
  }

  .color-col {
    max-width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .full-width-field {
    display: block;
    width: 100%;
  }

  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.84rem;
    font-weight: 500;
    color: var(--secondary-text-color);
  }

  .annotation-input {
    display: block;
    width: 100%;
    min-height: 104px;
    resize: vertical;
    box-sizing: border-box;
    padding: 12px;
    border: 1px solid
      var(--input-outlined-idle-border-color, var(--divider-color, #9e9e9e));
    border-radius: 12px;
    background: var(
      --card-background-color,
      var(--primary-background-color, #fff)
    );
    color: var(--primary-text-color);
    font: inherit;
    line-height: 1.45;
  }

  .annotation-input::placeholder {
    color: var(--secondary-text-color);
  }

  .annotation-input:focus {
    outline: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 40%, transparent);
    outline-offset: 1px;
  }

  ha-button {
    display: block;
    margin-top: 8px;
    --mdc-theme-primary: var(--primary-color);
  }

  .no-permission {
    padding: 8px 0;
    color: var(--secondary-text-color);
    font-size: 0.875rem;
  }
`;
