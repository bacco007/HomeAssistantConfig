import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../editor-switch";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("editor-switch") as HTMLElement & {
    label: string;
    checked: boolean;
    tooltip: string;
  };
  Object.assign(el, {
    label: "Show lines",
    checked: false,
    tooltip: "",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("editor-switch", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a switch with a label", () => {
    beforeEach(async () => {
      el = createElement({ label: "Show event lines" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it creates ha-formfield and ha-switch elements", () => {
        expect(el.shadowRoot!.querySelector("ha-formfield")).toBeTruthy();
        expect(el.shadowRoot!.querySelector("ha-switch")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a switch", () => {
    beforeEach(async () => {
      el = createElement({ checked: false });
      await el.updateComplete;
    });

    describe("WHEN the switch fires change", () => {
      it("THEN it dispatches dp-switch-change with checked=true", () => {
        const handler = vi.fn();
        el.addEventListener("dp-switch-change", handler);
        const sw = el.shadowRoot!.querySelector("ha-switch") as any;
        sw.checked = true;
        sw.dispatchEvent(new Event("change", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.checked).toBe(true);
      });
    });
  });

  describe("GIVEN a switch with a tooltip", () => {
    beforeEach(async () => {
      el = createElement({
        tooltip: "Shows vertical lines at event positions",
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the tooltip text", () => {
        const tip = el.shadowRoot!.querySelector(".help-tooltip");
        expect(tip?.textContent?.trim()).toBe(
          "Shows vertical lines at event positions"
        );
      });
    });
  });
});
