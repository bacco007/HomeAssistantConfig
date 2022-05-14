#!/usr/bin/env python

import datetime

from influxdb_client import InfluxDBClient


@service
def influxdb2_query_to_entity(
    query=None, entity_id=None, unit_of_measurement=None, friendly_name=None, icon=None
):
    """yaml
    name: InfluxDB2 query to entity
    description: Home Assistant service to send query InfluxDB and place response points into an entity as attributes in the form of key and value pairs.
    fields:
      query:
        name: Query
        description: InfluxDB query. The query should return at least the two fields specified by key_field_name and value_field_name. The field `time` is always returned so typically `query` will only specify one field
        example: SELECT sum("consumption") FROM "electricity" WHERE time >= now() - 30d GROUP BY time(1d) fill(none)
        required: true
        selector:
          text:
      entity_id:
        name: Entity ID
        description: Entity in Home Assistant to create or update
        example: sensor.octopus_electricity_consumption_30days
        required: true
        selector:
          entity:
      unit_of_measurement:
        name: Unit of measurement
        description: If specified, add the entity attribute unit_of_measurement with the value
        example: kWh
        required: false
        selector:
          text:
      friendly_name:
        name: Friendly name
        description: If specified, add the entity attribute friendly_name with the value
        example: Import
        required: false
        selector:
          text:
      icon:
        name: Icon
        description: If specified, add the entity attribute icon with the value
        example: mdi:flash
        required: false
        selector:
          text:"""
    log.debug("Received Parameters: " + str(locals()))

    if query is None:
        log.error('"query" is required but not passed on service call to influxdb_query')
        return

    client = InfluxDBClient(
        url=get_config("url"), token=get_config("token"), org=get_config("org")
    )

    queryparam = client.query_api()

    try:
        response = task.executor(queryparam.query, query)
    except:
        log.error("Exception when processing parameters: " + str(locals()))
        raise

    log.info("query result: " + str(response))

    attributes = {}
    DATA = []

    if unit_of_measurement:
        attributes["unit_of_measurement"] = unit_of_measurement

    if friendly_name:
        attributes["friendly_name"] = friendly_name

    if icon:
        attributes["icon"] = icon

    lastTime = ""
    for table in response:
        for record in table.records:
            attributes[record.get_time().isoformat()] = record.get_value()
            lastPoint = record.get_value()

    if lastPoint:
        state.set(entity_id, value=lastPoint, new_attributes=attributes)

        log.error(entity_id)
        log.error(lastPoint)
        log.error(attributes)


def get_config(name):
    value = pyscript.app_config.get(name)
    if value is None:
        log.error('"' + name + '" is required by not defined in Pyscript config')
    return value


@time_trigger("startup")
def load():
    log.info(f"app has started")
    get_config("url")
    get_config("token")
    get_config("org")
