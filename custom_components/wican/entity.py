"""Different types of WiCan entities based on DataUpdateCoordinator entities."""

from homeassistant.core import callback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import WiCanCoordinator


class WiCanEntityBase(CoordinatorEntity):
    """WiCan entity based on DataUpdateCoordinator entity.

    Attributes
    ----------
    coordinator: WiCanCoordinator
        WiCan coordinator handling the device integration via the WiCan API.
    data : dict
        Data to be stored in the entity.
    process_state: Any, optional
        Method to convert status values (e.g. type conversion to float).

    """

    data = {}
    coordinator: WiCanCoordinator
    _state = False
    process_state = None
    _attr_has_entity_name = True
    _attr_name = None

    def __init__(self, coordinator, data, process_state=None) -> None:
        """Initialize a WiCanEntity with data, coordinator, process_state and identifiers for HomeAssistant."""
        super().__init__(coordinator)
        self.data = data
        self.coordinator = coordinator
        self.process_state = process_state

        device_id = self.coordinator.data["status"]["device_id"]

        key = self.get_data("key")
        self._attr_unique_id = "wican_" + device_id + "_" + key
        self.id = "wican_" + device_id[-3:] + "_" + key
        self._attr_name = self.get_data("name")
        self.set_state()

    def get_data(self, key):
        """Provide data for a given key.

        Parameters
        ----------
        key : Any
            key to be used to retrieve data from the dictionary.

        """
        if key in self.data:
            return self.data[key]
        return None

    def get_new_state(self):
        """Return data from coordinator. Method defined for implementation in child classes of WiCanEntityBase.

        Returns
        -------
        bool
            Always returns False in WiCanEntityBase class.

        """
        return False

    @callback
    def _handle_coordinator_update(self) -> None:
        self.set_state()
        self.async_write_ha_state()

    def set_state(self):
        """Set state for entity object. If process_state is set, convert state accordingly."""
        new_state = self.get_new_state()
        if new_state is None:
            return

        if self.process_state is not None:
            new_state = self.process_state(new_state)

        self._state = new_state

    @property
    def device_info(self):
        """Provide WiCan device info from coordinator.

        Returns
        -------
        dict
            Dictionary provided by WiCanCoordinator device_info() method.

        """
        return self.coordinator.device_info()

    @property
    def available(self) -> bool:
        """Provide WiCan device availability from coordinator.

        Returns
        -------
        bool
            Device availability provided by WiCanCoordinator availability() method.

        """
        return self.coordinator.available()

    @property
    def entity_category(self):
        """Provide category of this WiCanEntity, if available.

        Returns
        -------
        EntityCategory
            Category of the entity (e.g. DIAGNOSTIC for some WiCan entities like "IP-Address").

        """
        return self.get_data("category")

    @property
    def state(self):
        """Return the state of this WiCanEntity."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement of this WiCanEntity, if any."""
        if self.get_data("unit") == "none":
            return None
        else:
            return self.get_data("unit")

    @property
    def device_class(self):
        """Return the class of this device, from component DEVICE_CLASSES."""
        if self.get_data("class") == "none":
            return None
        else:
            return self.get_data("class")


class WiCanStatusEntity(WiCanEntityBase):
    """WiCan Status Entity based on WiCanEntityBase."""

    def __init__(self, coordinator, data, process_state=None) -> None:
        """Initialize the status entity same as WiCanEntityBase."""
        super().__init__(coordinator, data, process_state)

    def get_new_state(self):
        """Provide entity status from coordindator based on key of this entity (e.g. "fw_version")."""
        return self.coordinator.get_status(self.get_data("key"))

    @property
    def extra_state_attributes(self):
        """Provide state attributes from WiCan device status via coordinator, if defined for entity."""
        attributes = self.get_data("attributes")
        if attributes is None:
            return None

        return_attrs = {}
        for key in attributes:
            return_attrs[key] = self.coordinator.get_status(attributes[key])

        return return_attrs


class WiCanPidEntity(WiCanEntityBase):
    """WiCan Data Entity based on WiCanEntityBase."""

    def __init__(self, coordinator, data, process_state=None) -> None:
        """Initialize the data entity same as WiCanEntityBase."""
        super().__init__(coordinator, data, process_state)

    def get_new_state(self):
        """Provide entity value from coordindator based on key of this entity (e.g. "SOC_BMS")."""
        return self.coordinator.get_pid_value(self.get_data("key"))

    @property
    def extra_state_attributes(self):
        """Provide state attributes from WiCan device PID via coordinator, if defined for entity."""
        attributes = self.get_data("attributes")
        if attributes is None:
            return None

        return_attrs = {}
        for key in attributes:
            return_attrs[key] = self.coordinator.get_pid_value(attributes[key])

        return return_attrs

    @property
    def available(self) -> bool:
        """Provide availability of the entity."""
        if self._state is False:
            return False

        return True
