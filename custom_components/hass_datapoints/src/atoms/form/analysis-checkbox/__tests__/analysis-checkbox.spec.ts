import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../analysis-checkbox";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("analysis-checkbox") as HTMLElement & {
    checked: boolean;
    label: string;
    disabled: boolean;
    helpText: string;
    helpId: string;
  };
  Object.assign(el, {
    checked: false,
    label: "Enable threshold",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("analysis-checkbox", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a checkbox with a label", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a checkbox input", () => {
        expect.assertions(2);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.type).toBe("checkbox");
      });

      it("THEN it renders the label text", () => {
        expect.assertions(1);
        const span = el.shadowRoot!.querySelector("span");
        expect(span!.textContent).toBe("Enable threshold");
      });
    });
  });

  describe("GIVEN a checkbox that is checked", () => {
    beforeEach(async () => {
      el = createElement({ checked: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the input is checked", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.checked).toBe(true);
      });
    });
  });

  describe("GIVEN a disabled checkbox", () => {
    beforeEach(async () => {
      el = createElement({ disabled: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the input is disabled", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.disabled).toBe(true);
      });

      it("THEN the label has the disabled class", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector("label");
        expect(label!.classList.contains("disabled")).toBe(true);
      });
    });
  });

  describe("GIVEN a checkbox with helpText", () => {
    beforeEach(async () => {
      el = createElement({
        helpText: "Draws a horizontal line",
        helpId: "threshold-help",
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a ha-tooltip element", () => {
        expect.assertions(1);
        const tooltip = el.shadowRoot!.querySelector("ha-tooltip");
        expect(tooltip).toBeTruthy();
      });
    });
  });

  describe("GIVEN a checkbox without helpText", () => {
    beforeEach(async () => {
      el = createElement({ helpText: "" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it does not render a ha-tooltip element", () => {
        expect.assertions(1);
        const tooltip = el.shadowRoot!.querySelector("ha-tooltip");
        expect(tooltip).toBeNull();
      });
    });
  });

  describe("GIVEN a checkbox", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the user toggles the checkbox", () => {
      it("THEN it dispatches dp-check-change with checked true", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-check-change", handler);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.checked).toBe(true);
      });
    });
  });
});
