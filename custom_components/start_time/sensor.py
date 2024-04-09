import logging
from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity

_LOGGER = logging.getLogger(__name__)

DOMAIN = "start_time"


async def async_setup_entry(hass: HomeAssistant, entry, async_add_entities):
    sensor = hass.data[DOMAIN]
    async_add_entities([sensor])


class StartTime(Entity):
    def __init__(self):
        self._attr_icon = "mdi:home-assistant"
        self._attr_name = "Start Time"
        self._attr_should_poll = False
        self._attr_unit_of_measurement = "seconds"
        self._attr_unique_id = DOMAIN

        self.add_logger("homeassistant.bootstrap")

    def add_logger(self, name: str):
        logger = logging.getLogger(name)
        real_info = logger.info

        def monkey_info(msg: str, *args):
            # https://github.com/home-assistant/core/issues/112464
            try:
                if msg.startswith("Home Assistant initialized"):
                    self.internal_update(args[0])
            except Exception as e:
                _LOGGER.warning("update error", exc_info=e)

            real_info(msg, *args)

        logger.info = monkey_info

    def internal_update(self, state: float):
        setup_time: dict = self.hass.data.get("setup_time")
        if setup_time:
            extra = {}  # protect original dict from changing

            for k, v in setup_time.items():
                if isinstance(v, dict):  # Hass 2024.4
                    value = sum(j for i in v.values() for j in i.values())
                    extra[k] = round(value, 2)
                elif isinstance(v, float):  # Hass 2024.3
                    extra[k] = round(v, 2)
                elif isinstance(v, timedelta):  # before Hass 2024.3
                    extra[k] = round(v.total_seconds(), 2)
                else:
                    continue

            self._attr_extra_state_attributes = dict(
                sorted(extra.items(), key=lambda kv: kv[1], reverse=True)
            )

        self._attr_state = round(state, 2)

        self.schedule_update_ha_state()
