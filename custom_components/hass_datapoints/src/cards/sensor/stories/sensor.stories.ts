/**
 * sensor.stories.ts
 *
 * Stories for hass-datapoints-sensor-card.
 *
 * Each story is wrapped in an HA-grid-like container that provides the CSS custom
 * properties the card depends on (--row-height, --row-gap) and a realistic card
 * width, matching how the card appears on a real HA dashboard.
 *
 * In the Storybook play flow the element is already in the DOM before play() runs,
 * so firstUpdated() fires with hass=null and _load() is never triggered
 * automatically. We call card._load() explicitly after setting hass.
 */
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { HassRecordsSensorCard } from "../sensor";

if (!customElements.get("hass-datapoints-sensor-card")) {
  customElements.define("hass-datapoints-sensor-card", HassRecordsSensorCard);
}

type Story = StoryObj;

// ── HA-grid card wrapper ──────────────────────────────────────────────────────

/**
 * Wraps a card in a container that mimics the HA lovelace grid environment.
 *
 * HA grid CSS vars used by the card:
 *   --row-height  height of one grid row (default HA value: 56px)
 *   --row-gap     gap between rows (default HA value: 8px)
 *
 * Card body height formula (from sensor.styles.ts):
 *   rows × (rowHeight + rowGap) − rowGap
 *
 * @param width     card width in px (mimics grid column span)
 * @param rows      number of grid rows the card occupies
 * @param rowHeight HA --row-height (default 56)
 * @param rowGap    HA --row-gap    (default 8)
 */
function haCardWrapper(
  content: TemplateResult,
  { width = 360, rows = 2, rowHeight = 56, rowGap = 8 } = {}
) {
  const height = rows * (rowHeight + rowGap) - rowGap;
  return html`
    <div
      style="
      width: ${width}px;
      height: ${height}px;
      --hr-body-rows: ${rows};
      --row-size: ${rows}px;
      --row-height: ${rowHeight}px;
      --row-gap: ${rowGap}px;
      font-family: Roboto, sans-serif;
      background: var(--ha-card-background, #fff);
      border-radius: 12px;
      overflow: hidden;
    "
    >
      ${content}
    </div>
  `;
}

// Default card size: 3 rows at 56px = card-body 184px → ~86px chart area after header+info
const meta: Meta = {
  title: "Charts/Sensor Card",
  component: "hass-datapoints-sensor-card",
  parameters: { layout: "centered" },
};
export default meta;

// ── Sample data generators ────────────────────────────────────────────────────

function makeHistory(
  entityId: string,
  hours: number,
  baseValue: number,
  amplitude: number
) {
  const now = Date.now();
  return {
    [entityId]: Array.from({ length: hours + 1 }, (_, i) => {
      const ts = now - (hours - i) * 3600 * 1000;
      const v = baseValue + amplitude * Math.sin((i / hours) * Math.PI * 4);
      return { s: v.toFixed(1), lu: ts / 1000 };
    }),
  };
}

function makeEvents(entityId: string, hours: number) {
  const now = Date.now();
  return [
    {
      id: "evt-1",
      message: "Unusual spike detected",
      annotation: "Temperature jumped +4°C in under an hour.",
      icon: "mdi:thermometer-alert",
      color: "#f44336",
      timestamp: new Date(now - hours * 0.7 * 3600 * 1000).toISOString(),
      entity_id: entityId,
      device_id: null,
      area_id: null,
      label_id: null,
      dev: false,
    },
    {
      id: "evt-2",
      message: "Window opened",
      annotation: null,
      icon: "mdi:window-open",
      color: "#2196f3",
      timestamp: new Date(now - hours * 0.4 * 3600 * 1000).toISOString(),
      entity_id: entityId,
      device_id: null,
      area_id: null,
      label_id: null,
      dev: false,
    },
    {
      id: "evt-3",
      message: "Heating turned on",
      annotation: "Manual override via thermostat.",
      icon: "mdi:radiator",
      color: "#ff9800",
      timestamp: new Date(now - hours * 0.15 * 3600 * 1000).toISOString(),
      entity_id: entityId,
      device_id: null,
      area_id: null,
      label_id: null,
      dev: false,
    },
  ];
}

// ── Mock hass factory ─────────────────────────────────────────────────────────

function makeMockHass(
  states: RecordWithUnknownValues,
  historyData: Record<string, unknown[]>,
  events: unknown[] = []
) {
  return {
    states,
    connection: {
      subscribeEvents: () => Promise.resolve(() => {}),
      sendMessagePromise: (msg: { type: string }) => {
        if (msg.type === "hass_datapoints/events")
          return Promise.resolve({ events });
        if (msg.type === "history/history_during_period")
          return Promise.resolve(historyData);
        return Promise.resolve({});
      },
    },
  };
}

// ── Shared states ─────────────────────────────────────────────────────────────

const temperatureState = {
  "sensor.temperature": {
    state: "22.5",
    attributes: {
      friendly_name: "Living Room Temperature",
      unit_of_measurement: "°C",
      icon: "mdi:thermometer",
    },
  },
};

const powerState = {
  "sensor.power": {
    state: "1.42",
    attributes: {
      friendly_name: "Current Power Usage",
      unit_of_measurement: "kW",
      icon: "mdi:lightning-bolt",
    },
  },
};

