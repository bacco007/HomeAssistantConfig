import { describe, expect, it } from "vitest";
import { buildBinaryStateSpans, filterEvents } from "../chart-data-prep";

describe("chart-data-prep", () => {
  describe("GIVEN buildBinaryStateSpans", () => {
    describe("WHEN state list is empty", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        expect(buildBinaryStateSpans([], 0, 10000)).toEqual([]);
      });
    });

    describe("WHEN state list has one entry", () => {
      it("THEN it creates a single span to t1", () => {
        expect.assertions(2);
        const spans = buildBinaryStateSpans([{ lu: 1, s: "on" }], 0, 5000);
        expect(spans).toHaveLength(1);
        expect(spans[0]).toEqual({ start: 1000, end: 5000, state: "on" });
      });
    });

    describe("WHEN state list has multiple entries", () => {
      it("THEN it creates spans between transitions clamped to [t0, t1]", () => {
        expect.assertions(3);
        const spans = buildBinaryStateSpans(
          [
            { lu: 0, s: "off" },
            { lu: 2, s: "on" },
            { lu: 4, s: "off" },
          ],
          500,
          5000
        );
        expect(spans).toHaveLength(3);
        expect(spans[0]).toEqual({ start: 500, end: 2000, state: "off" });
        expect(spans[1]).toEqual({ start: 2000, end: 4000, state: "on" });
      });
    });

    describe("WHEN state transitions are outside [t0, t1]", () => {
      it("THEN those spans are excluded", () => {
        expect.assertions(1);
        const spans = buildBinaryStateSpans(
          [
            { lu: 0, s: "off" },
            { lu: 1, s: "on" },
          ],
          2000,
          5000
        );
        // First span end (1000) < t0 (2000), so only the last span remains
        expect(spans).toHaveLength(1);
      });
    });
  });

  describe("GIVEN filterEvents", () => {
    const events = [
      {
        id: "e1",
        message: "Turned on lights",
        annotation: "",
        entity_ids: ["light.living"],
      },
      {
        id: "e2",
        message: "Temperature alert",
        annotation: "Hot",
        entity_ids: ["sensor.temp"],
      },
      {
        id: "e3",
        message: "Door opened",
        annotation: "",
        entity_ids: ["binary_sensor.door"],
      },
    ];

    describe("WHEN no hidden IDs and no filter", () => {
      it("THEN all events are returned", () => {
        expect.assertions(1);
        expect(filterEvents(events, new Set(), "")).toHaveLength(3);
      });
    });

    describe("WHEN some events are hidden", () => {
      it("THEN hidden events are excluded", () => {
        expect.assertions(1);
        expect(filterEvents(events, new Set(["e2"]), "")).toHaveLength(2);
      });
    });

    describe("WHEN a message filter is applied", () => {
      it("THEN only matching events are returned", () => {
        expect.assertions(2);
        const result = filterEvents(events, new Set(), "temperature");
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("e2");
      });
    });

    describe("WHEN filter matches annotation text", () => {
      it("THEN matching events are returned", () => {
        expect.assertions(1);
        const result = filterEvents(events, new Set(), "hot");
        expect(result).toHaveLength(1);
      });
    });

    describe("WHEN filter matches entity_id", () => {
      it("THEN matching events are returned", () => {
        expect.assertions(1);
        const result = filterEvents(events, new Set(), "light.living");
        expect(result).toHaveLength(1);
      });
    });

    describe("WHEN both hidden and filter are applied", () => {
      it("THEN hidden events are excluded before filtering", () => {
        expect.assertions(1);
        const result = filterEvents(events, new Set(["e2"]), "temperature");
        expect(result).toHaveLength(0);
      });
    });
  });
});
