"""A file logger."""

from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import os

from homeassistant.const import FORMAT_DATETIME, KEY_DATA_LOGGING
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

ERROR_LOG_FILENAME = "home-assistant.log"

_LOGGER = logging.getLogger(__name__)


class _RotatingFileHandlerWithoutShouldRollOver(RotatingFileHandler):
    """RotatingFileHandler that does not check if it should roll over on every log.

    Copied from bootstrap.py
    """

    def shouldRollover(self, record: logging.LogRecord) -> bool:
        """Never roll over.

        The shouldRollover check is expensive because it has to stat
        the log file for every log record. Since we do not set maxBytes
        the result of this check is always False.
        """
        return False


def _create_log_file(
    err_log_path: str,
) -> RotatingFileHandler | TimedRotatingFileHandler:
    """Create log file and do roll over."""

    err_handler = _RotatingFileHandlerWithoutShouldRollOver(err_log_path, backupCount=1)
    try:
        err_handler.doRollover()
    except OSError as err:
        _LOGGER.error("Error rolling over log file: %s", err)

    return err_handler


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Setup logging to a file."""

    debugpy_running = "DEBUGPY_RUNNING"
    if "SUPERVISOR" in os.environ or (
        debugpy_running in os.environ and os.environ[debugpy_running]
    ):
        logger = logging.getLogger()
        log_path = hass.config.path(
            ERROR_LOG_FILENAME
            if "SUPERVISOR" in os.environ
            else f"file-logger-{ERROR_LOG_FILENAME}"
        )

        handler = await hass.async_add_executor_job(_create_log_file, log_path)
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s.%(msecs)03d %(levelname)s (%(threadName)s) [%(name)s] %(message)s",
                datefmt=FORMAT_DATETIME,
            )
        )
        logger.addHandler(handler)
        hass.data[KEY_DATA_LOGGING] = log_path

    return True
