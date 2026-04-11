import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../annotation-chip";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("annotation-chip") as HTMLElement & {
    type: string;
    itemId: string;
    icon: string;
    name: string;
  };
  Object.assign(el, {
    type: "entity",
    itemId: "sensor.temperature",
    icon: "mdi:thermometer",
    name: "Temperature",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("annotation-chip", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN an annotation chip with type, icon and name", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the name text", () => {
        expect.assertions(1);
        const text = el
          .shadowRoot!.querySelector(".context-chip")
          ?.textContent?.trim();
        expect(text).toContain("Temperature");
      });

      it("THEN it shows the icon", () => {
        expect.assertions(1);
        const icons = el.shadowRoot!.querySelectorAll("ha-icon");
        const chipIcon = icons[0];
        expect(chipIcon?.getAttribute("icon")).toBe("mdi:thermometer");
      });

      it("THEN it has a remove button with mdi:close", () => {
        expect.assertions(1);
        const removeBtn = el.shadowRoot!.querySelector(".context-chip-remove");
        const closeIcon = removeBtn?.querySelector("ha-icon");
        expect(closeIcon?.getAttribute("icon")).toBe("mdi:close");
      });

      it("THEN the remove button has an accessible label", () => {
        expect.assertions(1);
        const removeBtn = el.shadowRoot!.querySelector(".context-chip-remove");
        expect(removeBtn?.getAttribute("aria-label")).toBe(
          "Remove Temperature"
        );
      });
    });
  });

  describe("GIVEN an annotation chip", () => {
    beforeEach(async () => {
      el = createElement({
        type: "area",
        itemId: "living_room",
        name: "Living Room",
      });
      await el.updateComplete;
    });

    describe("WHEN the remove button is clicked", () => {
      it("THEN it fires dp-chip-remove with type and itemId", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-chip-remove", handler);
        el.shadowRoot!.querySelector(".context-chip-remove")!.dispatchEvent(
          new Event("click")
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.type).toBe("area");
        expect(handler.mock.calls[0][0].detail.itemId).toBe("living_room");
      });
    });
  });
});
