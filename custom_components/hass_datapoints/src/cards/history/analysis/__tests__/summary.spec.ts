import { describe, expect, it } from "vitest";

import { buildSummaryStats } from "../summary";

describe("analysis/summary", () => {
  describe("GIVEN buildSummaryStats", () => {
    describe("WHEN numeric points are provided", () => {
      it("THEN it returns min max and mean", () => {
        expect.assertions(1);
        expect(
          buildSummaryStats([
            [0, 10],
            [60, 20],
            [120, 30],
          ])
        ).toEqual({
          min: 10,
          max: 30,
          mean: 20,
        });
      });
    });

    describe("WHEN only non-finite values are provided", () => {
      it("THEN it returns null", () => {
        expect.assertions(1);
        expect(
          buildSummaryStats([
            [0, Number.NaN],
            [60, Number.POSITIVE_INFINITY],
          ])
        ).toBeNull();
      });
    });
  });
});
