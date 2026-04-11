import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../sensor-header";

type Story = StoryObj;

const meta: Meta = {
  title: "Charts/Sensor Card/Header",
  component: "sensor-header",
  parameters: { layout: "centered" },
};
export default meta;

const mockStateObj = {
  state: "22.5",
  attributes: {
    friendly_name: "Living Room Temperature",
    unit_of_measurement: "°C",
    icon: "mdi:thermometer",
  },
};

export const Default: Story = {
  render: () => html`
    <div
      style="width:360px;background:#fff;border-radius:12px;overflow:hidden;font-family:Roboto,sans-serif;"
    >
      <sensor-header
        .name=${"Living Room Temperature"}
        .value=${"22.5"}
        .unit=${"°C"}
        .stateObj=${mockStateObj}
      ></sensor-header>
    </div>
  `,
};

export const NoUnit: Story = {
  name: "No Unit",
  render: () => html`
    <div
      style="width:360px;background:#fff;border-radius:12px;overflow:hidden;font-family:Roboto,sans-serif;"
    >
      <sensor-header
        .name=${"Binary Sensor"}
        .value=${"on"}
        .unit=${""}
      ></sensor-header>
    </div>
  `,
};

export const LongName: Story = {
  name: "Long Name (truncation)",
  render: () => html`
    <div
      style="width:360px;background:#fff;border-radius:12px;overflow:hidden;font-family:Roboto,sans-serif;"
    >
      <sensor-header
        .name=${"A very long sensor friendly name that should get truncated"}
        .value=${"1.42"}
        .unit=${"kW"}
      ></sensor-header>
    </div>
  `,
};
