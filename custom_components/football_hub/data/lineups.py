def get_lineups(data):
    """Return lineups from coordinator data."""
    return data.get("lineups", [])
