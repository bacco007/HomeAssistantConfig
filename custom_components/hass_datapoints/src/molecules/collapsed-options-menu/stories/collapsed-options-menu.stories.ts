import { html } from "lit";
import "../collapsed-options-menu";

export default {
  title: "Molecules/Collapsed Options Menu",
  component: "collapsed-options-menu",
  parameters: {
    actions: {
      handles: ["dp-scope-change", "dp-display-change", "dp-analysis-change"],
    },
  },
};

const defaultProps = {
  datapointScope: "linked",
  showIcons: true,
  showLines: true,
  showTooltips: true,
  showHoverGuides: false,
  showCorrelatedAnomalies: false,
  showDataGaps: true,
  dataGapThreshold: "2h",
  yAxisMode: "combined",
  anomalyOverlapMode: "all",
  anyAnomaliesEnabled: false,
};

export const Default = {
  render: () => html`
    <collapsed-options-menu
      .datapointScope=${defaultProps.datapointScope}
      .showIcons=${defaultProps.showIcons}
      .showLines=${defaultProps.showLines}
      .showTooltips=${defaultProps.showTooltips}
      .showHoverGuides=${defaultProps.showHoverGuides}
      .showCorrelatedAnomalies=${defaultProps.showCorrelatedAnomalies}
      .showDataGaps=${defaultProps.showDataGaps}
      .dataGapThreshold=${defaultProps.dataGapThreshold}
      .yAxisMode=${defaultProps.yAxisMode}
      .anomalyOverlapMode=${defaultProps.anomalyOverlapMode}
      .anyAnomaliesEnabled=${defaultProps.anyAnomaliesEnabled}
    ></collapsed-options-menu>
  `,
};

export const DatapointsSectionOpen = {
  render: () => html`
    <collapsed-options-menu
      .datapointScope=${defaultProps.datapointScope}
      .showIcons=${defaultProps.showIcons}
      .showLines=${defaultProps.showLines}
      .showTooltips=${defaultProps.showTooltips}
      .showHoverGuides=${defaultProps.showHoverGuides}
      .showCorrelatedAnomalies=${defaultProps.showCorrelatedAnomalies}
      .showDataGaps=${defaultProps.showDataGaps}
      .dataGapThreshold=${defaultProps.dataGapThreshold}
      .yAxisMode=${defaultProps.yAxisMode}
      .anomalyOverlapMode=${defaultProps.anomalyOverlapMode}
      .anyAnomaliesEnabled=${defaultProps.anyAnomaliesEnabled}
      .activeSection=${"datapoints"}
    ></collapsed-options-menu>
  `,
};

export const AnalysisSectionOpen = {
  render: () => html`
    <collapsed-options-menu
      .datapointScope=${defaultProps.datapointScope}
      .showIcons=${defaultProps.showIcons}
      .showLines=${defaultProps.showLines}
      .showTooltips=${defaultProps.showTooltips}
      .showHoverGuides=${defaultProps.showHoverGuides}
      .showCorrelatedAnomalies=${defaultProps.showCorrelatedAnomalies}
      .showDataGaps=${defaultProps.showDataGaps}
      .dataGapThreshold=${defaultProps.dataGapThreshold}
      .yAxisMode=${defaultProps.yAxisMode}
      .anomalyOverlapMode=${defaultProps.anomalyOverlapMode}
      .anyAnomaliesEnabled=${defaultProps.anyAnomaliesEnabled}
      .activeSection=${"analysis"}
    ></collapsed-options-menu>
  `,
};
