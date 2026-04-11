import { fetchEventBounds, fetchEvents } from "@/lib/data/events-api";
import { fetchUserData } from "@/lib/data/preferences-api";
import type { HistoryFetchContext, HistoryFetchState } from "./types";
import type { HassLike } from "@/lib/types";

export function createHistoryPageFetchContext(
  getHass: () => Nullable<HassLike>
): HistoryFetchContext {
  const state: HistoryFetchState = {
    historyBoundsLoaded: false,
    historyBoundsLoading: false,
    preferencesLoaded: false,
    preferencesLoading: false,
    savedPageLoaded: false,
    hasSavedPage: false,
    timelineEventsLoading: false,
    timelineEventsKey: "",
  };

  let historyBoundsPromise: Nullable<Promise<void>> = null;
  let preferencesPromise: Nullable<Promise<void>> = null;
  let savedPagePromise: Nullable<Promise<void>> = null;
  let timelineEventsPromise: Nullable<Promise<void>> = null;

  return {
    state,

    async ensureHistoryBounds(options): Promise<void> {
      const hass = getHass();
      if (!hass || state.historyBoundsLoaded || historyBoundsPromise) {
        return historyBoundsPromise ?? Promise.resolve();
      }

      state.historyBoundsLoading = true;
      historyBoundsPromise = fetchEventBounds(hass)
        .then(({ start, end }) => {
          options.onSuccess({ start, end });
          state.historyBoundsLoaded = true;
        })
        .catch((error) => {
          state.historyBoundsLoaded = true;
          options.onError?.(error);
        })
        .finally(() => {
          state.historyBoundsLoading = false;
          historyBoundsPromise = null;
        });

      return historyBoundsPromise;
    },

    async ensureUserPreferences<T>(options: {
      preferencesKey: string;
      fallbackValue: T;
      onSuccess(preferences: T): void;
      onError?(error: unknown): void;
    }): Promise<void> {
      const hass = getHass();
      if (!hass || state.preferencesLoaded || preferencesPromise) {
        return preferencesPromise ?? Promise.resolve();
      }

      state.preferencesLoading = true;
      preferencesPromise = fetchUserData(
        hass,
        options.preferencesKey,
        options.fallbackValue
      )
        .then((preferences) => {
          options.onSuccess(preferences as T);
          state.preferencesLoaded = true;
        })
        .catch((error) => {
          state.preferencesLoaded = true;
          options.onError?.(error);
        })
        .finally(() => {
          state.preferencesLoading = false;
          preferencesPromise = null;
        });

      return preferencesPromise;
    },

    async loadSavedPageIndicator<T>(options: {
      savedPageKey: string;
      fallbackValue: T;
      onSuccess(saved: Nullable<T>): void;
      onError?(error: unknown): void;
    }): Promise<void> {
      const hass = getHass();
      if (!hass || state.savedPageLoaded || savedPagePromise) {
        return savedPagePromise ?? Promise.resolve();
      }

      state.savedPageLoaded = true;
      savedPagePromise = fetchUserData(
        hass,
        options.savedPageKey,
        options.fallbackValue
      )
        .then((saved) => {
          state.hasSavedPage = !!saved;
          options.onSuccess((saved as Nullable<T>) ?? null);
        })
        .catch((error) => {
          options.onError?.(error);
        })
        .finally(() => {
          savedPagePromise = null;
        });

      return savedPagePromise;
    },

    resetTimelineEvents(): void {
      state.timelineEventsKey = "";
    },

    async loadTimelineEvents(options): Promise<void> {
      const hass = getHass();
      const key = `${options.startIso}|${options.endIso}|${options.datapointScope}|${options.entityIds.join(",")}`;
      if (!hass || state.timelineEventsKey === key || timelineEventsPromise) {
        return timelineEventsPromise ?? Promise.resolve();
      }
      if (
        options.datapointScope === "linked" &&
        options.entityIds.length === 0
      ) {
        state.timelineEventsKey = key;
        options.onSuccess([], key);
        return Promise.resolve();
      }

      state.timelineEventsLoading = true;
      timelineEventsPromise = fetchEvents(
        hass,
        options.startIso,
        options.endIso,
        options.datapointScope === "linked" ? options.entityIds : undefined
      )
        .then((events) => {
          const normalized = Array.isArray(events) ? events : [];
          state.timelineEventsKey = key;
          options.onSuccess(normalized, key);
        })
        .catch((error) => {
          options.onError?.(error);
        })
        .finally(() => {
          state.timelineEventsLoading = false;
          timelineEventsPromise = null;
        });

      return timelineEventsPromise;
    },
  };
}
