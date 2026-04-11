import { describe, expect, it } from "vitest";
import { DOMAIN, PANEL_URL_PATH, COLORS, AMBER } from "@/constants";

describe("constants", () => {
  describe("GIVEN the module exports", () => {
    describe("WHEN DOMAIN is accessed", () => {
      it("THEN it equals 'hass_datapoints'", () => {
        expect.assertions(1);
        expect(DOMAIN).toBe("hass_datapoints");
      });
    });

    describe("WHEN PANEL_URL_PATH is accessed", () => {
      it("THEN it equals 'hass-datapoints-history'", () => {
        expect.assertions(1);
        expect(PANEL_URL_PATH).toBe("hass-datapoints-history");
      });
    });

    describe("WHEN COLORS is accessed", () => {
      it("THEN it is a non-empty array", () => {
        expect.assertions(2);
        expect(Array.isArray(COLORS)).toBe(true);
        expect((COLORS as string[]).length).toBeGreaterThan(0);
      });

      it("THEN every entry is a 6-digit hex string", () => {
        expect.assertions(1);
        expect(
          (COLORS as string[]).every((c) => /^#[0-9a-fA-F]{6}$/.test(c))
        ).toBe(true);
      });
    });

    describe("WHEN AMBER is accessed", () => {
      it("THEN it is a 6-digit hex color string", () => {
        expect.assertions(2);
        expect(typeof AMBER).toBe("string");
        expect(AMBER as string).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});
