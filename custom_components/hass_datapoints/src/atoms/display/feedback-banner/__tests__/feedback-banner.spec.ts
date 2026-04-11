import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../feedback-banner";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("feedback-banner") as HTMLElement & {
    kind: string;
    text: string;
    visible: boolean;
    variant: string;
    updateComplete: Promise<void>;
  };
  Object.assign(el, {
    kind: "ok",
    text: "Saved",
    visible: true,
    variant: "default",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("feedback-banner", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN visible feedback text", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the feedback banner", () => {
        expect.assertions(3);
        const feedback = el.shadowRoot!.querySelector(".feedback");
        expect(feedback).toBeTruthy();
        expect(feedback?.classList.contains("visible")).toBe(true);
        expect(feedback?.textContent).toContain("Saved");
      });
    });
  });

  describe("GIVEN empty feedback text", () => {
    beforeEach(async () => {
      el = createElement({ text: "" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders nothing", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.textContent?.trim()).toBe("");
      });
    });
  });
});
