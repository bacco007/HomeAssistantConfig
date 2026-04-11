import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { fetchHistoryDuringPeriod } from "@/lib/data/history-api";
import { fetchStatisticsDuringPeriod } from "@/lib/data/statistics-api";
import {
  fetchEvents,
  fetchEventBounds,
  deleteEvent,
  updateEvent,
} from "@/lib/data/events-api";
import { fetchUserData, saveUserData } from "@/lib/data/preferences-api";

// events-api and preferences-api use `logger` as an implicit global in catch blocks.
let warnSpy: ReturnType<typeof vi.fn>;
beforeAll(() => {
  warnSpy = vi.fn();
  vi.stubGlobal("logger", { warn: warnSpy });
});
afterAll(() => {
  vi.unstubAllGlobals();
});
beforeEach(() => {
  warnSpy?.mockClear();
});

function createHass(sendMessagePromise = vi.fn(), callService = vi.fn()) {
  return {
    connection: { sendMessagePromise },
    callService,
  };
}

describe("data api libs", () => {
  describe("GIVEN history request inputs", () => {
    describe("WHEN fetchHistoryDuringPeriod is called", () => {
      it("THEN it shapes a normalized websocket request", async () => {
        expect.assertions(2);
        const sendMessagePromise = vi.fn(async (payload) => payload);
        const hass = createHass(sendMessagePromise);

        const result = await fetchHistoryDuringPeriod(
          hass,
          "start",
          "end",
          ["sensor.b", "sensor.a"],
          {
            include_start_time_state: false,
            significant_changes_only: true,
            no_attributes: false,
          }
        );

        expect(sendMessagePromise).toHaveBeenCalledWith({
          type: "history/history_during_period",
          start_time: "start",
          end_time: "end",
          entity_ids: ["sensor.a", "sensor.b"],
          include_start_time_state: false,
          significant_changes_only: true,
          no_attributes: false,
        });
        expect(result.entity_ids).toEqual(["sensor.a", "sensor.b"]);
      });
    });
  });

  describe("GIVEN statistics request inputs", () => {
    describe("WHEN fetchStatisticsDuringPeriod is called", () => {
      it("THEN it normalizes ids and types", async () => {
        expect.assertions(2);
        const sendMessagePromise = vi.fn(async (payload) => payload);
        const hass = createHass(sendMessagePromise);

        const result = await fetchStatisticsDuringPeriod(
          hass,
          "start",
          "end",
          ["b", "a", "a"],
          {
            types: ["sum", "mean", "mean"],
            units: { a: "%" },
          }
        );

        expect(sendMessagePromise).toHaveBeenCalledWith({
          type: "recorder/statistics_during_period",
          start_time: "start",
          end_time: "end",
          statistic_ids: ["a", "b"],
          period: "hour",
          types: ["mean", "sum"],
          units: { a: "%" },
        });
        expect(result.statistic_ids).toEqual(["a", "b"]);
      });
    });
  });

  describe("GIVEN a successful event request", () => {
    describe("WHEN fetchEvents is called", () => {
      it("THEN it returns the events payload", async () => {
        expect.assertions(2);
        const sendMessagePromise = vi.fn(async () => ({
          events: [{ id: "evt-1" }],
        }));
        const hass = createHass(sendMessagePromise);

        const result = await fetchEvents(hass, "start", "end", [
          "sensor.b",
          "sensor.a",
        ]);

        expect(sendMessagePromise).toHaveBeenCalledWith({
          type: "hass_datapoints/events",
          start_time: "start",
          end_time: "end",
          entity_ids: ["sensor.a", "sensor.b"],
        });
        expect(result).toEqual([{ id: "evt-1" }]);
      });
    });
  });

  describe("GIVEN an event request failure", () => {
    describe("WHEN fetchEvents is called", () => {
      it("THEN it returns an empty array", async () => {
        expect.assertions(2);
        const sendMessagePromise = vi.fn(async () => {
          throw new Error("boom");
        });
        const hass = createHass(sendMessagePromise);

        const result = await fetchEvents(hass, "start", "end", []);

        expect(result).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN event bounds and mutation requests", () => {
    describe("WHEN the event helpers are called", () => {
      it("THEN they shape the expected websocket payloads", async () => {
        expect.assertions(3);
        const sendMessagePromise = vi.fn(async (payload) => {
          if (payload.type === "hass_datapoints/events_bounds") {
            return {
              start_time: "2026-01-01T00:00:00Z",
              end_time: "2026-02-01T00:00:00Z",
            };
          }
          return payload;
        });
        const hass = createHass(sendMessagePromise);

        await expect(fetchEventBounds(hass)).resolves.toEqual({
          start: "2026-01-01T00:00:00Z",
          end: "2026-02-01T00:00:00Z",
        });
        await deleteEvent(hass, "evt-1");
        await updateEvent(hass, "evt-1", { message: "Updated" });

        expect(sendMessagePromise).toHaveBeenNthCalledWith(2, {
          type: "hass_datapoints/events/delete",
          event_id: "evt-1",
        });
        expect(sendMessagePromise).toHaveBeenNthCalledWith(3, {
          type: "hass_datapoints/events/update",
          event_id: "evt-1",
          message: "Updated",
        });
      });
    });
  });

  describe("GIVEN frontend user-data requests", () => {
    describe("WHEN the preferences helpers are called", () => {
      it("THEN they read, write, and fall back correctly", async () => {
        expect.assertions(5);
        const sendMessagePromise = vi.fn(async (payload) => {
          if (payload.type === "frontend/get_user_data") {
            return { value: { theme: "dark" } };
          }
          return {};
        });
        const hass = createHass(sendMessagePromise);

        await expect(fetchUserData(hass, "key", null)).resolves.toEqual({
          theme: "dark",
        });
        await saveUserData(hass, "key", { theme: "light" });

        expect(sendMessagePromise).toHaveBeenNthCalledWith(1, {
          type: "frontend/get_user_data",
          key: "key",
        });
        expect(sendMessagePromise).toHaveBeenNthCalledWith(2, {
          type: "frontend/set_user_data",
          key: "key",
          value: { theme: "light" },
        });

        sendMessagePromise.mockImplementationOnce(async () => {
          throw new Error("nope");
        });
        await expect(fetchUserData(hass, "missing", "fallback")).resolves.toBe(
          "fallback"
        );
        expect(warnSpy).toHaveBeenCalled();
      });
    });
  });
});
