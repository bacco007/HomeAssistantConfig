import { describe, expect, it } from "vitest";

import { getAxisValueExtent } from "../axis-extent";

describe("data/axis-extent", () => {
  describe("GIVEN getAxisValueExtent", () => {
    describe("WHEN finite numeric values are present", () => {
      it("THEN it returns the finite min and max", () => {
        expect.assertions(1);
        expect(getAxisValueExtent([null, "2", 5, undefined, -1])).toEqual({
          min: -1,
          max: 5,
        });
      });
    });

    describe("WHEN no finite values are present", () => {
      it("THEN it returns null", () => {
        expect.assertions(1);
        expect(
          getAxisValueExtent([undefined, "not-a-number", Number.NaN])
        ).toBeNull();
      });
    });
  });
});
