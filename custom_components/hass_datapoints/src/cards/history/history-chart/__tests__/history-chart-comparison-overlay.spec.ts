import { describe, expect, it } from "vitest";
import "../history-chart-comparison-overlay";

function createElement(windowLabel = "", actualLabel = "") {
  const el = document.createElement(
    "history-chart-comparison-overlay"
  ) as import("../history-chart-comparison-overlay").HistoryChartComparisonOverlay;
  el.windowRangeLabel = windowLabel;
  el.actualRangeLabel = actualLabel;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("history-chart-comparison-overlay", () => {
  describe("GIVEN both labels are provided", () => {
    it("THEN renders both label lines", async () => {
      expect.assertions(2);
      const el = createElement("Jan 1 – Jan 7", "Jan 8 – Jan 14");
      await el.updateComplete;
      const lines = el.shadowRoot?.querySelectorAll(".line") ?? [];
      expect(lines.length).toBe(2);
      expect(el.hidden).toBe(false);
      cleanup(el);
    });
  });

  describe("GIVEN no labels are provided", () => {
    it("THEN is hidden", async () => {
      expect.assertions(1);
      const el = createElement("", "");
      await el.updateComplete;
      expect(el.hidden).toBe(true);
      cleanup(el);
    });
  });

  describe("GIVEN only window label is provided", () => {
    it("THEN is hidden", async () => {
      expect.assertions(1);
      const el = createElement("Jan 1 – Jan 7", "");
      await el.updateComplete;
      expect(el.hidden).toBe(true);
      cleanup(el);
    });
  });

  describe("GIVEN left offset is set", () => {
    it("THEN applies left positioning", async () => {
      expect.assertions(1);
      const el = createElement("Jan 1 – Jan 7", "Jan 8 – Jan 14");
      el.leftOffset = 50;
      await el.updateComplete;
      expect(el.style.left).toBe("58px");
      cleanup(el);
    });
  });
});
