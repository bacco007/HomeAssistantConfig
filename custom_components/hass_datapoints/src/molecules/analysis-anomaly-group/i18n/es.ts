import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "Show anomalies": "Mostrar anomalías",
  Sensitivity: "Sensibilidad",
  "Use downsampled data for detection":
    "Usar datos submuestreados para la detección",
  "Rate window": "Ventana de tasa",
  "Rolling window": "Ventana móvil",
  "Min flat duration": "Duración mínima plana",
  "Compare to window": "Comparar con la ventana",
  "— select window —": "— seleccionar ventana —",
  "When methods overlap": "Cuando los métodos se superponen",
  Low: "Baja",
  Medium: "Media",
  High: "Alta",
  "Trend deviation": "Desviación de tendencia",
  "Sudden change": "Cambio repentino",
  "Statistical outlier (IQR)": "Valor atípico estadístico (IQR)",
  "Rolling Z-score": "Puntuación Z móvil",
  "Flat-line / stuck value": "Valor plano / atascado",
  "Comparison window deviation":
    "Desviación respecto a la ventana de comparación",
  "Flags points that deviate significantly from a fitted trend line. Good for catching gradual drift or sudden jumps away from a steady baseline.":
    "Marca puntos que se desvían significativamente de una línea de tendencia ajustada. Es útil para detectar una deriva gradual o saltos bruscos desde una base estable.",
  "Flags unusually fast rises or drops compared to the typical rate of change. Best for detecting spikes, crashes, or rapid transitions.":
    "Marca subidas o bajadas inusualmente rápidas en comparación con la tasa de cambio típica. Es ideal para detectar picos, caídas o transiciones rápidas.",
  "Uses the interquartile range to flag values far outside the normal spread of data. Robust against outliers that skew averages.":
    "Usa el rango intercuartílico para marcar valores muy alejados de la dispersión normal de los datos. Es robusto frente a valores atípicos que sesgan las medias.",
  "Compares each value to a rolling mean and standard deviation. Catches unusual readings relative to recent context rather than the whole series.":
    "Compara cada valor con una media móvil y una desviación estándar. Detecta lecturas inusuales en relación con el contexto reciente, no con toda la serie.",
  "Flags when a sensor reports nearly the same value for an unusually long time. Useful for detecting stuck sensors or frozen readings.":
    "Marca cuando un sensor informa casi el mismo valor durante un tiempo inusualmente largo. Es útil para detectar sensores atascados o lecturas congeladas.",
  "Compares the current period to a reference date window. Highlights differences from an expected historical pattern, such as last week or the same day last year.":
    "Compara el periodo actual con una ventana de fechas de referencia. Destaca las diferencias respecto a un patrón histórico esperado, como la semana pasada o el mismo día del año anterior.",
  "Show all anomalies": "Mostrar todas las anomalías",
  "Overlaps only": "Solo solapamientos",
  "Computing…": "Calculando…",
  "Trend method": "Método de tendencia",
  "Trend window": "Ventana de tendencia",
  "Same as display trend": "Igual que la tendencia de visualización",
  "1 hour": "1 hora",
  "3 hours": "3 horas",
  "6 hours": "6 horas",
  "12 hours": "12 horas",
  "24 hours": "24 horas",
  "7 days": "7 días",
  "30 minutes": "30 minutos",
};
