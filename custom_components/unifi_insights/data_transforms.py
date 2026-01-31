"""
Data transformation functions for unifi-official-api library responses.

This module provides transformation functions to convert library response
formats to the internal data structures expected by entities, maintaining
backward compatibility.
"""


def map_device_status(lib_status: str | None) -> str:
    """
    Map library device status to internal format.

    Args:
        lib_status: Status from library ("online", "offline", "unknown")

    Returns:
        Internal status format ("connected", "disconnected", "unknown")

    """
    if not lib_status:
        return "unknown"

    status_map = {
        "online": "connected",
        "offline": "disconnected",
        "unknown": "unknown",
    }
    return status_map.get(lib_status.lower(), lib_status)


def transform_network_device(lib_device: dict) -> dict:
    """
    Transform library network device response to internal format.

    Args:
        lib_device: Device data from unifi-official-api library

    Returns:
        Transformed device data in internal format

    """
    return {
        "id": lib_device.get("id"),
        "mac": lib_device.get("mac"),
        "model": lib_device.get("model"),
        "name": lib_device.get("name"),
        "state": map_device_status(lib_device.get("status")),
        "adopted": lib_device.get("adopted"),
        "version": lib_device.get("firmware_version"),
        "uptime": lib_device.get("uptime_seconds"),
        "cpu_usage": lib_device.get("cpu_percent"),
        "memory_usage": lib_device.get("memory_percent"),
        "tx_bytes": lib_device.get("tx_bytes"),
        "rx_bytes": lib_device.get("rx_bytes"),
        "site_id": lib_device.get("site"),
    }


def transform_protect_camera(lib_camera: dict) -> dict:
    """
    Transform library Protect camera response to internal format.

    Args:
        lib_camera: Camera data from unifi-official-api library

    Returns:
        Transformed camera data in internal format

    """
    return {
        "id": lib_camera.get("id"),
        "name": lib_camera.get("name"),
        "state": lib_camera.get("status", "").upper()
        if lib_camera.get("status")
        else "UNKNOWN",
        "is_recording": lib_camera.get("recording"),
        "motion_detected": lib_camera.get("motion"),
        "type": lib_camera.get("model"),
        "hdr_mode": lib_camera.get("hdr", "").upper()
        if lib_camera.get("hdr")
        else "AUTO",
        "video_mode": lib_camera.get("video_mode", "").upper()
        if lib_camera.get("video_mode")
        else "DEFAULT",
        "is_dark": lib_camera.get("is_dark", False),
        # snapshot_url and rtsps_url generated on-demand via client methods
    }


def transform_protect_light(lib_light: dict) -> dict:
    """
    Transform library Protect light response to internal format.

    Args:
        lib_light: Light data from unifi-official-api library

    Returns:
        Transformed light data in internal format

    """
    return {
        "id": lib_light.get("id"),
        "name": lib_light.get("name"),
        "is_on": lib_light.get("on"),
        "brightness": lib_light.get("brightness"),
        "mode": lib_light.get("light_mode", "").upper()
        if lib_light.get("light_mode")
        else "AUTO",
        "is_dark": lib_light.get("dark", False),
    }


def transform_protect_sensor(lib_sensor: dict) -> dict:
    """
    Transform library Protect sensor response to internal format.

    Args:
        lib_sensor: Sensor data from unifi-official-api library

    Returns:
        Transformed sensor data in internal format

    """
    return {
        "id": lib_sensor.get("id"),
        "name": lib_sensor.get("name"),
        "temperature": lib_sensor.get("temperature"),
        "humidity": lib_sensor.get("humidity"),
        "light_level": lib_sensor.get("light"),
        "battery_percentage": lib_sensor.get("battery"),
    }


def transform_protect_chime(lib_chime: dict) -> dict:
    """
    Transform library Protect chime response to internal format.

    Args:
        lib_chime: Chime data from unifi-official-api library

    Returns:
        Transformed chime data in internal format

    """
    return {
        "id": lib_chime.get("id"),
        "name": lib_chime.get("name"),
        "volume": lib_chime.get("volume"),
        "repeat_times": lib_chime.get("repeat"),
        "ringtone_id": lib_chime.get("ringtone"),
    }
