import { css } from "lit";

export const styles = css`
  :host {
    display: grid;
    overflow: hidden;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  /* ── Vertical (top / bottom) layout ─────────────────────────────────────── */

  :host([direction="vertical"]),
  :host(:not([direction])) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows:
      minmax(var(--dp-panes-min-first, 0px), var(--dp-panes-top-size, 50%))
      var(--dp-panes-splitter-size, 24px)
      minmax(var(--dp-panes-min-second, 0px), 1fr);
  }

  /* When second pane is hidden, first pane fills all space */
  :host([second-hidden]) {
    grid-template-rows: minmax(0, 1fr) !important;
    grid-template-columns: minmax(0, 1fr) !important;
  }

  /* ── Horizontal (left / right) layout ───────────────────────────────────── */

  :host([direction="horizontal"]) {
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns:
      minmax(var(--dp-panes-min-first, 0px), var(--dp-panes-top-size, 50%))
      var(--dp-panes-splitter-size, 24px)
      minmax(var(--dp-panes-min-second, 0px), 1fr);
  }

  /* ── Slots ───────────────────────────────────────────────────────────────── */

  .pane-first {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .pane-second {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  /* Slotted content must fill the pane — the pane's grid height is definite
     so height:100% resolves correctly for slotted elements. */
  ::slotted(*) {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  /* ── Splitter handle ─────────────────────────────────────────────────────── */

  .pane-splitter {
    position: relative;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([direction="vertical"]) .pane-splitter,
  :host(:not([direction])) .pane-splitter {
    cursor: row-resize;
    width: 100%;
  }

  :host([direction="horizontal"]) .pane-splitter {
    cursor: col-resize;
    height: 100%;
  }

  /* Drag indicator pill */
  .pane-splitter::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 18%,
      transparent
    );
    transition: background 120ms ease;
  }

  :host([direction="vertical"]) .pane-splitter::after,
  :host(:not([direction])) .pane-splitter::after {
    width: 60px;
    height: 6px;
  }

  :host([direction="horizontal"]) .pane-splitter::after {
    width: 6px;
    height: 60px;
  }

  .pane-splitter:hover::after,
  .pane-splitter:focus-visible::after,
  .pane-splitter.dragging::after {
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 62%,
      transparent
    );
  }

  .pane-splitter:focus-visible {
    outline: none;
  }
`;
