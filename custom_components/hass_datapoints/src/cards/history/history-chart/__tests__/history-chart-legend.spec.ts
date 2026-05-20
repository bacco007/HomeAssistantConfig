import { describe, expect, it, vi } from "vitest";
import type { LegendItem } from "../history-chart-legend";
import "../history-chart-legend";

function createElement(
  items: LegendItem[],
  hiddenSeries: Set<string> = new Set()
) {
  const el = document.createElement(
    "history-chart-legend"
  ) as import("../history-chart-legend").HistoryChartLegend;
  el.items = items;
  el.hiddenSeries = hiddenSeries;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("history-chart-legend", () => {
  describe("GIVEN items are provided", () => {
    it("THEN renders a legend toggle for each item", async () => {
      expect.assertions(1);
      const el = createElement([
        { entityId: "sensor.temp", label: "Temperature", color: "#ff0000" },
        { entityId: "sensor.humid", label: "Humidity", color: "#00ff00" },
      ]);
      await el.updateComplete;
      const buttons = el.shadowRoot?.querySelectorAll(".legend-toggle") ?? [];
      expect(buttons.length).toBe(2);
      cleanup(el);
    });
  });

  describe("GIVEN an item is in hiddenSeries", () => {
    it("THEN aria-pressed is false for that item", async () => {
      expect.assertions(2);
      const el = createElement(
        [
          { entityId: "sensor.temp", label: "Temperature", color: "#ff0000" },
          { entityId: "sensor.humid", label: "Humidity", color: "#00ff00" },
        ],
        new Set(["sensor.temp"])
      );
      await el.updateComplete;
      const buttons = el.shadowRoot?.querySelectorAll(
        ".legend-toggle"
      ) as NodeListOf<HTMLButtonElement>;
      expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
      expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
      cleanup(el);
    });
  });

  describe("GIVEN a legend toggle is clicked", () => {
    it("THEN dispatches dp-legend-toggle with the entityId", async () => {
      expect.assertions(2);
      const el = createElement([
        { entityId: "sensor.temp", label: "Temperature", color: "#ff0000" },
      ]);
      await el.updateComplete;
      const handler = vi.fn();
      el.addEventListener("dp-legend-toggle", handler);
      const button = el.shadowRoot?.querySelector(
        ".legend-toggle"
      ) as HTMLButtonElement;
      button.click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.entityId).toBe("sensor.temp");
      cleanup(el);
    });
  });

  describe("GIVEN items is empty", () => {
    it("THEN renders nothing", async () => {
      expect.assertions(1);
      const el = createElement([]);
      await el.updateComplete;
      const buttons = el.shadowRoot?.querySelectorAll(".legend-toggle") ?? [];
      expect(buttons.length).toBe(0);
      cleanup(el);
    });
  });

  describe("GIVEN wrap-rows is set", () => {
    it("THEN the host element has the wrap-rows attribute", async () => {
      expect.assertions(1);
      const el = createElement([
        { entityId: "sensor.temp", label: "Temperature", color: "#ff0000" },
      ]);
      el.wrapRows = true;
      await el.updateComplete;
      expect(el.getAttribute("wrap-rows")).not.toBeNull();
      cleanup(el);
    });
  });

  describe("GIVEN legend item color", () => {
    it("THEN applies the color to the legend line", async () => {
      expect.assertions(1);
      const el = createElement([
        { entityId: "sensor.temp", label: "Temperature", color: "#ff0000" },
      ]);
      await el.updateComplete;
      const line = el.shadowRoot?.querySelector(
        ".legend-line"
      ) as HTMLSpanElement;
      expect(line.style.background).toContain("#ff0000");
      cleanup(el);
    });
  });
});
