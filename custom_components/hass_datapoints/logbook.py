"""Logbook integration for Hass Data Points."""

from __future__ import annotations

from homeassistant.core import Event, HomeAssistant, callback

from .const import (
    ATTR_COLOR,
    ATTR_ENTITY_IDS,
    ATTR_ICON,
    ATTR_MESSAGE,
    DOMAIN,
    EVENT_RECORDED,
)


def async_describe_events(
    hass: HomeAssistant,
    async_describe_event: callback,
) -> None:
    """Describe how Hass Data Points events appear in the logbook."""

    @callback
    def async_describe_hass_datapoints_event(event: Event) -> dict:
        data = event.data
        message = data.get(ATTR_MESSAGE, "Event recorded")
        entity_ids: list[str] = data.get(ATTR_ENTITY_IDS, [])
        icon = data.get(ATTR_ICON, "mdi:bookmark")
        color = data.get(ATTR_COLOR, "#03a9f4")

        result: dict = {
            "name": "Datapoint",
            "message": message,
            "icon": icon,
        }

        # HA logbook supports icon coloring via the context user
        # but we use the domain_data approach for the icon
        if color:
            result["icon_color"] = color

        # Logbook accepts a single entity_id; use the first one if present
        if entity_ids:
            result["entity_id"] = entity_ids[0]

        return result

    async_describe_event(DOMAIN, EVENT_RECORDED, async_describe_hass_datapoints_event)
