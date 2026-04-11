import { describe, expect, it } from "vitest";

import { binaryOffLabel, binaryOnLabel } from "../binary-labels";

describe("data/binary-labels", () => {
  describe("GIVEN binaryOnLabel", () => {
    describe("WHEN a known device class is provided", () => {
      it("THEN it returns the mapped on label", () => {
        expect.assertions(1);
        expect(binaryOnLabel("door")).toBe("open");
      });
    });

    describe("WHEN an unknown device class is provided", () => {
      it("THEN it falls back to on", () => {
        expect.assertions(1);
        expect(binaryOnLabel("mystery")).toBe("on");
      });
    });
  });

  describe("GIVEN binaryOffLabel", () => {
    describe("WHEN a known device class is provided", () => {
      it("THEN it returns the mapped off label", () => {
        expect.assertions(1);
        expect(binaryOffLabel("door")).toBe("closed");
      });
    });

    describe("WHEN an unknown device class is provided", () => {
      it("THEN it falls back to off", () => {
        expect.assertions(1);
        expect(binaryOffLabel("mystery")).toBe("off");
      });
    });
  });
});
