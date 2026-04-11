import { html } from "lit";
import "../section-heading";

export default {
  title: "Atoms/Display/Section Heading",
  component: "section-heading",
  argTypes: {
    text: { control: "text" },
  },
};

export const Default = {
  render: () =>
    html`<section-heading .text=${"General Settings"}></section-heading>`,
};

export const EntitySection = {
  render: () => html`<section-heading .text=${"Entities"}></section-heading>`,
};
