export type ComponentTranslations = RecordWithStringValues;

// Shape import.meta.glob returns for eager i18n imports
export type I18nGlobResult = Record<
  string,
  { translations: ComponentTranslations }
>;
