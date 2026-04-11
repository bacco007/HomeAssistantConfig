import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../editor-entity-list";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("editor-entity-list") as HTMLElement & {
    entities: string[];
    hass: unknown;
    buttonLabel: string;
  };
  Object.assign(el, {
    entities: ["sensor.temperature"],
    hass: createMockHass(),
    buttonLabel: "Add entity",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("editor-entity-list", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN an entity list with one entity", () => {
    beforeEach(async () => {
      el = createElement({ entities: ["sensor.temperature"] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows one entity row", () => {
        const rows = el.shadowRoot!.querySelectorAll(".entity-row");
        expect(rows.length).toBe(1);
      });

      it("THEN it shows the add button", () => {
        const addBtn = el.shadowRoot!.querySelector("[data-action='add']");
        expect(addBtn).toBeTruthy();
      });
    });
  });

  describe("GIVEN an entity list with entities", () => {
    beforeEach(async () => {
      el = createElement({
        entities: ["sensor.temperature", "sensor.humidity"],
      });
      await el.updateComplete;
    });

    describe("WHEN a remove button is clicked", () => {
      it("THEN it dispatches dp-entity-list-change with the entity removed", () => {
        const handler = vi.fn();
        el.addEventListener("dp-entity-list-change", handler);
        const removeBtn = el.shadowRoot!.querySelector(
          "[data-action='remove']"
        );
        removeBtn?.dispatchEvent(new Event("click"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.entities).toEqual([
          "sensor.humidity",
        ]);
      });
    });
  });

  describe("GIVEN an empty entity list", () => {
    beforeEach(async () => {
      el = createElement({ entities: [] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no entity rows are shown", () => {
        const rows = el.shadowRoot!.querySelectorAll(".entity-row");
        expect(rows.length).toBe(0);
      });
    });
  });
});
