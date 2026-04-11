import type { EventRecord, HassLike } from "@/lib/types";

export interface EventRecordFull extends EventRecord {
  entity_ids?: string[];
  device_ids?: string[];
  area_ids?: string[];
  label_ids?: string[];
}

export interface EventItemLanguage {
  showAnnotation: string;
  openHistory: string;
  editRecord: string;
  deleteRecord: string;
  showChartMarker: string;
  hideChartMarker: string;
  chooseColor: string;
  save: string;
  cancel: string;
  message: string;
  annotationFullMessage: string;
}

export interface EditSaveDetail {
  message: string;
  annotation: string;
  icon: string;
  color: string;
}

export interface EventItemContext {
  hass: Nullable<HassLike>;
  showActions: boolean;
  /** Whether the current user may edit or delete records (admin-only). */
  canEdit: boolean;
  showEntities: boolean;
  showFullMessage: boolean;
  hidden: boolean;
  editing: boolean;
  editColor: string;
  language: EventItemLanguage;
}
