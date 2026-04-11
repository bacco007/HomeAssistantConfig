import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../legend-item";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("legend-item") as HTMLElement & {
    label: string;
    color: string;
    unit: string;
    pressed: boolean;
    opacity: number;
  };
  Object.assign(el, {
    label: "Temperature",
    color: "#2196f3",
    unit: "°C",
    pressed: true,
    opacity: 1,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("legend-item", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a legend item with label, color and unit", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the label with unit", () => {
        const text = el.shadowRoot!.textContent?.trim();
        expect(text).toContain("Temperature");
        expect(text).toContain("°C");
      });

      it("THEN it shows the color line", () => {
        const line = el.shadowRoot!.querySelector(
          ".legend-line"
        ) as HTMLElement;
        expect(line).toBeTruthy();
        expect(line.style.backgroundColor).toBe("#2196f3");
      });

      it("THEN aria-pressed reflects pressed state", () => {
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("aria-pressed")).toBe("true");
      });
    });
  });

  describe("GIVEN a legend item with pressed=false", () => {
    beforeEach(async () => {
      el = createElement({ pressed: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN aria-pressed is false", () => {
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("aria-pressed")).toBe("false");
      });
    });
  });

  describe("GIVEN a visible legend item", () => {
    beforeEach(async () => {
      el = createElement({ pressed: true });
      await el.updateComplete;
    });

    describe("WHEN clicked", () => {
      it("THEN it fires dp-legend-toggle with pressed=false", () => {
        const handler = vi.fn();
        el.addEventListener("dp-legend-toggle", handler);
        el.shadowRoot!.querySelector("button")!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.pressed).toBe(false);
      });
    });
  });

  describe("GIVEN a hidden legend item", () => {
    beforeEach(async () => {
      el = createElement({ pressed: false });
      await el.updateComplete;
    });

    describe("WHEN clicked", () => {
      it("THEN it fires dp-legend-toggle with pressed=true", () => {
        const handler = vi.fn();
        el.addEventListener("dp-legend-toggle", handler);
        el.shadowRoot!.querySelector("button")!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.pressed).toBe(true);
      });
    });
  });

  describe("GIVEN a legend item without a unit", () => {
    beforeEach(async () => {
      el = createElement({ unit: "" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays only the label", () => {
        const text = el.shadowRoot!.textContent?.trim();
        expect(text).toBe("Temperature");
      });
    });
  });
});
