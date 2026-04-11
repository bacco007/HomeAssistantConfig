import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../sidebar-analysis-section";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement(
    "sidebar-analysis-section"
  ) as HTMLElement & {
    anomalyOverlapMode: string;
    showCorrelatedAnomalies: boolean;
    anyAnomaliesEnabled: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    anomalyOverlapMode: "all",
    showCorrelatedAnomalies: false,
    anyAnomaliesEnabled: true,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

type CheckboxListEl = HTMLElement & {
  items: { name: string; label: string; checked: boolean }[];
};
type RadioGroupEl = HTMLElement & { value: string };

describe("sidebar-analysis-section", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN anomalies are enabled", () => {
    beforeEach(async () => {
      el = createElement({
        anyAnomaliesEnabled: true,
        showCorrelatedAnomalies: true,
        anomalyOverlapMode: "only",
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the correlated anomalies checkbox", () => {
        expect.assertions(2);
        const checkboxList =
          el.shadowRoot!.querySelector<CheckboxListEl>("checkbox-list");
        expect(checkboxList).not.toBeNull();
        expect(checkboxList!.items[0]).toEqual({
          name: "correlated_anomalies",
          label: "Highlight correlated anomalies",
          checked: true,
        });
      });

      it("THEN renders the anomaly overlap mode radio group", () => {
        expect.assertions(1);
        const radio = el.shadowRoot!.querySelector<RadioGroupEl>("radio-group");
        expect(radio!.value).toBe("only");
      });
    });
  });

  describe("GIVEN anomalies are disabled", () => {
    beforeEach(async () => {
      el = createElement({ anyAnomaliesEnabled: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN shows the enable anomalies notice", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.textContent).toContain("Show anomalies");
      });
    });
  });

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the checkbox list emits dp-item-change", () => {
      it("THEN dispatches dp-display-change for correlated anomalies", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        el.shadowRoot!.querySelector<CheckboxListEl>(
          "checkbox-list"
        )!.dispatchEvent(
          new CustomEvent("dp-item-change", {
            detail: { name: "correlated_anomalies", checked: true },
            bubbles: true,
            composed: true,
          })
        );

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe(
          "correlated_anomalies"
        );
        expect(handler.mock.calls[0][0].detail.value).toBe(true);
      });
    });

    describe("WHEN the radio group emits dp-radio-change", () => {
      it("THEN dispatches dp-analysis-change for anomaly overlap mode", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-analysis-change", handler);
        el.shadowRoot!.querySelector<RadioGroupEl>(
          "radio-group"
        )!.dispatchEvent(
          new CustomEvent("dp-radio-change", {
            detail: { value: "only" },
            bubbles: true,
            composed: true,
          })
        );

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe(
          "anomaly_overlap_mode"
        );
        expect(handler.mock.calls[0][0].detail.value).toBe("only");
      });
    });
  });
});
