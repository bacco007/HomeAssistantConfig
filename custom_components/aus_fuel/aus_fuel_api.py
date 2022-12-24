from xmlrpc.client import boolean
import requests
import json

from .const import QUERY_URL


class AusFuelPrice:
    name: str
    address: str
    latitude: float
    longitude: float
    brand: str
    price: float
    fuel_type: str
    station_id: str

    def __str__(self):
        return f"{self.name} {self.address} {self.brand} {self.fuel_type} @ {self.price}c/L"


class AusFuelAPI:
    def __init__(self, search_distance, latitude, longitude):
        self._search_meters = search_distance * 1000
        self._latitude = latitude
        self._longitude = longitude

    def refresh_data(self) -> boolean:
        query = QUERY_URL.format(
            lat=self._latitude, long=self._longitude, dist=self._search_meters
        )
        raw_html = requests.get(query, verify=False).text
        json_data = json.loads(raw_html)
        self._fuel_prices = json_data
        return json_data["message"] == "ok"

    def get_stations_fuel_types(self) -> list:
        stations = []
        fuel_types = []
        for entry in self._fuel_prices["stations"]:
            # Look for a station entry
            # if not "stations" in entry:
            #     continue

            station = entry
            stations.append(
                {
                    "id": station["name"].replace(" ", "_"),
                    "name": station["name"],
                    "address": station["address"],
                    "latitude": station["location"]["latitude"],
                    "longitude": station["location"]["longitude"],
                    "brand": station["brand"],
                }
            )
            for price_entry in station["prices"]:
                if not price_entry["type"] in fuel_types:
                    fuel_types.append(price_entry["type"])

        return {"stations": stations, "fuel_types": fuel_types}

    def get_data(self) -> dict:
        prices = {}
        for entry in self._fuel_prices["stations"]:
            # Look for a station entry
            # if not "station" in entry:
            #     continue

            station = entry
            name = station["name"]
            address = station["address"]
            latitude = station["location"]["latitude"]
            longitude = station["location"]["longitude"]
            brand = station["brand"]
            for price_entry in station["prices"]:
                price = AusFuelPrice()
                price.name = name
                price.address = address
                price.latitude = latitude
                price.longitude = longitude
                price.brand = brand
                price.price = float(price_entry["price"])
                price.fuel_type = price_entry["type"]
                price.station_id = name.replace(" ", "_")

                n = price.name.replace(" ", "_")
                f = price.fuel_type.replace(" ", "_")
                price_id = f"{n}_{f}"
                prices[price_id] = price

        data = {"prices": prices}

        return data
