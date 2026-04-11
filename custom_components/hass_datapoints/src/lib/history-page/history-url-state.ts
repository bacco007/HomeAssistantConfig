import { slugifySeriesName } from "@/lib/domain/history-series";
import { parseDateValue } from "@/lib/domain/chart-zoom";

/**
 * URL/session-friendly helpers for saved comparison date windows.
 */

export interface HistoryDateWindowInput {
  id?: unknown;
  label?: unknown;
  name?: unknown;
  start_time?: unknown;
  start?: unknown;
  end_time?: unknown;
  end?: unknown;
}

export interface NormalizedHistoryDateWindow {
  id: string;
  label?: string;
  start_time: string;
  end_time: string;
  [key: string]: unknown;
}

export function makeDateWindowId(
  label: string,
  existingIds = new Set<string>()
): string {
  const base = slugifySeriesName(label) || "date-window";
  let candidate = base;
  let suffix = 2;

  while (existingIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function normalizeDateWindows(
  windows: Nullable<HistoryDateWindowInput[]> | undefined
): NormalizedHistoryDateWindow[] {
  if (!Array.isArray(windows)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: NormalizedHistoryDateWindow[] = [];

  windows.forEach((window, index) => {
    const label = String(window?.label || window?.name || "").trim();
    const start = parseDateValue(
      (window?.start_time || window?.start) as
        | string
        | number
        | Nullable<Date>
        | undefined
    );
    const end = parseDateValue(
      (window?.end_time || window?.end) as
        | string
        | number
        | Nullable<Date>
        | undefined
    );

    if (!label || !start || !end || start >= end) {
      return;
    }

    const id =
      String(window?.id || "").trim() ||
      makeDateWindowId(`${label}-${index + 1}`, seen);

    if (seen.has(id)) {
      return;
    }

    seen.add(id);
    normalized.push({
      id,
      label,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });
  });

  return normalized;
}

export function parseDateWindowsParam(
  value: unknown
): NormalizedHistoryDateWindow[] {
  if (!value || typeof value !== "string") {
    return [];
  }

  return normalizeDateWindows(
    value.split("|").map((entry) => {
      const [rawId, rawLabel, rawStart, rawEnd] = String(entry).split("~");
      return {
        id: decodeURIComponent(rawId || ""),
        label: decodeURIComponent(rawLabel || ""),
        start_time: decodeURIComponent(rawStart || ""),
        end_time: decodeURIComponent(rawEnd || ""),
      };
    })
  );
}

export function serializeDateWindowsParam(
  windows: Nullable<HistoryDateWindowInput[]> | undefined
): string {
  const normalized = normalizeDateWindows(windows);
  if (!normalized.length) {
    return "";
  }

  return normalized
    .map((window) =>
      [
        encodeURIComponent(window.id),
        encodeURIComponent(window.label ?? ""),
        encodeURIComponent(window.start_time),
        encodeURIComponent(window.end_time),
      ].join("~")
    )
    .join("|");
}

export function parseHistoryPageStateParam(
  value: unknown
): Nullable<RecordWithUnknownValues> {
  if (!value || typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as RecordWithUnknownValues)
      : null;
  } catch {
    return null;
  }
}

export function serializeHistoryPageStateParam(
  state: Nullable<RecordWithUnknownValues> | undefined
): string {
  if (!state || typeof state !== "object") {
    return "";
  }

  try {
    return JSON.stringify(state);
  } catch {
    return "";
  }
}
