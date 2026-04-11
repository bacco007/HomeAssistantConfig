import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../history-chart";

// Register a stub for hass-datapoints-history-card since it is not available in unit tests.
// The stub records calls to setConfig, setExternalZoomRange, and hass writes.
function defineInnerCardStub() {
  if (customElements.get("hass-datapoints-history-card")) return;
  class HistoryCardStub extends HTMLElement {
    setConfig = vi.fn();

    setExternalZoomRange = vi.fn();

    hass: unknown = null;
  }
  customElements.define("hass-datapoints-history-card", HistoryCardStub);
}

defineInnerCardStub();

function createElement() {
  const el = document.createElement("history-chart") as HTMLElement & {
    config: Nullable<RecordWithUnknownValues>;
    hass: unknown;
    chartEl: Nullable<
      HTMLElement & {
        setConfig: ReturnType<typeof vi.fn>;
        setExternalZoomRange: ReturnType<typeof vi.fn>;
        hass: unknown;
      }
    >;
    setExternalZoomRange(range: Nullable<{ start: number; end: number }>): void;
  };
  document.body.appendChild(el);
  return el;
}

describe("history-chart", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN element appended to DOM", () => {
    beforeEach(() => {
      el = createElement();
    });

    describe("WHEN connectedCallback runs", () => {
      it("THEN creates an inner hass-datapoints-history-card child", () => {
        expect(el.querySelector("hass-datapoints-history-card")).toBeTruthy();
      });

      it("THEN exposes the inner card via chartEl", () => {
        expect(el.chartEl).toBeTruthy();
        expect(el.chartEl!.tagName.toLowerCase()).toBe(
          "hass-datapoints-history-card"
        );
      });
    });
  });

  describe("GIVEN element connected", () => {
    beforeEach(() => {
      el = createElement();
    });

    describe("WHEN .config is set", () => {
      it("THEN calls setConfig on the inner card", () => {
        const config = { entities: ["sensor.temp"] };
        el.config = config;
        expect(el.chartEl!.setConfig).toHaveBeenCalledWith(config);
      });
    });

    describe("WHEN the same config object is set a second time", () => {
      it("THEN setConfig is NOT called again (diff guard)", () => {
        const config = { entities: ["sensor.temp"] };
        el.config = config;
        const callCount = (el.chartEl!.setConfig as ReturnType<typeof vi.fn>)
          .mock.calls.length;
        el.config = config; // same reference, same JSON
        expect(
          (el.chartEl!.setConfig as ReturnType<typeof vi.fn>).mock.calls.length
        ).toBe(callCount);
      });
    });

    describe("WHEN .hass is set", () => {
      it("THEN forwards hass to the inner card", () => {
        const mockHass = { states: {} };
        el.hass = mockHass;
        expect(el.chartEl!.hass).toBe(mockHass);
      });
    });

    describe("WHEN setExternalZoomRange is called", () => {
      it("THEN delegates to the inner card's setExternalZoomRange", () => {
        const range = { start: 1000, end: 2000 };
        el.setExternalZoomRange(range);
        expect(el.chartEl!.setExternalZoomRange).toHaveBeenCalledWith(range);
      });
    });
  });
});
