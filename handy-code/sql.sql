delete from states where last_reported_ts < UNIX_TIMESTAMP(NOW() - INTERVAL 4 DAY);

delete from events where time_fired_ts < UNIX_TIMESTAMP(NOW() - INTERVAL 4 DAY);

delete from states where created < curdate()-7;

delete from events where created < curdate()-7;

delete from events where event_id not in (select event_id from states);

optimize table events;
optimize table states;

VACUUM;

---

DELETE FROM statistics
WHERE start_ts < UNIX_TIMESTAMP(NOW() - INTERVAL 4 DAY);

DELETE FROM statistics_short_term
WHERE start_ts < UNIX_TIMESTAMP(NOW() - INTERVAL 4 DAY);

DELETE FROM statistics_meta
WHERE id NOT IN (SELECT DISTINCT metadata_id FROM statistics)
  AND id NOT IN (SELECT DISTINCT metadata_id FROM statistics_short_term);

---

SELECT entity_id, count(*)
FROM "states"
group by 1 order by 2 desc

SELECT count(*) FROM states WHERE created <= datetime('now', '-1 days')

SELECT
 entity_id,
 COUNT(entity_id)
FROM
 states
GROUP BY
 entity_id
ORDER BY COUNT(entity_id) DESC
LIMIT 40;

SELECT
 event_type,
 COUNT(event_type)
FROM
 events
GROUP BY
 event_type
ORDER BY COUNT(event_type) DESC
LIMIT 20;

SELECT verrijkt.entity_id, SUM(LENGTH(attributes)) size, COUNT(*) count, SUM(LENGTH(attributes))/COUNT(*) avg
FROM (SELECT new_states.entity_id, events.event_id, new_states.attributes FROM events LEFT JOIN states as new_states ON events.event_id = new_states.event_id) as verrijkt
GROUP BY verrijkt.entity_id
ORDER BY size DESC
limit 20;

SELECT
    JSON_VALUE(event_data, '$.entity_id') AS entity_id,
    COUNT(*) AS cnt
FROM events
WHERE
    JSON_VALUE(event_data, '$.entity_id') IS NOT NULL
GROUP BY
    JSON_VALUE(event_data, '$.entity_id')
ORDER BY
    COUNT(*) DESC;

SELECT entity_id, SUM(LENGTH(attributes)) size, COUNT(*) count, SUM(LENGTH(attributes))/COUNT(*) avg
FROM states
GROUP BY entity_id
ORDER BY size DESC;

WITH step1 AS (
    SELECT *, INSTR(event_data, '"entity_id": "') AS i
    FROM events),
step2 AS (
    SELECT *, CASE WHEN i>0 THEN SUBSTR(event_data, i+14) ELSE '' END AS sub
    FROM step1),
step3 AS (
    SELECT *, SUBSTR(sub, 0, INSTR(sub, '"')) AS entity_id
    from step2)
SELECT entity_id, SUM(LENGTH(event_data)) size, COUNT(*) count, SUM(LENGTH(event_data))/COUNT(*) avg
FROM step3
GROUP BY entity_id
ORDER BY size DESC;

SELECT
    table_name AS `Table Name`,
	table_rows AS `Row Count`,
	ROUND(SUM(data_length)/(1024*1024*1024), 3) AS `Table Size [GB]`,
	ROUND(SUM(index_length)/(1024*1024*1024), 3) AS `Index Size [GB]`,
	ROUND(SUM(data_length+index_length)/(1024*1024*1024), 3) `Total Size [GB]`
FROM information_schema.TABLES
WHERE table_schema = 'homeassistant'
GROUP BY table_name
ORDER BY table_name;

SELECT
  COUNT(state_id) AS cnt,
  COUNT(state_id) * 100 / (
    SELECT
      COUNT(state_id)
    FROM
      states
  ) AS cnt_pct,
  SUM(
    LENGTH(state_attributes.shared_attrs)
  ) AS bytes,
  SUM(
    LENGTH(state_attributes.shared_attrs)
  ) * 100 / (
    SELECT
      SUM(
        LENGTH(state_attributes.shared_attrs)
      )
    FROM
      states
      JOIN state_attributes ON states.attributes_id = state_attributes.attributes_id
  ) AS bytes_pct,
  states_meta.entity_id
FROM
  states
LEFT JOIN state_attributes ON states.attributes_id = state_attributes.attributes_id
LEFT JOIN states_meta ON states.metadata_id = states_meta.metadata_id
GROUP BY
  states.metadata_id, states_meta.entity_id
ORDER BY
  bytes_pct DESC;

SELECT 
  statistics.metadata_id,
  statistics_meta.id,
  statistics_meta.statistic_id, 
  COUNT(*)
FROM statistics, statistics_meta
WHERE statistics.metadata_id = statistics_meta.id
GROUP BY
    statistics_meta.statistic_id
ORDER BY
    COUNT(*) DESC;

---
    SELECT
  COUNT(*) as cnt,
  COUNT(*) * 100 / (SELECT COUNT(*) FROM events) AS cnt_pct,
  event_types.event_type
FROM events
INNER JOIN event_types ON events.event_type_id = event_types.event_type_id
GROUP BY event_types.event_type
ORDER BY cnt ASC;

SELECT
  COUNT(*) AS cnt,
  COUNT(*) * 100 / (SELECT COUNT(*) FROM states) AS cnt_pct,
  states_meta.entity_id
FROM states
INNER JOIN states_meta ON states.metadata_id=states_meta.metadata_id
GROUP BY states_meta.entity_id
ORDER BY cnt ASC

---

DELETE s
FROM states s
INNER JOIN states_meta sm
  ON s.metadata_id = sm.metadata_id
WHERE sm.entity_id LIKE 'sensor.alternative_time_nato_date_time_group'

