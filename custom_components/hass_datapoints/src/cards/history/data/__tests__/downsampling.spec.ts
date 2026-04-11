import { describe, expect, it } from "vitest";

import { SAMPLE_INTERVAL_MS, downsamplePts } from "../downsampling";

describe("data/downsampling", () => {
  describe("GIVEN SAMPLE_INTERVAL_MS", () => {
    describe("WHEN the common hourly interval is read", () => {
      it("THEN it exposes the expected milliseconds value", () => {
        expect.assertions(1);
        expect(SAMPLE_INTERVAL_MS["1h"]).toBe(60 * 60 * 1000);
      });
    });
  });

  describe("GIVEN downsamplePts", () => {
    describe("WHEN mean aggregation is used", () => {
      it("THEN it averages values inside each bucket", () => {
        expect.assertions(1);
        expect(
          downsamplePts(
            [
              [0, 2],
              [10, 4],
              [70, 10],
              [80, 14],
            ],
            60
          )
        ).toEqual([
          [0, 3],
          [70, 12],
        ]);
      });
    });

    describe("WHEN median aggregation is used", () => {
      it("THEN it returns the middle bucket value", () => {
        expect.assertions(1);
        expect(
          downsamplePts(
            [
              [0, 1],
              [10, 3],
              [20, 9],
            ],
            60,
            "median"
          )
        ).toEqual([[0, 3]]);
      });
    });

    describe("WHEN first and last aggregations are used", () => {
      it("THEN they preserve the first and last values in the bucket", () => {
        expect.assertions(2);
        const pts: [number, number][] = [
          [0, 2],
          [10, 4],
          [20, 6],
        ];
        expect(downsamplePts(pts, 60, "first")).toEqual([[0, 2]]);
        expect(downsamplePts(pts, 60, "last")).toEqual([[0, 6]]);
      });
    });
  });
});
