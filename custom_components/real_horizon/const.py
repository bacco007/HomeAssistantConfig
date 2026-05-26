"""Constants for the Real Horizon integration."""

from __future__ import annotations

from datetime import timedelta

DOMAIN = "real_horizon"

PVGIS_URL = "https://re.jrc.ec.europa.eu/api/v5_3/printhorizon"
PVGIS_TIMEOUT = 30

# Coordinator polls this often -- recomputes sun position + above/below state.
# Daily crossings are only recomputed when the date rolls over.
UPDATE_INTERVAL = timedelta(seconds=30)

# Horizon profile is static for a location; refetch occasionally in case
# PVGIS updates the underlying DEM.
HORIZON_REFRESH_INTERVAL = timedelta(days=7)

# Used in the disk cache path and as part of the config entry's unique_id.
COORD_PRECISION = 4  # decimal places, ~11 m
