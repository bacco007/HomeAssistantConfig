import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../checkbox-list";
import type { CheckboxItem } from "../checkbox-list";

const defaultItems: CheckboxItem[] = [
  { name: "temperature", label: "Temperature", checked: true },
  { name: "humidity", label: "Humidity", checked: false },
  { name: "pressure", label: "Pressure", checked: true },
];

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("checkbox-list") as HTMLElement & {
    items: CheckboxItem[];
  };
  Object.assign(el, {
    items: defaultItems,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("checkbox-list", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a checkbox list with items", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders one checkbox per item", () => {
        expect.assertions(1);
        const inputs = el.shadowRoot!.querySelectorAll(
          "input[type='checkbox']"
        );
        expect(inputs.length).toBe(3);
      });

      it("THEN checked items have their checkbox checked", () => {
        expect.assertions(3);
        const inputs = el.shadowRoot!.querySelectorAll(
          "input[type='checkbox']"
        ) as NodeListOf<HTMLInputElement>;
        expect(inputs[0].checked).toBe(true);
        expect(inputs[1].checked).toBe(false);
        expect(inputs[2].checked).toBe(true);
      });

      it("THEN each item label text is displayed", () => {
        expect.assertions(3);
        const labels = el.shadowRoot!.querySelectorAll(".checkbox-option");
        expect(labels[0].textContent?.trim()).toBe("Temperature");
        expect(labels[1].textContent?.trim()).toBe("Humidity");
        expect(labels[2].textContent?.trim()).toBe("Pressure");
      });
    });
  });

  describe("GIVEN a checkbox list", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN a checkbox is toggled", () => {
      it("THEN it dispatches dp-item-change with name and checked", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-item-change", handler);

        const inputs = el.shadowRoot!.querySelectorAll(
          "input[type='checkbox']"
        ) as NodeListOf<HTMLInputElement>;
        const humidityInput = inputs[1];
        humidityInput.checked = true;
        humidityInput.dispatchEvent(new Event("change", { bubbles: true }));

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.name).toBe("humidity");
        expect(handler.mock.calls[0][0].detail.checked).toBe(true);
      });
    });
  });

  describe("GIVEN a checkbox list that updates its items property", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN items are updated", () => {
      it("THEN the checkboxes re-render with new state", async () => {
        expect.assertions(2);
        el.items = [
          { name: "alpha", label: "Alpha", checked: false },
          { name: "beta", label: "Beta", checked: true },
        ];
        await el.updateComplete;
        const inputs = el.shadowRoot!.querySelectorAll(
          "input[type='checkbox']"
        ) as NodeListOf<HTMLInputElement>;
        expect(inputs.length).toBe(2);
        expect(inputs[1].checked).toBe(true);
      });
    });
  });
});
