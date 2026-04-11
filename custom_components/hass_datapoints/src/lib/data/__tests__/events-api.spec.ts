import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  deleteEvent,
  fetchEventBounds,
  fetchEvents,
  invalidateEventsCache,
  updateEvent,
} from "@/lib/data/events-api";

let warnSpy: ReturnType<typeof vi.fn>;

beforeAll(() => {
  warnSpy = vi.fn();
  vi.stubGlobal("logger", { warn: warnSpy });
});

beforeEach(() => {
  warnSpy.mockClear();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("events-api", () => {
  describe("GIVEN an events fetch request", () => {
    describe("WHEN fetchEvents is called", () => {
      it("THEN it returns the normalized events payload", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async () => ({
          events: [{ id: "evt-1" }],
        }));
        const hass = { connection: { sendMessagePromise } };

        await expect(
          fetchEvents(hass, "start", "end", ["sensor.b", "sensor.a"])
        ).resolves.toEqual([{ id: "evt-1" }]);
        expect(sendMessagePromise).toHaveBeenCalledWith({
          type: "hass_datapoints/events",
          start_time: "start",
          end_time: "end",
          entity_ids: ["sensor.a", "sensor.b"],
        });
      });
    });
  });

  describe("GIVEN an events fetch failure", () => {
    describe("WHEN fetchEvents is called", () => {
      it("THEN it returns an empty array and warns", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async () => {
          throw new Error("boom");
        });
        const hass = { connection: { sendMessagePromise } };

        await expect(fetchEvents(hass, "start", "end", [])).resolves.toEqual(
          []
        );
        expect(warnSpy).toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN an event bounds request", () => {
    describe("WHEN fetchEventBounds is called", () => {
      it("THEN it returns the shaped bounds payload", async () => {
        expect.assertions(1);

        const hass = {
          connection: {
            sendMessagePromise: vi.fn(async () => ({
              start_time: "2026-01-01T00:00:00.000Z",
              end_time: "2026-02-01T00:00:00.000Z",
            })),
          },
        };

        await expect(fetchEventBounds(hass)).resolves.toEqual({
          start: "2026-01-01T00:00:00.000Z",
          end: "2026-02-01T00:00:00.000Z",
        });
      });
    });
  });

  describe("GIVEN event mutations", () => {
    describe("WHEN deleteEvent and updateEvent are called", () => {
      it("THEN they invalidate cache and emit the recorded event", async () => {
        expect.assertions(5);

        const sendMessagePromise = vi.fn(async (payload) => payload);
        const hass = { connection: { sendMessagePromise } };
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        await deleteEvent(hass, "evt-1");
        await updateEvent(hass, "evt-2", { message: "Updated" });

        expect(sendMessagePromise).toHaveBeenNthCalledWith(1, {
          type: "hass_datapoints/events/delete",
          event_id: "evt-1",
        });
        expect(sendMessagePromise).toHaveBeenNthCalledWith(2, {
          type: "hass_datapoints/events/update",
          event_id: "evt-2",
          message: "Updated",
        });
        expect(dispatchSpy).toHaveBeenCalledTimes(2);
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ type: "hass-datapoints-event-recorded" })
        );
        expect(typeof invalidateEventsCache).toBe("function");
      });
    });
  });
});
