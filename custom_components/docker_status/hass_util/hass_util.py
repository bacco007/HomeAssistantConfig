"""Hass util."""

from functools import partial, wraps
from inspect import iscoroutinefunction

from packaging.version import Version

from homeassistant.components.frontend import storage as frontend_store
from homeassistant.const import (
    MAJOR_VERSION as HASS_MAJOR_VERSION,
    MINOR_VERSION as HASS_MINOR_VERSION,
)
from homeassistant.core import HomeAssistant, async_get_hass


# ------------------------------------------------------
# ------------------------------------------------------
class AsyncException(Exception):
    """Exception for argument errors.

    Args:
        Exception (_type_): _description_

    """


# ------------------------------------------------------
# ------------------------------------------------------
class ArgumentException(Exception):
    """Exception for argument errors.

    Args:
        Exception (_type_): _description_

    """


# ------------------------------------------------------
def object_to_state_attr_dict(
    obj: object, exclude_list: list = [], exlude_underscore_attrs: bool = True
) -> dict:
    """Convert object to hass state attribute dict."""
    state_attr_dict: dict = {}

    if obj is None:
        return state_attr_dict

    for key, value in obj.__dict__.items():
        if key in exclude_list:
            continue

        if exlude_underscore_attrs and key.startswith("_"):
            continue

        state_attr_dict[key.lower().replace("_", " ")] = value

    return state_attr_dict


# ------------------------------------------------------
async def async_get_user_language() -> str:
    """Execute a method in async mode in hass."""

    hass: HomeAssistant = async_get_hass()

    language: str = hass.config.language

    owner = await hass.auth.async_get_owner()

    if Version(f"{HASS_MAJOR_VERSION}.{HASS_MINOR_VERSION}") < Version("2025.6"):
        if owner is not None:
            _, owner_data = await frontend_store.async_user_store(hass, owner.id)

            if "language" in owner_data and "language" in owner_data["language"]:
                language = owner_data["language"]["language"]
    elif owner is not None:
        owner_data = await frontend_store.async_user_store(hass, owner.id)

        owner_data = await frontend_store.async_user_store(hass, owner.id)
        if "language" in owner_data.data and "language" in owner_data.data["language"]:
            language = owner_data.data["language"]["language"]
    return language


# ------------------------------------------------------
def async_hass_add_executor_job(
    func=None,
):
    """Decorator to execute a method in async mode in hass."""  # noqa: D401

    if func is None:
        return partial(
            async_hass_add_executor_job,
        )

    # -------------------------
    def decorator_wrap(func):
        # -------------------------
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if iscoroutinefunction(func):
                raise AsyncException("Async method not supperted")

            if len(args) == 0:
                raise ArgumentException('Missing "self" argument')

            return await async_get_hass().async_add_executor_job(
                partial(
                    func,
                    *args,
                    **kwargs,
                )
            )

        return async_wrapper

    return decorator_wrap(func)
