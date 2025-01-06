"""Helpers for GTFS Realtime."""


def header_dict_from_header_str(header: str) -> dict[str, str] | None:
    if header is None:
        return None
    return dict([[x.strip() for x in header.split(":")]])
