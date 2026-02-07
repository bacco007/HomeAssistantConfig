from __future__ import annotations
import aiohttp
from datetime import timedelta
from homeassistant.components.sensor import SensorEntity
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from .const import DOMAIN, CONF_FEEDS, MAX_FEED_FAILURES, ISSUE_FEED_DISABLED_PREFIX
from .parser import parse_feed
from .util import slug_from_url, raise_issue

SCAN_INTERVAL = timedelta(minutes=5)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    feeds = entry.data.get(CONF_FEEDS, []) + entry.options.get(CONF_FEEDS, [])
    coordinator = CAPCoordinator(hass, feeds)
    await coordinator.async_config_entry_first_refresh()
    entities = []
    for f in feeds:
        slug = slug_from_url(f.get('url',''))
        entities.append(CAPFeedSensor(hass, coordinator, slug, f))
    entities.append(CAPGlobalSensor(hass, coordinator))
    async_add_entities(entities)

class CAPCoordinator(DataUpdateCoordinator):
    def __init__(self, hass: HomeAssistant, feeds: list[dict]):
        super().__init__(hass, hass.logger, name=DOMAIN, update_interval=SCAN_INTERVAL)
        self._feeds = feeds
        self.data = []
        hass.data.setdefault(DOMAIN, {})
        hass.data[DOMAIN].setdefault('failures', {})
        hass.data[DOMAIN].setdefault('empty_alerts', {})

    async def _async_update_data(self):
        results = []
        async with aiohttp.ClientSession() as sess:
            for f in self._feeds:
                url = f.get('url')
                fmt = (f.get('format') or 'cap').lower()
                slug = slug_from_url(url or '')
                failures = self.hass.data[DOMAIN]['failures'].get(slug, 0)
                if failures >= MAX_FEED_FAILURES:
                    # Disabled due to repeated failures
                    results.append({'feed': f, 'slug': slug, 'alerts': [], 'features': {'error': 'feed_disabled_due_to_failures'}})
                    continue
                try:
                    async with sess.get(url, timeout=20) as resp:
                        text = await resp.text()
                        parsed = parse_feed(text, fmt)
                        alerts = parsed.get('alerts', [])
                        features = parsed.get('features', {})
                        warn = not (features.get('has_polygons') or features.get('has_circles') or features.get('has_points'))
                        if warn:
                            features['warning'] = 'Feed appears to lack geometry (polygons/circles/points)'
                            # Raise Repairs issue to inform the user explicitly
                            raise_issue(self.hass, f"{ISSUE_FEED_NO_GEOMETRY_PREFIX}{slug}", translation_key="feed_no_geometry", placeholders={"slug": slug, "url": url}, fixable=False)
                        # Track empty alerts and raise Repairs issue if persistently empty (usefulness impacted)
                        if isinstance(alerts, list) and not alerts and not features.get('error'):
                            empties = self.hass.data[DOMAIN]['empty_alerts'].get(slug, 0) + 1
                            self.hass.data[DOMAIN]['empty_alerts'][slug] = empties
                            if empties >= EMPTY_ALERTS_THRESHOLD:
                                raise_issue(self.hass, f"{ISSUE_FEED_NO_CONTENT_PREFIX}{slug}", translation_key="feed_no_content", placeholders={"slug": slug, "url": url}, fixable=False)
                        else:
                            # Reset when we have content or an error handled elsewhere
                            self.hass.data[DOMAIN]['empty_alerts'][slug] = 0
                        results.append({'feed': f, 'slug': slug, 'alerts': alerts, 'features': features})
                except Exception:
                    failures += 1
                    self.hass.data[DOMAIN]['failures'][slug] = failures
                    features = {'error': 'fetch_failed', 'failures': failures}
                    if failures >= MAX_FEED_FAILURES:
                        # Raise Repairs issue once feed is disabled
                        raise_issue(self.hass, f"{ISSUE_FEED_DISABLED_PREFIX}{slug}", translation_key="feed_disabled", placeholders={"slug": slug, "url": url}, fixable=True)
                        features['error'] = 'feed_disabled_due_to_failures'
                    results.append({'feed': f, 'slug': slug, 'alerts': [], 'features': features})
        self.hass.data[DOMAIN]['last_data'] = results
        return results

class CAPFeedSensor(SensorEntity):
    def __init__(self, hass: HomeAssistant, coordinator: CAPCoordinator, slug: str, feed: dict):
        self.hass = hass
        self.coordinator = coordinator
        self._slug = slug
        self._feed = feed
        self._attr_name = f"CAP {slug} Alert Count"
        self._attr_unique_id = f"cap_{slug}_alert_count"

    @property
    def native_value(self):
        data = next((r for r in (self.coordinator.data or []) if r.get('slug') == self._slug), None)
        alerts = data.get('alerts') if data else []
        return len(alerts) if isinstance(alerts, list) else 0

    @property
    def extra_state_attributes(self):
        data = next((r for r in (self.coordinator.data or []) if r.get('slug') == self._slug), None)
        if not data:
            return {}
        return {
            'feed': data.get('feed'),
            'features': data.get('features'),
            'alerts': data.get('alerts')
        }

    @property
    def available(self) -> bool:
        failures = self.hass.data[DOMAIN].get('failures', {}).get(self._slug, 0)
        return failures < MAX_FEED_FAILURES

class CAPGlobalSensor(SensorEntity):
    _attr_name = "CAP All Alert Count"
    _attr_unique_id = "cap_all_alert_count"
    def __init__(self, hass: HomeAssistant, coordinator: CAPCoordinator):
        self.hass = hass
        self.coordinator = coordinator

    @property
    def native_value(self):
        total = 0
        for r in self.coordinator.data or []:
            a = r.get('alerts')
            if isinstance(a, list):
                total += len(a)
        return total

    @property
    def extra_state_attributes(self):
        return {
            'feeds': [r.get('feed') for r in (self.coordinator.data or [])],
            'raw': self.coordinator.data or []
        }
