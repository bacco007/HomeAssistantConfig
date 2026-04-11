import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../sidebar-datapoint-display-section";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement(
    "sidebar-datapoint-display-section"
  ) as HTMLElement & {
    showIcons: boolean;
    showLines: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, { showIcons: true, showLines: true, ...props });
  document.body.appendChild(el);
  return el;
}

type CheckboxListEl = HTMLElement & {
  items: { name: string; label: string; checked: boolean }[];
};

function getCheckboxList(el: ReturnType<typeof createElement>): CheckboxListEl {
  return el.shadowRoot!.querySelector<CheckboxListEl>("checkbox-list")!;
}

describe("sidebar-datapoint-display-section", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN showIcons=true and showLines=true", () => {
    beforeEach(async () => {
      el = createElement({ showIcons: true, showLines: true });
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
        expect(getCheckboxList(el)).not.toBeNull();
      });

      it("THEN the icons item is checked", () => {
        expect.assertions(1);
        const icons = getCheckboxList(el).items.find((i) => i.name === "icons");
        expect(icons?.checked).toBe(true);
      });

      it("THEN the lines item is checked", () => {
        expect.assertions(1);
        const lines = getCheckboxList(el).items.find((i) => i.name === "lines");
        expect(lines?.checked).toBe(true);
      });
    });
  });

  describe("GIVEN showIcons=false", () => {
    beforeEach(async () => {
      el = createElement({ showIcons: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the icons item is not checked", () => {
        expect.assertions(1);
        const icons = getCheckboxList(el).items.find((i) => i.name === "icons");
        expect(icons?.checked).toBe(false);
      });
    });
  });

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the checkbox list emits dp-item-change for icons=false", () => {
      it("THEN dispatches dp-display-change with kind=icons and value=false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        getCheckboxList(el).dispatchEvent(
          new CustomEvent("dp-item-change", {
            detail: { name: "icons", checked: false },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("icons");
        expect(handler.mock.calls[0][0].detail.value).toBe(false);
      });
    });

    describe("WHEN the checkbox list emits dp-item-change for lines=false", () => {
      it("THEN dispatches dp-display-change with kind=lines and value=false", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-display-change", handler);
        getCheckboxList(el).dispatchEvent(
          new CustomEvent("dp-item-change", {
            detail: { name: "lines", checked: false },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.kind).toBe("lines");
        expect(handler.mock.calls[0][0].detail.value).toBe(false);
      });
    });
  });
});
