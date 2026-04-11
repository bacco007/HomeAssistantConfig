import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  PANEL_HISTORY_SAVED_PAGE_KEY,
  fetchUserData,
  saveUserData,
} from "@/lib/data/preferences-api";

let warnSpy: ReturnType<typeof vi.fn>;

beforeAll(() => {
  warnSpy = vi.fn();
  vi.stubGlobal("logger", { warn: warnSpy });
});

beforeEach(() => {
  warnSpy.mockClear();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("preferences-api", () => {
  describe("GIVEN the history page saved user-data key", () => {
    describe("WHEN it is read", () => {
      it("THEN it keeps the expected stable key", () => {
        expect.assertions(1);

        expect(PANEL_HISTORY_SAVED_PAGE_KEY).toBe(
          "hass_datapoints:saved_page_v1"
        );
      });
    });
  });

  describe("GIVEN frontend user-data access", () => {
    describe("WHEN fetchUserData and saveUserData are called", () => {
      it("THEN they read, write, and fall back on failure", async () => {
        expect.assertions(5);

        const sendMessagePromise = vi.fn(async (payload) => {
          if (payload.type === "frontend/get_user_data") {
            return { value: { theme: "dark" } };
          }
          return {};
        });
        const hass = { connection: { sendMessagePromise } };

        await expect(fetchUserData(hass, "key", null)).resolves.toEqual({
          theme: "dark",
        });
        await saveUserData(hass, "key", { theme: "light" });

        expect(sendMessagePromise).toHaveBeenNthCalledWith(1, {
          type: "frontend/get_user_data",
          key: "key",
        });
        expect(sendMessagePromise).toHaveBeenNthCalledWith(2, {
          type: "frontend/set_user_data",
          key: "key",
          value: { theme: "light" },
        });

        sendMessagePromise.mockImplementationOnce(async () => {
          throw new Error("nope");
        });
        await expect(fetchUserData(hass, "missing", "fallback")).resolves.toBe(
          "fallback"
        );
        expect(warnSpy).toHaveBeenCalled();
      });
    });
  });
});
