import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../annotation-chip-row";
import type { ChipItem } from "../annotation-chip-row";

const SAMPLE_CHIPS: ChipItem[] = [
  {
    type: "entity_id",
    itemId: "sensor.living_room_temp",
    icon: "mdi:thermometer",
    name: "Living room temp",
    stateObj: {
      entity_id: "sensor.living_room_temp",
      attributes: {
        icon: "mdi:thermometer-lines",
      },
    },
  },
  {
    type: "device_id",
    itemId: "device-abc",
    icon: "mdi:devices",
    name: "My device",
  },
];

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("annotation-chip-row") as HTMLElement & {
    chips: ChipItem[];
    label: string;
    helpText: string;
    emptyText: string;
    hass: Nullable<RecordWithUnknownValues>;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    chips: SAMPLE_CHIPS,
    label: "Linked targets",
    helpText:
      "These targets will be associated with the new data point by default.",
    emptyText: "No linked targets will be associated with this data point.",
    hass: { states: {} },
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("annotation-chip-row", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure — with chips
  // ---------------------------------------------------------------------------

  describe("GIVEN two chips", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN does not render an internal label (label is owned by the outer form field)", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".context-form-label")).toBeNull();
      });

      it("THEN renders the help text", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".context-form-help")
            ?.textContent?.trim()
        ).toBe(
          "These targets will be associated with the new data point by default."
        );
      });

      it("THEN renders the chip row", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".context-chip-row")
        ).not.toBeNull();
      });

      it("THEN renders a annotation-chip for each chip", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelectorAll("annotation-chip").length).toBe(
          2
        );
      });

      it("THEN passes the correct type to each chip", () => {
        expect.assertions(2);
        const chips = Array.from(
          el.shadowRoot!.querySelectorAll("annotation-chip")
        ) as (HTMLElement & { type: string })[];
        expect(chips[0].type).toBe("entity_id");
        expect(chips[1].type).toBe("device_id");
      });

      it("THEN passes the correct itemId to each chip", () => {
        expect.assertions(2);
        const chips = Array.from(
          el.shadowRoot!.querySelectorAll("annotation-chip")
        ) as (HTMLElement & { itemId: string })[];
        expect(chips[0].itemId).toBe("sensor.living_room_temp");
        expect(chips[1].itemId).toBe("device-abc");
      });

      it("THEN passes the entity state object only to entity chips", () => {
        expect.assertions(2);
        const chips = Array.from(
          el.shadowRoot!.querySelectorAll("annotation-chip")
        ) as (HTMLElement & { stateObj: Nullable<RecordWithUnknownValues> })[];
        expect(
          (chips[0].stateObj?.attributes as RecordWithUnknownValues)?.icon
        ).toBe("mdi:thermometer-lines");
        expect(chips[1].stateObj).toBeNull();
      });

      it("THEN passes secondary entity text when present", () => {
        expect.assertions(2);
        const chips = Array.from(
          el.shadowRoot!.querySelectorAll("annotation-chip")
        ) as (HTMLElement & { secondaryText: string })[];
        expect(chips[0].secondaryText).toBe("");
        expect(chips[1].secondaryText).toBe("");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Structure — empty
  // ---------------------------------------------------------------------------

  describe("GIVEN chips is empty", () => {
    beforeEach(async () => {
      el = createElement({ chips: [] });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the empty text instead of help text", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".context-form-help")
            ?.textContent?.trim()
        ).toBe("No linked targets will be associated with this data point.");
      });

      it("THEN does not render the chip row", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector(".context-chip-row")).toBeNull();
      });

      it("THEN renders no annotation-chip elements", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelectorAll("annotation-chip").length).toBe(
          0
        );
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  describe("GIVEN two chips and rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN dp-chip-remove fires from a child chip", () => {
      it("THEN re-emits dp-target-remove with type and id", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-target-remove", handler);
        const chipRow = el.shadowRoot!.querySelector(".context-chip-row")!;
        chipRow.dispatchEvent(
          new CustomEvent("dp-chip-remove", {
            detail: { type: "entity_id", itemId: "sensor.living_room_temp" },
            bubbles: true,
            composed: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.type).toBe("entity_id");
        expect(handler.mock.calls[0][0].detail.id).toBe(
          "sensor.living_room_temp"
        );
      });

      it("THEN does not let the raw dp-chip-remove event propagate to the host", () => {
        expect.assertions(1);
        const rawHandler = vi.fn();
        el.addEventListener("dp-chip-remove", rawHandler);
        const chipRow = el.shadowRoot!.querySelector(".context-chip-row")!;
        chipRow.dispatchEvent(
          new CustomEvent("dp-chip-remove", {
            detail: { type: "entity_id", itemId: "sensor.living_room_temp" },
            bubbles: true,
            composed: true,
          })
        );
        expect(rawHandler).not.toHaveBeenCalled();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Custom text props
  // ---------------------------------------------------------------------------

  describe("GIVEN a custom emptyText", () => {
    beforeEach(async () => {
      el = createElement({ chips: [], emptyText: "Nothing here yet." });
      await el.updateComplete;
    });

    describe("WHEN rendered with no chips", () => {
      it("THEN shows the custom empty text", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".context-form-help")
            ?.textContent?.trim()
        ).toBe("Nothing here yet.");
      });
    });
  });
});
