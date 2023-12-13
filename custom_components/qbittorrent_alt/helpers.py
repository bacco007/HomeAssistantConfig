import ssl

from aioqbt.api.types import TorrentInfo
from aioqbt.client import APIClient, create_client
from homeassistant.const import STATE_IDLE

from .coordinator import QBittorrentDataCoordinator


async def setup_client(
    url: str, username: str, password: str, verify_ssl: bool
) -> APIClient:
    if verify_ssl:
        ssl_contex = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    else:
        ssl_contex = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT, verify_mode=ssl.CERT_NONE)
        ssl_contex.check_hostname = False
        ssl_contex.verify_mode = ssl.CERT_NONE
    client = await create_client(
        url, username=username, password=password, ssl=ssl_contex
    )
    async with client:
        await client.app.version()
    return client


def get_qbittorrent_state(coordinator: QBittorrentDataCoordinator) -> str:
    download = coordinator.data["sync"].server_state["dl_info_speed"]
    upload = coordinator.data["sync"].server_state["up_info_speed"]

    if upload > 0 and download > 0:
        return "up_down"
    if upload > 0 and download == 0:
        return "seeding"
    if upload == 0 and download > 0:
        return "downloading"
    return STATE_IDLE


def get_torrent_info(torrent: TorrentInfo) -> dict[str, str | int | float]:
    return {
        "hash": torrent.hash,
        "name": torrent.name,
        "eta": torrent.eta.seconds,
        "save_path": torrent.save_path,
        "seeds": torrent.num_seeds,
        "state": str(torrent.state),
        "category": torrent.category,
        "tags": torrent.tags,
        "total_downloaded": torrent.completed,
        "total_size": torrent.size,
    }
