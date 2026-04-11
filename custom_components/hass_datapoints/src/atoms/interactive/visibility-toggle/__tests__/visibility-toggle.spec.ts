import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../visibility-toggle";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("visibility-toggle") as HTMLElement & {
    pressed: boolean;
    label: string;
    icon: string;
  };
  Object.assign(el, {
    pressed: true,
    label: "Show events",
    icon: "mdi:eye",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("visibility-toggle", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a visibility toggle in pressed state", () => {
    beforeEach(async () => {
      el = createElement({ pressed: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN aria-pressed is true", () => {
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("aria-pressed")).toBe("true");
      });
    });
  });

  describe("GIVEN a visibility toggle in unpressed state", () => {
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

  describe("GIVEN a visible toggle", () => {
    beforeEach(async () => {
      el = createElement({ pressed: true });
      await el.updateComplete;
    });

    describe("WHEN clicked", () => {
      it("THEN it fires dp-visibility-change with pressed=false", () => {
        const handler = vi.fn();
        el.addEventListener("dp-visibility-change", handler);
        el.shadowRoot!.querySelector("button")!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.pressed).toBe(false);
      });
    });
  });

  describe("GIVEN a hidden toggle", () => {
    beforeEach(async () => {
      el = createElement({ pressed: false });
      await el.updateComplete;
    });

    describe("WHEN clicked", () => {
      it("THEN it fires dp-visibility-change with pressed=true", () => {
        const handler = vi.fn();
        el.addEventListener("dp-visibility-change", handler);
        el.shadowRoot!.querySelector("button")!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.pressed).toBe(true);
      });
    });
  });
});
