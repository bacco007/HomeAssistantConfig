from __future__ import annotations

import copy
import datetime
import logging
from collections.abc import MutableMapping
from typing import Any

import homeassistant.util.dt as dt_util

_LOGGER = logging.getLogger(__name__)


def _parse_attribute_path(path: str) -> list:
    tokens: list = []
    buffer = ""
    index = 0
    while index < len(path):
        char = path[index]
        if char == ".":
            if buffer:
                tokens.append(buffer)
                buffer = ""
            index += 1
            continue
        if char == "[":
            if buffer:
                tokens.append(buffer)
                buffer = ""
            closing = path.find("]", index)
            if closing == -1:
                raise ValueError(f"Invalid attribute path: {path}")
            index_str = path[index + 1:closing]
            if not index_str.isdigit():
                raise ValueError(f"Invalid list index in attribute path: {path}")
            tokens.append(int(index_str))
            index = closing + 1
            continue
        buffer += char
        index += 1
    if buffer:
        tokens.append(buffer)
    return tokens


def looks_like_attribute_path(path: str) -> bool:
    if "[" in path:
        return True
    if "." not in path:
        return False
    try:
        tokens = _parse_attribute_path(path)
    except ValueError:
        return False
    return len(tokens) > 1


def set_nested_attribute(target: MutableMapping, path: str, value) -> None:
    tokens = _parse_attribute_path(path)
    if not tokens:
        raise ValueError("Attribute path cannot be empty")

    current = target
    for idx, token in enumerate(tokens):
        is_last = idx == len(tokens) - 1
        if isinstance(token, str):
            if not isinstance(current, MutableMapping):
                raise ValueError(
                    f"Expected mapping while navigating attribute path: {path}"
                )
            if is_last:
                current[token] = copy.deepcopy(value)
            else:
                next_token = tokens[idx + 1]
                existing = current.get(token)
                if isinstance(next_token, int):
                    if not isinstance(existing, list):
                        existing = []
                else:
                    if not isinstance(existing, MutableMapping):
                        existing = {}
                current[token] = existing
                current = existing
        else:
            if not isinstance(current, list):
                raise ValueError(
                    f"Expected list while navigating attribute path: {path}"
                )
            next_token = tokens[idx + 1] if not is_last else None
            if is_last:
                while len(current) <= token:
                    current.append(None)
                current[token] = copy.deepcopy(value)
            else:
                next_container: list[Any] | MutableMapping[str, Any] = (
                    [] if isinstance(next_token, int) else {}
                )
                while len(current) <= token:
                    current.append(copy.deepcopy(next_container))
                if isinstance(next_token, int):
                    if not isinstance(current[token], list):
                        current[token] = []
                else:
                    if not isinstance(current[token], MutableMapping):
                        current[token] = {}
                current = current[token]


def merge_attribute_dict(
    existing: MutableMapping | None, updates: MutableMapping
) -> MutableMapping:
    merged: MutableMapping = copy.deepcopy(existing) if existing is not None else {}
    for attr, value in updates.items():
        if isinstance(attr, str) and looks_like_attribute_path(attr):
            set_nested_attribute(merged, attr, value)
        else:
            merged[attr] = copy.deepcopy(value)
    return merged


def to_num(s):
    try:
        return int(s)
    except ValueError:
        try:
            return float(s)
        except ValueError:
            return None


