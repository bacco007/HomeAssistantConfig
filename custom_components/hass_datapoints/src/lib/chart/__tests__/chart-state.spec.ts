import { describe, expect, it } from "vitest";
import {
  createHiddenSeriesSet,
  createHiddenEventIdSet,
} from "@/lib/chart/chart-state";

describe("chart-state lib", () => {
  describe("GIVEN series settings with hidden entries", () => {
    describe("WHEN createHiddenSeriesSet is called", () => {
      it("THEN it returns only hidden entity ids", () => {
        expect.assertions(1);
        const result = createHiddenSeriesSet([
          { entity_id: "sensor.alpha", visible: false },
          { entity_id: "sensor.beta", visible: true },
          { entity: "sensor.gamma", visible: false },
        ]);

        expect([...result]).toEqual(["sensor.alpha", "sensor.gamma"]);
      });
    });
  });

  describe("GIVEN event ids with empty values", () => {
    describe("WHEN createHiddenEventIdSet is called", () => {
      it("THEN it filters invalid ids", () => {
        expect.assertions(1);
        const result = createHiddenEventIdSet(["a", "", null, "b"]);

        expect([...result]).toEqual(["a", "b"]);
      });
    });
  });
});
