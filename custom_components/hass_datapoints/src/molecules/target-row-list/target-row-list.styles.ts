import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
    --dp-spacing-xl: calc(var(--spacing, 8px) * 2.5);
  }

  .history-target-table {
    display: grid;
  }

  .history-target-table-body {
    display: grid;
    gap: calc(var(--spacing, 8px) * 1.25);
    margin: calc(var(--spacing, 8px) * 1.25) 0 0 0;
  }

  .history-target-empty {
    padding: var(--dp-spacing-md) var(--dp-spacing-sm);
    border-radius: 12px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 4%,
      transparent
    );
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.84rem;
  }

  /* Cursor — dragging is a list concern; cursor inherits into the row's shadow DOM */
  target-row {
    cursor: grab;
  }

  target-row.is-dragging {
    cursor: grabbing;
  }

  /* Drag states applied to the target-row host element */

  target-row {
    border-radius: 16px;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }

  target-row.is-dragging {
    opacity: 0.35;
    pointer-events: none;
  }

  target-row.is-drag-over-before,
  target-row.is-drag-over-after {
    position: relative;
    overflow: visible;
  }

  target-row.is-drag-over-before {
    border-top: 1px solid var(--primary-color, #03a9f4);
  }

  target-row.is-drag-over-after {
    border-bottom: 1px solid var(--primary-color, #03a9f4);
  }

  target-row .history-target-row {
    cursor: grab;
  }
`;
