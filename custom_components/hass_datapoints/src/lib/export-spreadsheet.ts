import { entityName } from "@/lib/ha/entity-name";
import { fetchEvents } from "@/lib/data/events-api";
import { fetchHistoryDuringPeriod } from "@/lib/data/history-api";
import type { EventRecordFull, HassLike, HassStateEntry } from "@/lib/types";

interface HistoryStateEntry extends HassStateEntry {
  lc?: number;
  state?: string;
  last_changed?: string;
  last_updated?: string;
}

type HistoryResultShape =
  | Record<string, HistoryStateEntry[]>
  | HistoryStateEntry[][]
  | HistoryStateEntry[]
  | Nullable<{
      result?: Record<string, HistoryStateEntry[]> | HistoryStateEntry[][];
    }>
  | undefined;

interface SpreadsheetDownloadOptions {
  hass: HassLike;
  entityIds: string[];
  startTime: string | Nullable<number | Date>;
  endTime: string | Nullable<number | Date>;
  datapointScope?: string;
  filenamePrefix?: string;
}

interface WorkbookSheet {
  name: string;
  rows: string[][];
}

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeWorksheetName(name: unknown): string {
  const cleaned = String(name || "Sheet")
    .replace(/[\\/*?:[\]]/g, " ")
    .trim();
  return cleaned.slice(0, 31) || "Sheet";
}

function columnNumberToName(index: number): string {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function toIsoString(
  value: string | number | Nullable<Date> | undefined
): string {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

function normalizeHistoryTimestamp(rawTimestamp: unknown): Nullable<number> {
  if (typeof rawTimestamp === "number") {
    if (rawTimestamp > 1e11) {
      return rawTimestamp;
    }
    return rawTimestamp * 1000;
  }
  const timestamp = new Date(
    (rawTimestamp as string | number | undefined) ?? 0
  ).getTime();
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  return timestamp;
}

function getHistoryStatesForEntity(
  entityId: string,
  histResult: HistoryResultShape,
  entityIds: string[]
): HistoryStateEntry[] {
  if (!histResult) {
    return [];
  }
  const asRecord = histResult as Record<string, HistoryStateEntry[]>;
  if (
    typeof histResult === "object" &&
    !Array.isArray(histResult) &&
    Array.isArray(asRecord?.[entityId])
  ) {
    return asRecord[entityId];
  }
  if (Array.isArray(histResult)) {
    const entityIndex = entityIds.indexOf(entityId);
    if (entityIndex >= 0 && Array.isArray(histResult[entityIndex])) {
      return histResult[entityIndex] as HistoryStateEntry[];
    }
    if (
      histResult.every(
        (entry) => entry && typeof entry === "object" && !Array.isArray(entry)
      )
    ) {
      return (histResult as HistoryStateEntry[]).filter(
        (entry) => entry.entity_id === entityId
      );
    }
  }
  if (histResult && typeof histResult === "object") {
    const withResult = histResult as {
      result?: Record<string, HistoryStateEntry[]> | HistoryStateEntry[][];
    };
    if (
      Array.isArray(
        (
          withResult.result as Record<string, HistoryStateEntry[]> | undefined
        )?.[entityId]
      )
    ) {
      return (withResult.result as Record<string, HistoryStateEntry[]>)[
        entityId
      ];
    }
    if (Array.isArray(withResult.result)) {
      const entityIndex = entityIds.indexOf(entityId);
      if (
        entityIndex >= 0 &&
        Array.isArray((withResult.result as HistoryStateEntry[][])[entityIndex])
      ) {
        return (withResult.result as HistoryStateEntry[][])[entityIndex];
      }
    }
  }
  return [];
}

function createWorksheetXml(rows: string[][]): string {
  const rowXml = rows
    .map((row, rowIndex) => {
      const cellXml = row
        .map((cell, cellIndex) => {
          const cellRef = `${columnNumberToName(cellIndex)}${rowIndex + 1}`;
          const styleAttribute = rowIndex === 0 ? ' s="1"' : "";
          return `<c r="${cellRef}" t="inlineStr"${styleAttribute}><is><t>${escapeXml(cell)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cellXml}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function createWorkbookXml(sheets: WorkbookSheet[]): string {
  const sheetXml = sheets
    .map(
      (sheet, index) =>
        `<sheet name="${escapeXml(sanitizeWorksheetName(sheet.name))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetXml}</sheets>
</workbook>`;
}

function createWorkbookRelsXml(sheets: WorkbookSheet[]): string {
  const relXml = sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relXml}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function createRootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function createStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <name val="Calibri"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;
}

function createContentTypesXml(sheets: WorkbookSheet[]): string {
  const overrides = sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${overrides}
</Types>`;
}

/* eslint-disable no-bitwise */
function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      if ((value & 1) === 1) {
        value = 0xedb88320 ^ (value >>> 1);
      } else {
        value >>>= 1;
      }
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCrc32Table();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
/* eslint-enable no-bitwise */

function createZip(entries: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  }

  const centralDirectorySize = centralParts.reduce(
    (sum, part) => sum + part.length,
    0
  );
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralDirectorySize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  return new Blob(
    [
      ...(localParts as BlobPart[]),
      ...(centralParts as BlobPart[]),
      endRecord as unknown as BlobPart,
    ],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );
}

function downloadWorkbook(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function createCombinedRows(
  hass: HassLike,
  entityIds: string[],
  histResult: HistoryResultShape,
  events: EventRecordFull[]
): string[][] {
  const entityColumns = entityIds.map((entityId) => {
    const stateObj = hass?.states?.[entityId];
    const unit = stateObj?.attributes?.unit_of_measurement || "";
    const name = entityName(hass, entityId) || entityId;
    return {
      entityId,
      unit,
      header: `${name} (${entityId})`,
    };
  });
  const rows: string[][] = [
    [
      "Timestamp",
      ...entityColumns.map((column) => column.header),
      "Datapoint Message",
      "Datapoint Annotation",
      "Datapoint Icon",
      "Datapoint Color",
      "Datapoint Entity IDs",
      "Datapoint Device IDs",
      "Datapoint Area IDs",
      "Datapoint Label IDs",
    ],
  ];
  const timestampMap = new Map<
    number,
    Map<string, string | EventRecordFull[]>
  >();

  for (const column of entityColumns) {
    const states = getHistoryStatesForEntity(
      column.entityId,
      histResult,
      entityIds
    );
    for (const state of states) {
      const timestamp = normalizeHistoryTimestamp(
        state?.lu ?? state?.lc ?? state?.last_changed ?? state?.last_updated
      );
      if (timestamp == null || !Number.isFinite(timestamp)) {
        continue;
      }
      const rawValue = state?.s ?? state?.state ?? "";
      const displayValue = column.unit
        ? `${rawValue} ${column.unit}`
        : `${rawValue}`;
      if (!timestampMap.has(timestamp)) {
        timestampMap.set(timestamp, new Map());
      }
      timestampMap.get(timestamp)?.set(column.entityId, displayValue);
    }
  }

  for (const event of events || []) {
    const timestamp = normalizeHistoryTimestamp(event?.timestamp);
    if (timestamp == null || !Number.isFinite(timestamp)) {
      continue;
    }
    if (!timestampMap.has(timestamp)) {
      timestampMap.set(timestamp, new Map());
    }
    const rowMap = timestampMap.get(timestamp);
    rowMap?.set("__datapoints__", [
      ...((rowMap?.get("__datapoints__") as EventRecordFull[]) || []),
      event,
    ]);
  }

  const sortedTimestamps = [...timestampMap.keys()].sort(
    (left, right) => left - right
  );
  for (const timestamp of sortedTimestamps) {
    const rowValues = timestampMap.get(timestamp);
    const datapointEvents =
      (rowValues?.get("__datapoints__") as EventRecordFull[]) || [];
    rows.push([
      toIsoString(timestamp),
      ...entityColumns.map((column) =>
        String(rowValues?.get(column.entityId) || "")
      ),
      datapointEvents
        .map((event) => event?.message || "")
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) => event?.annotation || "")
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) => event?.icon || "")
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) => event?.color || "")
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) =>
          Array.isArray(event?.entity_ids) ? event.entity_ids.join(", ") : ""
        )
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) =>
          Array.isArray(event?.device_ids) ? event.device_ids.join(", ") : ""
        )
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) =>
          Array.isArray(event?.area_ids) ? event.area_ids.join(", ") : ""
        )
        .filter(Boolean)
        .join("\n"),
      datapointEvents
        .map((event) =>
          Array.isArray(event?.label_ids) ? event.label_ids.join(", ") : ""
        )
        .filter(Boolean)
        .join("\n"),
    ]);
  }

  return rows;
}

