import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  confirmDestructiveAction,
  ensureHaComponents,
  waitForHaComponent,
} from "@/lib/ha/ha-components";

const { loadHaComponentsMock } = vi.hoisted(() => ({
  loadHaComponentsMock: vi.fn(async () => undefined),
}));

vi.mock("@kipk/load-ha-components", () => ({
  loadHaComponents: loadHaComponentsMock,
}));

describe("ha-components", () => {
  beforeEach(() => {
    loadHaComponentsMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN a tag name", () => {
    describe("WHEN waitForHaComponent is called", () => {
      it("THEN it resolves immediately for missing or already-defined tags", async () => {
        expect.assertions(2);

        if (!customElements.get("ha-icon")) {
          customElements.define("ha-icon", class extends HTMLElement {});
        }

        await expect(waitForHaComponent("")).resolves.toBe(false);
        await expect(waitForHaComponent("ha-icon")).resolves.toBe(true);
      });
    });
  });

  describe("GIVEN supported HA component tags", () => {
    describe("WHEN ensureHaComponents is called", () => {
      it("THEN it asks the loader and returns a readiness summary", async () => {
        expect.assertions(2);

        const result = await ensureHaComponents(["ha-icon"]);

        expect(loadHaComponentsMock).toHaveBeenCalledWith(["ha-icon"]);
        expect(result).toEqual([
          { tag: "ha-icon", ready: true, defined: true },
        ]);
      });
    });
  });

  describe("GIVEN a missing host root", () => {
    describe("WHEN confirmDestructiveAction is called", () => {
      it("THEN it falls back to window.confirm", async () => {
        expect.assertions(2);

        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

        await expect(
          confirmDestructiveAction(null, { title: "Delete item?" })
        ).resolves.toBe(true);
        expect(confirmSpy).toHaveBeenCalledWith("Delete item?");
      });
    });
  });
});
