"""XMLTV Client."""

from __future__ import annotations

import asyncio
import gzip
import io
import lzma
import socket
import xml.etree.ElementTree as ET
import zipfile
from logging import Logger

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
        logger: Logger | None = None,
    ) -> None:
        """XMLTV Client."""
        self._session = session
        self._url = url
        self.__logger = logger

    async def async_get_data(self) -> TVGuide:
        """Fetch XMLTV Guide data."""
        try:
            # fetch data
            response = await self._session.get(url=self._url)
            response.raise_for_status()

            content_type = response.content_type
            content_encoding = response.headers.get("Content-Encoding", None)

            if self.__logger:
                self.__logger.debug(
                    "Got response from %s: content-type=%s, content-encoding=%s",
                    response.url,
                    content_type,
                    content_encoding,
                )

            # figure out how to decode the XML data
            decode_xml_fn = None
            if content_type in ["text/xml", "application/xml"]:
                # raw XML text
                async def decode_plain():
                    return await response.text()

                decode_xml_fn = decode_plain

            elif content_type in [
                "application/gzip",
                "application/x-gzip",
            ] or "xml.gz" in str(response.url):
                # xml.gz, XML compressed with gzip
                async def decode_gzip():
                    d = await response.read()
                    return gzip.decompress(d).decode()

                decode_xml_fn = decode_gzip

            elif content_type in ["application/x-xz"] or "xml.xz" in str(response.url):
                # xm.xz, XML compressed with xz
                async def decode_xz():
                    d = await response.read()
                    return lzma.decompress(d).decode()

                decode_xml_fn = decode_xz
            elif content_type in ["application/zip"] or "xml.zip" in str(response.url):
                # xml.zip, XML file inside a zip archive
                async def decode_zip():
                    d = await response.read()
                    with io.BytesIO(d) as iofile, zipfile.ZipFile(iofile, "r") as zip:
                        namelist = zip.namelist()
                        i = 0

                        if len(namelist) == 0:
                            raise XMLTVClientError("zip archive is empty")
                        if len(namelist) > 1:
                            for ix, name in enumerate(namelist):
                                if name.endswith(".xml"):
                                    i = ix
                                    break

                            if self.__logger:
                                self.__logger.warning(
                                    "zip archive contains multiple files (%s), using i=%d",
                                    namelist,
                                    i,
                                )

                        with zip.open(namelist[i]) as xml_file:
                            return xml_file.read().decode()

                decode_xml_fn = decode_zip
            else:
                raise XMLTVClientError(
                    f"Don't know how to handle content type '{response.content_type}' (from {response.url})",
                )

            # decode and parse XML data
            try:
                data = await decode_xml_fn()
            except Exception as decode_exception:
                # workaround for elres.de [gzipped xml, gzip transfer (wrong content-type)]
                if self.__logger:
                    self.__logger.debug(
                        "Failed to decode xml data using expected method, attemting to decode as text. Error: %s",
                        decode_exception,
                    )

                try:
                    data = await response.text()
                except Exception as text_exception:
                    raise text_exception from decode_exception

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
                "Timeout fetching xmltv data: " + exception.__str__(),
            ) from exception
        except (aiohttp.ClientError, socket.gaierror) as exception:
            raise XMLTVClientCommunicationError(
                "Error fetching xmltv data: " + exception.__str__(),
            ) from exception
        except Exception as exception:  # pylint: disable=broad-except
            raise XMLTVClientError(
                "Unknown error fetching xmltv data: " + exception.__str__()
            ) from exception
