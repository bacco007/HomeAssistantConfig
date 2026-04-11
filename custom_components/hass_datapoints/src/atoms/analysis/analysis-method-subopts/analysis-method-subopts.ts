import { LitElement, html } from "lit";
import { styles } from "./analysis-method-subopts.styles";

export class AnalysisMethodSubopts extends LitElement {
  static styles = styles;

  render() {
    return html`<div class="subopts"><slot></slot></div>`;
  }
}

customElements.define("analysis-method-subopts", AnalysisMethodSubopts);
