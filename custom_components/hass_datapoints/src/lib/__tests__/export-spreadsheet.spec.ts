import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadHistorySpreadsheet } from "@/lib/export-spreadsheet";

vi.mock("@/lib/ha/entity-name", () => ({
  entityName: vi.fn((_hass, entityId: string) => `Name for ${entityId}`),
}));

vi.mock("@/lib/data/events-api", () => ({
  fetchEvents: vi.fn(async () => [
    {
      timestamp: "2026-04-01T01:00:00.000Z",
      message: "Window opened",
      annotation: "Bedroom",
      icon: "mdi:window-open",
      color: "#83c705",
      entity_ids: ["binary_sensor.window"],
      device_ids: ["device.one"],
      area_ids: ["bedroom"],
      label_ids: ["heating"],
    },
  ]),
}));

vi.mock("@/lib/data/history-api", () => ({
  fetchHistoryDuringPeriod: vi.fn(async () => ({
    "sensor.alpha": [
      { lu: new Date("2026-04-01T00:00:00.000Z").getTime(), s: "21.1" },
    ],
  })),
}));

describe("export-spreadsheet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GIVEN a history export request", () => {
    describe("WHEN downloadHistorySpreadsheet is called", () => {
      it("THEN it builds a workbook blob and triggers a download", async () => {
        expect.assertions(5);

        const createObjectUrlSpy = vi
          .spyOn(URL, "createObjectURL")
          .mockReturnValue("blob:mock");
        const revokeObjectUrlSpy = vi
          .spyOn(URL, "revokeObjectURL")
          .mockImplementation(() => undefined);
        const clickSpy = vi
          .spyOn(HTMLAnchorElement.prototype, "click")
          .mockImplementation(() => undefined);
        const appendSpy = vi.spyOn(document.body, "appendChild");

        await downloadHistorySpreadsheet({
          hass: {
            states: {
              "sensor.alpha": {
                attributes: { unit_of_measurement: "C" },
              },
            },
          },
          entityIds: ["sensor.alpha"],
          startTime: "2026-04-01T00:00:00.000Z",
          endTime: "2026-04-01T03:00:00.000Z",
          datapointScope: "linked",
          filenamePrefix: "history-export",
        });

        expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
        expect(clickSpy).toHaveBeenCalled();
        expect(appendSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            download:
              "history-export-2026-04-01T00-00-00.000Z-to-2026-04-01T03-00-00.000Z.xlsx",
          })
        );
        expect(revokeObjectUrlSpy).not.toHaveBeenCalled();
        expect(appendSpy.mock.calls[0][0]).toBeInstanceOf(HTMLAnchorElement);
      });
    });
  });
});
