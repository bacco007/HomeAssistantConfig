import math
import datetime


class MoonScript:
    rad = math.pi / 180
    degr = 180 / math.pi
    dayMs = 86400000  # 1000 * 60 * 60 * 24
    J1970 = 2440587.5
    J2000 = 2451545

    lunarDaysMs = 2551442778  # The duration in days of a lunar cycle is 29.53058770576
    firstNewMoon2000 = 947178840000  # first newMoon in the year 2000 2000-01-06 18:14

    fractionOfTheMoonCycle = [
        {
            "from": 0,
            "to": 0.033863193308711,
            "id": "new_moon",
            "emoji": "🌚",
            "code": ":new_moon_with_face:",
            "name": "New Moon",
            "weight": 1,
            "css": "wi-moon-new",
            "hastate": "new_moon",
        },
        {
            "from": 0.033863193308711,
            "to": 0.216136806691289,
            "id": "waxing_crescent",
            "emoji": "🌒",
            "code": ":waxing_crescent_moon:",
            "name": "Waxing Crescent",
            "weight": 6.3825,
            "css": "wi-moon-wax-cres",
            "hastate": "waxing_crescent",
        },
        {
            "from": 0.216136806691289,
            "to": 0.283863193308711,
            "id": "first_quarter",
            "emoji": "🌓",
            "code": ":first_quarter_moon:",
            "name": "First Quarter",
            "weight": 1,
            "css": "wi-moon-first-quart",
            "hastate": "first_quarter",
        },
        {
            "from": 0.283863193308711,
            "to": 0.466136806691289,
            "id": "waxing_gibbous",
            "emoji": "🌔",
            "code": ":waxing_gibbous_moon:",
            "name": "Waxing Gibbous",
            "weight": 6.3825,
            "css": "wi-moon-wax-gibb",
            "hastate": "waxing_gibbous",
        },
        {
            "from": 0.466136806691289,
            "to": 0.533863193308711,
            "id": "full_moon",
            "emoji": "🌝",
            "code": ":full_moon_with_face:",
            "name": "Full Moon",
            "weight": 1,
            "css": "wi-moon-full",
            "hastate": "full_moon",
        },
        {
            "from": 0.533863193308711,
            "to": 0.716136806691289,
            "id": "waning_gibbous",
            "emoji": "🌖",
            "code": ":waning_gibbous_moon:",
            "name": "Waning Gibbous",
            "weight": 6.3825,
            "css": "wi-moon-wan-gibb",
            "hastate": "waning_gibbous",
        },
        {
            "from": 0.716136806691289,
            "to": 0.783863193308711,
            "id": "last_quarter",
            "emoji": "🌗",
            "code": ":last_quarter_moon:",
            "name": "third Quarter",
            "weight": 1,
            "css": "wi-moon-third-quart",
            "hastate": "last_quarter",
        },
        {
            "from": 0.783863193308711,
            "to": 0.966136806691289,
            "id": "waning_crescent",
            "emoji": "🌘",
            "code": ":waning_crescent_moon:",
            "name": "Waning Crescent",
            "weight": 6.3825,
            "css": "wi-moon-wan-cres",
            "hastate": "waning_crescent",
        },
        {
            "from": 0.966136806691289,
            "to": 1,
            "id": "new_moon",
            "emoji": "🌚",
            "code": ":new_moon_with_face:",
            "name": "New Moon",
            "weight": 1,
            "css": "wi-moon-new",
            "hastate": "new_moon",
        },
    ]

    @staticmethod
    def fromJulianDay(j):
        return (j - MoonScript.J1970) * MoonScript.dayMs

    @staticmethod
    def toDays(dateValue):
        return dateValue / MoonScript.dayMs + MoonScript.J1970 - MoonScript.J2000

    @staticmethod
    def rightAscension(l, b):
        e = MoonScript.rad * 23.4397  # obliquity of the Earth
        return math.atan2(
            math.sin(l) * math.cos(e) - math.tan(b) * math.sin(e), math.cos(l)
        )

    @staticmethod
    def declination(l, b):
        e = MoonScript.rad * 23.4397  # obliquity of the Earth
        return math.asin(
            math.sin(b) * math.cos(e) + math.cos(b) * math.sin(e) * math.sin(l)
        )

    @staticmethod
    def moonCoords(d):
        L = MoonScript.rad * (218.316 + 13.176396 * d)  # ecliptic longitude
        M = MoonScript.rad * (134.963 + 13.064993 * d)  # mean anomaly
        F = MoonScript.rad * (93.272 + 13.22935 * d)  # mean distance
        l = L + MoonScript.rad * 6.289 * math.sin(M)  # longitude
        b = MoonScript.rad * 5.128 * math.sin(F)  # latitude
        dt = 385001 - 20905 * math.cos(M)  # distance to the moon in km

        return {
            "ra": MoonScript.rightAscension(l, b),
            "dec": MoonScript.declination(l, b),
            "dist": dt,
        }

    @staticmethod
    def sunCoords(d):
        M = MoonScript.solarMeanAnomaly(d)
        L = MoonScript.eclipticLongitude(M)

        return {
            "dec": MoonScript.declination(L, 0),
            "ra": MoonScript.rightAscension(L, 0),
        }

    @staticmethod
    def solarMeanAnomaly(d):
        return MoonScript.rad * (357.5291 + 0.98560028 * d)

    @staticmethod
    def eclipticLongitude(M):
        C = MoonScript.rad * (
            1.9148 * math.sin(M) + 0.02 * math.sin(2 * M) + 0.0003 * math.sin(3 * M)
        )
        P = MoonScript.rad * 102.9372
        return M + C + P + math.pi

    @staticmethod
    def get_moon_position(date, lat, lng):
        lw = MoonScript.rad * -lng
        phi = MoonScript.rad * lat
        d = MoonScript.toDays(date.timestamp() * 1000)
        c = MoonScript.moonCoords(d)
        H = MoonScript.siderealTime(d, lw) - c["ra"]
        altitude = MoonScript.altitudeCalc(H, phi, c["dec"])
        altitude += MoonScript.astroRefraction(
            altitude
        )  # altitude correction for refraction
        pa = math.atan2(
            math.sin(H),
            math.tan(phi) * math.cos(c["dec"]) - math.sin(c["dec"]) * math.cos(H),
        )
        azimuth = MoonScript.azimuthCalc(H, phi, c["dec"])

        return {
            "azimuth": azimuth,
            "altitude": altitude,
            "azimuthDegrees": MoonScript.degr * azimuth,
            "altitudeDegrees": MoonScript.degr * altitude,
            "distance": c["dist"],
            "parallacticAngle": pa,
            "parallacticAngleDegrees": MoonScript.degr * pa,
        }

    @staticmethod
    def get_moon_illumination(date):
        """Calculate the moon illumination details"""

        d = MoonScript.toDays(date.timestamp() * 1000)
        s = MoonScript.sunCoords(d)
        m = MoonScript.moonCoords(d)
        sdist = 149598000  # distance from Earth to Sun in km
        phi = math.acos(
            math.sin(s["dec"]) * math.sin(m["dec"])
            + math.cos(s["dec"]) * math.cos(m["dec"]) * math.cos(s["ra"] - m["ra"])
        )
        inc = math.atan2(sdist * math.sin(phi), m["dist"] - sdist * math.cos(phi))
        angle = math.atan2(
            math.cos(s["dec"]) * math.sin(s["ra"] - m["ra"]),
            math.sin(s["dec"]) * math.cos(m["dec"])
            - math.cos(s["dec"]) * math.sin(m["dec"]) * math.cos(s["ra"] - m["ra"]),
        )
        phaseValue = 0.5 + 0.5 * inc * (angle < 0 and -1 or 1) / math.pi
        fraction = (1 + math.cos(inc)) / 2

        # calculate moon cycle details
        diffBase = date.timestamp() * 1000 - MoonScript.firstNewMoon2000
        cycleModMs = diffBase % MoonScript.lunarDaysMs
        if cycleModMs < 0:
            cycleModMs += MoonScript.lunarDaysMs
        nextNewMoon = MoonScript.lunarDaysMs - cycleModMs + date.timestamp() * 1000
        nextFullMoon = MoonScript.lunarDaysMs / 2 - cycleModMs + date.timestamp() * 1000
        if nextFullMoon < date.timestamp() * 1000:
            nextFullMoon += MoonScript.lunarDaysMs
        quater = MoonScript.lunarDaysMs / 4
        nextFirstQuarter = quater - cycleModMs + date.timestamp() * 1000
        if nextFirstQuarter < date.timestamp() * 1000:
            nextFirstQuarter += MoonScript.lunarDaysMs

        nextThirdQuarter = (
            MoonScript.lunarDaysMs - quater - cycleModMs + date.timestamp() * 1000
        )
        if nextThirdQuarter < date.timestamp() * 1000:
            nextThirdQuarter += MoonScript.lunarDaysMs

        next = min(nextNewMoon, nextFirstQuarter, nextFullMoon, nextThirdQuarter)

        phase = None
        for p in MoonScript.fractionOfTheMoonCycle:
            if phaseValue >= p["from"] and phaseValue <= p["to"]:
                phase = p
                break

        return {
            "fraction": fraction,
            "phase": phase,
            "phaseValue": phaseValue,
            "angle": angle,
            "next": {
                "value": next,
                "date": datetime.datetime.utcfromtimestamp(next / 1000).isoformat()
                + "Z",
                "type": "new_moon"
                if next == nextNewMoon
                else "first_quarter"
                if next == nextFirstQuarter
                else "full_moon"
                if next == nextFullMoon
                else "last_quarter",
                "newMoon": {
                    "value": nextNewMoon,
                    "date": datetime.datetime.utcfromtimestamp(
                        nextNewMoon / 1000
                    ).isoformat()
                    + "Z",
                },
                "fullMoon": {
                    "value": nextFullMoon,
                    "date": datetime.datetime.utcfromtimestamp(
                        nextFullMoon / 1000
                    ).isoformat()
                    + "Z",
                },
                "firstQuarter": {
                    "value": nextFirstQuarter,
                    "date": datetime.datetime.utcfromtimestamp(
                        nextFirstQuarter / 1000
                    ).isoformat()
                    + "Z",
                },
                "thirdQuarter": {
                    "value": nextThirdQuarter,
                    "date": datetime.datetime.utcfromtimestamp(
                        nextThirdQuarter / 1000
                    ).isoformat()
                    + "Z",
                },
            },
        }

    @staticmethod
    def siderealTime(d, lw):
        return MoonScript.rad * (280.16 + 360.9856235 * d) - lw

    @staticmethod
    def astroRefraction(h):
        if h < 0:
            h = 0
        return 0.0002967 / math.tan(h + 0.00312536 / (h + 0.08901179))

    @staticmethod
    def azimuthCalc(H, phi, dec):
        return (
            math.atan2(
                math.sin(H), math.cos(H) * math.sin(phi) - math.tan(dec) * math.cos(phi)
            )
            + math.pi
        )

    @staticmethod
    def altitudeCalc(H, phi, dec):
        return math.asin(
            math.sin(phi) * math.sin(dec) + math.cos(phi) * math.cos(dec) * math.cos(H)
        )

    @staticmethod
    def hoursLater(dateValue, h):
        return dateValue + (h * MoonScript.dayMs) / 24

    @staticmethod
    def get_moon_times(date, lat, lng, inUTC=False):
        t = (
            datetime.datetime.utcfromtimestamp(date.timestamp())
            if inUTC
            else datetime.datetime.fromtimestamp(date.timestamp())
        )
        t = t.replace(hour=0, minute=0, second=0, microsecond=0)
        dateValue = t.timestamp() * 1000

        hc = 0.133 * MoonScript.rad
        h0 = (
            MoonScript.get_moon_position(
                datetime.datetime.fromtimestamp(dateValue / 1000), lat, lng
            )["altitude"]
            - hc
        )
        rise = set = None

        for i in range(1, 27, 2):
            h1 = (
                MoonScript.get_moon_position(
                    datetime.datetime.fromtimestamp(
                        MoonScript.hoursLater(dateValue, i) / 1000
                    ),
                    lat,
                    lng,
                )["altitude"]
                - hc
            )
            h2 = (
                MoonScript.get_moon_position(
                    datetime.datetime.fromtimestamp(
                        MoonScript.hoursLater(dateValue, i + 1) / 1000
                    ),
                    lat,
                    lng,
                )["altitude"]
                - hc
            )

            a = (h0 + h2) / 2 - h1
            b = (h2 - h0) / 2
            xe = -b / (2 * a)
            ye = (a * xe + b) * xe + h1
            d = b * b - 4 * a * h1
            roots = 0

            if d >= 0:
                dx = math.sqrt(d) / (2 * abs(a))
                x1 = xe - dx
                x2 = xe + dx
                if abs(x1) <= 1:
                    roots += 1
                if abs(x2) <= 1:
                    roots += 1
                if x1 < -1:
                    x1 = x2

            if roots == 1:
                if h0 < 0:
                    rise = i + x1
                else:
                    set = i + x1
            elif roots == 2:
                rise = i + (x2 if ye < 0 else x1)
                set = i + (x1 if ye < 0 else x2)

            if rise and set:
                break

            h0 = h2

        result = {}
        if rise:
            result["rise"] = datetime.datetime.fromtimestamp(
                MoonScript.hoursLater(dateValue, rise) / 1000
            )
        else:
            result["rise"] = None

        if set:
            result["set"] = datetime.datetime.fromtimestamp(
                MoonScript.hoursLater(dateValue, set) / 1000
            )
        else:
            result["set"] = None

        if not rise and not set:
            if ye > 0:
                result["alwaysUp"] = True
                result["alwaysDown"] = False
            else:
                result["alwaysUp"] = False
                result["alwaysDown"] = True
        else:
            result["alwaysUp"] = False
            result["alwaysDown"] = False
            if rise and set:
                result["highest"] = datetime.datetime.fromtimestamp(
                    MoonScript.hoursLater(
                        dateValue, min(rise, set) + abs(set - rise) / 2
                    )
                    / 1000
                )

        return result
