import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../editor-base";

describe("editor-base", () => {
  let el: HTMLElement & {
    _config: RecordWithUnknownValues;
    hass: unknown;
    setConfig: (c: unknown) => void;
    _set: (k: string, v: unknown) => void;
  };

  afterEach(() => el?.remove());

  describe("GIVEN a base editor", () => {
    beforeEach(async () => {
      el = document.createElement("editor-base") as any;
      document.body.appendChild(el);
      (el as any).setConfig({ title: "My Card", hours_to_show: 24 });
      (el as any).hass = createMockHass();
      await (el as any).updateComplete;
    });

    describe("WHEN setConfig is called", () => {
      it("THEN _config is set", () => {
        expect((el as any)._config.title).toBe("My Card");
      });
    });

    describe("WHEN _set is called with a value", () => {
      it("THEN it fires config-changed with the updated config", () => {
        const handler = vi.fn();
        el.addEventListener("config-changed", handler);
        (el as any)._set("title", "New Title");
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.config.title).toBe("New Title");
      });
    });

    describe("WHEN _set is called with empty string", () => {
      it("THEN it fires config-changed with the key removed", () => {
        const handler = vi.fn();
        el.addEventListener("config-changed", handler);
        (el as any)._set("title", "");
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.config.title).toBeUndefined();
      });
    });

    describe("WHEN _set is called with null", () => {
      it("THEN it fires config-changed with the key removed", () => {
        const handler = vi.fn();
        el.addEventListener("config-changed", handler);
        (el as any)._set("hours_to_show", null);
        expect(handler).toHaveBeenCalledOnce();
        expect(
          handler.mock.calls[0][0].detail.config.hours_to_show
        ).toBeUndefined();
      });
    });
  });
});
