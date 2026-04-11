import { fetchUserData, saveUserData } from "@/lib/data/preferences-api";
import { downloadHistorySpreadsheet } from "@/lib/export-spreadsheet";
import type {
  HistoryPersistenceContext,
  HistoryPersistenceState,
} from "./types";
import type { HassLike } from "@/lib/types";

export function createHistoryPagePersistenceContext(
  getHass: () => Nullable<HassLike>
): HistoryPersistenceContext {
  const state: HistoryPersistenceState = {
    savingPreferences: false,
    savePageBusy: false,
    exportBusy: false,
  };

  return {
    state,

    async saveUserPreferences<T>(options: {
      preferencesKey: string;
      payload: T;
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }): Promise<void> {
      const hass = getHass();
      if (!hass || state.savingPreferences) {
        return;
      }

      state.savingPreferences = true;
      try {
        await saveUserData(
          hass,
          options.preferencesKey,
          options.payload as unknown
        );
        options.onSuccess?.();
      } catch (error) {
        options.onError?.(error);
      } finally {
        state.savingPreferences = false;
      }
    },

    async downloadSpreadsheet(options): Promise<void> {
      const hass = getHass();
      if (!hass || state.exportBusy) {
        return;
      }

      state.exportBusy = true;
      try {
        await downloadHistorySpreadsheet({
          hass,
          entityIds: options.entityIds,
          startTime: options.startTime,
          endTime: options.endTime,
          datapointScope: options.datapointScope,
        });
        options.onSuccess?.();
      } catch (error) {
        options.onError?.(error);
      } finally {
        state.exportBusy = false;
      }
    },

    async savePageState(options): Promise<void> {
      const hass = getHass();
      if (!hass || state.savePageBusy) {
        return;
      }

      state.savePageBusy = true;
      try {
        await saveUserData(hass, options.savedPageKey, options.state);
        options.onSuccess?.();
      } catch (error) {
        options.onError?.(error);
      } finally {
        state.savePageBusy = false;
      }
    },

    async restorePageState<T>(options: {
      savedPageKey: string;
      fallbackValue: T;
      onSuccess?(saved: T): void;
      onMissing?(): void;
      onError?(error: unknown): void;
    }): Promise<void> {
      const hass = getHass();
      if (!hass) {
        return;
      }

      try {
        const saved = await fetchUserData(
          hass,
          options.savedPageKey,
          options.fallbackValue
        );
        if (!saved || typeof saved !== "object") {
          options.onMissing?.();
          return;
        }

        options.onSuccess?.(saved as T);
      } catch (error) {
        options.onError?.(error);
      }
    },

    async clearSavedPageState(options): Promise<void> {
      const hass = getHass();
      if (!hass) {
        return;
      }

      try {
        await saveUserData(hass, options.savedPageKey, null);
        options.onSuccess?.();
      } catch (error) {
        options.onError?.(error);
      }
    },
  };
}
