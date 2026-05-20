import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "entity_id={0}": "entity_id={0}",
  "device_id={0}": "device_id={0}",
  "area_id={0}": "area_id={0}",
  "label_id={0}": "label_id={0}",
  none: "nenhum",
  "Entity metadata:": "Metadados da entidade:",
  "Snapshot range label:": "Rótulo do intervalo do snapshot:",
  "main range": "intervalo principal",
  "Correlated anomaly highlighting enabled in chart:":
    "Realce de anomalias correlacionadas ativado no gráfico:",
  yes: "sim",
  no: "não",
  "Current anomaly overlap mode:": "Modo atual de sobreposição de anomalias:",
  "Correlated anomaly periods across the selected datapoints:":
    "Períodos de anomalias correlacionadas entre os datapoints selecionados:",
  "Entity findings:": "Constatações da entidade:",
  "Detected clusters in current range:":
    "Clusters detetados no intervalo atual:",
  "Displayed clusters under the current overlap/correlation mode:":
    "Clusters mostrados no modo atual de sobreposição/correlação:",
  "All detected anomaly cluster details:":
    "Detalhes de todos os clusters de anomalias detetados:",
  "Displayed anomaly cluster details:":
    "Detalhes dos clusters de anomalias mostrados:",
  "Entity:": "Entidade:",
  "Display name:": "Nome apresentado:",
  "Visible in panel:": "Visível no painel:",
  "Anomaly analysis: disabled in the current panel configuration.":
    "Análise de anomalias: desativada na configuração atual do painel.",
  "Anomaly analysis: enabled.": "Análise de anomalias: ativada.",
  "Backend anomaly query inputs:":
    "Entradas da consulta de anomalias do backend:",
  "Raw history query inputs:": "Entradas da consulta do histórico bruto:",
  "Comparison window reference:": "Referência da janela de comparação:",
  "Comparison window raw history query inputs:":
    "Entradas da consulta do histórico bruto da janela de comparação:",
  "Comparison window anomaly query inputs:":
    "Entradas da consulta de anomalias da janela de comparação:",
  "Baseline comparison entity:": "Entidade de comparação de base:",
  "RELEVANT PERSISTED MONITORS": "MONITORES PERSISTIDOS RELEVANTES",
  "No persisted anomaly monitors intersect the currently selected entities.":
    "Nenhum monitor de anomalias persistido intersecta as entidades atualmente selecionadas.",
  "Monitor: {0} ({1})": "Monitor: {0} ({1})",
  "Type:": "Tipo:",
  "Enabled:": "Ativado:",
  "Entities:": "Entidades:",
  "Monitor anomaly query inputs:":
    "Entradas da consulta de anomalias do monitor:",
  "AI QUERY BRIEF: HOME ASSISTANT DATAPOINTS PANEL":
    "RESUMO DE CONSULTA DE IA: PAINEL HOME ASSISTANT DATAPOINTS",
  OBJECTIVE: "OBJETIVO",
  "SUCCESS CRITERIA": "CRITÉRIOS DE SUCESSO",
  "RETRIEVAL PRIORITY": "PRIORIDADE DE OBTENÇÃO",
  "PANEL CONTEXT": "CONTEXTO DO PAINEL",
  "Selected entity ids:": "IDs das entidades selecionadas:",
  "(none selected)": "(nenhuma selecionada)",
  "Raw target selection summary:": "Resumo da seleção bruta de destino:",
  "Datapoint scope:": "Âmbito do datapoint:",
  "Main range start_time:": "start_time do intervalo principal:",
  "(not set)": "(não definido)",
  "Main range end_time:": "end_time do intervalo principal:",
  "Committed zoom start_time:": "start_time do zoom confirmado:",
  "Committed zoom end_time:": "end_time do zoom confirmado:",
  "Selected comparison window id:": "ID da janela de comparação selecionada:",
  "(none)": "(nenhuma)",
  "Comparison windows:": "Janelas de comparação:",
  "Chart anomaly overlap mode:":
    "Modo de sobreposição de anomalias do gráfico:",
  "RANGE / RETENTION NOTE": "NOTA SOBRE INTERVALO / RETENÇÃO",
  "QUERY RULES": "REGRAS DE CONSULTA",
  "RAW TARGET SELECTION OBJECT": "OBJETO BRUTO DE SELEÇÃO DE DESTINO",
  "AVAILABLE COMPARISON WINDOWS": "JANELAS DE COMPARAÇÃO DISPONÍVEIS",
  "PER-ENTITY QUERY DETAILS": "DETALHES DE CONSULTA POR ENTIDADE",
  "RECOMMENDED OUTPUT": "SAÍDA RECOMENDADA",
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
