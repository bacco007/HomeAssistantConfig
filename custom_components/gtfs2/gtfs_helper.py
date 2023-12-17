"""Support for GTFS Integration."""
from __future__ import annotations

import datetime
import logging
import os
import json
import requests
import pygtfs
from sqlalchemy.sql import text
import multiprocessing
from multiprocessing import Process

import homeassistant.util.dt as dt_util
from homeassistant.core import HomeAssistant

from .const import DEFAULT_PATH_GEOJSON

_LOGGER = logging.getLogger(__name__)


def get_next_departure(self):
    _LOGGER.debug("Get next departure with data: %s", self._data)
    if check_extracting(self):
        _LOGGER.warning("Cannot get next depurtures on this datasource as still unpacking: %s", self._data["file"])
        return {}

    """Get next departures from data."""
    if self.hass.config.time_zone is None:
        _LOGGER.error("Timezone is not set in Home Assistant configuration")
        timezone = "UTC"
    else:
        timezone=dt_util.get_time_zone(self.hass.config.time_zone)
    schedule = self._data["schedule"]
    route_type = self._data["route_type"]
    
    # if type 2 (train) then filter on that and use name-like search 
    if route_type == "2":
        route_type_where = f"route_type = :route_type"
        start_station_id = str(self._data['origin'])+'%'
        end_station_id = str(self._data['destination'])+'%'
        start_station_where = f"AND start_station.stop_id in (select stop_id from stops where stop_name like :origin_station_id)"
        end_station_where = f"AND end_station.stop_id in (select stop_id from stops where stop_name like :end_station_id)"
    else:
        route_type_where = "1=1"
        start_station_id = self._data['origin'].split(': ')[0]
        end_station_id = self._data['destination'].split(': ')[0]
        start_station_where = f"AND start_station.stop_id = :origin_station_id"
        end_station_where = f"AND end_station.stop_id = :end_station_id"
    _LOGGER.debug("Start / end : %s / %s", start_station_id, end_station_id)
    _LOGGER.debug("Query : %s", end_station_where)
    offset = self._data["offset"]
    include_tomorrow = self._data["include_tomorrow"]
    now = dt_util.now().replace(tzinfo=None) + datetime.timedelta(minutes=offset)
    now_date = now.strftime(dt_util.DATE_STR_FORMAT)
    yesterday = now - datetime.timedelta(days=1)
    yesterday_date = yesterday.strftime(dt_util.DATE_STR_FORMAT)
    tomorrow = now + datetime.timedelta(days=1)
    tomorrow_date = tomorrow.strftime(dt_util.DATE_STR_FORMAT)

    # Fetch all departures for yesterday, today and optionally tomorrow,
    # up to an overkill maximum in case of a departure every minute for those
    # days.
    limit = 24 * 60 * 60 * 2
    tomorrow_select = tomorrow_select2 = tomorrow_where = tomorrow_order = ""
    tomorrow_calendar_date_where = f"AND (calendar_date_today.date = :today)"
    if include_tomorrow:
        _LOGGER.debug("Include Tomorrow")
        limit = int(limit / 2 * 3)
        tomorrow_name = tomorrow.strftime("%A").lower()
        tomorrow_select = f"calendar.{tomorrow_name} AS tomorrow,"
        tomorrow_where = f"OR calendar.{tomorrow_name} = 1"
        tomorrow_order = f"calendar.{tomorrow_name} DESC,"
        tomorrow_calendar_date_where = f"AND (calendar_date_today.date = :today or calendar_date_today.date = :tomorrow)"
        tomorrow_select2 = f"'0' AS tomorrow,"
    sql_query = f"""
        SELECT trip.trip_id, trip.route_id,trip.trip_headsign,route.route_long_name,
        	   start_station.stop_id as origin_stop_id,
               start_station.stop_name as origin_stop_name,
               time(origin_stop_time.arrival_time) AS origin_arrival_time,
               time(origin_stop_time.departure_time) AS origin_depart_time,
               date(origin_stop_time.departure_time) AS origin_depart_date,
               origin_stop_time.drop_off_type AS origin_drop_off_type,
               origin_stop_time.pickup_type AS origin_pickup_type,
               origin_stop_time.shape_dist_traveled AS origin_dist_traveled,
               origin_stop_time.stop_headsign AS origin_stop_headsign,
               origin_stop_time.stop_sequence AS origin_stop_sequence,
               origin_stop_time.timepoint AS origin_stop_timepoint,
               end_station.stop_name as dest_stop_name,
               time(destination_stop_time.arrival_time) AS dest_arrival_time,
               time(destination_stop_time.departure_time) AS dest_depart_time,
               destination_stop_time.drop_off_type AS dest_drop_off_type,
               destination_stop_time.pickup_type AS dest_pickup_type,
               destination_stop_time.shape_dist_traveled AS dest_dist_traveled,
               destination_stop_time.stop_headsign AS dest_stop_headsign,
               destination_stop_time.stop_sequence AS dest_stop_sequence,
               destination_stop_time.timepoint AS dest_stop_timepoint,
               calendar.{yesterday.strftime("%A").lower()} AS yesterday,
               calendar.{now.strftime("%A").lower()} AS today,
               {tomorrow_select}
               calendar.start_date AS start_date,
               calendar.end_date AS end_date,
               "" as calendar_date,
               0 as today_cd
        FROM trips trip
        INNER JOIN calendar calendar
                   ON trip.service_id = calendar.service_id
        INNER JOIN stop_times origin_stop_time
                   ON trip.trip_id = origin_stop_time.trip_id
        INNER JOIN stops start_station
                   ON origin_stop_time.stop_id = start_station.stop_id
        INNER JOIN stop_times destination_stop_time
                   ON trip.trip_id = destination_stop_time.trip_id
        INNER JOIN stops end_station
                   ON destination_stop_time.stop_id = end_station.stop_id
        INNER JOIN routes route
                   ON route.route_id = trip.route_id 
		WHERE {route_type_where}
        {start_station_where}
        {end_station_where}
        AND origin_stop_sequence < dest_stop_sequence
        AND calendar.start_date <= :today
        AND calendar.end_date >= :today
		UNION ALL
	    SELECT trip.trip_id, trip.route_id,trip.trip_headsign,route.route_long_name,
               start_station.stop_id as origin_stop_id,
               start_station.stop_name as origin_stop_name,
               time(origin_stop_time.arrival_time) AS origin_arrival_time,
               time(origin_stop_time.departure_time) AS origin_depart_time,
               date(origin_stop_time.departure_time) AS origin_depart_date,
               origin_stop_time.drop_off_type AS origin_drop_off_type,
               origin_stop_time.pickup_type AS origin_pickup_type,
               origin_stop_time.shape_dist_traveled AS origin_dist_traveled,
               origin_stop_time.stop_headsign AS origin_stop_headsign,
               origin_stop_time.stop_sequence AS origin_stop_sequence,
               origin_stop_time.timepoint AS origin_stop_timepoint,
               end_station.stop_name as dest_stop_name,
               time(destination_stop_time.arrival_time) AS dest_arrival_time,
               time(destination_stop_time.departure_time) AS dest_depart_time,
               destination_stop_time.drop_off_type AS dest_drop_off_type,
               destination_stop_time.pickup_type AS dest_pickup_type,
               destination_stop_time.shape_dist_traveled AS dest_dist_traveled,
               destination_stop_time.stop_headsign AS dest_stop_headsign,
               destination_stop_time.stop_sequence AS dest_stop_sequence,
               destination_stop_time.timepoint AS dest_stop_timepoint,
               '0' AS yesterday,
               '0' AS today,
               {tomorrow_select2}
               :today AS start_date,
               :today AS end_date,
               calendar_date_today.date as calendar_date,
               calendar_date_today.exception_type as today_cd
        FROM trips trip
        INNER JOIN stop_times origin_stop_time
                   ON trip.trip_id = origin_stop_time.trip_id
        INNER JOIN stops start_station
                   ON origin_stop_time.stop_id = start_station.stop_id
        INNER JOIN stop_times destination_stop_time
                   ON trip.trip_id = destination_stop_time.trip_id
        INNER JOIN stops end_station
                   ON destination_stop_time.stop_id = end_station.stop_id
        INNER JOIN routes route
                   ON route.route_id = trip.route_id 
        INNER JOIN calendar_dates calendar_date_today
				   ON trip.service_id = calendar_date_today.service_id
		WHERE {route_type_where}
        {start_station_where}
        {end_station_where}
		AND origin_stop_sequence < dest_stop_sequence
        AND today_cd = 1
		{tomorrow_calendar_date_where}
        ORDER BY calendar_date,origin_depart_date, today_cd, origin_depart_time
        """  # noqa: S608
    result = schedule.engine.connect().execute(
        text(sql_query),
        {
            "origin_station_id": start_station_id,
            "end_station_id": end_station_id,
            "today": now_date,
            "tomorrow": tomorrow_date,
            "limit": limit,
            "route_type": route_type,
        },
    )
    # Create lookup timetable for today and possibly tomorrow, taking into
    # account any departures from yesterday scheduled after midnight,
    # as long as all departures are within the calendar date range.
    timetable = {}
    yesterday_start = today_start = tomorrow_start = None
    yesterday_last = today_last = ""
    for row_cursor in result:
        row = row_cursor._asdict()
        if row["yesterday"] == 1 and yesterday_date >= row["start_date"]:
            extras = {"day": "yesterday", "first": None, "last": False}
            if yesterday_start is None:
                yesterday_start = row["origin_depart_date"]
            if yesterday_start != row["origin_depart_date"]:
                idx = f"{now_date} {row['origin_depart_time']}"
                timetable[idx] = {**row, **extras}
                yesterday_last = idx
        if row["today"] == 1 or row["today_cd"] == 1:
            extras = {"day": "today", "first": False, "last": False}
            if today_start is None:
                today_start = row["origin_depart_date"]
                extras["first"] = True
            if today_start == row["origin_depart_date"]:
                idx_prefix = now_date
            else:
                idx_prefix = tomorrow_date
            idx = f"{idx_prefix} {row['origin_depart_time']}"
            timetable[idx] = {**row, **extras}
            today_last = idx
        if (
            "tomorrow" in row
            and row["tomorrow"] == 1
            and tomorrow_date <= row["end_date"]
        ):
            extras = {"day": "tomorrow", "first": False, "last": None}
            if tomorrow_start is None:
                tomorrow_start = row["origin_depart_date"]
                extras["first"] = True
            if tomorrow_start == row["origin_depart_date"]:
                idx = f"{tomorrow_date} {row['origin_depart_time']}"
                timetable[idx] = {**row, **extras}
    # Flag last departures.
    for idx in filter(None, [yesterday_last, today_last]):
        timetable[idx]["last"] = True
    item = {}
    for key in sorted(timetable.keys()):
        if datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S") > now:
            item = timetable[key]
            _LOGGER.info(
                "Departure found for station %s @ %s -> %s", start_station_id, key, item
            )
            break
    _LOGGER.debug("item: %s", item)
    
    if item == {}:
        data_returned = {        
        "gtfs_updated_at": dt_util.utcnow().isoformat(),
        }
        _LOGGER.info("No items found in gtfs")
        return {}

    # create upcoming timetable
    timetable_remaining = []
    for key in sorted(timetable.keys()):
        if datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S") > now:
            timetable_remaining.append(dt_util.as_utc(datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")).isoformat())
    _LOGGER.debug(
        "Timetable Remaining Departures on this Start/Stop: %s", timetable_remaining
    )
    # create upcoming timetable with line info
    timetable_remaining_line = []
    for key, value in sorted(timetable.items()):
        if datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S") > now:
            timetable_remaining_line.append(
                str(dt_util.as_utc(datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")).isoformat()) + " (" + str(value["route_long_name"]) + ")"
            )
    _LOGGER.debug(
        "Timetable Remaining Departures on this Start/Stop, per line: %s",
        timetable_remaining_line,
    )
    # create upcoming timetable with headsign
    timetable_remaining_headsign = []
    for key, value in sorted(timetable.items()):
        if datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S") > now:
            timetable_remaining_headsign.append(
                str(dt_util.as_utc(datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")).isoformat()) + " (" + str(value["trip_headsign"]) + ")"
            )
    _LOGGER.debug(
        "Timetable Remaining Departures on this Start/Stop, with headsign: %s",
        timetable_remaining_headsign,
    )

    # Format arrival and departure dates and times, accounting for the
    # possibility of times crossing over midnight.
    _tomorrow = item.get("tomorrow")
    origin_arrival = now
    dest_arrival = now
    origin_depart_time = f"{now_date} {item['origin_depart_time']}"
    if _tomorrow == 1:
        origin_arrival = tomorrow
        dest_arrival = tomorrow
        origin_depart_time = f"{tomorrow_date} {item['origin_depart_time']}"
    
    if item["origin_arrival_time"] > item["origin_depart_time"]:
        origin_arrival -= datetime.timedelta(days=1)
    origin_arrival_time = (
        f"{origin_arrival.strftime(dt_util.DATE_STR_FORMAT)} "
        f"{item['origin_arrival_time']}"
    )

    if item["dest_arrival_time"] < item["origin_depart_time"]:
        dest_arrival += datetime.timedelta(days=1)   
    dest_arrival_time = (
        f"{dest_arrival.strftime(dt_util.DATE_STR_FORMAT)} {item['dest_arrival_time']}"
    )

    dest_depart = dest_arrival
    if item["dest_depart_time"] < item["dest_arrival_time"]:
        dest_depart += datetime.timedelta(days=1)
    dest_depart_time = (
        f"{dest_depart.strftime(dt_util.DATE_STR_FORMAT)} {item['dest_depart_time']}"
    )
    # align on timezone
    depart_time = dt_util.parse_datetime(origin_depart_time).replace(tzinfo=timezone)    
    arrival_time = dt_util.parse_datetime(dest_arrival_time).replace(tzinfo=timezone)
    origin_arrival_time = dt_util.as_utc(datetime.datetime.strptime(origin_arrival_time, "%Y-%m-%d %H:%M:%S")).isoformat()
    origin_depart_time = dt_util.as_utc(datetime.datetime.strptime(origin_depart_time, "%Y-%m-%d %H:%M:%S")).isoformat()
    dest_arrival_time = dt_util.as_utc(datetime.datetime.strptime(dest_arrival_time, "%Y-%m-%d %H:%M:%S")).isoformat()
    dest_depart_time = dt_util.as_utc(datetime.datetime.strptime(dest_depart_time, "%Y-%m-%d %H:%M:%S")).isoformat()
    
    origin_stop_time = {
        "Arrival Time": origin_arrival_time,
        "Departure Time": origin_depart_time,
        "Drop Off Type": item["origin_drop_off_type"],
        "Pickup Type": item["origin_pickup_type"],
        "Shape Dist Traveled": item["origin_dist_traveled"],
        "Headsign": item["origin_stop_headsign"],
        "Sequence": item["origin_stop_sequence"],
        "Timepoint": item["origin_stop_timepoint"],
    }

    destination_stop_time = {
        "Arrival Time": dest_arrival_time,
        "Departure Time": dest_depart_time,
        "Drop Off Type": item["dest_drop_off_type"],
        "Pickup Type": item["dest_pickup_type"],
        "Shape Dist Traveled": item["dest_dist_traveled"],
        "Headsign": item["dest_stop_headsign"],
        "Sequence": item["dest_stop_sequence"],
        "Timepoint": item["dest_stop_timepoint"],
    }
    
    data_returned = {
        "trip_id": item["trip_id"],
        "route_id": item["route_id"],
        "day": item["day"],
        "first": item["first"],
        "last": item["last"],
        "origin_stop_id": item["origin_stop_id"],
        "origin_stop_name": item["origin_stop_name"],
        "departure_time": depart_time,
        "arrival_time": arrival_time,
        "origin_stop_time": origin_stop_time,
        "destination_stop_time": destination_stop_time,
        "destination_stop_name": item["dest_stop_name"],
        "next_departures": timetable_remaining,
        "next_departures_lines": timetable_remaining_line,
        "next_departures_headsign": timetable_remaining_headsign,
    }
    
    return data_returned

def get_gtfs(hass, path, data, update=False):
    """Get gtfs file."""
    _LOGGER.debug("Getting gtfs with data: %s", data)
    gtfs_dir = hass.config.path(path)
    os.makedirs(gtfs_dir, exist_ok=True)
    filename = data["file"]
    url = data["url"]
    file = data["file"] + ".zip"
    sqlite = data["file"] + ".sqlite"
    journal = os.path.join(gtfs_dir, filename + ".sqlite-journal")
    if os.path.exists(journal) and not update :
        _LOGGER.warning("Cannot use this datasource as still unpacking: %s", filename)
        return "extracting"
    if update and data["extract_from"] == "url" and os.path.exists(os.path.join(gtfs_dir, file)):
        remove_datasource(hass, path, filename)
    if update and data["extract_from"] == "zip" and os.path.exists(os.path.join(gtfs_dir, file)) and os.path.exists(os.path.join(gtfs_dir, sqlite)):
        os.remove(os.path.join(gtfs_dir, sqlite))      
    if data["extract_from"] == "zip":
        if not os.path.exists(os.path.join(gtfs_dir, file)):
            _LOGGER.error("The given GTFS zipfile was not found")
            return "no_zip_file"
    if data["extract_from"] == "url":
        if not os.path.exists(os.path.join(gtfs_dir, file)):
            try:
                r = requests.get(url, allow_redirects=True)
                open(os.path.join(gtfs_dir, file), "wb").write(r.content)
            except Exception as ex:  # pylint: disable=broad-except
                _LOGGER.error("The given URL or GTFS data file/folder was not found")
                return "no_data_file"
    (gtfs_root, _) = os.path.splitext(file)

    sqlite_file = f"{gtfs_root}.sqlite?check_same_thread=False"
    joined_path = os.path.join(gtfs_dir, sqlite_file) 
    gtfs = pygtfs.Schedule(joined_path)
    if not gtfs.feeds:
        extract = Process(target=extract_from_zip(gtfs,gtfs_dir,file))
        extract.start()
        extract.join()
        _LOGGER.info("Exiting main after start subprocess for unpacking: %s", file)
        return "unpacking"
    return gtfs
 

    
def extract_from_zip(gtfs,gtfs_dir,file):
    _LOGGER.debug("Extracting gtfs file: %s", file)
    if os.fork() != 0:
        return
    pygtfs.append_feed(gtfs, os.path.join(gtfs_dir, file))
    
        

def get_route_list(schedule, data):
    _LOGGER.debug("Getting routes with data: %s", data)
    route_type_where = ""
    if data["route_type"] != "99":
        route_type_where = f"where route_type = {data['route_type']}"
    sql_routes = f"""
    SELECT route_id, route_short_name, route_long_name from routes
    {route_type_where}
    order by cast(route_id as decimal)
    """  # noqa: S608
    result = schedule.engine.connect().execute(
        text(sql_routes),
        {"q": "q"},
    )
    routes_list = []
    routes = []
    for row_cursor in result:
        row = row_cursor._asdict()
        routes_list.append(list(row_cursor))
    for x in routes_list:
        val = str(x[0]) + ": " + str(x[1]) + " (" + str(x[2]) + ")"
        routes.append(val)
    _LOGGER.debug(f"routes: {routes}")
    return routes


def get_stop_list(schedule, route_id, direction):
    sql_stops = f"""
    SELECT distinct(s.stop_id), s.stop_name
    from trips t
    inner join stop_times st on st.trip_id = t.trip_id
    inner join stops s on s.stop_id = st.stop_id
    where  t.route_id = '{route_id}'
    and (t.direction_id = {direction} or t.direction_id is null)
    order by st.stop_sequence
    """  # noqa: S608
    result = schedule.engine.connect().execute(
        text(sql_stops),
        {"q": "q"},
    )
    stops_list = []
    stops = []
    for row_cursor in result:
        row = row_cursor._asdict()
        stops_list.append(list(row_cursor))
    for x in stops_list:
        val = x[0] + ": " + x[1]
        stops.append(val)
    _LOGGER.debug(f"stops: {stops}")
    return stops


def get_datasources(hass, path) -> dict[str]:
    _LOGGER.debug(f"Datasources path: {path}")
    gtfs_dir = hass.config.path(path)
    os.makedirs(gtfs_dir, exist_ok=True)
    files = os.listdir(gtfs_dir)
    datasources = []
    for file in files:
        if file.endswith(".sqlite"):
            datasources.append(file.split(".")[0])        
    _LOGGER.debug(f"Datasources in folder: {datasources}")
    return datasources


def remove_datasource(hass, path, filename):
    gtfs_dir = hass.config.path(path)
    _LOGGER.info(f"Removing datasource: {os.path.join(gtfs_dir, filename)}.*")
    os.remove(os.path.join(gtfs_dir, filename + ".zip"))
    os.remove(os.path.join(gtfs_dir, filename + ".sqlite"))
    return "removed"
    
def check_extracting(self):
    gtfs_dir = self.hass.config.path(self._data["gtfs_dir"])
    filename = self._data["file"]
    journal = os.path.join(gtfs_dir, filename + ".sqlite-journal")
    if os.path.exists(journal) :
        _LOGGER.debug("check extracting: yes")
        return True
    return False    


def check_datasource_index(self):
    _LOGGER.debug("Check datasource with data: %s", self._data)
    if check_extracting(self):
        _LOGGER.warning("Cannot check indexes on this datasource as still unpacking: %s", self._data["file"])
        return
    schedule=self._pygtfs
    sql_index_1 = f"""
    SELECT count(*) as checkidx
    FROM sqlite_master
    WHERE
    type= 'index' and tbl_name = 'stop_times' and name like '%trip_id%';
    """
    sql_index_2 = f"""
    SELECT count(*) as checkidx
    FROM sqlite_master
    WHERE
    type= 'index' and tbl_name = 'stop_times' and name like '%stop_id%';
    """
    sql_index_3 = f"""
    SELECT count(*) as checkidx
    FROM sqlite_master
    WHERE
    type= 'index' and tbl_name = 'shapes' and name like '%shape_id%';
    """
    sql_index_4 = f"""
    SELECT count(*) as checkidx
    FROM sqlite_master
    WHERE
    type= 'index' and tbl_name = 'stops' and name like '%stop_name%';
    """
    sql_add_index_1 = f"""
    create index gtfs2_stop_times_trip_id on stop_times(trip_id)
    """
    sql_add_index_2 = f"""
    create index gtfs2_stop_times_stop_id on stop_times(stop_id)
    """
    sql_add_index_3 = f"""
    create index gtfs2_shapes_shape_id on shapes(shape_id)
    """
    sql_add_index_4 = f"""
    create index gtfs2_stops_stop_name on stops(stop_name)
    """    
    result_1a = schedule.engine.connect().execute(
        text(sql_index_1),
        {"q": "q"},
    )
    for row_cursor in result_1a:
        _LOGGER.debug("IDX result1: %s", row_cursor._asdict())
        if row_cursor._asdict()['checkidx'] == 0:
            _LOGGER.warning("Adding index 1 to improve performance")
            result_1b = schedule.engine.connect().execute(
            text(sql_add_index_1),
            {"q": "q"},
            )        
        
    result_2a = schedule.engine.connect().execute(
        text(sql_index_2),
        {"q": "q"},
    )
    for row_cursor in result_2a:
        _LOGGER.debug("IDX result2: %s", row_cursor._asdict())
        if row_cursor._asdict()['checkidx'] == 0:
            _LOGGER.warning("Adding index 2 to improve performance")
            result_2b = schedule.engine.connect().execute(
            text(sql_add_index_2),
            {"q": "q"},
            )
            
    result_3a = schedule.engine.connect().execute(
        text(sql_index_3),
        {"q": "q"},
    )
    for row_cursor in result_3a:
        _LOGGER.debug("IDX result3: %s", row_cursor._asdict())
        if row_cursor._asdict()['checkidx'] == 0:
            _LOGGER.warning("Adding index 3 to improve performance")
            result_3b = schedule.engine.connect().execute(
            text(sql_add_index_3),
            {"q": "q"},
            )    
    result_4a = schedule.engine.connect().execute(
        text(sql_index_4),
        {"q": "q"},
    )
    for row_cursor in result_4a:
        _LOGGER.debug("IDX result4: %s", row_cursor._asdict())
        if row_cursor._asdict()['checkidx'] == 0:
            _LOGGER.warning("Adding index 4 to improve performance")
            result_4b = schedule.engine.connect().execute(
            text(sql_add_index_4),
            {"q": "q"},
            )  
            
def create_trip_geojson(self):
    _LOGGER.debug("GTFS Helper, create geojson with data: %s", self._data)
    schedule = self._data["schedule"]
    self._trip_id = self._data["next_departure"]["trip_id"]
    sql_shape = f"""
    SELECT t.trip_id, s.shape_pt_lat, s.shape_pt_lon
    FROM trips t, shapes s
    WHERE
    t.shape_id = s.shape_id
    and t.trip_id = '{self._trip_id}'
    order by s.shape_pt_sequence
    """
    result = schedule.engine.connect().execute(
        text(sql_shape),
        {"q": "q"},
    )
    
    shapes_list = []
    coordinates = []
    for row_cursor in result:
        row = row_cursor._asdict()
        shapes_list.append(list(row_cursor))
    for x in shapes_list:
        coordinate = []
        coordinate.append(x[2])
        coordinate.append(x[1])
        coordinates.append(coordinate)
    self.geojson = {"features": [{"geometry": {"coordinates": coordinates, "type": "LineString"}, "properties": {"id": self._trip_id, "title": self._trip_id}, "type": "Feature"}], "type": "FeatureCollection"}    
    _LOGGER.debug("Geojson: %s", json.dumps(self.geojson))
    return None
