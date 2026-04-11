import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../action-targets";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("action-targets") as HTMLElement & {
    hass: unknown;
    showConfigTargets: boolean;
    showTargetPicker: boolean;
    configChips: Array<{ type: string; id: string }>;
    updateComplete: Promise<void>;
  };
  Object.assign(el, {
    hass: createMockHass(),
    showConfigTargets: true,
    showTargetPicker: true,
    configChips: [{ type: "entity", id: "sensor.temperature" }],
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("action-targets", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN config chips and the target picker are enabled", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the chip group and selector", () => {
        expect.assertions(2);
        expect(el.shadowRoot!.querySelector("chip-group")).toBeTruthy();
        expect(el.shadowRoot!.querySelector("ha-selector")).toBeTruthy();
      });
    });
  });

  describe("GIVEN config targets are disabled", () => {
    beforeEach(async () => {
      el = createElement({ showConfigTargets: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it omits the chip group", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("chip-group")).toBeNull();
      });
    });
  });

  describe("GIVEN the target picker is disabled", () => {
    beforeEach(async () => {
      el = createElement({ showTargetPicker: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it omits the selector", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("ha-selector")).toBeNull();
      });
    });
  });

  describe("GIVEN a selector value-changed event fires", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the component handles the selector event", () => {
      it("THEN it re-emits dp-target-change with the same value", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-target-change", handler);
        el.shadowRoot!.querySelector("ha-selector")!.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: {
              value: {
                entity_id: ["sensor.outdoor_temperature"],
              },
            },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toEqual({
          entity_id: ["sensor.outdoor_temperature"],
        });
      });
    });
  });

  describe("GIVEN a selected target value is present", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
      el.shadowRoot!.querySelector("ha-selector")!.dispatchEvent(
        new CustomEvent("value-changed", {
          detail: {
            value: {
              entity_id: ["sensor.outdoor_temperature"],
            },
          },
          bubbles: true,
          composed: true,
        })
      );
      await el.updateComplete;
    });

    describe("WHEN resetSelection is called", () => {
      it("THEN the selector value is cleared", async () => {
        expect.assertions(1);
        el.resetSelection();
        await el.updateComplete;
        expect(
          (
            el.shadowRoot!.querySelector("ha-selector") as {
              value: RecordWithUnknownValues;
            }
          ).value
        ).toEqual({});
      });
    });
  });
});
