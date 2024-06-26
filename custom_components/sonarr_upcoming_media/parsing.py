import time
from datetime import date, datetime
from pytz import timezone
import requests

from .const import DEFAULT_PARSE_DICT

TMDB_BASE_URL = 'http://api.tmdb.org/3/search/tv?api_key=1f7708bb9a218ab891a5d438b1b63992&query={}'
TMDB_DETAILS_URL = 'http://api.tmdb.org/3/tv/{}?api_key=1f7708bb9a218ab891a5d438b1b63992&append_to_response=videos'
TMDB_BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w{0}{1}'

def days_until(date, tz):
    from pytz import utc
    date = datetime.strptime(date, '%Y-%m-%dT%H:%M:%SZ')
    date = str(date.replace(tzinfo=utc).astimezone(tz))[:10]
    date = time.strptime(date, '%Y-%m-%d')
    date = time.mktime(date)
    now = datetime.now().strftime('%Y-%m-%d')
    now = time.strptime(now, '%Y-%m-%d')
    now = time.mktime(now)
    return int((date - now) / 86400)

def parse_data(data, tz, host, port, ssl, url_base=None):
    import re
    """Return JSON for the sensor."""
    attributes = {}
    card_json = []
    card_json.append(DEFAULT_PARSE_DICT)
    for show in data:
        card_item = {}
        if 'series' not in show:
            continue
        card_item['airdate'] = show['airDateUtc']
        if days_until(show['airDateUtc'], tz) <= 7:
            card_item['release'] = '$day, $time'
        else:
            card_item['release'] = '$day, $date $time'
        card_item['flag'] = show.get('hasFile', False)
        if 'title' in show['series']:
            card_item['title'] = show['series']['title']
        else:
            continue
        card_item['episode'] = show.get('title', '')
        if 'seasonNumber' and 'episodeNumber' in show:
            card_item['number'] = 'S{:02d}E{:02d}'.format(show['seasonNumber'],
                                                    show['episodeNumber'])
        else:
            card_item['number'] = ''
        if 'runtime' in show['series']:
            card_item['runtime'] = show['series']['runtime']
        else:
            card_item['runtime'] = ''
        if 'network' in show['series']:
            card_item['studio'] = show['series']['network']
        else:
            card_item['studio'] = ''
        if ('ratings' in show['series'] and
        show['series']['ratings']['value'] > 0):
                card_item['rating'] = ('\N{BLACK STAR} ' +
                                str(show['series']['ratings']['value']))
        else:
            card_item['rating'] = ''
        if 'genres' in show['series']:
            card_item['genres'] = ', '.join(show['series']['genres'])
        else:
            card_item['genres'] = ''
        card_item['summary'] = show.get('overview', '')
        
        if 'title' in show['series']:
            session = requests.Session()
            try:
                search_url = TMDB_BASE_URL.format(requests.utils.quote(show['series']['title'].split('(')[0].strip()))
                tmdb_url = session.get(search_url)
                tmdb_json = tmdb_url.json()

                if tmdb_json['results']:
                    tmdb_id = tmdb_json['results'][0]['id']
                    details_url = TMDB_DETAILS_URL.format(tmdb_id)
                    details_response = session.get(details_url)
                    details_json = details_response.json()

                    if 'videos' in details_json and details_json['videos']['results']:
                        for video in details_json['videos']['results']:
                            if video['type'] == 'Trailer':
                                card_item['trailer'] = f'https://www.youtube.com/watch?v={video["key"]}'
                                break
                        else:
                            card_item['trailer'] = ''
                    else:
                        card_item['trailer'] = ''

                    if 'poster_path' in tmdb_json['results'][0]:
                        card_item['poster'] = TMDB_BASE_IMAGE_URL.format('500', tmdb_json['results'][0]['poster_path'])
                    if 'backdrop_path' in tmdb_json['results'][0]:
                        card_item['fanart'] = TMDB_BASE_IMAGE_URL.format('780', tmdb_json['results'][0]['backdrop_path'])
                else:
                    card_item['trailer'] = ''
            except:
                card_item['trailer'] = ''
                raise TMDBApiNotResponding
        
        try:
            for img in show['series']['images']:
                if img['coverType'] == 'poster':
                    card_item['poster'] = re.sub('.jpg', '_t.jpg', img['remoteUrl'])
        except:
            continue
        try:
            card_item['fanart'] = ''
            for img in show['series']['images']:
                if img['coverType'] == 'fanart':
                    card_item['fanart'] = re.sub('.jpg', '_t.jpg', img['remoteUrl'])
        except:
            pass
        series_title_slug = show['series']['titleSlug']
        protocol = 'https' if ssl else 'http'
        card_item['deep_link'] = f'{protocol}://{host}:{port}/{url_base.strip("/") + "/" if url_base else ""}series/{series_title_slug}'
        card_json.append(card_item)
    attributes['data'] = card_json
    return attributes

class TMDBApiNotResponding(Exception):
    "Raised when the TMDB API is not responding"
    pass
