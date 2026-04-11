import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { esc, fmtDateTime, fmtRelativeTime, fmtTime } from "@/lib/util/format";

describe("format.js", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("GIVEN an ISO timestamp", () => {
    describe("WHEN fmtTime and fmtDateTime are called", () => {
      it("THEN they return locale formatted strings", () => {
        expect.assertions(2);

        expect(fmtTime("2026-04-07T09:30:00.000Z")).toMatch(/\d{2}:\d{2}/);
        expect(fmtDateTime("2026-04-07T09:30:00.000Z")).toContain("Apr");
      });
    });
  });

  describe("GIVEN a relative timestamp", () => {
    describe("WHEN fmtRelativeTime is called", () => {
      it("THEN it returns friendly relative labels for recent values", () => {
        expect.assertions(4);
        vi.setSystemTime(new Date("2026-04-07T12:00:00.000Z"));

        expect(fmtRelativeTime("2026-04-07T11:59:45.000Z")).toBe("Just now");
        expect(fmtRelativeTime("2026-04-07T11:45:00.000Z")).toBe("15m ago");
        expect(fmtRelativeTime("2026-04-07T10:00:00.000Z")).toBe("2h ago");
        expect(fmtRelativeTime("2026-04-05T12:00:00.000Z")).toBe("2d ago");
      });
    });
  });

  describe("GIVEN untrusted inline text", () => {
    describe("WHEN esc is called", () => {
      it("THEN it escapes the HTML characters", () => {
        expect.assertions(1);

        expect(esc(`<tag attr="x">&"</tag>`)).toBe(
          "&lt;tag attr=&quot;x&quot;&gt;&amp;&quot;&lt;/tag&gt;"
        );
      });
    });
  });
});
