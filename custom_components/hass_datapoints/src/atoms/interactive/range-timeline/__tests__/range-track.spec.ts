import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../range-track";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("range-track") as HTMLElement & {
    selectionLeftPct: number;
    selectionWidthPct: number;
    selectionDragging: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    selectionLeftPct: 0,
    selectionWidthPct: 0,
    selectionDragging: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("range-track", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a selection div", () => {
        expect.assertions(1);
        const selection = el.shadowRoot!.querySelector(".range-selection");
        expect(selection).not.toBeNull();
      });

      it("THEN it exposes a track-overlays slot", () => {
        expect.assertions(1);
        const slot = el.shadowRoot!.querySelector(
          'slot[name="track-overlays"]'
        );
        expect(slot).not.toBeNull();
      });

      it("THEN the selection has default left and width styles", () => {
        expect.assertions(2);
        const selection = el.shadowRoot!.querySelector(
          ".range-selection"
        ) as HTMLElement;
        expect(selection.style.left).toBe("0%");
        expect(selection.style.width).toBe("0%");
      });

      it("THEN the selection does not have the dragging class", () => {
        expect.assertions(1);
        const selection = el.shadowRoot!.querySelector(".range-selection");
        expect(selection?.classList.contains("dragging")).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Selection position
  // ---------------------------------------------------------------------------

  describe("GIVEN selectionLeftPct=20 and selectionWidthPct=40", () => {
    beforeEach(async () => {
      el = createElement({
        selectionLeftPct: 20,
        selectionWidthPct: 40,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the selection left style is 20%", () => {
        expect.assertions(1);
        const selection = el.shadowRoot!.querySelector(
          ".range-selection"
        ) as HTMLElement;
        expect(selection.style.left).toBe("20%");
      });

      it("THEN the selection width style is 40%", () => {
        expect.assertions(1);
        const selection = el.shadowRoot!.querySelector(
          ".range-selection"
        ) as HTMLElement;
        expect(selection.style.width).toBe("40%");
      });
    });

    describe("WHEN selectionLeftPct is updated to 30", () => {
      it("THEN the selection left style updates to 30%", async () => {
        expect.assertions(1);
        el.selectionLeftPct = 30;
        await el.updateComplete;
        const selection = el.shadowRoot!.querySelector(
          ".range-selection"
        ) as HTMLElement;
        expect(selection.style.left).toBe("30%");
      });
    });

    describe("WHEN selectionWidthPct is updated to 60", () => {
      it("THEN the selection width style updates to 60%", async () => {
        expect.assertions(1);
        el.selectionWidthPct = 60;
        await el.updateComplete;
        const selection = el.shadowRoot!.querySelector(
          ".range-selection"
        ) as HTMLElement;
        expect(selection.style.width).toBe("60%");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Dragging state
  // ---------------------------------------------------------------------------

  describe("GIVEN selectionDragging=true", () => {
    beforeEach(async () => {
      el = createElement({ selectionDragging: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the selection has the dragging class", () => {
        expect.assertions(1);
        const selection = el.shadowRoot!.querySelector(".range-selection");
        expect(selection?.classList.contains("dragging")).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Reactivity
  // ---------------------------------------------------------------------------

  describe("GIVEN a non-dragging track", () => {
    beforeEach(async () => {
      el = createElement({ selectionDragging: false });
      await el.updateComplete;
    });

    describe("WHEN selectionDragging is set to true", () => {
      it("THEN the dragging class is added", async () => {
        expect.assertions(1);
        el.selectionDragging = true;
        await el.updateComplete;
        const selection = el.shadowRoot!.querySelector(".range-selection");
        expect(selection?.classList.contains("dragging")).toBe(true);
      });
    });
  });
});
