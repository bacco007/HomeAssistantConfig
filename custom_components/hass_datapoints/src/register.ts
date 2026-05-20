/* eslint-disable no-console, max-classes-per-file */
import { HassDatapointsActionCard } from "@/cards/action/action";
import { HassDatapointsActionCardEditor } from "@/cards/action/editor";
import { HassDatapointsDevToolCard } from "@/cards/dev-tool/dev-tool";
import { HassDatapointsDevToolCardEditor } from "@/cards/dev-tool/editor";
import { HassDatapointsHistoryCard } from "@/cards/history/history";
import { HassDatapointsHistoryCardEditor } from "@/cards/history/editor";
import { HassDatapointsHistoryPanel } from "@/panels/datapoints/datapoints";
import { HassDatapointsListCard } from "@/cards/list/list";
import { HassDatapointsListCardEditor } from "@/cards/list/editor";
import { HassDatapointsQuickCard } from "@/cards/quick/quick";
import { HassDatapointsQuickCardEditor } from "@/cards/quick/editor";
import { HassDatapointsSensorCard } from "@/cards/sensor/sensor";
import { HassDatapointsSensorCardEditor } from "@/cards/sensor/editor";
import type { CardConfig } from "@/lib/types";

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

// ── Deprecated element aliases (backwards compat) ───────────────────────────

const _warnOnceKey = "__HASS_DATAPOINTS_DEPRECATED_TAG_WARNED__";
function _warnDeprecatedTag(oldTag: string, newTag: string): void {
  const win = window as unknown as Record<string, unknown>;
  if (!win[_warnOnceKey]) {
    win[_warnOnceKey] = {};
  }
  const warned = win[_warnOnceKey] as Record<string, boolean>;
  if (warned[oldTag]) {
    return;
  }
  warned[oldTag] = true;

  console.warn(
    `[hass-datapoints] deprecated card tag "${oldTag}" in use; migrate to "${newTag}".`
  );
}

function _defineDeprecatedAlias<T extends CustomElementConstructor>({
  oldTag,
  newTag,
  base,
}: {
  oldTag: string;
  newTag: string;
  base: T;
}): void {
  if (customElements.get(oldTag)) {
    return;
  }

  class DeprecatedAlias extends (base as unknown as CustomElementConstructor) {
    constructor() {
      super();
      _warnDeprecatedTag(oldTag, newTag);
    }
  }
  customElements.define(oldTag, DeprecatedAlias);
}

class HassDatapointsRemovedStatisticsCard extends HTMLElement {
  private _config: CardConfig = {};

  setConfig(config: CardConfig): void {
    this._config = config ?? {};
    this._render();
  }

  set hass(_hass: import("@/lib/types").HassLike) {
    // noop; exists so HA doesn't error when assigning hass.
  }

  connectedCallback(): void {
    this._render();
  }

  private _render(): void {
    const title =
      ((this._config as unknown as Record<string, unknown>)?.title as
        | string
        | undefined) || "Statistics card";
    this.innerHTML = `
      <ha-card>
        <div class="card-header">${title}</div>
        <div class="card-content">
          <p>
            Datapoints statistics card removed.
            Use <code>custom:hass-datapoints-history-card</code> instead.
          </p>
          <p>
            Deprecated types: <code>custom:hass-datapoints-statistics-card</code>,
            <code>custom:hass-records-statistics-card</code>.
          </p>
        </div>
      </ha-card>
    `;
  }
}

class HassDatapointsRemovedStatisticsCardEditor extends HTMLElement {
  setConfig(_config: CardConfig): void {
    this._render();
  }

  set hass(_hass: import("@/lib/types").HassLike) {
    // noop
  }

  connectedCallback(): void {
    this._render();
  }

