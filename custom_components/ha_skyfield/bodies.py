"""Collect data about where celestial bodies are."""
import datetime
import math

from pytz import timezone
from skyfield.api import Loader
from skyfield.api import Topos

import matplotlib.pyplot as plt
import numpy as np

from . import constellations

EARTH = "earth"
SUN = "sun"

BODIES = [
    ("Sun", SUN, "gold", 500),
    ("Mercury", "mercury", "pink", 40),
    ("Venus", "venus", "rosybrown", 60),
    ("Moon", "moon", "lightgrey", 300),
    ("Mars", "mars", "red", 60),
    ("Jupiter", "jupiter barycenter", "chocolate", 100),
    ("Saturn", "saturn barycenter", "khaki", 90),
    ("Uranus", "uranus barycenter", "lightsteelblue", 40),
    ("Neptune", "neptune barycenter", "royalblue", 30),
]


class Sky:  # pylint: disable=too-many-instance-attributes
    """The Sky and its bodies."""

    def __init__(
        self,
        latlong,
        tzname,
        show_constellations=True,
        show_time=True,
        show_legend=True,
        constellation_list=None,
        planet_list=None,
        north_up=False
    ):
        lat, long = latlong
        self._latlong = Topos(latitude_degrees=lat, longitude_degrees=long)
        self._timezone = timezone(tzname)
        self._planets = None
        self._ts = None
        self._location = None
        self._winter_solstice = None
        self._summer_solstice = None
        self.sun_position = None
        self._constellations = []
        self._points = []
        self._show_constellations = show_constellations
        self._show_time = show_time
        self._show_legend = show_legend
        self._north_up = north_up
        if constellation_list is None:
            self._constellation_names = constellations.DEFAULT_CONSTELLATIONS
        self._planet_list = planet_list

    def load(self, tmpdir="."):
        """Perform long-running init steps."""
        self._load_sky_data(tmpdir)
        self._run_initial_computations()

    def _load_sky_data(self, tmpdir):
        """
        Load the primary input data for skyfield.

        This requires a download for the first one, or
        the inclusion of the data files.
        """
        load = Loader(tmpdir)
        self._planets = load("de421.bsp")
        self._ts = load.timescale()

    def _run_initial_computations(self):
        self._location = self._planets[EARTH] + self._latlong
        self._compute_solstice_paths()
        self._load_points()
        if self._show_constellations:
            self._constellations = constellations.build_constellations(
                self, self._constellation_names
            )

    def _load_points(self):
        """Initialize the objects representing the Sun, moon, and planets."""
        for name, planet_label, color, size in BODIES:
            if self._planet_list is not None and name not in self._planet_list:
                # planet not requested. skip it.
                continue
            self._points.append(
                Point(name, self._planets[planet_label], color, size, self)
            )

    def _compute_solstice_paths(self):
        """Compute solar paths at winter and summer solstices."""
        today = datetime.datetime.today()
        self._winter_solstice = BodyPath(
            self._planets[SUN],
            datetime.datetime(today.year, 12, 21),
            self,
            fmt="--",
            color="blue",
            linewidth=1,
            alpha=0.8,
        )
        self._summer_solstice = BodyPath(
            self._planets[SUN],
            datetime.datetime(today.year, 6, 21),
            self,
            fmt="--",
            color="green",
            linewidth=1,
            alpha=0.8,
        )

    def compute_position(self, body, obs_datetime):
        """
        Compute azimuth and altitude of a body at a time.

        Remap the altitude to be degrees away from straight up
        rather than from the horizon, since this is how
        the plot axes are in theta,r coordinates.
        """
        obs_time = self._ts.utc(self._timezone.localize(obs_datetime))
        astrometric = self._location.at(obs_time).observe(body)
        alt, azi, _d = astrometric.apparent().altaz()
        alt = 90 - alt.radians * 180 / math.pi
        azi = azi.radians
        return azi, alt

    def plot_sky(self, output=None, when=None):
        """
        Make a figure with the sky and various planets/sun/moon.

        This is a r, theta plot where r goes from 0 to 90 from the center
        and theta goes all the way around radially.

        r represents the altitude
        theta is the azimuth.

        Matplotlib takes these in (theta, r) coordinate pairs so it's (azimuth, altitude) for us.
        """
        if when is None:
            when = datetime.datetime.now()

        visible = [np.linspace(0, 2 * np.pi, 200), [90.0 for _i in range(200)]]

        fig = plt.figure(figsize=(6, 6.2))
        ax = fig.add_subplot(111, projection="polar")  # pylint: disable=invalid-name
        ax.set_axisbelow(True)
        ax.set_theta_direction(-1)
        ax.plot(*visible, "-", color="k", linewidth=3, alpha=1.0)  # border

        self._draw_objects(ax, when)

        if self._show_time:
            ax.annotate(
                str(when),
                xy=(0.09, 0.07),
                xycoords="figure fraction",
                horizontalalignment="left",
                verticalalignment="top",
                fontsize=8,
            )

        if self._show_legend:
            fig.legend(
                loc="lower right",
                bbox_transform=plt.gcf().transFigure,
                ncol=3,
                markerscale=0.6,
                columnspacing=1,
                mode=None,
                handletextpad=0.05,
            )

        ax.set_theta_zero_location("N" if self._north_up else "S", offset=0)
        ax.set_rmax(90)
        ax.set_rgrids(
            np.linspace(0, 90, 10), [f"{int(f)}˚" for f in np.linspace(90, 0, 10)]
        )
        ax.set_thetagrids(
            np.linspace(0, 360.0, 9), ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"]
        )
        plt.tight_layout()

        if output is None:
            plt.show()
        else:
            # filename string or file-like object/buffer
            plt.savefig(output, format="png")
        plt.close()

    def _draw_objects(self, ax, when):
        """Add all celestial bodies to the plots"""
        today_sunpath = BodyPath(
            self._planets[SUN],
            # use today's midnight to hide discontinuities
            datetime.datetime.now().replace(hour=0, minute=0),
            self,
            "-",
            color="k",
            linewidth=1,
            alpha=0.8,
        )
        for sunpath in [self._winter_solstice, self._summer_solstice, today_sunpath]:
            sunpath.draw(ax)

        for point in self._points:
            point.draw(ax, when)

        for constellation in self._constellations:
            constellation.draw(ax, when)


