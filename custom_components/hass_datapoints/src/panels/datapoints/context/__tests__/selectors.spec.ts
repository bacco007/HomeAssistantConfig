import { describe, expect, it } from "vitest";

import {
  selectActiveComparisonWindow,
  selectEffectiveZoomRange,
  selectHiddenEntityIds,
  selectVisibleEntityIds,
} from "../selectors";
import type { HistoryPageState } from "../types";

function createState(): HistoryPageState {
  return {
    display: {
      sidebarCollapsed: false,
    },
    range: {
      startTime: null,
      endTime: null,
      previewZoomRange: null,
      committedZoomRange: null,
    },
    comparison: {
      windows: [],
      selectedWindowId: null,
      hoveredWindowId: null,
    },
    targets: {
      selection: {},
      rawSelection: {},
      rows: [],
    },
  };
}

describe("selectors", () => {
  describe("GIVEN target row visibility state", () => {
    describe("WHEN selecting visible and hidden entity ids", () => {
      it("THEN it returns the ids in the correct groups", () => {
        expect.assertions(2);
        const state = createState();
        state.targets.rows = [
          { entity_id: "sensor.one", color: "#111", visible: true },
          { entity_id: "sensor.two", color: "#222", visible: false },
          { entity_id: "sensor.three", color: "#333" },
        ];

        expect(selectVisibleEntityIds(state)).toEqual([
          "sensor.one",
          "sensor.three",
        ]);
        expect(selectHiddenEntityIds(state)).toEqual(["sensor.two"]);
      });
    });
  });

  describe("GIVEN preview and committed zoom ranges", () => {
    describe("WHEN selecting the effective zoom range", () => {
      it("THEN it prefers the preview range over the committed range", () => {
        expect.assertions(1);
        const state = createState();
        state.range.committedZoomRange = { start: 10, end: 20 };
        state.range.previewZoomRange = { start: 15, end: 25 };

        expect(selectEffectiveZoomRange(state)).toEqual({ start: 15, end: 25 });
      });
    });
  });

  describe("GIVEN comparison window hover and selection state", () => {
    describe("WHEN selecting the active comparison window", () => {
      it("THEN it returns the selected window before the hovered window", () => {
        expect.assertions(1);
        const state = createState();
        state.comparison.windows = [
          { id: "baseline", start_time: "2026-01-01", end_time: "2026-01-02" },
          { id: "hovered", start_time: "2026-02-01", end_time: "2026-02-02" },
        ];
        state.comparison.selectedWindowId = "baseline";
        state.comparison.hoveredWindowId = "hovered";

        expect(selectActiveComparisonWindow(state)?.id).toBe("baseline");
      });
    });
  });
});
