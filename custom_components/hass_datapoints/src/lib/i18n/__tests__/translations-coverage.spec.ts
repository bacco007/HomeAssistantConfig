/**
 * translations-coverage.spec.ts
 *
 * Verifies that every component's i18n directory:
 *   1. Has a translation file for every supported non-English locale.
 *   2. Each locale file contains exactly the same set of keys (no missing,
 *      no stale extras).
 *   3. Every translated value differs from its English source key, unless the
 *      string is listed in UNTRANSLATED_WHITELIST.
 *
 * WHITELIST POLICY
 * ────────────────
 * Add a source string to UNTRANSLATED_WHITELIST only when the translation
 * is intentionally identical to the English key in one or more target locales.
 * Common reasons:
 *   • The word is a borrowed technical/mathematical term used unchanged
 *     (e.g. "Median", "Downsampling", "Delta", "Trend").
 *   • The word is a proper noun or product name ("Datapoints").
 *   • The word is a universal abbreviation ("Auto", "Max", "Min").
 *   • The word happens to be spelled the same in a specific target language
 *     (German "Name", "Start", "Rate", "Minute"; French "Minute", "Message").
 *
 * Every entry added here should have a comment explaining why it is identical
 * across languages.  If in doubt, leave it out — a failing test is a useful
 * prompt to check whether the translation was accidentally left untouched.
 */

import { describe, expect, it } from "vitest";
import { TARGET_LOCALES } from "@/lib/i18n/localize";

// ── Supported non-English locales ─────────────────────────────────────────────
// Sourced from the canonical list in localize.ts → supported-locales.json.
// Adding a new locale there automatically picks it up here.

// Component i18n filenames use lowercase (e.g. zh-hans.ts) while the locale
// codes in supported-locales.json use the canonical casing (e.g. zh-Hans).
const SUPPORTED_LOCALES = TARGET_LOCALES.map((l) => l.toLowerCase());
type SupportedLocale = string;

// ── Whitelist ─────────────────────────────────────────────────────────────────

/**
 * Source strings whose translated value is intentionally identical to the
 * English key in one or more target locales.
 */
