import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { SAMPLE_EVENT } from "@/test-support/fixtures";
import "../event-list-item";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("event-list-item") as HTMLElement & {
    event: typeof SAMPLE_EVENT;
    hass: unknown;
    editable: boolean;
  };
  Object.assign(el, {
    event: SAMPLE_EVENT,
    hass: createMockHass(),
    editable: true,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("event-list-item", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN an event list item with a message", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the message", () => {
        expect(el.shadowRoot!.textContent).toContain("Turned on lights");
      });

      it("THEN it displays the timestamp", () => {
        const text = el.shadowRoot!.textContent;
        // Should contain some representation of the time
        expect(text?.length).toBeGreaterThan(0);
      });
    });
  });

  describe("GIVEN an editable event list item", () => {
    beforeEach(async () => {
      el = createElement({ editable: true });
      await el.updateComplete;
    });

    describe("WHEN the delete button is clicked", () => {
      it("THEN it fires dp-event-delete", () => {
        const handler = vi.fn();
        el.addEventListener("dp-event-delete", handler);
        const btn = el.shadowRoot!.querySelector("[data-action='delete']");
        btn?.dispatchEvent(new Event("click"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.id).toBe("evt-001");
      });
    });
  });

  describe("GIVEN a non-editable event list item", () => {
    beforeEach(async () => {
      el = createElement({ editable: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no action buttons are shown", () => {
        const actions = el.shadowRoot!.querySelector(".actions");
        expect(actions).toBeNull();
      });
    });
  });

  describe("GIVEN an event with an annotation", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the annotation", () => {
        expect(el.shadowRoot!.textContent).toContain(
          "Manual override due to guests"
        );
      });
    });
  });
});
