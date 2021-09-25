"""Data models for the Solcast Solar API."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, date, timezone
from isodate import parse_datetime, parse_duration
from typing import Any
from operator import itemgetter


@dataclass
class Estimate:
    """Object holding estimate forecast results from Solcast Solar.

    Attributes:
        wh_hours: Estimated solar energy production per hour.
    """

    wh_days: dict[datetime, float]
    wh_hours: dict[datetime, float]

        
    @property
    def energy_production_today(self) -> int:
        """Return estimated energy produced today."""
        return self.day_production(self.now().date())

    @property
    def energy_production_tomorrow(self) -> int:
        """Return estimated energy produced today."""
        return self.day_production(self.now().date() + timedelta(days=1))


    def day_production(self, specific_date: date) -> int:
        """Return the day production."""
        for timestamp, production in self.wh_days.items():
            if timestamp.date() == specific_date:
                return production

        return 0

    def now(self) -> datetime:
        """Return the current timestamp in the API timezone."""
        return datetime.now()
    
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Estimate:
        """Return a Estimate object from a Solcast Solar API response.

        Converts a dictionary, obtained from the Solcast Solar API into
        a Estimate object.

        Args:
            data: The estimate response from the Solcast Solar API.

        Returns:
            An Estimate object.
        """

        forecasts = []
        for forecast in data.get("forecasts"):
            # Convert period_end and period. All other fields should already be the correct type
            forecast["period_end"] = parse_datetime(forecast["period_end"]).replace(tzinfo=timezone.utc).astimezone(tz=None)
            forecast["period"] = parse_duration(forecast["period"])
            forecast["period_start"] = forecast["period_end"] - forecast["period"]
            forecasts.append(forecast)
        
        #sort the list by date
        f = itemgetter('period_start')
        forecasts.sort(key=f)

        #remove odd hour elements from first and last because it messes up the KWh values
        if forecasts[0]['period_start'].minute == 30:
            del forecasts[0]
        if forecasts[-1]['period_start'].minute == 0:
            del forecasts[-1]

        wh_days = {}
        for item in forecasts:
            timestamp = item['period_end']
            energy = float(item["pv_estimate"]) * 0.5 * 1000
            d = datetime(timestamp.year, timestamp.month, timestamp.day)
            if d in wh_days:
                wh_days[d] += round(energy, 2)
            else:
                wh_days[d] = round(energy, 2)

        wh_hours = {}
        for item in forecasts:
            timestamp = item['period_end']
            energy = float(item["pv_estimate"]) * 0.5 * 1000
            d = datetime(timestamp.year, timestamp.month, timestamp.day, timestamp.hour , 0, 0)
            if d in wh_hours:
                wh_hours[d] += round(energy, 2)
            else:
                wh_hours[d] = round(energy,2 )

        return cls(
            wh_hours=wh_hours,
            wh_days=wh_days,
        )

