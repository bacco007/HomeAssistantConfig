"""Component api."""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import docker
from docker import errors
from docker.models.containers import Container
from docker.models.images import Image
from docker.models.volumes import Volume

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_DOCKER_ENGINE_URL,
    CONF_DOCKER_ENV_SENSOR_NAME,
    CONF_SENSORS,
    DOMAIN,
    DOMAIN_NAME,
    LOGGER,
    SENSOR_CONTAINERS_CPU_PERCENT,
    SENSOR_CONTAINERS_MEMORY_USAGE,
    SENSOR_CONTAINERS_RUNNING,
    SENSOR_CONTAINERS_STOPPED,
    SENSOR_IMAGES,
    SENSOR_IMAGES_DANGLING,
    SENSOR_IMAGES_UNUSED,
    SENSOR_VOLUMES,
    SENSOR_VOLUMES_UNUSED,
    TRANSLATION_KEY_CONNECTION_ERROR,
)
from .hass_util import async_hass_add_executor_job


# ------------------------------------------------------------------
# ------------------------------------------------------------------
@dataclass
class DockerData:
    """Docker data."""

    def __init__(self, sensor_name: str, engine_url: str) -> None:
        """Docker data."""
        self.sensor_name: str = sensor_name
        self.engine_url: str = engine_url
        self.connection_error: bool = False

        self.client: docker.DockerClient
        self.values: dict[str, int | float] = {}
        self.values_uom: dict[str, str] = {}
        self.containers_running: list[str | None] = []
        self.containers_stopped: list[str | None] = []
        self.images_unused: list[str | None] = []
        self.volumes_unused: list[str | None] = []


