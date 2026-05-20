import { describe, expect, it } from "vitest";
import {
  mergeSavedSeriesRows,
  addSeriesRows,
  updateSeriesRowColor,
  updateSeriesRowVisibility,
  toggleSeriesAnalysisExpanded,
  computeNextAnalysis,
  copyAnalysisToAll,
  removeSeriesRow,
  type SeriesRow,
} from "../series-rows";
import { normalizeHistorySeriesAnalysis } from "../history-series";

describe("series-rows", () => {
  describe("GIVEN mergeSavedSeriesRows", () => {
    const makeRow = (entityId: string, color = "#ff0000") => ({
      entity_id: entityId,
      color,
      visible: true,
      analysis: normalizeHistorySeriesAnalysis(null),
    });

    describe("WHEN savedRows is empty", () => {
      it("THEN returns the original rows unchanged", () => {
        expect.assertions(2);
        const rows = [makeRow("sensor.temp")];
        const result = mergeSavedSeriesRows(rows, []);
        expect(result).toHaveLength(1);
        expect(result[0].color).toBe("#ff0000");
      });
    });

    describe("WHEN savedRows has matching entities", () => {
      it("THEN applies saved color, visible, and analysis", () => {
        expect.assertions(2);
        const rows = [makeRow("sensor.temp", "#ff0000")];
        const saved = [makeRow("sensor.temp", "#00ff00")];
        const result = mergeSavedSeriesRows(rows, saved);
        expect(result).toHaveLength(1);
        expect(result[0].color).toBe("#00ff00");
      });
    });

    describe("WHEN savedRows has no matching entities", () => {
      it("THEN returns the original rows unchanged", () => {
        expect.assertions(2);
        const rows = [makeRow("sensor.temp")];
        const saved = [makeRow("sensor.humidity", "#00ff00")];
        const result = mergeSavedSeriesRows(rows, saved);
        expect(result).toHaveLength(1);
        expect(result[0].color).toBe("#ff0000");
      });
    });

    describe("WHEN rows is null", () => {
      it("THEN returns an empty array", () => {
        expect.assertions(1);
        const result = mergeSavedSeriesRows(null, [makeRow("sensor.temp")]);
        expect(result).toEqual([]);
      });
    });

    describe("WHEN savedRows preserves visibility state", () => {
      it("THEN uses the saved visible value", () => {
        expect.assertions(1);
        const rows = [makeRow("sensor.temp")];
        const saved = [{ ...makeRow("sensor.temp"), visible: false }];
        const result = mergeSavedSeriesRows(rows, saved);
        expect(result[0].visible).toBe(false);
      });
    });
  });

  describe("GIVEN addSeriesRows", () => {
    const existing: SeriesRow[] = [
      {
        entity_id: "sensor.temp",
        color: "#ff0000",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
    ];

    describe("WHEN adding a new entity", () => {
      it("THEN appends the new row", () => {
        const result = addSeriesRows(existing, ["sensor.humidity"]);
        expect(result).toHaveLength(2);
        expect(result[1].entity_id).toBe("sensor.humidity");
        expect(result[1].visible).toBe(true);
      });
    });

    describe("WHEN adding a duplicate entity", () => {
      it("THEN does not duplicate", () => {
        const result = addSeriesRows(existing, ["sensor.temp"]);
        expect(result).toHaveLength(1);
      });
    });

    describe("WHEN preferred color exists", () => {
      it("THEN uses the preferred color", () => {
        const result = addSeriesRows(existing, ["sensor.humidity"], {
          "sensor.humidity": "#00ff00",
        });
        expect(result[1].color).toBe("#00ff00");
      });
    });

    describe("WHEN preferred color is invalid", () => {
      it("THEN falls back to COLORS palette", () => {
        const result = addSeriesRows(existing, ["sensor.humidity"], {
          "sensor.humidity": "notacolor",
        });
        expect(result[1].color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("GIVEN updateSeriesRowColor", () => {
    const rows: SeriesRow[] = [
      {
        entity_id: "sensor.temp",
        color: "#ff0000",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
    ];

    describe("WHEN color is valid and different", () => {
      it("THEN returns updated rows", () => {
        const result = updateSeriesRowColor(rows, 0, "#00ff00");
        expect(result).not.toBeNull();
        expect(result![0].color).toBe("#00ff00");
      });
    });

    describe("WHEN color is the same", () => {
      it("THEN returns null (no change)", () => {
        expect(updateSeriesRowColor(rows, 0, "#ff0000")).toBeNull();
      });
    });

    describe("WHEN index is out of bounds", () => {
      it("THEN returns null", () => {
        expect(updateSeriesRowColor(rows, 5, "#00ff00")).toBeNull();
      });
    });

    describe("WHEN color is invalid", () => {
      it("THEN returns null", () => {
        expect(updateSeriesRowColor(rows, 0, "notacolor")).toBeNull();
      });
    });
  });

  describe("GIVEN updateSeriesRowVisibility", () => {
    const rows: SeriesRow[] = [
      {
        entity_id: "sensor.temp",
        color: "#ff0000",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
    ];

    describe("WHEN visibility changes", () => {
      it("THEN returns updated rows", () => {
        const result = updateSeriesRowVisibility(rows, 0, false);
        expect(result).not.toBeNull();
        expect(result![0].visible).toBe(false);
      });
    });

    describe("WHEN visibility is the same", () => {
      it("THEN returns null", () => {
        expect(updateSeriesRowVisibility(rows, 0, true)).toBeNull();
      });
    });

    describe("WHEN index is out of bounds", () => {
      it("THEN returns null", () => {
        expect(updateSeriesRowVisibility(rows, 5, false)).toBeNull();
      });
    });
  });

  describe("GIVEN toggleSeriesAnalysisExpanded", () => {
    const rows: SeriesRow[] = [
      {
        entity_id: "sensor.temp",
        color: "#ff0000",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
    ];

    describe("WHEN entity exists", () => {
      it("THEN toggles expanded state", () => {
        const result = toggleSeriesAnalysisExpanded(rows, "sensor.temp");
        expect(result).not.toBeNull();
        expect(result![0].analysis.expanded).toBe(true);
      });
    });

    describe("WHEN entity does not exist", () => {
      it("THEN returns null", () => {
        expect(toggleSeriesAnalysisExpanded(rows, "sensor.unknown")).toBeNull();
      });
    });
  });

  describe("GIVEN computeNextAnalysis", () => {
    const base = normalizeHistorySeriesAnalysis(null);

    describe("WHEN setting a simple option", () => {
      it("THEN returns updated analysis", () => {
        const result = computeNextAnalysis(base, "show_summary_stats", true);
        expect(result).not.toBeNull();
        expect(result!.show_summary_stats).toBe(true);
      });
    });

    describe("WHEN toggling an anomaly method on", () => {
      it("THEN adds the method to anomaly_methods", () => {
        const result = computeNextAnalysis(
          base,
          "anomaly_method_toggle_trend_residual",
          true
        );
        expect(result).not.toBeNull();
        expect(result!.anomaly_methods).toContain("trend_residual");
      });
    });

    describe("WHEN enabling show_anomalies with no methods", () => {
      it("THEN defaults to trend_residual", () => {
        const result = computeNextAnalysis(base, "show_anomalies", true);
        expect(result).not.toBeNull();
        expect(result!.anomaly_methods).toContain("trend_residual");
      });
    });

    describe("WHEN disabling show_trend_lines", () => {
      it("THEN also disables show_trend_crosshairs", () => {
        const withTrend = normalizeHistorySeriesAnalysis({
          show_trend_lines: true,
          show_trend_crosshairs: true,
        });
        const result = computeNextAnalysis(
          withTrend,
          "show_trend_lines",
          false
        );
        expect(result).not.toBeNull();
        expect(result!.show_trend_crosshairs).toBe(false);
      });
    });

    describe("WHEN value is unchanged", () => {
      it("THEN returns null", () => {
        // Base with expanded: true since computeNextAnalysis always sets expanded: true
        const expandedBase = normalizeHistorySeriesAnalysis({
          expanded: true,
        });
        const result = computeNextAnalysis(
          expandedBase,
          "show_summary_stats",
          false
        );
        expect(result).toBeNull();
      });
    });
  });

  describe("GIVEN copyAnalysisToAll", () => {
    const source = normalizeHistorySeriesAnalysis({
      show_summary_stats: true,
    });
    const rows: SeriesRow[] = [
      {
        entity_id: "sensor.a",
        color: "#ff0000",
        visible: true,
        analysis: source,
      },
      {
        entity_id: "sensor.b",
        color: "#00ff00",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
    ];

    describe("WHEN source analysis differs from targets", () => {
      it("THEN copies to non-source rows", () => {
        const result = copyAnalysisToAll(rows, "sensor.a", source);
        expect(result).not.toBeNull();
        expect(result![0].analysis).toEqual(source); // source unchanged
        expect(result![1].analysis!.show_summary_stats).toBe(true);
      });
    });

    describe("WHEN all rows already match", () => {
      it("THEN returns null", () => {
        const allSame = rows.map((r) => ({ ...r, analysis: source }));
        expect(copyAnalysisToAll(allSame, "sensor.a", source)).toBeNull();
      });
    });
  });

  describe("GIVEN removeSeriesRow", () => {
    const rows: SeriesRow[] = [
      {
        entity_id: "sensor.a",
        color: "#ff0000",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
      {
        entity_id: "sensor.b",
        color: "#00ff00",
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      },
    ];

    describe("WHEN index is valid", () => {
      it("THEN removes the row", () => {
        const result = removeSeriesRow(rows, 0);
        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].entity_id).toBe("sensor.b");
      });
    });

    describe("WHEN index is out of bounds", () => {
      it("THEN returns null", () => {
        expect(removeSeriesRow(rows, 5)).toBeNull();
      });
    });

    describe("WHEN index is undefined", () => {
      it("THEN returns null", () => {
        expect(removeSeriesRow(rows, undefined)).toBeNull();
      });
    });
  });
});
