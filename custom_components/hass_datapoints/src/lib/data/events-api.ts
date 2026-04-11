import { DOMAIN } from "@/constants";
import {
  clearStableRangeCacheMatching,
  normalizeCacheIdList,
  withStableRangeCache,
} from "@/lib/data/cache";
import type { HassLike } from "@/lib/types";

/**
 * Events data access layer.
 */

declare const logger: {
  warn: (...args: unknown[]) => void;
};

interface EventFetchResult<T> {
  events?: T[];
}

interface EventBoundsResult {
  start_time?: Nullable<string>;
  end_time?: Nullable<string>;
}

type EventMutationFields = RecordWithUnknownValues;

export async function fetchEvents<T = RecordWithUnknownValues>(
  hass: Pick<HassLike, "connection">,
  startTime: string,
  endTime: string,
  entityIds: unknown
): Promise<T[]> {
  try {
    const normalizedEntityIds = normalizeCacheIdList(entityIds);
    const cacheKey = JSON.stringify({
      type: `${DOMAIN}/events`,
      start_time: startTime,
      end_time: endTime,
      entity_ids: normalizedEntityIds,
    });
    return await withStableRangeCache(cacheKey, endTime, async () => {
      const msg: RecordWithUnknownValues = {
        type: `${DOMAIN}/events`,
        start_time: startTime,
        end_time: endTime,
      };
      if (normalizedEntityIds.length) {
        msg.entity_ids = normalizedEntityIds;
      }
      const result = (await hass.connection.sendMessagePromise(
        msg
      )) as EventFetchResult<T>;
      return result.events || [];
    });
  } catch (err) {
    logger.warn("[hass-datapoints] fetchEvents failed:", err);
    return [];
  }
}

export function invalidateEventsCache(): number {
  return clearStableRangeCacheMatching((key: unknown) => {
    if (typeof key !== "string") {
      return false;
    }
    return key.includes(`"type":"${DOMAIN}/events"`);
  });
}

export async function fetchEventBounds(
  hass: Pick<HassLike, "connection">
): Promise<{ start: Nullable<string>; end: Nullable<string> }> {
  try {
    const result = (await hass.connection.sendMessagePromise({
      type: `${DOMAIN}/events_bounds`,
    })) as EventBoundsResult;
    return {
      start: result?.start_time || null,
      end: result?.end_time || null,
    };
  } catch (err) {
    logger.warn("[hass-datapoints] fetchEventBounds failed:", err);
    return { start: null, end: null };
  }
}

export async function deleteEvent(
  hass: Pick<HassLike, "connection">,
  eventId: string
): Promise<unknown> {
  const result = await hass.connection.sendMessagePromise({
    type: `${DOMAIN}/events/delete`,
    event_id: eventId,
  });
  invalidateEventsCache();
  window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
  return result;
}

export async function updateEvent(
  hass: Pick<HassLike, "connection">,
  eventId: string,
  fields: EventMutationFields
): Promise<unknown> {
  const result = await hass.connection.sendMessagePromise({
    type: `${DOMAIN}/events/update`,
    event_id: eventId,
    ...fields,
  });
  invalidateEventsCache();
  window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
  return result;
}
