from xml.etree import ElementTree
import os
import hashlib
from urllib.parse import urlparse
import aiohttp
import aiofiles
import re
import math
from datetime import datetime, timedelta
from homeassistant.core import HomeAssistant
from homeassistant.components.http.auth import async_sign_path

from .const import TIMEOUT_MINUTES

import logging
_LOGGER = logging.getLogger(__name__)

def parse_library(root):
    output = []
    for medium in root.findall("Video"):
        output.append(medium.attrib)

    if len(output) == 0:
        for medium in root.findall("Directory"):
            output.append(medium.attrib)

    if len(output) == 0:
        for medium in root.findall("Photo"):
            output.append(medium.attrib)

    return output

def extract_metadata_and_type(path):
    if not path: return None
    pattern = re.compile(r"/library/metadata/(\d+)/(thumb|art)/(\d+)")
    match = pattern.search(path)
    
    if match:
        metadata_id = match.group(1)
        art_type = match.group(2)
        art_id = match.group(3)
        return metadata_id, art_type, art_id

def parse_data(hass: HomeAssistant, data, max, base_url, token, identifier, section_key, images_base_url, is_all = False):
    if is_all:
        sorted_data = []
        for k in data.keys():
            type_sorted = sorted(data[k], key=lambda i: i['addedAt'], reverse=True)[:max]
            sorted_data += type_sorted
        sorted_data = sorted(sorted_data, key=lambda i: i['addedAt'], reverse=True)
    else:
        sorted_data = sorted(data, key=lambda i: i['addedAt'], reverse=True)[:max]

    output = []
    valid_images = set()
    for item in sorted_data:
        media_type_map = {'movie': ('thumb', 'art'), 'episode': ('grandparentThumb', 'grandparentArt')}
        thumb_key, art_key = media_type_map.get(item['type'], ('thumb', 'grandparentArt'))
        thumb = item.get(thumb_key, item.get("parentThumb", item.get("grandparentThumb", None)))
        art = item.get(art_key, item.get("grandparentArt", None))
        deep_link_position = -1
        if section_key == "artist":
            deep_link_position = -2
        deep_link = f'{base_url}/web/index.html#!/server/{identifier}/details?key=%2Flibrary%2Fmetadata%2F{item.get("key", "").split("/")[deep_link_position]}'

        if not item.get("addedAt", None):
            continue
        data_output = {}

        data_output["airdate"] = datetime.utcfromtimestamp(int(item.get("addedAt", 0))).strftime('%Y-%m-%dT%H:%M:%SZ')
        data_output["aired"] = item.get("originallyAvailableAt", "")
        data_output["release"] = '$day, $date $time'
        data_output["flag"] = "viewCount" not in item
        data_output["title"] = item.get("grandparentTitle", item.get("parentTitle", item.get("title", "")))
        if item.get("title", None):
            data_output["episode"] = item["title"]
        else:
            data_output["episode"] = ''
        if item.get("parentIndex", None):
            data_output["season_num"] = item["parentIndex"]
        if item.get("index", None):
            data_output["episode_num"] = item["index"]
        if item.get("parentIndex", None) and item.get("index", None):
            data_output["number"] = f'S{"{:0>2}".format(item.get("parentIndex", "1"))}E{"{:0>2}".format(item.get("index", "1"))}'
        else:
            data_output["number"] = ''
        if int(item.get('duration', 0)) > 0:
            data_output["runtime"] = math.floor(int(item["duration"]) / 60000)
        data_output["studio"] = item.get("studio", "")
        data_output["genres"] = ", ".join([genre['tag'] for genre in item.get('Genre', [])][:3])
        data_output["rating"] = ('\N{BLACK STAR} ' + str(item.get("rating"))) if int(float(item.get("rating", 0))) > 0 else ''
        data_output['summary'] = item.get('summary', '')
        data_output['trailer'] = item.get('trailer')


        thumb_IDs = extract_metadata_and_type(thumb)
        data_output["poster"] = async_sign_path(hass, f'{images_base_url}?metadata={thumb_IDs[0]}&thumb={thumb_IDs[2]}', timedelta(minutes=TIMEOUT_MINUTES)) if thumb_IDs else ""


        art_IDs = extract_metadata_and_type(art)
        data_output["fanart"] = async_sign_path(hass, f'{images_base_url}?metadata={art_IDs[0]}&art={art_IDs[2]}', timedelta(minutes=TIMEOUT_MINUTES)) if art_IDs else ""


        data_output["deep_link"] = deep_link if identifier else None

        output.append(data_output)

    return output

