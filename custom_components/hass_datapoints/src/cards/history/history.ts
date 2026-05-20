import { html } from "lit";
import { ChartCardBase } from "@/charts/base/chart-card-base";
import { styles } from "./history.styles";
// Side-effect import: registers the hass-datapoints-history-chart custom element.
import "./history-chart/history-chart";
import { createChartZoomRange } from "@/lib/domain/chart-zoom";
import {
  createHiddenEventIdSet,
  createHiddenSeriesSet,
} from "@/lib/chart/chart-state";
import {
  normalizeTargetValue,
  resolveEntityIdsFromTarget,
} from "@/lib/domain/target-selection";
import { HistoryAnnotationDialogController } from "@/components/annotation-dialog/annotation-dialog";
import { fetchHistoryDuringPeriod } from "@/lib/data/history-api";
import { fetchStatisticsDuringPeriod } from "@/lib/data/statistics-api";
import { fetchEvents } from "@/lib/data/events-api";
import { logger } from "@/lib/logger";
import type { CardConfig } from "@/lib/types";
import {
  diffCardConfig,
  hasDrawableHistoryData,
  getDrawableHistoryQuality,
  filterEvents,
} from "./history-config-diff";
import { navigateToDataPointsHistory } from "@/lib/ha/navigation";
import { buildHistoryPageSessionState } from "@/lib/history-page/history-session-state";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SeriesSettingEntry {
  entity_id?: string;
  entity?: string;
  entityId?: string;
  hidden?: boolean;
  analysis?: unknown;
  [key: string]: unknown;
}

interface ComparisonWindow {
  id?: string;
  time_offset_ms: number;
  [key: string]: unknown;
}

interface ComparisonWindowResult extends ComparisonWindow {
  histResult: RecordWithUnknownValues;
  statsResult: RecordWithUnknownValues;
}

interface DrawOptions {
  loading?: boolean;
  drawRequestId?: number;
}

interface PartialLoadState {
  histResult: Nullable<RecordWithUnknownValues>;
  statsResult: Nullable<RecordWithUnknownValues>;
  events: Nullable<unknown[]>;
  histDone: boolean;
  statsDone: boolean;
  eventsDone: boolean;
  histFailed: boolean;
  statsFailed: boolean;
  eventsFailed: boolean;
  hasDrawnDrawable: boolean;
  lastDrawState: Nullable<{
    histDone: boolean;
    statsDone: boolean;
    eventsDone: boolean;
  }>;
  lastDrawQuality: Nullable<{ totalPoints: number }>;
}

// ── Card ──────────────────────────────────────────────────────────────────────

export class HassDatapointsHistoryCard extends ChartCardBase {
  static styles = styles;

  // ── State ──────────────────────────────────────────────────────────────────

  private _hiddenSeries: Set<string> = new Set();

  private _hiddenEventIds: Set<string> = new Set();

  private _zoomRange: Nullable<{ start: number; end: number }> = null;

  private _configKey: string | undefined;

  private _comparisonRequestId = 0;

  private _comparisonDataCache: Map<string, ComparisonWindowResult> = new Map();

  private _lastComparisonResults: Nullable<ComparisonWindowResult[]> = null;

  private _lastHistResult: Nullable<RecordWithUnknownValues> = null;

  private _lastStatsResult: Nullable<RecordWithUnknownValues> = null;

  private _lastEvents: Nullable<unknown[]> = null;

  private _lastT0: number = 0;

  private _lastT1: number = 0;

  private _scrollSyncSuspended = false;

  private _lastProgrammaticScrollLeft: Nullable<number> = null;

  private _ignoreNextProgrammaticScrollEvent = false;

  private _adjustComparisonAxisScale = false;

  private _drawRequestId = 0;

  private _zoomReloadTimer: Nullable<number> = null;

  private _chartScrollViewportEl: Nullable<Element> = null;

  private _annotationDialog: {
    teardown(): void;
    open(...args: unknown[]): void;
    isOpen?(): boolean;
  };

  private _onWindowKeyDown: (ev: KeyboardEvent) => void;

  private _onChartScroll: () => void;

