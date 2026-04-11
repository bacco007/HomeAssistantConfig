import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../sensor-header";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("sensor-header") as HTMLElement &
    RecordWithUnknownValues;
  Object.assign(el, props);
  document.body.appendChild(el);
  return el;
}

describe("sensor-header", () => {
  let el: HTMLElement & RecordWithUnknownValues;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN a header with name, value, and unit", () => {
    beforeEach(async () => {
      el = createElement({ name: "Living Room", value: "22.5", unit: "°C" });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the sensor name", () => {
        expect(el.shadowRoot!.textContent).toContain("Living Room");
      });

      it("THEN it displays the sensor value", () => {
        expect(el.shadowRoot!.textContent).toContain("22.5");
      });

      it("THEN it displays the unit", () => {
        expect(el.shadowRoot!.textContent).toContain("°C");
      });

      it("THEN it has a .header element", () => {
        expect(el.shadowRoot!.querySelector(".header")).toBeTruthy();
      });

      it("THEN it has a .info element", () => {
        expect(el.shadowRoot!.querySelector(".info")).toBeTruthy();
      });
    });
  });

  describe("GIVEN a header with no unit", () => {
    beforeEach(async () => {
      el = createElement({ name: "Binary Sensor", value: "on", unit: "" });
      await (el as any).updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders the value", () => {
        expect(el.shadowRoot!.textContent).toContain("on");
      });

      it("THEN the measurement span is empty", () => {
        const span = el.shadowRoot!.querySelector(".measurement");
        expect(span?.textContent?.trim()).toBe("");
      });
    });
  });

  describe("GIVEN a header that updates its value", () => {
    beforeEach(async () => {
      el = createElement({ name: "Sensor", value: "10.0", unit: "W" });
      await (el as any).updateComplete;
    });

    describe("WHEN the value property changes", () => {
      it("THEN it reflects the new value", async () => {
        (el as any).value = "20.0";
        await (el as any).updateComplete;
        expect(el.shadowRoot!.textContent).toContain("20.0");
      });
    });
  });
});
