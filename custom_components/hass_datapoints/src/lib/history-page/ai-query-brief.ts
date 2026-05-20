import { buildBackendAnomalyConfig } from "@/lib/chart/chart-anomaly-config";
import type { AnomalyCluster } from "@/lib/chart/chart-renderer";
import {
  type HistorySeriesRow,
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
} from "@/lib/domain/history-series";
import {
  type NormalizedTargetSelection,
  normalizeTargetSelection,
} from "@/lib/domain/target-selection";
import { type AnomalyMonitor, monitorEntityIds } from "@/lib/data/monitors-api";
import { entityName } from "@/lib/ha/entity-name";
import type { NormalizedHistoryDateWindow } from "@/lib/history-page/history-url-state";
import { interpolatePlaceholders, msg } from "@/lib/i18n/localize";
import type { HassLike } from "@/lib/types";

export interface AiQueryBriefMonitorContext {
  access: "loaded" | "not_admin" | "unavailable";
  monitors: AnomalyMonitor[];
  note: string;
}

export interface AiQueryBriefAnomalyClusterSnapshot {
  point_count: number;
  start_time: Nullable<string>;
  end_time: Nullable<string>;
  min_value: Nullable<number>;
  max_value: Nullable<number>;
  is_overlap: boolean;
  points: Array<{
    time: string;
    value: number;
  }>;
}

export interface AiQueryBriefAnomalyEntitySnapshot {
  entity_id: string;
  all_detected_clusters: AiQueryBriefAnomalyClusterSnapshot[];
  displayed_clusters: AiQueryBriefAnomalyClusterSnapshot[];
}

export interface AiQueryBriefCorrelatedSpanSnapshot {
  start_time: string;
  end_time: string;
  entity_ids: string[];
}

export interface AiQueryBriefAnomalySnapshot {
  available: boolean;
  current_range_label: string;
  chart_anomaly_overlap_mode: string;
  show_correlated_anomalies: boolean;
  correlated_anomaly_spans: AiQueryBriefCorrelatedSpanSnapshot[];
  entity_findings: AiQueryBriefAnomalyEntitySnapshot[];
}

export interface AiQueryBriefContext {
  hass: Nullable<HassLike>;
  entities: string[];
  targetSelectionRaw: Nullable<RecordWithUnknownValues>;
  seriesRows: Array<{
    entity_id: string;
    color: string;
    visible?: boolean;
    analysis?: unknown;
  }>;
  datapointScope: string;
  startTime: Nullable<Date>;
  endTime: Nullable<Date>;
  committedZoomRange: Nullable<{
    start: string | number | Date;
    end: string | number | Date;
  }>;
  comparisonWindows: NormalizedHistoryDateWindow[];
  selectedComparisonWindowId: Nullable<string>;
  chartAnomalyOverlapMode: string;
  monitorContext: AiQueryBriefMonitorContext;
  anomalySnapshot?: Nullable<AiQueryBriefAnomalySnapshot>;
}

export interface AiQueryBriefEntityMetadata {
  entityId: string;
  displayName: string;
  anomalyEnabled: boolean;
  backendConfig: RecordWithUnknownValues;
  comparisonWindowId: Nullable<string>;
}

export interface AiQueryBriefResult {
  plainText: string;
  metadata: {
    entityIds: string[];
    relevantMonitorIds: string[];
    selectedComparisonWindowId: Nullable<string>;
    normalizedTargetSelection: NormalizedTargetSelection;
    entitySummaries: AiQueryBriefEntityMetadata[];
    monitorAccess: AiQueryBriefMonitorContext["access"];
    anomalySnapshotAvailable: boolean;
  };
}

