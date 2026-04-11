import { html } from "lit";
import { expect } from "@storybook/test";
import "../color-swatch";

export default {
  title: "Atoms/Display/Color Swatch",
  component: "color-swatch",
  argTypes: {
    color: { control: "color" },
    label: { control: "text" },
  },
};

export const Default = {
  render: () =>
    html`<color-swatch
      .color=${"#ff9800"}
      .label=${"Event Color"}
    ></color-swatch>`,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("color-swatch") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.textContent).toContain("Event Color");
  },
};

export const NoLabel = {
  render: () => html`<color-swatch .color=${"#4caf50"}></color-swatch>`,
};

export const Blue = {
  render: () =>
    html`<color-swatch
      .color=${"#2196f3"}
      .label=${"Series Color"}
    ></color-swatch>`,
};
