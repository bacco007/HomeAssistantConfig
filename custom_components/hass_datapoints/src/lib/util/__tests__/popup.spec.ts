import { describe, expect, it, vi } from "vitest";
import { computePopupPosition, attachPopupDismissListeners } from "../popup";

describe("computePopupPosition", () => {
  describe("GIVEN anchor in the middle of the viewport", () => {
    it("THEN positions popup to the right with default gap", () => {
      const pos = computePopupPosition({ top: 200, right: 300 }, 100, 800);
      expect(pos.top).toBe(200);
      expect(pos.left).toBe(308);
      expect(pos.maxHeight).toBe(800 - 200 - 16);
    });
  });

  describe("GIVEN anchor near the bottom of the viewport", () => {
    it("THEN clamps top so popup stays in viewport", () => {
      const pos = computePopupPosition({ top: 750, right: 300 }, 100, 800);
      // popup would extend to 750+100=850 > 800, so top clamps
      expect(pos.top).toBe(800 - 100 - 16); // 684
      expect(pos.left).toBe(308);
    });
  });

  describe("GIVEN anchor near the top of the viewport", () => {
    it("THEN clamps top to minimum margin", () => {
      const pos = computePopupPosition({ top: 2, right: 300 }, 100, 800);
      expect(pos.top).toBe(8); // minimum margin
    });
  });

  describe("GIVEN custom gap", () => {
    it("THEN uses the custom gap for left offset and margins", () => {
      const pos = computePopupPosition({ top: 200, right: 300 }, 100, 800, 12);
      expect(pos.left).toBe(312);
      expect(pos.top).toBe(200);
      expect(pos.maxHeight).toBe(800 - 200 - 24);
    });
  });

  describe("GIVEN a very tall popup", () => {
    it("THEN maxHeight is at least margin from bottom", () => {
      const pos = computePopupPosition({ top: 8, right: 300 }, 900, 800);
      expect(pos.top).toBe(8);
      expect(pos.maxHeight).toBe(800 - 8 - 16);
    });
  });
});

describe("attachPopupDismissListeners", () => {
  describe("GIVEN attached dismiss listeners", () => {
    it("THEN calls onDismiss when clicking outside popup and anchor", () => {
      const popup = document.createElement("div");
      const anchor = document.createElement("div");
      const onDismiss = vi.fn();
      document.body.appendChild(popup);
      document.body.appendChild(anchor);

      const cleanup = attachPopupDismissListeners(popup, anchor, onDismiss);

      // Click on body (outside both)
      document.body.dispatchEvent(new Event("click", { bubbles: true }));
      expect(onDismiss).toHaveBeenCalledOnce();

      cleanup.destroy();
      popup.remove();
      anchor.remove();
    });

    it("THEN does NOT call onDismiss when clicking inside popup", () => {
      const popup = document.createElement("div");
      const anchor = document.createElement("div");
      const onDismiss = vi.fn();
      document.body.appendChild(popup);
      document.body.appendChild(anchor);

      const cleanup = attachPopupDismissListeners(popup, anchor, onDismiss);

      popup.dispatchEvent(new Event("click", { bubbles: true }));
      expect(onDismiss).not.toHaveBeenCalled();

      cleanup.destroy();
      popup.remove();
      anchor.remove();
    });

    it("THEN calls onDismiss on Escape key", () => {
      const popup = document.createElement("div");
      const anchor = document.createElement("div");
      anchor.focus = vi.fn();
      const onDismiss = vi.fn();
      document.body.appendChild(popup);
      document.body.appendChild(anchor);

      const cleanup = attachPopupDismissListeners(popup, anchor, onDismiss);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(onDismiss).toHaveBeenCalledOnce();
      expect(anchor.focus).toHaveBeenCalledOnce();

      cleanup.destroy();
      popup.remove();
      anchor.remove();
    });

    it("THEN does NOT call onDismiss on non-Escape key", () => {
      const popup = document.createElement("div");
      const anchor = document.createElement("div");
      const onDismiss = vi.fn();
      document.body.appendChild(popup);
      document.body.appendChild(anchor);

      const cleanup = attachPopupDismissListeners(popup, anchor, onDismiss);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(onDismiss).not.toHaveBeenCalled();

      cleanup.destroy();
      popup.remove();
      anchor.remove();
    });

    it("THEN focuses custom element on Escape when focusOnEscape is set", () => {
      const popup = document.createElement("div");
      const anchor = document.createElement("div");
      const focusTarget = document.createElement("button");
      focusTarget.focus = vi.fn();
      anchor.focus = vi.fn();
      const onDismiss = vi.fn();
      document.body.appendChild(popup);
      document.body.appendChild(anchor);
      document.body.appendChild(focusTarget);

      const cleanup = attachPopupDismissListeners(
        popup,
        anchor,
        onDismiss,
        focusTarget
      );

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(focusTarget.focus).toHaveBeenCalledOnce();
      expect(anchor.focus).not.toHaveBeenCalled();

      cleanup.destroy();
      popup.remove();
      anchor.remove();
      focusTarget.remove();
    });

    it("THEN destroy() removes all listeners", () => {
      const popup = document.createElement("div");
      const anchor = document.createElement("div");
      const onDismiss = vi.fn();
      document.body.appendChild(popup);
      document.body.appendChild(anchor);

      const cleanup = attachPopupDismissListeners(popup, anchor, onDismiss);
      cleanup.destroy();

      document.body.dispatchEvent(new Event("click", { bubbles: true }));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(onDismiss).not.toHaveBeenCalled();

      popup.remove();
      anchor.remove();
    });
  });
});
