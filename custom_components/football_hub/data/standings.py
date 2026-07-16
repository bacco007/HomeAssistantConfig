def get_standings(data):
    """Return standings from coordinator data."""
    return data.get("standings", [])
