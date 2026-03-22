"""Application and files endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING

from ..models.files import ApplicationInfo, DeviceFile, FileType

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class ApplicationEndpoint:
    """Endpoint for application info and device asset files."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the application endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_info(self, site_id: str | None = None) -> ApplicationInfo:
        """
        Get Protect application information.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            Application information.

        """
        path = self._client.build_api_path("/meta/info", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return ApplicationInfo.model_validate(data)
        raise ValueError("Failed to get application info")

    async def get_files(
        self,
        file_type: FileType = FileType.ANIMATIONS,
        site_id: str | None = None,
    ) -> list[DeviceFile]:
        """
        List device asset files.

        Args:
            file_type: Type of files to list.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of device files.

        """
        path = self._client.build_api_path(f"/files/{file_type.value}", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [DeviceFile.model_validate(item) for item in data]
        return []

    async def upload_file(
        self,
        file_data: bytes,  # noqa: ARG002
        filename: str,
        content_type: str = "image/gif",
        file_type: FileType = FileType.ANIMATIONS,
        site_id: str | None = None,
    ) -> DeviceFile:
        """
        Upload a device asset file.

        Args:
            file_data: Binary file data (reserved for future multipart support).
            filename: Original filename.
            content_type: MIME type (image/gif, image/jpeg, image/png, audio/mpeg, etc).
            file_type: Type of file.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The uploaded file info.

        Note:
            Full multipart file upload support is planned for a future release.

        """
        path = self._client.build_api_path(f"/files/{file_type.value}", site_id)

        # TODO: Implement multipart form data support for actual file upload
        response = await self._client._post(
            path,
            json_data={"filename": filename, "contentType": content_type},
        )

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return DeviceFile.model_validate(data)
        raise ValueError("Failed to upload file")

    async def trigger_alarm_webhook(
        self,
        trigger_id: str,
        site_id: str | None = None,
    ) -> bool:
        """
        Send webhook to alarm manager.

        Args:
            trigger_id: User-defined trigger ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        if not trigger_id:
            raise ValueError("Trigger ID is required")

        path = self._client.build_api_path(
            f"/alarm-manager/webhook/{trigger_id}", site_id
        )
        await self._client._post(path)
        return True
