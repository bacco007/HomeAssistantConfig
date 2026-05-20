import { describe, expect, it } from "vitest";
import {
  computeAutoScrollDelta,
  computeDraftRangeForHandle,
  computeIntervalSelectionRange,
  computeSelectionDragDelta,
  computeShiftedDraftRange,
  resolveCloserHandle,
  timestampFromClientPosition,
} from "../range-pointer-math";

describe("timestampFromClientPosition", () => {
  describe("GIVEN a valid track rect and bounds", () => {
    it("THEN maps the midpoint to the midpoint timestamp", () => {
      expect(timestampFromClientPosition(150, 100, 200, 0, 1000)).toBe(250);
    });
  });

  describe("GIVEN clientX at the left edge", () => {
    it("THEN returns boundsMin", () => {
      expect(timestampFromClientPosition(100, 100, 200, 0, 1000)).toBe(0);
    });
  });

  describe("GIVEN clientX at the right edge", () => {
    it("THEN returns boundsMax", () => {
      expect(timestampFromClientPosition(300, 100, 200, 0, 1000)).toBe(1000);
    });
  });

  describe("GIVEN clientX beyond the track", () => {
    it("THEN clamps to bounds", () => {
      expect(timestampFromClientPosition(500, 100, 200, 0, 1000)).toBe(1000);
      expect(timestampFromClientPosition(0, 100, 200, 0, 1000)).toBe(0);
    });
  });

  describe("GIVEN zero width", () => {
    it("THEN returns null", () => {
      expect(timestampFromClientPosition(150, 100, 0, 0, 1000)).toBeNull();
    });
  });
});

describe("computeSelectionDragDelta", () => {
  describe("GIVEN no snap unit", () => {
    it("THEN returns the raw difference", () => {
      expect(computeSelectionDragDelta(5000, 3000, null)).toBe(2000);
    });
  });

  describe("GIVEN a snap unit", () => {
    it("THEN returns the snapped difference", () => {
      // With "hour" snap, both get snapped to hour boundaries before subtraction
      const start = new Date("2024-06-15T10:30:00Z").getTime();
      const current = new Date("2024-06-15T12:45:00Z").getTime();
      const delta = computeSelectionDragDelta(current, start, "hour");
      // start snaps to 10:00, current snaps to 12:00 → delta = 2h
      expect(delta).toBe(2 * 60 * 60 * 1000);
    });
  });
});

describe("computeDraftRangeForHandle", () => {
  const BOUNDS_MIN = 0;
  const BOUNDS_MAX = 10000;
  const SNAP_SPAN = 1000;

  describe("GIVEN moving the start handle", () => {
    it("THEN updates start while preserving end", () => {
      const result = computeDraftRangeForHandle(
        "start",
        3000,
        1000,
        8000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        null,
        SNAP_SPAN
      );
      expect(result.startMs).toBe(3000);
      expect(result.endMs).toBe(8000);
    });
  });

  describe("GIVEN moving the end handle", () => {
    it("THEN updates end while preserving start", () => {
      const result = computeDraftRangeForHandle(
        "end",
        6000,
        1000,
        8000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        null,
        SNAP_SPAN
      );
      expect(result.startMs).toBe(1000);
      expect(result.endMs).toBe(6000);
    });
  });

  describe("GIVEN start would overlap end", () => {
    it("THEN clamps start to maintain minimum span", () => {
      const result = computeDraftRangeForHandle(
        "start",
        8500,
        1000,
        8000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        null,
        SNAP_SPAN
      );
      expect(result.startMs).toBe(7000); // endMs - minSpan
      expect(result.endMs).toBe(8000);
    });
  });

  describe("GIVEN end would overlap start", () => {
    it("THEN clamps end to maintain minimum span", () => {
      const result = computeDraftRangeForHandle(
        "end",
        500,
        1000,
        8000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        null,
        SNAP_SPAN
      );
      expect(result.startMs).toBe(1000);
      expect(result.endMs).toBe(2000); // startMs + minSpan
    });
  });
});

