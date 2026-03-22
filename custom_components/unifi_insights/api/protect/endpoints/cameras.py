"""Cameras endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Camera, RecordingMode
from ..models.files import RTSPSStream, TalkbackSession

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class CamerasEndpoint:
    """Endpoint for managing UniFi Protect cameras."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the cameras endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[Camera]:
        """
        List all cameras.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of cameras.

        """
        path = self._client.build_api_path("/cameras", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Camera.model_validate(item) for item in data]
        return []

    async def get(self, camera_id: str, site_id: str | None = None) -> Camera:
        """
        Get a specific camera.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The camera.

        """
        path = self._client.build_api_path(f"/cameras/{camera_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Camera.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Camera.model_validate(data[0])
        raise ValueError(f"Camera {camera_id} not found")

    async def update(
        self,
        camera_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> Camera:
        """
        Update camera settings.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated camera.

        """
        path = self._client.build_api_path(f"/cameras/{camera_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return Camera.model_validate(result)
        raise ValueError("Failed to update camera")

    async def set_recording_mode(
        self,
        camera_id: str,
        mode: RecordingMode,
        site_id: str | None = None,
    ) -> Camera:
        """
        Set camera recording mode.

        Args:
            camera_id: The camera ID.
            mode: The recording mode.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated camera.

        """
        return await self.update(camera_id, site_id, recordingMode=mode.value)

    async def get_snapshot(
        self,
        camera_id: str,
        width: int | None = None,
        height: int | None = None,
        site_id: str | None = None,
    ) -> bytes:
        """
        Get a snapshot from the camera.

        Args:
            camera_id: The camera ID.
            width: Optional width for the snapshot.
            height: Optional height for the snapshot.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The snapshot image bytes.

        """
        params: dict[str, Any] = {}
        if width:
            params["w"] = width
        if height:
            params["h"] = height

        path = self._client.build_api_path(f"/cameras/{camera_id}/snapshot", site_id)
        return await self._client._get_binary(path, params=params)

    async def restart(self, camera_id: str, site_id: str | None = None) -> bool:
        """
        Restart a camera.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/cameras/{camera_id}/restart", site_id)
        await self._client._post(path)
        return True

    async def set_microphone_volume(
        self,
        camera_id: str,
        volume: int,
        site_id: str | None = None,
    ) -> Camera:
        """
        Set camera microphone volume.

        Args:
            camera_id: The camera ID.
            volume: Volume level (0-100).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated camera.

        """
        if not 0 <= volume <= 100:
            raise ValueError("Volume must be between 0 and 100")
        return await self.update(camera_id, site_id, micVolume=volume)

    async def set_speaker_volume(
        self,
        camera_id: str,
        volume: int,
        site_id: str | None = None,
    ) -> Camera:
        """
        Set camera speaker volume.

        Args:
            camera_id: The camera ID.
            volume: Volume level (0-100).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated camera.

        """
        if not 0 <= volume <= 100:
            raise ValueError("Volume must be between 0 and 100")
        return await self.update(camera_id, site_id, speakerVolume=volume)

    async def ptz_move(
        self,
        camera_id: str,
        *,
        pan: float | None = None,
        tilt: float | None = None,
        zoom: float | None = None,
        site_id: str | None = None,
    ) -> bool:
        """
        Move PTZ camera.

        Args:
            camera_id: The camera ID.
            pan: Pan value (-1.0 to 1.0).
            tilt: Tilt value (-1.0 to 1.0).
            zoom: Zoom value (0.0 to 1.0).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        data: dict[str, Any] = {}
        if pan is not None:
            data["pan"] = pan
        if tilt is not None:
            data["tilt"] = tilt
        if zoom is not None:
            data["zoom"] = zoom

        path = self._client.build_api_path(f"/cameras/{camera_id}/ptz/move", site_id)
        await self._client._post(path, json_data=data)
        return True

    async def ptz_goto_preset(
        self,
        camera_id: str,
        preset_id: str,
        site_id: str | None = None,
    ) -> bool:
        """
        Move PTZ camera to a preset position.

        Args:
            camera_id: The camera ID.
            preset_id: The preset position ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/ptz/goto/{preset_id}", site_id
        )
        await self._client._post(path)
        return True

    async def ptz_patrol_start(
        self,
        camera_id: str,
        slot: int,
        site_id: str | None = None,
    ) -> bool:
        """
        Start PTZ patrol.

        Args:
            camera_id: The camera ID.
            slot: Patrol slot number (0-4).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        if not 0 <= slot <= 4:
            raise ValueError("Slot must be between 0 and 4")
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/ptz/patrol/start/{slot}", site_id
        )
        await self._client._post(path)
        return True

    async def ptz_patrol_stop(
        self,
        camera_id: str,
        site_id: str | None = None,
    ) -> bool:
        """
        Stop active PTZ patrol.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/ptz/patrol/stop", site_id
        )
        await self._client._post(path)
        return True

    async def create_rtsps_stream(
        self,
        camera_id: str,
        qualities: list[str] | None = None,
        site_id: str | None = None,
    ) -> RTSPSStream:
        """
        Create RTSPS stream for camera.

        Args:
            camera_id: The camera ID.
            qualities: List of stream qualities to enable (e.g., ["high"], ["medium", "low"]).
                      Valid values are typically "high", "medium", "low".
                      Defaults to ["high"] if not specified.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            RTSPS stream configuration.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/rtsps-stream", site_id
        )
        body = {"qualities": qualities or ["high"]}
        response = await self._client._post(path, json_data=body)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return RTSPSStream.model_validate(data)
        raise ValueError("Failed to create RTSPS stream")

    async def get_rtsps_stream(
        self,
        camera_id: str,
        site_id: str | None = None,
    ) -> RTSPSStream:
        """
        Get RTSPS stream configuration.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            RTSPS stream configuration.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/rtsps-stream", site_id
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return RTSPSStream.model_validate(data)
        raise ValueError("RTSPS stream not found")

    async def delete_rtsps_stream(
        self,
        camera_id: str,
        qualities: list[str] | None = None,
        site_id: str | None = None,
    ) -> bool:
        """
        Delete RTSPS stream.

        Args:
            camera_id: The camera ID.
            qualities: List of stream qualities to delete (e.g., ["high"], ["medium", "low"]).
                      Defaults to ["high"] if not specified.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/rtsps-stream", site_id
        )
        params = {"qualities": qualities or ["high"]}
        await self._client._delete(path, params=params)
        return True

    async def create_talkback_session(
        self,
        camera_id: str,
        site_id: str | None = None,
    ) -> TalkbackSession:
        """
        Create a talkback (two-way audio) session.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            Talkback session configuration with URL and audio settings.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/talkback-session", site_id
        )
        response = await self._client._post(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return TalkbackSession.model_validate(data)
        raise ValueError("Failed to create talkback session")

    async def disable_mic_permanently(
        self,
        camera_id: str,
        site_id: str | None = None,
    ) -> Camera:
        """
        Permanently disable camera microphone.

        This action cannot be undone.

        Args:
            camera_id: The camera ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated camera with microphone disabled.

        """
        path = self._client.build_api_path(
            f"/cameras/{camera_id}/disable-mic-permanently", site_id
        )
        response = await self._client._post(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Camera.model_validate(data)
        raise ValueError("Failed to disable microphone")

    async def set_hdr_mode(
        self,
        camera_id: str,
        mode: str,
        site_id: str | None = None,
    ) -> Camera:
        """
        Set camera HDR mode.

        Args:
            camera_id: The camera ID.
            mode: HDR mode (auto, on, off).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated camera.

        """
        if mode not in ("auto", "on", "off"):
            raise ValueError("HDR mode must be 'auto', 'on', or 'off'")
        return await self.update(camera_id, site_id, hdrType=mode)

    async def set_video_mode(
        self,
        camera_id: str,
        mode: str,
        site_id: str | None = None,
    ) -> Camera:
        """
        Set camera video mode.

        Args:
            camera_id: The camera ID.
            mode: Video mode (default, highFps, sport, slowShutter, etc).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated camera.

        """
        return await self.update(camera_id, site_id, videoMode=mode)
