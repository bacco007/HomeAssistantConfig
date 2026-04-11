import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../sidebar-datapoints-section";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement(
    "sidebar-datapoints-section"
  ) as HTMLElement & {
    datapointScope: string;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, { datapointScope: "linked", ...props });
  document.body.appendChild(el);
  return el;
}

type RadioGroupEl = HTMLElement & { name: string; value: string };

describe("sidebar-datapoints-section", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN datapointScope is linked", () => {
    beforeEach(async () => {
      el = createElement({ datapointScope: "linked" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders a sidebar-options-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("sidebar-options-section")
        ).not.toBeNull();
      });

      it("THEN renders a radio-group inside the section slot", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("radio-group")).not.toBeNull();
      });

      it("THEN the radio group value is linked", () => {
        expect.assertions(1);
        const group =
          el.shadowRoot!.querySelector<RadioGroupEl>("radio-group")!;
        expect(group.value).toBe("linked");
      });
    });
  });

  describe("GIVEN datapointScope is all", () => {
    beforeEach(async () => {
      el = createElement({ datapointScope: "all" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the radio group value is all", () => {
        expect.assertions(1);
        const group =
          el.shadowRoot!.querySelector<RadioGroupEl>("radio-group")!;
        expect(group.value).toBe("all");
      });
    });
  });

  describe("GIVEN datapointScope is hidden", () => {
    beforeEach(async () => {
      el = createElement({ datapointScope: "hidden" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the radio group value is hidden", () => {
        expect.assertions(1);
        const group =
          el.shadowRoot!.querySelector<RadioGroupEl>("radio-group")!;
        expect(group.value).toBe("hidden");
      });
    });
  });

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the radio group emits dp-radio-change with value=all", () => {
      it("THEN dispatches dp-scope-change with value=all", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-scope-change", handler);
        el.shadowRoot!.querySelector("radio-group")!.dispatchEvent(
          new CustomEvent("dp-radio-change", {
            detail: { value: "all" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("all");
      });
    });
  });
});
