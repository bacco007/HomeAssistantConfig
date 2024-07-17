import xml.etree.ElementTree as ET
import re, json
from datetime import datetime, timedelta
import requests

@service
def getdata_tvguide_foxtel():

    def get_child_as_text(parent: ET.Element, tag: str) -> str:
        """Get child node text as string, or None if not found."""
        node = parent.find(tag)
        return node.text if node is not None else None

    URL = 'https://i.mjh.nz/Kayo/epg.xml'
    InclChannels = ["500", "501", "502", "503", "504", "505", "506", "507", "509", "510", "526", "527", "528", "600", "601", "603", "604", "608", "609", "612"]

    r = task.executor(requests.get, URL)
    xml = ET.fromstring(r.content)
    channels = []
    ids = []
    programs = []
    p_d1 = []
    p_d2 = []
    p_d3 = []
    p_d4 = []
    p_d5 = []
    p_d6 = []
    p_d7 = []
    dates = []
    if xml.tag != "tv":
        log.error("Not XMLTV")
    generator_name = xml.attrib.get("generator-info-name")
    generator_url = xml.attrib.get("generator-info-url")
    for child in xml:
        if child.tag == "channel":
            chid = child.attrib.get("id")
            chname = child.find("display-name").text.replace("Northern NSW","").replace("Sydney","").replace("Northern, Tamworth/Taree/Port Macquarie","").replace('NSW','').replace('  ',' ').strip(' ')
            chno = child.find("lcn").text
            chlogo = child.find("icon").get("src")
            chslug = re.sub(r'\W+', '-', chname).strip('-').lower().replace("9","nine-").replace("7","seven-").replace("10","ten-").replace('--','-').strip('-')
            if chno in InclChannels:
                channels.append({
                    "channel_id": chid,
                    "channel_slug": chslug,
                    "channel_name": chname,
                    "channel_number": chno,
                    "chlogo": chlogo,
                    # "programs": {
                    #     "today": [],
                    #     "tomorrow": [],
                    #     "day3": [],
                    #     "day4": [],
                    #     "day5": [],
                    #     "day6": [],
                    #     "day7": [],
                    # }
                })
                ids.append(chid)
                #print(chid, chslug, chname, chno, chlogo)
                #print(ids)
        elif child.tag == "programme":
            start = child.attrib.get("start")
            end = child.attrib.get("stop")
            channel = child.attrib.get("channel")
            try:
                start = datetime.strptime(start, "%Y%m%d%H%M%S %z")
                end = datetime.strptime(end, "%Y%m%d%H%M%S %z")
                d_group = end.strftime("%Y%m%d")
                if d_group not in dates:
                    dates.append(d_group)
            except ValueError:
                print("Error")
            title = get_child_as_text(child, "title")
            description = get_child_as_text(child, "desc")
            episode = get_child_as_text(child, "episode-num")
            category = get_child_as_text(child, "category")
            if channel in ids:
                programs.append({
                    "d_group": d_group,
                    "start": start.strftime("%H:%M"),
                    "end": end.strftime("%H:%M"),
                    "channel": channel,
                    "title": title,
                    "category": category,
                    "episode": episode
                })

    for c in channels:
        chid = c['channel_id']
        p_d1 = []
        p_d2 = []
        p_d3 = []
        p_d4 = []
        p_d5 = []
        p_d6 = []
        p_d7 = []
        pgm = []
        attributes = {}
        for p in programs:
            if p['channel'] == chid:
                if dates.index(p['d_group'])+1 == 1:
                    p_d1.append(p)
                if dates.index(p['d_group'])+1 == 2:
                    p_d2.append(p)
                if dates.index(p['d_group'])+1 == 3:
                    p_d3.append(p)
                if dates.index(p['d_group'])+1 == 4:
                    p_d4.append(p)
                if dates.index(p['d_group'])+1 == 5:
                    p_d5.append(p)
                if dates.index(p['d_group'])+1 == 6:
                    p_d6.append(p)
                if dates.index(p['d_group'])+1 == 7:
                    p_d7.append(p)
        pgm.append({
                "today": p_d1,
                "tomorrow": p_d2,
                "day3": p_d3,
                "day4": p_d4,
                "day5": p_d5,
                "day6": p_d6,
                "day7": p_d7,
            })
        s_name = "sensor.tvguide_foxtel_" + c['channel_slug'].replace('-','_')
        log.error(s_name)
        attributes['slug'] = c['channel_slug']
        attributes['category'] = "tvguide_kayo"
        attributes['channel_name'] = c['channel_name']
        attributes['channel_number'] = c['channel_number']
        attributes["icon"] = "mdi:television"
        attributes["friendly_name"] = "TV Guide - Foxtel - " + c['channel_name']
        attributes['programs'] = pgm
        state.set(s_name, value=c['channel_slug'], new_attributes = attributes)

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
