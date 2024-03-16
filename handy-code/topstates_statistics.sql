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

-- Largest Attribute
SELECT
    ROUND(SUM(LENGTH(shared_attrs) / (1024.0 * 1024.0)), 2) AS attrs_size_mb,
    ROUND((SUM(LENGTH(shared_attrs) / (1024.0 * 1024.0)) * 100) / (SELECT SUM(LENGTH(shared_attrs) / (1024.0 * 1024.0)) FROM state_attributes), 2) AS size_pct,    
    COUNT(*) AS cnt,
    COUNT(*) * 100 / (SELECT COUNT(*) FROM state_attributes) AS cnt_pct,
    states_meta.entity_id    
FROM 
    state_attributes
INNER JOIN 
    states ON state_attributes.attributes_id = states.attributes_id
INNER JOIN 
    states_meta ON states.metadata_id = states_meta.metadata_id
GROUP BY 
    states_meta.entity_id
ORDER BY 
    attrs_size_mb DESC
limit 50;

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
  cnt DESC
limit 50;

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