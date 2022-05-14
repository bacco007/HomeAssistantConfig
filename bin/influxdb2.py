from influxdb_client import InfluxDBClient

url = "http://192.168.1.91:8086"
token = "JYFMd_qLPbtOvM7cjYOAqdyjDXqxngd1sVwAiBtIvQy--G7FCGVXMC4txLcGe5kQlOjcxkdWzEhcXZMo7IkRxw=="
org = "d6e534a3bf390236"
bucket = "homeassistant"

client = InfluxDBClient(url=url, token=token, org=org)
query_api = client.query_api()
query = 'import "timezone"\
option location = timezone.location(name: "Australia/Sydney")\
from(bucket: "homeassistant")\
  |> range(start: -1d)\
  |> filter(fn: (r) => r["_measurement"] == "°C")\
  |> filter(fn: (r) => r["entity_id"] == "tempest_st_00056115_temperature")\
  |> filter(fn: (r) => r["_field"] == "value")\
  |> aggregateWindow(every: 5m, fn: last, createEmpty: false)\
  |> yield(name: "last")'

result = client.query_api().query(query=query)

results = []

for table in result:
    for record in table.records:
        results.append((record.get_time().isoformat(), record.get_value()))

print(results)
