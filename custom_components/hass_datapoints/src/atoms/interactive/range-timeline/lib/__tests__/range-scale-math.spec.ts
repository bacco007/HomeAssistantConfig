import { describe, expect, it } from "vitest";
import {
  computeRangeLabelStride,
  estimateRangeLabelWidth,
  getRangeUnitAnchorMs,
} from "../range-scale-math";

describe("range-scale-math", () => {
  describe("GIVEN estimateRangeLabelWidth", () => {
    describe("WHEN className is range-scale-label", () => {
      it("THEN uses the scale label metrics", () => {
        expect.assertions(1);
        const result = estimateRangeLabelWidth("Jan", "range-scale-label", 10);
        // 3 chars * 7.2 + 14 + 10 = 45.6
        expect(result).toBeCloseTo(45.6, 1);
      });
    });

    describe("WHEN className is range-context-label", () => {
      it("THEN uses the context label metrics", () => {
        expect.assertions(1);
        const result = estimateRangeLabelWidth(
          "Jan",
          "range-context-label",
          14
        );
        // 3 chars * 8.2 + 20 + 14 = 58.6
        expect(result).toBeCloseTo(58.6, 1);
      });
    });

    describe("WHEN text is empty", () => {
      it("THEN returns only the base padding plus gap", () => {
        expect.assertions(1);
        const result = estimateRangeLabelWidth("", "range-scale-label", 10);
        // 0 * 7.2 + 14 + 10 = 24
        expect(result).toBe(24);
      });
    });
  });

  describe("GIVEN computeRangeLabelStride", () => {
    const boundsMin = new Date(2025, 0, 1).getTime();
    const boundsMax = new Date(2025, 0, 31).getTime(); // 30 days

    describe("WHEN content width is large enough for all labels", () => {
      it("THEN returns stride of 1", () => {
        expect.assertions(1);
        const result = computeRangeLabelStride(
          boundsMin,
          boundsMax,
          3000, // wide viewport
          "day",
          (d) => d.getDate().toString(),
          "range-scale-label",
          10
        );
        expect(result).toBe(1);
      });
    });

    describe("WHEN content width is very small", () => {
      it("THEN returns stride > 1 to avoid overlap", () => {
        expect.assertions(1);
        const result = computeRangeLabelStride(
          boundsMin,
          boundsMax,
          100, // very narrow
          "day",
          (d) => d.getDate().toString(),
          "range-scale-label",
          10
        );
        expect(result).toBeGreaterThan(1);
      });
    });

    describe("WHEN content width is 0", () => {
      it("THEN returns 1", () => {
        expect.assertions(1);
        expect(
          computeRangeLabelStride(
            boundsMin,
            boundsMax,
            0,
            "day",
            () => "X",
            "range-scale-label",
            10
          )
        ).toBe(1);
      });
    });
  });

  describe("GIVEN getRangeUnitAnchorMs", () => {
    const boundsMin = new Date(2025, 0, 1).getTime();
    const boundsMax = new Date(2025, 1, 1).getTime();

    describe("WHEN anchor is start", () => {
      it("THEN returns the start of the unit", () => {
        expect.assertions(1);
        const ref = new Date(2025, 0, 15);
        const result = getRangeUnitAnchorMs(
          ref,
          "month",
          boundsMin,
          boundsMax,
          "start"
        );
        expect(result).toBe(boundsMin);
      });
    });

    describe("WHEN anchor is center for a day", () => {
      it("THEN returns the midpoint of the day", () => {
        expect.assertions(1);
        const ref = new Date(2025, 0, 15);
        const result = getRangeUnitAnchorMs(
          ref,
          "day",
          boundsMin,
          boundsMax,
          "center"
        );
        const dayStart = new Date(2025, 0, 15).getTime();
        const dayEnd = new Date(2025, 0, 16).getTime();
        expect(result).toBe(dayStart + (dayEnd - dayStart) / 2);
      });
    });

    describe("WHEN anchor is auto and unit is day", () => {
      it("THEN resolves to center", () => {
        expect.assertions(1);
        const ref = new Date(2025, 0, 15);
        const resultAuto = getRangeUnitAnchorMs(
          ref,
          "day",
          boundsMin,
          boundsMax,
          "auto"
        );
        const resultCenter = getRangeUnitAnchorMs(
          ref,
          "day",
          boundsMin,
          boundsMax,
          "center"
        );
        expect(resultAuto).toBe(resultCenter);
      });
    });

    describe("WHEN anchor is auto and unit is month", () => {
      it("THEN resolves to start", () => {
        expect.assertions(1);
        const ref = new Date(2025, 0, 15);
        const resultAuto = getRangeUnitAnchorMs(
          ref,
          "month",
          boundsMin,
          boundsMax,
          "auto"
        );
        const resultStart = getRangeUnitAnchorMs(
          ref,
          "month",
          boundsMin,
          boundsMax,
          "start"
        );
        expect(resultAuto).toBe(resultStart);
      });
    });
  });
});
