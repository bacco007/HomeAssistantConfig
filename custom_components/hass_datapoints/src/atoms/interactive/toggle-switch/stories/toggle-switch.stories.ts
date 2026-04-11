import { html } from "lit";
import "../toggle-switch";

export default {
  title: "Atoms/Interactive/Toggle Switch",
  component: "toggle-switch",
};

export const Unchecked = {
  render: () => html`
    <toggle-switch .checked=${false} .label=${"Show targets"}></toggle-switch>
  `,
};

export const Checked = {
  render: () => html`
    <toggle-switch .checked=${true} .label=${"Show targets"}></toggle-switch>
  `,
};

export const WithEntityId = {
  render: () => html`
    <toggle-switch
      .checked=${true}
      .label=${"Temperature"}
      .entityId=${"sensor.temperature"}
    ></toggle-switch>
  `,
};
