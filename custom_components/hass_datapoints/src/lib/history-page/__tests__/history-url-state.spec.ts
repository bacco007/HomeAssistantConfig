import { describe, expect, it } from "vitest";

import {
  makeDateWindowId,
  normalizeDateWindows,
  parseDateWindowsParam,
  parseHistoryPageStateParam,
  serializeDateWindowsParam,
  serializeHistoryPageStateParam,
} from "@/lib/history-page/history-url-state";

describe("history-url-state", () => {
  describe("GIVEN a label and existing ids", () => {
    describe("WHEN makeDateWindowId is called", () => {
      it("THEN it returns a unique slug id", () => {
        expect.assertions(1);

        expect(
          makeDateWindowId("Heating season", new Set(["heating-season"]))
        ).toBe("heating-season-2");
      });
    });
  });

  describe("GIVEN mixed date windows", () => {
    describe("WHEN normalizeDateWindows is called", () => {
      it("THEN it filters invalid windows and normalizes valid ones", () => {
        expect.assertions(2);

        const normalized = normalizeDateWindows([
          {
            label: "Heating season",
            start: "2026-01-01T00:00:00.000Z",
            end: "2026-02-01T00:00:00.000Z",
          },
          {
            label: "Broken",
            start: "2026-02-01T00:00:00.000Z",
            end: "2026-01-01T00:00:00.000Z",
          },
        ]);

        expect(normalized).toHaveLength(1);
        expect(normalized[0]).toEqual(
          expect.objectContaining({
            label: "Heating season",
            start_time: "2026-01-01T00:00:00.000Z",
            end_time: "2026-02-01T00:00:00.000Z",
          })
        );
      });
    });
  });

  describe("GIVEN normalized date windows", () => {
    describe("WHEN they are serialized and parsed", () => {
      it("THEN they round-trip through the URL param shape", () => {
        expect.assertions(1);

        const windows = normalizeDateWindows([
          {
            label: "Heating season",
            start: "2026-01-01T00:00:00.000Z",
            end: "2026-02-01T00:00:00.000Z",
          },
          {
            label: "Cooling season",
            start: "2026-06-01T00:00:00.000Z",
            end: "2026-07-01T00:00:00.000Z",
          },
        ]);

        expect(
          parseDateWindowsParam(serializeDateWindowsParam(windows))
        ).toEqual(windows);
      });
    });
  });

  describe("GIVEN page state objects", () => {
    describe("WHEN they are serialized and parsed", () => {
      it("THEN they round-trip through the page_state query param", () => {
        expect.assertions(1);

        const state = {
          datapoint_scope: "all",
          chart_hover_snap_mode: "snap_to_data_points",
          series_rows: [
            {
              entity_id: "sensor.alpha",
              visible: false,
              color: "#abcdef",
            },
          ],
        };

        expect(
          parseHistoryPageStateParam(serializeHistoryPageStateParam(state))
        ).toEqual(state);
      });
    });
  });
});
