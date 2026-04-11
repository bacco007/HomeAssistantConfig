import { html } from "lit";
import { expect, fn } from "@storybook/test";
import "../annotation-chip-row";
import type { ChipItem } from "../annotation-chip-row";

const ENTITY_CHIPS: ChipItem[] = [
  {
    type: "entity_id",
    itemId: "sensor.living_room_temp",
    icon: "mdi:thermometer",
    name: "Living room temp",
  },
  {
    type: "entity_id",
    itemId: "sensor.outdoor_humidity",
    icon: "mdi:water-percent",
    name: "Outdoor humidity",
  },
];

const MIXED_CHIPS: ChipItem[] = [
  {
    type: "entity_id",
    itemId: "sensor.living_room_temp",
    icon: "mdi:thermometer",
    name: "Living room temp",
  },
  {
    type: "device_id",
    itemId: "device-abc",
    icon: "mdi:devices",
    name: "My thermostat",
  },
  {
    type: "area_id",
    itemId: "living_room",
    icon: "mdi:sofa",
    name: "Living room",
  },
];

/**
 * `annotation-chip-row` renders a labelled group of removable annotation
 * target chips with empty-state support.
 *
 * @fires dp-target-remove - `{ type: string, id: string }` fired when a chip is removed
 */
export default {
  title: "Molecules/Annotation Chip Row",
  component: "annotation-chip-row",
  parameters: {
    actions: {
      handles: ["dp-target-remove"],
    },
  },
  argTypes: {
    chips: {
      control: "object",
      description:
        "Array of pre-resolved chip items: `{ type, itemId, icon, name }`.",
    },
    label: {
      control: "text",
      description: "Section label shown above the chips.",
    },
    helpText: {
      control: "text",
      description: "Help text shown below the label when chips are present.",
    },
    emptyText: {
      control: "text",
      description: "Help text shown when there are no chips.",
    },
  },
  args: {
    chips: ENTITY_CHIPS,
    label: "Linked targets",
    helpText:
      "These targets will be associated with the new data point by default. Remove any that should not be linked.",
    emptyText: "No linked targets will be associated with this data point.",
  },
  render: (args: RecordWithUnknownValues) => html`
    <annotation-chip-row
      .chips=${args.chips}
      .label=${args.label}
      .helpText=${args.helpText}
      .emptyText=${args.emptyText}
    ></annotation-chip-row>
  `,
};

/** Two entity chips with remove buttons. */
export const Default = {};

/** Mixed entity, device, and area chips. */
export const MixedTypes = {
  args: { chips: MIXED_CHIPS },
};

/** Single chip. */
export const SingleChip = {
  args: {
    chips: [
      {
        type: "entity_id",
        itemId: "sensor.power",
        icon: "mdi:flash",
        name: "Power usage",
      },
    ],
  },
};

/** Empty state — no chips, shows the emptyText. */
export const Empty = {
  args: { chips: [] },
};

/** Fires dp-target-remove when a chip's remove button is clicked. */
export const EmitsTargetRemove = {
  args: { chips: ENTITY_CHIPS },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector(
      "annotation-chip-row"
    ) as HTMLElement;
    const handler = fn();
    host.addEventListener("dp-target-remove", handler);
    // Simulate dp-chip-remove bubbling from a child chip.
    const chipRow = host.shadowRoot!.querySelector(".context-chip-row")!;
    chipRow.dispatchEvent(
      new CustomEvent("dp-chip-remove", {
        detail: { type: "entity_id", itemId: "sensor.living_room_temp" },
        bubbles: true,
        composed: true,
      })
    );
    await expect(handler).toHaveBeenCalledOnce();
    await expect((handler.mock.calls[0][0] as CustomEvent).detail.type).toBe(
      "entity_id"
    );
    await expect((handler.mock.calls[0][0] as CustomEvent).detail.id).toBe(
      "sensor.living_room_temp"
    );
  },
};
