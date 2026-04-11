import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

describe("chart-data-client", () => {
  describe("GIVEN a downsample request", () => {
    describe("WHEN the main-thread fallback is used", () => {
      it.todo(
        "THEN the promise resolves with the downsampled result",
        async () => {
          expect.assertions(1);
          const { downsampleInWorker } =
            await import("@/lib/workers/chart-data-client");

          await expect(
            downsampleInWorker(
              [
                [0, 1],
                [500, 3],
                [1000, 2],
              ],
              1000,
              "mean"
            )
          ).resolves.toEqual([
            [0, 2],
            [1000, 2],
          ]);
        }
      );
    });
  });

  describe("GIVEN a downsample request", () => {
    describe("WHEN the input is empty", () => {
      it.todo(
        "THEN the promise resolves with the original empty array",
        async () => {
          expect.assertions(1);
          const { downsampleInWorker } =
            await import("@/lib/workers/chart-data-client");

          await expect(downsampleInWorker([], 1000, "mean")).resolves.toEqual(
            []
          );
        }
      );
    });
  });
});
