import { describe, expect, it } from "vitest";

import {
  buildDeltaPoints,
  buildLinearTrend,
  buildRateOfChangePoints,
  buildRollingAverageTrend,
  interpolateSeriesValue,
} from "../series";

describe("analysis/series", () => {
  describe("GIVEN buildRollingAverageTrend", () => {
    describe("WHEN called with a trailing window", () => {
      it("THEN it averages only the points inside that window", () => {
        expect.assertions(1);
        expect(
          buildRollingAverageTrend(
            [
              [0, 2],
              [60, 4],
              [120, 10],
            ],
            61
          )
        ).toEqual([
          [0, 2],
          [60, 3],
          [120, 7],
        ]);
      });
    });
  });

  describe("GIVEN buildLinearTrend", () => {
    describe("WHEN called with aligned values", () => {
      it("THEN it returns the line endpoints", () => {
        expect.assertions(1);
        expect(
          buildLinearTrend([
            [0, 0],
            [60 * 60 * 1000, 1],
            [2 * 60 * 60 * 1000, 2],
          ])
        ).toEqual([
          [0, 0],
          [2 * 60 * 60 * 1000, 2],
        ]);
      });
    });
  });

  describe("GIVEN interpolateSeriesValue", () => {
    describe("WHEN called between points", () => {
      it("THEN it returns the interpolated value", () => {
        expect.assertions(1);
        expect(
          interpolateSeriesValue(
            [
              [0, 0],
              [100, 10],
            ],
            50
          )
        ).toBe(5);
      });
    });

    describe("WHEN called outside the series range", () => {
      it("THEN it returns null", () => {
        expect.assertions(1);
        expect(
          interpolateSeriesValue(
            [
              [0, 0],
              [100, 10],
            ],
            101
          )
        ).toBeNull();
      });
    });
  });

  describe("GIVEN buildRateOfChangePoints", () => {
    describe("WHEN called in point_to_point mode", () => {
      it("THEN it returns the point-to-point hourly change", () => {
        expect.assertions(1);
        expect(
          buildRateOfChangePoints(
            [
              [0, 1],
              [60 * 60 * 1000, 4],
              [2 * 60 * 60 * 1000, 10],
            ],
            "point_to_point"
          )
        ).toEqual([
          [60 * 60 * 1000, 3],
          [2 * 60 * 60 * 1000, 6],
        ]);
      });
    });

    describe("WHEN called with a fixed window", () => {
      it("THEN it falls back to the first point until the full window is available", () => {
        expect.assertions(1);
        expect(
          buildRateOfChangePoints(
            [
              [0, 10],
              [30 * 60 * 1000, 16],
              [60 * 60 * 1000, 22],
            ],
            "1h"
          )
        ).toEqual([
          [30 * 60 * 1000, 12],
          [60 * 60 * 1000, 12],
        ]);
      });
    });
  });

  describe("GIVEN buildDeltaPoints", () => {
    describe("WHEN called with overlapping series", () => {
      it("THEN it returns delta values at matching timestamps", () => {
        expect.assertions(1);
        expect(
          buildDeltaPoints(
            [
              [0, 10],
              [60, 20],
            ],
            [
              [0, 4],
              [60, 5],
            ]
          )
        ).toEqual([
          [0, 6],
          [60, 15],
        ]);
      });
    });
  });
});
