import {
  configureLocalization,
  localized,
  msg as _litMsg,
} from "@lit/localize";
import supportedLocalesJson from "./supported-locales.json";

/**
 * The canonical list of non-English locales supported by this integration.
 * Consumed by localize.ts, the locale aggregator files, and the translation
 * coverage tests.  Add a new locale here and the tests will immediately flag
 * any missing translation files or untranslated strings.
 */
export const TARGET_LOCALES: readonly string[] = supportedLocalesJson;

const targetLocales = TARGET_LOCALES as string[];

const { getLocale, setLocale } = configureLocalization({
  sourceLocale: "en",
  targetLocales,
  loadLocale: (locale) => {
    // cannot use import(./locales/${locale}) due to static analysis issues.
    if (locale === "fi") {
      return import("./locales/fi");
    }
    if (locale === "fr") {
      return import("./locales/fr");
    }
    if (locale === "de") {
      return import("./locales/de");
    }
    if (locale === "es") {
      return import("./locales/es");
    }
    if (locale === "pt") {
      return import("./locales/pt");
    }
    if (locale === "zh-Hans") {
      return import("./locales/zh-hans");
    }

    throw new Error(`Unsupported locale "${locale}"`);
  },
});

function normalizeLocale(locale: Nullable<string> | undefined): string {
  const normalizedLocale = (locale ?? "")
    .trim()
    .replaceAll("_", "-")
    .toLowerCase();

  if (!normalizedLocale) {
    return "en";
  }

  if (normalizedLocale === "fi" || normalizedLocale.startsWith("fi-")) {
    return "fi";
  }
  if (normalizedLocale === "fr" || normalizedLocale.startsWith("fr-")) {
    return "fr";
  }
  if (normalizedLocale === "de" || normalizedLocale.startsWith("de-")) {
    return "de";
  }
  if (normalizedLocale === "es" || normalizedLocale.startsWith("es-")) {
    return "es";
  }
  if (normalizedLocale === "pt" || normalizedLocale.startsWith("pt-")) {
    return "pt";
  }
  if (
    normalizedLocale === "zh" ||
    normalizedLocale.startsWith("zh-") ||
    normalizedLocale.startsWith("cmn-")
  ) {
    return "zh-Hans";
  }

  return "en";
}

export async function setFrontendLocale(
  locale: Nullable<string> | undefined
): Promise<string> {
  const nextLocale = normalizeLocale(locale);

  if (getLocale() !== nextLocale) {
    await setLocale(nextLocale);
  }

  return nextLocale;
}

export async function syncFrontendLocale(
  hass?: Nullable<{ language?: string; locale?: { language?: string } }>
): Promise<string> {
  // HA 2022.3+ stores the user's chosen UI language in hass.locale.language.
  // hass.language is the system/backend language and may differ (often "en").
  return setFrontendLocale(hass?.locale?.language ?? hass?.language);
}

/**
 * Wrapper around `@lit/localize`'s `msg` that automatically uses the source
 * string as the translation id, so call sites don't need to repeat it.
 *
 * Instead of:  msg("Hello", { id: "Hello" })
 * Write:       msg("Hello")
 */
export function msg(
  str: string,
  opts?: { id?: string; desc?: string }
): string {
  return _litMsg(str, { ...opts, id: opts?.id ?? str }) as string;
}

export { getLocale, localized };
