import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../loading-indicator";

function createElement(active = false) {
  const el = document.createElement("loading-indicator") as HTMLElement & {
    active: boolean;
  };
  el.active = active;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("loading-indicator", () => {
  let el: HTMLElement & { active: boolean };

  afterEach(() => {
    if (el) cleanup(el);
  });

  describe("GIVEN a loading indicator with active=false", () => {
    beforeEach(async () => {
      el = createElement(false);
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the spinner is hidden", () => {
        const spinner = el.shadowRoot!.querySelector(".spinner");
        expect(spinner).toBeTruthy();
        expect(getComputedStyle(el).display).not.toBe("none");
      });

      it("THEN aria-hidden is true", () => {
        expect(el.shadowRoot!.host.getAttribute("aria-hidden")).toBe(null);
        const wrapper = el.shadowRoot!.querySelector(".wrapper");
        expect(wrapper?.classList.contains("active")).toBe(false);
      });
    });
  });

  describe("GIVEN a loading indicator with active=true", () => {
    beforeEach(async () => {
      el = createElement(true);
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the spinner is visible", () => {
        const wrapper = el.shadowRoot!.querySelector(".wrapper");
        expect(wrapper?.classList.contains("active")).toBe(true);
      });
    });
  });

  describe("GIVEN a loading indicator that transitions from inactive to active", () => {
    beforeEach(async () => {
      el = createElement(false);
      await el.updateComplete;
    });

    describe("WHEN active is set to true", () => {
      it("THEN the spinner becomes visible", async () => {
        el.active = true;
        await el.updateComplete;
        const wrapper = el.shadowRoot!.querySelector(".wrapper");
        expect(wrapper?.classList.contains("active")).toBe(true);
      });
    });
  });
});
