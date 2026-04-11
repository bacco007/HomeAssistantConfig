import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryAnnotationDialogController } from "../annotation-dialog";

/** Create a minimal host element that the controller expects. */
function createHost() {
  const host = document.createElement("div");
  // Attach a real shadow root so the controller can append ha-dialog.
  host.attachShadow({ mode: "open" });
  host._hass = {
    callService: vi.fn(() => Promise.resolve()),
  };
  host._entityIds = ["sensor.temperature"];
  host._creatingContextAnnotation = false;
  document.body.appendChild(host);
  return host;
}

/** Minimal hover object that satisfies open(). */
function makeHover(overrides = {}) {
  return {
    timeMs: Date.now(),
    primary: null,
    event: null,
    annotationPrefill: null,
    ...overrides,
  };
}

describe("HistoryAnnotationDialogController", () => {
  let host;
  let controller;

  afterEach(() => {
    controller?.teardown();
    host?.remove();
  });

  describe("GIVEN a controller with a host element", () => {
    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
    });

    describe("WHEN ensureDialog() is called", () => {
      it("THEN appends an ha-dialog element to the host shadowRoot", () => {
        controller.ensureDialog();
        expect(host.shadowRoot.querySelector("ha-dialog")).toBeTruthy();
      });
    });

    describe("WHEN ensureDialog() is called twice", () => {
      it("THEN only one ha-dialog exists (idempotent)", () => {
        controller.ensureDialog();
        controller.ensureDialog();
        const dialogs = host.shadowRoot.querySelectorAll("ha-dialog");
        expect(dialogs.length).toBe(1);
      });
    });
  });

  describe("GIVEN dialog is open", () => {
    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
      controller.open(makeHover());
    });

    describe("WHEN close() is called", () => {
      it("THEN sets dialog.open to false", () => {
        controller.close();
        const dialog = host.shadowRoot.querySelector("ha-dialog");
        expect(dialog?.open).toBe(false);
      });
    });
  });

  describe("GIVEN dialog opened with prefill data", () => {
    const prefillMessage = "Test prefill message";

    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
      controller.open(
        makeHover({
          annotationPrefill: { message: prefillMessage },
        })
      );
    });

    describe("WHEN rendered", () => {
      it("THEN message field contains prefill text", () => {
        const panel = host.shadowRoot.querySelector(
          "#chart-context-dialog-panel"
        );
        const messageEl = panel?.querySelector("#chart-context-message");
        expect(messageEl?.value).toBe(prefillMessage);
      });
    });
  });

  describe("GIVEN dialog is open with empty message", () => {
    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
      controller.open(makeHover());
      // Ensure message is empty
      const panel = host.shadowRoot.querySelector(
        "#chart-context-dialog-panel"
      );
      const messageEl = panel?.querySelector("#chart-context-message");
      if (messageEl) messageEl.value = "";
    });

    describe("WHEN submit() is called", () => {
      it("THEN callService is NOT called", async () => {
        await controller.submit();
        expect(host._hass.callService).not.toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN dialog is open with message filled", () => {
    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
      controller.open(makeHover());
      const panel = host.shadowRoot.querySelector(
        "#chart-context-dialog-panel"
      );
      const messageEl = panel?.querySelector("#chart-context-message");
      if (messageEl) messageEl.value = "Something happened";
    });

    describe("WHEN submit() is called", () => {
      it("THEN callService is invoked", async () => {
        await controller.submit();
        expect(host._hass.callService).toHaveBeenCalledOnce();
      });

      it("THEN callService is called with the correct service name", async () => {
        await controller.submit();
        const [, service] = host._hass.callService.mock.calls[0];
        expect(service).toBe("record");
      });

      it("THEN callService payload contains the message", async () => {
        await controller.submit();
        const [, , payload] = host._hass.callService.mock.calls[0];
        expect(payload.message).toBe("Something happened");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  describe("GIVEN dialog is open", () => {
    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
      controller.open(makeHover());
    });

    describe("WHEN rendered", () => {
      it("THEN message and date fields share the message-date row", () => {
        const panel = host.shadowRoot.querySelector(
          "#chart-context-dialog-panel"
        );
        const row = panel?.querySelector(".context-form-row-message-date");
        expect(row).not.toBeNull();
        expect(row?.querySelector("#chart-context-message")).not.toBeNull();
        expect(row?.querySelector("#chart-context-date")).not.toBeNull();
      });

      it("THEN icon and color fields share the icon-color row", () => {
        const panel = host.shadowRoot.querySelector(
          "#chart-context-dialog-panel"
        );
        const row = panel?.querySelector(".context-form-row-icon-color");
        expect(row).not.toBeNull();
        expect(row?.querySelector("#chart-context-icon")).not.toBeNull();
        expect(row?.querySelector("#chart-context-color")).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Target selector — always visible, no toggle button
  // ---------------------------------------------------------------------------

  describe("GIVEN dialog is open", () => {
    let panel;

    beforeEach(() => {
      host = createHost();
      controller = new HistoryAnnotationDialogController(host);
      controller.open(makeHover());
      panel = host.shadowRoot.querySelector("#chart-context-dialog-panel");
    });

    describe("WHEN rendered", () => {
      it("THEN the ha-selector for targets is present in the DOM", () => {
        expect(panel?.querySelector("#chart-context-target")).not.toBeNull();
      });

      it("THEN there is no hidden target wrapper element", () => {
        expect(panel?.querySelector("#chart-context-target-wrap")).toBeNull();
      });

      it("THEN there is no Add-target toggle button", () => {
        expect(panel?.querySelector("#chart-context-add-target")).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Target accumulation
  // ---------------------------------------------------------------------------

  describe("GIVEN dialog is open", () => {
    let panel;
    let chipRow;

    beforeEach(() => {
      host = createHost();
      // Reset entity ids so the default linked target is empty, giving us a
      // clean baseline for testing extra-target accumulation.
      host._entityIds = [];
      controller = new HistoryAnnotationDialogController(host);
      controller.open(makeHover());
      panel = host.shadowRoot.querySelector("#chart-context-dialog-panel");
      chipRow = panel?.querySelector("annotation-chip-row");
    });

    describe("WHEN value-changed fires twice with different entity_ids", () => {
      beforeEach(() => {
        const targetSel = panel?.querySelector("#chart-context-target");
        targetSel?.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: { entity_id: ["sensor.a"] } },
            bubbles: false,
          })
        );
        targetSel?.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: { entity_id: ["sensor.b"] } },
            bubbles: false,
          })
        );
      });

      it("THEN the chip row contains chips for both entities", () => {
        const chips = chipRow?.chips ?? [];
        const ids = chips.map((c) => c.itemId);
        expect(ids).toContain("sensor.a");
        expect(ids).toContain("sensor.b");
      });

      it("THEN the chip row contains exactly two chips", () => {
        expect((chipRow?.chips ?? []).length).toBe(2);
      });
    });

    describe("WHEN value-changed fires with entity_id then device_id", () => {
      beforeEach(() => {
        const targetSel = panel?.querySelector("#chart-context-target");
        targetSel?.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: { entity_id: ["sensor.x"] } },
            bubbles: false,
          })
        );
        targetSel?.dispatchEvent(
          new CustomEvent("value-changed", {
            detail: { value: { device_id: ["device-1"] } },
            bubbles: false,
          })
        );
      });

      it("THEN the chip row contains both the entity and the device", () => {
        const chips = chipRow?.chips ?? [];
        const ids = chips.map((c) => c.itemId);
        expect(ids).toContain("sensor.x");
        expect(ids).toContain("device-1");
      });
    });
  });
});
