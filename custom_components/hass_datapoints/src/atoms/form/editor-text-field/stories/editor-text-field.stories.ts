import { html } from "lit";
import "../editor-text-field";

export default {
  title: "Atoms/Form/Editor Text Field",
  component: "editor-text-field",
  parameters: {
    actions: { handles: ["dp-field-change"] },
  },
};

export const Default = {
  render: () => html`
    <editor-text-field .label=${"Title"}></editor-text-field>
  `,
};

export const WithValue = {
  render: () => html`
    <editor-text-field
      .label=${"Title"}
      .value=${"My data points card"}
    ></editor-text-field>
  `,
};

export const WithPlaceholder = {
  render: () => html`
    <editor-text-field
      .label=${"Description"}
      .placeholder=${"Enter a description…"}
    ></editor-text-field>
  `,
};

export const WithSuffix = {
  render: () => html`
    <editor-text-field
      .label=${"Threshold"}
      .value=${"25"}
      .suffix=${"°C"}
    ></editor-text-field>
  `,
};

export const NumberType = {
  render: () => html`
    <editor-text-field
      .label=${"Hours"}
      .type=${"number"}
      .value=${"24"}
    ></editor-text-field>
  `,
};
