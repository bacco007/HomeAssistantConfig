"""TV Channel Model."""

import xml.etree.ElementTree as ET
from datetime import datetime

from .helper import get_child_as_text, is_none_or_whitespace
from .program import TVProgram


class TVChannel:
    """TV Channel Class."""

    TAG = "channel"

    def __init__(self, id: str, name: str):
        """Initialize TV Channel."""
        self.id = id
        self.name = name
        self.programs = []

    def add_program(self, program: TVProgram):
        """Add a program to channel."""
        self.programs.append(program)

        # keep programs sorted by start time
        self.programs.sort(key=lambda p: p.start)

    def get_current_program(self, time: datetime) -> TVProgram:
        """Get current program at given time."""
        for program in self.programs:
            if program.start.timestamp() <= time.timestamp() < program.end.timestamp():
                return program

        return None

    def get_next_program(self, time: datetime) -> TVProgram:
        """Get next program after given time."""
        for program in self.programs:
            if program.start.timestamp() >= time.timestamp():
                return program

        return None

    @classmethod
    def from_xml(cls, xml: ET.Element) -> "TVChannel":
        """Initialize TV Channel from XML Node, if possible.

        :param xml: XML Node
        :return: TV Channel object, or None

        XML node format is:
        <channel id="DE: WDR Essen">
          <display-name>WDR Essen</display-name>
        </channel>
        """

        # node must be a channel
        if xml.tag != cls.TAG:
            return None

        # get id and display name
        id = xml.attrib.get("id")
        if is_none_or_whitespace(id):
            return None

        name = get_child_as_text(xml, "display-name")
        if is_none_or_whitespace(name):
            return None

        # remove 'XX: ' prefix from name, if present
        if len(name) > 4 and name[2] == ":" and name[3] == " ":  # 'XX: '
            name = name[4:]

        return cls(id, name)
