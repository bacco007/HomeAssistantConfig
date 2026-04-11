import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../analysis-method-subopts";

function createElement() {
  const el = document.createElement(
    "analysis-method-subopts"
  ) as HTMLElement & {
    updateComplete: Promise<boolean>;
  };
  document.body.appendChild(el);
  return el;
}

describe("analysis-method-subopts", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  describe("GIVEN the component", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the subopts wrapper div", () => {
        expect.assertions(1);
        const div = el.shadowRoot!.querySelector(".subopts");
        expect(div).not.toBeNull();
      });

      it("THEN renders a slot element inside the wrapper", () => {
        expect.assertions(1);
        const slot = el.shadowRoot!.querySelector("slot");
        expect(slot).not.toBeNull();
      });
    });
  });
});
