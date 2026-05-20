import { css } from "lit";

export const styles = css`
  :host {
    display: block;
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
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 94%,
      transparent
    );
    box-shadow:
      0 8px 18px rgba(0, 0, 0, 0.12),
      inset 0 0 0 1px
        color-mix(
          in srgb,
          var(--divider-color, rgba(0, 0, 0, 0.12)) 82%,
          transparent
        );
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
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 100%,
      transparent
    );
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

  .range-scroll-viewport {
    scrollbar-color: transparent transparent;
    transition: scrollbar-color 200ms ease;
  }

  .range-scroll-viewport.scrollbar-visible {
    scrollbar-color: color-mix(
        in srgb,
        var(--primary-text-color, #111) 18%,
        transparent
      )
      transparent;
  }

  .range-scroll-viewport::-webkit-scrollbar {
    height: 8px;
  }

  .range-scroll-viewport::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: transparent;
    transition: background 200ms ease;
  }

  .range-scroll-viewport.scrollbar-visible::-webkit-scrollbar-thumb {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 18%,
      transparent
    );
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
`;