function toIso(value: Nullable<Date> | string | number): Nullable<string> {
  if (value == null) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function stringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function t(template: string, ...values: Array<string | number>): string {
  return interpolatePlaceholders(msg(template), values);
}

function buildTargetSelectionSummary(
  targetSelectionRaw: Nullable<RecordWithUnknownValues>
): { normalized: NormalizedTargetSelection; summary: string } {
  const normalized = normalizeTargetSelection(targetSelectionRaw || {});
  const parts: string[] = [];
  if (normalized.entity_id.length) {
    parts.push(t("entity_id={0}", normalized.entity_id.length));
  }
  if (normalized.device_id.length) {
    parts.push(t("device_id={0}", normalized.device_id.length));
  }
  if (normalized.area_id.length) {
    parts.push(t("area_id={0}", normalized.area_id.length));
  }
  if (normalized.label_id.length) {
    parts.push(t("label_id={0}", normalized.label_id.length));
  }
  return {
    normalized,
    summary: parts.length ? parts.join(", ") : msg("none"),
  };
}

function buildRangeRetentionNote(
  mainStartIso: Nullable<string>,
  mainEndIso: Nullable<string>
): string {
  const startMs = mainStartIso ? Date.parse(mainStartIso) : Number.NaN;
  const endMs = mainEndIso ? Date.parse(mainEndIso) : Number.NaN;
  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs <= startMs
  ) {
    return msg(
      "If raw recorder history is incomplete or unavailable, fetch Home Assistant statistics for continuity and call out the retention boundary explicitly."
    );
  }
  const spanDays = (endMs - startMs) / (24 * 60 * 60 * 1000);
  if (spanDays > 10) {
    return t(
      "The requested window spans about {0} days. Short-retention raw history may not fully cover this range, so use Home Assistant statistics for older or missing portions and do not infer 'no anomalies' from retention gaps.",
      Math.round(spanDays)
    );
  }
  return msg(
    "Use raw recorder history first for this range. If raw history is incomplete or unavailable, fetch Home Assistant statistics and explain any retention or recorder gaps."
  );
}

function buildEntityMetadataLines(
  hass: Nullable<HassLike>,
  entityId: string
): string[] {
  const hassWithLabels = hass as Nullable<
    HassLike & {
      labels?: Record<string, { name?: string }>;
    }
  >;
  const stateObj = hass?.states?.[entityId];
  const entityEntry = hass?.entities?.[entityId] as Nullable<{
    area_id?: Nullable<string>;
    device_id?: Nullable<string>;
    labels?: string[];
    platform?: Nullable<string>;
    hidden?: boolean;
    hidden_by?: Nullable<string>;
    enabled?: boolean;
    disabled_by?: Nullable<string>;
  }>;
  const deviceId = entityEntry?.device_id ?? null;
  const inheritedAreaId =
    entityEntry?.area_id ??
    (deviceId
      ? ((hass?.devices?.[deviceId] as Nullable<{ area_id?: Nullable<string> }>)
          ?.area_id ?? null)
      : null);
  const areaName =
    inheritedAreaId && hass?.areas?.[inheritedAreaId]
      ? ((hass.areas[inheritedAreaId] as { name?: string }).name ??
        inheritedAreaId)
      : inheritedAreaId;
  const deviceName =
    deviceId && hass?.devices?.[deviceId]
      ? ((hass.devices[deviceId] as { name?: string }).name ?? deviceId)
      : deviceId;
  const labelIds = [
    ...(Array.isArray(entityEntry?.labels) ? entityEntry.labels : []),
    ...(Array.isArray((entityEntry as { label_ids?: string[] })?.label_ids)
      ? ((entityEntry as { label_ids?: string[] }).label_ids ?? [])
      : []),
  ];
  const labelNames = labelIds.map((labelId) => {
    const labelEntry = hassWithLabels?.labels?.[labelId] as Nullable<{
      name?: string;
    }>;
    return labelEntry?.name || labelId;
  });

  return [
    msg("Entity metadata:"),
    stringifyJson({
      unit_of_measurement: stateObj?.attributes?.unit_of_measurement ?? null,
      device_class: stateObj?.attributes?.device_class ?? null,
      state_class: stateObj?.attributes?.state_class ?? null,
      current_state: stateObj?.state ?? null,
      area_id: inheritedAreaId,
      area_name: areaName ?? null,
      device_id: deviceId,
      device_name: deviceName ?? null,
      labels: labelNames,
      platform: entityEntry?.platform ?? null,
      hidden: entityEntry?.hidden === true || entityEntry?.hidden_by != null,
      enabled:
        entityEntry?.enabled != null
          ? entityEntry.enabled
          : entityEntry?.disabled_by == null,
    }),
  ];
}

