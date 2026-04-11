import { describe, expect, it } from "vitest";

import { templates } from "@/lib/i18n/locales/fi";

describe("fi.ts", () => {
  describe("GIVEN the Finnish locale templates", () => {
    describe("WHEN representative translations are read", () => {
      it("THEN they expose translated natural-language keys", () => {
        expect.assertions(3);

        expect(templates.Datapoints).toBe("Datapoints");
        expect(templates["Zoom level"]).toBe("Zoomaustaso");
        expect(templates["Computing…"]).toBe("Lasketaan…");
      });
    });
  });
});
