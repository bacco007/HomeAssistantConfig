import { html } from "lit";
import "../legend-item";

export default {
  title: "Atoms/Interactive/Legend Item",
  component: "legend-item",
};

export const Visible = {
  render: () => html`
    <legend-item
      .label=${"Temperature"}
      .color=${"#2196f3"}
      .unit=${"°C"}
      .pressed=${true}
    ></legend-item>
  `,
};

export const Hidden = {
  render: () => html`
    <legend-item
      .label=${"Humidity"}
      .color=${"#4caf50"}
      .unit=${"%"}
      .pressed=${false}
    ></legend-item>
  `,
};

export const NoUnit = {
  render: () => html`
    <legend-item
      .label=${"Motion"}
      .color=${"#ff9800"}
      .pressed=${true}
    ></legend-item>
  `,
};

export const LowOpacity = {
  render: () => html`
    <legend-item
      .label=${"Binary State"}
      .color=${"#e91e63"}
      .pressed=${true}
      .opacity=${0.35}
    ></legend-item>
  `,
};
