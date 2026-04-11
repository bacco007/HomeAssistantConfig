import { LitElement, html } from "lit";

import { styles } from "./action.styles";
import { DOMAIN } from "@/constants";
import type { HassLike, CardConfig } from "@/lib/types";
import type {
  ConfigChipItem,
  PartialTargetMap,
  TargetMap,
} from "@/cards/action/types";
import "@/atoms/display/color-swatch/color-swatch";
import "@/atoms/display/feedback-banner/feedback-banner";
import "@/cards/action/action-targets/action-targets";
import { logger } from "@/lib/logger";

/**
 * hass-datapoints-action-card – Full form to record a custom event.
 *
 * Related items UI:
 *   - Config-set targets rendered as non-removable chip-group chips.
 *   - A ha-selector (target schema) lets the user add extra items per recording.
 *   - On submit both are merged; the selector resets to empty afterwards.
 */
export class HassRecordsActionCard extends LitElement {
  static properties = {
    _config: { state: true },
    _hass: { state: true },
    _color: { state: true },
    _feedbackClass: { state: true },
    _feedbackText: { state: true },
    _feedbackVisible: { state: true },
  };

  declare _config: CardConfig;

  declare _hass: Nullable<HassLike>;

  declare _color: string;

  declare _feedbackClass: string;

  declare _feedbackText: string;

  declare _feedbackVisible: boolean;

  private _userTarget: PartialTargetMap = {};

