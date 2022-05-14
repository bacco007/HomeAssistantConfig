import datetime
import string
from datetime import datetime

import appdaemon.plugins.hass.hassapi as hass
from influxdb_client import InfluxDBClient

CONF_ORG = "org"
CONF_TOKEN = "token"
CONF_HOST = "host"
CONF_PORT = "port"
CONF_QUERY = "query"
CONF_NAME = "name"

CONF_ATTRIBUTES = "attributes"
CONF_KEYFIELDNAME = "key_field_name"
CONF_VALUEFIELDNAME = "value_field_name"
CONF_ENTITYSETTINGS = "entity_settings"
CONF_ENTITIES = "entities"
CONF_DAILYFETCHTIME = "daily_fetch_time"

CONF_RANGE_START = "range_start"
CONF_RANGE_STOP = "range_stop"
CONF_BUCKET = "bucket"

CONF_GROUP_FUNCTION = "group_function"
CONF_IMPORTS = "imports"
CONF_OPTIONS = "options"


DEFAULT_RANGE_START = "-15m"
DEFAULT_RANGE_STOP = "now()"

DEFAULT_KEYFIELDNAME = "_time"
DEFAULT_VALUEFIELDNAME = "_value"


class InfluxDB2_to_entity(hass.Hass):
    def initialize(self):
        if not CONF_ORG in self.args:
            self.error(f"{CONF_ORG} must be given to create Influx Connector")
            return
        if not CONF_TOKEN in self.args:
            self.error(f"{CONF_TOKEN} must be given to create Influx Connector")
            return
        if not CONF_HOST in self.args:
            self.error(f"{CONF_HOST} must be given to create Influx Connector")
        if not CONF_BUCKET in self.args:
            self.error(f"{CONF_BUCKET} must be given to create Influx Connector")

        self._org = self.args[CONF_ORG]
        self._token = self.args[CONF_TOKEN]
        self._bucket = self.args[CONF_BUCKET]
        self._url = self.args[CONF_HOST]
        if CONF_PORT in self.args:
            self._url = f"{self._url}:{self.args[CONF_PORT]}"

        platform = "sensor"

        if CONF_ENTITYSETTINGS in self.args:
            if not CONF_ENTITIES in self.args[CONF_ENTITYSETTINGS]:
                self.error(
                    "a list of entities with at least 1 entity must be given to create entities"
                )
                return
            for entityID, entity_settings in self.args[CONF_ENTITYSETTINGS][CONF_ENTITIES].items():
                if (
                    not isinstance(entityID, str)
                    or not isinstance(entity_settings, dict)
                    or not (CONF_QUERY in entity_settings)
                    or not (CONF_DAILYFETCHTIME in entity_settings)
                ):
                    self.error("wrong format settings : {}".format(entity_settings))
                else:
                    entity = self.sanetize(platform, entityID)
                    startTime = self.parse_time(entity_settings[CONF_DAILYFETCHTIME])
                    self.update_influx_entity(entity, entity_settings)
                    self.run_daily(
                        self.run_daily_update_entity, startTime, ent=entity, entset=entity_settings
                    )

        else:
            entity_settings = {}
            if not CONF_NAME in self.args:
                self.error(f"{CONF_NAME} must be given to create entity")
                return
            if not CONF_QUERY in self.args:
                self.error(f"{CONF_QUERY} must be given to create entity")
                return
            if not CONF_DAILYFETCHTIME in self.args:
                self.error(f"{CONF_DAILYFETCHTIME} must be given to create entity")
                return
            entityID = self.args[CONF_NAME]
            entity_settings[CONF_QUERY] = self.args[CONF_QUERY]
            startTime = self.parse_time(self.args[CONF_DAILYFETCHTIME])
            # further attributes
            if CONF_ATTRIBUTES in self.args:
                entity_settings[CONF_ATTRIBUTES] = self.args[CONF_ATTRIBUTES]
            # optional otherwise time, resp. value
            if CONF_KEYFIELDNAME in self.args:
                entity_settings[CONF_KEYFIELDNAME] = self.args[CONF_KEYFIELDNAME]
            if CONF_VALUEFIELDNAME in self.args:
                entity_settings[CONF_VALUEFIELDNAME] = self.args[CONF_VALUEFIELDNAME]
            entity = self.sanetize(platform, entityID)
            self.update_influx_entity(entity, entity_settings)
            self.run_daily(
                self.run_daily_update_entity, startTime, ent=entity, entset=entity_settings
            )

        self.log("build up at {}".format(datetime.now().isoformat()))
        self.log("succeded")

    def run_daily_update_entity(self, kwargs):
        self.update_influx_entity(kwargs["ent"], kwargs["entset"])
        self.log("update entity: {} and settings: {}".format(kwargs["ent"], kwargs["entset"]))

    def sanetize(self, platform, entity_name):
        platform = platform.lower()
        entity_name = entity_name.lower()
        bad_characters = list(string.punctuation)
        bad_characters.extend([" ", "____", "___", "__"])
        for character in bad_characters:
            entity_name = entity_name.replace(character, "_")
        if entity_name[0] == "_":
            entity_name = entity_name[1:]
        if entity_name[-1] == "_":
            entity_name = entity_name[:-1]
        return "{}.{}".format(platform, entity_name)

    def fetch_time_value(self, query, keyFieldName, valFieldName):

        fdict = {}

        try:
            self._influx_client = InfluxDBClient(url=self._url, token=self._token, org=self._org)
            query_api = self._influx_client.query_api()
            result = query_api.query(query=query)
            self.log(query)
            for table in result:
                for record in table.records:
                    if keyFieldName == "_time":
                        _dt = record.values[keyFieldName]
                        fdict[_dt.isoformat()] = record.values[valFieldName]
                    else:
                        fdict[record.values[keyFieldName]] = record.values[valFieldName]
        except:
            self.error("Error occured with query: {}".format(query))
            return {}
        finally:
            self._influx_client.close()
            return fdict

    def update_influx_entity(self, entityID, entity_settings):
        _attributes = {}
        if CONF_ATTRIBUTES in entity_settings:
            _attributes = entity_settings[CONF_ATTRIBUTES]
        else:
            _attributes = {}

        if not CONF_KEYFIELDNAME in entity_settings:
            entity_settings[CONF_KEYFIELDNAME] = DEFAULT_KEYFIELDNAME
        if not CONF_VALUEFIELDNAME in entity_settings:
            entity_settings[CONF_VALUEFIELDNAME] = DEFAULT_VALUEFIELDNAME

        if not CONF_RANGE_START in entity_settings:
            entity_settings[CONF_RANGE_START] = DEFAULT_RANGE_START
        if not CONF_RANGE_STOP in entity_settings:
            entity_settings[CONF_RANGE_STOP] = DEFAULT_RANGE_STOP

        ## requirement check already done
        _query = entity_settings[CONF_QUERY]
        _keyFieldName = entity_settings[CONF_KEYFIELDNAME]
        _valueFieldName = entity_settings[CONF_VALUEFIELDNAME]
        _rangeStart = entity_settings[CONF_RANGE_START]
        _rangeStop = entity_settings[CONF_RANGE_STOP]

        _bucket = self._bucket
        if CONF_IMPORTS not in entity_settings:
            _imports = None
        else:
            _imports = entity_settings[CONF_IMPORTS]

        if CONF_OPTIONS not in entity_settings:
            _options = None
        else:
            _options = entity_settings[CONF_OPTIONS]

        if CONF_GROUP_FUNCTION not in entity_settings:
            _group = None
        else:
            _group = entity_settings[CONF_GROUP_FUNCTION]

        _query = self.build_influx2_query(
            _bucket, _rangeStart, _rangeStop, _query, _imports, _options, _group
        )

        _attributes = _attributes | self.fetch_time_value(_query, _keyFieldName, _valueFieldName)

        if not self.entity_exists(entityID):
            self.set_state(entityID, state="", attributes=_attributes)
            self.log(f"Created {entityID} in HASS")
        else:
            entity_state = self.get_state(entityID)
            self.set_state(entityID, state=entity_state, attributes=_attributes)
            self.log(f"{entityID} was already created in HASS, just set attributes")
        return

    def build_influx2_query(self, bucket, range_start, range_stop, query, imports, options, group):
        query_prefix = (
            f'from(bucket:"{bucket}") |> range(start: {range_start}, stop: {range_stop}) |>'
        )
        if options is not None:
            for i in options:
                query_prefix = f"option {i} {query_prefix}"

        if imports is not None:
            for i in imports:
                query_prefix = f'import "{i}" {query_prefix}'

        query_postfix = ""
        if group is not None:
            query_postfix = f'|> {group}(column: "{DEFAULT_VALUEFIELDNAME}")'

        return f"{query_prefix} {query} {query_postfix}"
