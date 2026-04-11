import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as historyApi from "@/lib/data/history-api";
import "../history-chart";

type HistoryChartEl = HTMLElement & {
  _hiddenSeries: Set<string>;
  _config?: RecordWithUnknownValues;
  _hass?: Nullable<RecordWithUnknownValues>;
  _drawRecordedEventPoints(
    renderer: unknown,
    visibleSeries: unknown[],
    events: unknown[],
    t0: number,
    t1: number,
    opts: RecordWithUnknownValues
  ): Array<{ event: { id: string }; value: number; unit: string }>;
  _getDrawableComparisonResults(
    comparisonResults: Array<{
      id: string;
      time_offset_ms: number;
      histResult: unknown;
      statsResult: unknown;
      label?: string;
    }>
  ): Array<{
    id: string;
    time_offset_ms: number;
    histResult: unknown;
    statsResult: unknown;
    label?: string;
  }>;
  _resolveComparisonWindowPoints(
    entityId: string,
    comparisonWindow: {
      id: string;
      time_offset_ms: number;
      histResult: unknown;
      statsResult: unknown;
      label?: string;
    },
    analysis: RecordWithUnknownValues,
    renderT0: number,
    renderT1: number
  ): Promise<[number, number][]>;
  _renderLegend(series: unknown[], binaryBackgrounds: unknown[]): void;
  _syncTopSlotOffset(): void;
  _syncChartViewportScroll(t0: number, t1: number, canvasWidth: number): void;
  _resolveAnomalyClusterDisplay(
    anomalyClusters: unknown[],
    overlapMode: Nullable<string> | undefined,
    correlatedSpans?: Array<{ start: number; end: number }>
  ): {
    baseClusters: unknown[];
    regionClusters: unknown[];
    showCorrelatedSpans: boolean;
  };
  _getComparisonWindowLineStyle(
    isHovered: boolean,
    isSelected: boolean,
    hoveringDifferentComparison: boolean
  ): {
    lineOpacity: number;
    lineWidth?: number;
    dashed: boolean;
    dashPattern?: number[];
    hoverOpacity: number;
  };
  _filterClustersByCorrelatedSpans(
    anomalyClusters: unknown[],
    correlatedSpans: Array<{ start: number; end: number }>
  ): unknown[];
  _buildAnalysisCacheKey(
    visibleSeries: Array<{
      entityId: string;
      pts: [number, number][];
    }>,
    selectedComparisonSeriesMap: Map<
      string,
      { entityId: string; pts: [number, number][] }
    >,
    analysisMap: Map<string, RecordWithUnknownValues>,
    allComparisonWindowsData: Record<
      string,
      Record<string, [number, number][]>
    >,
    t0: number,
    t1: number
  ): string;
};

