from custom_components.formulaone_api.formulaonesensor import FormulaOneSensor
from custom_components.formulaone_api.f1 import F1
from datetime import datetime as dt

class ConstructorsSensor(FormulaOneSensor):
    """Representation of a Formula One sensor."""

    def __init__(self, name, scan_interval, hass):
        """Initialize Formula One sensor."""
        FormulaOneSensor.__init__(self, name + " Constructors", scan_interval, hass)

    def get_race_data(self):
        """Get the latest data from the http://ergast.com/ via a custom formulaonepy."""
        # Get race info
        f1 = F1()
        now = dt.now()
        constructors = f1.constructor_standings(season=now.year).json
        if constructors['MRData']['total'] == "0":
            data = []
        else:
            data = constructors['MRData']['StandingsTable']['StandingsLists'][0]['ConstructorStandings']
        # # Merge all attributes to a single dict.
        all_attr = {
            'last_update': now,
            'data': data
        }
        return all_attr

    def set_state(self):
        """Set sensor state to race state and set polling interval."""
        all_attr = self.get_race_data()
        self._state = 'Scheduled'
        self._state_attributes = all_attr
        return self._state