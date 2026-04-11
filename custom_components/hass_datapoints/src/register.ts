/* eslint-disable no-console */
import { HassRecordsActionCard } from "@/cards/action/action";
import { HassRecordsActionCardEditor } from "@/cards/action/editor";
import { HassRecordsDevToolCard } from "@/cards/dev-tool/dev-tool";
import { HassRecordsDevToolCardEditor } from "@/cards/dev-tool/editor";
import { HassRecordsHistoryCard } from "@/cards/history/history";
import { HassRecordsHistoryCardEditor } from "@/cards/history/editor";
import { HassRecordsHistoryPanel } from "@/panels/datapoints/datapoints";
import { HassRecordsListCard } from "@/cards/list/list";
import { HassRecordsListCardEditor } from "@/cards/list/editor";
import { HassRecordsQuickCard } from "@/cards/quick/quick";
import { HassRecordsQuickCardEditor } from "@/cards/quick/editor";
import { HassRecordsSensorCard } from "@/cards/sensor/sensor";
import { HassRecordsSensorCardEditor } from "@/cards/sensor/editor";

interface LovelaceCardRegistration {
  type: string;
  name: string;
  description: string;
  preview: boolean;
}

declare global {
  interface Window {
    customCards?: LovelaceCardRegistration[];
  }
}

/**
 * Register all custom elements and advertise them to the Lovelace card picker.
 */

// ── Card elements ──────────────────────────────────────────────────────────
if (!customElements.get("hass-datapoints-action-card")) {
  customElements.define("hass-datapoints-action-card", HassRecordsActionCard);
}
if (!customElements.get("hass-datapoints-quick-card")) {
  customElements.define("hass-datapoints-quick-card", HassRecordsQuickCard);
}
if (!customElements.get("hass-datapoints-history-card")) {
  customElements.define("hass-datapoints-history-card", HassRecordsHistoryCard);
}
if (!customElements.get("hass-datapoints-sensor-card")) {
  customElements.define("hass-datapoints-sensor-card", HassRecordsSensorCard);
}
if (!customElements.get("hass-datapoints-list-card")) {
  customElements.define("hass-datapoints-list-card", HassRecordsListCard);
}
if (!customElements.get("hass-datapoints-history-panel")) {
  customElements.define(
    "hass-datapoints-history-panel",
    HassRecordsHistoryPanel
  );
}
if (!customElements.get("hass-datapoints-dev-tool-card")) {
  customElements.define(
    "hass-datapoints-dev-tool-card",
    HassRecordsDevToolCard
  );
}

// ── Editor elements ────────────────────────────────────────────────────────
if (!customElements.get("hass-datapoints-action-card-editor")) {
  customElements.define(
    "hass-datapoints-action-card-editor",
    HassRecordsActionCardEditor
  );
}
if (!customElements.get("hass-datapoints-quick-card-editor")) {
  customElements.define(
    "hass-datapoints-quick-card-editor",
    HassRecordsQuickCardEditor
  );
}
if (!customElements.get("hass-datapoints-history-card-editor")) {
  customElements.define(
    "hass-datapoints-history-card-editor",
    HassRecordsHistoryCardEditor
  );
}
if (!customElements.get("hass-datapoints-sensor-card-editor")) {
  customElements.define(
    "hass-datapoints-sensor-card-editor",
    HassRecordsSensorCardEditor
  );
}
if (!customElements.get("hass-datapoints-list-card-editor")) {
  customElements.define(
    "hass-datapoints-list-card-editor",
    HassRecordsListCardEditor
  );
}
if (!customElements.get("hass-datapoints-dev-tool-card-editor")) {
  customElements.define(
    "hass-datapoints-dev-tool-card-editor",
    HassRecordsDevToolCardEditor
  );
}

// ── Register in Lovelace custom cards list ─────────────────────────────────
window.customCards = window.customCards || [];
const registeredTypes = new Set(window.customCards.map((card) => card.type));
const cardsToAdd: LovelaceCardRegistration[] = [
  {
    type: "hass-datapoints-action-card",
    name: "Hass Records – Action Card",
    description:
      "Full form to record a custom event with message, annotation, icon, colour and entity association.",
    preview: false,
  },
  {
    type: "hass-datapoints-quick-card",
    name: "Hass Records – Quick Card",
    description:
      "Simple one-field card to quickly record a note with a bookmark icon.",
    preview: false,
  },
  {
    type: "hass-datapoints-history-card",
    name: "Hass Records – History Card",
    description:
      "History line chart with coloured annotation markers for recorded events.",
    preview: false,
  },
  {
    type: "hass-datapoints-sensor-card",
    name: "Hass Records – Sensor Card",
    description:
      "Sensor card with line chart — annotations shown as icons on the data line.",
    preview: false,
  },
  {
    type: "hass-datapoints-list-card",
    name: "Hass Records – List Card",
    description:
      "Activity-style datagrid to browse, search, edit and delete all recorded events.",
    preview: false,
  },
  {
    type: "hass-datapoints-dev-tool-card",
    name: "Hass Records – Dev Tool",
    description:
      "Generate demo datapoints from HA history and bulk-delete dev-flagged events.",
    preview: false,
  },
];
cardsToAdd.forEach((card) => {
  if (!registeredTypes.has(card.type)) {
    window.customCards?.push(card);
  }
});

const _devSyncId = import.meta.env.VITE_DEV_SYNC_ID as string | undefined;
console.groupCollapsed(
  `%c hass-datapoints %c v0.3.0 loaded${_devSyncId ? `%c %c DEV#${_devSyncId} ` : " "}`,
  "color:#fff;background:#03a9f4;font-weight:bold;padding:2px 6px;border-radius:3px 0 0 3px",
  "color:#03a9f4;background:#fff;font-weight:bold;padding:2px 6px;border:1px solid #03a9f4;border-radius:0 3px 3px 0",
  ...(_devSyncId
    ? [
        "background:transparent;",
        "color:#fff;background:#f57c00;font-weight:bold;padding:2px 6px;border-radius:3px",
      ]
    : [])
);
console.log(
  "Enable debug logging by setting %cwindow.__HASS_DATAPOINTS_DEV__ = true",
  "color:#333;background:#eee;border:1px solid #777;padding:2px 6px;border-radius:5px; font-family: Courier"
);
console.groupEnd();
