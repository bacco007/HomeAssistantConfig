import aiohttp
import logging
_LOGGER = logging.getLogger(__name__)

class WiCan:
    ip = "";
    def __init__(self, ip):
        self.ip = ip;

    async def call(self, endpoint, params = {}, method="get"):
        match method:
            case "get":
                async with aiohttp.ClientSession() as session:
                    async with session.get("http://" + self.ip + endpoint, params=params) as resp:
                        resp.data = await resp.json(content_type=None)
                        return resp

    async def test(self) -> bool:
        result = await self.call("/check_status")
        
        return result.status == 200 and result.data['protocol'] == "auto_pid"

    async def check_status(self):
        try:
            result = await self.call("/check_status")
        except:
            return False

        if(not result.status == 200):
            return False
        
        return result.data

    async def get_pid(self):
        try:
            result = await self.call("/autopid_data")
        except:
            _LOGGER.warning("AUTO PID FAILED")

        return {
            "SOC": {
                "value": 80.5,
                "class": "battery",
                "unit": "%"
            },
            "aux_volts": {
                "value": 12.8,
                "class": "voltage",
                "unit": "V",
            }
        }

        if(not result.status == 200):
            return False
        
        return result.data

