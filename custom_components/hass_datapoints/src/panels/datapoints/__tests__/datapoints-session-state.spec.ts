import { describe, it, expect, afterEach } from "vitest";
import {
  readHistoryPageSessionState,
  buildHistoryPageSessionState,
  normalizeHistoryPagePreferences,
  PANEL_HISTORY_SESSION_KEY,
} from "@/lib/history-page/history-session-state";

// ---------------------------------------------------------------------------
// readHistoryPageSessionState
// ---------------------------------------------------------------------------

describe("readHistoryPageSessionState", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  describe("WHEN sessionStorage is empty", () => {
    it("THEN returns null", () => {
      expect.assertions(1);
      expect(readHistoryPageSessionState()).toBeNull();
    });
  });

  describe("WHEN sessionStorage contains valid JSON", () => {
    it("THEN returns the parsed object", () => {
      expect.assertions(1);
      const data = { entities: ["sensor.temp"], hours: 48 };
      window.sessionStorage.setItem(
        PANEL_HISTORY_SESSION_KEY,
        JSON.stringify(data)
      );
      const result = readHistoryPageSessionState();
      expect(result).toEqual(data);
    });
  });

  describe("WHEN sessionStorage contains invalid JSON", () => {
    it("THEN returns null", () => {
      expect.assertions(1);
      window.sessionStorage.setItem(PANEL_HISTORY_SESSION_KEY, "not-json{{");
      expect(readHistoryPageSessionState()).toBeNull();
    });
  });

  describe("WHEN sessionStorage contains a non-object value", () => {
    it("THEN returns null", () => {
      expect.assertions(1);
      window.sessionStorage.setItem(
        PANEL_HISTORY_SESSION_KEY,
        JSON.stringify(42)
      );
      expect(readHistoryPageSessionState()).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// buildHistoryPageSessionState
// ---------------------------------------------------------------------------

describe("buildHistoryPageSessionState", () => {
  it("THEN includes required shape keys", () => {
    expect.assertions(4);
    const source = {
      _entities: ["sensor.temperature"],
      _seriesRows: [],
      _targetSelection: {},
      _targetSelectionRaw: {},
      _datapointScope: "linked",
      _showChartDatapointIcons: true,
      _showChartDatapointLines: true,
      _showChartTooltips: true,
      _showChartEmphasizedHoverGuides: false,
      _delinkChartYAxis: false,
      _splitChartView: false,
      _showCorrelatedAnomalies: false,
      _showDataGaps: true,
      _dataGapThreshold: "2h",
      _contentSplitRatio: 0.5,
      _startTime: new Date("2025-01-01T00:00:00Z"),
      _endTime: new Date("2025-01-02T00:00:00Z"),
      _chartZoomCommittedRange: null,
      _comparisonWindows: [],
      _hours: 24,
      _sidebarCollapsed: false,
      _sidebarAccordionTargetsOpen: true,
      _sidebarAccordionDatapointsOpen: true,
      _sidebarAccordionChartOpen: true,
    };
    const state = buildHistoryPageSessionState(source as never);
    expect(state.entities).toEqual(["sensor.temperature"]);
    expect(state.hours).toBe(24);
    expect(state.sidebar_accordion_targets_open).toBe(true);
    expect(state.sidebar_accordion_chart_open).toBe(true);
  });

  it("THEN serializes zoom range when present", () => {
    expect.assertions(2);
    const source = {
      _entities: [],
      _seriesRows: [],
      _targetSelection: {},
      _targetSelectionRaw: {},
      _datapointScope: "linked",
      _showChartDatapointIcons: true,
      _showChartDatapointLines: true,
      _showChartTooltips: true,
      _showChartEmphasizedHoverGuides: false,
      _delinkChartYAxis: false,
      _splitChartView: false,
      _showCorrelatedAnomalies: false,
      _showDataGaps: true,
      _dataGapThreshold: "2h",
      _contentSplitRatio: 0.5,
      _startTime: new Date("2025-01-01T00:00:00Z"),
      _endTime: new Date("2025-01-02T00:00:00Z"),
      _chartZoomCommittedRange: { start: 1700000000000, end: 1700003600000 },
      _comparisonWindows: [],
      _hours: 24,
      _sidebarCollapsed: false,
      _sidebarAccordionTargetsOpen: true,
      _sidebarAccordionDatapointsOpen: true,
      _sidebarAccordionChartOpen: true,
    };
    const state = buildHistoryPageSessionState(source as never);
    expect(state.zoom_start_time).toBeTruthy();
    expect(state.zoom_end_time).toBeTruthy();
  });

  it("THEN serializes null zoom range when absent", () => {
    expect.assertions(2);
    const source = {
      _entities: [],
      _seriesRows: [],
      _targetSelection: {},
      _targetSelectionRaw: {},
      _datapointScope: "linked",
      _showChartDatapointIcons: true,
      _showChartDatapointLines: true,
      _showChartTooltips: true,
      _showChartEmphasizedHoverGuides: false,
      _delinkChartYAxis: false,
      _splitChartView: false,
      _showCorrelatedAnomalies: false,
      _showDataGaps: true,
      _dataGapThreshold: "2h",
      _contentSplitRatio: 0.5,
      _startTime: null,
      _endTime: null,
      _chartZoomCommittedRange: null,
      _comparisonWindows: [],
      _hours: 24,
      _sidebarCollapsed: false,
      _sidebarAccordionTargetsOpen: true,
      _sidebarAccordionDatapointsOpen: true,
      _sidebarAccordionChartOpen: true,
    };
    const state = buildHistoryPageSessionState(source as never);
    expect(state.zoom_start_time).toBeNull();
    expect(state.zoom_end_time).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// normalizeHistoryPagePreferences
// ---------------------------------------------------------------------------

describe("normalizeHistoryPagePreferences", () => {
  const ZOOM_OPTIONS = [
    { value: "auto", label: "Auto" },
    { value: "1h", label: "1 hour" },
    { value: "24h", label: "24 hours" },
  ];
  const SNAP_OPTIONS = [
    { value: "auto", label: "Auto" },
    { value: "hour", label: "Hour" },
    { value: "day", label: "Day" },
  ];
  const OPTIONS = { zoomOptions: ZOOM_OPTIONS, snapOptions: SNAP_OPTIONS };

  describe("WHEN preferences is null", () => {
    it("THEN returns defaults and marks shouldPersistDefaults", () => {
      expect.assertions(3);
      const result = normalizeHistoryPagePreferences(null, OPTIONS);
      expect(result.zoomLevel).toBe("auto");
      expect(result.dateSnapping).toBe("hour");
      expect(result.shouldPersistDefaults).toBe(true);
    });
  });

  describe("WHEN preferences has a valid zoom_level", () => {
    it("THEN uses the provided zoom_level", () => {
      expect.assertions(2);
      const result = normalizeHistoryPagePreferences(
        { zoom_level: "1h", date_snapping: "hour" },
        OPTIONS
      );
      expect(result.zoomLevel).toBe("1h");
      expect(result.shouldPersistDefaults).toBe(false);
    });
  });

  describe("WHEN preferences has an invalid zoom_level", () => {
    it("THEN falls back to auto and marks shouldPersistDefaults", () => {
      expect.assertions(2);
      const result = normalizeHistoryPagePreferences(
        { zoom_level: "invalid-value", date_snapping: "hour" },
        OPTIONS
      );
      expect(result.zoomLevel).toBe("auto");
      expect(result.shouldPersistDefaults).toBe(true);
    });
  });

  describe("WHEN preferences has valid series_colors", () => {
    it("THEN only keeps entries with valid hex colors", () => {
      expect.assertions(2);
      const result = normalizeHistoryPagePreferences(
        {
          zoom_level: "auto",
          date_snapping: "hour",
          series_colors: {
            "sensor.temp": "#ff0000",
            "sensor.hum": "not-a-color",
          },
        },
        OPTIONS
      );
      expect(result.preferredSeriesColors["sensor.temp"]).toBe("#ff0000");
      expect(result.preferredSeriesColors["sensor.hum"]).toBeUndefined();
    });
  });
});
