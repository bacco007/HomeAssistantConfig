import { html } from "lit";
import "../editor-select";

export default {
  title: "Atoms/Form/Editor Select",
  component: "editor-select",
  parameters: {
    actions: { handles: ["dp-select-change"] },
  },
};

const PERIOD_OPTIONS = [
  { value: "5m", label: "5 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
];

export const Default = {
  render: () => html`
    <editor-select
      .label=${"Period"}
      .options=${PERIOD_OPTIONS}
    ></editor-select>
  `,
};

export const WithValue = {
  render: () => html`
    <editor-select
      .label=${"Period"}
      .value=${"1h"}
      .options=${PERIOD_OPTIONS}
    ></editor-select>
  `,
};

export const Empty = {
  render: () => html`
    <editor-select .label=${"Category"} .options=${[]}></editor-select>
  `,
};
