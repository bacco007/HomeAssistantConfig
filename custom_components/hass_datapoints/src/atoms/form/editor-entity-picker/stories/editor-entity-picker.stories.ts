import { html } from "lit";
import "../editor-entity-picker";

export default {
  title: "Atoms/Form/Editor Entity Picker",
  component: "editor-entity-picker",
  parameters: {
    actions: { handles: ["dp-entity-change"] },
  },
};

export const Default = {
  render: () => html`
    <editor-entity-picker .label=${"Entity"}></editor-entity-picker>
  `,
};

export const WithValue = {
  render: () => html`
    <editor-entity-picker
      .label=${"Entity"}
      .value=${"sensor.living_room_temperature"}
    ></editor-entity-picker>
  `,
};

export const NoLabel = {
  render: () => html` <editor-entity-picker></editor-entity-picker> `,
};
