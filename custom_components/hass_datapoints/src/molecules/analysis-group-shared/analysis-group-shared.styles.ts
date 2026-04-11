import { css } from "lit";

export const sharedStyles = css`
  :host {
    display: block;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .field {
    display: grid;
    gap: 4px;
    justify-items: start;
  }

  .field-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--secondary-text-color);
  }

  .select,
  .input {
    width: auto;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: calc(var(--spacing, 8px) * 0.75) calc(var(--spacing, 8px) * 0.875);
    border-radius: 10px;
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.84rem;
  }

  .toggle-group {
    display: flex;
    gap: calc(var(--spacing, 8px) * 0.625);
    align-items: center;
  }

  .option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    color: var(--primary-text-color);
    font-size: 0.84rem;
    cursor: pointer;
  }

  .option input[type="checkbox"] {
    margin: 0;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }
`;
