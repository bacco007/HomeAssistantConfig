import { html, render } from "lit";
import { DOMAIN } from "@/constants";
import { confirmDestructiveAction } from "@/lib/ha/ha-components";
import type { HassLike } from "@/lib/types";
import { logger } from "@/lib/logger";
import { styles } from "./dev-tool.styles";
import type {
  ChangeItem,
  WindowConfig,
  WindowResult,
} from "@/cards/dev-tool/types";
import { HassRecordsDevToolCardEditor } from "./editor";
import "@/atoms/display/feedback-banner/feedback-banner";
import "@/cards/dev-tool/dev-tool-results/dev-tool-results";
import "@/cards/dev-tool/dev-tool-windows/dev-tool-windows";

export class HassRecordsDevToolCard extends HTMLElement {
  _config: RecordWithUnknownValues = {};

  _hass: Nullable<HassLike> = null;

  _rendered = false;

  _entities: string[] = [];

  _suppressEntityChange = false;

  _results: WindowResult[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config: RecordWithUnknownValues) {
    this._config = config || {};
  }

  set hass(hass: HassLike) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._refreshDevCount();
    }
    this._updateHassOnChildren();
  }

  _updateHassOnChildren() {
    if (!this.shadowRoot || !this._hass) {
      return;
    }

    const entityPicker = this.shadowRoot.getElementById(
      "entity-picker"
    ) as Nullable<HTMLElement & RecordWithUnknownValues>;
    if (!entityPicker) {
      return;
    }

    this._suppressEntityChange = true;
    entityPicker.hass = this._hass;
    entityPicker.value = this._entities;
    setTimeout(() => {
      this._suppressEntityChange = false;
    }, 100);

    const resultsEl = this.shadowRoot.getElementById(
      "results-container"
    ) as Nullable<HTMLElement & RecordWithUnknownValues>;
    if (resultsEl) {
      resultsEl.isAdmin = this._hass.user?.is_admin === true;
    }
  }

  _render() {
    this._rendered = true;
    const cfg = this._config;
    if (!this.shadowRoot!.adoptedStyleSheets.length) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(styles);
      this.shadowRoot!.adoptedStyleSheets = [sheet];
    }
    render(
      html`
        <ha-card>
          ${cfg.title
            ? html`<div class="card-header">${cfg.title as string}</div>`
            : ""}
          <div class="section-title">Analyze HA History</div>
          <div class="form-group">
            <ha-selector
              id="entity-picker"
              label="Entities to analyze"
            ></ha-selector>
          </div>
          <dev-tool-windows id="windows-editor"></dev-tool-windows>
          <div class="analyze-row">
            <ha-button id="analyze-btn" class="analyze-btn" raised
              >Analyze all windows</ha-button
            >
          </div>
          <feedback-banner id="analyze-status"></feedback-banner>
          <dev-tool-results id="results-container"></dev-tool-results>
          <hr class="divider" />
          <div class="dev-section">
            <div class="section-title">Dev Datapoints</div>
            <div class="dev-summary">
              <span class="dev-count-label"
                >Currently recorded:&nbsp;<span
                  class="dev-count-num"
                  id="dev-count"
                  >—</span
                >&nbsp;dev data point<span id="dev-count-plural">s</span></span
              >
            </div>
            <ha-button class="delete-btn" id="delete-dev-btn"
              >Delete all dev datapoints</ha-button
            >
            <feedback-banner id="delete-status"></feedback-banner>
          </div>
        </ha-card>
      `,
      this.shadowRoot!
    );

    const entityPicker = this.shadowRoot!.getElementById(
      "entity-picker"
    ) as Nullable<HTMLElement & RecordWithUnknownValues>;
    if (entityPicker) {
      entityPicker.selector = { entity: { multiple: true } };
      entityPicker.value = [];
      this._entities = [];
      this._suppressEntityChange = false;
      entityPicker.addEventListener("value-changed", (event: Event) => {
        if (this._suppressEntityChange) {
          return;
        }
        const value = (event as CustomEvent<{ value: unknown }>).detail.value;
        if (Array.isArray(value)) {
          this._entities = value as string[];
        } else if (value) {
          this._entities = [value as string];
        } else {
          this._entities = [];
        }
      });
    }

    this.shadowRoot!.getElementById("analyze-btn")!.addEventListener(
      "click",
      () => {
        this._analyzeHistory();
      }
    );
    this.shadowRoot!.getElementById("delete-dev-btn")!.addEventListener(
      "click",
      () => {
        this._deleteAllDev();
      }
    );
    this.shadowRoot!.getElementById("results-container")!.addEventListener(
      "dp-record-selected-request",
      (event: Event) => {
        const detail = (event as CustomEvent<{ items: ChangeItem[] }>).detail;
        this._recordSelected(detail.items);
      }
    );
  }

  _readWindowConfigs(): WindowConfig[] {
    const windowsEditor = this.shadowRoot!.getElementById(
      "windows-editor"
    ) as HTMLElement & {
      getWindowConfigs: () => WindowConfig[];
    };
    return windowsEditor.getWindowConfigs().map((windowConfig, index) => ({
      ...windowConfig,
      label: windowConfig.label.trim() || `Window ${index + 1}`,
    }));
  }

  async _analyzeHistory() {
    if (!this._entities.length) {
      this._showFeedback(
        "analyze-status",
        "err",
        "Please select at least one entity."
      );
      return;
    }

    const windowConfigs = this._readWindowConfigs();
    const button = this.shadowRoot!.getElementById(
      "analyze-btn"
    ) as HTMLButtonElement;
    button.disabled = true;
    this._results = [];
    this._showFeedback(
      "analyze-status",
      "ok",
      `Fetching history for ${windowConfigs.length} window${windowConfigs.length === 1 ? "" : "s"}…`
    );

    try {
      const now = new Date();
      this._results = await Promise.all(
        windowConfigs.map(async (windowConfig) => {
          const start = windowConfig.startDt
            ? new Date(windowConfig.startDt)
            : now;
          const end = windowConfig.endDt ? new Date(windowConfig.endDt) : now;
          const raw = await this._hass!.connection.sendMessagePromise({
            type: "history/history_during_period",
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            entity_ids: this._entities,
            include_start_time_state: false,
            significant_changes_only: false,
            no_attributes: false,
          });
          const changes = this._detectChanges(
            (raw as RecordWithUnknownValues) || {}
          );
          return {
            id: windowConfig.id,
            label: windowConfig.label,
            startDt: windowConfig.startDt,
            endDt: windowConfig.endDt,
            changes,
            selected: changes.map((_, index) => index),
          };
        })
      );
      this._renderResults();
      this._hideFeedback("analyze-status");
    } catch (err) {
      this._showFeedback(
        "analyze-status",
        "err",
        `Error: ${(err as Error).message || "Failed to fetch history"}`
      );
      logger.error("[hass-datapoints dev-tool]", err);
    }

    button.disabled = false;
  }

  _detectChanges(histResult: RecordWithUnknownValues): ChangeItem[] {
    const changes: ChangeItem[] = [];

    for (const [entityId, statesRaw] of Object.entries(histResult)) {
      const states = statesRaw as Array<RecordWithUnknownValues>;
      if (!states?.length) {
        continue;
      }

      const domain = entityId.split(".")[0];
      const entityState = this._hass?.states?.[entityId];
      const deviceClass =
        (entityState?.attributes?.device_class as string | undefined) || "";
      const friendlyName =
        (entityState?.attributes?.friendly_name as string | undefined) ||
        entityId;
      const unit =
        (entityState?.attributes?.unit_of_measurement as string | undefined) ||
        "";

      for (let i = 0; i < states.length; i += 1) {
        const state = states[i];
        const previous = i > 0 ? states[i - 1] : null;
        const currentValue = state.s as string;
        const previousValue = (previous?.s as string | undefined) ?? null;

        if (currentValue === "unavailable" || currentValue === "unknown") {
          continue;
        }

        if (previous && previousValue === currentValue) {
          if (domain !== "climate") {
            continue;
          }
        }

        const timestampRaw = (state.lc ?? state.lu) as number | undefined;
        const timestamp =
          timestampRaw != null
            ? new Date(timestampRaw * 1000).toISOString()
            : new Date().toISOString();

        let message: Nullable<string>;
        let icon: string;
        let color: string;

        if (domain === "binary_sensor" || domain === "input_boolean") {
          message = `${friendlyName}: ${this._binaryLabel(deviceClass, currentValue)}`;
          icon =
            currentValue === "on"
              ? "mdi:toggle-switch"
              : "mdi:toggle-switch-off";
          color = currentValue === "on" ? "#4caf50" : "#9e9e9e";
        } else if (domain === "switch") {
          message = `${friendlyName}: turned ${currentValue === "on" ? "on" : "off"}`;
          icon =
            currentValue === "on" ? "mdi:power-plug" : "mdi:power-plug-off";
          color = currentValue === "on" ? "#ff9800" : "#9e9e9e";
        } else if (domain === "light") {
          message = `${friendlyName}: ${currentValue === "on" ? "on" : "off"}`;
          icon = currentValue === "on" ? "mdi:lightbulb" : "mdi:lightbulb-off";
          color = currentValue === "on" ? "#ffee58" : "#9e9e9e";
        } else if (domain === "cover") {
          const labels: RecordWithStringValues = {
            open: "opened",
            closed: "closed",
            opening: "opening",
            closing: "closing",
          };
          if (!labels[currentValue]) {
            continue;
          }
          message = `${friendlyName}: ${labels[currentValue]}`;
          icon =
            currentValue === "open" || currentValue === "opening"
              ? "mdi:garage-open"
              : "mdi:garage";
          color = currentValue === "open" ? "#4caf50" : "#795548";
        } else if (domain === "climate") {
          const stateAttributes = state.a as
            | RecordWithUnknownValues
            | undefined;
          const previousAttributes = previous?.a as
            | RecordWithUnknownValues
            | undefined;
          const currentTemperature = stateAttributes?.temperature;
          const previousTemperature = previousAttributes?.temperature;
          if (
            currentTemperature != null &&
            currentTemperature !== previousTemperature
          ) {
            const temperatureUnit =
              (stateAttributes?.temperature_unit as string | undefined) ||
              unit ||
              "°";
            message = `${friendlyName}: setpoint → ${currentTemperature}${temperatureUnit}`;
            icon = "mdi:thermostat";
            color = "#ff5722";
          } else if (!previous || previousValue !== currentValue) {
            const modes: RecordWithStringValues = {
              heat: "heating",
              cool: "cooling",
              auto: "auto",
              off: "off",
              heat_cool: "heat/cool",
              fan_only: "fan only",
              dry: "dry",
            };
            message = `${friendlyName}: mode → ${modes[currentValue] || currentValue}`;
            icon = "mdi:thermostat";
            color = "#ff5722";
          } else {
            continue;
          }
        } else if (domain === "sensor") {
          const currentNumber = parseFloat(currentValue);
          const previousNumber =
            previousValue != null ? parseFloat(previousValue) : Number.NaN;
          if (Number.isNaN(currentNumber)) {
            continue;
          }
          if (
            !Number.isNaN(previousNumber) &&
            Math.abs(currentNumber - previousNumber) < 0.5
          ) {
            continue;
          }
          message = `${friendlyName}: ${currentValue}${unit}`;
          icon = "mdi:gauge";
          color = "#2196f3";
        } else if (domain === "input_number" || domain === "number") {
          const currentNumber = parseFloat(currentValue);
          const previousNumber =
            previousValue != null ? parseFloat(previousValue) : Number.NaN;
          if (Number.isNaN(currentNumber)) {
            continue;
          }
          if (
            !Number.isNaN(previousNumber) &&
            currentNumber === previousNumber
          ) {
            continue;
          }
          message = `${friendlyName}: → ${currentValue}${unit}`;
          icon = "mdi:numeric";
          color = "#9c27b0";
        } else if (domain === "input_select" || domain === "select") {
          if (!previous || previousValue === currentValue) {
            continue;
          }
          message = `${friendlyName}: → ${currentValue}`;
          icon = "mdi:form-select";
          color = "#009688";
        } else {
          if (!previous || previousValue === currentValue) {
            continue;
          }
          message = `${friendlyName}: ${previousValue} → ${currentValue}`;
          icon = "mdi:swap-horizontal";
          color = "#607d8b";
        }

        if (!message) {
          continue;
        }

        changes.push({
          timestamp,
          message,
          entity_id: entityId,
          icon,
          color,
        });
      }
    }

    changes.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));

    return changes;
  }

  _binaryLabel(deviceClass: string, state: string): string {
    const on = state === "on";
    const map: Record<string, [string, string]> = {
      door: ["opened", "closed"],
      window: ["opened", "closed"],
      garage_door: ["opened", "closed"],
      opening: ["opened", "closed"],
      lock: ["locked", "unlocked"],
      motion: ["motion detected", "motion cleared"],
      occupancy: ["occupied", "vacant"],
      presence: ["home", "away"],
      vibration: ["vibrating", "still"],
      plug: ["plugged in", "unplugged"],
      outlet: ["on", "off"],
      smoke: ["smoke detected", "smoke cleared"],
      moisture: ["wet", "dry"],
      running: ["running", "stopped"],
      connectivity: ["connected", "disconnected"],
      power: ["on", "off"],
      battery_charging: ["charging", "not charging"],
      battery: ["low battery", "battery normal"],
      cold: ["cold", "temperature normal"],
      heat: ["heat", "temperature normal"],
      light: ["light detected", "dark"],
      sound: ["sound detected", "quiet"],
    };
    const pair = map[deviceClass];
    if (pair) {
      return on ? pair[0] : pair[1];
    }
    return on ? "on" : "off";
  }

  _renderResults() {
    const resultsContainer = this.shadowRoot!.getElementById(
      "results-container"
    ) as HTMLElement & {
      results: WindowResult[];
      statusKind: string;
      statusText: string;
      statusVisible: boolean;
    };
    resultsContainer.results = [...this._results];
    resultsContainer.statusKind = "";
    resultsContainer.statusText = "";
    resultsContainer.statusVisible = false;
  }

  async _recordSelected(items: ChangeItem[]) {
    if (!items.length) {
      this._showResultsStatus("err", "No items selected.");
      return;
    }

    this._showResultsStatus(
      "ok",
      `Recording ${items.length} data point${items.length === 1 ? "" : "s"}…`
    );
    const results = await Promise.allSettled(
      items.map((item) =>
        this._hass!.callService(DOMAIN as string, "record", {
          message: item.message,
          entity_ids: [item.entity_id],
          icon: item.icon,
          color: item.color,
          date: item.timestamp,
          dev: true,
        })
      )
    );
    const ok = results.filter((result) => result.status === "fulfilled").length;
    const fail = results.filter(
      (result) => result.status === "rejected"
    ).length;
    if (fail) {
      this._showResultsStatus("err", `Recorded ${ok}, failed ${fail}.`);
    } else {
      this._showResultsStatus(
        "ok",
        `Recorded ${ok} dev data point${ok === 1 ? "" : "s"}!`
      );
    }
    await this._refreshDevCount();
    window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
  }

  async _deleteAllDev() {
    const devCountEl = this.shadowRoot!.getElementById("dev-count");
    const count = parseInt(devCountEl?.textContent ?? "0", 10) || 0;
    if (count === 0) {
      this._showFeedback(
        "delete-status",
        "err",
        "No dev datapoints to delete."
      );
      return;
    }

    const confirmed = await confirmDestructiveAction(this, {
      title: "Delete dev datapoints",
      message: `Delete all ${count} dev data point${count === 1 ? "" : "s"}?`,
      confirmLabel: "Delete all",
    });
    if (!confirmed) {
      return;
    }

    const button = this.shadowRoot!.getElementById(
      "delete-dev-btn"
    ) as HTMLButtonElement;
    button.disabled = true;
    try {
      const result = (await this._hass!.connection.sendMessagePromise({
        type: `${DOMAIN}/events/delete_dev`,
      })) as RecordWithUnknownValues;
      const deleted = result.deleted as number;
      this._showFeedback(
        "delete-status",
        "ok",
        `Deleted ${deleted} dev data point${deleted === 1 ? "" : "s"}.`
      );
      await this._refreshDevCount();
      window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
    } catch (err) {
      this._showFeedback(
        "delete-status",
        "err",
        `Error: ${(err as Error).message || "failed"}`
      );
    }
    button.disabled = false;
  }

  async _refreshDevCount() {
    try {
      const result = (await this._hass!.connection.sendMessagePromise({
        type: `${DOMAIN}/events`,
      })) as RecordWithUnknownValues;
      const events = (result.events as Array<RecordWithUnknownValues>) || [];
      const count = events.filter((event) => event.dev).length;
      const countEl = this.shadowRoot!.getElementById("dev-count");
      const pluralEl = this.shadowRoot!.getElementById("dev-count-plural");
      if (countEl) {
        countEl.textContent = String(count);
      }
      if (pluralEl) {
        pluralEl.textContent = count === 1 ? "" : "s";
      }
    } catch (error) {
      logger.warn("[hass-datapoints dev-tool] refresh dev count failed", error);
    }
  }

  _showFeedback(id: string, kind: "ok" | "err", text: string) {
    const el = this.shadowRoot!.getElementById(id) as HTMLElement & {
      kind: string;
      text: string;
      visible: boolean;
    };
    if (!el) {
      return;
    }
    el.kind = kind;
    el.text = text;
    el.visible = true;
  }

  _hideFeedback(id: string) {
    const el = this.shadowRoot!.getElementById(id) as HTMLElement & {
      visible: boolean;
    };
    if (!el) {
      return;
    }
    el.visible = false;
  }

  _showResultsStatus(kind: "ok" | "err", text: string) {
    const el = this.shadowRoot!.getElementById(
      "results-container"
    ) as HTMLElement & {
      statusKind: string;
      statusText: string;
      statusVisible: boolean;
    };
    el.statusKind = kind;
    el.statusText = text;
    el.statusVisible = true;
  }

  static getStubConfig() {
    return { title: "Dev Tool" };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("hass-datapoints-dev-tool-card-editor");
  }
}

export { HassRecordsDevToolCardEditor };
