import { describe, expect, it } from "vitest";
import { calculateViewportScrollPosition } from "../chart-scroll";

describe("chart-scroll", () => {
  describe("GIVEN calculateViewportScrollPosition", () => {
    describe("WHEN zoom range is at the start", () => {
      it("THEN scroll position is 0", () => {
        expect.assertions(1);
        expect(
          calculateViewportScrollPosition(0, 1000, 1000, 400, 0, 400)
        ).toBe(0);
      });
    });

    describe("WHEN zoom range is at the end", () => {
      it("THEN scroll position is at maxScrollLeft", () => {
        expect.assertions(1);
        const result = calculateViewportScrollPosition(
          0,
          1000,
          1000,
          400,
          600,
          1000
        );
        expect(result).toBe(600);
      });
    });

    describe("WHEN zoom range is in the middle", () => {
      it("THEN scroll position is proportional", () => {
        expect.assertions(1);
        const result = calculateViewportScrollPosition(
          0,
          1000,
          1001,
          400,
          300,
          700
        );
        // ratio = (300 - 0) / (1000 - 400) = 0.5, maxScroll = 601
        expect(result).toBeCloseTo(300.5, 0);
      });
    });

    describe("WHEN canvas width equals viewport width", () => {
      it("THEN scroll position is 0 regardless of zoom", () => {
        expect.assertions(1);
        expect(
          calculateViewportScrollPosition(0, 1000, 400, 400, 200, 600)
        ).toBe(0);
      });
    });
  });
});
