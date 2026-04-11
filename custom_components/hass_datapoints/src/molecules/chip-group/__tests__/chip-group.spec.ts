import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../chip-group";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("chip-group") as HTMLElement & {
    items: Array<{ type: string; id: string }>;
    hass: unknown;
    removable: boolean;
  };
  Object.assign(el, {
    items: [
      { type: "entity", id: "sensor.temperature" },
      { type: "device", id: "device_1" },
    ],
    hass: createMockHass(),
    removable: true,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("chip-group", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a chip group with two items", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders two entity-chip elements", () => {
        const chips = el.shadowRoot!.querySelectorAll("entity-chip");
        expect(chips.length).toBe(2);
      });
    });
  });

  describe("GIVEN a chip group with removable chips", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN a chip fires dp-chip-remove", () => {
      it("THEN it re-dispatches dp-chips-change with the item removed", () => {
        const handler = vi.fn();
        el.addEventListener("dp-chips-change", handler);
        const chip = el.shadowRoot!.querySelector("entity-chip")!;
        chip.dispatchEvent(
          new CustomEvent("dp-chip-remove", {
            detail: { type: "entity", itemId: "sensor.temperature" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.items).toEqual([
          { type: "device", id: "device_1" },
        ]);
      });
    });
  });

  describe("GIVEN an empty chip group", () => {
    beforeEach(async () => {
      el = createElement({ items: [] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no chips are shown", () => {
        const chips = el.shadowRoot!.querySelectorAll("entity-chip");
        expect(chips.length).toBe(0);
      });
    });
  });
});
