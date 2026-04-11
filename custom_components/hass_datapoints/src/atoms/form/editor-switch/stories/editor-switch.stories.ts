import { html } from "lit";
import "../editor-switch";

export default {
  title: "Atoms/Form/Editor Switch",
  component: "editor-switch",
  parameters: {
    actions: { handles: ["dp-switch-change"] },
  },
};

export const Default = {
  render: () => html`
    <editor-switch .label=${"Show annotations"}></editor-switch>
  `,
};

export const Checked = {
  render: () => html`
    <editor-switch
      .label=${"Show annotations"}
      .checked=${true}
    ></editor-switch>
  `,
};

export const WithTooltip = {
  render: () => html`
    <editor-switch
      .label=${"Normalise values"}
      .tooltip=${"Scale all series to a 0–100 range for comparison"}
    ></editor-switch>
  `,
};
