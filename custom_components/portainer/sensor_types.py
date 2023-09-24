"""Definitions for sensor entities."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.helpers.entity import EntityCategory


DEVICE_ATTRIBUTES_ENDPOINTS = [
    "Type",
    "Status",
    "DockerVersion",
    "Swarm",
    "TotalCPU",
    "TotalMemory",
    "RunningContainerCount",
    "StoppedContainerCount",
    "HealthyContainerCount",
    "UnhealthyContainerCount",
    "VolumeCount",
    "ImageCount",
    "ServiceCount",
    "StackCount",
]

DEVICE_ATTRIBUTES_CONTAINERS = [
    "Image",
    "Network",
    "Compose_Stack",
    "Compose_Service",
    "Compose_Version",
    "Environment",
]


@dataclass
class PortainerSensorEntityDescription(SensorEntityDescription):
    """Class describing portainer entities."""

    ha_group: str | None = None
    ha_connection: str | None = None
    ha_connection_value: str | None = None
    data_path: str | None = None
    data_attribute: str | None = None
    data_name: str | None = None
    data_uid: str | None = None
    data_reference: str | None = None
    data_attributes_list: List = field(default_factory=lambda: [])
    func: str = "PortainerSensor"


SENSOR_TYPES: tuple[PortainerSensorEntityDescription, ...] = (
    PortainerSensorEntityDescription(
        key="endpoints",
        name="",
        icon="mdi:truck-cargo-container",
        entity_category=None,
        ha_group="Endpoints",
        data_path="endpoints",
        data_attribute="RunningContainerCount",
        data_name="Name",
        data_uid="",
        data_reference="Name",
        data_attributes_list=DEVICE_ATTRIBUTES_ENDPOINTS,
        func="EndpointSensor",
    ),
    PortainerSensorEntityDescription(
        key="containers",
        name="",
        icon="mdi:train-car-container",
        entity_category=None,
        ha_group="data__EndpointId",
        data_path="containers",
        data_attribute="State",
        data_name="Name",
        data_uid="",
        data_reference="Id",
        data_attributes_list=DEVICE_ATTRIBUTES_CONTAINERS,
        func="ContainerSensor",
    ),
)

SENSOR_SERVICES = []
