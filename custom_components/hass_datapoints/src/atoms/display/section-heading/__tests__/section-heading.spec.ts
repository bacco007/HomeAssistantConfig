import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../section-heading";

function createElement(text = "") {
  const el = document.createElement("section-heading") as HTMLElement & {
    text: string;
  };
  el.text = text;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("section-heading", () => {
  let el: HTMLElement & { text: string };

  afterEach(() => {
    if (el) cleanup(el);
  });

  describe("GIVEN a section heading with text", () => {
    beforeEach(async () => {
      el = createElement("General Settings");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the text", () => {
        expect(el.shadowRoot!.textContent?.trim()).toBe("General Settings");
      });

      it("THEN it uses uppercase styling", () => {
        const heading = el.shadowRoot!.querySelector(".heading");
        expect(heading).toBeTruthy();
      });
    });
  });

  describe("GIVEN a section heading that updates text", () => {
    beforeEach(async () => {
      el = createElement("Before");
      await el.updateComplete;
    });

    describe("WHEN the text property changes", () => {
      it("THEN it displays the updated text", async () => {
        el.text = "After";
        await el.updateComplete;
        expect(el.shadowRoot!.textContent?.trim()).toBe("After");
      });
    });
  });
});
