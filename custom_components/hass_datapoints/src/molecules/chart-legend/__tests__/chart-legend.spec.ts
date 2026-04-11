import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/molecules/chart-legend/chart-legend";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("chart-legend") as HTMLElement & {
    series: Array<{
      entityId: string;
      label: string;
      color: string;
      unit: string;
    }>;
    hiddenSeries: Set<string>;
  };
  Object.assign(el, {
    series: [
      {
        entityId: "sensor.temp",
        label: "Temperature",
        color: "#2196f3",
        unit: "°C",
      },
      {
        entityId: "sensor.hum",
        label: "Humidity",
        color: "#4caf50",
        unit: "%",
      },
    ],
    hiddenSeries: new Set(),
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("chart-legend", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a legend with two series", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders two legend-item elements", () => {
        const items = el.shadowRoot!.querySelectorAll("legend-item");
        expect(items.length).toBe(2);
      });

      it("THEN both items show as pressed (visible)", () => {
        const items = el.shadowRoot!.querySelectorAll("legend-item");
        expect((items[0] as any).pressed).toBe(true);
        expect((items[1] as any).pressed).toBe(true);
      });
    });
  });

  describe("GIVEN a legend with one hidden series", () => {
    beforeEach(async () => {
      el = createElement({ hiddenSeries: new Set(["sensor.temp"]) });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the hidden series item has pressed=false", () => {
        const items = el.shadowRoot!.querySelectorAll("legend-item");
        expect((items[0] as any).pressed).toBe(false);
        expect((items[1] as any).pressed).toBe(true);
      });
    });
  });

  describe("GIVEN a legend with series", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN a legend item fires dp-legend-toggle", () => {
      it("THEN it re-dispatches dp-series-toggle with entityId", () => {
        const handler = vi.fn();
        el.addEventListener("dp-series-toggle", handler);
        const item = el.shadowRoot!.querySelector("legend-item")!;
        item.dispatchEvent(
          new CustomEvent("dp-legend-toggle", {
            detail: { pressed: false },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.entityId).toBe("sensor.temp");
        expect(handler.mock.calls[0][0].detail.visible).toBe(false);
      });
    });
  });

  describe("GIVEN an empty legend", () => {
    beforeEach(async () => {
      el = createElement({ series: [] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no legend items are shown", () => {
        const items = el.shadowRoot!.querySelectorAll("legend-item");
        expect(items.length).toBe(0);
      });
    });
  });
});
