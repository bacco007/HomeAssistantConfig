import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { localized } from "@/lib/i18n/localize";

import { styles } from "./target-row-list.styles";
import type { HassLike, HassState } from "@/lib/types";
import type {
  ComparisonWindow,
  NormalizedAnalysis,
} from "@/molecules/target-row/target-row";
import "@/molecules/target-row/target-row";

// ---------------------------------------------------------------------------
// Window-clamping helpers: when the sample interval changes, auto-adjust any
// time-window settings that are smaller than the new interval (such a window
// would contain zero data points and produce meaningless results).
// ---------------------------------------------------------------------------

const _DURATION_SECONDS: RecordWithNumericValues = {
  raw: 0,
  "5s": 5,
  "10s": 10,
  "15s": 15,
  "30s": 30,
  "1m": 60,
  "2m": 120,
  "5m": 300,
  "10m": 600,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "2h": 7200,
  "3h": 10800,
  "4h": 14400,
  "6h": 21600,
  "12h": 43200,
  "24h": 86400,
  "7d": 604800,
  "14d": 1209600,
  "21d": 1814400,
  "28d": 2419200,
};

// For each analysis window key: the valid option values in ascending duration order.
// "point_to_point" is always valid so it is excluded (never needs clamping).
const _WINDOW_OPTIONS: Record<string, string[]> = {
  trend_window: ["1h", "6h", "24h", "7d", "14d", "21d", "28d"],
  rate_window: ["1h", "6h", "24h"],
  anomaly_rate_window: ["1h", "6h", "24h"],
  anomaly_zscore_window: ["1h", "6h", "24h", "7d"],
  anomaly_persistence_window: ["30m", "1h", "3h", "6h", "12h", "24h"],
};

