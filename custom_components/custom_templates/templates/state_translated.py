from homeassistant.const import STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_registry import async_get
from homeassistant.helpers.template import _get_state_if_valid

from .translatable_template import TranslatableTemplate
from .utils import async_translate_state


class StateTranslated(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages: list[str]) -> None:
        super().__init__(hass, available_languages)

    def __call__(self, entity_id: str, language: str | None = None) -> str:
        language = self.validate_language(language)
        state = _get_state_if_valid(self._hass, entity_id)
        if state is None:
            return STATE_UNKNOWN

        state_value = state.state
        domain = state.domain
        device_class = state.attributes.get("device_class")
        entry = async_get(self._hass).async_get(entity_id)
        platform = None if entry is None else entry.platform
        translation_key = None if entry is None else entry.translation_key

        return async_translate_state(
            self._hass, language, state_value, domain, platform, translation_key, device_class
        )

    def __repr__(self) -> str:
        return "<template CT_StateTranslated>"

