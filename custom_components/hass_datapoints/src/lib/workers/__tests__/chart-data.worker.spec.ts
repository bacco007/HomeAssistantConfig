import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type WorkerOnMessage = (event: { data: unknown }) => void;

interface MockWorkerGlobal {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: Nullable<WorkerOnMessage>;
}

describe("chart-data.worker", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("self", {
      postMessage: vi.fn(),
      onmessage: null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GIVEN a downsample message", () => {
    describe("WHEN the worker module handles the message", () => {
      it("THEN it aggregates the points and posts the result", async () => {
        expect.assertions(1);
        const workerSelf = globalThis.self as unknown as MockWorkerGlobal;

        await import("@/lib/workers/chart-data.worker");

        workerSelf.onmessage?.({
          data: {
            id: 1,
            type: "downsample",
            payload: {
              pts: [
                [0, 1],
                [100, 3],
                [1200, 10],
              ],
              intervalMs: 1000,
              aggregate: "mean",
            },
          },
        });

        expect(workerSelf.postMessage).toHaveBeenCalledWith({
          id: 1,
          result: [
            [0, 2],
            [1200, 10],
          ],
        });
      });
    });
  });

  describe("GIVEN an unknown worker message type", () => {
    describe("WHEN the worker handles the message", () => {
      it("THEN it posts an error payload", async () => {
        expect.assertions(1);
        const workerSelf = globalThis.self as unknown as MockWorkerGlobal;

        await import("@/lib/workers/chart-data.worker");

        workerSelf.onmessage?.({
          data: {
            id: 2,
            type: "unknown",
            payload: {},
          },
        });

        expect(workerSelf.postMessage).toHaveBeenCalledWith({
          id: 2,
          error: "Error: Unknown message type: unknown",
        });
      });
    });
  });
});