  private _render(): void {
    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <p>
            Datapoints statistics card removed.
            Replace with <code>custom:hass-datapoints-history-card</code>.
          </p>
        </div>
      </ha-card>
    `;
  }
}

// ── Card elements ──────────────────────────────────────────────────────────
if (!customElements.get("hass-datapoints-action-card")) {
  customElements.define(
    "hass-datapoints-action-card",
    HassDatapointsActionCard
  );
}
if (!customElements.get("hass-datapoints-quick-card")) {
  customElements.define("hass-datapoints-quick-card", HassDatapointsQuickCard);
}
if (!customElements.get("hass-datapoints-history-card")) {
  customElements.define(
    "hass-datapoints-history-card",
    HassDatapointsHistoryCard
  );
}
if (!customElements.get("hass-datapoints-sensor-card")) {
  customElements.define(
    "hass-datapoints-sensor-card",
    HassDatapointsSensorCard
  );
}
if (!customElements.get("hass-datapoints-list-card")) {
  customElements.define("hass-datapoints-list-card", HassDatapointsListCard);
}
if (!customElements.get("hass-datapoints-history-panel")) {
  customElements.define(
    "hass-datapoints-history-panel",
    HassDatapointsHistoryPanel
  );
}
if (!customElements.get("hass-datapoints-dev-tool-card")) {
  customElements.define(
    "hass-datapoints-dev-tool-card",
    HassDatapointsDevToolCard
  );
}

// ── Backwards compat: hass-records-* tags ───────────────────────────────────
// These were used by Hass Records versions; keep working for existing dashboards.
_defineDeprecatedAlias({
  oldTag: "hass-records-action-card",
  newTag: "hass-datapoints-action-card",
  base: HassDatapointsActionCard,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-quick-card",
  newTag: "hass-datapoints-quick-card",
  base: HassDatapointsQuickCard,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-history-card",
  newTag: "hass-datapoints-history-card",
  base: HassDatapointsHistoryCard,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-sensor-card",
  newTag: "hass-datapoints-sensor-card",
  base: HassDatapointsSensorCard,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-list-card",
  newTag: "hass-datapoints-list-card",
  base: HassDatapointsListCard,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-dev-tool-card",
  newTag: "hass-datapoints-dev-tool-card",
  base: HassDatapointsDevToolCard,
});

// ── Backwards compat: removed statistics card ───────────────────────────────
if (!customElements.get("hass-datapoints-statistics-card")) {
  customElements.define(
    "hass-datapoints-statistics-card",
    HassDatapointsRemovedStatisticsCard
  );
}
if (!customElements.get("hass-records-statistics-card")) {
  class HassRecordsRemovedStatisticsCard extends HassDatapointsRemovedStatisticsCard {
    constructor() {
      super();
      _warnDeprecatedTag(
        "hass-records-statistics-card",
        "hass-datapoints-history-card"
      );
    }
  }
  customElements.define(
    "hass-records-statistics-card",
    HassRecordsRemovedStatisticsCard
  );
}

// ── Editor elements ────────────────────────────────────────────────────────
if (!customElements.get("hass-datapoints-action-card-editor")) {
  customElements.define(
    "hass-datapoints-action-card-editor",
    HassDatapointsActionCardEditor
  );
}
if (!customElements.get("hass-datapoints-quick-card-editor")) {
  customElements.define(
    "hass-datapoints-quick-card-editor",
    HassDatapointsQuickCardEditor
  );
}
if (!customElements.get("hass-datapoints-history-card-editor")) {
  customElements.define(
    "hass-datapoints-history-card-editor",
    HassDatapointsHistoryCardEditor
  );
}
if (!customElements.get("hass-datapoints-sensor-card-editor")) {
  customElements.define(
    "hass-datapoints-sensor-card-editor",
    HassDatapointsSensorCardEditor
  );
}
if (!customElements.get("hass-datapoints-list-card-editor")) {
  customElements.define(
    "hass-datapoints-list-card-editor",
    HassDatapointsListCardEditor
  );
}
if (!customElements.get("hass-datapoints-dev-tool-card-editor")) {
  customElements.define(
    "hass-datapoints-dev-tool-card-editor",
    HassDatapointsDevToolCardEditor
  );
}

// ── Backwards compat editors: hass-records-* ────────────────────────────────
_defineDeprecatedAlias({
  oldTag: "hass-records-action-card-editor",
  newTag: "hass-datapoints-action-card-editor",
  base: HassDatapointsActionCardEditor,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-quick-card-editor",
  newTag: "hass-datapoints-quick-card-editor",
  base: HassDatapointsQuickCardEditor,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-history-card-editor",
  newTag: "hass-datapoints-history-card-editor",
  base: HassDatapointsHistoryCardEditor,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-sensor-card-editor",
  newTag: "hass-datapoints-sensor-card-editor",
  base: HassDatapointsSensorCardEditor,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-list-card-editor",
  newTag: "hass-datapoints-list-card-editor",
  base: HassDatapointsListCardEditor,
});
_defineDeprecatedAlias({
  oldTag: "hass-records-dev-tool-card-editor",
  newTag: "hass-datapoints-dev-tool-card-editor",
  base: HassDatapointsDevToolCardEditor,
});

// ── Backwards compat editor: removed statistics card ────────────────────────
if (!customElements.get("hass-datapoints-statistics-card-editor")) {
  customElements.define(
    "hass-datapoints-statistics-card-editor",
    HassDatapointsRemovedStatisticsCardEditor
  );
}
if (!customElements.get("hass-records-statistics-card-editor")) {
  class HassRecordsRemovedStatisticsCardEditor extends HassDatapointsRemovedStatisticsCardEditor {
    constructor() {
      super();
      _warnDeprecatedTag(
        "hass-records-statistics-card-editor",
        "hass-datapoints-history-card"
      );
    }
  }
  customElements.define(
    "hass-records-statistics-card-editor",
    HassRecordsRemovedStatisticsCardEditor
  );
}

// ── Register in Lovelace custom cards list ─────────────────────────────────
window.customCards = window.customCards || [];
const registeredTypes = new Set(window.customCards.map((card) => card.type));
const cardsToAdd: LovelaceCardRegistration[] = [
  {
    type: "hass-datapoints-action-card",
    name: "Datapoints – Action Card",
    description:
      "Full form to record a custom event with message, annotation, icon, colour and entity association.",
    preview: false,
  },
  {
    type: "hass-datapoints-quick-card",
    name: "Datapoints – Quick Card",
    description:
      "Simple one-field card to quickly record a note with a bookmark icon.",
    preview: false,
  },
  {
    type: "hass-datapoints-history-card",
    name: "Datapoints – History Card",
    description:
      "History line chart with coloured annotation markers for recorded events.",
    preview: false,
  },
  {
    type: "hass-datapoints-sensor-card",
    name: "Datapoints – Sensor Card",
    description:
      "Sensor card with line chart — annotations shown as icons on the data line.",
    preview: false,
  },
  {
    type: "hass-datapoints-list-card",
    name: "Datapoints – List Card",
    description:
      "Activity-style datagrid to browse, search, edit and delete all recorded events.",
    preview: false,
  },
  {
    type: "hass-datapoints-dev-tool-card",
    name: "Datapoints – Dev Tool",
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
