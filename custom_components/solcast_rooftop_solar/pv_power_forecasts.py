"""Asynchronous Python client for the Solcast Solar API."""
from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from aiohttp import ClientSession
from yarl import URL

from .estimate import Estimate

@dataclass
class PvPowerForecasts:

    api_key : str
    rooftop : str
    format: str | None = 'json'
    close_session: bool = False
    session: ClientSession | None = None
    end_point: str | None = ''
    savedata: dict | None = None

    async def _request(self, params: Mapping[str, str] | None = None,) -> dict[str, Any]:

        # Connect as normal
        url = URL.build(scheme="https", host="api.solcast.com.au")

        url = url.join(URL(self.end_point))

        if self.session is None:
            self.session = ClientSession()
            self.close_session = True

        response = await self.session.request(
            "GET",
            url,
            params=params,
            headers={"Host": "api.solcast.com.au"},
            ssl=False,
        )   
        
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "")
        if "application/json" not in content_type:
            text = await response.text()
            raise Exception(
                "Unexpected response from the Solcast Solar API",
                {"Content-Type": content_type, "response": text},
            )

        return await response.json()

    async def estimate(self) -> Estimate:

        self.end_point = 'rooftop_sites/' + self.rooftop + '/forecasts' 
        data1 = await self._request(
            params={"hours": 168, "format": "json", "api_key":self.api_key},
        )

        #self.end_point = 'rooftop_sites/' + self.rooftop + '/estimated_actuals'
        #data2 = await self._request(
        #    params={"hours": 168, "format": "json", "api_key":self.api_key},
        #)

        z = dict()
        if "response_status" in data1: #or "response_status" in data2:
            z = self.savedata
        else:
            #z = dict({"forecasts": (data1.get("forecasts") + data2.get("estimated_actuals"))})
            z = data1
            self.savedata = z

        return Estimate.from_dict(z)

    async def close(self) -> None:
        """Close open client session."""
        if self.session and self.close_session:
            await self.session.close()

    async def __aenter__(self) -> PvPowerForecasts:
        """Async enter.

        Returns:
            The SolcastSolar object.
        """
        return self

    async def __aexit__(self, *_exc_info) -> None:
        """Async exit.

        Args:
            _exc_info: Exec type.
        """
        await self.close()
