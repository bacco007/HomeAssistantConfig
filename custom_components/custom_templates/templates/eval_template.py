from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.template import Template


class EvalTemplate:

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def __call__(self, content: str) -> Any:
        tpl = Template(content, self._hass)
        return tpl.async_render()

    def __repr__(self) -> str:
        return "<template CT_EvalTemplate>"