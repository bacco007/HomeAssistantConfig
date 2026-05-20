import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "entity_id={0}": "entity_id={0}",
  "device_id={0}": "device_id={0}",
  "area_id={0}": "area_id={0}",
  "label_id={0}": "label_id={0}",
  none: "ninguno",
  "Entity metadata:": "Metadatos de la entidad:",
  "Snapshot range label:": "Etiqueta del rango de la instantánea:",
  "main range": "rango principal",
  "Correlated anomaly highlighting enabled in chart:":
    "Resaltado de anomalías correlacionadas activado en el gráfico:",
  yes: "sí",
  no: "no",
  "Current anomaly overlap mode:": "Modo actual de superposición de anomalías:",
  "Correlated anomaly periods across the selected datapoints:":
    "Periodos de anomalías correlacionadas entre los datapoints seleccionados:",
  "Entity findings:": "Hallazgos de la entidad:",
  "Detected clusters in current range:":
    "Clústeres detectados en el rango actual:",
  "Displayed clusters under the current overlap/correlation mode:":
    "Clústeres mostrados con el modo actual de superposición/correlación:",
  "All detected anomaly cluster details:":
    "Detalles de todos los clústeres de anomalías detectados:",
  "Displayed anomaly cluster details:":
    "Detalles de los clústeres de anomalías mostrados:",
  "Entity:": "Entidad:",
  "Display name:": "Nombre visible:",
  "Visible in panel:": "Visible en el panel:",
  "Anomaly analysis: disabled in the current panel configuration.":
    "Análisis de anomalías: desactivado en la configuración actual del panel.",
  "Anomaly analysis: enabled.": "Análisis de anomalías: activado.",
  "Backend anomaly query inputs:":
    "Entradas de la consulta de anomalías del backend:",
  "Raw history query inputs:": "Entradas de la consulta del historial bruto:",
  "Comparison window reference:": "Referencia de la ventana de comparación:",
  "Comparison window raw history query inputs:":
    "Entradas de la consulta del historial bruto de la ventana de comparación:",
  "Comparison window anomaly query inputs:":
    "Entradas de la consulta de anomalías de la ventana de comparación:",
  "Baseline comparison entity:": "Entidad base de comparación:",
  "RELEVANT PERSISTED MONITORS": "MONITORES PERSISTIDOS RELEVANTES",
  "No persisted anomaly monitors intersect the currently selected entities.":
    "Ningún monitor de anomalías persistido coincide con las entidades seleccionadas actualmente.",
  "Monitor: {0} ({1})": "Monitor: {0} ({1})",
  "Type:": "Tipo:",
  "Enabled:": "Activado:",
  "Entities:": "Entidades:",
  "Monitor anomaly query inputs:":
    "Entradas de la consulta de anomalías del monitor:",
  "AI QUERY BRIEF: HOME ASSISTANT DATAPOINTS PANEL":
    "RESUMEN DE CONSULTA DE IA: PANEL DATAPOINTS DE HOME ASSISTANT",
  OBJECTIVE: "OBJETIVO",
  "SUCCESS CRITERIA": "CRITERIOS DE ÉXITO",
  "RETRIEVAL PRIORITY": "PRIORIDAD DE OBTENCIÓN",
  "PANEL CONTEXT": "CONTEXTO DEL PANEL",
  "Selected entity ids:": "IDs de entidades seleccionadas:",
  "(none selected)": "(ninguna seleccionada)",
  "Raw target selection summary:":
    "Resumen de la selección de destino sin procesar:",
  "Datapoint scope:": "Ámbito del datapoint:",
  "Main range start_time:": "start_time del rango principal:",
  "(not set)": "(sin establecer)",
  "Main range end_time:": "end_time del rango principal:",
  "Committed zoom start_time:": "start_time del zoom confirmado:",
  "Committed zoom end_time:": "end_time del zoom confirmado:",
  "Selected comparison window id:":
    "ID de la ventana de comparación seleccionada:",
  "(none)": "(ninguna)",
  "Comparison windows:": "Ventanas de comparación:",
  "Chart anomaly overlap mode:":
    "Modo de superposición de anomalías del gráfico:",
  "RANGE / RETENTION NOTE": "NOTA DE RANGO / RETENCIÓN",
  "QUERY RULES": "REGLAS DE CONSULTA",
  "RAW TARGET SELECTION OBJECT": "OBJETO DE SELECCIÓN DE DESTINO SIN PROCESAR",
  "AVAILABLE COMPARISON WINDOWS": "VENTANAS DE COMPARACIÓN DISPONIBLES",
  "PER-ENTITY QUERY DETAILS": "DETALLES DE CONSULTA POR ENTIDAD",
  "RECOMMENDED OUTPUT": "SALIDA RECOMENDADA",
  "Comparison window detail: the configured comparison window is not currently selected, so use the window id above to resolve the saved date window before querying.":
    "Comparison window detail: the configured comparison window is not currently selected, so use the window id above to resolve the saved date window before querying.",
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