function buildCurrentRangeAnomalyFindingsSection(
  context: AiQueryBriefContext,
  selectedEntityIds: string[]
): string[] {
  const snapshot = context.anomalySnapshot;
  const lines = ["CURRENT RANGE ANOMALY FINDINGS"];

  if (!snapshot?.available) {
    lines.push(
      msg(
        "Current anomaly findings are not available from the active chart state, so use the query inputs below to fetch and inspect anomaly clusters directly."
      )
    );
    return lines;
  }

  lines.push(
    `${msg("Snapshot range label:")} ${snapshot.current_range_label || msg("main range")}`
  );
  lines.push(
    `${msg("Correlated anomaly highlighting enabled in chart:")} ${snapshot.show_correlated_anomalies ? msg("yes") : msg("no")}`
  );
  lines.push(
    `${msg("Current anomaly overlap mode:")} ${snapshot.chart_anomaly_overlap_mode}`
  );
  lines.push(msg("Correlated anomaly periods across the selected datapoints:"));
  if (snapshot.correlated_anomaly_spans.length) {
    lines.push(stringifyJson(snapshot.correlated_anomaly_spans));
  } else {
    lines.push("[]");
  }

  const entityFindings = snapshot.entity_findings.filter((finding) =>
    selectedEntityIds.includes(finding.entity_id)
  );
  if (!entityFindings.length) {
    lines.push(
      msg(
        "No entity-level anomaly findings are currently available from the active chart snapshot."
      )
    );
    return lines;
  }

  entityFindings.forEach((finding) => {
    lines.push(`${msg("Entity findings:")} ${finding.entity_id}`);
    lines.push(
      `${msg("Detected clusters in current range:")} ${finding.all_detected_clusters.length}`
    );
    lines.push(
      `${msg("Displayed clusters under the current overlap/correlation mode:")} ${finding.displayed_clusters.length}`
    );
    lines.push(msg("All detected anomaly cluster details:"));
    lines.push(stringifyJson(finding.all_detected_clusters));
    lines.push(msg("Displayed anomaly cluster details:"));
    lines.push(stringifyJson(finding.displayed_clusters));
  });

  return lines;
}

