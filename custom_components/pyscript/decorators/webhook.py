"""Webhook decorator."""

from __future__ import annotations

import logging
from typing import ClassVar

from aiohttp import hdrs
import voluptuous as vol

from homeassistant.components import webhook
from homeassistant.components.webhook import SUPPORTED_METHODS
from homeassistant.helpers import config_validation as cv

from ..decorator_abc import DispatchData, TriggerDecorator
from .base import AutoKwargsDecorator, ExpressionDecorator

_LOGGER = logging.getLogger(__name__)


class WebhookTriggerDecorator(TriggerDecorator, ExpressionDecorator, AutoKwargsDecorator):
    """Implementation for @webhook_trigger."""

    name = "webhook_trigger"
    args_schema = vol.Schema(
        vol.All(
            [vol.Coerce(str)],
            vol.Length(min=1, max=2, msg="needs at least one argument"),
        )
    )
    kwargs_schema = vol.Schema(
        {
            vol.Optional("local_only", default=True): cv.boolean,
            vol.Optional("methods"): vol.All(list[str], [vol.In(SUPPORTED_METHODS)]),
        }
    )

    webhook_id: str
    local_only: bool
    methods: set[str]

    webhook_id2triggers: ClassVar[dict[str, set[WebhookTriggerDecorator]]] = {}

    async def validate(self):
        """Validate the webhook trigger configuration."""
        await super().validate()
        self.webhook_id = self.args[0]

        if len(self.args) == 2:
            self.create_expression(self.args[1])

    @staticmethod
    async def _handler(_hass, webhook_id, request):
        func_args = {
            "trigger_type": "webhook",
            "webhook_id": webhook_id,
        }

        if "json" in request.headers.get(hdrs.CONTENT_TYPE, ""):
            func_args["payload"] = await request.json()
        else:
            # Could potentially return multiples of a key - only take the first
            payload_multidict = await request.post()
            func_args["payload"] = {k: payload_multidict.getone(k) for k in payload_multidict.keys()}

        for trigger in WebhookTriggerDecorator.webhook_id2triggers.get(webhook_id, set()).copy():
            trigger_args = func_args.copy()
            if trigger.has_expression():
                if not await trigger.check_expression_vars(trigger_args):
                    continue
            await trigger.dispatch(DispatchData(trigger_args))

    @staticmethod
    def _add_trigger(trigger: WebhookTriggerDecorator) -> None:
        webhook_id = trigger.webhook_id
        if webhook_id not in WebhookTriggerDecorator.webhook_id2triggers:
            webhook.async_register(
                trigger.dm.hass,
                "pyscript",  # DOMAIN
                "pyscript",  # NAME
                webhook_id,
                WebhookTriggerDecorator._handler,
                local_only=trigger.local_only,
                allowed_methods=trigger.methods,
            )
            WebhookTriggerDecorator.webhook_id2triggers[webhook_id] = set()

        WebhookTriggerDecorator.webhook_id2triggers[webhook_id].add(trigger)

    @staticmethod
    def _remove_trigger(trigger: WebhookTriggerDecorator) -> None:
        webhook_id = trigger.webhook_id
        triggers = WebhookTriggerDecorator.webhook_id2triggers.get(webhook_id)
        if not triggers:
            return

        triggers.discard(trigger)
        if len(triggers) == 0:
            webhook.async_unregister(trigger.dm.hass, webhook_id)
            del WebhookTriggerDecorator.webhook_id2triggers[webhook_id]

    async def start(self):
        """Start the webhook trigger."""
        await super().start()
        self._add_trigger(self)

        _LOGGER.debug("webhook trigger %s listening on id %s", self.dm.name, self.webhook_id)

    async def stop(self):
        """Stop the webhook trigger."""
        await super().stop()
        self._remove_trigger(self)