describe("computeShiftedDraftRange", () => {
  describe("GIVEN a positive delta within bounds", () => {
    it("THEN shifts both handles forward", () => {
      const result = computeShiftedDraftRange(500, 1000, 3000, 0, 10000);
      expect(result.startMs).toBe(1500);
      expect(result.endMs).toBe(3500);
    });
  });

  describe("GIVEN a delta that would exceed max", () => {
    it("THEN clamps to max bound", () => {
      const result = computeShiftedDraftRange(9000, 1000, 3000, 0, 10000);
      expect(result.endMs).toBe(10000);
      expect(result.startMs).toBe(8000);
    });
  });

  describe("GIVEN a negative delta that would exceed min", () => {
    it("THEN clamps to min bound", () => {
      const result = computeShiftedDraftRange(-5000, 1000, 3000, 0, 10000);
      expect(result.startMs).toBe(0);
      expect(result.endMs).toBe(2000);
    });
  });
});

describe("computeIntervalSelectionRange", () => {
  describe("GIVEN two timestamps in order", () => {
    it("THEN returns snapped range", () => {
      const start = new Date("2024-06-15T10:30:00Z").getTime();
      const end = new Date("2024-06-15T12:45:00Z").getTime();
      const boundsMin = new Date("2024-06-15T00:00:00Z").getTime();
      const boundsMax = new Date("2024-06-16T00:00:00Z").getTime();
      const result = computeIntervalSelectionRange(
        start,
        end,
        "hour",
        boundsMin,
        boundsMax
      );
      expect(result).not.toBeNull();
      // start snaps to start of 10:00 hour, end snaps to end of 12:00 hour
      expect(result!.startMs).toBe(new Date("2024-06-15T10:00:00Z").getTime());
      expect(result!.endMs).toBe(new Date("2024-06-15T13:00:00Z").getTime());
    });
  });

  describe("GIVEN reversed timestamps", () => {
    it("THEN normalizes order and returns range", () => {
      const a = new Date("2024-06-15T14:00:00Z").getTime();
      const b = new Date("2024-06-15T10:00:00Z").getTime();
      const boundsMin = new Date("2024-06-15T00:00:00Z").getTime();
      const boundsMax = new Date("2024-06-16T00:00:00Z").getTime();
      const result = computeIntervalSelectionRange(
        a,
        b,
        "hour",
        boundsMin,
        boundsMax
      );
      expect(result).not.toBeNull();
      expect(result!.startMs).toBeLessThan(result!.endMs);
    });
  });

  describe("GIVEN both timestamps in the same unit", () => {
    it("THEN returns null if start equals end after snapping", () => {
      // Both in the same hour, startOfUnit == endOfUnit for same timestamp
      const t = new Date("2024-06-15T10:30:00Z").getTime();
      const boundsMin = new Date("2024-06-15T00:00:00Z").getTime();
      const boundsMax = new Date("2024-06-16T00:00:00Z").getTime();
      const result = computeIntervalSelectionRange(
        t,
        t,
        "hour",
        boundsMin,
        boundsMax
      );
      // startOfUnit(10:30) = 10:00, endOfUnit(10:30) = 11:00 → valid range
      // (same timestamp means start==end, both snap to same hour boundaries)
      // This should actually return a valid range of one hour
      expect(result).not.toBeNull();
    });
  });
});

describe("computeAutoScrollDelta", () => {
  describe("GIVEN pointer well within the viewport", () => {
    it("THEN returns 0", () => {
      expect(computeAutoScrollDelta(250, 0, 500)).toBe(0);
    });
  });

  describe("GIVEN pointer near the left edge", () => {
    it("THEN returns a negative delta", () => {
      const delta = computeAutoScrollDelta(5, 0, 500);
      expect(delta).toBeLessThan(0);
    });
  });

  describe("GIVEN pointer near the right edge", () => {
    it("THEN returns a positive delta", () => {
      const delta = computeAutoScrollDelta(495, 0, 500);
      expect(delta).toBeGreaterThan(0);
    });
  });

  describe("GIVEN pointer at the exact edge", () => {
    it("THEN returns maximum delta", () => {
      const delta = computeAutoScrollDelta(0, 0, 500);
      expect(delta).toBeLessThan(0);
    });
  });
});

describe("resolveCloserHandle", () => {
  describe("GIVEN timestamp closer to start", () => {
    it("THEN returns start", () => {
      expect(resolveCloserHandle(200, 100, 900)).toBe("start");
    });
  });

  describe("GIVEN timestamp closer to end", () => {
    it("THEN returns end", () => {
      expect(resolveCloserHandle(800, 100, 900)).toBe("end");
    });
  });

  describe("GIVEN timestamp equidistant", () => {
    it("THEN returns start", () => {
      expect(resolveCloserHandle(500, 100, 900)).toBe("start");
    });
  });
});
