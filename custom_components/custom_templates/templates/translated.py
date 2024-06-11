from homeassistant.core import HomeAssistant
from homeassistant.helpers.translation import async_get_cached_translations

from .translatable_template import TranslatableTemplate


class Translated(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages: list[str]) -> None:
        super().__init__(hass, available_languages)

    def __call__(self, key: str, language: str | None = None) -> str:
        language = self.validate_language(language)
        translations = async_get_cached_translations(self._hass, language, "state")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        translations = async_get_cached_translations(self._hass, language, "entity_component")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        translations = async_get_cached_translations(self._hass, language, "entity")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        return key

    def __repr__(self) -> str:
        return "<template CT_Translated>"