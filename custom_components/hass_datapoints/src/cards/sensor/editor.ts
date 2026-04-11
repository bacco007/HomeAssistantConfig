import { CSSResultGroup, html } from "lit";
import { msg } from "@/lib/i18n/localize";
import { COLORS } from "@/constants";
import { EditorBase } from "@/molecules/editor-base/editor-base";
import { styles } from "./editor.styles";
import "@/atoms/display/section-heading/section-heading";
import "@/atoms/display/color-swatch/color-swatch";
import "@/atoms/form/editor-text-field/editor-text-field";
import "@/atoms/form/editor-switch/editor-switch";
import "@/atoms/form/editor-entity-picker/editor-entity-picker";
import "@/atoms/form/editor-select/editor-select";

export class HassRecordsSensorCardEditor extends EditorBase {
  static styles: CSSResultGroup = [EditorBase.styles, styles];

  render() {
    const c = this._config;
    const showRecords = !!c.show_records;

    return html`
      <div class="ed">
        <section-heading .text=${msg("Entity")}></section-heading>
        <editor-entity-picker
          .label=${msg("Sensor entity *")}
          .value=${c.entity || ""}
          .hass=${this.hass}
          @dp-entity-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("entity", e.detail.value)}
        ></editor-entity-picker>

        <section-heading .text=${msg("Display")}></section-heading>
        <editor-text-field
          .label=${msg("Override display name (optional)")}
          .value=${c.name || ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("name", e.detail.value)}
        ></editor-text-field>
        <editor-text-field
          .label=${msg("Hours to show")}
          type="number"
          .value=${String(c.hours_to_show ?? 24)}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("hours_to_show", e.detail.value)}
        ></editor-text-field>
        <color-swatch
          .label=${msg("Graph colour")}
          .color=${c.graph_color || COLORS[0]}
          @dp-color-change=${(e: CustomEvent<{ color: string }>) =>
            this._set("graph_color", e.detail.color)}
        ></color-swatch>
        <editor-select
          .label=${msg("Annotation style")}
          .value=${c.annotation_style || ""}
          .options=${[
            { value: "circle", label: msg("Circle on line") },
            { value: "line", label: msg("Dotted vertical line") },
          ]}
          @dp-select-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("annotation_style", e.detail.value)}
        ></editor-select>
        <editor-switch
          .label=${msg("Show annotation tooltips")}
          .checked=${c.show_annotation_tooltips === true}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set(
              "show_annotation_tooltips",
              e.detail.checked ? true : undefined
            )}
        ></editor-switch>

        <section-heading .text=${msg("Records list")}></section-heading>
        <editor-switch
          .label=${msg("Show records list below graph")}
          .checked=${showRecords}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_records", e.detail.checked || undefined)}
        ></editor-switch>
        <editor-text-field
          .label=${msg("Records per page (blank = show all)")}
          type="number"
          .value=${c.records_page_size != null
            ? String(c.records_page_size)
            : ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("records_page_size", e.detail.value)}
        ></editor-text-field>
        <editor-text-field
          .label=${msg("Max records to show (blank = all)")}
          type="number"
          .value=${c.records_limit != null ? String(c.records_limit) : ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("records_limit", e.detail.value)}
        ></editor-text-field>
        <editor-switch
          .label=${msg("Show full message")}
          .checked=${c.records_show_full_message !== false}
          .tooltip=${msg("User will be able to expand the row if hidden", {
            id: "User will be able to expand the row if hidden",
          })}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set(
              "records_show_full_message",
              e.detail.checked ? undefined : false
            )}
        ></editor-switch>
      </div>
    `;
  }
}
