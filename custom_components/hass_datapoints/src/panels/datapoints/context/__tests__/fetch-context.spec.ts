import { describe, expect, it, vi, beforeEach } from "vitest";

import { createHistoryPageFetchContext } from "../fetch-context";
import type { HassLike } from "@/lib/types";

import { fetchEventBounds, fetchEvents } from "@/lib/data/events-api";
import { fetchUserData } from "@/lib/data/preferences-api";

vi.mock("@/lib/data/events-api", () => ({
  fetchEventBounds: vi.fn(),
  fetchEvents: vi.fn(),
}));

vi.mock("@/lib/data/preferences-api", () => ({
  fetchUserData: vi.fn(),
}));

describe("fetch-context", () => {
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

  describe("GIVEN history bounds are requested", () => {
    describe("WHEN the bounds load succeeds", () => {
      it("THEN it applies the result once and marks the bounds as loaded", async () => {
        expect.assertions(4);
        vi.mocked(fetchEventBounds).mockResolvedValue({
          start: "2026-01-01T00:00:00.000Z",
          end: "2026-01-02T00:00:00.000Z",
        });
        const context = createHistoryPageFetchContext(() => hass);
        const onSuccess = vi.fn();

        await context.ensureHistoryBounds({ onSuccess });
        await context.ensureHistoryBounds({ onSuccess });

        expect(fetchEventBounds).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith({
          start: "2026-01-01T00:00:00.000Z",
          end: "2026-01-02T00:00:00.000Z",
        });
        expect(context.state.historyBoundsLoaded).toBe(true);
        expect(context.state.historyBoundsLoading).toBe(false);
      });
    });
  });

  describe("GIVEN user preferences are requested", () => {
    describe("WHEN preferences load succeeds", () => {
      it("THEN it applies the preferences and marks them as loaded", async () => {
        expect.assertions(3);
        vi.mocked(fetchUserData).mockResolvedValue({ zoomLevel: "auto" });
        const context = createHistoryPageFetchContext(() => hass);
        const onSuccess = vi.fn();

        await context.ensureUserPreferences({
          preferencesKey: "prefs",
          fallbackValue: null,
          onSuccess,
        });

        expect(fetchUserData).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith({ zoomLevel: "auto" });
        expect(context.state.preferencesLoaded).toBe(true);
      });
    });
  });

  describe("GIVEN the saved page indicator is requested", () => {
    describe("WHEN saved page data exists", () => {
      it("THEN it marks hasSavedPage and applies the loaded value", async () => {
        expect.assertions(3);
        vi.mocked(fetchUserData).mockResolvedValue({ foo: "bar" });
        const context = createHistoryPageFetchContext(() => hass);
        const onSuccess = vi.fn();

        await context.loadSavedPageIndicator({
          savedPageKey: "saved",
          fallbackValue: null,
          onSuccess,
        });

        expect(onSuccess).toHaveBeenCalledWith({ foo: "bar" });
        expect(context.state.savedPageLoaded).toBe(true);
        expect(context.state.hasSavedPage).toBe(true);
      });
    });
  });

  describe("GIVEN timeline events are requested", () => {
    describe("WHEN the same request key is used twice", () => {
      it("THEN it fetches once and stores the timeline key", async () => {
        expect.assertions(4);
        vi.mocked(fetchEvents).mockResolvedValue([{ id: "evt-1" }]);
        const context = createHistoryPageFetchContext(() => hass);
        const onSuccess = vi.fn();

        await context.loadTimelineEvents({
          startIso: "2026-01-01T00:00:00.000Z",
          endIso: "2026-01-02T00:00:00.000Z",
          datapointScope: "linked",
          entityIds: ["sensor.one"],
          onSuccess,
        });
        await context.loadTimelineEvents({
          startIso: "2026-01-01T00:00:00.000Z",
          endIso: "2026-01-02T00:00:00.000Z",
          datapointScope: "linked",
          entityIds: ["sensor.one"],
          onSuccess,
        });

        expect(fetchEvents).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith(
          [{ id: "evt-1" }],
          "2026-01-01T00:00:00.000Z|2026-01-02T00:00:00.000Z|linked|sensor.one"
        );
        expect(context.state.timelineEventsKey).toBe(
          "2026-01-01T00:00:00.000Z|2026-01-02T00:00:00.000Z|linked|sensor.one"
        );
        expect(context.state.timelineEventsLoading).toBe(false);
      });
    });
  });

  describe("GIVEN timeline events are requested in linked scope with no entities", () => {
    describe("WHEN loadTimelineEvents is called", () => {
      it("THEN it returns an empty result without fetching events", async () => {
        expect.assertions(3);
        vi.mocked(fetchEvents).mockResolvedValue([{ id: "evt-1" }]);
        const context = createHistoryPageFetchContext(() => hass);
        const onSuccess = vi.fn();

        await context.loadTimelineEvents({
          startIso: "2026-01-01T00:00:00.000Z",
          endIso: "2026-01-02T00:00:00.000Z",
          datapointScope: "linked",
          entityIds: [],
          onSuccess,
        });

        expect(fetchEvents).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(
          [],
          "2026-01-01T00:00:00.000Z|2026-01-02T00:00:00.000Z|linked|"
        );
        expect(context.state.timelineEventsKey).toBe(
          "2026-01-01T00:00:00.000Z|2026-01-02T00:00:00.000Z|linked|"
        );
      });
    });
  });
});
