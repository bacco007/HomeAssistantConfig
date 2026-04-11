import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../entity-chip";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("entity-chip") as HTMLElement & {
    type: string;
    itemId: string;
    hass: unknown;
    removable: boolean;
  };
  Object.assign(el, {
    type: "entity",
    itemId: "sensor.temperature",
    hass: createMockHass(),
    removable: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("entity-chip", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN an entity chip for a known entity", () => {
    beforeEach(async () => {
      el = createElement({ type: "entity", itemId: "sensor.temperature" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the friendly name", () => {
        expect(el.shadowRoot!.textContent).toContain("Temperature");
      });
    });
  });

  describe("GIVEN an entity chip for an unknown entity", () => {
    beforeEach(async () => {
      el = createElement({ type: "entity", itemId: "sensor.unknown" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it falls back to the entity ID", () => {
        expect(el.shadowRoot!.textContent).toContain("sensor.unknown");
      });
    });
  });

  describe("GIVEN a removable entity chip", () => {
    beforeEach(async () => {
      el = createElement({ removable: true });
      await el.updateComplete;
    });

    describe("WHEN the remove button is clicked", () => {
      it("THEN it fires dp-chip-remove", () => {
        const handler = vi.fn();
        el.addEventListener("dp-chip-remove", handler);
        const btn = el.shadowRoot!.querySelector("[data-action='remove']");
        btn?.dispatchEvent(new Event("click"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.type).toBe("entity");
        expect(handler.mock.calls[0][0].detail.itemId).toBe(
          "sensor.temperature"
        );
      });
    });
  });

  describe("GIVEN a non-removable entity chip", () => {
    beforeEach(async () => {
      el = createElement({ removable: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no remove button is present", () => {
        const btn = el.shadowRoot!.querySelector("[data-action='remove']");
        expect(btn).toBeNull();
      });
    });
  });

  describe("GIVEN a device chip", () => {
    beforeEach(async () => {
      el = createElement({ type: "device", itemId: "device_1" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the device name", () => {
        expect(el.shadowRoot!.textContent).toContain("Living Room Sensor");
      });
    });
  });

  describe("GIVEN an area chip", () => {
    beforeEach(async () => {
      el = createElement({ type: "area", itemId: "area_1" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the area name", () => {
        expect(el.shadowRoot!.textContent).toContain("Living Room");
      });
    });
  });
});
