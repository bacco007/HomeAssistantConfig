import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../sensor-record-item";

type Story = StoryObj;

const meta: Meta = {
  title: "Charts/Sensor Card/Record Item",
  component: "sensor-record-item",
  parameters: { layout: "centered" },
};
export default meta;

const sampleEvent = {
  id: "evt-1",
  message: "Unusual spike detected",
  annotation: "Temperature jumped +4°C in under an hour.",
  icon: "mdi:thermometer-alert",
  color: "#f44336",
  timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  entity_id: "sensor.temperature",
  device_id: null,
  area_id: null,
  label_id: null,
  dev: false,
};

const simpleEvent = {
  id: "evt-2",
  message: "Window opened",
  annotation: null,
  icon: "mdi:window-open",
  color: "#2196f3",
  timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  entity_id: "sensor.temperature",
  device_id: null,
  area_id: null,
  label_id: null,
  dev: false,
};

const devEvent = {
  id: "evt-3",
  message: "Debug entry",
  annotation: "Some debug info",
  icon: "mdi:bug",
  color: "#9c27b0",
  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  entity_id: "sensor.temperature",
  device_id: null,
  area_id: null,
  label_id: null,
  dev: true,
};

const wrapStyle =
  "width:360px;background:#fff;border-radius:8px;overflow:hidden;font-family:Roboto,sans-serif;";

export const Default: Story = {
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-record-item
        .event=${sampleEvent}
        .showFullMessage=${true}
      ></sensor-record-item>
    </div>
  `,
};

export const Simple: Story = {
  name: "Simple (no annotation)",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-record-item
        .event=${simpleEvent}
        .showFullMessage=${true}
      ></sensor-record-item>
    </div>
  `,
};

export const Hidden: Story = {
  name: "Hidden (chart marker off)",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-record-item
        .event=${sampleEvent}
        .hidden=${true}
        .showFullMessage=${true}
      ></sensor-record-item>
    </div>
  `,
};

export const DevBadge: Story = {
  name: "Dev Badge",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-record-item
        .event=${devEvent}
        .showFullMessage=${true}
      ></sensor-record-item>
    </div>
  `,
};

export const CollapsedNote: Story = {
  name: "Collapsed Note",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-record-item
        .event=${sampleEvent}
        .showFullMessage=${false}
      ></sensor-record-item>
    </div>
  `,
};
