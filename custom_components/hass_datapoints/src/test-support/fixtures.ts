/**
 * Reusable test data for component tests.
 */

export const SAMPLE_EVENT = {
  id: "evt-001",
  message: "Turned on lights",
  annotation: "Manual override due to guests",
  icon: "mdi:lightbulb",
  color: "#ff9800",
  timestamp: "2026-03-31T08:15:00Z",
  entity_id: "light.living_room",
  device_id: "device_1",
  area_id: "area_1",
  label_id: null,
  dev: false,
};

export const SAMPLE_EVENTS = [
  SAMPLE_EVENT,
  {
    id: "evt-002",
    message: "Temperature spike",
    annotation: null,
    icon: "mdi:thermometer-alert",
    color: "#f44336",
    timestamp: "2026-03-31T09:30:00Z",
    entity_id: "sensor.temperature",
    device_id: "device_1",
    area_id: "area_1",
    label_id: null,
    dev: false,
  },
  {
    id: "evt-003",
    message: "Morning routine",
    annotation: "Automated via script",
    icon: "mdi:bookmark",
    color: "#4caf50",
    timestamp: "2026-03-31T07:00:00Z",
    entity_id: null,
    device_id: null,
    area_id: null,
    label_id: null,
    dev: false,
  },
];

export const SAMPLE_SERIES = [
  {
    entityId: "sensor.temperature",
    label: "Temperature",
    color: "#2196f3",
    unit: "°C",
  },
  {
    entityId: "sensor.humidity",
    label: "Humidity",
    color: "#4caf50",
    unit: "%",
  },
];

export const SAMPLE_HISTORY_DATA = {
  "sensor.temperature": [
    { s: "20.1", lu: 1711868400 },
    { s: "21.3", lu: 1711872000 },
    { s: "22.5", lu: 1711875600 },
    { s: "23.1", lu: 1711879200 },
    { s: "22.8", lu: 1711882800 },
  ],
  "sensor.humidity": [
    { s: "60", lu: 1711868400 },
    { s: "58", lu: 1711872000 },
    { s: "55", lu: 1711875600 },
    { s: "53", lu: 1711879200 },
    { s: "54", lu: 1711882800 },
  ],
};
