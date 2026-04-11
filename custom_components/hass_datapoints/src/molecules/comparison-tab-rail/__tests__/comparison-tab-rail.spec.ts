import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../comparison-tab-rail";
import type { TabItem } from "../comparison-tab-rail";

const SAMPLE_TABS: TabItem[] = [
  {
    id: "current-range",
    label: "Selected range",
    detail: "1 Jan – 7 Jan",
    active: true,
    editable: false,
  },
  {
    id: "window-1",
    label: "Heating season",
    detail: "1 Nov – 31 Mar",
    active: false,
    editable: true,
  },
  {
    id: "window-2",
    label: "Summer 2024",
    detail: "1 Jun – 31 Aug",
    active: false,
    editable: true,
  },
];

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("comparison-tab-rail") as HTMLElement & {
    tabs: TabItem[];
    loadingIds: string[];
    hoveredId: string;
    overflowing: boolean;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    tabs: SAMPLE_TABS,
    loadingIds: [],
    hoveredId: "",
    overflowing: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("comparison-tab-rail", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN default props with three tabs", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the chart-tabs-shell container", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".chart-tabs-shell")
        ).not.toBeNull();
      });

      it("THEN renders a comparison-tab for each tab", () => {
        expect.assertions(1);
        const tabs = el.shadowRoot!.querySelectorAll("comparison-tab");
        expect(tabs.length).toBe(3);
      });

      it("THEN renders the Add date window button", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".chart-tabs-add")).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Prop binding
  // ---------------------------------------------------------------------------

  describe("GIVEN loadingIds includes window-1", () => {
    beforeEach(async () => {
      el = createElement({ loadingIds: ["window-1"] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the matching comparison-tab receives loading=true", () => {
        expect.assertions(1);
        const tabs = Array.from(
          el.shadowRoot!.querySelectorAll("comparison-tab")
        ) as (HTMLElement & { loading: boolean; tabId: string })[];
        const loadingTab = tabs.find((t) => t.tabId === "window-1");
        expect(loadingTab?.loading).toBe(true);
      });

      it("THEN other tabs do not receive loading=true", () => {
        expect.assertions(1);
        const tabs = Array.from(
          el.shadowRoot!.querySelectorAll("comparison-tab")
        ) as (HTMLElement & { loading: boolean; tabId: string })[];
        const otherTab = tabs.find((t) => t.tabId === "current-range");
        expect(otherTab?.loading).toBe(false);
      });
    });
  });

  describe("GIVEN hoveredId is window-2", () => {
    beforeEach(async () => {
      el = createElement({ hoveredId: "window-2" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the matching comparison-tab receives previewing=true", () => {
        expect.assertions(1);
        const tabs = Array.from(
          el.shadowRoot!.querySelectorAll("comparison-tab")
        ) as (HTMLElement & { previewing: boolean; tabId: string })[];
        const previewingTab = tabs.find((t) => t.tabId === "window-2");
        expect(previewingTab?.previewing).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  describe("GIVEN the component is rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN dp-tab-add is triggered via Add button click", () => {
      it("THEN fires dp-tab-add on the host element", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-tab-add", handler);
        el.shadowRoot!.querySelector<HTMLButtonElement>(
          ".chart-tabs-add"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN dp-tab-activate bubbles from a child comparison-tab", () => {
      it("THEN the event reaches listeners on the host element", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-activate", handler);
        const tab = el.shadowRoot!.querySelector("comparison-tab")!;
        tab.dispatchEvent(
          new CustomEvent("dp-tab-activate", {
            detail: { tabId: "current-range" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("current-range");
      });
    });

    describe("WHEN dp-tab-delete bubbles from a child comparison-tab", () => {
      it("THEN the event reaches listeners on the host element", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-tab-delete", handler);
        const tab = el.shadowRoot!.querySelector("comparison-tab")!;
        tab.dispatchEvent(
          new CustomEvent("dp-tab-delete", {
            detail: { tabId: "window-1" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.tabId).toBe("window-1");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Empty tabs
  // ---------------------------------------------------------------------------

  describe("GIVEN tabs is an empty array", () => {
    beforeEach(async () => {
      el = createElement({ tabs: [] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders no comparison-tab elements", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelectorAll("comparison-tab").length).toBe(
          0
        );
      });

      it("THEN still renders the Add date window button", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".chart-tabs-add")).not.toBeNull();
      });
    });
  });

  describe("GIVEN the rail reconnects", () => {
    describe("WHEN disconnected and connected again", () => {
      it("THEN it disconnects and recreates its ResizeObserver cleanly", async () => {
        expect.assertions(4);
        const observe = vi.fn();
        const disconnect = vi.fn();
        class MockResizeObserver {
          observe = observe;

          disconnect = disconnect;
        }
        vi.stubGlobal(
          "ResizeObserver",
          MockResizeObserver as unknown as typeof ResizeObserver
        );

        el = createElement();
        await el.updateComplete;
        await Promise.resolve();

        document.body.removeChild(el);
        expect(disconnect).toHaveBeenCalledTimes(1);

        observe.mockClear();
        document.body.appendChild(el);
        await el.updateComplete;
        await Promise.resolve();

        expect(observe).toHaveBeenCalledTimes(1);
        expect(
          (el as HTMLElement & { _resizeObserver?: unknown })._resizeObserver
        ).toBeTruthy();
        expect(disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
