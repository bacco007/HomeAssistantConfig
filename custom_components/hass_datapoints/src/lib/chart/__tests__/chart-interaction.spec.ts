import { describe, expect, it } from "vitest";
import { html, render } from "lit";

import {
  buildTooltipRelatedChips,
  dispatchLineChartHover,
  hideTooltip,
  resolveLineChartHoverTime,
  showLineChartCrosshair,
  showLineChartTooltip,
  showTooltip,
} from "@/lib/chart/chart-interaction";

function createCard() {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <div class="chart-wrap"></div>
    <div id="annotation-tooltips"></div>
    <div id="chart-axis-left"></div>
    <div id="chart-axis-right"></div>
    <div id="tooltip">
      <div id="tt-time"></div>
      <div id="tt-value"></div>
      <div id="tt-series"></div>
      <div id="tt-message-row"></div>
      <div id="tt-dot"></div>
      <div id="tt-message"></div>
      <div id="tt-annotation"></div>
      <div id="tt-entities"></div>
    </div>
    <div id="anomaly-tooltip"></div>
    <div id="chart-crosshair" hidden>
      <div id="crosshair-vertical"></div>
      <div id="crosshair-horizontal"></div>
      <div id="crosshair-points"></div>
    </div>
    <button id="chart-add-annotation" hidden></button>
  `;
  shadow.querySelector(".chart-wrap")?.setAttribute("style", "display:block");
  Object.defineProperty(
    shadow.querySelector(".chart-wrap")!,
    "getBoundingClientRect",
    {
      value: () => ({
        left: 10,
        right: 410,
        top: 20,
        bottom: 220,
        width: 400,
        height: 200,
      }),
      configurable: true,
    }
  );
  Object.defineProperty(
    shadow.getElementById("tooltip")!,
    "getBoundingClientRect",
    {
      value: () => ({ width: 120, height: 40 }),
      configurable: true,
    }
  );

  return {
    _hass: {
      states: {
        "sensor.alpha": {
          attributes: {
            friendly_name: "Alpha Sensor",
            icon: "mdi:thermometer",
          },
        },
      },
      entities: {
        "sensor.alpha": {
          device_id: "device.one",
          area_id: "kitchen",
          labels: ["heating"],
        },
      },
      devices: {
        "device.one": { name: "Radiator" },
      },
      areas: {
        kitchen: { name: "Kitchen" },
      },
      labels: {
        heating: { name: "Heating" },
      },
      shadowRoot: shadow,
      dispatchEvent: host.dispatchEvent.bind(host),
    },
    shadowRoot: shadow,
    dispatchEvent: host.dispatchEvent.bind(host),
    addEventListener: host.addEventListener.bind(host),
  };
}

describe("chart-interaction", () => {
  describe("GIVEN related event ids", () => {
    describe("WHEN buildTooltipRelatedChips is called", () => {
      it("THEN it returns icon chips for related entities and targets", () => {
        expect.assertions(2);

        const card = createCard();
        const chips = buildTooltipRelatedChips(card._hass, {
          entity_ids: ["sensor.alpha"],
          device_ids: ["device.one"],
        });
        const container = document.createElement("div");
        render(chips ?? html``, container);

        expect(container.textContent).toContain("Alpha Sensor");
        expect(container.textContent).toContain("Radiator");
      });
    });
  });

  describe("GIVEN a single datapoint event", () => {
    describe("WHEN showTooltip and hideTooltip are called", () => {
      it("THEN they populate and hide the shared tooltip shell", () => {
        expect.assertions(5);

        const card = createCard();

        showTooltip(
          card,
          null,
          null,
          {
            timestamp: "2026-04-07T10:00:00.000Z",
            chart_value: 12.3,
            chart_unit: "C",
            color: "#83c705",
            message: "Window opened",
            annotation: "Bedroom",
            entity_ids: ["sensor.alpha"],
          },
          120,
          100
        );

        expect(card.shadowRoot.getElementById("tt-message")?.textContent).toBe(
          "Window opened"
        );
        expect(
          card.shadowRoot.getElementById("tt-annotation")?.textContent
        ).toBe("Bedroom");
        expect(
          card.shadowRoot.getElementById("tt-entities")?.innerHTML
        ).toContain("Alpha Sensor");

        hideTooltip(card);

        expect(
          (card.shadowRoot.getElementById("tooltip") as HTMLElement).style
            .display
        ).toBe("none");
        expect(
          (card.shadowRoot.getElementById("anomaly-tooltip") as HTMLElement)
            .style.display
        ).toBe("none");
      });
    });
  });

  describe("GIVEN a hover event", () => {
    describe("WHEN dispatchLineChartHover is called", () => {
      it("THEN it emits the composed chart hover event", async () => {
        expect.assertions(1);

        const card = createCard();

        await expect(
          new Promise((resolve) => {
            card.addEventListener(
              "hass-datapoints-chart-hover",
              (event: Event) => {
                resolve((event as CustomEvent).detail);
              }
            );
            dispatchLineChartHover(card, { timeMs: 123 });
          })
        ).resolves.toEqual({ timeMs: 123 });
      });
    });
  });

  describe("GIVEN a hover time and visible series", () => {
    const series = [
      {
        pts: [
          [100, 1],
          [200, 2],
          [400, 4],
        ],
      },
      {
        pts: [
          [150, 10],
          [350, 30],
        ],
      },
    ];

    describe("WHEN hover mode is follow_series", () => {
      it("THEN it returns the original hover time", () => {
        expect.assertions(1);
        expect(resolveLineChartHoverTime(series, 260, "follow_series")).toBe(
          260
        );
      });
    });

    describe("WHEN hover mode is snap_to_data_points", () => {
      it("THEN it returns the nearest real datapoint timestamp", () => {
        expect.assertions(1);
        expect(
          resolveLineChartHoverTime(series, 260, "snap_to_data_points")
        ).toBe(200);
      });
    });

    describe("WHEN no series have datapoints", () => {
      it("THEN it falls back to the original hover time", () => {
        expect.assertions(1);
        expect(resolveLineChartHoverTime([], 260, "snap_to_data_points")).toBe(
          260
        );
      });
    });
  });

  describe("GIVEN a rendered chart hover state", () => {
    describe("WHEN showLineChartCrosshair is called", () => {
      it("THEN it renders the crosshair lines, points, and add button", () => {
        expect.assertions(4);

        const card = createCard();
        const renderer = {
          pad: { top: 24 },
          ch: 120,
        };

        showLineChartCrosshair(card, renderer, {
          x: 120,
          values: [
            {
              hasValue: true,
              x: 120,
              y: 80,
              color: "#83c705",
              axisSide: "left",
              opacity: 1,
            },
          ],
        });

        expect(
          card.shadowRoot
            .getElementById("chart-crosshair")
            ?.hasAttribute("hidden")
        ).toBe(false);
        expect(
          (card.shadowRoot.getElementById("crosshair-vertical") as HTMLElement)
            .style.left
        ).toBe("120px");
        expect(
          card.shadowRoot.getElementById("crosshair-points")?.innerHTML
        ).toContain("crosshair-point");
        expect(
          card.shadowRoot
            .getElementById("chart-add-annotation")
            ?.hasAttribute("hidden")
        ).toBe(false);
      });

      it("THEN it renders rate-of-change crosshair points when only rate crosshairs are enabled", () => {
        expect.assertions(1);

        const card = createCard();
        const renderer = {
          pad: { top: 24 },
          ch: 120,
        };

        showLineChartCrosshair(card, renderer, {
          x: 120,
          values: [],
          rateValues: [
            {
              hasValue: true,
              x: 120,
              y: 48,
              color: "#ff5500",
              axisSide: "right",
              opacity: 0.66,
              showCrosshair: true,
            },
          ],
          showRateCrosshairs: true,
        });

        expect(
          card.shadowRoot.getElementById("crosshair-points")?.innerHTML
        ).toContain("crosshair-point");
      });
    });
  });

  describe("GIVEN a hovered comparison window with derived analysis rows", () => {
    describe("WHEN showLineChartTooltip is called", () => {
      it("THEN it renders the date window tooltip rows for trend, rate, min/max, and threshold", () => {
        expect.assertions(9);

        const card = createCard();

        showLineChartTooltip(
          card,
          {
            timeMs: Date.parse("2026-04-07T10:00:00.000Z"),
            values: [],
            comparisonValues: [
              {
                entityId: "february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                label: "Alpha Sensor",
                windowLabel: "February",
                value: 21.5,
                unit: "C",
                color: "#ff00ff",
                hasValue: true,
              },
            ],
            trendValues: [
              {
                entityId: "trend:february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                comparisonParentId: "february:sensor.alpha",
                label: "Alpha Sensor",
                baseLabel: "Alpha Sensor",
                windowLabel: "February",
                value: 21.2,
                unit: "C",
                color: "#ff00ff",
                hasValue: true,
                trend: true,
                comparisonDerived: true,
              },
            ],
            rateValues: [
              {
                entityId: "rate:february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                comparisonParentId: "february:sensor.alpha",
                label: "Alpha Sensor",
                baseLabel: "Alpha Sensor",
                windowLabel: "February",
                value: 0.4,
                unit: "C/h",
                color: "#ff00ff",
                hasValue: true,
                rate: true,
                comparisonDerived: true,
              },
            ],
            summaryValues: [
              {
                entityId: "summary:min:february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                comparisonParentId: "february:sensor.alpha",
                label: "Alpha Sensor",
                baseLabel: "Alpha Sensor",
                windowLabel: "February",
                value: 18.2,
                unit: "C",
                color: "#ff00ff",
                hasValue: true,
                summary: true,
                summaryType: "min",
                comparisonDerived: true,
              },
              {
                entityId: "summary:max:february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                comparisonParentId: "february:sensor.alpha",
                label: "Alpha Sensor",
                baseLabel: "Alpha Sensor",
                windowLabel: "February",
                value: 24.8,
                unit: "C",
                color: "#ff00ff",
                hasValue: true,
                summary: true,
                summaryType: "max",
                comparisonDerived: true,
              },
            ],
            thresholdValues: [
              {
                entityId: "threshold:february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                comparisonParentId: "february:sensor.alpha",
                label: "Alpha Sensor",
                baseLabel: "Alpha Sensor",
                windowLabel: "February",
                value: 25,
                unit: "C",
                color: "#ff00ff",
                hasValue: true,
                threshold: true,
                comparisonDerived: true,
              },
            ],
          },
          120,
          100
        );

        const tooltip = card.shadowRoot.getElementById(
          "tooltip"
        ) as HTMLElement;
        const seriesMarkup =
          card.shadowRoot.getElementById("tt-series")?.innerHTML || "";
        const dateWindowIndex = seriesMarkup.indexOf("February: Alpha Sensor");
        const groupedTrendIndex = seriesMarkup.indexOf("Trend");

        expect(tooltip.style.display).toBe("block");
        expect(seriesMarkup).toContain("February: Alpha Sensor");
        expect(seriesMarkup).toContain("Trend");
        expect(seriesMarkup).toContain("Rate");
        expect(seriesMarkup).toContain("MIN");
        expect(seriesMarkup).toContain("MAX");
        expect(seriesMarkup).toContain("Threshold");
        expect(seriesMarkup).not.toContain("Trend: Alpha Sensor");
        expect(groupedTrendIndex).toBeGreaterThan(dateWindowIndex);
      });
    });
  });

  describe("GIVEN only a comparison window value is present", () => {
    describe("WHEN showLineChartTooltip is called", () => {
      it("THEN it renders the date window row instead of collapsing to a bare value", () => {
        expect.assertions(3);

        const card = createCard();

        showLineChartTooltip(
          card,
          {
            timeMs: Date.parse("2026-04-10T02:30:00.000Z"),
            values: [],
            comparisonValues: [
              {
                entityId: "february:sensor.alpha",
                relatedEntityId: "sensor.alpha",
                label: "Temperature",
                windowLabel: "Date window",
                value: 19.82,
                unit: "C",
                color: "#03a9f4",
                hasValue: true,
                comparison: true,
              },
            ],
            trendValues: [],
            rateValues: [],
            deltaValues: [],
            summaryValues: [],
            thresholdValues: [],
          },
          210,
          120
        );

        const ttValue = card.shadowRoot.getElementById(
          "tt-value"
        ) as HTMLElement;
        const ttSeries = card.shadowRoot.getElementById(
          "tt-series"
        ) as HTMLElement;

        expect(ttValue.style.display).toBe("none");
        expect(ttSeries.style.display).toBe("grid");
        expect(ttSeries.innerHTML).toContain("Date window: Temperature");
      });
    });
  });
});
