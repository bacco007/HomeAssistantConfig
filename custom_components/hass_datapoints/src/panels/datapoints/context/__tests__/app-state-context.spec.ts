import { describe, expect, it } from "vitest";

import { createHistoryPageAppStateContext } from "../app-state-context";

describe("app-state-context", () => {
  describe("GIVEN a fresh app state context", () => {
    describe("WHEN the core page state is updated", () => {
      it("THEN it stores sidebar, range, target, and comparison state in one place", () => {
        expect.assertions(8);
        const context = createHistoryPageAppStateContext();

        context.setSidebarCollapsed(true);
        context.setRange(
          new Date("2026-03-01T00:00:00.000Z"),
          new Date("2026-03-02T00:00:00.000Z")
        );
        context.setPreviewZoomRange({ start: 10, end: 20 });
        context.setCommittedZoomRange({ start: 30, end: 40 });
        context.setTargetSelection({ entity_id: ["sensor.one"] });
        context.setTargetSelectionRaw({ entity_id: ["sensor.raw"] });
        context.setSeriesRows([
          { entity_id: "sensor.one", color: "#123456", visible: true },
        ]);
        context.setComparisonWindows([
          { id: "window-a", start_time: "2026-01-01", end_time: "2026-01-02" },
        ]);
        context.setSelectedComparisonWindowId("window-a");
        context.setHoveredComparisonWindowId("window-b");

        expect(context.state.display.sidebarCollapsed).toBe(true);
        expect(context.state.range.startTime?.toISOString()).toBe(
          "2026-03-01T00:00:00.000Z"
        );
        expect(context.state.range.endTime?.toISOString()).toBe(
          "2026-03-02T00:00:00.000Z"
        );
        expect(context.state.range.previewZoomRange).toEqual({
          start: 10,
          end: 20,
        });
        expect(context.state.range.committedZoomRange).toEqual({
          start: 30,
          end: 40,
        });
        expect(context.state.targets.selection).toEqual({
          entity_id: ["sensor.one"],
        });
        expect(context.state.targets.rows[0]?.entity_id).toBe("sensor.one");
        expect(context.state.comparison.selectedWindowId).toBe("window-a");
      });
    });
  });
});
