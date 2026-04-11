import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeHistoryAnalysisInWorker,
  terminateHistoryAnalysisWorker,
} from "@/lib/workers/history-analysis-client";

// ── Mock HistoryAnalysisWorker ────────────────────────────────────────────────
//
// Mocks the Vite worker import so no real Web Worker is created during tests.
// Each `new HistoryAnalysisWorker()` produces a fresh mock instance that
// exposes an `.emit(type, event)` helper so tests can simulate worker responses.

interface MockWorkerInstance {
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  addEventListener(type: string, handler: (event: unknown) => void): void;
  /** Test helper — fires registered listeners for the given event type. */
  emit(type: string, event: unknown): void;
}

let currentMockWorker: Nullable<MockWorkerInstance> = null;

function MockHistoryAnalysisWorker(this: unknown): MockWorkerInstance {
  const listeners: Record<string, Array<(event: unknown) => void>> = {};
  const instance: MockWorkerInstance = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener(type: string, handler: (event: unknown) => void) {
      (listeners[type] ??= []).push(handler);
    },
    emit(type: string, event: unknown) {
      listeners[type]?.forEach((h) => h(event));
    },
  };
  currentMockWorker = instance;
  return instance;
}

vi.mock("@/lib/workers/history-analysis.worker.ts?worker&inline", () => ({
  default: MockHistoryAnalysisWorker,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the request id sent in the nth postMessage call (0-based). */
function sentId(callIndex = 0): number {
  return currentMockWorker!.postMessage.mock.calls[callIndex][0].id;
}

/** Simulate a successful worker response for the given request id. */
function respondOk(id: number, result: unknown): void {
  currentMockWorker!.emit("message", { data: { id, result } });
}

/** Simulate an error response from the worker for the given request id. */
function respondError(id: number, errorMessage: string): void {
  currentMockWorker!.emit("message", { data: { id, error: errorMessage } });
}

// ── Test lifecycle ────────────────────────────────────────────────────────────

beforeEach(() => {
  terminateHistoryAnalysisWorker();
  currentMockWorker = null;
});

// ─────────────────────────────────────────────────────────────────────────────
// computeHistoryAnalysisInWorker
// ─────────────────────────────────────────────────────────────────────────────

describe("computeHistoryAnalysisInWorker", () => {
  describe("GIVEN a fresh worker with one pending request", () => {
    describe("WHEN the worker responds with a result", () => {
      it("THEN the promise resolves with that result", async () => {
        expect.assertions(1);
        const expected = {
          trendSeries: [],
          anomalySeries: [{ entityId: "sensor.a" }],
        };
        const promise = computeHistoryAnalysisInWorker({ series: [] });
        respondOk(sentId(), expected);
        await expect(promise).resolves.toEqual(expected);
      });
    });

    describe("WHEN the worker responds with an error field", () => {
      it("THEN the promise rejects with an Error wrapping that message", async () => {
        expect.assertions(1);
        const promise = computeHistoryAnalysisInWorker({});
        respondError(sentId(), "Something went wrong");
        await expect(promise).rejects.toThrow("Something went wrong");
      });
    });
  });

  describe("GIVEN a request in flight", () => {
    describe("WHEN the worker fires an 'error' event", () => {
      it("THEN the pending promise rejects with the error event object", async () => {
        expect.assertions(1);
        const crashError = new Error("Worker crashed");
        const promise = computeHistoryAnalysisInWorker({});
        currentMockWorker!.emit("error", crashError);
        await expect(promise).rejects.toBe(crashError);
      });
    });
  });

  describe("GIVEN the payload passed to the function", () => {
    describe("WHEN the request is sent", () => {
      it("THEN postMessage is called once with the payload and a numeric id", async () => {
        expect.assertions(3);
        const payload = { series: [{ entityId: "sensor.x" }] };
        const promise = computeHistoryAnalysisInWorker(payload);
        expect(currentMockWorker!.postMessage).toHaveBeenCalledOnce();
        const msg = currentMockWorker!.postMessage.mock.calls[0][0];
        expect(msg.payload).toEqual(payload);
        expect(typeof msg.id).toBe("number");
        // clean up
        respondOk(msg.id, {});
        await promise;
      });
    });
  });

  describe("GIVEN a message with an unknown request id", () => {
    describe("WHEN the message does not match any pending id", () => {
      it("THEN the message is ignored and the real response still resolves the promise", async () => {
        expect.assertions(1);
        const expected = { ok: true };
        const promise = computeHistoryAnalysisInWorker({});
        const id = sentId();
        // Emit a stray message with a different id — should be ignored
        respondOk(id + 9999, { wrong: true });
        // Emit the correct response
        respondOk(id, expected);
        await expect(promise).resolves.toEqual(expected);
      });
    });
  });

  describe("GIVEN two concurrent requests", () => {
    describe("WHEN responses arrive out of order", () => {
      it("THEN each promise resolves with its own result", async () => {
        expect.assertions(2);
        const result1 = { for: "first" };
        const result2 = { for: "second" };

        const promise1 = computeHistoryAnalysisInWorker({ req: 1 });
        const id1 = sentId(0);
        const promise2 = computeHistoryAnalysisInWorker({ req: 2 });
        const id2 = sentId(1);

        // Respond to the second request first
        respondOk(id2, result2);
        respondOk(id1, result1);

        await expect(promise1).resolves.toEqual(result1);
        await expect(promise2).resolves.toEqual(result2);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Worker singleton (getHistoryAnalysisWorker)
// ─────────────────────────────────────────────────────────────────────────────

describe("Worker singleton", () => {
  describe("GIVEN the first call to computeHistoryAnalysisInWorker", () => {
    describe("WHEN a second call follows without termination", () => {
      it("THEN both calls share the same worker instance", async () => {
        expect.assertions(1);
        const p1 = computeHistoryAnalysisInWorker({});
        const w1 = currentMockWorker;
        const p2 = computeHistoryAnalysisInWorker({});
        expect(currentMockWorker).toBe(w1);
        // clean up
        terminateHistoryAnalysisWorker();
        await Promise.allSettled([p1, p2]);
      });
    });
  });

  describe("GIVEN a worker error event that resets the instance", () => {
    describe("WHEN the next request is made", () => {
      it("THEN a brand-new worker is created", async () => {
        expect.assertions(2);
        const p1 = computeHistoryAnalysisInWorker({});
        const firstWorker = currentMockWorker;
        // Crash the worker
        firstWorker!.emit("error", new Error("crashed"));
        await expect(p1).rejects.toThrow("crashed");

        // Next call must create a fresh instance
        const p2 = computeHistoryAnalysisInWorker({});
        expect(currentMockWorker).not.toBe(firstWorker);
        // clean up
        respondOk(sentId(), {});
        await p2;
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// terminateHistoryAnalysisWorker
// ─────────────────────────────────────────────────────────────────────────────

describe("terminateHistoryAnalysisWorker", () => {
  describe("GIVEN no worker has ever been created", () => {
    describe("WHEN called", () => {
      it("THEN does not throw", () => {
        expect.assertions(1);
        expect(() => terminateHistoryAnalysisWorker()).not.toThrow();
      });
    });
  });

  describe("GIVEN an active worker with a pending request", () => {
    describe("WHEN terminateHistoryAnalysisWorker is called", () => {
      it("THEN the pending promise rejects with 'Aborted' message", async () => {
        expect.assertions(1);
        const promise = computeHistoryAnalysisInWorker({});
        terminateHistoryAnalysisWorker();
        await expect(promise).rejects.toThrow(
          "Aborted: superseded by newer analysis"
        );
      });

      it("THEN worker.terminate() is called exactly once", async () => {
        expect.assertions(2);
        const promise = computeHistoryAnalysisInWorker({});
        const worker = currentMockWorker;
        terminateHistoryAnalysisWorker();
        // Consume the rejection so it doesn't become an unhandled rejection
        await expect(promise).rejects.toThrow("Aborted");
        expect(worker!.terminate).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN a worker with no pending requests", () => {
    describe("WHEN terminateHistoryAnalysisWorker is called", () => {
      it("THEN worker.terminate() is still called", async () => {
        expect.assertions(1);
        // Create worker and fulfil the only pending request
        const promise = computeHistoryAnalysisInWorker({});
        const id = sentId();
        respondOk(id, {});
        await promise;

        const worker = currentMockWorker;
        terminateHistoryAnalysisWorker();
        expect(worker!.terminate).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN a terminated worker", () => {
    describe("WHEN a new request is made after termination", () => {
      it("THEN a fresh worker instance is created", async () => {
        expect.assertions(2);
        const stale = computeHistoryAnalysisInWorker({});
        const firstWorker = currentMockWorker;
        terminateHistoryAnalysisWorker();
        // Consume the stale rejection so it is not unhandled
        await stale.catch(() => {});

        const promise = computeHistoryAnalysisInWorker({});
        expect(currentMockWorker).not.toBe(firstWorker);
        expect(currentMockWorker).not.toBeNull();
        // clean up
        respondOk(sentId(), {});
        await promise;
      });
    });
  });

  describe("GIVEN multiple pending requests", () => {
    describe("WHEN terminateHistoryAnalysisWorker is called", () => {
      it("THEN all pending promises reject with the 'Aborted' message", async () => {
        expect.assertions(3);
        const p1 = computeHistoryAnalysisInWorker({ req: 1 });
        const p2 = computeHistoryAnalysisInWorker({ req: 2 });
        const p3 = computeHistoryAnalysisInWorker({ req: 3 });
        terminateHistoryAnalysisWorker();
        await Promise.all([
          expect(p1).rejects.toThrow("Aborted: superseded by newer analysis"),
          expect(p2).rejects.toThrow("Aborted: superseded by newer analysis"),
          expect(p3).rejects.toThrow("Aborted: superseded by newer analysis"),
        ]);
      });
    });
  });
});
