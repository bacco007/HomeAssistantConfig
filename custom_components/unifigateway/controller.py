"""Source: https://github.com/finish06/pyunifi/blob/master/pyunifi/controller.py
Modified for testing purposes after upgrade to v6 of UnifiOS"""
import json
import logging
import shutil
import time
import warnings

import requests

log = logging.getLogger(__name__)


class APIError(Exception):
    pass


def retry_login(func, *args, **kwargs):
    """To reattempt login if requests exception(s) occur at time of call"""

    def wrapper(*args, **kwargs):
        log.warning("Failed to perform ...")
        controller = args[0]
        controller._login()

    return wrapper


class Controller(object):
    def __init__(
        self,
        host,
        username,
        password,
        port=8443,
        version="unifiOS",
        site_id="default",
        ssl_verify=True,
    ):
        self.log = logging.getLogger(__name__ + ".Controller")

        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.site_id = site_id
        self.ssl_verify = ssl_verify
        self.url = "https://" + host + "/proxy/network/"

        self.session = requests.Session()
        self.session.verify = ssl_verify

        self.log.debug("Controller for %s", self.url)
        self._login()

    @staticmethod
    def _jsondec(data):
        obj = json.loads(data)
        if "meta" in obj:
            if obj["meta"]["rc"] != "ok":
                raise APIError(obj["meta"]["msg"])
        if "data" in obj:
            return obj["data"]
        else:
            return obj

    def _api_url(self):
        return self.url + "api/s/" + self.site_id + "/"

    @retry_login
    def _read(self, url, params=None):
        r = self.session.get(url, params=params)
        return self._jsondec(r.text)

    def _api_read(self, url, params=None):
        r = self.session.get(self._api_url() + url, params=params)
        return self._jsondec(r.text)

    @retry_login
    def _write(self, url, params=None):
        r = self.session.post(url, json=params)
        return self._jsondec(r.text)

    def _api_write(self, url, params=None):
        return self._write(self._api_url() + url, params)

    @retry_login
    def _update(self, url, params=None):
        r = self.session.put(url, json=params)
        return self._jsondec(r.text)

    def _api_update(self, url, params=None):
        return self._update(self._api_url() + url, params)

    def _login(self):
        log.debug("login() as %s", self.username)

        params = {"username": self.username, "password": self.password}
        login_url = "https://" + self.host + "/api/auth/login"

        r = self.session.post(login_url, json=params)

        if r.status_code != 200:
            raise APIError("Login failed - status code: %i" % r.status_code)

    def get_sysinfo(self):
        """Return basic system informations."""
        return self._api_read("stat/sysinfo")

    def get_healthinfo(self):
        """Return health information."""
        log.debug("reading health info...")
        return self._api_read("stat/health")
