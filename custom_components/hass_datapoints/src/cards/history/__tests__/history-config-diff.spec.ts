import { describe, expect, it } from "vitest";
import {
  buildDataKey,
  buildViewKey,
  buildComparisonKey,
  buildPreloadComparisonKey,
  buildComparisonOverlayKey,
  diffCardConfig,
  hasDrawableHistoryData,
  getDrawableHistoryQuality,
  filterEvents,
} from "../history-config-diff";
import type { CardConfig } from "@/lib/types";

const baseConfig: Partial<CardConfig> = {
  entity: "sensor.temp",
  hours_to_show: 24,
};

describe("buildDataKey", () => {
  describe("GIVEN identical configs", () => {
    it("THEN produces the same key", () => {
      expect(buildDataKey(baseConfig)).toBe(buildDataKey(baseConfig));
    });
  });

  describe("GIVEN different entities", () => {
    it("THEN produces different keys", () => {
      const a = { entity: "sensor.a" };
      const b = { entity: "sensor.b" };
      expect(buildDataKey(a)).not.toBe(buildDataKey(b));
    });
  });

  describe("GIVEN different hours_to_show", () => {
    it("THEN produces different keys", () => {
      const a = { ...baseConfig, hours_to_show: 24 };
      const b = { ...baseConfig, hours_to_show: 48 };
      expect(buildDataKey(a)).not.toBe(buildDataKey(b));
    });
  });

  describe("GIVEN series_settings with entity_id", () => {
    it("THEN includes entity IDs in key", () => {
      const a = {
        series_settings: [{ entity_id: "sensor.a" }, { entity_id: "sensor.b" }],
      };
      const b = {
        series_settings: [{ entity_id: "sensor.a" }, { entity_id: "sensor.c" }],
      };
      expect(buildDataKey(a as Partial<CardConfig>)).not.toBe(
        buildDataKey(b as Partial<CardConfig>)
      );
    });
  });
});

describe("buildViewKey", () => {
  describe("GIVEN identical configs", () => {
    it("THEN produces the same key", () => {
      expect(buildViewKey(baseConfig)).toBe(buildViewKey(baseConfig));
    });
  });

  describe("GIVEN different show_tooltips", () => {
    it("THEN produces different keys", () => {
      const a = { show_tooltips: true };
      const b = { show_tooltips: false };
      expect(buildViewKey(a as Partial<CardConfig>)).not.toBe(
        buildViewKey(b as Partial<CardConfig>)
      );
    });
  });

  describe("GIVEN different trend_method", () => {
    it("THEN produces different keys", () => {
      const a = { trend_method: "ema" };
      const b = { trend_method: "linear_trend" };
      expect(buildViewKey(a as Partial<CardConfig>)).not.toBe(
        buildViewKey(b as Partial<CardConfig>)
      );
    });
  });
});

describe("buildComparisonKey", () => {
  describe("GIVEN no comparison_windows", () => {
    it("THEN produces empty array JSON", () => {
      expect(buildComparisonKey({})).toBe("[]");
    });
  });

  describe("GIVEN comparison_windows", () => {
    it("THEN includes them in the key", () => {
      const a = { comparison_windows: [{ id: "w1", time_offset_ms: 100 }] };
      const b = { comparison_windows: [{ id: "w2", time_offset_ms: 200 }] };
      expect(buildComparisonKey(a as Partial<CardConfig>)).not.toBe(
        buildComparisonKey(b as Partial<CardConfig>)
      );
    });
  });
});

describe("buildPreloadComparisonKey", () => {
  describe("GIVEN no preload_comparison_windows", () => {
    it("THEN produces empty array JSON", () => {
      expect(buildPreloadComparisonKey({})).toBe("[]");
    });
  });
});

describe("buildComparisonOverlayKey", () => {
  describe("GIVEN no comparison_preview_overlay", () => {
    it("THEN produces null JSON", () => {
      expect(buildComparisonOverlayKey({})).toBe("null");
    });
  });
});

