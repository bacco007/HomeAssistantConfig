import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../inline-select";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("inline-select") as HTMLElement & {
    value: string;
    options: Array<{ value: string; label: string }>;
    disabled: boolean;
  };
  Object.assign(el, {
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

describe("inline-select", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a select with options", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a native select element", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("select")).toBeTruthy();
      });

      it("THEN it renders the correct number of options", () => {
        expect.assertions(1);
        const options = el.shadowRoot!.querySelectorAll("option");
        expect(options.length).toBe(3);
      });

      it("THEN the selected value matches the value prop", () => {
        expect.assertions(1);
        const select = el.shadowRoot!.querySelector(
          "select"
        ) as HTMLSelectElement;
        expect(select.value).toBe("hour");
      });
    });
  });

  describe("GIVEN a select with disabled prop", () => {
    beforeEach(async () => {
      el = createElement({ disabled: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the select element is disabled", () => {
        expect.assertions(1);
        const select = el.shadowRoot!.querySelector(
          "select"
        ) as HTMLSelectElement;
        expect(select.disabled).toBe(true);
      });
    });
  });

  describe("GIVEN a select", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the user changes the selection", () => {
      it("THEN it dispatches dp-select-change with the new value", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-select-change", handler);
        const select = el.shadowRoot!.querySelector(
          "select"
        ) as HTMLSelectElement;
        select.value = "day";
        select.dispatchEvent(new Event("change", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("day");
      });
    });
  });
});
