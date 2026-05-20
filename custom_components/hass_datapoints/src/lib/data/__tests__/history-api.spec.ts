import { describe, expect, it, vi } from "vitest";

import {
  fetchAnomaliesFromBackend,
  fetchDownsampledHistory,
  fetchDownsampledHistoryProgressive,
  fetchHistoryDuringPeriod,
} from "@/lib/data/history-api";

describe("history-api", () => {
  describe("GIVEN randomUUID is unavailable in the runtime", () => {
    describe("WHEN fetchAnomaliesFromBackend is called", () => {
      it("THEN it falls back to a generated request id instead of throwing", async () => {
        expect.assertions(2);

        const originalCrypto = globalThis.crypto;
        Object.defineProperty(globalThis, "crypto", {
          configurable: true,
          value: {
            getRandomValues: (array: Uint8Array) => {
              array.set([
                0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90, 0xa0,
                0xb0, 0xc0, 0xd0, 0xe0, 0xf0, 0x01,
              ]);
              return array;
            },
          },
        });

        try {
          const sendMessagePromise = vi.fn(async () => ({
            anomaly_clusters: [],
          }));
          const hass = {
            connection: { sendMessagePromise, sendMessage: vi.fn() },
          };

          await expect(
            fetchAnomaliesFromBackend(hass, "sensor.a", "start", "end", {
              anomaly_methods: ["iqr"],
            })
          ).resolves.toEqual([]);
          expect(sendMessagePromise).toHaveBeenCalledWith(
            expect.objectContaining({
              request_id: "10203040-5060-4080-90a0-b0c0d0e0f001",
            })
          );
        } finally {
          Object.defineProperty(globalThis, "crypto", {
            configurable: true,
            value: originalCrypto,
          });
        }
      });
    });
  });

  describe("GIVEN a downsample request", () => {
    describe("WHEN fetchDownsampledHistory is called", () => {
      it("THEN it sends the expected websocket payload", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi.fn(async () => ({ pts: [[1, 2]] }));
        const sendMessage = vi.fn();
        const hass = { connection: { sendMessagePromise, sendMessage } };

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
        expect(sendMessagePromise).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "hass_datapoints/history",
            entity_id: "sensor.a",
            start_time: "start",
            end_time: "end",
            interval: "1m",
            aggregate: "mean",
            request_id: expect.any(String),
          })
        );
      });

      it("THEN it batches requests that exceed the backend range limit", async () => {
        expect.assertions(4);

        const sendMessagePromise = vi
          .fn()
          .mockResolvedValueOnce({ pts: [[1, 2]] })
          .mockResolvedValueOnce({ pts: [[3, 4]] });
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

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
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

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
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

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

  describe("GIVEN a progressive downsample request", () => {
    describe("WHEN fetchDownsampledHistoryProgressive is called", () => {
      it("THEN fires chunks sequentially — second call only after first resolves", async () => {
        expect.assertions(3);

        let resolveFirst!: (v: unknown) => void;
        const firstPromise = new Promise((res) => {
          resolveFirst = res;
        });

        const sendMessagePromise = vi
          .fn()
          .mockReturnValueOnce(firstPromise)
          .mockResolvedValueOnce({ pts: [[3, 4]] });
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

        const onChunk = vi.fn();

        const donePromise = fetchDownsampledHistoryProgressive(
          hass,
          "sensor.a",
          "2026-01-01T00:00:00.000Z",
          "2026-04-05T00:00:00.000Z",
          "24h",
          "mean",
          onChunk
        );

        // First chunk not yet resolved → second call not made yet
        expect(sendMessagePromise).toHaveBeenCalledTimes(1);

        // Resolve first chunk
        resolveFirst({ pts: [[1, 2]] });
        await donePromise;

        expect(sendMessagePromise).toHaveBeenCalledTimes(2);
        expect(onChunk).toHaveBeenCalledTimes(2);
      });

      it("THEN calls onChunk with correct isLast flag", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi
          .fn()
          .mockResolvedValueOnce({ pts: [[1, 2]] })
          .mockResolvedValueOnce({ pts: [[3, 4]] });
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

        const chunks: Array<{ pts: unknown[]; isLast: boolean }> = [];
        await fetchDownsampledHistoryProgressive(
          hass,
          "sensor.a",
          "2026-01-01T00:00:00.000Z",
          "2026-04-05T00:00:00.000Z",
          "24h",
          "mean",
          (pts, isLast) => chunks.push({ pts, isLast })
        );

        expect(chunks[0].isLast).toBe(false);
        expect(chunks[1].isLast).toBe(true);
      });

      it("THEN calls onChunk with empty array and stops on rejection", async () => {
        expect.assertions(2);

        const sendMessagePromise = vi
          .fn()
          .mockRejectedValueOnce(new Error("network error"))
          .mockResolvedValueOnce({ pts: [[3, 4]] });
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

        const onChunk = vi.fn();
        await fetchDownsampledHistoryProgressive(
          hass,
          "sensor.a",
          "2026-01-01T00:00:00.000Z",
          "2026-04-05T00:00:00.000Z",
          "24h",
          "mean",
          onChunk
        );

        // Called once with empty pts and isLast=true (broke out after first failure)
        expect(onChunk).toHaveBeenCalledOnce();
        expect(onChunk).toHaveBeenCalledWith([], true);
      });

      it("THEN stops early when AbortSignal is aborted", async () => {
        expect.assertions(1);

        const sendMessagePromise = vi.fn().mockResolvedValue({ pts: [[1, 2]] });
        const hass = {
          connection: { sendMessagePromise, sendMessage: vi.fn() },
        };

        const controller = new AbortController();
        controller.abort();

        const onChunk = vi.fn();
        await fetchDownsampledHistoryProgressive(
          hass,
          "sensor.a",
          "2026-01-01T00:00:00.000Z",
          "2026-04-05T00:00:00.000Z",
          "24h",
          "mean",
          onChunk,
          controller.signal
        );

        expect(sendMessagePromise).not.toHaveBeenCalled();
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
