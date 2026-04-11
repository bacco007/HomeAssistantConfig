import { describe, expect, it } from "vitest";
import { ChartRenderer } from "@/lib/chart/chart-renderer";

/** Create a ChartRenderer with a fake canvas (no actual drawing needed). */
function makeRenderer(cssWidth = 400, cssHeight = 300) {
  const mockCtx = {
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
  };
  const mockCanvas = {
    getContext: () => mockCtx,
    width: cssWidth,
    height: cssHeight,
  };
  return new ChartRenderer(mockCanvas, cssWidth, cssHeight);
}

// ─────────────────────────────────────────────────────────────────────────────
// xOf
// ─────────────────────────────────────────────────────────────────────────────

describe("ChartRenderer.xOf", () => {
  describe("GIVEN a 400×300 renderer with default padding", () => {
    it("THEN maps t0 to the left edge (pad.left)", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      const axes = [{ key: "a", min: 0, max: 10, side: "left" }];
      r._normalizeAxes(axes);
      expect(r.xOf(0, 0, 100)).toBe(r.pad.left);
    });

    it("THEN maps t1 to the right edge (pad.left + cw)", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      r._normalizeAxes([{ key: "a", min: 0, max: 10, side: "left" }]);
      expect(r.xOf(100, 0, 100)).toBeCloseTo(r.pad.left + r.cw);
    });

    it("THEN maps the midpoint to the center of the chart area", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      r._normalizeAxes([{ key: "a", min: 0, max: 10, side: "left" }]);
      expect(r.xOf(50, 0, 100)).toBeCloseTo(r.pad.left + r.cw / 2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// yOf
// ─────────────────────────────────────────────────────────────────────────────

describe("ChartRenderer.yOf", () => {
  describe("GIVEN a 400×300 renderer with one left axis", () => {
    it("THEN maps vMax to the top edge (pad.top)", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      r._normalizeAxes([{ key: "a", min: 0, max: 100 }]);
      expect(r.yOf(100, 0, 100)).toBeCloseTo(r.pad.top);
    });

    it("THEN maps vMin to the bottom edge (pad.top + ch)", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      r._normalizeAxes([{ key: "a", min: 0, max: 100 }]);
      expect(r.yOf(0, 0, 100)).toBeCloseTo(r.pad.top + r.ch);
    });

    it("THEN maps the midpoint value to the vertical center", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      r._normalizeAxes([{ key: "a", min: 0, max: 100 }]);
      expect(r.yOf(50, 0, 100)).toBeCloseTo(r.pad.top + r.ch / 2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// _formatAxisTick
// ─────────────────────────────────────────────────────────────────────────────

describe("ChartRenderer._formatAxisTick", () => {
  const r = makeRenderer();

  describe("GIVEN an integer value < 1000", () => {
    it("THEN returns it without decimals", () => {
      expect.assertions(1);
      expect(r._formatAxisTick(42)).toBe("42");
    });
  });

  describe("GIVEN a float with non-zero fractional part", () => {
    it("THEN returns one decimal place", () => {
      expect.assertions(1);
      expect(r._formatAxisTick(3.7)).toBe("3.7");
    });
  });

  describe("GIVEN a value >= 1000", () => {
    it("THEN abbreviates with a 'k' suffix", () => {
      expect.assertions(1);
      expect(r._formatAxisTick(1500)).toBe("1.5k");
    });
  });

  describe("GIVEN an exact multiple of 1000", () => {
    it("THEN uses a clean 'k' abbreviation with no trailing .0", () => {
      expect.assertions(1);
      expect(r._formatAxisTick(2000)).toBe("2k");
    });
  });

  describe("GIVEN a negative value", () => {
    it("THEN returns a negative abbreviated form for large negatives", () => {
      expect.assertions(1);
      expect(r._formatAxisTick(-3000)).toBe("-3k");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// _normalizeAxes
// ─────────────────────────────────────────────────────────────────────────────

describe("ChartRenderer._normalizeAxes", () => {
  describe("GIVEN a single vMin/vMax pair (legacy API)", () => {
    it("THEN creates one default axis", () => {
      expect.assertions(2);
      const r = makeRenderer(400, 300);
      const axes = r._normalizeAxes(0, 100);
      expect(axes).toHaveLength(1);
      expect(axes[0].key).toBe("default");
    });
  });

  describe("GIVEN an array with one left axis", () => {
    it("THEN returns the normalized axis with side='left' and slot=0", () => {
      expect.assertions(3);
      const r = makeRenderer(400, 300);
      const axes = r._normalizeAxes([
        { key: "temp", min: -10, max: 40, side: "left" },
      ]);
      expect(axes).toHaveLength(1);
      expect(axes[0].side).toBe("left");
      expect(axes[0].slot).toBe(0);
    });

    it("THEN updates pad.left to include one axis column", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      r._normalizeAxes([{ key: "a", min: 0, max: 1, side: "left" }]);
      expect(r.pad.left).toBe(r.basePad.left + ChartRenderer.AXIS_SLOT_WIDTH);
    });
  });

  describe("GIVEN one left and one right axis", () => {
    it("THEN assigns side and slot correctly", () => {
      expect.assertions(4);
      const r = makeRenderer(400, 300);
      const axes = r._normalizeAxes([
        { key: "left", min: 0, max: 100, side: "left" },
        { key: "right", min: 0, max: 1, side: "right" },
      ]);
      expect(axes[0].side).toBe("left");
      expect(axes[0].slot).toBe(0);
      expect(axes[1].side).toBe("right");
      expect(axes[1].slot).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// _axisLabelX
// ─────────────────────────────────────────────────────────────────────────────

describe("ChartRenderer._axisLabelX", () => {
  describe("GIVEN a left axis at slot 0", () => {
    it("THEN returns a position to the left of the chart area", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      const [axis] = r._normalizeAxes([
        { key: "a", min: 0, max: 1, side: "left" },
      ]);
      const x = r._axisLabelX(axis);
      expect(x).toBeLessThan(r.pad.left);
    });
  });

  describe("GIVEN a right axis at slot 0", () => {
    it("THEN returns a position to the right of the chart area", () => {
      expect.assertions(1);
      const r = makeRenderer(400, 300);
      const [axis] = r._normalizeAxes([
        { key: "a", min: 0, max: 1, side: "right" },
      ]);
      const x = r._axisLabelX(axis);
      expect(x).toBeGreaterThan(r.pad.left + r.cw);
    });
  });
});
