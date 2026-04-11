import { describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";
import { createHistoryPageOrchestrationContext } from "../context/orchestration-context";

describe("HassRecordsHistoryPanel comparison tabs", () => {
  describe("GIVEN the history card wraps an inner namespaced chart element", () => {
    describe("WHEN rendering comparison tabs", () => {
      it("THEN it mounts the tab rail into the inner chart top slot", () => {
        expect.assertions(4);
        const topSlot = document.createElement("div");
        topSlot.id = "chart-top-slot";
        topSlot.hidden = true;

        const innerChart = document.createElement("div");
        innerChart.appendChild(topSlot);

        const cardHost = document.createElement("div");
        const shadowRoot = cardHost.attachShadow({ mode: "open" });
        const chartHost = document.createElement(
          "hass-datapoints-history-chart"
        );
        chartHost.appendChild(innerChart);
        shadowRoot.appendChild(chartHost);

        const panel = {
          _context: {
            orchestration: createHistoryPageOrchestrationContext(),
          },
          _chartEl: cardHost,
          _comparisonWindows: [],
          _selectedComparisonWindowId: null,
          _hoveredComparisonWindowId: null,
          _startTime: new Date("2025-01-01T00:00:00Z"),
          _endTime: new Date("2025-01-02T00:00:00Z"),
          _comparisonTabRailComp: null,
          _comparisonTabsHostEl: null,
          _loadingComparisonWindowIds: [],
          _formatComparisonLabel: vi.fn(() => "Jan 1"),
          _handleComparisonTabActivate: vi.fn(),
          _handleComparisonTabHover: vi.fn(),
          _handleComparisonTabLeave: vi.fn(),
          _openDateWindowDialog: vi.fn(),
          _deleteDateWindow: vi.fn(),
        };

        HassRecordsHistoryPanel.prototype._renderComparisonTabs.call(panel);

        expect(panel._comparisonTabsHostEl).toBe(topSlot);
        expect(topSlot.hidden).toBe(false);
        expect(panel._comparisonTabRailComp).toBeInstanceOf(HTMLElement);
        expect(topSlot.children).toHaveLength(1);
      });
    });
  });

  describe("GIVEN the history card still wraps the legacy dp-history-chart element", () => {
    describe("WHEN rendering comparison tabs", () => {
      it("THEN it mounts the tab rail into the legacy chart top slot", () => {
        expect.assertions(4);
        const topSlot = document.createElement("div");
        topSlot.id = "chart-top-slot";
        topSlot.hidden = true;

        const legacyChart = document.createElement("dp-history-chart");
        legacyChart.appendChild(topSlot);

        const cardHost = document.createElement("div");
        const shadowRoot = cardHost.attachShadow({ mode: "open" });
        shadowRoot.appendChild(legacyChart);

        const panel = {
          _context: {
            orchestration: createHistoryPageOrchestrationContext(),
          },
          _chartEl: cardHost,
          _comparisonWindows: [],
          _selectedComparisonWindowId: null,
          _hoveredComparisonWindowId: null,
          _startTime: new Date("2025-01-01T00:00:00Z"),
          _endTime: new Date("2025-01-02T00:00:00Z"),
          _comparisonTabRailComp: null,
          _comparisonTabsHostEl: null,
          _loadingComparisonWindowIds: [],
          _formatComparisonLabel: vi.fn(() => "Jan 1"),
          _handleComparisonTabActivate: vi.fn(),
          _handleComparisonTabHover: vi.fn(),
          _handleComparisonTabLeave: vi.fn(),
          _openDateWindowDialog: vi.fn(),
          _deleteDateWindow: vi.fn(),
        };

        HassRecordsHistoryPanel.prototype._renderComparisonTabs.call(panel);

        expect(panel._comparisonTabsHostEl).toBe(topSlot);
        expect(topSlot.hidden).toBe(false);
        expect(panel._comparisonTabRailComp).toBeInstanceOf(HTMLElement);
        expect(topSlot.children).toHaveLength(1);
      });
    });
  });
});
