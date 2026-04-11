import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../range-toolbar";
import { setFrontendLocale } from "@/lib/i18n/localize";

type DpRangeToolbar = HTMLElement & {
  hass: Nullable<unknown>;
  startTime: Nullable<Date>;
  endTime: Nullable<Date>;
  rangeBounds: Nullable<unknown>;
  zoomLevel: string;
  dateSnapping: string;
  sidebarCollapsed: boolean;
  isLiveEdge: boolean;
  timelineEvents: unknown[];
  comparisonPreview: Nullable<{ start: number; end: number }>;
  zoomRange: Nullable<{ start: number; end: number }>;
  zoomWindowRange: Nullable<{ start: number; end: number }>;
  chartHoverTimeMs: Nullable<number>;
  chartHoverWindowTimeMs: Nullable<number>;
  updateComplete: Promise<boolean>;
  closeMenus(): void;
  syncOptionsLabels(): void;
  revealSelection(): void;
  syncZoomHighlights(
    zoomRange: Nullable<{ start: number; end: number }>,
    zoomWindowRange: Nullable<{ start: number; end: number }>
  ): void;
};

function createElement(props: Partial<DpRangeToolbar> = {}): DpRangeToolbar {
  const el = document.createElement("range-toolbar") as DpRangeToolbar;
  Object.assign(el, {
    hass: null,
    startTime: null,
    endTime: null,
    rangeBounds: null,
    zoomLevel: "auto",
    dateSnapping: "hour",
    sidebarCollapsed: false,
    isLiveEdge: false,
    timelineEvents: [],
    comparisonPreview: null,
    zoomRange: null,
    zoomWindowRange: null,
    chartHoverTimeMs: null,
    chartHoverWindowTimeMs: null,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("range-toolbar", () => {
  let el: DpRangeToolbar;

  afterEach(async () => {
    el?.remove();
    await setFrontendLocale("en");
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the range-toolbar container", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".range-toolbar")).not.toBeNull();
      });

      it("THEN renders the panel-timeline", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("panel-timeline")).not.toBeNull();
      });

      it("THEN renders the date picker button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#range-picker-button")
        ).not.toBeNull();
      });

      it("THEN renders the options button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#range-options-button")
        ).not.toBeNull();
      });

      it("THEN renders the sidebar toggle button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#range-sidebar-toggle")
        ).not.toBeNull();
      });

      it("THEN renders mobile start and end date inputs", () => {
        expect.assertions(2);
        expect(
          el.shadowRoot!.querySelector("#range-mobile-start")
        ).not.toBeNull();
        expect(
          el.shadowRoot!.querySelector("#range-mobile-end")
        ).not.toBeNull();
      });

      it("THEN renders the floating menus for picker and options", () => {
        expect.assertions(2);
        expect(
          el.shadowRoot!.querySelector("#range-picker-menu")
        ).not.toBeNull();
        expect(
          el.shadowRoot!.querySelector("#range-options-menu")
        ).not.toBeNull();
      });

      it("THEN renders zoom options buttons in the options menu", () => {
        expect.assertions(1);
        const zoomBtns = el.shadowRoot!.querySelectorAll(
          "[data-option-group='zoom']"
        );
        expect(zoomBtns.length).toBeGreaterThan(0);
      });

      it("THEN renders snap options buttons in the options menu", () => {
        expect.assertions(1);
        const snapBtns = el.shadowRoot!.querySelectorAll(
          "[data-option-group='snap']"
        );
        expect(snapBtns.length).toBeGreaterThan(0);
      });
    });
  });

  describe("GIVEN translated language props and localized options", () => {
    beforeEach(async () => {
      await setFrontendLocale("fi");
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN uses the provided localized labels", () => {
        expect.assertions(4);
        const sidebarToggle = el.shadowRoot!.querySelector(
          "#range-sidebar-toggle"
        );
        const startInput = el.shadowRoot!.querySelector("#range-mobile-start");
        const pickerButton = el.shadowRoot!.querySelector(
          "#range-picker-button"
        );
        const optionsTitle = el.shadowRoot!.querySelector(
          ".range-submenu-trigger .range-option-label"
        );

        expect(sidebarToggle?.getAttribute("label")).toBe("Vaihda sivupalkki");
        expect(startInput?.getAttribute("label")).toBe("Alku");
        expect(pickerButton?.getAttribute("label")).toBe("Valitse aikaväli");
        expect(optionsTitle?.textContent).toContain("Zoomaustaso");
      });
    });
  });

  // ── Sidebar toggle event ───────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN sidebar toggle is clicked", () => {
      it("THEN fires dp-toolbar-sidebar-toggle event", async () => {
        expect.assertions(1);
        const events: Event[] = [];
        el.addEventListener("dp-toolbar-sidebar-toggle", (ev) =>
          events.push(ev)
        );
        el.shadowRoot!.querySelector<HTMLElement>(
          "#range-sidebar-toggle"
        )!.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
      });
    });
  });

  // ── Options menu zoom/snap change ──────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN a zoom option button is clicked", () => {
      it("THEN fires dp-zoom-level-change with the selected value", async () => {
        expect.assertions(2);
        const events: CustomEvent[] = [];
        el.addEventListener("dp-zoom-level-change", (ev) =>
          events.push(ev as CustomEvent)
        );
        const zoomBtn = el.shadowRoot!.querySelector<HTMLElement>(
          "[data-option-group='zoom']"
        )!;
        const expectedValue = zoomBtn.dataset.optionValue!;
        zoomBtn.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
        expect(events[0].detail.value).toBe(expectedValue);
      });
    });

    describe("WHEN a snap option button is clicked", () => {
      it("THEN fires dp-snap-change with the selected value", async () => {
        expect.assertions(2);
        const events: CustomEvent[] = [];
        el.addEventListener("dp-snap-change", (ev) =>
          events.push(ev as CustomEvent)
        );
        const snapBtn = el.shadowRoot!.querySelector<HTMLElement>(
          "[data-option-group='snap']"
        )!;
        const expectedValue = snapBtn.dataset.optionValue!;
        snapBtn.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
        expect(events[0].detail.value).toBe(expectedValue);
      });
    });
  });

  // ── closeMenus ─────────────────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN closeMenus() is called", () => {
      it("THEN closes picker and options floating menus", async () => {
        expect.assertions(2);
        el.closeMenus();
        await el.updateComplete;
        const pickerMenu = el.shadowRoot!.querySelector<
          HTMLElement & { open?: boolean }
        >("#range-picker-menu");
        const optionsMenu = el.shadowRoot!.querySelector<
          HTMLElement & { open?: boolean }
        >("#range-options-menu");
        expect(pickerMenu?.open).toBeFalsy();
        expect(optionsMenu?.open).toBeFalsy();
      });
    });
  });

  // ── Public API ─────────────────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN revealSelection() is called", () => {
      it("THEN forwards the call to the inner panel-timeline", async () => {
        expect.assertions(1);
        const panelTimeline = el.shadowRoot!.querySelector(
          "panel-timeline"
        ) as HTMLElement & {
          revealSelection: () => void;
        };
        let calls = 0;
        panelTimeline.revealSelection = () => {
          calls += 1;
        };
        el.revealSelection();
        await el.updateComplete;
        expect(calls).toBe(1);
      });
    });

    describe("WHEN syncZoomHighlights() is called", () => {
      it("THEN forwards the call to the inner panel-timeline", async () => {
        expect.assertions(1);
        const panelTimeline = el.shadowRoot!.querySelector(
          "panel-timeline"
        ) as HTMLElement & {
          syncZoomHighlights: (
            zoomRange: Nullable<{ start: number; end: number }>,
            zoomWindowRange: Nullable<{ start: number; end: number }>
          ) => void;
        };
        let calls = 0;
        panelTimeline.syncZoomHighlights = () => {
          calls += 1;
        };
        el.syncZoomHighlights({ start: 10, end: 20 }, { start: 12, end: 18 });
        await el.updateComplete;
        expect(calls).toBe(1);
      });
    });
  });

  // ── Timeline events forwarding ─────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN panel-timeline fires dp-range-commit", () => {
      it("THEN re-fires dp-range-commit on the toolbar element", async () => {
        expect.assertions(1);
        const events: CustomEvent[] = [];
        el.addEventListener("dp-range-commit", (ev) =>
          events.push(ev as CustomEvent)
        );
        const timeline = el.shadowRoot!.querySelector("panel-timeline")!;
        const start = new Date("2025-01-01");
        const end = new Date("2025-01-31");
        timeline.dispatchEvent(
          new CustomEvent("dp-range-commit", {
            detail: { start, end, push: true },
            bubbles: true,
            composed: true,
          })
        );
        await el.updateComplete;
        expect(events.length).toBe(1);
      });
    });
  });

  // ── Prop forwarding ────────────────────────────────────────────────────────

  describe("GIVEN timeline overlay props are set on the toolbar", () => {
    beforeEach(async () => {
      el = createElement({
        isLiveEdge: true,
        timelineEvents: [
          { timestamp: "2025-01-02T00:00:00Z", color: "#ff0000" },
        ],
        comparisonPreview: { start: 10, end: 20 },
        zoomRange: { start: 30, end: 40 },
        zoomWindowRange: { start: 50, end: 60 },
        chartHoverTimeMs: 70,
        chartHoverWindowTimeMs: 80,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN forwards the props to the inner panel-timeline", async () => {
        expect.assertions(7);
        const timeline = el.shadowRoot!.querySelector(
          "panel-timeline"
        ) as HTMLElement & {
          isLiveEdge: boolean;
          events: unknown[];
          comparisonPreview: Nullable<{ start: number; end: number }>;
          zoomRange: Nullable<{ start: number; end: number }>;
          zoomWindowRange: Nullable<{ start: number; end: number }>;
          chartHoverTimeMs: Nullable<number>;
          chartHoverWindowTimeMs: Nullable<number>;
          updateComplete: Promise<boolean>;
        };
        await timeline.updateComplete;
        expect(timeline.isLiveEdge).toBe(true);
        expect(timeline.events).toEqual([
          { timestamp: "2025-01-02T00:00:00Z", color: "#ff0000" },
        ]);
        expect(timeline.comparisonPreview).toEqual({ start: 10, end: 20 });
        expect(timeline.zoomRange).toEqual({ start: 30, end: 40 });
        expect(timeline.zoomWindowRange).toEqual({ start: 50, end: 60 });
        expect(timeline.chartHoverTimeMs).toBe(70);
        expect(timeline.chartHoverWindowTimeMs).toBe(80);
      });
    });
  });

  describe("GIVEN hass and date bounds are set on the toolbar", () => {
    beforeEach(async () => {
      el = createElement({
        hass: { states: {} },
        startTime: new Date("2025-01-01T00:00:00Z"),
        endTime: new Date("2025-01-31T00:00:00Z"),
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN forwards the picker props without parent selector access", () => {
        expect.assertions(4);
        const picker = el.shadowRoot!.querySelector(
          "#range-picker"
        ) as HTMLElement & {
          hass: unknown;
          startDate: Nullable<Date>;
          endDate: Nullable<Date>;
          value: { startDate: Nullable<Date>; endDate: Nullable<Date> };
        };
        expect(picker.hass).toEqual({ states: {} });
        expect(picker.startDate?.toISOString()).toBe(
          "2025-01-01T00:00:00.000Z"
        );
        expect(picker.endDate?.toISOString()).toBe("2025-01-31T00:00:00.000Z");
        expect(picker.value).toEqual({
          startDate: new Date("2025-01-01T00:00:00Z"),
          endDate: new Date("2025-01-31T00:00:00Z"),
        });
      });
    });
  });
});
