from homeassistant.core import HomeAssistant
from homeassistant.helpers.translation import async_get_cached_translations

from .translatable_template import TranslatableTemplate



class AllTranslations(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages: list[str]) -> None:
        super().__init__(hass, available_languages)

    def __call__(self, language: str | None = None) -> dict[str, str]:
        language = self._validate_language(language)
        translations = {}
        translations.update(async_get_cached_translations(self._hass, language, "state"))
        translations.update(async_get_cached_translations(self._hass, language, "entity"))
        translations.update(async_get_cached_translations(self._hass, language, "entity_component"))
        return translations

    def __repr__(self) -> str:
        return "<template CT_AllTranslations>"
