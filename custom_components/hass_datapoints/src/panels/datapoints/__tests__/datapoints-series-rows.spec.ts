import { describe, it, expect } from "vitest";
import {
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
  buildHistorySeriesRows,
  historySeriesRowHasConfiguredAnalysis,
} from "@/lib/domain/history-series";

// ---------------------------------------------------------------------------
// normalizeHistorySeriesAnalysis
// ---------------------------------------------------------------------------

describe("normalizeHistorySeriesAnalysis", () => {
  describe("WHEN called with null", () => {
    it("THEN returns the default analysis object", () => {
      expect.assertions(3);
      const result = normalizeHistorySeriesAnalysis(null);
      expect(result.expanded).toBe(false);
      expect(result.show_trend_lines).toBe(false);
      expect(result.hide_source_series).toBe(false);
    });
  });

  describe("WHEN called with a partial object", () => {
    it("THEN merges with defaults", () => {
      expect.assertions(2);
      const result = normalizeHistorySeriesAnalysis({ show_trend_lines: true });
      expect(result.show_trend_lines).toBe(true);
      expect(result.show_summary_stats).toBe(false);
    });
  });

  describe("WHEN called with hide_source_series: true", () => {
    it("THEN preserves the value", () => {
      expect.assertions(1);
      const result = normalizeHistorySeriesAnalysis({
        hide_source_series: true,
      });
      expect(result.hide_source_series).toBe(true);
    });
  });

  describe("WHEN called with expanded: true", () => {
    it("THEN preserves the expanded state", () => {
      expect.assertions(1);
      const result = normalizeHistorySeriesAnalysis({ expanded: true });
      expect(result.expanded).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// historySeriesRowHasConfiguredAnalysis
// ---------------------------------------------------------------------------

describe("historySeriesRowHasConfiguredAnalysis", () => {
  const baseRow = () => ({
    entity_id: "sensor.temperature",
    color: "#03a9f4",
    visible: true,
    analysis: normalizeHistorySeriesAnalysis(null),
  });

  describe("GIVEN a row with no configured analysis", () => {
    it("THEN returns false", () => {
      expect.assertions(1);
      expect(historySeriesRowHasConfiguredAnalysis(baseRow())).toBe(false);
    });
  });

  describe("GIVEN a row with show_trend_lines: true", () => {
    it("THEN returns true", () => {
      expect.assertions(1);
      const row = baseRow();
      row.analysis = normalizeHistorySeriesAnalysis({ show_trend_lines: true });
      expect(historySeriesRowHasConfiguredAnalysis(row)).toBe(true);
    });
  });

  describe("GIVEN a row with hide_source_series: true", () => {
    it("THEN returns true", () => {
      expect.assertions(1);
      const row = baseRow();
      row.analysis = normalizeHistorySeriesAnalysis({
        hide_source_series: true,
      });
      expect(historySeriesRowHasConfiguredAnalysis(row)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// normalizeHistorySeriesRows
// ---------------------------------------------------------------------------

describe("normalizeHistorySeriesRows", () => {
  describe("WHEN called with an empty array", () => {
    it("THEN returns an empty array", () => {
      expect.assertions(1);
      expect(normalizeHistorySeriesRows([])).toEqual([]);
    });
  });

  describe("WHEN called with null", () => {
    it("THEN returns an empty array", () => {
      expect.assertions(1);
      expect(normalizeHistorySeriesRows(null as never)).toEqual([]);
    });
  });

  describe("WHEN called with valid rows", () => {
    it("THEN normalizes each row's analysis", () => {
      expect.assertions(2);
      const rows = [
        {
          entity_id: "sensor.temp",
          color: "#ff0000",
          visible: true,
          analysis: null,
        },
      ];
      const result = normalizeHistorySeriesRows(rows);
      expect(result).toHaveLength(1);
      expect(result[0].analysis.expanded).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// buildHistorySeriesRows
// ---------------------------------------------------------------------------

describe("buildHistorySeriesRows", () => {
  describe("WHEN called with a single entity ID", () => {
    it("THEN returns one row with that entity_id", () => {
      expect.assertions(2);
      const rows = buildHistorySeriesRows(["sensor.temperature"]);
      expect(rows).toHaveLength(1);
      expect(rows[0].entity_id).toBe("sensor.temperature");
    });
  });

  describe("WHEN called with multiple entity IDs", () => {
    it("THEN assigns distinct colors to each row", () => {
      expect.assertions(1);
      const rows = buildHistorySeriesRows(["sensor.temp", "sensor.humidity"]);
      expect(rows[0].color).not.toBe(rows[1].color);
    });
  });

  describe("WHEN called with duplicate entity IDs", () => {
    it("THEN returns a row for each supplied entity ID (no deduplication)", () => {
      expect.assertions(1);
      const rows = buildHistorySeriesRows(["sensor.temp", "sensor.temp"]);
      expect(rows).toHaveLength(2);
    });
  });

  describe("WHEN previousRows has existing colors", () => {
    it("THEN preserves the color for existing entities", () => {
      expect.assertions(1);
      const previous = [
        {
          entity_id: "sensor.temp",
          color: "#abcdef",
          visible: true,
          analysis: null,
        },
      ];
      const rows = buildHistorySeriesRows(["sensor.temp"], previous);
      expect(rows[0].color).toBe("#abcdef");
    });
  });
});
