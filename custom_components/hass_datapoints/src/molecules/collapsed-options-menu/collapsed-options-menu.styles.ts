import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .nested-menu {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .menu-level1 {
    min-width: 172px;
    padding: 6px;
    flex: 0 0 auto;
  }

  .menu-level2 {
    min-width: 260px;
    max-width: 300px;
    padding: 8px 4px;
    border-left: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
    flex: 0 0 auto;
  }

  .menu-level2 > * {
    padding: var(--dp-spacing-sm);
    display: block;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 36px;
    padding: 0 8px 0 10px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    gap: 4px;
    box-sizing: border-box;
    transition: background 100ms ease;
  }

  .menu-item:hover,
  .menu-item:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 6%,
      transparent
    );
    outline: none;
  }

  .menu-item.is-active {
    background: color-mix(
      in srgb,
      var(--primary-color, #6200ee) 10%,
      transparent
    );
    color: var(--primary-color, #6200ee);
  }

  .menu-item-label {
    flex: 1 1 auto;
  }

  .menu-item-chevron {
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    flex: 0 0 auto;
    opacity: 0.5;
  }

  .menu-item.is-active .menu-item-chevron {
    color: var(--primary-color, #6200ee);
    opacity: 0.7;
  }
`;