  private _onZoomApply: (ev: Event) => void;

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this._annotationDialog = new HistoryAnnotationDialogController(
      this as never
    );
    this._onWindowKeyDown = (ev: KeyboardEvent) =>
      this._handleWindowKeyDown(ev);
    this._onChartScroll = () => this._handleChartScroll();
    this._onZoomApply = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      this._zoomRange = detail
        ? { start: detail.start, end: detail.end }
        : null;
      this._dispatchZoomRange(detail ? "zoom" : "reset");
      if (this._lastHistResult && this._lastEvents) {
        this._queueDrawChart(
          this._lastHistResult,
          this._lastStatsResult || {},
          this._lastEvents,
          this._lastT0,
          this._lastT1
        );
      }
      this._scheduleZoomReload();
    };
  }

  // ── Hass setter — suppress reload-on-every-state-change ───────────────────

  /**
   * Override the base setter to prevent a full history refetch on every HA
   * state update. History data is fetched from the history/statistics APIs and
   * does not change when entity states tick; reloads are already triggered by:
   *   - config changes (setConfig)
   *   - new datapoints recorded (hass_datapoints_event_recorded subscription)
   *   - auto-refresh interval (base class)
   *
   * We still call requestUpdate() so that entity-friendly-names in the legend
   * stay fresh, and we propagate the new hass reference down to hass-datapoints-history-chart.
   */
  override set hass(hass: import("@/lib/types").HassLike) {
    this._hass = hass;
    this.requestUpdate();
    // Push updated hass to the sub-component without triggering a redraw.
    const chartEl = this._chartEl();
    if (chartEl) {
      chartEl.hass = hass;
    }
    // Initial load is triggered by updated() in the base class (not here).
  }

  override get hass(): import("@/lib/types").HassLike {
    return this._hass!;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    window.addEventListener("keydown", this._onWindowKeyDown);
    this.addEventListener("hass-datapoints-zoom-apply", this._onZoomApply);
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    window.removeEventListener("keydown", this._onWindowKeyDown);
    this.removeEventListener("hass-datapoints-zoom-apply", this._onZoomApply);
    if (this._zoomReloadTimer != null) {
      window.clearTimeout(this._zoomReloadTimer);
      this._zoomReloadTimer = null;
    }
    if (this._chartScrollViewportEl) {
      this._chartScrollViewportEl.removeEventListener(
        "scroll",
        this._onChartScroll
      );
    }
    this._annotationDialog?.teardown();
    super.disconnectedCallback();
  }

  // ── Configuration ──────────────────────────────────────────────────────────

  override setConfig(config: CardConfig): void {
    if (
      !config.entity &&
      !config.entities &&
      !config.target &&
      !(
        Array.isArray(config.series_settings) &&
        config.series_settings.length > 0
      )
    ) {
      throw new Error(
        "hass-datapoints-history-card: define `target`, `entity`, `entities` or `series_settings`"
      );
    }

    const nextConfig: CardConfig = {
      hours_to_show: 24,
      ...config,
      target: config.target ? normalizeTargetValue(config.target) : undefined,
      series_settings: Array.isArray(config.series_settings)
        ? (config.series_settings as SeriesSettingEntry[]).map((entry) => ({
            ...entry,
            analysis:
              entry?.analysis && typeof entry.analysis === "object"
                ? { ...(entry.analysis as RecordWithUnknownValues) }
                : entry?.analysis,
          }))
        : config.series_settings,
      hidden_event_ids: Array.isArray(config.hidden_event_ids)
        ? [...(config.hidden_event_ids as unknown[])]
        : config.hidden_event_ids,
      hovered_event_ids: Array.isArray(config.hovered_event_ids)
        ? [...(config.hovered_event_ids as unknown[])]
        : config.hovered_event_ids,
      comparison_windows: Array.isArray(config.comparison_windows)
        ? (config.comparison_windows as ComparisonWindow[]).map((entry) => ({
            ...entry,
          }))
        : config.comparison_windows,
      preload_comparison_windows: Array.isArray(
        config.preload_comparison_windows
      )
        ? (config.preload_comparison_windows as ComparisonWindow[]).map(
            (entry) => ({ ...entry })
          )
        : config.preload_comparison_windows,
      comparison_preview_overlay: config.comparison_preview_overlay
        ? { ...(config.comparison_preview_overlay as RecordWithUnknownValues) }
        : null,
      selected_comparison_window_id:
        (config.selected_comparison_window_id as string) || null,
      hovered_comparison_window_id:
        (config.hovered_comparison_window_id as string) || null,
      show_trend_lines: config.show_trend_lines === true,
      show_summary_stats: config.show_summary_stats === true,
      show_rate_of_change: config.show_rate_of_change === true,
      show_threshold_analysis: config.show_threshold_analysis === true,
      show_threshold_shading: config.show_threshold_shading === true,
      hide_raw_data: config.hide_raw_data === true,
      show_trend_crosshairs: config.show_trend_crosshairs === true,
      trend_method: (config.trend_method as string) || "rolling_average",
      trend_window: (config.trend_window as string) || "24h",
      rate_window: (config.rate_window as string) || "1h",
      threshold_values:
        config.threshold_values && typeof config.threshold_values === "object"
          ? { ...(config.threshold_values as RecordWithUnknownValues) }
          : {},
      threshold_directions:
        config.threshold_directions &&
        typeof config.threshold_directions === "object"
          ? { ...(config.threshold_directions as RecordWithUnknownValues) }
          : {},
      show_delta_analysis: config.show_delta_analysis === true,
      show_delta_tooltip: config.show_delta_tooltip !== false,
      show_delta_lines: config.show_delta_lines === true,
      hide_delta_source_series: config.hide_delta_source_series === true,
      delink_y_axis: config.delink_y_axis === true,
      split_view: config.split_view === true,
      show_data_gaps: config.show_data_gaps !== false,
      data_gap_threshold: (config.data_gap_threshold as string) || "2h",
    };

    const currentConfig = this._config || {};

    const diff = diffCardConfig(
      currentConfig as Partial<CardConfig>,
      nextConfig
    );

    if (
      !diff.dataChanged &&
      !diff.viewChanged &&
      !diff.comparisonChanged &&
      !diff.preloadComparisonChanged &&
      !diff.comparisonOverlayChanged &&
      this._configKey
    ) {
      return;
    }

    this._config = nextConfig;
    this._configKey = JSON.stringify(nextConfig);
    this._hiddenSeries = createHiddenSeriesSet(
      nextConfig.series_settings as never
    );
    this._hiddenEventIds = createHiddenEventIdSet(
      nextConfig.hidden_event_ids as never
    );
    this._zoomRange = createChartZoomRange(
      nextConfig.zoom_start_time as never,
      nextConfig.zoom_end_time as never
    ) as Nullable<{ start: number; end: number }>;
    if (
      diff.dataChanged ||
      diff.comparisonChanged ||
      diff.preloadComparisonChanged
    ) {
      // Comparison payloads can be large and are keyed by range/window.
      // Prune stale entries on range/entity/window changes so a long-lived page
      // does not retain every historical fetch for the whole session while
      // still preserving currently relevant cached payloads.
      this._pruneComparisonDataCache(nextConfig);
      this._lastComparisonResults = null;
    }
    const chartEl = this._chartEl();
    if (chartEl) {
      chartEl.hass = this._hass;
      chartEl._config = this._config;
      chartEl._hiddenSeries = this._hiddenSeries;
      chartEl._hiddenEventIds = this._hiddenEventIds;
      chartEl._zoomRange = this._zoomRange;
      chartEl._lastComparisonResults = this._getResolvedComparisonResults();
      if (
        diff.comparisonOverlayChanged &&
        typeof chartEl._renderComparisonPreviewOverlay === "function"
      ) {
        (chartEl._renderComparisonPreviewOverlay as () => void)();
      }
    }

    if (
      diff.dataChanged ||
      !Array.isArray(nextConfig.comparison_windows) ||
      !(nextConfig.comparison_windows as unknown[]).length
    ) {
      this._adjustComparisonAxisScale = false;
    }

    if (this._hass && diff.dataChanged) {
      this._load();
      return;
    }
    if (this._hass && diff.comparisonChanged) {
      this._loadComparisonWindows({ redraw: true, showLoading: true });
      return;
    }
    if (this._hass && diff.preloadComparisonChanged) {
      this._preloadComparisonWindows().catch(() => {});
    }
    if (
      this._hass &&
      diff.comparisonOverlayChanged &&
      this._lastHistResult &&
      this._lastEvents
    ) {
      this._queueDrawChart(
        this._lastHistResult,
        this._lastStatsResult || {},
        this._lastEvents,
        this._lastT0,
        this._lastT1
      );
      return;
    }
    if (
      this._hass &&
      diff.viewChanged &&
      this._lastHistResult &&
      this._lastEvents
    ) {
      this._queueDrawChart(
        this._lastHistResult,
        this._lastStatsResult || {},
        this._lastEvents,
        this._lastT0,
        this._lastT1
      );
    }
  }

  // ── Entity helpers ─────────────────────────────────────────────────────────

  get _entityIds(): string[] {
    if (Array.isArray(this._config.series_settings)) {
      const ids = (this._config.series_settings as SeriesSettingEntry[])
        .map(
          (entry) =>
            entry?.entity_id || entry?.entity || entry?.entityId || null
        )
        .filter(
          (value): value is string => typeof value === "string" && !!value
        );
      if (ids.length) {
        return [...new Set(ids)];
      }
    }
    if (this._config.target) {
      return resolveEntityIdsFromTarget(this._hass, this._config.target);
    }
    if (this._config.entities) {
      return (
        this._config.entities as Array<string | RecordWithStringValues>
      ).map((e) => (typeof e === "string" ? e : (e.entity_id ?? e.entity)));
    }
    return [this._config.entity as string];
  }

  private get _statisticsEntityIds(): string[] {
    return this._entityIds.filter(
      (entityId) => !String(entityId).startsWith("binary_sensor.")
    );
  }

  // ── Time range ─────────────────────────────────────────────────────────────

  private _getRange(): { start: Date; end: Date } {
    const end = this._config.end_time
      ? new Date(this._config.end_time as string)
      : new Date();
    const start = this._config.start_time
      ? new Date(this._config.start_time as string)
      : new Date(
          end.getTime() - (this._config.hours_to_show as number) * 3600 * 1000
        );
    return { start, end };
  }

  // ── Comparison windows ─────────────────────────────────────────────────────

  private _pruneComparisonDataCache(config: CardConfig): void {
    if (!this._comparisonDataCache.size) {
      return;
    }
    const end = config.end_time
      ? new Date(config.end_time as string)
      : new Date();
    const start = config.start_time
      ? new Date(config.start_time as string)
      : new Date(
          end.getTime() - Number(config.hours_to_show || 24) * 3600 * 1000
        );
    const windows = [
      ...(Array.isArray(config.comparison_windows)
        ? (config.comparison_windows as ComparisonWindow[])
        : []),
      ...(Array.isArray(config.preload_comparison_windows)
        ? (config.preload_comparison_windows as ComparisonWindow[])
        : []),
    ];
    const keepKeys = new Set<string>();
    for (const win of windows) {
      if (win?.time_offset_ms == null) {
        continue;
      }
      const winStart = new Date(start.getTime() + win.time_offset_ms);
      const winEnd = new Date(end.getTime() + win.time_offset_ms);
      keepKeys.add(this._getComparisonCacheKey(win, winStart, winEnd));
    }
    for (const cacheKey of this._comparisonDataCache.keys()) {
      if (!keepKeys.has(cacheKey)) {
        this._comparisonDataCache.delete(cacheKey);
      }
    }
  }

  private get _comparisonWindows(): ComparisonWindow[] {
    return Array.isArray(this._config?.comparison_windows)
      ? (this._config.comparison_windows as ComparisonWindow[]).filter(
          (w) => w?.time_offset_ms != null
        )
      : [];
  }

  private get _preloadComparisonWindowsConfig(): ComparisonWindow[] {
    return Array.isArray(this._config?.preload_comparison_windows)
      ? (this._config.preload_comparison_windows as ComparisonWindow[]).filter(
          (w) => w?.time_offset_ms != null
        )
      : [];
  }

  private _getComparisonCacheKey(
    win: ComparisonWindow,
    start: Date,
    end: Date
  ): string {
    return JSON.stringify({
      id: win?.id || "",
      start: start?.toISOString?.() || "",
      end: end?.toISOString?.() || "",
      entities: this._entityIds,
      statistics_entities: this._statisticsEntityIds,
    });
  }

  private _getResolvedComparisonResults(): ComparisonWindowResult[] {
    const { start, end } = this._getRange();
    const seenWindowIds = new Set<string>();
    const resolvedResults: ComparisonWindowResult[] = [];
    const comparisonWindows = [
      ...this._comparisonWindows,
      ...this._preloadComparisonWindowsConfig,
    ];

    for (const win of comparisonWindows) {
      const id = String(win?.id || "");
      if (!id || seenWindowIds.has(id)) {
        continue;
      }
      seenWindowIds.add(id);
      const winStart = new Date(start.getTime() + win.time_offset_ms);
      const winEnd = new Date(end.getTime() + win.time_offset_ms);
      const cacheKey = this._getComparisonCacheKey(win, winStart, winEnd);
      const cached = this._comparisonDataCache.get(cacheKey);
      if (!cached) {
        continue;
      }
      resolvedResults.push(cached);
    }

    return resolvedResults;
  }

  private async _loadComparisonWindowData(
    win: ComparisonWindow,
    start: Date,
    end: Date
  ): Promise<ComparisonWindowResult> {
    const hass = this._hass;
    if (!hass) {
      return {
        id: win.id,
        time_offset_ms: win.time_offset_ms,
        histResult: {},
        statsResult: {},
      };
    }
    const cacheKey = this._getComparisonCacheKey(win, start, end);
    const cached = this._comparisonDataCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const historyPromise = fetchHistoryDuringPeriod(
      hass,
      start.toISOString(),
      end.toISOString(),
      this._entityIds,
      {
        include_start_time_state: true,
        significant_changes_only: false,
        no_attributes: true,
      }
    ).catch(() => ({}) as RecordWithUnknownValues);

    const statisticsPromise = this._statisticsEntityIds.length
      ? fetchStatisticsDuringPeriod(
          hass,
          start.toISOString(),
          end.toISOString(),
          this._statisticsEntityIds,
          {
            period: "hour",
            types: ["mean"],
            units: {},
          }
        ).catch(() => ({}) as RecordWithUnknownValues)
      : Promise.resolve({} as RecordWithUnknownValues);

    const [histResult, statsResult] = await Promise.all([
      historyPromise,
      statisticsPromise,
    ]);

    const result: ComparisonWindowResult = {
      ...win,
      histResult: (histResult as RecordWithUnknownValues) || {},
      statsResult: (statsResult as RecordWithUnknownValues) || {},
    };
    this._comparisonDataCache.set(cacheKey, result);
    return result;
  }

  private _preloadComparisonWindows(): Promise<ComparisonWindowResult[]> {
    const { start, end } = this._getRange();
    const comparisonWindows = this._preloadComparisonWindowsConfig;
    if (!comparisonWindows.length) {
      return Promise.resolve([]);
    }
    return Promise.all(
      comparisonWindows.map(async (win) => {
        const winStart = new Date(start.getTime() + win.time_offset_ms);
        const winEnd = new Date(end.getTime() + win.time_offset_ms);
        const result = await this._loadComparisonWindowData(
          win,
          winStart,
          winEnd
        );
        return {
          ...win,
          id: result.id,
          histResult: result.histResult,
          statsResult: result.statsResult,
        };
      })
    )
      .then((results) => {
        this._lastComparisonResults = this._getResolvedComparisonResults();
        if (
          this._config?.hovered_comparison_window_id &&
          this._lastHistResult &&
          this._lastEvents
        ) {
          this._queueDrawChart(
            this._lastHistResult,
            this._lastStatsResult || {},
            this._lastEvents,
            this._lastT0,
            this._lastT1
          );
        }
        return results;
      })
      .catch((error: unknown) => {
        logger.warn(
          "[hass-datapoints history-card] comparison preload:failed",
          {
            message: (error as Error)?.message || String(error),
          }
        );
        return [];
      });
  }

  private _loadComparisonWindows({
    redraw = false,
    requestId = null as Nullable<number>,
    showLoading = false,
  } = {}): Promise<ComparisonWindowResult[]> {
    const { start, end } = this._getRange();
    const comparisonWindows = this._comparisonWindows;
    const targetRequestId = requestId ?? this._loadRequestId;
    const comparisonRequestId = ++this._comparisonRequestId;

    if (!comparisonWindows.length) {
      this._lastComparisonResults = [];
      this.dispatchEvent(
        new CustomEvent("hass-datapoints-comparison-loading", {
          bubbles: true,
          composed: true,
          detail: { ids: [], loading: false },
        })
      );
      if (redraw && this._lastHistResult && this._lastEvents) {
        this._queueDrawChart(
          this._lastHistResult,
          this._lastStatsResult || {},
          this._lastEvents,
          this._lastT0,
          this._lastT1
        );
      }
      return Promise.resolve([]);
    }

    const cachedResults: ComparisonWindowResult[] = [];
    const windowsToFetch: Array<{
      win: ComparisonWindow;
      winStart: Date;
      winEnd: Date;
    }> = [];

    for (const win of comparisonWindows) {
      const winStart = new Date(start.getTime() + win.time_offset_ms);
      const winEnd = new Date(end.getTime() + win.time_offset_ms);
      const cacheKey = this._getComparisonCacheKey(win, winStart, winEnd);
      const cached = this._comparisonDataCache.get(cacheKey);
      if (cached) {
        cachedResults.push(cached);
      } else {
        windowsToFetch.push({ win, winStart, winEnd });
      }
    }

    if (!windowsToFetch.length) {
      this._lastComparisonResults = this._getResolvedComparisonResults();
      if (redraw && this._lastHistResult && this._lastEvents) {
        this._queueDrawChart(
          this._lastHistResult,
          this._lastStatsResult || {},
          this._lastEvents,
          this._lastT0,
          this._lastT1
        );
      }
      return Promise.resolve(this._lastComparisonResults);
    }

    this._lastComparisonResults = cachedResults.length
      ? this._getResolvedComparisonResults()
      : null;
    if (showLoading) {
      this._setChartLoading(true);
    }
    this.dispatchEvent(
      new CustomEvent("hass-datapoints-comparison-loading", {
        bubbles: true,
        composed: true,
        detail: {
          ids: windowsToFetch.map(({ win }) => win.id).filter(Boolean),
          loading: true,
        },
      })
    );

    return Promise.all(
      windowsToFetch.map(async ({ win, winStart, winEnd }) =>
        this._loadComparisonWindowData(win, winStart, winEnd)
      )
    )
      .then(() => {
        if (comparisonRequestId !== this._comparisonRequestId) {
          return this._lastComparisonResults || [];
        }
        if (
          targetRequestId != null &&
          targetRequestId !== this._loadRequestId
        ) {
          return this._lastComparisonResults || [];
        }
        this._lastComparisonResults = this._getResolvedComparisonResults();
        this.dispatchEvent(
          new CustomEvent("hass-datapoints-comparison-loading", {
            bubbles: true,
            composed: true,
            detail: {
              ids: windowsToFetch.map(({ win }) => win.id).filter(Boolean),
              loading: false,
            },
          })
        );
        if (redraw && this._lastHistResult && this._lastEvents) {
          this._queueDrawChart(
            this._lastHistResult,
            this._lastStatsResult || {},
            this._lastEvents,
            this._lastT0,
            this._lastT1
          );
        } else if (showLoading) {
          this._setChartLoading(false);
        }
        return this._lastComparisonResults;
      })
      .catch(() => {
        if (comparisonRequestId === this._comparisonRequestId) {
          this._lastComparisonResults = [];
          logger.warn("[hass-datapoints history-card] comparison load:failed", {
            comparisonRequestId,
            ids: comparisonWindows.map((win) => win.id).filter(Boolean),
          });
          this.dispatchEvent(
            new CustomEvent("hass-datapoints-comparison-loading", {
              bubbles: true,
              composed: true,
              detail: {
                ids: windowsToFetch.map(({ win }) => win.id).filter(Boolean),
                loading: false,
              },
            })
          );
          if (redraw && this._lastHistResult && this._lastEvents) {
            this._queueDrawChart(
              this._lastHistResult,
              this._lastStatsResult || {},
              this._lastEvents,
              this._lastT0,
              this._lastT1
            );
          } else if (showLoading) {
            this._setChartLoading(false);
          }
        } else if (showLoading) {
          this._setChartLoading(false);
        }
        return [];
      });
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  protected override async _load(): Promise<void> {
    const { start, end } = this._getRange();
    const t0 = start.getTime();
    const t1 = end.getTime();
    const requestId = ++this._loadRequestId;
    this._setChartLoading(true);

    logger.log("[hass-datapoints history-card] load triggered", {
      requestId,
      entityIds: this._entityIds,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const partial: PartialLoadState = {
      histResult: null,
      statsResult: this._statisticsEntityIds.length ? null : {},
      events: null,
      histDone: false,
      statsDone: !this._statisticsEntityIds.length,
      eventsDone: false,
      histFailed: false,
      statsFailed: false,
      eventsFailed: false,
      hasDrawnDrawable: false,
      lastDrawState: null,
      lastDrawQuality: null,
    };

    const logChartRedrawData = (
      reason: string,
      histResult: RecordWithUnknownValues,
      statsResult: RecordWithUnknownValues,
      events: unknown[]
    ): void => {
      logger.log("[hass-datapoints history] redraw data update", {
        reason,
        requestId,
        entityIds: this._entityIds,
        start: start.toISOString(),
        end: end.toISOString(),
        histResult,
        statsResult,
        events,
      });
    };

    const maybeDraw = () => {
      if (requestId !== this._loadRequestId) {
        return;
      }
      const hasDrawableData = this._hasDrawableHistoryData(
        partial.histResult || {},
        partial.statsResult || {}
      );
      const numericRequestsFinished = partial.histDone && partial.statsDone;
      if (!hasDrawableData && !numericRequestsFinished) {
        return;
      }
      if (partial.hasDrawnDrawable) {
        const drawQuality = hasDrawableData
          ? this._getDrawableHistoryQuality(
              partial.histResult || {},
              partial.statsResult || {}
            )
          : null;
        const redrawForHistory =
          hasDrawableData &&
          !partial.lastDrawState?.histDone &&
          partial.histDone;
        const redrawForStats =
          hasDrawableData &&
          !partial.lastDrawState?.statsDone &&
          partial.statsDone;
        const redrawForEvents =
          hasDrawableData &&
          !partial.lastDrawState?.eventsDone &&
          partial.eventsDone;
        const shouldRedraw =
          redrawForHistory || redrawForStats || redrawForEvents;
        const wouldDowngradeDraw =
          !!drawQuality &&
          !!partial.lastDrawQuality &&
          drawQuality.totalPoints < partial.lastDrawQuality.totalPoints;
        if (!shouldRedraw) {
          if (partial.histDone && partial.statsDone && partial.eventsDone) {
            this._setChartLoading(false);
          }
          return;
        }
        if (wouldDowngradeDraw) {
          if (partial.histDone && partial.statsDone && partial.eventsDone) {
            this._setChartLoading(false);
          }
          return;
        }
        if (
          redrawForEvents &&
          !redrawForHistory &&
          this._lastHistResult &&
          Number.isFinite(this._lastT0) &&
          Number.isFinite(this._lastT1)
        ) {
          const filteredEvents = this._filterEvents(partial.events || []);
          logChartRedrawData(
            "events_update",
            this._lastHistResult,
            this._lastStatsResult || {},
            filteredEvents
          );
          partial.lastDrawState = {
            histDone: partial.histDone,
            statsDone: partial.statsDone,
            eventsDone: partial.eventsDone,
          };
          this._queueDrawChart(
            this._lastHistResult,
            this._lastStatsResult || {},
            partial.events || [],
            this._lastT0,
            this._lastT1,
            {
              loading: !(
                partial.histDone &&
                partial.statsDone &&
                partial.eventsDone
              ),
            }
          );
          return;
        }
      }
      if (hasDrawableData) {
        const drawQuality = this._getDrawableHistoryQuality(
          partial.histResult || {},
          partial.statsResult || {}
        );
        partial.hasDrawnDrawable = true;
        partial.lastDrawState = {
          histDone: partial.histDone,
          statsDone: partial.statsDone,
          eventsDone: partial.eventsDone,
        };
        partial.lastDrawQuality = drawQuality;
      }
      const filteredEvents = this._filterEvents(partial.events || []);
      logChartRedrawData(
        partial.hasDrawnDrawable ? "data_update" : "initial_data_draw",
        partial.histResult || {},
        partial.statsResult || {},
        filteredEvents
      );
      this._queueDrawChart(
        partial.histResult || {},
        partial.statsResult || {},
        partial.events || [],
        t0,
        t1,
        {
          loading: !(
            partial.histDone &&
            partial.statsDone &&
            partial.eventsDone
          ),
        }
      );
    };

    const finalize = () => {
      if (requestId !== this._loadRequestId) {
        return;
      }
      if (!(partial.histDone && partial.statsDone && partial.eventsDone)) {
        return;
      }
      if (
        (partial.histFailed && partial.statsFailed) ||
        (partial.histResult == null && partial.statsResult == null)
      ) {
        this._setChartMessage("Failed to load data.");
        this._setChartLoading(false);
        return;
      }
      if (partial.hasDrawnDrawable) {
        this._setChartLoading(false);
      }
      this._preloadComparisonWindows().catch(() => {});
    };

    // Fire-and-forget: comparison windows redraw when done
    this._loadComparisonWindows({ redraw: true, requestId }).catch(() => {});

    try {
      const hass = this._hass;
      if (!hass) {
        this._setChartMessage("Failed to load data.");
        this._setChartLoading(false);
        return;
      }
      fetchHistoryDuringPeriod(
        hass,
        start.toISOString(),
        end.toISOString(),
        this._entityIds,
        {
          include_start_time_state: true,
          significant_changes_only: false,
          no_attributes: true,
        }
      )
        .then((histResult: unknown) => {
          partial.histResult = (histResult as RecordWithUnknownValues) || {};
          partial.histDone = true;
          maybeDraw();
          finalize();
        })
        .catch((err: unknown) => {
          partial.histDone = true;
          partial.histFailed = true;
          logger.error(
            "[hass-datapoints history-card] history load failed",
            err
          );
          maybeDraw();
          finalize();
        });

      if (this._statisticsEntityIds.length) {
        fetchStatisticsDuringPeriod(
          hass,
          start.toISOString(),
          end.toISOString(),
          this._statisticsEntityIds,
          {
            period: "hour",
            types: ["mean"],
            units: {},
          }
        )
          .then((statsResult: unknown) => {
            partial.statsResult =
              (statsResult as RecordWithUnknownValues) || {};
            partial.statsDone = true;
            maybeDraw();
            finalize();
          })
          .catch((err: unknown) => {
            partial.statsDone = true;
            partial.statsFailed = true;
            logger.error(
              "[hass-datapoints history-card] statistics load failed",
              err
            );
            maybeDraw();
            finalize();
          });
      }

      if (this._config.datapoint_scope === "hidden") {
        partial.events = [];
        partial.eventsDone = true;
        maybeDraw();
        finalize();
      } else {
        fetchEvents(
          hass,
          start.toISOString(),
          end.toISOString(),
          this._config.datapoint_scope === "all" ? undefined : this._entityIds
        )
          .then((events: unknown) => {
            partial.events = (events as unknown[]) || [];
            partial.eventsDone = true;
            maybeDraw();
            finalize();
          })
          .catch((err: unknown) => {
            partial.eventsDone = true;
            partial.eventsFailed = true;
            logger.error(
              "[hass-datapoints history-card] event load failed",
              err
            );
            maybeDraw();
            finalize();
          });
      }
    } catch (err) {
      this._setChartMessage("Failed to load data.");
      this._setChartLoading(false);
      logger.error("[hass-datapoints history-card]", err);
    }
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  /** Delegates to the hass-datapoints-history-chart sub-component for resize-replay. */
  protected override _drawChart(...args: unknown[]): void {
    const chartEl = this._chartEl();
    if (chartEl) {
      chartEl.hass = this._hass;
      chartEl._config = this._config;
      chartEl._hiddenSeries = this._hiddenSeries;
      chartEl._hiddenEventIds = this._hiddenEventIds;
      chartEl._zoomRange = this._zoomRange;
      chartEl._lastComparisonResults = this._lastComparisonResults;
      (chartEl._drawChart as (...a: unknown[]) => void)(...args);
    }
  }

  /** Returns the hass-datapoints-history-chart element once it is in the shadow DOM. */
  private _chartEl(): Nullable<HTMLElement & RecordWithUnknownValues> {
    return (
      (this.shadowRoot?.querySelector(
        "hass-datapoints-history-chart"
      ) as HTMLElement & RecordWithUnknownValues) ?? null
    );
  }

  getAiQueryBriefAnomalySnapshot(): Nullable<RecordWithUnknownValues> {
    const chartEl = this._chartEl() as Nullable<
      HTMLElement & {
        getAiQueryBriefAnomalySnapshot?: () => Nullable<RecordWithUnknownValues>;
      }
    >;
    if (!chartEl?.getAiQueryBriefAnomalySnapshot) {
      return null;
    }
    return chartEl.getAiQueryBriefAnomalySnapshot();
  }

  /**
   * Queue a draw cycle. Delegates to hass-datapoints-history-chart and also records last
   * draw args so the base-class ResizeObserver can replay via _drawChart().
   */
  private _queueDrawChart(
    histResult: RecordWithUnknownValues,
    statsResult: RecordWithUnknownValues,
    events: unknown[],
    t0: number,
    t1: number,
    options: DrawOptions = {}
  ): void {
    const drawRequestId = ++this._drawRequestId;
    const filteredEvents = this._filterEvents(events);
    // Persist for resize-triggered redraws
    this._lastHistResult = histResult;
    this._lastStatsResult = statsResult;
    this._lastEvents = events;
    this._lastT0 = t0;
    this._lastT1 = t1;
    this._lastDrawArgs = [
      histResult,
      statsResult,
      events,
      t0,
      t1,
      { ...options, drawRequestId },
    ];

    // Push data and trigger draw on the sub-component
    const chartEl = this._chartEl();
    if (chartEl) {
      chartEl.hass = this._hass;
      chartEl._config = this._config;
      chartEl._hiddenSeries = this._hiddenSeries;
      chartEl._hiddenEventIds = this._hiddenEventIds;
      chartEl._zoomRange = this._zoomRange;
      chartEl._lastComparisonResults = this._lastComparisonResults;
      (chartEl._queueDrawChart as (...a: unknown[]) => void)(
        histResult,
        statsResult,
        filteredEvents,
        t0,
        t1,
        { ...options, drawRequestId }
      );
    }
  }

  // ── Loading/message UI helpers ─────────────────────────────────────────────

  private _setChartLoading(isLoading: boolean): void {
    const chartEl = this._chartEl();
    if (chartEl?._setChartLoading) {
      (chartEl._setChartLoading as (v: boolean) => void)(isLoading);
    }
  }

  private _setChartMessage(message = ""): void {
    const chartEl = this._chartEl();
    if (chartEl?._setChartMessage) {
      (chartEl._setChartMessage as (v: string) => void)(message);
    }
  }

  // ── History data quality helpers ───────────────────────────────────────────

  /**
   * Returns true if there is at least one entity with drawable data points
   * in either the history or statistics result.
   */
  private _hasDrawableHistoryData(
    histResult: RecordWithUnknownValues,
    statsResult: RecordWithUnknownValues
  ): boolean {
    return hasDrawableHistoryData(this._entityIds, histResult, statsResult);
  }

  private _getDrawableHistoryQuality(
    histResult: RecordWithUnknownValues,
    statsResult: RecordWithUnknownValues
  ): { totalPoints: number } {
    return getDrawableHistoryQuality(this._entityIds, histResult, statsResult);
  }

  // ── Event filtering ────────────────────────────────────────────────────────

  private _filterEvents(events: unknown[]): unknown[] {
    return filterEvents(
      events,
      this._hiddenEventIds,
      String(this._config?.message_filter || "")
    );
  }

  private _buildNavigationPageState(): RecordWithUnknownValues {
    const range = this._getRange();
    const fallbackZoomRange =
      typeof this._config.zoom_start_time !== "undefined" &&
      typeof this._config.zoom_end_time !== "undefined"
        ? {
            start: this._config.zoom_start_time as string | number | Date,
            end: this._config.zoom_end_time as string | number | Date,
          }
        : null;
    const targetSelection =
      this._config.target && typeof this._config.target === "object"
        ? normalizeTargetValue(this._config.target)
        : { entity_id: this._entityIds };
    const baseState = buildHistoryPageSessionState({
      _entities: this._entityIds,
      _seriesRows: Array.isArray(this._config.series_settings)
        ? [...(this._config.series_settings as unknown[])]
        : this._entityIds.map((entityId) => ({ entity_id: entityId })),
      _targetSelection: targetSelection as RecordWithUnknownValues,
      _targetSelectionRaw: targetSelection as RecordWithUnknownValues,
      _datapointScope: (this._config.datapoint_scope as string) || "linked",
      _showChartDatapointIcons: this._config.show_event_markers !== false,
      _showChartDatapointLines: this._config.show_event_lines !== false,
      _showChartTooltips: this._config.show_tooltips !== false,
      _showChartEmphasizedHoverGuides:
        this._config.emphasize_hover_guides === true,
      _chartHoverSnapMode:
        (this._config.hover_snap_mode as string) || "follow_series",
      _delinkChartYAxis: this._config.delink_y_axis === true,
      _splitChartView: this._config.split_view === true,
      _showCorrelatedAnomalies: this._config.show_correlated_anomalies === true,
      _chartAnomalyOverlapMode: "all",
      _showDataGaps: this._config.show_data_gaps !== false,
      _dataGapThreshold: (this._config.data_gap_threshold as string) || "2h",
      _contentSplitRatio: 0.62,
      _startTime: range.start,
      _endTime: range.end,
      _chartZoomCommittedRange: this._zoomRange
        ? {
            start: this._zoomRange.start,
            end: this._zoomRange.end,
          }
        : fallbackZoomRange,
      _comparisonWindows: Array.isArray(this._config.comparison_windows)
        ? [...(this._config.comparison_windows as ComparisonWindow[])]
        : [],
      _hours: Number(this._config.hours_to_show || 24),
      _sidebarCollapsed: false,
      _sidebarAccordionTargetsOpen: true,
      _sidebarAccordionDatapointsOpen: true,
      _sidebarAccordionAnalysisOpen: true,
      _sidebarAccordionChartOpen: true,
      _zoomLevel: "auto",
      _dateSnapping: "hour",
      _preferredSeriesColors: {},
    }) as unknown as RecordWithUnknownValues;

    return {
      ...baseState,
      show_chart_trend_lines: this._config.show_trend_lines === true,
      show_chart_summary_stats: this._config.show_summary_stats === true,
      show_chart_rate_of_change: this._config.show_rate_of_change === true,
      show_chart_threshold_analysis:
        this._config.show_threshold_analysis === true,
      show_chart_threshold_shading:
        this._config.show_threshold_shading === true,
      show_chart_anomalies: this._config.show_anomalies === true,
      show_chart_trend_crosshairs: this._config.show_trend_crosshairs === true,
      chart_trend_method:
        (this._config.trend_method as string) || "rolling_average",
      chart_trend_window: (this._config.trend_window as string) || "24h",
      chart_rate_window: (this._config.rate_window as string) || "1h",
      chart_anomaly_sensitivity:
        (this._config.anomaly_sensitivity as string) || "medium",
      chart_threshold_values:
        (this._config.threshold_values as RecordWithUnknownValues) || {},
      chart_threshold_directions:
        (this._config.threshold_directions as RecordWithUnknownValues) || {},
      show_chart_delta_analysis: this._config.show_delta_analysis === true,
      show_chart_delta_tooltip: this._config.show_delta_tooltip !== false,
      show_chart_delta_lines: this._config.show_delta_lines === true,
      hide_chart_source_series: this._config.hide_raw_data === true,
      chart_anomaly_rate_window: (this._config.rate_window as string) || "1h",
    };
  }

  private _navigateToPanel(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const range = this._getRange();
    const zoomStartTime = this._zoomRange?.start
      ? this._zoomRange.start
      : (this._config.zoom_start_time as string | number | Date | undefined);
    const zoomEndTime = this._zoomRange?.end
      ? this._zoomRange.end
      : (this._config.zoom_end_time as string | number | Date | undefined);
    navigateToDataPointsHistory(
      this,
      this._config.target && typeof this._config.target === "object"
        ? (normalizeTargetValue(this._config.target) as RecordWithStringValues)
        : { entity_id: this._entityIds },
      {
        datapoint_scope: (this._config.datapoint_scope as string) || undefined,
        start_time: Number.isFinite(this._lastT0) ? this._lastT0 : range.start,
        end_time: Number.isFinite(this._lastT1) ? this._lastT1 : range.end,
        zoom_start_time: zoomStartTime,
        zoom_end_time: zoomEndTime,
        page_state: this._buildNavigationPageState(),
      }
    );
  }

  // ── Keyboard / scroll handlers ─────────────────────────────────────────────

  private _handleWindowKeyDown(ev: KeyboardEvent): void {
    if (ev.key !== "Escape") {
      return;
    }
    if (this._annotationDialog?.isOpen?.()) {
      ev.preventDefault();
      return;
    }
    if (!this._zoomRange) {
      return;
    }
    ev.preventDefault();
    this._zoomRange = null;
    this._dispatchZoomRange("reset");
  }

  private _handleChartScroll(): void {
    if (this._scrollSyncSuspended || !this._zoomRange) {
      return;
    }
    if (this._ignoreNextProgrammaticScrollEvent) {
      this._ignoreNextProgrammaticScrollEvent = false;
      this._lastProgrammaticScrollLeft = null;
      return;
    }
    if (
      this._lastProgrammaticScrollLeft != null &&
      Math.abs(
        ((this._chartScrollViewportEl as HTMLElement)?.scrollLeft || 0) -
          this._lastProgrammaticScrollLeft
      ) < 1
    ) {
      this._lastProgrammaticScrollLeft = null;
      return;
    }
    this._lastProgrammaticScrollLeft = null;
  }

  private _dispatchZoomRange(source: string): void {
    // Dispatch using the event name the panel listens for so it can keep
    // _chartZoomCommittedRange in sync. Without this, every _renderContent()
    // call (e.g. on data refresh) would pass zoom_start_time: null → setConfig
    // resets _zoomRange → zoom is lost on the next data update.
    this.dispatchEvent(
      new CustomEvent("hass-datapoints-chart-zoom", {
        bubbles: true,
        composed: true,
        detail: this._zoomRange
          ? {
              startTime: this._zoomRange.start,
              endTime: this._zoomRange.end,
              preview: false,
              source,
            }
          : {
              startTime: null,
              endTime: null,
              preview: false,
              source,
            },
      })
    );
  }

  private _scheduleZoomReload(): void {
    if (this._zoomReloadTimer != null) {
      window.clearTimeout(this._zoomReloadTimer);
    }
    this._zoomReloadTimer = window.setTimeout(() => {
      this._zoomReloadTimer = null;
      this._load();
    }, 140);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    return html`
      <ha-card>
        ${this._config?.title
          ? html`
              <h1 class="card-header">
                <span class="card-header-title"
                  >${this._config.title as string}</span
                >
                <ha-icon-button
                  class="card-header-action"
                  .label=${"Open in Data Points"}
                  @click=${this._navigateToPanel}
                >
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </ha-icon-button>
              </h1>
            `
          : ""}
        <hass-datapoints-history-chart></hass-datapoints-history-chart>
      </ha-card>
    `;
  }

  // ── Static API ─────────────────────────────────────────────────────────────

  static override getStubConfig(): CardConfig {
    return {
      title: "History with Events",
      entity: "sensor.example",
      hours_to_show: 24,
    };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("hass-datapoints-history-card-editor");
  }
}

customElements.define(
  "hass-datapoints-history-card",
  HassDatapointsHistoryCard
);