const UNTRANSLATED_WHITELIST = new Set<string>([
  // Product / proper nouns
  "Datapoints",

  // Universal mathematical / statistical abbreviations
  "Delta",
  "Max",
  "Min",
  "Median",

  // Technical terms borrowed without translation
  "Auto",
  "Downsampling",
  "Trend",
  "Rate",

  // German: words with identical spelling in both English and German
  "Name", // German "Name"
  "Start", // German "Start"
  "Minute", // German "Minute" / French "Minute"

  // French: time expressions that are identical in French
  "1 minute",
  "2 minutes",
  "5 minutes",
  "10 minutes",
  "15 minutes",
  "30 minutes",
  "Message", // French "message"

  // Spanish
  "General", // Spanish "General"
  "Color", // Spanish "color" (same spelling)
  "no", // Spanish/Portuguese "no" is identical to English "no"

  // Format string templates — language-independent identifiers used verbatim
  "entity_id={0}",
  "device_id={0}",
  "area_id={0}",
  "label_id={0}",
  "Monitor: {0} ({1})", // "Monitor" untranslated in de/es/pt

  // AI query brief instruction strings — intentionally kept in English across
  // all locales because this brief is consumed by AI systems (LLMs) that
  // process instructions most reliably in English.
  "If raw recorder history is incomplete or unavailable, fetch Home Assistant statistics for continuity and call out the retention boundary explicitly.",
  "The requested window spans about {0} days. Short-retention raw history may not fully cover this range, so use Home Assistant statistics for older or missing portions and do not infer 'no anomalies' from retention gaps.",
  "Use raw recorder history first for this range. If raw history is incomplete or unavailable, fetch Home Assistant statistics and explain any retention or recorder gaps.",
  "CURRENT RANGE ANOMALY FINDINGS",
  "Current anomaly findings are not available from the active chart state, so use the query inputs below to fetch and inspect anomaly clusters directly.",
  "No entity-level anomaly findings are currently available from the active chart snapshot.",
  "If your Home Assistant tooling requires explicit baseline range inputs, use the same start/end range as the main anomaly query unless a more specific monitor or MCP tool requires otherwise.",
  "Fetch the underlying Home Assistant history or statistics, entity metadata, and hass_datapoints anomaly detail needed to inspect the currently selected datapoints. Do not treat this brief as the raw data itself.",
  "- Resolve entity metadata context for each selected entity.",
  "- Fetch raw or best-available historical coverage for the requested range.",
  "- Reproduce hass_datapoints anomaly queries with the exact panel settings below.",
  "- Review current-range anomaly findings from this integration, including cross-entity correlated anomaly periods when present.",
  "- Call out any retention, sampling, permission, or monitor-lookup limitations.",
  "1. Resolve entity metadata first so area, device, platform, labels, and unit context are known before interpretation.",
  "2. Fetch raw recorder history for the requested range where available.",
  "3. If raw history is incomplete, unavailable, or truncated by retention, fetch Home Assistant statistics for continuity.",
  "4. Reproduce the hass_datapoints anomaly queries exactly as listed below.",
  "5. Because anomaly analysis may use sampled data, compare raw history for ground truth against sampled series for anomaly reproduction.",
  "6. Review the current anomaly findings already found by this integration in the active range and use them to guide deeper inspection.",
  "7. If monitor context is available, fetch relevant monitor anomaly output for additional persisted monitor detail.",
  "- Use UTC timestamps exactly as written for retrieval.",
  "- Convert to the Home Assistant local timezone only when interpreting daily or weekly behavior patterns.",
  "- Do not infer 'no anomaly' from missing raw history when retention may be limited.",
  "- If anomaly queries below use sampled data, inspect both raw history and the sampled representation.",
  "- For long ranges, remember HA history pagination and retention constraints can change what raw coverage is available.",
  "No selected entities are currently available in the panel state.",
  "- Resolved metadata per selected entity, including unit, device class, state class, area, device, labels, and platform when available.",
  "- Coverage status of raw history versus statistics, including any retention or pagination limits encountered.",
  "- Detailed anomaly findings per entity for the requested range, using the current integration findings above plus any fetched raw cluster detail.",
  "- If anomalies indicate some type of event, zoom out and look for answers in the related area/group/labels or across other entities in the panel. If anomalies are unexpected, look for any subtle metadata clues that could explain them, such as a device class or state class that implies a different expected behavior pattern than initially assumed.",
  "- Correlated anomaly periods across the selected datapoints, if any are present, including which entities participate and when the overlap occurs.",
  "- Any monitor-access, permission, sampling, comparison-window, or data-coverage limitations that materially affect interpretation.",
  "Comparison window detail: the configured comparison window is not currently selected, so use the window id above to resolve the saved date window before querying.",
]);

// ── Glob all component-level i18n files ───────────────────────────────────────
// The pattern '../../../**/i18n/*.ts' is resolved from this test file's location
// (src/lib/i18n/__tests__/) and matches every file at any depth whose parent
// directory is named 'i18n'.
// Files that do NOT export `translations` (e.g. localize.ts, types.ts) are
// silently skipped during the map-building step below.

const allI18nModules = import.meta.glob<{
  translations?: Record<string, string>;
}>("../../../**/i18n/*.ts", { eager: true });

// ── Build a structured map: componentPath → locale → translations ─────────────

type TranslationMap = Record<string, string>;
type ComponentMap = Record<
  string,
  Partial<Record<SupportedLocale, TranslationMap>>
>;

