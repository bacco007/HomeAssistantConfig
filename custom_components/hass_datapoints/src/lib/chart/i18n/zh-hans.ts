import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "⚠️ Anomaly Insight": "⚠️ 异常洞察",
  "⚠️ Multi-method Anomaly": "⚠️ 多方法异常",
  "Click the highlighted circle to add an annotation.":
    "点击高亮圆圈以添加注释。",
  "Alert:": "警报：",
  "Confirmed by": "确认方式",
  "methods:": "方法：",
  "Trend deviation": "趋势偏差",
  "Sudden change": "突变",
  "Statistical outlier (IQR)": "统计离群值（IQR）",
  "Rolling Z-score": "滚动 Z 分数",
  "Flat-line / stuck": "平直 / 卡住",
  "Comparison window": "比较窗口",
  "{0} deviates from its expected trend between {1} and {2}.":
    "{0} 在 {1} 到 {2} 之间偏离了预期趋势。",
  "{0} shows an unusual rate of change between {1} and {2}.":
    "{0} 在 {1} 到 {2} 之间表现出异常的变化率。",
  "{0} contains statistical outliers between {1} and {2}.":
    "{0} 在 {1} 到 {2} 之间包含统计离群值。",
  "{0} shows statistically unusual values between {1} and {2}.":
    "{0} 在 {1} 到 {2} 之间显示出统计上异常的值。",
  "{0} appears stuck or flat between {1} and {2}{3}.":
    "{0} 在 {1} 到 {2}{3} 之间似乎卡住或保持平直。",
  "{0} deviates significantly from the comparison window between {1} and {2}.":
    "{0} 在 {1} 到 {2} 之间显著偏离比较窗口。",
  "Peak deviation: {0} from a baseline of {1} at {2}.":
    "峰值偏差：{2} 时相对基线 {1} 偏差 {0}。",
  "Peak rate deviation: {0} from a typical rate of {1} at {2}.":
    "峰值速率偏差：{2} 时相对典型速率 {1} 偏差 {0}。",
  "Peak value: {0}, deviating {1} from the median at {2}.":
    "峰值：{0}，在 {2} 时偏离中位数 {1}。",
  "Peak deviation: {0} from a rolling mean of {1} at {2}.":
    "峰值偏差：{2} 时相对滚动平均值 {1} 偏差 {0}。",
  "Value remained near {0} for an unusually long period.":
    "该值在异常长的时间内一直接近 {0}。",
  "Peak deviation from comparison: {0} at {1}.":
    "与比较值的峰值偏差：{1} 时为 {0}。",
  " (range: {0})": "（范围：{0}）",
  "Date window": "日期窗口",
  Trend: "趋势",
  Rate: "变化率",
  Delta: "差值",
  Threshold: "阈值",
};
