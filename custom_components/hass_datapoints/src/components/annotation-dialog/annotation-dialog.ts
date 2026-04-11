import { DOMAIN } from "@/constants";
import {
  areaIcon,
  areaName,
  deviceIcon,
  deviceName,
  entityIcon,
  entityName,
  labelIcon,
  labelName,
} from "@/lib/ha/entity-name";
import { esc } from "@/lib/util/format";
import { invalidateEventsCache } from "@/lib/data/events-api";
import {
  mergeTargetSelections,
  normalizeTargetSelection,
  type NormalizedTargetSelection,
} from "@/lib/domain/target-selection";
import { logger } from "@/lib/logger";
import "@/molecules/annotation-chip-row/annotation-chip-row";

/**
 * Dedicated annotation dialog controller for the history chart card.
 */

type DialogElement = HTMLElement & {
  open: boolean;
  headerTitle: string;
  scrimClickAction: boolean;
  escapeKeyAction: boolean;
  hass: unknown;
  dialogInitialFocus: string;
};

type ChipRowElement = HTMLElement & {
  hass: unknown;
  chips: unknown[];
};

type HaInputElement = Element & {
  hass?: unknown;
  value?: string;
  disabled?: boolean;
  selector?: unknown;
  focus?: () => void;
};
type HaButtonElement = Element & { disabled?: boolean };

type HoverState = {
  timeMs: number;
  annotationPrefill?: {
    linkedTarget?: unknown;
    color?: string;
    message?: string;
    annotation?: string;
    icon?: string;
  };
  primary?: { color?: string };
  event?: { icon?: string; color?: string };
};

type AnnotationDialogHost = HTMLElement & {
  shadowRoot: ShadowRoot;
  _hass: Nullable<RecordWithUnknownValues> | undefined;
  _creatingContextAnnotation: boolean;
  _config: RecordWithUnknownValues;
  _hiddenSeries: Set<string>;
  _entityIds: string[];
};

export class HistoryAnnotationDialogController {
  private _host: AnnotationDialogHost;

  private _dialogEl: Nullable<DialogElement>;

  private _panelEl: Nullable<HTMLElement>;

  private _chipRowEl: Nullable<ChipRowElement>;

  private _linkedTarget: NormalizedTargetSelection;

  private _target: NormalizedTargetSelection;

  constructor(host: AnnotationDialogHost) {
    this._host = host;
    this._dialogEl = null;
    this._panelEl = null;
    this._chipRowEl = null;
    this._linkedTarget = normalizeTargetSelection({});
    this._target = normalizeTargetSelection({});
  }

  isOpen() {
    return !!this._dialogEl?.open;
  }

  ensureDialog() {
    if (this._dialogEl || !this._host.shadowRoot) {
      return;
    }
    const dialog = document.createElement(
      "ha-dialog"
    ) as unknown as DialogElement;
    dialog.id = "chart-context-dialog";
    dialog.scrimClickAction = true;
    dialog.escapeKeyAction = true;
    dialog.open = false;
    dialog.headerTitle = "Create data point";
    dialog.style.setProperty(
      "--dialog-content-padding",
      "0 var(--dp-spacing-lg, 24px) var(--dp-spacing-lg, 24px)"
    );
    dialog.style.setProperty("--mdc-dialog-min-width", "min(920px, 96vw)");
    dialog.style.setProperty("--mdc-dialog-max-width", "96vw");
    if (this._host._hass) {
      dialog.hass = this._host._hass;
    }
    dialog.innerHTML = `
      <div id="chart-context-dialog-panel" class="chart-context-dialog-panel"></div>
    `;
    dialog.addEventListener("closed", () => this.finalizeClose());
    this._host.shadowRoot.appendChild(dialog);
    this._dialogEl = dialog;
    this._panelEl = dialog.querySelector("#chart-context-dialog-panel");
  }

  teardown() {
    this.resetFormState();
    this._dialogEl?.remove();
    this._dialogEl = null;
    this._panelEl = null;
    this._chipRowEl = null;
  }

  resetFormState() {
    this._linkedTarget = normalizeTargetSelection({});
    this._target = normalizeTargetSelection({});
  }

  finalizeClose() {
    this.teardown();
    this._host._creatingContextAnnotation = false;
  }

