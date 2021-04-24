#!/usr/bin/env python

import datetime

from influxdb import InfluxDBClient


# Home Assistant service to send query InfluxDB and place response points into a sensor
# as attributes in the form of 'name: value' pairs. 
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=service#service-service-name
@service
def influxdb_query_to_sensor(database='', query='', key_field_name='time', value_field_name='sum', sensor='', unit_of_measurement='', friendly_name='', icon=''):

    log.debug('received parameters: ' + str(locals()))

    if database is None:
        log.error('"database" is required but not passed on service call to influxdb_query')
        return

    if query is None:
        log.error('"query" is required but not passed on service call to influxdb_query')
        return

    if sensor is None:
        log.error('"sensor" is required but not passed on service call to influxdb_query')
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
    response = task.executor(influxdbclient.query, query)
    log.debug('query result: ' + str(response))

    # Get the points from the query
    points = response.get_points()

    # Set the sensor value to the current timestamp and remove existing attributes
    state.set(sensor, value=datetime.datetime.now(datetime.timezone.utc).isoformat(), new_attributes={})

    # Set the sensor attributes if they were passed on service call
    if unit_of_measurement:
        state.setattr(sensor+'.unit_of_measurement', unit_of_measurement)

    if friendly_name:    
        state.setattr(sensor+'.friendly_name', friendly_name)

    if icon:    
        state.setattr(sensor+'.icon', icon)

    # Add each InfluxDB query result point as a sensor attribute
    for point in points:
        log.debug('adding point: ' + str(point))
        state.setattr(sensor+'.'+point[key_field_name], point[value_field_name])


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
