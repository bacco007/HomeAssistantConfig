import { html } from "lit";
import "../chip-group";
import { createMockHass } from "../../../test-support/mock-hass";

export default {
  title: "Molecules/Chip Group",
  component: "chip-group",
  parameters: {
    actions: {
      handles: ["dp-chips-change"],
    },
  },
};

const mockHass = createMockHass();

const sampleItems = [
  { type: "entity_id", id: "sensor.temperature" },
  { type: "entity_id", id: "sensor.humidity" },
];

export const Default = {
  render: () => html`
    <chip-group .items=${sampleItems} .hass=${mockHass}></chip-group>
  `,
};

export const WithLabel = {
  render: () => html`
    <chip-group
      .items=${sampleItems}
      .hass=${mockHass}
      .label=${"Linked entities"}
    ></chip-group>
  `,
};

export const Removable = {
  render: () => html`
    <chip-group
      .items=${sampleItems}
      .hass=${mockHass}
      .removable=${true}
      .label=${"Linked entities"}
    ></chip-group>
  `,
};

export const Empty = {
  render: () => html`
    <chip-group
      .items=${[]}
      .hass=${mockHass}
      .label=${"Linked entities"}
    ></chip-group>
  `,
};
