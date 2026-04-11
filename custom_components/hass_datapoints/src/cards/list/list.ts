import { html, LitElement } from "lit";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./list.styles";
import { DOMAIN } from "@/constants";
import { resolveEntityIdsFromTarget } from "@/lib/domain/target-selection";
import { navigateToDataPointsHistory } from "@/lib/ha/navigation";
import { confirmDestructiveAction } from "@/lib/ha/ha-components";
import { deleteEvent, fetchEvents, updateEvent } from "@/lib/data/events-api";
import type { CardConfig, HassLike } from "@/lib/types";
import type {
  EditSaveDetail,
  EventItemContext,
  EventRecordFull,
} from "@/cards/list/types";
import "@/atoms/interactive/search-bar/search-bar";
import "@/atoms/interactive/pagination/pagination";
import "@/cards/list/list-event-item/list-event-item";
import { logger } from "@/lib/logger";

/**
 * hass-datapoints-list-card – Activity-style datagrid with search, pagination, edit/delete.
 */
@localized()
export class HassRecordsListCard extends LitElement {
  static properties = {
    _config: { state: true },
    _hass: { state: true },
    _allEvents: { state: true },
    _searchQuery: { state: true },
    _page: { state: true },
    _editingId: { state: true },
    _editColor: { state: true },
  };

  declare _config: CardConfig;

  declare _hass: Nullable<HassLike>;

  declare _allEvents: EventRecordFull[];

  declare _searchQuery: string;

  declare _page: number;

  declare _editingId: Nullable<string>;

  declare _editColor: string;

  private _pageSize = 15;

  private _configKey = "";

  private _unsubscribe: NullableCleanup = null;

  private _windowListener: NullableCleanup = null;

  private _initialized = false;

