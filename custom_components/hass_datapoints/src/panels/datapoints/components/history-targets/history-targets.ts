import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./history-targets.styles";
import { entityName } from "@/lib/ha/entity-name";
import type { HassLike, HassState } from "@/lib/types";
import "@/molecules/target-row-list/target-row-list";

/**
 * `history-targets` renders the sidebar targets section for the Datapoints panel.
 *
 * It displays the target row list, target entity picker, collapsed sidebar summary
 * (collapsed icon buttons per entity), and the preferences button that appears when
 * the sidebar is collapsed.
 *
 * ## Events from target rows (bubbled through from `target-row-list`):
 * @fires dp-row-color-change        — `{ index, color }`
 * @fires dp-row-visibility-change   — `{ entityId, visible }`
 * @fires dp-row-remove              — `{ index }`
 * @fires dp-row-toggle-analysis     — `{ entityId }`
 * @fires dp-row-analysis-change     — `{ entityId, key, value }`
 * @fires dp-row-copy-analysis-to-all — `{ entityId, analysis }`
 * @fires dp-rows-reorder            — `{ rows }`
 *
 * ## Events from this component:
 * @fires dp-targets-add             — `{ entityIds: string[] }` when entity picker value changes
 * @fires dp-targets-add-click       — `{}` when the collapsed add button is clicked
 * @fires dp-targets-prefs-click     — `{}` when the collapsed preferences button is clicked
 * @fires dp-collapsed-entity-click  — `{ entityId: string, buttonEl: HTMLElement }` when a collapsed summary icon is clicked
 */
@localized()
export class HistoryTargets extends LitElement {
  static styles = styles;

  /** Series row descriptors to display. */
  @property({ type: Array }) accessor rows: Array<{
    entity_id: string;
    color: string;
    visible?: boolean;
    analysis?: unknown;
  }> = [];

  /** HA states map — passed to the target row list for icon/label resolution. */
  @property({ type: Object }) accessor states: Record<string, HassState> = {};

  /** HA connection object — passed to sub-elements. */
  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  /** Available comparison windows for delta analysis. */
  @property({ type: Array }) accessor comparisonWindows: unknown[] = [];

  /** Whether the delta analysis option should be offered in row analysis panels. */
  @property({ type: Boolean, attribute: "can-show-delta-analysis" })
  accessor canShowDeltaAnalysis: boolean = false;

  /** When true, the sidebar is collapsed — show icon summary instead of full list. */
  @property({ type: Boolean, attribute: "sidebar-collapsed", reflect: true })
  accessor sidebarCollapsed: boolean = false;

  @state() accessor _collapsedSummaryKey: string = "";

  // ── Private helpers ────────────────────────────────────────────────────────

  private _emit(name: string, detail: RecordWithUnknownValues = {}): void {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true })
    );
  }

  /** Returns the `target-row-list` element for direct property access by the parent. */
  getRowListEl(): Nullable<HTMLElement & RecordWithUnknownValues> {
    return (
      this.shadowRoot?.querySelector<HTMLElement & RecordWithUnknownValues>(
        "target-row-list"
      ) ?? null
    );
  }

  /** Returns the `ha-target-picker` element for direct property access by the parent. */
  getTargetPickerEl(): Nullable<HTMLElement & RecordWithUnknownValues> {
    return (
      this.shadowRoot?.querySelector<HTMLElement & RecordWithUnknownValues>(
        "ha-target-picker"
      ) ?? null
    );
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _onPrefsClick(ev: Event): void {
    ev.stopPropagation();
    this._emit("dp-targets-prefs-click");
  }

  private _onAddTargetClick(ev: Event): void {
    ev.stopPropagation();
    this._emit("dp-targets-add-click", {
      buttonEl: ev.currentTarget,
    });
  }

  private _onCollapsedEntityClick(ev: Event, entityId: string): void {
    ev.stopPropagation();
    this._emit("dp-collapsed-entity-click", {
      entityId,
      buttonEl: ev.currentTarget,
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  private _renderCollapsedSummary() {
    if (!this.rows.length) {
      return nothing;
    }
    return this.rows.map((row) => {
      const label =
        entityName(this.hass as never, row.entity_id) || row.entity_id;
      return html`
        <button
          type="button"
          class="history-targets-collapsed-item ${row.visible === false
            ? "is-hidden"
            : ""}"
          data-entity-id=${row.entity_id}
          style="--row-color:${row.color}"
          aria-label=${label}
          aria-pressed=${row.visible === false ? "false" : "true"}
          @click=${(ev: Event) =>
            this._onCollapsedEntityClick(ev, row.entity_id)}
        >
          <ha-state-icon
            .stateObj=${(
              this.hass?.states as RecordWithUnknownValues | undefined
            )?.[row.entity_id]}
            .hass=${this.hass}
            aria-hidden="true"
          ></ha-state-icon>
        </button>
      `;
    });
  }

  render() {
    return html`
      <div class="history-targets${this.sidebarCollapsed && " collapsed"}">
        <div class="sidebar-section-header history-targets-header">
          <div class="sidebar-section-title">${msg("Targets")}</div>
          <div class="sidebar-section-subtitle">
            ${msg("Each row controls one chart series.")}
          </div>
        </div>

        <div class="history-target-rows">
          <target-row-list
            .rows=${this.rows}
            .states=${this.states}
            .hass=${this.hass}
            .canShowDeltaAnalysis=${this.canShowDeltaAnalysis}
            .comparisonWindows=${this.comparisonWindows}
          ></target-row-list>
        </div>

        <div class="history-target-picker-slot">
          <slot name="picker"> ${nothing} </slot>
        </div>

        <div class="history-targets-collapsed-summary">
          ${this._renderCollapsedSummary()}
        </div>

        <div class="history-targets-collapsed-add-container">
          <button
            class="history-targets-collapsed-add"
            aria-label=${msg("Add target")}
            title=${msg("Add target")}
            @click=${this._onAddTargetClick}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>

        <div class="history-targets-collapsed-preferences-container">
          <button
            class="history-targets-collapsed-preferences"
            aria-label=${msg("Chart preferences")}
            title=${msg("Chart preferences")}
            @click=${this._onPrefsClick}
          >
            <ha-icon icon="mdi:tune-variant"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("history-targets", HistoryTargets);

declare global {
  interface HTMLElementTagNameMap {
    "history-targets": HistoryTargets;
  }
}
