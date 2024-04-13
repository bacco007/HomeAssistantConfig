from homeassistant import exceptions


class SensorNotFound(exceptions.HomeAssistantError):
    """Error to indicate a sensor is not found."""


class OperationNotFound(exceptions.HomeAssistantError):
    """Error to indicate the operation specified is not valid."""


class IntervalNotValid(exceptions.HomeAssistantError):
    """Error to indicate the interval specified is not valid."""


class NotUnique(exceptions.HomeAssistantError):
    """Error to indicate that the name is not unique."""
