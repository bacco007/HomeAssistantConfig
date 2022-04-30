"""Basic CLI for testing pyhdr"""

# TODO: Set this up with command line parameters etc

import asyncio
import logging

from typing import List

from pyhdhr import HDHomeRunDevice
from pyhdhr.discover import (
    Discover,
    DiscoverMode,
)

_LOGGER = logging.getLogger(__name__)


async def main():
    """"""

    logging.basicConfig()
    _LOGGER.setLevel(logging.DEBUG)
    logging.getLogger("pyhdhr").setLevel(logging.DEBUG)

    _LOGGER.debug("entered")

    discovery = Discover(mode=DiscoverMode.AUTO)
    # device = HDHomeRunDevice(host="192.168.123.254")
    # await discovery.rediscover(target=device)
    # devices: List[HDHomeRunDevice] = [device]
    devices: List[HDHomeRunDevice] = await discovery.discover(broadcast_address="192.168.123.255")
    for dev in devices:
        def print_overview() -> None:
            print(dev.device_id)
            print('-' * len(dev.device_id))
            print("FriendlyName:", dev.friendly_name)
            print("IP:", dev.ip)
            print("Type:", dev.device_type)
            print("TunerCount:", dev.tuner_count)
            print("DeviceAuth:", dev.device_auth_string)
            print("BaseURL:", dev.base_url)
            print("LineupURL:", dev.lineup_url)
            print("FirmwareVersion:", dev.installed_version)
            print("FirmwareName:", dev.model)
            print("ModelNumber:", dev.hw_model)
            print("UpgradeAvailable:", dev.latest_version)
            print("Channels:", dev.channels)
            print()

        print_overview()
        print("Tuners")
        print("------")
        await dev.async_tuner_refresh()
        print("TunerStatus:", dev.tuner_status)
        print()

    _LOGGER.debug("exited")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt as err:
        _LOGGER.debug("User exited the CLI")
    else:
        _LOGGER.debug("CLI exited")
