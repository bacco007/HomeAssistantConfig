"""tvxml_epg helper functions."""

from typing import Literal

from .model import TVChannel


def normalize_for_entity_id(s: str) -> str:
    """Normalize a string for usage in an entity_id.

    Example:
    - s = 'DE: WDR (Münster)'
    => "de_wdr_muenster"

    :param s: The string to normalize.
    :return: The normalized string.

    """

    # lower case
    s = s.lower()

    # special replacement rules
    replacements = {
        # replace umlauts with their respective digraphs
        "ä": "ae",
        "ö": "oe",
        "ü": "ue",
        "ß": "ss",
        # '+' is replaced with ' plus '.
        "+": " plus ",
    }
    for umlaut, replacement in replacements.items():
        s = s.replace(umlaut, replacement)

    # replace "delimiting characters" and spaces with underscores
    for c in " -.:":
        s = s.replace(c, "_")

    # remove all non-alphanumeric characters except underscores
    s = "".join(c if c.isalnum() or c == "_" else "" for c in s)

    # trim underscores from start and end
    s = s.strip("_")

    # remove all occurrences of multiple underscores
    while "__" in s:
        s = s.replace("__", "_")

    return s


def program_get_normalized_identification(
    channel: TVChannel,
    is_next: bool,
    kind: Literal["program_sensor"]
    | Literal["program_image"]
    | Literal["channel_icon"],
) -> tuple[str, str]:
    """Return normalized identification information for a sensor for the given channel and upcoming status.

    The identification information consists of the sensor entity_id and the translation_key.
    For the entity_id, the channel id is normalized and cleaned up to form a valid entity_id.

    Example:
    - channel_id = 'DE: My Channel 1'
    - is_next = False
    - kind = 'program_sensor'
    => ('program_current', 'sensor.de_my_channel_1_program_current')

    - channel_id = "DE: My Channel 1'
    - is_next = True
    - kind = 'program_image'
    => ('program_image_upcoming', 'image.de_my_channel_1_program_image_upcoming')

    - channel_id = "DE: My Channel 1'
    - is_next = (don't care)
    - kind = 'channel_icon'
    => ('channel_icon', 'image.de_my_channel_1_icon')

    :param channel: The TV channel.
    :param is_next: The upcoming status.
    :param kind: entity type to create id for
    :return: (translation_key, entity_id) tuple.

    """

    if kind == "program_sensor":
        translation_key = f"program_{'upcoming' if is_next else 'current'}"
        entity_id = f"sensor.{normalize_for_entity_id(channel.id)}_{translation_key}"
    elif kind == "program_image":
        translation_key = f"program_image_{'upcoming' if is_next else 'current'}"
        entity_id = f"image.{normalize_for_entity_id(channel.id)}_{translation_key}"
    elif kind == "channel_icon":
        translation_key = "channel_icon"
        entity_id = f"image.{normalize_for_entity_id(channel.id)}_icon"
    else:
        raise ValueError(f"invalid entity kind '{kind}'")

    return translation_key, entity_id
