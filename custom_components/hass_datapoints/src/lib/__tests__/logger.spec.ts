import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/lib/logger";

describe("logger.ts", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete (window as Window & { __HASS_DATAPOINTS_DEV__?: boolean })
      .__HASS_DATAPOINTS_DEV__;
    vi.restoreAllMocks();
  });

  describe("GIVEN the dev flag is disabled", () => {
    describe("WHEN the quiet log helpers are called", () => {
      it("THEN they do not emit console output", () => {
        expect.assertions(3);

        logger.log("hello");
        logger.debug("hello");
        logger.info("hello");

        expect(logSpy).not.toHaveBeenCalled();
        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN the dev flag is enabled", () => {
    describe("WHEN the quiet log helpers are called", () => {
      it("THEN they emit console output", () => {
        expect.assertions(3);
        (
          window as Window & { __HASS_DATAPOINTS_DEV__?: boolean }
        ).__HASS_DATAPOINTS_DEV__ = true;

        logger.log("hello");
        logger.debug("hello");
        logger.info("hello");

        expect(logSpy).toHaveBeenCalledWith("hello");
        expect(debugSpy).toHaveBeenCalledWith("hello");
        expect(infoSpy).toHaveBeenCalledWith("hello");
      });
    });
  });

  describe("GIVEN warn and error logging", () => {
    describe("WHEN the always-on helpers are called", () => {
      it("THEN they emit regardless of the dev flag", () => {
        expect.assertions(2);

        logger.warn("warn");
        logger.error("error");

        expect(warnSpy).toHaveBeenCalledWith("warn");
        expect(errorSpy).toHaveBeenCalledWith("error");
      });
    });
  });
});
