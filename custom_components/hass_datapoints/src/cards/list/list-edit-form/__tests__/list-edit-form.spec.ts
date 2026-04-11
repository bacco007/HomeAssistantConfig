import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../list-edit-form";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("list-edit-form") as HTMLElement & {
    eventRecord: RecordWithUnknownValues;
    hass: unknown;
    updateComplete: Promise<void>;
  };
  Object.assign(el, {
    hass: createMockHass(),
    eventRecord: {
      id: "evt-1",
      message: "First event",
      annotation: "Detailed note",
      icon: "mdi:bookmark",
      color: "#03a9f4",
    },
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("list-edit-form", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN an event record is provided", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the message input value", () => {
        expect.assertions(1);
        expect(
          (el.shadowRoot!.querySelector(".edit-msg") as HTMLInputElement).value
        ).toBe("First event");
      });
    });
  });

  describe("GIVEN the save button is clicked", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the form emits save", () => {
      it("THEN it includes the edited values", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-save-edit", handler);
        (el.shadowRoot!.querySelector(".edit-msg") as HTMLInputElement).value =
          "Updated";
        (
          el.shadowRoot!.querySelector(".edit-msg") as HTMLInputElement
        ).dispatchEvent(new Event("input"));
        (
          el.shadowRoot!.querySelector("ha-button[raised]") as HTMLElement
        ).click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.message).toBe("Updated");
      });
    });
  });
});
