import { css } from "lit";

export const styles = css`
  :host {
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .ai-query-brief-dialog-content {
    display: grid;
    gap: var(--dp-spacing-md);
    padding: var(--dp-spacing-sm) 0 0;
  }

  .ai-query-brief-dialog-body {
    color: var(--secondary-text-color);
    line-height: 1.5;
  }

  .ai-query-brief-dialog-field {
    display: grid;
    gap: var(--dp-spacing-xs);
  }

  .ai-query-brief-dialog-field label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .ai-query-brief-dialog-textarea {
    width: 100%;
    min-height: 320px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 92%,
        transparent
      );
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 94%,
      var(--primary-background-color, #f7f7f7)
    );
    color: var(--primary-text-color);
    font:
      0.88rem/1.5 ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      monospace;
    resize: vertical;
    box-sizing: border-box;
  }

  .ai-query-brief-dialog-textarea:focus {
    outline: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 36%, transparent);
    outline-offset: 1px;
    border-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 55%,
      transparent
    );
  }

  .ai-query-brief-dialog-status {
    min-height: 1.25rem;
    color: var(--secondary-text-color);
    font-size: 0.84rem;
  }

  .ai-query-brief-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--dp-spacing-sm);
  }

  .ai-query-brief-dialog-copy {
    --mdc-theme-primary: var(--primary-color, #03a9f4);
  }

  .ai-query-brief-dialog-close {
    --mdc-theme-primary: var(--primary-text-color);
  }
`;
