import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../chart-message";

function createElement(message = "") {
  const el = document.createElement("chart-message") as HTMLElement & {
    message: string;
  };
  el.message = message;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("chart-message", () => {
  let el: HTMLElement & { message: string };

  afterEach(() => {
    if (el) cleanup(el);
  });

  describe("GIVEN a chart message with no message", () => {
    beforeEach(async () => {
      el = createElement("");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the message container is not visible", () => {
        const container = el.shadowRoot!.querySelector(".message");
        expect(container?.classList.contains("visible")).toBe(false);
      });

      it("THEN the text content is empty", () => {
        const container = el.shadowRoot!.querySelector(".message");
        expect(container?.textContent?.trim()).toBe("");
      });
    });
  });

  describe("GIVEN a chart message with text", () => {
    beforeEach(async () => {
      el = createElement("No data available");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the message container is visible", () => {
        const container = el.shadowRoot!.querySelector(".message");
        expect(container?.classList.contains("visible")).toBe(true);
      });

      it("THEN the text content matches", () => {
        const container = el.shadowRoot!.querySelector(".message");
        expect(container?.textContent?.trim()).toBe("No data available");
      });
    });
  });

  describe("GIVEN a chart message that transitions from empty to text", () => {
    beforeEach(async () => {
      el = createElement("");
      await el.updateComplete;
    });

    describe("WHEN the message property is set", () => {
      it("THEN the message becomes visible with the new text", async () => {
        el.message = "Loading failed";
        await el.updateComplete;
        const container = el.shadowRoot!.querySelector(".message");
        expect(container?.classList.contains("visible")).toBe(true);
        expect(container?.textContent?.trim()).toBe("Loading failed");
      });
    });
  });
});
