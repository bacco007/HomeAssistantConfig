import { CSSResultGroup, html, PropertyValues } from "lit";
import { msg } from "@/lib/i18n/localize";
import { EditorBase } from "@/molecules/editor-base/editor-base";
import { styles } from "./editor.styles";
import { normalizeTargetValue } from "@/lib/domain/target-selection";
import type { HassLike } from "@/lib/types";
import "@/atoms/display/section-heading/section-heading";
import "@/atoms/form/editor-text-field/editor-text-field";
import "@/atoms/form/editor-switch/editor-switch";

type TargetPickerValue = Record<string, string[]>;
type TargetPickerElement = Element & {
  hass?: Nullable<HassLike>;
  value?: TargetPickerValue;
};

export class HassRecordsListCardEditor extends EditorBase {
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
          .label=${msg("Hours to show (blank = all time)")}
          type="number"
          .value=${c.hours_to_show != null ? String(c.hours_to_show) : ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("hours_to_show", e.detail.value)}
        ></editor-text-field>
        <editor-text-field
          .label=${msg("Records per page")}
          type="number"
          .value=${String(c.page_size ?? 15)}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("page_size", e.detail.value)}
        ></editor-text-field>

        <section-heading .text=${msg("Filtering")}></section-heading>
        <editor-text-field
          .label=${msg("Default message filter (always applied)")}
          .value=${c.message_filter || ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("message_filter", e.detail.value)}
        ></editor-text-field>

        <section-heading .text=${msg("Visibility")}></section-heading>
        <editor-switch
          .label=${msg("Show search bar")}
          .checked=${c.show_search !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_search", e.detail.checked ? undefined : false)}
        ></editor-switch>
        <editor-switch
          .label=${msg("Show related entities")}
          .checked=${c.show_entities !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_entities", e.detail.checked ? undefined : false)}
        ></editor-switch>
        <editor-switch
          .label=${msg("Show edit & delete actions")}
          .checked=${c.show_actions !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("show_actions", e.detail.checked ? undefined : false)}
        ></editor-switch>
        <editor-switch
          .label=${msg("Show full message")}
          .checked=${c.show_full_message !== false}
          .tooltip=${msg("User will be able to expand the row if hidden", {
            id: "User will be able to expand the row if hidden",
          })}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set(
              "show_full_message",
              e.detail.checked ? undefined : false
            )}
        ></editor-switch>

        <section-heading .text=${msg("Target filter")}></section-heading>
        <ha-selector
          id="target-picker"
          .selector=${{ target: {} }}
          .hass=${this.hass}
          .value=${this._configTarget()}
          @value-changed=${this._onTargetChanged}
          style="display:block;width:100%"
        ></ha-selector>
      </div>
    `;
  }
}
