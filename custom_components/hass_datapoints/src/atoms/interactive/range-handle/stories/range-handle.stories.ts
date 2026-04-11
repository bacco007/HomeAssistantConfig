import { html } from "lit";
import "../range-handle";

/**
 * `range-handle` is a circular drag-handle button for a timeline range slider.
 * The parent owns positioning (`style.left`) and tooltip rendering; the handle fires
 * events for all pointer and keyboard interactions.
 *
 * @fires dp-handle-drag-start - pointer down on handle
 * @fires dp-handle-key-nudge  - arrow key press
 * @fires dp-handle-hover      - pointer entered
 * @fires dp-handle-leave      - pointer left
 * @fires dp-handle-focus      - received focus
 * @fires dp-handle-blur       - lost focus
 */
export default {
  title: "Atoms/Interactive/Range Handle",
  component: "range-handle",
  parameters: {
    actions: {
      handles: [
        "dp-handle-drag-start",
        "dp-handle-key-nudge",
        "dp-handle-hover",
        "dp-handle-leave",
        "dp-handle-focus",
        "dp-handle-blur",
      ],
    },
  },
  argTypes: {
    position: { control: { type: "range", min: 0, max: 100, step: 1 } },
    label: { control: "text" },
    live: { control: "boolean" },
  },
  args: {
    position: 30,
    label: "Start date and time",
    live: false,
  },
  render: (args: { position: number; label: string; live: boolean }) => html`
    <div
      style="position: relative; height: 52px; background: var(--card-background-color); border-radius: 8px;"
    >
      <div
        style="
        position: absolute;
        left: 0; right: 0;
        top: 26px;
        height: 4px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--primary-text-color, #111) 16%, transparent);
        transform: translateY(-50%);
      "
      ></div>
      <range-handle
        .position=${args.position}
        label="${args.label}"
        .live=${args.live}
      ></range-handle>
    </div>
  `,
};

export const Default = {
  args: { position: 30, label: "Start date and time", live: false },
};

export const EndHandle = {
  args: { position: 70, label: "End date and time", live: false },
};

export const LiveEdge = {
  args: { position: 100, label: "End date and time (live)", live: true },
};
