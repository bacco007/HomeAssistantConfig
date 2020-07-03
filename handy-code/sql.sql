delete from states where created <= datetime('now', '-7 days');

delete from events where created <= datetime('now', '-2 days');

delete from states where created < curdate()-3;

delete from events where created < curdate()-3;

delete from events where event_id not in (select event_id from states);

optimize table events;
optimize table states;

VACUUM;

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
LIMIT 20;

SELECT
 event_type,
 COUNT(event_type)
FROM
 events
GROUP BY
 event_type
ORDER BY COUNT(event_type) DESC
LIMIT 20;

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