class BodyPath(object):
    """A line that some Body will travel on on some given day"""

    def __init__(self, body, day, sky, fmt, color, linewidth=1, alpha=0.8):
        self._body = body
        self._day = day
        self._sky = sky
        self.path = None
        self.fmt = fmt
        self.color = color
        self.linewidth = linewidth
        self.alpha = alpha

        self._compute_daily_path()

    def _compute_daily_path(self, delta=datetime.timedelta(minutes=20)):
        """Get all possible positions for a given day."""
        data = []
        for interval in range(24 * 3 + 1):
            now = self._day + delta * interval
            azi, alt = self._sky.compute_position(self._body, now)
            data.append((azi, alt))
        self.path = list(zip(*data))

    def draw(self, ax):
        """Draw this path on a matplotlib axis"""
        ax.plot(
            *self.path,
            self.fmt,
            color=self.color,
            linewidth=self.linewidth,
            alpha=self.alpha,
        )


class Point(object):
    """A point in the sky like a planet or the sun"""

    def __init__(self, label, body, color, size, sky):
        self._label = label
        self._body = body
        self._size = size
        self._color = color
        self._sky = sky

    def draw(self, ax, when):
        azi, alt = self._sky.compute_position(self._body, when)
        ax.scatter(
            azi,
            alt,
            s=self._size,
            label=self._label,
            alpha=1.0,
            color=self._color,
            edgecolor="black",
        )
