import { describe, expect, it } from "vitest";
import {
  getActiveComparisonWindow,
  getComparisonPreviewOverlay,
  getPreviewComparisonWindows,
  getPreloadComparisonWindows,
  applyDateWindowShortcut,
} from "../comparison-windows";
import type { NormalizedHistoryDateWindow } from "@/lib/history-page/history-url-state";

const makeWindow = (
  id: string,
  startTime = "2024-06-01T00:00:00Z",
  endTime = "2024-06-08T00:00:00Z",
  label?: string
): NormalizedHistoryDateWindow => ({
  id,
  start_time: startTime,
  end_time: endTime,
  ...(label ? { label } : {}),
});

describe("getActiveComparisonWindow", () => {
  const windows = [makeWindow("w1"), makeWindow("w2"), makeWindow("w3")];

  describe("GIVEN a hovered window ID", () => {
    it("THEN returns the hovered window", () => {
      const result = getActiveComparisonWindow(windows, "w2", "w1");
      expect(result?.id).toBe("w2");
    });
  });

  describe("GIVEN no hovered but a selected window ID", () => {
    it("THEN returns the selected window", () => {
      const result = getActiveComparisonWindow(windows, null, "w3");
      expect(result?.id).toBe("w3");
    });
  });

  describe("GIVEN neither hovered nor selected", () => {
    it("THEN returns null", () => {
      expect(getActiveComparisonWindow(windows, null, null)).toBeNull();
    });
  });

  describe("GIVEN a non-existent ID", () => {
    it("THEN returns null", () => {
      expect(getActiveComparisonWindow(windows, "missing", null)).toBeNull();
    });
  });
});

describe("getComparisonPreviewOverlay", () => {
  describe("GIVEN valid window and time range", () => {
    it("THEN returns overlay labels when actual differs from window range", () => {
      const window = makeWindow(
        "w1",
        "2024-06-01T00:00:00Z",
        "2024-06-08T00:00:00Z"
      );
      const startTime = new Date("2024-06-15T00:00:00Z");
      const endTime = new Date("2024-06-16T00:00:00Z"); // 1 day span
      const result = getComparisonPreviewOverlay(window, startTime, endTime);
      expect(result).not.toBeNull();
      expect(result!.window_range_label).toBeTruthy();
      expect(result!.actual_range_label).toBeTruthy();
    });
  });

  describe("GIVEN no active window", () => {
    it("THEN returns null", () => {
      const result = getComparisonPreviewOverlay(null, new Date(), new Date());
      expect(result).toBeNull();
    });
  });

  describe("GIVEN no start/end time", () => {
    it("THEN returns null", () => {
      const result = getComparisonPreviewOverlay(makeWindow("w1"), null, null);
      expect(result).toBeNull();
    });
  });
});

describe("getPreviewComparisonWindows", () => {
  const windows = [makeWindow("w1"), makeWindow("w2"), makeWindow("w3")];
  const startTime = new Date("2024-06-15T00:00:00Z");

  describe("GIVEN selected and hovered IDs", () => {
    it("THEN returns both with time offsets", () => {
      const result = getPreviewComparisonWindows(
        windows,
        "w1",
        "w2",
        startTime
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("w1");
      expect(result[1].id).toBe("w2");
      expect(typeof result[0].time_offset_ms).toBe("number");
    });
  });

  describe("GIVEN only selected ID", () => {
    it("THEN returns one window", () => {
      const result = getPreviewComparisonWindows(
        windows,
        "w1",
        null,
        startTime
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("GIVEN no IDs", () => {
    it("THEN returns empty", () => {
      expect(
        getPreviewComparisonWindows(windows, null, null, startTime)
      ).toEqual([]);
    });
  });

  describe("GIVEN no start time", () => {
    it("THEN returns empty", () => {
      expect(getPreviewComparisonWindows(windows, "w1", null, null)).toEqual(
        []
      );
    });
  });

  describe("GIVEN same ID for selected and hovered", () => {
    it("THEN returns only one entry (no duplicates)", () => {
      const result = getPreviewComparisonWindows(
        windows,
        "w1",
        "w1",
        startTime
      );
      expect(result).toHaveLength(1);
    });
  });
});

describe("getPreloadComparisonWindows", () => {
  const windows = [makeWindow("w1"), makeWindow("w2")];
  const startTime = new Date("2024-06-15T00:00:00Z");

  describe("GIVEN valid windows and start time", () => {
    it("THEN returns all windows with time offsets", () => {
      const result = getPreloadComparisonWindows(windows, startTime);
      expect(result).toHaveLength(2);
      expect(result.every((w) => typeof w.time_offset_ms === "number")).toBe(
        true
      );
    });
  });

  describe("GIVEN no start time", () => {
    it("THEN returns empty", () => {
      expect(getPreloadComparisonWindows(windows, null)).toEqual([]);
    });
  });
});

describe("applyDateWindowShortcut", () => {
  const draft = {
    start: new Date("2024-06-15T00:00:00Z"),
    end: new Date("2024-06-16T00:00:00Z"),
  };
  const mockGetRoundedUnit = () => null; // No unit-aligned
  const mockShiftByUnit = (d: Date, _u: string, amt: number) =>
    new Date(d.getTime() + amt * 86400000);
  const mockStartOfUnit = (d: Date) => d;
  const mockEndOfUnit = (d: Date) => new Date(d.getTime() + 86400000);

  describe("GIVEN valid draft and no rounded unit", () => {
    it("THEN shifts by raw span", () => {
      const result = applyDateWindowShortcut(
        draft,
        1,
        mockGetRoundedUnit,
        mockShiftByUnit,
        mockStartOfUnit,
        mockEndOfUnit
      );
      expect(result).not.toBeNull();
      // 1 day span shifted forward by 1 day
      expect(result!.start.getTime()).toBe(
        new Date("2024-06-16T00:00:00Z").getTime()
      );
      expect(result!.end.getTime()).toBe(
        new Date("2024-06-17T00:00:00Z").getTime()
      );
    });
  });

  describe("GIVEN valid draft with rounded unit", () => {
    it("THEN shifts by unit", () => {
      const getRoundedUnit = () => "day";
      const result = applyDateWindowShortcut(
        draft,
        -1,
        getRoundedUnit,
        mockShiftByUnit,
        mockStartOfUnit,
        mockEndOfUnit
      );
      expect(result).not.toBeNull();
      expect(result!.start.getTime()).toBeLessThan(draft.start.getTime());
    });
  });

  describe("GIVEN null draft range", () => {
    it("THEN returns null", () => {
      expect(
        applyDateWindowShortcut(
          null,
          1,
          mockGetRoundedUnit,
          mockShiftByUnit,
          mockStartOfUnit,
          mockEndOfUnit
        )
      ).toBeNull();
    });
  });

  describe("GIVEN invalid draft (start >= end)", () => {
    it("THEN returns null", () => {
      const invalid = {
        start: new Date("2024-06-16T00:00:00Z"),
        end: new Date("2024-06-15T00:00:00Z"),
      };
      expect(
        applyDateWindowShortcut(
          invalid,
          1,
          mockGetRoundedUnit,
          mockShiftByUnit,
          mockStartOfUnit,
          mockEndOfUnit
        )
      ).toBeNull();
    });
  });
});
