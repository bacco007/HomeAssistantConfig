"""Thermostat schedule operations for Matter devices."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant

from ..const import (
    ATTR_ACCEPTED_COMMAND_LIST,
    CLUSTER_THERMOSTAT,
    CMD_GET_WEEKLY_SCHEDULE,
)
from .client import get_raw_matter_client
from .demo import is_demo_mode
from .models import ScheduleTransition, WeeklySchedule

if TYPE_CHECKING:
    pass

_LOGGER = logging.getLogger(__name__)


def _get_day_bitmap(days: list[str]) -> int:
    """Convert day names to Matter bitmap.

    Args:
        days: List of day names (sunday, monday, ..., saturday, away)

    Returns:
        Bitmap where bit 0=Sun, bit 1=Mon, ..., bit 6=Sat, bit 7=Away
    """
    day_map = {
        "sunday": 0,
        "monday": 1,
        "tuesday": 2,
        "wednesday": 3,
        "thursday": 4,
        "friday": 5,
        "saturday": 6,
        "away": 7,
    }
    bitmap = 0
    for day in days:
        day_lower = day.lower()
        if day_lower in day_map:
            bitmap |= 1 << day_map[day_lower]
    return bitmap


def _get_mode_bitmap(heat: bool = True, cool: bool = False) -> int:
    """Convert heat/cool flags to Matter mode bitmap.

    Args:
        heat: Include heat setpoints
        cool: Include cool setpoints

    Returns:
        Bitmap where bit 0=Heat, bit 1=Cool
    """
    bitmap = 0
    if heat:
        bitmap |= 1
    if cool:
        bitmap |= 2
    return bitmap


def get_cluster_accepted_commands(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    cluster_id: int,
) -> list[int] | None:
    """Get the list of accepted commands for a cluster on an endpoint.

    Reads the AcceptedCommandList global attribute (0xFFF9) from the cluster.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID
        cluster_id: Cluster ID to check

    Returns:
        List of command IDs the cluster accepts, or None if not available
    """
    client = get_raw_matter_client(hass)
    if not client:
        return None

    try:
        nodes = client.get_nodes()
        node = next((n for n in nodes if n.node_id == node_id), None)
        if not node:
            return None

        # Build attribute path: endpoint/cluster/AcceptedCommandList
        attr_key = f"{endpoint_id}/{cluster_id}/{ATTR_ACCEPTED_COMMAND_LIST}"
        attributes = getattr(node, "attributes", None)
        if not attributes:
            return None

        commands = attributes.get(attr_key)
        if commands is not None:
            _LOGGER.debug(
                "get_cluster_accepted_commands: node %s ep %s cluster %s commands: %s",
                node_id,
                endpoint_id,
                hex(cluster_id),
                commands,
            )
            return list(commands) if commands else []

        return None

    except Exception as err:
        _LOGGER.debug(
            "get_cluster_accepted_commands: Error reading commands for node %s: %s",
            node_id,
            err,
        )
        return None


def supports_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> bool | None:
    """Check if a thermostat endpoint supports weekly schedules.

    Checks if GetWeeklySchedule command (0x02) is in the AcceptedCommandList.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster

    Returns:
        True if supported, False if not, None if can't determine
    """
    commands = get_cluster_accepted_commands(
        hass, node_id, endpoint_id, CLUSTER_THERMOSTAT
    )
    if commands is None:
        return None  # Can't determine - attribute not available
    return CMD_GET_WEEKLY_SCHEDULE in commands


def has_thermostat_schedule_feature(endpoint_data: dict[str, Any]) -> bool:
    """Check if an endpoint supports thermostat scheduling.

    The endpoint must have:
    1. Thermostat cluster (0x0201) as a server cluster
    2. Device type 769 (Thermostat) or 770 (Temperature Sensor with thermostat)

    Args:
        endpoint_data: Endpoint info dict from get_nodes()

    Returns:
        True if endpoint supports scheduling
    """
    # Check for thermostat cluster
    server_clusters = endpoint_data.get("server_clusters", [])
    if CLUSTER_THERMOSTAT not in server_clusters:
        return False

    # Check for thermostat device type
    device_types = endpoint_data.get("device_types", [])
    thermostat_device_types = {769}  # Thermostat
    for dt in device_types:
        dt_id = dt.get("id") if isinstance(dt, dict) else dt
        if dt_id in thermostat_device_types:
            return True

    return False


async def get_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    days: list[str] | None = None,
    heat: bool = True,
    cool: bool = False,
) -> WeeklySchedule | None:
    """Get weekly schedule from a thermostat.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster
        days: List of day names to retrieve (default: all days)
        heat: Request heat setpoints
        cool: Request cool setpoints

    Returns:
        WeeklySchedule with transitions or None if failed
    """
    # Demo mode returns sample schedule
    if is_demo_mode(hass):
        _LOGGER.debug("Demo mode: returning sample thermostat schedule")
        return WeeklySchedule(
            day_of_week=0x7F,  # All weekdays
            mode=1,  # Heat only
            transitions=[
                ScheduleTransition(
                    transition_time=6 * 60, heat_setpoint=20.0
                ),  # 6:00 AM
                ScheduleTransition(
                    transition_time=8 * 60, heat_setpoint=18.0
                ),  # 8:00 AM
                ScheduleTransition(
                    transition_time=17 * 60, heat_setpoint=21.0
                ),  # 5:00 PM
                ScheduleTransition(
                    transition_time=22 * 60, heat_setpoint=17.0
                ),  # 10:00 PM
            ],
        )

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.error("get_thermostat_schedule: Matter client not available")
        return None

    try:
        # Import Thermostat cluster commands from CHIP SDK
        from chip.clusters import Objects as clusters

        # Build request parameters
        days_bitmap = _get_day_bitmap(days) if days else 0x7F  # All days
        mode_bitmap = _get_mode_bitmap(heat, cool)

        _LOGGER.info(
            "get_thermostat_schedule: Getting schedule for node %s endpoint %s "
            "(days=%s, mode=%s)",
            node_id,
            endpoint_id,
            bin(days_bitmap),
            bin(mode_bitmap),
        )

        # Create GetWeeklySchedule command
        command = clusters.Thermostat.Commands.GetWeeklySchedule(
            daysToReturn=days_bitmap,
            modeToReturn=mode_bitmap,
        )

        # Send command
        response = await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

        _LOGGER.debug("get_thermostat_schedule: Response: %s", response)

        if response is None:
            _LOGGER.warning("get_thermostat_schedule: No response from device")
            return None

        # Parse GetWeeklyScheduleResponse
        transitions = [ScheduleTransition.from_matter(t) for t in response.transitions]

        return WeeklySchedule(
            day_of_week=response.dayOfWeekForSequence,
            mode=response.modeForSequence,
            transitions=transitions,
        )

    except Exception as err:
        err_str = str(err)
        # Check if the device doesn't support this command
        if "UnsupportedCommand" in err_str or "0x81" in err_str:
            _LOGGER.info(
                "get_thermostat_schedule: Device does not support GetWeeklySchedule "
                "command (node %s endpoint %s)",
                node_id,
                endpoint_id,
            )
            return False  # type: ignore[return-value]
        _LOGGER.error(
            "get_thermostat_schedule: Error getting schedule for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return None


async def set_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    days: list[str],
    transitions: list[dict[str, Any]],
    heat: bool = True,
    cool: bool = False,
) -> bool:
    """Set weekly schedule on a thermostat.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster
        days: List of day names this schedule applies to
        transitions: List of transition dicts with keys:
            - transition_time: Minutes from midnight (0-1439)
            - heat_setpoint: Temperature in C (optional)
            - cool_setpoint: Temperature in C (optional)
        heat: Schedule includes heat setpoints
        cool: Schedule includes cool setpoints

    Returns:
        True if successful
    """
    # Demo mode simulates success
    if is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: simulating set schedule for node %s endpoint %s",
            node_id,
            endpoint_id,
        )
        return True

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.error("set_thermostat_schedule: Matter client not available")
        return False

    try:
        # Import Thermostat cluster commands from CHIP SDK
        from chip.clusters import Objects as clusters

        # Build command parameters
        days_bitmap = _get_day_bitmap(days)
        mode_bitmap = _get_mode_bitmap(heat, cool)

        # Convert transitions to Matter format (0.01C units)
        matter_transitions = []
        for t in transitions:
            # Matter uses signed int16 for temperatures in 0.01C
            heat_sp = t.get("heat_setpoint")
            cool_sp = t.get("cool_setpoint")

            matter_transitions.append(
                clusters.Thermostat.Structs.WeeklyScheduleTransitionStruct(
                    transitionTime=int(t["transition_time"]),
                    heatSetpoint=int(heat_sp * 100) if heat_sp is not None else None,
                    coolSetpoint=int(cool_sp * 100) if cool_sp is not None else None,
                )
            )

        _LOGGER.info(
            "set_thermostat_schedule: Setting schedule for node %s endpoint %s "
            "(days=%s, mode=%s, transitions=%d)",
            node_id,
            endpoint_id,
            bin(days_bitmap),
            bin(mode_bitmap),
            len(matter_transitions),
        )

        # Create SetWeeklySchedule command
        command = clusters.Thermostat.Commands.SetWeeklySchedule(
            numberOfTransitionsForSequence=len(matter_transitions),
            dayOfWeekForSequence=days_bitmap,
            modeForSequence=mode_bitmap,
            transitions=matter_transitions,
        )

        # Send command
        await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

        _LOGGER.info("set_thermostat_schedule: Schedule set successfully")
        return True

    except Exception as err:
        _LOGGER.error(
            "set_thermostat_schedule: Error setting schedule for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return False


async def clear_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> bool:
    """Clear all weekly schedules on a thermostat.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster

    Returns:
        True if successful
    """
    # Demo mode simulates success
    if is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: simulating clear schedule for node %s endpoint %s",
            node_id,
            endpoint_id,
        )
        return True

    client = get_raw_matter_client(hass)
    if not client:
        _LOGGER.error("clear_thermostat_schedule: Matter client not available")
        return False

    try:
        # Import Thermostat cluster commands from CHIP SDK
        from chip.clusters import Objects as clusters

        _LOGGER.info(
            "clear_thermostat_schedule: Clearing schedule for node %s endpoint %s",
            node_id,
            endpoint_id,
        )

        # Create ClearWeeklySchedule command (no parameters)
        command = clusters.Thermostat.Commands.ClearWeeklySchedule()

        # Send command
        await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

        _LOGGER.info("clear_thermostat_schedule: Schedule cleared successfully")
        return True

    except Exception as err:
        _LOGGER.error(
            "clear_thermostat_schedule: Error clearing schedule for node %s "
            "endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return False
