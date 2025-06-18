"""Json extended."""

from contextlib import suppress
from datetime import datetime
from json import loads
from re import compile


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class JsonExt:
    """Json extended."""

    _match_iso8601 = compile(
        r"^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$"
    ).match

    def __init__(self) -> None:
        """Init."""
        self._global_map_keys: dict = {}

    # ------------------------------------------------------------------
    def validate_iso8601(self, str_val):
        """Validate if a String is a ISO8601 value or not."""
        try:
            if self._match_iso8601(str_val) is not None:
                return True
        except:  # noqa: E722
            pass
        return False

    # ------------------------------------------------------------------
    def _decoder(self, obj):
        for key, value in obj.items():
            if isinstance(value, str) and self.validate_iso8601(value):
                with suppress(ValueError, AttributeError, TypeError):
                    obj[key] = datetime.fromisoformat(value)

        return obj

    # ------------------------------------------------------------------
    def set_global_map_keys(self, global_map_keys: dict = {}):
        """Set global map keys."""
        self._global_map_keys = global_map_keys

    # ------------------------------------------------------------------
    def change_nested_keys(self, data, map_keys: dict = {}):
        """Change nested keys."""

        # ----------------------------------------
        def map_key(check_key: str):
            if len(map_keys) == 0:
                return check_key

            if check_key in map_keys:
                return map_keys[check_key]

            for key, value in map_keys.items():
                if (
                    key.startswith("*")
                    and key.endswith("*")
                    and check_key.find(key[1:-1]) >= 0
                ):
                    return check_key.replace(key[1:-1], value, 1)
                if key.startswith("*") and check_key.startswith(key[1:]):
                    return check_key.replace(key[1:], value, 1)
                if key.endswith("*") and check_key.endswith(key[:-1]):
                    return check_key.replace(key[:-1], value, 1)
            return check_key

        # ----------------------------------------

        if isinstance(data, dict):
            new_dict = {}

            for key, value in data.items():
                new_value = self.change_nested_keys(value, map_keys)

                new_dict[map_key(key)] = new_value
            return new_dict

        if isinstance(data, list):
            return [self.change_nested_keys(item, map_keys) for item in data]
        return data

    # ------------------------------------------------------------------
    def json_str_to_dict(self, json_str: str, map_keys: dict = {}) -> dict:
        """Json str to dict."""
        tmp_dict = loads(json_str, object_hook=self._decoder)

        return self.change_nested_keys(tmp_dict, {**self._global_map_keys, **map_keys})


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class DictToObject:
    """Dict to Object."""

    def __init__(self, dictionary: dict):
        """Init."""

        self.dict_to_object(dictionary)

    # ------------------------------------------------------------------
    def dict_to_object(self, dictionary: dict) -> None:
        """Dictonary to Object."""

        for key, value in dictionary.items():
            if isinstance(value, dict):
                setattr(self, key, DictToObject(value))
            elif isinstance(value, list):
                setattr(
                    self,
                    key,
                    [
                        DictToObject(item) if isinstance(item, dict) else item
                        for item in value
                    ],
                )
            else:
                setattr(self, key, value)
