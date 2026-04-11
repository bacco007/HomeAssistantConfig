import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./list-event-item.styles";
import type {
  EditSaveDetail,
  EventItemContext,
  EventItemLanguage,
  EventRecordFull,
} from "@/cards/list/types";
import { contrastColor } from "@/lib/util/color";
import { fmtDateTime } from "@/lib/util/format";
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
import "@/cards/list/list-edit-form/list-edit-form";

const DEFAULT_LANGUAGE: EventItemLanguage = {
  showAnnotation: "Show annotation",
  openHistory: "Open related data point history",
  editRecord: "Edit record",
  deleteRecord: "Delete record",
  showChartMarker: "Show chart marker",
  hideChartMarker: "Hide chart marker",
  chooseColor: "Choose colour",
  save: "Save",
  cancel: "Cancel",
  message: "Message",
  annotationFullMessage: "Annotation / full message",
};

export class CardListEventItem extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  accessor eventRecord: Nullable<EventRecordFull> = null;

  @property({ attribute: false }) accessor context: EventItemContext = {
    hass: null,
    showActions: true,
    canEdit: true,
    showEntities: true,
    showFullMessage: true,
    hidden: false,
    editing: false,
    editColor: "#03a9f4",
    language: DEFAULT_LANGUAGE,
  };

  @state() accessor _annotationExpanded = false;

  private _dispatch(name: string, detail: RecordWithUnknownValues = {}): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.eventRecord) {
      return html``;
    }

    const ev = this.eventRecord;
    const showActions = this.context.showActions;
    const canEdit = this.context.canEdit;
    const showEntities = this.context.showEntities;
    const showFullMessage = this.context.showFullMessage;
    const annText =
      ev.annotation && ev.annotation !== ev.message ? ev.annotation.trim() : "";
    const color = ev.color || "#03a9f4";
    const icon = ev.icon || "mdi:bookmark";
    const iconColor = contrastColor(color) as string;
    const entities = ev.entity_ids || [];
    const devices = ev.device_ids || [];
    const areas = ev.area_ids || [];
    const labels = ev.label_ids || [];
    const hasRelated =
      entities.length || devices.length || areas.length || labels.length;
    const isExpandable = !showFullMessage && !!annText;
    const isHidden = this.context.hidden;
    const visibilityIcon = isHidden ? "mdi:eye" : "mdi:eye-off";
    const visibilityLabel = isHidden
      ? this.context.language.showChartMarker
      : this.context.language.hideChartMarker;
    const isEditing = this.context.editing;
    const isSimple = !annText && !hasRelated;

    return html`
      <div
        class="event-item${isExpandable ? " expandable" : ""}${isHidden
          ? " is-hidden"
          : ""}${isSimple ? " simple" : ""}"
        data-id=${ev.id}
        @mouseenter=${() => {
          this._dispatch("dp-hover-event-record", {
            eventId: ev.id,
            hovered: true,
            eventRecord: ev,
          });
        }}
        @mouseleave=${() => {
          this._dispatch("dp-hover-event-record", {
            eventId: ev.id,
            hovered: false,
            eventRecord: ev,
          });
        }}
        @click=${isExpandable
          ? (event: Event) => {
              const target = event.target as HTMLElement;
              if (
                target.closest(
                  ".ev-actions, .ev-entity-chip, .edit-form, ha-icon-button, ha-button"
                )
              ) {
                return;
              }
              this._annotationExpanded = !this._annotationExpanded;
            }
          : undefined}
      >
        <div class="ev-icon-wrap" style=${`background:${color}`}>
          <ha-icon
            class="ev-icon-main"
            .icon=${icon}
            style=${`--mdc-icon-size:18px;color:${iconColor}`}
          ></ha-icon>
        </div>
        <div class="ev-body">
          <div class="ev-header">
            <div class="ev-header-text">
              <span class="ev-message">
                ${ev.message}
                ${ev.dev ? html`<span class="ev-dev-badge">DEV</span>` : ""}
                ${isExpandable
                  ? html`<button
                      class="ann-expand-chip"
                      title=${this.context.language.showAnnotation}
                    >
                      ···
                    </button>`
                  : ""}
              </span>
              <div class="ev-meta">
                <button
                  class="ev-history-link"
                  type="button"
                  title=${this.context.language.openHistory}
                  aria-label=${this.context.language.openHistory}
                  @click=${(event: Event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this._dispatch("dp-open-history", { eventRecord: ev });
                  }}
                >
                  <ha-icon icon="mdi:history"></ha-icon>
                  <span
                    class="ev-time-below"
                    title=${fmtDateTime(ev.timestamp) as string}
                    >${fmtDateTime(ev.timestamp)}</span
                  >
                </button>
              </div>
            </div>
            ${showActions
              ? html`
                  <div class="ev-actions">
                    <ha-icon-button
                      label=${visibilityLabel}
                      @click=${(event: Event) => {
                        event.stopPropagation();
                        this._dispatch("dp-toggle-visibility", {
                          eventId: ev.id,
                        });
                      }}
                    >
                      <ha-icon icon=${visibilityIcon}></ha-icon>
                    </ha-icon-button>
                    ${canEdit
                      ? html`
                          <ha-icon-button
                            label=${this.context.language.editRecord}
                            @click=${(event: Event) => {
                              event.stopPropagation();
                              this._dispatch("dp-edit-event", {
                                eventRecord: ev,
                              });
                            }}
                          >
                            <ha-icon icon="mdi:pencil-outline"></ha-icon>
                          </ha-icon-button>
                          <ha-icon-button
                            label=${this.context.language.deleteRecord}
                            style="--icon-primary-color:var(--error-color,#f44336)"
                            @click=${(event: Event) => {
                              event.stopPropagation();
                              this._dispatch("dp-delete-event", {
                                eventRecord: ev,
                              });
                            }}
                          >
                            <ha-icon icon="mdi:delete-outline"></ha-icon>
                          </ha-icon-button>
                        `
                      : ""}
                  </div>
                `
              : ""}
          </div>
          ${annText
            ? html`<div
                class="ev-full-message${showFullMessage ||
                this._annotationExpanded
                  ? ""
                  : " hidden"}"
              >
                <span>${annText}</span>
              </div>`
            : ""}
          ${showEntities && hasRelated
            ? html`
                <div class="ev-entities">
                  ${entities.map(
                    (entityId) => html`
                      ${(() => {
                        const entityLabel = entityName(
                          this.context.hass,
                          entityId
                        );
                        const showSecondary = entityLabel !== entityId;
                        return html`
                          <button
                            class="ev-entity-chip"
                            @click=${(event: Event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              this._dispatch("dp-more-info", { entityId });
                            }}
                          >
                            ${this.context.hass?.states?.[entityId]
                              ? html`<ha-state-icon
                                  .stateObj=${this.context.hass.states[
                                    entityId
                                  ]}
                                  .hass=${this.context.hass}
                                ></ha-state-icon>`
                              : html`<ha-icon
                                  .icon=${entityIcon(
                                    this.context.hass,
                                    entityId
                                  )}
                                ></ha-icon>`}
                            <span class="ev-entity-chip-text">
                              <span class="ev-entity-chip-primary"
                                >${entityLabel}</span
                              >
                              ${showSecondary
                                ? html`<span class="ev-entity-chip-secondary"
                                    >${entityId}</span
                                  >`
                                : html``}
                            </span>
                          </button>
                        `;
                      })()}
                    `
                  )}
                  ${devices.map(
                    (id) => html`
                      <span class="ev-entity-chip">
                        <ha-icon
                          .icon=${deviceIcon(this.context.hass, id)}
                        ></ha-icon>
                        ${deviceName(this.context.hass, id)}
                      </span>
                    `
                  )}
                  ${areas.map(
                    (id) => html`
                      <span class="ev-entity-chip">
                        <ha-icon
                          .icon=${areaIcon(this.context.hass, id)}
                        ></ha-icon>
                        ${areaName(this.context.hass, id)}
                      </span>
                    `
                  )}
                  ${labels.map(
                    (id) => html`
                      <span class="ev-entity-chip">
                        <ha-icon
                          .icon=${labelIcon(this.context.hass, id)}
                        ></ha-icon>
                        ${labelName(this.context.hass, id)}
                      </span>
                    `
                  )}
                </div>
              `
            : ""}
          ${showActions && canEdit && isEditing
            ? html`
                <list-edit-form
                  .eventRecord=${ev}
                  .hass=${this.context.hass}
                  .color=${this.context.editColor}
                  .language=${this.context.language}
                  @dp-save-edit=${(event: CustomEvent<EditSaveDetail>) => {
                    this._dispatch("dp-save-edit", {
                      eventRecord: ev,
                      values: event.detail,
                    });
                  }}
                  @dp-cancel-edit=${() => {
                    this._dispatch("dp-cancel-edit", { eventRecord: ev });
                  }}
                ></list-edit-form>
              `
            : ""}
        </div>
      </div>
    `;
  }
}

customElements.define("list-event-item", CardListEventItem);
