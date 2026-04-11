import { html } from "lit";
import "../editor-icon-picker";

export default {
  title: "Atoms/Form/Editor Icon Picker",
  component: "editor-icon-picker",
  parameters: {
    actions: { handles: ["dp-icon-change"] },
  },
};

export const Default = {
  render: () => html`
    <editor-icon-picker .label=${"Icon"}></editor-icon-picker>
  `,
};

export const WithValue = {
  render: () => html`
    <editor-icon-picker
      .label=${"Icon"}
      .value=${"mdi:thermometer"}
    ></editor-icon-picker>
  `,
};

export const NoLabel = {
  render: () => html`
    <editor-icon-picker .value=${"mdi:home"}></editor-icon-picker>
  `,
};
