import { describe, expect, it } from "vitest";
import {
  buildCorrelatedAnomalySpans,
  filterAnnotatedAnomalyClusters,
  filterClustersByCorrelatedSpans,
  getComparisonAnomalyCacheKey,
  getComparisonWindowLineStyle,
  resolveAnomalyClusterDisplay,
  shiftComparisonAnomalyClusters,
} from "../chart-comparison";

describe("chart-comparison", () => {
  describe("GIVEN getComparisonWindowLineStyle", () => {
    describe("WHEN the date window is hovered", () => {
      it("THEN it returns the solid line style", () => {
        expect.assertions(1);
        expect(getComparisonWindowLineStyle(true, false, false)).toEqual({
          lineOpacity: 1,
          dashed: false,
          hoverOpacity: 0.85,
        });
      });
    });

    describe("WHEN a different date window is hovered while one is selected", () => {
      it("THEN it returns the dimmed selected-window style", () => {
        expect.assertions(1);
        expect(getComparisonWindowLineStyle(false, true, true)).toEqual({
          lineOpacity: 0.25,
          lineWidth: 1.25,
          dashed: false,
          hoverOpacity: 0.25,
        });
      });
    });

    describe("WHEN no special state is active", () => {
      it("THEN it returns the default style", () => {
        expect.assertions(1);
        expect(getComparisonWindowLineStyle(false, false, false)).toEqual({
          lineOpacity: 0.85,
          dashed: false,
          hoverOpacity: 0.85,
        });
      });
    });
  });

  describe("GIVEN getComparisonAnomalyCacheKey", () => {
    it("THEN it builds a colon-separated key", () => {
      expect.assertions(1);
      expect(getComparisonAnomalyCacheKey("win-1", "sensor.temp")).toBe(
        "win-1:sensor.temp"
      );
    });
  });

  describe("GIVEN shiftComparisonAnomalyClusters", () => {
    describe("WHEN clusters have points", () => {
      it("THEN it subtracts the offset from each point timeMs", () => {
        expect.assertions(1);
        const shifted = shiftComparisonAnomalyClusters(
          [
            {
              points: [
                { timeMs: 5000, value: 1 },
                { timeMs: 6000, value: 2 },
              ],
            },
          ],
          3000
        );
        expect(shifted[0].points).toEqual([
          { timeMs: 2000, value: 1 },
          { timeMs: 3000, value: 2 },
        ]);
      });
    });

    describe("WHEN clusters is not an array", () => {
      it("THEN it returns an empty array", () => {
        expect.assertions(1);
        expect(shiftComparisonAnomalyClusters(null as never, 1000)).toEqual([]);
      });
    });
  });

  describe("GIVEN filterClustersByCorrelatedSpans", () => {
    describe("WHEN clusters intersect correlated spans", () => {
      it("THEN it keeps only intersecting clusters", () => {
        expect.assertions(1);
        const result = filterClustersByCorrelatedSpans(
          [
            {
              points: [
                { timeMs: 100, value: 1 },
                { timeMs: 200, value: 2 },
              ],
            },
            {
              points: [
                { timeMs: 400, value: 3 },
                { timeMs: 500, value: 4 },
              ],
            },
          ],
          [{ start: 90, end: 220 }]
        );
        expect(result).toHaveLength(1);
      });
    });

    describe("WHEN no correlated spans are provided", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        expect(
          filterClustersByCorrelatedSpans(
            [{ points: [{ timeMs: 100, value: 1 }] }],
            []
          )
        ).toEqual([]);
      });
    });

    describe("WHEN clusters is empty", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        expect(
          filterClustersByCorrelatedSpans([], [{ start: 0, end: 100 }])
        ).toEqual([]);
      });
    });
  });

  describe("GIVEN resolveAnomalyClusterDisplay", () => {
    const clusters = [
      { id: "normal", isOverlap: false, points: [{ timeMs: 10, value: 1 }] },
      { id: "overlap", isOverlap: true, points: [{ timeMs: 10, value: 1 }] },
    ] as never[];

    describe("WHEN overlap mode is 'all'", () => {
      it("THEN all clusters are returned with no correlated span highlights", () => {
        expect.assertions(2);
        const result = resolveAnomalyClusterDisplay(clusters, "all");
        expect(result.baseClusters).toEqual(clusters);
        expect(result.showCorrelatedSpans).toBe(false);
      });
    });

    describe("WHEN overlap mode is 'only'", () => {
      it("THEN only clusters matching correlated spans are returned", () => {
        expect.assertions(1);
        const result = resolveAnomalyClusterDisplay(clusters, "only", [
          { start: 5, end: 15 },
        ]);
        expect(result.showCorrelatedSpans).toBe(true);
      });
    });
  });

  describe("GIVEN buildCorrelatedAnomalySpans", () => {
    describe("WHEN fewer than 2 series have anomalies", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        const result = buildCorrelatedAnomalySpans(
          [
            {
              entityId: "sensor.a",
              pts: [
                [0, 1],
                [1000, 2],
              ],
            },
          ],
          new Map([["sensor.a", [{ points: [{ timeMs: 100 }] }]]]),
          new Map([["sensor.a", { show_anomalies: true }]])
        );
        expect(result).toEqual([]);
      });
    });

    describe("WHEN 2 series have overlapping anomaly clusters", () => {
      it("THEN it returns the overlapping spans", () => {
        expect.assertions(2);
        const result = buildCorrelatedAnomalySpans(
          [
            {
              entityId: "sensor.a",
              pts: [
                [0, 1],
                [60000, 2],
              ],
            },
            {
              entityId: "sensor.b",
              pts: [
                [0, 1],
                [60000, 2],
              ],
            },
          ],
          new Map([
            ["sensor.a", [{ points: [{ timeMs: 100 }, { timeMs: 200 }] }]],
            ["sensor.b", [{ points: [{ timeMs: 150 }, { timeMs: 250 }] }]],
          ]),
          new Map([
            ["sensor.a", { show_anomalies: true }],
            ["sensor.b", { show_anomalies: true }],
          ])
        );
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty("start");
      });
    });
  });

  describe("GIVEN filterAnnotatedAnomalyClusters", () => {
    describe("WHEN no events overlap with clusters", () => {
      it("THEN all clusters are returned", () => {
        expect.assertions(1);
        const result = filterAnnotatedAnomalyClusters(
          {
            entityId: "sensor.temp",
            anomalyClusters: [
              {
                points: [
                  { timeMs: 1000, value: 1 },
                  { timeMs: 2000, value: 2 },
                ],
              },
            ],
          },
          [
            {
              timestamp: new Date(5000).toISOString(),
              entity_ids: ["sensor.temp"],
            },
          ]
        );
        expect(result).toHaveLength(1);
      });
    });

    describe("WHEN an event overlaps a cluster for the same entity", () => {
      it("THEN that cluster is filtered out", () => {
        expect.assertions(1);
        const result = filterAnnotatedAnomalyClusters(
          {
            entityId: "sensor.temp",
            anomalyClusters: [
              {
                points: [
                  { timeMs: 1000, value: 1 },
                  { timeMs: 2000, value: 2 },
                ],
              },
            ],
          },
          [
            {
              timestamp: new Date(1500).toISOString(),
              entity_ids: ["sensor.temp"],
            },
          ]
        );
        expect(result).toHaveLength(0);
      });
    });

    describe("WHEN no clusters exist", () => {
      it("THEN it returns empty", () => {
        expect.assertions(1);
        expect(
          filterAnnotatedAnomalyClusters({ entityId: "sensor.temp" }, [])
        ).toEqual([]);
      });
    });
  });
});
