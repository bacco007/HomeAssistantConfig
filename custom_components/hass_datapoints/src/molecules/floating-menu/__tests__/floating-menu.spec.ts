import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../floating-menu";

type DpFloatingMenuEl = HTMLElement & {
  open: boolean;
  updateComplete: Promise<boolean>;
};

function createElement(
  props: Partial<{ open: boolean }> = {}
): DpFloatingMenuEl {
  const el = document.createElement("floating-menu") as DpFloatingMenuEl;
  Object.assign(el, { open: false, ...props });
  document.body.appendChild(el);
  return el;
}

describe("floating-menu", () => {
  let el: DpFloatingMenuEl;

  afterEach(() => {
    el?.remove();
  });

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN an open menu", () => {
    beforeEach(async () => {
      el = createElement({ open: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN has a .floating-menu element inside shadow root", () => {
        const panel = el.shadowRoot!.querySelector(".floating-menu");
        expect(panel).not.toBeNull();
      });

      it("THEN the panel does not have the hidden attribute", () => {
        const panel = el.shadowRoot!.querySelector(
          ".floating-menu"
        ) as HTMLElement;
        expect(panel.hidden).toBe(false);
      });

      it("THEN the panel has role=menu", () => {
        const panel = el.shadowRoot!.querySelector(".floating-menu");
        expect(panel?.getAttribute("role")).toBe("menu");
      });

      it("THEN the panel contains a default slot", () => {
        const slot = el.shadowRoot!.querySelector("slot");
        expect(slot).not.toBeNull();
      });
    });
  });

  describe("GIVEN a closed menu", () => {
    beforeEach(async () => {
      el = createElement({ open: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the panel has the hidden attribute", () => {
        const panel = el.shadowRoot!.querySelector(
          ".floating-menu"
        ) as HTMLElement;
        expect(panel.hidden).toBe(true);
      });
    });

    describe("WHEN open is set to true", () => {
      it("THEN the panel becomes visible", async () => {
        el.open = true;
        await el.updateComplete;
        const panel = el.shadowRoot!.querySelector(
          ".floating-menu"
        ) as HTMLElement;
        expect(panel.hidden).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Outside-click dismissal
  // ---------------------------------------------------------------------------

  describe("GIVEN an open menu", () => {
    beforeEach(async () => {
      el = createElement({ open: true });
      await el.updateComplete;
    });

    describe("WHEN a pointerdown fires outside the element", () => {
      it("THEN emits dp-menu-close", () => {
        expect.assertions(1);
        el.addEventListener("dp-menu-close", () => {
          expect(true).toBe(true);
        });
        const outsideEl = document.createElement("div");
        document.body.appendChild(outsideEl);
        outsideEl.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, composed: true })
        );
        outsideEl.remove();
      });
    });

    describe("WHEN a pointerdown fires inside the element", () => {
      it("THEN does NOT emit dp-menu-close", async () => {
        const spy = vi.fn();
        el.addEventListener("dp-menu-close", spy);
        el.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, composed: true })
        );
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN a closed menu", () => {
    beforeEach(async () => {
      el = createElement({ open: false });
      await el.updateComplete;
    });

    describe("WHEN a pointerdown fires outside the element", () => {
      it("THEN does NOT emit dp-menu-close", () => {
        const spy = vi.fn();
        el.addEventListener("dp-menu-close", spy);
        const outsideEl = document.createElement("div");
        document.body.appendChild(outsideEl);
        outsideEl.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, composed: true })
        );
        outsideEl.remove();
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  describe("GIVEN a menu that has been connected and disconnected", () => {
    describe("WHEN a pointerdown fires outside after disconnection", () => {
      it("THEN does NOT emit dp-menu-close", async () => {
        const disconnectedEl = createElement({ open: true });
        await disconnectedEl.updateComplete;
        const spy = vi.fn();
        disconnectedEl.addEventListener("dp-menu-close", spy);
        disconnectedEl.remove();

        const outsideEl = document.createElement("div");
        document.body.appendChild(outsideEl);
        outsideEl.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, composed: true })
        );
        outsideEl.remove();
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});
