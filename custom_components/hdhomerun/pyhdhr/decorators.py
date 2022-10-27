"""Decorators."""

# region #-- imports --#
from __future__ import annotations

import functools

from .const import DiscoverMode
from .exceptions import HDHomeRunDeviceHasNoSession, HDHomeRunDeviceMustBeHTTP

# endregion


def needs_http(func):
    """Ensure that the device used the HTTP discovery method."""

    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        """Wrap the required function."""
        if self.discovery_method is not DiscoverMode.HTTP:
            raise HDHomeRunDeviceMustBeHTTP from None

        if getattr(self, "_session", None) is None:
            raise HDHomeRunDeviceHasNoSession from None

        ret = func(self, *args, **kwargs)
        return ret

    return wrapper
