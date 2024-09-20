from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.template import Template
from jinja2.runtime import Context


class EvalTemplate:

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def __call__(
            self,
            passed_context: Context,
            content: str,
            variables: dict | None = None,
            parse_result: bool = True,
            pass_context: bool = True
    ) -> Any:
        context = {}
        if pass_context:
            context = context | passed_context.get_all()
        if variables is not None:
            context = context | variables
        tpl = Template(content, self._hass)
        return tpl.async_render(variables=context, parse_result=parse_result)

    def __repr__(self) -> str:
        return "<template CT_EvalTemplate>"
