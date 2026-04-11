import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "Show anomalies": "Afficher les anomalies",
  Sensitivity: "Sensibilité",
  "Use downsampled data for detection":
    "Utiliser les données rééchantillonnées pour la détection",
  "Rate window": "Fenêtre de variation",
  "Rolling window": "Fenêtre glissante",
  "Min flat duration": "Durée minimale de stabilité",
  "Compare to window": "Comparer à la fenêtre",
  "— select window —": "— sélectionner une fenêtre —",
  "When methods overlap": "Lorsque les méthodes se chevauchent",
  Low: "Faible",
  Medium: "Moyenne",
  High: "Élevée",
  "Trend deviation": "Écart de tendance",
  "Sudden change": "Changement brusque",
  "Statistical outlier (IQR)": "Valeur aberrante statistique (IQR)",
  "Rolling Z-score": "Z-score glissant",
  "Flat-line / stuck value": "Valeur stable / bloquée",
  "Comparison window deviation":
    "Écart par rapport à la fenêtre de comparaison",
  "Flags points that deviate significantly from a fitted trend line. Good for catching gradual drift or sudden jumps away from a steady baseline.":
    "Signale les points qui s’écartent fortement d’une ligne de tendance ajustée. Idéal pour repérer une dérive progressive ou des sauts soudains loin d’une base stable.",
  "Flags unusually fast rises or drops compared to the typical rate of change. Best for detecting spikes, crashes, or rapid transitions.":
    "Signale les hausses ou baisses inhabituellement rapides par rapport au taux de variation habituel. Idéal pour détecter des pics, des chutes ou des transitions rapides.",
  "Uses the interquartile range to flag values far outside the normal spread of data. Robust against outliers that skew averages.":
    "Utilise l’intervalle interquartile pour signaler les valeurs très en dehors de la dispersion normale des données. Robuste face aux valeurs extrêmes qui faussent les moyennes.",
  "Compares each value to a rolling mean and standard deviation. Catches unusual readings relative to recent context rather than the whole series.":
    "Compare chaque valeur à une moyenne mobile et à un écart-type. Détecte les lectures inhabituelles par rapport au contexte récent plutôt qu’à l’ensemble de la série.",
  "Flags when a sensor reports nearly the same value for an unusually long time. Useful for detecting stuck sensors or frozen readings.":
    "Signale lorsqu’un capteur rapporte presque la même valeur pendant une durée inhabituellement longue. Utile pour détecter des capteurs bloqués ou des lectures figées.",
  "Compares the current period to a reference date window. Highlights differences from an expected historical pattern, such as last week or the same day last year.":
    "Compare la période actuelle à une fenêtre de dates de référence. Met en évidence les différences par rapport à un modèle historique attendu, comme la semaine dernière ou le même jour l’année précédente.",
  "Show all anomalies": "Afficher toutes les anomalies",
  "Overlaps only": "Chevauchements uniquement",
  "Computing…": "Calcul…",
  "Trend method": "Méthode de tendance",
  "Trend window": "Fenêtre de tendance",
  "Same as display trend": "Identique à la tendance affichée",
  "1 hour": "1 heure",
  "3 hours": "3 heures",
  "6 hours": "6 heures",
  "12 hours": "12 heures",
  "24 hours": "24 heures",
  "7 days": "7 jours",
  "30 minutes": "30 minutes",
};
