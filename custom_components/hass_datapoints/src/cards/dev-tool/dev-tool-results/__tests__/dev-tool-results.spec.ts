import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../dev-tool-results";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("dev-tool-results") as HTMLElement & {
    results: Array<RecordWithUnknownValues>;
    isAdmin: boolean;
    updateComplete: Promise<void>;
  };
  Object.assign(el, {
    isAdmin: true,
    results: [
      {
        id: 1,
        label: "Window 1",
        startDt: "",
        endDt: "",
        selected: [0],
        changes: [
          {
            timestamp: "2026-03-31T10:00:00.000Z",
            message: "Window opened",
            entity_id: "binary_sensor.window",
            icon: "mdi:window-open",
            color: "#4caf50",
          },
        ],
      },
    ],
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("dev-tool-results", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN results are present", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the record button", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("#record-btn")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a non-admin user (isAdmin: false)", () => {
    beforeEach(async () => {
      el = createElement({ isAdmin: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the record button is not shown", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("#record-btn")).toBeNull();
      });
    });
  });

  describe("GIVEN the record button is clicked", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN selected items exist", () => {
      it("THEN it emits the selected items", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-record-selected-request", handler);
        (
          el.shadowRoot!.querySelector("#record-btn") as HTMLButtonElement
        ).click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.items).toHaveLength(1);
      });
    });
  });
});
