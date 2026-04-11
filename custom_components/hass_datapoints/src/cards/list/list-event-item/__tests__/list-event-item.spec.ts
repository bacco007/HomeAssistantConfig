import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../list-event-item";

const BASE_CONTEXT = {
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

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("list-event-item") as HTMLElement & {
    eventRecord: RecordWithUnknownValues;
    context: RecordWithUnknownValues;
    updateComplete: Promise<void>;
  };
  Object.assign(el, {
    eventRecord: {
      id: "evt-1",
      message: "First event",
      annotation: "Detailed note",
      icon: "mdi:bookmark",
      color: "#03a9f4",
      timestamp: "2026-03-31T10:00:00Z",
      entity_ids: ["sensor.temperature"],
    },
    context: BASE_CONTEXT,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("list-event-item", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN an event with related entities", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the event message", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.textContent).toContain("First event");
      });

      it("THEN entity chips render the linked entity state icon", () => {
        expect.assertions(2);
        const entityChip = el.shadowRoot!.querySelector(
          ".ev-entity-chip"
        ) as HTMLElement;
        const stateIcon = entityChip.querySelector(
          "ha-state-icon"
        ) as HTMLElement & {
          stateObj?: Nullable<RecordWithUnknownValues>;
        };
        expect(stateIcon).not.toBeNull();
        expect(
          (stateIcon.stateObj?.attributes as RecordWithUnknownValues)?.icon
        ).toBe("mdi:thermometer");
      });

      it("THEN entity chips show the friendly name and entity id", () => {
        expect.assertions(2);
        const entityChip = el.shadowRoot!.querySelector(
          ".ev-entity-chip"
        ) as HTMLElement;
        expect(
          entityChip
            .querySelector(".ev-entity-chip-primary")
            ?.textContent?.trim()
        ).toBe("Temperature");
        expect(
          entityChip
            .querySelector(".ev-entity-chip-secondary")
            ?.textContent?.trim()
        ).toBe("sensor.temperature");
      });

      it("THEN the main icon area does not contain a visibility button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".ev-icon-wrap .ev-visibility-btn")
        ).toBeNull();
      });
    });
  });

  describe("GIVEN the edit action is clicked", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the button emits", () => {
      it("THEN it dispatches the edit event detail", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-edit-event", handler);
        (
          el.shadowRoot!.querySelector(
            'ha-icon-button[label="Edit record"]'
          ) as HTMLElement
        ).click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.eventRecord.id).toBe("evt-1");
      });
    });
  });

  describe("GIVEN a visible event row", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the visibility action is clicked", () => {
      it("THEN it dispatches dp-toggle-visibility with the event id", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-toggle-visibility", handler);
        (
          el.shadowRoot!.querySelector(
            'ha-icon-button[label="Hide chart marker"]'
          ) as HTMLElement
        ).click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.eventId).toBe("evt-1");
      });
    });

    describe("WHEN the row is hovered", () => {
      it("THEN it dispatches the hover event with hovered: true", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-hover-event-record", handler);
        (
          el.shadowRoot!.querySelector(".event-item") as HTMLElement
        ).dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.eventId).toBe("evt-1");
        expect(handler.mock.calls[0][0].detail.hovered).toBe(true);
      });
    });

    describe("WHEN the row hover ends", () => {
      it("THEN it dispatches the hover event with hovered: false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-hover-event-record", handler);
        (
          el.shadowRoot!.querySelector(".event-item") as HTMLElement
        ).dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.eventId).toBe("evt-1");
        expect(handler.mock.calls[0][0].detail.hovered).toBe(false);
      });
    });
  });

  describe("GIVEN a non-admin user (canEdit: false)", () => {
    beforeEach(async () => {
      el = createElement({
        context: { ...BASE_CONTEXT, canEdit: false },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the edit button is not shown", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector('ha-icon-button[label="Edit record"]')
        ).toBeNull();
      });

      it("THEN the delete button is not shown", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector('ha-icon-button[label="Delete record"]')
        ).toBeNull();
      });

      it("THEN the visibility toggle is still shown", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(
            'ha-icon-button[label="Hide chart marker"]'
          )
        ).not.toBeNull();
      });
    });
  });

  describe("GIVEN a hidden event row", () => {
    beforeEach(async () => {
      el = createElement({
        context: {
          ...BASE_CONTEXT,
          hass: createMockHass(),
          hidden: true,
        },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it applies the hidden row styling class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".event-item")
            ?.classList.contains("is-hidden")
        ).toBe(true);
      });

      it("THEN it shows the show-chart-marker action", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(
            'ha-icon-button[label="Show chart marker"]'
          )
        ).not.toBeNull();
      });
    });

    describe("WHEN the show action is clicked", () => {
      it("THEN it dispatches dp-toggle-visibility with the event id", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-toggle-visibility", handler);
        (
          el.shadowRoot!.querySelector(
            'ha-icon-button[label="Show chart marker"]'
          ) as HTMLElement
        ).click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.eventId).toBe("evt-1");
      });
    });
  });
});
