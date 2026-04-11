import { describe, expect, it, vi } from "vitest";

import {
  buildHistorySeriesRows,
  historySeriesRowHasConfiguredAnalysis,
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
  parseSeriesColorsParam,
  slugifySeriesName,
} from "@/lib/domain/history-series";

vi.mock("@/constants", async (importOriginal) => {
  const real = (await importOriginal()) as RecordWithUnknownValues;
  return { ...real, COLORS: ["#111111", "#222222", "#333333"] };
});

describe("history-series", () => {
  describe("GIVEN partial or legacy analysis config", () => {
    describe("WHEN normalizeHistorySeriesAnalysis is called", () => {
      it("THEN it applies the stable defaults and migrations", () => {
        expect.assertions(4);

        const normalized = normalizeHistorySeriesAnalysis({
          show_anomalies: true,
          anomaly_method: "iqr",
          sample_interval: "raw",
          sample_aggregate: "median",
          stepped_series: true,
        });

        expect(normalized.show_anomalies).toBe(true);
        expect(normalized.anomaly_methods).toEqual(["iqr"]);
        expect(normalized.sample_aggregate).toBe("median");
        expect(normalized.stepped_series).toBe(true);
      });
    });
  });

  describe("GIVEN anomaly trend override fields", () => {
    describe("WHEN normalizeHistorySeriesAnalysis is called with no anomaly_trend_method", () => {
      it("THEN anomaly_trend_method defaults to empty string", () => {
        expect.assertions(1);
        const normalized = normalizeHistorySeriesAnalysis({});
        expect(normalized.anomaly_trend_method).toBe("");
      });
    });

    describe("WHEN normalizeHistorySeriesAnalysis is called with anomaly_trend_method set", () => {
      it("THEN anomaly_trend_method is preserved", () => {
        expect.assertions(1);
        const normalized = normalizeHistorySeriesAnalysis({
          anomaly_trend_method: "lowess",
        });
        expect(normalized.anomaly_trend_method).toBe("lowess");
      });
    });

    describe("WHEN normalizeHistorySeriesAnalysis is called with no anomaly_trend_window", () => {
      it("THEN anomaly_trend_window defaults to 24h", () => {
        expect.assertions(1);
        const normalized = normalizeHistorySeriesAnalysis({});
        expect(normalized.anomaly_trend_window).toBe("24h");
      });
    });

    describe("WHEN normalizeHistorySeriesAnalysis is called with anomaly_trend_window set", () => {
      it("THEN anomaly_trend_window is preserved", () => {
        expect.assertions(1);
        const normalized = normalizeHistorySeriesAnalysis({
          anomaly_trend_method: "ema",
          anomaly_trend_window: "6h",
        });
        expect(normalized.anomaly_trend_window).toBe("6h");
      });
    });
  });

  describe("GIVEN a row analysis payload", () => {
    describe("WHEN historySeriesRowHasConfiguredAnalysis is called", () => {
      it("THEN it reports whether any analysis is enabled", () => {
        expect.assertions(3);

        expect(
          historySeriesRowHasConfiguredAnalysis({
            analysis: { show_trend_lines: true },
          })
        ).toBe(true);
        expect(
          historySeriesRowHasConfiguredAnalysis({
            analysis: { stepped_series: true },
          })
        ).toBe(true);
        expect(historySeriesRowHasConfiguredAnalysis({ analysis: {} })).toBe(
          false
        );
      });
    });
  });

  describe("GIVEN mixed history rows", () => {
    describe("WHEN normalizeHistorySeriesRows is called", () => {
      it("THEN it removes duplicates and fills defaults", () => {
        expect.assertions(1);

        expect(
          normalizeHistorySeriesRows([
            { entity_id: "sensor.a", color: "#abcdef", visible: false },
            { entity_id: "sensor.a", color: "#111111", visible: true },
            { entity_id: "sensor.b", color: "bad" },
          ])
        ).toEqual([
          expect.objectContaining({
            entity_id: "sensor.a",
            color: "#abcdef",
            visible: false,
          }),
          expect.objectContaining({
            entity_id: "sensor.b",
            color: "#333333",
            visible: true,
          }),
        ]);
      });
    });
  });

  describe("GIVEN entity ids and previous rows", () => {
    describe("WHEN buildHistorySeriesRows is called", () => {
      it("THEN it preserves rows and inherits unanimous sampling config", () => {
        expect.assertions(2);

        const rows = buildHistorySeriesRows(
          ["sensor.a", "sensor.b", "sensor.c"],
          [
            {
              entity_id: "sensor.a",
              color: "#999999",
              analysis: { sample_interval: "5m", sample_aggregate: "max" },
            },
            {
              entity_id: "sensor.b",
              color: "#888888",
              analysis: { sample_interval: "5m", sample_aggregate: "max" },
            },
          ]
        );

        expect(rows[0]).toEqual(
          expect.objectContaining({ entity_id: "sensor.a", color: "#999999" })
        );
        expect(rows[2].analysis).toEqual(
          expect.objectContaining({
            sample_interval: "5m",
            sample_aggregate: "max",
          })
        );
      });
    });
  });

  describe("GIVEN free text and query color params", () => {
    describe("WHEN the URL helpers are called", () => {
      it("THEN they normalize the values", () => {
        expect.assertions(2);

        expect(slugifySeriesName(" Adults Bedroom Temp ")).toBe(
          "adults-bedroom-temp"
        );
        expect(
          parseSeriesColorsParam("temperature:#83c705,broken:red")
        ).toEqual({
          temperature: "#83c705",
        });
      });
    });
  });
});
