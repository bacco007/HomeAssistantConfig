from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import (
    add_extra_js_url, 
    remove_extra_js_url
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection

from .const import DOMAIN, FRONTEND_SCRIPT_URL
from .helpers import get_version

async def async_register_static_path(hass: HomeAssistant) -> None:
    """Register the static path for the frontend script."""
    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}",
                    hass.config.path(f"custom_components/{DOMAIN}/{FRONTEND_SCRIPT_URL}"),
                    True,
                )
            ]
        )   
    except RuntimeError:
        # already registered, likely from a previous instance of the integration has been 
        # removed and Home Assistant not restarted yet
        pass

async def async_register_frontend_script_resource(hass: HomeAssistant, url: str) -> None:
    """Register the frontend script as a resource."""

    version = await hass.async_add_executor_job(get_version, hass)
    
    # Serve the Uix controller and add it as extra_module_url
    add_extra_js_url(hass, f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}?v={version}")

    # Also load Uix as a lovelace resource so it's accessible to Cast
    resources = hass.data["lovelace"].resources
    resourceUrl = f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}?v={version}"
    if resources:
        if not resources.loaded:
            await resources.async_load()
            resources.loaded = True

        frontend_added = False
        for r in resources.async_items():
            if r["url"].startswith(f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}"):
                frontend_added = True
                if not r["url"].endswith(version):
                    if isinstance(resources, ResourceStorageCollection):
                        await resources.async_update_item(
                            r["id"], 
                            {
                                "res_type": "module", 
                                "url": resourceUrl
                            }
                        )
                    else:
                        # not the best solution, but what else can we do
                        r["url"] = resourceUrl
                
                continue

        if not frontend_added:
            if getattr(resources, "async_create_item", None):
                await resources.async_create_item(
                    {
                        "res_type": "module",
                        "url": resourceUrl,
                    }
                )
            elif getattr(resources, "data", None) and getattr(
                resources.data, "append", None
            ):
                resources.data.append(
                    {
                        "type": "module",
                        "url": resourceUrl,

                    }
                )

async def async_remove_frontend_script_resource(hass: HomeAssistant) -> None:
    """Remove the frontend script resource."""

    version = await hass.async_add_executor_job(get_version, hass)

    remove_extra_js_url(hass, f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}?v={version}")

    resources = hass.data["lovelace"].resources
    if resources:
        if not resources.loaded:
            await resources.async_load()
            resources.loaded = True

        for r in resources.async_items():
            if r["url"].startswith(f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}"):
                if isinstance(resources, ResourceStorageCollection):
                    await resources.async_delete_item(r["id"])
                else:
                    # not the best solution, but what else can we do
                    resources.data.remove(r)

