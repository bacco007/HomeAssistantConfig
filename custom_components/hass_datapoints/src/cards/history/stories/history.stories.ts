/**
 * history.stories.ts
 *
 * Stories for hass-datapoints-history-card — the main datapoints chart card.
 * The TypeScript class is a LitElement stub; the full canvas rendering lives in the
 * companion JS file and is not exercised here. Stories demonstrate the card shell
 * structure (title, chart area, legend) across different config shapes.
 */
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { HassRecordsHistoryCard } from "../history";

// Self-registers if not already defined (guards against HMR double-registration).
if (!customElements.get("hass-datapoints-history-card")) {
  customElements.define("hass-datapoints-history-card", HassRecordsHistoryCard);
}

type Story = StoryObj;

const meta: Meta = {
  title: "Charts/History Card",
  component: "hass-datapoints-history-card",
};
export default meta;

// ── Mock hass ─────────────────────────────────────────────────────────────────

/**
 * Minimal hass mock.
 * subscribeEvents resolves immediately (no real HA connection).
 * sendMessagePromise returns empty results so the stub _load() completes cleanly.
 */
const mockHass = {
  states: {
    "sensor.temperature": {
      state: "22.5",
      attributes: {
        friendly_name: "Living Room Temperature",
        unit_of_measurement: "°C",
      },
    },
    "sensor.humidity": {
      state: "58",
      attributes: {
        friendly_name: "Living Room Humidity",
        unit_of_measurement: "%",
      },
    },
    "sensor.co2": {
      state: "812",
      attributes: {
        friendly_name: "CO₂ Level",
        unit_of_measurement: "ppm",
      },
    },
  },
  connection: {
    subscribeEvents: () => Promise.resolve(() => {}),
    sendMessagePromise: () => Promise.resolve({}),
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCard(canvasElement: HTMLElement): any {
  return canvasElement.querySelector("hass-datapoints-history-card");
}

// ── Stories ───────────────────────────────────────────────────────────────────

/** Single entity, no title — minimal config. */
export const Default: Story = {
  render: () =>
    html`<hass-datapoints-history-card></hass-datapoints-history-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement);
    card.setConfig({ entity: "sensor.temperature", hours_to_show: 24 });
    card.hass = mockHass;
  },
};

/** Card with a visible title in the header. */
export const WithTitle: Story = {
  render: () =>
    html`<hass-datapoints-history-card></hass-datapoints-history-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement);
    card.setConfig({
      title: "Living Room Temperature",
      entity: "sensor.temperature",
      hours_to_show: 24,
    });
    card.hass = mockHass;
  },
};

/** Entities array — multiple series on one chart. */
export const MultipleEntities: Story = {
  name: "Multiple Entities",
  render: () =>
    html`<hass-datapoints-history-card></hass-datapoints-history-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement);
    card.setConfig({
      title: "Living Room Climate",
      entities: ["sensor.temperature", "sensor.humidity", "sensor.co2"],
      hours_to_show: 48,
    });
    card.hass = mockHass;
  },
};

/** Extended time window — 7 days of history. */
export const ExtendedRange: Story = {
  name: "Extended Range (7 days)",
  render: () =>
    html`<hass-datapoints-history-card></hass-datapoints-history-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement);
    card.setConfig({
      title: "Weekly Overview",
      entity: "sensor.temperature",
      hours_to_show: 168,
      show_trend_lines: true,
    });
    card.hass = mockHass;
  },
};
