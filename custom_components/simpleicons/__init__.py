import homeassistant.components.frontend
from homeassistant.components.frontend import _frontend_root
from homeassistant.config_entries import SOURCE_IMPORT
from .custom_component_server import setup_view

DOMAIN = "simpleicons"

DATA_EXTRA_MODULE_URL = 'frontend_extra_module_url'
ICONS_URL = '/'+DOMAIN+'/data/'
ICON_FILES = {
    'simpleicons': 'si.js'
}

async def async_setup(hass, config):
    setup_view(hass, DOMAIN)
    
    if DOMAIN not in config:
        return True
    
    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_IMPORT}
        )
    )

    register_modules(hass)
    return True

async def async_setup_entry(hass, config_entry):
    config_entry.add_update_listener(_update_listener)
    register_modules(hass)
    return True

async def async_remove_entry(hass, config_entry):
    register_modules(hass)
    return True

async def _update_listener(hass, config_entry):
    register_modules(hass)
    return True


def register_modules(hass):
    if DATA_EXTRA_MODULE_URL not in hass.data:
        hass.data[DATA_EXTRA_MODULE_URL] = set()
    url_set = hass.data[DATA_EXTRA_MODULE_URL]

    for k,v in ICON_FILES.items():
        url_set.discard(ICONS_URL+v)
        #if k in modules and modules[k] != False:
        url_set.add(ICONS_URL+v)