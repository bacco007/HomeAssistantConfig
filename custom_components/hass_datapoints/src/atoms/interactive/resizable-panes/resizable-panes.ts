import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./resizable-panes.styles";

/**
 * `resizable-panes` is a two-pane layout atom with a draggable splitter.
 *
 * The ratio (0..1) controls how much space the first pane takes. It can be
 * clamped with `min` / `max` (also 0..1), or via pixel-based CSS custom
 * properties `--dp-panes-min-first` / `--dp-panes-min-second` on the host.
 *
 * @fires dp-panes-resize - `{ ratio: number }` fired on each pointer-move frame
 *                          and once more on pointer-up so the parent can persist.
 *
 * @slot first  - Content for the first (top or left) pane
 * @slot second - Content for the second (bottom or right) pane
 */
export class ResizablePanes extends LitElement {
  static styles = styles;

  /** Layout direction: "vertical" (default) or "horizontal". */
  @property({ type: String, reflect: true }) accessor direction:
    | "vertical"
    | "horizontal" = "vertical";

  /** Fraction (0..1) of total space given to the first pane. */
  @property({ type: Number }) accessor ratio: number = 0.5;

  /** Minimum allowed ratio (0..1). */
  @property({ type: Number }) accessor min: number = 0.25;

  /** Maximum allowed ratio (0..1). */
  @property({ type: Number }) accessor max: number = 0.75;

  /** When true the splitter and second pane are hidden; the first pane fills all space. */
  @property({ type: Boolean, attribute: "second-hidden", reflect: true })
  accessor secondHidden: boolean = false;

  // ── Internal drag state ────────────────────────────────────────────────────

  private _pointerId: Nullable<number> = null;

  private _splitterEl: Nullable<HTMLButtonElement> = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  firstUpdated() {
    this._splitterEl = this.shadowRoot?.querySelector(".pane-splitter") ?? null;
    this._applyRatio();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up global pointer listeners if disconnected during an active drag.
    if (this._pointerId != null) {
      window.removeEventListener("pointermove", this._onPointerMove);
      window.removeEventListener("pointerup", this._onPointerUp);
      window.removeEventListener("pointercancel", this._onPointerUp);
      this._splitterEl?.classList.remove("dragging");
      this._pointerId = null;
    }
  }

  updated(changed: Map<string, unknown>) {
    if (
      changed.has("ratio") ||
      changed.has("direction") ||
      changed.has("secondHidden")
    ) {
      this._applyRatio();
    }
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  private _applyRatio() {
    this.style.setProperty(
      "--dp-panes-top-size",
      `${Math.round(this.ratio * 1000) / 10}%`
    );
  }

  // ── Pointer handling ───────────────────────────────────────────────────────

  private _onPointerDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    ev.preventDefault();
    this._pointerId = ev.pointerId;
    this._splitterEl?.classList.add("dragging");
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
    window.addEventListener("pointercancel", this._onPointerUp);
  };

  private _onPointerMove = (ev: PointerEvent) => {
    if (this._pointerId == null || ev.pointerId !== this._pointerId) return;
    ev.preventDefault();

    const rect = this.getBoundingClientRect();
    const totalSize =
      this.direction === "horizontal" ? rect.width : rect.height;
    if (!totalSize) return;

    const pointerOffset =
      this.direction === "horizontal"
        ? ev.clientX - rect.left
        : ev.clientY - rect.top;

    const clamped = Math.min(
      Math.max(this.min, pointerOffset / totalSize),
      this.max
    );
    this.ratio = clamped;
    this._applyRatio();

    this.dispatchEvent(
      new CustomEvent("dp-panes-resize", {
        detail: { ratio: clamped },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _onPointerUp = (ev: PointerEvent) => {
    if (this._pointerId == null || ev.pointerId !== this._pointerId) return;
    this._pointerId = null;
    this._splitterEl?.classList.remove("dragging");
    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
    window.removeEventListener("pointercancel", this._onPointerUp);

    // Fire a final event so the parent can persist the committed ratio.
    this.dispatchEvent(
      new CustomEvent("dp-panes-resize", {
        detail: { ratio: this.ratio, committed: true },
        bubbles: true,
        composed: true,
      })
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    return html`
      <div class="pane-first"><slot name="first"></slot></div>
      ${!this.secondHidden
        ? html`
            <button
              class="pane-splitter"
              type="button"
              aria-label="Resize panes"
              @pointerdown=${this._onPointerDown}
            ></button>
            <div class="pane-second"><slot name="second"></slot></div>
          `
        : null}
    `;
  }
}

customElements.define("resizable-panes", ResizablePanes);

declare global {
  interface HTMLElementTagNameMap {
    "resizable-panes": ResizablePanes;
  }
}
