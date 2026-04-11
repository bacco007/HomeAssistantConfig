import { describe, expect, it } from "vitest";

import {
  buildDeltaPoints,
  buildEmaTrend,
  buildLinearTrend,
  buildLowessTrend,
  buildPolynomialTrend,
  buildRateOfChangePoints,
  buildRollingAverageTrend,
  buildSummaryStats,
  buildTrendPoints,
  computeHistoryAnalysis,
  getEmaAlpha,
  getTrendWindowMs,
  interpolateSeriesValue,
  normalizeSeriesAnalysis,
} from "@/lib/workers/history-analysis.worker";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function hourly(values: number[]): [number, number][] {
  return values.map((value, index) => [index * HOUR_MS, value]);
}

describe("history-analysis.worker", () => {
  describe("GIVEN getTrendWindowMs", () => {
    describe("WHEN called with an unknown key", () => {
      it("THEN it falls back to 24 hours", () => {
        expect.assertions(1);
        expect(getTrendWindowMs("unknown")).toBe(DAY_MS);
      });
    });
  });

  describe("GIVEN buildRollingAverageTrend", () => {
    describe("WHEN the input is too short", () => {
      it("THEN it returns an empty array", () => {
        expect.assertions(1);
        expect(buildRollingAverageTrend([[0, 1]], HOUR_MS)).toEqual([]);
      });
    });

    describe("WHEN the window covers all prior points", () => {
      it("THEN it returns the running average", () => {
        expect.assertions(1);
        expect(buildRollingAverageTrend(hourly([2, 4, 6]), DAY_MS)).toEqual([
          [0, 2],
          [HOUR_MS, 3],
          [2 * HOUR_MS, 4],
        ]);
      });
    });
  });

  describe("GIVEN buildLinearTrend", () => {
    describe("WHEN the points form a straight line", () => {
      it("THEN it returns the first and last trend points", () => {
        expect.assertions(1);
        expect(buildLinearTrend(hourly([0, 1, 2]))).toEqual([
          [0, 0],
          [2 * HOUR_MS, 2],
        ]);
      });
    });
  });

  describe("GIVEN buildTrendPoints", () => {
    describe("WHEN linear_trend is requested", () => {
      it("THEN it delegates to the linear trend builder", () => {
        expect.assertions(1);
        expect(
          buildTrendPoints(hourly([0, 1, 2]), "linear_trend", "24h")
        ).toEqual([
          [0, 0],
          [2 * HOUR_MS, 2],
        ]);
      });
    });
  });

  describe("GIVEN interpolateSeriesValue", () => {
    describe("WHEN the query time falls between two points", () => {
      it("THEN it interpolates the intermediate value", () => {
        expect.assertions(1);
        expect(
          interpolateSeriesValue(
            [
              [0, 0],
              [HOUR_MS, 10],
            ],
            HOUR_MS / 2
          )
        ).toBe(5);
      });
    });
  });

  describe("GIVEN buildRateOfChangePoints", () => {
    describe("WHEN point_to_point mode is used", () => {
      it("THEN it returns hourly deltas", () => {
        expect.assertions(1);
        expect(
          buildRateOfChangePoints(hourly([1, 3, 6]), "point_to_point")
        ).toEqual([
          [HOUR_MS, 2],
          [2 * HOUR_MS, 3],
        ]);
      });
    });
  });

  describe("GIVEN buildDeltaPoints", () => {
    describe("WHEN both series overlap in time", () => {
      it("THEN it returns the source-minus-comparison delta", () => {
        expect.assertions(1);
        expect(
          buildDeltaPoints(
            [
              [0, 10],
              [HOUR_MS, 20],
            ],
            [
              [0, 4],
              [HOUR_MS, 5],
            ]
          )
        ).toEqual([
          [0, 6],
          [HOUR_MS, 15],
        ]);
      });
    });
  });

  describe("GIVEN buildSummaryStats", () => {
    describe("WHEN numeric points are provided", () => {
      it("THEN it returns min max and mean", () => {
        expect.assertions(1);
        expect(buildSummaryStats(hourly([10, 20, 30]))).toEqual({
          min: 10,
          max: 30,
          mean: 20,
        });
      });
    });
  });

  describe("GIVEN normalizeSeriesAnalysis", () => {
    describe("WHEN optional fields are missing", () => {
      it("THEN it applies the frontend analysis defaults still used by the worker", () => {
        expect.assertions(1);
        expect(normalizeSeriesAnalysis({})).toEqual({
          show_trend_lines: false,
          trend_method: "rolling_average",
          trend_window: "24h",
          show_summary_stats: false,
          show_rate_of_change: false,
          rate_window: "1h",
          show_delta_analysis: false,
        });
      });
    });
  });

  describe("GIVEN getEmaAlpha", () => {
    describe("WHEN called with a known window key", () => {
      it("THEN it returns the correct alpha", () => {
        expect.assertions(2);
        expect(getEmaAlpha("1h")).toBe(0.92);
        expect(getEmaAlpha("24h")).toBe(0.5);
      });
    });

    describe("WHEN called with an unknown key", () => {
      it("THEN it falls back to 0.5", () => {
        expect.assertions(1);
        expect(getEmaAlpha("unknown")).toBe(0.5);
      });
    });
  });

  describe("GIVEN buildEmaTrend", () => {
    describe("WHEN the input has fewer than 2 points", () => {
      it("THEN it returns an empty array", () => {
        expect.assertions(1);
        expect(buildEmaTrend([[0, 1]], 0.5)).toEqual([]);
      });
    });

    describe("WHEN given a constant series", () => {
      it("THEN the output equals the input", () => {
        expect.assertions(1);
        const pts = hourly([5, 5, 5, 5]);
        const result = buildEmaTrend(pts, 0.5);
        expect(result).toEqual(pts);
      });
    });

    describe("WHEN given a step-up series", () => {
      it("THEN the output length equals the input length", () => {
        expect.assertions(1);
        const pts = hourly([0, 0, 0, 10, 10, 10]);
        expect(buildEmaTrend(pts, 0.5)).toHaveLength(pts.length);
      });

      it("THEN the last EMA value is closer to 10 than the first is", () => {
        expect.assertions(1);
        const pts = hourly([0, 0, 0, 10, 10, 10]);
        const result = buildEmaTrend(pts, 0.5);
        const lastValue = result[result.length - 1][1];
        const firstValue = result[0][1];
        expect(Math.abs(lastValue - 10)).toBeLessThan(
          Math.abs(firstValue - 10)
        );
      });
    });

    describe("WHEN alpha is 1", () => {
      it("THEN the output equals the input (no smoothing)", () => {
        expect.assertions(1);
        const pts = hourly([1, 3, 2, 5]);
        expect(buildEmaTrend(pts, 1)).toEqual(pts);
      });
    });
  });

  describe("GIVEN buildPolynomialTrend", () => {
    describe("WHEN the input has fewer than 3 points", () => {
      it("THEN it returns an empty array", () => {
        expect.assertions(1);
        expect(buildPolynomialTrend(hourly([1, 2]))).toEqual([]);
      });
    });

    describe("WHEN given points that lie exactly on a line", () => {
      it("THEN the output length equals the input length", () => {
        expect.assertions(1);
        const pts = hourly([0, 1, 2, 3, 4]);
        expect(buildPolynomialTrend(pts)).toHaveLength(pts.length);
      });

      it("THEN each fitted value is close to the true value", () => {
        expect.assertions(1);
        const pts = hourly([0, 1, 2, 3, 4]);
        const result = buildPolynomialTrend(pts);
        const allClose = pts.every(
          (_, i) => Math.abs(result[i][1] - pts[i][1]) < 1e-4
        );
        expect(allClose).toBe(true);
      });
    });

    describe("WHEN given a symmetric parabola", () => {
      it("THEN the output is symmetric", () => {
        expect.assertions(1);
        // y = (x-2)^2: values 4,1,0,1,4
        const pts = hourly([4, 1, 0, 1, 4]);
        const result = buildPolynomialTrend(pts);
        expect(result[0][1]).toBeCloseTo(result[4][1], 4);
      });
    });

    describe("WHEN given a noisy series", () => {
      it("THEN the output variance is less than the input variance", () => {
        expect.assertions(1);
        const pts = hourly([1, 5, 2, 6, 3, 7, 4, 8, 5, 9]);
        const result = buildPolynomialTrend(pts);
        const mean = (arr: number[]) =>
          arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = (arr: number[]) => {
          const m = mean(arr);
          return mean(arr.map((v) => (v - m) ** 2));
        };
        const inputVals = pts.map(([, v]) => v);
        const outputVals = result.map(([, v]) => v);
        expect(variance(outputVals)).toBeLessThan(variance(inputVals));
      });
    });
  });

  describe("GIVEN buildLowessTrend", () => {
    describe("WHEN the input has fewer than 2 points", () => {
      it("THEN it returns an empty array", () => {
        expect.assertions(1);
        expect(buildLowessTrend([[0, 1]], 1000)).toEqual([]);
      });
    });

    describe("WHEN given a small series", () => {
      it("THEN the output length equals the input length", () => {
        expect.assertions(1);
        const pts = hourly([1, 3, 2, 5, 4]);
        const result = buildLowessTrend(
          pts,
          (pts[pts.length - 1][0] - pts[0][0]) * 0.3
        );
        expect(result).toHaveLength(pts.length);
      });
    });

    describe("WHEN given a noisy series with wide bandwidth", () => {
      it("THEN the output variance is less than the input variance", () => {
        expect.assertions(1);
        const pts = hourly([1, 5, 2, 6, 3, 7, 4, 8, 5, 9]);
        const bandwidth = (pts[pts.length - 1][0] - pts[0][0]) * 0.7;
        const result = buildLowessTrend(pts, bandwidth);
        const mean = (arr: number[]) =>
          arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = (arr: number[]) => {
          const m = mean(arr);
          return mean(arr.map((v) => (v - m) ** 2));
        };
        const inputVals = pts.map(([, v]) => v);
        const outputVals = result.map(([, v]) => v);
        expect(variance(outputVals)).toBeLessThan(variance(inputVals));
      });
    });
  });

  describe("GIVEN buildTrendPoints with new methods", () => {
    describe("WHEN ema is requested", () => {
      it("THEN it returns N points", () => {
        expect.assertions(1);
        const pts = hourly([1, 2, 3, 4]);
        expect(buildTrendPoints(pts, "ema", "24h")).toHaveLength(pts.length);
      });
    });

    describe("WHEN polynomial_trend is requested", () => {
      it("THEN it returns N points", () => {
        expect.assertions(1);
        const pts = hourly([1, 2, 3, 4]);
        expect(buildTrendPoints(pts, "polynomial_trend", "24h")).toHaveLength(
          pts.length
        );
      });
    });

    describe("WHEN lowess is requested", () => {
      it("THEN it returns points", () => {
        expect.assertions(1);
        const pts = hourly([1, 2, 3, 4]);
        expect(buildTrendPoints(pts, "lowess", "24h").length).toBeGreaterThan(
          0
        );
      });
    });
  });

  describe("GIVEN normalizeSeriesAnalysis with new trend methods", () => {
    describe("WHEN trend_method is ema", () => {
      it("THEN it is preserved", () => {
        expect.assertions(1);
        expect(
          normalizeSeriesAnalysis({ trend_method: "ema" }).trend_method
        ).toBe("ema");
      });
    });

    describe("WHEN trend_method is polynomial_trend", () => {
      it("THEN it is preserved", () => {
        expect.assertions(1);
        expect(
          normalizeSeriesAnalysis({ trend_method: "polynomial_trend" })
            .trend_method
        ).toBe("polynomial_trend");
      });
    });

    describe("WHEN trend_method is lowess", () => {
      it("THEN it is preserved", () => {
        expect.assertions(1);
        expect(
          normalizeSeriesAnalysis({ trend_method: "lowess" }).trend_method
        ).toBe("lowess");
      });
    });

    describe("WHEN an unknown trend_method is given", () => {
      it("THEN it falls back to rolling_average", () => {
        expect.assertions(1);
        expect(
          normalizeSeriesAnalysis({ trend_method: "unknown_method" })
            .trend_method
        ).toBe("rolling_average");
      });
    });
  });

  describe("GIVEN computeHistoryAnalysis", () => {
    describe("WHEN trend, rate, delta, summary, and anomaly flags are enabled", () => {
      it("THEN it computes only the non-anomaly frontend analysis and leaves anomalySeries empty", () => {
        expect.assertions(5);
        const result = computeHistoryAnalysis({
          series: [
            {
              entityId: "sensor.temperature",
              pts: hourly([10, 14, 18]),
              analysis: {
                show_trend_lines: true,
                show_summary_stats: true,
                show_rate_of_change: true,
                rate_window: "point_to_point",
                show_delta_analysis: true,
                show_anomalies: true,
                anomaly_methods: ["iqr"],
              },
            },
          ],
          comparisonSeries: [
            {
              entityId: "sensor.temperature",
              pts: hourly([8, 12, 15]),
            },
          ],
          hasSelectedComparisonWindow: true,
        });

        expect(result.trendSeries).toHaveLength(1);
        expect(result.rateSeries).toHaveLength(1);
        expect(result.deltaSeries).toHaveLength(1);
        expect(result.summaryStats).toHaveLength(1);
        expect(result.anomalySeries).toEqual([]);
      });
    });
  });
});
