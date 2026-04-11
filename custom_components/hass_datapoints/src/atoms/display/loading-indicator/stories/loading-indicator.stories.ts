import { html } from "lit";
import "../loading-indicator";

export default {
  title: "Atoms/Display/Loading Indicator",
  component: "loading-indicator",
  argTypes: {
    active: { control: "boolean" },
  },
};

export const Inactive = {
  render: () => html`<loading-indicator></loading-indicator>`,
};

export const Active = {
  render: () => html`<loading-indicator .active=${true}></loading-indicator>`,
};
