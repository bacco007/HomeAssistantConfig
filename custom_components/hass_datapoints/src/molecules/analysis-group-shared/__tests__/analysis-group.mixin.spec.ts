import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LitElement, html } from "lit";
import { AnalysisGroupMixin } from "../analysis-group.mixin";
import { setFrontendLocale } from "@/lib/i18n/localize";

// Minimal concrete class for testing the mixin in isolation.
class TestAnalysisGroup extends AnalysisGroupMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}
customElements.define("test-analysis-group-mixin", TestAnalysisGroup);

type TestEl = InstanceType<typeof TestAnalysisGroup> & {
  updateComplete: Promise<boolean>;
};

function createElement(props: { entityId?: string } = {}): TestEl {
  const el = document.createElement("test-analysis-group-mixin") as TestEl;
  el.entityId = props.entityId ?? "sensor.test";
  document.body.appendChild(el);
  return el;
}

describe("AnalysisGroupMixin", () => {
  beforeEach(async () => {
    await setFrontendLocale("en");
  });

  let el: TestEl;
  afterEach(() => el?.remove());

  // ── _emit ────────────────────────────────────────────────────────────────

  describe("GIVEN entityId=sensor.living_room_temp", () => {
    beforeEach(async () => {
      el = createElement({ entityId: "sensor.living_room_temp" });
      await el.updateComplete;
    });

    describe("WHEN _emit is called with key='show_trend_lines' and value=true", () => {
      it("THEN dispatches dp-group-analysis-change with correct detail", () => {
        expect.assertions(4);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        // @ts-expect-error - accessing protected method for test
        el._emit("show_trend_lines", true);
        expect(handler).toHaveBeenCalledOnce();
        const { detail } = handler.mock.calls[0][0] as CustomEvent;
        expect(detail.entityId).toBe("sensor.living_room_temp");
        expect(detail.key).toBe("show_trend_lines");
        expect(detail.value).toBe(true);
      });

      it("THEN the event bubbles and is composed", () => {
        expect.assertions(2);
        let captured: Event | null = null;
        document.addEventListener(
          "dp-group-analysis-change",
          (e) => {
            captured = e;
          },
          { once: true }
        );
        // @ts-expect-error - accessing protected method for test
        el._emit("some_key", 42);
        expect(captured).not.toBeNull();
        expect((captured as CustomEvent).bubbles).toBe(true);
      });
    });
  });

  // ── _onCheckbox ──────────────────────────────────────────────────────────

  describe("GIVEN a rendered element", () => {
    beforeEach(async () => {
      el = createElement({ entityId: "sensor.test" });
      await el.updateComplete;
    });

    describe("WHEN _onCheckbox is called with key='show_summary_stats' and a checked input event", () => {
      it("THEN dispatches dp-group-analysis-change with key and checked=true", () => {
        expect.assertions(2);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = true;
        const event = new Event("change");
        Object.defineProperty(event, "target", { value: input });
        // @ts-expect-error - accessing protected method for test
        el._onCheckbox("show_summary_stats", event);
        expect(handler.mock.calls[0][0].detail.key).toBe("show_summary_stats");
        expect(handler.mock.calls[0][0].detail.value).toBe(true);
      });

      it("THEN dispatches with checked=false when input is unchecked", () => {
        expect.assertions(1);
        const handler = vi.fn();
        el.addEventListener("dp-group-analysis-change", handler);
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = false;
        const event = new Event("change");
        Object.defineProperty(event, "target", { value: input });
        // @ts-expect-error - accessing protected method for test
        el._onCheckbox("show_summary_stats", event);
        expect(handler.mock.calls[0][0].detail.value).toBe(false);
      });
    });
  });

  // ── _localizedOptions ────────────────────────────────────────────────────

  describe("GIVEN a rendered element", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN _localizedOptions is called with simple options", () => {
      it("THEN returns options with labels passed through msg()", () => {
        expect.assertions(2);
        const opts = [
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
        ];
        // @ts-expect-error - accessing protected method for test
        const result = el._localizedOptions(opts);
        expect(result).toHaveLength(2);
        // In en locale msg() returns the string as-is
        expect(result[0].label).toBe("Option A");
      });

      it("THEN preserves all original fields", () => {
        expect.assertions(1);
        const opts = [{ value: "x", label: "X Label", extra: "keep-me" }];
        // @ts-expect-error - accessing protected method for test
        const result = el._localizedOptions(opts);
        expect((result[0] as { extra: string }).extra).toBe("keep-me");
      });
    });

    describe("WHEN _localizedOptions is called with options that have a help field", () => {
      it("THEN also localizes the help text", () => {
        expect.assertions(1);
        const opts = [{ value: "a", label: "Label", help: "Help text" }];
        // @ts-expect-error - accessing protected method for test
        const result = el._localizedOptions(opts);
        expect(result[0].help).toBe("Help text");
      });

      it("THEN leaves help undefined when not set", () => {
        expect.assertions(1);
        const opts = [{ value: "a", label: "Label" }];
        // @ts-expect-error - accessing protected method for test
        const result = el._localizedOptions(opts);
        expect((result[0] as { help?: string }).help).toBeUndefined();
      });
    });
  });
});
