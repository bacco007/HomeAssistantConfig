import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "Show anomalies": "Anomalien anzeigen",
  Sensitivity: "Empfindlichkeit",
  "Use downsampled data for detection":
    "Heruntergesampelte Daten für die Erkennung verwenden",
  "Rate window": "Ratenfenster",
  "Rolling window": "Gleitendes Fenster",
  "Min flat duration": "Minimale Flachdauer",
  "Compare to window": "Mit Fenster vergleichen",
  "— select window —": "— Fenster auswählen —",
  "When methods overlap": "Wenn sich Methoden überschneiden",
  Low: "Niedrig",
  Medium: "Mittel",
  High: "Hoch",
  "Trend deviation": "Trendabweichung",
  "Sudden change": "Plötzliche Änderung",
  "Statistical outlier (IQR)": "Statistischer Ausreißer (IQR)",
  "Rolling Z-score": "Gleitender Z-Score",
  "Flat-line / stuck value": "Flacher / festhängender Wert",
  "Comparison window deviation": "Abweichung vom Vergleichsfenster",
  "Flags points that deviate significantly from a fitted trend line. Good for catching gradual drift or sudden jumps away from a steady baseline.":
    "Markiert Punkte, die deutlich von einer angepassten Trendlinie abweichen. Gut geeignet, um schleichende Drift oder plötzliche Sprünge von einer stabilen Basis zu erkennen.",
  "Flags unusually fast rises or drops compared to the typical rate of change. Best for detecting spikes, crashes, or rapid transitions.":
    "Markiert ungewöhnlich schnelle Anstiege oder Abfälle im Vergleich zur typischen Änderungsrate. Ideal zum Erkennen von Spitzen, Einbrüchen oder schnellen Übergängen.",
  "Uses the interquartile range to flag values far outside the normal spread of data. Robust against outliers that skew averages.":
    "Verwendet den Interquartilsabstand, um Werte zu markieren, die weit außerhalb der normalen Datenstreuung liegen. Robust gegenüber Ausreißern, die Mittelwerte verzerren.",
  "Compares each value to a rolling mean and standard deviation. Catches unusual readings relative to recent context rather than the whole series.":
    "Vergleicht jeden Wert mit einem gleitenden Mittelwert und einer Standardabweichung. Erkennt ungewöhnliche Werte relativ zum jüngsten Kontext statt zur gesamten Serie.",
  "Flags when a sensor reports nearly the same value for an unusually long time. Useful for detecting stuck sensors or frozen readings.":
    "Markiert, wenn ein Sensor ungewöhnlich lange nahezu denselben Wert meldet. Nützlich zum Erkennen festhängender Sensoren oder eingefrorener Messwerte.",
  "Compares the current period to a reference date window. Highlights differences from an expected historical pattern, such as last week or the same day last year.":
    "Vergleicht den aktuellen Zeitraum mit einem Referenz-Datumsfenster. Hebt Unterschiede zu einem erwarteten historischen Muster hervor, etwa zur letzten Woche oder zum gleichen Tag im Vorjahr.",
  "Show all anomalies": "Alle Anomalien anzeigen",
  "Overlaps only": "Nur Überlappungen",
  "Computing…": "Wird berechnet…",
  "Trend method": "Trendmethode",
  "Trend window": "Trendfenster",
  "Same as display trend": "Wie Anzeigetrend",
  "1 hour": "1 Stunde",
  "3 hours": "3 Stunden",
  "6 hours": "6 Stunden",
  "12 hours": "12 Stunden",
  "24 hours": "24 Stunden",
  "7 days": "7 Tage",
  "30 minutes": "30 Minuten",
};
