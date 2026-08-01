"""Notification system for ADSB Aircraft Tracker."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo

from .const import (
    DOMAIN,
    CONF_NOTIFICATION_DEVICE,
    CONF_EXTERNAL_URL,
    CONF_MILITARY_NOTIFICATIONS,
    CONF_CLOSE_AIRCRAFT_ENABLED,
    CONF_CLOSE_AIRCRAFT_DISTANCE,
    CONF_CLOSE_AIRCRAFT_ALTITUDE,
    CONF_EMERGENCY_NOTIFICATIONS,
    DEFAULT_MILITARY_NOTIFICATIONS,
    DEFAULT_CLOSE_AIRCRAFT_ENABLED,
    DEFAULT_CLOSE_AIRCRAFT_DISTANCE,
    DEFAULT_CLOSE_AIRCRAFT_ALTITUDE,
    DEFAULT_EMERGENCY_NOTIFICATIONS,
)
from .coordinator import ADSBDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


class ADSBNotificationManager:
    """Manages notifications for ADSB aircraft events."""
    
    def __init__(
        self,
        hass: HomeAssistant,
        coordinator: ADSBDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize notification manager."""
        self.hass = hass
        self.coordinator = coordinator
        self.config_entry = config_entry
        self._last_military_aircraft = set()
        self._last_close_aircraft = None
        
    @property
    def notification_device(self) -> str | None:
        """Get configured notification device."""
        return (
            self.config_entry.options.get(CONF_NOTIFICATION_DEVICE) or
            self.config_entry.data.get(CONF_NOTIFICATION_DEVICE)
        )
    
    @property 
    def external_url(self) -> str:
        """Get external ADSB URL for notifications."""
        return (
            self.config_entry.options.get(CONF_EXTERNAL_URL) or
            self.config_entry.data.get(CONF_EXTERNAL_URL) or
            f"http://{self.coordinator.adsb_host}:{self.coordinator.adsb_port}"
        )
    
    @property
    def military_notifications_enabled(self) -> bool:
        """Check if military aircraft notifications are enabled."""
        return (
            self.config_entry.options.get(CONF_MILITARY_NOTIFICATIONS,
            self.config_entry.data.get(CONF_MILITARY_NOTIFICATIONS, DEFAULT_MILITARY_NOTIFICATIONS))
        )
    
    @property
    def close_aircraft_enabled(self) -> bool:
        """Check if close aircraft notifications are enabled."""
        return (
            self.config_entry.options.get(CONF_CLOSE_AIRCRAFT_ENABLED,
            self.config_entry.data.get(CONF_CLOSE_AIRCRAFT_ENABLED, DEFAULT_CLOSE_AIRCRAFT_ENABLED))
        )
    
    @property
    def close_aircraft_distance(self) -> float:
        """Get close aircraft distance threshold in miles."""
        return (
            self.config_entry.options.get(CONF_CLOSE_AIRCRAFT_DISTANCE) or
            self.config_entry.data.get(CONF_CLOSE_AIRCRAFT_DISTANCE) or
            DEFAULT_CLOSE_AIRCRAFT_DISTANCE
        )
    
    @property
    def close_aircraft_altitude(self) -> int:
        """Get close aircraft altitude threshold in feet."""
        return (
            self.config_entry.options.get(CONF_CLOSE_AIRCRAFT_ALTITUDE) or
            self.config_entry.data.get(CONF_CLOSE_AIRCRAFT_ALTITUDE) or
            DEFAULT_CLOSE_AIRCRAFT_ALTITUDE
        )
    
    @property
    def emergency_notifications_enabled(self) -> bool:
        """Check if emergency squawk notifications are enabled."""
        return (
            self.config_entry.options.get(CONF_EMERGENCY_NOTIFICATIONS,
            self.config_entry.data.get(CONF_EMERGENCY_NOTIFICATIONS, DEFAULT_EMERGENCY_NOTIFICATIONS))
        )
    
    async def check_and_notify(self) -> None:
        """Check for notification conditions and send alerts."""
        if not self.notification_device or not self.coordinator.data:
            return
            
        aircraft_list = self.coordinator.data.get("aircraft", [])
        
        # Check for military aircraft notifications
        if self.military_notifications_enabled:
            await self._check_military_aircraft(aircraft_list)
        
        # Check for close aircraft notifications  
        if self.close_aircraft_enabled:
            await self._check_close_aircraft(aircraft_list)
        
        # Check for emergency squawk notifications
        if self.emergency_notifications_enabled:
            await self._check_emergency_squawks(aircraft_list)
    
    async def _check_military_aircraft(self, aircraft_list: list[dict[str, Any]]) -> None:
        """Check and notify about military aircraft."""
        from .binary_sensor import ADSBMilitaryAircraftSensor
        
        temp_sensor = ADSBMilitaryAircraftSensor(self.coordinator, self.config_entry)
        military_aircraft = temp_sensor._detect_military_aircraft(aircraft_list)
        
        current_military = {aircraft.get("hex") for aircraft in military_aircraft if aircraft.get("hex")}
        new_military = current_military - self._last_military_aircraft
        
        if new_military:
            for aircraft in military_aircraft:
                if aircraft.get("hex") in new_military:
                    await self._send_military_notification(aircraft)
        
        self._last_military_aircraft = current_military
    
    async def _check_close_aircraft(self, aircraft_list: list[dict[str, Any]]) -> None:
        """Check and notify about very close/low aircraft."""
        if not aircraft_list:
            return
        
        distance_threshold = self.close_aircraft_distance
        altitude_threshold = self.close_aircraft_altitude
            
        # Find aircraft within configured distance and altitude thresholds
        # Note: Use "or 999" to handle None values (get() default only works if key is missing)
        close_aircraft = [
            plane for plane in aircraft_list
            if ((plane.get("distance_mi") or 999) <= distance_threshold and
                (plane.get("altitude_ft") or 50000) < altitude_threshold and
                (plane.get("distance_mi") or 999) > 0)
        ]
        
        if not close_aircraft:
            self._last_close_aircraft = None
            return
            
        closest = min(close_aircraft, key=lambda x: x.get("distance_mi") or 999)
        closest_hex = closest.get("hex")
        
        # Only notify if it's a different aircraft
        if self._last_close_aircraft != closest_hex:
            await self._send_close_aircraft_notification(closest)
            self._last_close_aircraft = closest_hex
    
    async def _check_emergency_squawks(self, aircraft_list: list[dict[str, Any]]) -> None:
        """Check and notify about emergency squawk codes."""
        emergency_squawks = ["7700", "7600", "7500"]
        
        for aircraft in aircraft_list:
            squawk = aircraft.get("squawk", "")
            if squawk in emergency_squawks:
                await self._send_emergency_notification(aircraft)
    
    async def _send_military_notification(self, aircraft: dict[str, Any]) -> None:
        """Send military aircraft notification."""
        tail = aircraft.get("tail", "Unknown")
        flight = aircraft.get("flight", "").strip()
        distance = aircraft.get("distance_mi", 0)
        altitude = aircraft.get("altitude_ft", 0)
        description = aircraft.get("description", "Unknown aircraft")
        reasons = aircraft.get("_detection_reasons", [])
        speed = aircraft.get("speed_kts", 0)
        
        # Format vertical rate trend
        vrate = aircraft.get("vertical_rate_fpm", 0)
        trend = "↗️" if vrate > 500 else "↘️" if vrate < -500 else "→"
        
        identifier = flight if flight else tail
        
        message = (
            f"🪖 {identifier} at {altitude:,.0f}ft {trend} {self.coordinator.format_distance(distance)} away\n"
            f"Type: {description}\n"
            f"Speed: {speed:.0f}kts"
        )
        
        if flight:
            message += f"\nCallsign: {flight}"
            
        if reasons:
            message += f"\nDetected by: {', '.join(reasons)}"
        
        _LOGGER.debug("Sending military notification with external_url: %s", self.external_url)
        await self._send_notification(
            title="🪖 MILITARY AIRCRAFT DETECTED",
            message=message,
            notification_icon="mdi:airplane-shield",
            color="green",
        )
    
    async def _send_close_aircraft_notification(self, aircraft: dict[str, Any]) -> None:
        """Send close aircraft notification."""
        tail = aircraft.get("tail", "Unknown")
        flight = aircraft.get("flight", "").strip()
        distance = aircraft.get("distance_mi", 0)
        altitude = aircraft.get("altitude_ft", 0)
        speed = aircraft.get("speed_kts", 0)
        description = aircraft.get("description", "Unknown aircraft")
        
        vrate = aircraft.get("vertical_rate_fpm", 0)
        trend = "↗️" if vrate > 500 else "↘️" if vrate < -500 else "→"
        
        # Determine aircraft type emoji
        is_small = any(term in description.upper() for term in ["CESSNA", "PIPER", "BEECH", "CIRRUS"])
        is_heli = "HELICOPTER" in description.upper() or aircraft.get("aircraft_type", "").startswith("H")
        
        if is_heli:
            emoji = "🚁"
        elif vrate > 500:
            emoji = "🛫"
        elif vrate < -500:
            emoji = "🛬"
        elif is_small:
            emoji = "🛩️"
        else:
            emoji = "✈️"
        
        identifier = flight if flight else tail
        
        message = (
            f"{emoji} {identifier} at {altitude:,.0f}ft {trend} {self.coordinator.format_distance(distance)} away\n"
            f"{description} • {speed:.0f}kts"
        )
        
        if flight:
            message += f"\nFlight: {flight}"
        
        operator = aircraft.get("operator")
        if operator and operator != "Unknown":
            message += f"\nOperator: {operator}"
        
        await self._send_notification(
            title="✈️ LOW AIRCRAFT OVERHEAD",
            message=message,
            notification_icon="mdi:airplane-alert",
            color="red",
        )
    
    async def _send_emergency_notification(self, aircraft: dict[str, Any]) -> None:
        """Send emergency squawk notification."""
        tail = aircraft.get("tail", "Unknown")
        flight = aircraft.get("flight", "").strip()
        squawk = aircraft.get("squawk", "")
        distance = aircraft.get("distance_mi", 0)
        
        emergency_types = {
            "7700": "GENERAL EMERGENCY",
            "7600": "RADIO FAILURE", 
            "7500": "HIJACK"
        }
        
        emergency_type = emergency_types.get(squawk, "EMERGENCY")
        identifier = flight if flight else tail
        
        message = f"{identifier} squawking {squawk} ({emergency_type}) at {self.coordinator.format_distance(distance)}"
        
        await self._send_notification(
            title="⚠️ EMERGENCY SQUAWK",
            message=message,
            notification_icon="mdi:alert",
            color="red",
            priority="high",
        )
    
    async def _send_notification(
        self,
        title: str,
        message: str,
        notification_icon: str = "mdi:airplane",
        color: str = "blue",
        priority: str = "normal",
    ) -> None:
        """Send notification to configured device."""
        if not self.notification_device:
            return
            
        data = {
            "title": title,
            "message": message,
            "data": {
                "notification_icon": notification_icon,
                "color": color,
                "clickAction": self.external_url,
                "actions": [
                    {
                        "action": "URI",
                        "title": "🗺️ View on ADSB Tracker",
                        "uri": self.external_url,
                    }
                ],
            }
        }

        _LOGGER.debug("Notification data with external_url %s: %s", self.external_url, data)
        
        if priority == "high":
            data["data"]["ttl"] = 0
            data["data"]["priority"] = "high"
        
        try:
            await self.hass.services.async_call(
                "notify",
                self.notification_device,
                data,
            )
            _LOGGER.debug("Sent notification: %s", title)
        except Exception as err:
            _LOGGER.error("Failed to send notification: %s", err)