# ------------------------------------------------------------------
# ------------------------------------------------------------------
@dataclass
class ComponentApi:
    """Docker status interface."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Component api."""
        self.hass = hass
        self.entry: ConfigEntry = entry
        self.coordinator: DataUpdateCoordinator
        self.client: docker.DockerClient
        self.first_time: bool = True
        self.env_sensors: dict[str, DockerData] = {}

        """Setup the actions for the docker integration."""
        hass.services.async_register(
            DOMAIN,
            "update",
            self.async_update_service,
        )

        hass.services.async_register(
            DOMAIN,
            "prune_images",
            self.async_prune_images_service,
        )

    # ------------------------------------------------------------------
    async def async_init(self) -> None:
        """Init."""
        config = dict(self.entry.options)

        for sensor in config[CONF_SENSORS]:
            tmp_data = DockerData(
                sensor.get(CONF_DOCKER_ENV_SENSOR_NAME),
                sensor.get(CONF_DOCKER_ENGINE_URL),
            )

            tmp_data.values[SENSOR_CONTAINERS_CPU_PERCENT] = 0.0
            tmp_data.values_uom[SENSOR_CONTAINERS_CPU_PERCENT] = "%"

            tmp_data.values[SENSOR_CONTAINERS_MEMORY_USAGE] = 0.0
            tmp_data.values_uom[SENSOR_CONTAINERS_MEMORY_USAGE] = "B"

            try:
                tmp_data.client = await self.docker_client(tmp_data.engine_url)

            except errors.DockerException:
                LOGGER.error("Error creating docker client url %s", tmp_data.engine_url)
                tmp_data.connection_error = True
                self.create_issue(
                    TRANSLATION_KEY_CONNECTION_ERROR,
                    {"url": tmp_data.engine_url},
                )

            self.env_sensors[tmp_data.sensor_name] = tmp_data

    # -------------------------------------------------------------------
    async def async_update_service(self, call: ServiceCall) -> None:
        """Update via service."""

        # await self.async_update_sensors_data()
        await self.coordinator.async_request_refresh()

    # -------------------------------------------------------------------
    async def async_prune_images_service(self, call: ServiceCall) -> None:
        """Prune via service."""
        await self.prune_images()
        await self.coordinator.async_request_refresh()

    # -------------------------------------------------------------------
    async def async_update(self) -> None:
        """Update."""

        if self.first_time:
            await self.async_init()
            self.first_time = False
            await self.async_update_sensors_data(False)
        else:
            self.coordinator.update_interval = timedelta(
                minutes=self.entry.options.get(CONF_SCAN_INTERVAL, 5)
            )
            await self.async_update_sensors_data()

    # ------------------------------------------------------------------
    @async_hass_add_executor_job()
    def list_containers(self, env_sensor: DockerData) -> Any:
        """List containers."""

        return env_sensor.client.containers.list(True)

    # ------------------------------------------------------------------
    async def async_update_sensors_data(
        self,
        get_job_info: bool = True,
    ) -> None:
        """Update data."""

        for env_sensor in self.env_sensors.values():
            if env_sensor.connection_error:
                continue

            containers: list[Container] = await self.list_containers(env_sensor)

            await self.async_update_container_data(env_sensor, containers, get_job_info)

            await self.async_update_image_data(env_sensor, containers)

            await self.async_update_volume_data(env_sensor, containers)

    # ------------------------------------------------------------------
    @async_hass_add_executor_job()
    def prune_images(self) -> None:
        """Prune images."""

        for env_sensor in self.env_sensors.values():
            env_sensor.client.images.prune({"dangling": False})

    # ------------------------------------------------------------------
    @async_hass_add_executor_job()
    def container_stats(self, container: Container) -> Any:
        """Get stats for container."""

        return container.stats(decode=False, stream=False)

    # ------------------------------------------------------------------
    async def async_update_container_data(
        self,
        env_sensor: DockerData,
        containers: list[Container],
        get_job_info: bool = True,
    ) -> None:
        """Update container data."""

        def convert_bytes_to(byte_count: int) -> tuple[float, str]:
            """Konverterer bytes til MB eller GB baseret på størrelsen."""
            units: list[str] = ["B", "KB", "MB", "GB"]
            size: float = float(byte_count)

            for unit in units:
                if size < 1024:
                    return (size, unit)
                size /= 1024
            return (size, units[0])  # Bytes

        env_sensor.values[SENSOR_CONTAINERS_RUNNING] = 0
        env_sensor.values[SENSOR_CONTAINERS_STOPPED] = 0
        env_sensor.containers_running.clear()
        env_sensor.containers_stopped.clear()

        cpu_percent = 0.0
        memory_usage_bytes: int = 0

        for container in containers:
            if container.status != "running":
                env_sensor.values[SENSOR_CONTAINERS_STOPPED] += 1
                env_sensor.containers_stopped.append(container.name)
                continue

            env_sensor.values[SENSOR_CONTAINERS_RUNNING] += 1
            env_sensor.containers_running.append(container.name)

            if get_job_info:
                stats = await self.container_stats(container)

                cpu_delta = float(
                    stats["cpu_stats"]["cpu_usage"]["total_usage"]
                ) - float(stats["precpu_stats"]["cpu_usage"]["total_usage"])
                system_cpu_delta = float(
                    stats["cpu_stats"]["system_cpu_usage"]
                ) - float(stats["precpu_stats"]["system_cpu_usage"])

                if system_cpu_delta > 0.0 and cpu_delta > 0.0:
                    cpu_percent += (
                        (cpu_delta / system_cpu_delta)
                        #      * float(len(stats["cpu_stats"]["cpu_usage"]["percpu_usage"]))
                        * 100.0
                    )

                memory_usage_bytes += stats["memory_stats"]["usage"]

        if get_job_info:
            env_sensor.values[SENSOR_CONTAINERS_CPU_PERCENT] = round(cpu_percent, 2)
            env_sensor.values_uom[SENSOR_CONTAINERS_CPU_PERCENT] = "%"

            memory_usage, uom = convert_bytes_to(memory_usage_bytes)

            env_sensor.values[SENSOR_CONTAINERS_MEMORY_USAGE] = round(memory_usage, 2)
            env_sensor.values_uom[SENSOR_CONTAINERS_MEMORY_USAGE] = uom

    # ------------------------------------------------------------------
    @async_hass_add_executor_job()
    def client_image_list(
        self, env_sensor: DockerData, name=None, all=False, filters=None
    ) -> Any:
        """Client image list."""

        return env_sensor.client.images.list(name, all, filters)

    # ------------------------------------------------------------------
    async def async_update_image_data(
        self, env_sensor: DockerData, containers: list[Container]
    ) -> None:
        """Update image data."""
        env_sensor.images_unused.clear()
        images: list[Image] = await self.client_image_list(env_sensor)

        env_sensor.values[SENSOR_IMAGES] = len(images)
        env_sensor.values[SENSOR_IMAGES_DANGLING] = len(
            await self.client_image_list(env_sensor, None, False, {"dangling": True})
        )

        tmp_count: int = 0

        for image in images:
            used: bool = False

            for container in containers:
                if image.id == container.attrs.get("Image", ""):
                    used = True
                    tmp_count += 1
                    break

            if not used and len(image.tags) > 0:
                env_sensor.images_unused.append(image.tags[0])

        env_sensor.values[SENSOR_IMAGES_UNUSED] = (
            env_sensor.values[SENSOR_IMAGES] - tmp_count
        )

    # ------------------------------------------------------------------
    @async_hass_add_executor_job()
    def client_volumes_list(self, env_sensor: DockerData) -> Any:
        """Client image list."""

        return env_sensor.client.volumes.list()

    # ------------------------------------------------------------------
    async def async_update_volume_data(
        self, env_sensor: DockerData, containers: list[Container]
    ) -> None:
        """Update image data."""

        env_sensor.volumes_unused.clear()

        volumes: list[Volume] = await self.client_volumes_list(env_sensor)

        env_sensor.values[SENSOR_VOLUMES] = len(volumes)

        tmp_count: int = 0

        for volume in volumes:
            volume_is_used = False

            for container in containers:
                for mount in container.attrs["Mounts"]:
                    if (
                        mount.get("Type", "") == "volume"
                        and mount.get("Name", "") == volume.name
                    ):
                        tmp_count += 1
                        volume_is_used = True
                        break

                if volume_is_used:
                    break
            if not volume_is_used:
                env_sensor.volumes_unused.append(volume.name)

        env_sensor.values[SENSOR_VOLUMES_UNUSED] = (
            env_sensor.values[SENSOR_VOLUMES] - tmp_count
        )

    # ------------------------------------------------------------------
    @async_hass_add_executor_job()
    def docker_client(self, base_url: str) -> Any:
        """Get docker client."""

        return docker.DockerClient(base_url)

    # ------------------------------------------------------------------
    def get_value(self, env_sensor_name: str, sensor_type: str) -> int | float:
        """Get value."""
        return self.env_sensors[env_sensor_name].values.get(sensor_type, 0)

    # ------------------------------------------------------------------
    def get_value_uom(self, env_sensor_name: str, sensor_type: str) -> str | None:
        """Get value unit of measurement."""
        return self.env_sensors[env_sensor_name].values_uom.get(sensor_type, None)

    # ------------------------------------------------------------------
    def get_value_sum(self, sensor_type: str) -> int | float:
        """Get value sum."""

        tmp_sum: int | float = 0

        for sensor in self.env_sensors.values():
            tmp_sum += sensor.values.get(sensor_type, 0)

        return tmp_sum

    # ------------------------------------------------------------------
    def get_value_sum_uom(self, sensor_type: str) -> str | None:
        """Get value sum."""

        for sensor in self.env_sensors.values():
            if sensor.values.get(sensor_type, None) is not None:
                return sensor.values_uom.get(sensor_type, None)

        return None

    # ------------------------------------------------------------------
    def get_extra_state_attributes(
        self, env_sensor_name: str, sensor_type: str
    ) -> dict:
        """Get attributes."""

        if sensor_type == SENSOR_CONTAINERS_RUNNING:
            return {"Running": self.env_sensors[env_sensor_name].containers_running}
        elif sensor_type == SENSOR_CONTAINERS_STOPPED:  # noqa: RET505
            return {"Stopped": self.env_sensors[env_sensor_name].containers_stopped}
        elif sensor_type == SENSOR_IMAGES_UNUSED:
            return {"Unused": self.env_sensors[env_sensor_name].images_unused}
        elif sensor_type == SENSOR_VOLUMES_UNUSED:
            return {"Unused": self.env_sensors[env_sensor_name].volumes_unused}

        return {}

    # ------------------------------------------------------------------
    def create_issue(
        self,
        translation_key: str,
        translation_placeholders: dict,
    ) -> None:
        """Create issue on."""

        ir.async_create_issue(
            self.hass,
            DOMAIN,
            DOMAIN_NAME + datetime.now().isoformat(),
            issue_domain=DOMAIN,
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
        )
