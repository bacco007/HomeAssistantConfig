import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./range-tooltip.styles";

/**
 * `range-tooltip` is a pure display component for showing a formatted
 * date/time tooltip anchored to a handle on the range-timeline.
 *
 * Visibility is controlled by the `visible` attribute (reflected property).
 * Position is set via the `position` property (pixels from left of viewport).
 */
export class RangeTooltip extends LitElement {
  @property({ type: String }) accessor content: string = "";

  @property({ type: Boolean, reflect: true }) accessor visible: boolean = false;

  @property({ type: Number }) accessor position: number = 0;

  @property({ type: Boolean }) accessor isLive: boolean = false;

  @property({ type: String }) accessor liveHint: string = "";

  @property({ type: String, reflect: true }) accessor side: "start" | "end" =
    "start";

  static styles = styles;

  updated(changed: Map<string, unknown>) {
    if (changed.has("position")) {
      this.style.left = `${this.position}px`;
    }
    this.setAttribute("aria-hidden", this.visible ? "false" : "true");
  }

  render() {
    return html`${this.content}${this.isLive
      ? html`<span class="live-hint">${this.liveHint}</span>`
      : nothing}`;
  }
}
customElements.define("range-tooltip", RangeTooltip);