const unavailableState = {
  "sensor.temperature": {
    state: "unavailable",
    attributes: {
      friendly_name: "Living Room Temperature",
      unit_of_measurement: "°C",
    },
  },
};

// ── Helper ────────────────────────────────────────────────────────────────────

async function setupCard(
  canvasElement: HTMLElement,
  config: RecordWithUnknownValues,
  hass?: ReturnType<typeof makeMockHass>
) {
  const card = canvasElement.querySelector(
    "hass-datapoints-sensor-card"
  ) as HassRecordsSensorCard;
  card.setConfig(config);
  if (hass) {
    card.hass = hass as any;
    await (card as any)._load();
    await card.updateComplete;
  }
  return card;
}

function withCardWrapper({
  width = 360,
  rows = 3,
}: {
  width?: number;
  rows?: number;
} = {}) {
  return ((story: () => TemplateResult) =>
    haCardWrapper(story() as TemplateResult, { width, rows })) as any;
}

const defaultDecorator = withCardWrapper({ rows: 3 });

// ── Stories ───────────────────────────────────────────────────────────────────

/** Before hass is attached the card shows its initial "Loading…" message. */
export const Loading: Story = {
  name: "Loading (no hass)",
  decorators: [defaultDecorator],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(canvasElement, {
      entity: "sensor.temperature",
      hours_to_show: 24,
    });
  },
};

/** Temperature sensor with 24 h of history. */
export const Default: Story = {
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  decorators: [defaultDecorator],
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

/** Power sensor with a custom graph colour. */
export const PowerSensor: Story = {
  name: "Power Sensor (custom colour)",
  decorators: [defaultDecorator],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.power", hours_to_show: 24, graph_color: "#ff9800" },
      makeMockHass(powerState, makeHistory("sensor.power", 24, 1.4, 0.6))
    );
  },
};

/**
 * Sensor currently unavailable — but history exists from before it went offline.
 * The chart shows past data; the value display shows "unavailable".
 */
export const Unavailable: Story = {
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  decorators: [defaultDecorator],
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        unavailableState,
        makeHistory("sensor.temperature", 20, 21.5, 3.0)
      )
    );
  },
};

/** Three annotation markers as coloured icon circles on the chart line. */
export const WithAnnotations: Story = {
  name: "With Annotations (circles)",
  decorators: [defaultDecorator],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      {
        entity: "sensor.temperature",
        hours_to_show: 24,
        annotation_style: "circle",
      },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0),
        makeEvents("sensor.temperature", 24)
      )
    );
  },
};

/** Annotation markers rendered as vertical lines. */
export const WithAnnotationLines: Story = {
  name: "With Annotations (lines)",
  decorators: [defaultDecorator],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      {
        entity: "sensor.temperature",
        hours_to_show: 24,
        annotation_style: "line",
      },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0),
        makeEvents("sensor.temperature", 24)
      )
    );
  },
};

/** Annotations on chart plus the records list below. */
export const WithAnnotationsAndRecords: Story = {
  name: "With Annotations & Records",
  decorators: [withCardWrapper({ rows: 4 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      {
        entity: "sensor.temperature",
        hours_to_show: 24,
        annotation_style: "circle",
        show_records: true,
      },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0),
        makeEvents("sensor.temperature", 24)
      )
    );
  },
};

/** Records section visible with no events — shows empty state. */
export const WithRecordsEmpty: Story = {
  name: "With Records (empty)",
  decorators: [withCardWrapper({ rows: 4 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24, show_records: true },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

/** Extended time window — 7 days. */
export const ExtendedRange: Story = {
  name: "Extended Range (7 days)",
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      {
        entity: "sensor.temperature",
        hours_to_show: 168,
        annotation_style: "circle",
      },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 168, 20.0, 4.5),
        makeEvents("sensor.temperature", 168)
      )
    );
  },
};

/**
 * The card at three common HA dashboard widths side by side.
 * Overrides the default decorator to render a multi-column layout.
 */
/** Narrow column — 320 px wide (e.g. single-column mobile or sidebar). */
export const NarrowWidth: Story = {
  name: "Width: Narrow (320px)",
  decorators: [withCardWrapper({ width: 320, rows: 3 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

/** Standard column — 400 px wide (typical HA dashboard column). */
export const MediumWidth: Story = {
  name: "Width: Medium (400px)",
  decorators: [withCardWrapper({ width: 400, rows: 3 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

/** Wide column — 560 px wide (two-column span or wide layout). */
export const WideWidth: Story = {
  name: "Width: Wide (560px)",
  decorators: [withCardWrapper({ width: 550, rows: 3 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

export const NarrowHeight: Story = {
  name: "Height: 2 rows",
  decorators: [withCardWrapper({ width: 320, rows: 2 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

export const MediumHeight: Story = {
  name: "Height: 4 rows",
  decorators: [withCardWrapper({ width: 320, rows: 4 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};

export const LargeHeight: Story = {
  name: "Height: 8 rows",
  decorators: [withCardWrapper({ width: 320, rows: 8 })],
  render: () =>
    html`<hass-datapoints-sensor-card></hass-datapoints-sensor-card>`,
  play: async ({ canvasElement }) => {
    await setupCard(
      canvasElement,
      { entity: "sensor.temperature", hours_to_show: 24 },
      makeMockHass(
        temperatureState,
        makeHistory("sensor.temperature", 24, 21.5, 3.0)
      )
    );
  },
};
