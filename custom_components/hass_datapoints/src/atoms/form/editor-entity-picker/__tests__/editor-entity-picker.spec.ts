import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../editor-entity-picker";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("editor-entity-picker") as HTMLElement & {
    label: string;
    value: string;
    hass: unknown;
  };
  Object.assign(el, {
    label: "Entity",
    value: "",
    hass: createMockHass(),
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("editor-entity-picker", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN an entity picker with a label", () => {
    beforeEach(async () => {
      el = createElement({ label: "Target Entity" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it creates an ha-selector element", () => {
        expect(el.shadowRoot!.querySelector("ha-selector")).toBeTruthy();
      });
    });
  });

  describe("GIVEN an entity picker", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN value-changed fires", () => {
      it("THEN it dispatches dp-entity-change", () => {
        const handler = vi.fn();
        el.addEventListener("dp-entity-change", handler);
        const selector = el.shadowRoot!.querySelector("ha-selector")!;
        selector.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: "sensor.humidity" },
            bubbles: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("sensor.humidity");
      });
    });
  });
});
