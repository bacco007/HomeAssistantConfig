import { html } from "lit";
import "../entity-chip";

export default {
  title: "Atoms/Form/Entity Chip",
  component: "entity-chip",
  parameters: {
    actions: { handles: ["dp-chip-remove"] },
  },
};

export const Default = {
  render: () => html`
    <entity-chip
      .type=${"entity"}
      .itemId=${"sensor.living_room_temperature"}
    ></entity-chip>
  `,
};

export const Removable = {
  render: () => html`
    <entity-chip
      .type=${"entity"}
      .itemId=${"sensor.living_room_temperature"}
      .removable=${true}
    ></entity-chip>
  `,
};

export const DeviceType = {
  render: () => html`
    <entity-chip
      .type=${"device"}
      .itemId=${"abc123def456"}
      .removable=${true}
    ></entity-chip>
  `,
};

export const AreaType = {
  render: () => html`
    <entity-chip
      .type=${"area"}
      .itemId=${"living_room"}
      .removable=${true}
    ></entity-chip>
  `,
};
