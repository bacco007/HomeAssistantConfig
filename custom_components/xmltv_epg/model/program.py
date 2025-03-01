"""TV Program Model."""

import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, cast

from .helper import get_child_as_text, is_none_or_whitespace

if TYPE_CHECKING:
    from .channel import TVChannel


def parse_episode_number(xml: ET.Element) -> str | None:
    """Parse episode number from XML node to a readable format."""
    episode_nums = {}
    for episode_num in xml.findall("episode-num"):
        system = episode_num.attrib.get("system")
        content = episode_num.text
        if system is not None and content is not None:
            episode_nums[system] = episode_num.text

    # prefer Season+Episode format
    if "SxxExx" in episode_nums:
        return episode_nums["SxxExx"]

    # fallback to xmltv_ns format, reformatted to 'S{season}E{episode}'
    # xmltv_ns format is '0.0.' for 'S1E1'
    # alternative format is '.0.' for episode only
    if "xmltv_ns" in episode_nums:
        episode = episode_nums["xmltv_ns"]
        s, e, _ = episode.split(".")

        if s and e:
            # Season+Episode format
            s = int(s) + 1
            e = int(e) + 1
            return f"S{s}E{e}"
        elif s:
            # Season only format (technically invalid, but still)
            s = int(s) + 1
            return f"S{s}"
        elif e:
            # Episode only format
            e = int(e) + 1
            return f"E{e}"

    # fallback to any other format
    for episode_num in episode_nums.values():
        return episode_num

    return None


class TVProgram:
    """TV Program Class."""

    TAG = "programme"

    def __init__(
        self,
        channel_id: str,
        start: datetime,
        end: datetime,
        title: str,
        description: str,
        episode: str | None = None,
        subtitle: str | None = None,
        image_url: str | None = None,
    ):
        """Initialize TV Program."""
        if end <= start:
            raise ValueError("End time must be after start time.")

        self._channel_id = channel_id
        self.start = start
        self.end = end
        self.title = title
        self.description = description
        self.episode = episode
        self.subtitle = subtitle
        self.image_url = image_url

        self.channel = None

    def cross_link_channel(self, channels: list["TVChannel"]):
        """Set channel for program and cross-link.

        :param channels: List of TV Channels
        """
        # find channel by id
        channel = next((c for c in channels if c.id == self._channel_id), None)
        if channel is None:
            raise ValueError(f'Channel with ID "{self._channel_id}" not found.')

        # cross-link
        self.channel = channel
        self.channel.add_program(self)

    @property
    def duration(self) -> timedelta:
        """Get program duration."""
        return self.end - self.start

    @property
    def full_title(self) -> str:
        """Get the full title, including episode and / or subtitle, if available.

        Examples:
        (1)
        Title: 'Program 1'
        Episode: None
        Subtitle: None
        Result: 'Program 1'

        (2)
        Title: 'Program 1'
        Episode: 'S1 E1'
        Subtitle: None
        Result: 'Program 1 (S1 E1)'

        (3)
        Title: 'Program 1'
        Episode: 'S1 E1'
        Subtitle: 'Subtitle 1'
        Result: 'Program 1 - Subtitle 1 (S1 E1)'

        (4)
        Title: 'Program 1'
        Episode: None
        Subtitle: 'Subtitle 1'
        Result: 'Program 1 - Subtitle 1'

        """
        title = self.title

        if not is_none_or_whitespace(self.subtitle):
            title += f" - {self.subtitle}"

        if not is_none_or_whitespace(self.episode):
            title += f" ({self.episode})"

        return title

    @classmethod
    def from_xml(cls, xml: ET.Element) -> "TVProgram | None":
        """Initialize TV Program from XML Node, if possible.

        Cross-link is not done here, call cross_link_channel() after all programs are created.

        :param xml: XML Node
        :return: TV Program object, or None

        XML node format is:
        <programme start="20240517124500 +0200" stop="20240517130000 +0200" channel="DE: WDR Essen">
          <title>WDR aktuell</title>
          <sub-title>vom 17.05.2024, 12:45 Uhr</sub-title>
          <desc>Das Sendung bietet Nachrichten für und aus Nordrhein-Westfalen im Magazinformat.</desc>
          <episode-num system="onscreen">S5 E34</episode-num>
        </programme>
        """

        # node must be a program
        if xml.tag != cls.TAG:
            return None

        # get start and end times
        start = xml.attrib.get("start")
        end = xml.attrib.get("stop")
        if is_none_or_whitespace(start) or is_none_or_whitespace(end):
            return None
        start = cast(str, start)
        end = cast(str, end)

        # parse start and end times
        try:
            start = datetime.strptime(start, "%Y%m%d%H%M%S %z")
            end = datetime.strptime(end, "%Y%m%d%H%M%S %z")
        except ValueError:
            return None

        # get channel id
        channel_id = xml.attrib.get("channel")
        if is_none_or_whitespace(channel_id):
            return None
        channel_id = cast(str, channel_id)

        # get and validate program info
        title = get_child_as_text(xml, "title")
        description = get_child_as_text(xml, "desc")
        episode = parse_episode_number(xml)
        subtitle = get_child_as_text(xml, "sub-title")

        if is_none_or_whitespace(title) or is_none_or_whitespace(description):
            return None
        title = cast(str, title)
        description = cast(str, description)

        # get optional icon url
        icon = xml.find("icon")
        if icon is not None:
            icon = icon.attrib.get("src")

        try:
            return cls(
                channel_id, start, end, title, description, episode, subtitle, icon
            )
        except ValueError:
            return None
