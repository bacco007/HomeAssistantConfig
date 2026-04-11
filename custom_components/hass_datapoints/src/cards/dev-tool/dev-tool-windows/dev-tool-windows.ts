import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./dev-tool-windows.styles";
import type { WindowConfig } from "@/cards/dev-tool/types";

export class CardDevToolWindows extends LitElement {
  static styles = styles;

  @property({ attribute: false }) accessor windows: WindowConfig[] = [];

  @state() accessor _nextWindowId = 1;

  connectedCallback() {
    super.connectedCallback();
    if (this.windows.length === 0) {
      this.windows = [this._createWindow()];
    } else {
      this._nextWindowId =
        Math.max(...this.windows.map((windowConfig) => windowConfig.id), 0) + 1;
    }
  }

  getWindowConfigs(): WindowConfig[] {
    return this.windows.map((windowConfig) => ({ ...windowConfig }));
  }

  private _createWindow(): WindowConfig {
    const nextId = this._nextWindowId;
    this._nextWindowId += 1;
    return {
      id: nextId,
      label: "",
      startDt: "",
      endDt: "",
    };
  }

  private _emitChange(): void {
    this.dispatchEvent(
      new CustomEvent("dp-window-configs-change", {
        detail: {
          windows: this.getWindowConfigs(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _addWindow(): void {
    this.windows = [...this.windows, this._createWindow()];
    this._emitChange();
  }

  private _removeWindow(id: number): void {
    if (this.windows.length <= 1) {
      return;
    }
    this.windows = this.windows.filter(
      (windowConfig) => windowConfig.id !== id
    );
    this._emitChange();
  }

  private _updateWindow(id: number, patch: Partial<WindowConfig>): void {
    this.windows = this.windows.map((windowConfig) => {
      if (windowConfig.id !== id) {
        return windowConfig;
      }
      return {
        ...windowConfig,
        ...patch,
      };
    });
    this._emitChange();
  }

  render() {
    return html`
      <div class="windows-header">
        <span class="windows-sub">Comparison windows</span>
        <button
          class="add-window-btn"
          id="add-window-btn"
          type="button"
          @click=${this._addWindow}
        >
          + Add window
        </button>
      </div>
      <div id="windows-list">
        ${this.windows.map(
          (windowConfig, index) => html`
            <div class="window-row" data-wid=${String(windowConfig.id)}>
              <div class="window-fields">
                <div class="w-label-wrap">
                  <div class="w-field-label">Label (optional)</div>
                  <input
                    class="w-label-native w-label"
                    type="text"
                    .value=${windowConfig.label}
                    placeholder=${`Window ${index + 1}`}
                    @input=${(event: Event) =>
                      this._updateWindow(windowConfig.id, {
                        label: (event.currentTarget as HTMLInputElement).value,
                      })}
                  />
                </div>
                <div class="w-start-wrap">
                  <span class="w-start-label">Start date/time</span>
                  <input
                    class="w-start"
                    type="datetime-local"
                    .value=${windowConfig.startDt}
                    @input=${(event: Event) =>
                      this._updateWindow(windowConfig.id, {
                        startDt: (event.currentTarget as HTMLInputElement)
                          .value,
                      })}
                  />
                </div>
                <div class="w-end-wrap">
                  <div class="w-field-label">End date/time (optional)</div>
                  <input
                    class="w-end"
                    type="datetime-local"
                    .value=${windowConfig.endDt}
                    @input=${(event: Event) =>
                      this._updateWindow(windowConfig.id, {
                        endDt: (event.currentTarget as HTMLInputElement).value,
                      })}
                  />
                </div>
              </div>
              <button
                class="remove-window-btn"
                type="button"
                title="Remove this window"
                ?disabled=${this.windows.length <= 1}
                @click=${() => this._removeWindow(windowConfig.id)}
              >
                <ha-icon icon="mdi:close-circle-outline"></ha-icon>
              </button>
            </div>
          `
        )}
      </div>
    `;
  }
}

customElements.define("dev-tool-windows", CardDevToolWindows);
