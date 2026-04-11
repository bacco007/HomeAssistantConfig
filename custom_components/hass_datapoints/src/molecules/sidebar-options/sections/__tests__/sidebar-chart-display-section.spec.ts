import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../sidebar-chart-display-section";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement(
    "sidebar-chart-display-section"
  ) as HTMLElement & {
    showTooltips: boolean;
    showHoverGuides: boolean;
    hoverSnapMode: string;
    showDataGaps: boolean;
    dataGapThreshold: string;
    yAxisMode: string;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    showTooltips: true,
    showHoverGuides: false,
    hoverSnapMode: "follow_series",
    showDataGaps: true,
    dataGapThreshold: "2h",
    yAxisMode: "combined",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

type CheckboxListEl = HTMLElement & {
  items: { name: string; label: string; checked: boolean }[];
};
type RadioGroupEl = HTMLElement & { name: string; value: string };

describe("sidebar-chart-display-section", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders a sidebar-options-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("sidebar-options-section")
        ).not.toBeNull();
      });

      it("THEN renders a checkbox-list", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("checkbox-list")).not.toBeNull();
      });

      it("THEN renders the gap threshold select", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".is-subopt inline-select")
        ).not.toBeNull();
      });

      it("THEN renders the y-axis radio-group", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelectorAll("radio-group")).toHaveLength(2);
      });
    });
  });

  describe("GIVEN showDataGaps is true", () => {
    beforeEach(async () => {
      el = createElement({ showDataGaps: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the gap threshold inline-select is not disabled", () => {
        expect.assertions(1);
        const inlineSelect = el.shadowRoot!.querySelector<
          HTMLElement & { disabled: boolean }
        >(".is-subopt inline-select")!;
        expect(inlineSelect.disabled).toBe(false);
      });

      it("THEN the subopt wrapper does not have is-disabled class", () => {
        expect.assertions(1);
        const subopt = el.shadowRoot!.querySelector(".is-subopt")!;
        expect(subopt.classList.contains("is-disabled")).toBe(false);
      });
    });
  });

  describe("GIVEN showDataGaps is false", () => {
    beforeEach(async () => {
      el = createElement({ showDataGaps: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the gap threshold inline-select is disabled", () => {
        expect.assertions(1);
        const inlineSelect = el.shadowRoot!.querySelector<
          HTMLElement & { disabled: boolean }
        >(".is-subopt inline-select")!;
        expect(inlineSelect.disabled).toBe(true);
      });

      it("THEN the subopt wrapper has is-disabled class", () => {
        expect.assertions(1);
        const subopt = el.shadowRoot!.querySelector(".is-subopt")!;
        expect(subopt.classList.contains("is-disabled")).toBe(true);
      });
    });
  });

  describe("GIVEN yAxisMode is unique", () => {
    beforeEach(async () => {
      el = createElement({ yAxisMode: "unique" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the y-axis radio group value is unique", () => {
        expect.assertions(1);
        const group =
          el.shadowRoot!.querySelector<RadioGroupEl>("radio-group")!;
        expect(group.value).toBe("unique");
      });
    });
  });

  describe("GIVEN hoverSnapMode is snap_to_data_points", () => {
    beforeEach(async () => {
      el = createElement({ hoverSnapMode: "snap_to_data_points" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the hover snap radio group value is snap_to_data_points", () => {
        expect.assertions(1);
        const groups =
          el.shadowRoot!.querySelectorAll<RadioGroupEl>("radio-group");
        expect(groups[1].value).toBe("snap_to_data_points");
      });
    });
  });

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the checkbox list emits dp-item-change for data_gaps=false", () => {
      it("THEN dispatches dp-display-change with kind=data_gaps and value=false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        el.shadowRoot!.querySelector<CheckboxListEl>(
          "checkbox-list"
        )!.dispatchEvent(
          new CustomEvent("dp-item-change", {
            detail: { name: "data_gaps", checked: false },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("data_gaps");
        expect(handler.mock.calls[0][0].detail.value).toBe(false);
      });
    });

    describe("WHEN the gap threshold inline-select emits dp-select-change", () => {
      it("THEN dispatches dp-display-change with kind=data_gap_threshold and the new value", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        const inlineSelect = el.shadowRoot!.querySelector(
          ".is-subopt inline-select"
        )!;
        inlineSelect.dispatchEvent(
          new CustomEvent("dp-select-change", {
            detail: { value: "6h" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("data_gap_threshold");
        expect(handler.mock.calls[0][0].detail.value).toBe("6h");
      });
    });

    describe("WHEN the y-axis radio group emits dp-radio-change with value=split", () => {
      it("THEN dispatches dp-display-change with kind=y_axis_mode and value=split", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        el.shadowRoot!.querySelector<RadioGroupEl>(
          "radio-group"
        )!.dispatchEvent(
          new CustomEvent("dp-radio-change", {
            detail: { value: "split" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("y_axis_mode");
        expect(handler.mock.calls[0][0].detail.value).toBe("split");
      });
    });

    describe("WHEN the hover snap radio group emits dp-radio-change with value=snap_to_data_points", () => {
      it("THEN dispatches dp-display-change with kind=hover_snap_mode and value=snap_to_data_points", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        const groups =
          el.shadowRoot!.querySelectorAll<RadioGroupEl>("radio-group");
        groups[1].dispatchEvent(
          new CustomEvent("dp-radio-change", {
            detail: { value: "snap_to_data_points" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("hover_snap_mode");
        expect(handler.mock.calls[0][0].detail.value).toBe(
          "snap_to_data_points"
        );
      });
    });
  });
});
