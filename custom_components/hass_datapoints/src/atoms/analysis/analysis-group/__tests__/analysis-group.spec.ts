import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../analysis-group";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("analysis-group") as HTMLElement & {
    label: string;
    checked: boolean;
    disabled: boolean;
    alignTop: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    label: "Test group",
    checked: false,
    disabled: false,
    alignTop: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("analysis-group", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN checked=false", () => {
    beforeEach(async () => {
      el = createElement({ checked: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the group-body slot wrapper is not in the DOM", () => {
        expect.assertions(1);
        const body = el.shadowRoot!.querySelector(".group-body");
        expect(body).toBeNull();
      });

      it("THEN the group does not have is-open class", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(".group");
        expect(group!.classList.contains("is-open")).toBe(false);
      });
    });
  });

  describe("GIVEN checked=true", () => {
    beforeEach(async () => {
      el = createElement({ checked: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the group-body slot wrapper is in the DOM", () => {
        expect.assertions(1);
        const body = el.shadowRoot!.querySelector(".group-body");
        expect(body).not.toBeNull();
      });

      it("THEN the group has is-open class", () => {
        expect.assertions(1);
        const group = el.shadowRoot!.querySelector(".group");
        expect(group!.classList.contains("is-open")).toBe(true);
      });
    });
  });

  describe("GIVEN disabled=true", () => {
    beforeEach(async () => {
      el = createElement({ disabled: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the checkbox has the disabled attribute", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector(
          "input[type='checkbox']"
        ) as HTMLInputElement;
        expect(input.disabled).toBe(true);
      });

      it("THEN the option label has the is-disabled class", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector("label");
        expect(label!.classList.contains("is-disabled")).toBe(true);
      });
    });
  });

  describe("GIVEN alignTop=true", () => {
    beforeEach(async () => {
      el = createElement({ alignTop: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the option label has the top class", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector("label");
        expect(label!.classList.contains("top")).toBe(true);
      });
    });
  });

  describe("GIVEN a rendered group", () => {
    beforeEach(async () => {
      el = createElement({ checked: false });
      await el.updateComplete;
    });

    describe("WHEN the checkbox changes to checked", () => {
      it("THEN dispatches dp-group-change with checked=true", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-group-change", handler);
        const input = el.shadowRoot!.querySelector(
          "input[type='checkbox']"
        ) as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.checked).toBe(true);
      });
    });

    describe("WHEN the checkbox changes to unchecked", () => {
      it("THEN dispatches dp-group-change with checked=false", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-group-change", handler);
        const input = el.shadowRoot!.querySelector(
          "input[type='checkbox']"
        ) as HTMLInputElement;
        input.checked = false;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.checked).toBe(false);
      });
    });
  });
});
