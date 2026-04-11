import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "⚠️ Anomaly Insight": "⚠️ Analyse d’anomalie",
  "⚠️ Multi-method Anomaly": "⚠️ Anomalie multi-méthodes",
  "Click the highlighted circle to add an annotation.":
    "Cliquez sur le cercle en surbrillance pour ajouter une annotation.",
  "Alert:": "Alerte :",
  "Confirmed by": "Confirmé par",
  "methods:": "méthodes :",
  "Trend deviation": "Écart de tendance",
  "Sudden change": "Changement brusque",
  "Statistical outlier (IQR)": "Valeur aberrante statistique (IQR)",
  "Rolling Z-score": "Z-score glissant",
  "Flat-line / stuck": "Stable / bloqué",
  "Comparison window": "Fenêtre de comparaison",
  "{0} deviates from its expected trend between {1} and {2}.":
    "{0} s’écarte de sa tendance attendue entre {1} et {2}.",
  "{0} shows an unusual rate of change between {1} and {2}.":
    "{0} présente un taux de variation inhabituel entre {1} et {2}.",
  "{0} contains statistical outliers between {1} and {2}.":
    "{0} contient des valeurs aberrantes statistiques entre {1} et {2}.",
  "{0} shows statistically unusual values between {1} and {2}.":
    "{0} présente des valeurs statistiquement inhabituelles entre {1} et {2}.",
  "{0} appears stuck or flat between {1} and {2}{3}.":
    "{0} semble bloqué ou stable entre {1} et {2}{3}.",
  "{0} deviates significantly from the comparison window between {1} and {2}.":
    "{0} s’écarte significativement de la fenêtre de comparaison entre {1} et {2}.",
  "Peak deviation: {0} from a baseline of {1} at {2}.":
    "Écart maximal : {0} par rapport à une base de {1} à {2}.",
  "Peak rate deviation: {0} from a typical rate of {1} at {2}.":
    "Écart maximal de vitesse : {0} par rapport à une vitesse typique de {1} à {2}.",
  "Peak value: {0}, deviating {1} from the median at {2}.":
    "Valeur maximale : {0}, s’écarte de {1} par rapport à la médiane à {2}.",
  "Peak deviation: {0} from a rolling mean of {1} at {2}.":
    "Écart maximal : {0} par rapport à une moyenne mobile de {1} à {2}.",
  "Value remained near {0} for an unusually long period.":
    "La valeur est restée proche de {0} pendant une durée inhabituellement longue.",
  "Peak deviation from comparison: {0} at {1}.":
    "Écart maximal par rapport à la comparaison : {0} à {1}.",
  " (range: {0})": " (plage : {0})",
  "Date window": "Fenêtre de dates",
  Trend: "Tendance",
  Rate: "Vitesse",
  Delta: "Delta",
  Threshold: "Seuil",
};
