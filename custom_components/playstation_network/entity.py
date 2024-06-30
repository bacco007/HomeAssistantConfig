"""Base entity for PSN Integration"""

from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, PSN_COORDINATOR
from .coordinator import PsnCoordinator


async def async_setup_entry(hass: HomeAssistant, config_entry):
    """Add sensors for passed config_entry in HA."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][PSN_COORDINATOR]


class PSNEntity(CoordinatorEntity[PsnCoordinator]):
    """Common entity class for all PSN entities"""

    def __init__(self, coordinator) -> None:
        """Initialize PSN Entity."""
        super().__init__(coordinator)
        self.coordinator = coordinator
        self.coordinator.entities.append(self)

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return DeviceInfo(
            identifiers={
                # Serial numbers are unique identifiers within a specific domain
                (DOMAIN, "PSN")
            },
            name="PSN",
            manufacturer="Sony",
            model="Playstation Network",
            configuration_url="https://ca.account.sony.com/api/v1/ssocookie",
        )

    @property
    def should_poll(self) -> bool:
        return False
