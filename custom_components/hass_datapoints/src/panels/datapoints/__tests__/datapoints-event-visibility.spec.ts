import { describe, expect, it, vi } from "vitest";
import { HassRecordsHistoryPanel } from "../datapoints";

describe("HassRecordsHistoryPanel", () => {
  describe("GIVEN a hidden event id list", () => {
    describe("WHEN toggling an already-hidden event", () => {
      it("THEN it removes the event id from the hidden list", () => {
        expect.assertions(2);
        const panel = {
          _hiddenEventIds: ["evt-1"],
          _renderContent: vi.fn(),
        };

        HassRecordsHistoryPanel.prototype._handleToggleEventVisibility.call(
          panel,
          {
            detail: { eventId: "evt-1" },
          }
        );

        expect(panel._hiddenEventIds).toEqual([]);
        expect(panel._renderContent).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN a visible event id", () => {
    describe("WHEN toggling the event visibility", () => {
      it("THEN it adds the event id to the hidden list", () => {
        expect.assertions(2);
        const panel = {
          _hiddenEventIds: [],
          _renderContent: vi.fn(),
        };

        HassRecordsHistoryPanel.prototype._handleToggleEventVisibility.call(
          panel,
          {
            detail: { eventId: "evt-2" },
          }
        );

        expect(panel._hiddenEventIds).toEqual(["evt-2"]);
        expect(panel._renderContent).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN a hovered record event", () => {
    describe("WHEN the hover starts", () => {
      it("THEN it updates the hovered chart event ids and redraws", () => {
        expect.assertions(2);
        const panel = {
          _hoveredEventIds: [],
          _renderContent: vi.fn(),
        };

        HassRecordsHistoryPanel.prototype._handleHoverEventRecord.call(panel, {
          detail: { eventId: "evt-3", hovered: true },
        });

        expect(panel._hoveredEventIds).toEqual(["evt-3"]);
        expect(panel._renderContent).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN the hover ends", () => {
      it("THEN it clears the hovered chart event ids and redraws", () => {
        expect.assertions(2);
        const panel = {
          _hoveredEventIds: ["evt-3"],
          _renderContent: vi.fn(),
        };

        HassRecordsHistoryPanel.prototype._handleHoverEventRecord.call(panel, {
          detail: { eventId: "evt-3", hovered: false },
        });

        expect(panel._hoveredEventIds).toEqual([]);
        expect(panel._renderContent).toHaveBeenCalledOnce();
      });
    });
  });
});
