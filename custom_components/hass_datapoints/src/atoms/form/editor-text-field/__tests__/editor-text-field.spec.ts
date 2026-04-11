import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../editor-text-field";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("editor-text-field") as HTMLElement & {
    label: string;
    value: string;
    type: string;
    suffix: string;
  };
  Object.assign(el, {
    label: "Title",
    value: "My Card",
    type: "text",
    suffix: "",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("editor-text-field", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a text field with a label and value", () => {
    beforeEach(async () => {
      el = createElement({ label: "Title", value: "My Card" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it creates an ha-textfield element", () => {
        const haField = el.shadowRoot!.querySelector("ha-textfield");
        expect(haField).toBeTruthy();
      });
    });
  });

  describe("GIVEN a text field", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN input event fires", () => {
      it("THEN it dispatches dp-field-change with the value", () => {
        const handler = vi.fn();
        el.addEventListener("dp-field-change", handler);
        const haField = el.shadowRoot!.querySelector(
          "ha-textfield"
        ) as HTMLElement;
        (haField as any).value = "New Title";
        haField.dispatchEvent(new Event("input", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("New Title");
      });
    });
  });

  describe("GIVEN a number text field", () => {
    beforeEach(async () => {
      el = createElement({ type: "number", value: "24" });
      await el.updateComplete;
    });

    describe("WHEN input event fires with a numeric value", () => {
      it("THEN it dispatches dp-field-change with a number", () => {
        const handler = vi.fn();
        el.addEventListener("dp-field-change", handler);
        const haField = el.shadowRoot!.querySelector("ha-textfield") as any;
        haField.value = "48";
        haField.dispatchEvent(new Event("input", { bubbles: true }));
        expect(handler.mock.calls[0][0].detail.value).toBe(48);
      });
    });
  });
});
