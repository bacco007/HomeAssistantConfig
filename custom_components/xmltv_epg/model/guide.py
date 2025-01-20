"""TV Guide Model."""

import xml.etree.ElementTree as ET

from .channel import TVChannel
from .program import TVProgram


class TVGuide:
    """TV Guide Class."""

    TAG = "tv"

    def __init__(self, generator_name: str = None, generator_url: str = None):
        """Initialize TV Guide."""
        self.generator_name = generator_name
        self.generator_url = generator_url

        self.channels = []
        self.programs = []

    def get_channel(self, channel_id: str) -> TVChannel:
        """Get channel by ID."""
        return next((c for c in self.channels if c.id == channel_id), None)

    @classmethod
    def from_xml(cls, xml: ET.Element) -> "TVGuide":
        """Initialize TV Guide from XML Node, if possible.

        :param xml: XML Node
        :return: TV Guide object, or None

        XML node format is:
        <tv generator-info-name="Example" generator-info-url="https://example.com">
          <channel ... />
          <programme ... />
        </tv>
        """

        # node must be a TV guide
        if xml.tag != cls.TAG:
            return None

        # parse generator info
        generator_name = xml.attrib.get("generator-info-name")
        generator_url = xml.attrib.get("generator-info-url")

        # seen in https://github.com/shadow578/homeassistant_xmltv-epg/issues/32
        if generator_name is None:
            generator_name = xml.attrib.get("source-info-name")

        # create guide instance
        guide = cls(generator_name, generator_url)

        # parse channels and programs
        for child in xml:
            if child.tag == TVChannel.TAG:
                channel = TVChannel.from_xml(child)
                if channel is not None:
                    # ensure no duplicate channel ids
                    if guide.get_channel(channel.id) is None:
                        guide.channels.append(channel)
                    else:
                        # ?!
                        continue
            elif child.tag == TVProgram.TAG:
                program = TVProgram.from_xml(child)
                if program is not None:
                    guide.programs.append(program)
            else:
                # ?!
                continue

        # cross-link programs with channels
        for program in guide.programs:
            program.cross_link_channel(guide.channels)

        return guide
