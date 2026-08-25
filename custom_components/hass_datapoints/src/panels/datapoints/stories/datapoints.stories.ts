import { html } from "lit";
import "../datapoints";
import { setFrontendLocale } from "@/lib/i18n/localize";

export default {
  title: "Panels/Datapoints",
  component: "hass-datapoints-panel",
  loaders: [
    async () => {
      await setFrontendLocale("en");
    },
  ],
};

function makeMockHass() {
  return {
    states: {
      "sensor.temperature": {
        entity_id: "sensor.temperature",
        state: "22.5",
        attributes: { unit_of_measurement: "°C", friendly_name: "Temperature" },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
    },
    entities: {},
    devices: {},
    areas: {},
    floors: {},
    connection: {
      subscribeEvents: () => Promise.resolve(() => undefined),
      sendMessagePromise: () => Promise.resolve({}),
    },
    callWS: () => Promise.resolve({}),
    callService: () => Promise.resolve({}),
    user: { id: "user1", name: "Test User", is_admin: true },
    language: "en",
    locale: { language: "en" },
    config: { version: "2025.1.0", latitude: 0, longitude: 0 },
    themes: { default_theme: "default", themes: {} },
    selectedTheme: null,
  };
}

export const Default = {
  render: () => html`
    <div style="width:1200px;height:800px;">
      <hass-datapoints-panel
        .hass=${makeMockHass()}
        .narrow=${false}
        .panel=${{ config: {} }}
      ></hass-datapoints-panel>
    </div>
  `,
};
