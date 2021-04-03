"""HASS component for skyfield."""
import logging
from datetime import timedelta
import os

from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE

_LOGGER = logging.getLogger(__name__)

DOMAIN = "skyfield"

ICON = "mdi:sun"
MIN_TIME_BETWEEN_UPDATES = timedelta(minutes=1)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the skyfield platform."""
    latitude = config.get(CONF_LATITUDE, hass.config.latitude)
    longitude = config.get(CONF_LONGITUDE, hass.config.longitude)
    tzname = str(hass.config.time_zone)
    configdir = hass.config.config_dir
    tmpdir = "/tmp/skyfield"
    _LOGGER.info("Setting up skyfield.")
    panel = SkyField(latitude, longitude, tzname, configdir, tmpdir)

    _LOGGER.info("Adding sunpanel entity")
    add_entities([panel], True)
    _LOGGER.info("Sunpanel init done")


class SkyField(Entity):
    """A hass-specific entity."""

    def __init__(self, latitude, longitude, tzname, configdir, tmpdir):
        from . import bodies

        self.sky = bodies.Sky((latitude, longitude), tzname)
        self._loaded = False
        self._configdir = configdir
        self._tmpdir = tmpdir

    @property
    def name(self):
        return "Skyfield"

    @property
    def icon(self):
        return ICON

    @property
    def state(self):
        """Return the device state attributes."""
        return 90 - list(self.sky.sun_position)[1]

    @property
    def entity_picture(self):
        """Return the camera image still."""
        return "/local/sun.png"

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):
        """Update sensor data."""
        if not self._loaded:
            _LOGGER.debug("Loading skyfield data")
            self.sky.load(self._tmpdir)
            self._loaded = True
        _LOGGER.debug("Updating skyfield plot")
        self.sky.plot_sky(os.path.join(self._configdir, "www", "sun.png"))
