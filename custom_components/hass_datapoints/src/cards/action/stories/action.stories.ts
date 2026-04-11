import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect } from "@storybook/test";
import { html } from "lit";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsActionCard } from "../action";

if (!customElements.get("hass-datapoints-action-card")) {
  customElements.define("hass-datapoints-action-card", HassRecordsActionCard);
}

type Story = StoryObj;

const meta: Meta = {
  title: "Cards/Action Card",
  component: "hass-datapoints-action-card",
};

export default meta;

function getCard(canvasElement: HTMLElement): HassRecordsActionCard {
  return canvasElement.querySelector(
    "hass-datapoints-action-card"
  ) as HassRecordsActionCard;
}

const mockHass = createMockHass();

export const Default: Story = {
  render: () =>
    html`<hass-datapoints-action-card></hass-datapoints-action-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsActionCard & {
      updateComplete: Promise<void>;
    };
    card.setConfig({ title: "Record Event" });
    card.hass = mockHass as never;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("ha-textfield#msg")).toBeTruthy();
    expect(card.shadowRoot?.textContent).toContain("Record Event");
  },
};

export const WithTargetsAndAnnotation: Story = {
  render: () =>
    html`<hass-datapoints-action-card></hass-datapoints-action-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsActionCard & {
      updateComplete: Promise<void>;
    };
    card.setConfig({
      title: "Bedroom Note",
      show_annotation: true,
      entity: "sensor.temperature",
      show_target_picker: true,
    });
    card.hass = mockHass as never;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("action-targets")).toBeTruthy();
    expect(card.shadowRoot?.querySelector("textarea#ann")).toBeTruthy();
  },
};
