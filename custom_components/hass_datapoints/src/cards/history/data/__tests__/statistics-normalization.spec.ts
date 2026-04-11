import { describe, expect, it } from "vitest";

import {
  mergeNumericHistoryWithStatistics,
  normalizeStatisticsHistory,
} from "../statistics-normalization";

describe("data/statistics-normalization", () => {
  describe("GIVEN normalizeStatisticsHistory", () => {
    describe("WHEN numeric and string timestamps are provided", () => {
      it("THEN it normalizes them into sorted lu/s records", () => {
        expect.assertions(1);
        expect(
          normalizeStatisticsHistory("sensor.temp", {
            "sensor.temp": [
              { start: "1970-01-01T00:00:30.000Z", mean: 8 },
              { start: 10, mean: 4 },
            ],
          })
        ).toEqual([
          { lu: 10, s: "4" },
          { lu: 30, s: "8" },
        ]);
      });
    });
  });

  describe("GIVEN mergeNumericHistoryWithStatistics", () => {
    describe("WHEN statistics exist outside the raw history coverage", () => {
      it("THEN it keeps outside statistics points and prefers raw points inside the window", () => {
        expect.assertions(1);
        expect(
          mergeNumericHistoryWithStatistics(
            [
              { lu: 10, s: "1" },
              { lu: 20, s: "2" },
            ],
            [
              { lu: 5, s: "0.5" },
              { lu: 15, s: "1.5" },
              { lu: 25, s: "2.5" },
            ]
          )
        ).toEqual([
          { lu: 5, s: "0.5" },
          { lu: 10, s: "1" },
          { lu: 20, s: "2" },
          { lu: 25, s: "2.5" },
        ]);
      });
    });
  });
});
