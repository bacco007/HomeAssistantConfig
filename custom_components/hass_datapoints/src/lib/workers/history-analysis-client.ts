import HistoryAnalysisWorker from "@/lib/workers/history-analysis.worker.ts?worker&inline";
import type {
  ComputeHistoryAnalysisPayload,
  HistoryAnalysisResult,
} from "@/lib/workers/history-analysis.worker";

interface WorkerHandlers<T> {
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

interface HistoryWorkerMessage<T> {
  id?: number;
  result?: T;
  error?: string;
}

let workerInstance: Nullable<Worker> = null;
let requestId = 0;
const pending = new Map<number, WorkerHandlers<HistoryAnalysisResult>>();

function getHistoryAnalysisWorker(): Worker {
  if (workerInstance) {
    return workerInstance;
  }
  workerInstance = new HistoryAnalysisWorker();
  workerInstance.addEventListener(
    "message",
    (event: MessageEvent<HistoryWorkerMessage<HistoryAnalysisResult>>) => {
      const { id, result, error } = event.data || {};
      const handlers = pending.get(id || -1);
      if (!handlers) {
        return;
      }
      pending.delete(id || -1);
      if (error) {
        handlers.reject(new Error(error));
        return;
      }
      handlers.resolve(result as HistoryAnalysisResult);
    }
  );
  workerInstance.addEventListener("error", (error) => {
    pending.forEach((handlers) => {
      handlers.reject(error);
    });
    pending.clear();
    workerInstance = null;
  });
  return workerInstance;
}

/**
 * Abort all in-flight analysis requests and terminate the worker.
 * Called when a new draw request supersedes an in-progress one so the worker
 * is not left computing a result that will be thrown away.
 */
export function terminateHistoryAnalysisWorker(): void {
  if (pending.size > 0) {
    pending.forEach(({ reject }) => {
      reject(new Error("Aborted: superseded by newer analysis"));
    });
    pending.clear();
  }
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

export function computeHistoryAnalysisInWorker(
  payload: ComputeHistoryAnalysisPayload
): Promise<HistoryAnalysisResult> {
  const worker = getHistoryAnalysisWorker();
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, payload });
  });
}
