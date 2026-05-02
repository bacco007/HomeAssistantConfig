"""Sensor descriptions for Armadarr."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import (
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import UnitOfInformation

if TYPE_CHECKING:
    from collections.abc import Callable


@dataclass(frozen=True, kw_only=True)
class ArmadarrSensorEntityDescription(SensorEntityDescription):
    """Class describing Armadarr sensor entities."""

    value_fn: Callable[[Any], Any]
    attr_fn: Callable[[Any], dict[str, Any]] | None = None


def get_common_sensors() -> list[ArmadarrSensorEntityDescription]:
    """Get common sensors for most apps."""
    return [
        ArmadarrSensorEntityDescription(
            key="queue_size",
            name="Queue Size",
            icon="mdi:tray-full",
            state_class=SensorStateClass.MEASUREMENT,
            value_fn=lambda data: (
                (
                    data.get("queue", {}).get(
                        "totalRecords",
                        len(data.get("queue", {}).get("records", [])),
                    )
                    if isinstance(data.get("queue"), dict)
                    else len(data.get("queue", []))
                )
                if data
                else 0
            ),
        ),
        ArmadarrSensorEntityDescription(
            key="health_warnings",
            name="Health Warnings",
            icon="mdi:alert-circle",
            state_class=SensorStateClass.MEASUREMENT,
            value_fn=lambda data: (
                len(
                    [
                        h
                        for h in data.get("health", [])
                        if isinstance(h, dict) and h.get("type") == "warning"
                    ]
                )
                if data
                else 0
            ),
        ),
    ]


def get_disk_space_sensors(
    root_folders: list[dict[str, Any]],
) -> list[ArmadarrSensorEntityDescription]:
    """Get disk space sensors dynamically based on root folders."""
    sensors = []
    for folder in root_folders:
        path = str(folder.get("path", ""))
        if not path:
            continue

        def _get_free_space(data: dict[str, Any] | None, p: str = path) -> float | None:
            if not data:
                return None
            return next(
                (
                    round(f.get("freeSpace", 0) / (1024**3), 2)
                    for f in data.get("root_folder", [])
                    if isinstance(f, dict) and f.get("path") == p
                ),
                None,
            )

        sensors.append(
            ArmadarrSensorEntityDescription(
                key=f"disk_space_{path}",
                name=f"Disk Space ({path})",
                icon="mdi:harddisk",
                native_unit_of_measurement=UnitOfInformation.GIBIBYTES,
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=_get_free_space,
            )
        )
    return sensors


def get_media_sensors() -> list[ArmadarrSensorEntityDescription]:
    """Get common media sensors."""
    return [
        ArmadarrSensorEntityDescription(
            key="missing_count",
            name="Missing Items",
            icon="mdi:magnify-minus-outline",
            state_class=SensorStateClass.MEASUREMENT,
            value_fn=lambda data: int(data.get("missing_count", 0)) if data else 0,
        ),
        ArmadarrSensorEntityDescription(
            key="unmonitored_count",
            name="Unmonitored Items",
            icon="mdi:eye-off",
            state_class=SensorStateClass.MEASUREMENT,
            value_fn=lambda data: int(data.get("unmonitored_count", 0)) if data else 0,
        ),
        ArmadarrSensorEntityDescription(
            key="upcoming_media",
            name="Upcoming Media",
            icon="mdi:calendar-star",
            state_class=SensorStateClass.MEASUREMENT,
            value_fn=lambda data: len(data.get("calendar", [])) if data else 0,
        ),
        ArmadarrSensorEntityDescription(
            key="wanted_media",
            name="Wanted Media",
            icon="mdi:magnify-plus-outline",
            state_class=SensorStateClass.MEASUREMENT,
            value_fn=lambda data: len(data.get("wanted", [])) if data else 0,
        ),
    ]


def get_app_specific_sensors(app_type: str) -> list[ArmadarrSensorEntityDescription]:
    """Get sensors specific to an app type."""
    app_sensors: dict[str, list[ArmadarrSensorEntityDescription]] = {
        "Sonarr": [
            ArmadarrSensorEntityDescription(
                key="series_count",
                name="Series Count",
                icon="mdi:television",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: len(data.get("series", [])) if data else 0,
            )
        ],
        "Radarr": [
            ArmadarrSensorEntityDescription(
                key="movie_count",
                name="Movie Count",
                icon="mdi:movie",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: len(data.get("movies", [])) if data else 0,
            )
        ],
        "Lidarr": [
            ArmadarrSensorEntityDescription(
                key="artist_count",
                name="Artist Count",
                icon="mdi:account-music",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: len(data.get("artists", [])) if data else 0,
            )
        ],
        "Readarr": [
            ArmadarrSensorEntityDescription(
                key="author_count",
                name="Author Count",
                icon="mdi:book-open-variant",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: len(data.get("authors", [])) if data else 0,
            )
        ],
        "Prowlarr": [
            ArmadarrSensorEntityDescription(
                key="indexer_count",
                name="Indexer Count",
                icon="mdi:format-list-bulleted",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    len(data.get("indexer_status", []))
                    if data.get("indexer_status")
                    else len(data.get("indexer_stats", {}).get("indexers", []))
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="indexer_errors",
                name="Indexers with Errors",
                icon="mdi:alert-circle",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    len(
                        [
                            i
                            for i in data.get("indexer_status", [])
                            if isinstance(i, dict) and i.get("status") == "error"
                        ]
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="indexer_avg_response_time",
                name="Average Indexer Response Time",
                icon="mdi:timer-outline",
                native_unit_of_measurement="ms",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        round(
                            sum(
                                s.get("averageResponseTime", 0)
                                for s in data.get("indexer_stats", {})
                                .get("indexers", [])
                                if isinstance(s, dict)
                            )
                            / len(data.get("indexer_stats", {}).get("indexers", []))
                            if data.get("indexer_stats", {}).get("indexers")
                            else 0,
                            2,
                        )
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="indexer_total_queries",
                name="Total Indexer Queries",
                icon="mdi:format-list-bulleted",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    sum(
                        s.get("numberOfQueries", 0)
                        for s in data.get("indexer_stats", {}).get("indexers", [])
                        if isinstance(s, dict)
                    )
                    if data
                    else 0
                ),
            ),
        ],
        "Dispatcharr": [
            ArmadarrSensorEntityDescription(
                key="indexer_count",
                name="Indexer Count",
                icon="mdi:format-list-bulleted",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    len(data.get("indexer_status", []))
                    if data.get("indexer_status")
                    else len(data.get("indexer_stats", {}).get("indexers", []))
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="channel_count",
                name="Channel Count",
                icon="mdi:television-guide",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("channels", {}).get(
                            "count", len(data.get("channels", []))
                        )
                        if isinstance(data.get("channels"), dict)
                        else len(data.get("channels", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="stream_count",
                name="Stream Count",
                icon="mdi:play-network",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("streams", {}).get(
                            "count", len(data.get("streams", []))
                        )
                        if isinstance(data.get("streams"), dict)
                        else len(data.get("streams", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="vod_count",
                name="VOD Count",
                icon="mdi:video-library",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("vod", {}).get("count", len(data.get("vod", [])))
                        if isinstance(data.get("vod"), dict)
                        else len(data.get("vod", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="plugin_count",
                name="Plugin Count",
                icon="mdi:plugin",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: len(data.get("plugins", [])) if data else 0,
            ),
            ArmadarrSensorEntityDescription(
                key="backup_count",
                name="Backup Count",
                icon="mdi:backup-restore",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: len(data.get("backups", [])) if data else 0,
            ),
            ArmadarrSensorEntityDescription(
                key="m3u_account_count",
                name="M3U Account Count",
                icon="mdi:account-details",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("m3u_accounts", {}).get(
                            "count", len(data.get("m3u_accounts", []))
                        )
                        if isinstance(data.get("m3u_accounts"), dict)
                        else len(data.get("m3u_accounts", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="epg_source_count",
                name="EPG Source Count",
                icon="mdi:file-xml",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("epg_sources", {}).get(
                            "count", len(data.get("epg_sources", []))
                        )
                        if isinstance(data.get("epg_sources"), dict)
                        else len(data.get("epg_sources", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="active_streams",
                name="Active Streams",
                icon="mdi:play-speed",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        len(data.get("proxy_status", []))
                        if isinstance(data.get("proxy_status"), list)
                        else 0
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="channel_group_count",
                name="Channel Group Count",
                icon="mdi:folder-multiple",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("channel_groups", {}).get(
                            "count", len(data.get("channel_groups", []))
                        )
                        if isinstance(data.get("channel_groups"), dict)
                        else len(data.get("channel_groups", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="channel_profile_count",
                name="Channel Profile Count",
                icon="mdi:account-settings",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("channel_profiles", {}).get(
                            "count", len(data.get("channel_profiles", []))
                        )
                        if isinstance(data.get("channel_profiles"), dict)
                        else len(data.get("channel_profiles", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="connect_integration_count",
                name="Connect Integration Count",
                icon="mdi:link-variant",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("connect_integrations", {}).get(
                            "count", len(data.get("connect_integrations", []))
                        )
                        if isinstance(data.get("connect_integrations"), dict)
                        else len(data.get("connect_integrations", []))
                    )
                    if data
                    else 0
                ),
            ),
            ArmadarrSensorEntityDescription(
                key="hdhr_device_count",
                name="HDHR Device Count",
                icon="mdi:television-box",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data: (
                    (
                        data.get("hdhr_devices", {}).get(
                            "count", len(data.get("hdhr_devices", []))
                        )
                        if isinstance(data.get("hdhr_devices"), dict)
                        else len(data.get("hdhr_devices", []))
                    )
                    if data
                    else 0
                ),
            ),
        ],
    }
    app_sensors["Whisparr"] = app_sensors["Sonarr"]

    return app_sensors.get(app_type, [])


def get_prowlarr_stats_sensors(
    stats: dict[str, Any],
) -> list[ArmadarrSensorEntityDescription]:
    """Get dynamic sensors for Prowlarr indexer stats."""
    sensors = []

    # Indexers
    for indexer in stats.get("indexers", []):
        name = indexer.get("indexerName", "Unknown")
        safe_name = name.lower().replace(" ", "_")

        # Queries Sensor
        sensors.append(
            ArmadarrSensorEntityDescription(
                key=f"indexer_{safe_name}_queries",
                name=f"{name} Queries",
                icon="mdi:format-list-bulleted",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data, n=name: next(
                    (
                        i.get("numberOfQueries", 0)
                        for i in data.get("indexer_stats", {}).get("indexers", [])
                        if i.get("indexerName") == n
                    ),
                    0,
                ),
                attr_fn=lambda data, n=name: next(
                    (
                        i
                        for i in data.get("indexer_stats", {}).get("indexers", [])
                        if i.get("indexerName") == n
                    ),
                    {},
                ),
            )
        )

        # Avg Response Time Sensor
        sensors.append(
            ArmadarrSensorEntityDescription(
                key=f"indexer_{safe_name}_avg_response_time",
                name=f"{name} Avg Response Time",
                icon="mdi:timer-outline",
                native_unit_of_measurement="ms",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data, n=name: next(
                    (
                        i.get("averageResponseTime", 0)
                        for i in data.get("indexer_stats", {}).get("indexers", [])
                        if i.get("indexerName") == n
                    ),
                    0,
                ),
            )
        )

    # User Agents
    for agent in stats.get("userAgents", []):
        name = agent.get("userAgent", "Unknown")
        safe_name = name.lower().replace(" ", "_")

        sensors.append(
            ArmadarrSensorEntityDescription(
                key=f"ua_{safe_name}_queries",
                name=f"UA {name} Queries",
                icon="mdi:account-search",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data, n=name: next(
                    (
                        a.get("numberOfQueries", 0)
                        for a in data.get("indexer_stats", {}).get("userAgents", [])
                        if a.get("userAgent") == n
                    ),
                    0,
                ),
                attr_fn=lambda data, n=name: next(
                    (
                        a
                        for a in data.get("indexer_stats", {}).get("userAgents", [])
                        if a.get("userAgent") == n
                    ),
                    {},
                ),
            )
        )

    # Hosts
    for host in stats.get("hosts", []):
        name = host.get("host", "Unknown")
        safe_name = name.lower().replace(" ", "_")

        sensors.append(
            ArmadarrSensorEntityDescription(
                key=f"host_{safe_name}_queries",
                name=f"Host {name} Queries",
                icon="mdi:server",
                state_class=SensorStateClass.MEASUREMENT,
                value_fn=lambda data, n=name: next(
                    (
                        h.get("numberOfQueries", 0)
                        for h in data.get("indexer_stats", {}).get("hosts", [])
                        if h.get("host") == n
                    ),
                    0,
                ),
                attr_fn=lambda data, n=name: next(
                    (
                        h
                        for h in data.get("indexer_stats", {}).get("hosts", [])
                        if h.get("host") == n
                    ),
                    {},
                ),
            )
        )

    return sensors
