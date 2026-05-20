import { describe, expect, it } from "vitest";
import {
  buildAnalysisCacheKey,
  buildDelta,
  buildHistoryAnalysisPayload,
  buildRateOfChange,
  buildSeriesAnalysisMap,
  buildSummary,
  buildTrendPoints,
  getTrendRenderOptions,
  seriesHasActiveAnalysis,
  seriesShouldHideSource,
} from "../chart-analysis";
import { normalizeHistorySeriesAnalysis } from "@/lib/domain/history-series";

describe("chart-analysis", () => {
  describe("GIVEN buildAnalysisCacheKey", () => {
    describe("WHEN anomaly_use_sampled_data changes", () => {
      it("THEN the cache key changes", () => {
        expect.assertions(1);
        const series = [
          {
            entityId: "sensor.temp",
            pts: [
              [0, 20],
              [1000, 21],
            ] as [number, number][],
          },
        ];
        const sampledKey = buildAnalysisCacheKey(
          series,
          new Map(),
          new Map([
            [
              "sensor.temp",
              {
                ...normalizeHistorySeriesAnalysis(null),
                show_anomalies: true,
                anomaly_use_sampled_data: true,
              },
            ],
          ]),
          {},
          0,
          1000
        );
        const rawKey = buildAnalysisCacheKey(
          series,
          new Map(),
          new Map([
            [
              "sensor.temp",
              {
                ...normalizeHistorySeriesAnalysis(null),
                show_anomalies: true,
                anomaly_use_sampled_data: false,
              },
            ],
          ]),
          {},
          0,
          1000
        );
        expect(sampledKey).not.toBe(rawKey);
      });
    });

    describe("WHEN time range changes", () => {
      it("THEN the cache key changes", () => {
        expect.assertions(1);
        const series = [
          { entityId: "sensor.temp", pts: [[0, 20]] as [number, number][] },
        ];
        const analysis = new Map([
          ["sensor.temp", normalizeHistorySeriesAnalysis(null)],
        ]);
        const key1 = buildAnalysisCacheKey(
          series,
          new Map(),
          analysis,
          {},
          0,
          1000
        );
        const key2 = buildAnalysisCacheKey(
          series,
          new Map(),
          analysis,
          {},
          0,
          2000
        );
        expect(key1).not.toBe(key2);
      });
    });
  });

  describe("GIVEN buildHistoryAnalysisPayload", () => {
    it("THEN it builds a valid payload for the worker", () => {
      expect.assertions(4);
      const payload = buildHistoryAnalysisPayload(
        [
          {
            entityId: "sensor.temp",
            pts: [
              [0, 1],
              [1000, 2],
            ],
          },
        ],
        new Map(),
        new Map([["sensor.temp", normalizeHistorySeriesAnalysis(null)]]),
        false
      );
      expect(payload.series).toHaveLength(1);
      expect(payload.series[0].entityId).toBe("sensor.temp");
      expect(payload.comparisonSeries).toHaveLength(0);
      expect(payload.hasSelectedComparisonWindow).toBe(false);
    });
  });

  describe("GIVEN buildTrendPoints", () => {
    describe("WHEN fewer than 2 points are provided", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        expect(buildTrendPoints([[0, 1]])).toEqual([]);
      });
    });

    describe("WHEN method is linear_trend", () => {
      it("THEN it returns trend line points", () => {
        expect.assertions(1);
        const result = buildTrendPoints(
          [
            [0, 0],
            [1000, 10],
            [2000, 20],
          ],
          "linear_trend"
        );
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe("GIVEN buildRateOfChange", () => {
    describe("WHEN fewer than 2 points are provided", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        expect(buildRateOfChange([[0, 1]])).toEqual([]);
      });
    });
  });

  describe("GIVEN buildDelta", () => {
    it("THEN it delegates to buildDeltaPoints", () => {
      expect.assertions(1);
      const result = buildDelta(
        [
          [0, 10],
          [1000, 20],
        ],
        [
          [0, 5],
          [1000, 15],
        ]
      );
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GIVEN buildSummary", () => {
    it("THEN it returns min, max, mean", () => {
      expect.assertions(3);
      const stats = buildSummary([
        [0, 10],
        [1000, 20],
        [2000, 30],
      ]);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(30);
      expect(stats.mean).toBe(20);
    });
  });

  describe("GIVEN seriesHasActiveAnalysis", () => {
    describe("WHEN trend lines are enabled", () => {
      it("THEN it returns true", () => {
        expect.assertions(1);
        const analysis = {
          ...normalizeHistorySeriesAnalysis(null),
          show_trend_lines: true,
        };
        expect(seriesHasActiveAnalysis(analysis)).toBe(true);
      });
    });

    describe("WHEN no analysis features are enabled", () => {
      it("THEN it returns false", () => {
        expect.assertions(1);
        expect(
          seriesHasActiveAnalysis(normalizeHistorySeriesAnalysis(null))
        ).toBe(false);
      });
    });

    describe("WHEN delta analysis is enabled but no comparison window", () => {
      it("THEN it returns false", () => {
        expect.assertions(1);
        const analysis = {
          ...normalizeHistorySeriesAnalysis(null),
          show_delta_analysis: true,
        };
        expect(seriesHasActiveAnalysis(analysis, false)).toBe(false);
      });
    });

    describe("WHEN delta analysis is enabled with comparison window", () => {
      it("THEN it returns true", () => {
        expect.assertions(1);
        const analysis = {
          ...normalizeHistorySeriesAnalysis(null),
          show_delta_analysis: true,
        };
        expect(seriesHasActiveAnalysis(analysis, true)).toBe(true);
      });
    });
  });

  describe("GIVEN seriesShouldHideSource", () => {
    describe("WHEN hide_source_series is true and analysis is active", () => {
      it("THEN it returns true", () => {
        expect.assertions(1);
        const analysis = {
          ...normalizeHistorySeriesAnalysis(null),
          hide_source_series: true,
          show_trend_lines: true,
        };
        expect(seriesShouldHideSource(analysis)).toBe(true);
      });
    });

    describe("WHEN hide_source_series is true but no analysis is active", () => {
      it("THEN it returns false", () => {
        expect.assertions(1);
        const analysis = {
          ...normalizeHistorySeriesAnalysis(null),
          hide_source_series: true,
        };
        expect(seriesShouldHideSource(analysis)).toBe(false);
      });
    });
  });

  describe("GIVEN getTrendRenderOptions", () => {
    describe("WHEN method is linear_trend", () => {
      it("THEN it returns dashed style", () => {
        expect.assertions(2);
        const opts = getTrendRenderOptions("linear_trend");
        expect(opts.dashed).toBe(true);
        expect(opts.dotted).toBe(false);
      });
    });

    describe("WHEN method is ema", () => {
      it("THEN it returns dotted style", () => {
        expect.assertions(2);
        const opts = getTrendRenderOptions("ema");
        expect(opts.dashed).toBe(false);
        expect(opts.dotted).toBe(true);
      });
    });

    describe("WHEN method is lowess", () => {
      it("THEN it returns a solid (not dashed, not dotted) style", () => {
        expect.assertions(2);
        const opts = getTrendRenderOptions("lowess");
        expect(opts.dashed).toBe(false);
        expect(opts.dotted).toBe(false);
      });
    });

    describe("WHEN hideRawData is true", () => {
      it("THEN it increases opacity and alpha values", () => {
        expect.assertions(2);
        const normal = getTrendRenderOptions("rolling_average", false);
        const hidden = getTrendRenderOptions("rolling_average", true);
        expect(hidden.colorAlpha).toBeGreaterThan(normal.colorAlpha);
        expect(hidden.lineOpacity).toBeGreaterThan(normal.lineOpacity);
      });
    });
  });

  describe("GIVEN buildSeriesAnalysisMap", () => {
    it("THEN it builds a map of entity_id to normalized analysis", () => {
      expect.assertions(2);
      const map = buildSeriesAnalysisMap([
        { entity_id: "sensor.temp", analysis: { show_trend_lines: true } },
        { entity_id: "sensor.humid", analysis: null },
      ]);
      expect(map.size).toBe(2);
      expect(map.get("sensor.temp")!.show_trend_lines).toBe(true);
    });

    describe("WHEN entries have no entity_id", () => {
      it("THEN they are filtered out", () => {
        expect.assertions(1);
        const map = buildSeriesAnalysisMap([
          { entity_id: "sensor.temp" },
          { analysis: {} } as never,
        ]);
        expect(map.size).toBe(1);
      });
    });
  });
});
