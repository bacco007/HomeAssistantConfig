import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    left: 0;
    right: 0;
    top: 26px;
    transform: translateY(-50%);
    height: 4px;
    border-radius: 999px;
    background: transparent;
    display: block;
  }

  .range-selection {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 82%,
      transparent
    );
    cursor: grab;
  }

  .range-selection.dragging {
    cursor: grabbing;
  }
`;
