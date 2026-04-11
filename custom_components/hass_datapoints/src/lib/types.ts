/**
 * Shared domain types for atoms, molecules, and lib utilities.
 */

export interface HassStateAttributes {
  friendly_name?: string;
  icon?: string;
  unit_of_measurement?: string;
  device_class?: string;
  [key: string]: unknown;
}

export interface HassState {
  entity_id: string;
  state: string;
  attributes: HassStateAttributes;
  last_changed: string;
  last_updated: string;
}

export interface HassEntity {
  entity_id: string;
  device_id: Nullable<string>;
  area_id: Nullable<string>;
  labels: string[];
}

export interface HassDevice {
  id: string;
  name: string;
  area_id: Nullable<string>;
}

export interface HassArea {
  area_id: string;
  name: string;
}

export interface HassConnection {
  subscribeEvents(
    callback: (...args: unknown[]) => void,
    eventType: string
  ): Promise<() => void>;
  sendMessagePromise(message: RecordWithUnknownValues): Promise<unknown>;
}

export interface HassLike {
  states: Record<string, HassState>;
  entities: Record<string, HassEntity>;
  devices: Record<string, HassDevice>;
  areas: Record<string, HassArea>;
  connection: HassConnection;
  /** The currently logged-in HA user. */
  user?: { is_admin: boolean };
  /** Legacy system language — prefer locale.language for the user's UI language. */
  language?: string;
  /** User's locale preferences (HA 2022.3+). */
  locale?: { language?: string };
  callService(
    domain: string,
    service: string,
    data?: RecordWithUnknownValues
  ): Promise<void>;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SeriesItem {
  entityId: string;
  label: string;
  color: string;
  unit?: string;
}

export type ChipItemType = "entity" | "device" | "area" | "label";

export interface ChipItem {
  type: ChipItemType;
  id: string;
}

export interface EventRecord {
  id: string;
  message: string;
  annotation: Nullable<string>;
  icon: Nullable<string>;
  color: string;
  timestamp: string;
  entity_id: Nullable<string>;
  device_id: Nullable<string>;
  area_id: Nullable<string>;
  label_id: Nullable<string>;
  dev: boolean;
}

export type CardConfig = RecordWithUnknownValues;

export interface EventRecordFull extends EventRecord {
  entity_ids?: string[];
  device_ids?: string[];
  area_ids?: string[];
  label_ids?: string[];
  chart_value?: number;
  chart_unit?: string;
}

export interface HassStateEntry {
  s: string;
  lu: number;
  entity_id?: string;
}
