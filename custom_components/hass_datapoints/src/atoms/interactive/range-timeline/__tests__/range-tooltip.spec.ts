import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../range-tooltip";

function createElement(props: RecordWithUnknownValues = {}) {
  const el = document.createElement("range-tooltip") as HTMLElement & {
    content: string;
    visible: boolean;
    position: number;
    isLive: boolean;
    liveHint: string;
    side: "start" | "end";
    updateComplete: Promise<boolean>;
  };
  Object.assign(el, {
    content: "",
    visible: false,
    position: 0,
    isLive: false,
    liveHint: "",
    side: "start",
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

describe("range-tooltip", () => {
  let el: ReturnType<typeof createElement>;

  afterEach(() => el?.remove());

  // ---------------------------------------------------------------------------
  // Structure
  // ---------------------------------------------------------------------------

  describe("GIVEN default props", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN aria-hidden is true", () => {
        expect.assertions(1);
        expect(el.getAttribute("aria-hidden")).toBe("true");
      });

      it("THEN the visible attribute is not present", () => {
        expect.assertions(1);
        expect(el.hasAttribute("visible")).toBe(false);
      });

      it("THEN the side attribute reflects start", () => {
        expect.assertions(1);
        expect(el.getAttribute("side")).toBe("start");
      });

      it("THEN the host left style is 0px", () => {
        expect.assertions(1);
        expect(el.style.left).toBe("0px");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Visibility
  // ---------------------------------------------------------------------------

  describe("GIVEN visible=true with content", () => {
    beforeEach(async () => {
      el = createElement({ visible: true, content: "15 Jan, 08:00" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN aria-hidden is false", () => {
        expect.assertions(1);
        expect(el.getAttribute("aria-hidden")).toBe("false");
      });

      it("THEN the visible attribute is present", () => {
        expect.assertions(1);
        expect(el.hasAttribute("visible")).toBe(true);
      });

      it("THEN the content is rendered", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.textContent).toContain("15 Jan, 08:00");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Position
  // ---------------------------------------------------------------------------

  describe("GIVEN position=120", () => {
    beforeEach(async () => {
      el = createElement({ position: 120 });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the host left style is 120px", () => {
        expect.assertions(1);
        expect(el.style.left).toBe("120px");
      });
    });

    describe("WHEN position is updated to 250", () => {
      it("THEN the host left style updates to 250px", async () => {
        expect.assertions(1);
        el.position = 250;
        await el.updateComplete;
        expect(el.style.left).toBe("250px");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Side
  // ---------------------------------------------------------------------------

  describe("GIVEN side=end", () => {
    beforeEach(async () => {
      el = createElement({ side: "end" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the side attribute reflects end", () => {
        expect.assertions(1);
        expect(el.getAttribute("side")).toBe("end");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Live hint
  // ---------------------------------------------------------------------------

  describe("GIVEN isLive=true with a liveHint", () => {
    beforeEach(async () => {
      el = createElement({
        visible: true,
        content: "15 Jan, 20:00",
        isLive: true,
        liveHint: "Updates with new data",
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the live hint span is rendered", () => {
        expect.assertions(1);
        const hint = el.shadowRoot!.querySelector(".live-hint");
        expect(hint).not.toBeNull();
      });

      it("THEN the live hint contains the hint text", () => {
        expect.assertions(1);
        const hint = el.shadowRoot!.querySelector(".live-hint");
        expect(hint?.textContent).toBe("Updates with new data");
      });
    });
  });

  describe("GIVEN isLive=false", () => {
    beforeEach(async () => {
      el = createElement({ visible: true, content: "15 Jan, 20:00" });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN no live hint span is rendered", () => {
        expect.assertions(1);
        const hint = el.shadowRoot!.querySelector(".live-hint");
        expect(hint).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Reactivity
  // ---------------------------------------------------------------------------

  describe("GIVEN a hidden tooltip", () => {
    beforeEach(async () => {
      el = createElement({ visible: false });
      await el.updateComplete;
    });

    describe("WHEN visible is set to true", () => {
      it("THEN the visible attribute appears and aria-hidden flips", async () => {
        expect.assertions(2);
        el.visible = true;
        await el.updateComplete;
        expect(el.hasAttribute("visible")).toBe(true);
        expect(el.getAttribute("aria-hidden")).toBe("false");
      });
    });
  });
});
