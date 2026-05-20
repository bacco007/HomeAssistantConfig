import type { HassLike } from "@/lib/types";

/**
 * Tracks in-flight cancellable requests and provides helpers to cancel them.
 *
 * A "slot key" identifies a logical request slot (e.g. entity + time range).
 * Before sending a new request for the same slot, call cancelPending() to abort
 * any previous request still running on the backend.
 */

const inFlightRequests = new Map<string, string>();

export function trackRequest(slotKey: string, requestId: string): void {
  inFlightRequests.set(slotKey, requestId);
}

export async function cancelPending(
  hass: Pick<HassLike, "connection">,
  slotKey: string
): Promise<void> {
  const prevId = inFlightRequests.get(slotKey);
  if (prevId) {
    inFlightRequests.delete(slotKey);
    await hass.connection.sendMessagePromise({
      type: "hass_datapoints/cancel",
      request_id: prevId,
    });
  }
}

export function clearRequest(slotKey: string): void {
  inFlightRequests.delete(slotKey);
}
