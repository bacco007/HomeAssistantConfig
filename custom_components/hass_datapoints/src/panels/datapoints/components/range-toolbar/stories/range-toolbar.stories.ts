import { html } from "lit";
import { expect } from "@storybook/test";
import "../range-toolbar";
import type { RangeBounds } from "@/atoms/interactive/range-timeline/types";
import { setFrontendLocale } from "@/lib/i18n/localize";

const START = new Date("2025-01-01T00:00:00");
const END = new Date("2025-03-01T00:00:00");

const BOUNDS: RangeBounds = {
  min: new Date("2020-01-01").getTime(),
  max: new Date("2026-01-01").getTime(),
  config: {
    baselineMs: 60 * 86400_000,
    boundsUnit: "month",
    contextUnit: "year",
    majorUnit: "month",
    labelUnit: "month",
    minorUnit: "week",
    pixelsPerUnit: 30,
  },
};

function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

/**
 * `range-toolbar` renders the date-range selection toolbar for the Datapoints panel.
 * It includes the timeline slider, date picker button, and timeline options (zoom, snap).
 * At ≤720 px the timeline is replaced by mobile date inputs.
 */
export default {
  title: "Panels/Datapoints/Range Toolbar",
  component: "range-toolbar",
  parameters: {
    layout: "fullscreen",
    actions: {
      handles: [
        "dp-range-commit",
        "dp-range-draft",
        "dp-toolbar-sidebar-toggle",
        "dp-zoom-level-change",
        "dp-snap-change",
        "dp-date-picker-change",
      ],
    },
  },
  argTypes: {
    zoomLevel: {
      control: { type: "select" },
      options: [
        "auto",
        "quarterly",
        "month_compressed",
        "month_short",
        "month_expanded",
        "week_compressed",
        "week_expanded",
        "day",
      ],
      description: "Timeline zoom level.",
    },
    dateSnapping: {
      control: { type: "select" },
      options: ["auto", "month", "week", "day", "hour", "minute", "second"],
      description: "Date snapping mode.",
    },
    sidebarCollapsed: {
      control: "boolean",
      description:
        "Sidebar collapse state — sets icon direction of the mobile sidebar toggle.",
    },
  },
  args: {
    zoomLevel: "auto",
    dateSnapping: "hour",
    sidebarCollapsed: false,
  },
  loaders: [
    async () => {
      await setFrontendLocale("en");
      return {};
    },
  ],
  render: (args: RecordWithUnknownValues) => html`
    <div
      style="background: var(--card-background-color, #fff); padding: 12px 0; border-bottom: 1px solid var(--divider-color);"
    >
      <range-toolbar
        .startTime=${START}
        .endTime=${END}
        .rangeBounds=${BOUNDS}
        .zoomLevel=${args.zoomLevel}
        .dateSnapping=${args.dateSnapping}
        .sidebarCollapsed=${args.sidebarCollapsed}
      ></range-toolbar>
    </div>
  `,
};

/** Default toolbar with a 2-month range in auto zoom. */
export const Default = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const toolbar = canvasElement.querySelector(
      "range-toolbar"
    ) as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const panelTimeline = toolbar.shadowRoot.querySelector(
      "#range-panel-timeline"
    ) as HTMLElement & {
      startTime: Nullable<Date>;
      endTime: Nullable<Date>;
      rangeBounds: Nullable<RangeBounds>;
      zoomLevel: string;
      dateSnapping: string;
    };
    expect(panelTimeline).toBeTruthy();
    expect(panelTimeline.startTime?.getTime()).toBe(START.getTime());
    expect(panelTimeline.endTime?.getTime()).toBe(END.getTime());
    expect(panelTimeline.rangeBounds).toEqual(BOUNDS);
    expect(panelTimeline.zoomLevel).toBe("auto");
    expect(panelTimeline.dateSnapping).toBe("hour");
  },
};

/** Weekly zoom level. */
export const WeekZoom = {
  args: {
    zoomLevel: "week_expanded",
    dateSnapping: "day",
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const toolbar = canvasElement.querySelector(
      "range-toolbar"
    ) as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const optionsButton = toolbar.shadowRoot.querySelector(
      "#range-options-button"
    ) as HTMLButtonElement;
    optionsButton.click();
    await nextTick();
    const optionsMenu = toolbar.shadowRoot.querySelector(
      "#range-options-menu"
    ) as HTMLElement & { open?: boolean };
    expect(optionsMenu.open).toBe(true);
    const zoomTrigger = toolbar.shadowRoot.querySelector(
      ".range-submenu-trigger"
    ) as HTMLButtonElement;
    zoomTrigger.click();
    await nextTick();
    const zoomView = Array.from(
      toolbar.shadowRoot.querySelectorAll(".range-options-view")
    ).find((view) => !view.hasAttribute("hidden"));
    expect(zoomView?.textContent).toContain("Zoom level");
  },
};

/** Sidebar collapsed — the mobile sidebar toggle chevron points right. */
export const SidebarCollapsed = {
  args: {
    sidebarCollapsed: true,
  },
};

/** Short date range (1 week) using day zoom. */
export const ShortRange = {
  render: () => html`
    <div
      style="background: var(--card-background-color, #fff); padding: 12px 0; border-bottom: 1px solid var(--divider-color);"
    >
      <range-toolbar
        .startTime=${new Date("2025-01-01")}
        .endTime=${new Date("2025-01-08")}
        .rangeBounds=${BOUNDS}
        .zoomLevel=${"day"}
        .dateSnapping=${"hour"}
      ></range-toolbar>
    </div>
  `,
};

export const Finnish = {
  loaders: [
    async () => {
      await setFrontendLocale("fi");
      return {};
    },
  ],
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const toolbar = canvasElement.querySelector(
      "range-toolbar"
    ) as HTMLElement & { shadowRoot: ShadowRoot };
    const sidebarToggle = toolbar.shadowRoot.querySelector(
      "#range-sidebar-toggle"
    );
    const pickerButton = toolbar.shadowRoot.querySelector(
      "#range-picker-button"
    );

    expect(sidebarToggle?.getAttribute("label")).toBe("Vaihda sivupalkki");
    expect(pickerButton?.getAttribute("label")).toBe("Valitse aikaväli");
  },
};
