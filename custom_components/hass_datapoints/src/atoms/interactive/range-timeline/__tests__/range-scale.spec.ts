import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../range-scale";
import type { RangeBounds } from "../types";

const DAY_CONFIG = {
  baselineMs: 48 * 60 * 60 * 1000,
  boundsUnit: "hour",
  contextUnit: "day",
  majorUnit: "hour",
  labelUnit: "hour",
  minorUnit: "hour",
  pixelsPerUnit: 9,
};

const JAN_13 = new Date("2024-01-13T00:00:00Z").getTime();
const JAN_17 = new Date("2024-01-17T00:00:00Z").getTime();

const SAMPLE_BOUNDS: RangeBounds = {
  min: JAN_13,
  max: JAN_17,
  config: DAY_CONFIG,
};

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("range-scale") as HTMLElement & {
    rangeBounds: Nullable<RangeBounds>;
    zoomLevel: string;
    contentWidth: number;
    locale: string;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    rangeBounds: null,
    zoomLevel: "day",
    contentWidth: 0,
    locale: "",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("range-scale", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure — no rangeBounds
  // ---------------------------------------------------------------------------

  describe("GIVEN no rangeBounds", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN nothing is rendered", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.children.length).toBe(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Structure — with rangeBounds
  // ---------------------------------------------------------------------------

  describe("GIVEN rangeBounds and contentWidth", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        contentWidth: 800,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders a tick layer", () => {
        expect.assertions(1);
        const tickLayer = el.shadowRoot!.querySelector(".range-tick-layer");
        expect(tickLayer).not.toBeNull();
      });

      it("THEN it renders a label layer", () => {
        expect.assertions(1);
        const labelLayer = el.shadowRoot!.querySelector(".range-label-layer");
        expect(labelLayer).not.toBeNull();
      });

      it("THEN it renders a context layer", () => {
        expect.assertions(1);
        const contextLayer = el.shadowRoot!.querySelector(
          ".range-context-layer"
        );
        expect(contextLayer).not.toBeNull();
      });

      it("THEN ticks are rendered in the tick layer", () => {
        expect.assertions(1);
        const ticks = el.shadowRoot!.querySelectorAll(
          ".range-tick-layer .range-tick"
        );
        expect(ticks.length).toBeGreaterThan(0);
      });

      it("THEN period buttons are rendered in the label layer", () => {
        expect.assertions(1);
        const buttons = el.shadowRoot!.querySelectorAll(
          ".range-label-layer .range-period-button"
        );
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Events — period select
  // ---------------------------------------------------------------------------

  describe("GIVEN a rendered range-scale with rangeBounds", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        contentWidth: 800,
      });
      await el.updateComplete;
    });

    describe("WHEN a period button is clicked", () => {
      it("THEN dp-scale-period-select is dispatched with unit and startTime", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-scale-period-select", handler);
        const button = el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".range-period-button"
        );
        button?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, composed: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toMatchObject({
          unit: expect.any(String),
          startTime: expect.any(Date),
        });
      });
    });

    describe("WHEN a period button is hovered", () => {
      it("THEN dp-scale-period-hover is dispatched", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-scale-period-hover", handler);
        const button = el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".range-period-button"
        );
        button?.dispatchEvent(
          new PointerEvent("pointerenter", { bubbles: true, composed: true })
        );
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN a period button is left", () => {
      it("THEN dp-scale-period-leave is dispatched", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-scale-period-leave", handler);
        const button = el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".range-period-button"
        );
        button?.dispatchEvent(
          new PointerEvent("pointerleave", { bubbles: true, composed: true })
        );
        expect(handler).toHaveBeenCalledOnce();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Reactivity
  // ---------------------------------------------------------------------------

  describe("GIVEN a range-scale with no rangeBounds", () => {
    beforeEach(async () => {
      el = createElement({ contentWidth: 800 });
      await el.updateComplete;
    });

    describe("WHEN rangeBounds is set", () => {
      it("THEN tick and label layers appear", async () => {
        expect.assertions(2);
        el.rangeBounds = SAMPLE_BOUNDS;
        await el.updateComplete;
        expect(
          el.shadowRoot!.querySelector(".range-tick-layer")
        ).not.toBeNull();
        expect(
          el.shadowRoot!.querySelector(".range-label-layer")
        ).not.toBeNull();
      });
    });
  });
});
