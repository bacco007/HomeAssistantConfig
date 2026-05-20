import { describe, expect, it } from "vitest";
import {
  formatComparisonLabel,
  formatDateWindowInputValue,
  getRoundedDateWindowUnit,
  parseDateWindowInputValue,
  shiftDateWindowByUnit,
} from "../date-window";

describe("date-window", () => {
  describe("GIVEN formatComparisonLabel", () => {
    describe("WHEN start and end are in the same year", () => {
      it("THEN formats without year", () => {
        expect.assertions(1);
        const label = formatComparisonLabel(
          new Date(2025, 0, 1),
          new Date(2025, 0, 15)
        );
        expect(label).toContain("–");
      });
    });

    describe("WHEN start and end are in different years", () => {
      it("THEN formats with year", () => {
        expect.assertions(1);
        const label = formatComparisonLabel(
          new Date(2024, 11, 20),
          new Date(2025, 0, 10)
        );
        expect(label).toMatch(/2024/);
      });
    });
  });

  describe("GIVEN shiftDateWindowByUnit", () => {
    describe("WHEN shifting by day", () => {
      it("THEN adds the correct number of days", () => {
        expect.assertions(1);
        const result = shiftDateWindowByUnit(new Date(2025, 0, 1), "day", 5);
        expect(result.getDate()).toBe(6);
      });
    });

    describe("WHEN shifting by week", () => {
      it("THEN adds 7 days per unit", () => {
        expect.assertions(1);
        const result = shiftDateWindowByUnit(new Date(2025, 0, 1), "week", 2);
        expect(result.getDate()).toBe(15);
      });
    });

    describe("WHEN shifting by month", () => {
      it("THEN increments the month", () => {
        expect.assertions(1);
        const result = shiftDateWindowByUnit(new Date(2025, 0, 15), "month", 1);
        expect(result.getMonth()).toBe(1);
      });
    });

    describe("WHEN shifting by year", () => {
      it("THEN increments the year", () => {
        expect.assertions(1);
        const result = shiftDateWindowByUnit(new Date(2025, 5, 1), "year", -1);
        expect(result.getFullYear()).toBe(2024);
      });
    });

    describe("WHEN shifting by unsupported unit", () => {
      it("THEN returns the same date (cloned)", () => {
        expect.assertions(2);
        const input = new Date(2025, 0, 1);
        const result = shiftDateWindowByUnit(input, "hour", 3);
        expect(result.getTime()).toBe(input.getTime());
        expect(result).not.toBe(input);
      });
    });
  });

  describe("GIVEN getRoundedDateWindowUnit", () => {
    describe("WHEN start/end span exactly one day", () => {
      it("THEN returns 'day'", () => {
        expect.assertions(1);
        const start = new Date(2025, 0, 1);
        const end = new Date(2025, 0, 2);
        expect(getRoundedDateWindowUnit(start, end)).toBe("day");
      });
    });

    describe("WHEN start/end span exactly one month", () => {
      it("THEN returns 'month'", () => {
        expect.assertions(1);
        const start = new Date(2025, 0, 1);
        const end = new Date(2025, 1, 1);
        expect(getRoundedDateWindowUnit(start, end)).toBe("month");
      });
    });

    describe("WHEN start equals end", () => {
      it("THEN returns null", () => {
        expect.assertions(1);
        const d = new Date(2025, 0, 1);
        expect(getRoundedDateWindowUnit(d, d)).toBeNull();
      });
    });

    describe("WHEN start is after end", () => {
      it("THEN returns null", () => {
        expect.assertions(1);
        expect(
          getRoundedDateWindowUnit(new Date(2025, 1, 1), new Date(2025, 0, 1))
        ).toBeNull();
      });
    });

    describe("WHEN range does not align to any unit", () => {
      it("THEN returns null", () => {
        expect.assertions(1);
        expect(
          getRoundedDateWindowUnit(new Date(2025, 0, 3), new Date(2025, 0, 10))
        ).toBeNull();
      });
    });
  });

  describe("GIVEN formatDateWindowInputValue", () => {
    describe("WHEN given a valid date", () => {
      it("THEN returns ISO-like datetime-local string", () => {
        expect.assertions(1);
        const result = formatDateWindowInputValue(new Date(2025, 0, 5, 14, 30));
        expect(result).toBe("2025-01-05T14:30");
      });
    });

    describe("WHEN given null", () => {
      it("THEN returns empty string", () => {
        expect.assertions(1);
        expect(formatDateWindowInputValue(null)).toBe("");
      });
    });

    describe("WHEN given an invalid date", () => {
      it("THEN returns empty string", () => {
        expect.assertions(1);
        expect(formatDateWindowInputValue(new Date("invalid"))).toBe("");
      });
    });
  });

  describe("GIVEN parseDateWindowInputValue", () => {
    describe("WHEN given a valid datetime-local string", () => {
      it("THEN returns the parsed Date", () => {
        expect.assertions(3);
        const result = parseDateWindowInputValue("2025-01-05T14:30");
        expect(result).toBeInstanceOf(Date);
        expect(result!.getFullYear()).toBe(2025);
        expect(result!.getHours()).toBe(14);
      });
    });

    describe("WHEN given null", () => {
      it("THEN returns null", () => {
        expect.assertions(1);
        expect(parseDateWindowInputValue(null)).toBeNull();
      });
    });

    describe("WHEN given an invalid string", () => {
      it("THEN returns null", () => {
        expect.assertions(1);
        expect(parseDateWindowInputValue("not-a-date")).toBeNull();
      });
    });

    describe("WHEN given undefined", () => {
      it("THEN returns null", () => {
        expect.assertions(1);
        expect(parseDateWindowInputValue(undefined)).toBeNull();
      });
    });
  });
});
