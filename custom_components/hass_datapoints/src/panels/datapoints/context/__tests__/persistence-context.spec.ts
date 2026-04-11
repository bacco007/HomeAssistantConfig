import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHistoryPagePersistenceContext } from "../persistence-context";
import type { HassLike } from "@/lib/types";

import { fetchUserData, saveUserData } from "@/lib/data/preferences-api";
import { downloadHistorySpreadsheet } from "@/lib/export-spreadsheet";

vi.mock("@/lib/data/preferences-api", () => ({
  fetchUserData: vi.fn(),
  saveUserData: vi.fn(),
}));

vi.mock("@/lib/export-spreadsheet", () => ({
  downloadHistorySpreadsheet: vi.fn(),
}));

describe("persistence-context", () => {
  let hass: HassLike;

  beforeEach(() => {
    hass = {
      states: {},
      entities: {},
      devices: {},
      areas: {},
      connection: {
        subscribeEvents: vi.fn(),
        sendMessagePromise: vi.fn(),
      },
      callService: vi.fn(),
    } as unknown as HassLike;
    vi.clearAllMocks();
  });

  describe("GIVEN user preferences are saved", () => {
    describe("WHEN the save succeeds", () => {
      it("THEN it writes the payload and clears the busy state", async () => {
        expect.assertions(4);
        vi.mocked(saveUserData).mockResolvedValue(undefined);
        const context = createHistoryPagePersistenceContext(() => hass);
        const onSuccess = vi.fn();

        await context.saveUserPreferences({
          preferencesKey: "prefs",
          payload: { zoom_level: "day" },
          onSuccess,
        });

        expect(saveUserData).toHaveBeenCalledWith(hass, "prefs", {
          zoom_level: "day",
        });
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(context.state.savingPreferences).toBe(false);
        expect(context.state.savePageBusy).toBe(false);
      });
    });
  });

  describe("GIVEN a spreadsheet export is requested", () => {
    describe("WHEN the export succeeds", () => {
      it("THEN it exports once and clears the export busy flag", async () => {
        expect.assertions(3);
        vi.mocked(downloadHistorySpreadsheet).mockResolvedValue(undefined);
        const context = createHistoryPagePersistenceContext(() => hass);

        await context.downloadSpreadsheet({
          entityIds: ["sensor.one"],
          startTime: new Date("2026-01-01T00:00:00.000Z"),
          endTime: new Date("2026-01-02T00:00:00.000Z"),
          datapointScope: "linked",
        });

        expect(downloadHistorySpreadsheet).toHaveBeenCalledTimes(1);
        expect(
          vi.mocked(downloadHistorySpreadsheet).mock.calls[0]?.[0]
        ).toMatchObject({
          hass,
          entityIds: ["sensor.one"],
          datapointScope: "linked",
        });
        expect(context.state.exportBusy).toBe(false);
      });
    });
  });

  describe("GIVEN a saved page state is written", () => {
    describe("WHEN the save succeeds", () => {
      it("THEN it persists the page payload and clears the save flag", async () => {
        expect.assertions(3);
        vi.mocked(saveUserData).mockResolvedValue(undefined);
        const context = createHistoryPagePersistenceContext(() => hass);
        const onSuccess = vi.fn();

        await context.savePageState({
          savedPageKey: "saved-page",
          state: { entities: ["sensor.one"] },
          onSuccess,
        });

        expect(saveUserData).toHaveBeenCalledWith(hass, "saved-page", {
          entities: ["sensor.one"],
        });
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(context.state.savePageBusy).toBe(false);
      });
    });
  });

  describe("GIVEN a saved page state is restored", () => {
    describe("WHEN saved data exists", () => {
      it("THEN it passes the saved object to the restore callback", async () => {
        expect.assertions(2);
        vi.mocked(fetchUserData).mockResolvedValue({
          entities: ["sensor.one"],
        });
        const context = createHistoryPagePersistenceContext(() => hass);
        const onSuccess = vi.fn();

        await context.restorePageState({
          savedPageKey: "saved-page",
          fallbackValue: null,
          onSuccess,
        });

        expect(fetchUserData).toHaveBeenCalledWith(hass, "saved-page", null);
        expect(onSuccess).toHaveBeenCalledWith({ entities: ["sensor.one"] });
      });
    });
  });

  describe("GIVEN a saved page state is cleared", () => {
    describe("WHEN the clear succeeds", () => {
      it("THEN it writes a null saved page payload", async () => {
        expect.assertions(2);
        vi.mocked(saveUserData).mockResolvedValue(undefined);
        const context = createHistoryPagePersistenceContext(() => hass);
        const onSuccess = vi.fn();

        await context.clearSavedPageState({
          savedPageKey: "saved-page",
          onSuccess,
        });

        expect(saveUserData).toHaveBeenCalledWith(hass, "saved-page", null);
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });
});
