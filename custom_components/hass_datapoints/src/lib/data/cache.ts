/**
 * Shared cache utilities for history/statistics/event lookups.
 */

export const DATA_RANGE_CACHE_TTL_MS = 10 * 60 * 1000;
export const DATA_RANGE_CACHE_LIVE_EDGE_MS = 5 * 60 * 1000;

type CacheKey = string;

interface CachedRangeEntry<T> {
  promise: Promise<T>;
  expiresAt: number;
}

const dataRangeCache = new Map<CacheKey, CachedRangeEntry<unknown>>();

export function normalizeCacheIdList(values: unknown): string[] {
  return [
    ...new Set(
      (Array.isArray(values) ? values : []).filter(Boolean) as string[]
    ),
  ].sort();
}

export function shouldUseStableRangeCache(
  endTime: string | number | Nullable<Date> | undefined
): boolean {
  const endMs = new Date(endTime || 0).getTime();
  if (!Number.isFinite(endMs)) {
    return false;
  }

  return endMs < Date.now() - DATA_RANGE_CACHE_LIVE_EDGE_MS;
}

export function getCachedRangePromise<T>(key: CacheKey): Nullable<Promise<T>> {
  const entry = dataRangeCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    dataRangeCache.delete(key);
    return null;
  }

  return entry.promise as Promise<T>;
}

export function setCachedRangePromise<T>(
  key: CacheKey,
  promise: Promise<T>
): Promise<T> {
  dataRangeCache.set(key, {
    promise,
    expiresAt: Date.now() + DATA_RANGE_CACHE_TTL_MS,
  });
  return promise;
}

export function withStableRangeCache<T>(
  key: CacheKey,
  endTime: string | number | Nullable<Date> | undefined,
  loader: () => Promise<T> | T
): Promise<T> {
  if (!shouldUseStableRangeCache(endTime)) {
    return Promise.resolve().then(loader);
  }

  const cached = getCachedRangePromise<T>(key);
  if (cached) {
    return cached;
  }

  const promise = Promise.resolve()
    .then(loader)
    .catch((err) => {
      dataRangeCache.delete(key);
      throw err;
    });

  return setCachedRangePromise(key, promise);
}

export function clearStableRangeCacheMatching(
  predicate: ((key: CacheKey) => boolean) | unknown
): number {
  if (typeof predicate !== "function") {
    return 0;
  }

  let deletedCount = 0;
  [...dataRangeCache.keys()].forEach((key) => {
    if (predicate(key) === true) {
      dataRangeCache.delete(key);
      deletedCount += 1;
    }
  });
  return deletedCount;
}
