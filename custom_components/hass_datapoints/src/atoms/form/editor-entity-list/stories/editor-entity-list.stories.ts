import { html } from "lit";
import "../editor-entity-list";

export default {
  title: "Atoms/Form/Editor Entity List",
  component: "editor-entity-list",
  parameters: {
    actions: { handles: ["dp-entity-list-change"] },
  },
};

export const Empty = {
  render: () => html`
    <editor-entity-list .entities=${[]}></editor-entity-list>
  `,
};

export const WithEntities = {
  render: () => html`
    <editor-entity-list
      .entities=${[
        "sensor.living_room_temperature",
        "sensor.bedroom_humidity",
        "binary_sensor.front_door",
      ]}
    ></editor-entity-list>
  `,
};

export const CustomButtonLabel = {
  render: () => html`
    <editor-entity-list
      .entities=${["sensor.outdoor_temperature"]}
      .buttonLabel=${"Add sensor"}
    ></editor-entity-list>
  `,
};