function buildComponentMap(): ComponentMap {
  const map: ComponentMap = {};

  for (const [filePath, module] of Object.entries(allI18nModules)) {
    if (!module?.translations || typeof module.translations !== "object") {
      continue;
    }

    const localeMatch = filePath.match(/\/i18n\/([^/]+)\.ts$/);
    if (!localeMatch) {
      continue;
    }

    const locale = localeMatch[1].toLowerCase() as SupportedLocale;
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
      continue;
    }

    // Component path = everything before /i18n/<locale>.ts
    const componentPath = filePath.replace(/\/i18n\/[^/]+\.ts$/, "");

    if (!map[componentPath]) {
      map[componentPath] = {};
    }
    map[componentPath][locale] = module.translations as TranslationMap;
  }

  return map;
}

const componentMap = buildComponentMap();
const componentPaths = Object.keys(componentMap).sort();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shorten an absolute-ish path to just src/…/component for legible test names. */
function shortPath(p: string): string {
  const idx = p.lastIndexOf("/src/");
  return idx === -1 ? p : p.slice(idx + 1);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Frontend translation coverage", () => {
  it("GIVEN the glob WHEN resolved THEN discovers at least 10 component i18n directories", () => {
    expect(
      componentPaths.length,
      `Only found ${componentPaths.length} components — glob may have broken`
    ).toBeGreaterThanOrEqual(10);
  });

  describe("locale file presence", () => {
    for (const componentPath of componentPaths) {
      const presentLocales = Object.keys(
        componentMap[componentPath]
      ) as SupportedLocale[];
      const component = shortPath(componentPath);

      it(`GIVEN ${component} WHEN locale files checked THEN all ${SUPPORTED_LOCALES.length} locales are present`, () => {
        const missing = SUPPORTED_LOCALES.filter(
          (l) => !presentLocales.includes(l)
        );
        expect(
          missing,
          `${component} is missing locale files: ${missing.join(", ")}`
        ).toEqual([]);
      });
    }
  });

  describe("key completeness", () => {
    for (const componentPath of componentPaths) {
      const localeTranslations = componentMap[componentPath];
      const component = shortPath(componentPath);

      // The canonical key set is the union of keys across all locale files.
      // Any key present in one locale must be present in all others.
      const allKeys = new Set<string>(
        Object.values(localeTranslations).flatMap((t) => Object.keys(t ?? {}))
      );

      for (const locale of SUPPORTED_LOCALES) {
        const translations = localeTranslations[locale] ?? {};

        it(`GIVEN ${component} WHEN ${locale} checked THEN no keys are missing`, () => {
          const missing = [...allKeys].filter((k) => !(k in translations));
          expect(
            missing,
            `${component}/${locale} is missing keys:\n${missing.map((k) => `  "${k}"`).join("\n")}`
          ).toEqual([]);
        });

        it(`GIVEN ${component} WHEN ${locale} checked THEN no stale extra keys exist`, () => {
          const extra = Object.keys(translations).filter(
            (k) => !allKeys.has(k)
          );
          expect(
            extra,
            `${component}/${locale} has stale extra keys:\n${extra.map((k) => `  "${k}"`).join("\n")}`
          ).toEqual([]);
        });
      }
    }
  });

  describe("translation completeness (value ≠ source key)", () => {
    for (const componentPath of componentPaths) {
      const localeTranslations = componentMap[componentPath];
      const component = shortPath(componentPath);

      for (const locale of SUPPORTED_LOCALES) {
        const translations = localeTranslations[locale] ?? {};

        it(`GIVEN ${component} WHEN ${locale} values checked THEN no strings are untranslated`, () => {
          const untranslated = Object.entries(translations)
            .filter(
              ([key, value]) =>
                value === key && !UNTRANSLATED_WHITELIST.has(key)
            )
            .map(([key]) => key);

          expect(
            untranslated,
            `${component}/${locale} contains values identical to their English source key.\n` +
              `Either translate these strings or add them to UNTRANSLATED_WHITELIST with a justification:\n${untranslated
                .map((k) => `  "${k}"`)
                .join("\n")}`
          ).toEqual([]);
        });
      }
    }
  });
});
