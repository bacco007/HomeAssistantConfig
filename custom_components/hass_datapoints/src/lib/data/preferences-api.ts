/**
 * Preferences data access layer.
 */

import type { HassLike } from "@/lib/types";

/** HA user-data key for the saved history page. Stored via frontend/set_user_data. */
export const PANEL_HISTORY_SAVED_PAGE_KEY = "hass_datapoints:saved_page_v1";

declare const logger: {
  warn: (...args: unknown[]) => void;
};

interface UserDataResponse<TValue> {
  value?: TValue;
}

export async function fetchUserData<TValue = unknown>(
  hass: Pick<HassLike, "connection">,
  key: string,
  defaultValue: Nullable<TValue> = null
): Promise<Nullable<TValue>> {
  try {
    const result = (await hass.connection.sendMessagePromise({
      type: "frontend/get_user_data",
      key,
    })) as UserDataResponse<TValue>;
    return result?.value ?? defaultValue;
  } catch (err) {
    logger.warn("[hass-datapoints] fetchUserData failed:", err);
    return defaultValue;
  }
}

export async function saveUserData<TValue>(
  hass: Pick<HassLike, "connection">,
  key: string,
  value: TValue
): Promise<void> {
  try {
    await hass.connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key,
      value,
    });
  } catch (err) {
    logger.warn("[hass-datapoints] saveUserData failed:", err);
  }
}
