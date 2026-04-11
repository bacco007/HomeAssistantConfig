import { describe, expect, it } from "vitest";

import { createChartZoomRange, parseDateValue } from "@/lib/domain/chart-zoom";

describe("chart-zoom.js", () => {
  describe("GIVEN values in mixed date shapes", () => {
    describe("WHEN parseDateValue is called", () => {
      it("THEN it returns valid dates and rejects invalid values", () => {
        expect.assertions(3);

        expect(parseDateValue("2026-04-01T00:00:00.000Z")?.toISOString()).toBe(
          "2026-04-01T00:00:00.000Z"
        );
        expect(
          parseDateValue(new Date("2026-04-02T00:00:00.000Z"))?.toISOString()
        ).toBe("2026-04-02T00:00:00.000Z");
        expect(parseDateValue("not-a-date")).toBeNull();
      });
    });
  });

  describe("GIVEN a start and end date", () => {
    describe("WHEN createChartZoomRange is called", () => {
      it("THEN it returns only forward-moving valid ranges", () => {
        expect.assertions(2);

        expect(
          createChartZoomRange(
            "2026-04-01T00:00:00.000Z",
            "2026-04-02T00:00:00.000Z"
          )
        ).toEqual({
          start: new Date("2026-04-01T00:00:00.000Z").getTime(),
          end: new Date("2026-04-02T00:00:00.000Z").getTime(),
        });
        expect(
          createChartZoomRange(
            "2026-04-02T00:00:00.000Z",
            "2026-04-01T00:00:00.000Z"
          )
        ).toBeNull();
      });
    });
  });
});
