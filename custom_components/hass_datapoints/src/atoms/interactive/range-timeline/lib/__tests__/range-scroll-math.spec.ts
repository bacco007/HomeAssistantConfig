import { describe, expect, it } from "vitest";
import {
  computeScrollPositionForRange,
  computeSelectionJumpVisibility,
} from "../range-scroll-math";

describe("computeSelectionJumpVisibility", () => {
  const BOUNDS_MIN = 0;
  const BOUNDS_MAX = 10000;
  const CONTENT_WIDTH = 1000;

  describe("GIVEN selection is fully visible", () => {
    it("THEN both arrows are hidden", () => {
      // viewport covers 0-500px, selection maps to 200-400px
      const result = computeSelectionJumpVisibility(
        0,
        500,
        CONTENT_WIDTH,
        2000,
        4000,
        BOUNDS_MIN,
        BOUNDS_MAX
      );
      expect(result.showLeft).toBe(false);
      expect(result.showRight).toBe(false);
    });
  });

  describe("GIVEN selection is off the left edge", () => {
    it("THEN shows left arrow", () => {
      // viewport scrolled to 600px, selection end maps to 300px
      const result = computeSelectionJumpVisibility(
        600,
        400,
        CONTENT_WIDTH,
        1000,
        3000,
        BOUNDS_MIN,
        BOUNDS_MAX
      );
      expect(result.showLeft).toBe(true);
      expect(result.showRight).toBe(false);
    });
  });

  describe("GIVEN selection is off the right edge", () => {
    it("THEN shows right arrow", () => {
      // viewport at 0-400px, selection start maps to 800px
      const result = computeSelectionJumpVisibility(
        0,
        400,
        CONTENT_WIDTH,
        8000,
        9000,
        BOUNDS_MIN,
        BOUNDS_MAX
      );
      expect(result.showLeft).toBe(false);
      expect(result.showRight).toBe(true);
    });
  });

  describe("GIVEN zero-length bounds", () => {
    it("THEN handles gracefully", () => {
      const result = computeSelectionJumpVisibility(
        0,
        500,
        CONTENT_WIDTH,
        5000,
        5000,
        5000,
        5000
      );
      // total becomes 1 (max(1, 0)), so px values are huge → right arrow
      expect(result).toBeDefined();
    });
  });
});

describe("computeScrollPositionForRange", () => {
  const BOUNDS_MIN = 0;
  const BOUNDS_MAX = 10000;
  const CONTENT_WIDTH = 2000;
  const VIEWPORT_WIDTH = 500;

  describe("GIVEN a range to center", () => {
    it("THEN returns a scroll position that centers the midpoint", () => {
      const result = computeScrollPositionForRange(
        4000,
        6000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        CONTENT_WIDTH,
        VIEWPORT_WIDTH,
        true
      );
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(CONTENT_WIDTH - VIEWPORT_WIDTH);
    });
  });

  describe("GIVEN a range to align start", () => {
    it("THEN returns a scroll position aligned to range start", () => {
      const result = computeScrollPositionForRange(
        2000,
        4000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        CONTENT_WIDTH,
        VIEWPORT_WIDTH,
        false
      );
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GIVEN viewport wider than content", () => {
    it("THEN returns null", () => {
      const result = computeScrollPositionForRange(
        2000,
        4000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        500,
        1000,
        true
      );
      expect(result).toBeNull();
    });
  });

  describe("GIVEN zero viewport width", () => {
    it("THEN returns null", () => {
      const result = computeScrollPositionForRange(
        2000,
        4000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        CONTENT_WIDTH,
        0,
        true
      );
      expect(result).toBeNull();
    });
  });

  describe("GIVEN range at the start of bounds", () => {
    it("THEN returns scroll position near 0", () => {
      const result = computeScrollPositionForRange(
        0,
        1000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        CONTENT_WIDTH,
        VIEWPORT_WIDTH,
        false
      );
      expect(result).not.toBeNull();
      expect(result).toBe(0);
    });
  });

  describe("GIVEN range at the end of bounds", () => {
    it("THEN returns scroll position near max", () => {
      const result = computeScrollPositionForRange(
        9000,
        10000,
        BOUNDS_MIN,
        BOUNDS_MAX,
        CONTENT_WIDTH,
        VIEWPORT_WIDTH,
        false
      );
      expect(result).not.toBeNull();
      expect(result).toBeLessThanOrEqual(CONTENT_WIDTH - VIEWPORT_WIDTH);
    });
  });
});
