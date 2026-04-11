import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsSensorCard } from "../sensor.ts";
import type { EventRecord } from "@/lib/types";

import { fetchEvents } from "@/lib/data/events-api";

vi.mock("@/chart-utils.js", async (importOriginal) => {
  const mod = (await importOriginal()) as RecordWithUnknownValues;
  return {
    ...mod,
    setupCanvas: vi.fn().mockReturnValue({ w: 400, h: 220 }),
    attachTooltipBehaviour: vi.fn(),
  };
});

vi.mock("@/chart-renderer.js", () => {
  const mockRenderer = {
    pad: {},
    labelColor: "",
    clear: vi.fn(),
    drawGrid: vi.fn(),
    drawLine: vi.fn(),
    drawAnnotations: vi.fn(),
    drawAnnotationsOnLine: vi.fn().mockReturnValue([]),
    drawAnnotationLinesOnLine: vi.fn().mockReturnValue([]),
    _activeAxes: [],
  };
  return {
    ChartRenderer: vi.fn().mockImplementation(() => mockRenderer),
  };
});

vi.mock("@/helpers.js", async (importOriginal) => {
  const mod = (await importOriginal()) as RecordWithUnknownValues;
  return {
    ...mod,
    contrastColor: vi.fn().mockReturnValue("#fff"),
    fmtDateTime: vi.fn().mockReturnValue("2026-03-31 10:00"),
    fmtRelativeTime: vi.fn().mockReturnValue("2 hours ago"),
    navigateToDataPointsHistory: vi.fn(),
  };
});

vi.mock("@/lib/data/events-api", async (importOriginal) => {
  const mod = (await importOriginal()) as RecordWithUnknownValues;
  return {
    ...mod,
    fetchEvents: vi.fn().mockResolvedValue([]),
  };
});

if (!customElements.get("hass-datapoints-sensor-card")) {
  customElements.define("hass-datapoints-sensor-card", HassRecordsSensorCard);
}

const mockEvents: EventRecord[] = [
  {
    id: "evt-1",
    message: "Test event",
    annotation: "Full note",
    icon: "mdi:bookmark",
    color: "#03a9f4",
    timestamp: "2026-03-31T10:00:00Z",
    entity_id: "sensor.temperature",
    device_id: null,
    area_id: null,
    label_id: null,
    dev: false,
  },
  {
    id: "evt-2",
    message: "Second event",
    annotation: null,
    icon: "mdi:star",
    color: "#ff5722",
    timestamp: "2026-03-31T09:00:00Z",
    entity_id: "sensor.temperature",
    device_id: null,
    area_id: null,
    label_id: null,
    dev: false,
  },
];

function createCard(config: RecordWithUnknownValues = {}) {
  const el = document.createElement("hass-datapoints-sensor-card") as any;
  document.body.appendChild(el);
  el.setConfig({ entity: "sensor.temperature", ...config });
  return el;
}

async function setupCard(
  config: RecordWithUnknownValues = {},
  events: EventRecord[] = []
) {
  vi.mocked(fetchEvents).mockResolvedValue(events as any);
  const el = createCard(config);
  const hass = createMockHass({
    connection: {
      subscribeEvents: vi.fn(() => Promise.resolve(vi.fn())),
      sendMessagePromise: vi.fn().mockResolvedValue({}),
    },
    callService: vi.fn(() => Promise.resolve()),
  });
  el.hass = hass;
  await el.updateComplete;
  return el;
}

/** Helper: get text from a sub-component's shadow root within the card */
function getSubText(el: any, subTag: string): string {
  const sub = el.shadowRoot?.querySelector(subTag);
  return sub?.shadowRoot?.textContent ?? sub?.textContent ?? "";
}

/** Helper: collect all text content from a shadow root, recursively through nested custom elements */
function getAllText(root: Nullable<ShadowRoot>): string {
  if (!root) return "";
  const parts: string[] = [root.textContent ?? ""];
  for (const el of Array.from(root.querySelectorAll("*"))) {
    if ((el as HTMLElement).shadowRoot) {
      parts.push(getAllText((el as HTMLElement).shadowRoot));
    }
  }
  return parts.join(" ");
}

