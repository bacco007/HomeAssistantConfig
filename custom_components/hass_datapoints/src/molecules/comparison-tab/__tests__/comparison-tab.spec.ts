import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../comparison-tab";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("comparison-tab") as HTMLElement & {
    tabId: string;
    label: string;
    detail: string;
    active: boolean;
    previewing: boolean;
    loading: boolean;
    editable: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    tabId: "tab-1",
    label: "Selected range",
    detail: "Jan 1 – Jan 7",
    active: false,
    previewing: false,
    loading: false,
    editable: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("comparison-tab", () => {
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
      it("THEN renders the chart-tab container", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".chart-tab")).not.toBeNull();
      });

      it("THEN renders the trigger button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".chart-tab-trigger")
        ).not.toBeNull();
      });

      it("THEN renders the label text", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector(".chart-tab-label");
        expect(label?.textContent?.trim()).toBe("Selected range");
      });

      it("THEN renders the detail text", () => {
        expect.assertions(1);
        const detail = el.shadowRoot!.querySelector(".chart-tab-detail");
        expect(detail?.textContent?.trim()).toBe("Jan 1 – Jan 7");
      });

      it("THEN does not render the spinner", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".chart-tab-spinner")).toBeNull();
      });

      it("THEN does not render action buttons when not editable", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".chart-tab-actions")).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Active state
  // ---------------------------------------------------------------------------

  describe("GIVEN active=true", () => {
    beforeEach(async () => {
      el = createElement({ active: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN chart-tab has the active class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".chart-tab")
            ?.classList.contains("active")
        ).toBe(true);
      });

      it("THEN the trigger button has aria-current", () => {
        expect.assertions(1);
        const trigger = el.shadowRoot!.querySelector(".chart-tab-trigger");
        expect(trigger?.hasAttribute("aria-current")).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Previewing state
  // ---------------------------------------------------------------------------

  describe("GIVEN previewing=true", () => {
    beforeEach(async () => {
      el = createElement({ previewing: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN chart-tab has the previewing class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".chart-tab")
            ?.classList.contains("previewing")
        ).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  describe("GIVEN loading=true", () => {
    beforeEach(async () => {
      el = createElement({ loading: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN chart-tab has the loading class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".chart-tab")
            ?.classList.contains("loading")
        ).toBe(true);
      });

      it("THEN the spinner is rendered", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".chart-tab-spinner")
        ).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Editable state
  // ---------------------------------------------------------------------------

  describe("GIVEN editable=true", () => {
    beforeEach(async () => {
      el = createElement({ editable: true, label: "My window" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the chart-tab-actions container", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".chart-tab-actions")
        ).not.toBeNull();
      });

      it("THEN renders the edit button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".chart-tab-action.edit")
        ).not.toBeNull();
      });

      it("THEN renders the delete button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".chart-tab-action.delete")
        ).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement({ tabId: "win-abc" });
      await el.updateComplete;
    });

    describe("WHEN the trigger button is clicked", () => {
      it("THEN fires dp-tab-activate with the tabId", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-activate", handler);
        el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".chart-tab-trigger"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("win-abc");
      });
    });

    describe("WHEN mouseenter fires on the chart-tab", () => {
      it("THEN fires dp-tab-hover with the tabId", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-hover", handler);
        el.shadowRoot!.querySelector(".chart-tab")!.dispatchEvent(
          new MouseEvent("mouseenter", { bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("win-abc");
      });
    });

    describe("WHEN mouseleave fires on the chart-tab", () => {
      it("THEN fires dp-tab-leave with the tabId", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-leave", handler);
        el.shadowRoot!.querySelector(".chart-tab")!.dispatchEvent(
          new MouseEvent("mouseleave", { bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("win-abc");
      });
    });
  });

  describe("GIVEN editable=true and rendered", () => {
    beforeEach(async () => {
      el = createElement({ tabId: "win-xyz", editable: true });
      await el.updateComplete;
    });

    describe("WHEN the edit button is clicked", () => {
      it("THEN fires dp-tab-edit with the tabId", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-edit", handler);
        el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".chart-tab-action.edit"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("win-xyz");
      });
    });

    describe("WHEN the delete button is clicked", () => {
      it("THEN fires dp-tab-delete with the tabId", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-delete", handler);
        el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".chart-tab-action.delete"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("win-xyz");
      });
    });
  });
});
