import { describe, expect, it } from "vitest";
import {
  splitSeriesByGaps,
  buildGapBridgeColor,
  filterDrawableComparisonResults,
  type ComparisonResult,
} from "../chart-series-gaps";

describe("splitSeriesByGaps", () => {
  describe("GIVEN fewer than 2 points", () => {
    it("THEN returns the input as a single segment with no gaps", () => {
      const pts: [number, number][] = [[1000, 5]];
      const result = splitSeriesByGaps(pts, 500);
      expect(result.segments).toEqual([pts]);
      expect(result.gapBridges).toEqual([]);
      expect(result.boundaryPoints).toEqual([]);
    });
  });

  describe("GIVEN an empty array", () => {
    it("THEN returns the empty array as a single segment", () => {
      const result = splitSeriesByGaps([], 500);
      expect(result.segments).toEqual([[]]);
      expect(result.gapBridges).toEqual([]);
    });
  });

  describe("GIVEN a non-finite threshold", () => {
    it("THEN returns the input as a single segment", () => {
      const pts: [number, number][] = [
        [1000, 5],
        [2000, 10],
      ];
      const result = splitSeriesByGaps(pts, NaN);
      expect(result.segments).toEqual([pts]);
      expect(result.gapBridges).toEqual([]);
    });
  });

  describe("GIVEN continuous points with no gaps", () => {
    it("THEN returns a single segment", () => {
      const pts: [number, number][] = [
        [1000, 5],
        [1400, 6],
        [1800, 7],
      ];
      const result = splitSeriesByGaps(pts, 500);
      expect(result.segments).toEqual([pts]);
      expect(result.gapBridges).toEqual([]);
      expect(result.boundaryPoints).toEqual([]);
    });
  });

  describe("GIVEN a gap between points", () => {
    it("THEN splits into two segments with a gap bridge", () => {
      const pts: [number, number][] = [
        [1000, 5],
        [1200, 6],
        [5000, 7],
        [5200, 8],
      ];
      const result = splitSeriesByGaps(pts, 1000);
      expect(result.segments).toEqual([
        [
          [1000, 5],
          [1200, 6],
        ],
        [
          [5000, 7],
          [5200, 8],
        ],
      ]);
      expect(result.gapBridges).toEqual([
        [
          [1200, 6],
          [5000, 7],
        ],
      ]);
      expect(result.boundaryPoints).toEqual([
        [1200, 6],
        [5000, 7],
      ]);
    });
  });

  describe("GIVEN multiple gaps", () => {
    it("THEN splits into multiple segments", () => {
      const pts: [number, number][] = [
        [1000, 1],
        [3000, 2],
        [5000, 3],
      ];
      const result = splitSeriesByGaps(pts, 1500);
      expect(result.segments.length).toBe(3);
      expect(result.gapBridges.length).toBe(2);
      expect(result.boundaryPoints.length).toBe(4);
    });
  });

  describe("GIVEN a gap exactly at the threshold", () => {
    it("THEN does not split (gap must exceed threshold)", () => {
      const pts: [number, number][] = [
        [1000, 5],
        [2000, 6],
      ];
      const result = splitSeriesByGaps(pts, 1000);
      expect(result.segments).toEqual([pts]);
      expect(result.gapBridges).toEqual([]);
    });
  });
});

describe("buildGapBridgeColor", () => {
  describe("GIVEN an rgba color", () => {
    it("THEN replaces the alpha with 0.35", () => {
      expect(buildGapBridgeColor("rgba(255, 0, 0, 1)")).toBe(
        "rgba(255, 0, 0, 0.35)"
      );
    });
  });

  describe("GIVEN an rgba color with decimal alpha", () => {
    it("THEN replaces the alpha with 0.35", () => {
      expect(buildGapBridgeColor("rgba(100, 200, 50, 0.8)")).toBe(
        "rgba(100, 200, 50, 0.35)"
      );
    });
  });

  describe("GIVEN a hex color", () => {
    it("THEN appends 59 hex alpha", () => {
      expect(buildGapBridgeColor("#ff0000")).toBe("#ff000059");
    });
  });

  describe("GIVEN a named color", () => {
    it("THEN appends 59 hex alpha", () => {
      expect(buildGapBridgeColor("red")).toBe("red59");
    });
  });
});

describe("filterDrawableComparisonResults", () => {
  const results: ComparisonResult[] = [
    { id: "w1", time_offset_ms: 1000, histResult: null, statsResult: null },
    {
      id: "w2",
      time_offset_ms: 2000,
      histResult: null,
      statsResult: null,
      label: "Week",
    },
    { id: "w3", time_offset_ms: 3000, histResult: null, statsResult: null },
  ];

  describe("GIVEN no drawable window IDs", () => {
    it("THEN returns empty array", () => {
      expect(filterDrawableComparisonResults(results, [], "", "")).toEqual([]);
    });
  });

  describe("GIVEN matching window IDs", () => {
    it("THEN returns only matching results", () => {
      const filtered = filterDrawableComparisonResults(
        results,
        ["w1", "w3"],
        "",
        ""
      );
      expect(filtered.map((r) => r.id)).toEqual(["w1", "w3"]);
    });
  });

  describe("GIVEN a selected window ID", () => {
    it("THEN includes the selected window even if not in the list", () => {
      const filtered = filterDrawableComparisonResults(
        results,
        ["w1"],
        "w2",
        ""
      );
      expect(filtered.map((r) => r.id)).toEqual(["w1", "w2"]);
    });
  });

  describe("GIVEN a hovered window ID", () => {
    it("THEN includes the hovered window even if not in the list", () => {
      const filtered = filterDrawableComparisonResults(
        results,
        ["w1"],
        "",
        "w3"
      );
      expect(filtered.map((r) => r.id)).toEqual(["w1", "w3"]);
    });
  });

  describe("GIVEN empty string IDs in the window list", () => {
    it("THEN filters them out", () => {
      const filtered = filterDrawableComparisonResults(
        results,
        ["", "w2", ""],
        "",
        ""
      );
      expect(filtered.map((r) => r.id)).toEqual(["w2"]);
    });
  });
});
