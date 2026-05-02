"""Event parsing logic for Armadarr services."""

from typing import Any


def _parse_images(item: dict[str, Any], images: list[dict[str, Any]]) -> None:
    """Extract poster and fanart from images list."""
    for img in images:
        if img.get("coverType") == "poster":
            item["poster"] = img.get("remoteUrl") or img.get("url")
        elif img.get("coverType") in ["fanart", "banner"]:
            item["fanart"] = img.get("remoteUrl") or img.get("url")


def _parse_resource_data(
    event: dict[str, Any], resource_key: str, item: dict[str, Any]
) -> None:
    """Parse resource data."""
    resource = event.get(resource_key, {})
    item.update(
        {
            "genres": ", ".join(resource.get("genres", [])),
            "summary": event.get("overview", ""),
        }
    )
    _parse_images(item, resource.get("images", []))


def _parse_radarr_event(event: dict[str, Any], item: dict[str, Any]) -> None:
    """Parse radarr event."""
    item.update(
        {
            "studio": event.get("studio", ""),
            "rating": event.get("ratings", {}).get("value", 0),
            "runtime": event.get("runtime", 0),
            "genres": ", ".join(event.get("genres", [])),
            "summary": event.get("overview", ""),
            "trailer": event.get("youTubeTrailerId"),
        }
    )
    _parse_images(item, event.get("images", []))


def _parse_sonarr_event(event: dict[str, Any], item: dict[str, Any]) -> None:
    """Parse sonarr and whisparr events."""
    series = event.get("series", {})
    season = event.get("seasonNumber", 0)
    episode = event.get("episodeNumber", 0)
    item.update(
        {
            "episode": event.get("title", ""),
            "title": series.get("title", "Unknown"),
            "number": f"S{season:02d}E{episode:02d}",
            "studio": series.get("network", ""),
            "rating": series.get("ratings", {}).get("value", 0),
            "runtime": series.get("runtime", 0),
            "trailer": series.get("youTubeTrailerId"),
        }
    )
    _parse_resource_data(event, "series", item)


def _parse_resource_event(
    event: dict[str, Any], resource_key: str, studio_key: str, item: dict[str, Any]
) -> None:
    """Parse resource event (Lidarr/Readarr)."""
    resource = event.get(resource_key, {})
    item.update(
        {
            "studio": resource.get(studio_key, ""),
            "rating": resource.get("ratings", {}).get("value", 0),
        }
    )
    _parse_resource_data(event, resource_key, item)


def parse_event(event: dict[str, Any], app_type: str) -> dict[str, Any] | None:
    """Parse a single event based on app type."""
    item: dict[str, Any] = {}

    item["id"] = event.get("id")
    title = event.get("title")
    series_title = event.get("series", {}).get("title")
    movie_title = event.get("movie", {}).get("title")
    item["title"] = title or series_title or movie_title or "Unknown"

    airdate = (
        event.get("airDateUtc")
        or event.get("releaseDate")
        or event.get("physicalRelease")
    )
    if not airdate:
        return None
    item["airdate"] = airdate

    if app_type in {"Sonarr", "Whisparr"}:
        _parse_sonarr_event(event, item)
    elif app_type == "Radarr":
        _parse_radarr_event(event, item)
    elif app_type == "Lidarr":
        _parse_resource_event(event, "artist", "label", item)
    elif app_type == "Readarr":
        _parse_resource_event(event, "author", "publisher", item)
    return item
