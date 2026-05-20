import { html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";
import { styles } from "./ai-query-brief-dialog.styles";

@localized()
export class AiQueryBriefDialog extends LitElement {
  static styles = styles;

  @property({ type: Boolean }) accessor open: boolean = false;

  @property({ type: String }) accessor heading: string = "AI query brief";

  @property({ type: String }) accessor text: string = "";

  @query("#ai-query-brief-textarea")
  accessor _textareaEl: Nullable<HTMLTextAreaElement> = null;

  @state() accessor _statusMessage: string = "";

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("open") && this.open) {
      window.requestAnimationFrame(() => {
        this._selectAllText();
      });
    }
  }

  private _emit(name: string) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _selectAllText() {
    if (!this._textareaEl) {
      return;
    }
    this._textareaEl.focus();
    this._textareaEl.select();
    this._textareaEl.setSelectionRange(0, this._textareaEl.value.length);
  }

  private _onDialogClosed() {
    this._statusMessage = "";
    this._emit("dp-ai-query-brief-close");
  }

  private _onClose() {
    this._emit("dp-ai-query-brief-close");
  }

  private async _onCopy() {
    this._selectAllText();
    const text = this._textareaEl?.value || this.text;
    try {
      await navigator.clipboard.writeText(text);
      this._statusMessage = msg("Copied to clipboard.");
    } catch {
      this._statusMessage = msg(
        "Clipboard write failed. The text is selected so you can copy it manually."
      );
    }
  }

  private _onTextareaFocus() {
    this._selectAllText();
  }

  render() {
    return html`
      <ha-dialog
        ?open=${this.open}
        hideActions
        .scrimClickAction=${"close"}
        .escapeKeyAction=${"close"}
        @closed=${this._onDialogClosed}
      >
        <span slot="heading">${this.heading}</span>
        <div class="ai-query-brief-dialog-content">
          <div class="ai-query-brief-dialog-body">
            ${msg(
              "This brief is intended for another AI to fetch raw Home Assistant history and hass_datapoints anomaly details. Review it, then copy it into your AI tool of choice."
            )}
          </div>

          <div class="ai-query-brief-dialog-field">
            <label for="ai-query-brief-textarea"
              >${msg("Copy-ready brief")}</label
            >
            <textarea
              id="ai-query-brief-textarea"
              class="ai-query-brief-dialog-textarea"
              readonly
              .value=${this.text}
              @focus=${this._onTextareaFocus}
            ></textarea>
          </div>

          <div class="ai-query-brief-dialog-status" aria-live="polite">
            ${this._statusMessage}
          </div>

          <div class="ai-query-brief-dialog-actions">
            <ha-button
              class="ai-query-brief-dialog-close"
              @click=${this._onClose}
              >${msg("Close")}</ha-button
            >
            <ha-button
              class="ai-query-brief-dialog-copy"
              raised
              @click=${this._onCopy}
              >${msg("Copy brief")}</ha-button
            >
          </div>
        </div>
      </ha-dialog>
    `;
  }
}

customElements.define("ai-query-brief-dialog", AiQueryBriefDialog);

declare global {
  interface HTMLElementTagNameMap {
    "ai-query-brief-dialog": AiQueryBriefDialog;
  }
}
