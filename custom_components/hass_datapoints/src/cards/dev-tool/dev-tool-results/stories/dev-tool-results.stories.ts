import { html } from "lit";
import { expect } from "@storybook/test";
import "../dev-tool-results";

const sampleResults = [
  {
    id: 1,
    label: "Window 1",
    startDt: "",
    endDt: "",
    selected: [0, 1],
    changes: [
      {
        timestamp: "2026-03-31T10:00:00.000Z",
        message: "Bedroom radiator turned on",
        entity_id: "switch.bedroom_radiator",
        icon: "mdi:radiator",
        color: "#ff9800",
      },
      {
        timestamp: "2026-03-31T10:15:00.000Z",
        message: "Bedroom window opened",
        entity_id: "binary_sensor.bedroom_window",
        icon: "mdi:window-open",
        color: "#4caf50",
      },
    ],
  },
];

export default {
  title: "Cards/Dev Tool/Results",
  component: "dev-tool-results",
  parameters: {
    actions: {
      handles: ["dp-record-selected-request", "dp-results-selection-change"],
    },
  },
};

export const Default = {
  render: () =>
    html`<dev-tool-results
      .results=${sampleResults}
      .isAdmin=${true}
    ></dev-tool-results>`,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector(
      "dev-tool-results"
    ) as HTMLElement & { shadowRoot: ShadowRoot };
    expect(el.shadowRoot.querySelector("#record-btn")).toBeTruthy();
  },
};