describe("sensor", () => {
  let el: any;

  afterEach(() => {
    el?.remove();
    vi.clearAllMocks();
  });

  describe("GIVEN a card with default config", () => {
    beforeEach(async () => {
      el = await setupCard();
    });

    describe("WHEN rendered", () => {
      it("THEN it has an ha-card wrapper", () => {
        expect(el.shadowRoot.querySelector("ha-card")).toBeTruthy();
      });

      it("THEN it shows the entity name", () => {
        // Name is rendered inside sensor-header shadow root
        expect(getSubText(el, "sensor-header")).toContain("Temperature");
      });

      it("THEN it shows the sensor value", () => {
        expect(getSubText(el, "sensor-header")).toContain("22.5");
      });

      it("THEN it shows the unit of measurement", () => {
        expect(getSubText(el, "sensor-header")).toContain("°C");
      });

      it("THEN it has a sensor-chart element", () => {
        expect(el.shadowRoot.querySelector("sensor-chart")).toBeTruthy();
      });

      it("THEN the sensor-chart tooltip template includes the message row anchor", async () => {
        expect.assertions(1);
        const chart = el.shadowRoot.querySelector("sensor-chart");
        await chart.updateComplete;
        expect(chart.shadowRoot?.querySelector("#tt-message-row")).toBeTruthy();
      });

      it("THEN no annotation section is shown by default", () => {
        const recordsEl = el.shadowRoot.querySelector("sensor-records");
        expect(recordsEl).toBeNull();
      });
    });
  });

  describe("GIVEN a card with a custom name", () => {
    beforeEach(async () => {
      el = await setupCard({ name: "My Sensor" });
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the custom name", () => {
        expect(getSubText(el, "sensor-header")).toContain("My Sensor");
      });
    });
  });

  describe("GIVEN setConfig without entity", () => {
    describe("WHEN setConfig is called", () => {
      it("THEN it throws an error", () => {
        const bare = document.createElement(
          "hass-datapoints-sensor-card"
        ) as any;
        expect(() => bare.setConfig({})).toThrow();
      });
    });
  });

  describe("GIVEN a card with show_records: true and events", () => {
    beforeEach(async () => {
      el = await setupCard({ show_records: true }, mockEvents);
      await el._load();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the sensor-records element is visible", () => {
        expect(el.shadowRoot.querySelector("sensor-records")).toBeTruthy();
      });

      it("THEN it shows the event messages", async () => {
        const recordsEl = el.shadowRoot.querySelector("sensor-records");
        await recordsEl.updateComplete;
        // Wait for sensor-record-item sub-elements to render
        const items =
          recordsEl.shadowRoot.querySelectorAll("sensor-record-item");
        await Promise.all([...items].map((item) => item.updateComplete));
        const allText = getAllText(el.shadowRoot);
        expect(allText).toContain("Test event");
        expect(allText).toContain("Second event");
      });
    });
  });

  describe("GIVEN a card with show_records: true and paginated events", () => {
    beforeEach(async () => {
      const manyEvents = Array.from({ length: 5 }, (_, i) => ({
        ...mockEvents[0],
        id: `evt-${i}`,
        message: `Event ${i}`,
      }));
      el = await setupCard(
        { show_records: true, records_page_size: 2 },
        manyEvents as any
      );
      await el._load();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN pagination controls are shown inside sensor-records", async () => {
        await el._load();
        await el.updateComplete;
        const recordsEl = el.shadowRoot.querySelector("sensor-records");
        expect(recordsEl).toBeTruthy();
        await recordsEl.updateComplete;
        expect(
          recordsEl.shadowRoot.querySelector("pagination-nav")
        ).toBeTruthy();
      });
    });

    describe("WHEN the page changes", () => {
      it("THEN sensor-records._page updates", async () => {
        await el._load();
        await el.updateComplete;
        const recordsEl = el.shadowRoot.querySelector("sensor-records");
        expect(recordsEl).toBeTruthy();
        await recordsEl.updateComplete;
        const pagination = recordsEl.shadowRoot.querySelector("pagination-nav");
        expect(pagination).toBeTruthy();
        pagination.dispatchEvent(
          new CustomEvent("dp-page-change", {
            detail: { page: 1 },
            bubbles: true,
            composed: true,
          })
        );
        await recordsEl.updateComplete;
        expect(recordsEl._page).toBe(1);
      });
    });
  });

  describe("GIVEN the static config methods", () => {
    describe("WHEN getStubConfig is called", () => {
      it("THEN it returns a config with an entity", () => {
        const cfg = HassRecordsSensorCard.getStubConfig();
        expect(cfg).toHaveProperty("entity");
      });
    });

    describe("WHEN getConfigElement is called", () => {
      it("THEN it returns the editor element tag", () => {
        const editorEl = HassRecordsSensorCard.getConfigElement();
        expect(editorEl.tagName.toLowerCase()).toBe(
          "hass-datapoints-sensor-card-editor"
        );
      });
    });
  });

  describe("GIVEN getGridOptions", () => {
    describe("WHEN show_records is false", () => {
      it("THEN it returns rows: 3", async () => {
        el = await setupCard({ show_records: false });
        expect(el.getGridOptions().rows).toBe(3);
      });
    });

    describe("WHEN show_records is true", () => {
      it("THEN it returns rows: 4", async () => {
        el = await setupCard({ show_records: true });
        expect(el.getGridOptions().rows).toBe(4);
      });
    });
  });
});
