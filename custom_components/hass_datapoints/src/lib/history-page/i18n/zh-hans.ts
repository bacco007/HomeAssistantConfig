import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "entity_id={0}": "entity_id={0}",
  "device_id={0}": "device_id={0}",
  "area_id={0}": "area_id={0}",
  "label_id={0}": "label_id={0}",
  none: "无",
  "Entity metadata:": "实体元数据：",
  "Snapshot range label:": "快照范围标签：",
  "main range": "主范围",
  "Correlated anomaly highlighting enabled in chart:":
    "图表中的相关异常高亮已启用：",
  yes: "是",
  no: "否",
  "Current anomaly overlap mode:": "当前异常重叠模式：",
  "Correlated anomaly periods across the selected datapoints:":
    "所选数据点之间的相关异常时间段：",
  "Entity findings:": "实体发现：",
  "Detected clusters in current range:": "当前范围内检测到的聚类：",
  "Displayed clusters under the current overlap/correlation mode:":
    "在当前重叠/相关模式下显示的聚类：",
  "All detected anomaly cluster details:": "所有检测到的异常聚类详情：",
  "Displayed anomaly cluster details:": "已显示的异常聚类详情：",
  "Entity:": "实体：",
  "Display name:": "显示名称：",
  "Visible in panel:": "在面板中可见：",
  "Anomaly analysis: disabled in the current panel configuration.":
    "异常分析：在当前面板配置中已禁用。",
  "Anomaly analysis: enabled.": "异常分析：已启用。",
  "Backend anomaly query inputs:": "后端异常查询输入：",
  "Raw history query inputs:": "原始历史查询输入：",
  "Comparison window reference:": "比较窗口参考：",
  "Comparison window raw history query inputs:": "比较窗口原始历史查询输入：",
  "Comparison window anomaly query inputs:": "比较窗口异常查询输入：",
  "Baseline comparison entity:": "基线比较实体：",
  "RELEVANT PERSISTED MONITORS": "相关的持久化监视器",
  "No persisted anomaly monitors intersect the currently selected entities.":
    "没有持久化的异常监视器与当前选中的实体相交。",
  "Monitor: {0} ({1})": "监视器：{0}（{1}）",
  "Type:": "类型：",
  "Enabled:": "已启用：",
  "Entities:": "实体：",
  "Monitor anomaly query inputs:": "监视器异常查询输入：",
  "AI QUERY BRIEF: HOME ASSISTANT DATAPOINTS PANEL":
    "AI 查询摘要：HOME ASSISTANT DATAPOINTS 面板",
  OBJECTIVE: "目标",
  "SUCCESS CRITERIA": "成功标准",
  "RETRIEVAL PRIORITY": "获取优先级",
  "PANEL CONTEXT": "面板上下文",
  "Selected entity ids:": "已选实体 ID：",
  "(none selected)": "（未选择）",
  "Raw target selection summary:": "原始目标选择摘要：",
  "Datapoint scope:": "数据点范围：",
  "Main range start_time:": "主范围 start_time：",
  "(not set)": "（未设置）",
  "Main range end_time:": "主范围 end_time：",
  "Committed zoom start_time:": "已提交缩放的 start_time：",
  "Committed zoom end_time:": "已提交缩放的 end_time：",
  "Selected comparison window id:": "所选比较窗口 ID：",
  "(none)": "（无）",
  "Comparison windows:": "比较窗口：",
  "Chart anomaly overlap mode:": "图表异常重叠模式：",
  "RANGE / RETENTION NOTE": "范围 / 保留说明",
  "QUERY RULES": "查询规则",
  "RAW TARGET SELECTION OBJECT": "原始目标选择对象",
  "AVAILABLE COMPARISON WINDOWS": "可用的比较窗口",
  "PER-ENTITY QUERY DETAILS": "按实体划分的查询详情",
  "RECOMMENDED OUTPUT": "建议输出",
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
