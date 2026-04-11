import { html } from "lit";
import { expect } from "@storybook/test";
import { createMockHass } from "@/test-support/mock-hass";
import "../list-event-item";

const baseEvent = {
  id: "evt-1",
  message: "First event",
  annotation: "Detailed note",
  icon: "mdi:bookmark",
  color: "#03a9f4",
  timestamp: "2026-03-31T10:00:00Z",
  entity_ids: ["sensor.temperature"],
};

const baseContext = {
  hass: createMockHass(),
  showActions: true,
  canEdit: true,
  showEntities: true,
  showFullMessage: false,
  hidden: false,
  editing: false,
  editColor: "#03a9f4",
  language: {
    showAnnotation: "Show annotation",
    openHistory: "Open related data point history",
    editRecord: "Edit record",
    deleteRecord: "Delete record",
    showChartMarker: "Show chart marker",
    hideChartMarker: "Hide chart marker",
    chooseColor: "Choose colour",
    save: "Save",
    cancel: "Cancel",
    message: "Message",
    annotationFullMessage: "Annotation / full message",
  },
};

export default {
  title: "Cards/List/Event Item",
  component: "list-event-item",
  parameters: {
    actions: {
      handles: [
        "dp-open-history",
        "dp-edit-event",
        "dp-delete-event",
        "dp-toggle-visibility",
        "dp-more-info",
        "dp-save-edit",
        "dp-cancel-edit",
      ],
    },
  },
};

export const Default = {
  render: () =>
    html`<list-event-item
      .eventRecord=${baseEvent}
      .context=${baseContext}
    ></list-event-item>`,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("list-event-item") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.textContent).toContain("First event");
  },
};

export const Editing = {
  render: () => html`
    <list-event-item
      .eventRecord=${baseEvent}
      .context=${{ ...baseContext, editing: true }}
    ></list-event-item>
  `,
};

export const Hidden = {
  render: () => html`
    <list-event-item
      .eventRecord=${baseEvent}
      .context=${{ ...baseContext, hidden: true }}
    ></list-event-item>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("list-event-item") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(
      el.shadowRoot
        .querySelector(".event-item")
        ?.classList.contains("is-hidden")
    ).toBe(true);
    expect(
      el.shadowRoot.querySelector('ha-icon-button[label="Show chart marker"]')
    ).toBeTruthy();
  },
};
