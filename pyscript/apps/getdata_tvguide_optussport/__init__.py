import xml.etree.ElementTree as ET
import re, json
from datetime import datetime, timedelta
import requests
import os
from dateutil import tz

@pyscript_executor
def read_file(file_name):
    try:
        with open(file_name, encoding="utf-8") as file_desc:
            return file_desc.read(), None
    except Exception as exc:
        return None, exc

@service
def getdata_tvguide_optussport():

    def get_child_as_text(parent: ET.Element, tag: str) -> str:
        """Get child node text as string, or None if not found."""
        node = parent.find(tag)
        return node.text if node is not None else None

    r, exception = read_file("/config/xmltv/optus_sport.xml")
    if exception:
        raise exception
    xml = ET.fromstring(r)

    from_zone = tz.gettz('UTC')
    to_zone = tz.gettz('Australia/Sydney')
    channels = []
    ids = []
    programs = []
    p_n24 = []
    p_d1 = []
    p_d2 = []
    p_d3 = []
    p_d4 = []
    p_d5 = []
    p_d6 = []
    p_d7 = []
    pgm = []
    attributes = {}
    dates = []
    now = datetime.now()
    time = now + timedelta(hours=-6)
    time24 = now + timedelta(days=1)

    if xml.tag != "tv":
        log.error("Not XMLTV")

    for child in xml:
        if child.tag == "channel":
            chid = child.attrib.get("id")
            chname = child.find("display-name").text
            # chno = child.find("lcn").text
            chlogo = child.find("icon").get("src")
            chslug = re.sub(r'\W+', '-', chname).strip('-').lower()
            channels.append({
                "channel_id": chid,
                "channel_slug": chslug,
                "channel_name": chname,
                "chlogo": chlogo,
            })
            ids.append(chid)

        elif child.tag == "programme":
            start = child.attrib.get("start")
            end = child.attrib.get("stop")
            channel = child.attrib.get("channel")
            try:
                start = datetime.strptime(start, "%Y%m%d%H%M%S %z")
                start = start.astimezone(to_zone)
                end = datetime.strptime(end, "%Y%m%d%H%M%S %z")
                end = end.astimezone(to_zone)
                d_group = start.strftime("%Y%m%d")
                d_length = end - start
                if d_group not in dates:
                    dates.append(d_group)
                d_group = end.strftime("%Y%m%d")
                if d_group not in dates:
                    dates.append(d_group)
            except ValueError:
                print("Error")
            title = get_child_as_text(child, "title")
            description = get_child_as_text(child, "desc")
            subtitle = get_child_as_text(child, "sub-title")
            episode = get_child_as_text(child, "episode-num")
            if (category := child.find('category')) is not None:
                c = child.findall("category")
                category = ""
                for a in c:
                    category = ", ".join(filter(None, (category, a.text)))
            else:
                category = None
            country = get_child_as_text(child, "country")
            if (rating := child.find('rating')) is not None:
                rating = child.find("rating").find("value").text
            else:
                rating = None
            details = ' - '.join(filter(None, (episode, rating, country, category)))
            if time < start.replace(tzinfo=None) < time24:
                p_n24.append({
                    "start": start.isoformat(),
                    "end": end.isoformat(),
                    "length": str(d_length),
                    "channel": channel,
                    "title": title,
                    "subtitle": subtitle,
                    "description": description,
                    "details": details,
                    "episode": episode
                })
            programs.append({
                "d_group": d_group,
                "start": start.isoformat(),
                "end": end.isoformat(),
                "length": str(d_length),
                "channel": channel,
                "title": title,
                "subtitle": subtitle,
                "description": description,
                "details": details,
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
        pr_n24 = []
        attributes = {}
        for p in p_n24:
            if p['channel'] == chid:
                    pr_n24.append(p)
        for p in programs:
            if p['channel'] == chid:
                if dates.index(p['d_group'])+1 == 1:
                    p.pop('d_group')
                    p_d1.append(p)
                elif dates.index(p['d_group'])+1 == 2:
                    p.pop('d_group')
                    p_d2.append(p)
                elif dates.index(p['d_group'])+1 == 3:
                    p.pop('d_group')
                    p_d3.append(p)
                elif dates.index(p['d_group'])+1 == 4:
                    p.pop('d_group')
                    p_d4.append(p)
                elif dates.index(p['d_group'])+1 == 5:
                    p.pop('d_group')
                    p_d5.append(p)
                elif dates.index(p['d_group'])+1 == 6:
                    p.pop('d_group')
                    p_d6.append(p)
                elif dates.index(p['d_group'])+1 == 7:
                    p.pop('d_group')
                    p_d7.append(p)

        s_name = "sensor.tvguide_optussport_" + c['channel_slug'].replace('-','_')
        # log.error(s_name)
        attributes['slug'] = c['channel_slug']
        attributes['channel_group'] = 'Optus Sport'
        attributes['channel_name'] = c['channel_name']
        # attributes['channel_number'] = c['channel_number']
        attributes["icon"] = "mdi:television-guide"
        attributes["entity_picture"] = "/local/tvlogos/optus-sport.png"
        attributes["friendly_name"] = "TV Guide - Optus Sport - " + c['channel_name']
        attributes['programs_next24hrs'] = pr_n24
        attributes['programs_today'] = p_d1
        attributes['programs_tomorrow'] = p_d2
        attributes['programs_day3'] = p_d3
        attributes['programs_day4'] = p_d4
        attributes['programs_day5'] = p_d5
        attributes['programs_day6'] = p_d6
        attributes['programs_day7'] = p_d7
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
