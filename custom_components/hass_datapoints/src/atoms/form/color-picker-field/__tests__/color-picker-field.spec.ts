import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../color-picker-field";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("color-picker-field") as HTMLElement & {
    color: string;
    entityId: string | undefined;
  };
  Object.assign(el, {
    color: "#4caf50",
    entityId: undefined,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("color-picker-field", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a color picker field with a color", () => {
    beforeEach(async () => {
      el = createElement({ color: "#4caf50" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a color input with the specified value", () => {
        expect.assertions(2);
        const input = el.shadowRoot!.querySelector(
          "input[type='color']"
        ) as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.value).toBe("#4caf50");
      });

      it("THEN the container shows the color as background", () => {
        expect.assertions(1);
        const container = el.shadowRoot!.querySelector(
          ".color-field"
        ) as HTMLElement;
        expect(container.style.backgroundColor).toBe("#4caf50");
      });

      it("THEN no icon overlay is rendered without entityId", () => {
        expect.assertions(1);
        const overlay = el.shadowRoot!.querySelector(".icon-overlay");
        expect(overlay).toBeNull();
      });
    });
  });

  describe("GIVEN a color picker field with an entityId", () => {
    beforeEach(async () => {
      el = createElement({ color: "#2196f3", entityId: "sensor.temperature" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders the icon overlay with ha-state-icon", () => {
        expect.assertions(1);
        const overlay = el.shadowRoot!.querySelector(".icon-overlay");
        expect(overlay).toBeTruthy();
      });

      it("THEN the ha-state-icon element is present inside the overlay", () => {
        expect.assertions(1);
        const icon = el.shadowRoot!.querySelector(
          ".icon-overlay ha-state-icon"
        );
        expect(icon).toBeTruthy();
      });
    });
  });

  describe("GIVEN a color picker field", () => {
    beforeEach(async () => {
      el = createElement({ color: "#4caf50" });
      await el.updateComplete;
    });

    describe("WHEN the color input changes", () => {
      it("THEN it dispatches dp-color-change with the new color", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-color-change", handler);

        const input = el.shadowRoot!.querySelector(
          "input[type='color']"
        ) as HTMLInputElement;
        input.value = "#ff5722";
        input.dispatchEvent(new Event("input", { bubbles: true }));

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.color).toBe("#ff5722");
      });
    });
  });

  describe("GIVEN a color picker field that updates its color property", () => {
    beforeEach(async () => {
      el = createElement({ color: "#4caf50" });
      await el.updateComplete;
    });

    describe("WHEN the color property changes", () => {
      it("THEN the input and container update", async () => {
        expect.assertions(2);
        el.color = "#9c27b0";
        await el.updateComplete;
        const input = el.shadowRoot!.querySelector(
          "input[type='color']"
        ) as HTMLInputElement;
        const container = el.shadowRoot!.querySelector(
          ".color-field"
        ) as HTMLElement;
        expect(input.value).toBe("#9c27b0");
        expect(container.style.backgroundColor).toBe("#9c27b0");
      });
    });
  });
});
