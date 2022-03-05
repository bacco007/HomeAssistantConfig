#!/usr/bin/env python

from influxdb import InfluxDBClient
import datetime

# Home Assistant service to send query InfluxDB and place response points into an entity
# as attributes in the form of 'key: value' pairs. 
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=service#service-service-name
# 
# https://www.home-assistant.io/docs/blueprint/selectors/
@service
def influxdb_query_to_entity(database=None, query=None, key_field_name='time', value_field_name='sum', entity_id=None, unit_of_measurement=None, friendly_name=None, icon=None):
    """yaml
name: InfluxDB query to entity
description: Home Assistant service to send query InfluxDB and place response points into an entity as attributes in the form of key and value pairs.
fields:
  database:
    name: Database
    description: InfluxDB database name
    example: octopus
    required: true
    selector:
      text:
  query:
    name: Query
    description: InfluxDB query. The query should return at least the two fields specified by key_field_name and value_field_name. The field `time` is always returned so typically `query` will only specify one field
    example: SELECT sum("consumption") FROM "electricity" WHERE time >= now() - 30d GROUP BY time(1d) fill(none)
    required: true
    selector:
      text:
  key_field_name:
    name: Key field name
    description: Name of the field returned by the query that will be used as the attribute key
    example: time
    default: time
    required: false
    selector:
      text:
  value_field_name:
    name: Value field name
    description: Name of the field returned by the query that will be used as the attribute value
    example: sum
    default: sum
    required: false
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
      text:
"""
    log.debug('received parameters: ' + str(locals()))

    if database is None:
        log.error('"database" is required but not passed on service call to influxdb_query')
        return

    if query is None:
        log.error('"query" is required but not passed on service call to influxdb_query')
        return

    if entity_id is None:
        log.error('"entity_id" is required but not passed on service call to influxdb_query')
        return

    # Connect to InfluxDB
    # https://influxdb-python.readthedocs.io/en/latest/api-documentation.html
    influxdbclient = InfluxDBClient(
        host=get_config('host'),
        port=get_config('port'),
        username=get_config('username'),
        password=get_config('password'),
        database=database
    )

    # Call InfluxDB to execute query
    # Use Pyscript task.executor to avoid I/O blocking
    # https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=task.executor#task-executor
    try:
        response = task.executor(influxdbclient.query, query)
    except:
        log.error('exception when processing parameters: ' + str(locals()))
        raise

    log.info('query result: ' + str(response))

    # Get the points from the query
    points = response.get_points()

    attributes = {}

    # Set the entity_id attributes if they were passed on service call
    if unit_of_measurement:
        attributes['unit_of_measurement'] = unit_of_measurement

    if friendly_name:    
        attributes['friendly_name'] = friendly_name

    if icon:    
        attributes['icon'] = icon

    # Add each InfluxDB query result point as an entity_id attribute
    lastTime = ''
    for point in points:
        attributes[point[key_field_name]] = point[value_field_name]
        lastPoint = point['time']

    # Only create entity if the query returns at least 1 result
    if lastPoint:
        # Set the entity_id value to the last query value and attributes to the query points
        state.set(entity_id, value=lastPoint, new_attributes=attributes)


# Get configuration from Pyscript
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=load#configuration
def get_config(name):
    value = pyscript.app_config.get(name)

    if value is None:
        log.error('"' + name + '" is required parameter but not defined in Pyscript configuration for application')

    return value


# Pyscript startup and app reload
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=load#time-trigger
@time_trigger('startup')
def load():
    log.info(f'app has started')

    # Check required configuration
    get_config('host')
    get_config('port')
    get_config('username')
    get_config('password')