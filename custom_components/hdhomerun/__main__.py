"""Basic CLI for testing pyhdr"""
import asyncio
import logging
from typing import (
    List,
    Optional,
)

import asyncclick as click

from pyhdhr import HDHomeRunDevice
from pyhdhr.discover import (
    Discover,
    DiscoverMode,
)
from pyhdhr.logger import Logger

_LOGGER = logging.getLogger(__name__)
log_formatter: Logger = Logger()

click.anyio_backend = "asyncio"


@click.group(invoke_without_command=True)
@click.option("-v", "--verbose", count=True)
@click.pass_context
async def cli(ctx: click.Context, verbose: int) -> None:
    """"""

    if ctx.invoked_subcommand is None:
        click.echo(ctx.get_help())
    else:
        if verbose:
            logging.basicConfig()
            _LOGGER.setLevel(logging.DEBUG)
            if verbose > 1:
                logging.getLogger("pyhdhr").setLevel(logging.DEBUG)

    await asyncio.sleep(0.1)


@cli.command()
@click.option(
    "-b", "--broadcast-address",
    default="255.255.255.255",
)
@click.option(
    "--include-tuner-info/--no-include-tuner-info",
    default=False
)
@click.option(
    "-m", "--mode",
    default=DiscoverMode.AUTO.value,
)
@click.option(
    "--target",
)
async def discover(
    broadcast_address: Optional[str] = None,
    mode: Optional[DiscoverMode] = DiscoverMode.AUTO,
    target: Optional[str] = None,
    include_tuner_info: bool = False,
) -> None:
    """"""

    _LOGGER.debug(log_formatter.format("entered, args: %s"), locals())

    if target is None:
        discovery = Discover(mode=mode)
        devices: List[HDHomeRunDevice] = await discovery.discover(broadcast_address=broadcast_address)
    else:
        device = HDHomeRunDevice(host=target)
        # setattr(device, "_discover_url", f"http://{device.ip}/discover.json")
        device = await Discover.rediscover(target=device)
        devices: List[HDHomeRunDevice] = [device]

    for dev in devices:
        if include_tuner_info:
            await dev.async_tuner_refresh()
        _print_to_screen(device=dev)

    _LOGGER.debug(log_formatter.format("exited"))


@cli.command()
@click.option(
    "--target",
    required=True,
)
async def restart(target: str) -> None:
    """"""

    _LOGGER.debug(log_formatter.format("entered, args: %s"), locals())

    device: HDHomeRunDevice = HDHomeRunDevice(host=target)
    await device.async_restart()

    _LOGGER.debug(log_formatter.format("exited"))


@cli.command()
@click.option(
    "--target",
    required=True
)
@click.option(
    "--variable",
    required=True
)
async def get_variable(target: str, variable: str) -> None:
    """"""

    _LOGGER.debug(log_formatter.format("entered, args: %s"), locals())

    device: HDHomeRunDevice = HDHomeRunDevice(host=target)
    ret = await device.async_get_variable(variable=variable)

    click.echo(ret)

    _LOGGER.debug(log_formatter.format("exited"))


def _print_to_screen(device: HDHomeRunDevice) -> None:
    """"""

    click.echo(device.device_id)
    click.echo('-' * len(device.device_id))
    click.echo(f"Online: {device.online}")
    click.echo(f"FriendlyName: {device.friendly_name}")
    click.echo(f"IP: {device.ip}")
    click.echo(f"Type: {device.device_type}")
    click.echo(f"TunerCount: {device.tuner_count}")
    click.echo(f"DeviceAuth: {device.device_auth_string}")
    click.echo(f"BaseURL: {device.base_url}")
    click.echo(f"LineupURL: {device.lineup_url}")
    click.echo(f"FirmwareVersion: {device.installed_version}")
    click.echo(f"FirmwareName: {device.model}")
    click.echo(f"ModelNumber: {device.hw_model}")
    click.echo(f"UpgradeAvailable: {device.latest_version}")
    click.echo(f"Channels: {device.channels}")
    if device.tuner_status is not None:
        click.echo(f"Tuner Status: {device.tuner_status}")
    click.echo()


if __name__ == "__main__":
    cli()
