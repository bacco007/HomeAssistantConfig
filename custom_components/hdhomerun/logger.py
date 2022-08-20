"""Logging."""

# region #-- imports --#
import inspect

# endregion


class Logger:
    """Provide functions for managing log messages."""

    def __init__(self, unique_id: str = "", prefix: str = ""):
        """Initialise."""
        self._unique_id: str = unique_id
        self._prefix: str = prefix

    def format(self, message: str, include_lineno: bool = False) -> str:
        """Format a log message in the correct format."""
        caller: inspect.FrameInfo = inspect.stack()[1]
        line_no = f" --> line: {caller.lineno}" if include_lineno else ""
        unique_id = f" ({self._unique_id})" if self._unique_id else ""
        return f"{self._prefix}{caller.function}{unique_id}{line_no} --> {message}"
