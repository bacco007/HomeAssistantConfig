def get_live_matches(data):
    """Return live matches from coordinator data."""
    return data.get("live", [])
