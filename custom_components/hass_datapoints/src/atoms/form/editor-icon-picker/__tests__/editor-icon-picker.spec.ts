import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../editor-icon-picker";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("editor-icon-picker") as HTMLElement & {
    label: string;
    value: string;
  };
  Object.assign(el, { label: "Icon", value: "mdi:bookmark", ...props });
  document.body.appendChild(el);
  return el;
}

describe("editor-icon-picker", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN an icon picker with a value", () => {
    beforeEach(async () => {
      el = createElement({ value: "mdi:lightbulb" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it creates an ha-icon-picker element", () => {
        expect(el.shadowRoot!.querySelector("ha-icon-picker")).toBeTruthy();
      });
    });
  });

  describe("GIVEN an icon picker", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN value-changed fires", () => {
      it("THEN it dispatches dp-icon-change", () => {
        const handler = vi.fn();
        el.addEventListener("dp-icon-change", handler);
        const picker = el.shadowRoot!.querySelector("ha-icon-picker")!;
        picker.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: "mdi:thermometer" },
            bubbles: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("mdi:thermometer");
      });
    });
  });
});
