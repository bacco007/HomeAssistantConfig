import { interpolatePlaceholders } from "@/lib/i18n/interpolate";

export type I18nMap = Readonly<Record<string, string>>;

export const EMPTY_I18N: I18nMap = Object.freeze({});

export function createDefaultI18n(keys: readonly string[]): I18nMap {
  const entries: Record<string, string> = {};
  for (const key of keys) {
    entries[key] = key;
  }
  return Object.freeze(entries);
}

export function t(
  i18n: Record<string, string> | undefined,
  key: string,
  ...values: Array<string | number>
): string {
  const template = i18n && Object.hasOwn(i18n, key) ? i18n[key] : key;
  return interpolatePlaceholders(template, values);
}
