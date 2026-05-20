import { html } from "lit";
import { expect } from "@storybook/test";
import { setFrontendLocale } from "@/lib/i18n/localize";
import { createMockHass } from "@/test-support/mock-hass";
import "../anomaly-monitor-wizard";

type WizardElement = HTMLElement & {
  hass: unknown;
  open: boolean;
  prefillEntityIds: string[];
  prefillAnalysis: Record<string, unknown> | null;
  suggestedEntityIds: string[];
  allSeriesEntityIds: string[];
  _step: 1 | 2 | 3;
  _target: Record<string, unknown>;
  _entityIds: string[];
  _name: string;
  _monitorType: "individual" | "combined";
  updateComplete: Promise<boolean>;
};

const mockHass = createMockHass({
  states: {
    ...createMockHass().states,
    "sensor.co2": {
      entity_id: "sensor.co2",
      state: "812",
      attributes: {
        friendly_name: "CO2",
        icon: "mdi:molecule-co2",
        unit_of_measurement: "ppm",
      },
      last_changed: "2026-03-31T10:00:00Z",
      last_updated: "2026-03-31T10:00:00Z",
    },
    "sensor.pressure": {
      entity_id: "sensor.pressure",
      state: "1008",
      attributes: {
        friendly_name: "Pressure",
        icon: "mdi:gauge",
        unit_of_measurement: "hPa",
      },
      last_changed: "2026-03-31T10:00:00Z",
      last_updated: "2026-03-31T10:00:00Z",
    },
  },
  entities: {
    ...createMockHass().entities,
    "sensor.co2": {
      entity_id: "sensor.co2",
      device_id: "device_3",
      area_id: "area_3",
      labels: [],
    },
    "sensor.pressure": {
      entity_id: "sensor.pressure",
      device_id: "device_4",
      area_id: "area_4",
      labels: [],
    },
  },
  devices: {
    ...createMockHass().devices,
    device_3: {
      id: "device_3",
      name: "Office Sensor",
      area_id: "area_3",
    },
    device_4: {
      id: "device_4",
      name: "Barometer",
      area_id: "area_4",
    },
  },
});

function getWizard(canvasElement: HTMLElement): WizardElement {
  return canvasElement.querySelector("anomaly-monitor-wizard") as WizardElement;
}

export default {
  title: "Molecules/Anomaly Monitor Wizard",
  component: "anomaly-monitor-wizard",
  parameters: {
    actions: {
      handles: ["dp-monitor-wizard-close", "dp-monitor-wizard-saved"],
    },
  },
  loaders: [
    async () => {
      await setFrontendLocale("en");
      return {};
    },
  ],
};

export const DefaultCreateFlow = {
  render: () => html`
    <anomaly-monitor-wizard
      .hass=${mockHass}
      .open=${true}
      .prefillEntityIds=${["sensor.temperature"]}
      .prefillAnalysis=${{
        anomaly_methods: ["trend_residual"],
      }}
      .suggestedEntityIds=${[]}
      .allSeriesEntityIds=${["sensor.temperature"]}
    ></anomaly-monitor-wizard>
  `,
};

export const MultipleChartSeriesQuickAdd = {
  render: () => html`
    <anomaly-monitor-wizard
      .hass=${mockHass}
      .open=${true}
      .prefillEntityIds=${["sensor.temperature"]}
      .prefillAnalysis=${{
        anomaly_methods: ["trend_residual"],
      }}
      .suggestedEntityIds=${["sensor.humidity", "sensor.co2"]}
      .allSeriesEntityIds=${[
        "sensor.temperature",
        "sensor.humidity",
        "sensor.co2",
      ]}
    ></anomaly-monitor-wizard>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const wizard = getWizard(canvasElement);

    expect(wizard.shadowRoot?.textContent).toContain("Add from current chart");
    expect(
      wizard.shadowRoot?.textContent?.includes("Add all series from chart")
    ).toBe(true);
  },
};

export const ClearAndReaddAllSeries = {
  render: () => html`
    <anomaly-monitor-wizard
      .hass=${mockHass}
      .open=${true}
      .prefillEntityIds=${["sensor.temperature"]}
      .prefillAnalysis=${{
        anomaly_methods: ["trend_residual"],
      }}
      .suggestedEntityIds=${["sensor.humidity", "sensor.co2"]}
      .allSeriesEntityIds=${[
        "sensor.temperature",
        "sensor.humidity",
        "sensor.co2",
      ]}
    ></anomaly-monitor-wizard>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const wizard = getWizard(canvasElement);
    wizard._target = {};
    await wizard.updateComplete;

    const addAllBtn = Array.from(
      wizard.shadowRoot?.querySelectorAll("button") ?? []
    ).find((button) =>
      button.textContent?.includes("Add all series from chart")
    ) as HTMLButtonElement;

    addAllBtn.click();
    await wizard.updateComplete;

    expect(wizard._target).toEqual({
      entity_id: ["sensor.temperature", "sensor.humidity", "sensor.co2"],
    });
  },
};

export const CreateCtaVariants = {
  render: () => html`
    <div style="display: grid; gap: 24px;">
      <anomaly-monitor-wizard
        .hass=${mockHass}
        .open=${true}
        .prefillEntityIds=${["sensor.temperature"]}
        .prefillAnalysis=${{
          anomaly_methods: ["trend_residual"],
        }}
      ></anomaly-monitor-wizard>
      <anomaly-monitor-wizard
        .hass=${mockHass}
        .open=${true}
        .prefillEntityIds=${["sensor.temperature", "sensor.humidity"]}
        .prefillAnalysis=${{
          anomaly_methods: ["trend_residual"],
        }}
      ></anomaly-monitor-wizard>
    </div>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const wizards = Array.from(
      canvasElement.querySelectorAll("anomaly-monitor-wizard")
    ) as WizardElement[];
    const [singleWizard, multiWizard] = wizards;

    singleWizard._step = 3;
    singleWizard._entityIds = ["sensor.temperature"];
    singleWizard._name = "Temperature anomalies";

    multiWizard._step = 3;
    multiWizard._entityIds = ["sensor.temperature", "sensor.humidity"];
    multiWizard._monitorType = "individual";
    multiWizard._name = "Climate anomalies";

    await singleWizard.updateComplete;
    await multiWizard.updateComplete;

    expect(singleWizard.shadowRoot?.textContent).toContain(
      "Create anomaly monitor"
    );
    expect(multiWizard.shadowRoot?.textContent).toContain(
      "Create 2 anomaly monitors"
    );
  },
};
