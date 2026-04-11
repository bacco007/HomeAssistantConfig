import { afterEach, describe, expect, it, vi } from "vitest";

import { createHistoryPageOrchestrationContext } from "../orchestration-context";

describe("orchestration-context", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN a target picker control", () => {
    describe("WHEN the inner generic picker exists", () => {
      it("THEN it opens the generic picker instead of clicking the host", () => {
        expect.assertions(5);
        const context = createHistoryPageOrchestrationContext();
        const open = vi.fn();
        const focus = vi.fn();
        const click = vi.fn();
        const slotContainer = document.createElement("div");
        slotContainer.style.display = "none";
        const assignedSlot = document.createElement("slot");
        slotContainer.appendChild(assignedSlot);
        document.body.appendChild(slotContainer);
        const targetControl = {
          shadowRoot: {
            querySelector: vi.fn(() => ({ open })),
          },
          assignedSlot,
          style: {},
          focus,
          click,
        } as unknown as HTMLElement;
        const anchorEl = {
          getBoundingClientRect: () => ({
            left: 12,
            top: 24,
            width: 28,
            height: 28,
          }),
        } as unknown as HTMLElement;

        context.openTargetPicker(targetControl, anchorEl);

        expect(open).toHaveBeenCalledTimes(1);
        expect(focus).not.toHaveBeenCalled();
        expect(click).not.toHaveBeenCalled();
        expect(slotContainer.style.position).toBe("fixed");
        expect(slotContainer.style.width).toBe("320px");

        slotContainer.remove();
      });
    });
  });

  describe("GIVEN a chart resize redraw is requested", () => {
    describe("WHEN an inner chart only supports queued redraws", () => {
      it("THEN it replays the queued draw call from the last args", () => {
        expect.assertions(2);
        const context = createHistoryPageOrchestrationContext();
        const queueDraw = vi.fn();
        const innerChart = {
          _lastDrawArgs: ["a", "b"],
          _queueDrawChart: queueDraw,
        };
        const chartEl = {
          shadowRoot: {
            querySelector: vi.fn((selector: string) => {
              if (selector === "hass-datapoints-history-chart") {
                return innerChart;
              }
              return null;
            }),
          },
        } as unknown as HTMLElement;
        const rafSpy = vi
          .spyOn(window, "requestAnimationFrame")
          .mockImplementation((callback: FrameRequestCallback) => {
            callback(16);
            return 1;
          });

        context.requestChartResizeRedraw(chartEl);

        expect(rafSpy).toHaveBeenCalledTimes(1);
        expect(queueDraw).toHaveBeenCalledWith("a", "b");
      });
    });
  });

  describe("GIVEN a history chart top slot is available", () => {
    describe("WHEN rendering comparison tabs", () => {
      it("THEN it mounts and updates the comparison tab rail in the chart host", () => {
        expect.assertions(4);
        const context = createHistoryPageOrchestrationContext();
        const topSlot = document.createElement("div");
        topSlot.id = "chart-top-slot";
        topSlot.hidden = true;
        const innerChart = document.createElement("div");
        innerChart.appendChild(topSlot);
        const chartHost = document.createElement("div");
        const shadowRoot = chartHost.attachShadow({ mode: "open" });
        const namespacedChart = document.createElement(
          "hass-datapoints-history-chart"
        );
        namespacedChart.appendChild(innerChart);
        shadowRoot.appendChild(namespacedChart);

        const result = context.renderComparisonTabs({
          chartEl: chartHost,
          comparisonWindows: [
            {
              id: "window-a",
              label: "January",
              start_time: "2026-01-01T00:00:00.000Z",
              end_time: "2026-01-02T00:00:00.000Z",
            },
          ],
          selectedComparisonWindowId: null,
          hoveredComparisonWindowId: "window-a",
          startTime: new Date("2026-03-01T00:00:00.000Z"),
          endTime: new Date("2026-03-02T00:00:00.000Z"),
          loadingComparisonWindowIds: ["window-a"],
          comparisonTabRailComp: null,
          comparisonTabsHostEl: null,
          formatComparisonLabel: () => "1 Mar - 2 Mar",
          onActivate: vi.fn(),
          onHover: vi.fn(),
          onLeave: vi.fn(),
          onEdit: vi.fn(),
          onDelete: vi.fn(),
          onAdd: vi.fn(),
        });

        expect(topSlot.hidden).toBe(false);
        expect(result.comparisonTabsHostEl).toBe(topSlot);
        expect(result.comparisonTabRailComp).toBeInstanceOf(HTMLElement);
        expect(topSlot.children).toHaveLength(1);
      });
    });
  });

  describe("GIVEN comparison tab hover state", () => {
    describe("WHEN hovering a new comparison tab", () => {
      it("THEN it updates hover state and triggers the dependent refreshes", () => {
        expect.assertions(4);
        const context = createHistoryPageOrchestrationContext();
        const setHoveredComparisonWindowId = vi.fn();
        const updateComparisonRangePreview = vi.fn();
        const updateChartHoverIndicator = vi.fn();
        const renderContent = vi.fn();

        context.handleComparisonTabHover({
          id: "window-a",
          hoveredComparisonWindowId: null,
          setHoveredComparisonWindowId,
          updateComparisonRangePreview,
          updateChartHoverIndicator,
          renderContent,
        });

        expect(setHoveredComparisonWindowId).toHaveBeenCalledWith("window-a");
        expect(updateComparisonRangePreview).toHaveBeenCalledTimes(1);
        expect(updateChartHoverIndicator).toHaveBeenCalledTimes(1);
        expect(renderContent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("GIVEN comparison tab activation", () => {
    describe("WHEN activating the current-range tab", () => {
      it("THEN it clears selection and triggers the current-range UI refresh", () => {
        expect.assertions(5);
        const context = createHistoryPageOrchestrationContext();
        const setSelectedComparisonWindowId = vi.fn();
        const setHoveredComparisonWindowId = vi.fn();
        const clearDeltaAnalysisSelectionState = vi.fn();
        const renderComparisonTabs = vi.fn();
        const setAdjustComparisonAxisScale = vi.fn();

        context.handleComparisonTabActivate({
          id: "current-range",
          comparisonWindows: [],
          selectedComparisonWindowId: "window-a",
          setSelectedComparisonWindowId,
          setHoveredComparisonWindowId,
          clearDeltaAnalysisSelectionState,
          updateComparisonRangePreview: vi.fn(),
          updateChartHoverIndicator: vi.fn(),
          renderComparisonTabs,
          renderContent: vi.fn(),
          setAdjustComparisonAxisScale,
        });

        expect(setSelectedComparisonWindowId).toHaveBeenCalledWith(null);
        expect(setHoveredComparisonWindowId).toHaveBeenCalledWith(null);
        expect(clearDeltaAnalysisSelectionState).toHaveBeenCalledTimes(1);
        expect(renderComparisonTabs).toHaveBeenCalledTimes(1);
        expect(setAdjustComparisonAxisScale).toHaveBeenCalledWith(false);
      });
    });
  });
});
