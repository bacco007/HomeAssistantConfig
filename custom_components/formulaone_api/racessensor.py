
from custom_components.formulaone_api.formulaonesensor import FormulaOneSensor
from custom_components.formulaone_api.f1 import F1
from datetime import datetime as dt

class RacesSensor(FormulaOneSensor):
    """Representation of a Formula One sensor."""

    def __init__(self, name, scan_interval, hass):
        """Initialize Formula One sensor."""
        FormulaOneSensor.__init__(self, name + " Races", scan_interval, hass)

    def get_race_data(self):
        """Get the latest data from the http://ergast.com/ via a custom formulaonepy."""
        # Get race info
        f1 = F1()

        now = dt.now()
        races = f1.season_schedule(season=now.year).json
        next_race = None

        found = False
        for race in races['MRData']['RaceTable']['Races']:
            if (not found): 
                #print(race)
                #r = json.loads(race)
                if (race['date'] == now.strftime('%Y-%m-%d')):
                    next_race = race
                    found = True
                elif (dt.strptime(race['date'], '%Y-%m-%d') > dt.today()):
                    next_race = race
                    found = True

        # # Merge all attributes to a single dict.
        all_attr = {
            'last_update': now,
            'next_race': next_race,
            'data': races['MRData']['RaceTable']['Races']
        }
        return all_attr

    def set_state(self):
        """Set sensor state to race state and set polling interval."""
        all_attr = self.get_race_data()

        # Set sensor state attributes.
        if all_attr['next_race'] == None:
            self._state = 'None'
        elif all_attr['next_race']['date'] == dt.today().strftime('%Y-%m-%d'):
            self._state = 'Race Day'
        else:
            self._state = 'Scheduled'

        self._state_attributes = all_attr
        return self._state
