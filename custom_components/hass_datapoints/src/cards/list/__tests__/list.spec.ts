import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsListCard } from "../list.ts";
import type { EventRecord } from "@/lib/types";

import { fetchEvents } from "@/lib/data/events-api";

vi.mock("@/helpers.js", async (importOriginal) => {
  const mod = (await importOriginal()) as RecordWithUnknownValues;
  return {
    ...mod,
    confirmDestructiveAction: vi.fn().mockResolvedValue(true),
    navigateToDataPointsHistory: vi.fn(),
  };
});

vi.mock("@/lib/data/events-api", async (importOriginal) => {
  const mod = (await importOriginal()) as RecordWithUnknownValues;
  return {
    ...mod,
    fetchEvents: vi.fn().mockResolvedValue([]),
    deleteEvent: vi.fn().mockResolvedValue(undefined),
    updateEvent: vi.fn().mockResolvedValue(undefined),
  };
});

if (!customElements.get("hass-datapoints-list-card")) {
  customElements.define("hass-datapoints-list-card", HassRecordsListCard);
}

const mockEvents: EventRecord[] = [
  {
    id: "evt-1",
    message: "First event",
    annotation: null,
    icon: "mdi:bookmark",
    color: "#03a9f4",
    timestamp: "2026-03-31T10:00:00Z",
    entity_id: null,
    device_id: null,
    area_id: null,
    label_id: null,
    dev: false,
  },
  {
    id: "evt-2",
    message: "Second event",
    annotation: "Detailed note",
    icon: "mdi:star",
    color: "#ff5722",
    timestamp: "2026-03-31T09:00:00Z",
    entity_id: null,
    device_id: null,
    area_id: null,
    label_id: null,
    dev: false,
  },
];

