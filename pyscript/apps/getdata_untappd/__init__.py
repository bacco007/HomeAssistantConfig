import requests

BASEURL = "https://api.untappd.com/v4/user/beers/"


@service
def getdata_untappd(
    entity_id=None,
    user=None,
    sort="date",
    limit="25",
    unit_of_measurement="beers",
    icon="mdi:untappd",
):

    if entity_id is None:
        log.error("No Entity ID Provided")
        return

    if user is None:
        log.error("No User Provided")
        return

    URL = url = (
        BASEURL
        + user
        + "?client_id="
        + get_config("clientid")
        + "&client_secret="
        + get_config("clientsecret")
        + "&sort="
        + sort
        + "&limit="
        + limit
    )

    r = task.executor(requests.get, URL)
    rd = r.json()
    beer_data = rd["response"]["beers"]["items"]
    DATA = []
    attributes = {}

    x = 0
    for beer in beer_data:
        DATA.append(
            {
                "beer_name": [beer][0]["beer"]["beer_name"],
                "beer_style": [beer][0]["beer"]["beer_style"],
                "beer_abv": [beer][0]["beer"]["beer_abv"],
                "beer_ibu": [beer][0]["beer"]["beer_ibu"],
                "beer_rating": [beer][0]["beer"]["rating_score"],
                "brewery": [beer][0]["brewery"]["brewery_name"],
                "brewery_country": [beer][0]["brewery"]["country_name"],
                "rating": [beer][0]["rating_score"],
                "count": [beer][0]["count"],
                "first_checkin": [beer][0]["first_created_at"],
                "recent_checkin": [beer][0]["recent_created_at"],
            }
        )
        x = x + 1

    if unit_of_measurement:
        attributes["unit_of_measurement"] = unit_of_measurement

    state_match = {
        "date": "Recent",
        "checkin": "Most Checked In",
        "highest_rated_you": "Highest Rated",
        "lowest_rated_you": "Lowest Rated",
    }
    stype = state_match.get(sort)
    stype2 = "Untappd: {} Beers".format(stype)
    attributes["friendly_name"] = stype2 + " - {}".format(user)

    if icon:
        attributes["icon"] = icon

    attributes["data"] = DATA
    attributes["sort"] = stype
    attributes["user"] = user
    state.set(entity_id, value=len(beer_data), new_attributes=attributes)


def get_config(name):
    value = pyscript.app_config.get(name)

    if value is None:
        log.error(
            '"'
            + name
            + '" is required parameter but not defined in Pyscript configuration for application'
        )

    return value


# Pyscript startup and app reload
# https://hacs-pyscript.readthedocs.io/en/latest/reference.html?highlight=load#time-trigger
@time_trigger("startup")
def load():
    log.info(f"app has started")

    # Check required configuration
    get_config("clientid")
    get_config("clientsecret")
