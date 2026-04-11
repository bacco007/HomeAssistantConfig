import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupCanvas } from "@/lib/chart/chart-shell";

// ---------------------------------------------------------------------------
// setupCanvas — canvas dimension overflow safety
// ---------------------------------------------------------------------------

describe("setupCanvas", () => {
  let canvas: HTMLCanvasElement;
  let container: HTMLElement;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    container = document.createElement("div");
    document.body.appendChild(container);
    // Mock getComputedStyle to return zero padding
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
      paddingBottom: "0",
    } as CSSStyleDeclaration);
    // jsdom does not implement canvas 2D context — stub it so setupCanvas doesn't throw
    vi.spyOn(canvas, "getContext").mockReturnValue({
      scale: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe("WHEN devicePixelRatio is 1 and cssWidth is within safe limits", () => {
    it("THEN canvas.width equals cssWidth", () => {
      expect.assertions(1);
      Object.defineProperty(window, "devicePixelRatio", {
        value: 1,
        configurable: true,
      });
      const { w } = setupCanvas(canvas, container, 400, 800);
      expect(canvas.width).toBe(w * 1);
    });
  });

  describe("WHEN devicePixelRatio is 2 and cssWidth would exceed 16383 pixel limit", () => {
    it("THEN canvas.width is clamped so it does not exceed 16383", () => {
      expect.assertions(1);
      Object.defineProperty(window, "devicePixelRatio", {
        value: 2,
        configurable: true,
      });
      // Request a width that would result in >16383 physical pixels
      const largeWidth = 10000;
      setupCanvas(canvas, container, 400, largeWidth);
      expect(canvas.width).toBeLessThanOrEqual(16383);
    });
  });

  describe("WHEN cssWidth is 0 or very small", () => {
    it("THEN canvas.width is at least 1 physical pixel", () => {
      expect.assertions(1);
      Object.defineProperty(window, "devicePixelRatio", {
        value: 1,
        configurable: true,
      });
      setupCanvas(canvas, container, 400, 0);
      expect(canvas.width).toBeGreaterThanOrEqual(1);
    });
  });

  describe("WHEN cssHeight is very small", () => {
    it("THEN canvas.height is at least 40 CSS pixels", () => {
      expect.assertions(1);
      Object.defineProperty(window, "devicePixelRatio", {
        value: 1,
        configurable: true,
      });
      setupCanvas(canvas, container, 10, 400);
      expect(canvas.height).toBeGreaterThanOrEqual(40);
    });
  });
});
