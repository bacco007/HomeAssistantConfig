import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./anomaly-monitor-wizard.styles";
import {
  type AnomalyMonitor,
  type CombinedMonitor,
  createMonitor,
  type CreateMonitorPayload,
  type IndividualMonitor,
  type MonitorType,
  updateMonitor,
} from "@/lib/data/monitors-api";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";
import type { HassLike } from "@/lib/types";
import {
  type NormalizedTargetSelection,
  normalizeTargetValue,
  resolveEntityIdsFromTarget,
} from "@/lib/domain/target-selection";
import { disambiguateEntityNames } from "@/lib/ha/entity-name";
import {
  LOOK_BACK_OPTIONS,
  SCAN_INTERVAL_OPTIONS,
  type EntityAnalysisConfig,
  defaultEntityConfig,
  configFromMonitor,
  entityConfigToAnalysis,
  toggleMethod,
  buildConfigPayload,
  validateStep1,
  validateStep2,
} from "./monitor-wizard-logic";
import "@/atoms/form/inline-select/inline-select";
import "@/atoms/form/entity-chip/entity-chip";
import "@/molecules/analysis-anomaly-group/analysis-anomaly-group";
import "@/molecules/analysis-sample-group/analysis-sample-group";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `anomaly-monitor-wizard` renders a 3-step dialog for creating or editing anomaly monitors.
 *
 * @fires dp-monitor-wizard-close  — `{}` cancel/close
 * @fires dp-monitor-wizard-saved  — `{ monitors: AnomalyMonitor[] }` after successful save
 */
@localized()
export class AnomalyMonitorWizard extends LitElement {
  static styles = styles;

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  /** Whether the dialog is open. */
  @property({ type: Boolean }) accessor open: boolean = false;

  /** Pre-fill entity IDs for step 1. */
  @property({ type: Array }) accessor prefillEntityIds: string[] = [];

  /** Pre-fill analysis settings (applied to pre-filled entities). */
  @property({ type: Object })
  accessor prefillAnalysis: Partial<NormalizedAnalysis> | null = null;

  /** If set, the wizard is in edit mode for this monitor. */
  @property({ type: Object }) accessor editMonitor: AnomalyMonitor | null =
    null;

  /**
   * Entity IDs from the current chart that have anomaly detection enabled
   * (non-binary, with at least one method). Shown as quick-add chips in step 1.
   */
  @property({ type: Array }) accessor suggestedEntityIds: string[] = [];

  /**
   * All entity IDs currently on the chart (visible and hidden, excluding binary sensors).
   * Used by the "Add all series from chart" shortcut button in step 1.
   */
  @property({ type: Array }) accessor allSeriesEntityIds: string[] = [];

  // ---- wizard state --------------------------------------------------------

  @state() accessor _step: 1 | 2 | 3 = 1;

  /** Raw target value bound to ha-target-picker in step 1. */
  @state() accessor _target: Partial<NormalizedTargetSelection> = {};

  /** Resolved entity IDs — populated from _target when advancing to step 2. */
  @state() accessor _entityIds: string[] = [];

  @state() accessor _entityConfigs: Map<string, EntityAnalysisConfig> =
    new Map();

  @state() accessor _activeEntityId: string = "";

  @state() accessor _name: string = "";

  @state() accessor _lookBackHours: number = 24;

  @state() accessor _scanIntervalMinutes: number = 30;

  @state() accessor _monitorType: MonitorType = "individual";

  @state() accessor _overlapMode: string = "all";

  @state() accessor _error: string = "";

