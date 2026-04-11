import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../search-bar";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("search-bar") as HTMLElement & {
    query: string;
    placeholder: string;
  };
  Object.assign(el, { query: "", placeholder: "Search records...", ...props });
  document.body.appendChild(el);
  return el;
}

describe("search-bar", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a search bar with no query", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the placeholder", () => {
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.placeholder).toBe("Search records...");
        expect(input.value).toBe("");
      });
    });
  });

  describe("GIVEN a search bar with a query", () => {
    beforeEach(async () => {
      el = createElement({ query: "temperature" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the input contains the query text", () => {
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.value).toBe("temperature");
      });
    });
  });

  describe("GIVEN a search bar", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the user types text", () => {
      it("THEN it fires dp-search with the query", () => {
        const handler = vi.fn();
        el.addEventListener("dp-search", handler);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        input.value = "motion";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.query).toBe("motion");
      });
    });
  });
});
