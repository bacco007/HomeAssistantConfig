import { beforeAll, describe, expect, it, vi } from "vitest";

describe("register", () => {
  beforeAll(async () => {
    document.body.innerHTML = "";
    (window as unknown as { customCards?: unknown[] }).customCards = [];

    vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    await import("../register");
  }, 30_000);

  describe("GIVEN register.ts is loaded", () => {
    describe("WHEN Lovelace custom card metadata is registered", () => {
      it("THEN names use Datapoints prefix (not Hass Records/Hass Datapoints)", async () => {
        expect.assertions(3);

        const cards = window.customCards || [];
        const names = cards.map((c) => c.name).filter(Boolean) as string[];

        expect(names.length).toBeGreaterThan(0);
        expect(names.every((name) => name.startsWith("Datapoints – "))).toBe(
          true
        );
        expect(
          names.some(
            (name) => name.includes("Hass Records") || name.includes("Hass ")
          )
        ).toBe(false);
      });
    });

    describe("WHEN old hass-records tags are referenced", () => {
      it("THEN deprecated aliases exist for old dashboards", async () => {
        expect.assertions(8);

        expect(customElements.get("hass-records-action-card")).toBeTruthy();
        expect(customElements.get("hass-records-quick-card")).toBeTruthy();
        expect(customElements.get("hass-records-history-card")).toBeTruthy();
        expect(customElements.get("hass-records-sensor-card")).toBeTruthy();
        expect(customElements.get("hass-records-list-card")).toBeTruthy();
        expect(customElements.get("hass-records-dev-tool-card")).toBeTruthy();

        expect(customElements.get("hass-records-statistics-card")).toBeTruthy();
        expect(
          customElements.get("hass-datapoints-statistics-card")
        ).toBeTruthy();
      });
    });
  });
});
