import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildDataPointsHistoryPath,
  navigateToDataPointsHistory,
  navigateToHistory,
} from "@/lib/ha/navigation";

describe("navigation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN entity ids for the core history page", () => {
    describe("WHEN navigateToHistory is called", () => {
      it("THEN it pushes a normalized deduplicated location", () => {
        expect.assertions(2);

        const pushStateSpy = vi
          .spyOn(window.history, "pushState")
          .mockImplementation(() => undefined);
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        navigateToHistory(null, ["sensor.a", "sensor.a", "", "sensor.b"]);

        expect(pushStateSpy).toHaveBeenCalledWith(
          null,
          "",
          "/history?entity_id=sensor.a%2Csensor.b"
        );
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ type: "location-changed" })
        );
      });
    });
  });

  describe("GIVEN datapoints target and range options", () => {
    describe("WHEN buildDataPointsHistoryPath is called", () => {
      it("THEN it builds the expected panel URL", () => {
        expect.assertions(5);

        const path = buildDataPointsHistoryPath(
          {
            entity_id: ["sensor.a", "sensor.a"],
            device_id: ["device.one"],
            area_id: ["kitchen"],
            label_id: ["heating"],
          },
          {
            datapoint_scope: "all",
            start_time: "2026-04-01T00:00:00.000Z",
            end_time: "2026-04-01T03:00:00.000Z",
            zoom_start_time: "2026-04-01T01:00:00.000Z",
            zoom_end_time: "2026-04-01T02:00:00.000Z",
            page_state: { split_chart_view: true },
          }
        );

        expect(path).toContain("/hass-datapoints-history?");
        expect(path).toContain("entity_id=sensor.a");
        expect(path).toContain("hours_to_show=3");
        expect(path).toContain("zoom_start_time=2026-04-01T01%3A00%3A00.000Z");
        expect(path).toContain("page_state=");
      });
    });
  });

  describe("GIVEN datapoints history navigation", () => {
    describe("WHEN navigateToDataPointsHistory is called", () => {
      it("THEN it pushes the built datapoints route", () => {
        expect.assertions(1);

        const pushStateSpy = vi
          .spyOn(window.history, "pushState")
          .mockImplementation(() => undefined);

        navigateToDataPointsHistory(null, { entity_id: ["sensor.a"] }, {});

        expect(pushStateSpy).toHaveBeenCalledWith(
          null,
          "",
          "/hass-datapoints-history?entity_id=sensor.a"
        );
      });
    });
  });
});
