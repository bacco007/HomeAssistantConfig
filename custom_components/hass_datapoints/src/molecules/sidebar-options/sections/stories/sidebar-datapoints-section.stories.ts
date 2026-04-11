import { html } from "lit";
import "../sidebar-datapoints-section";

/**
 * `sidebar-datapoints-section` renders the "Datapoints" sidebar section,
 * letting the user choose which annotation datapoints appear on the chart.
 *
 * @fires dp-scope-change - `{ value: string }` fired when the selected scope radio changes
 */
export default {
  title: "Molecules/Sidebar Options/Datapoints Section",
  component: "sidebar-datapoints-section",
  parameters: {
    actions: {
      handles: ["dp-scope-change", "dp-radio-change"],
    },
  },
  argTypes: {
    datapointScope: {
      control: "select",
      options: ["linked", "all", "hidden"],
      description:
        'Which annotation datapoints appear on the chart. One of "linked", "all", or "hidden".',
    },
  },
  args: {
    datapointScope: "linked",
  },
  render: (args: RecordWithUnknownValues) => html`
    <sidebar-datapoints-section
      .datapointScope=${args.datapointScope}
    ></sidebar-datapoints-section>
  `,
};

/** Scope set to linked — only datapoints tied to selected targets are shown. */
export const ScopeLinked = {};

/** Scope set to all — every datapoint regardless of target selection. */
export const ScopeAll = {
  args: { datapointScope: "all" },
};

/** Scope set to hidden — datapoints are not shown on the chart. */
export const ScopeHidden = {
  args: { datapointScope: "hidden" },
};
