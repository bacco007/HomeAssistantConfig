import { beforeEach, describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";

describe("HassRecordsHistoryPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN a mounted history chart with previous draw arguments", () => {
    describe("WHEN requesting a chart resize redraw", () => {
      it("THEN it replays the last chart draw on the next animation frame", async () => {
        expect.assertions(4);
        const drawSpy = vi.fn();
        const rafSpy = vi
          .spyOn(window, "requestAnimationFrame")
          .mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
          });
        const requestChartResizeRedraw = vi.fn((chartEl) => {
          if (
            Array.isArray(chartEl?._lastDrawArgs) &&
            typeof chartEl?._drawChart === "function"
          ) {
            window.requestAnimationFrame(() => {
              chartEl._drawChart(...chartEl._lastDrawArgs);
            });
          }
        });
        const panel = {
          _context: {
            orchestration: {
              requestChartResizeRedraw,
            },
          },
          _chartEl: {
            _lastDrawArgs: ["hist", "stats", [], 1, 2, { drawRequestId: 7 }],
            _drawChart: drawSpy,
          },
        };

        HassRecordsHistoryPanel.prototype._requestChartResizeRedraw.call(panel);

        expect(rafSpy).toHaveBeenCalledOnce();
        expect(drawSpy).toHaveBeenCalledOnce();
        expect(drawSpy).toHaveBeenCalledWith("hist", "stats", [], 1, 2, {
          drawRequestId: 7,
        });
        expect(requestChartResizeRedraw).toHaveBeenCalledWith(panel._chartEl);
      });
    });
  });

  describe("GIVEN a panel with orchestration context", () => {
    describe("WHEN requesting another chart resize redraw", () => {
      it("THEN it delegates the redraw request to orchestration", () => {
        expect.assertions(1);
        const requestChartResizeRedraw = vi.fn();
        const panel = {
          _context: {
            orchestration: {
              requestChartResizeRedraw,
            },
          },
          _chartEl: null,
        };

        HassRecordsHistoryPanel.prototype._requestChartResizeRedraw.call(panel);

        expect(requestChartResizeRedraw).toHaveBeenCalledWith(null);
      });
    });
  });
});
