import { PANEL_URL_PATH } from "@/constants";
import { serializeHistoryPageStateParam } from "@/lib/history-page/history-url-state";

interface HistoryTargetSelection {
  entity_id?: string[];
  device_id?: string[];
  area_id?: string[];
  label_id?: string[];
}

interface HistoryNavigationOptions {
  datapoint_scope?: string;
  start_time?: string | Nullable<number | Date>;
  end_time?: string | Nullable<number | Date>;
  zoom_start_time?: string | Nullable<number | Date>;
  zoom_end_time?: string | Nullable<number | Date>;
  page_state?: Nullable<RecordWithUnknownValues>;
}

export function navigateToHistory(_card: unknown, entityIds: unknown): void {
  const uniq = [
    ...new Set(
      (Array.isArray(entityIds) ? entityIds : []).filter(Boolean) as string[]
    ),
  ];
  const params = new URLSearchParams();
  if (uniq.length) {
    params.set("entity_id", uniq.join(","));
  }
  const path = `/history?${params.toString()}`;

  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("location-changed"));
    return;
  }

  // Fallback for environments without HA router handling.
  window.location.assign(path);
}

export function buildDataPointsHistoryPath(
  target: HistoryTargetSelection = {},
  options: HistoryNavigationOptions = {}
): string {
  const normalizedTarget = {
    entity_id: [...new Set((target.entity_id || []).filter(Boolean))],
    device_id: [...new Set((target.device_id || []).filter(Boolean))],
    area_id: [...new Set((target.area_id || []).filter(Boolean))],
    label_id: [...new Set((target.label_id || []).filter(Boolean))],
  };
  const params = new URLSearchParams();
  if (normalizedTarget.entity_id.length) {
    params.set("entity_id", normalizedTarget.entity_id.join(","));
  }
  if (normalizedTarget.device_id.length) {
    params.set("device_id", normalizedTarget.device_id.join(","));
  }
  if (normalizedTarget.area_id.length) {
    params.set("area_id", normalizedTarget.area_id.join(","));
  }
  if (normalizedTarget.label_id.length) {
    params.set("label_id", normalizedTarget.label_id.join(","));
  }
  if (options.datapoint_scope === "all") {
    params.set("datapoints_scope", "all");
  }

  const start = options.start_time ? new Date(options.start_time) : null;
  const end = options.end_time ? new Date(options.end_time) : null;
  if (
    start &&
    end &&
    Number.isFinite(start.getTime()) &&
    Number.isFinite(end.getTime()) &&
    start < end
  ) {
    params.set("start_time", start.toISOString());
    params.set("end_time", end.toISOString());
    params.set(
      "hours_to_show",
      String(
        Math.max(1, Math.round((end.getTime() - start.getTime()) / 3600000))
      )
    );
  }

  const zoomStart = options.zoom_start_time
    ? new Date(options.zoom_start_time)
    : null;
  const zoomEnd = options.zoom_end_time
    ? new Date(options.zoom_end_time)
    : null;
  if (
    zoomStart &&
    zoomEnd &&
    Number.isFinite(zoomStart.getTime()) &&
    Number.isFinite(zoomEnd.getTime()) &&
    zoomStart < zoomEnd
  ) {
    params.set("zoom_start_time", zoomStart.toISOString());
    params.set("zoom_end_time", zoomEnd.toISOString());
  }

  const pageStateParam = serializeHistoryPageStateParam(options.page_state);
  if (pageStateParam) {
    params.set("page_state", pageStateParam);
  }

  return `/${PANEL_URL_PATH}?${params.toString()}`;
}

export function navigateToDataPointsHistory(
  _card: unknown,
  target: HistoryTargetSelection = {},
  options: HistoryNavigationOptions = {}
): void {
  const path = buildDataPointsHistoryPath(target, options);

  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("location-changed"));
    return;
  }

  window.location.assign(path);
}
