#!/usr/bin/env python

@service
def getdata_testing(
):

    entity_id = "sensor.zztesting1"
    value = "test"
    attributes = {}
    attributes["unit_of_measurement"] = "Incidents"
    attributes["friendly_name"] = "Testing"
    state.set(entity_id)


def get_config(name):
    value = pyscript.app_config.get(name)

    if value is None:
        log.error(
            '"'
            + name
            + '" is required parameter but not defined in Pyscript configuration for application'
        )
    return value


@time_trigger("startup")
def load():
    log.info(f"app has started")
