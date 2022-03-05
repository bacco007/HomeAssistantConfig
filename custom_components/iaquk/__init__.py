"""
Component to calculate IAQ UK index.

For more details about this component, please refer to
https://github.com/Limych/ha-iaquk
"""

import logging
from typing import Any, Dict, Final, List, Optional, Union

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.sensor import DOMAIN as SENSOR
from homeassistant.const import (
    ATTR_UNIT_OF_MEASUREMENT,
    CONF_NAME,
    CONF_SENSORS,
    EVENT_HOMEASSISTANT_START,
    PERCENTAGE,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
    TEMP_CELSIUS,
    TEMP_FAHRENHEIT,
    TEMPERATURE,
    UNIT_NOT_RECOGNIZED_TEMPLATE,
)
from homeassistant.core import State, callback
from homeassistant.helpers import discovery
from homeassistant.helpers.event import async_track_state_change
from homeassistant.util.temperature import convert as convert_temperature

from .const import (
    ATTR_SOURCE_INDEX_TPL,
    ATTR_SOURCES_SET,
    ATTR_SOURCES_USED,
    CONF_CO,
    CONF_CO2,
    CONF_HCHO,
    CONF_HUMIDITY,
    CONF_NO2,
    CONF_PM,
    CONF_RADON,
    CONF_SOURCES,
    CONF_TEMPERATURE,
    CONF_TVOC,
    DOMAIN,
    LEVEL_EXCELLENT,
    LEVEL_FAIR,
    LEVEL_GOOD,
    LEVEL_INADEQUATE,
    LEVEL_POOR,
    MWEIGTH_CO,
    MWEIGTH_CO2,
    MWEIGTH_HCHO,
    MWEIGTH_NO2,
    MWEIGTH_TVOC,
    STARTUP_MESSAGE,
    UNIT_PPB,
    UNIT_PPM,
    UNIT_UGM3,
)
from .sensor import SENSORS

_LOGGER: Final = logging.getLogger(__name__)

SOURCES: Final = [
    CONF_TEMPERATURE,
    CONF_HUMIDITY,
    CONF_CO2,
    CONF_CO,
    CONF_NO2,
    CONF_TVOC,
    CONF_HCHO,
    CONF_RADON,
    CONF_PM,
]

SOURCES_LISTS: Final = [CONF_PM]

SOURCES_SCHEMA: Final = vol.All(
    vol.Schema(
        {
            vol.Optional(src): (cv.entity_ids if src in SOURCES_LISTS else cv.entity_id)
            for src in SOURCES
        }
    ),
    cv.has_at_least_one_key(*SOURCES),
)

IAQ_SCHEMA: Final = vol.Schema(
    {
        vol.Optional(CONF_NAME): cv.string,
        vol.Required(CONF_SOURCES): SOURCES_SCHEMA,
        vol.Optional(CONF_SENSORS): vol.All(cv.ensure_list, [vol.In(SENSORS)]),
    }
)

CONFIG_SCHEMA: Final = vol.Schema(
    {DOMAIN: cv.schema_with_slug_keys(IAQ_SCHEMA)}, extra=vol.ALLOW_EXTRA
)


def _deslugify(string):
    """Deslugify string."""
    return string.replace("_", " ").title()


async def async_setup(hass, config):
    """Set up component."""
    if DOMAIN not in config:
        return True

    # Print startup message
    _LOGGER.info(STARTUP_MESSAGE)
    hass.data.setdefault(DOMAIN, {})

    for object_id, cfg in config[DOMAIN].items():
        name = cfg.get(CONF_NAME, _deslugify(object_id))
        sources = cfg.get(CONF_SOURCES)
        sensors = cfg.get(CONF_SENSORS)

        if not sensors:
            sensors = list(SENSORS.keys())

        _LOGGER.debug(
            "Initialize controller %s for sources: %s",
            object_id,
            ", ".join([f"{key}={value}" for (key, value) in sources.items()]),
        )

        controller = Iaquk(hass, object_id, name, sources)
        hass.data[DOMAIN][object_id] = controller

        discovery.load_platform(
            hass, SENSOR, DOMAIN, {CONF_NAME: object_id, CONF_SENSORS: sensors}, config
        )

    if not hass.data[DOMAIN]:
        return False

    return True