  @state() accessor _saving: boolean = false;

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  connectedCallback() {
    super.connectedCallback();
    this._initFromProps();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this._initFromProps();
    }
    if (changed.has("editMonitor") && this.editMonitor) {
      this._initFromProps();
    }
  }

  private _initFromProps() {
    if (this.editMonitor) {
      const m = this.editMonitor;
      const ids =
        m.type === "combined"
          ? [...(m as CombinedMonitor).entity_ids]
          : [(m as IndividualMonitor).entity_id];
      const cfg = configFromMonitor(m);
      const configs = new Map<string, EntityAnalysisConfig>();
      for (const id of ids) configs.set(id, { ...cfg });

      this._step = 2;
      this._entityIds = ids;
      this._entityConfigs = configs;
      this._activeEntityId = ids[0] ?? "";
      this._name = m.name;
      this._lookBackHours = m.look_back_hours;
      this._scanIntervalMinutes = m.scan_interval_minutes;
      this._monitorType = m.type;
      this._overlapMode =
        m.type === "combined"
          ? ((m as CombinedMonitor).overlap_mode ?? "all")
          : "all";
    } else {
      const ids = [...(this.prefillEntityIds ?? [])];
      const configs = new Map<string, EntityAnalysisConfig>();
      for (const id of ids)
        configs.set(id, defaultEntityConfig(this.prefillAnalysis));

      this._step = 1;
      this._target = ids.length ? { entity_id: ids } : {};
      this._entityIds = ids;
      this._entityConfigs = configs;
      this._activeEntityId = ids[0] ?? "";
      this._name = "";
      this._lookBackHours = 24;
      this._scanIntervalMinutes = 30;
      this._monitorType = "individual";
      this._overlapMode = "all";
    }
    this._error = "";
    this._saving = false;
  }

  // -------------------------------------------------------------------------
  // Entity config helpers
  // -------------------------------------------------------------------------

  private _getEntityConfig(entityId: string): EntityAnalysisConfig {
    return this._entityConfigs.get(entityId) ?? defaultEntityConfig();
  }

  private _updateEntityConfig(
    entityId: string,
    key: keyof EntityAnalysisConfig,
    value: unknown
  ) {
    const current = this._getEntityConfig(entityId);
    const updated = new Map(this._entityConfigs);
    updated.set(entityId, { ...current, [key]: value });
    this._entityConfigs = updated;
  }

  private _toggleMethod(entityId: string, method: string, checked: boolean) {
    const cfg = this._getEntityConfig(entityId);
    const updated = toggleMethod(cfg, method, checked);
    this._updateEntityConfig(
      entityId,
      "anomaly_methods",
      updated.anomaly_methods
    );
  }

  /** Convert the wizard's slim EntityAnalysisConfig into a full NormalizedAnalysis
   *  so it can be passed directly into analysis-anomaly-group / analysis-sample-group. */
  private _entityConfigToAnalysis(
    cfg: EntityAnalysisConfig
  ): NormalizedAnalysis {
    return entityConfigToAnalysis(cfg) as NormalizedAnalysis;
  }

  /** Handle dp-group-analysis-change events bubbled from the embedded analysis components. */
  private _onAnalysisGroupChange(entityId: string, e: Event) {
    e.stopPropagation();
    const detail = (e as CustomEvent<{ key: string; value: unknown }>).detail;
    const { key, value } = detail;

    // Method toggle events emitted as "anomaly_method_toggle_<name>"
    if (key.startsWith("anomaly_method_toggle_")) {
      const method = key.replace("anomaly_method_toggle_", "");
      this._toggleMethod(entityId, method, value as boolean);
      return;
    }

    const keyMap: Partial<Record<string, keyof EntityAnalysisConfig>> = {
      anomaly_overlap_mode: "anomaly_overlap_mode",
      anomaly_sensitivity: "anomaly_sensitivity",
      anomaly_rate_window: "anomaly_rate_window",
      anomaly_zscore_window: "anomaly_zscore_window",
      anomaly_persistence_window: "anomaly_persistence_window",
      anomaly_comparison_window_id: "anomaly_comparison_window_id",
      anomaly_comparison_entity_id: "anomaly_comparison_entity_id",
      anomaly_trend_method: "anomaly_trend_method",
      anomaly_trend_window: "anomaly_trend_window",
      anomaly_use_sampled_data: "anomaly_use_sampled_data",
      sample_interval: "sample_interval",
      sample_aggregate: "sample_aggregate",
    };

    const configKey = keyMap[key];
    if (configKey !== undefined) {
      this._updateEntityConfig(entityId, configKey, value);
    }
  }

  // -------------------------------------------------------------------------
  // Entity add / remove
  // -------------------------------------------------------------------------

  private _onTargetChanged(ev: CustomEvent<{ value: unknown }>) {
    this._target = normalizeTargetValue(
      (ev.detail?.value ?? {}) as Parameters<typeof normalizeTargetValue>[0]
    );
  }

  private _resolvedTargetEntityIds(): string[] {
    return resolveEntityIdsFromTarget(this.hass, this._target);
  }

  private _setExplicitTargetEntityIds(entityIds: string[]) {
    this._target = entityIds.length > 0 ? { entity_id: entityIds } : {};
  }

  private _mergeResolvedTargetEntityIds(entityIdsToAdd: string[]) {
    const current = this._resolvedTargetEntityIds();
    const merged = [...current];

    for (const entityId of entityIdsToAdd) {
      if (!merged.includes(entityId)) {
        merged.push(entityId);
      }
    }

    this._setExplicitTargetEntityIds(merged);
  }

  private _addSuggestedEntity(entityId: string) {
    const current = this._resolvedTargetEntityIds();
    if (!current.includes(entityId)) {
      this._mergeResolvedTargetEntityIds([entityId]);
    }
  }

  private _addAllSeriesFromChart() {
    const current = this._resolvedTargetEntityIds();
    const toAdd = this.allSeriesEntityIds.filter((id) => !current.includes(id));
    if (toAdd.length > 0) {
      this._mergeResolvedTargetEntityIds(toAdd);
    }
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  private _emit(name: string, detail: RecordWithUnknownValues = {}) {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true })
    );
  }

  private _onClose() {
    this._emit("dp-monitor-wizard-close");
  }

  private _onDialogClosed() {
    this._emit("dp-monitor-wizard-close");
  }

  private _onBack() {
    if (this._step === 3) {
      this._step = 2;
    } else if (this._step === 2 && !this.editMonitor) {
      // Sync target picker back to the current resolved entity list
      this._target = this._entityIds.length
        ? { entity_id: [...this._entityIds] }
        : {};
      this._step = 1;
    }
    this._error = "";
  }

  private _onNext() {
    if (this._step === 1) {
      const resolved = resolveEntityIdsFromTarget(this.hass, this._target);
      const v1 = validateStep1(resolved);
      if (!v1.valid) {
        this._error = msg(v1.error!);
        return;
      }
      // Sync entity configs to the resolved list
      const newConfigs = new Map(this._entityConfigs);
      for (const id of resolved) {
        if (!newConfigs.has(id))
          newConfigs.set(id, defaultEntityConfig(this.prefillAnalysis));
      }
      for (const id of [...newConfigs.keys()]) {
        if (!resolved.includes(id)) newConfigs.delete(id);
      }
      this._entityIds = resolved;
      this._entityConfigs = newConfigs;
      this._activeEntityId = resolved[0] ?? "";
      this._error = "";
      this._step = 2;
    } else if (this._step === 2) {
      const v2 = validateStep2(this._entityIds, (id) =>
        this._getEntityConfig(id)
      );
      if (!v2.valid) {
        this._error = msg(v2.error!);
        return;
      }
      // Auto-populate name if blank
      if (!this._name) {
        const firstId = this._entityIds[0] ?? "";
        const baseName = firstId.split(".").pop() ?? firstId;
        this._name =
          this._entityIds.length > 1
            ? msg("Anomaly monitor")
            : `${baseName} ${msg("anomalies")}`;
      }
      this._error = "";
      this._step = 3;
    }
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  private _configPayload(entityId: string) {
    return buildConfigPayload(this._getEntityConfig(entityId));
  }

  private _extractErrorMessage(err: unknown): string {
    if (typeof err === "string" && err.trim()) {
      return err;
    }
    if (err instanceof Error && err.message.trim()) {
      return err.message;
    }
    if (typeof err === "object" && err !== null) {
      const nestedError = (err as { error?: { message?: unknown } }).error;
      if (
        nestedError &&
        typeof nestedError.message === "string" &&
        nestedError.message.trim()
      ) {
        return nestedError.message;
      }
      const directMessage = (err as { message?: unknown }).message;
      if (typeof directMessage === "string" && directMessage.trim()) {
        return directMessage;
      }
    }
    return msg("Unable to save anomaly monitor.");
  }

  private async _onSubmit() {
    if (!this.hass) return;
    if (!this._name.trim()) {
      this._error = msg("Name is required.");
      return;
    }

    this._saving = true;
    this._error = "";

    try {
      const saved: AnomalyMonitor[] = [];

      if (this.editMonitor) {
        // Edit: use active entity's config
        const cfgEntityId = this._activeEntityId || this._entityIds[0] || "";
        const result = await updateMonitor(this.hass, {
          monitor_id: this.editMonitor.id,
          name: this._name.trim(),
          look_back_hours: this._lookBackHours,
          scan_interval_minutes: this._scanIntervalMinutes,
          ...(this.editMonitor.type === "combined"
            ? { overlap_mode: this._overlapMode }
            : {}),
          ...this._configPayload(cfgEntityId),
        });
        saved.push(result);
      } else if (
        this._monitorType === "combined" ||
        this._entityIds.length === 1
      ) {
        // Single combined sensor (or one entity → always individual)
        const primaryId = this._entityIds[0] ?? "";
        const payload: CreateMonitorPayload = {
          monitor_type: this._entityIds.length > 1 ? "combined" : "individual",
          name: this._name.trim(),
          look_back_hours: this._lookBackHours,
          scan_interval_minutes: this._scanIntervalMinutes,
          ...this._configPayload(primaryId),
        };
        if (this._entityIds.length === 1) {
          payload.entity_id = this._entityIds[0];
        } else {
          payload.entity_ids = [...this._entityIds];
          payload.overlap_mode = this._overlapMode;
        }
        saved.push(await createMonitor(this.hass, payload));
      } else {
        // Individual monitors — one sensor per entity, each with its own config
        const results = await Promise.all(
          this._entityIds.map((entityId) => {
            const baseName = entityId.split(".").pop() ?? entityId;
            return createMonitor(this.hass!, {
              monitor_type: "individual",
              name: `${baseName} ${msg("anomalies")}`,
              entity_id: entityId,
              look_back_hours: this._lookBackHours,
              scan_interval_minutes: this._scanIntervalMinutes,
              ...this._configPayload(entityId),
            });
          })
        );
        saved.push(...results);
      }

      this._emit("dp-monitor-wizard-saved", { monitors: saved });
    } catch (err) {
      this._error = this._extractErrorMessage(err);
    } finally {
      this._saving = false;
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private _entityName(entityId: string): string {
    if (!this.hass) return entityId;
    return (
      (this.hass.states[entityId]?.attributes?.friendly_name as
        | string
        | undefined) ??
      entityId.split(".").pop() ??
      entityId
    );
  }

  /** Returns disambiguated labels for all current entity IDs. */
  private _entityDisplayNames(): Map<string, string> {
    return disambiguateEntityNames(this.hass, this._entityIds);
  }

  private _overlapOptions() {
    const n = this._entityIds.length;
    const opts: { value: string; label: string }[] = [];
    opts.push({
      value: "all",
      label:
        n <= 2
          ? msg("All anomalies overlap")
          : `${msg("All")} ${n} ${msg("anomalies overlap")}`,
    });
    if (n > 2) {
      for (let i = n - 1; i >= 2; i--) {
        opts.push({
          value: `any_${i}`,
          label: `${msg("Any")} ${i}+ ${msg("entities overlap")}`,
        });
      }
    }
    opts.push({ value: "any", label: msg("Any anomaly from any series") });
    return opts;
  }

  private _saveLabel(): string {
    if (this._saving) return msg("Saving…");
    if (this.editMonitor) return msg("Save changes");
    const count =
      this._monitorType === "combined" || this._entityIds.length <= 1
        ? 1
        : this._entityIds.length;
    return count === 1
      ? msg("Create anomaly monitor")
      : `${msg("Create")} ${count} ${msg("anomaly monitors")}`;
  }

  // -------------------------------------------------------------------------
  // Render: step indicator
  // -------------------------------------------------------------------------

  private _renderStepBar() {
    const isEdit = !!this.editMonitor;
    if (isEdit) {
      return html`
        <div class="step-bar">
          <span class=${`step${this._step === 2 ? " active" : ""}`}
            >1. ${msg("Analysis")}</span
          >
          <ha-icon icon="mdi:chevron-right" class="step-sep"></ha-icon>
          <span class=${`step${this._step === 3 ? " active" : ""}`}
            >2. ${msg("Schedule")}</span
          >
        </div>
      `;
    }
    return html`
      <div class="step-bar">
        <span class=${`step${this._step === 1 ? " active" : ""}`}
          >1. ${msg("Entities")}</span
        >
        <ha-icon icon="mdi:chevron-right" class="step-sep"></ha-icon>
        <span class=${`step${this._step === 2 ? " active" : ""}`}
          >2. ${msg("Analysis")}</span
        >
        <ha-icon icon="mdi:chevron-right" class="step-sep"></ha-icon>
        <span class=${`step${this._step === 3 ? " active" : ""}`}
          >3. ${msg("Schedule")}</span
        >
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // Render: step 1 — Entities
  // -------------------------------------------------------------------------

  private _renderStep1() {
    const selectedEntityIds = this._resolvedTargetEntityIds();
    const suggestions = this.suggestedEntityIds.filter(
      (id) => !selectedEntityIds.includes(id)
    );
    const hasUnaddedSeries = this.allSeriesEntityIds.some(
      (id) => !selectedEntityIds.includes(id)
    );
    const hasQuickAddOptions = suggestions.length > 0 || hasUnaddedSeries;
    return html`
      <div class="wizard-section">
        <ha-target-picker
          .hass=${this.hass}
          .value=${this._target}
          @value-changed=${this._onTargetChanged}
        ></ha-target-picker>
      </div>

      ${hasQuickAddOptions
        ? html`
            <div class="wizard-section">
              <p class="wizard-section-label">
                ${msg("Add from current chart")}
              </p>
              <div class="wizard-entity-chips">
                ${hasUnaddedSeries
                  ? html`
                      <button
                        class="quick-add-btn"
                        type="button"
                        @click=${this._addAllSeriesFromChart}
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                        <span>${msg("Add all series from chart")}</span>
                      </button>
                    `
                  : nothing}
                ${suggestions.map(
                  (id) => html`
                    <button
                      class="quick-add-btn"
                      type="button"
                      @click=${() => this._addSuggestedEntity(id)}
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                      <span>${this._entityName(id)}</span>
                    </button>
                  `
                )}
              </div>
            </div>
          `
        : nothing}
    `;
  }

  // -------------------------------------------------------------------------
  // Render: step 2 — Analysis (per entity)
  // -------------------------------------------------------------------------

  private _renderStep2() {
    const showTabs = this._entityIds.length > 1;
    const activeId = this._activeEntityId || this._entityIds[0] || "";
    const displayNames = this._entityDisplayNames();

    return html`
      ${showTabs
        ? html`
            <div class="entity-tabs">
              ${this._entityIds.map(
                (id) => html`
                  <button
                    class=${`entity-tab${id === activeId ? " active" : ""}`}
                    @click=${() => {
                      this._activeEntityId = id;
                    }}
                  >
                    ${displayNames.get(id) ?? this._entityName(id)}
                  </button>
                `
              )}
            </div>
          `
        : nothing}
      <div class=${showTabs ? "entity-tab-panel" : ""}>
        ${activeId ? this._renderEntityAnalysis(activeId) : nothing}
      </div>
    `;
  }

  private _renderEntityAnalysis(entityId: string) {
    const cfg = this._getEntityConfig(entityId);
    const analysis = this._entityConfigToAnalysis(cfg);

    return html`
      <analysis-sample-group
        .analysis=${analysis}
        entity-id=${entityId}
        @dp-group-analysis-change=${(e: Event) =>
          this._onAnalysisGroupChange(entityId, e)}
      ></analysis-sample-group>
      <analysis-anomaly-group
        .analysis=${analysis}
        entity-id=${entityId}
        .hass=${this.hass}
        .hideSaveMonitorCta=${true}
        @dp-group-analysis-change=${(e: Event) =>
          this._onAnalysisGroupChange(entityId, e)}
      ></analysis-anomaly-group>
    `;
  }

  // -------------------------------------------------------------------------
  // Render: step 3 — Schedule
  // -------------------------------------------------------------------------

  private _renderStep3() {
    const entityCount = this._entityIds.length;
    const isMulti = entityCount > 1;

    return html`
      ${!this.editMonitor
        ? html`
            <div class="wizard-notice wizard-notice-info">
              ${msg(
                "Creating a monitor adds a new device to the HASS Datapoints integration. Each device includes sensors and a switch that expose anomaly data and can be used in automations."
              )}
            </div>
          `
        : nothing}

      <div class="wizard-section">
        <ha-textfield
          label=${msg("Monitor name")}
          .value=${this._name}
          @input=${(e: Event) => {
            this._name = (e.target as HTMLInputElement).value;
          }}
        ></ha-textfield>
      </div>

      <div class="wizard-inline-row">
        <div class="wizard-field">
          <label class="field-label">${msg("Look-back period")}</label>
          <inline-select
            .value=${String(this._lookBackHours)}
            .options=${LOOK_BACK_OPTIONS.map((o) => ({
              value: String(o.value),
              label: msg(o.label),
            }))}
            @dp-select-change=${(e: Event) => {
              const val = (e as CustomEvent<{ value: string }>).detail?.value;
              if (val) this._lookBackHours = parseInt(val, 10);
            }}
          ></inline-select>
        </div>
        <div class="wizard-field">
          <label class="field-label">${msg("Scan interval")}</label>
          <inline-select
            .value=${String(this._scanIntervalMinutes)}
            .options=${SCAN_INTERVAL_OPTIONS.map((o) => ({
              value: String(o.value),
              label: msg(o.label),
            }))}
            @dp-select-change=${(e: Event) => {
              const val = (e as CustomEvent<{ value: string }>).detail?.value;
              if (val) this._scanIntervalMinutes = parseInt(val, 10);
            }}
          ></inline-select>
        </div>
      </div>

      ${isMulti && !this.editMonitor
        ? html`
            <div class="wizard-field">
              <label class="field-label">${msg("Sensor type")}</label>
              <inline-select
                .value=${this._monitorType}
                .options=${[
                  { value: "individual", label: msg("Individual sensors") },
                  { value: "combined", label: msg("Combined sensor") },
                ]}
                @dp-select-change=${(e: Event) => {
                  const val = (e as CustomEvent<{ value: string }>).detail
                    ?.value as MonitorType;
                  this._monitorType = val;
                  // Reset overlap mode to a sensible default when switching
                  if (val === "combined") this._overlapMode = "all";
                }}
              ></inline-select>
            </div>
          `
        : nothing}
      ${(isMulti || this.editMonitor?.type === "combined") &&
      (this._monitorType === "combined" ||
        this.editMonitor?.type === "combined")
        ? html`
            <div class="wizard-field">
              <label class="field-label">${msg("Overlap mode")}</label>
              <inline-select
                .value=${this._overlapMode}
                .options=${this._overlapOptions()}
                @dp-select-change=${(e: Event) => {
                  const val = (e as CustomEvent<{ value: string }>).detail
                    ?.value;
                  if (val) this._overlapMode = val;
                }}
              ></inline-select>
            </div>
          `
        : nothing}
    `;
  }

  // -------------------------------------------------------------------------
  // Render: root
  // -------------------------------------------------------------------------

  render() {
    const isEdit = !!this.editMonitor;
    const canGoBack =
      (this._step > 1 && !isEdit) || (this._step === 3 && isEdit);

    return html`
      <ha-dialog
        ?open=${this.open}
        hideActions
        .scrimClickAction=${"close"}
        .escapeKeyAction=${"close"}
        @closed=${this._onDialogClosed}
      >
        <span slot="heading">
          ${isEdit
            ? msg("Edit Anomaly Monitor")
            : msg("Create Anomaly Monitor")}
        </span>

        <div class="wizard-shell">
          <div class="wizard-header">${this._renderStepBar()}</div>
          <div class="wizard-content">
            ${this._step === 1 ? this._renderStep1() : nothing}
            ${this._step === 2 ? this._renderStep2() : nothing}
            ${this._step === 3 ? this._renderStep3() : nothing}
            ${this._error
              ? html`<div class="wizard-error">${this._error}</div>`
              : nothing}
          </div>
          <div class="dialog-actions">
            <ha-button @click=${this._onClose}>${msg("Cancel")}</ha-button>
            <span class="dialog-spacer"></span>
            ${canGoBack
              ? html`<ha-button @click=${this._onBack}
                  >${msg("Back")}</ha-button
                >`
              : nothing}
            ${this._step < 3
              ? html`<ha-button raised @click=${this._onNext}
                  >${msg("Next")}</ha-button
                >`
              : html`<ha-button
                  raised
                  .disabled=${this._saving}
                  @click=${this._onSubmit}
                  >${this._saveLabel()}</ha-button
                >`}
          </div>
        </div>
      </ha-dialog>
    `;
  }
}

customElements.define("anomaly-monitor-wizard", AnomalyMonitorWizard);

declare global {
  interface HTMLElementTagNameMap {
    "anomaly-monitor-wizard": AnomalyMonitorWizard;
  }
}
