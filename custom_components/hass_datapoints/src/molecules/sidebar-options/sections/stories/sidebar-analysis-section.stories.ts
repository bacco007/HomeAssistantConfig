import { html } from "lit";
import "../sidebar-analysis-section";

export default {
  title: "Molecules/Sidebar Options/Analysis Section",
  component: "sidebar-analysis-section",
  parameters: {
    actions: {
      handles: [
        "dp-analysis-change",
        "dp-display-change",
        "dp-item-change",
        "dp-radio-change",
      ],
    },
  },
  argTypes: {
    anomalyOverlapMode: {
      control: "select",
      options: ["all", "only"],
    },
    showCorrelatedAnomalies: {
      control: "boolean",
    },
    anyAnomaliesEnabled: {
      control: "boolean",
    },
  },
  args: {
    anomalyOverlapMode: "all",
    showCorrelatedAnomalies: true,
    anyAnomaliesEnabled: true,
  },
  render: (args: RecordWithUnknownValues) => html`
    <sidebar-analysis-section
      .anomalyOverlapMode=${args.anomalyOverlapMode}
      .showCorrelatedAnomalies=${args.showCorrelatedAnomalies}
      .anyAnomaliesEnabled=${args.anyAnomaliesEnabled}
    ></sidebar-analysis-section>
  `,
};

export const Default = {};

export const DisabledUntilAnomaliesEnabled = {
  args: {
    anyAnomaliesEnabled: false,
    showCorrelatedAnomalies: false,
  },
};