  _shake() {
    if (!this._dialogEl) return;
    const shadowRoot = this._host.shadowRoot;
    if (!shadowRoot) return;
    // Inject shake keyframes into the shadow root once.
    if (!shadowRoot.getElementById("dp-dialog-shake-style")) {
      const style = document.createElement("style");
      style.id = "dp-dialog-shake-style";
      style.textContent = `
        @keyframes dp-dialog-shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }
        .dp-shaking {
          animation: dp-dialog-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `;
      shadowRoot.appendChild(style);
    }
    this._dialogEl.classList.remove("dp-shaking");
    // eslint-disable-next-line no-void
    void this._dialogEl.offsetWidth; // force reflow to restart animation
    this._dialogEl.classList.add("dp-shaking");
    this._dialogEl.addEventListener(
      "animationend",
      () => this._dialogEl?.classList.remove("dp-shaking"),
      { once: true }
    );
  }

  formatDate(timeMs: number) {
    const value = new Date(timeMs);
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    const hh = String(value.getHours()).padStart(2, "0");
    const min = String(value.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  _buildChips(target: NormalizedTargetSelection) {
    return [
      ...(target.entity_id || []).map((id) => {
        const name = entityName(this._host._hass, id);
        return {
          type: "entity_id",
          itemId: id,
          icon: entityIcon(this._host._hass, id),
          name,
          secondaryText: name !== id ? id : "",
          stateObj:
            (
              this._host?._hass?.states as RecordWithUnknownValues | undefined
            )?.[id] ?? null,
        };
      }),
      ...(target.device_id || []).map((id) => ({
        type: "device_id",
        itemId: id,
        icon: deviceIcon(this._host._hass, id),
        name: deviceName(this._host._hass, id),
      })),
      ...(target.area_id || []).map((id) => ({
        type: "area_id",
        itemId: id,
        icon: areaIcon(this._host._hass, id),
        name: areaName(this._host._hass, id),
      })),
      ...(target.label_id || []).map((id) => ({
        type: "label_id",
        itemId: id,
        icon: labelIcon(this._host._hass, id),
        name: labelName(this._host._hass, id),
      })),
    ];
  }

  removeLinkedTarget(type: keyof NormalizedTargetSelection, id: string) {
    if (!this._linkedTarget || !type || !id) {
      return;
    }
    const current = normalizeTargetSelection(this._linkedTarget);
    if (!current[type]) {
      return;
    }
    current[type] = current[type].filter((value) => value !== id);
    this._linkedTarget = current;
    if (this._chipRowEl) {
      this._chipRowEl.hass = this._host._hass ?? null;
      this._chipRowEl.chips = this._buildChips(
        mergeTargetSelections(this._linkedTarget, this._target)
      );
    }
  }

  bindTargetChipActions() {
    // No-op: chip remove events are handled via dp-target-remove on _chipRowEl.
  }

  _getDefaultLinkedTarget() {
    const config = this._host?._config || {};
    const hiddenSeries =
      this._host?._hiddenSeries instanceof Set
        ? this._host._hiddenSeries
        : new Set();
    const seriesSettings = Array.isArray(config.series_settings)
      ? config.series_settings
      : [];

    const visibleEntityIds = seriesSettings
      .map(
        (entry) => entry?.entity_id || entry?.entity || entry?.entityId || null
      )
      .filter(
        (entityId) =>
          typeof entityId === "string" &&
          entityId.length > 0 &&
          !hiddenSeries.has(entityId)
      );

    if (visibleEntityIds.length > 0) {
      return normalizeTargetSelection({
        entity_id: [...new Set(visibleEntityIds)],
      });
    }

    return normalizeTargetSelection({
      entity_id: (this._host?._entityIds || []).filter(Boolean),
    });
  }

  bindFields(hover: HoverState) {
    if (!this._panelEl) {
      return;
    }
    const prefill =
      hover?.annotationPrefill && typeof hover.annotationPrefill === "object"
        ? hover.annotationPrefill
        : {};
    const messageEl = this._panelEl.querySelector(
      "#chart-context-message"
    ) as Nullable<HaInputElement>;
    const annotationEl = this._panelEl.querySelector(
      "#chart-context-annotation"
    ) as Nullable<HaInputElement>;
    const iconPicker = this._panelEl.querySelector(
      "#chart-context-icon"
    ) as Nullable<HaInputElement>;
    if (iconPicker) {
      iconPicker.hass = this._host._hass;
      iconPicker.value = prefill.icon || hover?.event?.icon || "mdi:bookmark";
    }
    if (messageEl) {
      messageEl.value = prefill.message || "";
    }
    if (annotationEl) {
      annotationEl.value = prefill.annotation || "";
    }

    // Mount annotation-chip-row into the #chart-context-linked-targets placeholder.
    const chipContainer = this._panelEl.querySelector(
      "#chart-context-linked-targets"
    );
    if (chipContainer && !this._chipRowEl) {
      const chipRow = document.createElement(
        "annotation-chip-row"
      ) as unknown as ChipRowElement;
      chipRow.hass = this._host._hass ?? null;
      chipRow.addEventListener("dp-target-remove", (ev) => {
        const detail = (ev as CustomEvent).detail;
        this.removeLinkedTarget(detail.type, detail.id);
      });
      chipContainer.appendChild(chipRow);
      this._chipRowEl = chipRow;
    }
    if (this._chipRowEl) {
      this._chipRowEl.chips = this._buildChips(this._linkedTarget);
    }

    // Wire up the always-visible target selector.
    const targetSel = this._panelEl.querySelector(
      "#chart-context-target"
    ) as Nullable<HaInputElement>;
    if (targetSel) {
      targetSel.hass = this._host._hass;
      (targetSel as HaInputElement & { selector: unknown }).selector = {
        target: {},
      };
      targetSel.addEventListener("value-changed", (ev) => {
        // Merge incoming selection with existing _target so picking a second
        // entity/device doesn't wipe out the first.
        this._target = mergeTargetSelections(
          this._target,
          normalizeTargetSelection((ev as CustomEvent).detail.value || {})
        );
        if (this._chipRowEl) {
          this._chipRowEl.hass = this._host._hass ?? null;
          this._chipRowEl.chips = this._buildChips(
            mergeTargetSelections(this._linkedTarget, this._target)
          );
        }
      });
    }

    this.bindTargetChipActions();
    const colorInput = this._panelEl.querySelector(
      "#chart-context-color"
    ) as Nullable<HTMLInputElement>;
    const colorPreview = this._panelEl.querySelector(
      "#chart-context-color-preview"
    ) as Nullable<HTMLElement>;
    const syncColor = () => {
      if (colorPreview && colorInput) {
        colorPreview.style.background = colorInput.value;
      }
    };
    if (colorInput) {
      syncColor();
      colorInput.addEventListener("input", syncColor);
      colorInput.addEventListener("change", syncColor);
    }
    this._dialogEl
      ?.querySelector("#chart-context-cancel")
      ?.addEventListener("click", () => this.close());
    this._dialogEl
      ?.querySelector("#chart-context-save")
      ?.addEventListener("click", () => this.submit());
    [messageEl, annotationEl].forEach((field) => {
      field?.addEventListener("keydown", (ev) => {
        const kev = ev as KeyboardEvent;
        if (kev.key === "Enter" && (kev.ctrlKey || kev.metaKey)) {
          kev.preventDefault();
          this.submit();
        }
      });
    });
  }

  async submit() {
    if (!this._panelEl || !this._host._hass) {
      return;
    }
    const messageEl = this._panelEl.querySelector(
      "#chart-context-message"
    ) as Nullable<HaInputElement>;
    const annotationEl = this._panelEl.querySelector(
      "#chart-context-annotation"
    ) as Nullable<HaInputElement>;
    const dateEl = this._panelEl.querySelector(
      "#chart-context-date"
    ) as Nullable<HaInputElement>;
    const iconPicker = this._panelEl.querySelector(
      "#chart-context-icon"
    ) as Nullable<HaInputElement>;
    const colorInput = this._panelEl.querySelector(
      "#chart-context-color"
    ) as Nullable<HaInputElement>;
    const saveButton = this._dialogEl?.querySelector(
      "#chart-context-save"
    ) as Nullable<HaButtonElement>;
    const feedbackEl = this._panelEl.querySelector(
      "#chart-context-feedback"
    ) as Nullable<HTMLElement>;

    const message = (messageEl?.value || "").trim();
    if (!message) {
      messageEl?.focus?.();
      this._shake();
      return;
    }

    const mergedTarget = mergeTargetSelections(
      this._linkedTarget,
      this._target || {}
    );
    const payload: RecordWithUnknownValues = { message };
    const annotation = (annotationEl?.value || "").trim();
    if (annotation) {
      payload.annotation = annotation;
    }
    const dateVal = (dateEl?.value || "").trim();
    if (dateVal) {
      const parsedDate = new Date(dateVal);
      payload.date = Number.isFinite(parsedDate.getTime())
        ? parsedDate.toISOString()
        : dateVal;
    }
    const icon = iconPicker?.value;
    if (icon) {
      payload.icon = icon;
    }
    payload.color = colorInput?.value || "#03a9f4";
    if (mergedTarget.entity_id.length) {
      payload.entity_ids = mergedTarget.entity_id;
    }
    if (mergedTarget.device_id.length) {
      payload.device_ids = mergedTarget.device_id;
    }
    if (mergedTarget.area_id.length) {
      payload.area_ids = mergedTarget.area_id;
    }
    if (mergedTarget.label_id.length) {
      payload.label_ids = mergedTarget.label_id;
    }

    if (saveButton) saveButton.disabled = true;
    if (feedbackEl) {
      feedbackEl.hidden = true;
      feedbackEl.textContent = "";
    }
    try {
      await (
        this._host._hass as {
          callService: (
            d: string,
            s: string,
            data: unknown
          ) => Promise<unknown>;
        }
      ).callService(DOMAIN, "record", payload);
      invalidateEventsCache();
      window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
      this.close();
    } catch (err) {
      if (feedbackEl) {
        feedbackEl.hidden = false;
        feedbackEl.textContent =
          (err as Error)?.message || "Failed to create annotation.";
      }
      this._shake();
      logger.error("[hass-datapoints history-card]", err);
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }

  open(hover: HoverState) {
    if (this._dialogEl && !this._dialogEl.open) {
      this.teardown();
    }
    this.ensureDialog();
    if (!this._dialogEl || !this._panelEl || this._dialogEl.open) return;
    this.resetFormState();
    const prefillLinkedTarget = hover?.annotationPrefill?.linkedTarget;
    if (prefillLinkedTarget && typeof prefillLinkedTarget === "object") {
      this._linkedTarget = normalizeTargetSelection(prefillLinkedTarget);
    } else {
      this._linkedTarget = this._getDefaultLinkedTarget();
    }
    const defaultColor =
      hover?.annotationPrefill?.color ||
      hover?.primary?.color ||
      hover?.event?.color ||
      "#03a9f4";

    this._panelEl.innerHTML = `
      <style>
        .chart-context-dialog-panel { width: min(920px, 96vw); max-width: 100%; color: var(--primary-text-color); }
        .context-dialog-content { display: grid; gap: 16px; padding-top: 4px; }
        .context-form { display: grid; gap: 16px; }
        .context-form-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
        .context-form-row { display: grid; gap: 16px; align-items: start; }
        .context-form-row-message-date { grid-template-columns: minmax(0, 1fr) 220px; }
        .context-form-row-icon-color { grid-template-columns: 220px auto; }
        .context-form-field { display: grid; gap: 6px; min-width: 0; }
        .context-form-label { font-size: 0.9rem; font-weight: 600; color: var(--primary-text-color); }
        .context-form-help { font-size: 0.8rem; color: var(--secondary-text-color); line-height: 1.45; }
        .context-form-help-inline { display: inline-flex; align-items: center; gap: 6px; }
        .context-annotation-input { width: 100%; min-height: 120px; box-sizing: border-box; resize: vertical; padding: 12px; border: 1px solid var(--input-outlined-idle-border-color, var(--divider-color, #9e9e9e)); border-radius: 12px; background: var(--card-background-color, var(--primary-background-color, #fff)); color: var(--primary-text-color); font: inherit; line-height: 1.45; }
        .context-annotation-input::placeholder { color: var(--secondary-text-color); }
        .context-annotation-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 1px var(--primary-color); }
        .context-help-icon { color: var(--secondary-text-color); cursor: help; --mdc-icon-size: 16px; }
        .context-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .context-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); white-space: nowrap; }
        .context-chip ha-icon { --mdc-icon-size: 14px; }
        .context-chip-remove { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; padding: 0; border: none; border-radius: 50%; background: transparent; color: currentColor; cursor: pointer; flex: 0 0 auto; }
        .context-chip-remove:hover { background: color-mix(in srgb, currentColor 12%, transparent); }
        .context-chip-remove ha-icon { --mdc-icon-size: 12px; pointer-events: none; }
        .context-color-control { display: flex; align-items: center; gap: 10px; }
        .context-color-preview { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--divider-color, #ccc); flex: 0 0 auto; }
        .context-color-input { width: 56px; height: 36px; padding: 0; border: none; background: transparent; cursor: pointer; }
        .context-date-input { width: 100%; box-sizing: border-box; }
        .context-icon-input { width: 100%; }
        .context-form-feedback { color: var(--error-color); font-size: 0.84rem; }
        .context-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 8px; }
        .context-form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-left: auto; }
        @media (max-width: 600px) {
          .context-form-row-message-date,
          .context-form-row-icon-color { grid-template-columns: minmax(0, 1fr); }
        }
      </style>
      <div class="context-dialog-content">
        <div class="context-form">
          <div class="context-form-grid">
            <!-- Row 1: Message + Date/time -->
            <div class="context-form-row context-form-row-message-date">
              <div class="context-form-field">
                <label class="context-form-label" for="chart-context-message">Message</label>
                <div class="context-form-help">Use a short title that will be shown in the chart tooltip and records list.</div>
                <ha-textfield id="chart-context-message" placeholder="What happened?" style="width:100%"></ha-textfield>
              </div>
              <div class="context-form-field">
                <label class="context-form-label" for="chart-context-date">Date and time</label>
                <div class="context-form-help">The annotation will be placed at this exact moment on the chart.</div>
                <ha-textfield id="chart-context-date" class="context-date-input" type="datetime-local" value="${esc(this.formatDate(hover.timeMs))}"></ha-textfield>
              </div>
            </div>
            <!-- Row 2: Annotation -->
            <div class="context-form-field">
              <label class="context-form-label" for="chart-context-annotation">Annotation</label>
              <div class="context-form-help">Add any longer context, outcome, or note you want to keep with this data point.</div>
              <textarea id="chart-context-annotation" class="context-annotation-input" placeholder="Detailed note shown on chart hover..."></textarea>
            </div>
            <!-- Row 3: Linked targets -->
            <div class="context-form-field">
              <label class="context-form-label">Linked targets</label>
              <div id="chart-context-linked-targets"></div>
              <ha-selector id="chart-context-target"></ha-selector>
            </div>
            <!-- Row 4: Icon + Color -->
            <div class="context-form-row context-form-row-icon-color">
              <div class="context-form-field">
                <label class="context-form-label" for="chart-context-icon">Icon</label>
                <div class="context-form-help">Choose the icon shown for this data point in the chart and records list.</div>
                <ha-icon-picker id="chart-context-icon" class="context-icon-input" label="Icon"></ha-icon-picker>
              </div>
              <div class="context-form-field">
                <label class="context-form-label" for="chart-context-color">Color</label>
                <div class="context-form-help context-form-help-inline">
                  Pick a color for the point marker and its related timeline indicators.
                  <ha-icon class="context-help-icon" icon="mdi:information-outline" title="This color is used for the chart marker, timeline dot, and record icon."></ha-icon>
                </div>
                <div class="context-color-control">
                  <span id="chart-context-color-preview" class="context-color-preview" aria-hidden="true"></span>
                  <input id="chart-context-color" class="context-color-input" type="color" value="${esc(defaultColor)}" aria-label="Annotation color">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="context-form-footer">
          <div id="chart-context-feedback" class="context-form-feedback" hidden></div>
          <div class="context-form-actions">
            <ha-button id="chart-context-cancel">Cancel</ha-button>
            <ha-button id="chart-context-save" raised>Create data point</ha-button>
          </div>
        </div>
      </div>
    `;
    if (this._dialogEl) {
      this._dialogEl.hass = this._host._hass;
      this._dialogEl.dialogInitialFocus = "#chart-context-message";
    }
    this.bindFields(hover);
    this._dialogEl.open = true;
    this._host._creatingContextAnnotation = true;
    window.requestAnimationFrame(() => {
      (
        this._panelEl?.querySelector(
          "#chart-context-message"
        ) as Nullable<HTMLElement>
      )?.focus?.();
    });
  }

  close() {
    this._host._creatingContextAnnotation = false;
    if (this._dialogEl) this._dialogEl.open = false;
    window.setTimeout(() => this.finalizeClose(), 0);
  }
}
