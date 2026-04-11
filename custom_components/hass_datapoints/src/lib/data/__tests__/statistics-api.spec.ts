import { describe, expect, it, vi } from "vitest";

import { fetchStatisticsDuringPeriod } from "@/lib/data/statistics-api";

describe("statistics-api", () => {
  describe("GIVEN statistics request inputs", () => {
    describe("WHEN fetchStatisticsDuringPeriod is called", () => {
      it("THEN it normalizes ids, types, and units", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async (payload) => payload);
        const hass = { connection: { sendMessagePromise } };

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
});
