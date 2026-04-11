import { html } from "lit";
import { expect } from "@storybook/test";
import "../event-list-item";

export default {
  title: "Molecules/Event List Item",
  component: "event-list-item",
};

const sampleEvent = {
  id: "evt-001",
  message: "Turned on lights",
  annotation: "Manual override due to guests arriving",
  icon: "mdi:lightbulb",
  color: "#ff9800",
  timestamp: "2026-03-31T08:15:00Z",
};

export const Editable = {
  render: () => html`
    <event-list-item .event=${sampleEvent} .editable=${true}></event-list-item>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("event-list-item") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.textContent).toContain("Turned on lights");
    expect(el.shadowRoot.querySelector("[data-action='delete']")).toBeTruthy();
  },
};

export const ReadOnly = {
  render: () => html`
    <event-list-item .event=${sampleEvent} .editable=${false}></event-list-item>
  `,
};

export const NoAnnotation = {
  render: () => html`
    <event-list-item
      .event=${{ ...sampleEvent, annotation: null }}
      .editable=${true}
    ></event-list-item>
  `,
};
