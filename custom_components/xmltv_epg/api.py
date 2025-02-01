"""XMLTV Client."""

from __future__ import annotations

import asyncio
import gzip
import socket
import xml.etree.ElementTree as ET

import aiohttp

from .model import TVGuide


class XMLTVClientError(Exception):
    """Exception to indicate a general API error."""


class XMLTVClientCommunicationError(XMLTVClientError):
    """Exception to indicate a communication error."""


class XMLTVClient:
    """XMLTV Client."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        url: str,
    ) -> None:
        """XMLTV Client."""
        self._session = session
        self._url = url

    async def async_get_data(self) -> TVGuide:
        """Fetch XMLTV Guide data."""
        try:
            # fetch data
            response = await self._session.get(url=self._url)
            response.raise_for_status()

            if response.content_type in ["text/xml", "application/xml"]:
                # raw XML text, read as-is
                data = await response.text()

            elif response.content_type == "application/gzip" or "xml.gz" in str(
                response.url
            ):
                # xml.gz file, read as binary and decompress
                gzipped_data = await response.read()

                # decompress the gzipped data
                data = gzip.decompress(gzipped_data).decode()

            else:
                raise XMLTVClientError(
                    f"Don't know how to handle content type '{response.content_type}' (from {response.url})",
                )

            # parse XML data
            xml = ET.fromstring(data)

            guide = TVGuide.from_xml(xml)
            if guide is None:
                raise XMLTVClientError(
                    "Failed to parse TV Guide data",
                )

            return guide
        except XMLTVClientError as exception:
            raise exception
        except asyncio.TimeoutError as exception:
            raise XMLTVClientCommunicationError(
                "Timeout error fetching information",
            ) from exception
        except (aiohttp.ClientError, socket.gaierror) as exception:
            raise XMLTVClientCommunicationError(
                "Error fetching information",
            ) from exception
        except Exception as exception:  # pylint: disable=broad-except
            raise XMLTVClientError("Something really wrong happened!") from exception
