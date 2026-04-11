import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../collapsed-options-menu";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("collapsed-options-menu") as HTMLElement & {
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
    anomalyOverlapMode: string;
    anyAnomaliesEnabled: boolean;
    activeSection: Nullable<string>;
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
    anomalyOverlapMode: "all",
    anyAnomaliesEnabled: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("collapsed-options-menu", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders 4 menu-item buttons", () => {
        const buttons = el.shadowRoot!.querySelectorAll(".menu-item");
        expect(buttons.length).toBe(4);
      });

      it("THEN buttons have the correct labels", () => {
        const labels = [
          ...el.shadowRoot!.querySelectorAll(".menu-item-label"),
        ].map((element) => element.textContent?.trim());
        expect(labels).toEqual([
          "Datapoints",
          "Datapoint Display",
          "Analysis",
          "Chart Display",
        ]);
      });

      it("THEN no level-2 panel is shown", () => {
        expect(el.shadowRoot!.querySelector(".menu-level2")).toBeNull();
      });
    });
  });

  describe("GIVEN element is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN mouseenter fires on the Datapoints button", () => {
      it("THEN level-2 panel appears", async () => {
        const firstButton = el.shadowRoot!.querySelector(".menu-item")!;
        firstButton.dispatchEvent(
          new MouseEvent("mouseenter", { bubbles: true })
        );
        await el.updateComplete;
        expect(el.shadowRoot!.querySelector(".menu-level2")).toBeTruthy();
      });
    });

    describe("WHEN click fires on the Analysis button", () => {
      it("THEN level-2 panel appears and activeSection is analysis", async () => {
        const buttons = el.shadowRoot!.querySelectorAll(".menu-item");
        const analysisButton = buttons[2]; // index 2 = "Analysis"
        analysisButton.dispatchEvent(
          new MouseEvent("click", { bubbles: true })
        );
        await el.updateComplete;
        expect(el.activeSection).toBe("analysis");
        expect(el.shadowRoot!.querySelector(".menu-level2")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a section is active", () => {
    beforeEach(async () => {
      el = createElement({ activeSection: "datapoints" } as Record<
        string,
        unknown
      >);
      await el.updateComplete;
    });

    describe("WHEN mouseleave fires on level-1 and timer runs out", () => {
      it("THEN activeSection becomes null after 200ms", async () => {
        vi.useFakeTimers();
        const level1 = el.shadowRoot!.querySelector(".menu-level1")!;
        level1.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        expect(el.activeSection).toBe("datapoints"); // not yet closed
        vi.advanceTimersByTime(200);
        await el.updateComplete;
        expect(el.activeSection).toBeNull();
        vi.useRealTimers();
      });
    });

    describe("WHEN mouseenter fires on level-2 panel before the close timer fires", () => {
      it("THEN close is cancelled and activeSection remains set", async () => {
        vi.useFakeTimers();
        const level1 = el.shadowRoot!.querySelector(".menu-level1")!;
        const level2 = el.shadowRoot!.querySelector(".menu-level2")!;
        level1.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        // cancel before 200ms
        level2.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        vi.advanceTimersByTime(200);
        await el.updateComplete;
        expect(el.activeSection).toBe("datapoints");
        vi.useRealTimers();
      });
    });
  });

  describe("GIVEN the chart-display section is active", () => {
    beforeEach(async () => {
      el = createElement({
        activeSection: "chart-display",
        hoverSnapMode: "snap_to_data_points",
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN forwards hoverSnapMode to the chart display section", () => {
        expect.assertions(1);
        const section = el.shadowRoot!.querySelector(
          "sidebar-chart-display-section"
        ) as HTMLElement & {
          hoverSnapMode: string;
        };
        expect(section.hoverSnapMode).toBe("snap_to_data_points");
      });
    });
  });
});
