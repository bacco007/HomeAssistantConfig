"""Data models for the Solcast Solar API."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any

from isodate import parse_datetime, parse_duration


@dataclass
class Estimate:
    """Object holding estimate forecast results from Solcast Solar.

    Attributes:
        wh_hours: Estimated solar energy production per hour.
    """

    wh_days: dict[datetime, float]
    wh_hours: dict[datetime, float]
    api_counter: int | None = 0

    @property
    def api_hit_counter(self) -> int:
        """Return api hit counter for the day"""
        return self.api_counter

        
    @property
    def energy_production_today(self) -> int:
        """Return estimated energy produced today."""
        return self.day_production(datetime.now().date())

    @property
    def energy_production_tomorrow(self) -> int:
        """Return estimated energy produced today."""
        return self.day_production(datetime.now().date() + timedelta(days=1))


    def day_production(self, specific_date: date) -> int:
        """Return the day production."""
        for timestamp, production in self.wh_days.items():
            if timestamp.date() == specific_date:
                return production

        return 0

    def sum_energy_production(self, period_hours: int) -> int:
        """Return the sum of the energy production."""
        now = datetime.now().replace(tzinfo=timezone.utc).astimezone(tz=None) + timedelta(hours=period_hours)

        total = 0

        for timestamp, wh in self.wh_hours.items():
            timestamp = timestamp.replace(tzinfo=timezone.utc).astimezone(tz=None)
            if (timestamp.day == now.day) and (timestamp.hour == now.hour):
                total += wh

        return total

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Estimate:

        wh_days = {}
        for item in data["forecasts"]:
            timestamp = item['period_end']
            energy = float(item["pv_estimate"]) * 0.5
            d = datetime(timestamp.year, timestamp.month, timestamp.day)
            if d in wh_days:
                wh_days[d] += round(energy, 3)
            else:
                wh_days[d] = round(energy, 3)

        wh_hours = {}
        for item in data["forecasts"]:
            timestamp = item['period_end']
            energy = float(item["pv_estimate"]) * 0.5
            d = datetime(timestamp.year, timestamp.month, timestamp.day, timestamp.hour , 0, 0)
            if d in wh_hours:
                wh_hours[d] += round(energy, 3)
            else:
                wh_hours[d] = round(energy, 3)

        return cls(
            wh_hours=wh_hours,
            wh_days=wh_days,
            api_counter=data["api_count"],
        )

