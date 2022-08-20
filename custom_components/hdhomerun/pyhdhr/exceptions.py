"""Exceptions."""


class HDHomeRunError(Exception):
    """Base Error."""

    def __init__(self, device: str, message: str) -> None:
        """Initialise."""
        super().__init__(f"{message} ({device})")

        self.device = device


class HDHomeRunConnectionError(HDHomeRunError):
    """Represents a connection issue."""

    def __init__(self, device: str) -> None:
        """Initialise."""
        super().__init__(message="Error connecting", device=device)


class HDHomeRunDeviceNotFoundError(HDHomeRunError):
    """Base error for a device that is not found."""

    def __init__(self, device: str):
        """Initialise."""
        super().__init__(message="Device not found", device=device)


class HDHomeRunHTTPDiscoveryNotAvailableError(HDHomeRunError):
    """Unable to discover the device using HTTP."""

    def __init__(self, device: str) -> None:
        """Initialise."""
        super().__init__(device=device, message="HTTP Discovery not available")


class HDHomeRunUDPDiscoveryDeviceNotFoundError(HDHomeRunDeviceNotFoundError):
    """Device not found using UDP protocol."""

    def __init__(self, device: str) -> None:
        """Initialise."""
        super().__init__(device=device)


class HDHomeRunTimeoutError(HDHomeRunError):
    """Timeout error."""

    def __init__(self, device: str) -> None:
        """Initialise."""
        super().__init__(message="Timeout encountered", device=device)
