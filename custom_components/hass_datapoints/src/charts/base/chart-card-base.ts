import { LitElement } from "lit";
import { DOMAIN } from "@/constants";
import type { CardConfig, HassLike } from "@/lib/types";
import { logger } from "@/lib/logger";

/**
 * ChartCardBase – shared LitElement base class for history and statistics
 * chart cards.
 *
 * Handles:
 *  • hass setter + requestUpdate plumbing
 *  • Auto-refresh via HA domain event subscription + window custom event
 *  • ResizeObserver to redraw the chart when the container resizes
 *  • _scheduleLoad() — rAF-deferred load with in-flight guard
 *
 * Subclasses must implement:
 *  • render()        — Lit template (must include a `.chart-wrap` element)
 *  • _load()         — async data fetch + draw
 *  • _drawChart()    — (re-)draw the canvas chart; called by ResizeObserver
 */
export abstract class ChartCardBase extends LitElement {
  // ── Protected state accessible to subclasses ─────────────────────────────

  protected _hass: HassLike | undefined;

  protected _config: CardConfig = {};

  protected _loadRequestId = 0;

  /** Subclasses store their last draw call arguments here so the
   *  ResizeObserver can re-invoke _drawChart with the same data. */
  _lastDrawArgs: unknown[] = [];

  /** Tracks the last data point per series to detect new points for blip animations.
   *  Map of entityId → { t: timestamp, v: value } */
  _previousSeriesEndpoints: Map<string, { t: number; v: number }> = new Map();

  // ── Private lifecycle state ───────────────────────────────────────────────

  private _unsubscribe: NullableCleanup = null;

  private _resizeObserver: Nullable<ResizeObserver> = null;

  private _loadRaf: Nullable<number> = null;

  private _loadInFlight = false;

  private _hasStartedInitialLoad = false;

  private _windowListener: NullableCleanup = null;

  /** True once _setupAutoRefresh and _setupResizeObserver have been called. */
  private _initialized = false;

  // ── Lovelace API ──────────────────────────────────────────────────────────

  setConfig(config: CardConfig): void {
    this._config = config ?? {};
    this.requestUpdate();
  }

  set hass(hass: HassLike) {
    this._hass = hass;
    this.requestUpdate();
    // Subsequent hass updates (after initial load) should trigger a reload.
    // The initial load is triggered by updated() when hass first becomes available.
    if (this._hasStartedInitialLoad) {
      this._scheduleLoad();
    }
  }

  get hass(): HassLike {
    return this._hass!;
  }

  // ── Abstract interface for subclasses ─────────────────────────────────────

  protected abstract _load(): Promise<void>;

  /** Called by the ResizeObserver with the last arguments passed to _drawChart.
   *  Subclasses should also call `this._lastDrawArgs = args` inside _drawChart
   *  so the base can replay the draw on resize. */
  protected abstract _drawChart(...args: unknown[]): void;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback(): void {
    super.connectedCallback();
    if (this._initialized) {
      if (!this._unsubscribe || !this._windowListener) {
        this._setupAutoRefresh();
      }
      this._setupResizeObserver();
    }
    // Re-added to DOM after removal: kick off a load if we have hass.
    if (this._hass) {
      this._scheduleLoad();
    }
  }

  updated(): void {
    // One-time setup: runs the first time hass becomes available (regardless
    // of whether hass was set before or after the element connected to the DOM).
    if (!this._initialized && this._hass) {
      this._initialized = true;
      this._setupAutoRefresh();
      this._setupResizeObserver();
      this._scheduleLoad();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanup();
  }

  // ── Scheduling ────────────────────────────────────────────────────────────

  protected _scheduleLoad(): void {
    if (!this._hass || this._loadRaf !== null || this._loadInFlight) return;
    this._loadRaf = window.requestAnimationFrame(() => {
      this._loadRaf = null;
      if (!this._hass || !this.isConnected || this._loadInFlight) return;
      this._hasStartedInitialLoad = true;
      this._loadInFlight = true;
      Promise.resolve(this._load())
        .catch((err: unknown) => {
          logger.error("[hass-datapoints chart-base] load failed", err);
        })
        .finally(() => {
          this._loadInFlight = false;
        });
    });
  }

  // ── Setup helpers ─────────────────────────────────────────────────────────

  private _setupAutoRefresh(): void {
    if (!this._hass) return;
    if (this._unsubscribe || this._windowListener) return;

    this._hass.connection
      .subscribeEvents(() => {
        this._scheduleLoad();
      }, `${DOMAIN}_event_recorded`)
      .then((unsub) => {
        this._unsubscribe = unsub as () => void;
      })
      .catch(() => {});

    this._windowListener = () => {
      this._scheduleLoad();
    };
    window.addEventListener(
      "hass-datapoints-event-recorded",
      this._windowListener
    );
  }

  private _setupResizeObserver(): void {
    if (this._resizeObserver) return;
    // Observe either the .chart-wrap div (legacy) or hass-datapoints-history-chart element
    // (new architecture where the sub-component is the chart container).
    const wrap =
      this.shadowRoot?.querySelector(".chart-wrap") ??
      this.shadowRoot?.querySelector("hass-datapoints-history-chart");
    if (!wrap || !window.ResizeObserver) return;
    this._resizeObserver = new ResizeObserver(() => {
      if (this._lastDrawArgs.length) {
        this._drawChart(...this._lastDrawArgs);
      }
    });
    this._resizeObserver.observe(wrap);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  private _cleanup(): void {
    if (this._loadRaf !== null) {
      window.cancelAnimationFrame(this._loadRaf);
      this._loadRaf = null;
    }
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
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  // ── Static API ────────────────────────────────────────────────────────────

  static getStubConfig(): CardConfig {
    return { title: "" };
  }
}
