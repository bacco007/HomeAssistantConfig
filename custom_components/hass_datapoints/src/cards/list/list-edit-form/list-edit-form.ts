import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./list-edit-form.styles";
import type {
  EditSaveDetail,
  EventItemLanguage,
  EventRecordFull,
} from "@/cards/list/types";
import type { HassLike } from "@/lib/types";

const DEFAULT_LANGUAGE: EventItemLanguage = {
  showAnnotation: "Show annotation",
  openHistory: "Open related data point history",
  editRecord: "Edit record",
  deleteRecord: "Delete record",
  showChartMarker: "Show chart marker",
  hideChartMarker: "Hide chart marker",
  chooseColor: "Choose colour",
  save: "Save",
  cancel: "Cancel",
  message: "Message",
  annotationFullMessage: "Annotation / full message",
};

export class CardListEditForm extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  accessor eventRecord: Nullable<EventRecordFull> = null;

  @property({ attribute: false }) accessor hass: Nullable<HassLike> = null;

  @property({ type: String }) accessor color = "#03a9f4";

  @property({ attribute: false }) accessor language: EventItemLanguage =
    DEFAULT_LANGUAGE;

  @state() accessor _message = "";

  @state() accessor _annotation = "";

  @state() accessor _icon = "mdi:bookmark";

  willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has("eventRecord") && this.eventRecord) {
      this._message = this.eventRecord.message;
      this._annotation =
        this.eventRecord.annotation &&
        this.eventRecord.annotation !== this.eventRecord.message
          ? this.eventRecord.annotation
          : "";
      this._icon = this.eventRecord.icon || "mdi:bookmark";
      this.color = this.eventRecord.color || "#03a9f4";
    }
  }

  private _save(): void {
    const detail: EditSaveDetail = {
      message: this._message.trim(),
      annotation: this._annotation.trim(),
      icon: this._icon,
      color: this.color,
    };
    this.dispatchEvent(
      new CustomEvent("dp-save-edit", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _cancel(): void {
    this.dispatchEvent(
      new CustomEvent("dp-cancel-edit", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="edit-form">
        <ha-textfield
          class="edit-msg full-width-field"
          label=${this.language.message}
          .value=${this._message}
          @input=${(event: Event) => {
            this._message = (event.currentTarget as HTMLInputElement).value;
          }}
        ></ha-textfield>
        <textarea
          class="edit-ann annotation-edit"
          placeholder=${this.language.annotationFullMessage}
          .value=${this._annotation}
          @input=${(event: Event) => {
            this._annotation = (
              event.currentTarget as HTMLTextAreaElement
            ).value;
          }}
        ></textarea>
        <div class="edit-row">
          <ha-icon-picker
            class="edit-icon-picker"
            .value=${this._icon}
            .hass=${this.hass}
            style="flex:1"
            @value-changed=${(event: CustomEvent<{ value: string }>) => {
              this._icon = event.detail.value || "mdi:bookmark";
            }}
          ></ha-icon-picker>
          <button
            class="color-swatch-btn"
            type="button"
            title=${this.language.chooseColor}
            style=${`background:${this.color}`}
          >
            <span
              class="color-swatch-inner"
              style=${`background:${this.color}`}
            ></span>
            <input
              type="color"
              .value=${this.color}
              @input=${(event: Event) => {
                this.color = (event.currentTarget as HTMLInputElement).value;
              }}
            />
          </button>
        </div>
        <div class="edit-row">
          <ha-button raised @click=${this._save}
            >${this.language.save}</ha-button
          >
          <ha-button @click=${this._cancel}>${this.language.cancel}</ha-button>
        </div>
      </div>
    `;
  }
}

customElements.define("list-edit-form", CardListEditForm);
