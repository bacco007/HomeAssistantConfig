import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect } from "@storybook/test";
import { html } from "lit";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsDevToolCard } from "../dev-tool";

if (!customElements.get("hass-datapoints-dev-tool-card")) {
  customElements.define(
    "hass-datapoints-dev-tool-card",
    HassRecordsDevToolCard
  );
}

type Story = StoryObj;

const meta: Meta = {
  title: "Cards/Dev Tool Card",
  component: "hass-datapoints-dev-tool-card",
};

export default meta;

function getCard(canvasElement: HTMLElement): HassRecordsDevToolCard {
  return canvasElement.querySelector(
    "hass-datapoints-dev-tool-card"
  ) as HassRecordsDevToolCard;
}

function makeMockHass() {
  return createMockHass({
    states: {
      "sensor.temperature": {
        state: "21.5",
        attributes: {
          friendly_name: "Temperature",
          unit_of_measurement: "°C",
        },
      },
      "binary_sensor.window": {
        state: "off",
        attributes: {
          friendly_name: "Window",
          device_class: "window",
        },
      },
    },
    connection: {
      subscribeEvents: () => Promise.resolve(() => {}),
      sendMessagePromise: (msg: { type: string }) => {
        if (msg.type === "hass_datapoints/events") {
          return Promise.resolve({
            events: [
              { id: "1", dev: true },
              { id: "2", dev: true },
            ],
          });
        }
        if (msg.type === "history/history_during_period") {
          return Promise.resolve({
            "binary_sensor.window": [
              { s: "off", lc: 1_743_408_000 },
              { s: "on", lc: 1_743_411_600 },
            ],
          });
        }
        return Promise.resolve({});
      },
    },
  });
}

export const Default: Story = {
  render: () =>
    html`<hass-datapoints-dev-tool-card></hass-datapoints-dev-tool-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement);
    card.setConfig({ title: "Dev Tool" });
    card.hass = makeMockHass() as never;
    expect(
      card.shadowRoot?.querySelector("ha-selector#entity-picker")
    ).toBeTruthy();
    expect(card.shadowRoot?.querySelector("dev-tool-windows")).toBeTruthy();
  },
};

export const WithResults: Story = {
  render: () =>
    html`<hass-datapoints-dev-tool-card></hass-datapoints-dev-tool-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsDevToolCard & {
      _entities: string[];
      _analyzeHistory: () => Promise<void>;
    };
    card.setConfig({ title: "Dev Tool" });
    card.hass = makeMockHass() as never;
    card._entities = ["binary_sensor.window"];
    await card._analyzeHistory();
    expect(card.shadowRoot?.querySelector("dev-tool-results")).toBeTruthy();
  },
};
