"""Serve the bundled card and register it as a Lovelace resource.

HACS treats a repository as a single category, so the card ships inside the
integration and the integration registers it. Users install one thing.
"""

import logging
from typing import Any

from homeassistant.components.http.server import StaticPathConfig
from homeassistant.components.lovelace import LovelaceData
from homeassistant.components.lovelace.const import DOMAIN as LOVELACE_DOMAIN
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import CARD_FILENAME, DOMAIN, URL_BASE

_LOGGER = logging.getLogger(__name__)


def card_resource_url(hass: HomeAssistant) -> str:
    """Return the versioned resource url for the bundled card.

    The version query busts the browser cache when the card changes, and is
    what makes an existing resource identifiable as out of date rather than as
    a duplicate to be created again.
    """
    version = hass.data.get(f"{DOMAIN}_version", "0")
    return f"{URL_BASE}/{CARD_FILENAME}?v={version}"


async def async_register(hass: HomeAssistant) -> None:
    """Serve the card and make sure Lovelace knows about it.

    Called once when Home Assistant has started, not once per config entry:
    static paths and Lovelace resources are global.
    """
    integration = await async_get_integration(hass, DOMAIN)
    hass.data[f"{DOMAIN}_version"] = integration.version or "0"

    # The path must be a *directory*: Home Assistant mounts a static route
    # only when os.path.isdir() holds, and silently registers nothing when
    # handed a file, which leaves the card 404ing with no error anywhere.
    www = integration.file_path / "www"
    if not (www / CARD_FILENAME).is_file():
        _LOGGER.error(
            "The bundled card %s is missing from %s, so the dashboard card will "
            "not be available. The sensors still work. This usually means the "
            "download was incomplete: reinstall HAUS, or copy the whole "
            "custom_components/haus directory including its www folder",
            CARD_FILENAME,
            www,
        )
        return

    await hass.http.async_register_static_paths(
        [StaticPathConfig(URL_BASE, str(www), False)]
    )
    _LOGGER.info("Serving the HAUS card from %s at %s/", www, URL_BASE)

    await async_register_resource(hass)


def _find_resource(
    resources: ResourceStorageCollection,
) -> dict[str, Any] | None:
    """Return HAUS's own Lovelace resource, ignoring the version query.

    The url carries `?v=` and that is the cache key, so it changes with every
    release. Matching on the path is what makes a resource identifiable across
    versions - and one definition of "ours", shared by registration and
    removal, is what stops the two disagreeing and orphaning one.
    """
    for item in resources.async_items():
        if str(item.get("url", "")).split("?")[0] == f"{URL_BASE}/{CARD_FILENAME}":
            return dict(item)
    return None


async def async_remove_resource(hass: HomeAssistant) -> None:
    """Delete the Lovelace resource HAUS registered, if it is still there.

    Called when the config entry is removed. Nothing else unregisters it, so
    without this the user is left with a resource pointing at a file that is no
    longer served - and no obvious clue where it came from.
    """
    lovelace: LovelaceData | None = hass.data.get(LOVELACE_DOMAIN)
    if lovelace is None:
        return

    resources = lovelace.resources
    # YAML mode never had one created, so there is nothing to undo.
    if not isinstance(resources, ResourceStorageCollection):
        return

    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True

    existing = _find_resource(resources)
    if existing is None:
        return

    await resources.async_delete_item(existing["id"])
    _LOGGER.debug("Removed the HAUS card Lovelace resource")


async def async_register_resource(hass: HomeAssistant) -> None:
    """Create or update the Lovelace resource pointing at the card.

    Separate from serving the file: the static path can only be registered
    once per run, while the resource is safe to reconcile at any time.
    """
    lovelace: LovelaceData | None = hass.data.get(LOVELACE_DOMAIN)
    if lovelace is None:
        _LOGGER.debug("Lovelace is not set up; skipping resource registration")
        return

    url = card_resource_url(hass)
    resources = lovelace.resources

    # YAML-mode Lovelace hands back a read-only collection. Say what to paste
    # rather than failing setup over it.
    if not isinstance(resources, ResourceStorageCollection):
        _LOGGER.warning(
            "Lovelace is in YAML mode, so HAUS cannot register its card for you. "
            "Add this to the resources section of your dashboard configuration: "
            "{url: %s, type: module}",
            url,
        )
        return

    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True

    existing = _find_resource(resources)

    if existing is None:
        await resources.async_create_item({"res_type": "module", "url": url})
        _LOGGER.debug("Registered the HAUS card as a Lovelace resource")
        return

    if existing.get("url") != url:
        # Update rather than create, or every version would leave another
        # resource behind pointing at the same card.
        await resources.async_update_item(existing["id"], {"url": url})
        _LOGGER.debug("Updated the HAUS card Lovelace resource to %s", url)
