import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .chart-tabs-shell {
    position: relative;
    min-width: 0;
    border-bottom: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    z-index: 1;
    display: flex;
    align-items: center;
    gap: calc(var(--dp-spacing-sm, 8px));
  }

  .chart-tabs-rail {
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    padding-right: 10px;
    flex-grow: 1;
  }

  .chart-tabs-rail::-webkit-scrollbar {
    display: none;
  }

  .chart-tabs {
    display: flex;
    align-items: flex-end;
    width: 100%;
    min-width: 0;
    gap: 0;
    padding: 0 var(--dp-spacing-md);
    box-sizing: border-box;
  }

  .chart-tabs-add {
    margin-right: calc(var(--dp-spacing-sm, 16px));
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    padding: calc(var(--dp-spacing-sm, 8px) * 0.625) var(--dp-spacing-sm);
    height: 26px;
    border: 0;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 12%,
      var(--card-background-color, #fff)
    );
    color: var(--primary-color, #03a9f4);
    font: inherit;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    z-index: 2;
  }

  .chart-tabs-add ha-icon {
    --mdc-icon-size: 16px;
  }

  .chart-tabs-add:hover,
  .chart-tabs-add:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 18%,
      var(--card-background-color, #fff)
    );
    outline: none;
  }

  .chart-tabs-shell.overflowing .chart-tabs-add {
    top: var(--dp-spacing-xs);
    transform: none;
    width: 34px;
    min-width: 34px;
    height: 34px;
    padding: 0;
    justify-content: center;
    border-radius: 999px;
  }

  .chart-tabs-shell.overflowing .chart-tabs-add-label {
    display: none;
  }
`;
