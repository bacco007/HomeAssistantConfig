"""Translate to localized string.

External imports: aiofiles, orjson
"""

from pathlib import Path
from typing import Any, Literal

import aiofiles
import orjson

from homeassistant.core import HomeAssistant
from homeassistant.helpers.selector import NumberSelectorConfig, NumberSelectorMode

from . import async_get_user_language


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class NumberSelectorConfigTranslate:
    """Class to represent a number selector config where the unit of measurement is translated."""

    def __init__(
        self,
        hass: HomeAssistant,
        min: float | None = None,
        max: float | None = None,
        step: float | Literal["any"] | None = None,
        unit_of_measurement: str | None = None,
        mode: NumberSelectorMode | None = None,
    ):
        """Init."""
        self.hass: HomeAssistant = hass
        self.min = min
        self.max = max
        self.step = step
        self.unit_of_measurement = unit_of_measurement
        self.mode = mode

    async def translate(self) -> NumberSelectorConfig:
        """Return a NumberSelectorConfig with the unit of measurement translated."""
        CONF_KEY = "config.step.unit_of_measurement.data"

        tmp_dict: dict[str, Any] = {}
        if self.min is not None:
            tmp_dict["min"] = self.min
        if self.max is not None:
            tmp_dict["max"] = self.max
        if self.step is not None:
            tmp_dict["step"] = self.step
        if self.unit_of_measurement is not None:
            tmp_trans = await Translate(
                self.hass,
                load_only=CONF_KEY,
            ).async_get_localized_str(
                CONF_KEY + "." + self.unit_of_measurement,
                file_name=".json",
                default=self.unit_of_measurement,
            )

            tmp_dict["unit_of_measurement"] = tmp_trans
        if self.mode is not None:
            tmp_dict["mode"] = self.mode

        return NumberSelectorConfig(**tmp_dict)

    async def __call__(self) -> NumberSelectorConfig:
        """Return a NumberSelectorConfig."""
        return await self.translate()


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class Translate:
    """Translate to localized string class.

    External imports: orjson
    """

    __filename: str = ""
    __json_dict: dict[str, Any] = {}
    acive_language: str = ""

    def __init__(self, hass: HomeAssistant, load_only: str = "") -> None:
        """Init."""
        self.hass = hass
        self.load_only: str = load_only

    # ------------------------------------------------------------------
    async def async_get_localized_str(
        self,
        key: str,
        language: str | None = None,
        file_name: str = ".json",
        load_only: str = "",
        default: Any = "",
        **kvargs,
    ) -> str:
        """Get localized string."""

        if load_only == "":
            load_only = self.load_only

        if language is None:
            language = await async_get_user_language()

        await self.__async_check_language_loaded(
            str(language), file_name=file_name, load_only=load_only
        )

        if len(kvargs) == 0:
            return Translate.__json_dict.get(key, default)

        return str(Translate.__json_dict.get(key, default)).format(**kvargs)

    # ------------------------------------------------------------------
    async def __async_check_language_loaded(
        self, language: str, file_name: str = ".json", load_only: str = ""
    ) -> None:
        """Check language."""

        # ------------------------------------------------------------------
        def recursive_flatten(
            prefix: Any, data: dict[str, Any], load_only: str = ""
        ) -> dict[str, Any]:
            """Return a flattened representation of dict data."""
            output = {}
            for key, value in data.items():
                if isinstance(value, dict):
                    output.update(
                        recursive_flatten(f"{prefix}{key}.", value, load_only)
                    )
                elif (
                    load_only != "" and f"{prefix}{key}".find(load_only) == 0
                ) or load_only == "":
                    output[f"{prefix}{key}"] = value
            return output

        filename: Path = (
            Path(Path(__file__).parent.parent) / "translations" / (language + file_name)
        )

        if not filename.is_file():
            filename = (
                Path(Path(__file__).parent.parent) / "translations" / ("en" + file_name)
            )

            if not filename.is_file():
                return

        if Translate.__filename != str(filename):
            Translate.__filename = str(filename)
            Translate.acive_language = language

            async with aiofiles.open(str(filename)) as json_file:
                Translate.__json_dict = recursive_flatten(
                    "", orjson.loads(await json_file.read()), load_only
                )
