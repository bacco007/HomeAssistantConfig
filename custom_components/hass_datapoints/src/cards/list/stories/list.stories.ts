import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { expect } from "@storybook/test";
import { html } from "lit";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsListCard } from "../list";

if (!customElements.get("hass-datapoints-list-card")) {
  customElements.define("hass-datapoints-list-card", HassRecordsListCard);
}

type Story = StoryObj;

const meta: Meta = {
  title: "Cards/List Card",
  component: "hass-datapoints-list-card",
};

export default meta;

function getCard(canvasElement: HTMLElement): HassRecordsListCard {
  return canvasElement.querySelector(
    "hass-datapoints-list-card"
  ) as HassRecordsListCard;
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
    },
    connection: {
      subscribeEvents: () => Promise.resolve(() => {}),
      sendMessagePromise: (msg: { type: string }) => {
        if (msg.type === "hass_datapoints/events") {
          return Promise.resolve({
            events: [
              {
                id: "evt-1",
                message: "Window opened",
                annotation: "Opened while heating was on",
                icon: "mdi:window-open",
                color: "#2196f3",
                timestamp: "2026-03-31T10:00:00Z",
                entity_id: null,
                entity_ids: ["sensor.temperature"],
                device_id: null,
                area_id: null,
                label_id: null,
                dev: false,
              },
              {
                id: "evt-2",
                message: "Heating started",
                annotation: null,
                icon: "mdi:radiator",
                color: "#ff9800",
                timestamp: "2026-03-31T09:00:00Z",
                entity_id: null,
                entity_ids: ["sensor.temperature"],
                device_id: null,
                area_id: null,
                label_id: null,
                dev: false,
              },
            ],
          });
        }
        return Promise.resolve({});
      },
    },
  });
}

export const Default: Story = {
  render: () => html`<hass-datapoints-list-card></hass-datapoints-list-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsListCard & {
      updateComplete: Promise<void>;
      _load: () => Promise<void>;
    };
    card.setConfig({ title: "Recent Datapoints" });
    card.hass = makeMockHass() as never;
    await card._load();
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("search-bar")).toBeTruthy();
    expect(card.shadowRoot?.querySelectorAll("list-event-item").length).toBe(2);
  },
};

export const WithoutSearch: Story = {
  render: () => html`<hass-datapoints-list-card></hass-datapoints-list-card>`,
  play: async ({ canvasElement }) => {
    const card = getCard(canvasElement) as HassRecordsListCard & {
      updateComplete: Promise<void>;
      _load: () => Promise<void>;
    };
    card.setConfig({ title: "Recent Datapoints", show_search: false });
    card.hass = makeMockHass() as never;
    await card._load();
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("search-bar")).toBeNull();
    expect(card.shadowRoot?.textContent).toContain("Recent Datapoints");
  },
};
