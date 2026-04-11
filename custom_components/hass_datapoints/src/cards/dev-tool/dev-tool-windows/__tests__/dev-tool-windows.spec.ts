import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../dev-tool-windows";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("dev-tool-windows") as HTMLElement & {
    windows: Array<{
      id: number;
      label: string;
      startDt: string;
      endDt: string;
    }>;
    updateComplete: Promise<void>;
  };
  Object.assign(el, props);
  document.body.appendChild(el);
  return el;
}

describe("dev-tool-windows", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => {
    el?.remove();
  });

  describe("GIVEN no windows are provided", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it seeds one window row", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelectorAll(".window-row")).toHaveLength(1);
      });
    });
  });

  describe("GIVEN the add button is clicked", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN a new window is added", () => {
      it("THEN it emits the updated window configs", async () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-window-configs-change", handler);
        (
          el.shadowRoot!.querySelector("#add-window-btn") as HTMLButtonElement
        ).click();
        await el.updateComplete;
        expect(el.shadowRoot!.querySelectorAll(".window-row")).toHaveLength(2);
        expect(handler).toHaveBeenCalledOnce();
      });
    });
  });
});
