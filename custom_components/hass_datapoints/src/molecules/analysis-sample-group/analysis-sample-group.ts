import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-sample-group.styles";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/form/inline-select/inline-select";

export const SAMPLE_INTERVAL_OPTIONS = [
  { value: "raw", label: "Raw (no sampling)" },
  { value: "5s", label: "5 seconds" },
  { value: "10s", label: "10 seconds" },
  { value: "15s", label: "15 seconds" },
  { value: "30s", label: "30 seconds" },
  { value: "1m", label: "1 minute" },
  { value: "2m", label: "2 minutes" },
  { value: "5m", label: "5 minutes" },
  { value: "10m", label: "10 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "3h", label: "3 hours" },
  { value: "4h", label: "4 hours" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
];

export const SAMPLE_AGGREGATE_OPTIONS = [
  { value: "mean", label: "Mean (average)" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
  { value: "median", label: "Median" },
  { value: "first", label: "First" },
  { value: "last", label: "Last" },
];

@localized()
export class AnalysisSampleGroup extends LitElement {
  @property({ type: Object }) accessor analysis: NormalizedAnalysis =
    {} as NormalizedAnalysis;

  @property({ type: String, attribute: "entity-id" })
  accessor entityId: string = "";

  static styles = [sharedStyles, styles];

  private _emit(key: string, value: unknown) {
    this.dispatchEvent(
      new CustomEvent("dp-group-analysis-change", {
        detail: { entityId: this.entityId, key, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _localizedOptions(
    options: Array<{ value: string; label: string }>
  ): Array<{ value: string; label: string }> {
    return options.map((opt) => ({
      ...opt,
      label: msg(opt.label),
    }));
  }

  private _onGroupChange(e: CustomEvent) {
    // Toggling the group on/off switches between "raw" and "5m" as default.
    const enabled = e.detail.checked;
    this._emit("sample_interval", enabled ? "5m" : "raw");
  }

  render() {
    const a = this.analysis;
    const interval = a.sample_interval ?? "raw";
    const isEnabled = interval !== "raw";
    return html`
      <analysis-group
        .label=${msg("Downsampling")}
        .checked=${isEnabled}
        @dp-group-change=${this._onGroupChange}
      >
        <label class="field">
          <span class="field-label">${msg("Interval")}</span>
          <inline-select
            .value=${interval}
            .options=${this._localizedOptions(SAMPLE_INTERVAL_OPTIONS)}
            @dp-select-change=${(e: Event) =>
              this._emit(
                "sample_interval",
                (e as CustomEvent<{ value: string }>).detail.value
              )}
          ></inline-select>
        </label>
        ${isEnabled
          ? html`
              <label class="field">
                <span class="field-label">${msg("Aggregate")}</span>
                <inline-select
                  .value=${a.sample_aggregate ?? "mean"}
                  .options=${this._localizedOptions(SAMPLE_AGGREGATE_OPTIONS)}
                  @dp-select-change=${(e: Event) =>
                    this._emit(
                      "sample_aggregate",
                      (e as CustomEvent<{ value: string }>).detail.value
                    )}
                ></inline-select>
              </label>
            `
          : nothing}
      </analysis-group>
    `;
  }
}

customElements.define("analysis-sample-group", AnalysisSampleGroup);
