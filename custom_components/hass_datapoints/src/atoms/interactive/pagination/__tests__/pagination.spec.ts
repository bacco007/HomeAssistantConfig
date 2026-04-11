import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../pagination";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("pagination-nav") as HTMLElement & {
    page: number;
    totalPages: number;
    totalItems: number;
    label: string;
  };
  Object.assign(el, {
    page: 0,
    totalPages: 5,
    totalItems: 50,
    label: "records",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("pagination-nav", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN pagination on page 1 of 5", () => {
    beforeEach(async () => {
      el = createElement({ page: 0, totalPages: 5, totalItems: 50 });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows page info text", () => {
        const text = el.shadowRoot!.textContent;
        expect(text).toContain("Page 1 of 5");
        expect(text).toContain("50 records");
      });

      it("THEN prev button is disabled", () => {
        const prev = el.shadowRoot!.querySelector(
          "[data-action='prev']"
        ) as HTMLButtonElement;
        expect(prev.disabled).toBe(true);
      });

      it("THEN next button is enabled", () => {
        const next = el.shadowRoot!.querySelector(
          "[data-action='next']"
        ) as HTMLButtonElement;
        expect(next.disabled).toBe(false);
      });
    });
  });

  describe("GIVEN pagination on the last page", () => {
    beforeEach(async () => {
      el = createElement({ page: 4, totalPages: 5, totalItems: 50 });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN next button is disabled", () => {
        const next = el.shadowRoot!.querySelector(
          "[data-action='next']"
        ) as HTMLButtonElement;
        expect(next.disabled).toBe(true);
      });

      it("THEN prev button is enabled", () => {
        const prev = el.shadowRoot!.querySelector(
          "[data-action='prev']"
        ) as HTMLButtonElement;
        expect(prev.disabled).toBe(false);
      });
    });
  });

  describe("GIVEN pagination on page 3 of 5", () => {
    beforeEach(async () => {
      el = createElement({ page: 2, totalPages: 5, totalItems: 50 });
      await el.updateComplete;
    });

    describe("WHEN next is clicked", () => {
      it("THEN it fires dp-page-change with page 3", () => {
        const handler = vi.fn();
        el.addEventListener("dp-page-change", handler);
        el.shadowRoot!.querySelector("[data-action='next']")!.dispatchEvent(
          new Event("click")
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.page).toBe(3);
      });
    });

    describe("WHEN prev is clicked", () => {
      it("THEN it fires dp-page-change with page 1", () => {
        const handler = vi.fn();
        el.addEventListener("dp-page-change", handler);
        el.shadowRoot!.querySelector("[data-action='prev']")!.dispatchEvent(
          new Event("click")
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.page).toBe(1);
      });
    });
  });

  describe("GIVEN pagination with 1 page", () => {
    beforeEach(async () => {
      el = createElement({ page: 0, totalPages: 1, totalItems: 3 });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN both buttons are disabled", () => {
        const prev = el.shadowRoot!.querySelector(
          "[data-action='prev']"
        ) as HTMLButtonElement;
        const next = el.shadowRoot!.querySelector(
          "[data-action='next']"
        ) as HTMLButtonElement;
        expect(prev.disabled).toBe(true);
        expect(next.disabled).toBe(true);
      });
    });
  });
});
