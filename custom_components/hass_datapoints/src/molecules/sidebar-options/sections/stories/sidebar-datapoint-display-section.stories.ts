import { html } from "lit";
import "../sidebar-datapoint-display-section";

/**
 * `sidebar-datapoint-display-section` renders the "Datapoint Display" sidebar section,
 * controlling whether annotation datapoint icons and dotted lines are shown on the chart.
 *
 * @fires dp-display-change - `{ kind: string, value: boolean }` fired when a checkbox toggles
 */
export default {
  title: "Molecules/Sidebar Options/Datapoint Display Section",
  component: "sidebar-datapoint-display-section",
  parameters: {
    actions: {
      handles: ["dp-display-change", "dp-item-change"],
    },
  },
  argTypes: {
    showIcons: {
      control: "boolean",
      description: "Whether datapoint icons are rendered on the chart.",
    },
    showLines: {
      control: "boolean",
      description: "Whether dotted lines are drawn for each datapoint.",
    },
  },
  args: {
    showIcons: true,
    showLines: true,
  },
  render: (args: RecordWithUnknownValues) => html`
    <sidebar-datapoint-display-section
      .showIcons=${args.showIcons}
      .showLines=${args.showLines}
    ></sidebar-datapoint-display-section>
  `,
};

/** Both icons and lines enabled — the default state. */
export const Default = {};

/** Icons disabled, lines still on. */
export const IconsOff = {
  args: { showIcons: false },
};

/** Both icons and lines disabled. */
export const AllOff = {
  args: { showIcons: false, showLines: false },
};
