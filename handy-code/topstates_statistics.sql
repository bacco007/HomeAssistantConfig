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