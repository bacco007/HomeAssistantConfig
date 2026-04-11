/**
 * Pure chart value and tooltip formatting utilities.
 *
 * DOM-touching functions (setupCanvas, renderChartAxisOverlays, etc.) and
 * HTML template builders (CHART_STYLE, buildChartCardShell) live in
 * `src/charts/utils/chart-dom.ts` so this module stays DOM-free.
 */

export {
  buildChartCardShell,
  CHART_STYLE,
  positionTooltip,
  renderChartAxisHoverDots,
  renderChartAxisOverlays,
  resolveChartLabelColor,
  setupCanvas,
} from "@/charts/utils/chart-dom";

export function clampChartValue(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(max, Math.max(min, value));
}

export function formatTooltipValue(
  value: number | Nullable<string> | undefined,
  unit = ""
): string {
  if (value == null || value === "" || Number.isNaN(Number(value))) {
    return "";
  }
  return `${Number(value).toFixed(2).replace(/\.00$/, "")}${unit ? ` ${unit}` : ""}`;
}

export function formatTooltipDisplayValue(
  value: number | Nullable<string> | undefined,
  unit = ""
): string {
  if (value == null || value === "") {
    return "No value";
  }
  if (typeof value === "string") {
    return unit ? `${value} ${unit}` : value;
  }
  return formatTooltipValue(value, unit);
}
