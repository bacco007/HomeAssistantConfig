import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
    color: var(--primary-text-color);
    background: var(--primary-background-color);
    --dp-spacing-xs: calc(var(--spacing, 8px) * 0.5);
    --dp-spacing-sm: var(--spacing, 8px);
    --dp-spacing-md: calc(var(--spacing, 8px) * 1.5);
    --dp-spacing-lg: calc(var(--spacing, 8px) * 2);
    --dp-spacing-xl: calc(var(--spacing, 8px) * 2.5);
  }

  ha-top-app-bar-fixed {
    display: block;
    height: 100%;
    min-height: 100%;
    overflow: visible;
    --app-header-background-color: var(
      --card-background-color,
      var(--primary-background-color)
    );
    --app-header-text-color: var(--primary-text-color);
  }

  ha-top-app-bar-fixed:not(:defined) {
    display: grid;
    min-height: 100%;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-rows: auto auto 1fr;
    align-items: center;
  }

  ha-top-app-bar-fixed:not(:defined) > [slot="navigationIcon"] {
    grid-column: 1;
    grid-row: 1;
  }

  ha-top-app-bar-fixed:not(:defined) > [slot="title"] {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    padding: 0 var(--dp-spacing-lg);
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 64px;
    color: var(--app-header-text-color, var(--primary-text-color));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ha-top-app-bar-fixed:not(:defined) > [slot="actionItems"] {
    grid-column: 3;
    grid-row: 1;
  }

  ha-top-app-bar-fixed:not(:defined) > .controls-section {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  ha-top-app-bar-fixed:not(:defined) > .page-content {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  ha-menu-button:not(:defined),
  ha-icon-button:not(:defined) {
    display: block;
    width: 48px;
    height: 48px;
  }

  .controls-section {
    position: relative;
    overflow: visible;
    z-index: 1;
    background: var(
      --app-header-background-color,
      var(--card-background-color, var(--primary-background-color))
    );
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    box-sizing: border-box;
    padding: var(--dp-spacing-md) var(--dp-spacing-md) var(--dp-spacing-md) 0;
  }

  .page-header-actions {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 48px;
    z-index: 40;
  }

  .page-menu-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    z-index: 40;
  }

  .page-menu-button {
    display: block;
    padding: 0;
    min-width: 40px;
    --mdc-icon-size: 24px;
    --icon-primary-color: var(--secondary-text-color);
  }

  .page-menu-button:hover,
  .page-menu-button:focus-visible {
    --icon-primary-color: var(--primary-text-color);
  }

  .controls-grid {
    display: block;
    width: 100%;
    overflow: visible;
    position: relative;
    z-index: 20;
  }

  .page-content {
    --sidebar-width-expanded: clamp(280px, 24vw, 380px);
    --sidebar-width-collapsed: 52px;
    position: relative;
    z-index: 0;
    height: var(--history-page-content-height, 100%);
    min-height: 0;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: var(--sidebar-width-expanded) minmax(0, 1fr);
    align-items: stretch;
    padding: 0;
    transition: grid-template-columns 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-content.sidebar-collapsed {
    grid-template-columns: var(--sidebar-width-collapsed) minmax(0, 1fr);
  }

  .page-sidebar {
    position: relative;
    width: var(--sidebar-width-expanded);
    max-width: var(--sidebar-width-expanded);
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: var(--dp-spacing-lg);
    border-right: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    overflow-x: hidden;
    overflow-y: auto;
    transition:
      width 400ms cubic-bezier(0.4, 0, 0.2, 1),
      max-width 400ms cubic-bezier(0.4, 0, 0.2, 1),
      padding 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-sidebar.collapsed {
    width: var(--sidebar-width-collapsed);
    max-width: var(--sidebar-width-collapsed);
    padding: var(--dp-spacing-lg) 0;
    overflow: visible;
  }

  .page-sidebar.collapsed .sidebar-toggle-button {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }

  .sidebar-toggle-button {
    position: absolute;
    top: var(--dp-spacing-xs);
    right: calc(var(--dp-spacing-sm) / 2);
    width: 48px;
    height: 48px;
    padding: 0;
    margin: 0;
    --mdc-icon-size: 24px;
    --icon-primary-color: var(--secondary-text-color);
    z-index: 2;
  }

  .sidebar-toggle-button:hover,
  .sidebar-toggle-button:focus-visible {
    --icon-primary-color: var(--primary-text-color);
  }

  .sidebar-toggle-button ha-icon {
    display: block;
  }

  .content {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
    align-self: stretch;
    box-sizing: border-box;
    overflow: hidden;
    padding: var(--dp-spacing-lg);
  }

  .content > ::slotted(*) {
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
  }

  .content > ::slotted(resizable-panes),
  .content > ::slotted(*[is-panes]) {
    flex: 1 1 0;
    min-height: 0;
  }

  .control-date {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .control-target {
    width: 100%;
    max-width: none;
    min-width: 0;
    flex: 0 0 auto;
    box-sizing: border-box;
  }

  .page-sidebar.collapsed .control-target {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
  }

  .page-sidebar.collapsed .control-target > ::slotted(*) {
    flex: 1 1 auto;
    min-height: 0;
  }

  .sidebar-options {
    width: calc(var(--sidebar-width-expanded) - var(--dp-spacing-lg) * 2);
    max-width: var(--sidebar-width-expanded);
    flex: 0 0 auto;
    padding-top: var(--dp-spacing-md);
    transform: translateX(0);
    transform-origin: left center;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    overflow: hidden;
    transition:
      opacity 220ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0s linear 0s;
  }

  .page-sidebar.collapsed .sidebar-options {
    opacity: 0;
    transform: translateX(calc(-1 * var(--sidebar-width-collapsed)));
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 180ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0s linear 180ms;
  }

  /* Scrim — hidden by default, enabled at <=900px via media query */
  .sidebar-scrim {
    display: none;
  }

  .collapsed-target-popup {
    position: fixed;
    z-index: 9;
    width: 300px;
    overflow-y: auto;
    background: var(--card-background-color, #fff);
    border-radius: 16px;
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .collapsed-target-popup[hidden] {
    display: none;
  }

  .collapsed-options-popup {
    position: fixed;
    z-index: 100;
    background: var(--card-background-color, #fff);
    border-radius: 14px;
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: visible;
  }

  .collapsed-options-popup[hidden] {
    display: none;
  }

  @media (max-width: 900px) {
    .controls-section {
      padding: var(--dp-spacing-md);
    }

    .page-content {
      grid-template-columns: minmax(0, 1fr);
      position: relative;
    }

    .page-content.sidebar-collapsed {
      grid-template-columns: 52px minmax(0, 1fr);
    }

    .page-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      min-width: min(380px, 85vw);
      width: min(380px, 85vw);
      height: 100%;
      z-index: 10;
      background: var(--card-background-color, var(--primary-background-color));
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
      border-right: none;
      padding: var(--dp-spacing-lg);
      overflow-y: auto;
      min-height: 0;
    }

    .page-sidebar.collapsed {
      position: relative;
      width: auto;
      min-width: 0;
      box-shadow: none;
      border-right: 1px solid
        color-mix(
          in srgb,
          var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
          transparent
        );
      transform: none;
      transition: none;
      z-index: 0;
    }

    .sidebar-toggle-button {
      display: inline-flex;
    }

    .sidebar-scrim {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 9;
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      pointer-events: none;
      transition: opacity 300ms;
    }

    .sidebar-scrim.visible {
      opacity: 1;
      pointer-events: auto;
    }
  }

  @media (max-width: 720px) {
    .page-content.sidebar-collapsed {
      grid-template-columns: minmax(0, 1fr);
    }

    .page-sidebar.collapsed {
      position: absolute;
      transform: translateX(-100%);
      visibility: hidden;
      transition:
        transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear 400ms;
    }

    .sidebar-toggle-button {
      display: none;
    }
  }

  @media (max-width: 545px) {
    .page-sidebar {
      width: min(380px, 95vw);
    }
  }
`;
