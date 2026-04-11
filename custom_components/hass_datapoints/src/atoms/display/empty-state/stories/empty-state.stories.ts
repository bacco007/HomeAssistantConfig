import { html } from "lit";
import "../empty-state";

export default {
  title: "Atoms/Display/Empty State",
  component: "empty-state",
  argTypes: {
    message: { control: "text" },
  },
};

export const Default = {
  render: () =>
    html`<empty-state .message=${"No data points recorded yet"}></empty-state>`,
};

export const NoEntities = {
  render: () =>
    html`<empty-state
      .message=${"No entities match the current filter"}
    ></empty-state>`,
};

export const EmptyHistory = {
  render: () =>
    html`<empty-state
      .message=${"No history available for this period"}
    ></empty-state>`,
};
