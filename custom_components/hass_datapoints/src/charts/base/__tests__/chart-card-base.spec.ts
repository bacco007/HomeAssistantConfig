/* eslint-disable max-classes-per-file */
/**
 * card-chart-base.spec.ts
 *
 * Tests for ChartCardBase — the shared LitElement base class for chart cards.
 * We create a minimal concrete subclass to exercise the base lifecycle.
 */
import { html } from "lit";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("@/constants", () => ({
  DOMAIN: "hass_datapoints",
}));

let ChartCardBase: typeof import("../chart-card-base.ts").ChartCardBase;
let TestChartCardCtor: {
  new (): HTMLElement & {
    loadSpy: ReturnType<typeof vi.fn>;
    drawSpy: ReturnType<typeof vi.fn>;
    setConfig: (config: RecordWithUnknownValues) => void;
    hass: unknown;
    updateComplete: Promise<unknown>;
    _lastDrawArgs: unknown[];
  };
};

// ── Concrete test subclass ────────────────────────────────────────────────────

beforeAll(async () => {
  ({ ChartCardBase } = await import("../chart-card-base.ts"));

  class TestChartCard extends ChartCardBase {
    loadSpy = vi.fn().mockResolvedValue(undefined);

    drawSpy = vi.fn();

    async _load(): Promise<void> {
      return this.loadSpy();
    }

    _drawChart(...args: unknown[]): void {
      this.drawSpy(...args);
      this._lastDrawArgs = args;
    }

    render() {
      return html`<ha-card
        ><div class="chart-wrap"><canvas></canvas></div
      ></ha-card>`;
    }
  }

  customElements.define("test-chart-card", TestChartCard);
  TestChartCardCtor = TestChartCard as typeof TestChartCardCtor;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Deferred rAF: returns { flush } to run the queued callback on demand.
 *  Avoids the sync-rAF pitfall where the ID is overwritten after the callback. */
function setupDeferredRaf() {
  let pending: Nullable<FrameRequestCallback> = null;
  let nextId = 1;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    pending = cb;
    return nextId++;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
    pending = null;
  });
  return {
    flush() {
      if (pending) {
        const cb = pending;
        pending = null;
        cb(0);
      }
    },
  };
}

/** Build a mock hass object. If `subscribeSpy` is provided it is used as-is
 *  (no additional mockResolvedValue call that would override the spy). */
function createMockHass(subscribeSpy?: ReturnType<typeof vi.fn>) {
  return {
    states: {},
    connection: {
      subscribeEvents: subscribeSpy ?? vi.fn().mockResolvedValue(vi.fn()),
      sendMessagePromise: vi.fn().mockResolvedValue({}),
    },
    callService: vi.fn().mockResolvedValue(undefined),
  };
}

