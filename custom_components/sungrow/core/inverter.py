"""This file contains the main SungrowInverter class."""

import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Final

from . import deserialize, modbus, signals

logger = logging.getLogger(__name__)

DatapointValueType = signals.DatapointValueType


async def pull_raw_signals(
    client: modbus.Connection,
    signal_definitions: signals.SignalDefinitions,
) -> dict[str, DatapointValueType] | None:
    """Pull data from inverter. Return None on failure."""

    data: dict[str, DatapointValueType] = {}

    pull_start = datetime.now()

    # Load all registers from inverer
    try:
        requested_signals: dict[str, signals.SungrowSignalDefinition] = {}
        for signal in signal_definitions._definitions.values():
            if not signal.disabled:
                requested_signals[signal.name] = signal
        defs = signals.SignalDefinitions(requested_signals)
        data = deserialize.decode_signals(
            defs, await client.read(defs.modbus_signal_list)
        )

    except modbus.ModbusError as e:
        logger.info(f"Pulling data from inverter failed: {e}")
        # return none or throw exception?
        return None

    elapsed = datetime.now() - pull_start
    # data["pull_time"] = f"{elapsed.seconds}.{elapsed.microseconds}"
    logger.debug(
        "Inverter: Successfully pulled data in "
        f"{elapsed.seconds}.{elapsed.microseconds} secs"
    )

    return data


def mark_unavailable_signals_as_disabled(
    all_signals: signals.SignalDefinitions,
    data: dict[str, DatapointValueType],
    model,
    level,
):
    # Disable signals which do not apply to the current model regardless of content
    # (0, not supported, etc), because they contain random/unknown data.
    all_signals.mark_signals_not_in_this_model_as_disabled(model)

    # mark signals as disabled if they are not supported by the inverter
    for name, value in data.items():
        if value is None:
            all_signals.get_signal_definition_by_name(name).disabled.append(
                "Inverter does not support this signal (None returned)"
            )
            logger.debug(
                f"Disabling {name} as it's not supported by inverter (None returned)"
            )

    # mark_signals_disabled_based_on_groups must be called after unsupported signals
    # have been marked as disabled. It will check all remaining signals for 0 or not 0.
    # Therefore filtering by level must happen after this step.
    extra_data = all_signals.mark_signals_disabled_based_on_groups(data)

    all_signals.mark_signals_below_level_as_disabled(level)

    return extra_data


