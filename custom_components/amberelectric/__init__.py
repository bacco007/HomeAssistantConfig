DOMAIN = "amberelectric"


def setup(hass, config):
    """Your controller/hub specific code."""

    hass.helpers.discovery.load_platform("sensor", DOMAIN, {}, config)

    return True
