from xml.etree import ElementTree
import os
import hashlib
from urllib.parse import urlparse
import aiohttp
import aiofiles
import re
import math
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FOLDER = os.path.join(SCRIPT_DIR, "images_cache")
os.makedirs(CACHE_FOLDER, exist_ok=True)

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

def get_image_filename(url):
    """Generate a unique filename from the URL while keeping the original extension."""
    parsed_url = urlparse(url)
    ext = os.path.splitext(parsed_url.path)[-1]
    if not ext:
        ext = ".jpg"
    return hashlib.md5(url.encode()).hexdigest() + ext

async def download_image(url):
    """Download an image asynchronously and save it to the cache folder without blocking the event loop."""
    filename = get_image_filename(url)
    file_path = os.path.join(CACHE_FOLDER, filename)

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                async with aiofiles.open(file_path, "wb") as file:  # ✅ Non-blocking file write
                    await file.write(await response.read())  # ✅ Async file writing
                return filename
    return None

def cleanup_old_images(valid_filenames):
    """Delete images that are not in the updated list."""
    for filename in os.listdir(CACHE_FOLDER):
        if filename not in valid_filenames:
            os.remove(os.path.join(CACHE_FOLDER, filename))

async def parse_data(data, max, base_url, token, identifier, section_key, images_base_url, is_all = False):
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


        thumb_filename = await download_image(f'{base_url}{thumb}?X-Plex-Token={token}')
        if thumb_filename:
            valid_images.add(thumb_filename)
        data_output["poster"] = (f'{images_base_url}?filename={thumb_filename}') if thumb_filename else ""


        art_filename = await download_image(f'{base_url}{art}?X-Plex-Token={token}')
        if art_filename:
            valid_images.add(art_filename)
        data_output["fanart"] = (f'{images_base_url}?filename={art_filename}') if art_filename else ""


        data_output["deep_link"] = deep_link if identifier else None

        output.append(data_output)

    return output

