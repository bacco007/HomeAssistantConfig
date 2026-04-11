import { html } from "lit";
import "../form-group";

export default {
  title: "Atoms/Display/Form Group",
  component: "form-group",
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
  },
};

export const Default = {
  render: () => html`
    <form-group
      .label=${"Entity"}
      .description=${"Select the entity to track for this data point"}
    >
      <input type="text" placeholder="sensor.temperature" />
    </form-group>
  `,
};

export const LabelOnly = {
  render: () => html`
    <form-group .label=${"Name"}>
      <input type="text" placeholder="Enter a name" />
    </form-group>
  `,
};

export const DescriptionOnly = {
  render: () => html`
    <form-group .description=${"Optional context about this data point"}>
      <textarea placeholder="Add notes..."></textarea>
    </form-group>
  `,
};
