import { afterEach, describe, expect, it } from "vitest";
import { createMockHass } from "@/test-support/mock-hass";
import { HassRecordsHistoryCardEditor } from "../editor";

if (!customElements.get("hass-datapoints-history-card-editor")) {
  customElements.define(
    "hass-datapoints-history-card-editor",
    HassRecordsHistoryCardEditor
  );
}

function createEditor() {
  const el = document.createElement(
    "hass-datapoints-history-card-editor"
  ) as HassRecordsHistoryCardEditor;
  document.body.appendChild(el);
  el.hass = createMockHass();
  el.setConfig({
    entity: "sensor.temperature",
    series_settings: [
      {
        entity_id: "sensor.temperature",
        color: "#03a9f4",
        visible: true,
        analysis: {
          sample_interval: "1m",
          sample_aggregate: "mean",
          stepped_series: true,
        },
      },
    ],
  });
  return el;
}

describe("history editor", () => {
  let el: Nullable<HassRecordsHistoryCardEditor> = null;

  afterEach(() => {
    el?.remove();
    el = null;
  });

  it("THEN it renders the stepped series switch from the current analysis config", async () => {
    expect.assertions(2);

    el = createEditor();
    await el.updateComplete;

    const switches = Array.from(
      el.shadowRoot?.querySelectorAll("editor-switch") || []
    ) as Array<HTMLElement & { label?: string; checked?: boolean }>;
    const steppedSwitch = switches.find(
      (entry) => entry.label === "Stepped series"
    );

    expect(steppedSwitch).toBeTruthy();
    expect(steppedSwitch?.checked).toBe(true);
  });

  it("THEN it carries stepped series through config updates", async () => {
    expect.assertions(2);

    el = createEditor();
    await el.updateComplete;

    const switches = Array.from(
      el.shadowRoot?.querySelectorAll("editor-switch") || []
    ) as Array<HTMLElement & { label?: string }>;
    const steppedSwitch = switches.find(
      (entry) => entry.label === "Stepped series"
    );
    let emittedConfig: RecordWithUnknownValues | null = null;
    el.addEventListener("config-changed", (event: Event) => {
      emittedConfig = (
        event as CustomEvent<{ config: RecordWithUnknownValues }>
      ).detail.config;
    });

    steppedSwitch?.dispatchEvent(
      new CustomEvent("dp-switch-change", {
        detail: { checked: false },
        bubbles: true,
        composed: true,
      })
    );

    expect(emittedConfig).toBeTruthy();
    expect(
      (emittedConfig?.series_settings as Array<RecordWithUnknownValues>)?.[0]
        ?.analysis?.stepped_series
    ).toBe(false);
  });
});
