import { html } from "lit";
import "../color-picker-field";

export default {
  title: "Atoms/Form/Color Picker Field",
  component: "color-picker-field",
  argTypes: {
    color: { control: "color" },
    entityId: { control: "text" },
  },
};

export const Default = {
  render: () => html`
    <color-picker-field .color=${"#4caf50"}></color-picker-field>
  `,
};

export const WithEntityIcon = {
  render: () => html`
    <color-picker-field
      .color=${"#2196f3"}
      .entityId=${"sensor.temperature"}
    ></color-picker-field>
  `,
};

export const Orange = {
  render: () => html`
    <color-picker-field .color=${"#ff9800"}></color-picker-field>
  `,
};
