import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsQuickCard } from "../quick";

if (!customElements.get("hass-datapoints-quick-card")) {
  customElements.define("hass-datapoints-quick-card", HassRecordsQuickCard);
}

function createCard(config: RecordWithUnknownValues = {}) {
  const el = document.createElement("hass-datapoints-quick-card") as any;
  document.body.appendChild(el);
  el.setConfig({ title: "Quick Record", ...config });
  el.hass = createMockHass({
    callService: vi.fn(() => Promise.resolve()),
  });
  return el;
}

function getAnnotation(el: any) {
  return el.shadowRoot.querySelector("quick-annotation") as HTMLElement & {
    shadowRoot: ShadowRoot;
  };
}

describe("quick", () => {
  let el: any;

  afterEach(() => el?.remove());

  describe("GIVEN a quick card with default config", () => {
    beforeEach(async () => {
      el = createCard();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it has an ha-card wrapper", () => {
        expect(el.shadowRoot.querySelector("ha-card")).toBeTruthy();
      });

      it("THEN it shows the title", () => {
        expect(el.shadowRoot.textContent).toContain("Quick Record");
      });

      it("THEN it has a text input", () => {
        expect(el.shadowRoot.querySelector("ha-textfield")).toBeTruthy();
      });

      it("THEN it has a record button", () => {
        const btn = el.shadowRoot.querySelector("ha-button");
        expect(btn).toBeTruthy();
        expect(btn.textContent).toContain("Record");
      });
    });
  });

  describe("GIVEN a quick card with show_annotation enabled", () => {
    beforeEach(async () => {
      el = createCard({ show_annotation: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows an annotation textarea", () => {
        expect(
          getAnnotation(el).shadowRoot.querySelector("textarea")
        ).toBeTruthy();
      });
    });
  });

  describe("GIVEN a quick card without annotation", () => {
    beforeEach(async () => {
      el = createCard({ show_annotation: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no annotation textarea is present", () => {
        expect(el.shadowRoot.querySelector("quick-annotation")).toBeNull();
      });
    });
  });

  describe("GIVEN a quick card", () => {
    beforeEach(async () => {
      el = createCard();
      await el.updateComplete;
    });

    describe("WHEN record is called with a message", () => {
      it("THEN it calls hass.callService with the correct data", async () => {
        const msgEl = el.shadowRoot.querySelector("ha-textfield");
        msgEl.value = "Test note";
        await el._record();
        expect(el._hass.callService).toHaveBeenCalledOnce();
        const args = el._hass.callService.mock.calls[0];
        expect(args[0]).toBe("hass_datapoints");
        expect(args[1]).toBe("record");
        expect(args[2].message).toBe("Test note");
      });
    });
  });

  describe("GIVEN a quick card with static config methods", () => {
    describe("WHEN getStubConfig is called", () => {
      it("THEN it returns default config", () => {
        expect(HassRecordsQuickCard.getStubConfig()).toEqual({
          title: "Quick Record",
        });
      });
    });

    describe("WHEN getConfigElement is called", () => {
      it("THEN it returns the editor element tag", () => {
        const editorEl = HassRecordsQuickCard.getConfigElement();
        expect(editorEl.tagName.toLowerCase()).toBe(
          "hass-datapoints-quick-card-editor"
        );
      });
    });
  });
});
