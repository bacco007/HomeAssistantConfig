"""Alert provider protocol and factory."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Protocol, runtime_checkable

import aiohttp

from ..model import CAPAlert
from .cap import CAPDoc
from .cap_content_cache import CAPContentCache


class AlertProvider(Protocol):
    """Fetches alerts from a single weather service and returns CAPAlert objects."""

    @property
    def name(self) -> str:
        """Provider identifier for CAPAlert.provider field (e.g. 'nws', 'eccc')."""
        ...

    async def async_fetch(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache: CAPContentCache | None = None,
        user_agent: str | None = None,
    ) -> list[CAPAlert]:
        """Fetch current alerts. Raises UpdateFailed on transient errors."""
        ...

    async def async_validate_config(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        *,
        user_agent: str | None = None,
    ) -> str | None:
        """Check a configured scope before an entry is created (issue #131).

        Returns a ``strings.json`` error key when the scope will never produce
        alerts, or ``None`` when it is usable. Callers map the key onto the
        form the user is looking at.

        The question is whether *this scope resolves*, not whether the service
        is up: "is api.weather.gov reachable" is the coordinator's problem and
        already surfaces as an unavailable entity. Implementations answer with
        the cheapest authoritative request they have — never a full alert
        fetch — and return ``None`` for a mode they cannot check, so an
        unverifiable scope is created rather than blocked.
        """
        ...


@runtime_checkable
class BackfillProvider(Protocol):
    """Provider that can also return raw CAP documents, for streaming backfill.

    Deliberately separate from ``AlertProvider``: only a push-ingesting provider
    needs it (today just ECCC), and the coordinator holds a live doc set it
    rebuilds alerts from, so it needs the documents rather than finished alerts.
    ``runtime_checkable`` so the coordinator can narrow its provider once at
    construction instead of asserting the capability at every backfill.
    """

    async def async_fetch_docs(
        self,
        session: aiohttp.ClientSession,
        config: Mapping[str, Any],
        options: Mapping[str, Any],
        *,
        cap_content_cache: CAPContentCache | None = None,
        user_agent: str | None = None,
    ) -> list[CAPDoc]:
        """Fetch region-relevant CAP documents. Raises UpdateFailed on transient errors."""
        ...


def get_provider(provider_id: str) -> AlertProvider:
    """Return a provider instance by ID."""
    from .eccc import ECCCProvider
    from .gdacs import GDACSProvider
    from .meteoalarm import MeteoAlarmProvider
    from .nws import NWSProvider
    from .wmo import WMOProvider

    providers: dict[str, type] = {
        "nws": NWSProvider,
        "eccc": ECCCProvider,
        "meteoalarm": MeteoAlarmProvider,
        "wmo": WMOProvider,
        "gdacs": GDACSProvider,
    }
    cls = providers.get(provider_id)
    if cls is None:
        raise ValueError(f"Unknown provider: {provider_id}")
    return cls()
