import { html } from "lit";
import { expect } from "@storybook/test";
import { createMockHass } from "@/test-support/mock-hass";
import "../history-targets";

const mockHass = createMockHass();

const SAMPLE_ROWS = [
  {
    entity_id: "sensor.temperature",
    color: "#e53935",
    visible: true,
    analysis: {},
  },
  {
    entity_id: "sensor.humidity",
    color: "#1e88e5",
    visible: true,
    analysis: {},
  },
];

const HIDDEN_ROW_SAMPLE = [
  {
    entity_id: "sensor.temperature",
    color: "#e53935",
    visible: true,
    analysis: {},
  },
  {
    entity_id: "sensor.humidity",
    color: "#1e88e5",
    visible: false,
    analysis: {},
  },
];

/**
 * `history-targets` renders the sidebar targets section of the Datapoints panel.
 * Shows the entity target list, entity picker slot, and collapsed sidebar icon summary.
 */
export default {
  title: "Panels/Datapoints/History Targets",
  component: "history-targets",
  parameters: {
    actions: {
      handles: [
        "dp-row-color-change",
        "dp-row-visibility-change",
        "dp-row-remove",
        "dp-row-toggle-analysis",
        "dp-row-analysis-change",
        "dp-rows-reorder",
        "dp-targets-add-click",
        "dp-targets-prefs-click",
        "dp-collapsed-entity-click",
      ],
    },
  },
  argTypes: {
    sidebarCollapsed: {
      control: "boolean",
      description:
        "When true, show collapsed icon summary instead of full list.",
    },
    canShowDeltaAnalysis: {
      control: "boolean",
      description:
        "Whether delta analysis option is available in row analysis panels.",
    },
  },
  args: {
    sidebarCollapsed: false,
    canShowDeltaAnalysis: false,
  },
  render: (args: RecordWithUnknownValues) => html`
    <history-targets
      .rows=${SAMPLE_ROWS}
      .states=${mockHass.states}
      .hass=${mockHass}
      .comparisonWindows=${[]}
      .canShowDeltaAnalysis=${args.canShowDeltaAnalysis}
      .sidebarCollapsed=${args.sidebarCollapsed}
      style="display: block; width: 340px; padding: 16px; background: var(--card-background-color, #fff);"
    ></history-targets>
  `,
};

/** Default expanded sidebar with two target rows. */
export const Default = {};

/** No rows added yet — empty state. */
export const Empty = {
  render: () => html`
    <history-targets
      .rows=${[]}
      .states=${mockHass.states}
      .hass=${mockHass}
      .comparisonWindows=${[]}
      style="display: block; width: 340px; padding: 16px; background: var(--card-background-color, #fff);"
    ></history-targets>
  `,
};

/** Collapsed sidebar mode — shows icon summary instead of full list. */
export const Collapsed = {
  args: {
    sidebarCollapsed: true,
  },
  render: () => html`
    <history-targets
      .rows=${SAMPLE_ROWS}
      .states=${mockHass.states}
      .hass=${mockHass}
      .comparisonWindows=${[]}
      .sidebarCollapsed=${true}
      style="display: block; width: 52px; padding: 0; background: var(--card-background-color, #fff);"
    ></history-targets>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("history-targets") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };

    expect(
      el.shadowRoot.querySelectorAll(".history-targets-collapsed-item").length
    ).toBe(2);
    expect(
      el.shadowRoot.querySelector(".history-targets-collapsed-add")
    ).not.toBeNull();
    expect(
      el.shadowRoot.querySelector(".history-targets-collapsed-preferences")
    ).not.toBeNull();
  },
};

/** Collapsed mode with a hidden series — the hidden icon shows at reduced opacity. */
export const CollapsedWithHiddenRow = {
  render: () => html`
    <history-targets
      .rows=${HIDDEN_ROW_SAMPLE}
      .states=${mockHass.states}
      .hass=${mockHass}
      .comparisonWindows=${[]}
      .sidebarCollapsed=${true}
      style="display: block; width: 52px; padding: 0; background: var(--card-background-color, #fff);"
    ></history-targets>
  `,
};

export const CollapsedEmpty = {
  render: () => html`
    <history-targets
      .rows=${[]}
      .states=${mockHass.states}
      .hass=${mockHass}
      .comparisonWindows=${[]}
      .sidebarCollapsed=${true}
      style="display: block; width: 52px; padding: 0; background: var(--card-background-color, #fff);"
    ></history-targets>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("history-targets") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };

    expect(
      el.shadowRoot.querySelectorAll(".history-targets-collapsed-item").length
    ).toBe(0);
    expect(
      el.shadowRoot.querySelector(".history-targets-collapsed-add")
    ).not.toBeNull();
    expect(
      el.shadowRoot.querySelector(".history-targets-collapsed-preferences")
    ).not.toBeNull();
  },
};
