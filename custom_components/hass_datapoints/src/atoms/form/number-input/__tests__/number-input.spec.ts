import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../number-input";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("number-input") as HTMLElement & {
    value: string;
    placeholder: string;
    suffix: string;
    step: string;
  };
  Object.assign(el, {
    value: "10",
    placeholder: "Enter value",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("number-input", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a number input with value", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a native number input", () => {
        expect.assertions(2);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.type).toBe("number");
      });

      it("THEN it sets the value on the input", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.value).toBe("10");
      });
    });
  });

  describe("GIVEN a number input with suffix", () => {
    beforeEach(async () => {
      el = createElement({ suffix: "%" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders the suffix text", () => {
        expect.assertions(1);
        const suffix = el.shadowRoot!.querySelector(".suffix");
        expect(suffix!.textContent).toBe("%");
      });
    });
  });

  describe("GIVEN a number input without suffix", () => {
    beforeEach(async () => {
      el = createElement({ suffix: "" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it does not render a suffix element", () => {
        expect.assertions(1);
        const suffix = el.shadowRoot!.querySelector(".suffix");
        expect(suffix).toBeNull();
      });
    });
  });

  describe("GIVEN a number input", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the user types a new value", () => {
      it("THEN it dispatches dp-number-change with the new value", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-number-change", handler);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        input.value = "42";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("42");
      });
    });
  });

  describe("GIVEN a number input with a custom step", () => {
    beforeEach(async () => {
      el = createElement({ step: "0.5" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the input has the correct step attribute", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.step).toBe("0.5");
      });
    });
  });
});
