#!/usr/bin/python3

from solcastapi import ConnectionOptions, SolcastApi
from aiohttp import ClientConnectionError, ClientSession
import asyncio
import logging


#logging.basicConfig(level=logging.DEBUG)
_LOGGER = logging.getLogger(__name__)


async def test():
    try:
        
        options = ConnectionOptions(
            "wx1VCTwmhW5Foh4nj6jeKzOtW9aVg9Hk",
            "https://api.solcast.com.au",
            'solcast.json'
        )
        
        async with ClientSession() as session:
            solcast = SolcastApi(session, options, apiCacheEnabled=True)
            await solcast.sites_data()
            await solcast.load_saved_data()
            print("Total today " + str(solcast.get_total_kwh_forecast_today()))
            print("Peak today " + str(solcast.get_peak_w_today()))
            print("Peak time today " + str(solcast.get_peak_w_time_today()))
    except Exception as err:
        _LOGGER.error("async_setup_entry: %s",traceback.format_exc())
        return False


asyncio.run(test())
