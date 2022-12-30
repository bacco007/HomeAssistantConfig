import asyncio
from aiohttp import ClientSession
from aio_geojson_query import GeoJsonQueryFeed


async def main() -> None:
    async with ClientSession() as websession:
        # NSW Incidents Feed
        # Home Coordinates: Latitude: -33.0, Longitude: 150.0
        # Filter radius: 50 km
        # Filter categories: 'Advice'
        feed = GeoJsonQueryFeed(websession,
                                "http://data.livetraffic.com/traffic/hazards/majorevent.json",
                                (-33.0, 150.0),
                                filter_radius=500,
                                filter_criteria=[
                                    ['ended', '==', 'false']
                                    ],
                                mappings={
                                    "dateformat": "milliseconds",
                                    "date": "lastUpdated",
                                    "title": "displayName"
                                })
        status, entries = await feed.update()
        print(status)
        for entry in entries:
            print("%s [%s]: @%s" % (entry.title))

asyncio.get_event_loop().run_until_complete(main())

