import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsActionCard } from "../action.ts";

if (!customElements.get("hass-datapoints-action-card")) {
  customElements.define("hass-datapoints-action-card", HassRecordsActionCard);
}

function createCard(config: RecordWithUnknownValues = {}) {
  const el = document.createElement("hass-datapoints-action-card") as any;
  document.body.appendChild(el);
  el.setConfig({ title: "Record Event", ...config });
  el.hass = createMockHass({
    callService: vi.fn(() => Promise.resolve()),
  });
  return el;
}

describe("action", () => {
  let el: any;

  afterEach(() => el?.remove());

  describe("GIVEN a card with default config", () => {
    beforeEach(async () => {
      el = createCard();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it has an ha-card wrapper", () => {
        expect(el.shadowRoot.querySelector("ha-card")).toBeTruthy();
      });

      it("THEN it shows the title", () => {
        expect(el.shadowRoot.textContent).toContain("Record Event");
      });

      it("THEN it has a message textfield", () => {
        expect(el.shadowRoot.querySelector("ha-textfield#msg")).toBeTruthy();
      });

      it("THEN it has a record button", () => {
        const btn = el.shadowRoot.querySelector("ha-button#btn");
        expect(btn).toBeTruthy();
      });

      it("THEN it shows an annotation textarea by default", () => {
        expect(el.shadowRoot.querySelector("textarea#ann")).toBeTruthy();
      });

      it("THEN it shows a date field by default", () => {
        expect(el.shadowRoot.querySelector("ha-textfield#date")).toBeTruthy();
      });

      it("THEN it has a color swatch", () => {
        expect(el.shadowRoot.querySelector("color-swatch")).toBeTruthy();
      });

      it("THEN it has an icon picker", () => {
        expect(
          el.shadowRoot.querySelector("ha-icon-picker#icon-picker")
        ).toBeTruthy();
      });
    });
  });

  describe("GIVEN a card without a title", () => {
    beforeEach(async () => {
      el = createCard({ title: undefined });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no card-header is present", () => {
        expect(el.shadowRoot.querySelector(".card-header")).toBeNull();
      });
    });
  });

  describe("GIVEN a card with show_annotation: false", () => {
    beforeEach(async () => {
      el = createCard({ show_annotation: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no annotation textarea is present", () => {
        expect(el.shadowRoot.querySelector("textarea#ann")).toBeNull();
      });
    });
  });

  describe("GIVEN a card with show_date: false", () => {
    beforeEach(async () => {
      el = createCard({ show_date: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no date field is present", () => {
        expect(el.shadowRoot.querySelector("ha-textfield#date")).toBeNull();
      });
    });
  });

  describe("GIVEN a card with an entity in config", () => {
    beforeEach(async () => {
      el = createCard({ entity: "sensor.temperature" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows a chip-group for config targets", () => {
        const targets = el.shadowRoot.querySelector(
          "action-targets"
        ) as HTMLElement & {
          shadowRoot: ShadowRoot;
        };
        expect(targets.shadowRoot.querySelector("chip-group")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a card with show_config_targets: false", () => {
    beforeEach(async () => {
      el = createCard({
        entity: "sensor.temperature",
        show_config_targets: false,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no chip-group is shown", () => {
        const targets = el.shadowRoot.querySelector(
          "action-targets"
        ) as HTMLElement & {
          shadowRoot: ShadowRoot;
        };
        expect(targets.shadowRoot.querySelector("chip-group")).toBeNull();
      });
    });
  });

  describe("GIVEN a card with show_target_picker: false", () => {
    beforeEach(async () => {
      el = createCard({ show_target_picker: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no ha-selector is shown", () => {
        const targets = el.shadowRoot.querySelector(
          "action-targets"
        ) as HTMLElement & {
          shadowRoot: ShadowRoot;
        };
        expect(targets.shadowRoot.querySelector("ha-selector")).toBeNull();
      });
    });
  });

  describe("GIVEN a card ready to record", () => {
    beforeEach(async () => {
      el = createCard();
      await el.updateComplete;
    });

    describe("WHEN _record is called with a message", () => {
      it("THEN it calls hass.callService with the correct data", async () => {
        const msgEl = el.shadowRoot.querySelector("ha-textfield#msg");
        msgEl.value = "Something happened";
        await el._record();
        expect(el._hass.callService).toHaveBeenCalledOnce();
        const [domain, service, data] = el._hass.callService.mock.calls[0];
        expect(domain).toBe("hass_datapoints");
        expect(service).toBe("record");
        expect(data.message).toBe("Something happened");
      });

      it("THEN the message field is cleared after recording", async () => {
        const msgEl = el.shadowRoot.querySelector("ha-textfield#msg");
        msgEl.value = "Something happened";
        await el._record();
        expect(msgEl.value).toBe("");
      });
    });

    describe("WHEN _record is called with an empty message", () => {
      it("THEN it does not call hass.callService", async () => {
        await el._record();
        expect(el._hass.callService).not.toHaveBeenCalled();
      });
    });

    describe("WHEN _record is called with annotation", () => {
      it("THEN annotation is included in the service call", async () => {
        const msgEl = el.shadowRoot.querySelector("ha-textfield#msg");
        const annEl = el.shadowRoot.querySelector("textarea#ann");
        msgEl.value = "Test note";
        annEl.value = "Detailed annotation";
        await el._record();
        const data = el._hass.callService.mock.calls[0][2];
        expect(data.annotation).toBe("Detailed annotation");
      });
    });
  });

  describe("GIVEN a card with an entity in config and a message to record", () => {
    beforeEach(async () => {
      el = createCard({ entity: "sensor.temperature" });
      await el.updateComplete;
    });

    describe("WHEN _record is called", () => {
      it("THEN entity_ids is included in the service call", async () => {
        const msgEl = el.shadowRoot.querySelector("ha-textfield#msg");
        msgEl.value = "Entity event";
        await el._record();
        const data = el._hass.callService.mock.calls[0][2];
        expect(data.entity_ids).toContain("sensor.temperature");
      });
    });
  });

  describe("GIVEN the static config methods", () => {
    describe("WHEN getStubConfig is called", () => {
      it("THEN it returns default config", () => {
        expect(HassRecordsActionCard.getStubConfig()).toEqual({
          title: "Record Event",
        });
      });
    });

    describe("WHEN getConfigElement is called", () => {
      it("THEN it returns the editor element tag", () => {
        const editorEl = HassRecordsActionCard.getConfigElement();
        expect(editorEl.tagName.toLowerCase()).toBe(
          "hass-datapoints-action-card-editor"
        );
      });
    });
  });

  describe("GIVEN a card with annotation shown", () => {
    describe("WHEN getGridOptions is called", () => {
      it("THEN it returns rows: 10", () => {
        el = createCard({ show_annotation: true });
        expect(el.getGridOptions().rows).toBe(10);
      });
    });
  });

  describe("GIVEN a card with annotation hidden", () => {
    describe("WHEN getGridOptions is called", () => {
      it("THEN it returns rows: 7", () => {
        el = createCard({ show_annotation: false });
        expect(el.getGridOptions().rows).toBe(7);
      });
    });
  });
});
