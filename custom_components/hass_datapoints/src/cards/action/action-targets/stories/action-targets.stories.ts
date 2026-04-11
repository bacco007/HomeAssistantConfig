import { html } from "lit";
import { expect } from "@storybook/test";
import { createMockHass } from "@/test-support/mock-hass";
import "../action-targets";

const mockHass = createMockHass();
const sampleChips = [
  { type: "entity", id: "sensor.temperature" },
  { type: "area", id: "bedroom" },
];

export default {
  title: "Cards/Action/Targets",
  component: "action-targets",
  parameters: {
    actions: {
      handles: ["dp-target-change"],
    },
  },
};

export const Default = {
  render: () => html`
    <action-targets
      .hass=${mockHass}
      .showConfigTargets=${true}
      .showTargetPicker=${true}
      .configChips=${sampleChips}
    ></action-targets>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("action-targets") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.querySelector("chip-group")).toBeTruthy();
    expect(el.shadowRoot.querySelector("ha-selector")).toBeTruthy();
  },
};

export const ConfigTargetsOnly = {
  render: () => html`
    <action-targets
      .hass=${mockHass}
      .showConfigTargets=${true}
      .showTargetPicker=${false}
      .configChips=${sampleChips}
    ></action-targets>
  `,
};

export const TargetPickerOnly = {
  render: () => html`
    <action-targets
      .hass=${mockHass}
      .showConfigTargets=${false}
      .showTargetPicker=${true}
      .configChips=${sampleChips}
    ></action-targets>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("action-targets") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.querySelector("chip-group")).toBeNull();
    expect(el.shadowRoot.querySelector("ha-selector")).toBeTruthy();
  },
};
