import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./dev-tool-results.styles";
import type { ChangeItem, WindowResult } from "@/cards/dev-tool/types";
import { fmtDateTime } from "@/lib/util/format";
import "@/atoms/display/feedback-banner/feedback-banner";

export class CardDevToolResults extends LitElement {
  static styles = styles;

  @property({ attribute: false }) accessor results: WindowResult[] = [];

  @property({ type: Boolean }) accessor isAdmin = false;

  @property({ type: String }) accessor statusKind = "";

  @property({ type: String }) accessor statusText = "";

  @property({ type: Boolean }) accessor statusVisible = false;

  @state() accessor _collapsedWindowIds: number[] = [];

  private _emitSelection(): void {
    this.dispatchEvent(
      new CustomEvent("dp-results-selection-change", {
        detail: {
          results: this.results.map((result) => ({
            ...result,
            selected: [...result.selected],
          })),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _updateSelected(windowId: number, selected: number[]): void {
    this.results = this.results.map((result) => {
      if (result.id !== windowId) {
        return result;
      }
      return {
        ...result,
        selected,
      };
    });
    this._emitSelection();
  }

  private _toggleCollapsed(windowId: number): void {
    if (this._collapsedWindowIds.includes(windowId)) {
      this._collapsedWindowIds = this._collapsedWindowIds.filter(
        (id) => id !== windowId
      );
      return;
    }
    this._collapsedWindowIds = [...this._collapsedWindowIds, windowId];
  }

  private _emitRecordRequest(): void {
    const selectedItems: ChangeItem[] = [];
    this.results.forEach((result) => {
      [...result.selected]
        .sort((a, b) => a - b)
        .forEach((index) => {
          selectedItems.push(result.changes[index]);
        });
    });
    this.dispatchEvent(
      new CustomEvent("dp-record-selected-request", {
        detail: {
          items: selectedItems,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _summaryParts(): {
    selected: number;
    total: number;
    windows: number;
  } {
    let selected = 0;
    let total = 0;
    this.results.forEach((result) => {
      selected += result.selected.length;
      total += result.changes.length;
    });
    return {
      selected,
      total,
      windows: this.results.length,
    };
  }

  render() {
    if (this.results.length === 0) {
      return html``;
    }

    const summary = this._summaryParts();

    return html`
      <div class="results-section">
        <div class="results-bar">
          <span class="selected-summary">
            <strong>${summary.selected}</strong> of ${summary.total} selected
            across ${summary.windows} window${summary.windows === 1 ? "" : "s"}
          </span>
          ${this.isAdmin
            ? html`<ha-button
                id="record-btn"
                raised
                @click=${this._emitRecordRequest}
                >Record selected as dev datapoints</ha-button
              >`
            : ""}
        </div>
        <div id="results-list">
          ${this.results.map((result) => {
            const startLabel = result.startDt
              ? new Date(result.startDt).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                } as Intl.DateTimeFormatOptions)
              : "unknown start";
            const rangeLabel = result.endDt
              ? `${startLabel} → ${new Date(result.endDt).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                } as Intl.DateTimeFormatOptions)}`
              : `${startLabel} → now`;
            const collapsed = this._collapsedWindowIds.includes(result.id);
            return html`
              <div
                class="window-result ${collapsed ? "collapsed" : ""}"
                data-wid=${String(result.id)}
              >
                <div
                  class="window-result-header"
                  @click=${() => this._toggleCollapsed(result.id)}
                >
                  <span class="window-result-toggle">▼</span>
                  <span class="window-result-title">
                    ${result.label}
                    <span class="window-result-meta"
                      >${rangeLabel} · ${result.changes.length}
                      change${result.changes.length === 1 ? "" : "s"}</span
                    >
                  </span>
                  <span class="window-result-links">
                    <button
                      class="window-link"
                      @click=${(event: Event) => {
                        event.stopPropagation();
                        this._updateSelected(
                          result.id,
                          result.changes.map((_, index) => index)
                        );
                      }}
                    >
                      All
                    </button>
                    <button
                      class="window-link"
                      @click=${(event: Event) => {
                        event.stopPropagation();
                        this._updateSelected(result.id, []);
                      }}
                    >
                      None
                    </button>
                  </span>
                </div>
                <div class="window-result-body">
                  <div class="changes-list">
                    ${result.changes.length === 0
                      ? html`<div class="empty-changes">
                          No state changes detected in this window.
                        </div>`
                      : result.changes.map(
                          (change, index) => html`
                            <label class="change-item">
                              <input
                                type="checkbox"
                                .checked=${result.selected.includes(index)}
                                @change=${(event: Event) => {
                                  const checked = (
                                    event.currentTarget as HTMLInputElement
                                  ).checked;
                                  const nextSelected = checked
                                    ? [
                                        ...new Set([...result.selected, index]),
                                      ].sort((a, b) => a - b)
                                    : result.selected.filter(
                                        (selectedIndex) =>
                                          selectedIndex !== index
                                      );
                                  this._updateSelected(result.id, nextSelected);
                                }}
                              />
                              <div class="change-info">
                                <div class="change-msg">${change.message}</div>
                                <div class="change-meta">
                                  ${fmtDateTime(change.timestamp)} ·
                                  ${change.entity_id}
                                </div>
                              </div>
                            </label>
                          `
                        )}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
        <feedback-banner
          .kind=${this.statusKind}
          .text=${this.statusText}
          .visible=${this.statusVisible}
        ></feedback-banner>
      </div>
    `;
  }
}

customElements.define("dev-tool-results", CardDevToolResults);
