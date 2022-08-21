import os
REQUIREMENTS = [
    'google-api-python-client==1.6.4',
    'oauth2client==4.0.0',
    'httplib2'
]

# Sensor base attributes.

CONF_CLIENT_ID = 'apps.googleusercontent.com'
CONF_CLIENT_SECRET = ''



TOKEN_FILE = ''

# Endpoint scopes required for the sensor.
# Read more: https://developers.google.com/fit/rest/v1/authorization

SCOPES = ["https://www.googleapis.com/auth/fitness.location.write",
          "https://www.googleapis.com/auth/fitness.sleep.read",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
          "https://www.googleapis.com/auth/fitness.location.read",
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.body.write",
          "https://www.googleapis.com/auth/fitness.activity.write",
          "https://www.googleapis.com/auth/fitness.body.read",
          "https://www.googleapis.com/auth/fitness.sleep.write",
          "https://www.googleapis.com/auth/fitness.heart_rate.write" ]

def do_authentication():
    """Notify user of actions and authenticate.

    Notify user of user_code and verification_url then poll until we have an
    access token.
    """
    from oauth2client import client as oauth2client
    from oauth2client import file as oauth2file
    from oauth2client.file import Storage
    from oauth2client.tools import run_flow
    import google.oauth2.credentials

    oauth = oauth2client.OAuth2WebServerFlow(
        client_id=CONF_CLIENT_ID,
        client_secret=CONF_CLIENT_SECRET,
        scope=SCOPES,
        redirect_uri='urn:ietf:wg:oauth:2.0:oob',
    )

    storage = Storage('google_fit.token')
    # Open a web browser to ask the user for credentials.
    credentials = run_flow(oauth, storage)
    assert credentials.access_token is not None
    return credentials.access_token

    token = get_access_token()
    credentials = google.oauth2.credentials.Credentials(token)

    TOKEN_FILE = "google_fit.token"
    storage = oauth2file.Storage(TOKEN_FILE)
    storage.put(credentials)

    return True

do_authentication()