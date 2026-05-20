import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../ai-query-brief-dialog";

type AiQueryBriefDialogElement = HTMLElement & {
  open: boolean;
  heading: string;
  text: string;
  updateComplete: Promise<boolean>;
};

function createElement(
  props: Partial<AiQueryBriefDialogElement> = {}
): AiQueryBriefDialogElement {
  const el = document.createElement(
    "ai-query-brief-dialog"
  ) as AiQueryBriefDialogElement;
  Object.assign(el, {
    open: true,
    heading: "AI query brief",
    text: "Test brief",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("ai-query-brief-dialog", () => {
  let el: AiQueryBriefDialogElement;

  afterEach(() => {
    el?.remove();
    vi.restoreAllMocks();
  });

  describe("GIVEN the dialog opens", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN it renders", () => {
      it("THEN it shows the brief text in the textarea", () => {
        expect.assertions(1);
        const textarea = el.shadowRoot!.querySelector("textarea");
        expect((textarea as HTMLTextAreaElement).value).toBe("Test brief");
      });
    });
  });

  describe("GIVEN the copy action is used", () => {
    beforeEach(async () => {
      vi.stubGlobal("navigator", {
        ...navigator,
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      });
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the copy button is clicked", () => {
      it("THEN it writes the brief text to the clipboard", async () => {
        expect.assertions(2);
        const copyButton = Array.from(
          el.shadowRoot!.querySelectorAll("ha-button")
        ).find((button) => button.textContent?.includes("Copy brief"));

        copyButton!.dispatchEvent(new Event("click"));
        await Promise.resolve();
        await el.updateComplete;

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          "Test brief"
        );
        expect(el.shadowRoot!.textContent).toContain("Copied to clipboard.");
      });
    });
  });

  describe("GIVEN clipboard write fails", () => {
    beforeEach(async () => {
      vi.stubGlobal("navigator", {
        ...navigator,
        clipboard: {
          writeText: vi.fn(() => Promise.reject(new Error("nope"))),
        },
      });
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN the copy button is clicked", () => {
      it("THEN it shows the manual-copy fallback message", async () => {
        expect.assertions(1);
        const copyButton = Array.from(
          el.shadowRoot!.querySelectorAll("ha-button")
        ).find((button) => button.textContent?.includes("Copy brief"));

        copyButton!.dispatchEvent(new Event("click"));
        await Promise.resolve();
        await el.updateComplete;

        expect(el.shadowRoot!.textContent).toContain(
          "Clipboard write failed. The text is selected so you can copy it manually."
        );
      });
    });
  });
});