function createCard(config: RecordWithUnknownValues = {}) {
  const el = document.createElement("hass-datapoints-list-card") as any;
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

function getEventItems(el: any) {
  return [...el.shadowRoot.querySelectorAll("list-event-item")] as Array<
    HTMLElement & { shadowRoot: ShadowRoot }
  >;
}

async function loadCard(
  config: RecordWithUnknownValues = {},
  events: EventRecord[] = []
) {
  vi.mocked(fetchEvents).mockResolvedValue(events as any);
  const el = createCard(config);
  el.hass = createMockHass();
  await el._load();
  await el.updateComplete;
  return el;
}

describe("list", () => {
  let el: any;

  afterEach(() => {
    el?.remove();
    vi.clearAllMocks();
  });

  describe("GIVEN a card with default config", () => {
    beforeEach(async () => {
      el = await loadCard({}, []);
    });

    describe("WHEN rendered", () => {
      it("THEN it has an ha-card wrapper", () => {
        expect(el.shadowRoot.querySelector("ha-card")).toBeTruthy();
      });

      it("THEN it shows a search bar by default", () => {
        expect(el.shadowRoot.querySelector("search-bar")).toBeTruthy();
      });

      it("THEN it shows the empty state", () => {
        expect(el.shadowRoot.textContent).toContain("No datapoints yet");
      });
    });
  });

  describe("GIVEN a card with show_search: false", () => {
    beforeEach(async () => {
      el = await loadCard({ show_search: false }, []);
    });

    describe("WHEN rendered", () => {
      it("THEN no search bar is shown", () => {
        expect(el.shadowRoot.querySelector("search-bar")).toBeNull();
      });
    });
  });

  describe("GIVEN a card with a title", () => {
    beforeEach(async () => {
      el = await loadCard({ title: "My Events" }, []);
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the title", () => {
        expect(el.shadowRoot.textContent).toContain("My Events");
      });
    });
  });

  describe("GIVEN a card with events loaded", () => {
    beforeEach(async () => {
      el = await loadCard({}, mockEvents);
    });

    describe("WHEN rendered", () => {
      it("THEN it shows the event messages", () => {
        const items = getEventItems(el);
        expect(items[0].shadowRoot.textContent).toContain("Second event");
        expect(items[1].shadowRoot.textContent).toContain("First event");
      });

      it("THEN no empty state is shown", () => {
        expect(el.shadowRoot.textContent).not.toContain("No datapoints yet");
      });
    });

    describe("WHEN an item emits a hover event", () => {
      it("THEN the card re-dispatches the panel hover event", async () => {
        expect.assertions(3);
        const handler = vi.fn();
        el.addEventListener("hass-datapoints-hover-event-record", handler);
        const item = getEventItems(el)[0];
        item.dispatchEvent(
          new CustomEvent("dp-hover-event-record", {
            bubbles: true,
            composed: true,
            detail: {
              eventId: "evt-2",
              hovered: true,
              eventRecord: mockEvents[1],
            },
          })
        );
        await el.updateComplete;
        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].detail.eventId).toBe("evt-2");
        expect(handler.mock.calls[0][0].detail.hovered).toBe(true);
      });
    });
  });

  describe("GIVEN a card with events and a search query matching one event", () => {
    beforeEach(async () => {
      el = await loadCard({}, mockEvents);
      el._searchQuery = "First";
      await el.updateComplete;
    });

    describe("WHEN the list is filtered", () => {
      it("THEN only matching events are shown", () => {
        const items = getEventItems(el);
        expect(items).toHaveLength(1);
        expect(items[0].shadowRoot.textContent).toContain("First event");
      });
    });
  });

  describe("GIVEN a card with more events than page_size", () => {
    beforeEach(async () => {
      const manyEvents = Array.from({ length: 5 }, (_, i) => ({
        ...mockEvents[0],
        id: `evt-${i}`,
        message: `Event ${i}`,
      }));
      el = await loadCard({ page_size: 2 }, manyEvents as any);
    });

    describe("WHEN rendered", () => {
      it("THEN pagination controls are shown", () => {
        expect(el.shadowRoot.querySelector("pagination-nav")).toBeTruthy();
      });
    });

    describe("WHEN the next page event fires", () => {
      it("THEN the page advances", async () => {
        const pagination = el.shadowRoot.querySelector("pagination-nav");
        pagination.dispatchEvent(
          new CustomEvent("dp-page-change", {
            detail: { page: 1 },
            bubbles: true,
            composed: true,
          })
        );
        await el.updateComplete;
        expect(el._page).toBe(1);
      });
    });
  });

  describe("GIVEN a card with a hidden event", () => {
    beforeEach(async () => {
      el = await loadCard({ hidden_event_ids: ["evt-1"] }, mockEvents);
    });

    describe("WHEN rendered", () => {
      it("THEN the hidden event item has the is-hidden class", async () => {
        expect.assertions(1);
        const items = getEventItems(el);
        const hiddenItem = items.find((item) =>
          item.shadowRoot.textContent?.includes("First event")
        )!;
        await (hiddenItem as any).updateComplete;
        expect(
          hiddenItem.shadowRoot
            .querySelector(".event-item")
            ?.classList.contains("is-hidden")
        ).toBe(true);
      });
    });

    describe("WHEN setConfig is called without the hidden id", () => {
      it("THEN the item is no longer hidden", async () => {
        expect.assertions(1);
        el.setConfig({ hidden_event_ids: [] });
        await el.updateComplete;
        const items = getEventItems(el);
        const item = items.find((row) =>
          row.shadowRoot.textContent?.includes("First event")
        )!;
        await (item as any).updateComplete;
        expect(
          item.shadowRoot
            .querySelector(".event-item")
            ?.classList.contains("is-hidden")
        ).toBe(false);
      });
    });
  });

  describe("GIVEN a card with fewer events than page_size", () => {
    beforeEach(async () => {
      el = await loadCard({ page_size: 10 }, mockEvents);
    });

    describe("WHEN rendered", () => {
      it("THEN no pagination controls are shown", () => {
        expect(el.shadowRoot.querySelector("pagination-nav")).toBeNull();
      });
    });
  });

  describe("GIVEN the static config methods", () => {
    describe("WHEN getStubConfig is called", () => {
      it("THEN it returns empty config", () => {
        expect(HassRecordsListCard.getStubConfig()).toEqual({});
      });
    });

    describe("WHEN getConfigElement is called", () => {
      it("THEN it returns the editor element tag", () => {
        const editorEl = HassRecordsListCard.getConfigElement();
        expect(editorEl.tagName.toLowerCase()).toBe(
          "hass-datapoints-list-card-editor"
        );
      });
    });
  });
});
