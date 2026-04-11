import { html } from "lit";
import "../date-time-input";

export default {
  title: "Atoms/Form/Date Time Input",
  component: "date-time-input",
  parameters: {
    actions: { handles: ["dp-datetime-change"] },
  },
};

export const Default = {
  render: () => html`
    <date-time-input
      .label=${"Start time"}
      .value=${"2024-06-01T12:00"}
    ></date-time-input>
  `,
};

export const WithoutLabel = {
  render: () => html`
    <date-time-input .value=${"2024-06-01T09:30"}></date-time-input>
  `,
};

export const Empty = {
  render: () => html`
    <date-time-input .label=${"End time"}></date-time-input>
  `,
};
