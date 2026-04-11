import type { ChipItem } from "@/lib/types";

export type TargetMap = {
  entity_id: string[];
  device_id: string[];
  area_id: string[];
  label_id: string[];
};

export type PartialTargetMap = Partial<TargetMap>;

export type ConfigChipItem = ChipItem;
