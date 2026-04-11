import { describe, expect, it, vi } from "vitest";

import {
  fetchAnomaliesFromBackend,
  fetchDownsampledHistory,
  fetchHistoryDuringPeriod,
} from "@/lib/data/history-api";

describe("history-api", () => {
  describe("GIVEN a downsample request", () => {
    describe("WHEN fetchDownsampledHistory is called", () => {
      it("THEN it sends the expected websocket payload", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async () => ({ pts: [[1, 2]] }));
        const hass = { connection: { sendMessagePromise } };

        await expect(
          fetchDownsampledHistory(
            hass,
            "sensor.a",
            "start",
            "end",
            "1m",
            "mean"
          )
        ).resolves.toEqual([[1, 2]]);
        expect(sendMessagePromise).toHaveBeenCalledWith({
          type: "hass_datapoints/history",
          entity_id: "sensor.a",
          start_time: "start",
          end_time: "end",
          interval: "1m",
          aggregate: "mean",
        });
      });

      it("THEN it batches requests that exceed the backend range limit", async () => {
        expect.assertions(4);

        const sendMessagePromise = vi
          .fn()
          .mockResolvedValueOnce({ pts: [[1, 2]] })
          .mockResolvedValueOnce({ pts: [[3, 4]] });
        const hass = { connection: { sendMessagePromise } };

        await expect(
          fetchDownsampledHistory(
            hass,
            "sensor.a",
            "2026-01-01T00:00:00.000Z",
            "2026-04-05T00:00:00.000Z",
            "24h",
            "mean"
          )
        ).resolves.toEqual([
          [1, 2],
          [3, 4],
        ]);
        expect(sendMessagePromise).toHaveBeenCalledTimes(2);
        expect(sendMessagePromise).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            type: "hass_datapoints/history",
            entity_id: "sensor.a",
            start_time: "2026-01-01T00:00:00.000Z",
            end_time: "2026-04-01T00:00:00.000Z",
            interval: "24h",
            aggregate: "mean",
          })
        );
        expect(sendMessagePromise).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            type: "hass_datapoints/history",
            entity_id: "sensor.a",
            start_time: "2026-04-01T00:00:00.001Z",
            end_time: "2026-04-05T00:00:00.000Z",
            interval: "24h",
            aggregate: "mean",
          })
        );
      });
    });
  });

  describe("GIVEN an anomalies request", () => {
    describe("WHEN fetchAnomaliesFromBackend is called", () => {
      it("THEN it fills defaults and optional comparison values", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async () => ({
          anomaly_clusters: [{ id: "cluster-1" }],
        }));
        const hass = { connection: { sendMessagePromise } };

        await expect(
          fetchAnomaliesFromBackend(hass, "sensor.a", "start", "end", {
            anomaly_methods: ["iqr"],
            comparison_entity_id: "sensor.b",
            comparison_start_time: "cmp-start",
            comparison_end_time: "cmp-end",
          })
        ).resolves.toEqual([{ id: "cluster-1" }]);
        expect(sendMessagePromise).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "hass_datapoints/anomalies",
            entity_id: "sensor.a",
            anomaly_methods: ["iqr"],
            anomaly_sensitivity: "medium",
            comparison_entity_id: "sensor.b",
          })
        );
      });

      it("THEN it omits sample settings when anomaly_use_sampled_data is false", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async () => ({
          anomaly_clusters: [],
        }));
        const hass = { connection: { sendMessagePromise } };

        await expect(
          fetchAnomaliesFromBackend(hass, "sensor.a", "start", "end", {
            anomaly_methods: ["iqr"],
            anomaly_use_sampled_data: false,
            sample_interval: "24h",
            sample_aggregate: "mean",
          })
        ).resolves.toEqual([]);
        expect(sendMessagePromise).toHaveBeenCalledWith(
          expect.not.objectContaining({
            sample_interval: "24h",
            sample_aggregate: "mean",
          })
        );
      });
    });
  });

  describe("GIVEN a history request", () => {
    describe("WHEN fetchHistoryDuringPeriod is called", () => {
      it("THEN it normalizes ids and option defaults", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async (payload) => payload);
        const hass = { connection: { sendMessagePromise } };

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
});
