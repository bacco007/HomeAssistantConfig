"""The Yahoo finance component.

https://github.com/iprak/yahoofinance
"""
from __future__ import annotations

import asyncio
from datetime import timedelta
from http import HTTPStatus
from http.cookies import SimpleCookie
import logging
import re
from typing import Final

import aiohttp
import async_timeout

from custom_components.yahoofinance.const import CONSENT_HOST, CRUMB_URL, GET_CRUMB_URL
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import event
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util.dt import utcnow

#from homeassistant.util.file import write_utf8_file
from .const import (
    BASE,
    DATA_REGULAR_MARKET_PRICE,
    NUMERIC_DATA_DEFAULTS,
    NUMERIC_DATA_GROUPS,
    REQUEST_HEADERS,
    STRING_DATA_KEYS,
)

_LOGGER = logging.getLogger(__name__)
WEBSESSION_TIMEOUT: Final = 15
DELAY_ASYNC_REQUEST_REFRESH: Final = 5
FAILURE_ASYNC_REQUEST_REFRESH: Final = 20


class CrumbCoordinator:
    """Class to gather crumb/cookie details."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize."""

        self.cookies: SimpleCookie[str] = None
        """Cookies for requests."""
        self.crumb: str | None = None
        """Crumb for requests."""
        self._hass = hass

    def reset(self) -> None:
        """Reset crumb and cookies."""
        self.crumb = self.cookies = None

    async def try_get_crumb_cookies(self) -> str | None:
        """Try to get crumb and cookies for data requests."""

        websession = async_get_clientsession(self._hass)
        self.reset()

        try:
            async with async_timeout.timeout(WEBSESSION_TIMEOUT):
                _LOGGER.debug("Navigating to a base Yahoo page")

                # Websession.get handles redirects by default
                response = await websession.get(CRUMB_URL, headers=REQUEST_HEADERS)

                # Only keep cookies from initial response. Consent/crumb pages do not provide cookies.
                self.cookies = response.cookies

                _LOGGER.debug("Response %d, URL: %s", response.status, response.url)
                _LOGGER.debug("Cookies: %s", str(self.cookies))

                if (response.status == HTTPStatus.OK) and (response.url.host.lower() == CONSENT_HOST):
                    _LOGGER.debug("Consent page detected")
                    content = await response.text()
                    form_data=self.build_consent_form_data(content)
                    _LOGGER.debug("Posting consent %s", str(form_data))
                    response = await websession.post(response.url, data=form_data)

                    if response.status != HTTPStatus.OK:
                        _LOGGER.info("Consent post responded with %d", response.status)
                        return

                    _LOGGER.debug("Consent post response %d, URL: %s", response.status, response.url)
                    #content = await response.text()
                    #await self.parse_crumb_from_content(content)
                    #_LOGGER.debug("Crumb: %s", self.crumb)

                # Try another crumb page even if the consent response provided a crumb.
                await self.try_crumb_page(websession)

        except asyncio.TimeoutError as ex:
            _LOGGER.error("Timed out getting crumb. %s", ex)
        except aiohttp.ClientError as ex:
            _LOGGER.error("Error accessing crumb url. %s", ex)

        _LOGGER.debug("Crumb: %s", self.crumb)
        return self.crumb

    async def try_crumb_page(self,websession: aiohttp.ClientSession) -> None:
        """Try to get crumb from the end point."""

        _LOGGER.debug("Accessing crumb page")
        response = await websession.get(GET_CRUMB_URL, headers=REQUEST_HEADERS)
        _LOGGER.debug("Crumb response status: %d, URL: %s", response.status, response.url)

        if response.status == HTTPStatus.OK:
            self.crumb = await response.text()
            _LOGGER.debug("Crumb page reported %s", self.crumb)
        else:
            _LOGGER.info("Crumb page responded with %d", response.status)

    # async def parse_crumb_from_content(self, content: str) -> str:
    #     """Parse and update crumb from response content."""

    #     _LOGGER.debug("Parsing crumb from content (length: %d)", len(content))

    #     start_pos = content.find('"crumb":"')
    #     _LOGGER.debug("Start position: %d", start_pos)
    #     end_pos = -1

    #     if start_pos != -1:
    #         start_pos = start_pos + 9
    #         end_pos = content.find('"', start_pos + 10)
    #         _LOGGER.debug("End position: %d", end_pos)
    #         if end_pos != -1:
    #             self.crumb = (
    #                 content[start_pos:end_pos]
    #                 .encode()
    #                 .decode("unicode_escape")
    #             )

    #     # Crumb was not located
    #     if not self.crumb:
    #         _LOGGER.info(
    #             "Crumb not found, start position: %d, ending position: %d. Refer to YahooFinanceCrumbContent.log in the config folder.",
    #             start_pos,
    #             end_pos,
    #         )

    #         if _LOGGER.isEnabledFor(logging.INFO):
    #             await self._hass.async_add_executor_job(
    #                 write_utf8_file,
    #                 self._hass.config.path("YahooFinanceCrumbContent.log"),
    #                 content,
    #             )

    def build_consent_form_data(self, content: str) -> dict[str,str]:
        """Build consent form data from response content."""
        pattern = (
            r'<input.*?type="hidden".*?name="(.*?)".*?value="(.*?)".*?>'
        )
        matches = re.findall(pattern, content)
        form_data = {"reject": "reject"}
        for name, value in matches:
            form_data[name] = value

        return form_data