def value_to_type(init_val, dest_type):  # noqa: C901
    if init_val is None or (
        isinstance(init_val, str)
        and init_val.lower() in ["", "none", "unknown", "unavailable"]
    ):
        _LOGGER.debug(f"[value_to_type] return value: {init_val}, returning None")
        return None

    # _LOGGER.debug(f"[value_to_type] initial value: {init_val}, initial type: {type(init_val)}, dest type: {dest_type}")
    if isinstance(init_val, str):
        # _LOGGER.debug("[value_to_type] Processing as string")
        if dest_type is None or dest_type == "string":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val}, type: {type(init_val)}"
            )
            return init_val

        elif dest_type == "date":
            try:
                value_date = datetime.date.fromisoformat(init_val)
            except ValueError:
                _LOGGER.debug(
                    f"Cannot convert string to {dest_type}: {init_val}, returning None"
                )
                raise ValueError(f"Cannot convert string to {dest_type}: {init_val}")
                return None
            else:
                _LOGGER.debug(
                    f"[value_to_type] return value: {value_date}, type: {type(value_date)}"
                )
                return value_date

        elif dest_type == "datetime":
            try:
                value_datetime = datetime.datetime.fromisoformat(init_val)
            except ValueError:
                _LOGGER.debug(
                    f"Cannot convert string to {dest_type}: {init_val}, returning None"
                )
                raise ValueError(f"Cannot convert string to {dest_type}: {init_val}")
                return None
            else:
                _LOGGER.debug(
                    f"[value_to_type] return value: {value_datetime}, type: {type(value_datetime)}"
                )
                if (
                    value_datetime.tzinfo is None
                    or value_datetime.tzinfo.utcoffset(value_datetime) is None
                ):
                    return value_datetime.replace(tzinfo=dt_util.UTC)
                return value_datetime

        elif dest_type == "number":
            if (value_num := to_num(init_val)) is not None:
                _LOGGER.debug(
                    f"[value_to_type] return value: {value_num}, type: {type(value_num)}"
                )
                return value_num
            else:
                _LOGGER.debug(
                    f"Cannot convert string to {dest_type}: {init_val}, returning None"
                )
                raise ValueError(f"Cannot convert string to {dest_type}: {init_val}")
        else:
            _LOGGER.debug(f"Invalid dest_type: {dest_type}, returning None")
            raise ValueError(f"Invalid dest_type: {dest_type}")
            return None
    elif isinstance(init_val, int) or isinstance(init_val, float):
        # _LOGGER.debug("[value_to_type] Processing as number")
        if dest_type is None or dest_type == "string":
            _LOGGER.debug(
                f"[value_to_type] return value: {str(init_val)}, type: {type(str(init_val))}"
            )
            return str(init_val)
        elif dest_type == "date":
            try:
                value_date = datetime.date.fromisoformat(str(init_val))
            except ValueError:
                _LOGGER.debug(
                    f"Cannot convert number to {dest_type}: {init_val}, returning None"
                )
                raise ValueError(f"Cannot convert number to {dest_type}: {init_val}")
                return None
            else:
                _LOGGER.debug(
                    f"[value_to_type] return value: {value_date}, type: {type(value_date)}"
                )
                return value_date

        elif dest_type == "datetime":
            try:
                value_datetime = datetime.datetime.fromisoformat(str(init_val))
            except ValueError:
                _LOGGER.debug(
                    f"Cannot convert number to {dest_type}: {init_val}, returning None"
                )
                raise ValueError(f"Cannot convert number to {dest_type}: {init_val}")
                return None
            else:
                _LOGGER.debug(
                    f"[value_to_type] return value: {value_datetime}, type: {type(value_datetime)}"
                )
                if (
                    value_datetime.tzinfo is None
                    or value_datetime.tzinfo.utcoffset(value_datetime) is None
                ):
                    return value_datetime.replace(tzinfo=dt_util.UTC)
                return value_datetime
        elif dest_type == "number":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val}, type: {type(init_val)}"
            )
            return init_val
        else:
            _LOGGER.debug(f"Invalid dest_type: {dest_type}, returning None")
            raise ValueError(f"Invalid dest_type: {dest_type}")
            return None
    elif isinstance(init_val, datetime.date) and type(init_val) is datetime.date:
        # _LOGGER.debug("[value_to_type] Processing as date")
        if dest_type is None or dest_type == "string":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val.isoformat()}, type: {type(init_val.isoformat())}"
            )
            return init_val.isoformat()
        elif dest_type == "date":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val}, type: {type(init_val)}"
            )
            return init_val
        elif dest_type == "datetime":
            _LOGGER.debug(
                f"[value_to_type] return value: {datetime.datetime.combine(init_val, datetime.time.min)}, "
                + f"type: {type(datetime.datetime.combine(init_val, datetime.time.min))}"
            )
            return datetime.datetime.combine(init_val, datetime.time.min)
        elif dest_type == "number":
            _LOGGER.debug(
                f"[value_to_type] return value: {datetime.datetime.combine(init_val, datetime.time.min).timestamp()}, "
                + f"type: {type(datetime.datetime.combine(init_val, datetime.time.min).timestamp())}"
            )
            return datetime.datetime.combine(init_val, datetime.time.min).timestamp()
        else:
            _LOGGER.debug(f"Invalid dest_type: {dest_type}, returning None")
            raise ValueError(f"Invalid dest_type: {dest_type}")
            return None
    elif (
        isinstance(init_val, datetime.datetime) and type(init_val) is datetime.datetime
    ):
        # _LOGGER.debug("[value_to_type] Processing as datetime")
        if dest_type is None or dest_type == "string":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val.isoformat()}, type: {type(init_val.isoformat())}"
            )
            return init_val.isoformat()
        elif dest_type == "date":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val.date()}, type: {type(init_val.date())}"
            )
            return init_val.date()
        elif dest_type == "datetime":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val}, type: {type(init_val)}"
            )
            return init_val
        elif dest_type == "number":
            _LOGGER.debug(
                f"[value_to_type] return value: {init_val.timestamp()}, type: {type(init_val.timestamp())}"
            )
            return init_val.timestamp()
        else:
            _LOGGER.debug(f"Invalid dest_type: {dest_type}, returning None")
            raise ValueError(f"Invalid dest_type: {dest_type}")
            return None
    else:
        _LOGGER.debug(f"Invalid initial type: {type(init_val)}, returning None")
        raise ValueError(f"Invalid initial type: {type(init_val)}")
        return None