function _clampWindowsToInterval(
  analysis: NormalizedAnalysis,
  newInterval: string
): Partial<NormalizedAnalysis> {
  const intervalSecs = _DURATION_SECONDS[newInterval] ?? 0;
  if (intervalSecs === 0) return {}; // "raw" — no constraint
  const updates: Partial<NormalizedAnalysis> = {};
  for (const [key, options] of Object.entries(_WINDOW_OPTIONS)) {
    const current = (analysis as unknown as RecordWithUnknownValues)[key] as
      | string
      | undefined;
    if (!current || current === "point_to_point") continue;
    const currentSecs = _DURATION_SECONDS[current] ?? 0;
    if (currentSecs < intervalSecs) {
      const next = options.find(
        (opt) => (_DURATION_SECONDS[opt] ?? 0) >= intervalSecs
      );
      if (next) {
        (updates as unknown as RecordWithUnknownValues)[key] = next;
      }
    }
  }
  return updates;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RowConfig {
  entity_id: string;
  color: string;
  visible: boolean;
  analysis: NormalizedAnalysis;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `target-row-list` renders an ordered list of `target-row` components
 * with drag-to-reorder support.
 *
 * @fires dp-rows-reorder - `{ rows: RowConfig[] }` The updated rows array after a drag-drop reorder.
 * @fires dp-row-color-change - Bubbled from child `target-row`. `{ index, color }`
 * @fires dp-row-visibility-change - Bubbled from child `target-row`. `{ entityId, visible }`
 * @fires dp-row-toggle-analysis - Bubbled from child `target-row`. `{ entityId }`
 * @fires dp-row-remove - Bubbled from child `target-row`. `{ index }`
 * @fires dp-row-analysis-change - Bubbled from child `target-row`. `{ entityId, key, value }`
 * @fires dp-row-copy-analysis-to-all - Bubbled from child `target-row`. `{ entityId, analysis }`
 */
@localized()
export class TargetRowList extends LitElement {
  @property({ type: Array }) accessor rows: RowConfig[] = [];

  /** HA entity states map (entity_id → state object). Passed directly to each `target-row`. */
  @property({ type: Object, attribute: false }) accessor states: Record<
    string,
    HassState
  > = {};

  /** HA hass object. Required by ha-state-icon inside target-row to resolve entity icons. */
  @property({ type: Object, attribute: false })
  accessor hass: Nullable<HassLike> = null;

  @property({ type: Boolean, attribute: "can-show-delta-analysis" })
  accessor canShowDeltaAnalysis: boolean = false;

  @property({ type: Array, attribute: false })
  accessor comparisonWindows: ComparisonWindow[] = [];

  /** Set of entity IDs currently being analysed in the worker. */
  @property({ type: Object, attribute: false })
  accessor computingEntityIds: Set<string> = new Set();

  /** Current analysis progress percentage (0–100) shared across all computing rows. */
  @property({ type: Number, attribute: false })
  accessor analysisProgress: number = 0;

  /** Map of entityId → Set of anomaly method names that are still in-flight in the worker. */
  @property({ type: Object, attribute: false })
  accessor computingMethodsByEntity: Map<string, Set<string>> = new Map();

  /** Index of the row currently being dragged, or null when not dragging. */
  private _dragSourceIndex: Nullable<number> = null;

  static styles = styles;

  /**
   * Optimistically toggle the expanded state of a row's analysis panel
   * immediately (before the panel's round-trip mutation arrives). This gives
   * instant visual feedback with no perceived delay.
   */
  private _onToggleAnalysisFast = (e: CustomEvent) => {
    const entityId = String(e?.detail?.entityId || "").trim();
    if (!entityId) {
      return;
    }
    const index = this.rows?.findIndex((r) => r.entity_id === entityId) ?? -1;
    if (index === -1) {
      return;
    }
    this.rows = this.rows.map((row, i) => {
      if (i !== index) {
        return row;
      }
      return {
        ...row,
        analysis: {
          ...row.analysis,
          expanded: !row.analysis?.expanded,
        },
      };
    });
  };

  /**
   * Optimistically apply analysis option changes immediately so sub-option
   * groups (e.g. method-specific windows) appear without waiting for the
   * panel round-trip. Handles both plain key/value changes and the special
   * `anomaly_method_toggle_*` keys used by the anomaly group.
   */
  private _onRowAnalysisChangeFast = (e: CustomEvent) => {
    const { entityId, key, value } = (e.detail || {}) as {
      entityId?: string;
      key?: string;
      value?: unknown;
    };
    if (!entityId || !key) {
      return;
    }
    const index = this.rows?.findIndex((r) => r.entity_id === entityId) ?? -1;
    if (index === -1) {
      return;
    }

    const row = this.rows[index];
    const currentAnalysis = row.analysis || ({} as NormalizedAnalysis);
    let nextAnalysis: NormalizedAnalysis;

    if (key.startsWith("anomaly_method_toggle_")) {
      const method = key.slice("anomaly_method_toggle_".length);
      const currentMethods = Array.isArray(currentAnalysis.anomaly_methods)
        ? currentAnalysis.anomaly_methods
        : [];
      const nextMethods =
        value === true
          ? [...new Set([...currentMethods, method])]
          : currentMethods.filter((m: string) => m !== method);
      nextAnalysis = { ...currentAnalysis, anomaly_methods: nextMethods };
    } else if (key === "sample_interval" && typeof value === "string") {
      const windowUpdates = _clampWindowsToInterval(currentAnalysis, value);
      nextAnalysis = { ...currentAnalysis, [key]: value, ...windowUpdates };
    } else {
      nextAnalysis = { ...currentAnalysis, [key]: value };
    }

    this.rows = this.rows.map((r, i) =>
      i === index ? { ...r, analysis: nextAnalysis } : r
    );
  };

  render() {
    if (!this.rows.length) {
      return html``;
    }

    const firstAnalysis = JSON.stringify(this.rows[0]?.analysis ?? {});
    const allAnalysisSame = this.rows.every(
      (r) => JSON.stringify(r.analysis ?? {}) === firstAnalysis
    );

    return html`
      <div class="history-target-table">
        <div
          class="history-target-table-body"
          @dragover=${this._onDragOver}
          @dragleave=${this._onDragLeave}
          @drop=${this._onDrop}
          @dp-row-toggle-analysis=${this._onToggleAnalysisFast}
          @dp-row-analysis-change=${this._onRowAnalysisChangeFast}
        >
          ${this.rows.map(
            (row, index) => html`
              <target-row
                draggable="true"
                .color=${row.color}
                .visible=${row.visible}
                .analysis=${row.analysis}
                .index=${index}
                entity-id=${row.entity_id}
                .canShowDeltaAnalysis=${this.canShowDeltaAnalysis}
                .stateObj=${this.states?.[row.entity_id] ?? null}
                .hass=${this.hass ?? null}
                .comparisonWindows=${this.comparisonWindows}
                .computing=${this.computingEntityIds?.has(row.entity_id) ??
                false}
                .computingProgress=${this.analysisProgress ?? 0}
                .computingMethods=${this.computingMethodsByEntity?.get(
                  row.entity_id
                ) ?? new Set()}
                .rowCount=${this.rows.length}
                .allAnalysisSame=${allAnalysisSame}
                data-row-index=${index}
                @dragstart=${(e: DragEvent) => this._onDragStart(e, index)}
                @dragend=${this._onDragEnd}
              ></target-row>
            `
          )}
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Drag-to-reorder handlers
  // ---------------------------------------------------------------------------

  private _onDragStart(e: DragEvent, index: number) {
    this._dragSourceIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      // Always use the full row as the drag ghost, regardless of which child
      // element (e.g. the drag handle) initiated the drag.
      const rowEl = e.currentTarget as HTMLElement;
      const rect = rowEl.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        rowEl,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
    const target = e.currentTarget as HTMLElement;
    // Delay so the drag ghost captures the non-dimmed appearance.
    setTimeout(() => target.classList.add("is-dragging"), 0);
    // Inject a stylesheet to force the grabbing cursor globally during drag.
    // Setting body.style.cursor alone is not reliable — browsers control the
    // drag cursor at the OS level and CSS cursor has no effect without !important.
    this._ensureDragCursorStyle();
  }

  private _ensureDragCursorStyle() {
    const doc = this.ownerDocument;
    if (!doc.getElementById("dp-drag-cursor-style")) {
      const style = doc.createElement("style");
      style.id = "dp-drag-cursor-style";
      style.textContent =
        "*, *::before, *::after { cursor: grabbing !important; }";
      doc.head.appendChild(style);
    }
  }

  private _removeDragCursorStyle() {
    this.ownerDocument.getElementById("dp-drag-cursor-style")?.remove();
  }

  private _onDragEnd = (e: DragEvent) => {
    this._dragSourceIndex = null;
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("is-dragging");
    this._clearDropIndicators();
    this._removeDragCursorStyle();
  };

  private _onDragOver(e: DragEvent) {
    if (this._dragSourceIndex === null) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

    const rowEl = this._rowFromEvent(e);
    if (!rowEl) return;

    const rect = rowEl.getBoundingClientRect();
    const isAbove = e.clientY < rect.top + rect.height / 2;
    this._clearDropIndicators();
    rowEl.classList.add(isAbove ? "is-drag-over-before" : "is-drag-over-after");
  }

  private _onDragLeave(e: DragEvent) {
    const rowEl = this._rowFromEvent(e);
    if (rowEl && !rowEl.contains(e.relatedTarget as Node)) {
      rowEl.classList.remove("is-drag-over-before", "is-drag-over-after");
    }
  }

  private _onDrop(e: DragEvent) {
    e.preventDefault();
    // Prefer the in-memory tracked index; fall back to dataTransfer for cross-window drags.
    const fromIndex =
      this._dragSourceIndex ??
      parseInt(e.dataTransfer?.getData("text/plain") ?? "", 10);
    const rowEl = this._rowFromEvent(e);
    if (!rowEl || !Number.isFinite(fromIndex)) return;

    const toIndexRaw = parseInt(
      (rowEl as HTMLElement).dataset.rowIndex ?? "",
      10
    );
    if (!Number.isFinite(toIndexRaw)) return;

    const rect = rowEl.getBoundingClientRect();
    const isAbove = e.clientY < rect.top + rect.height / 2;
    const insertBeforeIndex = isAbove ? toIndexRaw : toIndexRaw + 1;
    const toIndex =
      fromIndex < insertBeforeIndex ? insertBeforeIndex - 1 : insertBeforeIndex;

    rowEl.classList.remove("is-drag-over-before", "is-drag-over-after");

    if (fromIndex !== toIndex) {
      const newRows = [...this.rows];
      const [moved] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, moved);
      this.dispatchEvent(
        new CustomEvent("dp-rows-reorder", {
          detail: { rows: newRows },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Walk the composed event path to find the nearest target-row element. */
  private _rowFromEvent(e: DragEvent): Nullable<Element> {
    for (const node of e.composedPath()) {
      if (
        node instanceof Element &&
        node.tagName?.toLowerCase() === "target-row"
      ) {
        return node;
      }
    }
    return null;
  }

  private _clearDropIndicators() {
    this.shadowRoot?.querySelectorAll("target-row").forEach((r) => {
      r.classList.remove("is-drag-over-before", "is-drag-over-after");
    });
  }
}

customElements.define("target-row-list", TargetRowList);
