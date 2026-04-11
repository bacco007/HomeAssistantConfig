import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../chart-shell";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("chart-shell") as HTMLElement & {
    cardTitle: string;
    loading: boolean;
    message: string;
  };
  Object.assign(el, { cardTitle: "", loading: false, message: "", ...props });
  document.body.appendChild(el);
  return el;
}

describe("chart-shell", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a chart shell with a title", () => {
    beforeEach(async () => {
      el = createElement({ cardTitle: "Temperature History" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the title", () => {
        const header = el.shadowRoot!.querySelector(".card-header");
        expect(header?.textContent?.trim()).toBe("Temperature History");
      });

      it("THEN it renders an ha-card wrapper", () => {
        expect(el.shadowRoot!.querySelector("ha-card")).toBeTruthy();
      });

      it("THEN it provides a default slot for chart content", () => {
        expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a chart shell with no title", () => {
    beforeEach(async () => {
      el = createElement({ cardTitle: "" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no header is shown", () => {
        const header = el.shadowRoot!.querySelector(".card-header");
        expect(header).toBeNull();
      });
    });
  });

  describe("GIVEN a chart shell in loading state", () => {
    beforeEach(async () => {
      el = createElement({ loading: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN loading-indicator is active", () => {
        const indicator = el.shadowRoot!.querySelector(
          "loading-indicator"
        ) as any;
        expect(indicator?.active).toBe(true);
      });
    });
  });

  describe("GIVEN a chart shell with a message", () => {
    beforeEach(async () => {
      el = createElement({ message: "No data available" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN chart-message shows the text", () => {
        const msg = el.shadowRoot!.querySelector("chart-message") as any;
        expect(msg?.message).toBe("No data available");
      });
    });
  });
});