describe("hass-datapoints-history-chart", () => {
  let el: HistoryChartEl;

  beforeEach(() => {
    el = document.createElement(
      "hass-datapoints-history-chart"
    ) as HistoryChartEl;
    el._hiddenSeries = new Set();
    document.body.appendChild(el);
  });

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN the history chart disconnects", () => {
    describe("WHEN disconnectedCallback runs", () => {
      it("THEN it tears down listeners and timers", () => {
        expect.assertions(6);
        const hoverCleanup = vi.fn();
        const zoomCleanup = vi.fn();
        const removeEventListener = vi.fn();
        const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
        const viewport = {
          removeEventListener,
        } as unknown as HTMLElement;

        el._chartHoverCleanup = hoverCleanup;
        el._chartZoomCleanup = zoomCleanup;
        el._chartScrollViewportEl = viewport;
        el._scrollZoomApplyTimer = setTimeout(() => {}, 1000);

        el.disconnectedCallback();

        expect(hoverCleanup).toHaveBeenCalledTimes(1);
        expect(zoomCleanup).toHaveBeenCalledTimes(1);
        expect(removeEventListener).toHaveBeenCalledTimes(1);
        expect(el._chartHoverCleanup).toBeNull();
        expect(el._chartZoomCleanup).toBeNull();
        expect(clearTimeoutSpy).toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN the chart shell is initialized", () => {
    describe("WHEN the top slot host is inspected", () => {
      it("THEN it renders the comparison tab mount point", () => {
        expect.assertions(5);
        const topSlot = el.querySelector<HTMLElement>("#chart-top-slot");

        expect(topSlot).not.toBeNull();
        expect(topSlot?.classList.contains("chart-top-slot")).toBe(true);
        expect(topSlot?.hasAttribute("hidden")).toBe(true);
        expect(el.innerHTML).toContain(
          "margin-left: calc(var(--dp-spacing-md) * -1);"
        );
        expect(el.innerHTML).toContain(
          "top: calc(var(--dp-chart-top-slot-height, 0px) + var(--dp-spacing-sm));"
        );
      });
    });
  });

  describe("GIVEN cached comparison results include preloaded windows", () => {
    describe("WHEN resolving drawable comparison results", () => {
      it("THEN it keeps only the actively previewed windows", () => {
        expect.assertions(1);
        el._config = {
          comparison_windows: [{ id: "active-window" }],
        };

        const drawableResults = el._getDrawableComparisonResults([
          {
            id: "active-window",
            time_offset_ms: 0,
            histResult: {},
            statsResult: {},
            label: "Active",
          },
          {
            id: "preloaded-window",
            time_offset_ms: 1000,
            histResult: {},
            statsResult: {},
            label: "Preloaded",
          },
        ]);

        expect(drawableResults.map((result) => result.id)).toEqual([
          "active-window",
        ]);
      });

      it("THEN it includes a hovered preloaded window without drawing every cached preload", () => {
        expect.assertions(1);
        el._config = {
          comparison_windows: [],
          hovered_comparison_window_id: "hovered-window",
        };

        const drawableResults = el._getDrawableComparisonResults([
          {
            id: "hovered-window",
            time_offset_ms: 0,
            histResult: {},
            statsResult: {},
            label: "Hovered",
          },
          {
            id: "preloaded-window",
            time_offset_ms: 1000,
            histResult: {},
            statsResult: {},
            label: "Preloaded",
          },
        ]);

        expect(drawableResults.map((result) => result.id)).toEqual([
          "hovered-window",
        ]);
      });
    });
  });

  describe("GIVEN a comparison window uses sampled series settings", () => {
    describe("WHEN resolving its chart points", () => {
      it("THEN it fetches downsampled history and shifts the timestamps back to the main range", async () => {
        expect.assertions(2);
        const fetchSpy = vi
          .spyOn(historyApi, "fetchDownsampledHistory")
          .mockResolvedValue([[3_600_000, 12]]);
        el._hass = { connection: {} };

        const points = await el._resolveComparisonWindowPoints(
          "sensor.temperature",
          {
            id: "window-a",
            time_offset_ms: 3_600_000,
            histResult: {},
            statsResult: {},
            label: "Window A",
          },
          {
            sample_interval: "1h",
            sample_aggregate: "mean",
          },
          0,
          7_200_000
        );

        expect(fetchSpy).toHaveBeenCalledWith(
          el._hass,
          "sensor.temperature",
          new Date(3_600_000).toISOString(),
          new Date(10_800_000).toISOString(),
          "1h",
          "mean"
        );
        expect(points).toEqual([[0, 12]]);
      });
    });
  });

  describe("GIVEN sampled comparison data is unavailable", () => {
    describe("WHEN resolving comparison points", () => {
      it.todo(
        "THEN it falls back to the raw comparison series instead of hiding the line",
        async () => {
          expect.assertions(2);
          const fetchSpy = vi
            .spyOn(historyApi, "fetchDownsampledHistory")
            .mockResolvedValue([]);
          el._hass = { connection: {} };
          el._buildEntityStateList = () => [
            { lu: 3600, s: "12" },
            { lu: 7200, s: "13" },
          ];

          const points = await el._resolveComparisonWindowPoints(
            "sensor.temperature",
            {
              id: "window-a",
              time_offset_ms: 3_600_000,
              histResult: {},
              statsResult: {},
              label: "Window A",
            },
            {
              sample_interval: "1h",
              sample_aggregate: "mean",
            },
            0,
            7_200_000
          );

          expect(fetchSpy).toHaveBeenCalledTimes(1);
          expect(points).toEqual([
            [0, 12],
            [3_600_000, 13],
          ]);
        }
      );

      it.todo(
        "THEN it re-aggregates the available raw comparison points to the requested interval",
        async () => {
          expect.assertions(2);
          vi.spyOn(historyApi, "fetchDownsampledHistory").mockResolvedValue([]);
          el._hass = { connection: {} };
          el._buildEntityStateList = () => [
            { lu: 3600, s: "12" },
            { lu: 7200, s: "18" },
            { lu: 10800, s: "6" },
          ];

          const points = await el._resolveComparisonWindowPoints(
            "sensor.temperature",
            {
              id: "window-a",
              time_offset_ms: 3_600_000,
              histResult: {},
              statsResult: {},
              label: "Window A",
            },
            {
              sample_interval: "3h",
              sample_aggregate: "mean",
            } as never,
            0,
            10_800_000
          );

          expect(points).toHaveLength(1);
          expect(points[0]).toEqual([0, 12]);
        }
      );
    });
  });

  describe("GIVEN a hovered record event id is configured", () => {
    describe("WHEN drawing recorded event points", () => {
      it("THEN it draws an emphasized highlight dot for that event", () => {
        expect.assertions(2);
        const arcSpy = vi.fn();
        const renderer = {
          ctx: {
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            arc: arcSpy,
            fill: vi.fn(),
            stroke: vi.fn(),
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 0,
          },
          xOf: vi.fn(() => 42),
          yOf: vi.fn(() => 24),
          pad: { top: 12, left: 8 },
          ch: 120,
          _interpolateValue: vi.fn(() => 21.5),
        };
        el._config = {
          hovered_event_ids: ["evt-1"],
        };

        const hits = el._drawRecordedEventPoints(
          renderer as never,
          [
            {
              entityId: "sensor.temperature",
              pts: [[1_000, 21.5]],
              axis: { min: 0, max: 30 },
              unit: "°C",
              color: "#03a9f4",
            },
          ],
          [
            {
              id: "evt-1",
              timestamp: new Date(1_000).toISOString(),
              entity_ids: ["sensor.temperature"],
              color: "#03a9f4",
            },
          ],
          0,
          2_000,
          {}
        );

        expect(arcSpy.mock.calls.some((call) => call[2] === 18)).toBe(true);
        expect(hits).toHaveLength(1);
      });
    });
  });

  describe("GIVEN comparison window line styling", () => {
    describe("WHEN the date window is hovered", () => {
      it("THEN it returns the same solid line style used by the normal chart", () => {
        expect.assertions(1);
        expect(el._getComparisonWindowLineStyle(true, false, false)).toEqual({
          lineOpacity: 1,
          dashed: false,
          hoverOpacity: 0.85,
        });
      });
    });

    describe("WHEN a different date window is hovered while one is selected", () => {
      it("THEN it returns the dimmed selected-window style used across chart modes", () => {
        expect.assertions(1);
        expect(el._getComparisonWindowLineStyle(false, true, true)).toEqual({
          lineOpacity: 0.25,
          lineWidth: 1.25,
          dashed: false,
          hoverOpacity: 0.25,
        });
      });
    });
  });

  describe("GIVEN anomaly detection sampling is toggled", () => {
    describe("WHEN building the analysis cache key", () => {
      it("THEN the cache key changes when anomaly_use_sampled_data changes", () => {
        expect.assertions(2);
        const visibleSeries = [
          {
            entityId: "sensor.temperature",
            pts: [
              [0, 20],
              [1_000, 21],
            ] as [number, number][],
          },
        ];
        const baseAnalysis = new Map([
          [
            "sensor.temperature",
            {
              show_anomalies: true,
              anomaly_methods: ["iqr"],
              anomaly_use_sampled_data: true,
            },
          ],
        ]);
        const rawAnalysis = new Map([
          [
            "sensor.temperature",
            {
              show_anomalies: true,
              anomaly_methods: ["iqr"],
              anomaly_use_sampled_data: false,
            },
          ],
        ]);

        const sampledKey = el._buildAnalysisCacheKey(
          visibleSeries,
          new Map(),
          baseAnalysis,
          {},
          0,
          1_000
        );
        const rawKey = el._buildAnalysisCacheKey(
          visibleSeries,
          new Map(),
          rawAnalysis,
          {},
          0,
          1_000
        );

        expect(sampledKey).not.toBe(rawKey);
        expect(sampledKey.includes("true") || rawKey.includes("false")).toBe(
          true
        );
      });
    });
  });

  describe("GIVEN anomaly overlap display modes", () => {
    const clusters = [
      { id: "normal", isOverlap: false },
      { id: "overlap", isOverlap: true },
    ];

    describe("WHEN overlap mode is all", () => {
      it("THEN all clusters are rendered with no correlated span highlights", () => {
        expect.assertions(3);

        const result = el._resolveAnomalyClusterDisplay(clusters, "all");

        expect(result.baseClusters).toEqual(clusters);
        expect(result.showCorrelatedSpans).toBe(false);
        expect(result.regionClusters).toEqual(clusters);
      });
    });

    describe("WHEN overlap mode is only", () => {
      it("THEN only overlap clusters remain visible", () => {
        expect.assertions(3);

        const result = el._resolveAnomalyClusterDisplay(clusters, "only", [
          { start: 10, end: 20 },
        ]);

        expect(result.baseClusters).toEqual([]);
        expect(result.showCorrelatedSpans).toBe(true);
        expect(result.regionClusters).toEqual([]);
      });
    });

    describe("WHEN overlap mode is only and correlated spans match multiple series clusters", () => {
      it("THEN it keeps the clusters that intersect the correlated spans regardless of local isOverlap flags", () => {
        expect.assertions(1);

        const result = el._filterClustersByCorrelatedSpans(
          [
            {
              id: "series-a",
              isOverlap: false,
              points: [{ timeMs: 100 }, { timeMs: 200 }],
            },
            {
              id: "series-b",
              isOverlap: true,
              points: [{ timeMs: 110 }, { timeMs: 210 }],
            },
            {
              id: "outside",
              isOverlap: true,
              points: [{ timeMs: 400 }, { timeMs: 500 }],
            },
          ],
          [{ start: 90, end: 220 }]
        );

        expect(result.map((item) => (item as { id: string }).id)).toEqual([
          "series-a",
          "series-b",
        ]);
      });
    });
  });

  describe("GIVEN the comparison tab rail is visible", () => {
    describe("WHEN syncing the top slot offset", () => {
      it("THEN it stores the top slot height on the chart host", () => {
        expect.assertions(1);
        const topSlot = el.querySelector<HTMLElement>("#chart-top-slot")!;
        topSlot.hidden = false;
        Object.defineProperty(topSlot, "offsetHeight", {
          configurable: true,
          value: 54,
        });

        el._syncTopSlotOffset();

        expect(el.style.getPropertyValue("--dp-chart-top-slot-height")).toBe(
          "54px"
        );
      });
    });
  });

  describe("GIVEN legend items are rendered", () => {
    beforeEach(() => {
      el._renderLegend(
        [
          {
            entityId: "sensor.temperature",
            label: "Temperature",
            color: "#83c705",
          },
        ],
        []
      );
    });

    describe("WHEN the legend markup is inspected", () => {
      it("THEN it renders a swatch and label inside the legend toggle", () => {
        expect.assertions(6);
        const toggle = el.querySelector<HTMLElement>(".legend-toggle");
        const line = el.querySelector<HTMLElement>(".legend-line");
        const label = el.querySelector<HTMLElement>(".legend-label");
        const legend = el.querySelector<HTMLElement>(".legend");

        legend!.style.setProperty("--dp-chart-axis-left-width", "24px");

        expect(toggle).not.toBeNull();
        expect(line).not.toBeNull();
        expect(label?.textContent).toBe("Temperature");
        expect(getComputedStyle(toggle!).display).toBe("inline-flex");
        expect(getComputedStyle(line!).display).toBe("inline-block");
        expect(el.innerHTML).toContain(
          "padding-left: calc(var(--dp-spacing-md) + var(--dp-chart-axis-left-width, 0px));"
        );
      });
    });
  });

  describe("GIVEN chart axis overlay widths are updated", () => {
    describe("WHEN the host receives the axis width variable", () => {
      it("THEN the legend offset variable is stored on the chart host", () => {
        expect.assertions(2);
        el.style.setProperty("--dp-chart-axis-left-width", "28px");
        el.style.setProperty("--dp-chart-axis-right-width", "0px");

        expect(el.style.getPropertyValue("--dp-chart-axis-left-width")).toBe(
          "28px"
        );
        expect(el.style.getPropertyValue("--dp-chart-axis-right-width")).toBe(
          "0px"
        );
      });
    });
  });

  describe("GIVEN the split chart add-annotation button exists", () => {
    beforeEach(() => {
      const addButton = el.querySelector<HTMLElement>("#chart-add-annotation");
      addButton?.removeAttribute("hidden");
      el._chartLastHover = { timeMs: 1 };
    });

    describe("WHEN the overlay mouse leaves onto the add button", () => {
      it("THEN the current hover state is preserved", () => {
        expect.assertions(1);
        const addButton = el.querySelector<HTMLElement>(
          "#chart-add-annotation"
        )!;
        const onMouseLeave = (ev: MouseEvent) => {
          const nextTarget = ev.relatedTarget;
          const button = el.querySelector("#chart-add-annotation");
          if (
            nextTarget &&
            button instanceof HTMLElement &&
            button.contains(nextTarget as Node)
          ) {
            return;
          }
          el._chartLastHover = null;
        };

        onMouseLeave({ relatedTarget: addButton } as MouseEvent);

        expect(el._chartLastHover).toEqual({ timeMs: 1 });
      });
    });
  });

  describe("GIVEN a zoomed chart redraws after scrolling", () => {
    describe("WHEN the recomputed scroll position differs only by a tiny amount", () => {
      it("THEN it keeps the user's final scroll position", () => {
        expect.assertions(3);
        const viewport = document.createElement("div");
        Object.defineProperty(viewport, "clientWidth", {
          configurable: true,
          value: 400,
        });
        viewport.scrollLeft = 301.5;
        el._chartScrollViewportEl = viewport;
        el._zoomRange = {
          start: 300,
          end: 700,
        } as never;

        el._syncChartViewportScroll(0, 1000, 1001);

        expect(viewport.scrollLeft).toBe(301.5);
        expect(el._scrollSyncSuspended).toBe(false);
        expect(el._ignoreNextProgrammaticScrollEvent).toBe(false);
      });
    });

    describe("WHEN a user scroll has just dispatched zoom-apply", () => {
      it("THEN it does not resnap the viewport on the next redraw", () => {
        expect.assertions(3);
        const viewport = document.createElement("div");
        Object.defineProperty(viewport, "clientWidth", {
          configurable: true,
          value: 400,
        });
        viewport.scrollLeft = 275;
        el._chartScrollViewportEl = viewport;
        el._zoomRange = {
          start: 300,
          end: 700,
        } as never;
        el._skipNextScrollViewportSync = true;

        el._syncChartViewportScroll(0, 1000, 1001);

        expect(viewport.scrollLeft).toBe(275);
        expect(el._skipNextScrollViewportSync).toBe(false);
        expect(el._scrollSyncSuspended).toBe(false);
      });
    });

    describe("WHEN a follow-up redraw fires with no skip flag set", () => {
      it("THEN it syncs the viewport to the computed scroll position", () => {
        expect.assertions(2);
        const viewport = document.createElement("div");
        Object.defineProperty(viewport, "clientWidth", {
          configurable: true,
          value: 400,
        });
        viewport.scrollLeft = 333;
        el._chartScrollViewportEl = viewport;
        el._zoomRange = {
          start: 300,
          end: 700,
        } as never;

        el._syncChartViewportScroll(0, 1000, 1001);

        expect(viewport.scrollLeft).toBe(300.3);
        expect(el._skipNextScrollViewportSync).toBe(false);
      });
    });
  });
});
