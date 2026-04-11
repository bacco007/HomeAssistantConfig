import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../empty-state";

function createElement(message = "") {
  const el = document.createElement("empty-state") as HTMLElement & {
    message: string;
  };
  el.message = message;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("empty-state", () => {
  let el: HTMLElement & { message: string };

  afterEach(() => {
    if (el) cleanup(el);
  });

  describe("GIVEN an empty state with a message", () => {
    beforeEach(async () => {
      el = createElement("No data points recorded yet");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the message", () => {
        expect.assertions(1);
        const container = el.shadowRoot!.querySelector(".empty-state");
        expect(container?.textContent?.trim()).toBe(
          "No data points recorded yet"
        );
      });

      it("THEN it renders the empty-state container", () => {
        expect.assertions(1);
        const container = el.shadowRoot!.querySelector(".empty-state");
        expect(container).toBeTruthy();
      });
    });
  });

  describe("GIVEN an empty state with no message", () => {
    beforeEach(async () => {
      el = createElement("");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders an empty container", () => {
        expect.assertions(1);
        const container = el.shadowRoot!.querySelector(".empty-state");
        expect(container?.textContent?.trim()).toBe("");
      });
    });
  });

  describe("GIVEN an empty state that updates message", () => {
    beforeEach(async () => {
      el = createElement("Initial message");
      await el.updateComplete;
    });

    describe("WHEN the message property changes", () => {
      it("THEN it displays the updated message", async () => {
        expect.assertions(1);
        el.message = "No entities found";
        await el.updateComplete;
        const container = el.shadowRoot!.querySelector(".empty-state");
        expect(container?.textContent?.trim()).toBe("No entities found");
      });
    });
  });
});
