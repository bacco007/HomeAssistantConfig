import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import "../history-targets";

type HistoryRow = {
  entity_id: string;
  color: string;
  visible?: boolean;
  analysis?: unknown;
};

type DpHistoryTargets = HTMLElement & {
  rows: HistoryRow[];
  states: RecordWithUnknownValues;
  hass: Nullable<RecordWithUnknownValues>;
  comparisonWindows: unknown[];
  canShowDeltaAnalysis: boolean;
  sidebarCollapsed: boolean;
  updateComplete: Promise<boolean>;
};

function createElement(
  props: Partial<DpHistoryTargets> = {}
): DpHistoryTargets {
  const el = document.createElement("history-targets") as DpHistoryTargets;
  Object.assign(el, {
    rows: [],
    states: {},
    hass: null,
    comparisonWindows: [],
    canShowDeltaAnalysis: false,
    sidebarCollapsed: false,
    ...props,
  });
  document.body.appendChild(el);
  return el;
}

const MOCK_ROWS: HistoryRow[] = [
  { entity_id: "sensor.temperature", color: "#ff0000", visible: true },
  { entity_id: "sensor.humidity", color: "#00ff00", visible: false },
];

describe("history-targets", () => {
  let el: DpHistoryTargets;

  afterEach(() => el?.remove());

  // ── Structure ──────────────────────────────────────────────────────────────

  describe("GIVEN default props (no rows)", () => {
    beforeEach(async () => {
      el = createElement();
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN renders the targets section header", () => {
        expect.assertions(1);
        expect(
          el
            .shadowRoot!.querySelector(".sidebar-section-title")
            ?.textContent?.trim()
        ).toBe("Targets");
      });

      it("THEN renders the section subtitle", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector(".sidebar-section-subtitle")
        ).not.toBeNull();
      });

      it("THEN renders the target-row-list element", () => {
        expect.assertions(1);
        expect(el.shadowRoot!.querySelector("target-row-list")).not.toBeNull();
      });

      it("THEN renders the picker slot", () => {
        expect.assertions(1);
        expect(
          el.shadowRoot!.querySelector("slot[name='picker']")
        ).not.toBeNull();
      });

      it("THEN renders the collapsed preferences container", () => {
        expect.assertions(2);
        expect(
          el.shadowRoot!.querySelector(
            ".history-targets-collapsed-add-container"
          )
        ).not.toBeNull();
        expect(
          el.shadowRoot!.querySelector(
            ".history-targets-collapsed-preferences-container"
          )
        ).not.toBeNull();
      });
    });
  });

  // ── Collapsed preferences button ───────────────────────────────────────────

  describe("GIVEN sidebarCollapsed=true", () => {
    beforeEach(async () => {
      el = createElement({ sidebarCollapsed: true });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN the host reflects sidebar-collapsed attribute", () => {
        expect.assertions(1);
        expect(el.hasAttribute("sidebar-collapsed")).toBe(true);
      });

      it("THEN the collapsed layout stretches to the full column height", () => {
        expect.assertions(2);
        const hostStyle = getComputedStyle(el);
        const content =
          el.shadowRoot!.querySelector<HTMLElement>(".history-targets");
        expect(hostStyle.height).toBe("100%");
        expect(getComputedStyle(content!).height).toBe("100%");
      });
    });

    describe("WHEN preferences button is clicked", () => {
      it("THEN fires dp-targets-prefs-click event", async () => {
        expect.assertions(1);
        const events: Event[] = [];
        el.addEventListener("dp-targets-prefs-click", (ev) => events.push(ev));
        el.shadowRoot!.querySelector<HTMLElement>(
          ".history-targets-collapsed-preferences"
        )!.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
      });
    });

    describe("WHEN add button is clicked", () => {
      it("THEN fires dp-targets-add-click event", async () => {
        expect.assertions(2);
        const events: CustomEvent[] = [];
        el.addEventListener("dp-targets-add-click", (ev) => events.push(ev));
        el.shadowRoot!.querySelector<HTMLElement>(
          ".history-targets-collapsed-add"
        )!.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
        expect(events[0].detail.buttonEl).toBeInstanceOf(HTMLElement);
      });
    });

    describe("WHEN there are no rows", () => {
      it("THEN renders only the collapsed action buttons", () => {
        expect.assertions(3);
        expect(
          el.shadowRoot!.querySelectorAll(".history-targets-collapsed-item")
            .length
        ).toBe(0);
        expect(
          el.shadowRoot!.querySelector(".history-targets-collapsed-add")
        ).not.toBeNull();
        expect(
          el.shadowRoot!.querySelector(".history-targets-collapsed-preferences")
        ).not.toBeNull();
      });
    });
  });

  // ── Collapsed summary ──────────────────────────────────────────────────────

  describe("GIVEN rows with two entities", () => {
    beforeEach(async () => {
      el = createElement({
        rows: MOCK_ROWS,
        hass: createMockHass() as unknown as RecordWithUnknownValues,
        states: createMockHass().states as unknown as RecordWithUnknownValues,
        sidebarCollapsed: true,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered in collapsed mode", () => {
      it("THEN renders two collapsed item buttons", () => {
        expect.assertions(1);
        const items = el.shadowRoot!.querySelectorAll(
          ".history-targets-collapsed-item"
        );
        expect(items.length).toBe(2);
      });

      it("THEN hidden row has is-hidden class", () => {
        expect.assertions(1);
        const items = el.shadowRoot!.querySelectorAll(
          ".history-targets-collapsed-item"
        );
        const hiddenItem = Array.from(items).find(
          (btn) => (btn as HTMLElement).dataset.entityId === "sensor.humidity"
        );
        expect(hiddenItem!.classList.contains("is-hidden")).toBe(true);
      });

      it("THEN visible row does NOT have is-hidden class", () => {
        expect.assertions(1);
        const items = el.shadowRoot!.querySelectorAll(
          ".history-targets-collapsed-item"
        );
        const visibleItem = Array.from(items).find(
          (btn) =>
            (btn as HTMLElement).dataset.entityId === "sensor.temperature"
        );
        expect(visibleItem!.classList.contains("is-hidden")).toBe(false);
      });
    });
  });

  // ── Collapsed entity click event ───────────────────────────────────────────

  describe("GIVEN rows with entities in collapsed mode", () => {
    beforeEach(async () => {
      el = createElement({
        rows: MOCK_ROWS,
        hass: createMockHass() as unknown as RecordWithUnknownValues,
        states: createMockHass().states as unknown as RecordWithUnknownValues,
        sidebarCollapsed: true,
      });
      await el.updateComplete;
    });

    describe("WHEN a collapsed entity button is clicked", () => {
      it("THEN fires dp-collapsed-entity-click with the entity id", async () => {
        expect.assertions(2);
        const events: CustomEvent[] = [];
        el.addEventListener("dp-collapsed-entity-click", (ev) =>
          events.push(ev as CustomEvent)
        );
        el.shadowRoot!.querySelector<HTMLElement>(
          ".history-targets-collapsed-item"
        )!.click();
        await el.updateComplete;
        expect(events.length).toBe(1);
        expect(events[0].detail.entityId).toBe("sensor.temperature");
      });
    });
  });

  // ── target-row-list receives props ─────────────────────────────────────

  describe("GIVEN rows and hass are set", () => {
    beforeEach(async () => {
      el = createElement({
        rows: MOCK_ROWS,
        hass: createMockHass() as unknown as RecordWithUnknownValues,
        states: createMockHass().states as unknown as RecordWithUnknownValues,
        canShowDeltaAnalysis: true,
      });
      await el.updateComplete;
    });

    describe("WHEN rendered", () => {
      it("THEN passes rows to target-row-list", () => {
        expect.assertions(1);
        const rowList = el.shadowRoot!.querySelector(
          "target-row-list"
        ) as HTMLElement & { rows: unknown[] };
        expect(rowList.rows).toEqual(MOCK_ROWS);
      });

      it("THEN passes hass to target-row-list", () => {
        expect.assertions(1);
        const rowList = el.shadowRoot!.querySelector(
          "target-row-list"
        ) as HTMLElement & { hass: unknown };
        expect(rowList.hass).toBeTruthy();
      });
    });
  });
});
