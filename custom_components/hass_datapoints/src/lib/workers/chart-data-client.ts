import ChartDataWorker from "@/lib/workers/chart-data.worker.ts?worker&inline";
import {
  type ChartAggregate,
  type ChartPoint,
} from "@/lib/workers/chart-data.worker";

interface WorkerHandlers<T> {
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

interface ChartDataWorkerMessage<T> {
  id?: number;
  result?: T;
  error?: string;
}

// undefined = not yet attempted; null = unavailable (Worker not supported)
let workerInstance: Worker | null | undefined;
let requestId = 0;
const pending = new Map<number, WorkerHandlers<ChartPoint[]>>();

function getChartDataWorker(): Worker | null {
  if (workerInstance !== undefined) {
    return workerInstance;
  }
  try {
    workerInstance = new ChartDataWorker();
    workerInstance.addEventListener(
      "message",
      (event: MessageEvent<ChartDataWorkerMessage<ChartPoint[]>>) => {
        const { id, result, error } = event.data || {};
        const handlers = pending.get(id || -1);
        if (!handlers) {
          return;
        }
        pending.delete(id || -1);
        if (error) {
          handlers.reject(new Error(error));
        } else {
          handlers.resolve(result || []);
        }
      }
    );
    workerInstance.addEventListener("error", (err) => {
      pending.forEach(({ reject }) => {
        reject(err);
      });
      pending.clear();
      workerInstance = null;
    });
  } catch {
    workerInstance = null;
  }
  return workerInstance;
}

/**
 * Downsample [[timeMs, value], ...] pts in a worker.
 * Returns a Promise that resolves with the downsampled pts array.
 */
export function downsampleInWorker(
  pts: ChartPoint[],
  intervalMs: number,
  aggregate: ChartAggregate
): Promise<ChartPoint[]> {
  if (pts.length === 0) {
    return Promise.resolve([]);
  }
  const worker = getChartDataWorker();
  if (!worker) {
    // TODO this causes a performance issue in the UI, seems like it might cause
    // some kind of memory leak.
    // Additionally the tests are currently marked as todo and are awaiting the fix
    // Main-thread fallback when Worker is unavailable (e.g. in test environments).
    // return Promise.resolve(downsamplePts(pts, intervalMs, aggregate));
    return Promise.reject(new Error("Worker not available"));
  }
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    worker.postMessage({
      id,
      type: "downsample",
      payload: { pts, intervalMs, aggregate },
    });
  });
}
