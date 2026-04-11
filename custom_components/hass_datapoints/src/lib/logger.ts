/* eslint-disable no-console */
/**
 * Centralised logger for hass-datapoints.
 *
 * - `logger.warn(...)` and `logger.error(...)` always emit to the console.
 * - `logger.log(...)`, `logger.debug(...)`, and `logger.info(...)` are silenced
 *   unless the global dev flag `window.__HASS_DATAPOINTS_DEV__` is truthy.
 *
 * To enable verbose output open the browser console and run:
 *   window.__HASS_DATAPOINTS_DEV__ = true
 */

const isDev = (): boolean =>
  typeof window !== "undefined" &&
  !!(window as Window & { __HASS_DATAPOINTS_DEV__?: boolean })
    .__HASS_DATAPOINTS_DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev()) {
      console.log(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev()) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev()) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
