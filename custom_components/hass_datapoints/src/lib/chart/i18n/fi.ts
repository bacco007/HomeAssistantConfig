import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  // Anomaly tooltip titles / meta
  "⚠️ Anomaly Insight": "⚠️ Poikkeavuushavainto",
  "⚠️ Multi-method Anomaly": "⚠️ Monimenetelmäinen poikkeavuus",
  "Click the highlighted circle to add an annotation.":
    "Klikkaa korostettua ympyrää lisätäksesi huomautuksen.",
  "Alert:": "Hälytys:",
  "Confirmed by": "Vahvistettu",
  "methods:": "menetelmällä:",

  // Anomaly method labels
  "Trend deviation": "Trendipoikkeama",
  "Sudden change": "Äkillinen muutos",
  "Statistical outlier (IQR)": "Tilastollinen poikkeama (IQR)",
  "Rolling Z-score": "Liukuva Z-arvo",
  "Flat-line / stuck": "Tasainen / jumittunut",
  "Comparison window": "Vertailuikkuna",

  // Anomaly description templates ({0} = label, {1} = start, {2} = end)
  "{0} deviates from its expected trend between {1} and {2}.":
    "{0} poikkeaa odotetusta trendistä välillä {1} – {2}.",
  "{0} shows an unusual rate of change between {1} and {2}.":
    "{0} näyttää epätavallista muutosnopeutta välillä {1} – {2}.",
  "{0} contains statistical outliers between {1} and {2}.":
    "{0} sisältää tilastollisia poikkeamia välillä {1} – {2}.",
  "{0} shows statistically unusual values between {1} and {2}.":
    "{0} näyttää tilastollisesti epätavallisia arvoja välillä {1} – {2}.",
  "{0} appears stuck or flat between {1} and {2}{3}.":
    "{0} vaikuttaa jumittuneelta tai tasaiselta välillä {1} – {2}{3}.",
  "{0} deviates significantly from the comparison window between {1} and {2}.":
    "{0} poikkeaa merkittävästi vertailuikkunasta välillä {1} – {2}.",

  // Anomaly alert templates ({0}, {1}, {2} = formatted values / timestamps)
  "Peak deviation: {0} from a baseline of {1} at {2}.":
    "Huippupoikkeama: {0} perusarvosta {1} ajankohtana {2}.",
  "Peak rate deviation: {0} from a typical rate of {1} at {2}.":
    "Huippumuutosnopeus: {0} tyypillisestä nopeudesta {1} ajankohtana {2}.",
  "Peak value: {0}, deviating {1} from the median at {2}.":
    "Huippuarvo: {0}, poikkeaa {1} mediaanista ajankohtana {2}.",
  "Peak deviation: {0} from a rolling mean of {1} at {2}.":
    "Huippupoikkeama: {0} liukuvasta keskiarvosta {1} ajankohtana {2}.",
  "Value remained near {0} for an unusually long period.":
    "Arvo pysyi lähellä arvoa {0} epätavallisen pitkään.",
  "Peak deviation from comparison: {0} at {1}.":
    "Huippupoikkeama vertailusta: {0} ajankohtana {1}.",
  " (range: {0})": " (vaihteluväli: {0})",

  // Tooltip series type labels
  "Date window": "Aikaikkuna",
  Trend: "Trendi",
  Rate: "Muutosnopeus",
  Delta: "Delta",
  Threshold: "Kynnysarvo",
};