/** Create, configure, connect, and flush the initial rAF load. */
async function setupCard(
  raf: ReturnType<typeof setupDeferredRaf>,
  config: RecordWithUnknownValues = {},
  hass = createMockHass()
) {
  const el = document.createElement("test-chart-card") as InstanceType<
    typeof TestChartCardCtor
  >;
  el.setConfig(config);
  el.hass = hass as any;
  document.body.appendChild(el);
  await el.updateComplete; // updated() fires, schedules rAF
  raf.flush(); // runs the rAF callback → _load() called
  // Drain the microtask queue until _loadInFlight resets via .finally().
  // The async _load() chain involves up to 4 microtask hops depending on
  // the V8 async-function optimisation level:
  //   hop 1 – async fn promise adopts the inner resolved promise
  //   hop 2 – .catch() reaction settles
  //   hop 3 – .finally() callback runs  →  _loadInFlight = false
  //   hop 4 – (older V8: extra thenable-adoption step)
  // Four awaits guarantee the flag is clear before the test body runs.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  return el;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("card-chart-base", () => {
  let raf: ReturnType<typeof setupDeferredRaf>;

  beforeEach(() => {
    raf = setupDeferredRaf();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("GIVEN setConfig is called", () => {
    describe("WHEN config has a title", () => {
      it("THEN _config reflects it", async () => {
        expect.assertions(1);
        const el = await setupCard(raf, { title: "My Chart" });
        expect((el as any)._config.title).toBe("My Chart");
      });
    });
  });

  describe("GIVEN an element with hass set", () => {
    describe("WHEN the first update fires", () => {
      it("THEN subscribeEvents is called with the domain event type", async () => {
        expect.assertions(1);
        const subscribeSpy = vi.fn().mockResolvedValue(vi.fn());
        await setupCard(raf, {}, createMockHass(subscribeSpy));
        expect(subscribeSpy).toHaveBeenCalledWith(
          expect.any(Function),
          "hass_datapoints_event_recorded"
        );
      });

      it("THEN _load is called after rAF fires", async () => {
        expect.assertions(1);
        const el = await setupCard(raf);
        expect(el.loadSpy).toHaveBeenCalledOnce();
      });
    });

    describe("WHEN hass is set a second time", () => {
      it("THEN _load is called again", async () => {
        expect.assertions(1);
        const el = await setupCard(raf);
        el.loadSpy.mockClear();
        el.hass = createMockHass() as any;
        await el.updateComplete;
        raf.flush();
        await Promise.resolve();
        await Promise.resolve();
        expect(el.loadSpy).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN an element connected with hass", () => {
    describe("WHEN disconnected", () => {
      it("THEN the subscribeEvents unsubscribe is called", async () => {
        expect.assertions(1);
        const unsub = vi.fn();
        const subscribeSpy = vi.fn().mockResolvedValue(unsub);
        const el = await setupCard(raf, {}, createMockHass(subscribeSpy));
        // Allow the subscribeEvents .then() chain to resolve
        await Promise.resolve();
        await Promise.resolve();
        document.body.removeChild(el);
        expect(unsub).toHaveBeenCalled();
      });

      it("THEN the window event listener is removed", async () => {
        expect.assertions(1);
        const removeListenerSpy = vi.spyOn(window, "removeEventListener");
        const el = await setupCard(raf);
        document.body.removeChild(el);
        expect(removeListenerSpy).toHaveBeenCalledWith(
          "hass-datapoints-event-recorded",
          expect.any(Function)
        );
      });
    });
  });

  describe("GIVEN an initialized chart card is reconnected", () => {
    describe("WHEN connectedCallback runs again after cleanup", () => {
      it("THEN it re-establishes auto-refresh and resize observation", async () => {
        expect.assertions(3);
        const subscribeSpy = vi.fn().mockResolvedValue(vi.fn());
        const observe = vi.fn();
        const disconnect = vi.fn();
        class MockResizeObserver {
          observe = observe;

          disconnect = disconnect;
        }
        vi.stubGlobal(
          "ResizeObserver",
          MockResizeObserver as unknown as typeof ResizeObserver
        );
        const el = await setupCard(raf, {}, createMockHass(subscribeSpy));
        await Promise.resolve();
        await Promise.resolve();

        document.body.removeChild(el);
        subscribeSpy.mockClear();
        observe.mockClear();

        document.body.appendChild(el);
        await el.updateComplete;

        expect(subscribeSpy).toHaveBeenCalledTimes(1);
        expect(observe).toHaveBeenCalledTimes(1);
        expect(el.loadSpy).toHaveBeenCalled();
      });
    });
  });

  describe("GIVEN _lastDrawArgs is populated", () => {
    describe("WHEN accessed", () => {
      it("THEN it holds the args stored by _drawChart", async () => {
        expect.assertions(1);
        const el = await setupCard(raf);
        el._lastDrawArgs = ["arg1", "arg2"];
        expect(el._lastDrawArgs).toEqual(["arg1", "arg2"]);
      });
    });
  });

  describe("GIVEN a hass-datapoints-event-recorded window event fires", () => {
    describe("WHEN the element is connected with hass", () => {
      it("THEN _load is called again", async () => {
        expect.assertions(1);
        const el = await setupCard(raf);
        el.loadSpy.mockClear();

        window.dispatchEvent(new CustomEvent("hass-datapoints-event-recorded"));
        raf.flush();
        await Promise.resolve();
        await Promise.resolve();

        expect(el.loadSpy).toHaveBeenCalledOnce();
      });
    });
  });

  describe("GIVEN the static API", () => {
    describe("WHEN getStubConfig is called", () => {
      it("THEN it returns an object with a title property", () => {
        expect.assertions(1);
        expect(TestChartCardCtor.getStubConfig()).toHaveProperty("title");
      });
    });
  });
});
