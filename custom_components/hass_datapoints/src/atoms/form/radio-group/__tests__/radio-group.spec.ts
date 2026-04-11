import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../radio-group";
import type { SelectOption } from "@/lib/types";

const defaultOptions: SelectOption[] = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
];

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("radio-group") as HTMLElement & {
    name: string;
    value: string;
    options: SelectOption[];
  };
  Object.assign(el, {
    name: "period",
    value: "day",
    options: defaultOptions,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("radio-group", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a radio group with options", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders one radio input per option", () => {
        expect.assertions(1);
        const inputs = el.shadowRoot!.querySelectorAll("input[type='radio']");
        expect(inputs.length).toBe(3);
      });

      it("THEN the matching radio is checked", () => {
        expect.assertions(1);
        const checked = el.shadowRoot!.querySelector(
          "input[type='radio']:checked"
        ) as HTMLInputElement;
        expect(checked.value).toBe("day");
      });

      it("THEN each option label text is displayed", () => {
        expect.assertions(3);
        const labels = el.shadowRoot!.querySelectorAll(".radio-option");
        expect(labels[0].textContent?.trim()).toBe("Hour");
        expect(labels[1].textContent?.trim()).toBe("Day");
        expect(labels[2].textContent?.trim()).toBe("Week");
      });

      it("THEN a fieldset with role radiogroup is present", () => {
        expect.assertions(1);
        const fieldset = el.shadowRoot!.querySelector(
          "fieldset[role='radiogroup']"
        );
        expect(fieldset).toBeTruthy();
      });
    });
  });

  describe("GIVEN a radio group", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN a radio option is selected", () => {
      it("THEN it dispatches dp-radio-change with the new value", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-radio-change", handler);

        const inputs = el.shadowRoot!.querySelectorAll("input[type='radio']");
        const weekInput = inputs[2] as HTMLInputElement;
        weekInput.checked = true;
        weekInput.dispatchEvent(new Event("change", { bubbles: true }));

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("week");
      });
    });
  });

  describe("GIVEN a radio group that updates its value property", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the value property changes", () => {
      it("THEN the checked radio updates", async () => {
        expect.assertions(1);
        el.value = "hour";
        await el.updateComplete;
        const checked = el.shadowRoot!.querySelector(
          "input[type='radio']:checked"
        ) as HTMLInputElement;
        expect(checked.value).toBe("hour");
      });
    });
  });
});