class SungrowInverter:
    @dataclass
    class Datapoint:
        name: str  # do we need the name here?
        value: DatapointValueType
        unit_of_measurement: str | None = None

        def __repr__(self) -> str:
            if self.unit_of_measurement:
                return f"{self.name} = {self.value} {self.unit_of_measurement}"
            else:
                return f"{self.name} = {self.value}"

    @staticmethod
    async def create(config: dict[str, Any]):
        """
        Create a SungrowInverter instance

        Will raise ModbusException on errors
        """

        if deprecated_unit := config.get("unit"):
            # ToDo: The 'unit' config option is deprecated. Please use 'slave' instead.
            config["slave"] = deprecated_unit

        async with modbus.Connection(
            host=config["host"],
            port=config["port"],
            slave=config["slave"],
        ) as connection:
            signal_definitions = signals.load_yaml()

            data = await pull_raw_signals(connection, signal_definitions)
            if not data:
                logger.warning("Failed to pull any data from inverter")
                # return none or raise? FIXME TODO
                return None

            model = data["device_type_code"]
            if isinstance(model, int):
                logger.info(
                    f"Unknown inverter type code detected: {model}. "
                    "Please report this to the developers."
                )
            else:
                # As defined in the yaml file, the model is a string.
                # (This is for mypy)
                assert isinstance(model, str)

            extra_data = mark_unavailable_signals_as_disabled(
                signal_definitions, data, model, 1  # config.get("level", 1)
            )

            my_config = SungrowInverter.Config(
                initial_data=data,
                active_groups=extra_data,
                signals=signal_definitions,
            )

            return SungrowInverter(connection.detach(), my_config)

    @dataclass
    class Config:
        initial_data: dict[str, DatapointValueType]
        active_groups: dict[str, bool]
        signals: signals.SignalDefinitions

    def __init__(
        self,
        client: modbus.Connection,
        config: Config,
    ):
        """Note: you should use create() instead!"""

        logger.debug(f"Creating SungrowInverter({config})")

        self._client = client
        self._config: Final = config

        self.data: dict[str, SungrowInverter.Datapoint] = {}

    async def disconnect(self):
        await self._client.disconnect()

    async def pull_data(self, on_error=None):
        """Pull data from inverter and update self.data"""
        # ToDo: drop on_error

        new_data = await pull_raw_signals(self._client, self._config.signals)
        if new_data:
            self.post_process_raw_data(new_data)
            new_data.update(self._config.active_groups)

            temp: dict[str, SungrowInverter.Datapoint] = {}
            for k, v in new_data.items():
                # data from post processing may already be wrapped in Datapoint
                if not isinstance(v, SungrowInverter.Datapoint):
                    definition = self._config.signals.get_signal_definition_by_name(k)
                    unit_of_measurement = (
                        definition.unit_of_measurement if definition else None
                    )

                    temp[k] = SungrowInverter.Datapoint(
                        name=k, value=v, unit_of_measurement=unit_of_measurement
                    )

                    # this can break due to pydantic :/
                    if type(v) != type(temp[k].value):  # noqa: E721
                        logger.warning(
                            f"Type mismatch for {k}: {type(v)} != {type(temp[k].value)}"
                        )

            current2 = temp.get("mppt_1_current")
            if current2:
                assert isinstance(current2.value, float | int), type(current2.value)

            self.post_process_datapoint_data(temp)

            self.data = temp
            return self.data
        else:
            self.data = {}
            self.disconnect()

            if isinstance(on_error, Exception):
                raise on_error
            else:
                return on_error

    @staticmethod
    def _convert_signals_to_timestamp(data: dict[str, Any], prefix: str = ""):
        try:
            # format: YYYY-MM-DD HH:MM:SS
            timestamp = "%04d-%02d-%02d %02d:%02d:%02d" % (
                int(data[prefix + "year"]),
                int(data[prefix + "month"]),
                int(data[prefix + "day"]),
                int(data[prefix + "hour"]),
                int(data[prefix + "minute"]),
                int(data[prefix + "second"]),
            )
        except KeyError:
            timestamp = None

        return timestamp

    @staticmethod
    def _drop_timestamp_info(data: dict[str, Any], prefix: str = ""):
        for key in ["year", "month", "day", "hour", "minute", "second"]:
            data.pop(prefix + key, None)

    def post_process_raw_data(self, new_data: dict[str, DatapointValueType]):
        # If it's enabled, convert the timestamp to a string
        if new_data.get("year"):
            new_data["timestamp"] = SungrowInverter._convert_signals_to_timestamp(
                new_data
            )
        SungrowInverter._drop_timestamp_info(new_data)

        if new_data.get("pid_alarm_code"):
            new_data["alarm_timestamp"] = SungrowInverter._convert_signals_to_timestamp(
                new_data, "alarm_time_"
            )
        SungrowInverter._drop_timestamp_info(new_data, "alarm_time_")

    def post_process_datapoint_data(self, new_data: dict[str, Datapoint]):
        """Add 'fake sensors' based on other sensors."""

        # 'power' for every mppt
        for i in range(1, 12):
            current = new_data.get(f"mppt_{i}_current")
            voltage = new_data.get(f"mppt_{i}_voltage")
            if current is not None and voltage is not None:
                # Tell mypy these can be multiplied
                assert isinstance(current.value, float | int), type(current.value)
                assert isinstance(voltage.value, float | int), type(voltage.value)

                new_data[f"mppt_{i}_power"] = SungrowInverter.Datapoint(
                    name=f"mppt_{i}_power",
                    value=current.value * voltage.value,
                    unit_of_measurement="W",
                )

    async def __aenter__(self):
        self._detached = False
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        if not self._detached:
            await self.disconnect()

    def detach(self):
        """Detach from the context manager."""
        self._detached = True
        return self

    @property
    def serial_number(self):
        return self._config.initial_data["serial_number"]

    @property
    def model(self) -> str | int:
        model = self._config.initial_data["device_type_code"]
        assert isinstance(model, str | int)
        return model

    def get_data_for_group(self, group: str):
        # Helpful function for debugging

        data = {}
        for signal in self._config.signals.get_signals_for_group(group):
            if signal in self.data:
                data[signal] = self.data[signal]
        return data

    @property
    def slave_master_standalone(self):
        """
        Simple heuristic to determine if this is a master or slave inverter.

        Note: this is not 100% accurate. It's just a heuristic.
        It would be better if we add all inverters to a single config_entry.
        """

        if self._config.initial_data.get("master_slave_mode") == "Disabled":
            return "Standalone"
        elif self._config.initial_data.get("master_slave_mode") == "Enabled":
            if self._config.initial_data.get("master_slave_role") == "Master":
                return "Master"
            else:
                # ToDo: mulitple slaves
                return "Slave"
        else:
            # Data not available. Fall back to heuristic.
            # TODO This should somehow be reported back with a registers dump...
            if self._config.active_groups.get("is_master"):
                if self._config.initial_data.get("output_type", "2P") == "2P":
                    return "Standalone"
                else:
                    return "Master"
            else:
                return "Slave"
