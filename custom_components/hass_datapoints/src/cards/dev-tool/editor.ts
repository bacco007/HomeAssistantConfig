import { CSSResultGroup, html } from "lit";
import { msg } from "@/lib/i18n/localize";
import { EditorBase } from "@/molecules/editor-base/editor-base";

export class HassRecordsDevToolCardEditor extends EditorBase {
  static styles: CSSResultGroup = [EditorBase.styles];

  render() {
    return html`
      <div class="ed">
        <p>
          ${msg(
            "This card does not currently have configurable editor options.",
            {
              id: "This card does not currently have configurable editor options.",
            }
          )}
        </p>
      </div>
    `;
  }
}
