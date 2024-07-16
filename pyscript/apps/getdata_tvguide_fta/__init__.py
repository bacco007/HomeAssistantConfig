import json, requests, pytz, calendar, re
from datetime import timedelta, datetime
from requests.exceptions import HTTPError
from functools import reduce

@service
def getdata_tvguide_fta():

    URL = 'https://www.yourtv.com.au/api/guide/?day=today&timezone=Australia%2FSydney&format=json&region=69'
    DATA = []
    ExclChannels = ['nbn', 'nbn-extra', 'abc-tv', 'sbs', 'win-gold', 'seven', 'nitv', 'you-tv', 'ten']

    r = task.executor(requests.get, URL)
    rd = r.json()
    if rd != []:
        for l in rd[0]['channels']:
            if 'category' in l:
                attributes = {}
                channel_name = l['name']
                channel_slug = re.sub(r'\W+', '_', channel_name).strip('-').lower().replace("9","nine_").replace("7","seven_").replace("10","ten_").replace('__','_').strip('_')
                channel_number = l['number']
                programs = []
                for t in l['blocks']:
                    programs.append({
                        "time": t['shows'][0]['date'],
                        "program": t['shows'][0]['title'],
                    })
                output = []
                output.append({
                    "channel_name": channel_name,
                    "channel_number": channel_number,
                    "channel_slug": channel_slug,
                    "programs": programs,
                })
                # DATA.append(channel_slug: {
                #     "channel_name": channel_name,
                #     "channel_number": channel_number,
                #     "channel_slug": channel_slug,
                #     "programs": programs,
                # })
                if channel_slug not in ExclChannels:
                    s_name = "sensor.tvguide_fta_" + channel_slug
                    attributes['slug'] = channel_slug
                    attributes['programs'] = programs
                    attributes['category'] = "tvguide_fta"
                    attributes['channel_name'] = channel_name
                    attributes['channel_number'] = channel_number
                    attributes["icon"] = "mdi:television"
                    #attributes["unit_of_measurement"] = "beers"
                    attributes["friendly_name"] = "TV Guide - FTA - " + channel_name
                    state.set(s_name, value=channel_slug, new_attributes = attributes)

def get_config(name):
    value = pyscript.app_config.get(name)

    if value is None:
        log.error(
            '"'
            + name
            + '" is required parameter but not defined in Pyscript configuration for application'
        )

    return value


# Pyscript startup and app reload
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=load#time-trigger
@time_trigger("startup")
def load():
    log.info(f"app has started")

    # Check required configuration
