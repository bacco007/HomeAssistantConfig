export interface ChangeItem {
  timestamp: string;
  message: string;
  entity_id: string;
  icon: string;
  color: string;
}

export interface WindowConfig {
  id: number;
  label: string;
  startDt: string;
  endDt: string;
}

export interface WindowResult {
  id: number;
  label: string;
  startDt: string;
  endDt: string;
  changes: ChangeItem[];
  selected: number[];
}
