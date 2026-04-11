import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../resizable-panes";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("resizable-panes") as HTMLElement & {
    direction: "vertical" | "horizontal";
    ratio: number;
    min: number;
    max: number;
    secondHidden: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    direction: "vertical",
    ratio: 0.5,
    min: 0.25,
    max: 0.75,
    secondHidden: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("resizable-panes", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN first pane slot container is present", () => {
        expect(el.shadowRoot!.querySelector(".pane-first")).toBeTruthy();
      });

      it("THEN second pane slot container is present", () => {
        expect(el.shadowRoot!.querySelector(".pane-second")).toBeTruthy();
      });

      it("THEN splitter button is present", () => {
        expect(el.shadowRoot!.querySelector(".pane-splitter")).toBeTruthy();
      });
    });
  });

  describe("GIVEN secondHidden=true", () => {
    beforeEach(async () => {
      el = createElement({ secondHidden: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN splitter is not present", () => {
        expect(el.shadowRoot!.querySelector(".pane-splitter")).toBeNull();
      });

      it("THEN second pane is not present", () => {
        expect(el.shadowRoot!.querySelector(".pane-second")).toBeNull();
      });

      it("THEN first pane is still present", () => {
        expect(el.shadowRoot!.querySelector(".pane-first")).toBeTruthy();
      });
    });
  });

  describe("GIVEN direction=horizontal", () => {
    beforeEach(async () => {
      el = createElement({ direction: "horizontal" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN direction attribute is reflected on host", () => {
        expect(el.getAttribute("direction")).toBe("horizontal");
      });
    });
  });

  describe("GIVEN ratio=0.3", () => {
    beforeEach(async () => {
      el = createElement({ ratio: 0.3 });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN CSS custom property --dp-panes-top-size is set to 30%", () => {
        expect(el.style.getPropertyValue("--dp-panes-top-size")).toBe("30%");
      });
    });
  });

  describe("GIVEN element connected with min=0.3, max=0.7 and ratio=0.1", () => {
    beforeEach(async () => {
      el = createElement({ min: 0.3, max: 0.7, ratio: 0.1 });
      await el.updateComplete;
    });

    describe("WHEN ratio is already below min on construction", () => {
      it("THEN ratio property retains the set value (clamping only happens during drag)", () => {
        // Ratio is stored as-is; clamping occurs during pointer drag events
        expect(el.ratio).toBe(0.1);
      });
    });
  });

  describe("GIVEN element in DOM", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN pointermove fires on window after pointerdown on splitter", () => {
      it("THEN fires dp-panes-resize event with ratio in detail", async () => {
        const handler = vi.fn();
        el.addEventListener("dp-panes-resize", handler);

        // happy-dom returns zero rects; provide a non-zero size so the drag guard passes
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
          top: 0,
          left: 0,
          right: 0,
          bottom: 400,
          width: 0,
          height: 400,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect);

        const splitter = el.shadowRoot!.querySelector(".pane-splitter")!;
        splitter.dispatchEvent(
          new PointerEvent("pointerdown", {
            button: 0,
            pointerId: 1,
            bubbles: true,
            composed: true,
          })
        );

        window.dispatchEvent(
          new PointerEvent("pointermove", {
            pointerId: 1,
            clientX: 0,
            clientY: 100,
            bubbles: true,
          })
        );

        expect(handler).toHaveBeenCalled();
        const detail = handler.mock.calls[0][0].detail;
        expect(typeof detail.ratio).toBe("number");
      });
    });

    describe("WHEN pointerup fires after drag", () => {
      it("THEN fires dp-panes-resize with committed=true", () => {
        const handler = vi.fn();
        el.addEventListener("dp-panes-resize", handler);

        const splitter = el.shadowRoot!.querySelector(".pane-splitter")!;
        splitter.dispatchEvent(
          new PointerEvent("pointerdown", {
            button: 0,
            pointerId: 1,
            bubbles: true,
            composed: true,
          })
        );
        window.dispatchEvent(
          new PointerEvent("pointerup", {
            pointerId: 1,
            bubbles: true,
          })
        );

        const commitEvent = handler.mock.calls.find(
          ([e]) => e.detail.committed === true
        );
        expect(commitEvent).toBeTruthy();
      });
    });
  });
});
