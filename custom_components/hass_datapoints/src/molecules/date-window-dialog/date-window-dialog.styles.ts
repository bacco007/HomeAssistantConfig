import { css } from "lit";

export const styles = css`
  :host {
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .date-window-dialog-content {
    display: grid;
    gap: var(--dp-spacing-sm);
    padding: var(--dp-spacing-sm) 0 0;
    overflow: visible;
  }

  .date-window-dialog-body {
    color: var(--secondary-text-color);
    line-height: 1.4;
    margin-bottom: calc(var(--dp-spacing-xs) * -1);
  }

  .date-window-dialog-field {
    display: grid;
    gap: var(--dp-spacing-xs);
    overflow: visible;
  }

  .date-window-dialog-field.name-field {
    max-width: 320px;
  }

  .date-window-dialog-field label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .date-window-dialog-field ha-textfield,
  .date-window-dialog-field input {
    width: 100%;
  }

  .date-window-dialog-dates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--dp-spacing-sm);
  }

  .date-window-dialog-input {
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 92%,
        transparent
      );
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    box-sizing: border-box;
  }

  .date-window-dialog-input:focus {
    outline: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 36%, transparent);
    outline-offset: 1px;
    border-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 55%,
      transparent
    );
  }

  .date-window-dialog-timeline {
    border-radius: 8px;
    overflow: hidden;
    margin: calc(var(--dp-spacing-xs) * -1) 0;
  }

  .date-window-dialog-timeline range-timeline {
    display: block;
    height: 64px;
  }

  .date-window-dialog-shortcuts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--dp-spacing-sm);
  }

  .date-window-dialog-actions {
    display: flex;
    justify-content: space-between;
    gap: var(--dp-spacing-sm);
    padding-top: 0;
    margin-top: calc(var(--dp-spacing-xs) * -1);
  }

  .date-window-dialog-actions-right {
    display: flex;
    justify-content: flex-end;
    gap: var(--dp-spacing-sm);
    margin-left: auto;
  }

  .date-window-dialog-actions ha-button {
    --mdc-typography-button-font-size: 0.875rem;
  }

  .date-window-dialog-cancel {
    --mdc-theme-primary: var(--primary-text-color);
  }

  .date-window-dialog-submit {
    --mdc-theme-primary: var(--primary-color, #03a9f4);
  }

  .date-window-dialog-delete {
    --mdc-theme-primary: var(--error-color, #db4437);
  }

  @keyframes dp-dialog-shake {
    10%,
    90% {
      transform: translate3d(-2px, 0, 0);
    }
    20%,
    80% {
      transform: translate3d(4px, 0, 0);
    }
    30%,
    50%,
    70% {
      transform: translate3d(-6px, 0, 0);
    }
    40%,
    60% {
      transform: translate3d(6px, 0, 0);
    }
  }

  ha-dialog.dp-shaking {
    animation: dp-dialog-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @media (max-width: 720px) {
    .date-window-dialog-dates {
      grid-template-columns: 1fr;
    }
  }
`;
