import { describe, expect, it } from "vitest";
import {
  getLocale,
  msg,
  setFrontendLocale,
  syncFrontendLocale,
} from "../localize";
// Pre-warm the Finnish locale module so the first dynamic import in setLocale()
// hits the module cache rather than cold-loading 25 eagerly-glob'd files.
import "@/lib/i18n/locales/fi";

describe("localize", () => {
  describe("GIVEN a requested locale", () => {
    describe("WHEN it is supported exactly", () => {
      it("THEN switches to that locale", async () => {
        expect.assertions(2);
        const locale = await setFrontendLocale("fi");

        expect(locale).toBe("fi");
        expect(getLocale()).toBe("fi");
      });
    });

    describe("WHEN it is an extended locale code", () => {
      it("THEN normalizes to the supported base locale", async () => {
        expect.assertions(2);
        const locale = await setFrontendLocale("fi-FI");

        expect(locale).toBe("fi");
        expect(getLocale()).toBe("fi");
      });
    });

    describe("WHEN it is unsupported", () => {
      it("THEN falls back to English", async () => {
        expect.assertions(2);
        const locale = await setFrontendLocale("sv-SE");

        expect(locale).toBe("en");
        expect(getLocale()).toBe("en");
      });
    });
  });

  describe("GIVEN a hass object", () => {
    describe("WHEN syncing the frontend locale via hass.language", () => {
      it("THEN uses hass.language", async () => {
        expect.assertions(2);
        const locale = await syncFrontendLocale({ language: "fi" });

        expect(locale).toBe("fi");
        expect(getLocale()).toBe("fi");
      });
    });

    describe("WHEN syncing the frontend locale via hass.locale.language", () => {
      it("THEN prefers hass.locale.language over hass.language", async () => {
        expect.assertions(2);
        const locale = await syncFrontendLocale({
          language: "en",
          locale: { language: "fi" },
        });

        expect(locale).toBe("fi");
        expect(getLocale()).toBe("fi");
      });
    });
  });

  describe("GIVEN a localized source string", () => {
    describe("WHEN the active locale is Finnish", () => {
      it("THEN returns the translated string", async () => {
        expect.assertions(1);
        await setFrontendLocale("fi");
        expect(msg("Download spreadsheet")).toBe("Lataa taulukko");
      });
    });

    describe("WHEN the active locale is English", () => {
      it("THEN returns the source string", async () => {
        expect.assertions(1);
        await setFrontendLocale("en");
        expect(msg("Download spreadsheet")).toBe("Download spreadsheet");
      });
    });
  });
});