function buildEntitySection(
  context: AiQueryBriefContext,
  row: HistorySeriesRow,
  selectedComparisonWindow: Nullable<NormalizedHistoryDateWindow>
): { lines: string[]; metadata: AiQueryBriefEntityMetadata } {
  const analysis = normalizeHistorySeriesAnalysis({
    ...(row.analysis || {}),
    anomaly_overlap_mode: context.chartAnomalyOverlapMode || "all",
  });
  const backendConfig = buildBackendAnomalyConfig(analysis as never) as
    | RecordWithUnknownValues
    | undefined;
  const displayName =
    entityName(context.hass, row.entity_id)?.trim() || row.entity_id;
  const mainStartIso = toIso(context.startTime);
  const mainEndIso = toIso(context.endTime);
  const anomalyEnabled =
    analysis.show_anomalies === true &&
    Array.isArray(backendConfig?.anomaly_methods) &&
    backendConfig.anomaly_methods.length > 0;

  const lines = [
    `${msg("Entity:")} ${row.entity_id}`,
    `${msg("Display name:")} ${displayName}`,
    `${msg("Visible in panel:")} ${row.visible !== false ? msg("yes") : msg("no")}`,
  ];

  lines.push(...buildEntityMetadataLines(context.hass, row.entity_id));

  if (!anomalyEnabled) {
    lines.push(
      msg("Anomaly analysis: disabled in the current panel configuration.")
    );
  } else {
    lines.push(msg("Anomaly analysis: enabled."));
    lines.push(msg("Backend anomaly query inputs:"));
    lines.push(
      stringifyJson({
        type: "hass_datapoints/anomalies",
        entity_id: row.entity_id,
        start_time: mainStartIso,
        end_time: mainEndIso,
        ...backendConfig,
      })
    );
  }

  lines.push(msg("Raw history query inputs:"));
  lines.push(
    stringifyJson({
      entity_id: row.entity_id,
      start_time: mainStartIso,
      end_time: mainEndIso,
      prefer_raw_history: true,
    })
  );

  if (
    analysis.anomaly_methods.includes("comparison_window") &&
    analysis.anomaly_comparison_window_id
  ) {
    lines.push(
      `${msg("Comparison window reference:")} ${analysis.anomaly_comparison_window_id}`
    );
    if (selectedComparisonWindow) {
      lines.push(msg("Comparison window raw history query inputs:"));
      lines.push(
        stringifyJson({
          entity_id: row.entity_id,
          start_time: selectedComparisonWindow.start_time,
          end_time: selectedComparisonWindow.end_time,
          prefer_raw_history: true,
        })
      );
      if (anomalyEnabled) {
        lines.push(msg("Comparison window anomaly query inputs:"));
        lines.push(
          stringifyJson({
            type: "hass_datapoints/anomalies",
            entity_id: row.entity_id,
            start_time: selectedComparisonWindow.start_time,
            end_time: selectedComparisonWindow.end_time,
            ...backendConfig,
          })
        );
      }
    } else {
      lines.push(
        msg(
          "Comparison window detail: the configured comparison window is not currently selected, so use the window id above to resolve the saved date window before querying."
        )
      );
    }
  }

  if (backendConfig?.comparison_entity_id) {
    lines.push(
      `${msg("Baseline comparison entity:")} ${String(backendConfig.comparison_entity_id)}`
    );
    lines.push(
      msg(
        "If your Home Assistant tooling requires explicit baseline range inputs, use the same start/end range as the main anomaly query unless a more specific monitor or MCP tool requires otherwise."
      )
    );
  }

  return {
    lines,
    metadata: {
      entityId: row.entity_id,
      displayName,
      anomalyEnabled,
      backendConfig: backendConfig || {},
      comparisonWindowId: analysis.anomaly_comparison_window_id,
    },
  };
}

function buildMonitorSection(
  context: AiQueryBriefContext,
  selectedEntityIds: string[]
): { lines: string[]; relevantMonitorIds: string[] } {
  const relevantMonitors = context.monitorContext.monitors.filter((monitor) =>
    monitorEntityIds(monitor).some((entityId) =>
      selectedEntityIds.includes(entityId)
    )
  );
  if (!relevantMonitors.length) {
    return {
      lines: [
        msg("RELEVANT PERSISTED MONITORS"),
        context.monitorContext.note ||
          msg(
            "No persisted anomaly monitors intersect the currently selected entities."
          ),
      ],
      relevantMonitorIds: [],
    };
  }

  const lines = [msg("RELEVANT PERSISTED MONITORS")];
  relevantMonitors.forEach((monitor) => {
    lines.push(t("Monitor: {0} ({1})", monitor.name, monitor.id));
    lines.push(`${msg("Type:")} ${monitor.type}`);
    lines.push(
      `${msg("Enabled:")} ${monitor.enabled ? msg("yes") : msg("no")}`
    );
    lines.push(`${msg("Entities:")} ${monitorEntityIds(monitor).join(", ")}`);
    lines.push(msg("Monitor anomaly query inputs:"));
    lines.push(
      stringifyJson({
        type: "hass_datapoints/monitors/anomalies",
        monitor_id: monitor.id,
      })
    );
  });
  return {
    lines,
    relevantMonitorIds: relevantMonitors.map((monitor) => monitor.id),
  };
}

