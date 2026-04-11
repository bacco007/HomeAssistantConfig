import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../form-group";

function createElement(label = "", description = "") {
  const el = document.createElement("form-group") as HTMLElement & {
    label: string;
    description: string;
  };
  el.label = label;
  el.description = description;
  document.body.appendChild(el);
  return el;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe("form-group", () => {
  let el: HTMLElement & { label: string; description: string };

  afterEach(() => {
    if (el) cleanup(el);
  });

  describe("GIVEN a form group with label and description", () => {
    beforeEach(async () => {
      el = createElement("Entity", "Select the entity to track");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it displays the label", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector(".form-label");
        expect(label?.textContent?.trim()).toBe("Entity");
      });

      it("THEN it displays the description", () => {
        expect.assertions(1);
        const help = el.shadowRoot!.querySelector(".form-help");
        expect(help?.textContent?.trim()).toBe("Select the entity to track");
      });

      it("THEN it renders a slot for content", () => {
        expect.assertions(1);
        const slot = el.shadowRoot!.querySelector("slot");
        expect(slot).toBeTruthy();
      });
    });
  });

  describe("GIVEN a form group with no label", () => {
    beforeEach(async () => {
      el = createElement("", "Some help text");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it does not render a label element", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector(".form-label");
        expect(label).toBeNull();
      });

      it("THEN it still renders the description", () => {
        expect.assertions(1);
        const help = el.shadowRoot!.querySelector(".form-help");
        expect(help?.textContent?.trim()).toBe("Some help text");
      });
    });
  });

  describe("GIVEN a form group with no description", () => {
    beforeEach(async () => {
      el = createElement("Label Only");
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it renders the label", () => {
        expect.assertions(1);
        const label = el.shadowRoot!.querySelector(".form-label");
        expect(label?.textContent?.trim()).toBe("Label Only");
      });

      it("THEN it does not render a description element", () => {
        expect.assertions(1);
        const help = el.shadowRoot!.querySelector(".form-help");
        expect(help).toBeNull();
      });
    });
  });

  describe("GIVEN a form group with neither label nor description", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN it only renders the slot", () => {
        expect.assertions(2);
        const label = el.shadowRoot!.querySelector(".form-label");
        const help = el.shadowRoot!.querySelector(".form-help");
        expect(label).toBeNull();
        expect(help).toBeNull();
      });
    });
  });
});
