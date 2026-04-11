import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  CardConfig,
  EventRecordFull,
  HassLike,
  SelectOption,
  SeriesItem,
} from "@/lib/types";

describe("types.ts", () => {
  describe("GIVEN the shared lib types", () => {
    describe("WHEN they are consumed in TypeScript", () => {
      it("THEN they describe the expected domain shapes", () => {
        expect.assertions(1);

        expectTypeOf<HassLike["states"]>().toEqualTypeOf<
          Record<
            string,
            {
              entity_id: string;
              state: string;
              attributes: RecordWithUnknownValues;
              last_changed: string;
              last_updated: string;
            }
          >
        >();
        expectTypeOf<SelectOption>().toEqualTypeOf<{
          label: string;
          value: string;
        }>();
        expectTypeOf<SeriesItem>().toEqualTypeOf<{
          entityId: string;
          label: string;
          color: string;
          unit?: string;
        }>();
        expectTypeOf<EventRecordFull["entity_ids"]>().toEqualTypeOf<
          string[] | undefined
        >();
        expectTypeOf<CardConfig>().toEqualTypeOf<RecordWithUnknownValues>();

        expect(true).toBe(true);
      });
    });
  });
});