export function summarizeAnomalyClusterForAiBrief(
  cluster: Nullable<AnomalyCluster> | undefined
): AiQueryBriefAnomalyClusterSnapshot {
  const points = Array.isArray(cluster?.points) ? cluster.points : [];
  const numericValues = points
    .map((point) => Number(point.value))
    .filter((value) => Number.isFinite(value));
  const minValue = numericValues.length ? Math.min(...numericValues) : null;
  const maxValue = numericValues.length ? Math.max(...numericValues) : null;
  const startTimeMs =
    points.length > 0 ? Number(points[0]?.timeMs ?? Number.NaN) : Number.NaN;
  const endTimeMs =
    points.length > 0
      ? Number(points[points.length - 1]?.timeMs ?? Number.NaN)
      : Number.NaN;

  return {
    point_count: points.length,
    start_time: Number.isFinite(startTimeMs)
      ? new Date(startTimeMs).toISOString()
      : null,
    end_time: Number.isFinite(endTimeMs)
      ? new Date(endTimeMs).toISOString()
      : null,
    min_value: minValue,
    max_value: maxValue,
    is_overlap:
      (cluster as Nullable<{ isOverlap?: boolean }>)?.isOverlap === true,
    points: points
      .map((point) => {
        const timeMs = Number(point.timeMs);
        const value = Number(point.value);
        if (!Number.isFinite(timeMs) || !Number.isFinite(value)) {
          return null;
        }
        return {
          time: new Date(timeMs).toISOString(),
          value,
        };
      })
      .filter(
        (point): point is { time: string; value: number } => point != null
      ),
  };
}

