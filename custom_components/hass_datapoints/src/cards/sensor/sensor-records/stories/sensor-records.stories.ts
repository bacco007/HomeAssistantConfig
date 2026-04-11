import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../sensor-records";

type Story = StoryObj;

const meta: Meta = {
  title: "Charts/Sensor Card/Records",
  component: "sensor-records",
  parameters: { layout: "centered" },
};
export default meta;

const now = Date.now();

const sampleEvents = [
  {
    id: "evt-1",
    message: "Unusual spike detected",
    annotation: "Temperature jumped +4°C in under an hour.",
    icon: "mdi:thermometer-alert",
    color: "#f44336",
    timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
    entity_id: "sensor.temperature",
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
    timestamp: new Date(now - 1 * 3600 * 1000).toISOString(),
    entity_id: "sensor.temperature",
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
    timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
    entity_id: "sensor.temperature",
    device_id: null,
    area_id: null,
    label_id: null,
    dev: false,
  },
];

const manyEvents = Array.from({ length: 7 }, (_, i) => ({
  id: `evt-${i}`,
  message: `Event ${i + 1}`,
  annotation: i % 2 === 0 ? `Annotation for event ${i + 1}` : null,
  icon: "mdi:bookmark",
  color: "#607d8b",
  timestamp: new Date(now - i * 3600 * 1000).toISOString(),
  entity_id: "sensor.temperature",
  device_id: null,
  area_id: null,
  label_id: null,
  dev: false,
}));

const wrapStyle =
  "width:360px;height:240px;background:#fff;border-radius:8px;overflow:hidden;font-family:Roboto,sans-serif;display:flex;flex-direction:column;";

export const Default: Story = {
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-records .events=${sampleEvents}></sensor-records>
    </div>
  `,
};

export const Empty: Story = {
  name: "Empty State",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-records .events=${[]}></sensor-records>
    </div>
  `,
};

export const WithPagination: Story = {
  name: "With Pagination",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-records .events=${manyEvents} .pageSize=${3}></sensor-records>
    </div>
  `,
};

export const WithHiddenEvents: Story = {
  name: "With Hidden Events",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-records
        .events=${sampleEvents}
        .hiddenEventIds=${new Set(["evt-1"])}
      ></sensor-records>
    </div>
  `,
};

export const CollapsedNotes: Story = {
  name: "Collapsed Notes",
  render: () => html`
    <div style=${wrapStyle}>
      <sensor-records
        .events=${sampleEvents}
        .showFullMessage=${false}
      ></sensor-records>
    </div>
  `,
};