class YahooSymbolUpdateCoordinator(DataUpdateCoordinator):
    """Yahoo finance data update coordinator."""

    @staticmethod
    def parse_symbol_data(symbol_data: dict) -> dict[str, any]:
        """Return data pieces which we care about, use 0 for missing numeric values."""
        data = {}

        # get() ensures that we have an entry in symbol_data.
        for data_group in NUMERIC_DATA_GROUPS.values():
            for value in data_group:
                key = value[0]

                # Default value for most missing numeric keys is 0
                default_value = NUMERIC_DATA_DEFAULTS.get(key, 0)

                data[key] = symbol_data.get(key, default_value)

        for key in STRING_DATA_KEYS:
            data[key] = symbol_data.get(key)

        return data

    @staticmethod
    def fix_conversion_symbol(symbol: str, symbol_data: any) -> str:
        """Fix the conversion symbol from data."""

        if symbol is None or symbol == "" or not symbol.endswith("=X"):
            return symbol

        # Data analysis showed that data for conversion symbol has 'shortName': 'USD/EUR'
        short_name = symbol_data["shortName"] or ""
        from_to = short_name.split("/")
        if len(from_to) != 2:
            return symbol

        from_currency = from_to[0]
        to_currency = from_to[1]
        if from_currency == "" or to_currency == "":
            return symbol

        conversion_symbol = f"{from_currency}{to_currency}=X"

        if conversion_symbol != symbol:
            _LOGGER.info(
                "Conversion symbol updated to %s from %s", conversion_symbol, symbol
            )

        return conversion_symbol

    def __init__(
        self,
        symbols: list[str],
        hass: HomeAssistant,
        update_interval: timedelta,
        cc: CrumbCoordinator,
    ) -> None:
        """Initialize."""
        self._symbols = symbols
        self.data = None
        self.loop = hass.loop
        self.websession = async_get_clientsession(hass)
        self._update_interval = update_interval
        self._failure_update_interval = timedelta(seconds=FAILURE_ASYNC_REQUEST_REFRESH)
        self._cc = cc

        super().__init__(
            hass,
            _LOGGER,
            name="YahooSymbolUpdateCoordinator",
            update_method=self._async_update,
            update_interval=update_interval,
        )

    def get_next_update_interval(self) -> timedelta:
        """Get the update interval for the next async_track_point_in_utc_time call."""
        if self.last_update_success:
            return self._update_interval

        _LOGGER.warning(
            "Error obtaining data, retrying in %d seconds.",
            FAILURE_ASYNC_REQUEST_REFRESH,
        )
        return self._failure_update_interval

    @callback
    def _schedule_refresh(self) -> None:
        """Schedule a refresh."""
        if self._unsub_refresh:
            self._unsub_refresh()
            self._unsub_refresh = None

        # We _floor_ utcnow to create a schedule on a rounded second,
        # minimizing the time between the point and the real activation.
        # That way we obtain a constant update frequency,
        # as long as the update process takes less than a second

        update_interval = self.get_next_update_interval()
        if update_interval is not None:
            self._unsub_refresh = async_track_point_in_utc_time(
                self.hass,
                self._handle_refresh_interval,
                utcnow().replace(microsecond=0) + update_interval,
            )

    def get_symbols(self) -> list[str]:
        """Return symbols tracked by the coordinator."""
        return self._symbols

    async def _async_request_refresh_later(self, _now):
        """Request async_request_refresh."""
        await self.async_request_refresh()

    def add_symbol(self, symbol: str) -> bool:
        """Add symbol to the symbol list."""
        if symbol not in self._symbols:
            self._symbols.append(symbol)

            # Request a refresh to get data for the missing symbol.
            # This would have been called while data for sensor was being parsed.
            # async_request_refresh has debouncing built into it, so multiple calls
            # to add_symbol will still resut in single refresh.
            event.async_call_later(
                self.hass,
                DELAY_ASYNC_REQUEST_REFRESH,
                self._async_request_refresh_later,
            )

            _LOGGER.info(
                "Added %s and requested update in %d seconds.",
                symbol,
                DELAY_ASYNC_REQUEST_REFRESH,
            )
            return True

        return False

    async def get_json(self) -> dict:
        """Get the JSON data."""

        url = await self.build_request_url()
        cookies = self._cc.cookies
        _LOGGER.debug("Requesting data from '%s'", url)

        try:
            async with async_timeout.timeout(WEBSESSION_TIMEOUT):
                response = await self.websession.get(
                    url, headers=REQUEST_HEADERS, cookies=cookies
                )

                result_json = await response.json()

                if response.status == HTTPStatus.OK:
                    return result_json

                # Sample errors:
                #   {'finance':{'result': None, 'error': {'code': 'Unauthorized', 'description': 'Invalid Crumb'}}}
                #   {'finance':{'result': None, 'error': {'code': 'Unauthorized', 'description': 'Invalid Cookie'}}}
                finance_error_code_tuple = (
                    YahooSymbolUpdateCoordinator.get_finance_error_code(result_json)
                )

                if finance_error_code_tuple:
                    (
                        finance_error_code,
                        finance_error_description,
                    ) = finance_error_code_tuple

                    _LOGGER.error(
                        "Received status %d (%s %s) for %s",
                        response.status,
                        finance_error_code,
                        finance_error_description,
                        url,
                    )

                    # Reset crumb so that it gets recalculated
                    if finance_error_code == "Unauthorized":
                        self._cc.reset()

                else:
                    _LOGGER.error(
                        "Received status %d for %s, result=%s",
                        response.status,
                        url,
                        result_json,
                    )

        except asyncio.TimeoutError:
            _LOGGER.error("Timed out getting data from %s", url)
        except aiohttp.ClientError:
            _LOGGER.error("Error getting data from %s", url)

        return None

    async def build_request_url(self) -> str:
        """Build the request url."""
        url = BASE + ",".join(self._symbols)

        crumb = self._cc.crumb
        if crumb is None:
            crumb = await self._cc.try_get_crumb_cookies()
        if crumb is not None:
            url = url + "&crumb=" + crumb

        return url

    @staticmethod
    def get_finance_error_code(error_json) -> tuple[str, str] | None:
        """Parse error code from the json."""
        if error_json:
            finance = error_json.get("finance")
            if finance:
                finance_error = finance.get("error")
                if finance_error:
                    return finance_error.get("code"), finance_error.get("description")

        return None

    async def _async_update(self) -> dict:
        """Return updated data if new JSON is valid.

        The exception will get properly handled in the caller (DataUpdateCoordinator.async_refresh)
        which also updates last_update_success. UpdateFailed is raised if JSON is invalid.
        """

        json = await self.get_json()

        if json is None:
            raise UpdateFailed("No data received")

        if "quoteResponse" not in json:
            raise UpdateFailed("Data invalid, 'quoteResponse' not found.")

        quoteResponse = json["quoteResponse"]  # pylint: disable=invalid-name

        if "error" in quoteResponse:
            if quoteResponse["error"] is not None:
                raise UpdateFailed(quoteResponse["error"])

        if "result" not in quoteResponse:
            raise UpdateFailed("Data invalid, no 'result' found")

        result = quoteResponse["result"]
        if result is None:
            raise UpdateFailed("Data invalid, 'result' is None")

        (error_encountered, data) = self.process_json_result(result)

        if error_encountered:
            _LOGGER.info("Data = %s", result)
        else:
            _LOGGER.debug("Data = %s", result)

        _LOGGER.info("Data updated [interval=%s]", self._update_interval)
        return data

    def process_json_result(self, result) -> tuple[bool, dict]:
        """Process json result and return (error status, updated data)."""

        # Using current data if available. If returned data is missing then we might be
        # able to use previous data.
        data = self.data or {}

        symbols = self._symbols.copy()
        error_encountered = False

        for symbol_data in result:
            symbol = symbol_data["symbol"]

            if symbol in symbols:
                symbols.remove(symbol)
            else:
                # Sometimes data for USDEUR=X just contains EUR=X, try to fix such
                # symbols. The source of truth is the symbol in the data since data
                # pieces could be out of order.
                fixed_symbol = self.fix_conversion_symbol(symbol, symbol_data)

                if fixed_symbol in symbols:
                    symbols.remove(fixed_symbol)
                    symbol = fixed_symbol
                else:
                    _LOGGER.warning("Received %s not in symbol list", symbol)
                    error_encountered = True

            data[symbol] = self.parse_symbol_data(symbol_data)

            _LOGGER.debug(
                "Updated %s to %s",
                symbol,
                data[symbol][DATA_REGULAR_MARKET_PRICE],
            )

        if len(symbols) > 0:
            _LOGGER.warning("No data received for %s", symbols)
            error_encountered = True

        return (error_encountered, data)
