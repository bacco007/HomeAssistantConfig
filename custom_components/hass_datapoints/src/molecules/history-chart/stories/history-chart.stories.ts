/**
 * `history-chart` is a plain HTMLElement (not LitElement) that wraps the
 * `hass-datapoints-history-card` inner card. Stories use synchronous element
 * construction (consistent with how callers use it) and assign config/hass
 * after creation, just as the panel does.
 */
import "../history-chart";

function makeChart(config: Record<string, unknown>) {
  const el = document.createElement("history-chart") as HTMLElement & {
    config: Record<string, unknown>;
    hass: unknown;
  };
  el.style.cssText = "display:block;width:800px;height:400px;";
  el.config = config;
  return el;
}

const minimalConfig = {
  series: [{ entity_id: "sensor.temperature" }],
  period: "day",
};

export default {
  title: "Molecules/History Chart",
  component: "history-chart",
};

export const Default = {
  render: () => makeChart(minimalConfig),
};

export const WithTitle = {
  render: () => makeChart({ ...minimalConfig, title: "Temperature over 24 h" }),
};
