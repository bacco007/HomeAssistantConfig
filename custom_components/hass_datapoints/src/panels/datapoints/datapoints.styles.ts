export const PANEL_HISTORY_STYLE = `
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
    --ha-tooltip-background-color: color-mix(in srgb, #0f1218 96%, transparent);
    --ha-tooltip-text-color: rgba(255, 255, 255, 0.96);
    --ha-tooltip-padding: var(--dp-spacing-md) calc(var(--dp-spacing-md) + 10px);
    --ha-tooltip-border-radius: 10px;
    --ha-tooltip-arrow-size: 10px;
    --ha-tooltip-font-size: 0.86rem;
    --ha-tooltip-line-height: 1.1;
  }

  ha-tooltip::part(base__arrow) {
    z-index: -1;
  }

  ha-tooltip::part(body) {
    padding: var(--dp-spacing-md);
  }

  ha-top-app-bar-fixed {
    display: block;
    height: 100%;
    min-height: 100%;
    overflow: visible;
    --app-header-background-color: var(--card-background-color, var(--primary-background-color));
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
    background: var(--app-header-background-color, var(--card-background-color, var(--primary-background-color)));
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

  .page-menu {
    position: fixed;
    top: var(--page-menu-top, 56px);
    left: var(--page-menu-left, 0px);
    z-index: 9999;
    min-width: 220px;
    padding: var(--dp-spacing-xs);
    border-radius: 14px;
    background: var(--card-background-color, #fff);
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.18),
      0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
  }

  .page-menu[hidden] {
    display: none;
  }

  .page-menu-item {
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

  .page-menu-item:hover,
  .page-menu-item:focus-visible {
    background: color-mix(in srgb, var(--primary-text-color, #111) 6%, transparent);
    outline: none;
  }

  .page-menu-item ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    flex: 0 0 auto;
  }

  .controls-grid {
    display: block;
    width: 100%;
    overflow: visible;
    position: relative;
    z-index: 20;
  }

  .page-content {
    position: relative;
    z-index: 0;
    height: var(--history-page-content-height, 100%);
    min-height: 0;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
    align-items: stretch;
    padding: 0;
    transition: grid-template-columns 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-content.sidebar-collapsed {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .page-sidebar {
    position: relative;
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: var(--dp-spacing-lg);
    border-right: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    overflow-y: auto;
    transition: padding 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-sidebar.collapsed {
    padding: 0;
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
    transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-sidebar.collapsed .sidebar-toggle-button ha-icon {
    transform: rotate(180deg);
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

  .content > resizable-panes {
    flex: 1 1 0;
    min-height: 0;
  }

  /* Legacy: when resizable-panes is not used (e.g. empty state) */
  .content > ha-card.empty {
    flex: 0 0 auto;
  }

  .content.datapoints-hidden resizable-panes {
    --dp-panes-second-hidden: 1;
  }

  .control-target {
    width: 100%;
    max-width: none;
    min-width: 0;
    box-sizing: border-box;
  }

  .history-targets {
    display: grid;
    gap: var(--dp-spacing-md);
  }

  .sidebar-section-header {
    display: grid;
    gap: var(--dp-spacing-xs);
  }

  .sidebar-section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .sidebar-section-subtitle {
    font-size: 0.82rem;
    color: var(--secondary-text-color);
  }

  .history-target-picker-slot {
    min-width: 0;
    margin-top: 0;
    margin-bottom: calc(var(--spacing, 8px) * 2);
    margin-top: calc(var(--ha-space-3) * -1);
  }

  .history-targets-collapsed-summary {
    display: none;
    grid-auto-rows: max-content;
    gap: var(--dp-spacing-sm);
    justify-items: center;
    padding-top: calc(var(--spacing, 8px) * 7);
  }

  .history-targets-collapsed-empty {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--secondary-text-color, #6b7280) 45%, transparent);
  }

  .history-targets-collapsed-item {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    padding: 0;
    margin: 0;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    background: color-mix(in srgb, var(--primary-text-color, #111) 4%, transparent);
    color: var(--secondary-text-color);
    --mdc-icon-size: 18px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  .history-targets-collapsed-item:hover,
  .history-targets-collapsed-item:focus-visible {
    background: color-mix(in srgb, var(--primary-text-color, #111) 8%, transparent);
    outline: none;
  }

  .history-targets-collapsed-item.is-hidden {
    opacity: 0.55;
  }

  .history-targets-collapsed-item::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 3px var(--row-color, transparent);
    pointer-events: none;
  }

  .history-targets-collapsed-item ha-state-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin: 0;
  }

  /* ── Collapsed-sidebar target popup ──────────────────────────────────── */

  .collapsed-target-popup {
    position: fixed;
    z-index: 9;
    width: 300px;
    overflow-y: auto;
    background: var(--card-background-color, #fff);
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .collapsed-target-popup[hidden] {
    display: none;
  }

  /* Row inside popup: remove card styling (popup is the card) and collapse the drag-handle column */
  .collapsed-target-popup .history-target-row {
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding-bottom: calc(var(--spacing, 8px) * 1.125);
    grid-template-columns: 0 minmax(0, 1fr) auto;
  }


  .collapsed-target-popup .history-target-row:hover {
    border-color: transparent;
    background: transparent;
  }

  /* ── Collapsed-sidebar preferences button ────────────────────────────── */

  .history-targets-collapsed-preferences-container {
    display: grid;
    grid-auto-rows: max-content;
    gap: var(--dp-spacing-sm);
    justify-items: center;
    padding-top: calc(var(--spacing, 8px));
  }

  .history-targets-collapsed-preferences {
    display: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 0;
    padding: 0;
    margin: 0;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--primary-text-color, #111) 4%, transparent);
    color: var(--secondary-text-color);
    --mdc-icon-size: 16px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    transition: background 120ms ease;
  }

  .history-targets-collapsed-preferences:hover,
  .history-targets-collapsed-preferences:focus-visible {
    background: color-mix(in srgb, var(--primary-text-color, #111) 8%, transparent);
    outline: none;
  }

  .page-sidebar.collapsed .history-targets-collapsed-preferences {
    display: inline-flex;
  }

  /* ── Collapsed-sidebar options popup ────────────────────────────────── */

  .collapsed-options-popup {
    position: fixed;
    z-index: 100;
    background: var(--card-background-color, #fff);
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: visible;
  }

  .collapsed-options-popup[hidden] {
    display: none;
  }

  .history-target-empty {
    padding: var(--dp-spacing-md) var(--dp-spacing-sm);
    border-radius: 12px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 4%, transparent);
    color: var(--secondary-text-color);
    font-size: 0.84rem;
  }

  .history-target-table {
    display: grid;
  }

  .history-target-table-body {
    display: grid;
    gap: calc(var(--spacing, 8px) * 1.25);
  }

  .history-target-row {
    display: grid;
    position: relative;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      "handle name actions"
      ". analysis analysis";
    gap: var(--dp-spacing-sm);
    align-items: center;
    margin: 0;
    padding: calc(var(--spacing, 8px) * 1.125) calc(var(--spacing, 8px) * 1.25);
    border-radius: 16px;
    background: var(--card-background-color, #fff);
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    transition: border-color 140ms ease, background-color 140ms ease;
    padding-bottom: 0;
    padding-left: 3px;
  }
  
  .history-target-row.analysis-open {
    padding-bottom: calc(var(--spacing, 8px) * 1.125);
  }

  .history-target-row.is-hidden {
    opacity: 0.62;
  }

  .history-target-row:hover {
    border-color: color-mix(in srgb, var(--primary-color, #03a9f4) 24%, var(--divider-color, rgba(0, 0, 0, 0.12)));
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 2%, var(--card-background-color, #fff));
  }

  .history-target-row.is-dragging {
    opacity: 0.35;
  }

  .history-target-row.is-drag-over-before {
    box-shadow: inset 0 3px 0 -1px var(--primary-color, #03a9f4);
  }

  .history-target-row.is-drag-over-after {
    box-shadow: inset 0 -3px 0 -1px var(--primary-color, #03a9f4);
  }

  .history-target-drag-handle {
    grid-area: handle;
    align-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: grab;
    opacity: 0;
    transition: opacity 140ms ease, background-color 120ms ease;
    touch-action: none;
    margin-right: calc(var(--dp-spacing-xs) * -0.5);
    margin-left: -8px;
    position: absolute;
  }

  .history-target-drag-handle ha-icon {
    --mdc-icon-size: 16px;
    display: block;
    pointer-events: none;
  }

  .history-target-row:hover .history-target-drag-handle {
    opacity: 0.45;
  }

  .history-target-drag-handle:hover,
  .history-target-drag-handle:focus-visible {
    opacity: 1;
    outline: none;
  }

  .history-target-drag-handle:active {
    cursor: grabbing;
  }

  .history-target-name {
    grid-area: name;
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--dp-spacing-sm);
    align-items: center;
  }

  .history-target-name-text {
    min-width: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .history-target-entity-id {
    margin-top: 4px;
    font-size: 0.74rem;
    font-weight: 400;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-target-color-field {
    position: relative;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    overflow: hidden;
  }

  .history-target-controls {
    display: contents;
  }

  .history-target-color-icon {
    position: absolute;
    inset: 0;
    display: inline-grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--row-icon-color, var(--text-primary-color, #fff));
    pointer-events: none;
    z-index: 1;
  }

  .history-target-color-icon ha-state-icon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  .history-target-color {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 10px;
    padding: 0;
    background: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    z-index: 2;
  }

  .history-target-color::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .history-target-color::-webkit-color-swatch {
    border: none;
    border-radius: 10px;
  }

  .history-target-color::-moz-color-swatch {
    border: none;
    border-radius: 10px;
  }

  .history-target-color-field::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--row-color, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, rgba(0, 0, 0, 0.18) 70%, transparent);
  }

  .history-target-color:focus-visible + .history-target-color-icon {
    outline: 2px solid color-mix(in srgb, var(--primary-color, #03a9f4) 55%, transparent);
    outline-offset: 2px;
    border-radius: inherit;
  }

  .history-target-actions,
  .history-target-actions-head {
    grid-area: actions;
    justify-self: end;
    align-self: center;
  }

  .history-target-actions {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
  }

  .history-target-analysis-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    min-width: 24px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease, transform 120ms ease;
  }

  .history-target-analysis-toggle ha-icon {
    --mdc-icon-size: 16px;
    display: block;
    transition: transform 120ms ease;
  }

  .history-target-analysis-toggle.is-open ha-icon {
    transform: rotate(180deg);
  }

  .history-target-analysis-toggle:hover,
  .history-target-analysis-toggle:focus-visible {
    background: color-mix(in srgb, var(--primary-text-color, #111) 8%, transparent);
    color: var(--primary-text-color);
    outline: none;
  }

  .history-target-analysis {
    grid-area: analysis;
    display: grid;
    gap: var(--dp-spacing-sm);
    padding-top: calc(var(--spacing, 8px) * 0.25);
    border-top: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 78%, transparent);
  }

  .history-target-analysis[hidden] {
    display: none;
  }

  .history-target-analysis-grid {
    display: grid;
    gap: var(--dp-spacing-sm);
    padding-top: var(--dp-spacing-sm);
  }

  .history-target-analysis-toggle-group {
    display: flex;
    gap: calc(var(--spacing, 8px) * 0.625);
    align-items: center;
  }

  .history-target-analysis-option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing, 8px) * 0.75);
    color: var(--primary-text-color);
    font-size: 0.84rem;
  }
  
  .history-target-analysis-option.top {
    align-items: flex-start;
  }

  .history-target-analysis-option.is-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .history-target-analysis-option input[type="checkbox"] {
    margin: 0;
    accent-color: var(--primary-color, #03a9f4);
  }
  
  .history-target-analysis-option-help-text {
    display: inline-block;
    color: var(--secondary-text-color);
    opacity: 0.8;
    padding-top: 2px;
  }

  .analysis-computing-spinner {
    display: none;
    width: 10px;
    height: 10px;
    border: 2px solid var(--divider-color, #ccc);
    border-top-color: var(--primary-color, #03a9f4);
    border-radius: 50%;
    animation: analysis-spin 0.7s linear infinite;
    flex-shrink: 0;
    margin-left: 2px;
  }

  .analysis-computing-spinner.active {
    display: inline-block;
  }

  @keyframes analysis-spin {
    to { transform: rotate(360deg); }
  }

  .history-target-analysis-field {
    display: grid;
    gap: 4px;
    justify-items: start;
  }

  .history-target-analysis-field-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--secondary-text-color);
  }

  .history-target-analysis-select,
  .history-target-analysis-input {
    width: auto;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: calc(var(--spacing, 8px) * 0.75) calc(var(--spacing, 8px) * 0.875);
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.84rem;
  }

  .history-target-analysis-row {
    display: grid;
    gap: var(--dp-spacing-sm);
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .history-target-analysis-group {
    display: grid;
    gap: var(--dp-spacing-sm);
    border-radius: 6px;
  }
  
  .history-target-analysis-group.is-open {
      padding-bottom: 0;
  }

  .history-target-analysis-group-body {
    display: grid;
    gap: var(--dp-spacing-sm);
    padding: var(--dp-spacing-sm);
    border-left: 3px solid var(--primary-color);
    margin-left: 5px;
    padding-left: var(--dp-spacing-md);
  }

  .history-target-analysis-method-list {
    display: grid;
    gap: var(--dp-spacing-sm);
  }

  .history-target-analysis-method-item {
    display: grid;
    gap: var(--dp-spacing-sm);
  }

  .analysis-method-help {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 50%;
    border: 1px solid var(--secondary-text-color, #888);
    background: transparent;
    color: var(--secondary-text-color, #888);
    font-size: 9px;
    font-weight: 700;
    line-height: 1;
    cursor: default;
    padding: 0;
    vertical-align: middle;
  }

  .history-target-analysis-method-subopts {
    padding-left: calc(var(--spacing, 8px) * 1.5);
    display: grid;
    gap: var(--dp-spacing-sm);
    border-left: 3px solid var(--primary-color);
    margin-left: 5px;
  }

  .history-target-visible-toggle {
    position: relative;
    display: inline-flex;
    width: 34px;
    height: 20px;
    flex: 0 0 auto;
    cursor: pointer;
  }

  .history-target-visible-toggle input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .history-target-visible-toggle-track {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background: color-mix(in srgb, var(--secondary-text-color, #6b7280) 45%, transparent);
    transition: background-color 120ms ease;
  }

  .history-target-visible-toggle-track::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--card-background-color, #fff);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: transform 120ms ease;
  }

  .history-target-visible-toggle input:checked + .history-target-visible-toggle-track {
    background: var(--primary-color);
  }

  .history-target-visible-toggle input:checked + .history-target-visible-toggle-track::after {
    transform: translateX(14px);
  }

  .history-target-visible-toggle input:focus-visible + .history-target-visible-toggle-track {
    outline: 2px solid color-mix(in srgb, var(--primary-color) 55%, transparent);
    outline-offset: 2px;
  }

  .history-target-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    min-width: 16px;
    line-height: 16px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 7%, transparent);
    color: var(--secondary-text-color);
    cursor: pointer;
    flex: 0 0 auto;
  }

  .history-target-remove ha-icon {
    --mdc-icon-size: 12px;
    display: block;
  }

  .history-target-remove:hover,
  .history-target-remove:focus-visible {
    background: color-mix(in srgb, var(--error-color, #db4437) 14%, transparent);
    color: var(--error-color, #db4437);
    outline: none;
  }

  .page-sidebar.collapsed .control-target {
    display: block;
  }

  .sidebar-options {
    width: 100%;
    box-sizing: border-box;
  }

  .page-sidebar.collapsed .sidebar-options {
    display: none;
  }

  .page-sidebar.collapsed .history-targets-header,
  .page-sidebar.collapsed .history-target-picker-slot,
  .page-sidebar.collapsed .history-target-rows {
    display: none;
  }

  .page-sidebar.collapsed .history-targets-collapsed-summary {
    display: grid;
  }

  .sidebar-options-card {
    display: grid;
    gap: var(--dp-spacing-lg);
  }

  .sidebar-options-section {
    display: grid;
    gap: var(--dp-spacing-sm);
  }

  .sidebar-radio-group {
    display: grid;
    gap: var(--dp-spacing-sm);
  }

  .sidebar-radio-option {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm);
    font-size: 0.9rem;
    color: var(--primary-text-color);
    cursor: pointer;
  }

  .sidebar-toggle-group {
    display: grid;
    gap: var(--dp-spacing-sm);
  }

  .sidebar-select-group {
    display: grid;
    gap: var(--dp-spacing-sm);
    margin-top: var(--dp-spacing-xs);
  }

  .sidebar-select-field {
    display: grid;
    gap: 6px;
  }

  .sidebar-select-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--secondary-text-color);
  }

  .sidebar-helper-text {
    font-size: 0.8rem;
    line-height: 1.35;
    color: var(--secondary-text-color);
  }

  .sidebar-analysis-thresholds {
    display: grid;
    gap: var(--dp-spacing-sm);
    margin-top: var(--dp-spacing-sm);
  }

  .sidebar-threshold-row {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .sidebar-threshold-label {
    min-width: 0;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-threshold-input-wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--dp-spacing-sm);
  }

  .sidebar-threshold-input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 92%, transparent);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    padding: 0 10px;
    min-height: 38px;
  }

  .sidebar-threshold-input:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary-color, #03a9f4) 32%, transparent);
    outline-offset: 1px;
  }

  .sidebar-threshold-unit {
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .sidebar-select {
    width: 100%;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 92%, transparent);
    border-radius: 10px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    box-sizing: border-box;
  }

  .sidebar-toggle-option {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-sm);
    font-size: 0.9rem;
    color: var(--primary-text-color);
    cursor: pointer;
  }

  .sidebar-toggle-option input {
    margin: 0;
    accent-color: var(--primary-color, #03a9f4);
  }

  .sidebar-radio-option input {
    margin: 0;
    accent-color: var(--primary-color, #03a9f4);
  }

  .cw-scan-btn {
    display: block;
    width: 100%;
    padding: var(--dp-spacing-xs) var(--dp-spacing-sm);
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
  }

  .cw-scan-btn:hover {
    opacity: 0.88;
  }

  .cw-list {
    display: grid;
    gap: 4px;
    margin-top: var(--dp-spacing-sm);
  }

  .cw-row {
    display: flex;
    align-items: center;
    gap: var(--dp-spacing-xs);
    font-size: 0.82rem;
    color: var(--primary-text-color);
  }

  .cw-row input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
    accent-color: var(--primary-color, #03a9f4);
  }

  .cw-row-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cw-remove-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0 2px;
    cursor: pointer;
    color: var(--secondary-text-color);
    font-size: 1rem;
    line-height: 1;
    border-radius: 3px;
  }

  .cw-remove-btn:hover {
    color: var(--error-color, #db4437);
  }

  .control-date {
    width: 100%;
    min-width: 0;
  }

  .chart-host,
  .list-host {
    width: 100%;
    min-width: 0;
    min-height: 0;
  }

  .chart-host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }

  .list-host {
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .content-splitter {
    position: relative;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: row-resize;
    touch-action: none;
  }

  .content-splitter::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    transform: translateY(-50%);
  }

  .content-splitter::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 60px;
    height: 6px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 18%, transparent);
  }

  .content-splitter:hover::after,
  .content-splitter:focus-visible::after,
  .content-splitter.dragging::after {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 62%, transparent);
  }

  .content-splitter:focus-visible {
    outline: none;
  }

  .list-host ha-card,
  .chart-host ha-card {
    width: 100%;
  }

  .list-host > *,
  .chart-host > * {
    width: 100%;
  }

  .chart-card-host {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    width: 100%;
    overflow: hidden;
  }

  .chart-card-host > * {
    height: 100%;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
  }

  .list-host > * {
    height: 100%;
  }

  .empty {
    padding: calc(var(--spacing, 8px) * 4) var(--dp-spacing-xl);
    text-align: center;
    color: var(--secondary-text-color);
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
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 92%, transparent);
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font: inherit;
    box-sizing: border-box;
  }

  .date-window-dialog-input:focus {
    outline: 2px solid color-mix(in srgb, var(--primary-color, #03a9f4) 36%, transparent);
    outline-offset: 1px;
    border-color: color-mix(in srgb, var(--primary-color, #03a9f4) 55%, transparent);
  }

  .date-window-dialog-shortcuts[hidden] {
    display: none;
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

  @media (max-width: 720px) {
    .date-window-dialog-dates {
      grid-template-columns: 1fr;
    }
  }

  /* Sidebar toggle in toolbar — hidden on desktop, shown at <=900px */
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

  /* Scrim — hidden by default, enabled at <=900px via media query */
  .sidebar-scrim {
    display: none;
  }

  .range-control {
    position: relative;
    min-height: 58px;
    overflow: visible;
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
    background: color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
  }

  .range-timeline-shell {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
  }

  .range-selection-jump {
    position: absolute;
    top: 50%;
    width: 30px;
    height: 30px;
    transform: translateY(-50%);
    border: 0;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: color-mix(in srgb, var(--primary-text-color, #111) 94%, transparent);
    box-shadow:
      0 8px 18px rgba(0, 0, 0, 0.12),
      inset 0 0 0 1px color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 82%, transparent);
    color: var(--text-primary-color, #fff);
    cursor: pointer;
    z-index: 12;
  }

  .range-selection-jump[hidden] {
    display: none;
  }

  .range-selection-jump.left {
    left: 6px;
  }

  .range-selection-jump.right {
    right: 6px;
  }

  .range-selection-jump:hover,
  .range-selection-jump:focus-visible {
    background: color-mix(in srgb, var(--primary-text-color, #111) 100%, transparent);
    outline: none;
  }

  .range-scroll-viewport {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: stable;
    -webkit-overflow-scrolling: touch;
    cursor: grab;
    touch-action: pan-y;
  }

  .range-scroll-viewport::-webkit-scrollbar {
    height: 8px;
  }

  .range-scroll-viewport::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 18%, transparent);
  }

  .range-scroll-viewport.dragging {
    cursor: grabbing;
  }

  .range-timeline {
    position: relative;
    height: 58px;
    min-width: 100%;
    touch-action: pan-y;
  }

  .range-context-layer,
  .range-label-layer,
  .range-tick-layer,
  .range-event-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .range-divider {
    position: absolute;
    top: 8px;
    bottom: 22px;
    width: 2px;
    transform: translateX(-50%);
    background: color-mix(in srgb, var(--primary-text-color, #111) 42%, transparent);
  }

  .range-context-label {
    font-weight: bold !important;
    position: absolute;
    top: 0;
    transform: translateX(8px);
    font-size: 0.92rem;
    line-height: 1;
    color: var(--primary-text-color);
    white-space: nowrap;
  }

  .range-scale-label {
    position: absolute;
    bottom: 0;
    opacity: 0.7;
    transform: translateX(-50%);
    font-size: 0.76rem;
    line-height: 1;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .range-period-button {
    padding: calc(var(--spacing, 8px) * 0.25) var(--dp-spacing-sm);
    border: 0;
    border-radius: 999px;
    background: none;
    font: inherit;
    color: inherit;
    pointer-events: auto;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    user-select: none;
    -webkit-user-select: none;
    transition:
      background-color 120ms ease,
      box-shadow 120ms ease,
      color 120ms ease;
  }

  .range-period-button:hover {
    color: var(--primary-text-color);
    background: color-mix(in srgb, var(--primary-text-color, #111) 7%, var(--card-background-color, #fff));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
  }

  .range-period-button:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent);
    outline-offset: 2px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 7%, var(--card-background-color, #fff));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
  }

  .range-track {
    position: absolute;
    left: 0;
    right: 0;
    top: 26px;
    transform: translateY(-50%);
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .range-selection {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 82%, transparent);
    cursor: grab;
  }

  .range-selection.dragging {
    cursor: grabbing;
  }

  .range-hover-preview {
    position: absolute;
    top: 14px;
    height: 14px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 26%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-hover-preview.visible {
    opacity: 1;
  }

  .range-comparison-preview {
    position: absolute;
    top: -4px;
    height: 12px;
    z-index: 2;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color, #03a9f4) 58%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-comparison-preview.visible {
    opacity: 1;
  }

  .range-zoom-highlight {
    position: absolute;
    top: -6px;
    height: 16px;
    z-index: 2;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
    box-shadow:
      inset 0 0 0 2px var(--primary-color, #03a9f4),
      0 0 0 1px color-mix(in srgb, var(--card-background-color, #fff) 72%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-zoom-highlight.visible {
    opacity: 1;
  }

  .range-zoom-window-highlight {
    position: absolute;
    top: -4px;
    height: 12px;
    z-index: 4;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 52%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color, #03a9f4) 85%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .range-zoom-window-highlight.visible {
    opacity: 1;
  }

  .range-tick {
    position: absolute;
    top: 14px;
    height: 14px;
    width: 1px;
    transform: translateX(-50%);
    background: color-mix(in srgb, var(--primary-text-color, #111) 16%, transparent);
  }

  .range-tick.major {
    top: 20px;
    height: 18px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 24%, transparent);
  }

  .range-tick.fine {
    top: 18px;
    height: 8px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 14%, transparent);
  }

  .range-tick.context {
    top: 2px;
    height: 34px;
    background: color-mix(in srgb, var(--primary-text-color, #111) 38%, transparent);
  }

  .range-event-dot {
    position: absolute;
    top: 35px;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid var(--card-background-color, #fff);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    pointer-events: none;
  }

  .range-chart-hover-line {
    position: absolute;
    top: 2px;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: var(--primary-color, #03a9f4);
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
    z-index: 2;
  }

  .range-chart-hover-line.visible {
    opacity: 1;
  }

  .range-chart-hover-window-line {
    position: absolute;
    top: 2px;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: var(--primary-color, #03a9f4);
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
    z-index: 2;
  }

  .range-chart-hover-window-line.visible {
    opacity: 0.45;
  }

  .range-handle {
    position: absolute;
    top: 26px;
    left: 0;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
    background: color-mix(in srgb, var(--primary-text-color, #111) 84%, transparent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    padding: 0;
    cursor: ew-resize;
    touch-action: none;
  }

  .range-handle:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent);
    outline-offset: 2px;
  }

  @keyframes dp-live-breathe {
    0%, 100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18), 0 0 0 0 rgba(239, 83, 80, 0); }
    50%       { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18), 0 0 0 5px rgba(239, 83, 80, 0.2); }
  }

  .range-handle.is-live {
    background: #ef5350;
    animation: dp-live-breathe 3s ease-in-out infinite;
  }

  .range-tooltip {
    position: absolute;
    top: 43px;
    left: 0;
    transform: translate(-50%, 0);
    padding: calc(var(--dp-spacing-sm) + 2px) calc(var(--dp-spacing-md) + 2px);
    border-radius: 10px;
    background: color-mix(in srgb, #0f1218 96%, transparent);
    color: rgba(255, 255, 255, 0.96);
    border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
    font-size: 0.86rem;
    line-height: 1.1;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    opacity: 0;
    visibility: hidden;
    transition: opacity 120ms ease, visibility 120ms ease;
    z-index: 8;
  }

  .range-tooltip-live-hint {
    display: block;
    font-size: 0.78rem;
    opacity: 0.72;
    margin-top: 4px;
  }

  .range-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    width: 10px;
    height: 10px;
    background: inherit;
    transform: translate(-50%, -50%) rotate(45deg);
    border-radius: 2px;
  }

  .range-tooltip.visible {
    opacity: 1;
    visibility: visible;
  }

  .range-tooltip.start {
    z-index: 8;
  }

  .range-tooltip.end {
    z-index: 9;
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

  .range-picker-menu,
  .range-options-menu {
    position: fixed;
    top: var(--floating-menu-top, 64px);
    left: var(--floating-menu-left, 0px);
    z-index: 9999;
    border-radius: 14px;
    background: var(--card-background-color, #fff);
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.18),
      0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
  }

  .range-picker-menu {
    width: min(340px, calc(100vw - 32px));
    min-height: 56px;
    padding: var(--dp-spacing-md);
  }

  .range-picker-menu[hidden],
  .range-options-menu[hidden] {
    display: none;
  }

  .range-picker {
    display: block;
    min-width: 0;
    width: 100%;
  }

  .range-options-menu {
    width: 280px;
    max-height: min(70vh, 520px);
    overflow: auto;
    padding: var(--dp-spacing-sm);
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

    .range-picker-button,
    .range-options-button {
      min-width: 32px;
      --mdc-icon-size: 20px;
    }
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
    background: color-mix(in srgb, var(--primary-text-color, #111) 6%, transparent);
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
    background: color-mix(in srgb, var(--primary-text-color, #111) 6%, transparent);
    outline: none;
  }

  .range-option::before {
    content: "";
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-sizing: border-box;
    border: 2px solid color-mix(in srgb, var(--primary-text-color, #111) 42%, transparent);
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

  .range-caption {
    display: none;
  }

  @media (max-width: 900px) {
    .controls-section {
      padding: var(--dp-spacing-md);
    }

    .controls-grid,
    .content {
      gap: var(--dp-spacing-md);
    }

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

    .range-picker-menu,
    .range-options-menu {
      right: 0;
      max-width: calc(100vw - 32px);
    }

    /* Collapsed: sidebar takes its 52px column; open: content fills full width */
    .page-content {
      grid-template-columns: minmax(0, 1fr);
      position: relative;
    }

    .page-content.sidebar-collapsed {
      grid-template-columns: 52px minmax(0, 1fr);
    }

    /* Open: sidebar overlays the chart as an absolute panel */
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

    /* Collapsed: sidebar is a normal in-flow 52px column — chart fully visible */
    .page-sidebar.collapsed {
      position: relative;
      width: auto;
      box-shadow: none;
      border-right: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
      transform: none;
      transition: none;
      z-index: 0;
    }

    /* Sidebar toggle visible at tablet (same as desktop) */
    .sidebar-toggle-button {
      display: inline-flex;
    }

    /* Hide toolbar toggle — chevron inside sidebar is used instead */
    .range-sidebar-toggle {
      display: none;
    }

    /* Scrim overlay behind open sidebar */
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
    /* Mobile: sidebar fully hidden when collapsed (no 52px strip) */
    .page-content.sidebar-collapsed {
      grid-template-columns: minmax(0, 1fr);
    }

    .page-sidebar.collapsed {
      position: absolute;
      transform: translateX(-100%);
      visibility: hidden;
      transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
                  visibility 0s linear 400ms;
    }

    .sidebar-toggle-button {
      display: none;
    }

    .range-sidebar-toggle {
      display: inline-flex;
    }

    /* Hide timeline slider, show date inputs instead */
    panel-timeline {
      display: none;
    }

    .range-mobile-dates {
      display: flex;
    }
  }

  @media (max-width: 545px) {
    .page-sidebar {
      width: min(380px, 95vw);
    }
  }
`;

export const PANEL_HISTORY_LOADING_STYLE = `
  :host {
    display: block;
    height: 100%;
    color: var(--primary-text-color);
    background: var(--primary-background-color);
  }

  .history-panel-loading {
    display: grid;
    place-items: center;
    min-height: 100%;
    padding: 32px;
    box-sizing: border-box;
  }

  .history-panel-loading-card {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 18px 22px;
    border-radius: 18px;
    background: var(--card-background-color, var(--primary-background-color));
    border: 1px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 88%, transparent);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .history-panel-loading-spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 80%, transparent);
    border-top-color: var(--primary-color, #03a9f4);
    animation: history-panel-spin 0.85s linear infinite;
    flex: 0 0 auto;
  }

  .history-panel-loading-text {
    font-size: 0.98rem;
    color: var(--secondary-text-color, var(--primary-text-color));
    white-space: nowrap;
  }

  @keyframes history-panel-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
