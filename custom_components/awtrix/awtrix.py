"""Core components of AWTRIX Light."""

import base64
from io import BytesIO
import json
import logging

from PIL import Image
import requests

from homeassistant.components.media_source import Unresolvable
from homeassistant.const import STATE_UNAVAILABLE

"""Support for AWTRIX service."""

_LOGGER = logging.getLogger(__name__)

def merge_custom_data(payload, data):
    """Merge the custom values."""
    return (payload | (data or {})) if payload else payload

class AwtrixTime:
    """Allows to send updated to applications."""

    def __init__(self,
                 hass,
                 entity_id
                 ) -> None:
        """Initialize the device."""

        self.hass = hass
        self.entity_id = entity_id

    async def push_app_data(self, data):
        """Update the application data."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            if state.state == STATE_UNAVAILABLE:
                return

            if "name" not in data:
                raise Unresolvable("No app name")
            app_id = data["name"]
            topic = state.state + "/custom/" + app_id

            data = data.get("data", {}) or {}
            msg = data.copy()

            if 'icon' in msg:
                if str(msg["icon"]).startswith(('http://', 'https://')):
                    icon = await self.hass.async_add_executor_job(getIcon, str(msg["icon"]))
                    if icon:
                        msg["icon"] = icon

            if 'text' in msg:
                if isinstance(msg['text'], (int, float)):
                    msg['text'] = str(msg['text'])
                else:
                    msg['text']

            payload = json.dumps(msg) if len(msg) else ""
            service_data = {"payload": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    async def switch_app(self, data):
        """Call API switch app."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            if state.state == STATE_UNAVAILABLE:
                return

            topic = state.state + "/switch"
            if "name" not in data:
                raise Unresolvable("No app name")
            app_id = data["name"]

            payload = json.dumps({"name": app_id})
            service_data = {"payload": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    async def settings(self, data):
        """Call API settings."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            if state.state == STATE_UNAVAILABLE:
                return

            topic = state.state + "/settings"
            data = data or {}
            msg = data.copy()

            payload = json.dumps(msg)
            service_data = {"payload": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    async def rtttl(self, data):
        """Play rtttl."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            if state.state == STATE_UNAVAILABLE:
                return

            topic = state.state + "/rtttl"
            if "rtttl" not in data:
                raise Unresolvable("No rtttl.")

            rtttl_text = data["rtttl"]
            service_data = {"payload": rtttl_text,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    async def sound(self, data):
        """Play rtttl sound."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            if state.state == STATE_UNAVAILABLE:
                return

            topic = state.state + "/sound"
            if "sound" not in data:
                raise Unresolvable("No sound name")

            sound_id = data["sound"]
            payload = json.dumps({"sound": sound_id})
            service_data = {"payload": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

def getIcon(url):
    """Get icon by url."""
    try:
        timeout=5
        response = requests.get(url, timeout=timeout)
        if response and response.status_code == 200:
            pil_im = Image.open(BytesIO(response.content))
            pil_im = pil_im.convert('RGB')
            b = BytesIO()
            pil_im.save(b, 'jpeg')
            im_bytes = b.getvalue()
            return base64.b64encode(im_bytes).decode()
    except Exception as err:
        _LOGGER.exception(err)
