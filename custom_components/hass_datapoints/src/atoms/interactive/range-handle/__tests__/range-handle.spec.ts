import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../range-handle";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("range-handle") as HTMLElement & {
    position: number;
    label: string;
    live: boolean;
  };
  Object.assign(el, {
    position: 0,
    label: "Start date and time",
    live: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("range-handle", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN a range handle with default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it contains a button", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button).not.toBeNull();
      });

      it("THEN the button has the correct aria-label", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.getAttribute("aria-label")).toBe("Start date and time");
      });

      it("THEN the button does not have the is-live class", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.classList.contains("is-live")).toBe(false);
      });

      it("THEN the host left style reflects the position prop", () => {
        expect.assertions(1);
        expect(el.style.left).toBe("0%");
      });
    });
  });

  describe("GIVEN a range handle with position=50", () => {
    beforeEach(async () => {
      el = createElement({ position: 50 });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the host left style is 50%", () => {
        expect.assertions(1);
        expect(el.style.left).toBe("50%");
      });
    });

    describe("WHEN position is updated to 75", () => {
      it("THEN the host left style updates to 75%", async () => {
        expect.assertions(1);
        el.position = 75;
        await el.updateComplete;
        expect(el.style.left).toBe("75%");
      });
    });
  });

  describe("GIVEN a live range handle", () => {
    beforeEach(async () => {
      el = createElement({ live: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the button has the is-live class", () => {
        expect.assertions(1);
        const button = el.shadowRoot!.querySelector("button");
        expect(button?.classList.contains("is-live")).toBe(true);
      });
    });
  });

  describe("GIVEN a range handle", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN pointerdown fires on the button", () => {
      it("THEN it dispatches dp-handle-drag-start with pointerId and clientX", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-handle-drag-start", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new PointerEvent("pointerdown", {
            pointerId: 1,
            clientX: 120,
            bubbles: true,
          })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toMatchObject({
          pointerId: 1,
          clientX: 120,
        });
      });
    });

    describe("WHEN ArrowLeft key is pressed", () => {
      it("THEN it dispatches dp-handle-keydown with key ArrowLeft", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-handle-keydown", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toMatchObject({
          key: "ArrowLeft",
        });
      });
    });

    describe("WHEN PageDown key is pressed", () => {
      it("THEN it dispatches dp-handle-keydown with key PageDown", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-handle-keydown", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new KeyboardEvent("keydown", { key: "PageDown", bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toMatchObject({
          key: "PageDown",
        });
      });
    });

    describe("WHEN Home key is pressed", () => {
      it("THEN it dispatches dp-handle-keydown with key Home", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-handle-keydown", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Home", bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail).toMatchObject({ key: "Home" });
      });
    });

    describe("WHEN ArrowRight is pressed with shift", () => {
      it("THEN dp-handle-keydown includes shiftKey true", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-handle-keydown", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "ArrowRight",
            shiftKey: true,
            bubbles: true,
          })
        );
        expect(handler.mock.calls[0][0].detail).toMatchObject({
          key: "ArrowRight",
          shiftKey: true,
        });
      });
    });

    describe("WHEN a non-navigation key is pressed", () => {
      it("THEN it does not dispatch dp-handle-keydown", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-handle-keydown", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
        );
        expect(handler).not.toHaveBeenCalled();
      });
    });

    describe("WHEN pointerenter fires on the button", () => {
      it("THEN it dispatches dp-handle-hover", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-handle-hover", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new PointerEvent("pointerenter", { bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN pointerleave fires on the button", () => {
      it("THEN it dispatches dp-handle-leave", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-handle-leave", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(
          new PointerEvent("pointerleave", { bubbles: true })
        );
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN focus fires on the button", () => {
      it("THEN it dispatches dp-handle-focus", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-handle-focus", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN blur fires on the button", () => {
      it("THEN it dispatches dp-handle-blur", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-handle-blur", handler);
        const button = el.shadowRoot!.querySelector("button")!;
        button.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
        expect(handler).toHaveBeenCalledOnce();
      });
    });
  });
});
