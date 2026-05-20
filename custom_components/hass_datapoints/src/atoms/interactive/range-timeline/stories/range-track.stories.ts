import { html } from "lit";
import "../range-track";

/**
 * `range-track` renders the track bar with a positioned selection highlight.
 *
 * Pure display component — receives percentage positions as props.
 * The parent positions handles and owns drag logic.
 */
export default {
  title: "Atoms/Interactive/Range Timeline/Range Track",
  component: "range-track",
  parameters: { layout: "padded" },
  argTypes: {
    selectionLeftPct: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    selectionWidthPct: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    selectionDragging: { control: "boolean" },
  },
  args: {
    selectionLeftPct: 20,
    selectionWidthPct: 40,
    selectionDragging: false,
  },
  render: (args: {
    selectionLeftPct: number;
    selectionWidthPct: number;
    selectionDragging: boolean;
  }) => html`
    <div
      style="position: relative; height: 52px; background: var(--card-background-color); border-radius: 8px;"
    >
      <range-track
        .selectionLeftPct=${args.selectionLeftPct}
        .selectionWidthPct=${args.selectionWidthPct}
        .selectionDragging=${args.selectionDragging}
      ></range-track>
    </div>
  `,
};

export const Default = {};

export const FullWidth = {
  args: { selectionLeftPct: 0, selectionWidthPct: 100 },
};

export const NarrowSelection = {
  args: { selectionLeftPct: 45, selectionWidthPct: 10 },
};

export const Dragging = {
  args: {
    selectionLeftPct: 20,
    selectionWidthPct: 40,
    selectionDragging: true,
  },
};
