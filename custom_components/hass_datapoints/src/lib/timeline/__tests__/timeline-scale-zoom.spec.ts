import { describe, expect, it } from "vitest";
import {
  computeZoomLevelForSpan,
  DAY_MS,
  deriveRangeBounds,
  getEffectiveSnapUnit,
  getSnapSpanMs,
  RANGE_ZOOM_CONFIGS,
} from "../timeline-scale";

describe("computeZoomLevelForSpan", () => {
  describe("WHEN span is >= 180 days", () => {
    it("THEN returns 'quarterly'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(180 * DAY_MS)).toBe("quarterly");
    });
  });

  describe("WHEN span is >= 120 days but < 180 days", () => {
    it("THEN returns 'month_compressed'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(120 * DAY_MS)).toBe("month_compressed");
    });
  });

  describe("WHEN span is >= 60 days but < 120 days", () => {
    it("THEN returns 'month_short'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(60 * DAY_MS)).toBe("month_short");
    });
  });

  describe("WHEN span is >= 21 days but < 60 days", () => {
    it("THEN returns 'month_expanded'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(21 * DAY_MS)).toBe("month_expanded");
    });
  });

  describe("WHEN span is >= 7 days but < 21 days", () => {
    it("THEN returns 'week_compressed'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(7 * DAY_MS)).toBe("week_compressed");
    });
  });

  describe("WHEN span is >= 2 days but < 7 days", () => {
    it("THEN returns 'week_expanded'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(2 * DAY_MS)).toBe("week_expanded");
    });
  });

  describe("WHEN span is < 2 days", () => {
    it("THEN returns 'day'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(DAY_MS)).toBe("day");
    });
  });

  describe("WHEN span is very small (below minimum)", () => {
    it("THEN clamps to minimum and returns 'day'", () => {
      expect.assertions(1);
      expect(computeZoomLevelForSpan(100)).toBe("day");
    });
  });
});

describe("getEffectiveSnapUnit", () => {
  describe("WHEN dateSnapping is not auto", () => {
    it("THEN returns the explicit snap unit", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("quarterly", "hour")).toBe("hour");
    });
  });

  describe("WHEN dateSnapping is auto and zoom is quarterly", () => {
    it("THEN returns month", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("quarterly", "auto")).toBe("month");
    });
  });

  describe("WHEN dateSnapping is auto and zoom is month_compressed", () => {
    it("THEN returns month", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("month_compressed", "auto")).toBe("month");
    });
  });

  describe("WHEN dateSnapping is auto and zoom is month_short", () => {
    it("THEN returns week", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("month_short", "auto")).toBe("week");
    });
  });

  describe("WHEN dateSnapping is auto and zoom is week_expanded", () => {
    it("THEN returns day", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("week_expanded", "auto")).toBe("day");
    });
  });

  describe("WHEN dateSnapping is auto and zoom is day", () => {
    it("THEN returns hour", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("day", "auto")).toBe("hour");
    });
  });

  describe("WHEN dateSnapping is auto and zoom is unknown", () => {
    it("THEN returns day as default", () => {
      expect.assertions(1);
      expect(getEffectiveSnapUnit("unknown", "auto")).toBe("day");
    });
  });
});

describe("getSnapSpanMs", () => {
  describe("WHEN snap unit is day", () => {
    it("THEN returns approximately 24 hours in ms", () => {
      expect.assertions(1);
      const result = getSnapSpanMs("day", new Date(2025, 0, 15));
      expect(result).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("WHEN snap unit is hour", () => {
    it("THEN returns 1 hour in ms", () => {
      expect.assertions(1);
      const result = getSnapSpanMs("hour", new Date(2025, 0, 15, 10));
      expect(result).toBe(60 * 60 * 1000);
    });
  });
});

describe("deriveRangeBounds", () => {
  describe("WHEN given standard date range", () => {
    it("THEN returns min <= startMs and max >= endMs", () => {
      expect.assertions(2);
      const config = RANGE_ZOOM_CONFIGS.month_short;
      const startMs = new Date(2025, 0, 1).getTime();
      const endMs = new Date(2025, 0, 15).getTime();
      const result = deriveRangeBounds(
        config,
        startMs,
        endMs,
        undefined,
        undefined,
        DAY_MS
      );
      expect(result.min).toBeLessThanOrEqual(startMs);
      expect(result.max).toBeGreaterThanOrEqual(endMs);
    });
  });

  describe("WHEN history start is before selection start", () => {
    it("THEN min accounts for history start", () => {
      expect.assertions(1);
      const config = RANGE_ZOOM_CONFIGS.month_short;
      const historyStartMs = new Date(2024, 6, 1).getTime();
      const startMs = new Date(2025, 0, 1).getTime();
      const endMs = new Date(2025, 0, 15).getTime();
      const result = deriveRangeBounds(
        config,
        startMs,
        endMs,
        historyStartMs,
        undefined,
        DAY_MS
      );
      expect(result.min).toBeLessThanOrEqual(historyStartMs);
    });
  });

  describe("WHEN max equals min", () => {
    it("THEN max is at least min + 1 second", () => {
      expect.assertions(1);
      const config = RANGE_ZOOM_CONFIGS.day;
      const now = Date.now();
      const result = deriveRangeBounds(config, now, now, now, now, 1000);
      expect(result.max).toBeGreaterThan(result.min);
    });
  });
});
