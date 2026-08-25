import { html } from "lit";
import "../anomaly-monitors-panel";
import { setFrontendLocale } from "@/lib/i18n/localize";

export default {
  title: "Molecules/Anomaly Monitors Panel",
  component: "anomaly-monitors-panel",
  loaders: [
    async () => {
      await setFrontendLocale("en");
    },
  ],
  parameters: {
    actions: { handles: ["dp-monitors-panel-close", "dp-monitors-panel-new"] },
  },
};

function makeHass(resolveWith: unknown[]) {
  return {
    states: {},
    connection: {
      subscribeEvents: () => Promise.resolve(() => undefined),
      sendMessagePromise: () => Promise.resolve({ monitors: resolveWith }),
    },
  };
}

function neverHass() {
  const never = () => new Promise<never>(() => {});
  return {
    states: {},
    connection: {
      subscribeEvents: never,
      sendMessagePromise: never,
    },
  };
}

export const Loading = {
  render: () => {
    const el = document.createElement(
      "anomaly-monitors-panel"
    ) as HTMLElement & { hass: unknown };
    el.hass = neverHass();
    return el;
  },
};

export const Empty = {
  render: () => {
    const el = document.createElement(
      "anomaly-monitors-panel"
    ) as HTMLElement & { hass: unknown };
    el.hass = makeHass([]);
    return el;
  },
};

export const WithMonitors = {
  render: () => {
    const monitors = [
      {
        id: "m1",
        name: "Living room temp spike",
        enabled: true,
        entity_ids: ["sensor.living_room_temp"],
        type: "individual",
        anomaly_methods: ["rolling_zscore"],
        sensitivity: "medium",
        scan_history: [],
      },
      {
        id: "m2",
        name: "Boiler efficiency (disabled)",
        enabled: false,
        entity_ids: ["sensor.boiler_efficiency"],
        type: "individual",
        anomaly_methods: ["trend_residual"],
        sensitivity: "low",
        scan_history: [],
      },
      {
        id: "m3",
        name: "Multi-sensor comparison",
        enabled: true,
        entity_ids: ["sensor.temp_a", "sensor.temp_b"],
        type: "combined",
        anomaly_methods: ["iqr"],
        sensitivity: "high",
        scan_history: [],
      },
    ];
    const el = document.createElement(
      "anomaly-monitors-panel"
    ) as HTMLElement & { hass: unknown };
    el.hass = makeHass(monitors);
    return el;
  },
};

export const Default = {
  render: () => html`
    <div style="width:700px;height:600px;border:1px solid #ccc;">
      ${WithMonitors.render()}
    </div>
  `,
};