  static styles = styles;

  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._allEvents = [];
    this._searchQuery = "";
    this._page = 0;
    this._editingId = null;
    this._editColor = "#03a9f4";
  }

  setConfig(config: CardConfig) {
    const nextKey = JSON.stringify(config);
    if (this._configKey === nextKey) {
      return;
    }
    this._configKey = nextKey;
    this._config = config || {};
    if (config.page_size) this._pageSize = config.page_size as number;
    if (this._hass) this._load();
  }

  set hass(hass: HassLike) {
    const isFirst = !this._hass;
    this._hass = hass;
    if (isFirst) {
      this._load();
      this._setupAutoRefresh();
    }
  }

  get hass(): Nullable<HassLike> {
    return this._hass;
  }

  connectedCallback() {
    super.connectedCallback();
    this._windowListener = () => this._load();
    window.addEventListener(
      "hass-datapoints-event-recorded",
      this._windowListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    if (this._windowListener) {
      window.removeEventListener(
        "hass-datapoints-event-recorded",
        this._windowListener
      );
      this._windowListener = null;
    }
  }

  private _setupAutoRefresh() {
    if (!this._hass) return;
    this._hass.connection
      .subscribeEvents(() => this._load(), `${DOMAIN}_event_recorded`)
      .then((unsub: () => void) => {
        this._unsubscribe = unsub;
      })
      .catch(() => {});
  }

  async _load() {
    if (!this._hass || !this._config) return;
    const cfg = this._config;
    const endTime = (cfg.zoom_end_time || cfg.end_time || undefined) as
      | string
      | undefined;
    let startTime = (cfg.zoom_start_time || cfg.start_time || undefined) as
      | string
      | undefined;
    if (!startTime && cfg.hours_to_show) {
      const end = endTime ? new Date(endTime) : new Date();
      startTime = new Date(
        end.getTime() - (cfg.hours_to_show as number) * 3600 * 1000
      ).toISOString();
    }
    if (!startTime) {
      startTime = new Date(0).toISOString();
    }
    const effectiveEndTime = endTime || new Date().toISOString();
    let entityIds: string[] | undefined;
    if (cfg.target) {
      const resolved = resolveEntityIdsFromTarget(this._hass, cfg.target);
      entityIds = resolved.length ? resolved : undefined;
    } else if (cfg.entity) {
      entityIds = [cfg.entity as string];
    } else if (cfg.entities) {
      entityIds = (cfg.entities as Array<string | { entity: string }>).map(
        (e) => (typeof e === "string" ? e : e.entity)
      );
    } else {
      entityIds = undefined;
    }

    const hass = this._hass;
    if (!hass) {
      this._allEvents = [];
      return;
    }
    const events = (await fetchEvents(
      hass,
      startTime,
      effectiveEndTime,
      cfg.datapoint_scope === "all" ? undefined : entityIds
    )) as EventRecordFull[];
    this._allEvents = [...events].reverse();
  }

  private _filtered(): EventRecordFull[] {
    const msgFilter = ((this._config.message_filter as string) || "")
      .toLowerCase()
      .trim();
    const searchQ = this._searchQuery.toLowerCase().trim();
    return this._allEvents.filter((e) => {
      const haystack = [
        e.message.toLowerCase(),
        (e.annotation || "").toLowerCase(),
        ...(e.entity_ids || []).map((id) => id.toLowerCase()),
      ];
      if (msgFilter && !haystack.some((h) => h.includes(msgFilter)))
        return false;
      if (searchQ && !haystack.some((h) => h.includes(searchQ))) return false;
      return true;
    });
  }

  private _onSearch(e: CustomEvent<{ query: string }>) {
    this._searchQuery = e.detail.query;
    this._page = 0;
  }

  private _onPageChange(e: CustomEvent<{ page: number }>) {
    this._page = e.detail.page;
    this.shadowRoot?.querySelector(".list-scroll")?.scrollTo(0, 0);
  }

  private _navigateToEventHistory(ev: EventRecordFull) {
    const range = this._getNavigationContextForEvent(ev);
    navigateToDataPointsHistory(
      this,
      {
        entity_id: ev?.entity_ids || [],
        device_id: ev?.device_ids || [],
        area_id: ev?.area_ids || [],
        label_id: ev?.label_ids || [],
      },
      {
        start_time: range?.start_time,
        end_time: range?.end_time,
        zoom_start_time: range?.zoom_start_time,
        zoom_end_time: range?.zoom_end_time,
        datapoint_scope:
          typeof this._config?.datapoint_scope === "string"
            ? this._config.datapoint_scope
            : undefined,
      }
    );
  }

  private _getNavigationContextForEvent(ev: EventRecordFull) {
    const cfg = this._config || {};
    const startTime = (cfg.start_time as string) || null;
    const endTime = (cfg.end_time as string) || null;
    const zoomStartTime = (cfg.zoom_start_time as string) || null;
    const zoomEndTime = (cfg.zoom_end_time as string) || null;
    if (startTime && endTime) {
      return {
        start_time: startTime,
        end_time: endTime,
        zoom_start_time: zoomStartTime,
        zoom_end_time: zoomEndTime,
      };
    }
    const eventTime = ev?.timestamp ? new Date(ev.timestamp) : null;
    if (!eventTime || !Number.isFinite(eventTime.getTime())) return null;
    const start = new Date(eventTime.getTime() - 12 * 3600 * 1000);
    const end = new Date(eventTime.getTime() + 12 * 3600 * 1000);
    return { start_time: start.toISOString(), end_time: end.toISOString() };
  }

  private _openEdit(ev: EventRecordFull) {
    this._editingId = ev.id;
    this._editColor = ev.color || "#03a9f4";
  }

  private _closeEdit() {
    this._editingId = null;
  }

  private async _saveEdit(ev: EventRecordFull, values: EditSaveDetail) {
    const message = values.message.trim();
    const ann = values.annotation.trim();
    const icon = values.icon || "mdi:bookmark";
    const color = values.color || this._editColor;
    if (!message) {
      return;
    }
    const hass = this._hass;
    if (!hass) {
      return;
    }
    try {
      await updateEvent(hass, ev.id, {
        message,
        annotation: ann || message,
        icon,
        color,
      });
      this._closeEdit();
      await this._load();
    } catch (err) {
      logger.error("[hass-datapoints list-card] update failed", err);
    }
  }

  private async _deleteEvent(ev: EventRecordFull) {
    const message = ev.message || "this record";
    const confirmed = await confirmDestructiveAction(this, {
      title: msg("Delete record"),
      message: `${msg("Delete")} ${message}?`,
      confirmLabel: msg("Delete record"),
    });
    if (!confirmed) return;
    const hass = this._hass;
    if (!hass) {
      return;
    }
    try {
      await deleteEvent(hass, ev.id);
      await this._load();
    } catch (err) {
      logger.error("[hass-datapoints list-card] delete failed", err);
    }
  }

  private _toggleVisibility(ev: EventRecordFull) {
    this.dispatchEvent(
      new CustomEvent("hass-datapoints-toggle-event-visibility", {
        bubbles: true,
        composed: true,
        detail: { eventId: ev.id },
      })
    );
  }

  private _fireMoreInfo(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }

  private _handleHoverEventRecord(
    event: CustomEvent<{
      eventId: string;
      hovered: boolean;
      eventRecord: EventRecordFull;
    }>
  ) {
    this.dispatchEvent(
      new CustomEvent("hass-datapoints-hover-event-record", {
        bubbles: true,
        composed: true,
        detail: {
          eventId: event.detail.eventId,
          hovered: event.detail.hovered === true,
          eventRecord: event.detail.eventRecord,
        },
      })
    );
  }

  private _itemContext(ev: EventRecordFull): EventItemContext {
    const cfg = this._config;
    const hidden = ((cfg.hidden_event_ids as string[]) || []).includes(ev.id);
    if (hidden !== (ev as unknown as RecordWithUnknownValues)._lastHidden) {
      (ev as unknown as RecordWithUnknownValues)._lastHidden = hidden;
    }
    return {
      hass: this._hass,
      showActions: cfg.show_actions !== false,
      canEdit: this._hass?.user?.is_admin === true,
      showEntities: cfg.show_entities !== false,
      showFullMessage: cfg.show_full_message !== false,
      hidden,
      editing: this._editingId === ev.id,
      editColor: this._editColor,
      language: {
        showAnnotation: msg("Show annotation"),
        openHistory: msg("Open related data point history"),
        editRecord: msg("Edit record"),
        deleteRecord: msg("Delete record"),
        showChartMarker: msg("Show chart marker"),
        hideChartMarker: msg("Hide chart marker"),
        chooseColor: msg("Choose colour"),
        save: msg("Save"),
        cancel: msg("Cancel"),
        message: msg("Message"),
        annotationFullMessage: msg("Annotation / full message"),
      },
    };
  }

  render() {
    const cfg = this._config;
    const showSearch = cfg.show_search !== false;

    const filtered = this._filtered();
    const total = filtered.length;
    const pageSize = this._pageSize;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(this._page, totalPages - 1);
    const slice = filtered.slice(page * pageSize, (page + 1) * pageSize);
    const showPagination = totalPages > 1;

    return html`
      <ha-card>
        ${cfg.title ? html`<div class="card-header">${cfg.title}</div>` : ""}
        ${showSearch
          ? html`
              <div class="search-wrap">
                <search-bar
                  .query=${this._searchQuery}
                  .placeholder=${msg("Search datapoints…")}
                  @dp-search=${this._onSearch}
                ></search-bar>
              </div>
            `
          : ""}
        <div class="list-scroll">
          <div class="event-list">
            ${total === 0
              ? html`
                  <div class="empty">
                    <ha-icon icon="mdi:bookmark-off-outline"></ha-icon>
                    ${this._searchQuery
                      ? "No matching datapoints."
                      : "No datapoints yet."}
                  </div>
                `
              : slice.map(
                  (ev) => html`
                    <list-event-item
                      .eventRecord=${ev}
                      .context=${this._itemContext(ev)}
                      @dp-open-history=${() => {
                        this._navigateToEventHistory(ev);
                      }}
                      @dp-edit-event=${() => {
                        this._openEdit(ev);
                      }}
                      @dp-delete-event=${() => {
                        this._deleteEvent(ev);
                      }}
                      @dp-toggle-visibility=${() => {
                        this._toggleVisibility(ev);
                      }}
                      @dp-hover-event-record=${(
                        event: CustomEvent<{
                          eventId: string;
                          hovered: boolean;
                          eventRecord: EventRecordFull;
                        }>
                      ) => {
                        this._handleHoverEventRecord(event);
                      }}
                      @dp-more-info=${(
                        event: CustomEvent<{ entityId: string }>
                      ) => {
                        this._fireMoreInfo(event.detail.entityId);
                      }}
                      @dp-save-edit=${(
                        event: CustomEvent<{
                          eventRecord: EventRecordFull;
                          values: EditSaveDetail;
                        }>
                      ) => {
                        this._saveEdit(ev, event.detail.values);
                      }}
                      @dp-cancel-edit=${() => {
                        this._closeEdit();
                      }}
                    ></list-event-item>
                  `
                )}
          </div>
        </div>
        ${showPagination
          ? html`
              <div class="pagination-wrap">
                <pagination-nav
                  .page=${page}
                  .totalPages=${totalPages}
                  .totalItems=${total}
                  label="records"
                  @dp-page-change=${this._onPageChange}
                ></pagination-nav>
              </div>
            `
          : ""}
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement("hass-datapoints-list-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getGridOptions() {
    const rows = this._config?.show_search !== false ? 4 : 3;
    return { rows, min_rows: rows };
  }
}
