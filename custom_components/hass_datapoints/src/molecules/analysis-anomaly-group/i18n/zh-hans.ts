import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "Show anomalies": "显示异常",
  Sensitivity: "灵敏度",
  "Use downsampled data for detection": "检测时使用降采样数据",
  "Rate window": "变化率窗口",
  "Rolling window": "滚动窗口",
  "Min flat duration": "最小平稳持续时间",
  "Compare to window": "与窗口比较",
  "— select window —": "— 选择窗口 —",
  "When methods overlap": "当方法重叠时",
  Low: "低",
  Medium: "中",
  High: "高",
  "Trend deviation": "趋势偏差",
  "Sudden change": "突变",
  "Statistical outlier (IQR)": "统计离群值（IQR）",
  "Rolling Z-score": "滚动 Z 分数",
  "Flat-line / stuck value": "平直 / 卡住值",
  "Comparison window deviation": "比较窗口偏差",
  "Flags points that deviate significantly from a fitted trend line. Good for catching gradual drift or sudden jumps away from a steady baseline.":
    "标记显著偏离拟合趋势线的点。适合捕捉从稳定基线逐渐漂移或突然跳变的情况。",
  "Flags unusually fast rises or drops compared to the typical rate of change. Best for detecting spikes, crashes, or rapid transitions.":
    "标记相对于典型变化率异常快速的上升或下降。最适合检测尖峰、崩跌或快速变化。",
  "Uses the interquartile range to flag values far outside the normal spread of data. Robust against outliers that skew averages.":
    "使用四分位距来标记远超正常数据分布范围的值。对会扭曲平均值的离群值具有较强鲁棒性。",
  "Compares each value to a rolling mean and standard deviation. Catches unusual readings relative to recent context rather than the whole series.":
    "将每个值与滚动平均值和标准差进行比较。它根据近期上下文而不是整条序列来捕捉异常读数。",
  "Flags when a sensor reports nearly the same value for an unusually long time. Useful for detecting stuck sensors or frozen readings.":
    "当传感器在异常长时间内报告几乎相同的值时进行标记。适用于检测卡住的传感器或冻结的读数。",
  "Compares the current period to a reference date window. Highlights differences from an expected historical pattern, such as last week or the same day last year.":
    "将当前时间段与参考日期窗口进行比较。突出显示与预期历史模式的差异，例如上周或去年的同一天。",
  "Show all anomalies": "显示所有异常",
  "Overlaps only": "仅重叠项",
  "Computing…": "计算中…",
  "Trend method": "趋势方法",
  "Trend window": "趋势窗口",
  "Same as display trend": "与显示趋势相同",
  "1 hour": "1小时",
  "3 hours": "3小时",
  "6 hours": "6小时",
  "12 hours": "12小时",
  "24 hours": "24小时",
  "7 days": "7天",
  "30 minutes": "30分钟",
};
