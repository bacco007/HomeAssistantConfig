"""Link station / alarm-hub models for UniFi Protect API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LinkStation(BaseModel):
    """
    Model representing a UniFi Protect link station.

    The Protect API returns the same ``linkStation`` schema for both the
    ``/link-stations`` and ``/alarm-hubs`` resources; ``is_alarm_hub``
    distinguishes an alarm hub from a plain link station.
    """

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    is_alarm_hub: bool | None = Field(default=None, alias="isAlarmHub")
    led_settings: dict[str, Any] | None = Field(default=None, alias="ledSettings")
    last_event: dict[str, Any] | None = Field(default=None, alias="lastEvent")
    alarm_hub: dict[str, Any] | None = Field(default=None, alias="alarmHub")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the link station."""
        return self.name or self.mac or self.id


# Alarm hubs use the same schema as link stations.
AlarmHub = LinkStation
