"""
HASS camera component for skyfield.

Maybe a camera is better than a sensor for live updates.
"""
import logging
from datetime import timedelta
import io

import voluptuous as vol

from homeassistant.components.camera import Camera
from homeassistant.helpers.config_validation import PLATFORM_SCHEMA
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

DOMAIN = "skyfield"

CONF_SHOW_TIME = "show_time"
CONF_SHOW_LEGEND = "show_legend"
CONF_SHOW_CONSTELLATIONS = "show_constellations"
CONF_PLANET_LIST = "planet_list"
CONF_CONSTELLATION_LIST = "constellations_list"
# could detect north to be up if location is in souther hemisphere
# but for no we just make it an option
CONF_NORTH_UP = "north_up"

ICON = "mdi:sun"
MIN_TIME_BETWEEN_UPDATES = timedelta(minutes=1)

# Validation of the user's configuration
PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional(CONF_SHOW_CONSTELLATIONS, default=False): cv.boolean,
        vol.Optional(CONF_SHOW_TIME, default=True): cv.boolean,
        vol.Optional(CONF_SHOW_LEGEND, default=True): cv.boolean,
        vol.Optional(CONF_CONSTELLATION_LIST): cv.ensure_list,
        vol.Optional(CONF_PLANET_LIST): cv.ensure_list,
        vol.Optional(CONF_NORTH_UP): cv.boolean,
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the skyfield platform."""
    latitude = config.get(CONF_LATITUDE, hass.config.latitude)
    longitude = config.get(CONF_LONGITUDE, hass.config.longitude)
    tzname = str(hass.config.time_zone)
    show_constellations = config.get(CONF_SHOW_CONSTELLATIONS)
    show_time = config.get(CONF_SHOW_TIME)
    show_legend = config.get(CONF_SHOW_LEGEND)
    constellation_list = config.get(CONF_CONSTELLATION_LIST)
    planet_list = config.get(CONF_PLANET_LIST)
    north_up = config.get(CONF_NORTH_UP)
    configdir = hass.config.config_dir
    tmpdir = "/tmp/skyfield"
    _LOGGER.debug("Setting up skyfield.")
    panel = SkyFieldCam(
        latitude,
        longitude,
        tzname,
        configdir,
        tmpdir,
        show_constellations,
        show_time,
        show_legend,
        constellation_list,
        planet_list,
        north_up,
    )

    _LOGGER.debug("Adding skyfield cam")
    add_entities([panel], True)


class SkyFieldCam(Camera):
    """A hass-specific entity."""

    def __init__(
        self,
        latitude,
        longitude,
        tzname,
        configdir,
        tmpdir,
        show_constellations,
        show_time,
        show_legend,
        constellations,
        planets,
        north_up,
    ):
        Camera.__init__(self)
        from . import bodies

        self.sky = bodies.Sky(
            (latitude, longitude),
            tzname,
            show_constellations,
            show_time,
            show_legend,
            constellations,
            planets,
            north_up,
        )
        self._loaded = False
        self._configdir = configdir
        self._tmpdir = tmpdir

    @property
    def frame_interval(self):
        # this is how often the image will update in the background.
        # When the GUI panel is up, it is always updated every
        # 10 seconds, which is too much. Must figure out how to
        # reduce...
        return 60

    @property
    def name(self):
        return "SkyField"

    @property
    def brand(self):
        return "SkyField"

    @property
    def model(self):
        return "Sky"

    @property
    def icon(self):
        return ICON

    def camera_image(self):
        """Load image bytes in memory"""
        # don't use throttle because extra calls return Nones
        if not self._loaded:
            _LOGGER.debug("Loading skyfield data")
            self.sky.load(self._tmpdir)
            self._loaded = True
        _LOGGER.debug("Updating skyfield plot")
        buf = io.BytesIO()
        self.sky.plot_sky(buf)
        buf.seek(0)
        return buf.getvalue()
