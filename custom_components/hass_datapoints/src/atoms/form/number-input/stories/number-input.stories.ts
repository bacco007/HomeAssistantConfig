import { html } from "lit";
import "../number-input";

export default {
  title: "Atoms/Form/Number Input",
  component: "number-input",
};

export const Default = {
  render: () => html`
    <number-input .value=${"10"} .placeholder=${"Enter value"}></number-input>
  `,
};

export const WithSuffix = {
  render: () => html`
    <number-input .value=${"75"} .suffix=${"%"}></number-input>
  `,
};

export const WithStep = {
  render: () => html`
    <number-input
      .value=${"1.5"}
      .step=${"0.1"}
      .suffix=${"units"}
    ></number-input>
  `,
};

export const Empty = {
  render: () => html`
    <number-input .placeholder=${"Threshold..."}></number-input>
  `,
};
