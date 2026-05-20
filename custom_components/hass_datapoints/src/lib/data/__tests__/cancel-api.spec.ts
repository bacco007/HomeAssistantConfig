import { beforeEach, describe, expect, it, vi } from "vitest";

// Re-import the module fresh before each test so the module-level Map is reset.
// vitest's module registry is shared; we isolate by using vi.resetModules().
beforeEach(() => {
  vi.resetModules();
});

describe("cancel-api", () => {
  describe("GIVEN a tracked in-flight request", () => {
    describe("WHEN cancelPending is called for that slot", () => {
      it("THEN sends a cancel message with the tracked request_id", async () => {
        const { trackRequest, cancelPending } =
          await import("@/lib/data/cancel-api");
        const sendMessagePromise = vi.fn().mockResolvedValue(undefined);
        const hass = { connection: { sendMessagePromise } };

        trackRequest("slot:a", "req-uuid-1");
        cancelPending(hass, "slot:a");

        expect(sendMessagePromise).toHaveBeenCalledOnce();
        expect(sendMessagePromise).toHaveBeenCalledWith({
          type: "hass_datapoints/cancel",
          request_id: "req-uuid-1",
        });
      });

      it("THEN removes the slot from the in-flight map so a second cancel is no-op", async () => {
        const { trackRequest, cancelPending } =
          await import("@/lib/data/cancel-api");
        const sendMessagePromise = vi.fn().mockResolvedValue(undefined);
        const hass = { connection: { sendMessagePromise } };

        trackRequest("slot:b", "req-uuid-2");
        cancelPending(hass, "slot:b");
        cancelPending(hass, "slot:b"); // second call — nothing tracked

        expect(sendMessagePromise).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN cancelPending is called for an unknown slot", () => {
      it("THEN does not send any message", async () => {
        const { cancelPending } = await import("@/lib/data/cancel-api");
        const sendMessagePromise = vi.fn().mockResolvedValue(undefined);
        const hass = { connection: { sendMessagePromise } };

        cancelPending(hass, "slot:nonexistent");

        expect(sendMessagePromise).not.toHaveBeenCalled();
      });
    });

    describe("WHEN clearRequest is called", () => {
      it("THEN removes the slot so subsequent cancelPending is a no-op", async () => {
        const { trackRequest, cancelPending, clearRequest } =
          await import("@/lib/data/cancel-api");
        const sendMessagePromise = vi.fn().mockResolvedValue(undefined);
        const hass = { connection: { sendMessagePromise } };

        trackRequest("slot:c", "req-uuid-3");
        clearRequest("slot:c");
        cancelPending(hass, "slot:c");

        expect(sendMessagePromise).not.toHaveBeenCalled();
      });
    });

    describe("WHEN multiple slots are tracked", () => {
      it("THEN each slot is cancelled independently", async () => {
        const { trackRequest, cancelPending } =
          await import("@/lib/data/cancel-api");
        const sendMessagePromise = vi.fn().mockResolvedValue(undefined);
        const hass = { connection: { sendMessagePromise } };

        trackRequest("slot:x", "req-x");
        trackRequest("slot:y", "req-y");
        cancelPending(hass, "slot:x");

        expect(sendMessagePromise).toHaveBeenCalledOnce();
        expect(sendMessagePromise).toHaveBeenCalledWith(
          expect.objectContaining({ request_id: "req-x" })
        );

        // slot:y still tracked — cancel it
        cancelPending(hass, "slot:y");
        expect(sendMessagePromise).toHaveBeenCalledTimes(2);
        expect(sendMessagePromise).toHaveBeenLastCalledWith(
          expect.objectContaining({ request_id: "req-y" })
        );
      });
    });
  });
});
