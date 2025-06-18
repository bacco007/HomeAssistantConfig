"""Config update helper.

External imports: None
"""

from functools import partial, wraps
from inspect import iscoroutinefunction

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

_SUPRESS_CONFIG_UPDATE_LISTENER = "_supress_config_update_listener"


# ------------------------------------------------------
def set_supress_config_update_listener(
    func=None,
):
    """Decorator to set config update listener should be supressed."""  # noqa: D401

    if func is None:
        return partial(set_supress_config_update_listener)

    # -------------------------
    def decorator_wrap(func):
        # -------------------------
        @wraps(func)
        def wrapper_method(func_self, *args, **kwargs):
            setattr(func_self, _SUPRESS_CONFIG_UPDATE_LISTENER, True)
            return func(func_self, *args, **kwargs)

        # -------------------------
        @wraps(func)
        async def async_wrapper_method(func_self, *args, **kwargs):
            setattr(func_self, _SUPRESS_CONFIG_UPDATE_LISTENER, True)
            return await func(func_self, *args, **kwargs)

        if iscoroutinefunction(func):
            return async_wrapper_method
        return wrapper_method

    return decorator_wrap(func)


# ------------------------------------------------------
def check_supress_config_update_listener(
    func=None,
    *,
    object_name: str = "component_api",
):
    """Decorator to handle if config update listener should be supressed."""  # noqa: D401

    if func is None:
        return partial(
            check_supress_config_update_listener,
            object_name=object_name,
        )

    # -------------------------
    def decorator_wrap(func):
        # -------------------------
        @wraps(func)
        async def async_wrapper_method(
            hass: HomeAssistant,
            config_entry: ConfigEntry,
        ):
            if hasattr(config_entry.runtime_data, object_name):
                tmp_attr = getattr(config_entry.runtime_data, object_name)
                if hasattr(tmp_attr, _SUPRESS_CONFIG_UPDATE_LISTENER):
                    tmp_bool = getattr(tmp_attr, _SUPRESS_CONFIG_UPDATE_LISTENER)
                    if isinstance(tmp_bool, bool) and tmp_bool:
                        setattr(tmp_attr, _SUPRESS_CONFIG_UPDATE_LISTENER, False)
                        return None

            return await func(hass, config_entry)

        return async_wrapper_method

    return decorator_wrap(func)
