"""
Contains all the signals that can be read from the inverter,
and the code to decode them.
It does NOT know about modbus (except for "RegisterType").
"""

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import cast

import yaml

from .modbus import RegisterType, Signal

logger = logging.getLogger(__name__)


def is_zero(v):
    if v is None:
        return True

    if isinstance(v, list):
        return not any(v)
    elif isinstance(v, dict):
        return not any(v.values())
    else:
        return v == 0


DatapointValueTypeBase = bool | int | float | str | None
DatapointValueType = DatapointValueTypeBase | dict[int, DatapointValueTypeBase]


@dataclass
class SungrowSignalDefinition(Signal):
    unit_of_measurement: str | None
    disabled: list[str]  # str instead of bool to allow comments
    group: list[str] | None
    accuracy: float | None
    mask: int | None
    decoded: dict[int, str] | None
    models: list[str] | None
    models_exclude: list[str] | None
    level: int | None
    base_datatype: str | None = None

    def __post_init__(self):
        if self.base_datatype in ["U16", "S16", "UTF-8"]:
            self.element_length = 1
        elif self.base_datatype in ["U32", "S32"]:
            self.element_length = 2
        else:
            raise RuntimeError(
                "Unknown datatype (expected U16, S16, U32, S32 or UTF-8, "
                f"not {self.base_datatype})"
            )

    @property
    def na_value(self):
        """Return the value that indicates that the signal is not available"""
        assert self.base_datatype

        return {
            "U16": 0xFFFF,
            "S16": 0x7FFF,
            "U32": 0xFFFFFFFF,
            "S32": 0x7FFFFFFF,
        }.get(self.base_datatype)


class SignalDefinitions:
    def __init__(self, definitions: dict[str, SungrowSignalDefinition]):
        self._definitions = definitions

    @property
    def modbus_signal_list(self):
        return cast(list[Signal], list(self._definitions.values()))

    def get_signal_definitions_by_address_included(
        self,
        register_type: RegisterType,
        address: int,
        count: int = 1,
    ):
        match: list[SungrowSignalDefinition] = []
        for signal in self._definitions.values():
            if (
                signal.register_type == register_type
                and signal.address >= address
                and signal.address + signal.length <= address + count
            ):
                match.append(signal)
        return match

    def get_signal_definitions_by_address_overlaps(
        self,
        register_type: RegisterType,
        address: int,
        count: int = 1,
    ):
        match: list[SungrowSignalDefinition] = []
        for signal in self._definitions.values():
            if (
                signal.register_type == register_type
                and signal.address < address + count
                and signal.address + signal.length > address
            ):
                match.append(signal)
        return match

    def get_signal_definition_by_name(self, name: str):
        # Note: differentiating between read and hold registers is not needed here.
        # They do not overlap.
        return self._definitions.get(name)

    def get_signals_for_group(self, group: str):
        signals: dict[str, SungrowSignalDefinition] = {}
        for signal in self._definitions.values():
            if signal.group and group in signal.group:
                signals[signal.name] = signal
        return signals

    def get_groups(self):
        """Return a list of all groups"""
        groups: dict[str, dict[str, SungrowSignalDefinition]] = {}
        for signal in self._definitions.values():
            if signal.group:
                for group in signal.group:
                    groups.setdefault(group, {})[signal.name] = signal
        return groups

    # ToDo: move to inverter.py. This is clearly business logic.
    def mark_signals_not_in_this_model_as_disabled(self, model):
        unknown_model = isinstance(model, int)
        if not unknown_model:
            for signal in self._definitions.values():
                if (signal.models and model not in signal.models) or (
                    signal.models_exclude and model in signal.models_exclude
                ):
                    signal.disabled.append("signal not available for this model")

    # ToDo: move to inverter.py. This is clearly business logic.
    def mark_signals_disabled_based_on_groups(self, data):
        """Note: this returns extra_data to be included!"""

        extra_data = {}

        # now filter groups where all signals are inactive
        for group, group_signals in self.get_groups().items():
            if group == "fetch_always_but_do_not_show_unless_level_2":
                continue

            all_zero = True
            for signal in group_signals.values():
                v = data.get(signal.name)
                if not signal.disabled and not is_zero(v):
                    logger.info(f"Group {group}: Signal {signal.name} is not zero: {v}")
                    all_zero = False
                    # break
            if all_zero:
                logger.info(f"Group {group}: all signals are zero")
                for signal in group_signals.values():
                    signal.disabled.append(f"all (enabled) signals in {group} are zero")
                # extra_data[group] = False
            else:
                extra_data[group] = True

        return extra_data

    # ToDo: move to inverter.py. This is clearly business logic.
    def mark_signals_below_level_as_disabled(self, level):
        for signal in self._definitions.values():
            if signal.level and signal.level > level:
                signal.disabled.append(
                    f"signal {signal.level} not enabled on level {level}"
                )


def type_or_none(t: type, v):
    if v is None:
        return None
    else:
        return t(v)


def get(d: dict, t: type, v):
    val = d.get(v)
    if val is None:
        return None
    else:
        return t(val)


def _parse_base_datatype(data_type: str):
    """Return the datatype without length"""

    parts = data_type.split("[")
    return parts[0]


def _parse_array_length(data_type: str):
    """Return the length of the array"""

    parts = data_type.split("[")
    if len(parts) > 1:
        length = int(parts[1][:-1])
        if length <= 0 or length >= 255:
            raise RuntimeError(
                "Invalid yaml: "
                "expected DATATYPE[<length>] with length being a number between "
                f"1 and 255, e.g. UTF-8[10], instead of {data_type}"
            )
        else:
            return length
    else:
        return 1


def load_yaml() -> SignalDefinitions:
    """
    This is specific to our yaml file format.
    For parsing other formats, see script_sync_yaml.py
    """
    pwd = Path(__file__).parent.absolute()
    with open(pwd / "registers-sungrow.yaml", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    all_signals: dict[str, SungrowSignalDefinition] = {}

    for register_type in ["read", "hold"]:
        for entry in data[register_type]:
            assert isinstance(entry, dict)

            group = entry.get("group", None)
            if group is not None and isinstance(group, str):
                group = [group]

            signal = SungrowSignalDefinition(
                name=entry["name"],
                register_type=RegisterType(register_type),
                address=entry["address"],
                unit_of_measurement=entry.get("unit_of_measurement", None),
                accuracy=type_or_none(float, entry.get("accuracy")),
                mask=entry.get("mask"),
                decoded=entry.get("decoded"),
                models=entry.get("models"),
                models_exclude=entry.get("models_exclude"),
                group=group,
                disabled=[],
                level=entry.get("level"),
                array_length=_parse_array_length(entry["data_type"]),
                base_datatype=_parse_base_datatype(entry["data_type"]),
                element_length=0,  # will be set later
            )

            if signal.decoded:
                assert isinstance(signal.decoded, dict), f"{signal.decoded}"
                assert all(isinstance(k, int) for k in signal.decoded)
                assert all(isinstance(v, str) for v in signal.decoded.values())

            # Deduplicate signal names
            # todo: Mostly they are for different models, but not all.
            while signal.name in all_signals:
                # logger.debug(
                #     "Duplicate signal name: "
                #     f"{registers[signal.name]} vs {signal}. Appending '_'"
                # )
                signal.name += "_"
            all_signals[signal.name] = signal

    return SignalDefinitions(all_signals)
