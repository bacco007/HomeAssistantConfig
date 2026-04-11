import { describe, expect, it } from "vitest";

import { contrastColor, hexToRgba } from "@/lib/util/color";

describe("color.js", () => {
  describe("GIVEN a hex color and alpha", () => {
    describe("WHEN hexToRgba is called", () => {
      it("THEN it converts the value into an rgba string", () => {
        expect.assertions(1);

        expect(hexToRgba("#83c705", 0.5)).toBe("rgba(131,199,5,0.5)");
      });
    });
  });

  describe("GIVEN a background color", () => {
    describe("WHEN contrastColor is called", () => {
      it("THEN it returns the highest-contrast text color", () => {
        expect.assertions(3);

        expect(contrastColor("#ffffff")).toBe("#000");
        expect(contrastColor("#000000")).toBe("#fff");
        expect(contrastColor("bad")).toBe("#fff");
      });
    });
  });
});
