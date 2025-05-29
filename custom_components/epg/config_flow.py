from homeassistant import config_entries
import voluptuous as vol
import os
import logging
import aiohttp
from typing import Final
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.exceptions import PlatformNotReady
from homeassistant.core import HomeAssistant
from .const import DOMAIN
from homeassistant.core import callback
from homeassistant.helpers import config_validation as cv
_LOGGER: Final = logging.getLogger(__name__)

# Helper functions
def read_file(file):
    with open(file, "r") as guide_file:
        return guide_file.read()

def write_file(file, data):
    with open(file, "w") as guide_file:
        guide_file.write(data)

first_step_schema = vol.Schema(
    {
        vol.Required("file_name"): str,
        vol.Required("full_schedule", default=False): bool,
        vol.Required("generated", default=False): bool,
    }
)


async def fetch_channel_list( hass: HomeAssistant, url):
       """Fetch the channel_list from the URL"""
       session = async_get_clientsession(hass)
       try:
           response = await session.get(url)
           response.raise_for_status()
           data = await response.text()
           return data
       except aiohttp.ClientError as error:
           _LOGGER.error("Error fetching guide: %s", error)

async def _fetch_channels(hass: HomeAssistant,  user_data):
    """Fetch the list of channels from the guide."""
    file = ''.join(user_data["file_name"].split()).lower()
    channels= await fetch_channel_list(hass, f"https://www.open-epg.com/files/{file}.xml.txt")

    return channels.splitlines() if channels else None



class EPGConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for EPG."""

    VERSION = 1

    def __init__(self):
        self.user_data = {}  # Temporary storage for data across steps
        self.available_channels = []  # Dynamically populated channel list

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            if not user_input.get("generated"):
                self.available_channels = await _fetch_channels(self.hass, user_input)
                if not self.available_channels:
                    errors["base"] = "invalid_file_name"
                    return self.async_show_form(
                        step_id="user",
                        data_schema=first_step_schema,
                        errors=errors,
                    )
            self.user_data.update(user_input)
            return await self.async_step_channels()

        return self.async_show_form(
            step_id="user",
            data_schema=first_step_schema,
            errors=errors,
        )

    async def async_step_channels(self, user_input=None):
        """Handle the channel selection step."""
        errors = {}

        if self.user_data["generated"]:
            file_name = os.path.basename(self.user_data["file_name"])
            self.user_data["file_path"] = os.path.join(os.path.dirname(__file__), f"userfiles/{file_name}.xml")
            return self.async_create_entry(
                title=file_name,
                data=self.user_data,
                options=self.user_data,
            )

        if user_input is not None:
            self.user_data["selected_channels"] = user_input["channels"]
            file_name = os.path.basename(self.user_data["file_name"])
            self.user_data["file_path"] = os.path.join(os.path.dirname(__file__), f"userfiles/{''.join(file_name.split()).lower()}.xml")

            return self.async_create_entry(
                title=file_name,
                data=self.user_data,
                options=self.user_data,
            )

        channel_options = list({channel.split(";")[0] for channel in self.available_channels if channel.strip() and not channel.startswith("In total this list")})
        channel_options.sort()
        data_schema = vol.Schema(
            {
                vol.Required("channels", default=[]): cv.multi_select(channel_options)
            }
        )

        return self.async_show_form(
            step_id="channels",
            data_schema=data_schema,
            errors=errors,
        )


    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Return the options flow handler for the integration."""
        return EPGOptionsFlowHandler(config_entry)


class EPGOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for EPG integration."""

    def __init__(self, config_entry) -> None:
        """Initialize options flow."""
        self.defult_data=config_entry.options

        self.user_data = {}  # Temporary storage for data across steps
        self.available_channels = []  # Dynamically populated channel list

    async def async_step_init(self, user_input=None):
        """Manage the options for the integration."""
        errors = {}

        if user_input is not None:
            self.user_data.update(user_input)
            return await self.async_step_channels()

        options_schema = vol.Schema({
            vol.Required("file_name",default=self.defult_data.get("file_name")): str,
            vol.Required("full_schedule", default=self.defult_data.get("full_schedule")): bool,
            vol.Required("generated", default=self.defult_data.get("generated")): bool,
        })

        return self.async_show_form(
            step_id="init",
            data_schema=options_schema,
            errors=errors,
        )
    async def async_step_channels(self, user_input=None):
        """Manage the channel selection step."""
        errors = {}

        selected_channels = self.defult_data.get("selected_channels", [])

        if self.user_data["generated"]:
            file_name = os.path.basename(self.user_data["file_name"])
            self.user_data["file_path"]=os.path.join(os.path.dirname(__file__), f"userfiles/{file_name}.xml")
            return self.async_create_entry(title="", data=self.user_data)

        if user_input is not None:
            self.user_data["selected_channels"] = user_input["channels"]
            file_name = os.path.basename(self.user_data["file_name"])
            self.user_data["file_path"]=os.path.join(os.path.dirname(__file__), f"userfiles/{''.join(file_name.split()).lower()}.xml")
            entry = self.hass.config_entries.async_get_entry(self.config_entry.entry_id)
            if entry:
                self.hass.config_entries.async_update_entry(entry, data=self.user_data, options=self.user_data)
                await self.hass.config_entries.async_reload(entry.entry_id)

            return self.async_create_entry(title="", data=self.user_data)


        if not self.available_channels :
            self.available_channels = await _fetch_channels(self.hass,self.user_data)
            if not self.available_channels:
                errors["base"] = "no_channels"
                return self.async_show_form(
                    step_id="channels",
                    data_schema=vol.Schema({}),
                    errors=errors,
                )
        channel_options = list({channel.split(";")[0] for channel in self.available_channels if channel.strip() and not channel.startswith("In total this list")})
        channel_options.sort()
        data_schema = vol.Schema(
            {
                vol.Required("channels", default=selected_channels): cv.multi_select(channel_options)
            }
        )

        return self.async_show_form(
            step_id="channels",
            data_schema=data_schema,
            errors=errors,
        )
