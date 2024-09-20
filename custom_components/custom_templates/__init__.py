import logging
from typing import Any, Callable
from jinja2 import pass_context

from homeassistant.const import EVENT_COMPONENT_LOADED
from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.template import Template, TemplateEnvironment
from homeassistant.helpers.translation import _TranslationCache, TRANSLATION_FLATTEN_CACHE

from .const import (DOMAIN, CUSTOM_TEMPLATES_SCHEMA, CONF_PRELOAD_TRANSLATIONS, CONST_EVAL_FUNCTION_NAME,
                    CONST_STATE_TRANSLATED_FUNCTION_NAME, CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME,
                    CONST_TRANSLATED_FUNCTION_NAME, CONST_ALL_TRANSLATIONS_FUNCTION_NAME,
                    CONST_IS_AVAILABLE_FUNCTION_NAME,
                    CONST_DICT_MERGE_FUNCTION_NAME)
from .templates.all_translations import AllTranslations
from .templates.dict_merge import DictMerge
from .templates.eval_template import EvalTemplate
from .templates.is_available import IsAvailable
from .templates.state_attr_translated import StateAttrTranslated
from .templates.state_translated import StateTranslated
from .templates.translated import Translated

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = CUSTOM_TEMPLATES_SCHEMA
ConfigType = dict[str, Any]


# noinspection PyProtectedMember
def setup(hass: HomeAssistant, config: ConfigType) -> bool:
    if DOMAIN not in config:
        return True
    languages = []
    if CONF_PRELOAD_TRANSLATIONS in config[DOMAIN] and len(config[DOMAIN][CONF_PRELOAD_TRANSLATIONS]) > 0:
        languages = config[DOMAIN][CONF_PRELOAD_TRANSLATIONS]
    else:
        languages = [hass.config.language]
    cache: _TranslationCache = hass.data[TRANSLATION_FLATTEN_CACHE]

    async def _async_load_translations(_: Event) -> None:
        for language in languages:
            _LOGGER.debug("Loading translations for language: %s", language)
            components = set(filter(lambda c: "." not in c, hass.config.components))
            await cache.async_load(language, components)

    hass.bus.async_listen(
        EVENT_COMPONENT_LOADED,
        _async_load_translations
    )

    state_translated_template = StateTranslated(hass, languages)
    state_attr_translated_template = StateAttrTranslated(hass, languages)
    translated_template = Translated(hass, languages)
    all_translations_template = AllTranslations(hass, languages)
    eval_template = pass_context(EvalTemplate(hass))
    is_available_template = IsAvailable(hass)
    dict_merge_template = DictMerge(hass)

    def is_safe_callable(self: TemplateEnvironment, obj) -> bool:
        # noinspection PyUnresolvedReferences
        return (isinstance(obj, (
            StateTranslated, StateAttrTranslated, EvalTemplate, Translated, AllTranslations, IsAvailable, DictMerge))
                or self.ct_original_is_safe_callable(obj))

    def patch_environment(env: TemplateEnvironment) -> None:
        env.globals[CONST_STATE_TRANSLATED_FUNCTION_NAME] = state_translated_template
        env.globals[CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME] = state_attr_translated_template
        env.globals[CONST_TRANSLATED_FUNCTION_NAME] = translated_template
        env.globals[CONST_ALL_TRANSLATIONS_FUNCTION_NAME] = all_translations_template
        env.globals[CONST_EVAL_FUNCTION_NAME] = eval_template
        env.globals[CONST_IS_AVAILABLE_FUNCTION_NAME] = is_available_template
        env.globals[CONST_DICT_MERGE_FUNCTION_NAME] = dict_merge_template
        env.filters[CONST_STATE_TRANSLATED_FUNCTION_NAME] = state_translated_template
        env.filters[CONST_STATE_ATTR_TRANSLATED_FUNCTION_NAME] = state_attr_translated_template
        env.filters[CONST_TRANSLATED_FUNCTION_NAME] = translated_template
        env.filters[CONST_EVAL_FUNCTION_NAME] = eval_template
        env.filters[CONST_IS_AVAILABLE_FUNCTION_NAME] = is_available_template
        env.filters[CONST_DICT_MERGE_FUNCTION_NAME] = dict_merge_template

    def patched_init(
            self: TemplateEnvironment,
            hass_param: HomeAssistant | None,
            limited: bool | None = False,
            strict: bool | None = False,
            log_fn: Callable[[int, str], None] | None = None,
    ) -> None:
        # noinspection PyUnresolvedReferences
        self.ct_original__init__(hass_param, limited, strict, log_fn)
        patch_environment(self)

    if not hasattr(TemplateEnvironment, 'ct_original__init__'):
        TemplateEnvironment.ct_original__init__ = TemplateEnvironment.__init__
        TemplateEnvironment.__init__ = patched_init

    if not hasattr(TemplateEnvironment, 'ct_original_is_safe_callable'):
        TemplateEnvironment.ct_original_is_safe_callable = TemplateEnvironment.is_safe_callable
        TemplateEnvironment.is_safe_callable = is_safe_callable

    tpl = Template("", hass)
    tpl._strict = False
    tpl._limited = False
    patch_environment(tpl._env)
    tpl._strict = True
    tpl._limited = False
    patch_environment(tpl._env)

    return True
