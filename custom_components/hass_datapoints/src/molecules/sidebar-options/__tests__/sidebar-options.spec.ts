import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../sidebar-options";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("sidebar-options") as HTMLElement & {
    datapointScope: string;
    showIcons: boolean;
    showLines: boolean;
    showTooltips: boolean;
    showHoverGuides: boolean;
    hoverSnapMode: string;
    showCorrelatedAnomalies: boolean;
    showDataGaps: boolean;
    dataGapThreshold: string;
    yAxisMode: string;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    datapointScope: "linked",
    showIcons: true,
    showLines: true,
    showTooltips: true,
    showHoverGuides: false,
    hoverSnapMode: "follow_series",
    showCorrelatedAnomalies: false,
    showDataGaps: true,
    dataGapThreshold: "2h",
    yAxisMode: "combined",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

type DatapointsSectionEl = HTMLElement & { datapointScope: string };
type DatapointDisplaySectionEl = HTMLElement & {
  showIcons: boolean;
  showLines: boolean;
};
type AnalysisSectionEl = HTMLElement & {
  anomalyOverlapMode: string;
  showCorrelatedAnomalies: boolean;
};
type ChartDisplaySectionEl = HTMLElement & {
  showTooltips: boolean;
  showHoverGuides: boolean;
  hoverSnapMode: string;
  showDataGaps: boolean;
  dataGapThreshold: string;
  yAxisMode: string;
};

describe("sidebar-options", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders sidebar-datapoints-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("sidebar-datapoints-section")
        ).not.toBeNull();
      });

      it("THEN renders sidebar-datapoint-display-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("sidebar-datapoint-display-section")
        ).not.toBeNull();
      });

      it("THEN renders sidebar-chart-display-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("sidebar-chart-display-section")
        ).not.toBeNull();
      });

      it("THEN renders sidebar-analysis-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("sidebar-analysis-section")
        ).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Prop binding — datapoints section
  // ---------------------------------------------------------------------------

  describe("GIVEN datapointScope is all", () => {
    beforeEach(async () => {
      el = createElement({ datapointScope: "all" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN sidebar-datapoints-section receives datapointScope=all", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<DatapointsSectionEl>(
          "sidebar-datapoints-section"
        )!;
        expect(section.datapointScope).toBe("all");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Prop binding — datapoint display section
  // ---------------------------------------------------------------------------

  describe("GIVEN showIcons=false and showLines=false", () => {
    beforeEach(async () => {
      el = createElement({ showIcons: false, showLines: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN sidebar-datapoint-display-section receives showIcons=false", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<DatapointDisplaySectionEl>(
          "sidebar-datapoint-display-section"
        )!;
        expect(section.showIcons).toBe(false);
      });

      it("THEN sidebar-datapoint-display-section receives showLines=false", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<DatapointDisplaySectionEl>(
          "sidebar-datapoint-display-section"
        )!;
        expect(section.showLines).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Prop binding — chart display section
  // ---------------------------------------------------------------------------

  describe("GIVEN showDataGaps=false and yAxisMode=split", () => {
    beforeEach(async () => {
      el = createElement({ showDataGaps: false, yAxisMode: "split" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN sidebar-chart-display-section receives showDataGaps=false", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<ChartDisplaySectionEl>(
          "sidebar-chart-display-section"
        )!;
        expect(section.showDataGaps).toBe(false);
      });

      it("THEN sidebar-chart-display-section receives yAxisMode=split", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<ChartDisplaySectionEl>(
          "sidebar-chart-display-section"
        )!;
        expect(section.yAxisMode).toBe("split");
      });
    });
  });

  describe("GIVEN hoverSnapMode=snap_to_data_points", () => {
    beforeEach(async () => {
      el = createElement({ hoverSnapMode: "snap_to_data_points" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN sidebar-chart-display-section receives hoverSnapMode=snap_to_data_points", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<ChartDisplaySectionEl>(
          "sidebar-chart-display-section"
        )!;
        expect(section.hoverSnapMode).toBe("snap_to_data_points");
      });
    });
  });

  describe("GIVEN showCorrelatedAnomalies=true", () => {
    beforeEach(async () => {
      el = createElement({ showCorrelatedAnomalies: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN sidebar-analysis-section receives showCorrelatedAnomalies=true", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector<AnalysisSectionEl>(
          "sidebar-analysis-section"
        )!;
        expect(section.showCorrelatedAnomalies).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Event bubbling
  // ---------------------------------------------------------------------------

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN dp-scope-change bubbles from sidebar-datapoints-section", () => {
      it("THEN the event reaches listeners on the host element", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-scope-change", handler);
        el.shadowRoot!.querySelector(
          "sidebar-datapoints-section"
        )!.dispatchEvent(
          new CustomEvent("dp-scope-change", {
            detail: { value: "all" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("all");
      });
    });

    describe("WHEN dp-display-change bubbles from sidebar-chart-display-section", () => {
      it("THEN the event reaches listeners on the host element", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        el.shadowRoot!.querySelector(
          "sidebar-chart-display-section"
        )!.dispatchEvent(
          new CustomEvent("dp-display-change", {
            detail: { kind: "tooltips", value: false },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("tooltips");
      });
    });

    describe("WHEN dp-display-change bubbles from sidebar-analysis-section", () => {
      it("THEN the event reaches listeners on the host element", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        el.shadowRoot!.querySelector("sidebar-analysis-section")!.dispatchEvent(
          new CustomEvent("dp-display-change", {
            detail: { kind: "correlated_anomalies", value: true },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe(
          "correlated_anomalies"
        );
      });
    });
  });
});
