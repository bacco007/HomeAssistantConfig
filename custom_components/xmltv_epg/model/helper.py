"""Model helper functions."""

import xml.etree.ElementTree as ET


def is_none_or_whitespace(s: str | None) -> bool:
    """Check if string is None, empty, or whitespace."""
    return s is None or not isinstance(s, str) or len(s.strip()) == 0


def get_child_as_text(parent: ET.Element, tag: str) -> str | None:
    """Get child node text as string, or None if not found."""
    node = parent.find(tag)
    return node.text if node is not None else None
