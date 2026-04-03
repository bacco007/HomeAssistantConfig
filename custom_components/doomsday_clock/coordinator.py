from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time, timedelta
import logging
import re

from aiohttp import ClientError
from bs4 import BeautifulSoup

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CONF_RESOURCE, CONF_SELECTOR, DEFAULT_SELECTORS, DOMAIN, UPDATE_INTERVAL

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class DoomsdayClockData:
    """Fetched Doomsday Clock data."""

    sentence: str
    minutes_to_midnight: float
    midnight_time: str
    selector_used: str


def number_string_to_int(value: str) -> int | None:
    """Convert textual numbers into integers."""
    switcher = {
        "zero": 0,
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
    }
    return switcher.get(value.lower())


def sentence_to_number(sentence: str) -> float | None:
    """Convert Doomsday Clock string to minutes to midnight."""
    pattern = (
        r"(?:(?P<integer>\d+)"
        r"|(?P<string>zero|one|two|three|four|five|six|seven|eight|nine)"
        r"(?P<andhalf>.*?half)"
        r"|(?P<half>half)) (?:minutes|a minute|seconds) to midnight"
    )
    result = re.search(pattern, sentence, re.M | re.I)

    if result is None:
        return None

    countdown = 0.0

    if result.group("integer"):
        countdown = float(int(result.group("integer")))

    if result.group("string"):
        parsed = number_string_to_int(result.group("string"))
        if parsed is None:
            return None
        countdown = float(parsed)

    if result.group("andhalf") or result.group("half"):
        countdown += 0.5

    # Handle "seconds to midnight"
    if "seconds to midnight" in sentence.lower():
        countdown = countdown / 60.0

    return countdown


def number_to_time(value: float) -> str:
    """Convert number of minutes to midnight into 24h format."""
    midnight = datetime.combine(
        datetime.today().date() + timedelta(days=1),
        time(0, 0, 0),
    )
    minutes = int(value // 1)
    seconds = int(round((value - minutes) * 60))
    delta = timedelta(minutes=minutes, seconds=seconds)
    return (midnight - delta).strftime("%H:%M:%S")


class DoomsdayClockCoordinator(DataUpdateCoordinator[DoomsdayClockData]):
    """Coordinator to fetch Doomsday Clock data."""

    def __init__(self, hass: HomeAssistant, config: dict) -> None:
        self.resource = config[CONF_RESOURCE]
        configured_selector = config.get(CONF_SELECTOR)
        self.selectors = [configured_selector] if configured_selector else list(DEFAULT_SELECTORS)

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=UPDATE_INTERVAL,
        )

    async def _async_update_data(self) -> DoomsdayClockData:
        """Fetch and parse the source page."""
        session = async_get_clientsession(self.hass)

        try:
            async with session.get(self.resource, timeout=30) as response:
                response.raise_for_status()
                html = await response.text()
        except (ClientError, TimeoutError, ValueError) as err:
            raise UpdateFailed(f"Error fetching Doomsday Clock page: {err}") from err

        soup = BeautifulSoup(html, "html.parser")

        sentence = None
        selector_used = None

        for selector in self.selectors:
            matches = soup.select(selector)
            if matches:
                candidate = matches[0].text.strip()
                if candidate:
                    sentence = candidate
                    selector_used = selector
                    break

        if not sentence or not selector_used:
            raise UpdateFailed(
                "No sentence found using any selector: "
                + ", ".join(self.selectors)
            )

        value = sentence_to_number(sentence)
        if value is None:
            raise UpdateFailed(f"Could not parse Doomsday Clock sentence: {sentence}")

        return DoomsdayClockData(
            sentence=sentence,
            minutes_to_midnight=value,
            midnight_time=number_to_time(value),
            selector_used=selector_used,
        )