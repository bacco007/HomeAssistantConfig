import {
  parseDateWindowsParam,
  parseHistoryPageStateParam,
  serializeDateWindowsParam,
  serializeHistoryPageStateParam,
  type NormalizedHistoryDateWindow,
} from "@/lib/history-page/history-url-state";
import {
  readHistoryPageSessionState,
  writeHistoryPageSessionState,
} from "@/lib/history-page/history-session-state";
import { parseSeriesColorsParam } from "@/lib/domain/history-series";
import type {
  HistoryNavigationContext,
  HistoryNavigationReadState,
} from "./types";

export function createHistoryPageNavigationContext(): HistoryNavigationContext {
  return {
    readStateFromLocation(): HistoryNavigationReadState {
      const url = new URL(window.location.href);
      const entityFromUrl = url.searchParams.get("entity_id");
      const deviceFromUrl = url.searchParams.get("device_id");
      const areaFromUrl = url.searchParams.get("area_id");
      const labelFromUrl = url.searchParams.get("label_id");
      const datapointsScopeFromUrl = url.searchParams.get("datapoints_scope");
      const startFromUrl = url.searchParams.get("start_time");
      const endFromUrl = url.searchParams.get("end_time");
      const zoomStartFromUrl = url.searchParams.get("zoom_start_time");
      const zoomEndFromUrl = url.searchParams.get("zoom_end_time");
      const seriesColorsFromUrl = parseSeriesColorsParam(
        url.searchParams.get("series_colors")
      );
      const dateWindowsFromUrl = parseDateWindowsParam(
        url.searchParams.get("date_windows")
      );
      const pageStateFromUrl = parseHistoryPageStateParam(
        url.searchParams.get("page_state")
      );
      const hoursToShowRaw = Number.parseInt(
        url.searchParams.get("hours_to_show") || "",
        10
      );
      const hasTargetInUrl = !!(
        entityFromUrl ||
        deviceFromUrl ||
        areaFromUrl ||
        labelFromUrl
      );
      const hasRangeInUrl = !!startFromUrl && !!endFromUrl;

      return {
        entityFromUrl,
        deviceFromUrl,
        areaFromUrl,
        labelFromUrl,
        datapointsScopeFromUrl,
        startFromUrl,
        endFromUrl,
        zoomStartFromUrl,
        zoomEndFromUrl,
        seriesColorsFromUrl,
        dateWindowsFromUrl:
          dateWindowsFromUrl as unknown as NormalizedHistoryDateWindow[],
        pageStateFromUrl,
        hoursFromUrl: Number.isFinite(hoursToShowRaw) ? hoursToShowRaw : NaN,
        hasTargetInUrl,
        hasRangeInUrl,
        sessionState: readHistoryPageSessionState(),
      };
    },

    readSessionState(): Nullable<RecordWithUnknownValues> {
      return readHistoryPageSessionState();
    },

    saveSessionState(source: unknown): void {
      writeHistoryPageSessionState(
        source as import("@/lib/history-page/history-session-state").HistoryPageSource
      );
    },

    updateUrl(options): void {
      const url = new URL(window.location.href);
      const target =
        options.entities.length > 0 ? { entity_id: [...options.entities] } : {};

      if (target.entity_id?.length) {
        url.searchParams.set("entity_id", target.entity_id.join(","));
      } else {
        url.searchParams.delete("entity_id");
      }
      url.searchParams.delete("device_id");
      url.searchParams.delete("area_id");
      url.searchParams.delete("label_id");

      if (options.datapointScope === "all") {
        url.searchParams.set("datapoints_scope", "all");
      } else if (options.datapointScope === "hidden") {
        url.searchParams.set("datapoints_scope", "hidden");
      } else {
        url.searchParams.delete("datapoints_scope");
      }

      if (options.startTime && options.endTime) {
        url.searchParams.set("start_time", options.startTime.toISOString());
        url.searchParams.set("end_time", options.endTime.toISOString());
        url.searchParams.set("hours_to_show", String(options.hours));
      } else {
        url.searchParams.delete("start_time");
        url.searchParams.delete("end_time");
        url.searchParams.delete("hours_to_show");
      }

      if (options.committedZoomRange) {
        url.searchParams.set(
          "zoom_start_time",
          new Date(options.committedZoomRange.start).toISOString()
        );
        url.searchParams.set(
          "zoom_end_time",
          new Date(options.committedZoomRange.end).toISOString()
        );
      } else {
        url.searchParams.delete("zoom_start_time");
        url.searchParams.delete("zoom_end_time");
      }

      const dateWindowsParam = serializeDateWindowsParam(
        options.comparisonWindows
      );
      if (dateWindowsParam) {
        url.searchParams.set("date_windows", dateWindowsParam);
      } else {
        url.searchParams.delete("date_windows");
      }

      const pageStateParam = serializeHistoryPageStateParam(options.pageState);
      if (pageStateParam) {
        url.searchParams.set("page_state", pageStateParam);
      } else {
        url.searchParams.delete("page_state");
      }

      const seriesColorEntries = options.seriesRows
        .map((row) => {
          const key = options.seriesColorQueryKey(row.entity_id);
          return key && /^#[0-9a-f]{6}$/i.test(row.color || "")
            ? `${encodeURIComponent(key)}:${row.color.toLowerCase()}`
            : null;
        })
        .filter(Boolean);

      if (seriesColorEntries.length) {
        url.searchParams.set("series_colors", seriesColorEntries.join(","));
      } else {
        url.searchParams.delete("series_colors");
      }

      const nextUrl = `${url.pathname}${url.search}`;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl === currentUrl) {
        return;
      }

      if (options.push) {
        window.history.pushState(null, "", nextUrl);
      } else {
        window.history.replaceState(null, "", nextUrl);
      }
    },
  };
}
