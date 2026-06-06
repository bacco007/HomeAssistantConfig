"""
Servizi Home Assistant esposti da Orphan Entity Cleaner.

  orphan_cleaner.scan
  orphan_cleaner.delete_orphans
"""
from __future__ import annotations

import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import (
    DOMAIN,
    CONF_MIN_AGE_HOURS,
    CONF_AGGRESSIVE,
    DEFAULT_MIN_AGE_HOURS,
    DEFAULT_AGGRESSIVE,
    SERVICE_SCAN,
    SERVICE_DELETE_ORPHANS,
    FIELD_ENTITY_IDS,
    FIELD_DRY_RUN,
    EVENT_ORPHANS_FOUND,
)
from .orphan_detector import detect_orphans, async_delete_entities

_LOGGER = logging.getLogger(__name__)

SCHEMA_SCAN = vol.Schema({})

SCHEMA_DELETE = vol.Schema(
    {
        vol.Optional(FIELD_ENTITY_IDS): vol.All(cv.ensure_list, [cv.entity_id]),
        vol.Optional(FIELD_DRY_RUN, default=False): cv.boolean,
    }
)


def _get_config(hass: HomeAssistant) -> dict:
    """Legge min_age e aggressive dalla config entry attiva."""
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        return {}
    e = entries[0]
    return {**e.data, **e.options}


async def _handle_scan(call: ServiceCall) -> None:
    """
    orphan_cleaner.scan

    Esegue la scansione e spara l'evento `orphan_cleaner_orphans_found`
    con la lista delle entità orfane come payload.
    Utile per automazioni o script che vogliono reagire al risultato.
    """
    hass = call.hass
    cfg  = _get_config(hass)

    min_age    = cfg.get(CONF_MIN_AGE_HOURS, DEFAULT_MIN_AGE_HOURS)
    aggressive = cfg.get(CONF_AGGRESSIVE,    DEFAULT_AGGRESSIVE)

    orphans = detect_orphans(hass, min_age_hours=min_age, aggressive=aggressive)
    payload = {
        "count":   len(orphans),
        "orphans": [o.as_dict() for o in orphans],
    }

    hass.bus.async_fire(EVENT_ORPHANS_FOUND, payload)
    _LOGGER.info(
        "Servizio scan: trovate %d entità orfane — evento '%s' sparato",
        len(orphans),
        EVENT_ORPHANS_FOUND,
    )


async def _handle_delete_orphans(call: ServiceCall) -> None:
    """
    orphan_cleaner.delete_orphans

    Elimina le entità specificate in entity_ids, oppure — se omesso —
    tutte le orfane rilevate con i parametri correnti.

    Parametri:
      entity_ids  (list, opzionale) — entity_id da eliminare
      dry_run     (bool, default false) — simula senza toccare nulla
    """
    hass      = call.hass
    cfg       = _get_config(hass)
    dry_run   = call.data.get(FIELD_DRY_RUN, False)
    ids_input = call.data.get(FIELD_ENTITY_IDS)

    if ids_input:
        target_ids = ids_input
    else:
        min_age    = cfg.get(CONF_MIN_AGE_HOURS, DEFAULT_MIN_AGE_HOURS)
        aggressive = cfg.get(CONF_AGGRESSIVE,    DEFAULT_AGGRESSIVE)
        orphans    = detect_orphans(hass, min_age_hours=min_age, aggressive=aggressive)
        target_ids = [o.entity_id for o in orphans]

    _LOGGER.info(
        "Servizio delete_orphans: %d entità da eliminare (dry_run=%s)",
        len(target_ids),
        dry_run,
    )

    if dry_run:
        _LOGGER.info("[DRY RUN] Entità che sarebbero eliminate:")
        for eid in target_ids:
            _LOGGER.info("  - %s", eid)
        return

    deleted, failed = await async_delete_entities(hass, target_ids)

    _LOGGER.info(
        "delete_orphans completato: %d eliminate, %d fallite",
        len(deleted),
        len(failed),
    )
    if failed:
        _LOGGER.warning("Entità non eliminate: %s", ", ".join(failed))


def async_register_services(hass: HomeAssistant) -> None:
    """Registra i servizi in Home Assistant."""
    hass.services.async_register(
        DOMAIN, SERVICE_SCAN, _handle_scan, schema=SCHEMA_SCAN
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DELETE_ORPHANS, _handle_delete_orphans, schema=SCHEMA_DELETE
    )
    _LOGGER.debug("Servizi Orphan Cleaner registrati")


def async_unregister_services(hass: HomeAssistant) -> None:
    """Rimuove i servizi quando l'integrazione viene rimossa."""
    hass.services.async_remove(DOMAIN, SERVICE_SCAN)
    hass.services.async_remove(DOMAIN, SERVICE_DELETE_ORPHANS)
