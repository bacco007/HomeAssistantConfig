import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../toggle-switch";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("toggle-switch") as HTMLElement & {
    checked: boolean;
    label: string;
    entityId: string | undefined;
  };
  Object.assign(el, {
    checked: false,
    label: "Show targets",
    entityId: undefined,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("toggle-switch", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a toggle switch in unchecked state", () => {
    beforeEach(async () => {
      el = createElement({ checked: false });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the track does not have the on class", () => {
        expect.assertions(1);
        const track = el.shadowRoot!.querySelector(".track");
        expect(track?.classList.contains("on")).toBe(false);
      });

      it("THEN the checkbox is not checked", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.checked).toBe(false);
      });
    });
  });

  describe("GIVEN a toggle switch in checked state", () => {
    beforeEach(async () => {
      el = createElement({ checked: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the track has the on class", () => {
        expect.assertions(1);
        const track = el.shadowRoot!.querySelector(".track");
        expect(track?.classList.contains("on")).toBe(true);
      });

      it("THEN the checkbox is checked", () => {
        expect.assertions(1);
        const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
        expect(input.checked).toBe(true);
      });
    });
  });

  describe("GIVEN a toggle switch with a label", () => {
    beforeEach(async () => {
      el = createElement({ label: "Visible" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the label text", () => {
        expect.assertions(1);
        const text = el.shadowRoot!.textContent?.trim();
        expect(text).toContain("Visible");
      });
    });
  });

  describe("GIVEN an unchecked toggle switch", () => {
    beforeEach(async () => {
      el = createElement({ checked: false, entityId: "sensor.temp" });
      await el.updateComplete;
    });

    describe("WHEN the checkbox fires a change event", () => {
      it("THEN it dispatches dp-toggle-change with checked=true and entityId", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-toggle-change", handler);
        const input = el.shadowRoot!.querySelector("input")!;
        input.dispatchEvent(new Event("change"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.checked).toBe(true);
        expect(handler.mock.calls[0][0].detail.entityId).toBe("sensor.temp");
      });
    });
  });

  describe("GIVEN a checked toggle switch", () => {
    beforeEach(async () => {
      el = createElement({ checked: true });
      await el.updateComplete;
    });

    describe("WHEN the checkbox fires a change event", () => {
      it("THEN it dispatches dp-toggle-change with checked=false", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-toggle-change", handler);
        const input = el.shadowRoot!.querySelector("input")!;
        input.dispatchEvent(new Event("change"));
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.checked).toBe(false);
      });
    });
  });
});
