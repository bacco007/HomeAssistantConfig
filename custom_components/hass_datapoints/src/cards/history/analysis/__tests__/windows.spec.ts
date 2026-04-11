import { describe, expect, it } from "vitest";

import { getPersistenceWindowMs, getTrendWindowMs } from "../windows";

describe("analysis/windows", () => {
  describe("GIVEN getTrendWindowMs", () => {
    describe("WHEN called with an unknown key", () => {
      it("THEN it returns the configured 24h fallback window", () => {
        expect.assertions(1);
        expect(getTrendWindowMs("unknown")).toBe(24 * 60 * 60 * 1000);
      });
    });
  });

  describe("GIVEN getPersistenceWindowMs", () => {
    describe("WHEN called with an unknown key", () => {
      it("THEN it returns the configured 1h fallback window", () => {
        expect.assertions(1);
        expect(getPersistenceWindowMs("unknown")).toBe(60 * 60 * 1000);
      });
    });
  });
});
