import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../drag-handle";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("drag-handle") as HTMLElement & {
    label: string | undefined;
  };
  Object.assign(el, { label: undefined, ...props });
  document.body.appendChild(el);
  return el;
}

describe("drag-handle", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a drag handle with default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it has a button with draggable attribute", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("draggable")).toBe("true");
      });

      it("THEN it has a default aria-label", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("aria-label")).toBe("Drag to reorder");
      });

      it("THEN it contains a ha-icon with drag-vertical", () => {
        expect.assertions(1);
        const icon = el.shadowRoot!.querySelector("ha-icon");
        expect(icon?.getAttribute("icon")).toBe("mdi:drag-vertical");
      });
    });
  });

  describe("GIVEN a drag handle with a custom label", () => {
    beforeEach(async () => {
      el = createElement({ label: "Reorder temperature" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it uses the custom label as aria-label", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("aria-label")).toBe("Reorder temperature");
      });
    });
  });

  describe("GIVEN a drag handle", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN dragstart fires on the button", () => {
      it("THEN it dispatches dp-drag-start", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-drag-start", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(new Event("dragstart"));
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN dragend fires on the button", () => {
      it("THEN it dispatches dp-drag-end", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-drag-end", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(new Event("dragend"));
        expect(handler).toHaveBeenCalledOnce();
      });
    });
  });
});
