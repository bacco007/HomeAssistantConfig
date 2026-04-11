import { html } from "lit";
import { expect } from "@storybook/test";
import "../quick-annotation";

export default {
  title: "Cards/Quick/Annotation",
  component: "quick-annotation",
  parameters: {
    actions: {
      handles: ["dp-annotation-input"],
    },
  },
};

export const Default = {
  render: () => html`
    <quick-annotation .value=${"Detailed note"}></quick-annotation>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector(
      "quick-annotation"
    ) as HTMLElement & { shadowRoot: ShadowRoot };
    expect(
      (el.shadowRoot.querySelector("textarea") as HTMLTextAreaElement).value
    ).toBe("Detailed note");
  },
};
