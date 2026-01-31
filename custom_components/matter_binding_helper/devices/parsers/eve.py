"""Eve Thermo schedule decoder for proprietary schedule format."""

from __future__ import annotations

import base64
import logging
from dataclasses import dataclass, field

_LOGGER = logging.getLogger(__name__)

# Eve cluster and attribute IDs
EVE_VENDOR_ID = 4874
EVE_CLUSTER_ID = 319486977  # 0x130AFC01
EVE_SCHEDULE_ATTR = 319422464  # 0x130A0000 - Main schedule data
EVE_TEMP_ATTR = 319422466  # 0x130A0002 - Temperature settings


@dataclass
class EveTimeSlot:
    """A time slot in an Eve schedule."""

    time: str  # HH:MM format
    minutes: int  # Minutes from midnight
    profile_id: str  # Profile character (e.g., '$', '%', '&')


@dataclass
class EveDayAssignment:
    """Day-of-week assignment to a profile."""

    day: str  # Day name
    profile_id: str  # Profile character


@dataclass
class EveSchedule:
    """Parsed Eve thermostat schedule."""

    name: str | None = None
    device_serial: str | None = None
    zone_id: str | None = None
    time_slots: list[EveTimeSlot] = field(default_factory=list)
    day_assignments: list[EveDayAssignment] = field(default_factory=list)
    raw_data: str | None = None  # Base64 encoded raw data for debugging

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "name": self.name,
            "device_serial": self.device_serial,
            "zone_id": self.zone_id,
            "time_slots": [
                {"time": ts.time, "minutes": ts.minutes, "profile_id": ts.profile_id}
                for ts in self.time_slots
            ],
            "day_assignments": [
                {"day": da.day, "profile_id": da.profile_id}
                for da in self.day_assignments
            ],
        }


def _time_from_byte(byte_val: int) -> tuple[str, int]:
    """Convert Eve time byte to HH:MM string and minutes.

    Eve encodes time as: byte_value * 6 = minutes from midnight
    """
    minutes = byte_val * 6
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}", minutes


def _find_string(data: bytes, start: int, max_len: int = 20) -> str | None:
    """Extract a string from data starting at given position."""
    result = []
    for i in range(start, min(start + max_len, len(data))):
        b = data[i]
        if b == 0:
            break
        if 32 <= b < 127:
            result.append(chr(b))
        else:
            break
    return "".join(result) if len(result) >= 3 else None


