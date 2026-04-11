import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    position: relative;
    min-height: 58px;
    overflow: visible;
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
  }

  .range-toolbar {
    display: flex;
    align-items: stretch;
    flex-wrap: nowrap;
    min-height: 58px;
    overflow: visible;
  }

  .range-toolbar > * {
    min-width: 0;
  }

  .range-toolbar > * + * {
    position: relative;
    margin-left: var(--dp-spacing-xs);
    padding-left: var(--dp-spacing-lg);
  }

  .range-toolbar > * + *::before {
    content: "";
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 1px;
    background: color-mix(
      in srgb,
      var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
      transparent
    );
  }

  .range-sidebar-toggle {
    display: none;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    margin: 0;
    --mdc-icon-size: 20px;
    --icon-primary-color: var(--secondary-text-color);
  }

  .range-sidebar-toggle:hover,
  .range-sidebar-toggle:focus-visible {
    --icon-primary-color: var(--primary-text-color);
  }

  /* Mobile date inputs — hidden by default, shown at <=720px */
  .range-mobile-dates {
    display: none;
    align-items: center;
    gap: var(--dp-spacing-sm);
    flex: 1 1 auto;
    min-width: 0;
  }

  .range-mobile-dates date-time-input {
    flex: 1 1 0;
    min-width: 0;
  }

  .range-timeline-wrap {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
  }

  .range-picker-wrap,
  .range-options-wrap {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    align-self: stretch;
  }

  .range-picker-button,
  .range-options-button {
    display: block;
    padding: 0;
    min-width: 40px;
    --mdc-icon-size: 24px;
    --icon-primary-color: var(--secondary-text-color);
  }

  .range-picker-button:hover,
  .range-picker-button:focus-visible,
  .range-options-button:hover,
  .range-options-button:focus-visible {
    --icon-primary-color: var(--primary-text-color);
  }

  .range-options-view[hidden] {
    display: none;
  }

  .range-options-header {
    display: block;
    min-height: 36px;
    margin-bottom: var(--dp-spacing-xs);
  }

  .range-options-header-trigger {
    width: 100%;
    min-height: 38px;
    padding: var(--dp-spacing-sm) var(--dp-spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm);
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .range-options-header-trigger:hover,
  .range-options-header-trigger:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 6%,
      transparent
    );
    outline: none;
  }

  .range-options-title {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .range-options-list {
    display: grid;
    gap: var(--dp-spacing-xs);
    padding: 0;
  }

  .range-option,
  .range-submenu-trigger,
  .range-options-back {
    width: 100%;
    min-height: 38px;
    padding: var(--dp-spacing-sm) var(--dp-spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm);
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .range-submenu-trigger,
  .range-options-back {
    justify-content: space-between;
  }

  .range-options-back {
    width: auto;
    min-width: 0;
    padding-inline: 8px;
    flex: 0 0 auto;
  }

  .range-submenu-meta {
    color: var(--secondary-text-color);
    font-size: 0.84rem;
    margin-left: auto;
    padding-left: var(--dp-spacing-md);
  }

  .range-option:hover,
  .range-option:focus-visible,
  .range-submenu-trigger:hover,
  .range-submenu-trigger:focus-visible,
  .range-options-back:hover,
  .range-options-back:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 6%,
      transparent
    );
    outline: none;
  }

  .range-option::before {
    content: "";
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-sizing: border-box;
    border: 2px solid
      color-mix(in srgb, var(--primary-text-color, #111) 42%, transparent);
    flex: 0 0 auto;
  }

  .range-option.selected::before {
    border-color: var(--primary-color, #03a9f4);
    box-shadow: inset 0 0 0 4px var(--card-background-color, #fff);
    background: var(--primary-color, #03a9f4);
  }

  .range-submenu-trigger::after {
    content: "›";
    color: var(--secondary-text-color);
    font-size: 1rem;
    line-height: 1;
    margin-left: var(--dp-spacing-sm);
  }

  .range-option-label {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 900px) {
    .range-toolbar {
      flex-wrap: nowrap;
    }

    .range-toolbar > * + * {
      margin-left: 0;
      padding-left: 0;
    }

    .range-toolbar > * + *::before {
      display: none;
    }

    .range-sidebar-toggle {
      display: none;
    }
  }

  @media (max-width: 720px) {
    .range-toolbar > * + * {
      margin-left: 2px;
      padding-left: 8px;
    }

    .range-toolbar > * + *::before {
      top: 8px;
      bottom: 8px;
    }

    .range-toolbar .range-sidebar-toggle,
    .range-toolbar .range-picker-button,
    .range-toolbar .range-options-button {
      align-self: flex-end;
    }

    .range-picker-button,
    .range-options-button {
      min-width: 32px;
      --mdc-icon-size: 20px;
    }

    panel-timeline {
      display: none;
    }

    .range-mobile-dates {
      display: flex;
    }

    .range-sidebar-toggle {
      display: inline-flex;
    }
  }
`;
