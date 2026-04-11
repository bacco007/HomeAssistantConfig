import { html } from "lit";
import { expect } from "@storybook/test";
import { createMockHass } from "@/test-support/mock-hass";
import "../list-edit-form";

export default {
  title: "Cards/List/Edit Form",
  component: "list-edit-form",
  parameters: {
    actions: {
      handles: ["dp-save-edit", "dp-cancel-edit"],
    },
  },
};

export const Default = {
  render: () => html`
    <list-edit-form
      .hass=${createMockHass()}
      .eventRecord=${{
        id: "evt-1",
        message: "First event",
        annotation: "Detailed note",
        icon: "mdi:bookmark",
        color: "#03a9f4",
      }}
    ></list-edit-form>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("list-edit-form") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(
      (el.shadowRoot.querySelector(".edit-msg") as HTMLInputElement).value
    ).toBe("First event");
  },
};
