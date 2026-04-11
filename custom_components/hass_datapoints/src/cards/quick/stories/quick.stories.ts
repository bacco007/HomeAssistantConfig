import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect } from "@storybook/test";
import { html } from "lit";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsQuickCard } from "../quick";

if (!customElements.get("hass-datapoints-quick-card")) {
  customElements.define("hass-datapoints-quick-card", HassRecordsQuickCard);
}

type Story = StoryObj;

const meta: Meta = {
  title: "Cards/Quick Card",
  component: "hass-datapoints-quick-card",
};

export default meta;

function getCard(canvasElement: HTMLElement): HassRecordsQuickCard {
  return canvasElement.querySelector(
    "hass-datapoints-quick-card"
  ) as HassRecordsQuickCard;
}

const mockHass = createMockHass();

export const Default: Story = {
  render: () => html`<hass-datapoints-quick-card></hass-datapoints-quick-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsQuickCard & {
      updateComplete: Promise<void>;
    };
    card.setConfig({ title: "Quick Record" });
    card.hass = mockHass as never;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("ha-textfield#msg")).toBeTruthy();
    expect(card.shadowRoot?.textContent).toContain("Quick Record");
  },
};

export const WithAnnotation: Story = {
  render: () => html`<hass-datapoints-quick-card></hass-datapoints-quick-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsQuickCard & {
      updateComplete: Promise<void>;
    };
    card.setConfig({ title: "Quick Record", show_annotation: true });
    card.hass = mockHass as never;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("quick-annotation")).toBeTruthy();
  },
};
