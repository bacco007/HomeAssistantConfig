import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../panel-timeline";
import type { EventMarker } from "../types";
import type { RangeBounds } from "@/atoms/interactive/range-timeline/types";

const DAY_CONFIG = {
  baselineMs: 48 * 60 * 60 * 1000,
  boundsUnit: "hour",
  contextUnit: "day",
  majorUnit: "hour",
  labelUnit: "hour",
  minorUnit: "hour",
  pixelsPerUnit: 9,
};

const JAN_15 = new Date("2024-01-15T12:00:00Z").getTime();
const JAN_13 = new Date("2024-01-13T00:00:00Z").getTime();
const JAN_17 = new Date("2024-01-17T00:00:00Z").getTime();

const SAMPLE_BOUNDS: RangeBounds = {
  min: JAN_13,
  max: JAN_17,
  config: DAY_CONFIG,
};

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("panel-timeline") as HTMLElement & {
    startTime: Nullable<Date>;
    endTime: Nullable<Date>;
    rangeBounds: Nullable<RangeBounds>;
    zoomLevel: string;
    dateSnapping: string;
    isLiveEdge: boolean;
    hoveredPeriodRange: Nullable<{ start: number; end: number }>;
    comparisonPreview: Nullable<{ start: number; end: number }>;
    zoomRange: Nullable<{ start: number; end: number }>;
    zoomWindowRange: Nullable<{ start: number; end: number }>;
    chartHoverTimeMs: Nullable<number>;
    chartHoverWindowTimeMs: Nullable<number>;
    events: EventMarker[];
    updateComplete: Promise<boolean>;
    syncZoomHighlights(
      zoomRange: Nullable<{ start: number; end: number }>,
      zoomWindowRange: Nullable<{ start: number; end: number }>
    ): void;
  };
  Object.assign(el, {
    startTime: null,
    endTime: null,
    rangeBounds: null,
    zoomLevel: "day",
    dateSnapping: "auto",
    isLiveEdge: false,
    hoveredPeriodRange: null,
    comparisonPreview: null,
    zoomRange: null,
    zoomWindowRange: null,
    chartHoverTimeMs: null,
    chartHoverWindowTimeMs: null,
    events: [],
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("panel-timeline", () => {
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
      it("THEN renders a range-timeline", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("range-timeline")).not.toBeNull();
      });

      it("THEN renders the hover preview overlay", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-hover-preview")
        ).not.toBeNull();
      });

      it("THEN renders the comparison preview overlay", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-comparison-preview")
        ).not.toBeNull();
      });

      it("THEN renders the zoom highlight overlay", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-zoom-highlight")
        ).not.toBeNull();
      });

      it("THEN renders the zoom window highlight overlay", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-zoom-window-highlight")
        ).not.toBeNull();
      });

      it("THEN renders the chart hover line overlay", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-chart-hover-line")
        ).not.toBeNull();
      });

      it("THEN renders the chart hover window line overlay", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-chart-hover-window-line")
        ).not.toBeNull();
      });

      it("THEN renders the event layer", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.getElementById("range-event-layer")
        ).not.toBeNull();
      });

      it("THEN no overlay has the visible class by default", () => {
        expect.assertions(4);
        const sr = el.shadowRoot!;
        expect(
          sr
            .getElementById("range-hover-preview")!
            .classList.contains("visible")
        ).toBe(false);
        expect(
          sr
            .getElementById("range-comparison-preview")!
            .classList.contains("visible")
        ).toBe(false);
        expect(
          sr
            .getElementById("range-zoom-highlight")!
            .classList.contains("visible")
        ).toBe(false);
        expect(
          sr
            .getElementById("range-chart-hover-line")!
            .classList.contains("visible")
        ).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Prop forwarding
  // ---------------------------------------------------------------------------

  describe("GIVEN isLiveEdge=true forwarded to the inner atom", () => {
    beforeEach(async () => {
      el = createElement({ isLiveEdge: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the inner range-timeline has isLiveEdge=true", async () => {
        expect.assertions(1);
        const atom = el.shadowRoot!.querySelector(
          "range-timeline"
        ) as HTMLElement & {
          isLiveEdge: boolean;
          updateComplete: Promise<boolean>;
        };
        await atom.updateComplete;
        expect(atom.isLiveEdge).toBe(true);
      });
    });
  });

  describe("GIVEN rangeBounds forwarded to the inner atom", () => {
    beforeEach(async () => {
      el = createElement({ rangeBounds: SAMPLE_BOUNDS });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the inner range-timeline receives the rangeBounds object", async () => {
        expect.assertions(1);
        const atom = el.shadowRoot!.querySelector(
          "range-timeline"
        ) as HTMLElement & {
          rangeBounds: Nullable<RangeBounds>;
          updateComplete: Promise<boolean>;
        };
        await atom.updateComplete;
        expect(atom.rangeBounds).toBe(SAMPLE_BOUNDS);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Track overlay — hoveredPeriodRange
  // ---------------------------------------------------------------------------

  describe("GIVEN hoveredPeriodRange set with rangeBounds", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        hoveredPeriodRange: { start: JAN_15, end: JAN_15 + 3_600_000 },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the hover preview has the visible class", () => {
        expect.assertions(1);
        const preview = el.shadowRoot!.getElementById("range-hover-preview")!;
        expect(preview.classList.contains("visible")).toBe(true);
      });

      it("THEN the hover preview has inline left and width styles", () => {
        expect.assertions(2);
        const preview = el.shadowRoot!.getElementById("range-hover-preview")!;
        expect(preview.style.left).not.toBe("");
        expect(preview.style.width).not.toBe("");
      });
    });
  });

  describe("GIVEN a rendered panel timeline with bounds", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
      });
      await el.updateComplete;
    });

    describe("WHEN syncZoomHighlights() is called", () => {
      it("THEN the zoom overlays update immediately", () => {
        expect.assertions(4);
        el.syncZoomHighlights(
          { start: JAN_15, end: JAN_15 + 3_600_000 },
          { start: JAN_15 + 600_000, end: JAN_15 + 1_800_000 }
        );
        const zoomEl = el.shadowRoot!.getElementById("range-zoom-highlight")!;
        const zoomWindowEl = el.shadowRoot!.getElementById(
          "range-zoom-window-highlight"
        )!;
        expect(zoomEl.classList.contains("visible")).toBe(true);
        expect(zoomWindowEl.classList.contains("visible")).toBe(true);
        expect(zoomEl.style.left).not.toBe("");
        expect(zoomWindowEl.style.width).not.toBe("");
      });
    });
  });

  describe("GIVEN hoveredPeriodRange cleared after being set", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        hoveredPeriodRange: { start: JAN_15, end: JAN_15 + 3_600_000 },
      });
      await el.updateComplete;
    });

    describe("WHEN hoveredPeriodRange is set to null", () => {
      it("THEN the hover preview no longer has the visible class", async () => {
        expect.assertions(1);
        el.hoveredPeriodRange = null;
        await el.updateComplete;
        const preview = el.shadowRoot!.getElementById("range-hover-preview")!;
        expect(preview.classList.contains("visible")).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Track overlay — comparisonPreview
  // ---------------------------------------------------------------------------

  describe("GIVEN comparisonPreview set with rangeBounds", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        comparisonPreview: { start: JAN_13, end: JAN_15 },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the comparison preview has the visible class", () => {
        expect.assertions(1);
        const preview = el.shadowRoot!.getElementById(
          "range-comparison-preview"
        )!;
        expect(preview.classList.contains("visible")).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Track overlay — zoomRange
  // ---------------------------------------------------------------------------

  describe("GIVEN zoomRange set with rangeBounds", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        zoomRange: { start: JAN_15, end: JAN_15 + 7_200_000 },
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the zoom highlight has the visible class", () => {
        expect.assertions(1);
        const highlight = el.shadowRoot!.getElementById(
          "range-zoom-highlight"
        )!;
        expect(highlight.classList.contains("visible")).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Timeline overlay — chartHoverTimeMs
  // ---------------------------------------------------------------------------

  describe("GIVEN chartHoverTimeMs set with rangeBounds", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        chartHoverTimeMs: JAN_15,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the chart hover line has the visible class", () => {
        expect.assertions(1);
        const line = el.shadowRoot!.getElementById("range-chart-hover-line")!;
        expect(line.classList.contains("visible")).toBe(true);
      });

      it("THEN the chart hover line has an inline left style", () => {
        expect.assertions(1);
        const line = el.shadowRoot!.getElementById("range-chart-hover-line")!;
        expect(line.style.left).not.toBe("");
      });
    });
  });

  describe("GIVEN chartHoverTimeMs cleared after being set", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        chartHoverTimeMs: JAN_15,
      });
      await el.updateComplete;
    });

    describe("WHEN chartHoverTimeMs is set to null", () => {
      it("THEN the chart hover line loses the visible class", async () => {
        expect.assertions(1);
        el.chartHoverTimeMs = null;
        await el.updateComplete;
        const line = el.shadowRoot!.getElementById("range-chart-hover-line")!;
        expect(line.classList.contains("visible")).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Event layer
  // ---------------------------------------------------------------------------

  describe("GIVEN events set with rangeBounds", () => {
    const EVENTS: EventMarker[] = [
      { timestamp: new Date(JAN_15), color: "#ff0000" },
      { timestamp: new Date(JAN_15 + 3_600_000) },
    ];

    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        events: EVENTS,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the event layer contains two dot spans", () => {
        expect.assertions(1);
        const layer = el.shadowRoot!.getElementById("range-event-layer")!;
        expect(layer.querySelectorAll(".range-event-dot").length).toBe(2);
      });

      it("THEN the first event dot has the event color applied", () => {
        expect.assertions(1);
        const layer = el.shadowRoot!.getElementById("range-event-layer")!;
        const dot = layer.querySelector<HTMLElement>(".range-event-dot");
        expect(dot?.style.background).toBe("#ff0000");
      });
    });
  });

  describe("GIVEN events where one is outside rangeBounds", () => {
    const OUT_OF_RANGE = new Date(JAN_13 - 100_000).getTime();
    const EVENTS: EventMarker[] = [
      { timestamp: new Date(JAN_15) },
      { timestamp: new Date(OUT_OF_RANGE) },
    ];

    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        events: EVENTS,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN only the in-range event dot is rendered", () => {
        expect.assertions(1);
        const layer = el.shadowRoot!.getElementById("range-event-layer")!;
        expect(layer.querySelectorAll(".range-event-dot").length).toBe(1);
      });
    });
  });

  describe("GIVEN events updated reactively", () => {
    beforeEach(async () => {
      el = createElement({
        rangeBounds: SAMPLE_BOUNDS,
        events: [{ timestamp: new Date(JAN_15) }],
      });
      await el.updateComplete;
    });

    describe("WHEN events is replaced with an empty array", () => {
      it("THEN the event layer has no dot spans", async () => {
        expect.assertions(1);
        el.events = [];
        await el.updateComplete;
        const layer = el.shadowRoot!.getElementById("range-event-layer")!;
        expect(layer.querySelectorAll(".range-event-dot").length).toBe(0);
      });
    });
  });
});
