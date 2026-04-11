import { afterEach, describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";
import { normalizeHistorySeriesAnalysis } from "@/lib/domain/history-series";

describe("HassRecordsHistoryPanel URL sync", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN a page-level chart display option changes", () => {
    describe("WHEN the option is applied", () => {
      it("THEN it updates the URL", () => {
        expect.assertions(3);
        const saveSessionState = vi.fn();
        const updateUrl = vi.fn();
        const renderSidebarOptions = vi.fn();
        const renderContent = vi.fn();
        const panel = {
          _showChartEmphasizedHoverGuides: false,
          _saveSessionState: saveSessionState,
          _updateUrl: updateUrl,
          _renderSidebarOptions: renderSidebarOptions,
          _renderContent: renderContent,
        };

        HassRecordsHistoryPanel.prototype._setChartDatapointDisplayOption.call(
          panel,
          "hover_guides",
          true
        );

        expect(panel._showChartEmphasizedHoverGuides).toBe(true);
        expect(saveSessionState).toHaveBeenCalledTimes(1);
        expect(updateUrl).toHaveBeenCalledWith({ push: false });
      });
    });
  });

  describe("GIVEN the sidebar collapsed state changes", () => {
    describe("WHEN toggling the sidebar", () => {
      it("THEN it updates the URL", () => {
        expect.assertions(3);
        const saveSessionState = vi.fn();
        const updateUrl = vi.fn();
        const syncSidebarUi = vi.fn();
        const syncRangeControl = vi.fn();
        const hideCollapsedTargetPopup = vi.fn();
        const rafSpy = vi
          .spyOn(window, "requestAnimationFrame")
          .mockImplementation((cb: FrameRequestCallback) => {
            cb(0);
            return 1;
          });
        const panel = {
          _sidebarCollapsed: false,
          _saveSessionState: saveSessionState,
          _updateUrl: updateUrl,
          _syncSidebarUi: syncSidebarUi,
          _syncRangeControl: syncRangeControl,
          _hideCollapsedTargetPopup: hideCollapsedTargetPopup,
          isConnected: true,
        };

        HassRecordsHistoryPanel.prototype._toggleSidebarCollapsed.call(panel);

        expect(panel._sidebarCollapsed).toBe(true);
        expect(updateUrl).toHaveBeenCalledWith({ push: false });
        expect(rafSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("GIVEN a target analysis option changes", () => {
    describe("WHEN the row analysis is updated", () => {
      it("THEN it updates the URL", () => {
        expect.assertions(3);
        const saveSessionState = vi.fn();
        const updateUrl = vi.fn();
        const renderTargetRows = vi.fn();
        const renderSidebarOptions = vi.fn();
        const renderContent = vi.fn();
        const panel = {
          _seriesRows: [
            {
              entity_id: "sensor.temp",
              color: "#03a9f4",
              visible: true,
              analysis: normalizeHistorySeriesAnalysis(null),
            },
          ],
          _saveSessionState: saveSessionState,
          _updateUrl: updateUrl,
          _renderTargetRows: renderTargetRows,
          _renderSidebarOptions: renderSidebarOptions,
          _renderContent: renderContent,
        };

        HassRecordsHistoryPanel.prototype._setSeriesAnalysisOption.call(
          panel,
          "sensor.temp",
          "show_trend_lines",
          true
        );

        expect(panel._seriesRows[0].analysis.show_trend_lines).toBe(true);
        expect(saveSessionState).toHaveBeenCalledTimes(1);
        expect(updateUrl).toHaveBeenCalledWith({ push: false });
      });
    });
  });
});
