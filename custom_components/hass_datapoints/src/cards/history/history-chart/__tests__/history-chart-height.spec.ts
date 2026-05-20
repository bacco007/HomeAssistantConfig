import { describe, expect, it } from "vitest";
import { HistoryChart } from "../history-chart";

describe("history-chart height", () => {
  describe("GIVEN ha-card has no measurable height", () => {
    describe("WHEN available height is computed repeatedly", () => {
      it("THEN it does not grow via host height feedback loop", () => {
        expect.assertions(3);

        const card = document.createElement("ha-card") as HTMLElement;
        const header = document.createElement("div");
        header.className = "card-header";
        card.appendChild(header);

        document.body.appendChild(card);

        const chart = new HistoryChart();
        card.appendChild(chart);

        // Simulate runaway host sizing from a previous render.
        Object.defineProperty(chart, "clientHeight", {
          configurable: true,
          get() {
            return 10_000;
          },
        });

        const first = (
          chart as unknown as { _getAvailableChartHeight: any }
        )._getAvailableChartHeight(280) as number;
        const second = (
          chart as unknown as { _getAvailableChartHeight: any }
        )._getAvailableChartHeight(280) as number;

        expect(first).toBe(280);
        expect(second).toBe(280);
        expect(second).toBe(first);
      });
    });
  });
});
