"""XMLTV Model."""

from .channel import TVChannel
from .guide import TVGuide
from .program import TVProgram

__all__ = [
    "TVChannel",
    "TVProgram",
    "TVGuide",
]
