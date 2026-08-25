/* eslint-disable max-classes-per-file */
import type { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { msg } from "@/lib/i18n/localize";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = abstract new (...args: any[]) => T;

/**
 * Mixin interface — lets TypeScript see the members that AnalysisGroupMixin
 * adds to a class without requiring a concrete base.
 */
export declare class AnalysisGroupMixinInterface {
  /** Normalised analysis config for the entity row. */
  analysis: NormalizedAnalysis;

  /** HA entity ID this analysis group belongs to. */
  entityId: string;
  /**
   * Dispatch `dp-group-analysis-change` with the given key/value pair.
   * @fires dp-group-analysis-change
   */
  protected _emit(key: string, value: unknown): void;
  /** Checkbox change handler — emits the checkbox's checked state for `key`. */
  protected _onCheckbox(key: string, e: Event): void;
  /** Map `msg()` over an array of options, preserving all other fields (including `help`). */
  protected _localizedOptions<T extends { label: string; help?: string }>(
    opts: T[]
  ): T[];
}

/**
 * LIT mixin shared by all seven analysis-group molecules.
 *
 * Provides the `analysis` and `entityId` reactive properties plus the three
 * helper methods that were previously copy-pasted into every molecule.
 *
 * Usage:
 * ```ts
 * @localized()
 * export class MyAnalysisGroup extends AnalysisGroupMixin(LitElement) {
 *   private _onGroupChange(e: CustomEvent) {
 *     this._emit("show_my_analysis", e.detail.checked);
 *   }
 * }
 * ```
 */
export const AnalysisGroupMixin = <T extends Constructor<LitElement>>(
  Base: T
) => {
  abstract class Mixin extends Base {
    /** Normalised analysis config for the entity row. */
    @property({ type: Object }) accessor analysis: NormalizedAnalysis =
      {} as NormalizedAnalysis;

    /** HA entity ID this analysis group belongs to. */
    @property({ type: String, attribute: "entity-id" })
    accessor entityId: string = "";

    /**
     * Dispatch `dp-group-analysis-change` with the given key/value pair.
     * @fires dp-group-analysis-change - Detail: `{ entityId, key, value }`
     */
    protected _emit(key: string, value: unknown) {
      this.dispatchEvent(
        new CustomEvent("dp-group-analysis-change", {
          detail: { entityId: this.entityId, key, value },
          bubbles: true,
          composed: true,
        })
      );
    }

    /** Checkbox change handler — emits the checkbox's checked state for `key`. */
    protected _onCheckbox(key: string, e: Event) {
      this._emit(key, (e.target as HTMLInputElement).checked);
    }

    /**
     * Map `msg()` over an array of options, preserving all other fields.
     * If an option has a `help` string it is also localized.
     */
    protected _localizedOptions<U extends { label: string; help?: string }>(
      opts: U[]
    ): U[] {
      return opts.map((opt) => ({
        ...opt,
        label: msg(opt.label),
        ...(opt.help !== undefined && { help: msg(opt.help) }),
      })) as U[];
    }
  }

  return Mixin as unknown as typeof Mixin &
    T &
    Constructor<AnalysisGroupMixinInterface>;
};
