import { describe, expect, it } from "vitest";
import {
  extractRangeValue,
  formatRangeDateTime,
  formatRangeTick,
  formatRangeDuration,
  clampNumber,
  startOfLocalDay,
  startOfLocalHour,
  startOfLocalMinute,
  startOfLocalSecond,
  startOfLocalMonth,
  endOfLocalMonth,
  startOfLocalYear,
  startOfLocalWeek,
  startOfLocalQuarter,
  endOfLocalHour,
  endOfLocalDay,
  endOfLocalWeek,
  endOfLocalQuarter,
  endOfLocalMinute,
  endOfLocalSecond,
  formatMonthLabel,
  formatYearLabel,
  formatRangeSummary,
  getWeekOfYear,
  getWeekLabel,
  formatDayLabel,
  formatHourLabel,
  formatQuarterLabel,
  formatScaleLabel,
  formatContextLabel,
  formatPeriodSelectionLabel,
  startOfUnit,
  endOfUnit,
  addUnit,
  snapDateToUnit,
} from "@/lib/timeline/timeline-scale";

describe("timeline-scale lib", () => {
  describe("GIVEN range picker event payloads", () => {
    describe("WHEN extractRangeValue is called", () => {
      it("THEN it returns parsed start and end dates", () => {
        expect.assertions(2);
        const result = extractRangeValue({
          detail: {
            value: {
              startDate: "2026-03-01T00:00:00Z",
              endDate: "2026-03-02T00:00:00Z",
            },
          },
        });

        expect(result.start?.toISOString()).toBe("2026-03-01T00:00:00.000Z");
        expect(result.end?.toISOString()).toBe("2026-03-02T00:00:00.000Z");
      });
    });
  });

  describe("GIVEN valid and invalid dates", () => {
    describe("WHEN range formatting helpers are called", () => {
      it("THEN they return readable values or placeholders", () => {
        expect.assertions(6);
        const date = new Date("2026-03-01T10:40:00Z");

        expect(formatRangeDateTime(date)).not.toBe("--");
        expect(formatRangeTick(date)).not.toBe("--");
        expect(formatRangeDateTime("bad")).toBe("--");
        expect(formatRangeTick("bad")).toBe("--");
        expect(
          formatRangeDuration(
            new Date("2026-03-01T00:00:00Z"),
            new Date("2026-03-02T02:30:00Z")
          )
        ).toBe("1d 2h 30m");
        expect(
          formatRangeSummary(
            new Date("2026-03-01T00:00:00Z"),
            new Date("2026-03-01T01:00:00Z")
          )
        ).toContain("(1h)");
      });
    });
  });

  describe("GIVEN numbers outside a range", () => {
    describe("WHEN clampNumber is called", () => {
      it("THEN it clamps them into bounds", () => {
        expect.assertions(2);
        expect(clampNumber(-1, 0, 10)).toBe(0);
        expect(clampNumber(11, 0, 10)).toBe(10);
      });
    });
  });

  describe("GIVEN a timestamp", () => {
    describe("WHEN local boundary helpers are called", () => {
      it("THEN they return the expected floor and ceiling dates", () => {
        expect.assertions(15);
        const date = new Date("2026-03-15T10:40:55.250Z");

        expect(startOfLocalDay(date).getHours()).toBe(0);
        expect(startOfLocalHour(date).getMinutes()).toBe(0);
        expect(startOfLocalMinute(date).getSeconds()).toBe(0);
        expect(startOfLocalSecond(date).getMilliseconds()).toBe(0);
        expect(startOfLocalMonth(date).getDate()).toBe(1);
        expect(endOfLocalMonth(date).getMonth()).toBe(3);
        expect(startOfLocalYear(date).getMonth()).toBe(0);
        expect(startOfLocalWeek(date).getDay()).toBe(1);
        expect(startOfLocalQuarter(date).getMonth()).toBe(0);
        expect(
          endOfLocalHour(date).getTime() - startOfLocalHour(date).getTime()
        ).toBe(60 * 60 * 1000);
        expect(
          endOfLocalDay(date).getTime() - startOfLocalDay(date).getTime()
        ).toBe(24 * 60 * 60 * 1000);
        expect(
          endOfLocalWeek(date).getTime() - startOfLocalWeek(date).getTime()
        ).toBe(7 * 24 * 60 * 60 * 1000);
        expect(endOfLocalQuarter(date).getMonth()).toBe(3);
        expect(
          endOfLocalMinute(date).getTime() - startOfLocalMinute(date).getTime()
        ).toBe(60 * 1000);
        expect(
          endOfLocalSecond(date).getTime() - startOfLocalSecond(date).getTime()
        ).toBe(1000);
      });
    });
  });

  describe("GIVEN dates across different scales", () => {
    describe("WHEN label helpers are called", () => {
      it("THEN they format contextual labels correctly", () => {
        expect.assertions(11);
        const date = new Date("2026-03-15T10:40:00Z");

        expect(formatMonthLabel(date)).toBe("Mar");
        expect(formatYearLabel(date)).toBe("2026");
        expect(getWeekOfYear(date)).toBeGreaterThan(0);
        expect(getWeekLabel(date)).toContain("Mar");
        expect(formatDayLabel(date)).toBe("15");
        expect(formatHourLabel(date)).toBe(
          date.toLocaleTimeString([], { hour: "2-digit" })
        );
        expect(formatQuarterLabel(date, "quarterly")).toBe("Q1");
        expect(formatScaleLabel(date, "quarter", "quarterly")).toBe("Q1");
        expect(formatScaleLabel(date, "month")).toBe("Mar");
        expect(formatContextLabel(date, "year")).toBe("2026");
        expect(formatPeriodSelectionLabel(date, "quarter")).toBe("Mar 2026");
      });
    });
  });

  describe("GIVEN generic unit requests", () => {
    describe("WHEN startOfUnit, endOfUnit, addUnit, and snapDateToUnit are called", () => {
      it("THEN they delegate to the right unit boundaries", () => {
        expect.assertions(4);
        const date = new Date("2026-03-15T10:40:00Z");

        expect(startOfUnit(date, "day").getHours()).toBe(0);
        expect(endOfUnit(date, "day").getDate()).toBe(16);
        expect(addUnit(date, "week", 2).getDate()).toBe(29);
        expect(
          snapDateToUnit(new Date("2026-03-15T10:40:00Z"), "hour").toISOString()
        ).toBe("2026-03-15T11:00:00.000Z");
      });
    });
  });
});
