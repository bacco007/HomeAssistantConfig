import { html } from "lit";
import "../annotation-chip";

export default {
  title: "Atoms/Interactive/Annotation Chip",
  component: "annotation-chip",
};

export const Entity = {
  render: () => html`
    <annotation-chip
      .type=${"entity"}
      .itemId=${"sensor.temperature"}
      .icon=${"mdi:thermometer"}
      .name=${"Temperature"}
    ></annotation-chip>
  `,
};

export const Area = {
  render: () => html`
    <annotation-chip
      .type=${"area"}
      .itemId=${"living_room"}
      .icon=${"mdi:sofa"}
      .name=${"Living Room"}
    ></annotation-chip>
  `,
};

export const Device = {
  render: () => html`
    <annotation-chip
      .type=${"device"}
      .itemId=${"hue_bridge"}
      .icon=${"mdi:bridge"}
      .name=${"Hue Bridge"}
    ></annotation-chip>
  `,
};
