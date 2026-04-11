import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "Show anomalies": "Mostrar anomalias",
  Sensitivity: "Sensibilidade",
  "Use downsampled data for detection": "Usar dados reamostrados para deteção",
  "Rate window": "Janela da taxa",
  "Rolling window": "Janela móvel",
  "Min flat duration": "Duração mínima plana",
  "Compare to window": "Comparar com a janela",
  "— select window —": "— selecionar janela —",
  "When methods overlap": "Quando os métodos se sobrepõem",
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
  "Trend deviation": "Desvio de tendência",
  "Sudden change": "Mudança súbita",
  "Statistical outlier (IQR)": "Valor atípico estatístico (IQR)",
  "Rolling Z-score": "Z-score móvel",
  "Flat-line / stuck value": "Valor plano / bloqueado",
  "Comparison window deviation": "Desvio da janela de comparação",
  "Flags points that deviate significantly from a fitted trend line. Good for catching gradual drift or sudden jumps away from a steady baseline.":
    "Assinala pontos que se desviam significativamente de uma linha de tendência ajustada. É útil para detetar deriva gradual ou saltos súbitos a partir de uma base estável.",
  "Flags unusually fast rises or drops compared to the typical rate of change. Best for detecting spikes, crashes, or rapid transitions.":
    "Assinala subidas ou descidas invulgarmente rápidas em comparação com a taxa de variação típica. É ideal para detetar picos, quedas ou transições rápidas.",
  "Uses the interquartile range to flag values far outside the normal spread of data. Robust against outliers that skew averages.":
    "Usa o intervalo interquartil para assinalar valores muito fora da dispersão normal dos dados. É robusto contra valores atípicos que distorcem as médias.",
  "Compares each value to a rolling mean and standard deviation. Catches unusual readings relative to recent context rather than the whole series.":
    "Compara cada valor com uma média móvel e um desvio padrão. Deteta leituras invulgares em relação ao contexto recente, e não à série completa.",
  "Flags when a sensor reports nearly the same value for an unusually long time. Useful for detecting stuck sensors or frozen readings.":
    "Assinala quando um sensor reporta quase o mesmo valor durante um período invulgarmente longo. É útil para detetar sensores bloqueados ou leituras congeladas.",
  "Compares the current period to a reference date window. Highlights differences from an expected historical pattern, such as last week or the same day last year.":
    "Compara o período atual com uma janela de datas de referência. Destaca diferenças face a um padrão histórico esperado, como a semana passada ou o mesmo dia do ano anterior.",
  "Show all anomalies": "Mostrar todas as anomalias",
  "Overlaps only": "Apenas sobreposições",
  "Computing…": "A calcular…",
  "Trend method": "Método de tendência",
  "Trend window": "Janela de tendência",
  "Same as display trend": "Igual à tendência de apresentação",
  "1 hour": "1 hora",
  "3 hours": "3 horas",
  "6 hours": "6 horas",
  "12 hours": "12 horas",
  "24 hours": "24 horas",
  "7 days": "7 dias",
  "30 minutes": "30 minutos",
};
