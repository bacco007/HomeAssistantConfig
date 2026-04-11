import { CSSResultGroup, html, PropertyValues } from "lit";
import { msg } from "@/lib/i18n/localize";
import { AMBER } from "@/constants";
import { EditorBase } from "@/molecules/editor-base/editor-base";
import { styles } from "./editor.styles";
import { normalizeTargetValue } from "@/lib/domain/target-selection";
import type { HassLike } from "@/lib/types";
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

export class HassRecordsQuickCardEditor extends EditorBase {
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

  private _onTargetChanged = (
    e: CustomEvent<{ value?: TargetPickerValue }>
  ): void => {
    const val = e.detail.value;
    const isEmpty = !val || Object.values(val).every((value) => !value?.length);
    this._setTargetConfig(isEmpty ? undefined : val);
  };

  updated(changedProps: PropertyValues<this>): void {
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._syncTargetPicker();
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
        <editor-text-field
          .label=${msg("Input placeholder text")}
          .value=${c.placeholder || ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("placeholder", e.detail.value)}
        ></editor-text-field>

        <section-heading .text=${msg("Icon & colour")}></section-heading>
        <editor-icon-picker
          .label=${msg("Icon")}
          .value=${c.icon || "mdi:bookmark"}
          .hass=${this.hass}
          @dp-icon-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("icon", e.detail.value)}
        ></editor-icon-picker>
        <color-swatch
          .label=${msg("Colour")}
          .color=${c.color || AMBER}
          @dp-color-change=${(e: CustomEvent<{ color: string }>) =>
            this._set("color", e.detail.color)}
        ></color-swatch>

        <section-heading .text=${msg("Related items")}></section-heading>
        <div class="note">
          ${msg(
            "These items will be linked to every record made with this card.",
            {
              id: "These items will be linked to every record made with this card.",
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

        <section-heading .text=${msg("Form fields")}></section-heading>
        <editor-switch
          .label=${msg("Show annotation field")}
          .checked=${!!c.show_annotation}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_annotation", e.detail.checked || undefined)}
        ></editor-switch>
      </div>
    `;
  }
}