export function buildAiQueryBrief(
  context: AiQueryBriefContext
): AiQueryBriefResult {
  const selectedEntityIds = Array.isArray(context.entities)
    ? [...context.entities]
    : [];
  const { normalized, summary } = buildTargetSelectionSummary(
    context.targetSelectionRaw
  );
  const selectedComparisonWindow =
    context.comparisonWindows.find(
      (window) => window.id === context.selectedComparisonWindowId
    ) || null;
  const mainStartIso = toIso(context.startTime);
  const mainEndIso = toIso(context.endTime);
  const zoomStartIso = toIso(context.committedZoomRange?.start ?? null);
  const zoomEndIso = toIso(context.committedZoomRange?.end ?? null);

  const entitySections = context.seriesRows
    ? normalizeHistorySeriesRows(context.seriesRows)
        .filter((row) => selectedEntityIds.includes(row.entity_id))
        .map((row) =>
          buildEntitySection(context, row, selectedComparisonWindow)
        )
    : [];
  const monitorSection = buildMonitorSection(context, selectedEntityIds);

  const lines = [
    msg("AI QUERY BRIEF: HOME ASSISTANT DATAPOINTS PANEL"),
    "",
    msg("OBJECTIVE"),
    msg(
      "Fetch the underlying Home Assistant history or statistics, entity metadata, and hass_datapoints anomaly detail needed to inspect the currently selected datapoints. Do not treat this brief as the raw data itself."
    ),
    "",
    msg("SUCCESS CRITERIA"),
    msg("- Resolve entity metadata context for each selected entity."),
    msg(
      "- Fetch raw or best-available historical coverage for the requested range."
    ),
    msg(
      "- Reproduce hass_datapoints anomaly queries with the exact panel settings below."
    ),
    msg(
      "- Review current-range anomaly findings from this integration, including cross-entity correlated anomaly periods when present."
    ),
    msg(
      "- Call out any retention, sampling, permission, or monitor-lookup limitations."
    ),
    "",
    msg("RETRIEVAL PRIORITY"),
    msg(
      "1. Resolve entity metadata first so area, device, platform, labels, and unit context are known before interpretation."
    ),
    msg(
      "2. Fetch raw recorder history for the requested range where available."
    ),
    msg(
      "3. If raw history is incomplete, unavailable, or truncated by retention, fetch Home Assistant statistics for continuity."
    ),
    msg(
      "4. Reproduce the hass_datapoints anomaly queries exactly as listed below."
    ),
    msg(
      "5. Because anomaly analysis may use sampled data, compare raw history for ground truth against sampled series for anomaly reproduction."
    ),
    msg(
      "6. Review the current anomaly findings already found by this integration in the active range and use them to guide deeper inspection."
    ),
    msg(
      "7. If monitor context is available, fetch relevant monitor anomaly output for additional persisted monitor detail."
    ),
    "",
    msg("PANEL CONTEXT"),
    `${msg("Selected entity ids:")} ${selectedEntityIds.length ? selectedEntityIds.join(", ") : msg("(none selected)")}`,
    `${msg("Raw target selection summary:")} ${summary}`,
    `${msg("Datapoint scope:")} ${context.datapointScope}`,
    `${msg("Main range start_time:")} ${mainStartIso ?? msg("(not set)")}`,
    `${msg("Main range end_time:")} ${mainEndIso ?? msg("(not set)")}`,
    `${msg("Committed zoom start_time:")} ${zoomStartIso ?? msg("(not set)")}`,
    `${msg("Committed zoom end_time:")} ${zoomEndIso ?? msg("(not set)")}`,
    `${msg("Selected comparison window id:")} ${context.selectedComparisonWindowId ?? msg("(none)")}`,
    `${msg("Comparison windows:")} ${context.comparisonWindows.length}`,
    `${msg("Chart anomaly overlap mode:")} ${context.chartAnomalyOverlapMode}`,
    "",
    msg("RANGE / RETENTION NOTE"),
    buildRangeRetentionNote(mainStartIso, mainEndIso),
    "",
    msg("QUERY RULES"),
    msg("- Use UTC timestamps exactly as written for retrieval."),
    msg(
      "- Convert to the Home Assistant local timezone only when interpreting daily or weekly behavior patterns."
    ),
    msg(
      "- Do not infer 'no anomaly' from missing raw history when retention may be limited."
    ),
    msg(
      "- If anomaly queries below use sampled data, inspect both raw history and the sampled representation."
    ),
    msg(
      "- For long ranges, remember HA history pagination and retention constraints can change what raw coverage is available."
    ),
    "",
    msg("RAW TARGET SELECTION OBJECT"),
    stringifyJson(context.targetSelectionRaw || {}),
    "",
    msg("AVAILABLE COMPARISON WINDOWS"),
    context.comparisonWindows.length
      ? stringifyJson(
          context.comparisonWindows.map((window) => ({
            id: window.id,
            label: window.label ?? "",
            start_time: window.start_time,
            end_time: window.end_time,
          }))
        )
      : "[]",
    "",
    ...buildCurrentRangeAnomalyFindingsSection(context, selectedEntityIds),
    "",
    msg("PER-ENTITY QUERY DETAILS"),
  ];

  if (!entitySections.length) {
    lines.push(
      msg("No selected entities are currently available in the panel state.")
    );
  } else {
    entitySections.forEach((section, index) => {
      if (index > 0) {
        lines.push("");
      }
      lines.push(...section.lines);
    });
  }

  lines.push("");
  lines.push(...monitorSection.lines);
  lines.push("");
  lines.push(msg("RECOMMENDED OUTPUT"));
  lines.push(
    msg(
      "- Resolved metadata per selected entity, including unit, device class, state class, area, device, labels, and platform when available."
    )
  );
  lines.push(
    msg(
      "- Coverage status of raw history versus statistics, including any retention or pagination limits encountered."
    )
  );
  lines.push(
    msg(
      "- Detailed anomaly findings per entity for the requested range, using the current integration findings above plus any fetched raw cluster detail."
    )
  );
  lines.push(
    msg(
      "- If anomalies indicate some type of event, zoom out and look for answers in the related area/group/labels or across other entities in the panel. If anomalies are unexpected, look for any subtle metadata clues that could explain them, such as a device class or state class that implies a different expected behavior pattern than initially assumed."
    )
  );
  lines.push(
    msg(
      "- Correlated anomaly periods across the selected datapoints, if any are present, including which entities participate and when the overlap occurs."
    )
  );
  lines.push(
    msg(
      "- Any monitor-access, permission, sampling, comparison-window, or data-coverage limitations that materially affect interpretation."
    )
  );

  return {
    plainText: lines.join("\n"),
    metadata: {
      entityIds: selectedEntityIds,
      relevantMonitorIds: monitorSection.relevantMonitorIds,
      selectedComparisonWindowId: context.selectedComparisonWindowId,
      normalizedTargetSelection: normalized,
      entitySummaries: entitySections.map((section) => section.metadata),
      monitorAccess: context.monitorContext.access,
      anomalySnapshotAvailable: context.anomalySnapshot?.available === true,
    },
  };
}