function buildFilename(
  prefix: string,
  startTime: string | number | Nullable<Date> | undefined,
  endTime: string | number | Nullable<Date> | undefined
): string {
  const start = toIsoString(startTime).replace(/[:]/g, "-");
  const end = toIsoString(endTime).replace(/[:]/g, "-");
  return `${prefix}-${start}-to-${end}.xlsx`;
}

export async function downloadHistorySpreadsheet({
  hass,
  entityIds,
  startTime,
  endTime,
  datapointScope,
  filenamePrefix = "data-points-history",
}: SpreadsheetDownloadOptions): Promise<void> {
  const startIso = toIsoString(startTime);
  const endIso = toIsoString(endTime);
  const normalizedEntityIds = Array.isArray(entityIds)
    ? entityIds.filter(Boolean)
    : [];
  const eventEntityFilter =
    datapointScope === "all" ? undefined : normalizedEntityIds;

  const [histResult, events] = await Promise.all([
    fetchHistoryDuringPeriod<HistoryResultShape>(
      hass,
      startIso,
      endIso,
      normalizedEntityIds,
      {
        include_start_time_state: true,
        significant_changes_only: false,
        no_attributes: true,
      }
    ),
    fetchEvents<EventRecordFull>(hass, startIso, endIso, eventEntityFilter),
  ]);

  const sheets: WorkbookSheet[] = [
    {
      name: "History Export",
      rows: createCombinedRows(hass, normalizedEntityIds, histResult, events),
    },
  ];
  const workbookBlob = createZip([
    {
      name: "[Content_Types].xml",
      content: createContentTypesXml(sheets),
    },
    {
      name: "_rels/.rels",
      content: createRootRelsXml(),
    },
    {
      name: "xl/workbook.xml",
      content: createWorkbookXml(sheets),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: createWorkbookRelsXml(sheets),
    },
    {
      name: "xl/styles.xml",
      content: createStylesXml(),
    },
    ...sheets.map((sheet, index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      content: createWorksheetXml(sheet.rows),
    })),
  ]);

  downloadWorkbook(
    buildFilename(filenamePrefix, startTime, endTime),
    workbookBlob
  );
}
