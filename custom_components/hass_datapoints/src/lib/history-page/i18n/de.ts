import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "entity_id={0}": "entity_id={0}",
  "device_id={0}": "device_id={0}",
  "area_id={0}": "area_id={0}",
  "label_id={0}": "label_id={0}",
  none: "keine",
  "Entity metadata:": "Entitätsmetadaten:",
  "Snapshot range label:": "Bezeichnung des Snapshot-Bereichs:",
  "main range": "Hauptbereich",
  "Correlated anomaly highlighting enabled in chart:":
    "Hervorhebung korrelierter Anomalien im Diagramm aktiviert:",
  yes: "ja",
  no: "nein",
  "Current anomaly overlap mode:": "Aktueller Anomalie-Überlappungsmodus:",
  "Correlated anomaly periods across the selected datapoints:":
    "Korrelierte Anomaliezeiträume über die ausgewählten Datenpunkte hinweg:",
  "Entity findings:": "Entitätsbefunde:",
  "Detected clusters in current range:":
    "Erkannte Cluster im aktuellen Bereich:",
  "Displayed clusters under the current overlap/correlation mode:":
    "Angezeigte Cluster im aktuellen Überlappungs-/Korrelationsmodus:",
  "All detected anomaly cluster details:":
    "Details aller erkannten Anomaliecluster:",
  "Displayed anomaly cluster details:":
    "Details der angezeigten Anomaliecluster:",
  "Entity:": "Entität:",
  "Display name:": "Anzeigename:",
  "Visible in panel:": "Im Panel sichtbar:",
  "Anomaly analysis: disabled in the current panel configuration.":
    "Anomalieanalyse: in der aktuellen Panel-Konfiguration deaktiviert.",
  "Anomaly analysis: enabled.": "Anomalieanalyse: aktiviert.",
  "Backend anomaly query inputs:": "Eingaben für die Backend-Anomalieabfrage:",
  "Raw history query inputs:": "Eingaben für die Rohverlaufsabfrage:",
  "Comparison window reference:": "Referenz des Vergleichsfensters:",
  "Comparison window raw history query inputs:":
    "Eingaben für die Rohverlaufsabfrage des Vergleichsfensters:",
  "Comparison window anomaly query inputs:":
    "Eingaben für die Anomalieabfrage des Vergleichsfensters:",
  "Comparison window detail: the configured comparison window is not currently selected, so use the window id above to resolve the saved date window before querying.":
    "Detail zum Vergleichsfenster: Das konfigurierte Vergleichsfenster ist derzeit nicht ausgewählt. Verwende daher vor der Abfrage die oben genannte Fenster-ID, um das gespeicherte Datumsfenster aufzulösen.",
  "Baseline comparison entity:": "Entität für den Basisvergleich:",
  "RELEVANT PERSISTED MONITORS": "RELEVANTE GESPEICHERTE MONITORE",
  "No persisted anomaly monitors intersect the currently selected entities.":
    "Keine gespeicherten Anomaliemonitore überschneiden sich mit den aktuell ausgewählten Entitäten.",
  "Monitor: {0} ({1})": "Monitor: {0} ({1})",
  "Type:": "Typ:",
  "Enabled:": "Aktiviert:",
  "Entities:": "Entitäten:",
  "Monitor anomaly query inputs:": "Eingaben für die Monitor-Anomalieabfrage:",
  "AI QUERY BRIEF: HOME ASSISTANT DATAPOINTS PANEL":
    "KI-ABFRAGEKURZFASSUNG: HOME ASSISTANT DATAPOINTS PANEL",
  OBJECTIVE: "ZIEL",
  "SUCCESS CRITERIA": "ERFOLGSKRITERIEN",
  "RETRIEVAL PRIORITY": "ABRUFPRIORITÄT",
  "PANEL CONTEXT": "PANELKONTEXT",
  "Selected entity ids:": "Ausgewählte Entitäts-IDs:",
  "(none selected)": "(keine ausgewählt)",
  "Raw target selection summary:": "Zusammenfassung der rohen Zielauswahl:",
  "Datapoint scope:": "Datenpunktbereich:",
  "Main range start_time:": "start_time des Hauptbereichs:",
  "(not set)": "(nicht gesetzt)",
  "Main range end_time:": "end_time des Hauptbereichs:",
  "Committed zoom start_time:": "start_time des bestätigten Zooms:",
  "Committed zoom end_time:": "end_time des bestätigten Zooms:",
  "Selected comparison window id:": "ID des ausgewählten Vergleichsfensters:",
  "(none)": "(keines)",
  "Comparison windows:": "Vergleichsfenster:",
  "Chart anomaly overlap mode:": "Anomalie-Überlappungsmodus des Diagramms:",
  "RANGE / RETENTION NOTE": "HINWEIS ZU BEREICH / AUFBEWAHRUNG",
  "QUERY RULES": "ABFRAGEREGELN",
  "RAW TARGET SELECTION OBJECT": "ROHES ZIELAUSWAHLOBJEKT",
  "AVAILABLE COMPARISON WINDOWS": "VERFÜGBARE VERGLEICHSFENSTER",
  "PER-ENTITY QUERY DETAILS": "ABFRAGEDETAILS PRO ENTITÄT",
  "RECOMMENDED OUTPUT": "EMPFOHLENE AUSGABE",
  "If raw recorder history is incomplete or unavailable, fetch Home Assistant statistics for continuity and call out the retention boundary explicitly.":
    "If raw recorder history is incomplete or unavailable, fetch Home Assistant statistics for continuity and call out the retention boundary explicitly.",
  "The requested window spans about {0} days. Short-retention raw history may not fully cover this range, so use Home Assistant statistics for older or missing portions and do not infer 'no anomalies' from retention gaps.":
    "The requested window spans about {0} days. Short-retention raw history may not fully cover this range, so use Home Assistant statistics for older or missing portions and do not infer 'no anomalies' from retention gaps.",
  "Use raw recorder history first for this range. If raw history is incomplete or unavailable, fetch Home Assistant statistics and explain any retention or recorder gaps.":
    "Use raw recorder history first for this range. If raw history is incomplete or unavailable, fetch Home Assistant statistics and explain any retention or recorder gaps.",
  "CURRENT RANGE ANOMALY FINDINGS": "CURRENT RANGE ANOMALY FINDINGS",
  "Current anomaly findings are not available from the active chart state, so use the query inputs below to fetch and inspect anomaly clusters directly.":
    "Current anomaly findings are not available from the active chart state, so use the query inputs below to fetch and inspect anomaly clusters directly.",
  "No entity-level anomaly findings are currently available from the active chart snapshot.":
    "No entity-level anomaly findings are currently available from the active chart snapshot.",
  "If your Home Assistant tooling requires explicit baseline range inputs, use the same start/end range as the main anomaly query unless a more specific monitor or MCP tool requires otherwise.":
    "If your Home Assistant tooling requires explicit baseline range inputs, use the same start/end range as the main anomaly query unless a more specific monitor or MCP tool requires otherwise.",
  "Fetch the underlying Home Assistant history or statistics, entity metadata, and hass_datapoints anomaly detail needed to inspect the currently selected datapoints. Do not treat this brief as the raw data itself.":
    "Fetch the underlying Home Assistant history or statistics, entity metadata, and hass_datapoints anomaly detail needed to inspect the currently selected datapoints. Do not treat this brief as the raw data itself.",
  "- Resolve entity metadata context for each selected entity.":
    "- Resolve entity metadata context for each selected entity.",
  "- Fetch raw or best-available historical coverage for the requested range.":
    "- Fetch raw or best-available historical coverage for the requested range.",
  "- Reproduce hass_datapoints anomaly queries with the exact panel settings below.":
    "- Reproduce hass_datapoints anomaly queries with the exact panel settings below.",
  "- Review current-range anomaly findings from this integration, including cross-entity correlated anomaly periods when present.":
    "- Review current-range anomaly findings from this integration, including cross-entity correlated anomaly periods when present.",
  "- Call out any retention, sampling, permission, or monitor-lookup limitations.":
    "- Call out any retention, sampling, permission, or monitor-lookup limitations.",
  "1. Resolve entity metadata first so area, device, platform, labels, and unit context are known before interpretation.":
    "1. Resolve entity metadata first so area, device, platform, labels, and unit context are known before interpretation.",
  "2. Fetch raw recorder history for the requested range where available.":
    "2. Fetch raw recorder history for the requested range where available.",
  "3. If raw history is incomplete, unavailable, or truncated by retention, fetch Home Assistant statistics for continuity.":
    "3. If raw history is incomplete, unavailable, or truncated by retention, fetch Home Assistant statistics for continuity.",
  "4. Reproduce the hass_datapoints anomaly queries exactly as listed below.":
    "4. Reproduce the hass_datapoints anomaly queries exactly as listed below.",
  "5. Because anomaly analysis may use sampled data, compare raw history for ground truth against sampled series for anomaly reproduction.":
    "5. Because anomaly analysis may use sampled data, compare raw history for ground truth against sampled series for anomaly reproduction.",
  "6. Review the current anomaly findings already found by this integration in the active range and use them to guide deeper inspection.":
    "6. Review the current anomaly findings already found by this integration in the active range and use them to guide deeper inspection.",
  "7. If monitor context is available, fetch relevant monitor anomaly output for additional persisted monitor detail.":
    "7. If monitor context is available, fetch relevant monitor anomaly output for additional persisted monitor detail.",
  "- Use UTC timestamps exactly as written for retrieval.":
    "- Use UTC timestamps exactly as written for retrieval.",
  "- Convert to the Home Assistant local timezone only when interpreting daily or weekly behavior patterns.":
    "- Convert to the Home Assistant local timezone only when interpreting daily or weekly behavior patterns.",
  "- Do not infer 'no anomaly' from missing raw history when retention may be limited.":
    "- Do not infer 'no anomaly' from missing raw history when retention may be limited.",
  "- If anomaly queries below use sampled data, inspect both raw history and the sampled representation.":
    "- If anomaly queries below use sampled data, inspect both raw history and the sampled representation.",
  "- For long ranges, remember HA history pagination and retention constraints can change what raw coverage is available.":
    "- For long ranges, remember HA history pagination and retention constraints can change what raw coverage is available.",
  "No selected entities are currently available in the panel state.":
    "No selected entities are currently available in the panel state.",
  "- Resolved metadata per selected entity, including unit, device class, state class, area, device, labels, and platform when available.":
    "- Resolved metadata per selected entity, including unit, device class, state class, area, device, labels, and platform when available.",
  "- Coverage status of raw history versus statistics, including any retention or pagination limits encountered.":
    "- Coverage status of raw history versus statistics, including any retention or pagination limits encountered.",
  "- Detailed anomaly findings per entity for the requested range, using the current integration findings above plus any fetched raw cluster detail.":
    "- Detailed anomaly findings per entity for the requested range, using the current integration findings above plus any fetched raw cluster detail.",
  "- If anomalies indicate some type of event, zoom out and look for answers in the related area/group/labels or across other entities in the panel. If anomalies are unexpected, look for any subtle metadata clues that could explain them, such as a device class or state class that implies a different expected behavior pattern than initially assumed.":
    "- If anomalies indicate some type of event, zoom out and look for answers in the related area/group/labels or across other entities in the panel. If anomalies are unexpected, look for any subtle metadata clues that could explain them, such as a device class or state class that implies a different expected behavior pattern than initially assumed.",
  "- Correlated anomaly periods across the selected datapoints, if any are present, including which entities participate and when the overlap occurs.":
    "- Correlated anomaly periods across the selected datapoints, if any are present, including which entities participate and when the overlap occurs.",
  "- Any monitor-access, permission, sampling, comparison-window, or data-coverage limitations that materially affect interpretation.":
    "- Any monitor-access, permission, sampling, comparison-window, or data-coverage limitations that materially affect interpretation.",
};
