import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../page-menu-item";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("page-menu-item") as HTMLElement & {
    icon: string;
    label: string;
    disabled: boolean;
  };
  Object.assign(el, {
    icon: "mdi:chart-line",
    label: "History",
    disabled: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("page-menu-item", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a page menu item with icon and label", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the label text", () => {
        expect.assertions(1);
        const text = el.shadowRoot!.textContent?.trim();
        expect(text).toContain("History");
      });

      it("THEN it shows the icon", () => {
        expect.assertions(1);
        const icon = el.shadowRoot!.querySelector("ha-icon");
        expect(icon?.getAttribute("icon")).toBe("mdi:chart-line");
      });

      it("THEN the button is not disabled", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.disabled).toBe(false);
      });
    });
  });

  describe("GIVEN a disabled page menu item", () => {
    beforeEach(async () => {
      el = createElement({ disabled: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the button is disabled", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.disabled).toBe(true);
      });
    });

    describe("WHEN clicked", () => {
      it("THEN it does not fire dp-menu-action", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-menu-action", handler);
        el.shadowRoot!.querySelector("button")!.click();
        expect(handler).not.toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN an enabled page menu item", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN clicked", () => {
      it("THEN it fires dp-menu-action", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-menu-action", handler);
        el.shadowRoot!.querySelector("button")!.click();
        expect(handler).toHaveBeenCalledOnce();
      });
    });
  });
});
