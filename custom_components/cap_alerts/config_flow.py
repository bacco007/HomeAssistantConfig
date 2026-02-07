from __future__ import annotations
import aiohttp
import voluptuous as vol
from typing import Any
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from .const import DOMAIN, CONF_FEEDS, CATALOG_URL
from .util import compute_disclaimer_hash, async_save_acceptance
from .util import build_acceptance_signature
from .util import disclaimer_path

class CAPConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1
    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        # Mandatory disclaimer acceptance step
        return await self.async_step_accept()

    async def async_step_accept(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        schema = vol.Schema({vol.Required("accept", default=False): bool})
        if user_input is None:
            # Load packaged disclaimer text to present in the UI (scrollable in HA form)
            try:
                with open(disclaimer_path(), 'r', encoding='utf-8') as f:
                    disclaimer_text = f.read()
            except Exception:
                disclaimer_text = ""
            return self.async_show_form(
                step_id="accept",
                data_schema=schema,
                description_placeholders={
                    "link": "https://github.com/twcau/CAP-au-for-home-assistant/blob/main/LEGAL-DISCLAIMER.md",
                    "text": disclaimer_text,
                },
            )
        if not user_input.get("accept"):
            return self.async_abort(reason="disclaimer_not_accepted")
        # Record acceptance details
        user_id = self.context.get("user_id")
        from .util import now_iso
        ts = now_iso()
        disc_hash = compute_disclaimer_hash()
        await async_save_acceptance(self.hass, {
            "accepted": True,
            "accepted_at_iso": ts,
            "user_id": user_id,
            "disclaimer_hash": disc_hash,
            "signature": build_acceptance_signature(user_id, ts, disc_hash),
        })
        return await self.async_step_choose()

    async def async_step_choose(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        schema = vol.Schema({vol.Required("mode", default="catalog"): vol.In(["catalog","manual"])})
        if user_input is None:
            return self.async_show_form(step_id="choose", data_schema=schema)
        if user_input["mode"] == "catalog":
            return await self.async_step_catalog()
        return await self.async_step_manual()

    async def async_step_catalog(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        feeds: list[dict] = []
        try:
            async with aiohttp.ClientSession() as sess:
                async with sess.get(CATALOG_URL, timeout=10) as resp:
                    data = await resp.json(content_type=None)
                    feeds = data.get("feeds", [])
        except Exception:
            feeds = []
        countries = sorted({f.get("country","?") for f in feeds})
        schema = vol.Schema({vol.Required("country"): vol.In(countries)})
        if user_input is None:
            return self.async_show_form(step_id="catalog", data_schema=schema)
        self._feeds = feeds
        self._country = user_input["country"]
        return await self.async_step_catalog_region()

    async def async_step_catalog_region(self, user_input=None):
        regions = sorted({f["region"] for f in self._feeds if f.get("country") == self._country})
        schema = vol.Schema({vol.Required("region"): vol.In(regions)})
        if user_input is None:
            return self.async_show_form(step_id="catalog_region", data_schema=schema)
        self._region = user_input["region"]
        return await self.async_step_catalog_source()

    async def async_step_catalog_source(self, user_input=None):
        sources = [f for f in self._feeds if f.get("country") == self._country and f.get("region") == self._region]
        names = [f"{f['name']} ({f['format']})" for f in sources]
        schema = vol.Schema({vol.Required("source"): vol.In(names)})
        if user_input is None:
            return self.async_show_form(step_id="catalog_source", data_schema=schema)
        idx = names.index(user_input["source"]) if names else -1
        if idx >= 0:
            sel = sources[idx]
            return self.async_create_entry(title="CAP Alerts", data={CONF_FEEDS: [sel]})
        return self.async_abort(reason="no_selection")

    async def async_step_manual(self, user_input=None):
        schema = vol.Schema({
            vol.Required("name"): str,
            vol.Required("url"): str,
            vol.Required("format", default="cap"): vol.In(["cap","atom","json"])})
        if user_input is None:
            return self.async_show_form(step_id="manual", data_schema=schema)
        return self.async_create_entry(title="CAP Alerts", data={CONF_FEEDS: [user_input]})

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return CAPOptionsFlow(config_entry)

class CAPOptionsFlow(config_entries.OptionsFlow):
    def __init__(self, entry: config_entries.ConfigEntry) -> None:
        self.entry = entry

    async def async_step_init(self, user_input=None):
        feeds = self.entry.data.get(CONF_FEEDS, []) + self.entry.options.get(CONF_FEEDS, [])
        # Allow resetting failure counters for specific feed slugs
        slugs = []
        for f in feeds:
            url = f.get('url','')
            from .util import slug_from_url as _slug
            slugs.append(_slug(url))
        schema = vol.Schema({vol.Optional("add_or_replace", default="add"): vol.In(["add","replace"]),
                             vol.Optional("name"): str,
                             vol.Optional("url"): str,
                             vol.Optional("format", default="cap"): vol.In(["cap","atom","json"]),
                             vol.Optional("reset_failures_for"): vol.In(slugs)})
        if user_input is None:
            return self.async_show_form(step_id="init", data_schema=schema)
        new_feed = {k:user_input[k] for k in ("name","url","format") if k in user_input and user_input[k]}
        if user_input.get("add_or_replace") == "replace" and new_feed:
            feeds = [new_feed]
        elif new_feed:
            feeds = feeds + [new_feed]
        # Reset failure counter if requested
        reset_slug = user_input.get("reset_failures_for")
        if reset_slug:
            from .const import DOMAIN
            self.hass.data.setdefault(DOMAIN, {})
            self.hass.data[DOMAIN].setdefault('failures', {})
            self.hass.data[DOMAIN]['failures'][reset_slug] = 0
        return self.async_create_entry(title="Options updated", data={CONF_FEEDS: feeds})
