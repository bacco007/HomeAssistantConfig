import { html } from "lit";
import { expect } from "@storybook/test";
import "../feedback-banner";

export default {
  title: "Atoms/Display/Feedback Banner",
  component: "feedback-banner",
};

export const Success = {
  render: () => html`
    <feedback-banner
      .kind=${"ok"}
      .text=${"Saved"}
      .visible=${true}
    ></feedback-banner>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("feedback-banner") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.textContent).toContain("Saved");
  },
};

export const Error = {
  render: () => html`
    <feedback-banner
      .kind=${"err"}
      .text=${"Error: failed"}
      .visible=${true}
    ></feedback-banner>
  `,
};
