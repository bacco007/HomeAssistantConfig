"""tvxml_epg helper functions."""


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
