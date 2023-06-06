import asyncio
from collections import ChainMap
import logging

from homeassistant.exceptions import TemplateError
from homeassistant.const import EVENT_COMPONENT_LOADED, STATE_UNKNOWN
from homeassistant.core import Event, HomeAssistant, valid_entity_id
from homeassistant.helpers.entity_registry import async_get
from homeassistant.helpers.template import _get_state_if_valid, _RESERVED_NAMES, Template, TemplateEnvironment
from homeassistant.helpers.translation import _TranslationCache, TRANSLATION_FLATTEN_CACHE, TRANSLATION_LOAD_LOCK
from homeassistant.loader import bind_hass

from .const import (DOMAIN, CUSTOM_TEMPLATES_SCHEMA, CONF_PRELOAD_TRANSLATIONS, CONST_EVAL_FUNCTION_NAME,
                    CONST_STATE_TRANSLATED_FUNCTION_NAME, CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME,
                    CONST_TRANSLATED_FUNCTION_NAME, CONST_ALL_TRANSLATIONS_FUNCTION_NAME)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = CUSTOM_TEMPLATES_SCHEMA


class TranslatableTemplate:

    def __init__(self, hass: HomeAssistant, available_languages):
        self._hass = hass
        self._available_languages = available_languages

    def validate_language(self, language):
        if language not in self._available_languages:
            raise TemplateError(f"Language {language} is not loaded")  # type: ignore[arg-type]


class StateTranslated(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages):
        super().__init__(hass, available_languages)

    def __call__(self, entity_id: str, language: str):
        self.validate_language(language)
        state = None
        if "." in entity_id:
            state = _get_state_if_valid(self._hass, entity_id)

        else:
            if entity_id in _RESERVED_NAMES:
                return None

            if not valid_entity_id(f"{entity_id}.entity"):
                raise TemplateError(f"Invalid domain name '{entity_id}'")  # type: ignore[arg-type]

        if state is None:
            return STATE_UNKNOWN
        entry = async_get(self._hass).async_get(entity_id)
        domain = state.domain
        device_class = "_"
        if "device_class" in state.attributes:
            device_class = state.attributes["device_class"]

        translations = get_cached_translations(self._hass, language, "entity_component")
        key = f"component.{domain}.entity_component.{device_class}.state.{state.state}"
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        if (entry is not None and
                entry.unique_id is not None and
                hasattr(entry, "translation_key") and
                entry.translation_key is not None):
            key = f"component.{entry.platform}.entity.{domain}.{entry.translation_key}.state.{state.state}"
            translations = get_cached_translations(self._hass, language, "entity")
        if len(translations) > 0 and key in translations:
            return str(translations[key])

        key = f"component.{domain}.state.{device_class}.{state.state}"
        translations = get_cached_translations(self._hass, language, "state", domain)
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        _LOGGER.warning(f"No translation found for entity: {entity_id}")
        return state.state

    def __repr__(self):
        return "<template StateTranslated>"


class StateAttrTranslated(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages):
        super().__init__(hass, available_languages)

    def __call__(self, entity_id: str, attribute: str, language: str):
        self.validate_language(language)
        state = None
        if "." in entity_id:
            state = _get_state_if_valid(self._hass, entity_id)

        else:
            if entity_id in _RESERVED_NAMES:
                return None

            if not valid_entity_id(f"{entity_id}.entity"):
                raise TemplateError(f"Invalid domain name '{entity_id}'")  # type: ignore[arg-type]

        if state is None:
            return STATE_UNKNOWN
        attribute_value = None
        if attribute in state.attributes:
            attribute_value = state.attributes.get(attribute)
        entry = async_get(self._hass).async_get(entity_id)
        domain = state.domain
        device_class = "_"
        if "device_class" in state.attributes:
            device_class = state.attributes["device_class"]

        translations = get_cached_translations(self._hass, language, "entity_component")
        key = f"component.{domain}.entity_component.{device_class}.state_attributes.{attribute}.state.{attribute_value}"
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        if (entry is not None and
                entry.unique_id is not None and
                hasattr(entry, "translation_key") and
                entry.translation_key is not None):
            key = f"component.{entry.platform}.entity.{domain}.{entry.translation_key}.state_attributes.{attribute}.state.{attribute_value}"
            translations = get_cached_translations(self._hass, language, "entity")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        _LOGGER.warning(f"No translation found for entity: {entity_id} and attribute: {attribute}")
        return attribute_value

    def __repr__(self):
        return "<template StateAttrTranslated>"


