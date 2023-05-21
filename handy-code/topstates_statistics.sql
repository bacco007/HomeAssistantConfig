-- Top States
SELECT
  states_meta.entity_id,
  count(*) cnt
FROM
  states
  LEFT JOIN states_meta ON (
    states.metadata_id = states_meta.metadata_id
  )
GROUP BY
  states_meta.entity_id
ORDER BY
  cnt DESC
LIMIT 50;

-- Top Statistics
SELECT
  statistics_meta.statistic_id,
  count(*) cnt
FROM
  statistics
  LEFT JOIN statistics_meta ON (
    statistics.metadata_id = statistics_meta.id
  )
GROUP BY
  statistics_meta.statistic_id
ORDER BY
  cnt DESC
LIMIT 50;


SELECT
  COUNT(*) AS cnt,
  COUNT(*) * 100 / (SELECT COUNT(*) FROM states) AS cnt_pct,
  states_meta.entity_id
FROM states
LEFT JOIN states_meta ON (states.metadata_id=states_meta.metadata_id)
GROUP BY entity_id
ORDER BY cnt DESC
limit 50;

SELECT
  COUNT(*) as cnt,
  COUNT(*) * 100 / (SELECT COUNT(*) FROM events) AS cnt_pct,
  event_types.event_type
FROM events
INNER JOIN event_types ON events.event_type_id = event_types.event_type_id
GROUP BY event_types.event_type
ORDER BY cnt DESC