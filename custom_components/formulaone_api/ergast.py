from typing import Optional
from dataclasses import dataclass
import requests

@dataclass
class ErgastResponse(object):
    """
    makes the request to the api
    url: [str] request url
    offset: [int] starting point of elements from API request
    limit: [int] number of items to return per request
    """

    url: str
    offset: Optional[int] = None
    limit: Optional[int] = None
    _json = None
    _xml = None
    _text = None

    def make_request(self, format_):
        self.url = f"{self.url}{format_}"
        if self.limit and self.offset:
            querystring = {"limit": self.limit, "offset": self.offset}
        else:
            querystring = None
        return requests.get(self.url, params=querystring)

    @property
    def xml(self):
        if self._xml is None:
            self._xml = self.make_request(".xml")
        return self._xml.text

    @property
    def json(self):
        if self._json is None:
            self._json = self.make_request(".json")
        return self._json.json()

    @property
    def text(self):
        if self._text is None:
            self._text = self.make_request(".xml")
        return self._text.text