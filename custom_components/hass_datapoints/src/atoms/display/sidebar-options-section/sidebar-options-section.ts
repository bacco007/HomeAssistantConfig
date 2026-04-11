import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./sidebar-options-section.styles";
import "@/atoms/display/sidebar-section-header/sidebar-section-header";

export class SidebarOptionsSection extends LitElement {
  @property({ type: String }) accessor title: string = "";

  @property({ type: String }) accessor subtitle: string = "";

  @property({ type: Boolean }) accessor collapsible: boolean = false;

  @property({ type: Boolean }) accessor open: boolean = true;

  static styles = styles;

  private _onToggle(e: Event) {
    e.stopPropagation();
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent("dp-section-toggle", {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="section">
        <sidebar-section-header
          .title=${this.title}
          .subtitle=${this.subtitle}
          .collapsible=${this.collapsible}
          .open=${this.open}
          @dp-section-toggle=${this._onToggle}
        ></sidebar-section-header>
        ${this.collapsible && !this.open ? nothing : html`<slot></slot>`}
      </div>
    `;
  }
}

customElements.define("sidebar-options-section", SidebarOptionsSection);
