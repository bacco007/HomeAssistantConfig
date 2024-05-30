import time
from datetime import date, datetime
from pytz import timezone

from .const import DEFAULT_PARSE_DICT

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