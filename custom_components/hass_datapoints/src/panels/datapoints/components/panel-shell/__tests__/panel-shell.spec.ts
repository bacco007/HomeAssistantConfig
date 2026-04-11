import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../panel-shell";
import { setFrontendLocale } from "@/lib/i18n/localize";

type DpPanelShell = HTMLElement & {
  sidebarCollapsed: boolean;
  hasSavedState: boolean;
  layoutMode: string;
  updateComplete: Promise<boolean>;
  syncLayoutHeight(): void;
  closePageMenu(): void;
  getPageContentEl(): Nullable<HTMLElement>;
  getContentEl(): Nullable<HTMLElement>;
  getTargetPopupEl(): Nullable<HTMLElement>;
  getOptionsPopupEl(): Nullable<HTMLElement>;
};

function createElement(props: Partial<DpPanelShell> = {}): DpPanelShell {
  const el = document.createElement("panel-shell") as DpPanelShell;
  Object.assign(el, {
    sidebarCollapsed: false,
    hasSavedState: false,
    layoutMode: "desktop",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("panel-shell", () => {
  let el: DpPanelShell;

  afterEach(async () => {
    el?.remove();
    await setFrontendLocale("en");
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders ha-top-app-bar-fixed", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("ha-top-app-bar-fixed")
        ).not.toBeNull();
      });

      it("THEN renders ha-menu-button in navigationIcon slot", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("ha-menu-button")).not.toBeNull();
      });

      it("THEN renders the page-content div", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("#page-content")).not.toBeNull();
      });

      it("THEN renders page-sidebar", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("#page-sidebar")).not.toBeNull();
      });

      it("THEN renders the controls-section", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".controls-section")
        ).not.toBeNull();
      });

      it("THEN renders the sidebar-toggle button", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("#sidebar-toggle")).not.toBeNull();
      });

      it("THEN renders the page-menu-button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#page-menu-button")
        ).not.toBeNull();
      });

      it("THEN does NOT show Restore or Clear menu items when hasSavedState is false", () => {
        expect.assertions(2);
        const menu = el.shadowRoot!.querySelector("#page-menu");
        const items = menu!.querySelectorAll("page-menu-item");
        const labels = Array.from(items).map((i) => i.getAttribute("label"));
        expect(labels).not.toContain("Restore saved page");
        expect(labels).not.toContain("Clear saved page");
      });

      it("THEN shows Download and Save menu items", () => {
        expect.assertions(2);
        const menu = el.shadowRoot!.querySelector("#page-menu");
        const labels = Array.from(menu!.querySelectorAll("page-menu-item")).map(
          (i) => i.getAttribute("label")
        );
        expect(labels).toContain("Download spreadsheet");
        expect(labels).toContain("Save page state");
      });

      it("THEN renders collapsed-target-popup", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#collapsed-target-popup")
        ).not.toBeNull();
      });

      it("THEN renders collapsed-options-popup", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#collapsed-options-popup")
        ).not.toBeNull();
      });
    });
  });

  // ── hasSavedState ──────────────────────────────────────────────────────────

  describe("GIVEN hasSavedState=true", () => {
    beforeEach(async () => {
      el = createElement({ hasSavedState: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN shows Restore and Clear menu items", () => {
        expect.assertions(2);
        const labels = Array.from(
          el.shadowRoot!.querySelectorAll("page-menu-item")
        ).map((i) => i.getAttribute("label"));
        expect(labels).toContain("Restore saved page");
        expect(labels).toContain("Clear saved page");
      });
    });
  });

  // ── Sidebar collapsed ──────────────────────────────────────────────────────

  describe("GIVEN sidebarCollapsed=true", () => {
    beforeEach(async () => {
      el = createElement({ sidebarCollapsed: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN page-content has sidebar-collapsed class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector("#page-content")!
            .classList.contains("sidebar-collapsed")
        ).toBe(true);
      });

      it("THEN page-sidebar has collapsed class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector("#page-sidebar")!
            .classList.contains("collapsed")
        ).toBe(true);
      });

      it("THEN page-sidebar allows collapsed popovers to escape", () => {
        expect.assertions(1);
        const pageSidebar =
          el.shadowRoot!.querySelector<HTMLElement>("#page-sidebar");
        expect(getComputedStyle(pageSidebar!).overflow).toBe("visible");
      });

      it("THEN sidebar-body is hidden from interaction", () => {
        expect.assertions(3);
        const sidebarOptions =
          el.shadowRoot!.querySelector<HTMLElement>(".sidebar-options");
        expect(sidebarOptions).not.toBeNull();
        expect(getComputedStyle(sidebarOptions!).pointerEvents).toBe("none");
        expect(getComputedStyle(sidebarOptions!).visibility).toBe("hidden");
      });

      it("THEN the main target slot remains visible", () => {
        expect.assertions(2);
        const targetSlot =
          el.shadowRoot!.querySelector<HTMLElement>(".control-target");
        expect(targetSlot).not.toBeNull();
        expect(getComputedStyle(targetSlot!).display).not.toBe("none");
      });
    });
  });

  describe("GIVEN sidebarCollapsed=false", () => {
    beforeEach(async () => {
      el = createElement({ sidebarCollapsed: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN page-content does NOT have sidebar-collapsed class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector("#page-content")!
            .classList.contains("sidebar-collapsed")
        ).toBe(false);
      });

      it("THEN page-sidebar does NOT have collapsed class", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector("#page-sidebar")!
            .classList.contains("collapsed")
        ).toBe(false);
      });

      it("THEN page-sidebar scrolls vertically in expanded mode", () => {
        expect.assertions(1);
        const pageSidebar =
          el.shadowRoot!.querySelector<HTMLElement>("#page-sidebar");
        expect(getComputedStyle(pageSidebar!).overflowY).toBe("auto");
      });

      it("THEN sidebar-body remains visible", () => {
        expect.assertions(1);
        const sidebarOptions =
          el.shadowRoot!.querySelector<HTMLElement>(".sidebar-options");
        expect(getComputedStyle(sidebarOptions!).visibility).toBe("visible");
      });

      it("THEN sidebar options are not pinned to the bottom", () => {
        expect.assertions(1);
        const sidebarOptions =
          el.shadowRoot!.querySelector<HTMLElement>(".sidebar-options");
        expect(getComputedStyle(sidebarOptions!).marginTop).not.toBe("auto");
      });
    });
  });

  describe("GIVEN translated language props", () => {
    beforeEach(async () => {
      await setFrontendLocale("fi");
      el = createElement({
        hasSavedState: true,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN uses the provided localized labels", () => {
        expect.assertions(4);
        const title = el.shadowRoot!.querySelector('[slot="title"]');
        const menuButton = el.shadowRoot!.querySelector("#page-menu-button");
        const labels = Array.from(
          el.shadowRoot!.querySelectorAll("page-menu-item")
        ).map((item) => item.getAttribute("label"));
        const sidebarToggle = el.shadowRoot!.querySelector("#sidebar-toggle");

        expect(title?.textContent).toBe("Datapoints");
        expect(menuButton?.getAttribute("label")).toBe("Sivun asetukset");
        expect(labels).toContain("Lataa taulukko");
        expect(sidebarToggle?.getAttribute("label")).toBe(
          "Kutista kohteiden sivupalkki"
        );
      });
    });
  });

  // ── Sidebar toggle event ───────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN sidebar-toggle button is clicked", () => {
      it("THEN fires dp-shell-sidebar-toggle event", async () => {
        expect.assertions(1);
        const events: Event[] = [];
        el.addEventListener("dp-shell-sidebar-toggle", (ev) => events.push(ev));
        el.shadowRoot!.querySelector<HTMLElement>("#sidebar-toggle")!.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
      });
    });
  });

  // ── Page menu actions ──────────────────────────────────────────────────────

  describe("GIVEN hasSavedState=true", () => {
    beforeEach(async () => {
      el = createElement({ hasSavedState: true });
      await el.updateComplete;
    });

    describe("WHEN Download spreadsheet menu item fires dp-menu-action", () => {
      it("THEN fires dp-shell-menu-download event", async () => {
        expect.assertions(1);
        const events: Event[] = [];
        el.addEventListener("dp-shell-menu-download", (ev) => events.push(ev));
        const item = Array.from(
          el.shadowRoot!.querySelectorAll("page-menu-item")
        ).find((i) => i.getAttribute("label") === "Download spreadsheet");
        item!.dispatchEvent(
          new CustomEvent("dp-menu-action", { bubbles: true, composed: true })
        );
        await el.updateComplete;
        expect(events.length).toBe(1);
      });
    });

    describe("WHEN Restore menu item fires dp-menu-action", () => {
      it("THEN fires dp-shell-menu-restore event", async () => {
        expect.assertions(1);
        const events: Event[] = [];
        el.addEventListener("dp-shell-menu-restore", (ev) => events.push(ev));
        const item = Array.from(
          el.shadowRoot!.querySelectorAll("page-menu-item")
        ).find((i) => i.getAttribute("label") === "Restore saved page");
        item!.dispatchEvent(
          new CustomEvent("dp-menu-action", { bubbles: true, composed: true })
        );
        await el.updateComplete;
        expect(events.length).toBe(1);
      });
    });
  });

  // ── Public accessor methods ────────────────────────────────────────────────

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN getPageContentEl() is called", () => {
      it("THEN returns the #page-content element", () => {
        expect.assertions(1);
        expect(el.getPageContentEl()).toBe(
          el.shadowRoot!.querySelector("#page-content")
        );
      });
    });

    describe("WHEN getContentEl() is called", () => {
      it("THEN returns the #content element", () => {
        expect.assertions(1);
        expect(el.getContentEl()).toBe(
          el.shadowRoot!.querySelector("#content")
        );
      });
    });

    describe("WHEN getTargetPopupEl() is called", () => {
      it("THEN returns the #collapsed-target-popup element", () => {
        expect.assertions(1);
        expect(el.getTargetPopupEl()).toBe(
          el.shadowRoot!.querySelector("#collapsed-target-popup")
        );
      });
    });

    describe("WHEN getOptionsPopupEl() is called", () => {
      it("THEN returns the #collapsed-options-popup element", () => {
        expect.assertions(1);
        expect(el.getOptionsPopupEl()).toBe(
          el.shadowRoot!.querySelector("#collapsed-options-popup")
        );
      });
    });
  });

  // ── Slots ──────────────────────────────────────────────────────────────────

  describe("GIVEN slotted controls content", () => {
    beforeEach(async () => {
      el = createElement();
      const div = document.createElement("div");
      div.slot = "controls";
      div.id = "test-controls";
      el.appendChild(div);
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN exposes a controls slot", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("slot[name='controls']")
        ).not.toBeNull();
      });
    });
  });
});
