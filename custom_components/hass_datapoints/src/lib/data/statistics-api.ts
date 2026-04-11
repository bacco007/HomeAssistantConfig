import { normalizeCacheIdList, withStableRangeCache } from "@/lib/data/cache";
import type { HassLike } from "@/lib/types";

/**
 * Statistics data access layer.
 */

export interface StatisticsPeriodOptions {
  types?: unknown;
  period?: string;
  units?: RecordWithStringValues;
}

export async function fetchStatisticsDuringPeriod<TResponse = unknown>(
  hass: Pick<HassLike, "connection">,
  startTime: string,
  endTime: string,
  statisticIds: unknown,
  options: StatisticsPeriodOptions = {}
): Promise<TResponse> {
  const normalizedStatisticIds = normalizeCacheIdList(statisticIds);
  const normalizedTypes = normalizeCacheIdList(options.types);
  const cacheKey = JSON.stringify({
    type: "recorder/statistics_during_period",
    start_time: startTime,
    end_time: endTime,
    statistic_ids: normalizedStatisticIds,
    period: options.period || "hour",
    types: normalizedTypes,
  });

  return withStableRangeCache(
    cacheKey,
    endTime,
    () =>
      hass.connection.sendMessagePromise({
        type: "recorder/statistics_during_period",
        start_time: startTime,
        end_time: endTime,
        statistic_ids: normalizedStatisticIds,
        period: options.period || "hour",
        types: normalizedTypes,
        units: options.units || {},
      }) as Promise<TResponse>
  );
}
