import json, requests, pytz, datetime
#from datetime import timedelta, datetime
from requests.exceptions import HTTPError
from functools import reduce
from collections import defaultdict

@service
def getdata_yourspotify():
    START_ALL = "2012-05-20T21:13:17.000Z"

    # Top Artists (alltime)
    URL_USE = "http://192.168.1.131:2222/spotify/top/artists?start=" + START_ALL + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            DATA.append({
                        "artist": row['artist']['name'],
                        "image": row['artist']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "artist": "None",
                    "image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Artists (All Time)"
    state.set("sensor.yourspotify_topartists_alltime", value=DATA[0]["artist"], new_attributes=attr)


    # Top Artists (Today)
    date = datetime.datetime.now()
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/artists?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            DATA.append({
                        "artist": row['artist']['name'],
                        "image": row['artist']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "artist": "None",
                    "image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Artists (Today)"
    state.set("sensor.yourspotify_topartists_today", value=DATA[0]["artist"], new_attributes=attr)

    # Top Artists (This Week)
    date = datetime.datetime.now() - datetime.timedelta(days=7)
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/artists?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            DATA.append({
                        "artist": row['artist']['name'],
                        "image": row['artist']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "artist": "None",
                    "image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Artists (This Week)"
    state.set("sensor.yourspotify_topartists_thisweek", value=DATA[0]["artist"], new_attributes=attr)

    # Top Artists (This Month, 30 days)
    date = datetime.datetime.now() - datetime.timedelta(days=30)
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/artists?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            DATA.append({
                        "artist": row['artist']['name'],
                        "image": row['artist']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "artist": "None",
                    "image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Artists (This Month)"
    state.set("sensor.yourspotify_topartists_thismonth", value=DATA[0]["artist"], new_attributes=attr)

    # Top Artists (This Year)
    date = datetime.datetime.now() - datetime.timedelta(days=365)
    date_string = date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    URL_USE = "http://192.168.1.131:2222/spotify/top/artists?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            DATA.append({
                        "artist": row['artist']['name'],
                        "image": row['artist']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "artist": "None",
                    "image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Artists (This Year)"
    state.set("sensor.yourspotify_topartists_thisyear", value=DATA[0]["artist"], new_attributes=attr)

    # Top Songs (alltime)
    URL_USE = "http://192.168.1.131:2222/spotify/top/songs?start=" + START_ALL + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            trackartist = row['artist']['name'] + " - " + row['track']['name']
            DATA.append({
                        "track": row['track']['name'],
                        "artist": row['artist']['name'],
                        "trackartist": trackartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "track": "None",
                    "artist": "None",
                    "trackartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Songs (All Time)"
    state.set("sensor.yourspotify_topsongs_alltime", value=DATA[0]["trackartist"], new_attributes=attr)

    # Top Songs (Today)
    date = datetime.datetime.now()
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/songs?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            trackartist = row['artist']['name'] + " - " + row['track']['name']
            DATA.append({
                        "track": row['track']['name'],
                        "artist": row['artist']['name'],
                        "trackartist": trackartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "track": "None",
                    "artist": "None",
                    "trackartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Songs (Today)"
    state.set("sensor.yourspotify_topsongs_today", value=DATA[0]["trackartist"], new_attributes=attr)

    # Top Songs (This Week)
    date = datetime.datetime.now() - datetime.timedelta(days=7)
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/songs?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            trackartist = row['artist']['name'] + " - " + row['track']['name']
            DATA.append({
                        "track": row['track']['name'],
                        "artist": row['artist']['name'],
                        "trackartist": trackartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "track": "None",
                    "artist": "None",
                    "trackartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Songs (This Week)"
    state.set("sensor.yourspotify_topsongs_thisweek", value=DATA[0]["trackartist"], new_attributes=attr)

    # Top Songs (This Month (30 Days))
    date = datetime.datetime.now() - datetime.timedelta(days=30)
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/songs?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            trackartist = row['artist']['name'] + " - " + row['track']['name']
            DATA.append({
                        "track": row['track']['name'],
                        "artist": row['artist']['name'],
                        "trackartist": trackartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "track": "None",
                    "artist": "None",
                    "trackartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Songs (This Month)"
    state.set("sensor.yourspotify_topsongs_thismonth", value=DATA[0]["trackartist"], new_attributes=attr)

    # Top Songs (This Year)
    date = datetime.datetime.now() - datetime.timedelta(days=365)
    date_string = date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    URL_USE = "http://192.168.1.131:2222/spotify/top/songs?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            trackartist = row['artist']['name'] + " - " + row['track']['name']
            DATA.append({
                        "track": row['track']['name'],
                        "artist": row['artist']['name'],
                        "trackartist": trackartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "track": "None",
                    "artist": "None",
                    "trackartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Songs (This Year)"
    state.set("sensor.yourspotify_topsongs_thisyear", value=DATA[0]["trackartist"], new_attributes=attr)

    # Top Albums (alltime)
    URL_USE = "http://192.168.1.131:2222/spotify/top/albums?start=" + START_ALL + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            albumartist = row['artist']['name'] + " - " + row['album']['name']
            DATA.append({
                        "album": row['album']['name'],
                        "artist": row['artist']['name'],
                        "albumartist": albumartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "album": "None",
                    "artist": "None",
                    "albumartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Albums (All Time)"
    state.set("sensor.yourspotify_topalbums_alltime", value=DATA[0]["albumartist"], new_attributes=attr)

    # Top Albums (Today)
    date = datetime.datetime.now()
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/albums?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            albumartist = row['artist']['name'] + " - " + row['album']['name']
            DATA.append({
                        "album": row['album']['name'],
                        "artist": row['artist']['name'],
                        "albumartist": albumartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "album": "None",
                    "artist": "None",
                    "albumartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Albums (Today)"
    state.set("sensor.yourspotify_topalbums_today", value=DATA[0]["albumartist"], new_attributes=attr)

    # Top Albums (This Week)
    date = datetime.datetime.now() - datetime.timedelta(days=7)
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/albums?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            albumartist = row['artist']['name'] + " - " + row['album']['name']
            DATA.append({
                        "album": row['album']['name'],
                        "artist": row['artist']['name'],
                        "albumartist": albumartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "album": "None",
                    "artist": "None",
                    "albumartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Albums (This Week)"
    state.set("sensor.yourspotify_topalbums_thisweek", value=DATA[0]["albumartist"], new_attributes=attr)

    # Top Albums (This Month (30 Days))
    date = datetime.datetime.now() - datetime.timedelta(days=30)
    date_string = date.strftime("%Y-%m-%d")+"T00:00:00.000Z"
    URL_USE = "http://192.168.1.131:2222/spotify/top/albums?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            albumartist = row['artist']['name'] + " - " + row['album']['name']
            DATA.append({
                        "album": row['album']['name'],
                        "artist": row['artist']['name'],
                        "albumartist": albumartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "album": "None",
                    "artist": "None",
                    "albumartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Albums (This Month)"
    state.set("sensor.yourspotify_topalbums_thismonth", value=DATA[0]["albumartist"], new_attributes=attr)

    # Top Albums (This Year)
    date = datetime.datetime.now() - datetime.timedelta(days=365)
    date_string = date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    URL_USE = "http://192.168.1.131:2222/spotify/top/albums?start=" + date_string + "&end=&nb=30&offset=0&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    if r is not None:
        for row in r:
            albumartist = row['artist']['name'] + " - " + row['album']['name']
            DATA.append({
                        "album": row['album']['name'],
                        "artist": row['artist']['name'],
                        "albumartist": albumartist,
                        "artist_image": row['artist']['images'][0]['url'],
                        "album_image": row['album']['images'][0]['url'],
                        "count": row['count'],
                        "differents": row['differents'],
                        "time_listening_ms": row['duration_ms'],
                })
    if len(r) == 0:
        DATA.append({
                    "album": "None",
                    "artist": "None",
                    "albumartist": "None",
                    "artist_image": "None",
                    "album_image": "None",
                    "count": 0,
                    "differents": 0,
                    "time_listening_ms": 0,
            })
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Top Albums (This Year)"
    state.set("sensor.yourspotify_topalbums_thisyear", value=DATA[0]["albumartist"], new_attributes=attr)

    # Music by Hour (alltime)
    URL_USE = "http://192.168.1.131:2222/spotify/time_per_hour_of_day?start=" + START_ALL + "&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA = []
    maxval = 0
    if r is not None:
        for row in r:
            hr = row["_id"]
            cnt = row["count"]
            if cnt > maxval:
                maxval = cnt
            DATA.append({
                        "hour": f"{hr:02d}:00",
                        "count": cnt,
                })
    attr = {}
    attr["data"] = DATA
    for b in DATA:
        attr[b["hour"]] = b["count"]
    attr["icon"] = "mdi:spotify"
    attr["max"] = maxval
    attr["friendly_name"] = "Your Spotify - Music By Hour (All Time)"
    state.set("sensor.yourspotify_musicbyhour_alltime", value="Not Applicable", new_attributes=attr)

    # Music By Month
    date_end = datetime.datetime.now()
    date_start = date_end - datetime.timedelta(days=30)
    date_end_string = date_end.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    date_start_string = date_start.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    URL_USE = "http://192.168.1.131:2222/spotify/time_per?start=" + date_start_string + "&end=" + date_end_string + "&timeSplit=day&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA1 = []
    if r is not None:
        for row in r:
            d_y = row['_id']['year']
            d_m = row['_id']['month']
            d_d = row['_id']['day']
            DATA1.append({
                        "date": f"{d_y:04d}-{d_m:02d}-{d_d:02d}",
                        "time_listening_ms": row['count'],
                })

    URL_USE2 = "http://192.168.1.131:2222/spotify/songs_per?start=" + date_start_string + "&end=" + date_end_string + "&timeSplit=day&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r2 = task.executor(requests.get, URL_USE2).json()
    DATA2 = []
    if r2 is not None:
        for row in r2:
            d_y = row['_id']['year']
            d_m = row['_id']['month']
            d_d = row['_id']['day']
            DATA2.append({
                        "date": f"{d_y:04d}-{d_m:02d}-{d_d:02d}",
                        "count": row['count'],
                        "differents": row['differents'],
                })

    d = defaultdict(dict)
    for l in (DATA1, DATA2):
        for elem in l:
            d[elem['date']].update(elem)
    DATA = list(d.values())
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Music By Day (This Month)"
    state.set("sensor.yourspotify_musicbyday_thismonth", value="Not Applicable", new_attributes=attr)

    # Music By Year
    date_end = datetime.datetime.now()
    date_start = date_end - datetime.timedelta(days=365)
    date_end_string = date_end.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    date_start_string = date_start.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    URL_USE = "http://192.168.1.131:2222/spotify/time_per?start=" + date_start_string + "&end=" + date_end_string + "&timeSplit=day&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r = task.executor(requests.get, URL_USE).json()
    DATA1 = []
    if r is not None:
        for row in r:
            d_y = row['_id']['year']
            d_m = row['_id']['month']
            d_d = row['_id']['day']
            DATA1.append({
                        "date": f"{d_y:04d}-{d_m:02d}-{d_d:02d}",
                        "time_listening_ms": row['count'],
                })

    URL_USE2 = "http://192.168.1.131:2222/spotify/songs_per?start=" + date_start_string + "&end=" + date_end_string + "&timeSplit=day&token=794cf22d-7476-44c5-b1e0-2063f2581a55"
    r2 = task.executor(requests.get, URL_USE2).json()
    DATA2 = []
    if r2 is not None:
        for row in r2:
            d_y = row['_id']['year']
            d_m = row['_id']['month']
            d_d = row['_id']['day']
            DATA2.append({
                        "date": f"{d_y:04d}-{d_m:02d}-{d_d:02d}",
                        "count": row['count'],
                        "differents": row['differents'],
                })

    d = defaultdict(dict)
    for l in (DATA1, DATA2):
        for elem in l:
            d[elem['date']].update(elem)
    DATA = list(d.values())
    attr = {}
    attr["data"] = DATA
    attr["icon"] = "mdi:spotify"
    attr["friendly_name"] = "Your Spotify - Music By Day (This Year)"
    state.set("sensor.yourspotify_musicbyday_thisyear", value="Not Applicable", new_attributes=attr)

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
