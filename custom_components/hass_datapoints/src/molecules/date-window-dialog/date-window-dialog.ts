import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./date-window-dialog.styles";
import type { RangeBounds } from "@/atoms/interactive/range-timeline/types";
import "@/atoms/interactive/range-timeline/range-timeline";

/**
 * `date-window-dialog` renders the Add / Edit date window dialog.
 * It wraps `ha-dialog` and provides a controlled form for setting a named date range.
 *
 * The component is fully controlled — all field values are passed via properties and
 * the parent is responsible for updating them in response to events.
 *
 * @fires dp-window-close - `{}` fired when Cancel is clicked or the dialog is dismissed
 * @fires dp-window-submit - `{ name: string, start: string, end: string }` fired when the submit button is clicked with valid inputs
 * @fires dp-window-delete - `{}` fired when the Delete button is clicked
 * @fires dp-window-shortcut - `{ direction: -1 | 1 }` fired when a "Use previous/next range" shortcut is clicked
 * @fires dp-window-date-change - `{ start: string, end: string }` fired when either datetime input changes
 */
@localized()
export class DateWindowDialog extends LitElement {
  static styles = styles;

  /** Whether the dialog is open. */
  @property({ type: Boolean }) accessor open: boolean = false;

  /** Title shown in the dialog header. */
  @property({ type: String }) accessor heading: string = "Add date window";

  /** Current value of the name text field. */
  @property({ type: String }) accessor name: string = "";

  /** Current value of the start datetime-local input (ISO string or datetime-local format). */
  @property({ type: String, attribute: "start-value" })
  accessor startValue: string = "";

  /** Current value of the end datetime-local input (ISO string or datetime-local format). */
  @property({ type: String, attribute: "end-value" })
  accessor endValue: string = "";

  /** Whether the Delete button is shown (true when editing an existing window). */
  @property({ type: Boolean, attribute: "show-delete" })
  accessor showDelete: boolean = false;

  /** Whether the "Use previous range" / "Use next range" shortcut buttons are shown. */
  @property({ type: Boolean, attribute: "show-shortcuts" })
  accessor showShortcuts: boolean = false;

  /** Label for the submit button (e.g. "Create date window" or "Save date window"). */
  @property({ type: String, attribute: "submit-label" })
  accessor submitLabel: string = "Create date window";

  /** Optional range bounds from the parent panel — used to set the timeline slider context. */
  @property({ type: Object }) accessor rangeBounds: Nullable<RangeBounds> =
    null;

  /** Effective zoom level for the timeline slider (already resolved from "auto"). */
  @property({ type: String, attribute: "zoom-level" })
  accessor zoomLevel: string = "auto";

  /** Date snapping mode passed to the timeline slider. */
  @property({ type: String, attribute: "date-snapping" })
  accessor dateSnapping: string = "hour";

  /** Shake the dialog — call this when the parent detects a validation error. */
  shake() {
    const dialog = this.shadowRoot?.querySelector(
      "ha-dialog"
    ) as Nullable<HTMLElement>;
    if (!dialog) return;
    dialog.classList.remove("dp-shaking");
    // eslint-disable-next-line no-void
    void dialog.offsetWidth; // force reflow to restart animation
    dialog.classList.add("dp-shaking");
    dialog.addEventListener(
      "animationend",
      () => dialog.classList.remove("dp-shaking"),
      { once: true }
    );
  }

  private _emit(name: string, detail: RecordWithUnknownValues = {}) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onDialogClosed() {
    this._emit("dp-window-close");
  }

  private _onCancel() {
    this._emit("dp-window-close");
  }

  private _onSubmit() {
    const nameInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-name");
    const startInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-start");
    const endInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-end");
    const nameVal =
      (nameInput as HTMLElement & { value?: string })?.value ?? this.name;
    this._emit("dp-window-submit", {
      name: String(nameVal ?? "").trim(),
      start: startInput?.value ?? this.startValue,
      end: endInput?.value ?? this.endValue,
    });
  }

  private _onDelete() {
    this._emit("dp-window-delete");
  }

  private _onPreviousShortcut() {
    this._emit("dp-window-shortcut", { direction: -1 });
  }

