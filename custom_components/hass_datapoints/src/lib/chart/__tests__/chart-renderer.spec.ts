import { describe, expect, it, vi } from "vitest";

import { ChartRenderer } from "@/lib/chart/chart-renderer";

function createRenderer() {
  const ctx = {
    clearRect: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 24 })),
    save: vi.fn(),
    restore: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    setLineDash: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    bezierCurveTo: vi.fn(),
    fillRect: vi.fn(),
    arc: vi.fn(),
  };
  const canvas = {
    width: 400,
    height: 200,
    getContext: vi.fn(() => ctx),
  };

  return {
    ctx,
    renderer: new ChartRenderer(canvas, 400, 200),
  };
}

describe("chart-renderer", () => {
  describe("GIVEN a renderer instance", () => {
    describe("WHEN the geometry helpers are called", () => {
      it("THEN they use the chart padding and drawable bounds", () => {
        expect.assertions(4);

        const { renderer } = createRenderer();

        expect(renderer.cw).toBe(376);
        expect(renderer.ch).toBe(128);
        expect(renderer.xOf(5, 0, 10)).toBe(200);
        expect(renderer.yOf(5, 0, 10)).toBe(88);
      });
    });
  });

  describe("GIVEN a renderer with multiple axes", () => {
    describe("WHEN _normalizeAxes is called", () => {
      it("THEN it assigns slots and expands the side padding", () => {
        expect.assertions(4);

        const { renderer } = createRenderer();
        const axes = renderer._normalizeAxes([
          { key: "left", min: 0, max: 10, side: "left", unit: "C" },
          { key: "right", min: 0, max: 100, side: "right", unit: "%" },
        ]);

        expect(axes[0].slot).toBe(0);
        expect(axes[1].slot).toBe(0);
        expect(renderer.pad.left).toBe(42);
        expect(renderer.pad.right).toBe(42);
      });
    });
  });

  describe("GIVEN a renderer instance and a canvas context", () => {
    describe("WHEN clear and drawLine are called", () => {
      it("THEN they clear and stroke using the underlying context", () => {
        expect.assertions(3);

        const { ctx, renderer } = createRenderer();

        renderer.clear();
        renderer.drawLine(
          [
            [0, 0],
            [10, 10],
          ],
          "#83c705",
          0,
          10,
          0,
          10,
          { smooth: false }
        );

        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 200);
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      });

      it("THEN stepped lines draw horizontal and vertical segments", () => {
        expect.assertions(4);

        const { ctx, renderer } = createRenderer();

        renderer.drawLine(
          [
            [0, 0],
            [5, 10],
            [10, 4],
          ],
          "#83c705",
          0,
          10,
          0,
          10,
          { stepped: true }
        );

        expect(ctx.lineTo).toHaveBeenCalledTimes(4);
        expect(ctx.lineTo.mock.calls).toEqual(
          expect.arrayContaining([
            [200, 152],
            [200, 24],
            [388, 24],
            [388, 100.8],
          ])
        );
        expect(ctx.lineJoin).toBe("miter");
        expect(ctx.lineCap).toBe("butt");
      });
    });
  });
});
