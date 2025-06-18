"""Json storage.

External imports: jsonpickle
"""

from collections.abc import Callable
import inspect
from typing import Any

import jsonpickle

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class StoreMigrate(Store):
    """When migration storage layout."""

    custom_migrate_func: Callable[[int, int, Any], Any] | None = None

    # ------------------------------------------------------------------
    async def _async_migrate_func(
        self,
        old_major_version: int,
        old_minor_version: int,
        old_data: Any,
    ) -> Any:
        """Migrate to the new version."""

        if self.custom_migrate_func is not None:
            if inspect.iscoroutinefunction(self.custom_migrate_func):
                return await self.custom_migrate_func(
                    old_major_version, old_minor_version, old_data
                )

            return self.custom_migrate_func(
                old_major_version, old_minor_version, old_data
            )
        return old_data


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class StorageJson:
    """Json storage class.

    This class is used to store data in a json file.

    External imports: jsonpickle
    """

    def __init__(
        self,
        hass: HomeAssistant,
        key: str,
        version: int = 1,
        minor_version: int = 1,
        async_migrate_func: Callable[[int, int, Any], Any] | None = None,
    ) -> None:
        """Init."""

        self.DICT_KEY___ = "jsonpickle"
        self.write_hidden_attributes___: bool = False
        self.hass___ = hass
        self.store___ = StoreMigrate(
            self.hass___,
            version,
            key,
            minor_version=minor_version,
        )
        self.store___.custom_migrate_func = async_migrate_func
        self.base_class___ = self.__class__ is StorageJson

    # ------------------------------------------------------------------
    async def async_read_settings(self) -> dict | None:
        """read_settings."""

        tmp_dict: dict = None

        data = await self.store___.async_load()

        if data is None:
            return None

        if type(data) is dict:
            if self.DICT_KEY___ in data:
                jsonpickle.set_encoder_options("json", ensure_ascii=False)
                tmp_obj = self.decode_data(data[self.DICT_KEY___])
                del data[self.DICT_KEY___]

            if len(data) > 0:
                tmp_dict = data
        else:
            tmp_obj = self.decode_data(data)

        if not self.base_class___:
            if not hasattr(tmp_obj, "__dict__"):
                return tmp_dict
            self.__dict__.update(tmp_obj.__dict__)

        return tmp_dict

    # ------------------------------------------------------------------
    def decode_data(self, data: Any):
        """Decode data."""
        return jsonpickle.decode(data)

    # ------------------------------------------------------------------
    async def async_write_settings(self, extra_data: dict = {}) -> None:
        """Write settings."""

        jsonpickle.set_encoder_options("json", ensure_ascii=False)

        if self.base_class___:
            await self.store___.async_save(extra_data)

        else:
            await self.store___.async_save(
                {self.DICT_KEY___: self.encode_data(self), **extra_data}
            )

    # ------------------------------------------------------------------
    def encode_data(self, data: Any):
        """Encode data."""
        return jsonpickle.encode(data, unpicklable=True)

    # ------------------------------------------------------------------
    async def async_remove_settings(self) -> None:
        """Remove settings."""
        await self.store___.async_remove()

    # ------------------------------------------------------------------
    def __getstate__(self) -> dict:
        """Get state."""
        tmp_dict = self.__dict__.copy()
        del tmp_dict["write_hidden_attributes___"]
        del tmp_dict["hass___"]
        del tmp_dict["store___"]
        del tmp_dict["DICT_KEY___"]
        del tmp_dict["base_class___"]

        if self.write_hidden_attributes___ is False:
            try:

                def remove_hidden_attrib(obj) -> None:
                    for key in list(obj):
                        if len(key) > 2 and key[0:2] == "__":
                            continue
                        elif hasattr(obj[key], "__dict__"):  # noqa: RET507
                            remove_hidden_attrib(obj[key].__dict__)

                        # Remove hidden attributes
                        elif len(key) > 3 and key[-3:] == "___":
                            del obj[key]

                        elif isinstance(obj[key], list):
                            for item in obj[key]:
                                if hasattr(item, "__dict__"):
                                    remove_hidden_attrib(item.__dict__)

                remove_hidden_attrib(tmp_dict)
            except Exception:  # noqa: BLE001
                pass
        return tmp_dict