class Iaquk:
    """IAQ UK controller."""

    def __init__(
        self, hass, entity_id: str, name: str, sources: Dict[str, Union[str, List[str]]]
    ):
        """Initialize controller."""
        self.hass = hass
        self._entity_id = entity_id
        self._name = name
        self._sources = sources

        self._iaq_index = None
        self._iaq_sources = 0
        self._added = False
        self._indexes = {}

    def async_added_to_hass(self):
        """Register callbacks."""
        # pylint: disable=unused-argument
        @callback
        def sensor_state_listener(entity, old_state, new_state):
            """Handle device state changes."""
            self.update()

        # pylint: disable=unused-argument
        @callback
        def sensor_startup(event):
            """Update template on startup."""
            entity_ids = []
            for src in self._sources.values():
                if isinstance(src, list):
                    entity_ids.extend(src)
                else:
                    entity_ids.append(src)

            _LOGGER.debug(
                "[%s] Setup states tracking for %s",
                self._entity_id,
                ", ".join(entity_ids),
            )

            async_track_state_change(self.hass, entity_ids, sensor_state_listener)
            sensor_state_listener(None, None, None)  # Force first update

        if not self._added:
            self._added = True
            self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_START, sensor_startup)

    @property
    def unique_id(self) -> str:
        """Return a unique ID."""
        return self._entity_id

    @property
    def name(self) -> str:
        """Get controller name."""
        return self._name

    @property
    def iaq_index(self) -> Optional[int]:
        """Get IAQ index."""
        return self._iaq_index

    # pylint: disable=R1705
    @property
    def iaq_level(self) -> Optional[str]:
        """Get IAQ level."""
        # Transform IAQ index to human readable text according
        # to Indoor Air Quality UK: http://www.iaquk.org.uk/
        if self._iaq_index is None:
            return None
        elif self._iaq_index <= 25:
            return LEVEL_INADEQUATE
        elif self._iaq_index <= 38:
            return LEVEL_POOR
        elif self._iaq_index <= 51:
            return LEVEL_FAIR
        elif self._iaq_index <= 60:
            return LEVEL_GOOD
        return LEVEL_EXCELLENT

    @property
    def state_attributes(self) -> Optional[Dict[str, Any]]:
        """Return the state attributes."""
        state_attr = {
            ATTR_SOURCES_SET: len(self._sources),
            ATTR_SOURCES_USED: self._iaq_sources,
        }

        for src, idx in self._indexes.items():
            state_attr[ATTR_SOURCE_INDEX_TPL.format(src)] = idx

        return state_attr

    def update(self):
        """Update index state."""
        _LOGGER.debug("[%s] State update", self._entity_id)

        iaq = 0
        sources = 0
        indexes = {}
        for src in self._sources:
            try:
                idx = self.__getattribute__(f"_{src}_index")
                _LOGGER.debug("[%s] %s_index=%s", self._entity_id, src, idx)
                if idx is not None:
                    iaq += idx
                    sources += 1
                    indexes[src] = idx
            except Exception:  # pylint: disable=broad-except; pragma: no cover
                pass

        if iaq:
            self._indexes = indexes
            self._iaq_index = int((65 * iaq) / (5 * sources))
            self._iaq_sources = int(sources)
            _LOGGER.debug(
                "[%s] Update IAQ index to %d (%d sources used)",
                self._entity_id,
                self._iaq_index,
                self._iaq_sources,
            )

    @staticmethod
    def _has_state(state) -> bool:
        """Return True if state has any value."""
        return state is not None and state not in [STATE_UNKNOWN, STATE_UNAVAILABLE]

    def _get_number_state(
        self, entity_id, entity_unit=None, source_type="", mweight=None
    ) -> Optional[float]:
        """Convert value to number."""
        target_unit = None
        if entity_unit is not None and not isinstance(entity_unit, dict):
            entity_unit = {entity_unit: 1}

        entity = self.hass.states.get(entity_id)
        if entity is None:
            _LOGGER.warning("Entity %s not found", entity_id)
            return None
        if not isinstance(entity, State):  # pragma: no cover
            _LOGGER.warning("State of entity %s be instance of class State", entity_id)
            return None

        value = entity.state
        unit = entity.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
        _LOGGER.debug(
            "[%s] %s=%s %s",
            self._entity_id,
            entity_id,
            value,
            (unit if unit and self._has_state(value) else ""),
        )
        if not self._has_state(value):
            _LOGGER.debug("State of entity %s is unknown", entity_id)
            return None

        if entity_unit is not None:
            target_unit = next(iter(entity_unit))
            if unit not in entity_unit:
                # pylint: disable=R1705
                if mweight is None:
                    _LOGGER.debug(
                        'Entity %s has inappropriate "%s" '
                        "units for %s source. Ignored.",
                        entity_id,
                        unit,
                        source_type,
                    )
                    return None
                entity_unit = entity_unit.copy()
                if "ppb" in (unit, target_unit):
                    mweight /= 1000
                if unit in {"ppm", "ppb"}:
                    entity_unit[unit] = mweight / 24.45
                else:
                    entity_unit[unit] = 24.45 / mweight

        value = float(value)

        if entity_unit is not None and unit != target_unit:
            value *= entity_unit[unit]
            _LOGGER.debug(
                "[%s] %s=%s %s (converted)",
                self._entity_id,
                entity_id,
                value,
                target_unit,
            )
        return value

    @property
    def _temperature_index(self) -> Optional[int]:
        """Transform indoor temperature values to IAQ points."""
        entity_id = self._sources.get(CONF_TEMPERATURE)
        if entity_id is None:
            return None

        value = self._get_number_state(entity_id, source_type=CONF_TEMPERATURE)
        if value is None:
            return None

        entity = self.hass.states.get(entity_id)
        entity_unit = entity.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
        if entity_unit not in (TEMP_CELSIUS, TEMP_FAHRENHEIT):
            raise ValueError(
                UNIT_NOT_RECOGNIZED_TEMPLATE.format(entity_unit, TEMPERATURE)
            )

        if entity_unit != TEMP_CELSIUS:
            value = convert_temperature(value, entity_unit, TEMP_CELSIUS)

        index = 1
        if 18 <= value <= 21:  # °C
            index = 5
        elif 16 < value < 23:  # °C
            index = 4
        elif 15 < value < 24:  # °C
            index = 3
        elif 14 < value < 25:  # °C
            index = 2
        return index

    @property
    def _humidity_index(self) -> Optional[int]:
        """Transform indoor humidity values to IAQ points."""
        entity_id = self._sources.get(CONF_HUMIDITY)
        if entity_id is None:
            return None

        value = self._get_number_state(entity_id, PERCENTAGE, CONF_HUMIDITY)
        if value is None:
            return None

        index = 1
        if 40 <= value <= 60:  # %
            index = 5
        elif 30 <= value <= 70:  # %
            index = 4
        elif 20 <= value <= 80:  # %
            index = 3
        elif 10 <= value <= 90:  # %
            index = 2
        return index

    @property
    def _co2_index(self) -> Optional[int]:
        """Transform indoor eCO2 values to IAQ points."""
        entity_id = self._sources.get(CONF_CO2)
        if entity_id is None:
            return None

        value = self._get_number_state(
            entity_id, UNIT_PPM, CONF_CO2, mweight=MWEIGTH_CO2
        )
        if value is None:
            return None

        index = 1
        if value <= 600:  # ppm
            index = 5
        elif value <= 800:  # ppm
            index = 4
        elif value <= 1500:  # ppm
            index = 3
        elif value <= 1800:  # ppm
            index = 2
        return index

    @property
    def _tvoc_index(self) -> Optional[int]:
        """Transform indoor tVOC values to IAQ points."""
        entity_id = self._sources.get(CONF_TVOC)
        if entity_id is None:
            return None

        value = self._get_number_state(
            entity_id, UNIT_PPB, CONF_TVOC, mweight=MWEIGTH_TVOC
        )
        if value is None:
            return None

        index = 1
        if value <= 24:  # ppb
            index = 5
        elif value <= 73:  # ppb
            index = 4
        elif value <= 122:  # ppb
            index = 3
        elif value <= 245:  # ppb
            index = 2
        return index

    @property
    def _pm_index(self) -> Optional[int]:
        """Transform indoor particulate matters values to IAQ points."""
        entity_ids = self._sources.get(CONF_PM)
        if entity_ids is None or entity_ids == []:
            return None

        values = []
        for eid in entity_ids:
            val = self._get_number_state(eid, UNIT_UGM3, CONF_PM)
            if val is None:
                continue
            values.append(val)

        if not values:
            return None

        value = sum(values)
        index = 1
        if value <= 23:  # µg/m3
            index = 5
        elif value <= 41:  # µg/m3
            index = 4
        elif value <= 53:  # µg/m3
            index = 3
        elif value <= 64:  # µg/m3
            index = 2
        return index

    @property
    def _no2_index(self) -> Optional[int]:
        """Transform indoor NO2 values to IAQ points."""
        entity_id = self._sources.get(CONF_NO2)
        if entity_id is None:
            return None

        value = self._get_number_state(
            entity_id, UNIT_PPB, CONF_NO2, mweight=MWEIGTH_NO2
        )
        if value is None:
            return None

        index = 1
        if value <= 106:  # ppb
            index = 5
        elif value <= 213:  # ppb
            index = 3
        return index

    @property
    def _co_index(self) -> Optional[int]:
        """Transform indoor CO values to IAQ points."""
        entity_id = self._sources.get(CONF_CO)
        if entity_id is None:
            return None

        value = self._get_number_state(entity_id, UNIT_PPB, CONF_CO, mweight=MWEIGTH_CO)
        if value is None:
            return None

        index = 1
        if value <= 785.7:  # ppb
            index = 5
        elif value <= 6111:  # ppb
            index = 3
        return index

    @property
    def _hcho_index(self) -> Optional[int]:
        """Transform indoor Formaldehyde (HCHO) values to IAQ points."""
        entity_id = self._sources.get(CONF_HCHO)
        if entity_id is None:
            return None

        value = self._get_number_state(
            entity_id, UNIT_PPB, CONF_HCHO, mweight=MWEIGTH_HCHO
        )
        if value is None:
            return None

        index = 1
        if value <= 16:  # ppb
            index = 5
        elif value <= 41:  # ppb
            index = 4
        elif value <= 82:  # ppb
            index = 3
        elif value <= 163:  # ppb
            index = 2
        return index

    @property
    def _radon_index(self):
        """Transform indoor Radon (Rn) values to IAQ points."""
        entity_id = self._sources.get(CONF_RADON)
        if entity_id is None:
            return None

        value = self._get_number_state(entity_id, "Bq/m3")
        if value is None:
            return None

        index = 1
        if value == 0:  # Bq/m3
            index = 5
        elif value < 20:  # Bq/m3
            index = 3
        elif value <= 100:  # Bq/m3
            index = 2
        return index
