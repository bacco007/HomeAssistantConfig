from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.translation import async_get_cached_translations


@callback
def async_translate_state(
        hass: HomeAssistant,
        language: str,
        state: str,
        domain: str,
        platform: str | None,
        translation_key: str | None,
        device_class: str | None,
) -> str:
    """Translate provided state using cached translations for currently selected language."""
    if state in [STATE_UNAVAILABLE, STATE_UNKNOWN]:
        return state
    if platform is not None and translation_key is not None:
        localize_key = (
            f"component.{platform}.entity.{domain}.{translation_key}.state.{state}"
        )
        translations = async_get_cached_translations(hass, language, "entity")
        if localize_key in translations:
            return translations[localize_key]

    translations = async_get_cached_translations(hass, language, "entity_component")
    if device_class is not None:
        localize_key = (
            f"component.{domain}.entity_component.{device_class}.state.{state}"
        )
        if localize_key in translations:
            return translations[localize_key]
    localize_key = f"component.{domain}.entity_component._.state.{state}"
    if localize_key in translations:
        return translations[localize_key]

    translations = async_get_cached_translations(hass, language, "state", domain)
    if device_class is not None:
        localize_key = f"component.{domain}.state.{device_class}.{state}"
        if localize_key in translations:
            return translations[localize_key]
    localize_key = f"component.{domain}.state._.{state}"
    if localize_key in translations:
        return translations[localize_key]

    return state


@callback
def async_translate_state_attribute(
        hass: HomeAssistant,
        language: str,
        attribute: str,
        attribute_value: str,
        domain: str,
        platform: str | None,
        translation_key: str | None,
        device_class: str | None,
) -> str:
    translations_entity_component = async_get_cached_translations(hass, language, "entity_component")
    localize_key = f"component.{domain}.entity_component.{device_class}.state_attributes.{attribute}.state.{attribute_value}"
    if localize_key in translations_entity_component:
        return str(translations_entity_component[localize_key])
    if translation_key is not None and platform is not None:
        localize_key = f"component.{platform}.entity.{domain}.{translation_key}.state_attributes.{attribute}.state.{attribute_value}"
        translations_entity = async_get_cached_translations(hass, language, "entity")
        if localize_key in translations_entity:
            return str(translations_entity[localize_key])
    localize_key = f"component.{domain}.entity_component._.state_attributes.{attribute}.state.{attribute_value}"
    if localize_key in translations_entity_component:
        return str(translations_entity_component[localize_key])
    return attribute_value