  private _onNextShortcut() {
    this._emit("dp-window-shortcut", { direction: 1 });
  }

  private _onDateChange() {
    const startInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-start");
    const endInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-end");
    this._emit("dp-window-date-change", {
      start: startInput?.value ?? "",
      end: endInput?.value ?? "",
    });
  }

  private _onRangeCommit(ev: CustomEvent<{ start: number; end: number }>) {
    const { start, end } = ev.detail ?? {};
    if (!start || !end) return;
    // Format as datetime-local value (YYYY-MM-DDTHH:MM) for the inputs
    const fmt = (ms: number) => {
      const d = new Date(ms);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const startStr = fmt(start);
    const endStr = fmt(end);
    // Update the datetime-local inputs directly so they reflect the slider commit
    const startInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-start");
    const endInput =
      this.shadowRoot?.querySelector<HTMLInputElement>("#date-window-end");
    if (startInput) startInput.value = startStr;
    if (endInput) endInput.value = endStr;
    this._emit("dp-window-date-change", { start: startStr, end: endStr });
  }

  /** Parse the startValue / endValue strings to Date objects for the timeline. */
  private _parseValueToDate(value: string): Nullable<Date> {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
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
        <div class="date-window-dialog-content">
          <div class="date-window-dialog-body">
            ${msg(
              "A date window saves a named date range as a tab, so you can quickly preview it against the selected range or jump the chart back to it later."
            )}
          </div>

          <div class="date-window-dialog-field name-field">
            <ha-textfield
              id="date-window-name"
              label=${msg("Name")}
              placeholder=${msg("e.g. Heating season start")}
              .value=${this.name}
            ></ha-textfield>
          </div>

          <div class="date-window-dialog-field">
            <label>${msg("Date range")}</label>
            <div class="date-window-dialog-dates">
              <div class="date-window-dialog-field">
                <label for="date-window-start">${msg("Start")}</label>
                <input
                  id="date-window-start"
                  class="date-window-dialog-input"
                  type="datetime-local"
                  step="60"
                  .value=${this.startValue}
                  @change=${this._onDateChange}
                />
              </div>
              <div class="date-window-dialog-field">
                <label for="date-window-end">${msg("End")}</label>
                <input
                  id="date-window-end"
                  class="date-window-dialog-input"
                  type="datetime-local"
                  step="60"
                  .value=${this.endValue}
                  @change=${this._onDateChange}
                />
              </div>
            </div>
          </div>

          ${this.rangeBounds
            ? html`
                <div class="date-window-dialog-timeline">
                  <range-timeline
                    .startTime=${this._parseValueToDate(this.startValue)}
                    .endTime=${this._parseValueToDate(this.endValue)}
                    .rangeBounds=${this.rangeBounds}
                    .zoomLevel=${this.zoomLevel}
                    .dateSnapping=${this.dateSnapping}
                    @dp-range-commit=${this._onRangeCommit}
                  ></range-timeline>
                </div>
              `
            : nothing}
          ${this.showShortcuts
            ? html`
                <div class="date-window-dialog-shortcuts">
                  <ha-button @click=${this._onPreviousShortcut}
                    >${msg("Use previous range")}</ha-button
                  >
                  <ha-button @click=${this._onNextShortcut}
                    >${msg("Use next range")}</ha-button
                  >
                </div>
              `
            : nothing}

          <div class="date-window-dialog-actions">
            ${this.showDelete
              ? html`
                  <ha-button
                    class="date-window-dialog-delete"
                    @click=${this._onDelete}
                    >${msg("Delete date window")}</ha-button
                  >
                `
              : nothing}
            <div class="date-window-dialog-actions-right">
              <ha-button
                class="date-window-dialog-cancel"
                @click=${this._onCancel}
                >${msg("Cancel")}</ha-button
              >
              <ha-button
                raised
                class="date-window-dialog-submit"
                @click=${this._onSubmit}
                >${this.submitLabel}</ha-button
              >
            </div>
          </div>
        </div>
      </ha-dialog>
    `;
  }
}

customElements.define("date-window-dialog", DateWindowDialog);

declare global {
  interface HTMLElementTagNameMap {
    "date-window-dialog": DateWindowDialog;
  }
}
