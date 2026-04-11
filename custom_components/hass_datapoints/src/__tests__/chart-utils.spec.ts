import { describe, expect, it } from "vitest";
import {
  clampChartValue,
  formatTooltipValue,
  formatTooltipDisplayValue,
} from "@/lib/chart/chart-shell";

// ─────────────────────────────────────────────────────────────────────────────
// clampChartValue
// ─────────────────────────────────────────────────────────────────────────────

describe("clampChartValue", () => {
  describe("GIVEN a value within [min, max]", () => {
    it("THEN returns the value unchanged", () => {
      expect.assertions(1);
      expect(clampChartValue(5, 0, 10)).toBe(5);
    });
  });

  describe("GIVEN a value below min", () => {
    it("THEN returns min", () => {
      expect.assertions(1);
      expect(clampChartValue(-3, 0, 10)).toBe(0);
    });
  });

  describe("GIVEN a value above max", () => {
    it("THEN returns max", () => {
      expect.assertions(1);
      expect(clampChartValue(15, 0, 10)).toBe(10);
    });
  });

  describe("GIVEN a value exactly equal to min", () => {
    it("THEN returns min", () => {
      expect.assertions(1);
      expect(clampChartValue(0, 0, 10)).toBe(0);
    });
  });

  describe("GIVEN a value exactly equal to max", () => {
    it("THEN returns max", () => {
      expect.assertions(1);
      expect(clampChartValue(10, 0, 10)).toBe(10);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTooltipValue
// ─────────────────────────────────────────────────────────────────────────────

describe("formatTooltipValue", () => {
  describe("GIVEN a null or empty value", () => {
    it("THEN returns empty string for null", () => {
      expect.assertions(1);
      expect(formatTooltipValue(null)).toBe("");
    });

    it("THEN returns empty string for empty string", () => {
      expect.assertions(1);
      expect(formatTooltipValue("")).toBe("");
    });

    it("THEN returns empty string for NaN", () => {
      expect.assertions(1);
      expect(formatTooltipValue(NaN)).toBe("");
    });
  });

  describe("GIVEN an integer value", () => {
    it("THEN formats it without unnecessary decimals", () => {
      expect.assertions(1);
      expect(formatTooltipValue(42)).toBe("42");
    });
  });

  describe("GIVEN a float value", () => {
    it("THEN formats to 2 decimal places", () => {
      expect.assertions(1);
      expect(formatTooltipValue(3.141)).toBe("3.14");
    });
  });

  describe("GIVEN a value with a unit", () => {
    it("THEN appends the unit with a space", () => {
      expect.assertions(1);
      expect(formatTooltipValue(21.5, "°C")).toBe("21.50 °C");
    });
  });

  describe("GIVEN 0 as a value", () => {
    it("THEN returns '0' (not empty)", () => {
      expect.assertions(1);
      expect(formatTooltipValue(0)).toBe("0");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTooltipDisplayValue
// ─────────────────────────────────────────────────────────────────────────────

describe("formatTooltipDisplayValue", () => {
  describe("GIVEN null or empty value", () => {
    it("THEN returns 'No value' for null", () => {
      expect.assertions(1);
      expect(formatTooltipDisplayValue(null)).toBe("No value");
    });

    it("THEN returns 'No value' for empty string", () => {
      expect.assertions(1);
      expect(formatTooltipDisplayValue("")).toBe("No value");
    });
  });

  describe("GIVEN a numeric value", () => {
    it("THEN delegates to formatTooltipValue", () => {
      expect.assertions(1);
      expect(formatTooltipDisplayValue(21)).toBe("21");
    });

    it("THEN includes the unit when provided", () => {
      expect.assertions(1);
      expect(formatTooltipDisplayValue(21.5, "°C")).toBe("21.50 °C");
    });
  });

  describe("GIVEN a string value", () => {
    it("THEN returns it as-is when no unit", () => {
      expect.assertions(1);
      expect(formatTooltipDisplayValue("on")).toBe("on");
    });

    it("THEN appends unit when provided", () => {
      expect.assertions(1);
      expect(formatTooltipDisplayValue("on", "state")).toBe("on state");
    });
  });
});
