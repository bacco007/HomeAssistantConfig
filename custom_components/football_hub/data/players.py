def get_players(data):
    """Return players from coordinator data."""
    return data.get("players", [])
