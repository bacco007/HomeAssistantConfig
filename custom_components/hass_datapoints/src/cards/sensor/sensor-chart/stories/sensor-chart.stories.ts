import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../sensor-chart";
import type { SensorChart } from "../sensor-chart";

type Story = StoryObj;

const meta: Meta = {
  title: "Charts/Sensor Card/Chart",
  component: "sensor-chart",
  parameters: { layout: "centered" },
};
export default meta;

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
  ];
}

const wrapStyle =
  "width:360px;height:120px;background:#fff;border-radius:8px;overflow:hidden;font-family:Roboto,sans-serif;";

export const Default: Story = {
  render: () =>
    html`<div style=${wrapStyle}><sensor-chart></sensor-chart></div>`,
  play: async ({ canvasElement }) => {
    const chartEl = canvasElement.querySelector(
      "sensor-chart"
    ) as SensorChart & { draw: (...args: unknown[]) => void };
    await chartEl.updateComplete;
    const now = Date.now();
    chartEl.draw(
      makeHistory("sensor.temperature", 24, 21.5, 3.0),
      [],
      now - 24 * 3600 * 1000,
      now,
      { entity: "sensor.temperature" },
      "°C",
      new Set()
    );
    await chartEl.updateComplete;
  },
};

export const WithAnnotations: Story = {
  name: "With Annotation Circles",
  render: () =>
    html`<div style=${wrapStyle}><sensor-chart></sensor-chart></div>`,
  play: async ({ canvasElement }) => {
    const chartEl = canvasElement.querySelector(
      "sensor-chart"
    ) as SensorChart & { draw: (...args: unknown[]) => void };
    await chartEl.updateComplete;
    const now = Date.now();
    chartEl.draw(
      makeHistory("sensor.temperature", 24, 21.5, 3.0),
      makeEvents("sensor.temperature", 24),
      now - 24 * 3600 * 1000,
      now,
      { entity: "sensor.temperature", annotation_style: "circle" },
      "°C",
      new Set()
    );
    await chartEl.updateComplete;
  },
};

export const WithAnnotationLines: Story = {
  name: "With Annotation Lines",
  render: () =>
    html`<div style=${wrapStyle}><sensor-chart></sensor-chart></div>`,
  play: async ({ canvasElement }) => {
    const chartEl = canvasElement.querySelector(
      "sensor-chart"
    ) as SensorChart & { draw: (...args: unknown[]) => void };
    await chartEl.updateComplete;
    const now = Date.now();
    chartEl.draw(
      makeHistory("sensor.temperature", 24, 21.5, 3.0),
      makeEvents("sensor.temperature", 24),
      now - 24 * 3600 * 1000,
      now,
      { entity: "sensor.temperature", annotation_style: "line" },
      "°C",
      new Set()
    );
    await chartEl.updateComplete;
  },
};

export const NoData: Story = {
  name: "No Numeric Data",
  render: () =>
    html`<div style=${wrapStyle}><sensor-chart></sensor-chart></div>`,
  play: async ({ canvasElement }) => {
    const chartEl = canvasElement.querySelector(
      "sensor-chart"
    ) as SensorChart & { draw: (...args: unknown[]) => void };
    await chartEl.updateComplete;
    const now = Date.now();
    // Pass empty history — no numeric data
    chartEl.draw(
      { "sensor.temperature": [{ s: "unavailable", lu: now / 1000 }] },
      [],
      now - 24 * 3600 * 1000,
      now,
      { entity: "sensor.temperature" },
      "°C",
      new Set()
    );
    await chartEl.updateComplete;
  },
};