class Translated(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages):
        super().__init__(hass, available_languages)

    def __call__(self, key: str, language: str):
        self.validate_language(language)
        translations = get_cached_translations(self._hass, language, "state")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        translations = get_cached_translations(self._hass, language, "entity_component")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        translations = get_cached_translations(self._hass, language, "entity")
        if len(translations) > 0 and key in translations:
            return str(translations[key])
        _LOGGER.warning(f"No translation found for key: {key}")
        return key

    def __repr__(self):
        return "<template Translated>"


class AllTranslations(TranslatableTemplate):

    def __init__(self, hass: HomeAssistant, available_languages):
        super().__init__(hass, available_languages)

    def __call__(self, language: str):
        self.validate_language(language)
        translations = {}
        translations.update(get_cached_translations(self._hass, language, "state"))
        translations.update(get_cached_translations(self._hass, language, "entity"))
        translations.update(get_cached_translations(self._hass, language, "entity_component"))
        return translations

    def __repr__(self):
        return "<template AllTranslations>"


class EvalTemplate:

    def __init__(self, hass: HomeAssistant):
        self._hass = hass

    def __call__(self, content: str):
        tpl = Template(content, self._hass)
        return tpl.async_render()

    def __repr__(self):
        return "<template EvalTemplate>"


def get_cached(
        self,
        language: str,
        category: str,
        components: set[str],
):
    cached = self.cache.get(language, {})
    return [cached.get(component, {}).get(category, {}) for component in components]


@bind_hass
async def load_translations_to_cache(
        hass: HomeAssistant,
        language: str,
):
    lock = hass.data.setdefault(TRANSLATION_LOAD_LOCK, asyncio.Lock())

    components_entities = {
        component for component in hass.config.components if "." not in component
    }
    components_state = set(hass.config.components)

    async with lock:
        cache = hass.data.setdefault(TRANSLATION_FLATTEN_CACHE, _TranslationCache(hass))
        await cache.async_fetch(language, "entity", components_entities)
        await cache.async_fetch(language, "states", components_state)
        await cache.async_fetch(language, "entity_component", components_state)


@bind_hass
def get_cached_translations(
        hass: HomeAssistant,
        language: str,
        category: str,
        integration=None,
):
    if integration is not None:
        components = {integration}
    elif category == "state":
        components = set(hass.config.components)
    else:
        components = {
            component for component in hass.config.components if "." not in component
        }

    cache = hass.data.setdefault(TRANSLATION_FLATTEN_CACHE, _TranslationCache(hass))
    cached = cache.get_cached(language, category, components)

    return dict(ChainMap(*cached))


# noinspection PyProtectedMember
def setup(hass, config):
    if DOMAIN not in config:
        return True
    languages = []
    if CONF_PRELOAD_TRANSLATIONS in config[DOMAIN]:
        languages = config[DOMAIN][CONF_PRELOAD_TRANSLATIONS]

        async def load_translations(_event: Event):
            for language in languages:
                await load_translations_to_cache(hass, language)

        hass.bus.async_listen(EVENT_COMPONENT_LOADED, load_translations)

    _TranslationCache.get_cached = get_cached

    def is_safe_callable(self, obj):
        return (isinstance(obj, (StateTranslated, StateAttrTranslated, EvalTemplate, Translated, AllTranslations))
                or self.is_safe_callable_old(obj))

    def patch_environment(env: TemplateEnvironment):
        env.globals[CONST_STATE_TRANSLATED_FUNCTION_NAME] = state_translated_template
        env.globals[CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME] = state_attr_translated_template
        env.globals[CONST_TRANSLATED_FUNCTION_NAME] = translated_template
        env.globals[CONST_ALL_TRANSLATIONS_FUNCTION_NAME] = all_translations_template
        env.globals[CONST_EVAL_FUNCTION_NAME] = eval_template
        env.filters[CONST_STATE_TRANSLATED_FUNCTION_NAME] = state_translated_template
        env.filters[CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME] = state_attr_translated_template
        env.filters[CONST_TRANSLATED_FUNCTION_NAME] = translated_template
        env.filters[CONST_EVAL_FUNCTION_NAME] = eval_template

    TemplateEnvironment.is_safe_callable_old = TemplateEnvironment.is_safe_callable
    TemplateEnvironment.is_safe_callable = is_safe_callable

    state_translated_template = StateTranslated(hass, languages)
    state_attr_translated_template = StateAttrTranslated(hass, languages)
    translated_template = Translated(hass, languages)
    all_translations_template = AllTranslations(hass, languages)
    eval_template = EvalTemplate(hass)
    tpl = Template("", hass)
    tpl._strict = False
    tpl._limited = False
    patch_environment(tpl._env)
    tpl._strict = True
    tpl._limited = False
    patch_environment(tpl._env)

    return True