describe("diffCardConfig", () => {
  describe("GIVEN identical configs", () => {
    it("THEN all changes are false", () => {
      const result = diffCardConfig(baseConfig, baseConfig);
      expect(result.dataChanged).toBe(false);
      expect(result.viewChanged).toBe(false);
      expect(result.comparisonChanged).toBe(false);
      expect(result.preloadComparisonChanged).toBe(false);
      expect(result.comparisonOverlayChanged).toBe(false);
    });
  });

  describe("GIVEN different entity", () => {
    it("THEN dataChanged is true", () => {
      const result = diffCardConfig(
        { entity: "sensor.a" },
        { entity: "sensor.b" }
      );
      expect(result.dataChanged).toBe(true);
      expect(result.viewChanged).toBe(false);
    });
  });

  describe("GIVEN different show_tooltips", () => {
    it("THEN viewChanged is true", () => {
      const a = { show_tooltips: true } as Partial<CardConfig>;
      const b = { show_tooltips: false } as Partial<CardConfig>;
      const result = diffCardConfig(a, b);
      expect(result.dataChanged).toBe(false);
      expect(result.viewChanged).toBe(true);
    });
  });

  describe("GIVEN different comparison_windows", () => {
    it("THEN comparisonChanged is true", () => {
      const a = { comparison_windows: [] } as Partial<CardConfig>;
      const b = {
        comparison_windows: [{ id: "w1", time_offset_ms: 100 }],
      } as Partial<CardConfig>;
      const result = diffCardConfig(a, b);
      expect(result.comparisonChanged).toBe(true);
    });
  });
});

describe("hasDrawableHistoryData", () => {
  describe("GIVEN entity with history data", () => {
    it("THEN returns true", () => {
      expect(
        hasDrawableHistoryData(
          ["sensor.temp"],
          { "sensor.temp": [{ s: "21" }] },
          {}
        )
      ).toBe(true);
    });
  });

  describe("GIVEN entity with statistics data only", () => {
    it("THEN returns true", () => {
      expect(
        hasDrawableHistoryData(
          ["sensor.temp"],
          {},
          { "sensor.temp": [{ mean: 21 }] }
        )
      ).toBe(true);
    });
  });

  describe("GIVEN no data for any entity", () => {
    it("THEN returns false", () => {
      expect(hasDrawableHistoryData(["sensor.temp"], {}, {})).toBe(false);
    });
  });

  describe("GIVEN empty arrays", () => {
    it("THEN returns false", () => {
      expect(
        hasDrawableHistoryData(
          ["sensor.temp"],
          { "sensor.temp": [] },
          { "sensor.temp": [] }
        )
      ).toBe(false);
    });
  });
});

describe("getDrawableHistoryQuality", () => {
  describe("GIVEN data for multiple entities", () => {
    it("THEN sums all points", () => {
      const result = getDrawableHistoryQuality(
        ["sensor.a", "sensor.b"],
        { "sensor.a": [1, 2, 3], "sensor.b": [4, 5] },
        { "sensor.a": [6] }
      );
      expect(result.totalPoints).toBe(6);
    });
  });

  describe("GIVEN no data", () => {
    it("THEN returns zero points", () => {
      expect(getDrawableHistoryQuality(["sensor.a"], {}, {}).totalPoints).toBe(
        0
      );
    });
  });
});

describe("filterEvents", () => {
  const events = [
    { id: "e1", message: "Temperature spike" },
    { id: "e2", message: "Humidity drop" },
    { id: "e3", message: "Normal reading" },
  ];

  describe("GIVEN no hidden IDs and no filter", () => {
    it("THEN returns all events", () => {
      expect(filterEvents(events, new Set(), "")).toHaveLength(3);
    });
  });

  describe("GIVEN hidden event IDs", () => {
    it("THEN excludes hidden events", () => {
      const result = filterEvents(events, new Set(["e2"]), "");
      expect(result).toHaveLength(2);
      expect(result).not.toContainEqual(expect.objectContaining({ id: "e2" }));
    });
  });

  describe("GIVEN a message filter", () => {
    it("THEN filters by message content", () => {
      const result = filterEvents(events, new Set(), "spike");
      expect(result).toHaveLength(1);
      expect((result[0] as { id: string }).id).toBe("e1");
    });
  });

  describe("GIVEN both hidden IDs and a filter", () => {
    it("THEN applies both filters", () => {
      const result = filterEvents(events, new Set(["e1"]), "drop");
      expect(result).toHaveLength(1);
      expect((result[0] as { id: string }).id).toBe("e2");
    });
  });

  describe("GIVEN a filter matching entity_ids", () => {
    it("THEN matches against entity_ids", () => {
      const eventsWithEntities = [
        { id: "e1", message: "Alert", entity_ids: ["sensor.temp"] },
        { id: "e2", message: "Alert", entity_ids: ["sensor.humidity"] },
      ];
      const result = filterEvents(eventsWithEntities, new Set(), "temp");
      expect(result).toHaveLength(1);
    });
  });

  describe("GIVEN case-insensitive filter", () => {
    it("THEN matches regardless of case", () => {
      const result = filterEvents(events, new Set(), "SPIKE");
      expect(result).toHaveLength(1);
    });
  });
});
