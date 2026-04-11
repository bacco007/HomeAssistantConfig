import { html } from "lit";
import "../visibility-toggle";

export default {
  title: "Atoms/Interactive/Visibility Toggle",
  component: "visibility-toggle",
};

export const Visible = {
  render: () => html`
    <visibility-toggle
      .pressed=${true}
      .label=${"Events"}
      .icon=${"mdi:eye"}
    ></visibility-toggle>
  `,
};

export const Hidden = {
  render: () => html`
    <visibility-toggle
      .pressed=${false}
      .label=${"Events"}
      .icon=${"mdi:eye-off"}
    ></visibility-toggle>
  `,
};
