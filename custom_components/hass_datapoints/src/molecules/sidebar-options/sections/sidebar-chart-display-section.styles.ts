import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-sm: var(--spacing, 8px);
  }

  .y-axis-group {
    margin-top: var(--dp-spacing-sm);
  }

  .is-subopt {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm);
    font-size: 0.9rem;
    color: var(--primary-text-color);
    padding-left: 22px;
  }

  .is-disabled {
    opacity: 0.5;
  }

  .gap-select {
    width: auto;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: calc(var(--spacing, 8px) * 0.5) calc(var(--spacing, 8px) * 0.75);
    border-radius: 8px;
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
`;
