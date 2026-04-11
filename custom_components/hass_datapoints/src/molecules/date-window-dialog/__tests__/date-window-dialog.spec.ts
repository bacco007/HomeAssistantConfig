import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../date-window-dialog";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("date-window-dialog") as HTMLElement & {
    open: boolean;
    heading: string;
    name: string;
    startValue: string;
    endValue: string;
    showDelete: boolean;
    showShortcuts: boolean;
    submitLabel: string;
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    open: true,
    heading: "Add date window",
    name: "",
    startValue: "",
    endValue: "",
    showDelete: false,
    showShortcuts: false,
    submitLabel: "Create date window",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("date-window-dialog", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN default props with open=true", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the name field", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#date-window-name")
        ).not.toBeNull();
      });

      it("THEN renders the start datetime input", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("#date-window-start")
        ).not.toBeNull();
      });

      it("THEN renders the end datetime input", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("#date-window-end")).not.toBeNull();
      });

      it("THEN renders the cancel button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".date-window-dialog-cancel")
        ).not.toBeNull();
      });

      it("THEN renders the submit button with the submitLabel", () => {
        expect.assertions(1);
        const submit = el.shadowRoot!.querySelector(
          ".date-window-dialog-submit"
        );
        expect(submit?.textContent?.trim()).toBe("Create date window");
      });

      it("THEN does not render the delete button by default", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".date-window-dialog-delete")
        ).toBeNull();
      });

      it("THEN does not render shortcut buttons by default", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".date-window-dialog-shortcuts")
        ).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // showDelete
  // ---------------------------------------------------------------------------

  describe("GIVEN showDelete=true", () => {
    beforeEach(async () => {
      el = createElement({ showDelete: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the delete button", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".date-window-dialog-delete")
        ).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // showShortcuts
  // ---------------------------------------------------------------------------

  describe("GIVEN showShortcuts=true", () => {
    beforeEach(async () => {
      el = createElement({ showShortcuts: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the shortcuts container", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".date-window-dialog-shortcuts")
        ).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Prop binding
  // ---------------------------------------------------------------------------

  describe("GIVEN name='Heating season' and submitLabel='Save date window'", () => {
    beforeEach(async () => {
      el = createElement({
        name: "Heating season",
        submitLabel: "Save date window",
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the submit button shows the custom submitLabel", () => {
        expect.assertions(1);
        const submit = el.shadowRoot!.querySelector(
          ".date-window-dialog-submit"
        );
        expect(submit?.textContent?.trim()).toBe("Save date window");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  describe("GIVEN the component is open and rendered", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the cancel button is clicked", () => {
      it("THEN fires dp-window-close", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-window-close", handler);
        el.shadowRoot!.querySelector<HTMLElement>(
          ".date-window-dialog-cancel"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN the submit button is clicked", () => {
      it("THEN fires dp-window-submit", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-window-submit", handler);
        el.shadowRoot!.querySelector<HTMLElement>(
          ".date-window-dialog-submit"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
      });

      it("THEN dp-window-submit detail includes name, start, end fields", () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("dp-window-submit", handler);
        el.shadowRoot!.querySelector<HTMLElement>(
          ".date-window-dialog-submit"
        )!.click();
        const detail = handler.mock.calls[0][0].detail as {
          name: string;
          start: string;
          end: string;
        };
        expect("name" in detail).toBe(true);
        expect("start" in detail).toBe(true);
        expect("end" in detail).toBe(true);
      });
    });
  });

  describe("GIVEN showDelete=true and rendered", () => {
    beforeEach(async () => {
      el = createElement({ showDelete: true });
      await el.updateComplete;
    });

    describe("WHEN the delete button is clicked", () => {
      it("THEN fires dp-window-delete", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-window-delete", handler);
        el.shadowRoot!.querySelector<HTMLElement>(
          ".date-window-dialog-delete"
        )!.click();
        expect(handler).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN showShortcuts=true and rendered", () => {
    beforeEach(async () => {
      el = createElement({ showShortcuts: true });
      await el.updateComplete;
    });

    describe("WHEN the previous range shortcut is clicked", () => {
      it("THEN fires dp-window-shortcut with direction=-1", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-window-shortcut", handler);
        const shortcuts = el.shadowRoot!.querySelector(
          ".date-window-dialog-shortcuts"
        );
        (shortcuts?.querySelectorAll("ha-button")[0] as HTMLElement)?.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.direction).toBe(-1);
      });
    });

    describe("WHEN the next range shortcut is clicked", () => {
      it("THEN fires dp-window-shortcut with direction=1", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-window-shortcut", handler);
        const shortcuts = el.shadowRoot!.querySelector(
          ".date-window-dialog-shortcuts"
        );
        (shortcuts?.querySelectorAll("ha-button")[1] as HTMLElement)?.click();
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.direction).toBe(1);
      });
    });
  });
});
