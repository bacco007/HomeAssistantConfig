import { html } from "lit";
import "../range-tooltip";

/**
 * `range-tooltip` is a pure display component showing a formatted date/time
 * tooltip anchored to a handle on the range-timeline.
 *
 * Visibility is controlled by the `visible` attribute. Position is set via
 * the `position` property (pixels from left).
 */
export default {
  title: "Atoms/Interactive/Range Timeline/Range Tooltip",
  component: "range-tooltip",
  parameters: { layout: "padded" },
  argTypes: {
    content: { control: "text" },
    visible: { control: "boolean" },
    position: { control: { type: "range", min: 0, max: 400, step: 1 } },
    side: { control: "select", options: ["start", "end"] },
    isLive: { control: "boolean" },
    liveHint: { control: "text" },
  },
  args: {
    content: "15 Jan, 08:00",
    visible: true,
    position: 100,
    side: "start",
    isLive: false,
    liveHint: "",
  },
  render: (args: {
    content: string;
    visible: boolean;
    position: number;
    side: "start" | "end";
    isLive: boolean;
    liveHint: string;
  }) => html`
    <div
      style="position: relative; height: 60px; background: var(--card-background-color); border-radius: 8px;"
    >
      <range-tooltip
        .content=${args.content}
        .visible=${args.visible}
        .position=${args.position}
        .isLive=${args.isLive}
        .liveHint=${args.liveHint}
        side=${args.side}
      ></range-tooltip>
    </div>
  `,
};

export const Default = {};

export const EndSide = {
  args: { side: "end", content: "15 Jan, 20:00", position: 300 },
};

export const LiveEdge = {
  args: {
    side: "end",
    content: "Now",
    position: 380,
    isLive: true,
    liveHint: "Updates with new data",
  },
};

export const Hidden = {
  args: { visible: false },
};
