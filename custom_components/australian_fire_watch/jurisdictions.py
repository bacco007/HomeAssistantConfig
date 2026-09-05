"""Official incident-feed registry for Australian states and territories."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class FeedDefinition:
    """One documented public feed and the parser adapter it requires."""

    name: str
    url: str
    parser: str


@dataclass(frozen=True, slots=True)
class Jurisdiction:
    """Publisher metadata and incident feeds for one jurisdiction."""

    code: str
    name: str
    agency: str
    official_url: str
    attribution: str
    feeds: tuple[FeedDefinition, ...]


JURISDICTIONS: dict[str, Jurisdiction] = {
    "ACT": Jurisdiction(
        code="ACT",
        name="Australian Capital Territory",
        agency="ACT Emergency Services Agency",
        official_url="https://esa.act.gov.au/be-emergency-ready/warnings-alerts",
        attribution="ACT Emergency Services Agency (CC BY 4.0)",
        feeds=(
            FeedDefinition(
                "act_cap",
                "https://data.esa.act.gov.au/feeds/esa-cap-incidents.xml",
                "cap",
            ),
        ),
    ),
    "NSW": Jurisdiction(
        code="NSW",
        name="New South Wales",
        agency="NSW Rural Fire Service",
        official_url="https://www.rfs.nsw.gov.au/fire-information/fires-near-me",
        attribution=(
            "© State of New South Wales (NSW Rural Fire Service). "
            "For current information go to www.rfs.nsw.gov.au."
        ),
        feeds=(),  # NSW uses the existing multi-source, cross-checked pipeline.
    ),
    "NT": Jurisdiction(
        code="NT",
        name="Northern Territory",
        agency="NT Police, Fire and Emergency Services",
        official_url="https://pfes.nt.gov.au/incidentmap",
        attribution="Northern Territory Police, Fire and Emergency Services",
        feeds=(
            FeedDefinition(
                "nt_incidents",
                "https://www.pfes.nt.gov.au/incidentmap/json/incidents.json",
                "nt_json",
            ),
        ),
    ),
    "QLD": Jurisdiction(
        code="QLD",
        name="Queensland",
        agency="Queensland Fire Department",
        official_url="https://www.fire.qld.gov.au/Current-Incidents",
        attribution="Queensland Fire Department",
        feeds=(
            FeedDefinition(
                "qld_incidents",
                "https://services1.arcgis.com/vkTwD8kHw2woKBqV/arcgis/rest/services/ESCAD_Current_Incidents_Public/FeatureServer/0/query?f=geojson&where=1%3D1&outFields=*",
                "qld_geojson",
            ),
            FeedDefinition(
                "qld_warnings",
                "https://services1.arcgis.com/vkTwD8kHw2woKBqV/ArcGIS/rest/services/OCS_Warnings_Points_Public_View/FeatureServer/0/query?f=geojson&where=1%3D1&outFields=*",
                "qld_warning_geojson",
            ),
        ),
    ),
    "SA": Jurisdiction(
        code="SA",
        name="South Australia",
        agency="South Australian Country Fire Service",
        official_url="https://www.cfs.sa.gov.au/warnings-restrictions/warnings/",
        attribution="South Australian Country Fire Service",
        feeds=(
            FeedDefinition(
                "sa_cap",
                "https://data.eso.sa.gov.au/prod/cfs/criimson/alertsa-fire.xml",
                "cap",
            ),
        ),
    ),
    "TAS": Jurisdiction(
        code="TAS",
        name="Tasmania",
        agency="Tasmania Fire Service",
        official_url="https://www.fire.tas.gov.au/",
        attribution="Tasmania Fire Service",
        feeds=(
            FeedDefinition(
                "tas_incidents",
                "https://www.fire.tas.gov.au/Show?pageId=bfKml",
                "tas_kml",
            ),
            FeedDefinition(
                "tas_alerts",
                "https://www.fire.tas.gov.au/Show?pageId=alertKml",
                "tas_kml",
            ),
        ),
    ),
    "VIC": Jurisdiction(
        code="VIC",
        name="Victoria",
        agency="Emergency Management Victoria",
        official_url="https://emergency.vic.gov.au/",
        attribution="Emergency Management Victoria",
        feeds=(
            FeedDefinition(
                "vic_events",
                "https://emergency.vic.gov.au/public/events-geojson.json",
                "vic_geojson",
            ),
        ),
    ),
    "WA": Jurisdiction(
        code="WA",
        name="Western Australia",
        agency="Department of Fire and Emergency Services WA",
        official_url="https://www.emergency.wa.gov.au/",
        attribution=(
            "© State of Western Australia acting through the Department of Fire "
            "and Emergency Services. For current information go to "
            "www.emergency.wa.gov.au."
        ),
        feeds=(
            FeedDefinition(
                "wa_incidents",
                "https://api.emergency.wa.gov.au/v1/rss/incidents",
                "georss",
            ),
            FeedDefinition(
                "wa_warnings",
                "https://api.emergency.wa.gov.au/v1/rss/warnings",
                "georss",
            ),
        ),
    ),
}

JURISDICTION_OPTIONS = tuple(
    {"value": code, "label": f"{profile.name} ({code})"}
    for code, profile in JURISDICTIONS.items()
)


def jurisdiction_for(value: object) -> Jurisdiction:
    """Return a known profile, preserving NSW as the upgrade default."""
    return JURISDICTIONS.get(str(value or "NSW").upper(), JURISDICTIONS["NSW"])
