import { html } from "lit";
import { expect, fn, userEvent, within } from "@storybook/test";
import "../comparison-tab-rail";
import type { TabItem } from "../comparison-tab-rail";

const CURRENT_TAB: TabItem = {
  id: "current-range",
  label: "Selected range",
  detail: "1 Jan – 7 Jan 2025",
  active: true,
  editable: false,
};

const COMPARISON_TABS: TabItem[] = [
  {
    id: "window-1",
    label: "Heating season",
    detail: "1 Nov – 31 Mar",
    active: false,
    editable: true,
  },
  {
    id: "window-2",
    label: "Summer 2024",
    detail: "1 Jun – 31 Aug 2024",
    active: false,
    editable: true,
  },
];

/**
 * `comparison-tab-rail` renders the full comparison tab bar, consisting of a
 * scrollable row of `comparison-tab` elements and an "Add date window" button.
 *
 * @fires dp-tab-activate - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-hover - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-leave - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-edit - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-delete - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-add - `{}` fired when the "Add date window" button is clicked
 */
export default {
  title: "Molecules/Comparison Tab Rail",
  component: "comparison-tab-rail",
  parameters: {
    actions: {
      handles: [
        "dp-tab-activate",
        "dp-tab-hover",
        "dp-tab-leave",
        "dp-tab-edit",
        "dp-tab-delete",
        "dp-tab-add",
      ],
    },
  },
  argTypes: {
    tabs: {
      control: "object",
      description:
        "Array of tab descriptors. Each item: `{ id, label, detail, active, editable }`.",
    },
    loadingIds: {
      control: "object",
      description:
        "Array of tab IDs currently loading data. Matching tabs show a spinner.",
    },
    hoveredId: {
      control: "text",
      description:
        "ID of the tab currently being previewed (hovered). Sets `previewing` on that tab.",
    },
    overflowing: {
      control: "boolean",
      description:
        "When true, the rail is overflowing and the Add button collapses to an icon.",
    },
  },
  args: {
    tabs: [CURRENT_TAB, ...COMPARISON_TABS],
    loadingIds: [],
    hoveredId: "",
    overflowing: false,
  },
  render: (args: RecordWithUnknownValues) => html`
    <comparison-tab-rail
      .tabs=${args.tabs}
      .loadingIds=${args.loadingIds}
      .hoveredId=${args.hoveredId}
      .overflowing=${args.overflowing}
    ></comparison-tab-rail>
  `,
};

/** Current range tab active, two editable comparison tabs. */
export const Default = {};

/** Only the current-range tab — no comparison windows added yet. */
export const SingleTab = {
  args: {
    tabs: [CURRENT_TAB],
  },
};

/** One comparison tab is loading data (shows spinner). */
export const OneTabLoading = {
  args: {
    loadingIds: ["window-1"],
  },
};

/** A comparison tab is being previewed (stronger underline). */
export const TabPreviewing = {
  args: {
    hoveredId: "window-1",
  },
};

/** A comparison window tab is the active tab. */
export const ComparisonWindowActive = {
  args: {
    tabs: [
      { ...CURRENT_TAB, active: false },
      { ...COMPARISON_TABS[0], active: true },
      COMPARISON_TABS[1],
    ],
  },
};

/** Fires dp-tab-add when the "Add date window" button is clicked. */
export const EmitsTabAdd = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector(
      "comparison-tab-rail"
    ) as HTMLElement;
    const handler = fn();
    host.addEventListener("dp-tab-add", handler);
    const canvas = within(host.shadowRoot as unknown as HTMLElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /add date window/i })
    );
    await expect(handler).toHaveBeenCalledOnce();
  },
};
