import asyncio
from aiohttp import ClientSession
from aio_geojson_nsw_transport_incidents import NswTransportServiceIncidentsFeed
async def main() -> None:
    async with ClientSession() as websession:    
        # Home Coordinates: Latitude: -33.0, Longitude: 150.0
        # Filter radius: 50 km
        # Filter categories: 'Scheduled roadwork'
        # Hazard type : 'roadworks-open'
        feed = NswTransportServiceIncidentsFeed(websession, 
                                                (-33.0, 150.0), 
                                                filter_radius=50)
        status, entries = await feed.update()
        print(status)
        print(entries)
asyncio.get_event_loop().run_until_complete(main())
