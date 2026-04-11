import { html } from "lit";
import { expect, fn, userEvent, within } from "@storybook/test";
import "../comparison-tab";

/**
 * `comparison-tab` renders a single tab in the chart comparison tab rail.
 * It supports active, previewing, loading, and editable states.
 *
 * @fires dp-tab-activate - `{ tabId: string }` fired when the tab trigger is clicked
 * @fires dp-tab-hover - `{ tabId: string }` fired on mouseenter or trigger focus
 * @fires dp-tab-leave - `{ tabId: string }` fired on mouseleave or trigger blur
 * @fires dp-tab-edit - `{ tabId: string }` fired when the edit button is clicked (editable only)
 * @fires dp-tab-delete - `{ tabId: string }` fired when the delete button is clicked (editable only)
 */
export default {
  title: "Molecules/Comparison Tab",
  component: "comparison-tab",
  parameters: {
    actions: {
      handles: [
        "dp-tab-activate",
        "dp-tab-hover",
        "dp-tab-leave",
        "dp-tab-edit",
        "dp-tab-delete",
      ],
    },
  },
  argTypes: {
    tabId: {
      control: "text",
      description:
        "Unique identifier for this tab; included in all event detail objects.",
    },
    label: {
      control: "text",
      description:
        'Primary label shown in the tab (e.g. "Selected range" or a user-defined window name).',
    },
    detail: {
      control: "text",
      description:
        "Secondary detail text shown below the label (e.g. a formatted date range).",
    },
    active: {
      control: "boolean",
      description: "Whether this tab is the currently active date window.",
    },
    previewing: {
      control: "boolean",
      description:
        "Whether the chart is currently previewing this tab's date range.",
    },
    loading: {
      control: "boolean",
      description: "Whether this tab's data is currently loading.",
    },
    editable: {
      control: "boolean",
      description: "Whether edit and delete action buttons are displayed.",
    },
  },
  args: {
    tabId: "tab-1",
    label: "Selected range",
    detail: "1 Jan – 7 Jan 2025",
    active: false,
    previewing: false,
    loading: false,
    editable: false,
  },
  render: (args: RecordWithUnknownValues) => html`
    <div
      style="display: flex; align-items: flex-end; border-bottom: 1px solid rgba(255,255,255,0.12); padding: 0 16px;"
    >
      <comparison-tab
        .tabId=${args.tabId}
        .label=${args.label}
        .detail=${args.detail}
        .active=${args.active}
        .previewing=${args.previewing}
        .loading=${args.loading}
        .editable=${args.editable}
      ></comparison-tab>
    </div>
  `,
};

/** Default inactive tab — "Selected range" with a date detail. */
export const Default = {};

/** Active tab — bold label and solid primary-color underline. */
export const Active = {
  args: { active: true },
};

/** Previewing tab — stronger underline tint, used when another tab is being hovered. */
export const Previewing = {
  args: { previewing: true },
};

/** Loading tab — spinner icon and reduced opacity. */
export const Loading = {
  args: { loading: true },
};

/** Editable tab — shows edit (pencil) and delete (×) action buttons. */
export const Editable = {
  args: {
    tabId: "window-heating",
    label: "Heating season",
    detail: "1 Nov – 31 Mar",
    editable: true,
  },
};

/** Active and editable — bold label, primary underline, and visible action buttons. */
export const ActiveEditable = {
  args: {
    label: "Heating season",
    detail: "1 Nov – 31 Mar",
    active: true,
    editable: true,
  },
};

/** Fires dp-tab-activate when the trigger button is clicked. */
export const EmitsActivate = {
  args: {
    tabId: "tab-events",
    label: "Event tab",
    detail: "1 Jan – 7 Jan 2025",
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("comparison-tab") as HTMLElement;
    const handler = fn();
    host.addEventListener("dp-tab-activate", handler);
    const canvas = within(host.shadowRoot as unknown as HTMLElement);
    const trigger = canvas.getByRole("button", { name: /event tab/i });
    await userEvent.click(trigger);
    await expect(handler).toHaveBeenCalledOnce();
    await expect((handler.mock.calls[0][0] as CustomEvent).detail.tabId).toBe(
      "tab-events"
    );
  },
};

/** Fires dp-tab-edit and dp-tab-delete when action buttons are clicked on an editable tab. */
export const EmitsEditAndDelete = {
  args: {
    tabId: "tab-editable",
    label: "My window",
    detail: "1 Jan – 7 Jan 2025",
    editable: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("comparison-tab") as HTMLElement;
    const editHandler = fn();
    const deleteHandler = fn();
    host.addEventListener("dp-tab-edit", editHandler);
    host.addEventListener("dp-tab-delete", deleteHandler);
    const canvas = within(host.shadowRoot as unknown as HTMLElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /edit my window/i })
    );
    await expect(editHandler).toHaveBeenCalledOnce();
    await userEvent.click(
      canvas.getByRole("button", { name: /delete my window/i })
    );
    await expect(deleteHandler).toHaveBeenCalledOnce();
  },
};
