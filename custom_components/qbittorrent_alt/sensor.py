"""Support for monitoring the qBittorrent API."""

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    STATE_IDLE,
    EntityCategory,
    UnitOfDataRate,
    UnitOfInformation,
    UnitOfTime,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import QBittorrentDataCoordinator
from .helpers import get_qbittorrent_state


@dataclass
class QBittorrentMixin:
    value_fn: Callable[[QBittorrentDataCoordinator], StateType]


@dataclass
class QBittorrentSensorEntityDescription(SensorEntityDescription, QBittorrentMixin):
    pass


SENSOR_TYPES: tuple[QBittorrentSensorEntityDescription, ...] = (
    QBittorrentSensorEntityDescription(
        key="current_status",
        name="Status",
        device_class=SensorDeviceClass.ENUM,
        value_fn=get_qbittorrent_state,
        options=["up_down", "seeding", "downloading", STATE_IDLE],
    ),
    QBittorrentSensorEntityDescription(
        key="download_speed",
        name="Download Speed",
        icon="mdi:cloud-download",
        device_class=SensorDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        suggested_unit_of_measurement=UnitOfDataRate.KILOBYTES_PER_SECOND,
        suggested_display_precision=2,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: round(
            coordinator.data["sync"].server_state["dl_info_speed"], 2
        ),
    ),
    QBittorrentSensorEntityDescription(
        key="upload_speed",
        name="Upload Speed",
        icon="mdi:cloud-upload",
        device_class=SensorDeviceClass.DATA_RATE,
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        suggested_unit_of_measurement=UnitOfDataRate.KILOBYTES_PER_SECOND,
        suggested_display_precision=2,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: round(
            coordinator.data["sync"].server_state["up_info_speed"], 2
        ),
    ),
    QBittorrentSensorEntityDescription(
        key="downloaded",
        name="Downloaded this Session",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_SIZE,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.GIGABYTES,
        suggested_display_precision=2,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "dl_info_data"
        ],
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
    QBittorrentSensorEntityDescription(
        key="uploaded",
        name="Uploaded this Session",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_SIZE,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.GIGABYTES,
        suggested_display_precision=2,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "up_info_data"
        ],
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
    QBittorrentSensorEntityDescription(
        key="downloaded_alltime",
        name="Downloaded total",
        icon="mdi:download",
        device_class=SensorDeviceClass.DATA_SIZE,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.TERABYTES,
        suggested_display_precision=2,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "alltime_dl"
        ],
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
    QBittorrentSensorEntityDescription(
        key="uploaded_alltime",
        name="Uploaded total",
        icon="mdi:upload",
        device_class=SensorDeviceClass.DATA_SIZE,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.TERABYTES,
        suggested_display_precision=2,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "alltime_ul"
        ],
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
    QBittorrentSensorEntityDescription(
        key="ration",
        name="Global Ratio",
        icon="mdi:percent",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "global_ratio"
        ],
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
    QBittorrentSensorEntityDescription(
        key="connection_state",
        name="Connection State",
        icon="mdi:wan",
        device_class=SensorDeviceClass.ENUM,
        value_fn=lambda coordinator: coordinator.data["sync"].server_state[
            "connection_status"
        ],
        options=["connected", "firewalled", "disconnected"],
    ),
    QBittorrentSensorEntityDescription(
        key="downloading",
        name="Downloading",
        icon="mdi:download",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["downloading"],
    ),
    QBittorrentSensorEntityDescription(
        key="seeding",
        name="Seeding",
        icon="mdi:upload",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["seeding"],
    ),
    QBittorrentSensorEntityDescription(
        key="uploading",
        name="Uploading",
        icon="mdi:upload",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["uploading"],
    ),
    QBittorrentSensorEntityDescription(
        key="paused",
        name="Paused",
        icon="mdi:pause",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["paused"],
    ),
    QBittorrentSensorEntityDescription(
        key="stalled",
        name="Stalled",
        icon="mdi:download-off",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["stalled"],
    ),
    QBittorrentSensorEntityDescription(
        key="total",
        name="Number of Torrents",
        icon="mdi:file-multiple",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["total"],
    ),
    QBittorrentSensorEntityDescription(
        key="eta",
        name="ETA",
        icon="mdi:cloud-clock",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        suggested_unit_of_measurement=UnitOfTime.MINUTES,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda coordinator: coordinator.data["longest_eta"],
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entites: AddEntitiesCallback,
) -> None:
    coordinator: QBittorrentDataCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = [
        QBittorrentSensor(description, coordinator, config_entry)
        for description in SENSOR_TYPES
    ]
    async_add_entites(entities)


class QBittorrentSensor(CoordinatorEntity[QBittorrentDataCoordinator], SensorEntity):
    entity_description: QBittorrentSensorEntityDescription

    def __init__(
        self,
        description: QBittorrentSensorEntityDescription,
        coordinator: QBittorrentDataCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{config_entry.entry_id}-{description.key}"
        self._attr_name = f"{config_entry.title} {description.name}"
        self._attr_available = False
        self._attr_device_info = self.coordinator.device_info

    @property
    def native_value(self) -> StateType:
        return self.entity_description.value_fn(self.coordinator)
