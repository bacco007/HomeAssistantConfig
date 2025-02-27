"""Communicate with WiCAN device HTTP-API via available endpoints."""

import logging

import aiohttp

_LOGGER = logging.getLogger(__name__)


class WiCan:
    """WiCan device connection via API endpoints.

    Attributes
    ----------
    ip : Any
        IP-Address or hostname / mDNS name of the WiCAN device.

    """

    ip = ""

    def __init__(self, ip) -> None:
        """Initialize the WiCan API integration with the device IP / name."""
        self.ip = ip

    async def call(self, endpoint, params=None, method="get"):
        """Call WiCan device HTTP-API endpoint and provide response.

        Parameters
        ----------
        endpoint : Any
            Path / endpoint to be called on the WiCAN device API.
        params : Any
            Parameters to be passed to call the device endpoint.
        method : str
            HTTP method (e.g. GET, POST, PUT) to be used when calling the endpoint. Default: GET

        Returns
        -------
        ClientResponse
            Response of the WiCan API for the given endpoint.

        """
        if params is None:
            params = {}
        match method:
            case "get":
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        "http://" + self.ip + endpoint, params=params
                    ) as resp:
                        resp.data = await resp.json(content_type=None)
                        return resp

    async def test(self) -> bool:
        """Test, if the WiCan device API is reachable and the protocal is set to "auto_pid".

        Returns
        -------
        bool
            Returns True, if the API is reachable and the WiCan protocol is set to "auto_pid". Otherwise returns False.

        """
        result = await self.call("/check_status")

        return result.status == 200 and result.data["protocol"] == "auto_pid"

    async def check_status(self):
        """Check, if the WiCan device API is reachable.

        Returns
        -------
        bool
            Returns True, if the WiCan device API can be called. Otherwise returns False.

        """
        try:
            result = await self.call("/check_status")
        except:
            return False

        if result.status != 200:
            return False

        return result.data

    async def get_pid(self):
        """Call the WiCan API to receive the car configuration metadata (e.g. class and unit of each parameter) and the current values (e.g. SOC_BMS: 38%).

        Returns
        dict | bool
            If data can be retrieved from the API: Dictionary of car configuration metadata combined with current data.
            Otherwise returns False.

        """
        try:
            pid_data = await self.call("/autopid_data")
            pid_meta = await self.call("/load_car_config")
        except:
            return False

        if not isinstance(pid_meta.data, dict):
            return False

        result = {}
        for key in pid_meta.data:
            result[key] = pid_meta.data[key]
            value = pid_data.data[key] if key in pid_data.data else False
            result[key]["value"] = value

        return result
