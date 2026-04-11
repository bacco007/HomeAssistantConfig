import { CSSResultGroup, html, PropertyValues } from "lit";
import { msg } from "@/lib/i18n/localize";
import { styles } from "./editor.styles";
import { EditorBase } from "@/molecules/editor-base/editor-base";
import type { HassLike } from "@/lib/types";
import { normalizeTargetValue } from "@/lib/domain/target-selection";
import "@/atoms/display/section-heading/section-heading";
import "@/atoms/display/color-swatch/color-swatch";
import "@/atoms/form/editor-text-field/editor-text-field";
import "@/atoms/form/editor-switch/editor-switch";
import "@/atoms/form/editor-icon-picker/editor-icon-picker";

type TargetPickerValue = Record<string, string[]>;
type TargetPickerElement = Element & {
  hass?: Nullable<HassLike>;
  value?: TargetPickerValue;
};

export class HassRecordsActionCardEditor extends EditorBase {
  static styles: CSSResultGroup = [EditorBase.styles, styles];

  private _configTarget(): TargetPickerValue {
    return (
      (normalizeTargetValue(
        this._config.target ?? {
          entity_id:
            Array.isArray(this._config.entities) && this._config.entities.length
              ? this._config.entities
              : this._config.entity,
        }
      ) as TargetPickerValue) ?? {}
    );
  }

  private _syncTargetPicker(): void {
    const tp = this.shadowRoot?.querySelector(
      "#target-picker"
    ) as Nullable<TargetPickerElement>;
    if (!tp) {
      return;
    }
    if (this.hass) {
      tp.hass = this.hass;
    }
    tp.value = this._configTarget();
  }

  private _setTargetConfig(target: TargetPickerValue | undefined): void {
    const cfg = { ...this._config };
    delete cfg.entity;
    delete cfg.entities;
    if (!target || Object.values(target).every((value) => !value?.length)) {
      delete cfg.target;
    } else {
      cfg.target = target;
    }
    this._config = cfg;
    this._fire(cfg);
  }

  _onTargetChanged(e: CustomEvent<{ value?: TargetPickerValue }>): void {
    const val = e.detail.value;
    const isEmpty = !val || Object.values(val).every((value) => !value?.length);
    this._setTargetConfig(isEmpty ? undefined : val);
  }

  updated(changedProps: PropertyValues<this>): void {
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._syncTargetPicker();
    }
    if (changedProps.has("hass") && this.hass) {
      this.shadowRoot?.querySelectorAll("ha-selector").forEach((el) => {
        const selectorEl = el as TargetPickerElement;
        selectorEl.hass = this.hass;
      });
    }
  }

  render() {
    const c = this._config;
    return html`
      <div class="ed">
        <section-heading .text=${msg("General")}></section-heading>
        <editor-text-field
          .label=${msg("Card title (optional)")}
          .value=${c.title || ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("title", e.detail.value)}
        ></editor-text-field>

        <section-heading .text=${msg("Related items")}></section-heading>
        <div class="note">
          ${msg(
            "Pre-fill entities, devices, areas or labels that are always linked to recordings from this card.",
            {
              id: "Pre-fill entities, devices, areas or labels that are always linked to recordings from this card.",
            }
          )}
        </div>
        <ha-selector
          id="target-picker"
          .selector=${{ target: {} }}
          .hass=${this.hass}
          .value=${this._configTarget()}
          @value-changed=${this._onTargetChanged}
          style="display:block;width:100%"
        ></ha-selector>
        <editor-switch
          .label=${msg("Show always included targets on card")}
          .checked=${c.show_config_targets !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set(
              "show_config_targets",
              e.detail.checked ? undefined : false
            )}
        ></editor-switch>
        <editor-switch
          .label=${msg("Allow user to add more related items")}
          .checked=${c.show_target_picker !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set(
              "show_target_picker",
              e.detail.checked ? undefined : false
            )}
        ></editor-switch>

        <section-heading .text=${msg("Datapoint Appearance")}></section-heading>
        <editor-icon-picker
          .label=${msg("Default icon")}
          .value=${c.default_icon || "mdi:bookmark"}
          .hass=${this.hass}
          @dp-icon-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("default_icon", e.detail.value)}
        ></editor-icon-picker>
        <color-swatch
          .label=${msg("Default colour")}
          .color=${c.default_color || "#03a9f4"}
          @dp-color-change=${(e: CustomEvent<{ color: string }>) =>
            this._set("default_color", e.detail.color)}
        ></color-swatch>

        <section-heading .text=${msg("Form fields")}></section-heading>
        <editor-switch
          .label=${msg("Show date & time field")}
          .checked=${c.show_date !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_date", e.detail.checked ? undefined : false)}
        ></editor-switch>
        <editor-switch
          .label=${msg("Show annotation field")}
          .checked=${c.show_annotation !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_annotation", e.detail.checked ? undefined : false)}
        ></editor-switch>
      </div>
    `;
  }
}