def _parse_schedule_blob(data: bytes) -> EveSchedule:
    """Parse Eve schedule binary blob."""
    schedule = EveSchedule()

    # Split by 0xFF delimiter into sections
    sections: list[tuple[int, bytes]] = []
    current: list[int] = []
    start_offset = 0

    for i, b in enumerate(data):
        if b == 0xFF:
            if current:
                sections.append((start_offset, bytes(current)))
            current = []
            start_offset = i + 1
        else:
            current.append(b)

    if current:
        sections.append((start_offset, bytes(current)))

    _LOGGER.debug("Eve schedule: found %d sections", len(sections))

    # Parse each section
    for idx, (offset, section) in enumerate(sections):
        _LOGGER.debug("Section %d @ 0x%04x: %d bytes", idx, offset, len(section))

        # Section 0: Header with device serial
        if idx == 0:
            # Look for device serial (CM12N1Mxxxxx pattern)
            for i in range(len(section) - 10):
                if section[i : i + 2] == b"CM":
                    serial = _find_string(section, i, 15)
                    if serial and serial.startswith("CM"):
                        schedule.device_serial = serial
                        _LOGGER.debug("Found device serial: %s", serial)
                        break

        # Section 2: Zone info and day schedule
        elif idx == 2:
            # Look for zone ID (8-char string after 0x3B 0x08)
            for i in range(len(section) - 10):
                if (
                    i + 1 < len(section)
                    and section[i] == 0x3B
                    and section[i + 1] == 0x08
                ):
                    zone_id = _find_string(section, i + 2, 8)
                    if zone_id:
                        schedule.zone_id = zone_id
                        _LOGGER.debug("Found zone ID: %s", zone_id)
                    break

            # Look for day schedule (Tag 0x4F)
            for i in range(len(section) - 3):
                if section[i] == 0x4F:
                    length = section[i + 1] if i + 1 < len(section) else 0
                    if length >= 4 and i + 2 + length <= len(section):
                        payload = section[i + 2 : i + 2 + length]
                        # Skip first 2 bytes (00 00 header), rest are day assignments
                        day_bytes = payload[2:] if len(payload) > 2 else []
                        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

                        for j, day_byte in enumerate(day_bytes):
                            if j < len(day_names):
                                profile = (
                                    chr(day_byte)
                                    if 32 <= day_byte < 127
                                    else f"0x{day_byte:02x}"
                                )
                                schedule.day_assignments.append(
                                    EveDayAssignment(
                                        day=day_names[j], profile_id=profile
                                    )
                                )
                        _LOGGER.debug(
                            "Found %d day assignments", len(schedule.day_assignments)
                        )
                    break

        # Section 4: Schedule entries (look for Tag 0x47)
        elif idx == 4:
            # Look for Tag 0x47 (time group definition)
            for i in range(len(section) - 10):
                if section[i] == 0x47:
                    length = section[i + 1] if i + 1 < len(section) else 0
                    if length >= 5 and i + 2 + length <= len(section):
                        # Format: 47 [length] 05 [count] [profile time] [profile time] ...
                        if section[i + 2] == 0x05:  # Type indicator
                            payload = section[i + 3 : i + 2 + length]
                            # First byte is count or similar
                            # Then pairs of [profile_id, time_byte]
                            for j in range(1, min(len(payload) - 1, 9), 2):
                                profile_byte = payload[j]
                                time_byte = payload[j + 1]

                                if time_byte == 0:
                                    continue

                                profile = (
                                    chr(profile_byte)
                                    if 32 <= profile_byte < 127
                                    else f"0x{profile_byte:02x}"
                                )
                                time_str, minutes = _time_from_byte(time_byte)
                                schedule.time_slots.append(
                                    EveTimeSlot(
                                        time=time_str,
                                        minutes=minutes,
                                        profile_id=profile,
                                    )
                                )

                            _LOGGER.debug(
                                "Found %d time slots", len(schedule.time_slots)
                            )
                    break

        # Section 5 (or last section): Schedule name
        elif idx == len(sections) - 1 or idx == 5:
            # Look for UTF-8 text at the end
            # Format: ... 06 10 <name in UTF-8>
            for i in range(len(section) - 5):
                if section[i] == 0x06 and section[i + 1] == 0x10:
                    name_bytes = section[i + 2 :]
                    try:
                        name = name_bytes.decode("utf-8").rstrip("\x00")
                        if name and len(name) >= 3:
                            schedule.name = name
                            _LOGGER.debug("Found schedule name: %s", name)
                    except UnicodeDecodeError:
                        pass
                    break

    # Sort time slots by time
    schedule.time_slots.sort(key=lambda ts: ts.minutes)

    return schedule


def parse_eve_schedule(raw_value: str | bytes) -> EveSchedule | None:
    """Parse Eve schedule from raw attribute value.

    Args:
        raw_value: Base64-encoded string or raw bytes

    Returns:
        Parsed EveSchedule or None if parsing fails
    """
    try:
        if isinstance(raw_value, str):
            data = base64.b64decode(raw_value)
        else:
            data = raw_value

        schedule = _parse_schedule_blob(data)
        schedule.raw_data = (
            base64.b64encode(data).decode("ascii")
            if isinstance(raw_value, bytes)
            else raw_value
        )

        return schedule

    except Exception as e:
        _LOGGER.error("Failed to parse Eve schedule: %s", e)
        return None


def is_eve_thermostat(vendor_id: int | None, cluster_ids: list[int]) -> bool:
    """Check if a device is an Eve thermostat with schedule support."""
    return vendor_id == EVE_VENDOR_ID and EVE_CLUSTER_ID in cluster_ids
