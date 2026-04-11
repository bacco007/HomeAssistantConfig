import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { repeat } from "lit/directives/repeat.js";
import { styles } from "./annotation-chip-row.styles";
import type { HassLike, HassState } from "@/lib/types";
import "@/atoms/interactive/annotation-chip/annotation-chip";

export interface ChipItem {
  /** Target type: "entity_id" | "device_id" | "area_id" | "label_id" */
  type: string;
  /** ID of the linked target item. */
  itemId: string;
  /** Icon path shown inside the chip. */
  icon: string;
  /** Display name shown as the chip label. */
  name: string;
  /** Optional secondary label such as the raw entity id. */
  secondaryText?: string;
  /** Entity state object used to render the same icon as linked entity rows. */
  stateObj?: Nullable<HassState>;
}

/**
 * `annotation-chip-row` renders a labelled group of removable annotation
 * target chips. When the list is empty it shows an empty-state help text instead.
 *
 * @fires dp-target-remove - `{ type: string, id: string }` fired when a chip's
 *   remove button is clicked.
 */
export class AnnotationChipRow extends LitElement {
  static styles = styles;

  /** Array of pre-resolved chip items to display. */
  @property({ type: Array }) accessor chips: ChipItem[] = [];

  /** HA hass object forwarded to annotation-chip when rendering entity icons. */
  @property({ type: Object, attribute: false })
  accessor hass: Nullable<HassLike> = null;

  /** Section label shown above the chips. */
  @property({ type: String }) accessor label: string = "Linked targets";

  /** Help text shown below the label when chips are present. */
  @property({ type: String, attribute: "help-text" })
  accessor helpText: string =
    "These targets will be associated with the new data point by default. Remove any that should not be linked.";

  /** Help text shown below the label when there are no chips. */
  @property({ type: String, attribute: "empty-text" })
  accessor emptyText: string =
    "No linked targets will be associated with this data point.";

  private _onChipRemove(ev: Event) {
    const detail = (ev as CustomEvent).detail as {
      type: string;
      itemId: string;
    };
    // Stop the raw dp-chip-remove so consumers only see dp-target-remove.
    ev.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("dp-target-remove", {
        detail: { type: detail.type, id: detail.itemId },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="context-form-field">
        <div class="context-form-help">
          ${this.chips.length > 0 ? this.helpText : this.emptyText}
        </div>
        ${this.chips.length > 0
          ? html`
              <div
                class="context-chip-row"
                @dp-chip-remove=${this._onChipRemove}
              >
                ${repeat(
                  this.chips,
                  (chip) => `${chip.type}:${chip.itemId}`,
                  (chip) => html`
                    <annotation-chip
                      .type=${chip.type}
                      .itemId=${chip.itemId}
                      .icon=${chip.icon}
                      .name=${chip.name}
                      .secondaryText=${chip.secondaryText ?? ""}
                      .stateObj=${chip.stateObj ?? null}
                      .hass=${this.hass}
                    ></annotation-chip>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define("annotation-chip-row", AnnotationChipRow);

declare global {
  interface HTMLElementTagNameMap {
    "annotation-chip-row": AnnotationChipRow;
  }
}
