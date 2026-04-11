import { describe, expect, it, vi } from "vitest";

import {
  buildChartCardShell,
  CHART_STYLE,
  clampChartValue,
  formatTooltipDisplayValue,
  formatTooltipValue,
  positionTooltip,
  renderChartAxisHoverDots,
  renderChartAxisOverlays,
  resolveChartLabelColor,
  setupCanvas,
} from "@/lib/chart/chart-shell";

describe("chart-shell", () => {
  describe("GIVEN a chart title", () => {
    describe("WHEN buildChartCardShell is called", () => {
      it("THEN it returns the shared shell markup and style block", () => {
        expect.assertions(3);

        const markup = buildChartCardShell("Room History");

        expect(CHART_STYLE).toContain(".chart-wrap");
        expect(markup).toContain("Room History");
        expect(markup).toContain('id="chart-add-annotation"');
      });
    });
  });

  describe("GIVEN a themed element", () => {
    describe("WHEN resolveChartLabelColor is called", () => {
      it("THEN it reads the secondary text color with a fallback", () => {
        expect.assertions(2);

        const el = document.createElement("div");
        const getComputedStyleSpy = vi
          .spyOn(window, "getComputedStyle")
          .mockReturnValue({
            getPropertyValue: (name: string) =>
              name === "--secondary-text-color" ? "rgb(1, 2, 3)" : "",
          } as CSSStyleDeclaration);

        expect(resolveChartLabelColor(el)).toBe("rgb(1, 2, 3)");
        expect(resolveChartLabelColor(null)).toBe("rgba(214,218,224,0.92)");
        getComputedStyleSpy.mockRestore();
      });
    });
  });

  describe("GIVEN a canvas and padded container", () => {
    describe("WHEN setupCanvas is called", () => {
      it("THEN it sizes the canvas using the container box and DPR", () => {
        expect.assertions(5);

        const scale = vi.fn();
        const getComputedStyleSpy = vi
          .spyOn(window, "getComputedStyle")
          .mockReturnValue({
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingTop: "5px",
            paddingBottom: "5px",
          } as CSSStyleDeclaration);
        const canvas = {
          width: 0,
          height: 0,
          style: {},
          getContext: vi.fn(() => ({ scale })),
        };
        const container = document.createElement("div");
        Object.defineProperty(container, "clientWidth", {
          value: 420,
          configurable: true,
        });
        Object.defineProperty(container, "clientHeight", {
          value: 300,
          configurable: true,
        });
        const result = setupCanvas(canvas, container, 200);

        expect(result).toEqual({ w: 400, h: 190 });
        expect(canvas.width).toBeGreaterThan(0);
        expect(canvas.height).toBeGreaterThan(0);
        expect(canvas.style.width).toBe("400px");
        expect(scale).toHaveBeenCalled();
        getComputedStyleSpy.mockRestore();
      });
    });
  });

  describe("GIVEN axis overlay containers", () => {
    describe("WHEN renderChartAxisOverlays and renderChartAxisHoverDots are called", () => {
      it("THEN they render axis labels and hover dots into the correct sides", () => {
        expect.assertions(6);

        const host = document.createElement("div");
        const shadow = host.attachShadow({ mode: "open" });
        shadow.innerHTML = `
          <div class="chart-wrap"></div>
          <div id="chart-scroll-viewport"></div>
          <div id="chart-axis-left"></div>
          <div id="chart-axis-right"></div>
        `;
        const card = { shadowRoot: shadow };
        const renderer = {
          pad: { left: 42, right: 42, top: 24 },
          yOf: (tick: number) => tick * 10,
          _formatAxisTick: (tick: number) => `tick:${tick}`,
        };

        renderChartAxisOverlays(card, renderer, [
          {
            side: "left",
            slot: 0,
            min: 0,
            max: 10,
            ticks: [1, 2],
            unit: "C",
            color: "#83c705",
          },
          {
            side: "right",
            slot: 0,
            min: 0,
            max: 100,
            ticks: [5],
            unit: "%",
            color: "#ef4444",
          },
        ]);
        renderChartAxisHoverDots(card, [
          {
            hasValue: true,
            axisSide: "left",
            y: 20,
            color: "#83c705",
            opacity: 0.5,
          },
          {
            hasValue: true,
            axisSide: "right",
            y: 30,
            color: "#ef4444",
            opacity: 1,
          },
        ]);

        expect(
          shadow
            .getElementById("chart-axis-left")
            ?.classList.contains("visible")
        ).toBe(true);
        expect(
          shadow
            .getElementById("chart-axis-right")
            ?.classList.contains("visible")
        ).toBe(true);
        expect(shadow.getElementById("chart-axis-left")?.innerHTML).toContain(
          "tick:1"
        );
        expect(shadow.getElementById("chart-axis-right")?.innerHTML).toContain(
          "tick:5"
        );
        expect(
          shadow
            .getElementById("chart-axis-left")
            ?.querySelectorAll(".chart-axis-hover-dot")
        ).toHaveLength(1);
        expect(
          shadow
            .getElementById("chart-axis-right")
            ?.querySelectorAll(".chart-axis-hover-dot")
        ).toHaveLength(1);
      });
    });
  });

  describe("GIVEN tooltip values and bounds", () => {
    describe("WHEN the tooltip helpers are called", () => {
      it("THEN they clamp, format, and position values consistently", () => {
        expect.assertions(6);

        const tooltip = document.createElement("div");
        Object.defineProperty(tooltip, "getBoundingClientRect", {
          value: () => ({ width: 120, height: 40 }),
          configurable: true,
        });

        positionTooltip(tooltip, 200, 150, {
          left: 20,
          right: 260,
          top: 20,
          bottom: 220,
        });

        expect(clampChartValue(15, 20, 30)).toBe(20);
        expect(clampChartValue(35, 20, 30)).toBe(30);
        expect(formatTooltipValue(12.345, "C")).toBe("12.35 C");
        expect(formatTooltipDisplayValue("Open", "")).toBe("Open");
        expect(formatTooltipDisplayValue(null, "")).toBe("No value");
        expect(tooltip.style.left).not.toBe("");
      });
    });
  });
});
