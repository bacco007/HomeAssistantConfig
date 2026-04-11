import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../sensor-record-item";

vi.mock("@/lib/util/format", () => ({
  fmtDateTime: vi.fn().mockReturnValue("2026-03-31 10:00"),
  fmtRelativeTime: vi.fn().mockReturnValue("2 hours ago"),
}));

const sampleEvent = {
  id: "evt-1",
  message: "Test event message",
  annotation: "Full annotation note",
  icon: "mdi:bookmark",
  color: "#03a9f4",
  timestamp: "2026-03-31T10:00:00Z",
  entity_id: "sensor.temperature",
  device_id: null,
  area_id: null,
  label_id: null,
  dev: false,
};

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("sensor-record-item") as HTMLElement &
    RecordWithUnknownValues;
  Object.assign(el, props);
  document.body.appendChild(el);
  return el;
}

describe("sensor-record-item", () => {
  let el: HTMLElement & RecordWithUnknownValues;

  afterEach(() => {
    el?.remove();
    vi.clearAllMocks();
  });

  describe("GIVEN an item with a full event", () => {
    beforeEach(async () => {
      el = createElement({ event: sampleEvent, showFullMessage: true });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the event message", () => {
        expect(el.shadowRoot!.textContent).toContain("Test event message");
      });

      it("THEN it displays the annotation text", () => {
        expect(el.shadowRoot!.textContent).toContain("Full annotation note");
      });

      it("THEN it displays the relative time", () => {
        expect(el.shadowRoot!.textContent).toContain("2 hours ago");
      });

      it("THEN it has an .ann-item element", () => {
        expect(el.shadowRoot!.querySelector(".ann-item")).toBeTruthy();
      });

      it("THEN it has an .ann-icon-wrap element", () => {
        expect(el.shadowRoot!.querySelector(".ann-icon-wrap")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a hidden item", () => {
    beforeEach(async () => {
      el = createElement({ event: sampleEvent, hidden: true });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the .ann-item has is-hidden class", () => {
        expect(
          el.shadowRoot!.querySelector(".ann-item.is-hidden")
        ).toBeTruthy();
      });
    });
  });

  describe("GIVEN a dev event", () => {
    beforeEach(async () => {
      const devEvent = { ...sampleEvent, dev: true };
      el = createElement({ event: devEvent });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the DEV badge", () => {
        expect(el.shadowRoot!.querySelector(".ann-dev-badge")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a simple event (no annotation)", () => {
    beforeEach(async () => {
      const simpleEvent = { ...sampleEvent, annotation: null };
      el = createElement({ event: simpleEvent });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the .ann-item has simple class", () => {
        expect(el.shadowRoot!.querySelector(".ann-item.simple")).toBeTruthy();
      });
    });
  });

  describe("GIVEN an item that fires events", () => {
    beforeEach(async () => {
      el = createElement({ event: sampleEvent });
      await (el as any).updateComplete;
    });

    describe("WHEN the visibility button is clicked", () => {
      it("THEN it fires dp-sensor-record-toggle-visibility", async () => {
        const handler = vi.fn();
        el.addEventListener("dp-sensor-record-toggle-visibility", handler);
        const btn = el.shadowRoot!.querySelector(
          ".ann-visibility-btn"
        ) as HTMLButtonElement;
        btn.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toEqual({ id: "evt-1" });
      });
    });

    describe("WHEN the history button is clicked", () => {
      it("THEN it fires dp-sensor-record-navigate", async () => {
        const handler = vi.fn();
        el.addEventListener("dp-sensor-record-navigate", handler);
        const btn = el.shadowRoot!.querySelector(
          ".ann-history-btn"
        ) as HTMLButtonElement;
        btn.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toHaveProperty("event");
      });
    });
  });

  describe("GIVEN no event", () => {
    beforeEach(async () => {
      el = createElement({ event: null });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders nothing meaningful", () => {
        expect(el.shadowRoot!.querySelector(".ann-item")).toBeNull();
      });
    });
  });
});
