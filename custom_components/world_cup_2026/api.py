"""World Cup 2026 API client."""

from __future__ import annotations

import asyncio
import json
import os

import aiohttp

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")

BASE_URL = "https://api.football-data.org/v4"


class WorldCupAPI:
    def __init__(self, api_key: str, demo_mode: bool = False) -> None:
        """
        Args:
            api_key: football-data.org API key. Ignored when demo_mode=True.
            demo_mode: When True, all methods return data from tests/fixtures/*.json
                       instead of making HTTP calls. Toggle via HA Settings UI.
        """
        self.api_key = api_key
        self.demo_mode = demo_mode

    def _load_fixture(self, filename: str) -> dict:
        """Load a JSON fixture file from tests/fixtures/. Raises FileNotFoundError if missing."""
        path = os.path.join(FIXTURES_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    async def _get(self, url: str) -> dict:
        """Shared GET helper with auth header and HTTP error raising."""
        headers = {"X-Auth-Token": self.api_key}
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                response.raise_for_status()
                return await response.json()

    async def get_matches(self) -> dict:
        """Return all World Cup matches."""
        if self.demo_mode:
            return await asyncio.to_thread(self._load_fixture, "matches.json")
        return await self._get(f"{BASE_URL}/competitions/WC/matches")

    async def get_standings(self) -> dict:
        """Return group stage standings."""
        if self.demo_mode:
            return await asyncio.to_thread(self._load_fixture, "standings.json")
        return await self._get(f"{BASE_URL}/competitions/WC/standings")

    async def get_scorers(self) -> dict:
        """
        Return top scorers for the World Cup (limit=100 to capture all, not just top 10).

        Returns {"scorers": []} on 404 — the endpoint returns 404 before any matches
        are played, so this is an expected pre-tournament state, not an error.
        """
        if self.demo_mode:
            return await asyncio.to_thread(self._load_fixture, "scorers.json")
        try:
            return await self._get(f"{BASE_URL}/competitions/WC/scorers?limit=100")
        except aiohttp.ClientResponseError as err:
            if err.status == 404:
                return {"scorers": []}
            raise
