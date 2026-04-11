import { html } from "lit";
import "../radio-group";

export default {
  title: "Atoms/Form/Radio Group",
  component: "radio-group",
  argTypes: {
    name: { control: "text" },
    value: { control: "text" },
  },
};

export const Default = {
  render: () => html`
    <radio-group
      .name=${"period"}
      .value=${"day"}
      .options=${[
        { value: "hour", label: "Hour" },
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
      ]}
    ></radio-group>
  `,
};

export const NoneSelected = {
  render: () => html`
    <radio-group
      .name=${"stat"}
      .value=${""}
      .options=${[
        { value: "mean", label: "Mean" },
        { value: "min", label: "Min" },
        { value: "max", label: "Max" },
      ]}
    ></radio-group>
  `,
};

export const TwoOptions = {
  render: () => html`
    <radio-group
      .name=${"mode"}
      .value=${"light"}
      .options=${[
        { value: "light", label: "Light Mode" },
        { value: "dark", label: "Dark Mode" },
      ]}
    ></radio-group>
  `,
};
