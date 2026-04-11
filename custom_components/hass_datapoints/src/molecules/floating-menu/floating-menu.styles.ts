import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  .floating-menu {
    position: fixed;
    top: var(--floating-menu-top, 64px);
    left: var(--floating-menu-left, 0px);
    z-index: 9999;
    min-width: var(--floating-menu-min-width, 220px);
    width: var(--floating-menu-width, auto);
    max-height: var(--floating-menu-max-height, none);
    overflow: var(--floating-menu-overflow, visible);
    padding: var(--floating-menu-padding, var(--dp-spacing-xs, 4px));
    border-radius: 14px;
    background: var(--card-background-color, #fff);
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.18),
      0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid
      color-mix(
        in srgb,
        var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
        transparent
      );
  }

  .floating-menu[hidden] {
    display: none;
  }
`;
