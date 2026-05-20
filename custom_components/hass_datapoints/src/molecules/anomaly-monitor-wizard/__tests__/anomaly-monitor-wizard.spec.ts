import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../anomaly-monitor-wizard";
import * as monitorsApi from "@/lib/data/monitors-api";
import { createMockHass } from "@/test-support/mock-hass";

const baseMockHass = createMockHass();

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("anomaly-monitor-wizard") as HTMLElement & {
    hass: unknown;
    open: boolean;
    prefillEntityIds: string[];
    prefillAnalysis: unknown;
    editMonitor: unknown;
    suggestedEntityIds: string[];
    allSeriesEntityIds: string[];
    updateComplete: Promise<boolean>;
    _step: number;
    _entityIds: string[];
    _name: string;
    _entityConfigs: Map<
      string,
      {
        anomaly_methods: string[];
        anomaly_overlap_mode: string;
        anomaly_comparison_window_id: string | null;
        anomaly_comparison_entity_id: string | null;
      }
    >;
    _saving: boolean;
    _target: Record<string, unknown>;
  };
  Object.assign(el, {
    hass: createMockHass({
      connection: {
        sendMessagePromise: vi
          .fn()
          .mockResolvedValue({ monitor: { id: "new-id" } }),
      },
    }),
    open: true,
    prefillEntityIds: [],
    prefillAnalysis: null,
    editMonitor: null,
    suggestedEntityIds: [],
    allSeriesEntityIds: [],
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("anomaly-monitor-wizard", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN open=true", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    it("THEN starts on step 1", () => {
      expect.assertions(1);
      expect(el._step).toBe(1);
    });

    it("THEN renders ha-dialog", () => {
      expect.assertions(1);
      expect(el.shadowRoot!.querySelector("ha-dialog")).not.toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Prefill
  // ---------------------------------------------------------------------------

  describe("GIVEN prefillEntityIds", () => {
    beforeEach(async () => {
      el = createElement({ prefillEntityIds: ["sensor.temp", "sensor.hum"] });
      await el.updateComplete;
    });

    it("THEN populates _entityIds from prefill", () => {
      expect.assertions(2);
      expect(el._entityIds).toContain("sensor.temp");
      expect(el._entityIds).toContain("sensor.hum");
    });
  });

  describe("GIVEN prefillAnalysis", () => {
    beforeEach(async () => {
      el = createElement({
        prefillEntityIds: ["sensor.temp"],
        prefillAnalysis: { anomaly_methods: ["iqr", "persistence"] },
      });
      await el.updateComplete;
    });

    it("THEN applies prefilled anomaly_methods to entity config", () => {
      expect.assertions(1);
      expect(el._entityConfigs.get("sensor.temp")?.anomaly_methods).toEqual([
        "iqr",
        "persistence",
      ]);
    });
  });

  // ---------------------------------------------------------------------------
  // Edit mode
  // ---------------------------------------------------------------------------

  describe("GIVEN editMonitor", () => {
    const editMonitor = {
      id: "mon-1",
      type: "individual",
      name: "Edit Me",
      entity_id: "sensor.edit",
      enabled: true,
      look_back_hours: 48,
      scan_interval_minutes: 60,
      anomaly_methods: ["iqr"],
      anomaly_sensitivity: "high",
      anomaly_overlap_mode: "all",
      anomaly_rate_window: "1h",
      anomaly_zscore_window: "24h",
      anomaly_persistence_window: "1h",
      anomaly_trend_method: "rolling_average",
      anomaly_trend_window: "24h",
      scan_history: [],
      last_cluster_count: 0,
      last_scan_at: null,
      created_at: "2024-01-01T00:00:00",
      sample_interval: null,
      sample_aggregate: "mean",
      anomaly_use_sampled_data: false,
    };

    beforeEach(async () => {
      el = createElement({ editMonitor });
      await el.updateComplete;
    });

    it("THEN starts on step 2", () => {
      expect.assertions(1);
      expect(el._step).toBe(2);
    });

    it("THEN populates name from editMonitor", () => {
      expect.assertions(1);
      expect(el._name).toBe("Edit Me");
    });
  });

  // ---------------------------------------------------------------------------
  // Step navigation
  // ---------------------------------------------------------------------------

  describe("GIVEN step 1 with no entities", () => {
    beforeEach(async () => {
      el = createElement({ prefillEntityIds: [] });
      await el.updateComplete;
    });

    it("WHEN Next is clicked THEN shows error", async () => {
      expect.assertions(1);
      const nextBtn = el.shadowRoot!.querySelector(
        "ha-button[raised]"
      ) as HTMLElement;
      nextBtn?.click();
      await el.updateComplete;
      expect(el.shadowRoot!.textContent).toContain(
        "Select at least one entity"
      );
    });
  });

  describe("GIVEN step 1 with entities", () => {
    beforeEach(async () => {
      el = createElement({ prefillEntityIds: ["sensor.a"] });
      await el.updateComplete;
    });

    it("WHEN Next is clicked THEN advances to step 2", async () => {
      expect.assertions(1);
      const nextBtn = el.shadowRoot!.querySelector(
        "ha-button[raised]"
      ) as HTMLElement;
      nextBtn?.click();
      await el.updateComplete;
      expect(el._step).toBe(2);
    });
  });

  describe("GIVEN the wizard opened from one chart entity", () => {
    beforeEach(async () => {
      el = createElement({
        prefillEntityIds: ["sensor.temperature"],
        allSeriesEntityIds: [
          "sensor.temperature",
          "sensor.humidity",
          "sensor.co2",
        ],
      });
      await el.updateComplete;
      el._target = {};
      await el.updateComplete;
    });

    describe('WHEN "Add all series from chart" is clicked', () => {
      it("THEN it restores the original entity along with the other chart entities", async () => {
        expect.assertions(1);
        const addAllBtn = Array.from(
          el.shadowRoot!.querySelectorAll("button")
        ).find((button) =>
          button.textContent?.includes("Add all series from chart")
        ) as HTMLElement;

        addAllBtn.click();
        await el.updateComplete;

        expect(el._target).toEqual({
          entity_id: ["sensor.temperature", "sensor.humidity", "sensor.co2"],
        });
      });
    });
  });

  describe("GIVEN the current target resolves entities from an area selection", () => {
    beforeEach(async () => {
      el = createElement({
        allSeriesEntityIds: ["sensor.temperature", "sensor.humidity"],
        suggestedEntityIds: ["sensor.temperature", "sensor.humidity"],
      });
      await el.updateComplete;
      el._target = { area_id: ["area_1"] };
      await el.updateComplete;
    });

    describe("WHEN step 1 renders quick-add affordances", () => {
      it("THEN it treats the resolved entities as already selected", async () => {
        expect.assertions(2);
        const addAllBtn = Array.from(
          el.shadowRoot!.querySelectorAll("button")
        ).find((button) =>
          button.textContent?.includes("Add all series from chart")
        );
        const suggestionButtons = Array.from(
          el.shadowRoot!.querySelectorAll(".suggestion-chip")
        );

        expect(addAllBtn).toBeUndefined();
        expect(suggestionButtons).toHaveLength(0);
      });
    });
  });

  describe("GIVEN chart suggestions are available", () => {
    beforeEach(async () => {
      el = createElement({
        suggestedEntityIds: ["sensor.humidity"],
        allSeriesEntityIds: ["sensor.temperature", "sensor.humidity"],
        prefillEntityIds: ["sensor.temperature"],
      });
      await el.updateComplete;
    });

    describe("WHEN step 1 renders quick-add controls", () => {
      it("THEN it renders the add-all CTA inside the current-chart section with add-button styling", () => {
        expect.assertions(4);
        const label = Array.from(
          el.shadowRoot!.querySelectorAll(".wizard-section-label")
        ).find((node) => node.textContent?.includes("Add from current chart"));
        const addAllBtn = Array.from(
          el.shadowRoot!.querySelectorAll(".quick-add-btn")
        ).find((button) =>
          button.textContent?.includes("Add all series from chart")
        );

        expect(label).toBeTruthy();
        expect(addAllBtn).toBeTruthy();
        expect(addAllBtn?.querySelector("ha-icon")?.getAttribute("icon")).toBe(
          "mdi:plus"
        );
        expect(addAllBtn?.closest(".wizard-section")?.textContent).toContain(
          "Add from current chart"
        );
      });
    });
  });

  describe("GIVEN the current target resolves entities from an area selection", () => {
    beforeEach(async () => {
      el = createElement({
        hass: createMockHass({
          states: {
            ...baseMockHass.states,
          },
          entities: {
            ...baseMockHass.entities,
            "sensor.temperature": {
              entity_id: "sensor.temperature",
              device_id: "device_1",
              area_id: "area_1",
              labels: [],
            },
            "sensor.co2": {
              entity_id: "sensor.co2",
              device_id: "device_3",
              area_id: "area_3",
              labels: [],
            },
          },
          devices: {
            ...baseMockHass.devices,
            device_1: {
              id: "device_1",
              name: "Living Room Sensor",
              area_id: "area_1",
            },
            device_3: {
              id: "device_3",
              name: "Office Sensor",
              area_id: "area_3",
            },
          },
          connection: {
            sendMessagePromise: vi
              .fn()
              .mockResolvedValue({ monitor: { id: "new-id" } }),
          },
        }),
        suggestedEntityIds: ["sensor.co2"],
      });
      await el.updateComplete;
      el._target = { area_id: ["area_1"] };
      await el.updateComplete;
    });

    describe("WHEN a suggestion chip is clicked", () => {
      it("THEN it converts the target into an explicit entity list with the resolved and added entities", async () => {
        expect.assertions(1);
        const suggestionBtn = el.shadowRoot!.querySelector(
          ".quick-add-btn"
        ) as HTMLElement;

        suggestionBtn.click();
        await el.updateComplete;

        expect(el._target).toEqual({
          entity_id: ["sensor.temperature", "sensor.humidity", "sensor.co2"],
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Submit — create
  // ---------------------------------------------------------------------------

  describe("GIVEN valid state on step 3", () => {
    let createMonitorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      createMonitorSpy = vi
        .spyOn(monitorsApi, "createMonitor")
        .mockResolvedValue({
          id: "created",
          type: "individual",
          name: "New Monitor",
          entity_id: "sensor.a",
          enabled: true,
          look_back_hours: 24,
          scan_interval_minutes: 30,
          created_at: "2024-01-01",
          last_scan_at: null,
          last_cluster_count: 0,
          scan_history: [],
          anomaly_methods: ["iqr"],
          anomaly_sensitivity: "medium",
          anomaly_overlap_mode: "all",
          anomaly_rate_window: "1h",
          anomaly_zscore_window: "24h",
          anomaly_persistence_window: "1h",
          anomaly_trend_method: "rolling_average",
          anomaly_trend_window: "24h",
          sample_interval: null,
          sample_aggregate: "mean",
          anomaly_use_sampled_data: false,
        });

      el = createElement({ prefillEntityIds: ["sensor.a"] });
      await el.updateComplete;
      // Advance to step 3
      el._step = 3 as 1 | 2 | 3;
      el._name = "New Monitor";
      await el.updateComplete;
    });

    afterEach(() => createMonitorSpy.mockRestore());

    it("WHEN Save is clicked THEN calls createMonitor", async () => {
      expect.assertions(1);
      const saveBtn = el.shadowRoot!.querySelector(
        "ha-button[raised]"
      ) as HTMLElement;
      saveBtn?.click();
      await el.updateComplete;
      // Allow async submit
      await new Promise<void>((r) => {
        setTimeout(r, 0);
      });
      expect(createMonitorSpy).toHaveBeenCalledOnce();
    });

    it("WHEN Save is clicked THEN emits dp-monitor-wizard-saved", async () => {
      expect.assertions(1);
      const saved: CustomEvent[] = [];
      el.addEventListener("dp-monitor-wizard-saved", (e) =>
        saved.push(e as CustomEvent)
      );
      const saveBtn = el.shadowRoot!.querySelector(
        "ha-button[raised]"
      ) as HTMLElement;
      saveBtn?.click();
      await new Promise<void>((r) => {
        setTimeout(r, 10);
      });
      expect(saved).toHaveLength(1);
    });
  });

  describe("GIVEN similar entity analysis is configured", () => {
    let createMonitorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      createMonitorSpy = vi
        .spyOn(monitorsApi, "createMonitor")
        .mockRejectedValue({
          error: {
            message:
              "value must be one of ['comparison_window', 'iqr'] @ data['anomaly_methods'][0]",
          },
        });

      el = createElement({ prefillEntityIds: ["sensor.a"] });
      await el.updateComplete;
      el._step = 3 as 1 | 2 | 3;
      el._name = "New Monitor";
      el._entityIds = ["sensor.a"];
      el._entityConfigs = new Map([
        [
          "sensor.a",
          {
            anomaly_methods: ["similar_entity", "comparison_window"],
            anomaly_overlap_mode: "only",
            anomaly_comparison_window_id: "window-1",
            anomaly_comparison_entity_id: "sensor.reference",
          },
        ],
      ]);
      await el.updateComplete;
    });

    afterEach(() => createMonitorSpy.mockRestore());

    describe("WHEN Save is clicked", () => {
      it("THEN it normalizes the payload and renders the backend error message", async () => {
        expect.assertions(4);
        const saveBtn = el.shadowRoot!.querySelector(
          "ha-button[raised]"
        ) as HTMLElement;

        saveBtn.click();
        await new Promise<void>((r) => {
          setTimeout(r, 10);
        });

        expect(createMonitorSpy).toHaveBeenCalledOnce();
        expect(createMonitorSpy.mock.calls[0][1]).toMatchObject({
          anomaly_methods: ["comparison_window"],
          baseline_entity_id: "sensor.reference",
        });
        expect(createMonitorSpy.mock.calls[0][1]).toMatchObject({
          anomaly_overlap_mode: "only",
        });
        expect(el.shadowRoot!.textContent).toContain("value must be one of");
      });
    });
  });

  describe("GIVEN analysis group updates are emitted", () => {
    beforeEach(async () => {
      el = createElement({ prefillEntityIds: ["sensor.a"] });
      await el.updateComplete;
      el._step = 2 as 1 | 2 | 3;
      el._entityIds = ["sensor.a"];
      await el.updateComplete;
    });

    describe("WHEN comparison and overlap settings change", () => {
      it("THEN the wizard stores them in the per-entity config", async () => {
        expect.assertions(3);
        const group = el.shadowRoot!.querySelector(
          "analysis-anomaly-group"
        ) as HTMLElement;

        group.dispatchEvent(
          new CustomEvent("dp-group-analysis-change", {
            detail: { key: "anomaly_overlap_mode", value: "only" },
            bubbles: true,
            composed: true,
          })
        );
        group.dispatchEvent(
          new CustomEvent("dp-group-analysis-change", {
            detail: {
              key: "anomaly_comparison_window_id",
              value: "window-2",
            },
            bubbles: true,
            composed: true,
          })
        );
        group.dispatchEvent(
          new CustomEvent("dp-group-analysis-change", {
            detail: {
              key: "anomaly_comparison_entity_id",
              value: "sensor.reference",
            },
            bubbles: true,
            composed: true,
          })
        );
        await el.updateComplete;

        const config = el._entityConfigs.get("sensor.a");
        expect(config?.anomaly_overlap_mode).toBe("only");
        expect(config?.anomaly_comparison_window_id).toBe("window-2");
        expect(config?.anomaly_comparison_entity_id).toBe("sensor.reference");
      });
    });
  });

  describe("GIVEN the wizard renders the analysis step", () => {
    beforeEach(async () => {
      el = createElement({ prefillEntityIds: ["sensor.a"] });
      await el.updateComplete;
      el._step = 2 as 1 | 2 | 3;
      el._entityIds = ["sensor.a"];
      await el.updateComplete;
    });

    describe("WHEN the shell renders", () => {
      it("THEN it keeps the header separate from the scrollable body and hides the embedded save CTA", () => {
        expect.assertions(4);
        const shell = el.shadowRoot!.querySelector(".wizard-shell");
        const header = el.shadowRoot!.querySelector(".wizard-header");
        const body = el.shadowRoot!.querySelector(".wizard-content");
        const anomalyGroup = el.shadowRoot!.querySelector(
          "analysis-anomaly-group"
        ) as HTMLElement & { hideSaveMonitorCta: boolean };

        expect(shell).toBeTruthy();
        expect(header).toBeTruthy();
        expect(body).toBeTruthy();
        expect(anomalyGroup.hideSaveMonitorCta).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Submit — edit
  // ---------------------------------------------------------------------------

  describe("GIVEN edit mode on step 3", () => {
    let updateMonitorSpy: ReturnType<typeof vi.spyOn>;
    const editMonitor = {
      id: "mon-1",
      type: "individual" as const,
      name: "Old Name",
      entity_id: "sensor.a",
      enabled: true,
      look_back_hours: 24,
      scan_interval_minutes: 30,
      created_at: "2024-01-01",
      last_scan_at: null,
      last_cluster_count: 0,
      scan_history: [],
      anomaly_methods: ["iqr"],
      anomaly_sensitivity: "medium",
      anomaly_overlap_mode: "all",
      anomaly_rate_window: "1h",
      anomaly_zscore_window: "24h",
      anomaly_persistence_window: "1h",
      anomaly_trend_method: "rolling_average",
      anomaly_trend_window: "24h",
      sample_interval: null as string | null,
      sample_aggregate: "mean",
      anomaly_use_sampled_data: false,
    };

    beforeEach(async () => {
      updateMonitorSpy = vi
        .spyOn(monitorsApi, "updateMonitor")
        .mockResolvedValue({ ...editMonitor, name: "New Name" });

      el = createElement({ editMonitor });
      await el.updateComplete;
      el._step = 3 as 1 | 2 | 3;
      el._name = "New Name";
      await el.updateComplete;
    });

    afterEach(() => updateMonitorSpy.mockRestore());

    it("WHEN Save is clicked THEN calls updateMonitor not createMonitor", async () => {
      expect.assertions(1);
      const createMonitorSpy = vi.spyOn(monitorsApi, "createMonitor");
      const saveBtn = el.shadowRoot!.querySelector(
        "ha-button[raised]"
      ) as HTMLElement;
      saveBtn?.click();
      await new Promise<void>((r) => {
        setTimeout(r, 10);
      });
      expect(createMonitorSpy).not.toHaveBeenCalled();
      createMonitorSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // Close event
  // ---------------------------------------------------------------------------

  describe("GIVEN open wizard", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    it("WHEN Cancel is clicked THEN emits dp-monitor-wizard-close", async () => {
      expect.assertions(1);
      const closed: Event[] = [];
      el.addEventListener("dp-monitor-wizard-close", (e) => closed.push(e));
      const cancelBtn = Array.from(
        el.shadowRoot!.querySelectorAll("ha-button")
      ).find((b) => b.textContent?.includes("Cancel")) as HTMLElement;
      cancelBtn?.click();
      await el.updateComplete;
      expect(closed).toHaveLength(1);
    });
  });
});
