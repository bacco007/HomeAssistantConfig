import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./range-track.styles";

/**
 * `range-track` renders the track bar with a positioned selection highlight.
 *
 * Pure display component — receives percentage positions as props.
 * The parent positions handles and owns drag logic.
 */
export class RangeTrack extends LitElement {
  @property({ type: Number }) accessor selectionLeftPct: number = 0;

  @property({ type: Number }) accessor selectionWidthPct: number = 0;

  @property({ type: Boolean }) accessor selectionDragging: boolean = false;

  static styles = styles;

  render() {
    return html`
      <slot name="track-overlays"></slot>
      <div
        class="range-selection ${this.selectionDragging ? "dragging" : ""}"
        style="left:${this.selectionLeftPct}%;width:${this.selectionWidthPct}%"
      ></div>
    `;
  }
}
customElements.define("range-track", RangeTrack);
