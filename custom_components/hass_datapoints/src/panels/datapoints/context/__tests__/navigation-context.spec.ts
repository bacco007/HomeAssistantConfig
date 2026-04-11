import { afterEach, describe, expect, it, vi } from "vitest";

import { createHistoryPageNavigationContext } from "../navigation-context";

describe("navigation-context", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
  });

  describe("GIVEN URL state is read", () => {
    describe("WHEN the current location contains history query params", () => {
      it("THEN it parses the URL state and session memory together", () => {
        expect.assertions(8);
        window.sessionStorage.setItem(
          "hass_datapoints:panel_history_session",
          JSON.stringify({ sidebar_collapsed: true })
        );
        window.history.replaceState(
          null,
          "",
          `/hass-datapoints-history?entity_id=sensor.one&start_time=2026-01-01T00:00:00.000Z&end_time=2026-01-02T00:00:00.000Z&hours_to_show=24&series_colors=temperature:%23abcdef&page_state=${encodeURIComponent(JSON.stringify({ datapoint_scope: "hidden" }))}`
        );

        const context = createHistoryPageNavigationContext();
        const state = context.readStateFromLocation();

        expect(state.entityFromUrl).toBe("sensor.one");
        expect(state.startFromUrl).toBe("2026-01-01T00:00:00.000Z");
        expect(state.endFromUrl).toBe("2026-01-02T00:00:00.000Z");
        expect(state.hoursFromUrl).toBe(24);
        expect(state.pageStateFromUrl).toEqual({ datapoint_scope: "hidden" });
        expect(state.hasTargetInUrl).toBe(true);
        expect(state.hasRangeInUrl).toBe(true);
        expect(state.sessionState).toEqual({ sidebar_collapsed: true });
      });
    });
  });

  describe("GIVEN session memory is saved", () => {
    describe("WHEN the save helper is called", () => {
      it("THEN it writes the built session payload into sessionStorage", () => {
        expect.assertions(1);
        const context = createHistoryPageNavigationContext();

        context.saveSessionState({
          _entities: ["sensor.one"],
          _seriesRows: [],
          _targetSelection: {},
          _targetSelectionRaw: {},
          _datapointScope: "linked",
          _showChartDatapointIcons: true,
          _showChartDatapointLines: true,
          _showChartTooltips: true,
          _showChartEmphasizedHoverGuides: false,
          _chartHoverSnapMode: "follow_series",
          _delinkChartYAxis: false,
          _splitChartView: false,
          _showCorrelatedAnomalies: false,
          _chartAnomalyOverlapMode: "all",
          _showDataGaps: true,
          _dataGapThreshold: "2h",
          _contentSplitRatio: 0.5,
          _startTime: null,
          _endTime: null,
          _chartZoomCommittedRange: null,
          _comparisonWindows: [],
          _hours: 24,
          _sidebarCollapsed: true,
          _sidebarAccordionTargetsOpen: true,
          _sidebarAccordionDatapointsOpen: true,
          _sidebarAccordionAnalysisOpen: true,
          _sidebarAccordionChartOpen: true,
        });

        expect(
          JSON.parse(
            window.sessionStorage.getItem(
              "hass_datapoints:panel_history_session"
            ) || "null"
          )?.sidebar_collapsed
        ).toBe(true);
      });
    });
  });

  describe("GIVEN the page URL is updated", () => {
    describe("WHEN new panel state is written to the location", () => {
      it("THEN it serializes the history URL params through browser history", () => {
        expect.assertions(5);
        const context = createHistoryPageNavigationContext();
        const replaceSpy = vi.spyOn(window.history, "replaceState");

        context.updateUrl({
          entities: ["sensor.one"],
          datapointScope: "hidden",
          startTime: new Date("2026-01-01T00:00:00.000Z"),
          endTime: new Date("2026-01-02T00:00:00.000Z"),
          hours: 24,
          committedZoomRange: { start: 10, end: 20 },
          comparisonWindows: [],
          pageState: { datapoint_scope: "hidden", split_chart_view: true },
          seriesRows: [{ entity_id: "sensor.one", color: "#abcdef" }],
          seriesColorQueryKey: () => "temperature",
          push: false,
        });

        const nextUrl = String(replaceSpy.mock.calls[0]?.[2] || "");
        expect(replaceSpy).toHaveBeenCalledTimes(1);
        expect(nextUrl).toContain("entity_id=sensor.one");
        expect(nextUrl).toContain("datapoints_scope=hidden");
        expect(nextUrl).toContain("series_colors=temperature%3A%23abcdef");
        expect(nextUrl).toContain("page_state=");
      });
    });
  });
});
