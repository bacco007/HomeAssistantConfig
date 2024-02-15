import logging

from .signals import (
    DatapointValueType,
    DatapointValueTypeBase,
    SignalDefinitions,
    SungrowSignalDefinition,
)

logger = logging.getLogger(__name__)


def _decode_int_signal(
    signal: SungrowSignalDefinition,
    registers: list[int],
) -> DatapointValueTypeBase | None:
    int_value = int(registers[0])

    if signal.base_datatype in ["U32", "S32"]:
        # Each register is 16 bit. Combine the next register to get 32 bit.
        int_value += registers[1] << 16

    if signal.base_datatype == "S16" and int_value > 0x7FFF:
        int_value -= 0x10000
    elif signal.base_datatype == "S32" and int_value > 0x7FFFFFFF:
        int_value -= 0x100000000

    if int_value == signal.na_value:
        return None
    else:
        if signal.mask:
            int_value = bool(int_value & signal.mask)

        if signal.accuracy:
            return float(round(int_value * float(signal.accuracy), 2))

        # "datarange" is used to decode values like "1" to "ON" or "0" to "OFF"
        elif signal.decoded:
            # convert back to int (todo: fix yaml)
            int_value = int(int_value)

            # ToDo: better error handling.
            # Exception is not an option, as it would be nice to e.g. support
            # unknown inverters.
            value: str | int = signal.decoded.get(int_value, int_value)
            return value

        else:
            return int_value


def _decode_utf8_signal(signal: SungrowSignalDefinition, raw: list[list[int]]) -> str:
    value = "".join([chr(c[0] >> 8) + chr(c[0] & 0xFF) for c in raw]).strip("\x00")

    return value


def _decode_base_signal(
    signal: SungrowSignalDefinition, raw_value: list[int]
) -> DatapointValueTypeBase | None:
    assert signal.array_length == 1, signal

    if signal.base_datatype in ["U16", "S16", "U32", "S32"]:
        return _decode_int_signal(signal, raw_value)
    else:
        raise RuntimeError(
            f"Invalid yaml for {signal.name}: "
            "unknown datatype (expected U16, S16, U32, S32)"
        )


def _decode_array_signal(
    signal: SungrowSignalDefinition, raw_value: list[list[int]]
) -> dict[int, DatapointValueTypeBase] | str:
    assert signal.array_length > 1

    if signal.base_datatype in ["U16", "S16", "U32", "S32"]:
        data: dict[int, DatapointValueTypeBase] = {}
        # raw_value is a list of lists of registers (ints)
        for i, element_raw_value in enumerate(raw_value):
            assert isinstance(element_raw_value, list)
            data[i] = _decode_int_signal(
                signal,
                element_raw_value,
            )

        return data
    elif signal.base_datatype == "UTF-8":
        # raw_value is a list of registers (ints)
        return _decode_utf8_signal(signal, raw_value)

    else:
        raise RuntimeError(
            f"Invalid yaml for {signal.name}: "
            "unknown array datatype (expected U16, S16, U32, S32 or UTF-8)"
        )


def _decode_signal(
    signal: SungrowSignalDefinition,
    raw_value: list[int | list[int]],
) -> DatapointValueType | None:
    if signal.array_length == 1:
        single_val: list[int] = raw_value  # type: ignore
        return _decode_base_signal(signal, single_val)
    else:
        array_val: list[list[int]] = raw_value  # type: ignore
        return _decode_array_signal(signal, array_val)


def decode_signals(
    signal_definitions: SignalDefinitions,
    raw_signals: dict[str, list[list[int] | int]],
) -> dict[str, DatapointValueType]:
    decoded: dict[str, DatapointValueType] = {}
    for signal_name, raw_value in raw_signals.items():
        signal = signal_definitions.get_signal_definition_by_name(signal_name)
        decoded[signal_name] = _decode_signal(signal, raw_value)
    return decoded
