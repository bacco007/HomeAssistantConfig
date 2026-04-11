import { describe, expect, it } from "vitest";

import {
  getHistoryStatesForEntity,
  normalizeBinaryHistory,
  normalizeNumericHistory,
} from "../history-normalization";

describe("data/history-normalization", () => {
  describe("GIVEN normalizeBinaryHistory", () => {
    describe("WHEN binary states are provided in unsorted order", () => {
      it("THEN it normalizes and sorts them by timestamp", () => {
        expect.assertions(1);
        expect(
          normalizeBinaryHistory("binary_sensor.door", [
            { lu: 20, s: "off" },
            { lu: 10, state: "on" },
          ])
        ).toEqual([
          { lu: 10, s: "on" },
          { lu: 20, s: "off" },
        ]);
      });
    });
  });

  describe("GIVEN normalizeNumericHistory", () => {
    describe("WHEN invalid numeric entries are mixed in", () => {
      it("THEN it filters them out and keeps the finite points", () => {
        expect.assertions(1);
        expect(
          normalizeNumericHistory("sensor.temp", [
            { lu: 10, s: "4.5" },
            { lu: 20, s: "bad" },
            { last_changed: "1970-01-01T00:00:30.000Z", s: "6" },
          ])
        ).toEqual([
          { lu: 10, s: "4.5" },
          { lu: 30, s: "6" },
        ]);
      });
    });
  });

  describe("GIVEN getHistoryStatesForEntity", () => {
    describe("WHEN the history result is keyed by entity id", () => {
      it("THEN it returns the matching array directly", () => {
        expect.assertions(1);
        const states = [{ s: "1" }];
        expect(
          getHistoryStatesForEntity({ "sensor.temp": states }, "sensor.temp")
        ).toBe(states);
      });
    });

    describe("WHEN the history result is an ordered array of arrays", () => {
      it("THEN it resolves the entity by index", () => {
        expect.assertions(1);
        expect(
          getHistoryStatesForEntity([[{ s: "1" }], [{ s: "2" }]], "sensor.b", [
            "sensor.a",
            "sensor.b",
          ])
        ).toEqual([{ s: "2" }]);
      });
    });

    describe("WHEN the history result is a wrapped entity array", () => {
      it("THEN it returns the matching wrapped result", () => {
        expect.assertions(1);
        expect(
          getHistoryStatesForEntity(
            {
              result: [
                { entity_id: "sensor.a", s: "1" },
                { entity_id: "sensor.b", s: "2" },
              ],
            },
            "sensor.b"
          )
        ).toEqual([{ entity_id: "sensor.b", s: "2" }]);
      });
    });
  });
});
