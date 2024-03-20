"""Support for Awtrix notifications."""

import base64
from io import BytesIO
import json
import logging

from PIL import Image
import requests

from homeassistant.components.notify import ATTR_DATA, BaseNotificationService

from .const import CONF_DEVICE

_LOGGER = logging.getLogger(__name__)


async def async_get_service(hass, config, discovery_info=None):
    """Get the Awtrix notification service."""

    if discovery_info is None:
        return None

    entity_id = discovery_info[CONF_DEVICE]
    return AwtrixNotificationService(entity_id)


########################################################################################################

class AwtrixNotificationService(BaseNotificationService):
    """Implement the notification service for Awtrix."""

    def __init__(self, entity_id):
        """Init the notification service for Awtrix."""
        self.entity_id = entity_id

    async def notification(self, topic, message, data):
        """Handle the notification service for Awtric."""

        data = data or {}
        msg = data.copy()
        msg["text"] = message

        if 'icon' in msg:
            if str(msg["icon"]).startswith(('http://', 'https://')):
                icon = await self.hass.async_add_executor_job(getIcon, str(msg["icon"]))
                if icon:
                    msg["icon"] = icon

        # """Service to send a message."""
        service_data = None
        if not message:
            service_data = {"payload_template": "",
                        "topic": topic + "/notify/dismiss"}
        else:
            payload = json.dumps(msg)
            service_data = {"payload_template": payload,
                            "topic": topic + "/notify"}

        return await self.hass.services.async_call(
            "mqtt", "publish", service_data
        )

    async def async_send_message(self, message='', **kwargs):
        """Send a message to some Awtrix device."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            topic = state.state
            data = kwargs.get(ATTR_DATA)
            await self.notification(topic, message, data)


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
