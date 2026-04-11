import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { esc, fmtRelativeTime } from "@/lib/util/format";
import { hexToRgba, contrastColor } from "@/lib/util/color";
import { buildDataPointsHistoryPath } from "@/lib/ha/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// esc
// ─────────────────────────────────────────────────────────────────────────────

describe("esc", () => {
  describe("GIVEN a plain string", () => {
    it("THEN returns it unchanged", () => {
      expect.assertions(1);
      expect(esc("hello")).toBe("hello");
    });
  });

  describe("GIVEN a string with HTML special characters", () => {
    it("THEN escapes & to &amp;", () => {
      expect.assertions(1);
      expect(esc("a & b")).toBe("a &amp; b");
    });

    it("THEN escapes < to &lt;", () => {
      expect.assertions(1);
      expect(esc("<script>")).toBe("&lt;script&gt;");
    });

    it("THEN escapes > to &gt;", () => {
      expect.assertions(1);
      expect(esc("a > b")).toBe("a &gt; b");
    });

    it('THEN escapes " to &quot;', () => {
      expect.assertions(1);
      expect(esc('"quoted"')).toBe("&quot;quoted&quot;");
    });

    it("THEN escapes all special characters in one string", () => {
      expect.assertions(1);
      expect(esc('<a href="x">link & go</a>')).toBe(
        "&lt;a href=&quot;x&quot;&gt;link &amp; go&lt;/a&gt;"
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hexToRgba
// ─────────────────────────────────────────────────────────────────────────────

describe("hexToRgba", () => {
  describe("GIVEN a full red hex color", () => {
    it("THEN returns rgba(255,0,0,alpha)", () => {
      expect.assertions(1);
      expect(hexToRgba("#ff0000", 1)).toBe("rgba(255,0,0,1)");
    });
  });

  describe("GIVEN a full blue hex color with 50% alpha", () => {
    it("THEN returns rgba(0,0,255,0.5)", () => {
      expect.assertions(1);
      expect(hexToRgba("#0000ff", 0.5)).toBe("rgba(0,0,255,0.5)");
    });
  });

  describe("GIVEN pure white", () => {
    it("THEN returns rgba(255,255,255,1)", () => {
      expect.assertions(1);
      expect(hexToRgba("#ffffff", 1)).toBe("rgba(255,255,255,1)");
    });
  });

  describe("GIVEN a mixed color", () => {
    it("THEN correctly parses each channel", () => {
      expect.assertions(1);
      expect(hexToRgba("#3b82f6", 0.8)).toBe("rgba(59,130,246,0.8)");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// contrastColor
// ─────────────────────────────────────────────────────────────────────────────

describe("contrastColor", () => {
  describe("GIVEN a very dark background (black)", () => {
    it("THEN returns #fff for legibility", () => {
      expect.assertions(1);
      expect(contrastColor("#000000")).toBe("#fff");
    });
  });

  describe("GIVEN a very light background (white)", () => {
    it("THEN returns #000 for legibility", () => {
      expect.assertions(1);
      expect(contrastColor("#ffffff")).toBe("#000");
    });
  });

  describe("GIVEN a mid-luminance blue", () => {
    it("THEN returns #000 (blue luminance exceeds 0.179 threshold)", () => {
      expect.assertions(1);
      expect(contrastColor("#3b82f6")).toBe("#000");
    });
  });

  describe("GIVEN a bright yellow", () => {
    it("THEN returns #000 (yellow is light)", () => {
      expect.assertions(1);
      expect(contrastColor("#ffff00")).toBe("#000");
    });
  });

  describe("GIVEN invalid input", () => {
    it("THEN returns #fff for null", () => {
      expect.assertions(1);
      expect(contrastColor(null)).toBe("#fff");
    });

    it("THEN returns #fff for a non-6-char hex", () => {
      expect.assertions(1);
      expect(contrastColor("#abc")).toBe("#fff");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fmtRelativeTime
// ─────────────────────────────────────────────────────────────────────────────

describe("fmtRelativeTime", () => {
  let nowSpy: ReturnType<typeof vi.spyOn>;
  const FIXED_NOW = new Date("2026-04-01T12:00:00Z").getTime();

  beforeEach(() => {
    nowSpy = vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  describe("GIVEN a timestamp less than 1 minute ago", () => {
    it("THEN returns 'Just now'", () => {
      expect.assertions(1);
      const iso = new Date(FIXED_NOW - 30_000).toISOString();
      expect(fmtRelativeTime(iso)).toBe("Just now");
    });
  });

  describe("GIVEN a timestamp 5 minutes ago", () => {
    it("THEN returns '5m ago'", () => {
      expect.assertions(1);
      const iso = new Date(FIXED_NOW - 5 * 60_000).toISOString();
      expect(fmtRelativeTime(iso)).toBe("5m ago");
    });
  });

  describe("GIVEN a timestamp 2 hours ago", () => {
    it("THEN returns '2h ago'", () => {
      expect.assertions(1);
      const iso = new Date(FIXED_NOW - 2 * 60 * 60_000).toISOString();
      expect(fmtRelativeTime(iso)).toBe("2h ago");
    });
  });

  describe("GIVEN a timestamp 3 days ago", () => {
    it("THEN returns '3d ago'", () => {
      expect.assertions(1);
      const iso = new Date(FIXED_NOW - 3 * 24 * 60 * 60_000).toISOString();
      expect(fmtRelativeTime(iso)).toBe("3d ago");
    });
  });

  describe("GIVEN a timestamp more than 7 days ago", () => {
    it("THEN returns a formatted date string (not relative)", () => {
      expect.assertions(1);
      const iso = new Date(FIXED_NOW - 10 * 24 * 60 * 60_000).toISOString();
      const result = fmtRelativeTime(iso);
      expect(result).not.toMatch(/ago$/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buildDataPointsHistoryPath
// ─────────────────────────────────────────────────────────────────────────────

describe("buildDataPointsHistoryPath", () => {
  describe("GIVEN an empty target and no options", () => {
    it("THEN returns the base panel path with no query params", () => {
      expect.assertions(1);
      const result = buildDataPointsHistoryPath({}, {});
      expect(result).toBe("/hass-datapoints-history?");
    });
  });

  describe("GIVEN a single entity_id", () => {
    it("THEN includes entity_id in the query string", () => {
      expect.assertions(1);
      const result = buildDataPointsHistoryPath(
        { entity_id: ["sensor.temp"] },
        {}
      );
      expect(result).toContain("entity_id=sensor.temp");
    });
  });

  describe("GIVEN duplicate entity IDs", () => {
    it("THEN deduplicates them in the output", () => {
      expect.assertions(1);
      const result = buildDataPointsHistoryPath(
        { entity_id: ["sensor.a", "sensor.a"] },
        {}
      );
      const url = new URL(result, "http://localhost");
      expect(url.searchParams.get("entity_id")).toBe("sensor.a");
    });
  });

  describe("GIVEN device_id and area_id", () => {
    it("THEN includes both in the query string", () => {
      expect.assertions(2);
      const result = buildDataPointsHistoryPath(
        { device_id: ["dev-1"], area_id: ["area-1"] },
        {}
      );
      expect(result).toContain("device_id=dev-1");
      expect(result).toContain("area_id=area-1");
    });
  });

  describe("GIVEN datapoint_scope='all'", () => {
    it("THEN includes datapoints_scope=all in the query string", () => {
      expect.assertions(1);
      const result = buildDataPointsHistoryPath({}, { datapoint_scope: "all" });
      expect(result).toContain("datapoints_scope=all");
    });
  });

  describe("GIVEN valid start_time and end_time", () => {
    it("THEN includes start_time, end_time and hours_to_show", () => {
      expect.assertions(3);
      const start = "2026-03-01T00:00:00Z";
      const end = "2026-03-02T00:00:00Z";
      const result = buildDataPointsHistoryPath(
        {},
        { start_time: start, end_time: end }
      );
      expect(result).toContain("start_time=");
      expect(result).toContain("end_time=");
      expect(result).toContain("hours_to_show=24");
    });
  });

  describe("GIVEN an end_time before start_time", () => {
    it("THEN does NOT include time range params (invalid range ignored)", () => {
      expect.assertions(1);
      const result = buildDataPointsHistoryPath(
        {},
        { start_time: "2026-03-02T00:00:00Z", end_time: "2026-03-01T00:00:00Z" }
      );
      expect(result).not.toContain("start_time=");
    });
  });

  describe("GIVEN valid zoom_start_time and zoom_end_time", () => {
    it("THEN includes zoom range params", () => {
      expect.assertions(2);
      const result = buildDataPointsHistoryPath(
        {},
        {
          zoom_start_time: "2026-03-01T06:00:00Z",
          zoom_end_time: "2026-03-01T12:00:00Z",
        }
      );
      expect(result).toContain("zoom_start_time=");
      expect(result).toContain("zoom_end_time=");
    });
  });
});
