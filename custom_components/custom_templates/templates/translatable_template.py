from homeassistant.core import HomeAssistant
from homeassistant.exceptions import TemplateError


class TranslatableTemplate:

    def __init__(self, hass: HomeAssistant, available_languages: list[str]) -> None:
        self._hass = hass
        self._available_languages = available_languages

    def validate_language(self, language: str | None = None) -> str:
        if language is None:
            return self._hass.config.language
        if language not in self._available_languages:
            raise TemplateError(f"Language {language} is not loaded")  # type: ignore[arg-type]
        return language