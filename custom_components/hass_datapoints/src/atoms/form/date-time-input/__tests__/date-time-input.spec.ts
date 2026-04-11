import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../date-time-input";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("date-time-input") as HTMLElement & {
    value: string;
    label: string;
  };
  Object.assign(el, {
    value: "2026-03-31T08:00",
    label: "Date & Time",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("date-time-input", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a date-time input with a value", () => {
    beforeEach(async () => {
      el = createElement({ value: "2026-03-31T08:00" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it creates an input[type=datetime-local]", () => {
        const input = el.shadowRoot!.querySelector(
          "input[type='datetime-local']"
        ) as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.value).toBe("2026-03-31T08:00");
      });

      it("THEN it shows the label", () => {
        const label = el.shadowRoot!.querySelector("label");
        expect(label?.textContent?.trim()).toBe("Date & Time");
      });
    });
  });

  describe("GIVEN a date-time input", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the input value changes", () => {
      it("THEN it fires dp-datetime-change", () => {
        const handler = vi.fn();
        el.addEventListener("dp-datetime-change", handler);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        input.value = "2026-04-01T10:30";
        input.dispatchEvent(new Event("change", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.value).toBe("2026-04-01T10:30");
      });
    });
  });
});
