import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../quick-annotation";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("quick-annotation") as HTMLElement & {
    value: string;
    updateComplete: Promise<void>;
  };
  Object.assign(el, {
    value: "Initial annotation",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("quick-annotation", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN an annotation value", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the textarea value", () => {
        expect.assertions(1);
        expect(
          (el.shadowRoot!.querySelector("textarea") as HTMLTextAreaElement)
            .value
        ).toBe("Initial annotation");
      });
    });
  });

  describe("GIVEN the textarea changes", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN input fires", () => {
      it("THEN it emits the updated annotation", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-annotation-input", handler);
        const textarea = el.shadowRoot!.querySelector(
          "textarea"
        ) as HTMLTextAreaElement;
        textarea.value = "Updated annotation";
        textarea.dispatchEvent(new Event("input"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe(
          "Updated annotation"
        );
      });
    });
  });
});
