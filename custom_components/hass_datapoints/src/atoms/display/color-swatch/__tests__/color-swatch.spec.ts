import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../color-swatch";

function createElement(color = "#ff9800", label = "Color") {
  const el = document.createElement("color-swatch") as HTMLElement & {
    color: string;
    label: string;
  };
  el.color = color;
  el.label = label;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("color-swatch", () => {
  let el: HTMLElement & { color: string; label: string };

  afterEach(() => {
    if (el) cleanup(el);
  });

  describe("GIVEN a color swatch with a color", () => {
    beforeEach(async () => {
      el = createElement("#ff9800", "Accent Color");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays a circle with the specified color", () => {
        const inner = el.shadowRoot!.querySelector(
          ".swatch-inner"
        ) as HTMLElement;
        expect(inner).toBeTruthy();
        expect(inner.style.backgroundColor).toBe("#ff9800");
      });

      it("THEN the label text is displayed", () => {
        const label = el.shadowRoot!.querySelector(".label");
        expect(label?.textContent?.trim()).toBe("Accent Color");
      });

      it("THEN a hidden color input is present", () => {
        const input = el.shadowRoot!.querySelector(
          "input[type='color']"
        ) as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.value).toBe("#ff9800");
      });
    });
  });

  describe("GIVEN a color swatch", () => {
    beforeEach(async () => {
      el = createElement("#ff9800");
      await el.updateComplete;
    });

    describe("WHEN the color input changes", () => {
      it("THEN it fires a dp-color-change event with the new color", async () => {
        const handler = vi.fn();
        el.addEventListener("dp-color-change", handler);

        const input = el.shadowRoot!.querySelector(
          "input[type='color']"
        ) as HTMLInputElement;
        input.value = "#4caf50";
        input.dispatchEvent(new Event("input", { bubbles: true }));

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.color).toBe("#4caf50");
      });
    });
  });

  describe("GIVEN a color swatch that updates its color property", () => {
    beforeEach(async () => {
      el = createElement("#ff9800");
      await el.updateComplete;
    });

    describe("WHEN the color property changes", () => {
      it("THEN the swatch updates to the new color", async () => {
        el.color = "#2196f3";
        await el.updateComplete;
        const inner = el.shadowRoot!.querySelector(
          ".swatch-inner"
        ) as HTMLElement;
        expect(inner.style.backgroundColor).toBe("#2196f3");
      });
    });
  });
});
