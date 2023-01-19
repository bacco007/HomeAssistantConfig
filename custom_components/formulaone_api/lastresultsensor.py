
from custom_components.formulaone_api.formulaonesensor import FormulaOneSensor
from custom_components.formulaone_api.f1 import F1
from datetime import datetime as dt

class LastResultSensor(FormulaOneSensor):
    """Representation of a Formula One sensor."""

    def __init__(self, name, scan_interval, hass):
        """Initialize Formula One sensor."""
        FormulaOneSensor.__init__(self, name + " Last Result", scan_interval, hass)

    def get_race_data(self):
        """Get the latest data from the http://ergast.com/ via a custom formulaonepy."""
        # Get race info
        f1 = F1()
        now = dt.now()
        races = f1.last_result().json
        # # Merge all attributes to a single dict.
        all_attr = {
            'last_update': now,
            'data': races['MRData']['RaceTable']['Races'][0]
        }
        return all_attr

    def set_state(self):
        """Set sensor state to race state and set polling interval."""
        all_attr = self.get_race_data()
        self._state = 'Scheduled'
        self._state_attributes = all_attr
        return self._state