import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../editor-select";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("editor-select") as HTMLElement & {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
  };
  Object.assign(el, {
    label: "Period",
    value: "hour",
    options: [
      { value: "5minute", label: "5 Minutes" },
      { value: "hour", label: "Hour" },
      { value: "day", label: "Day" },
    ],
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("editor-select", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a select with options", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it creates an ha-selector element", () => {
        expect(el.shadowRoot!.querySelector("ha-selector")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a select", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN value-changed fires", () => {
      it("THEN it dispatches dp-select-change", () => {
        const handler = vi.fn();
        el.addEventListener("dp-select-change", handler);
        const selector = el.shadowRoot!.querySelector("ha-selector")!;
        selector.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: "day" },
            bubbles: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("day");
      });
    });
  });
});