  static styles = styles;

  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._color = "#03a9f4";
    this._feedbackClass = "";
    this._feedbackText = "";
    this._feedbackVisible = false;
  }

  setConfig(config: CardConfig) {
    this._config = config || {};
    this._color = (config?.default_color as string) || "#03a9f4";
  }

  set hass(hass: HassLike) {
    this._hass = hass;
  }

  get hass(): Nullable<HassLike> {
    return this._hass;
  }

  private _nowStr(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  private _configTarget(): TargetMap {
    const cfg = this._config;
    const norm = (v: unknown): string[] => {
      if (!v) {
        return [];
      }
      if (Array.isArray(v)) {
        return v as string[];
      }
      return [v as string];
    };
    let raw: RecordWithUnknownValues | undefined;
    if (cfg.target) raw = cfg.target as RecordWithUnknownValues;
    else if (cfg.entity) raw = { entity_id: [cfg.entity] };
    else if ((cfg.entities as string[])?.length)
      raw = { entity_id: cfg.entities };
    else return { entity_id: [], device_id: [], area_id: [], label_id: [] };
    return {
      entity_id: norm(raw.entity_id),
      device_id: norm(raw.device_id),
      area_id: norm(raw.area_id),
      label_id: norm(raw.label_id),
    };
  }

  private _configChipItems(): ConfigChipItem[] {
    const t = this._configTarget();
    const items: ConfigChipItem[] = [];
    t.entity_id.forEach((id) => items.push({ type: "entity", id }));
    t.device_id.forEach((id) => items.push({ type: "device", id }));
    t.area_id.forEach((id) => items.push({ type: "area", id }));
    t.label_id.forEach((id) => items.push({ type: "label", id }));
    return items;
  }

  private _mergeTargets(a: TargetMap, b: Partial<TargetMap>): TargetMap {
    const norm = (v: unknown): string[] => {
      if (!v) {
        return [];
      }
      if (Array.isArray(v)) {
        return v as string[];
      }
      return [v as string];
    };
    const merge = (x: unknown, y: unknown) => [
      ...new Set([...norm(x), ...norm(y)]),
    ];
    return {
      entity_id: merge(a.entity_id, b.entity_id),
      device_id: merge(a.device_id, b.device_id),
      area_id: merge(a.area_id, b.area_id),
      label_id: merge(a.label_id, b.label_id),
    };
  }

  async _record() {
    const msgEl = this.shadowRoot!.querySelector<
      HTMLElement & { value: string }
    >("#msg");
    const message = (msgEl?.value || "").trim();
    if (!message) {
      msgEl?.focus();
      return;
    }

    const btn = this.shadowRoot!.querySelector<
      HTMLElement & { disabled: boolean }
    >("#btn");
    if (btn) btn.disabled = true;

    const data: RecordWithUnknownValues = { message };

    const annEl = this.shadowRoot!.querySelector<HTMLTextAreaElement>("#ann");
    const ann = (annEl?.value || "").trim();
    if (ann) data.annotation = ann;

    const iconPicker = this.shadowRoot!.querySelector<
      HTMLElement & { value: string }
    >("#icon-picker");
    const icon = iconPicker?.value;
    if (icon) data.icon = icon;

    data.color = this._color;

    const dateEl = this.shadowRoot!.querySelector<
      HTMLElement & { value: string }
    >("#date");
    const dateVal = (dateEl?.value || "").trim();
    if (dateVal) data.date = dateVal;

    const merged = this._mergeTargets(this._configTarget(), this._userTarget);
    if (merged.entity_id.length) data.entity_ids = merged.entity_id;
    if (merged.device_id.length) data.device_ids = merged.device_id;
    if (merged.area_id.length) data.area_ids = merged.area_id;
    if (merged.label_id.length) data.label_ids = merged.label_id;

    try {
      await this._hass!.callService(DOMAIN, "record", data);
      window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
      this.dispatchEvent(
        new CustomEvent("hass-datapoints-action-recorded", {
          bubbles: true,
          composed: true,
          detail: { ...data },
        })
      );
      if (msgEl) msgEl.value = "";
      if (annEl) annEl.value = "";
      if (dateEl)
        dateEl.value = (this._config.default_date as string) || this._nowStr();
      this._userTarget = {};
      const targets = this.shadowRoot!.querySelector<
        HTMLElement & { resetSelection?: () => void }
      >("action-targets");
      if (targets?.resetSelection) {
        targets.resetSelection();
      }
      this._feedbackClass = "ok";
      this._feedbackText = "Event recorded!";
      this._feedbackVisible = true;
      setTimeout(() => {
        this._feedbackVisible = false;
      }, 3000);
    } catch (e: unknown) {
      const err = e as Error;
      this._feedbackClass = "err";
      this._feedbackText = `Error: ${err.message || "unknown error"}`;
      this._feedbackVisible = true;

      logger.error("[hass-datapoints action-card]", e);
    }

    if (btn) btn.disabled = false;
  }

  private _onColorChange(e: CustomEvent<{ color: string }>) {
    this._color = e.detail.color;
  }

  private _onTargetChanged(e: CustomEvent<{ value: PartialTargetMap }>) {
    this._userTarget = e.detail.value || {};
  }

  private _onAnnKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this._record();
    }
  }

  private get _isAdmin(): boolean {
    return this._hass?.user?.is_admin === true;
  }

  render() {
    const cfg = this._config;
    const hasTitle = !!cfg.title;

    if (!this._isAdmin) {
      return html`
        <ha-card>
          ${hasTitle ? html`<div class="card-header">${cfg.title}</div>` : ""}
          <div class="no-permission">
            Recording datapoints requires an admin account.
          </div>
        </ha-card>
      `;
    }

    const showDate = cfg.show_date !== false;
    const showAnnotation = cfg.show_annotation !== false;
    const showConfigTargets = cfg.show_config_targets !== false;
    const showTargetPicker = cfg.show_target_picker !== false;
    const configChips = this._configChipItems();

    return html`
      <ha-card>
        ${hasTitle ? html`<div class="card-header">${cfg.title}</div>` : ""}

        <div class="form-group">
          <ha-textfield
            id="msg"
            class="full-width-field"
            label="Message *"
            placeholder="What happened?"
          ></ha-textfield>
        </div>

        ${showAnnotation
          ? html`
              <div class="form-group">
                <label class="field-label" for="ann">Annotation</label>
                <textarea
                  id="ann"
                  class="annotation-input"
                  placeholder="Detailed note shown on chart hover…"
                  @keydown=${this._onAnnKeydown}
                ></textarea>
              </div>
            `
          : ""}
        ${showDate
          ? html`
              <div class="form-group">
                <ha-textfield
                  id="date"
                  class="full-width-field"
                  label="Date & Time"
                  type="datetime-local"
                  .value=${(cfg.default_date as string) || this._nowStr()}
                ></ha-textfield>
              </div>
            `
          : ""}

        <div class="row">
          <div class="form-group">
            <ha-icon-picker
              id="icon-picker"
              class="full-width-field"
              label="Icon"
              .value=${(cfg.default_icon as string) || "mdi:bookmark"}
              .hass=${this._hass}
            ></ha-icon-picker>
          </div>
          <div class="form-group color-col">
            <color-swatch
              .color=${this._color}
              @dp-color-change=${this._onColorChange}
            ></color-swatch>
          </div>
        </div>

        <div class="form-group" id="target-wrap">
          <action-targets
            .hass=${this._hass}
            .showConfigTargets=${showConfigTargets}
            .showTargetPicker=${showTargetPicker}
            .configChips=${configChips}
            @dp-target-change=${this._onTargetChanged}
          ></action-targets>
        </div>

        <ha-button id="btn" raised @click=${this._record}>
          ${cfg.submit_label || "Record Event"}
        </ha-button>

        <feedback-banner
          .kind=${this._feedbackClass}
          .text=${this._feedbackText}
          .visible=${this._feedbackVisible}
        ></feedback-banner>
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement("hass-datapoints-action-card-editor");
  }

  static getStubConfig() {
    return { title: "Record Event" };
  }

  getGridOptions() {
    const hasAnnotation = this._config?.show_annotation !== false;
    return {
      rows: hasAnnotation ? 10 : 7,
      min_rows: hasAnnotation ? 10 : 7,
      max_rows: hasAnnotation ? 10 : 7,
    };
  }

  getCardSize() {
    return this._config?.show_annotation !== false ? 10 : 7;
  }
}
