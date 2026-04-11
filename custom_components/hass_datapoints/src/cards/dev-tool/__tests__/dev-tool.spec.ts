import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsDevToolCard } from "../dev-tool.ts";

vi.mock("@/helpers.js", async (importOriginal) => {
  const mod = (await importOriginal()) as RecordWithUnknownValues;
  return {
    ...mod,
    confirmDestructiveAction: vi.fn().mockResolvedValue(true),
    fmtDateTime: vi.fn().mockReturnValue("2026-03-31 10:00"),
  };
});

if (!customElements.get("hass-datapoints-dev-tool-card")) {
  customElements.define(
    "hass-datapoints-dev-tool-card",
    HassRecordsDevToolCard
  );
}

function createCard(config: RecordWithUnknownValues = {}) {
  const el = document.createElement("hass-datapoints-dev-tool-card") as any;
  document.body.appendChild(el);
  el.setConfig({ title: "Dev Tool", ...config });
  return el;
}

function getWindows(el: any) {
  return el.shadowRoot.querySelector("dev-tool-windows") as HTMLElement & {
    shadowRoot: ShadowRoot;
  };
}

function getAnalyzeStatus(el: any) {
  return el.shadowRoot.querySelector("#analyze-status") as HTMLElement & {
    shadowRoot: ShadowRoot;
  };
}

async function setupCard(config: RecordWithUnknownValues = {}) {
  const el = createCard(config);
  const hass = createMockHass({
    connection: {
      subscribeEvents: vi.fn(() => Promise.resolve(vi.fn())),
      sendMessagePromise: vi.fn().mockResolvedValue({ events: [] }),
    },
    callService: vi.fn(() => Promise.resolve()),
  });
  el.hass = hass;
  await el.updateComplete;
  return el;
}

describe("dev-tool", () => {
  let el: any;

  afterEach(() => {
    el?.remove();
    vi.clearAllMocks();
  });

  describe("GIVEN a card with default config", () => {
    beforeEach(async () => {
      el = await setupCard();
    });

    describe("WHEN rendered", () => {
      it("THEN it has an ha-card wrapper", () => {
        expect(el.shadowRoot.querySelector("ha-card")).toBeTruthy();
      });

      it("THEN it shows the title", () => {
        expect(el.shadowRoot.textContent).toContain("Dev Tool");
      });

      it("THEN it has an entity picker (ha-selector)", () => {
        expect(el.shadowRoot.querySelector("ha-selector")).toBeTruthy();
      });

      it("THEN it has at least one comparison window row", () => {
        expect.assertions(1);
        const windows =
          getWindows(el).shadowRoot.querySelectorAll(".window-row");
        expect(windows.length).toBeGreaterThanOrEqual(1);
      });

      it("THEN it has an analyze button", () => {
        expect(el.shadowRoot.querySelector(".analyze-btn")).toBeTruthy();
      });

      it("THEN the results section is hidden by default", () => {
        expect(el.shadowRoot.querySelector(".results-section")).toBeNull();
      });

      it("THEN it shows the dev datapoints count section", () => {
        expect(el.shadowRoot.querySelector(".dev-section")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a card where add window is clicked", () => {
    beforeEach(async () => {
      el = await setupCard();
      getWindows(el).shadowRoot.querySelector(".add-window-btn").click();
      await el.updateComplete;
    });

    describe("WHEN a second window is added", () => {
      it("THEN two window rows are shown", () => {
        const windows =
          getWindows(el).shadowRoot.querySelectorAll(".window-row");
        expect(windows.length).toBe(2);
      });
    });
  });

  describe("GIVEN a card with two windows where one is removed", () => {
    beforeEach(async () => {
      el = await setupCard();
      getWindows(el).shadowRoot.querySelector(".add-window-btn").click();
      await el.updateComplete;
      const removeBtn =
        getWindows(el).shadowRoot.querySelector(".remove-window-btn");
      removeBtn.click();
      await el.updateComplete;
    });

    describe("WHEN a window is removed", () => {
      it("THEN one window row remains", () => {
        expect.assertions(1);
        const windows =
          getWindows(el).shadowRoot.querySelectorAll(".window-row");
        expect(windows.length).toBe(1);
      });
    });
  });

  describe("GIVEN a card where no entities are selected and analyze is clicked", () => {
    beforeEach(async () => {
      el = await setupCard();
    });

    describe("WHEN analyze is clicked with no entities", () => {
      it("THEN an error feedback is shown", async () => {
        expect.assertions(1);
        el.shadowRoot.querySelector(".analyze-btn").click();
        await el.updateComplete;
        expect(getAnalyzeStatus(el).shadowRoot.textContent).toContain(
          "select at least one entity"
        );
      });
    });
  });

  describe("GIVEN the dev count is loaded", () => {
    beforeEach(async () => {
      const hass = createMockHass({
        connection: {
          subscribeEvents: vi.fn(() => Promise.resolve(vi.fn())),
          sendMessagePromise: vi.fn().mockResolvedValue({
            events: [
              { id: "1", dev: true },
              { id: "2", dev: false },
              { id: "3", dev: true },
            ],
          }),
        },
        callService: vi.fn(() => Promise.resolve()),
      });
      el = createCard();
      el.hass = hass;
      await el.updateComplete;
      await el._refreshDevCount();
      await el.updateComplete;
    });

    describe("WHEN the count is displayed", () => {
      it("THEN it shows 2 dev datapoints", () => {
        expect.assertions(1);
        expect(el.shadowRoot.textContent).toContain("2");
      });
    });
  });

  describe("GIVEN the static config methods", () => {
    describe("WHEN getStubConfig is called", () => {
      it("THEN it returns default config", () => {
        expect.assertions(1);
        expect(HassRecordsDevToolCard.getStubConfig()).toHaveProperty("title");
      });
    });

    describe("WHEN getConfigElement is called", () => {
      it("THEN it returns the dev-tool editor element tag", () => {
        expect.assertions(1);
        const editorEl = HassRecordsDevToolCard.getConfigElement();
        expect(editorEl.tagName.toLowerCase()).toBe(
          "hass-datapoints-dev-tool-card-editor"
        );
      });
    });
  });
});
