import { afterEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../anomaly-monitors-panel";

function flushMicrotasks() {
  return Promise.resolve().then(() => Promise.resolve());
}

function buildMonitor(enabled: boolean) {
  return {
    id: "monitor-1",
    type: "individual",
    name: "Kitchen anomaly",
    enabled,
    look_back_hours: 24,
    scan_interval_minutes: 30,
    created_at: "2026-05-19T10:00:00Z",
    last_scan_at: null,
    last_anomaly_at: null,
    last_cluster_count: 0,
    last_scan_data_points: null,
    scan_history: [],
    device_id: "device-1",
    anomaly_methods: ["trend_residual"],
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
    baseline_entity_id: null,
    baseline_time_offset_hours: 0,
    dismissed_windows: [],
    entity_id: "sensor.temperature",
  };
}

function createElement(hass: unknown) {
  const el = document.createElement("anomaly-monitors-panel") as HTMLElement & {
    hass: unknown;
    updateComplete: Promise<boolean>;
  };
  el.hass = hass;
  document.body.appendChild(el);
  return el;
}

describe("anomaly-monitors-panel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("GIVEN hass is available", () => {
    describe("WHEN the panel connects", () => {
      it("THEN it subscribes to monitor update events", async () => {
        expect.assertions(1);
        const subscribeEvents = vi.fn(() => Promise.resolve(vi.fn()));
        const hass = createMockHass({
          connection: {
            subscribeEvents,
            sendMessagePromise: vi.fn().mockResolvedValue({ monitors: [] }),
          },
        });

        createElement(hass);
        await flushMicrotasks();

        expect(subscribeEvents).toHaveBeenCalledWith(
          expect.any(Function),
          "hass_datapoints_monitors_updated"
        );
      });
    });
  });

  describe("GIVEN the panel is showing a monitor", () => {
    describe("WHEN a monitor-updated event arrives from Home Assistant", () => {
      it("THEN it reloads and reflects the latest enabled state", async () => {
        expect.assertions(2);
        let handler: Nullable<(...args: unknown[]) => void> = null;
        const sendMessagePromise = vi
          .fn()
          .mockResolvedValueOnce({ monitors: [buildMonitor(false)] })
          .mockResolvedValueOnce({ monitors: [buildMonitor(true)] });
        const hass = createMockHass({
          connection: {
            subscribeEvents: vi.fn((callback) => {
              handler = callback;
              return Promise.resolve(vi.fn());
            }),
            sendMessagePromise,
          },
        });

        const el = createElement(hass);
        await el.updateComplete;
        await flushMicrotasks();

        expect(
          el.shadowRoot
            ?.querySelector(".monitor-card")
            ?.getAttribute("data-enabled")
        ).toBe("false");

        handler?.({});
        await flushMicrotasks();
        await el.updateComplete;

        expect(
          el.shadowRoot
            ?.querySelector(".monitor-card")
            ?.getAttribute("data-enabled")
        ).toBe("true");
      });
    });
  });

  describe("GIVEN the panel has subscribed to monitor updates", () => {
    describe("WHEN the element disconnects", () => {
      it("THEN it tears down the subscription", async () => {
        expect.assertions(1);
        const unsubscribe = vi.fn();
        const hass = createMockHass({
          connection: {
            subscribeEvents: vi.fn(() => Promise.resolve(unsubscribe)),
            sendMessagePromise: vi.fn().mockResolvedValue({ monitors: [] }),
          },
        });

        const el = createElement(hass);
        await flushMicrotasks();
        el.remove();

        expect(unsubscribe).toHaveBeenCalledOnce();
      });
    });
  });
});
