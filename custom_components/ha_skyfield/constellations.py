"""Handle plotting constellations on the sky field."""

import os
import datetime
import math

import numpy as np

from skyfield.api import Star

THIS_DIR = os.path.split(__file__)[0]
DATA_FILE = os.path.join(THIS_DIR, "constellations_by_RA_Dec.dat")

ZODIAC = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpius",
    "Sagittarius",
    "Capricornus",
    "Aquarius",
    "Pisces",
]

DEFAULT_CONSTELLATIONS = ZODIAC + ["Cassiopeia", "Orion", "Pegasus", "UrsaMajor"]


class Constellation(object):
    """A single constellation."""

    def __init__(self, name, radec_pairs, sky):
        self.name = name
        self._radec_pairs = radec_pairs
        self._sky = sky

    def draw(self, ax, when):
        """
        Draw on a matplotlib axis.

        Draw a representation of the constellation at a certain time
        projected onto the observation disk.

        This will look a bit strange with our given projection... they'll 
        look kind of upside down.
        """
        plotted = []  # don't repeat star points

        for (ra1, dec1), (ra2, dec2) in self._radec_pairs:
            star1 = Star(ra_hours=ra1, dec_degrees=dec1)
            star2 = Star(ra_hours=ra2, dec_degrees=dec2)
            azi1, alt1 = self._sky.compute_position(star1, when)
            azi2, alt2 = self._sky.compute_position(star2, when)
            # alt1 = 90 - alt1
            # alt2 = 90 - alt2
            if alt1 > 90 and alt1 > 90:
                # skip constellations that are not visible
                continue

            if (azi1, alt1) not in plotted:
                ax.scatter(
                    azi1, alt1, s=10, alpha=0.1, color="black", edgecolor="black",
                )
                plotted.append((azi1, alt1))

            if (azi2, alt2) not in plotted:
                ax.scatter(
                    azi2, alt2, s=10, alpha=0.1, color="black", edgecolor="black",
                )
                plotted.append((azi2, alt2))

            # avoid wrap-arounds azimuthally
            if azi2 - azi1 > math.pi:
                azi1 += math.pi * 2
            elif azi1 - azi2 > math.pi:
                azi2 += math.pi * 2
            ax.plot(
                np.linspace(azi1, azi2, 10),
                np.linspace(alt1, alt2, 10),
                "-",
                color="k",
                linewidth=1,
                alpha=0.1,
            )


def read_data():
    """
    Read constellation lines.

    Data file can be generated from various places, such as:
    https://github.com/dcf21/constellation-stick-figures
    """

    constellations = {}
    with open(DATA_FILE) as datafile:
        for line in datafile:
            line = line.strip()
            if line.startswith("#") or not line:
                continue

            name, ra1, dec1, ra2, dec2 = line.split()
            constellation_data = constellations.get(name, [])
            constellation_data.append(
                (
                    (float(ra1) / 360 * 24, float(dec1)),
                    (float(ra2) / 360 * 24, float(dec2)),
                )
            )
            constellations[name] = constellation_data
    return constellations


def build_constellations(sky, whitelist=None):
    constellations = []
    data = read_data()
    for name, radec_pairs in data.items():
        if whitelist is None or name in whitelist:
            constellations.append(Constellation(name, radec_pairs, sky))
    return constellations
