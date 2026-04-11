/// <reference types="vite/client" />
import type { LocaleModule } from "@lit/localize";
import type { I18nGlobResult } from "../types";

// Vite resolves this glob statically at build time into the locale chunk.
// Add an i18n/es.ts file inside any component or module directory
// to have its translations automatically included — no registration needed.
const modules = import.meta.glob<{ translations: RecordWithStringValues }>(
  "../../../**/i18n/es.ts",
  { eager: true }
) as I18nGlobResult;

const merged: RecordWithStringValues = {};
for (const mod of Object.values(modules)) {
  Object.assign(merged, mod.translations);
}

export const templates = merged satisfies LocaleModule["templates"];
