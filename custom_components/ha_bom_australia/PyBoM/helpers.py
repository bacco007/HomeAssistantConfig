"""Helpers functions for PyBom."""
from __future__ import annotations

from typing import Any

def flatten_dict(keys: list[str], dict: dict[str, Any]) -> dict[str, Any]:
    """Flatten nested dictionary keys."""
    for key in keys:
        if dict[key] is not None:
            flatten = dict.pop(key)
            for inner_key, value in flatten.items():
                dict[key + "_" + inner_key] = value
    return dict

def geohash_encode(latitude: float, longitude: float, precision: int = 6) -> str:
    """Encode latitude/longitude to geohash string."""
    base32 = '0123456789bcdefghjkmnpqrstuvwxyz'
    lat_interval = (-90.0, 90.0)
    lon_interval = (-180.0, 180.0)
    geohash = []
    bits = [16, 8, 4, 2, 1]
    bit = 0
    ch = 0
    even = True
    while len(geohash) < precision:
        if even:
            mid = (lon_interval[0] + lon_interval[1]) / 2
            if longitude > mid:
                ch |= bits[bit]
                lon_interval = (mid, lon_interval[1])
            else:
                lon_interval = (lon_interval[0], mid)
        else:
            mid = (lat_interval[0] + lat_interval[1]) / 2
            if latitude > mid:
                ch |= bits[bit]
                lat_interval = (mid, lat_interval[1])
            else:
                lat_interval = (lat_interval[0], mid)
        even = not even
        if bit < 4:
            bit += 1
        else:
            geohash += base32[ch]
            bit = 0
            ch = 0
    return ''.join(geohash)

def geohash_decode(geohash: str) -> tuple[float, float]:
    """Decode geohash string to latitude/longitude.

    Returns:
        Tuple of (latitude, longitude) representing the center point of the geohash.
    """
    base32 = '0123456789bcdefghjkmnpqrstuvwxyz'
    lat_interval = (-90.0, 90.0)
    lon_interval = (-180.0, 180.0)
    bits = [16, 8, 4, 2, 1]
    even = True

    for c in geohash:
        idx = base32.index(c)
        for mask in bits:
            if even:
                # Longitude bit
                mid = (lon_interval[0] + lon_interval[1]) / 2
                if idx & mask:
                    lon_interval = (mid, lon_interval[1])
                else:
                    lon_interval = (lon_interval[0], mid)
            else:
                # Latitude bit
                mid = (lat_interval[0] + lat_interval[1]) / 2
                if idx & mask:
                    lat_interval = (mid, lat_interval[1])
                else:
                    lat_interval = (lat_interval[0], mid)
            even = not even

    # Return center point of the geohash box
    latitude = (lat_interval[0] + lat_interval[1]) / 2
    longitude = (lon_interval[0] + lon_interval[1]) / 2
    return latitude, longitude